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

    // Restore for subsequent tests (though this is the last test).
    await testDb.db
      .updateTable("users")
      .set({ is_active: true })
      .where("is_active", "=", false)
      .execute();
  });
});
