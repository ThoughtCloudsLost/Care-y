/**
 * DB integration tests for the org config general-settings service.
 *
 * Pins the read contract page loads depend on: plaintext org name, non-null
 * language and country values backed by DB defaults, and the behavior when
 * the org_config singleton row is missing (fresh schema before onboarding
 * seeds it).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import { createOrgConfigService } from "./org-config-service.js";
import { createTestDb, type TestDb } from "../test-utils.js";
import { NotFoundError } from "../errors.js";
import type { TenantDatabase } from "../db/types.js";

/** Plaintext org name for seeding (ADR-094). */
const SEED_NAME = "Test Organization";

/** Restores the seeded row after tests that mutate it. */
async function resetOrgConfig(db: Kysely<TenantDatabase>): Promise<void> {
  await db
    .updateTable("org_config")
    .set({
      // care-y-ignore-next-line ast-pii-in-db-write -- plaintext branding column (ADR-094)
      name: SEED_NAME,
      default_language: "en",
      default_country_code: "+1",
    })
    .execute();
}

describe.skipIf(!process.env.DATABASE_URL)("createOrgConfigService", () => {
  describe("with a seeded org_config row", () => {
    let testDb: TestDb;
    let db: Kysely<TenantDatabase>;

    beforeAll(async () => {
      testDb = await createTestDb();
      db = testDb.db;
      // Insert omits default_language and default_country_code so the DB
      // defaults apply (migrations 069 and 015 respectively).
      await db
        .insertInto("org_config")
        // care-y-ignore-next-line ast-pii-in-db-write -- plaintext branding column (ADR-094)
        .values({ name: SEED_NAME })
        .execute();
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    describe("getOrgGeneral", () => {
      it("returns the plaintext org name", async () => {
        const svc = createOrgConfigService(db);
        const result = await svc.getOrgGeneral();

        expect(result.name).toBe(SEED_NAME);
      });

      it("returns the DB defaults for language and country when the insert omitted them", async () => {
        const svc = createOrgConfigService(db);
        const result = await svc.getOrgGeneral();

        expect(result.defaultLanguage).toBe("en");
        expect(result.countryCode).toBe("+1");
      });

      it("returns null name when the name column is null", async () => {
        // care-y-ignore-next-line ast-pii-in-db-write -- clearing plaintext branding column (ADR-094)
        await db.updateTable("org_config").set({ name: null }).execute();

        const svc = createOrgConfigService(db);
        const result = await svc.getOrgGeneral();

        expect(result.name).toBeNull();

        await resetOrgConfig(db);
      });
    });

    describe("updateOrgGeneral", () => {
      it("persists all three fields and roundtrips through getOrgGeneral", async () => {
        const svc = createOrgConfigService(db);
        const updatedName = "Updated Org Name";

        await svc.updateOrgGeneral({
          orgName: updatedName,
          defaultLanguage: "es",
          countryCode: "+34",
        });

        const result = await svc.getOrgGeneral();
        expect(result).toEqual({
          name: updatedName,
          defaultLanguage: "es",
          countryCode: "+34",
          portalSafeExitUrl: null,
        });

        // At rest the name is a plain string.
        const row = await db
          .selectFrom("org_config")
          .select("name")
          .executeTakeFirstOrThrow();
        expect(row.name).toBe(updatedName);

        await resetOrgConfig(db);
      });
    });
  });

  describe("with no org_config row (fresh schema)", () => {
    let testDb: TestDb;

    beforeAll(async () => {
      testDb = await createTestDb();
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("getOrgGeneral rejects with NotFoundError when the row is missing", async () => {
      const svc = createOrgConfigService(testDb.db);
      await expect(svc.getOrgGeneral()).rejects.toThrow(NotFoundError);
    }, 30_000);

    it("updateOrgGeneral rejects with NotFoundError when the row is missing", async () => {
      const svc = createOrgConfigService(testDb.db);
      await expect(
        svc.updateOrgGeneral({
          orgName: "No Row Name",
          defaultLanguage: "es",
          countryCode: "+34",
        }),
      ).rejects.toThrow(NotFoundError);
    }, 30_000);
  });
});
