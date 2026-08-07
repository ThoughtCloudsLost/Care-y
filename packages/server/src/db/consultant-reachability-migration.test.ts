import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { sql } from "kysely";
import { createTestDb, createTestUser, type TestDb } from "../test-utils.js";

describe.skipIf(!process.env.DATABASE_URL)(
  "087_consultant_reachability migration",
  () => {
    let testDb: TestDb;

    beforeAll(async () => {
      testDb = await createTestDb();
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("adds reachability columns with correct defaults", async () => {
      const user = await createTestUser(testDb.db);

      // Insert a consultant row without encrypted_phone (now nullable)
      // and without the dropped phone_hash column.
      const row = await testDb.db
        .insertInto("consultants")
        .values({
          user_id: user.id,
          preferred_call_method: "phone_callback",
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.encrypted_phone).toBeNull();
      expect(row.ops_phone_hash).toBeNull();
      expect(row.ops_encrypted_phone).toBeNull();
      expect(row.sms_pings_enabled).toBe(false);
      expect(row.verify_sends_hour_start).toBeNull();
      expect(row.verify_sends_in_hour).toBe(0);
      expect(row.verify_last_sent_at).toBeNull();
      expect(row.is_verified).toBe(false);
    });

    it("phone_hash column no longer exists", async () => {
      const result = await sql<{ exists: boolean }>`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = ${testDb.schemaName}
            AND table_name = 'consultants'
            AND column_name = 'phone_hash'
        ) AS exists
      `.execute(testDb.platformDb);

      expect(result.rows[0]?.exists).toBe(false);
    });

    it("ops_encrypted_phone accepts bytea data", async () => {
      const user = await createTestUser(testDb.db);

      const row = await testDb.db
        .insertInto("consultants")
        .values({
          user_id: user.id,
          encrypted_phone: Buffer.from("org-sealed-box"),
          ops_phone_hash: "hmac-hash-value",
          ops_encrypted_phone: Buffer.from("ops-encrypted-value"),
          sms_pings_enabled: true,
          preferred_call_method: "phone_callback",
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(Buffer.isBuffer(row.ops_encrypted_phone)).toBe(true);
      expect(row.ops_phone_hash).toBe("hmac-hash-value");
      expect(row.sms_pings_enabled).toBe(true);
    });

    it("encrypted_phone is nullable after migration", async () => {
      const result = await sql<{ is_nullable: string }>`
        SELECT is_nullable FROM information_schema.columns
        WHERE table_schema = ${testDb.schemaName}
          AND table_name = 'consultants'
          AND column_name = 'encrypted_phone'
      `.execute(testDb.platformDb);

      expect(result.rows[0]?.is_nullable).toBe("YES");
    });

    it("verify_sends_in_hour accepts integer updates", async () => {
      const user = await createTestUser(testDb.db);

      await testDb.db
        .insertInto("consultants")
        .values({
          user_id: user.id,
          preferred_call_method: "webrtc",
        })
        .execute();

      const updated = await testDb.db
        .updateTable("consultants")
        .set({
          verify_sends_in_hour: 3,
          verify_sends_hour_start: new Date(),
          verify_last_sent_at: new Date(),
        })
        .where("user_id", "=", user.id)
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(updated.verify_sends_in_hour).toBe(3);
      expect(updated.verify_sends_hour_start).toBeInstanceOf(Date);
      expect(updated.verify_last_sent_at).toBeInstanceOf(Date);
    });
  },
);
