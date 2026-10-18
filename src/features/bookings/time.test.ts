import { describe, expect, it } from "vitest";
import { formatDuration, formatTime, minutesBetween, toUtcDate, todayInputValue } from "@/features/bookings/time";

describe("time", () => {
  it("converte horário de Brasília para UTC (+3h)", () => {
    expect(toUtcDate("2026-10-20", "09:30").toISOString()).toBe("2026-10-20T12:30:00.000Z");
  });

  it.each([
    ["2026-02-31", "09:00"],
    ["2026-13-01", "09:00"],
    ["2026-10-20", "25:00"],
    ["2026-10-20", "09:60"],
  ])("devolve data inválida para %s %s (em vez de rolar para outro dia)", (date, time) => {
    expect(Number.isNaN(toUtcDate(date, time).getTime())).toBe(true);
  });

  it("formata de volta no horário de Brasília", () => {
    expect(formatTime(toUtcDate("2026-10-20", "09:30"))).toBe("09:30");
  });

  it.each([
    [45, "45 min"],
    [60, "1 h"],
    [90, "1 h 30 min"],
    [480, "8 h"],
  ])("formata %i minutos como %j", (minutes, text) => {
    expect(formatDuration(minutes)).toBe(text);
  });

  it("calcula a duração em minutos", () => {
    expect(minutesBetween(toUtcDate("2026-10-20", "09:00"), toUtcDate("2026-10-20", "10:15"))).toBe(75);
  });

  it("usa a data de Brasília, não a de UTC, para 'hoje'", () => {
    // 01:00 UTC do dia 21 ainda é 22:00 do dia 20 em Brasília.
    expect(todayInputValue(new Date("2026-10-21T01:00:00Z"))).toBe("2026-10-20");
  });
});
