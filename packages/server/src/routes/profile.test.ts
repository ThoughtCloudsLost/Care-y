import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { sql, type Kysely } from "kysely";
import { RoleId } from "@care-y/shared";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  testFieldEncryptor,
  testBlindIndexer,
  testSessionTokenizer,
  testSealedBox,
  seedOrgPublicKey,
  mockReq,
  mockRes,
  expectTrpcError,
  createMockEmailSender,
  createMockOprfDeps,
  createMockProviderFactory,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";
import { createScryptHasher } from "../auth/password.js";
import { createAuthService } from "../auth/service.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { createDbSessionRepository } from "../auth/session-repository.js";
import { createOrgService } from "../org/service.js";
import { createAppRouter } from "./router.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { SessionData } from "../auth/session-repository.js";

function makeTenantDbFactory(
  platformDb: Kysely<PlatformDatabase>,
): (schema: string) => Kysely<TenantDatabase> {
  return (schema: string) =>
    platformDb.withSchema(schema) as unknown as Kysely<TenantDatabase>;
}

describe.skipIf(!process.env.DATABASE_URL)(
  "profile routes (DB integration)",
  () => {
    let testDb: TestDb;
    let tenantDb: Kysely<TenantDatabase>;
    let orgContext: OrgContext;
    const createdOrgIds: string[] = [];
    const createdSchemas: string[] = [];

    const hasher = createScryptHasher();
    const loginLimiter = createInMemoryRateLimiter({
      windowMs: 60_000,
      maxRequests: 100,
    });
    const saltLimiter = createInMemoryRateLimiter({
      windowMs: 60_000,
      maxRequests: 100,
    });
    const fakeSaltKey = Buffer.alloc(32, 0);

    beforeAll(async () => {
      testDb = await createTestDb();
      tenantDb = testDb.db;

      const orgService = createOrgService(
        testDb.platformDb,
        makeTenantDbFactory(testDb.platformDb),
      );
      const suffix = randomUUID().slice(0, 8);
      const org = await orgService.createOrg({
        slug: `test-profile-${suffix}`,
      });
      createdOrgIds.push(org.id);
      createdSchemas.push(org.schemaName);

      await tenantDb
        .insertInto("org_config")
        .values({
          encrypted_name: null,
          encrypted_logo: null,
          encrypted_primary_color: null,
          encrypted_client_text: null,
          client_encrypted_branding: null,
          pii_retention_days: null,
        })
        .execute();
      await seedOrgPublicKey(tenantDb);

      orgContext = {
        orgId: org.id,
        orgSlug: org.slug,
        orgSchema: testDb.schemaName,
        tenantDb,
        sealedBox: testSealedBox,
      };
    });

    afterAll(async () => {
      for (const schema of createdSchemas) {
        await sql`DROP SCHEMA IF EXISTS ${sql.id(schema)} CASCADE`.execute(
          testDb.platformDb,
        );
      }
      for (const id of createdOrgIds) {
        await testDb.platformDb
          .deleteFrom("orgs")
          .where("id", "=", id)
          .execute();
      }
      await testDb.cleanup();
    });

    function buildRouter() {
      const orgService = createOrgService(
        testDb.platformDb,
        makeTenantDbFactory(testDb.platformDb),
      );
      return createAppRouter({
        authDeps: {
          hasher,
          loginLimiter,
          saltLimiter,
          fakeSaltKey,
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          tokenizer: testSessionTokenizer,
          isSecureCookie: false,
          emailSender: createMockEmailSender(),
          providerFactory: createMockProviderFactory(),
          resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
        },
        profileDeps: {
          hasher,
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          tokenizer: testSessionTokenizer,
        },
        twoFactorDeps: {
          emailSender: createMockEmailSender(),
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          tokenizer: testSessionTokenizer,
          providerFactory: createMockProviderFactory(),
          resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
          pushSender: null,
          pushHmacKey: null,
        },
        oprfDeps: createMockOprfDeps(),
        orgService,
        providerFactory: createMockProviderFactory(),
      });
    }

    function buildCaller(ctx: Context) {
      return createCallerFactory(buildRouter())(ctx);
    }

    async function createSession(userId: string): Promise<SessionData> {
      const repo = createDbSessionRepository(
        tenantDb,
        testSessionTokenizer,
        testSealedBox,
      );
      return repo.create({
        token: randomUUID(),
        userId,
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
        expiresAt: new Date(Date.now() + 3_600_000),
      });
    }

    function authedCtx(
      userId: string,
      session: SessionData,
      roleId: string = RoleId.VOLUNTEER,
      twofaVerified = false,
    ): Context {
      return {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: twofaVerified ? { ...session, twofaVerified: true } : session,
        user: {
          id: userId,
          identifier: "test-user",
          encryptedDisplayName: "",
          roleId,
          isActive: true,
        },
      };
    }

    describe("updateDisplayName", () => {
      it("updates the display name for the calling user", async () => {
        const user = await createTestUser(tenantDb);
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        const newCiphertext =
          Buffer.from("new-encrypted-name").toString("base64");
        const result = await caller.profile.updateDisplayName({
          encryptedDisplayName: newCiphertext,
        });

        expect(result.success).toBe(true);

        const row = await tenantDb
          .selectFrom("users")
          .select("encrypted_display_name")
          .where("id", "=", user.id)
          .executeTakeFirstOrThrow();

        expect(row.encrypted_display_name.toString("base64")).toBe(
          newCiphertext,
        );
      });

      it("rejects unauthenticated calls", async () => {
        const caller = buildCaller({
          req: mockReq(),
          res: mockRes(),
          org: null,
          session: null,
          user: null,
        });

        await expectTrpcError(
          caller.profile.updateDisplayName({
            encryptedDisplayName: "dGVzdA==",
          }),
          "UNAUTHORIZED",
        );
      });

      it("rejects update for inactive user", async () => {
        const user = await createTestUser(tenantDb, {
          overrides: { is_active: false },
        });
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        await expectTrpcError(
          caller.profile.updateDisplayName({
            encryptedDisplayName: "dGVzdA==",
          }),
          "NOT_FOUND",
        );
      });
    });

    function makeAuthService(): ReturnType<typeof createAuthService> {
      const sessions = createDbSessionRepository(
        tenantDb,
        testSessionTokenizer,
        testSealedBox,
      );
      return createAuthService(
        tenantDb,
        hasher,
        sessions,
        testFieldEncryptor,
        testSealedBox,
        testBlindIndexer,
        testSessionTokenizer,
        TEST_ORG_ID,
      );
    }

    describe("adminUpdateDisplayName", () => {
      it("allows admin to update another user's display name", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const target = await createTestUser(tenantDb);
        const session = await createSession(admin.id);
        const caller = buildCaller(
          authedCtx(admin.id, session, RoleId.ADMIN, true),
        );

        const newCiphertext = Buffer.from("admin-set-name").toString("base64");
        const result = await caller.profile.adminUpdateDisplayName({
          userId: target.id,
          encryptedDisplayName: newCiphertext,
        });

        expect(result.success).toBe(true);

        const row = await tenantDb
          .selectFrom("users")
          .select("encrypted_display_name")
          .where("id", "=", target.id)
          .executeTakeFirstOrThrow();

        expect(row.encrypted_display_name.toString("base64")).toBe(
          newCiphertext,
        );
      });

      it("rejects non-admin caller", async () => {
        const vol = await createTestUser(tenantDb);
        const target = await createTestUser(tenantDb);
        const session = await createSession(vol.id);
        const caller = buildCaller(
          authedCtx(vol.id, session, RoleId.VOLUNTEER, true),
        );

        await expectTrpcError(
          caller.profile.adminUpdateDisplayName({
            userId: target.id,
            encryptedDisplayName: "dGVzdA==",
          }),
          "FORBIDDEN",
        );
      });

      it("rejects update for nonexistent user", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const session = await createSession(admin.id);
        const caller = buildCaller(
          authedCtx(admin.id, session, RoleId.ADMIN, true),
        );

        await expectTrpcError(
          caller.profile.adminUpdateDisplayName({
            userId: randomUUID(),
            encryptedDisplayName: "dGVzdA==",
          }),
          "NOT_FOUND",
        );
      });
    });

    describe("updateUsername", () => {
      it("updates username with correct password", async () => {
        const authService = makeAuthService();
        const user = await authService.register({
          identifier: `uname-self-${randomUUID().slice(0, 8)}`,
          password: "test-password-long-enough",
          displayName: "Username Self",
          roleId: RoleId.VOLUNTEER,
        });
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        const newName = `new-uname-${randomUUID().slice(0, 8)}`;
        const result = await caller.profile.updateUsername({
          currentPassword: "test-password-long-enough",
          newIdentifier: newName,
        });

        expect(result.success).toBe(true);

        const row = await tenantDb
          .selectFrom("users")
          .select("identifier_hash")
          .where("id", "=", user.id)
          .executeTakeFirstOrThrow();

        expect(row.identifier_hash).toBe(
          testBlindIndexer.hash(newName, TEST_ORG_ID),
        );
      });

      it("rejects wrong password", async () => {
        const authService = makeAuthService();
        const user = await authService.register({
          identifier: `uname-wrongpw-${randomUUID().slice(0, 8)}`,
          password: "correct-password-long-enough",
          displayName: "Wrong PW User",
          roleId: RoleId.VOLUNTEER,
        });
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        await expectTrpcError(
          caller.profile.updateUsername({
            currentPassword: "wrong-password-long-enough!",
            newIdentifier: "anything-valid",
          }),
          "UNAUTHORIZED",
          "INVALID_CREDENTIALS",
        );
      });

      it("rejects duplicate username without revealing it exists", async () => {
        const authService = makeAuthService();
        const existing = await authService.register({
          identifier: `uname-dup-existing-${randomUUID().slice(0, 8)}`,
          password: "existing-password-long-enough",
          displayName: "Existing User",
          roleId: RoleId.VOLUNTEER,
        });
        const user = await authService.register({
          identifier: `uname-dup-changer-${randomUUID().slice(0, 8)}`,
          password: "changer-password-long-enough",
          displayName: "Changer User",
          roleId: RoleId.VOLUNTEER,
        });
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        const err = await expectTrpcError(
          caller.profile.updateUsername({
            currentPassword: "changer-password-long-enough",
            newIdentifier: existing.identifier,
          }),
          "BAD_REQUEST",
        );
        expect(err.message).not.toContain("USERNAME_ALREADY_TAKEN");
      });

      it("new username works for login after change", async () => {
        const authService = makeAuthService();
        const oldName = `uname-login-${randomUUID().slice(0, 8)}`;
        const user = await authService.register({
          identifier: oldName,
          password: "login-test-password-long-enough",
          displayName: "Login Test User",
          roleId: RoleId.VOLUNTEER,
        });
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        const newName = `uname-login-new-${randomUUID().slice(0, 8)}`;
        await caller.profile.updateUsername({
          currentPassword: "login-test-password-long-enough",
          newIdentifier: newName,
        });

        const loginResult = await authService.login({
          identifier: newName,
          password: "login-test-password-long-enough",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
        });
        expect(loginResult.user.id).toBe(user.id);
      });
    });

    describe("adminUpdateUsername", () => {
      it("admin can change another user's username without password", async () => {
        const authService = makeAuthService();
        const admin = await authService.register({
          identifier: `uname-admin-${randomUUID().slice(0, 8)}`,
          password: "admin-password-long-enough!!",
          displayName: "Admin User",
          roleId: RoleId.ADMIN,
        });
        const target = await createTestUser(tenantDb);
        const session = await createSession(admin.id);
        const caller = buildCaller(
          authedCtx(admin.id, session, RoleId.ADMIN, true),
        );

        const newName = `admin-set-${randomUUID().slice(0, 8)}`;
        const result = await caller.profile.adminUpdateUsername({
          userId: target.id,
          newIdentifier: newName,
        });

        expect(result.success).toBe(true);

        const row = await tenantDb
          .selectFrom("users")
          .select("identifier_hash")
          .where("id", "=", target.id)
          .executeTakeFirstOrThrow();

        expect(row.identifier_hash).toBe(
          testBlindIndexer.hash(newName, TEST_ORG_ID),
        );
      });

      it("rejects non-admin caller", async () => {
        const vol = await createTestUser(tenantDb);
        const target = await createTestUser(tenantDb);
        const session = await createSession(vol.id);
        const caller = buildCaller(
          authedCtx(vol.id, session, RoleId.VOLUNTEER, true),
        );

        await expectTrpcError(
          caller.profile.adminUpdateUsername({
            userId: target.id,
            newIdentifier: "anything-valid",
          }),
          "FORBIDDEN",
        );
      });

      it("rejects admin changing own username via admin endpoint", async () => {
        const authService = makeAuthService();
        const admin = await authService.register({
          identifier: `uname-selfadm-${randomUUID().slice(0, 8)}`,
          password: "selfadm-password-long-enough",
          displayName: "Self Admin",
          roleId: RoleId.ADMIN,
        });
        const session = await createSession(admin.id);
        const caller = buildCaller(
          authedCtx(admin.id, session, RoleId.ADMIN, true),
        );

        await expectTrpcError(
          caller.profile.adminUpdateUsername({
            userId: admin.id,
            newIdentifier: "new-admin-name",
          }),
          "FORBIDDEN",
        );
      });

      it("rejects duplicate username via admin endpoint", async () => {
        const authService = makeAuthService();
        const admin = await authService.register({
          identifier: `uname-admdup-${randomUUID().slice(0, 8)}`,
          password: "admdup-password-long-enough!",
          displayName: "Admin Dup",
          roleId: RoleId.ADMIN,
        });
        const existing = await authService.register({
          identifier: `uname-admdup-tgt-${randomUUID().slice(0, 8)}`,
          password: "admdup-target-password-long!",
          displayName: "Dup Target",
          roleId: RoleId.VOLUNTEER,
        });
        const target = await authService.register({
          identifier: `uname-admdup-chg-${randomUUID().slice(0, 8)}`,
          password: "admdup-changer-password-long",
          displayName: "To Be Changed",
          roleId: RoleId.VOLUNTEER,
        });
        const session = await createSession(admin.id);
        const caller = buildCaller(
          authedCtx(admin.id, session, RoleId.ADMIN, true),
        );

        await expectTrpcError(
          caller.profile.adminUpdateUsername({
            userId: target.id,
            newIdentifier: existing.identifier,
          }),
          "CONFLICT",
          "USERNAME_ALREADY_TAKEN",
        );
      });
    });
  },
);
