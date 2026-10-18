// Regras de reserva como funções puras: sem banco, sem relógio global.
// Quem chama informa "agora" e as reservas existentes, o que torna tudo testável.
import { formatDuration, minutesBetween, toLocalParts } from "./time";

export const MIN_DURATION_MINUTES = 15;
// Cada sala define sua duração máxima (SALA-6), dentro destes limites.
export const DEFAULT_MAX_DURATION_MINUTES = 4 * 60;
export const MAX_ROOM_DURATION_MINUTES = 8 * 60;
// Horário comercial (SALA-5), em minutos do dia no horário de Brasília.
export const BUSINESS_START_MINUTE = 8 * 60;
export const BUSINESS_END_MINUTE = 20 * 60;

export type TimeRange = {
  startsAt: Date;
  endsAt: Date;
};

export type BookingRuleViolation =
  | "INVALID_RANGE"
  | "IN_PAST"
  | "NOT_BUSINESS_DAY"
  | "OUTSIDE_BUSINESS_HOURS"
  | "TOO_SHORT"
  | "TOO_LONG"
  | "OVERLAP";

export function violationMessage(violation: BookingRuleViolation, maxDurationMinutes: number): string {
  const messages: Record<BookingRuleViolation, string> = {
    INVALID_RANGE: "O horário de fim precisa ser depois do início.",
    IN_PAST: "Não é possível reservar no passado.",
    NOT_BUSINESS_DAY: "Reservas só podem ser feitas em dias úteis (segunda a sexta).",
    OUTSIDE_BUSINESS_HOURS: "Reservas só podem acontecer entre 08h e 20h.",
    TOO_SHORT: `A reserva precisa ter pelo menos ${MIN_DURATION_MINUTES} minutos.`,
    TOO_LONG: `Nesta sala, a reserva pode ter no máximo ${formatDuration(maxDurationMinutes)}.`,
    OVERLAP: "A sala já está reservada nesse horário.",
  };
  return messages[violation];
}

// SALA-5: a reserva precisa caber inteira num dia útil, entre 08h e 20h
// (horário de Brasília). Começar às 08h e terminar às 20h é permitido.
export function checkBusinessHours(booking: TimeRange): "NOT_BUSINESS_DAY" | "OUTSIDE_BUSINESS_HOURS" | null {
  const start = toLocalParts(booking.startsAt);
  const end = toLocalParts(booking.endsAt);

  if (start.weekday === 0 || start.weekday === 6) return "NOT_BUSINESS_DAY";
  if (
    end.date !== start.date ||
    start.minuteOfDay < BUSINESS_START_MINUTE ||
    end.minuteOfDay > BUSINESS_END_MINUTE
  ) {
    return "OUTSIDE_BUSINESS_HOURS";
  }
  return null;
}

// Intervalos semiabertos [início, fim): uma reserva que termina às 10h
// não conflita com outra que começa às 10h.
export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.startsAt < b.endsAt && a.endsAt > b.startsAt;
}

type ValidateInput = {
  booking: TimeRange;
  now: Date;
  // Reservas ATIVAS da mesma sala.
  existing: TimeRange[];
  // Duração máxima definida pela sala (SALA-6).
  maxDurationMinutes: number;
};

// Retorna a primeira regra violada, ou null se a reserva é válida.
export function validateBooking({
  booking,
  now,
  existing,
  maxDurationMinutes,
}: ValidateInput): BookingRuleViolation | null {
  const duration = minutesBetween(booking.startsAt, booking.endsAt);

  // "!(duration > 0)" também pega datas inválidas (ex.: 31/02), cuja duração é NaN.
  if (!(duration > 0)) return "INVALID_RANGE";
  if (booking.startsAt < now) return "IN_PAST";
  const businessHours = checkBusinessHours(booking);
  if (businessHours) return businessHours;
  if (duration < MIN_DURATION_MINUTES) return "TOO_SHORT";
  if (duration > maxDurationMinutes) return "TOO_LONG";
  if (existing.some((other) => overlaps(booking, other))) return "OVERLAP";

  return null;
}

export type CancelViolation = "NOT_OWNER" | "ALREADY_CANCELLED" | "ALREADY_STARTED";

// NOT_OWNER usa a mesma mensagem de "não encontrada": não revelamos que a
// reserva de outra pessoa existe.
export const cancelViolationMessages: Record<CancelViolation | "NOT_FOUND", string> = {
  NOT_FOUND: "Reserva não encontrada.",
  NOT_OWNER: "Reserva não encontrada.",
  ALREADY_CANCELLED: "Esta reserva já foi cancelada.",
  ALREADY_STARTED: "Não é possível cancelar uma reserva que já começou.",
};

type CancelInput = {
  booking: { userId: string; status: "ACTIVE" | "CANCELLED"; startsAt: Date };
  userId: string;
  now: Date;
};

// Só o dono cancela (inclusive o admin só cancela as próprias), e só
// reservas ativas que ainda não começaram.
export function canCancelBooking({ booking, userId, now }: CancelInput): CancelViolation | null {
  if (booking.userId !== userId) return "NOT_OWNER";
  if (booking.status === "CANCELLED") return "ALREADY_CANCELLED";
  if (booking.startsAt <= now) return "ALREADY_STARTED";

  return null;
}
