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
import {
  createOrgConfigService,
  assertSecureLinkEnabled,
  assertShareLinksEnabled,
  isSecureLinkEnabled,
} from "./org-config-service.js";
import { createTestDb, type TestDb } from "../test-utils.js";
import { NotFoundError, ChannelDisabledError } from "../errors.js";
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

  // -----------------------------------------------------------------------
  // Channel policy
  // -----------------------------------------------------------------------

  describe("channel policy", () => {
    let testDb: TestDb;
    let db: Kysely<TenantDatabase>;

    beforeAll(async () => {
      testDb = await createTestDb();
      db = testDb.db;
      await db
        .insertInto("org_config")
        // care-y-ignore-next-line ast-pii-in-db-write -- plaintext branding column (ADR-094)
        .values({ name: "Policy Test Org" })
        .execute();
    }, 30_000);

    afterAll(async () => {
      // Restore defaults before cleanup
      await db
        .updateTable("org_config")
        .set({
          channel_sms_enabled: true,
          channel_email_enabled: true,
          channel_secure_link_enabled: true,
          channel_voice_enabled: true,
          channel_share_link_enabled: true,
        })
        .execute();
      await testDb.cleanup();
    });

    it("defaults all channels to true on a fresh org", async () => {
      const svc = createOrgConfigService(db);
      const policy = await svc.getChannelPolicy();

      expect(policy).toEqual({
        smsEnabled: true,
        emailEnabled: true,
        secureLinkEnabled: true,
        voiceEnabled: true,
        shareLinkEnabled: true,
      });
    });

    it("partial update flips only named flags", async () => {
      const svc = createOrgConfigService(db);
      await svc.updateChannelPolicy({
        smsEnabled: false,
        voiceEnabled: false,
      });

      const policy = await svc.getChannelPolicy();
      expect(policy.smsEnabled).toBe(false);
      expect(policy.voiceEnabled).toBe(false);
      expect(policy.emailEnabled).toBe(true);
      expect(policy.secureLinkEnabled).toBe(true);
      expect(policy.shareLinkEnabled).toBe(true);

      // Restore
      await svc.updateChannelPolicy({
        smsEnabled: true,
        voiceEnabled: true,
      });
    });

    it("no-op update (empty input) does not throw", async () => {
      const svc = createOrgConfigService(db);
      await expect(svc.updateChannelPolicy({})).resolves.toBeUndefined();
    });

    it("read-back after full disable then re-enable", async () => {
      const svc = createOrgConfigService(db);
      await svc.updateChannelPolicy({
        smsEnabled: false,
        emailEnabled: false,
        secureLinkEnabled: false,
        voiceEnabled: false,
        shareLinkEnabled: false,
      });

      const off = await svc.getChannelPolicy();
      expect(Object.values(off).every((v) => !v)).toBe(true);

      await svc.updateChannelPolicy({
        smsEnabled: true,
        emailEnabled: true,
        secureLinkEnabled: true,
        voiceEnabled: true,
        shareLinkEnabled: true,
      });

      const on = await svc.getChannelPolicy();
      expect(Object.values(on).every((v) => v)).toBe(true);
    });

    describe("assertSecureLinkEnabled", () => {
      it("does not throw when enabled", async () => {
        await expect(assertSecureLinkEnabled(db)).resolves.toBeUndefined();
      });

      it("throws ChannelDisabledError when disabled", async () => {
        await db
          .updateTable("org_config")
          .set({ channel_secure_link_enabled: false })
          .execute();

        await expect(assertSecureLinkEnabled(db)).rejects.toThrow(
          ChannelDisabledError,
        );

        await db
          .updateTable("org_config")
          .set({ channel_secure_link_enabled: true })
          .execute();
      });
    });

    describe("assertShareLinksEnabled", () => {
      it("does not throw when enabled", async () => {
        await expect(assertShareLinksEnabled(db)).resolves.toBeUndefined();
      });

      it("throws ChannelDisabledError when disabled", async () => {
        await db
          .updateTable("org_config")
          .set({ channel_share_link_enabled: false })
          .execute();

        await expect(assertShareLinksEnabled(db)).rejects.toThrow(
          ChannelDisabledError,
        );

        await db
          .updateTable("org_config")
          .set({ channel_share_link_enabled: true })
          .execute();
      });
    });

    describe("isSecureLinkEnabled", () => {
      it("returns true when enabled", async () => {
        await expect(isSecureLinkEnabled(db)).resolves.toBe(true);
      });

      it("returns false when disabled", async () => {
        await db
          .updateTable("org_config")
          .set({ channel_secure_link_enabled: false })
          .execute();

        await expect(isSecureLinkEnabled(db)).resolves.toBe(false);

        await db
          .updateTable("org_config")
          .set({ channel_secure_link_enabled: true })
          .execute();
      });
    });
  });
});
