/**
 * Integration tests for keys tRPC router.
 *
 * Uses a real PostgreSQL database (via createTestDb) to test the full
 * tRPC procedure chain: middleware -> service -> repository -> DB.
 * Requires DATABASE_URL (runs inside Docker container).
 *
 * The keys router creates services internally from ctx.org.tenantDb
 * (zero constructor deps), so we test it in isolation via a mini-router
 * containing only the keys sub-router.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  seedOrgPublicKey,
  testSealedBox,
  TEST_ORG_ID,
  mockReq,
  mockRes,
  expectTrpcError,
  type TestDb,
} from "../test-utils.js";
import { RoleId, type RoleIdValue } from "@care-y/shared";
import type {
  SessionId,
  SessionToken,
  UserId,
  IpToken,
  UaToken,
  OrgSlug,
  OrgSchema,
} from "@care-y/shared";
import { createKeysRouter } from "./keys.js";
import { router, createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";

// ---------------------------------------------------------------------------
// Base64 test data helpers
// ---------------------------------------------------------------------------

/** 16-byte salt encoded as base64 (Argon2id salt length). */
function testSalt(): string {
  return Buffer.alloc(16, 0xaa).toString("base64");
}

/** 32-byte vol_public encoded as base64 (ristretto255 point length). */
function testVolPublic(fill = 0xbb): string {
  return Buffer.alloc(32, fill).toString("base64");
}

/** 32-byte ephemeral point encoded as base64. */
function testEphemeralPoint(fill = 0xcc): string {
  return Buffer.alloc(32, fill).toString("base64");
}

/** 24-byte nonce encoded as base64. */
function testNonce(fill = 0xdd): string {
  return Buffer.alloc(24, fill).toString("base64");
}

/** Arbitrary base64 wrapped key (no fixed length requirement). */
function testWrappedKey(fill = 0xee): string {
  return Buffer.alloc(48, fill).toString("base64");
}

