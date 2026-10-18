import { describe, expect, it } from "vitest";
import {
  canCancelBooking,
  checkBusinessHours,
  overlaps,
  validateBooking,
  violationMessage,
  type TimeRange,
} from "@/features/bookings/rules";
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
  const validate = (booking: TimeRange, existing: TimeRange[] = [], maxDurationMinutes = 240) =>
    validateBooking({ booking, now, existing, maxDurationMinutes });

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

  it("aplica a duração máxima da sala (SALA-6)", () => {
    // Sala com limite de 1 h
    expect(validate(range("09:00", "10:00"), [], 60)).toBeNull();
    expect(validate(range("09:00", "10:01"), [], 60)).toBe("TOO_LONG");
    // Sala com limite de 8 h: o antigo limite fixo de 4 h não vale mais
    expect(validate(range("09:00", "17:00"), [], 480)).toBeNull();
    expect(validate(range("09:00", "17:01"), [], 480)).toBe("TOO_LONG");
  });
});

describe("violationMessage", () => {
  it("informa a duração máxima da sala na mensagem", () => {
    expect(violationMessage("TOO_LONG", 90)).toBe("Nesta sala, a reserva pode ter no máximo 1 h 30 min.");
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

describe("checkBusinessHours (hotfix SALA-5: dias úteis, das 08h às 20h)", () => {
  // 2026-10-20 é terça; 24 é sábado e 25 é domingo.
  const on = (date: string, start: string, end: string): TimeRange => ({
    startsAt: toUtcDate(date, start),
    endsAt: toUtcDate(date, end),
  });

  it("aceita reservas dentro do horário comercial, inclusive nos limites", () => {
    expect(checkBusinessHours(on("2026-10-20", "08:00", "09:00"))).toBeNull();
    expect(checkBusinessHours(on("2026-10-20", "19:00", "20:00"))).toBeNull();
    expect(checkBusinessHours(on("2026-10-20", "08:00", "20:00"))).toBeNull();
  });

  it("rejeita reservas no sábado e no domingo", () => {
    expect(checkBusinessHours(on("2026-10-24", "10:00", "11:00"))).toBe("NOT_BUSINESS_DAY");
    expect(checkBusinessHours(on("2026-10-25", "10:00", "11:00"))).toBe("NOT_BUSINESS_DAY");
  });

  it("rejeita reservas que começam antes das 08h ou terminam depois das 20h", () => {
    expect(checkBusinessHours(on("2026-10-20", "07:45", "08:30"))).toBe("OUTSIDE_BUSINESS_HOURS");
    expect(checkBusinessHours(on("2026-10-20", "19:30", "20:15"))).toBe("OUTSIDE_BUSINESS_HOURS");
    expect(checkBusinessHours(on("2026-10-20", "21:00", "22:00"))).toBe("OUTSIDE_BUSINESS_HOURS");
  });

  it("rejeita reserva que atravessa a meia-noite", () => {
    const overnight = { startsAt: toUtcDate("2026-10-20", "19:00"), endsAt: toUtcDate("2026-10-21", "00:30") };
    expect(checkBusinessHours(overnight)).toBe("OUTSIDE_BUSINESS_HOURS");
  });

  it("usa o horário de Brasília, não o de UTC", () => {
    // 19:30 em Brasília é 22:30 UTC: está dentro do horário comercial.
    expect(checkBusinessHours(on("2026-10-20", "19:00", "19:30"))).toBeNull();
  });

  it("é aplicada por validateBooking", () => {
    const booking = on("2026-10-24", "10:00", "11:00");
    expect(validateBooking({ booking, now, existing: [], maxDurationMinutes: 240 })).toBe("NOT_BUSINESS_DAY");
  });
});

// Merge do hotfix SALA-5 com a SALA-6: as duas regras precisam valer juntas.
describe("horário comercial (SALA-5) + duração máxima por sala (SALA-6)", () => {
  const validate = (start: string, end: string, maxDurationMinutes: number) =>
    validateBooking({ booking: range(start, end), now, existing: [], maxDurationMinutes });

  it("aceita reserva longa numa sala que permite, dentro do horário comercial", () => {
    expect(validate("08:00", "16:00", 480)).toBeNull();
  });

  it("recusa reserva que respeita a sala mas passa das 20h", () => {
    expect(validate("14:00", "21:00", 480)).toBe("OUTSIDE_BUSINESS_HOURS");
  });

  it("recusa reserva dentro do horário comercial mas acima do limite da sala", () => {
    expect(validate("09:00", "10:30", 60)).toBe("TOO_LONG");
  });
});
