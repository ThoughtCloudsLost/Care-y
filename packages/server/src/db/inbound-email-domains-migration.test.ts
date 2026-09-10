import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { sql } from "kysely";
import { createTestDb, type TestDb } from "../test-utils.js";
import type { OrgId, OrgSlug, OrgSchema } from "@care-y/shared";

/**
 * Tests for platform migration 010_inbound_email_domains.
 *
 * The table lives in the public schema (applied by test-global-setup.ts).
 * Tests insert/query via platformDb and clean up their own rows in afterAll
 * so parallel suites sharing the public schema are not affected.
 */
describe.skipIf(!process.env.DATABASE_URL)(
  "010_inbound_email_domains migration",
  () => {
    let testDb: TestDb;
    /** Org ID inserted by this suite into the public orgs table. */
    const suiteOrgId = "00000000-0000-4000-a000-000000000010" as OrgId;

    beforeAll(async () => {
      testDb = await createTestDb();

      // Insert an org row in the public schema for FK tests.
      await testDb.platformDb
        .insertInto("orgs")
        .values({
          id: suiteOrgId,
          slug: `inbound-test-${testDb.schemaName}` as OrgSlug,
          schema_name: testDb.schemaName as OrgSchema,
        })
        .execute();
    });

    afterAll(async () => {
      // Clean up domain rows first (FK constraint), then the org row.
      await testDb.platformDb
        .deleteFrom("inbound_email_domains")
        .where("org_id", "=", suiteOrgId)
        .execute();

      await testDb.platformDb
        .deleteFrom("orgs")
        .where("id", "=", suiteOrgId)
        .execute();

      await testDb.cleanup();
    });

    it("table exists with expected columns", async () => {
      const result = await sql<{ column_name: string }>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'inbound_email_domains'
        ORDER BY ordinal_position
      `.execute(testDb.platformDb);

      const columns = result.rows.map((r) => r.column_name);
      // Containment, not an exact ordered list: an additive migration must
      // not break this test.
      expect(columns).toEqual(
        expect.arrayContaining([
          "id",
          "domain",
          "org_id",
          "created_at",
          "updated_at",
        ]),
      );
    });

    it("inserts a domain row and reads it back", async () => {
      const row = await testDb.platformDb
        .insertInto("inbound_email_domains")
        .values({ domain: "reply.example.org", org_id: suiteOrgId })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.domain).toBe("reply.example.org");
      expect(row.org_id).toBe(suiteOrgId);
      expect(row.id).toBeTruthy();
      expect(row.created_at).toBeInstanceOf(Date);
      expect(row.updated_at).toBeInstanceOf(Date);

      // Clean up for subsequent tests.
      await testDb.platformDb
        .deleteFrom("inbound_email_domains")
        .where("id", "=", row.id)
        .execute();
    });

    it("rejects duplicate domains (unique constraint)", async () => {
      await testDb.platformDb
        .insertInto("inbound_email_domains")
        .values({ domain: "unique-test.example.org", org_id: suiteOrgId })
        .execute();

      await expect(
        testDb.platformDb
          .insertInto("inbound_email_domains")
          .values({ domain: "unique-test.example.org", org_id: suiteOrgId })
          .execute(),
      ).rejects.toThrow(/unique|duplicate/i);

      // Clean up.
      await testDb.platformDb
        .deleteFrom("inbound_email_domains")
        .where("domain", "=", "unique-test.example.org")
        .execute();
    });

    it("RESTRICT blocks org delete while a domain row exists", async () => {
      // Insert a second org for this test so we don't break the suite org.
      const restrictOrgId = "00000000-0000-4000-a000-000000000011" as OrgId;

      await testDb.platformDb
        .insertInto("orgs")
        .values({
          id: restrictOrgId,
          slug: `restrict-test-${testDb.schemaName}` as OrgSlug,
          schema_name: `org_restrict_test` as OrgSchema,
        })
        .execute();

      await testDb.platformDb
        .insertInto("inbound_email_domains")
        .values({ domain: "restrict-test.example.org", org_id: restrictOrgId })
        .execute();

      // Attempt to delete the org while a domain row references it.
      await expect(
        testDb.platformDb
          .deleteFrom("orgs")
          .where("id", "=", restrictOrgId)
          .execute(),
      ).rejects.toThrow(/restrict|violates foreign key/i);

      // Clean up: remove domain first, then org.
      await testDb.platformDb
        .deleteFrom("inbound_email_domains")
        .where("domain", "=", "restrict-test.example.org")
        .execute();

      await testDb.platformDb
        .deleteFrom("orgs")
        .where("id", "=", restrictOrgId)
        .execute();
    });

    it("looks up domain by lowercased value", async () => {
      // Insert a domain stored lowercase (application normalizes on write).
      await testDb.platformDb
        .insertInto("inbound_email_domains")
        .values({ domain: "lookup.example.org", org_id: suiteOrgId })
        .execute();

      // Simulate receiver lookup: lowercase the incoming domain, query.
      const incoming = "LOOKUP.EXAMPLE.ORG";
      const normalized = incoming.toLowerCase();

      const row = await testDb.platformDb
        .selectFrom("inbound_email_domains")
        .selectAll()
        .where("domain", "=", normalized)
        .executeTakeFirst();

      expect(row).toBeDefined();
      expect(row?.org_id).toBe(suiteOrgId);

      // Clean up.
      await testDb.platformDb
        .deleteFrom("inbound_email_domains")
        .where("domain", "=", "lookup.example.org")
        .execute();
    });
  },
);
