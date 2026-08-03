import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fc from "fast-check";

import {
  generateAlias,
  isBlockedPair,
  ADJECTIVES,
  NOUNS,
  BLOCKED_PAIRS,
} from "./alias-generator.js";
import { createTestDb, type TestDb } from "../../test-utils.js";

const ALIAS_PATTERN = /^[a-z]+-[a-z]+-\d+$/;

describe.skipIf(!process.env.DATABASE_URL)("generateAlias (DB)", () => {
  let testDb: TestDb;

  beforeAll(async () => {
    testDb = await createTestDb();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("returns a string matching adjective-noun-number pattern", async () => {
    const alias = await generateAlias(testDb.db);
    expect(alias).toMatch(ALIAS_PATTERN);
  });

  it("produces unique suffixes across multiple calls", async () => {
    const suffixes = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const alias = await generateAlias(testDb.db);
      const parts = alias.split("-");
      suffixes.add(parts[parts.length - 1]!);
    }
    // All suffixes should be unique (drawn from a sequence)
    expect(suffixes.size).toBe(10);
  });

  it("never emits a blocked pair", async () => {
    for (let i = 0; i < 50; i++) {
      const alias = await generateAlias(testDb.db);
      const parts = alias.split("-");
      parts.pop(); // remove number
      const noun = parts.pop()!;
      const adj = parts.join("-");
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
