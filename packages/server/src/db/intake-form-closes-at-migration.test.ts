/**
 * Migration 097: nullable closes_at timestamptz on intake_forms.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb, type TestDb } from "../test-utils.js";

describe.skipIf(!process.env.DATABASE_URL)(
  "migration 097_intake_form_closes_at",
  () => {
    let testDb: TestDb;

    beforeAll(async () => {
      testDb = await createTestDb();
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("adds a nullable closes_at column to intake_forms", async () => {
      // The column should exist (migration runs as part of createTestDb)
      const result = await testDb.db
        .selectFrom("intake_forms")
        .select("closes_at")
        .limit(0)
        .execute();

      // If the query succeeds, the column exists.
      // An empty result set is expected (no rows).
      expect(result).toEqual([]);
    });

    it("allows null closes_at (default for new forms)", async () => {
      const row = await testDb.db
        .insertInto("intake_forms")
        .values({
          // care-y-ignore-next-line ast-pii-in-db-write -- test data, not PII
          name: "test-form-nullable-closes-at",
        })
        .returning(["id", "closes_at"])
        .executeTakeFirstOrThrow();

      expect(row.closes_at).toBeNull();

      // Cleanup
      await testDb.db
        .deleteFrom("intake_forms")
        .where("id", "=", row.id)
        .execute();
    });

    it("stores and retrieves a timestamptz value", async () => {
      const closesAt = new Date("2026-12-31T23:59:59.000Z");
      const row = await testDb.db
        .insertInto("intake_forms")
        .values({
          // care-y-ignore-next-line ast-pii-in-db-write -- test data, not PII
          name: "test-form-with-closes-at",
          closes_at: closesAt,
        })
        .returning(["id", "closes_at"])
        .executeTakeFirstOrThrow();

      expect(row.closes_at).toBeInstanceOf(Date);
      expect(row.closes_at!.toISOString()).toBe("2026-12-31T23:59:59.000Z");

      // Cleanup
      await testDb.db
        .deleteFrom("intake_forms")
        .where("id", "=", row.id)
        .execute();
    });
  },
);
