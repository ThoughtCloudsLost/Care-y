/**
 * DB integration tests for the org config general-settings service.
 *
 * Pins the read contract page loads depend on: base64 wire encoding of
 * the encrypted org name, non-null language and country values backed by
 * DB defaults, and the behavior when the org_config singleton row is
 * missing (fresh schema before onboarding seeds it).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import { createOrgConfigService } from "./org-config-service.js";
import { createTestDb, type TestDb } from "../test-utils.js";
import { NotFoundError } from "../errors.js";
import type { TenantDatabase } from "../db/types.js";

/** Opaque bytes standing in for client-produced org name ciphertext. */
const SEED_ENCRYPTED_NAME = Buffer.from("enc-org-name-bytes");

/** Restores the seeded row after tests that mutate it. */
async function resetOrgConfig(db: Kysely<TenantDatabase>): Promise<void> {
  await db
    .updateTable("org_config")
    .set({
      encrypted_name: SEED_ENCRYPTED_NAME,
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
        .values({ encrypted_name: SEED_ENCRYPTED_NAME })
        .execute();
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    describe("getOrgGeneral", () => {
      it("returns the encrypted name as base64 (wire format sent to clients)", async () => {
        const svc = createOrgConfigService(db);
        const result = await svc.getOrgGeneral();

        // base64 is the tRPC wire encoding of the bytea column.
        expect(result.encryptedName).toBe(
          SEED_ENCRYPTED_NAME.toString("base64"),
        );
      });

      it("returns the DB defaults for language and country when the insert omitted them", async () => {
        // Schema contract: default_language defaults to 'en' and
        // default_country_code to '+1', both NOT NULL, so page loads
        // never receive null for either field.
        const svc = createOrgConfigService(db);
        const result = await svc.getOrgGeneral();

        expect(result.defaultLanguage).toBe("en");
        expect(result.countryCode).toBe("+1");
      });

      it("returns null encryptedName when the encrypted_name column is null", async () => {
        await db
          .updateTable("org_config")
          .set({ encrypted_name: null })
          .execute();

        const svc = createOrgConfigService(db);
        const result = await svc.getOrgGeneral();

        expect(result.encryptedName).toBeNull();

        await resetOrgConfig(db);
      });
    });

    describe("updateOrgGeneral", () => {
      it("persists all three fields and roundtrips through getOrgGeneral", async () => {
        const svc = createOrgConfigService(db);
        const updatedName = Buffer.from("updated-enc-name");

        await svc.updateOrgGeneral({
          encryptedOrgName: updatedName.toString("base64"),
          defaultLanguage: "es",
          countryCode: "+34",
        });

        const result = await svc.getOrgGeneral();
        expect(result).toEqual({
          encryptedName: updatedName.toString("base64"),
          defaultLanguage: "es",
          countryCode: "+34",
        });

        // At rest the name is the decoded bytes; base64 exists only on
        // the wire.
        const row = await db
          .selectFrom("org_config")
          .select("encrypted_name")
          .executeTakeFirstOrThrow();
        expect(row.encrypted_name).toEqual(updatedName);

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
          encryptedOrgName: Buffer.from("no-row-name").toString("base64"),
          defaultLanguage: "es",
          countryCode: "+34",
        }),
      ).rejects.toThrow(NotFoundError);
    }, 30_000);
  });
});
