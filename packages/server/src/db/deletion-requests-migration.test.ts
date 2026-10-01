import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { sql } from "kysely";
import { newOrgId, type OrgId } from "@care-y/shared";
import { createTestDb, type TestDb } from "../test-utils.js";
import { isPgUniqueViolation } from "./pg-errors.js";
import type { DeletionRequestStatus } from "./types.js";

/**
 * Tests for platform migrations 011_create_deletion_requests and
 * 012_create_platform_audit_log.
 *
 * Both tables live in the public schema (applied by test-global-setup.ts).
 * Each case uses fresh org ids, and afterAll removes every row this file
 * inserted, so parallel suites sharing the public schema are not affected.
 */

/** Column names of a public-schema table, in ordinal order. */
async function publicColumns(testDb: TestDb, table: string): Promise<string[]> {
  const result = await sql<{ column_name: string }>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${table}
    ORDER BY ordinal_position
  `.execute(testDb.platformDb);
  return result.rows.map((r) => r.column_name);
}

/** Resolves to the rejection reason, or undefined when the promise resolves. */
async function rejectionOf(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
    return undefined;
  } catch (err: unknown) {
    return err;
  }
}

describe.skipIf(!process.env.DATABASE_URL)(
  "011_create_deletion_requests migration",
  () => {
    let testDb: TestDb;
    /** Org ids used by this suite, for cleanup. */
    const suiteOrgIds: OrgId[] = [];

    function suiteOrgId(): OrgId {
      const id = newOrgId();
      suiteOrgIds.push(id);
      return id;
    }

    async function insertRequest(
      orgId: OrgId,
      status: DeletionRequestStatus,
    ): Promise<void> {
      await testDb.platformDb
        .insertInto("deletion_requests")
        .values({
          org_id: orgId,
          requested_by: null,
          cooling_off_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status,
          cancelled_by: null,
          cancelled_at: null,
          snapshot_at: null,
          blobs_deleted_at: null,
          schema_dropped_at: null,
          rows_deleted_at: null,
          subaccount_closed_at: null,
          provider_subaccount_sid: null,
          last_error: null,
        })
        .execute();
    }

    beforeAll(async () => {
      testDb = await createTestDb();
    });

    afterAll(async () => {
      if (suiteOrgIds.length > 0) {
        await testDb.platformDb
          .deleteFrom("deletion_requests")
          .where("org_id", "in", suiteOrgIds)
          .execute();
      }
      await testDb.cleanup();
    });

    it("table exists with expected columns", async () => {
      const columns = await publicColumns(testDb, "deletion_requests");

      // Containment, not an exact ordered list: an additive migration must
      // not break this test.
      expect(columns).toEqual(
        expect.arrayContaining([
          "id",
          "org_id",
          "requested_by",
          "requested_at",
          "cooling_off_until",
          "status",
          "cancelled_by",
          "cancelled_at",
          "snapshot_at",
          "blobs_deleted_at",
          "schema_dropped_at",
          "rows_deleted_at",
          "subaccount_closed_at",
          "provider_subaccount_sid",
          "last_error",
        ]),
      );
    });

    it("accepts a row for an org id with no orgs row (no foreign key)", async () => {
      const orgId = suiteOrgId();

      await insertRequest(orgId, "pending");

      const row = await testDb.platformDb
        .selectFrom("deletion_requests")
        .selectAll()
        .where("org_id", "=", orgId)
        .executeTakeFirstOrThrow();
      expect(row.id).toBeTruthy();
      expect(row.status).toBe("pending");
      expect(row.requested_at).toBeInstanceOf(Date);
      expect(row.cooling_off_until).toBeInstanceOf(Date);
      expect(row.provider_subaccount_sid).toBeNull();
    });

    it("stores a provider subaccount SID on the row", async () => {
      const orgId = suiteOrgId();
      await insertRequest(orgId, "processing");

      await testDb.platformDb
        .updateTable("deletion_requests")
        .set({ provider_subaccount_sid: "AC_test_subaccount" })
        .where("org_id", "=", orgId)
        .execute();

      const row = await testDb.platformDb
        .selectFrom("deletion_requests")
        .select("provider_subaccount_sid")
        .where("org_id", "=", orgId)
        .executeTakeFirstOrThrow();
      expect(row.provider_subaccount_sid).toBe("AC_test_subaccount");
    });

    it("the partial unique index rejects a second pending request for the same org", async () => {
      const orgId = suiteOrgId();
      await insertRequest(orgId, "pending");

      const err = await rejectionOf(insertRequest(orgId, "pending"));

      expect(isPgUniqueViolation(err)).toBe(true);
    });

    it("a processing request blocks a new pending request for the same org", async () => {
      const orgId = suiteOrgId();
      await insertRequest(orgId, "processing");

      const err = await rejectionOf(insertRequest(orgId, "pending"));

      expect(isPgUniqueViolation(err)).toBe(true);
    });

    it("cancelled and done requests do not block a new pending request", async () => {
      const orgId = suiteOrgId();
      await insertRequest(orgId, "cancelled");
      await insertRequest(orgId, "done");

      await expect(insertRequest(orgId, "pending")).resolves.toBeUndefined();
    });

    it("live requests for different orgs do not conflict", async () => {
      await insertRequest(suiteOrgId(), "pending");

      await expect(
        insertRequest(suiteOrgId(), "pending"),
      ).resolves.toBeUndefined();
    });
  },
);

describe.skipIf(!process.env.DATABASE_URL)(
  "012_create_platform_audit_log migration",
  () => {
    let testDb: TestDb;
    /** Marks this suite's rows so afterAll can remove them. */
    const suiteActor = "migration-test";

    beforeAll(async () => {
      testDb = await createTestDb();
    });

    afterAll(async () => {
      await testDb.platformDb
        .deleteFrom("platform_audit_log")
        .where("actor", "=", suiteActor)
        .execute();
      await testDb.cleanup();
    });

    it("table exists with expected columns", async () => {
      const columns = await publicColumns(testDb, "platform_audit_log");

      expect(columns).toEqual(
        expect.arrayContaining([
          "id",
          "action",
          "org_id",
          "actor",
          "created_at",
        ]),
      );
    });

    it("accepts a row for an org id with no orgs row (no foreign key)", async () => {
      const orgId = newOrgId();

      const row = await testDb.platformDb
        .insertInto("platform_audit_log")
        .values({ action: "org_erased", org_id: orgId, actor: suiteActor })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(typeof row.id).toBe("string");
      expect(row.action).toBe("org_erased");
      expect(row.org_id).toBe(orgId);
      expect(row.actor).toBe(suiteActor);
      expect(row.created_at).toBeInstanceOf(Date);
    });
  },
);
