import { describe, it, expect } from "vitest";
import { generateRandomIdentifier } from "./random-identifier.js";

describe("generateRandomIdentifier", () => {
  it("produces the vol-XXXXXX format", () => {
    const id = generateRandomIdentifier();
    expect(id).toMatch(/^vol-[a-z0-9]{6}$/);
  });

  it("never contains ambiguous characters (i, l, o, 0, 1)", () => {
    const ambiguous = new Set(["i", "l", "o", "0", "1"]);
    for (let trial = 0; trial < 200; trial++) {
      const id = generateRandomIdentifier();
      const suffix = id.slice(4);
      for (const char of suffix) {
        expect(
          ambiguous.has(char),
          `found ambiguous char '${char}' in ${id}`,
        ).toBe(false);
      }
    }
  });

  it("generates distinct identifiers", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      seen.add(generateRandomIdentifier());
    }
    expect(seen.size).toBeGreaterThan(40);
  });

  it("only contains chars from the allowed set", () => {
    const allowed = new Set("abcdefghjkmnpqrstuvwxyz23456789");
    for (let trial = 0; trial < 100; trial++) {
      const id = generateRandomIdentifier();
      const suffix = id.slice(4);
      for (const char of suffix) {
        expect(allowed.has(char), `unexpected char '${char}' in ${id}`).toBe(
          true,
        );
      }
    }
  });
});
