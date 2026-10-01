import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestDb } from "../test-utils.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "./types.js";

const COLUMNS = [
  "channel_sms_enabled",
  "channel_email_enabled",
  "channel_secure_link_enabled",
  "channel_voice_enabled",
  "channel_share_link_enabled",
] as const;

describe.skipIf(!process.env.DATABASE_URL)(
  "org_config channel policy columns",
  () => {
    let db: Kysely<TenantDatabase>;
    let cleanup: () => Promise<void>;

    beforeAll(async () => {
      const t = await createTestDb();
      db = t.db;
      cleanup = t.cleanup;
    }, 30_000);

    afterAll(async () => {
      await cleanup();
    });

    it("columns exist and default to true", async () => {
      // Seed an org_config row if one does not exist
      await db
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();

      const row = await db
        .selectFrom("org_config")
        .select([...COLUMNS])
        .executeTakeFirstOrThrow();

      for (const col of COLUMNS) {
        expect(row[col], `${col} should default to true`).toBe(true);
      }
    });

    it("columns can be set to false and read back", async () => {
      await db
        .updateTable("org_config")
        .set({ channel_sms_enabled: false, channel_voice_enabled: false })
        .execute();

      const row = await db
        .selectFrom("org_config")
        .select(["channel_sms_enabled", "channel_voice_enabled"])
        .executeTakeFirstOrThrow();

      expect(row.channel_sms_enabled).toBe(false);
      expect(row.channel_voice_enabled).toBe(false);

      // Restore for subsequent tests
      await db
        .updateTable("org_config")
        .set({ channel_sms_enabled: true, channel_voice_enabled: true })
        .execute();
    });
  },
);
