// Fuso das regras de horário. O Brasil não tem horário de verão desde 2019,
// então o horário de Brasília é sempre UTC-3. Datas são salvas em UTC.
export const TIME_ZONE = "America/Sao_Paulo";
const UTC_OFFSET = "-03:00";
const UTC_OFFSET_MS = -3 * 60 * 60_000;

// "2026-10-20" + "09:30" (horário de Brasília) -> instante em UTC.
// Retorna uma data inválida (NaN) para datas inexistentes.
export function toUtcDate(date: string, time: string): Date {
  const result = new Date(`${date}T${time}:00${UTC_OFFSET}`);
  if (Number.isNaN(result.getTime())) return result;

  // O JavaScript "rola" datas inexistentes (31/02 vira 03/03) em vez de falhar.
  // Convertendo de volta para Brasília, a data precisa ser a mesma digitada.
  const backToLocal = new Date(result.getTime() + UTC_OFFSET_MS).toISOString().slice(0, 16);
  return backToLocal === `${date}T${time}` ? result : new Date(NaN);
}

export function minutesBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60_000);
}

// 90 -> "1 h 30 min", 120 -> "2 h", 45 -> "45 min"
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
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
