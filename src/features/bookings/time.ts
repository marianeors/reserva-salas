// Fuso das regras de horário. O Brasil não tem horário de verão desde 2019,
// então o horário de Brasília é sempre UTC-3. Datas são salvas em UTC.
export const TIME_ZONE = "America/Sao_Paulo";
const UTC_OFFSET = "-03:00";

// "2026-10-20" + "09:30" (horário de Brasília) -> instante em UTC
export function toUtcDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${UTC_OFFSET}`);
}

export function minutesBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60_000);
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatTime(date: Date): string {
  return timeFormatter.format(date);
}

// Data de hoje no fuso de Brasília, no formato do <input type="date"> ("2026-10-20").
export function todayInputValue(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}