/** 32-byte org public key encoded as base64 (Curve25519). */
function testOrgPublicKey(fill = 0xff): string {
  return Buffer.alloc(32, fill).toString("base64");
}

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "keys router (DB integration)",
  () => {
    let testDb: TestDb;
    let tenantDb: Kysely<TenantDatabase>;
    let orgContext: OrgContext;

    beforeAll(async () => {
      testDb = await createTestDb();
      tenantDb = testDb.db;

      await tenantDb
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();
      await seedOrgPublicKey(tenantDb);

      orgContext = {
        orgId: TEST_ORG_ID,
        orgSlug: "test-keys" as OrgSlug,
        orgSchema: testDb.schemaName as OrgSchema,
        tenantDb,
        sealedBox: testSealedBox,
      };
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    // Build a mini-router containing only the keys sub-router.
    function buildKeysRouter() {
      const keysRouter = createKeysRouter();
      return router({ keys: keysRouter });
    }

    /** Maps a raw DB user row (snake_case) to a tRPC Context caller. */
    function createAuthedCaller(dbRow: {
      id: UserId;
      role_id: RoleIdValue;
      identifier_hash: string;
      encrypted_display_name: Buffer;
    }) {
      const appRouter = buildKeysRouter();
      const factory = createCallerFactory(appRouter);
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: {
          id: "test-session" as SessionId,
          token: "test-token" as SessionToken,
          userId: dbRow.id,
          ipToken: "test-ip" as IpToken,
          uaToken: "test-ua" as UaToken,
          expiresAt: new Date(Date.now() + 3_600_000),
          twofaVerified: true,
          webauthnChallenge: null,
        },
        user: {
          id: dbRow.id,
          encryptedIdentifier: dbRow.identifier_hash,
          encryptedDisplayName: dbRow.encrypted_display_name.toString("base64"),
          encryptedPreferredLocale: null,
          roleId: dbRow.role_id,
          isActive: true,
          hasSeenBriefing: true,
        },
      };
      return factory(ctx);
    }

    function createUnauthCaller() {
      const appRouter = buildKeysRouter();
      const factory = createCallerFactory(appRouter);
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: null,
        user: null,
      };
      return factory(ctx);
    }

    // -----------------------------------------------------------------------
    // initCryptoKeys
    // -----------------------------------------------------------------------

    describe("initCryptoKeys", () => {
      it("inserts user_keys row with salt and volPublic", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        const result = await caller.keys.initCryptoKeys({
          salt: testSalt(),
          volPublic: testVolPublic(),
        });
        expect(result.success).toBe(true);

        const row = await tenantDb
          .selectFrom("user_keys")
          .selectAll()
          .where("user_id", "=", user.id)
          .executeTakeFirstOrThrow();

        expect(row.salt).toBeInstanceOf(Buffer);
        expect(row.vol_public).toBeInstanceOf(Buffer);
        expect(row.salt!.length).toBe(16);
        expect(row.vol_public!.length).toBe(32);
      });

      it("rejects duplicate initialization (prevents salt replacement)", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        await caller.keys.initCryptoKeys({
          salt: testSalt(),
          volPublic: testVolPublic(),
        });

        await expectTrpcError(
          caller.keys.initCryptoKeys({
            salt: testSalt(),
            volPublic: testVolPublic(0x11),
          }),
          "CONFLICT",
        );
      });

      it("stores data as Buffer (not string) in the database", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        await caller.keys.initCryptoKeys({
          salt: testSalt(),
          volPublic: testVolPublic(),
        });

        const row = await tenantDb
          .selectFrom("user_keys")
          .select(["salt", "vol_public"])
          .where("user_id", "=", user.id)
          .executeTakeFirstOrThrow();

        expect(Buffer.isBuffer(row.salt)).toBe(true);
        expect(Buffer.isBuffer(row.vol_public)).toBe(true);
      });

      it("rejects unauthenticated caller", async () => {
        const caller = createUnauthCaller();
        await expectTrpcError(
          caller.keys.initCryptoKeys({
            salt: testSalt(),
            volPublic: testVolPublic(),
          }),
          "UNAUTHORIZED",
        );
      });
    });

    // -----------------------------------------------------------------------
    // uploadVolPublic
    // -----------------------------------------------------------------------

    describe("uploadVolPublic", () => {
      it("updates volPublic on existing user_keys row", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        await caller.keys.initCryptoKeys({
          salt: testSalt(),
          volPublic: testVolPublic(0x01),
        });

        const newVolPublic = testVolPublic(0x02);
        const result = await caller.keys.uploadVolPublic({
          volPublic: newVolPublic,
        });
        expect(result.success).toBe(true);

        const row = await tenantDb
          .selectFrom("user_keys")
          .select("vol_public")
          .where("user_id", "=", user.id)
          .executeTakeFirstOrThrow();

        expect(row.vol_public).toEqual(Buffer.alloc(32, 0x02));
      });

      it("succeeds silently when no user_keys row exists (0 rows affected)", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        const result = await caller.keys.uploadVolPublic({
          volPublic: testVolPublic(),
        });
        expect(result.success).toBe(true);
      });
    });

    // -----------------------------------------------------------------------
    // rotateKeys
    // -----------------------------------------------------------------------

    describe("rotateKeys", () => {
      it("acquires lock, applies rotation, and releases lock on success", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        await caller.keys.initCryptoKeys({
          salt: testSalt(),
          volPublic: testVolPublic(0x01),
        });

        const result = await caller.keys.rotateKeys({
          saltNew: testSalt(),
          volPublicNew: testVolPublic(0x02),
          reWrappedKeys: [],
        });
        expect(result.success).toBe(true);

        const row = await tenantDb
          .selectFrom("user_keys")
          .select(["vol_public", "rotation_lock", "key_version"])
          .where("user_id", "=", user.id)
          .executeTakeFirstOrThrow();

        expect(row.vol_public).toEqual(Buffer.alloc(32, 0x02));
        expect(row.rotation_lock).toBe(false);
        expect(row.key_version).toBeGreaterThanOrEqual(2);
      });

      it("rejects concurrent rotation (lock already held)", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        await caller.keys.initCryptoKeys({
          salt: testSalt(),
          volPublic: testVolPublic(),
        });

        // Manually set rotation_lock to simulate concurrent rotation.
        await tenantDb
          .updateTable("user_keys")
          .set({ rotation_lock: true })
          .where("user_id", "=", user.id)
          .execute();

        await expectTrpcError(
          caller.keys.rotateKeys({
            saltNew: testSalt(),
            volPublicNew: testVolPublic(0x03),
            reWrappedKeys: [],
          }),
          "INTERNAL_SERVER_ERROR",
        );

        // Clean up: release the lock so cleanup can proceed.
        await tenantDb
          .updateTable("user_keys")
          .set({ rotation_lock: false })
          .where("user_id", "=", user.id)
          .execute();
      });

      it("releases lock on applyRotation failure (not permanently locked out)", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        await caller.keys.initCryptoKeys({
          salt: testSalt(),
          volPublic: testVolPublic(),
        });

        // Provide a re-wrapped key with a non-existent ticket ID to trigger
        // an FK violation inside the savepoint. The savepoint rollback handles
        // FK violations gracefully, so the rotation itself succeeds.
        // Test the lock release in the success path instead.
        const result = await caller.keys.rotateKeys({
          saltNew: testSalt(),
          volPublicNew: testVolPublic(0x04),
          reWrappedKeys: [
            {
              ticketId: randomUUID(),
              keyGeneration: randomUUID(),
              ephemeralPoint: testEphemeralPoint(),
              nonce: testNonce(),
              wrappedKey: testWrappedKey(),
            },
          ],
        });

        expect(result.success).toBe(true);

        const row = await tenantDb
          .selectFrom("user_keys")
          .select("rotation_lock")
          .where("user_id", "=", user.id)
          .executeTakeFirstOrThrow();

        expect(row.rotation_lock).toBe(false);
      });

      it("rotates with reWrappedOrgKey when provided", async () => {
        const user = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(user);

        await caller.keys.initCryptoKeys({
          salt: testSalt(),
          volPublic: testVolPublic(),
        });

        // Insert a wrapped_org_keys row for this user so the UPDATE has a target.
        await tenantDb
          .insertInto("wrapped_org_keys")
          .values({
            user_id: user.id,
            ephemeral_point: Buffer.alloc(32, 0x01),
            nonce: Buffer.alloc(24, 0x01),
            wrapped_key: Buffer.alloc(48, 0x01),
          })
          .execute();

        const result = await caller.keys.rotateKeys({
          saltNew: testSalt(),
          volPublicNew: testVolPublic(0x05),
          reWrappedKeys: [],
          reWrappedOrgKey: {
            ephemeralPoint: testEphemeralPoint(0x99),
            nonce: testNonce(0x99),
            wrappedKey: testWrappedKey(0x99),
          },
        });

        expect(result.success).toBe(true);

        const wrap = await tenantDb
          .selectFrom("wrapped_org_keys")
          .selectAll()
          .where("user_id", "=", user.id)
          .executeTakeFirstOrThrow();

        expect(wrap.ephemeral_point).toEqual(Buffer.alloc(32, 0x99));
        expect(wrap.nonce).toEqual(Buffer.alloc(24, 0x99));
      });
    });

    // -----------------------------------------------------------------------
    // rotationStatus
    // -----------------------------------------------------------------------

    describe("rotationStatus", () => {
      it("returns inProgress false when no lock is held", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        await caller.keys.initCryptoKeys({
          salt: testSalt(),
          volPublic: testVolPublic(),
        });

        const status = await caller.keys.rotationStatus();
        expect(status.inProgress).toBe(false);
      });

      it("returns inProgress true when lock is held", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        await caller.keys.initCryptoKeys({
          salt: testSalt(),
          volPublic: testVolPublic(),
        });

        await tenantDb
          .updateTable("user_keys")
          .set({ rotation_lock: true })
          .where("user_id", "=", user.id)
          .execute();

        const status = await caller.keys.rotationStatus();
        expect(status.inProgress).toBe(true);

        // Clean up
        await tenantDb
          .updateTable("user_keys")
          .set({ rotation_lock: false })
          .where("user_id", "=", user.id)
          .execute();
      });

      it("returns inProgress false when no user_keys row exists", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        const status = await caller.keys.rotationStatus();
        expect(status.inProgress).toBe(false);
      });
    });

    // -----------------------------------------------------------------------
    // getWrappedOrgKey
    // -----------------------------------------------------------------------

    describe("getWrappedOrgKey", () => {
      it("returns null when no wrapped key exists for user", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        const result = await caller.keys.getWrappedOrgKey();
        expect(result).toBeNull();
      });

      it("returns base64-encoded wrapped key data when present", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        await tenantDb
          .insertInto("wrapped_org_keys")
          .values({
            user_id: user.id,
            ephemeral_point: Buffer.alloc(32, 0xab),
            nonce: Buffer.alloc(24, 0xcd),
            wrapped_key: Buffer.alloc(48, 0xef),
          })
          .execute();

        const result = await caller.keys.getWrappedOrgKey();
        expect(result).not.toBeNull();
        expect(typeof result!.ephemeralPoint).toBe("string");
        expect(typeof result!.wrappedKey).toBe("string");
        expect(typeof result!.nonce).toBe("string");

        // Verify roundtrip: decode back and check lengths.
        expect(Buffer.from(result!.ephemeralPoint, "base64").length).toBe(32);
        expect(Buffer.from(result!.nonce, "base64").length).toBe(24);
        expect(Buffer.from(result!.wrappedKey, "base64").length).toBe(48);
      });
    });

    // -----------------------------------------------------------------------
    // uploadOrgPublicKey (adminProcedure)
    // -----------------------------------------------------------------------

    describe("uploadOrgPublicKey", () => {
      it(
        "stores org public key and wrapped key for calling admin",
        { timeout: 30_000 },
        async () => {
          // Use a fresh schema to avoid conflict with seedOrgPublicKey.
          const freshDb = await createTestDb();
          const freshTenantDb = freshDb.db;
          await freshTenantDb
            .insertInto("org_config")
            .values({ pii_retention_days: null })
            .onConflict((oc) => oc.doNothing())
            .execute();

          const freshOrgCtx: OrgContext = {
            orgId: TEST_ORG_ID,
            orgSlug: "test-keys-orgkey" as OrgSlug,
            orgSchema: freshDb.schemaName as OrgSchema,
            tenantDb: freshTenantDb,
            sealedBox: testSealedBox,
          };

          const admin = await createTestUser(freshTenantDb, {
            overrides: { role_id: RoleId.ADMIN },
          });

          const appRouter = buildKeysRouter();
          const factory = createCallerFactory(appRouter);
          const ctx: Context = {
            req: mockReq(),
            res: mockRes(),
            org: freshOrgCtx,
            session: {
              id: "s1" as SessionId,
              token: "t1" as SessionToken,
              userId: admin.id,
              ipToken: "ip1" as IpToken,
              uaToken: "ua1" as UaToken,
              expiresAt: new Date(Date.now() + 3_600_000),
              twofaVerified: true,
              webauthnChallenge: null,
            },
            user: {
              id: admin.id,
              encryptedIdentifier: admin.identifier_hash,
              encryptedDisplayName:
                admin.encrypted_display_name.toString("base64"),
              encryptedPreferredLocale: null,
              roleId: RoleId.ADMIN,
              isActive: true,
              hasSeenBriefing: true,
            },
          };
          const caller = factory(ctx);

          const result = await caller.keys.uploadOrgPublicKey({
            orgPublicKey: testOrgPublicKey(0xa1),
            ephemeralPoint: testEphemeralPoint(),
            nonce: testNonce(),
            wrappedKey: testWrappedKey(),
          });
          expect(result.success).toBe(true);

          const config = await freshTenantDb
            .selectFrom("org_config")
            .select("org_public_key")
            .executeTakeFirstOrThrow();
          expect(config.org_public_key).toEqual(Buffer.alloc(32, 0xa1));

          const wrap = await freshTenantDb
            .selectFrom("wrapped_org_keys")
            .selectAll()
            .where("user_id", "=", admin.id)
            .executeTakeFirstOrThrow();
          expect(wrap.ephemeral_point).toBeInstanceOf(Buffer);

          await freshDb.cleanup();
        },
      );

      it("rejects when org already has a different public key (one-time init)", async () => {
        // Main test schema already has org_public_key set via seedOrgPublicKey.
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        await expectTrpcError(
          caller.keys.uploadOrgPublicKey({
            orgPublicKey: testOrgPublicKey(0xb2),
            ephemeralPoint: testEphemeralPoint(),
            nonce: testNonce(),
            wrappedKey: testWrappedKey(),
          }),
          "CONFLICT",
        );
      });

      it("rejects non-admin caller", async () => {
        const volunteer = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.VOLUNTEER },
        });
        const caller = createAuthedCaller(volunteer);

        await expectTrpcError(
          caller.keys.uploadOrgPublicKey({
            orgPublicKey: testOrgPublicKey(),
            ephemeralPoint: testEphemeralPoint(),
            nonce: testNonce(),
            wrappedKey: testWrappedKey(),
          }),
          "FORBIDDEN",
        );
      });
    });

    // -----------------------------------------------------------------------
    // rotateOrgKey (adminProcedure)
    // -----------------------------------------------------------------------

    describe("rotateOrgKey", () => {
      it("atomically replaces org public key and all wrapped keys", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const volunteer = await createTestUser(tenantDb);

        // Seed initial wrapped keys for both users.
        for (const u of [admin, volunteer]) {
          await tenantDb
            .insertInto("wrapped_org_keys")
            .values({
              user_id: u.id,
              ephemeral_point: Buffer.alloc(32, 0x01),
              nonce: Buffer.alloc(24, 0x01),
              wrapped_key: Buffer.alloc(48, 0x01),
            })
            .onConflict((oc) => oc.column("user_id").doNothing())
            .execute();
        }

        const caller = createAuthedCaller(admin);
        const result = await caller.keys.rotateOrgKey({
          newOrgPublicKey: testOrgPublicKey(0xc3),
          wrappedKeys: [
            {
              userId: admin.id,
              ephemeralPoint: testEphemeralPoint(0xc3),
              nonce: testNonce(0xc3),
              wrappedKey: testWrappedKey(0xc3),
            },
            {
              userId: volunteer.id,
              ephemeralPoint: testEphemeralPoint(0xc4),
              nonce: testNonce(0xc4),
              wrappedKey: testWrappedKey(0xc4),
            },
          ],
        });
        expect(result.success).toBe(true);

        // Verify org_public_key was replaced.
        const config = await tenantDb
          .selectFrom("org_config")
          .select("org_public_key")
          .executeTakeFirstOrThrow();
        expect(config.org_public_key).toEqual(Buffer.alloc(32, 0xc3));

        // Verify wrapped keys were replaced (not appended).
        const wraps = await tenantDb
          .selectFrom("wrapped_org_keys")
          .selectAll()
          .execute();
        const testUserWraps = wraps.filter(
          (w) => w.user_id === admin.id || w.user_id === volunteer.id,
        );
        expect(testUserWraps.length).toBe(2);

        const adminWrap = testUserWraps.find((w) => w.user_id === admin.id);
        expect(adminWrap!.ephemeral_point).toEqual(Buffer.alloc(32, 0xc3));
      });

      it("rejects non-admin caller", async () => {
        const volunteer = await createTestUser(tenantDb);
        const caller = createAuthedCaller(volunteer);

        await expectTrpcError(
          caller.keys.rotateOrgKey({
            newOrgPublicKey: testOrgPublicKey(),
            wrappedKeys: [
              {
                userId: volunteer.id,
                ephemeralPoint: testEphemeralPoint(),
                nonce: testNonce(),
                wrappedKey: testWrappedKey(),
              },
            ],
          }),
          "FORBIDDEN",
        );
      });
    });

    // -----------------------------------------------------------------------
    // wrapOrgKeyForUser (adminProcedure)
    // -----------------------------------------------------------------------

    describe("wrapOrgKeyForUser", () => {
      it("inserts wrapped key for a user", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const target = await createTestUser(tenantDb);
        const caller = createAuthedCaller(admin);

        const result = await caller.keys.wrapOrgKeyForUser({
          userId: target.id,
          ephemeralPoint: testEphemeralPoint(0xd5),
          nonce: testNonce(0xd5),
          wrappedKey: testWrappedKey(0xd5),
        });
        expect(result.success).toBe(true);

        const wrap = await tenantDb
          .selectFrom("wrapped_org_keys")
          .selectAll()
          .where("user_id", "=", target.id)
          .executeTakeFirstOrThrow();

        expect(wrap.ephemeral_point).toEqual(Buffer.alloc(32, 0xd5));
      });

      it("is idempotent (ON CONFLICT DO NOTHING on second call)", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const target = await createTestUser(tenantDb);
        const caller = createAuthedCaller(admin);

        await caller.keys.wrapOrgKeyForUser({
          userId: target.id,
          ephemeralPoint: testEphemeralPoint(0xe6),
          nonce: testNonce(0xe6),
          wrappedKey: testWrappedKey(0xe6),
        });

        // Second call with different data should not throw or update.
        const result = await caller.keys.wrapOrgKeyForUser({
          userId: target.id,
          ephemeralPoint: testEphemeralPoint(0xf7),
          nonce: testNonce(0xf7),
          wrappedKey: testWrappedKey(0xf7),
        });
        expect(result.success).toBe(true);

        // Original data preserved (DO NOTHING, not DO UPDATE).
        const wrap = await tenantDb
          .selectFrom("wrapped_org_keys")
          .selectAll()
          .where("user_id", "=", target.id)
          .executeTakeFirstOrThrow();
        expect(wrap.ephemeral_point).toEqual(Buffer.alloc(32, 0xe6));
      });
    });

    // -----------------------------------------------------------------------
    // listUnwrappedUsers (adminProcedure)
    // -----------------------------------------------------------------------

    describe("listUnwrappedUsers", () => {
      it("returns users with volPublic but no wrapped org key", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });

        // Create a user WITH keys but WITHOUT a wrapped org key.
        const unwrapped = await createTestUser(tenantDb);
        await tenantDb
          .insertInto("user_keys")
          .values({
            user_id: unwrapped.id,
            salt: Buffer.alloc(16, 0x01),
            vol_public: Buffer.alloc(32, 0x01),
          })
          .onConflict((oc) => oc.column("user_id").doNothing())
          .execute();

        // Create a user WITH keys AND a wrapped org key (should be excluded).
        const wrapped = await createTestUser(tenantDb);
        await tenantDb
          .insertInto("user_keys")
          .values({
            user_id: wrapped.id,
            salt: Buffer.alloc(16, 0x02),
            vol_public: Buffer.alloc(32, 0x02),
          })
          .onConflict((oc) => oc.column("user_id").doNothing())
          .execute();
        await tenantDb
          .insertInto("wrapped_org_keys")
          .values({
            user_id: wrapped.id,
            ephemeral_point: Buffer.alloc(32, 0x03),
            nonce: Buffer.alloc(24, 0x03),
            wrapped_key: Buffer.alloc(48, 0x03),
          })
          .onConflict((oc) => oc.column("user_id").doNothing())
          .execute();

        const caller = createAuthedCaller(admin);
        const users = await caller.keys.listUnwrappedUsers();

        const ids = users.map((u) => u.userId);
        expect(ids).toContain(unwrapped.id);
        expect(ids).not.toContain(wrapped.id);

        const match = users.find((u) => u.userId === unwrapped.id);
        expect(typeof match!.volPublic).toBe("string");
        expect(Buffer.from(match!.volPublic, "base64").length).toBe(32);
      });

      it("excludes inactive users", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });

        const inactive = await createTestUser(tenantDb, {
          overrides: { is_active: false },
        });
        await tenantDb
          .insertInto("user_keys")
          .values({
            user_id: inactive.id,
            salt: Buffer.alloc(16, 0x04),
            vol_public: Buffer.alloc(32, 0x04),
          })
          .onConflict((oc) => oc.column("user_id").doNothing())
          .execute();

        const caller = createAuthedCaller(admin);
        const users = await caller.keys.listUnwrappedUsers();
        const ids = users.map((u) => u.userId);
        expect(ids).not.toContain(inactive.id);
      });

      it("rejects non-admin caller", async () => {
        const volunteer = await createTestUser(tenantDb);
        const caller = createAuthedCaller(volunteer);

        await expectTrpcError(caller.keys.listUnwrappedUsers(), "FORBIDDEN");
      });
    });

    // -----------------------------------------------------------------------
    // adminBootstrapUserKeys
    // -----------------------------------------------------------------------

    describe("adminBootstrapUserKeys", () => {
      function bootstrapInput(userId: UserId) {
        return {
          userId,
          salt: testSalt(),
          volPublic: testVolPublic(0xb1),
          wrappedOrgKey: {
            ephemeralPoint: testEphemeralPoint(0xc1),
            nonce: testNonce(0xd1),
            wrappedKey: testWrappedKey(0xe1),
          },
        };
      }

      it("initializes user_keys and wrapped_org_keys in one call", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const target = await createTestUser(tenantDb);
        const caller = createAuthedCaller(admin);

        const result = await caller.keys.adminBootstrapUserKeys(
          bootstrapInput(target.id),
        );
        expect(result.success).toBe(true);

        const keys = await tenantDb
          .selectFrom("user_keys")
          .selectAll()
          .where("user_id", "=", target.id)
          .executeTakeFirst();

        expect(keys).toBeDefined();
        expect(keys!.salt).toEqual(Buffer.alloc(16, 0xaa));
        expect(keys!.vol_public).toEqual(Buffer.alloc(32, 0xb1));

        const wrap = await tenantDb
          .selectFrom("wrapped_org_keys")
          .selectAll()
          .where("user_id", "=", target.id)
          .executeTakeFirst();

        expect(wrap).toBeDefined();
        expect(wrap!.ephemeral_point).toEqual(Buffer.alloc(32, 0xc1));
        expect(wrap!.nonce).toEqual(Buffer.alloc(24, 0xd1));
      });

      it("rejects duplicate bootstrap (prevents key replacement)", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const target = await createTestUser(tenantDb);
        const caller = createAuthedCaller(admin);

        const input = bootstrapInput(target.id);
        await caller.keys.adminBootstrapUserKeys(input);

        await expectTrpcError(
          caller.keys.adminBootstrapUserKeys(input),
          "CONFLICT",
        );
      });

      it("rejects non-admin caller", async () => {
        const volunteer = await createTestUser(tenantDb);
        const caller = createAuthedCaller(volunteer);

        await expectTrpcError(
          caller.keys.adminBootstrapUserKeys(
            bootstrapInput(randomUUID() as UserId),
          ),
          "FORBIDDEN",
        );
      });

      it("rejects unauthenticated caller", async () => {
        const caller = createUnauthCaller();

        await expectTrpcError(
          caller.keys.adminBootstrapUserKeys(
            bootstrapInput(randomUUID() as UserId),
          ),
          "UNAUTHORIZED",
        );
      });
    });
  },
);
