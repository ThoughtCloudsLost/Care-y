import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fc from "fast-check";
import { sql } from "kysely";

import {
  generateAlias,
  isBlockedPair,
  ADJECTIVES,
  NOUNS,
  BLOCKED_PAIRS,
} from "./alias-generator.js";
import { createTestDb, type TestDb } from "../../test-utils.js";

const ALIAS_PATTERN = /^[a-z]+-[a-z]+-\d+$/;

/** Extracts the trailing numeric suffix from an alias like "calm-pebble-42". */
function parseSuffix(alias: string): number {
  const parts = alias.split("-");
  return Number(parts[parts.length - 1]);
}

describe.skipIf(!process.env.DATABASE_URL)("generateAlias (DB)", () => {
  let testDb: TestDb;

  beforeAll(async () => {
    testDb = await createTestDb();
    // org_config row required by nextAliasSuffix (UPDATE ... RETURNING)
    await testDb.db
      .insertInto("org_config")
      .values({ pii_retention_days: null })
      .onConflict((oc) => oc.doNothing())
      .execute();
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
    // All suffixes should be unique (drawn from the per-org counter)
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

describe.skipIf(!process.env.DATABASE_URL)(
  "alias suffix tenant isolation",
  () => {
    let tenantA: TestDb;
    let tenantB: TestDb;

    beforeAll(async () => {
      tenantA = await createTestDb();
      tenantB = await createTestDb();

      // Seed org_config rows (required by nextAliasSuffix)
      for (const t of [tenantA, tenantB]) {
        await t.db
          .insertInto("org_config")
          .values({ pii_retention_days: null })
          .onConflict((oc) => oc.doNothing())
          .execute();
      }
    }, 30_000);

    afterAll(async () => {
      await tenantA.cleanup();
      await tenantB.cleanup();
    });

    it("two tenants draw independent alias suffixes that start at 1", async () => {
      // Generate aliases in tenant A
      const aliasA1 = await generateAlias(tenantA.db);
      const aliasA2 = await generateAlias(tenantA.db);
      const aliasA3 = await generateAlias(tenantA.db);

      // Generate aliases in tenant B (interleaved timing)
      const aliasB1 = await generateAlias(tenantB.db);
      const aliasB2 = await generateAlias(tenantB.db);

      // Tenant A suffixes run 1, 2, 3
      expect(parseSuffix(aliasA1)).toBe(1);
      expect(parseSuffix(aliasA2)).toBe(2);
      expect(parseSuffix(aliasA3)).toBe(3);

      // Tenant B suffixes run 1, 2, independent of A
      expect(parseSuffix(aliasB1)).toBe(1);
      expect(parseSuffix(aliasB2)).toBe(2);
    });

    it("generating in tenant A does not advance tenant B counter", async () => {
      // Read tenant B's current counter
      const beforeRow = await tenantB.db
        .selectFrom("org_config")
        .select("next_alias_suffix")
        .executeTakeFirstOrThrow();
      const before = beforeRow.next_alias_suffix;

      // Generate 5 aliases in tenant A
      for (let i = 0; i < 5; i++) {
        await generateAlias(tenantA.db);
      }

      // Tenant B's counter is unchanged
      const afterRow = await tenantB.db
        .selectFrom("org_config")
        .select("next_alias_suffix")
        .executeTakeFirstOrThrow();
      expect(afterRow.next_alias_suffix).toBe(before);
    });

    it("dropping one tenant's org_config does not affect the other", async () => {
      // Record tenant B's current counter before the destructive test
      const bCounterBefore = (
        await tenantB.db
          .selectFrom("org_config")
          .select("next_alias_suffix")
          .executeTakeFirstOrThrow()
      ).next_alias_suffix;

      // Drop tenant A's schema entirely (simulates a rollback)
      await sql`DROP SCHEMA ${sql.id(tenantA.schemaName)} CASCADE`.execute(
        tenantA.platformDb,
      );

      // Tenant B still generates aliases
      const aliasB = await generateAlias(tenantB.db);
      expect(aliasB).toMatch(ALIAS_PATTERN);
      expect(parseSuffix(aliasB)).toBe(bCounterBefore + 1);
    });
  },
);

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
