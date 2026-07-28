import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as crypto from "node:crypto";
import { RoleId } from "@care-y/shared";
import {
  createTestDb,
  createTestTicketFixture,
  createTestUser,
  type TestDb,
} from "../test-utils.js";
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

  describe("listActiveKeyWrapHolderIds", () => {
    /** Inserts a key wrap row with opaque test bytes for the crypto columns. */
    async function insertKeyWrap(
      ticketId: string,
      volunteerId: string,
    ): Promise<void> {
      await testDb.db
        .insertInto("ticket_key_wraps")
        .values({
          ticket_id: ticketId,
          volunteer_id: volunteerId,
          key_generation: crypto.randomUUID(),
          ephemeral_point: Buffer.alloc(32, 1),
          nonce: Buffer.alloc(24, 2),
          wrapped_key: Buffer.alloc(48, 3),
          algorithm: "ecies-ristretto255-v1",
        })
        .execute();
    }

    it("returns active wrap holders and omits deactivated ones", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);
      const active = await createTestUser(testDb.db);
      const inactive = await createTestUser(testDb.db, {
        overrides: { is_active: false },
      });

      await insertKeyWrap(ticketId, active.id);
      await insertKeyWrap(ticketId, inactive.id);

      const svc = createUserService(testDb.db);
      const holders = await svc.listActiveKeyWrapHolderIds(ticketId);

      expect(holders).toContain(active.id);
      expect(holders).not.toContain(inactive.id);
    });

    it("returns one entry per holder when a ticket has several key generations", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);
      const user = await createTestUser(testDb.db);

      // Two wraps for the same volunteer, as a reopen/rewrap cycle produces.
      await insertKeyWrap(ticketId, user.id);
      await insertKeyWrap(ticketId, user.id);

      const svc = createUserService(testDb.db);
      const holders = await svc.listActiveKeyWrapHolderIds(ticketId);

      expect(holders.filter((id) => id === user.id)).toHaveLength(1);
    });

    it("returns an empty array for a ticket with no key wraps", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);

      const svc = createUserService(testDb.db);
      const holders = await svc.listActiveKeyWrapHolderIds(ticketId);

      expect(holders).toEqual([]);
    });
  });

  describe("filterByRoleThreshold", () => {
    it("keeps users at or above the threshold and drops the rest", async () => {
      const admin = await createTestUser(testDb.db, {
        overrides: { role_id: RoleId.ADMIN },
      });
      const manager = await createTestUser(testDb.db, {
        overrides: { role_id: RoleId.MANAGER },
      });
      const volunteer = await createTestUser(testDb.db, {
        overrides: { role_id: RoleId.VOLUNTEER },
      });

      const svc = createUserService(testDb.db);
      const kept = await svc.filterByRoleThreshold(
        [admin.id, manager.id, volunteer.id],
        RoleId.MANAGER,
      );

      expect([...kept].sort()).toEqual([admin.id, manager.id].sort());
    });

    it("keeps every role when the threshold is volunteer", async () => {
      const volunteer = await createTestUser(testDb.db, {
        overrides: { role_id: RoleId.VOLUNTEER },
      });

      const svc = createUserService(testDb.db);
      const kept = await svc.filterByRoleThreshold(
        [volunteer.id],
        RoleId.VOLUNTEER,
      );

      expect(kept).toEqual([volunteer.id]);
    });

    it("returns an empty array without querying when given no user IDs", async () => {
      const svc = createUserService(testDb.db);
      expect(await svc.filterByRoleThreshold([], RoleId.ADMIN)).toEqual([]);
    });

    it("drops IDs that match no user row", async () => {
      const svc = createUserService(testDb.db);
      const kept = await svc.filterByRoleThreshold(
        [crypto.randomUUID()],
        RoleId.VOLUNTEER,
      );

      expect(kept).toEqual([]);
    });

    it("filters on role regardless of active state", async () => {
      // Escalation targets are resolved to active users upstream; this method
      // only narrows by role, so an inactive admin still passes the threshold.
      const inactiveAdmin = await createTestUser(testDb.db, {
        overrides: { role_id: RoleId.ADMIN, is_active: false },
      });

      const svc = createUserService(testDb.db);
      const kept = await svc.filterByRoleThreshold(
        [inactiveAdmin.id],
        RoleId.ADMIN,
      );

      expect(kept).toEqual([inactiveAdmin.id]);
    });
  });
});
