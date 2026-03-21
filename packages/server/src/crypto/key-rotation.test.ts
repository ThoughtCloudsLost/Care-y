import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as crypto from "node:crypto";
import { createTestDb, createTestUser, type TestDb } from "../test-utils.js";
import { createKeyRotationService } from "./key-rotation.js";
import { KeyRotationError } from "../errors.js";
import type { KeyRotationService } from "./key-rotation.js";

describe.skipIf(!process.env.DATABASE_URL)("KeyRotationService", () => {
  let testDb: TestDb;
  let service: KeyRotationService;

  beforeAll(async () => {
    testDb = await createTestDb();
    service = createKeyRotationService(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  /** Inserts a user_keys row for the given user with a random salt. */
  async function seedUserKeys(
    userId: string,
    overrides?: { vol_public?: Buffer | null; rotation_lock?: boolean },
  ): Promise<void> {
    const salt = crypto.randomBytes(32);
    await testDb.db
      .insertInto("user_keys")
      .values({
        user_id: userId,
        salt,
        vol_public: overrides?.vol_public ?? null,
        rotation_lock: overrides?.rotation_lock ?? false,
      })
      .execute();
  }

  describe("storeVolPublic", () => {
    it("stores vol_public for a user with null vol_public", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id);
      const volPublic = crypto.randomBytes(32);

      await service.storeVolPublic(user.id, volPublic);

      const row = await testDb.db
        .selectFrom("user_keys")
        .select("vol_public")
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(row.vol_public).not.toBeNull();
      expect(Buffer.compare(row.vol_public as Buffer, volPublic)).toBe(0);
    });

    it("overwrites existing vol_public", async () => {
      const user = await createTestUser(testDb.db);
      const oldPub = crypto.randomBytes(32);
      await seedUserKeys(user.id, { vol_public: oldPub });

      const newPub = crypto.randomBytes(32);
      await service.storeVolPublic(user.id, newPub);

      const row = await testDb.db
        .selectFrom("user_keys")
        .select("vol_public")
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(Buffer.compare(row.vol_public as Buffer, newPub)).toBe(0);
    });
  });

  describe("getRotationStatus", () => {
    it("returns inProgress: false when rotation_lock is false", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id);

      const status = await service.getRotationStatus(user.id);
      expect(status.inProgress).toBe(false);
    });

    it("returns inProgress: true when rotation_lock is true", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { rotation_lock: true });

      const status = await service.getRotationStatus(user.id);
      expect(status.inProgress).toBe(true);
    });

    it("returns inProgress: false for nonexistent user", async () => {
      const status = await service.getRotationStatus(
        "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      );
      expect(status.inProgress).toBe(false);
    });
  });

  describe("acquireLock", () => {
    it("sets rotation_lock to true", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id);

      await service.acquireLock(user.id);

      const row = await testDb.db
        .selectFrom("user_keys")
        .select("rotation_lock")
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(row.rotation_lock).toBe(true);
    });

    it("throws KeyRotationError when lock is already held", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id);

      await service.acquireLock(user.id);
      await expect(service.acquireLock(user.id)).rejects.toThrow(
        KeyRotationError,
      );
    });

    it("throws KeyRotationError for nonexistent user (0 rows updated)", async () => {
      await expect(
        service.acquireLock("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
      ).rejects.toThrow(KeyRotationError);
    });
  });

  describe("releaseLock", () => {
    it("clears rotation_lock after it was acquired", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id);
      await service.acquireLock(user.id);

      await service.releaseLock(user.id);

      const row = await testDb.db
        .selectFrom("user_keys")
        .select("rotation_lock")
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(row.rotation_lock).toBe(false);
    });

    it("allows acquireLock to succeed after release", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id);
      await service.acquireLock(user.id);
      await service.releaseLock(user.id);

      // Should not throw
      await service.acquireLock(user.id);

      const row = await testDb.db
        .selectFrom("user_keys")
        .select("rotation_lock")
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(row.rotation_lock).toBe(true);
    });

    it("is idempotent (no error for already-unlocked user)", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id);

      // Lock is already false, release should not throw
      await expect(service.releaseLock(user.id)).resolves.toBeUndefined();
    });
  });

  describe("applyRotation", () => {
    it("updates salt, vol_public, bumps key_version, sets rotated_at, and clears lock", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });
      await service.acquireLock(user.id);

      const saltNew = crypto.randomBytes(32);
      const volPublicNew = crypto.randomBytes(32);

      await service.applyRotation({
        userId: user.id,
        saltNew,
        volPublicNew,
        reWrappedKeys: [],
      });

      const row = await testDb.db
        .selectFrom("user_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(Buffer.compare(row.salt, saltNew)).toBe(0);
      expect(Buffer.compare(row.vol_public as Buffer, volPublicNew)).toBe(0);
      expect(row.key_version).toBe(2);
      expect(row.rotated_at).toBeInstanceOf(Date);
      expect(row.rotation_lock).toBe(false);
    });

    it("increments key_version on each rotation", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });

      // First rotation
      await service.acquireLock(user.id);
      await service.applyRotation({
        userId: user.id,
        saltNew: crypto.randomBytes(32),
        volPublicNew: crypto.randomBytes(32),
        reWrappedKeys: [],
      });

      // Second rotation
      await service.acquireLock(user.id);
      await service.applyRotation({
        userId: user.id,
        saltNew: crypto.randomBytes(32),
        volPublicNew: crypto.randomBytes(32),
        reWrappedKeys: [],
      });

      const row = await testDb.db
        .selectFrom("user_keys")
        .select("key_version")
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(row.key_version).toBe(3);
    });

    it("succeeds with empty reWrappedKeys (no ticket_key_wraps table yet)", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });
      await service.acquireLock(user.id);

      // No ticket_key_wraps table exists yet, and reWrappedKeys is empty.
      // This should complete without error.
      await expect(
        service.applyRotation({
          userId: user.id,
          saltNew: crypto.randomBytes(32),
          volPublicNew: crypto.randomBytes(32),
          reWrappedKeys: [],
        }),
      ).resolves.toBeUndefined();
    });

    it("handles reWrappedKeys with stale ticket references gracefully", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });
      await service.acquireLock(user.id);

      // Attempt to insert re-wrapped keys referencing a non-existent ticket.
      // The FK violation is caught by the savepoint guard, and user_keys
      // are still updated in the outer transaction.
      await expect(
        service.applyRotation({
          userId: user.id,
          saltNew: crypto.randomBytes(32),
          volPublicNew: crypto.randomBytes(32),
          reWrappedKeys: [
            {
              ticketId: crypto.randomUUID(),
              keyGeneration: crypto.randomUUID(),
              ephemeralPoint: crypto.randomBytes(32),
              nonce: crypto.randomBytes(24),
              wrappedKey: crypto.randomBytes(64),
            },
          ],
        }),
      ).resolves.toBeUndefined();

      // Verify user_keys were still updated despite the FK violation
      const row = await testDb.db
        .selectFrom("user_keys")
        .select(["key_version", "rotation_lock"])
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(row.key_version).toBe(2);
      expect(row.rotation_lock).toBe(false);
    });

    it("releases the lock inside the transaction (lock is false after applyRotation)", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });
      await service.acquireLock(user.id);

      await service.applyRotation({
        userId: user.id,
        saltNew: crypto.randomBytes(32),
        volPublicNew: crypto.randomBytes(32),
        reWrappedKeys: [],
      });

      // Lock should be false without needing a separate releaseLock call
      const status = await service.getRotationStatus(user.id);
      expect(status.inProgress).toBe(false);

      // And acquireLock should succeed again (proves lock was fully released)
      await expect(service.acquireLock(user.id)).resolves.toBeUndefined();
    });
  });
});
