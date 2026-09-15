import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import * as crypto from "node:crypto";
import { createTestDb, createTestUser, type TestDb } from "../test-utils.js";
import { createOrgKeyRotationService } from "./org-key-rotation.js";
import type { OrgKeyRotationService } from "./org-key-rotation.js";
import { ConflictError } from "../errors.js";

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
    await testDb.db.deleteFrom("org_key_generations").execute();
    await testDb.db.deleteFrom("org_config").execute();

    // Seed org_config with an initial public key and generation 1
    await testDb.db
      .insertInto("org_config")
      .values({
        org_public_key: crypto.randomBytes(32),
        current_key_generation: 1,
      })
      .execute();
  });

  /** Build a rotation input with all required fields. */
  function makeRotationInput(
    overrides: Partial<{
      newOrgPublicKey: Buffer;
      newGeneration: number;
      chainedFrom: Parameters<typeof service.rotateOrgKey>[0]["chainedFrom"];
      wrappedKeys: Parameters<typeof service.rotateOrgKey>[0]["wrappedKeys"];
    }> = {},
  ): Parameters<typeof service.rotateOrgKey>[0] {
    return {
      newOrgPublicKey: overrides.newOrgPublicKey ?? crypto.randomBytes(32),
      newGeneration: overrides.newGeneration ?? 2,
      chainedFrom:
        overrides.chainedFrom === undefined
          ? {
              prevSecretCt: crypto.randomBytes(48),
              prevNonce: crypto.randomBytes(24),
            }
          : overrides.chainedFrom,
      wrappedKeys: overrides.wrappedKeys ?? [],
    };
  }

  describe("rotateOrgKey", () => {
    it("updates org_public_key to the new value", async () => {
      const newPubKey = crypto.randomBytes(32);

      await service.rotateOrgKey(
        makeRotationInput({ newOrgPublicKey: newPubKey }),
      );

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
            ephemeral_point: crypto.randomBytes(32),
            wrapped_key: crypto.randomBytes(64),
            nonce: crypto.randomBytes(24),
          })
          .execute();
      }

      await service.rotateOrgKey(makeRotationInput());

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
        ephemeralPoint: crypto.randomBytes(32),
        wrappedKey: crypto.randomBytes(64),
        nonce: crypto.randomBytes(24),
      };
      const wrapB = {
        userId: userB.id,
        ephemeralPoint: crypto.randomBytes(32),
        wrappedKey: crypto.randomBytes(64),
        nonce: crypto.randomBytes(24),
      };

      await service.rotateOrgKey(
        makeRotationInput({ wrappedKeys: [wrapA, wrapB] }),
      );

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
        service.rotateOrgKey(makeRotationInput({ wrappedKeys: [] })),
      ).resolves.toBeUndefined();
    });

    it("is atomic (old wraps deleted and new wraps inserted together)", async () => {
      const user = await createTestUser(testDb.db);

      // Seed an old wrap
      await testDb.db
        .insertInto("wrapped_org_keys")
        .values({
          user_id: user.id,
          ephemeral_point: crypto.randomBytes(32),
          wrapped_key: crypto.randomBytes(64),
          nonce: crypto.randomBytes(24),
        })
        .execute();

      const newWrap = {
        userId: user.id,
        ephemeralPoint: crypto.randomBytes(32),
        wrappedKey: crypto.randomBytes(64),
        nonce: crypto.randomBytes(24),
      };

      await service.rotateOrgKey(makeRotationInput({ wrappedKeys: [newWrap] }));

      // Should have exactly 1 row (old deleted, new inserted)
      const rows = await testDb.db
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .execute();

      expect(rows).toHaveLength(1);
      expect(Buffer.compare(rows[0]!.wrapped_key, newWrap.wrappedKey)).toBe(0);
    });

    it("inserts the generation row with exact input bytes", async () => {
      const pubKey = crypto.randomBytes(32);
      const prevCt = crypto.randomBytes(48);
      const prevNonce = crypto.randomBytes(24);

      await service.rotateOrgKey(
        makeRotationInput({
          newOrgPublicKey: pubKey,
          newGeneration: 2,
          chainedFrom: { prevSecretCt: prevCt, prevNonce },
        }),
      );

      const genRows = await testDb.db
        .selectFrom("org_key_generations")
        .selectAll()
        .execute();

      expect(genRows).toHaveLength(1);
      const row = genRows[0]!;
      expect(row.generation).toBe(2);
      expect(Buffer.compare(row.public_key, pubKey)).toBe(0);
      expect(Buffer.compare(row.prev_secret_ct!, prevCt)).toBe(0);
      expect(Buffer.compare(row.prev_nonce!, prevNonce)).toBe(0);
    });

    it("stores a null chain entry when the caller declares no predecessor", async () => {
      await service.rotateOrgKey(makeRotationInput({ chainedFrom: null }));

      const genRows = await testDb.db
        .selectFrom("org_key_generations")
        .selectAll()
        .execute();

      expect(genRows).toHaveLength(1);
      expect(genRows[0]!.prev_secret_ct).toBeNull();
      expect(genRows[0]!.prev_nonce).toBeNull();
    });

    it("bumps current_key_generation in org_config", async () => {
      await service.rotateOrgKey(makeRotationInput({ newGeneration: 2 }));

      const config = await testDb.db
        .selectFrom("org_config")
        .select("current_key_generation")
        .executeTakeFirstOrThrow();

      expect(config.current_key_generation).toBe(2);
    });

    it("throws ConflictError when newGeneration is not current + 1", async () => {
      // current_key_generation is 1, so only 2 is valid
      await expect(
        service.rotateOrgKey(makeRotationInput({ newGeneration: 3 })),
      ).rejects.toThrow(ConflictError);

      await expect(
        service.rotateOrgKey(makeRotationInput({ newGeneration: 1 })),
      ).rejects.toThrow(ConflictError);
    });

    it("performs no writes when generation conflict is detected", async () => {
      const originalConfig = await testDb.db
        .selectFrom("org_config")
        .select(["org_public_key", "current_key_generation"])
        .executeTakeFirstOrThrow();

      try {
        await service.rotateOrgKey(makeRotationInput({ newGeneration: 5 }));
      } catch {
        // expected
      }

      // org_config unchanged
      const config = await testDb.db
        .selectFrom("org_config")
        .select(["org_public_key", "current_key_generation"])
        .executeTakeFirstOrThrow();
      expect(config.current_key_generation).toBe(
        originalConfig.current_key_generation,
      );
      expect(
        Buffer.compare(
          config.org_public_key as Buffer,
          originalConfig.org_public_key as Buffer,
        ),
      ).toBe(0);

      // No generation rows inserted
      const genRows = await testDb.db
        .selectFrom("org_key_generations")
        .selectAll()
        .execute();
      expect(genRows).toHaveLength(0);

      // No wrapped keys inserted
      const wrapRows = await testDb.db
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .execute();
      expect(wrapRows).toHaveLength(0);
    });
  });
});
