import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import * as crypto from "node:crypto";
import { createTestDb, createTestUser, type TestDb } from "../test-utils.js";
import { createOrgKeyRotationService } from "./org-key-rotation.js";
import type { OrgKeyRotationService } from "./org-key-rotation.js";

describe.skipIf(!process.env.DATABASE_URL)("OrgKeyRotationService", () => {
  let testDb: TestDb;
  let service: OrgKeyRotationService;

  beforeAll(async () => {
    testDb = await createTestDb();
    service = createOrgKeyRotationService(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  /** org_config must exist for UPDATE to affect a row. */
  beforeEach(async () => {
    // Clean up from previous test
    await testDb.db.deleteFrom("wrapped_org_keys").execute();
    await testDb.db.deleteFrom("org_config").execute();

    // Seed org_config with an initial public key
    await testDb.db
      .insertInto("org_config")
      .values({ org_public_key: crypto.randomBytes(32) })
      .execute();
  });

  describe("rotateOrgKey", () => {
    it("updates org_public_key to the new value", async () => {
      const newPubKey = crypto.randomBytes(32);

      await service.rotateOrgKey({
        newOrgPublicKey: newPubKey,
        wrappedKeys: [],
      });

      const row = await testDb.db
        .selectFrom("org_config")
        .select("org_public_key")
        .executeTakeFirstOrThrow();

      expect(Buffer.compare(row.org_public_key as Buffer, newPubKey)).toBe(0);
    });

    it("deletes all old wrapped_org_keys", async () => {
      const userA = await createTestUser(testDb.db);
      const userB = await createTestUser(testDb.db);

      // Seed old wrapped keys for two volunteers
      for (const user of [userA, userB]) {
        await testDb.db
          .insertInto("wrapped_org_keys")
          .values({
            user_id: user.id,
            wrapped_key: crypto.randomBytes(64),
            nonce: crypto.randomBytes(24),
          })
          .execute();
      }

      await service.rotateOrgKey({
        newOrgPublicKey: crypto.randomBytes(32),
        wrappedKeys: [],
      });

      const rows = await testDb.db
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .execute();

      expect(rows).toHaveLength(0);
    });

    it("inserts new wrapped copies for remaining volunteers", async () => {
      const userA = await createTestUser(testDb.db);
      const userB = await createTestUser(testDb.db);

      const wrapA = {
        userId: userA.id,
        wrappedKey: crypto.randomBytes(64),
        nonce: crypto.randomBytes(24),
      };
      const wrapB = {
        userId: userB.id,
        wrappedKey: crypto.randomBytes(64),
        nonce: crypto.randomBytes(24),
      };

      await service.rotateOrgKey({
        newOrgPublicKey: crypto.randomBytes(32),
        wrappedKeys: [wrapA, wrapB],
      });

      const rows = await testDb.db
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .execute();

      expect(rows).toHaveLength(2);

      const rowA = rows.find((r) => r.user_id === userA.id);
      const rowB = rows.find((r) => r.user_id === userB.id);
      expect(rowA).toBeDefined();
      expect(rowB).toBeDefined();
      expect(Buffer.compare(rowA!.wrapped_key, wrapA.wrappedKey)).toBe(0);
      expect(Buffer.compare(rowB!.wrapped_key, wrapB.wrappedKey)).toBe(0);
    });

    it("succeeds with empty wrappedKeys (no volunteers left)", async () => {
      await expect(
        service.rotateOrgKey({
          newOrgPublicKey: crypto.randomBytes(32),
          wrappedKeys: [],
        }),
      ).resolves.toBeUndefined();
    });

    it("is atomic (old wraps deleted and new wraps inserted together)", async () => {
      const user = await createTestUser(testDb.db);

      // Seed an old wrap
      await testDb.db
        .insertInto("wrapped_org_keys")
        .values({
          user_id: user.id,
          wrapped_key: crypto.randomBytes(64),
          nonce: crypto.randomBytes(24),
        })
        .execute();

      const newWrap = {
        userId: user.id,
        wrappedKey: crypto.randomBytes(64),
        nonce: crypto.randomBytes(24),
      };

      await service.rotateOrgKey({
        newOrgPublicKey: crypto.randomBytes(32),
        wrappedKeys: [newWrap],
      });

      // Should have exactly 1 row (old deleted, new inserted)
      const rows = await testDb.db
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .execute();

      expect(rows).toHaveLength(1);
      expect(Buffer.compare(rows[0]!.wrapped_key, newWrap.wrappedKey)).toBe(0);
    });
  });
});
