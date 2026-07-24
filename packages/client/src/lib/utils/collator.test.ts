import { describe, it, expect } from "vitest";
import { getCollator } from "./collator.js";

describe("getCollator", () => {
  it("returns the same instance for repeated calls with one locale", () => {
    expect(getCollator()).toBe(getCollator());
    expect(getCollator("es")).toBe(getCollator("es"));
  });

  it("keeps per-locale instances distinct", () => {
    expect(getCollator("es")).not.toBe(getCollator("de"));
    expect(getCollator("es")).not.toBe(getCollator());
  });

  it("compares like localeCompare in the default locale", () => {
    const samples = ["Zoe", "ana", "Álvaro", "ben", "Ana"];
    for (const a of samples) {
      for (const b of samples) {
        expect(Math.sign(getCollator().compare(a, b))).toBe(
          Math.sign(a.localeCompare(b)),
        );
      }
    }
  });
});
