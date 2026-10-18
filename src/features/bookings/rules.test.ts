import { describe, expect, it } from "vitest";
import { canCancelBooking, overlaps, validateBooking, type TimeRange } from "@/features/bookings/rules";
import { toUtcDate } from "@/features/bookings/time";

// Horários em Brasília, num dia fixo, para os testes não dependerem do relógio.
const at = (time: string) => toUtcDate("2026-10-20", time);
const range = (start: string, end: string): TimeRange => ({ startsAt: at(start), endsAt: at(end) });
const now = at("08:00");

describe("overlaps (regra de sobreposição)", () => {
  const existing = range("10:00", "11:00");

  it.each([
    ["começa antes e termina dentro", range("09:30", "10:30")],
    ["começa dentro e termina depois", range("10:30", "11:30")],
    ["fica totalmente dentro", range("10:15", "10:45")],
    ["cobre a reserva existente", range("09:00", "12:00")],
    ["tem exatamente o mesmo horário", range("10:00", "11:00")],
  ])("conflita quando %s", (_, booking) => {
    expect(overlaps(booking, existing)).toBe(true);
  });

  it.each([
    ["termina quando a outra começa", range("09:00", "10:00")],
    ["começa quando a outra termina", range("11:00", "12:00")],
    ["é em outro horário", range("14:00", "15:00")],
  ])("não conflita quando %s", (_, booking) => {
    expect(overlaps(booking, existing)).toBe(false);
  });
});

describe("validateBooking", () => {
  const validate = (booking: TimeRange, existing: TimeRange[] = []) =>
    validateBooking({ booking, now, existing });

  it("aceita uma reserva válida", () => {
    expect(validate(range("09:00", "10:00"))).toBeNull();
  });

  it("rejeita sobreposição com reserva existente da sala", () => {
    expect(validate(range("09:30", "10:30"), [range("10:00", "11:00")])).toBe("OVERLAP");
  });

  it("aceita reserva encostada em outra", () => {
    expect(validate(range("09:00", "10:00"), [range("10:00", "11:00")])).toBeNull();
  });

  it("rejeita fim antes ou igual ao início", () => {
    expect(validate(range("10:00", "09:00"))).toBe("INVALID_RANGE");
    expect(validate(range("10:00", "10:00"))).toBe("INVALID_RANGE");
  });

  it("rejeita data inexistente", () => {
    const booking = { startsAt: toUtcDate("2026-02-31", "09:00"), endsAt: toUtcDate("2026-02-31", "10:00") };
    expect(validate(booking)).toBe("INVALID_RANGE");
  });

  it("rejeita reserva no passado", () => {
    expect(validate(range("07:00", "07:30"))).toBe("IN_PAST");
  });

  it("aplica a duração mínima de 15 minutos", () => {
    expect(validate(range("09:00", "09:14"))).toBe("TOO_SHORT");
    expect(validate(range("09:00", "09:15"))).toBeNull();
  });

  it("aplica a duração máxima de 4 horas", () => {
    expect(validate(range("09:00", "13:00"))).toBeNull();
    expect(validate(range("09:00", "13:01"))).toBe("TOO_LONG");
  });
});

describe("canCancelBooking (permissão de cancelamento)", () => {
  const ana = "user-ana";
  const bruno = "user-bruno";
  const bookingOfAna = { userId: ana, status: "ACTIVE" as const, startsAt: at("10:00") };

  it("permite que o dono cancele uma reserva futura", () => {
    expect(canCancelBooking({ booking: bookingOfAna, userId: ana, now })).toBeNull();
  });

  it("impede que outro usuário cancele a reserva", () => {
    expect(canCancelBooking({ booking: bookingOfAna, userId: bruno, now })).toBe("NOT_OWNER");
  });

  it("impede cancelar uma reserva já cancelada", () => {
    const cancelled = { ...bookingOfAna, status: "CANCELLED" as const };
    expect(canCancelBooking({ booking: cancelled, userId: ana, now })).toBe("ALREADY_CANCELLED");
  });

  it("impede cancelar uma reserva que já começou", () => {
    expect(canCancelBooking({ booking: bookingOfAna, userId: ana, now: at("10:00") })).toBe("ALREADY_STARTED");
    expect(canCancelBooking({ booking: bookingOfAna, userId: ana, now: at("10:30") })).toBe("ALREADY_STARTED");
  });

  it("verifica o dono antes de qualquer outra regra", () => {
    // Para quem não é dono, a resposta é sempre NOT_OWNER: não revela o estado da reserva alheia.
    const cancelled = { ...bookingOfAna, status: "CANCELLED" as const };
    expect(canCancelBooking({ booking: cancelled, userId: bruno, now })).toBe("NOT_OWNER");
  });
});
