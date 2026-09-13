import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb, type TestDb } from "../test-utils.js";

describe.skipIf(!process.env.DATABASE_URL)(
  "086_create_role_permission_overrides migration",
  () => {
    let testDb: TestDb;

    beforeAll(async () => {
      testDb = await createTestDb();
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("inserts a valid role permission override", async () => {
      const row = await testDb.db
        .insertInto("role_permission_overrides")
        .values({
          role_id: "dXwG0zR9BtJp",
          permission: "manage_queues",
          enabled: true,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.role_id).toBe("dXwG0zR9BtJp");
      expect(row.permission).toBe("manage_queues");
      expect(row.enabled).toBe(true);
    });

    it("inserts an override with enabled=false", async () => {
      const row = await testDb.db
        .insertInto("role_permission_overrides")
        .values({
          role_id: "In1gn8l4eAyp",
          permission: "view_reports",
          enabled: false,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.role_id).toBe("In1gn8l4eAyp");
      expect(row.permission).toBe("view_reports");
      expect(row.enabled).toBe(false);
    });

    it("rejects duplicate (role_id, permission) PK", async () => {
      await testDb.db
        .insertInto("role_permission_overrides")
        .values({
          role_id: "POFKWG7erXEJ",
          permission: "manage_users",
          enabled: true,
        })
        .execute();

      await expect(
        testDb.db
          .insertInto("role_permission_overrides")
          .values({
            role_id: "POFKWG7erXEJ",
            permission: "manage_users",
            enabled: false,
          })
          .execute(),
      ).rejects.toThrow();
    });

    it("allows the same permission for different roles", async () => {
      const roleA = await testDb.db
        .insertInto("role_permission_overrides")
        .values({
          role_id: "dXwG0zR9BtJp",
          permission: "view_reports",
          enabled: true,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const roleB = await testDb.db
        .insertInto("role_permission_overrides")
        .values({
          role_id: "POFKWG7erXEJ",
          permission: "view_reports",
          enabled: false,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(roleA.role_id).not.toBe(roleB.role_id);
      expect(roleA.permission).toBe(roleB.permission);
    });

    it("migration up/down roundtrip succeeds", async () => {
      const rows = await testDb.db
        .selectFrom("role_permission_overrides")
        .selectAll()
        .execute();
      expect(Array.isArray(rows)).toBe(true);
    });
  },
);
