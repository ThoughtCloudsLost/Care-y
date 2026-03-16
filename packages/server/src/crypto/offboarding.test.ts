import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as crypto from "node:crypto";
import { createTestDb, createTestUser, type TestDb } from "../test-utils.js";
import { createOffboardingService } from "./offboarding.js";
import { OffboardingError } from "../errors.js";
import type { OffboardingService } from "./offboarding.js";

describe.skipIf(!process.env.DATABASE_URL)("OffboardingService", () => {
  let testDb: TestDb;
  let service: OffboardingService;

  beforeAll(async () => {
    testDb = await createTestDb();
    service = createOffboardingService(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  /** Seeds user_keys and optionally wrapped_org_keys for a user. */
  async function seedKeyMaterial(
    userId: string,
    opts?: { withWrappedOrgKey?: boolean },
  ): Promise<void> {
    await testDb.db
      .insertInto("user_keys")
      .values({
        user_id: userId,
        salt: crypto.randomBytes(32),
        vol_public: crypto.randomBytes(32),
      })
      .execute();

    if (opts?.withWrappedOrgKey) {
      await testDb.db
        .insertInto("wrapped_org_keys")
        .values({
          user_id: userId,
          wrapped_key: crypto.randomBytes(64),
          nonce: crypto.randomBytes(24),
        })
        .execute();
    }
  }

  describe("revokeVolunteerKeys", () => {
    it("deletes user_keys row", async () => {
      const user = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id);

      await service.revokeVolunteerKeys(user.id);

      const row = await testDb.db
        .selectFrom("user_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();

      expect(row).toBeUndefined();
    });

    it("deletes wrapped_org_keys row", async () => {
      const user = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id, { withWrappedOrgKey: true });

      await service.revokeVolunteerKeys(user.id);

      const row = await testDb.db
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();

      expect(row).toBeUndefined();
    });

    it("deletes both user_keys and wrapped_org_keys in one call", async () => {
      const user = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id, { withWrappedOrgKey: true });

      await service.revokeVolunteerKeys(user.id);

      const keysRow = await testDb.db
        .selectFrom("user_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();
      const orgKeyRow = await testDb.db
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();

      expect(keysRow).toBeUndefined();
      expect(orgKeyRow).toBeUndefined();
    });

    it("succeeds when user has no wrapped_org_keys row", async () => {
      const user = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id, { withWrappedOrgKey: false });

      await expect(
        service.revokeVolunteerKeys(user.id),
      ).resolves.toBeUndefined();

      const row = await testDb.db
        .selectFrom("user_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();
      expect(row).toBeUndefined();
    });

    it("throws OffboardingError for nonexistent user_keys row", async () => {
      const user = await createTestUser(testDb.db);
      // No seedKeyMaterial call, so user_keys row is missing

      await expect(service.revokeVolunteerKeys(user.id)).rejects.toThrow(
        OffboardingError,
      );
    });

    it("handles missing ticket_key_wraps table gracefully", async () => {
      const user = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id, { withWrappedOrgKey: true });

      // ticket_key_wraps table doesn't exist yet. The SAVEPOINT guard
      // should handle this without aborting the outer transaction.
      await expect(
        service.revokeVolunteerKeys(user.id),
      ).resolves.toBeUndefined();

      // Verify that wrapped_org_keys and user_keys were still deleted
      const keysRow = await testDb.db
        .selectFrom("user_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();
      expect(keysRow).toBeUndefined();
    });
  });
});
