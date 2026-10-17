import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_DATABASE_URL, getDatabaseUrl } from "@/lib/database-url";

describe("getDatabaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("usa o SQLite local quando DATABASE_URL não está definida", () => {
    vi.stubEnv("DATABASE_URL", undefined);

    expect(getDatabaseUrl()).toBe(DEFAULT_DATABASE_URL);
  });

  it("usa o SQLite local quando DATABASE_URL está vazia", () => {
    vi.stubEnv("DATABASE_URL", "");

    expect(getDatabaseUrl()).toBe(DEFAULT_DATABASE_URL);
  });

  it("usa DATABASE_URL quando definida", () => {
    vi.stubEnv("DATABASE_URL", "file:./test.db");

    expect(getDatabaseUrl()).toBe("file:./test.db");
  });
});
