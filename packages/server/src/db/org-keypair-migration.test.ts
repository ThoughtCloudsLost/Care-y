import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb, createTestUser, type TestDb } from "../test-utils.js";

describe.skipIf(!process.env.DATABASE_URL)(
  "013_create_org_keypair migration",
  () => {
    let testDb: TestDb;

    beforeAll(async () => {
      testDb = await createTestDb();
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("org_config accepts null org_public_key", async () => {
      // org_config is a singleton seeded by org creation. Update the existing row.
      const rows = await testDb.db
        .selectFrom("org_config")
        .select("id")
        .execute();

      if (rows.length === 0) {
        // Seed a row if none exists (test schema may not have one)
        await testDb.db
          .insertInto("org_config")
          .values({ org_public_key: null })
          .execute();
      }

      const row = await testDb.db
        .selectFrom("org_config")
        .select("org_public_key")
        .executeTakeFirstOrThrow();

      expect(row.org_public_key).toBeNull();
    });

    it("org_config accepts 32-byte org_public_key", async () => {
      const pk = Buffer.alloc(32, 0xbb);

      await testDb.db
        .updateTable("org_config")
        .set({ org_public_key: pk })
        .execute();

      const row = await testDb.db
        .selectFrom("org_config")
        .select("org_public_key")
        .executeTakeFirstOrThrow();

      expect(Buffer.isBuffer(row.org_public_key)).toBe(true);
      expect(row.org_public_key).toHaveLength(32);
    });

    it("wrapped_org_keys accepts insert with valid user_id FK", async () => {
      const user = await createTestUser(testDb.db);

      const row = await testDb.db
        .insertInto("wrapped_org_keys")
        .values({
          user_id: user.id,
          ephemeral_point: Buffer.alloc(32, 0xaa), // ristretto255 ephemeral
          wrapped_key: Buffer.alloc(56, 0xcc), // ECIES-wrapped org key
          nonce: Buffer.alloc(24, 0xdd),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.user_id).toBe(user.id);
      expect(row.key_version).toBe(1);
    });

    it("wrapped_org_keys cascades delete from users", async () => {
      const user = await createTestUser(testDb.db);

      await testDb.db
        .insertInto("wrapped_org_keys")
        .values({
          user_id: user.id,
          ephemeral_point: Buffer.alloc(32, 0xaa),
          wrapped_key: Buffer.alloc(56, 0xee),
          nonce: Buffer.alloc(24, 0xff),
        })
        .execute();

      await testDb.db.deleteFrom("users").where("id", "=", user.id).execute();

      const remaining = await testDb.db
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .execute();

      expect(remaining).toHaveLength(0);
    });

    it("wrapped_org_keys enforces primary key uniqueness on user_id", async () => {
      const user = await createTestUser(testDb.db);

      await testDb.db
        .insertInto("wrapped_org_keys")
        .values({
          user_id: user.id,
          ephemeral_point: Buffer.alloc(32, 0xaa),
          wrapped_key: Buffer.alloc(56, 0x11),
          nonce: Buffer.alloc(24, 0x22),
        })
        .execute();

      await expect(
        testDb.db
          .insertInto("wrapped_org_keys")
          .values({
            user_id: user.id,
            ephemeral_point: Buffer.alloc(32, 0xbb),
            wrapped_key: Buffer.alloc(56, 0x33),
            nonce: Buffer.alloc(24, 0x44),
          })
          .execute(),
      ).rejects.toThrow();
    });
  },
);
