import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import {
  generateAlias,
  isBlockedPair,
  ADJECTIVES,
  NOUNS,
  BLOCKED_PAIRS,
} from "./alias-generator.js";

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
      expect(parts.length).toBeGreaterThanOrEqual(3);

      const numStr = parts[parts.length - 1];
      const num = Number(numStr);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(99);
    }
  });

  it("produces different results across two calls (with retry)", () => {
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

  it("never emits a blocked pair across 1000 generations", () => {
    for (let i = 0; i < 1000; i++) {
      const alias = generateAlias();
      const parts = alias.split("-");
      const num = parts.pop();
      const noun = parts.pop()!;
      const adj = parts.join("-");
      expect(num).toBeDefined();
      expect(isBlockedPair(adj, noun)).toBe(false);
    }
  });
});

describe("isBlockedPair", () => {
  it("returns true for every entry in BLOCKED_PAIRS", () => {
    for (const entry of BLOCKED_PAIRS) {
      const [adj, noun] = entry.split("-");
      expect(isBlockedPair(adj!, noun!)).toBe(true);
    }
  });

  it("returns false for a known safe pair", () => {
    expect(isBlockedPair("calm", "pebble")).toBe(false);
  });
});

describe("word lists", () => {
  it("contains no duplicate adjectives", () => {
    const unique = new Set(ADJECTIVES);
    expect(unique.size).toBe(ADJECTIVES.length);
  });

  it("contains no duplicate nouns", () => {
    const unique = new Set(NOUNS);
    expect(unique.size).toBe(NOUNS.length);
  });

  it("does not contain 'gold' as an adjective", () => {
    expect(ADJECTIVES).not.toContain("gold");
  });

  it("blocked pairs reference only words present in the word lists", () => {
    for (const entry of BLOCKED_PAIRS) {
      const [adj, noun] = entry.split("-");
      expect(ADJECTIVES).toContain(adj);
      expect(NOUNS).toContain(noun);
    }
  });
});

describe("keyspace", () => {
  it("has at least 600,000 effective combinations", () => {
    const totalPairs = ADJECTIVES.length * NOUNS.length;
    const effectivePairs = totalPairs - BLOCKED_PAIRS.size;
    const effectiveAliases = effectivePairs * 99;
    expect(effectiveAliases).toBeGreaterThanOrEqual(600_000);
  });
});

describe("blocked pair property (fast-check)", () => {
  const adjArb = fc.constantFrom(...ADJECTIVES);
  const nounArb = fc.constantFrom(...NOUNS);

  it("isBlockedPair is consistent with BLOCKED_PAIRS set", () => {
    fc.assert(
      fc.property(adjArb, nounArb, (adj, noun) => {
        const inSet = BLOCKED_PAIRS.has(`${adj}-${noun}`);
        expect(isBlockedPair(adj, noun)).toBe(inSet);
      }),
      { numRuns: 2000 },
    );
  });
});
