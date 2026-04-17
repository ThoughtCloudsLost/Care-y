import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb, createTestUser, type TestDb } from "../test-utils.js";
import { createUserService } from "./user-service.js";

describe.skipIf(!process.env.DATABASE_URL)("UserService (DB)", () => {
  let testDb: TestDb;

  beforeAll(async () => {
    testDb = await createTestDb();

    // Seed three users: two active, one inactive.
    await createTestUser(testDb.db);
    await createTestUser(testDb.db);
    await createTestUser(testDb.db, {
      overrides: { is_active: false },
    });
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("returns only active volunteers", async () => {
    const svc = createUserService(testDb.db);
    const result = await svc.listActiveVolunteers();
    expect(result.length).toBe(2);
  });

  it("returns id and encryptedDisplayName as Buffer for each volunteer", async () => {
    const svc = createUserService(testDb.db);
    const result = await svc.listActiveVolunteers();

    for (const vol of result) {
      expect(typeof vol.id).toBe("string");
      expect(Buffer.isBuffer(vol.encryptedDisplayName)).toBe(true);
      expect(vol.encryptedDisplayName.byteLength).toBeGreaterThan(0);
    }
  });

  it("returns empty array when no active users exist", async () => {
    // Deactivate all users, query, then reactivate.
    await testDb.db.updateTable("users").set({ is_active: false }).execute();

    const svc = createUserService(testDb.db);
    const result = await svc.listActiveVolunteers();
    expect(result.length).toBe(0);

    // Restore for subsequent tests.
    await testDb.db
      .updateTable("users")
      .set({ is_active: true })
      .where("is_active", "=", false)
      .execute();
  });

  describe("listAllForAdmin", () => {
    it("returns all users including inactive", async () => {
      const inactiveUser = await createTestUser(testDb.db, {
        overrides: { is_active: false },
      });

      const svc = createUserService(testDb.db);
      const result = await svc.listAllForAdmin();
      const inactive = result.filter((u) => !u.isActive);
      expect(inactive.length).toBeGreaterThanOrEqual(1);
      expect(inactive.some((u) => u.id === inactiveUser.id)).toBe(true);
    });

    it("returns expected fields for each user", async () => {
      const svc = createUserService(testDb.db);
      const result = await svc.listAllForAdmin();
      expect(result.length).toBeGreaterThan(0);
      for (const user of result) {
        expect(typeof user.id).toBe("string");
        expect(Buffer.isBuffer(user.encryptedDisplayName)).toBe(true);
        expect(typeof user.roleId).toBe("string");
        expect(typeof user.isActive).toBe("boolean");
        expect(typeof user.hasKeys).toBe("boolean");
        expect(typeof user.hasOrgKeyWrap).toBe("boolean");
      }
    });

    it("reports hasKeys=false for users without user_keys rows", async () => {
      const svc = createUserService(testDb.db);
      const result = await svc.listAllForAdmin();
      for (const user of result) {
        expect(user.hasKeys).toBe(false);
      }
    });

    it("reports hasOrgKeyWrap=false for users without wrapped_org_keys rows", async () => {
      const svc = createUserService(testDb.db);
      const result = await svc.listAllForAdmin();
      for (const user of result) {
        expect(user.hasOrgKeyWrap).toBe(false);
      }
    });
  });
});
