import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb, createTestUser, type TestDb } from "../test-utils.js";

describe.skipIf(!process.env.DATABASE_URL)(
  "012_extend_user_keys migration",
  () => {
    let testDb: TestDb;

    beforeAll(async () => {
      testDb = await createTestDb();
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("accepts insert with vol_public as null", async () => {
      const user = await createTestUser(testDb.db);
      const salt = Buffer.from("0123456789abcdef", "hex");

      const row = await testDb.db
        .insertInto("user_keys")
        .values({
          user_id: user.id,
          salt,
          vol_public: null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.vol_public).toBeNull();
    });

    it("accepts insert with 32-byte vol_public", async () => {
      const user = await createTestUser(testDb.db);
      const salt = Buffer.from("0123456789abcdef", "hex");
      const volPublic = Buffer.alloc(32, 0xaa);

      const row = await testDb.db
        .insertInto("user_keys")
        .values({
          user_id: user.id,
          salt,
          vol_public: volPublic,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(Buffer.isBuffer(row.vol_public)).toBe(true);
      expect(row.vol_public).toHaveLength(32);
    });

    it("defaults rotation_lock to false", async () => {
      const user = await createTestUser(testDb.db);
      const salt = Buffer.from("abcdef0123456789", "hex");

      const row = await testDb.db
        .insertInto("user_keys")
        .values({ user_id: user.id, salt })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.rotation_lock).toBe(false);
    });

    it("defaults key_version to 1", async () => {
      const user = await createTestUser(testDb.db);
      const salt = Buffer.from("1111111111111111", "hex");

      const row = await testDb.db
        .insertInto("user_keys")
        .values({ user_id: user.id, salt })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.key_version).toBe(1);
    });

    it("pq_public is nullable", async () => {
      const user = await createTestUser(testDb.db);
      const salt = Buffer.from("2222222222222222", "hex");

      const row = await testDb.db
        .insertInto("user_keys")
        .values({ user_id: user.id, salt, pq_public: null })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.pq_public).toBeNull();
    });

    it("rotated_at is nullable and defaults to null", async () => {
      const user = await createTestUser(testDb.db);
      const salt = Buffer.from("3333333333333333", "hex");

      const row = await testDb.db
        .insertInto("user_keys")
        .values({ user_id: user.id, salt })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.rotated_at).toBeNull();
    });

    it("cascades delete from users to user_keys", async () => {
      const user = await createTestUser(testDb.db);
      const salt = Buffer.from("4444444444444444", "hex");

      await testDb.db
        .insertInto("user_keys")
        .values({ user_id: user.id, salt })
        .execute();

      await testDb.db.deleteFrom("users").where("id", "=", user.id).execute();

      const remaining = await testDb.db
        .selectFrom("user_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .execute();

      expect(remaining).toHaveLength(0);
    });
  },
);
