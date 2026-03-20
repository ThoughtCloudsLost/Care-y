import { describe, it, expect } from "vitest";

import { generateAlias } from "./alias-generator.js";

const ALIAS_PATTERN = /^[a-z]+-[a-z]+-\d+$/;

describe("generateAlias", () => {
  it("returns a string matching adjective-noun-number pattern", () => {
    const alias = generateAlias();
    expect(alias).toMatch(ALIAS_PATTERN);
  });

  it("produces a number suffix between 1 and 99", () => {
    const alias = generateAlias();
    const parts = alias.split("-");
    const num = Number(parts[parts.length - 1]);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(99);
  });

  it("produces 100 aliases that all match the expected format", () => {
    for (let i = 0; i < 100; i++) {
      const alias = generateAlias();
      expect(alias).toMatch(ALIAS_PATTERN);

      const parts = alias.split("-");
      // At least 3 parts: adjective, noun, number (compound words are fine)
      expect(parts.length).toBeGreaterThanOrEqual(3);

      const numStr = parts[parts.length - 1];
      const num = Number(numStr);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(99);
    }
  });

  it("produces different results across two calls (with retry)", () => {
    // The keyspace is ~630k, so collisions on two consecutive calls are very unlikely.
    // Retry up to 10 times to eliminate flakiness from astronomically unlikely repeats.
    let found = false;

    for (let attempt = 0; attempt < 10; attempt++) {
      const a = generateAlias();
      const b = generateAlias();
      if (a !== b) {
        found = true;
        break;
      }
    }

    expect(found).toBe(true);
  });
});
