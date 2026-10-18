import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("escreve uma linha JSON com timestamp, nível, evento e campos", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    logger.info("booking.created", { bookingId: "b1", durationMin: 60 });

    const entry = JSON.parse(log.mock.calls[0][0] as string);
    expect(entry).toMatchObject({ level: "info", event: "booking.created", bookingId: "b1", durationMin: 60 });
    expect(new Date(entry.ts).toISOString()).toBe(entry.ts);
  });

  it("usa console.warn e console.error conforme o nível", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.warn("booking.rejected");
    logger.error("request.error");

    expect(JSON.parse(warn.mock.calls[0][0] as string).level).toBe("warn");
    expect(JSON.parse(error.mock.calls[0][0] as string).level).toBe("error");
  });
});
