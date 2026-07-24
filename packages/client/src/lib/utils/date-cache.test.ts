import { describe, it, expect } from "vitest";
import { cachedDate } from "./date-cache.js";

describe("cachedDate", () => {
  it("parses an ISO string to the matching Date", () => {
    const date = cachedDate("2026-04-13T12:00:00.000Z");
    expect(date.toISOString()).toBe("2026-04-13T12:00:00.000Z");
  });

  it("returns the same instance for the same string", () => {
    const first = cachedDate("2026-04-13T12:00:00.000Z");
    const second = cachedDate("2026-04-13T12:00:00.000Z");
    expect(second).toBe(first);
  });

  it("returns distinct instances for distinct strings", () => {
    const a = cachedDate("2026-04-13T12:00:00.000Z");
    const b = cachedDate("2026-04-14T12:00:00.000Z");
    expect(b).not.toBe(a);
    expect(b.getTime()).not.toBe(a.getTime());
  });
});
