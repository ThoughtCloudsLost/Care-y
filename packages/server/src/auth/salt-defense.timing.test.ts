/**
 * Timing tests for salt endpoint enumeration defense.
 *
 * Verifies that response times for real and nonexistent users are
 * statistically indistinguishable, preventing timing side-channel
 * user enumeration.
 *
 * Strategy:
 *   1. Seed a test org with one real user (has a user_keys row)
 *   2. Warm up with 5 discarded requests
 *   3. Make N requests for the real user, record response times
 *   4. Make N requests for a nonexistent user, record response times
 *   5. Remove outliers (> 3 standard deviations)
 *   6. Compare distributions using Welch's t-test
 *   7. Assert t-statistic < 2.576 (p > 0.01 at 99% confidence)
 *
 * Uses process.hrtime.bigint() for nanosecond precision.
 * Runs against a real DB (not mocked) to capture actual query timing.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { deriveFakeSaltKey, createSaltDefense } from "./salt-defense.js";
import {
  createTestDb,
  createTestUser,
  testBlindIndexer,
  noopEncryptor,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";

const HAS_DB = Boolean(process.env.DATABASE_URL);

const SAMPLE_SIZE = 50;
const WARMUP_COUNT = 5;
const T_CRITICAL = 2.576; // p > 0.01, two-tailed

function welchTStatistic(a: number[], b: number[]): number {
  const meanA = a.reduce((s, x) => s + x, 0) / a.length;
  const meanB = b.reduce((s, x) => s + x, 0) / b.length;
  const varA = a.reduce((s, x) => s + (x - meanA) ** 2, 0) / (a.length - 1);
  const varB = b.reduce((s, x) => s + (x - meanB) ** 2, 0) / (b.length - 1);
  const se = Math.sqrt(varA / a.length + varB / b.length);
  if (se === 0) return 0;
  return Math.abs(meanA - meanB) / se;
}

function removeOutliers(values: number[]): number[] {
  const mean = values.reduce((s, x) => s + x, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((s, x) => s + (x - mean) ** 2, 0) / (values.length - 1),
  );
  const cutoff = 3 * stdDev;
  return values.filter((v) => Math.abs(v - mean) <= cutoff);
}

async function measureMs(fn: () => Promise<unknown>): Promise<number> {
  const start = process.hrtime.bigint();
  await fn();
  const end = process.hrtime.bigint();
  return Number(end - start) / 1_000_000; // ns to ms
}

describe.skipIf(!HAS_DB)(
  "salt defense timing indistinguishability",
  { timeout: 30_000 },
  () => {
    let testDb: TestDb;
    let tenantDb: Kysely<TenantDatabase>;
    let fakeSaltKey: Buffer;
    let realIdentifier: string;

    beforeAll(async () => {
      testDb = await createTestDb();
      tenantDb = testDb.db;
      fakeSaltKey = await deriveFakeSaltKey("a".repeat(64));

      // Seed a real user with a user_keys row.
      const user = await createTestUser(tenantDb, {
        encryptor: noopEncryptor,
        indexer: testBlindIndexer,
        orgId: TEST_ORG_ID,
      });

      const realSalt = Buffer.alloc(16, 0xcc);
      await tenantDb
        .insertInto("user_keys")
        .values({ user_id: user.id, salt: realSalt })
        .execute();

      realIdentifier = user.encrypted_identifier.toString("utf-8");
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    function makeSaltDefense(): ReturnType<typeof createSaltDefense> {
      return createSaltDefense(
        tenantDb,
        { fakeSaltKey, orgUuid: TEST_ORG_ID },
        testBlindIndexer,
      );
    }

    it("real vs fake user response times are statistically indistinguishable", async () => {
      const sd = makeSaltDefense();
      const fakeIdentifier = "nonexistent-timing-user";

      // Warm up (JIT, connection pool).
      for (let i = 0; i < WARMUP_COUNT; i++) {
        await sd.getSalt(realIdentifier);
        await sd.getSalt(fakeIdentifier);
      }

      // Interleave real and fake measurements to eliminate systematic bias
      // from connection pool warmup, OS caching, and CPU frequency scaling.
      const realTimes: number[] = [];
      const fakeTimes: number[] = [];

      for (let i = 0; i < SAMPLE_SIZE; i++) {
        // Alternate which goes first each iteration to cancel ordering effects.
        if (i % 2 === 0) {
          realTimes.push(await measureMs(() => sd.getSalt(realIdentifier)));
          fakeTimes.push(await measureMs(() => sd.getSalt(fakeIdentifier)));
        } else {
          fakeTimes.push(await measureMs(() => sd.getSalt(fakeIdentifier)));
          realTimes.push(await measureMs(() => sd.getSalt(realIdentifier)));
        }
      }

      const cleanReal = removeOutliers(realTimes);
      const cleanFake = removeOutliers(fakeTimes);

      // Both must have enough samples after outlier removal.
      expect(cleanReal.length).toBeGreaterThan(SAMPLE_SIZE * 0.8);
      expect(cleanFake.length).toBeGreaterThan(SAMPLE_SIZE * 0.8);

      const t = welchTStatistic(cleanReal, cleanFake);

      // t < 2.576 means no statistically significant difference at 99% confidence.
      expect(t).toBeLessThan(T_CRITICAL);
    });

    it("returns identical base64 for repeated queries to the same nonexistent user", async () => {
      const sd = makeSaltDefense();
      const results: string[] = [];

      for (let i = 0; i < 10; i++) {
        const result = await sd.getSalt("determinism-check");
        results.push(result.salt.toString("base64"));
      }

      const first = results[0];
      expect(results.every((r) => r === first)).toBe(true);
    });

    it("returns exactly 16 bytes for both real and fake users", async () => {
      const sd = makeSaltDefense();

      const real = await sd.getSalt(realIdentifier);
      const fake = await sd.getSalt("size-check-nonexistent");

      expect(real.salt.length).toBe(16);
      expect(fake.salt.length).toBe(16);
    });
  },
);
