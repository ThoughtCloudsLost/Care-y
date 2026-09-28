import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomBytes, randomUUID } from "node:crypto";
import { sql, type Kysely } from "kysely";
import { RoleId, TwoFactorMethod, type RoleIdValue } from "@care-y/shared";
import type {
  SessionToken,
  UserId,
  OrgId,
  OrgSchema,
  TicketId,
  KeyGeneration,
} from "@care-y/shared";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  createTestTicketFixture,
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
  createThrowingProviderFactory,
  NO_OPTIONAL_ROUTERS,
  registerMethodDirectly,
  type TestDb,
} from "../test-utils.js";
import { encode, getSodium } from "@care-y/crypto";
import {
  AUTH_ARGON2ID_TEST_PARAMS,
  createPasswordHasher,
} from "../auth/password.js";
import { createAuthService, type AuthService } from "../auth/service.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { createInMemoryTotpReplayCache } from "../auth/totp-replay-cache.js";
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
    const createdOrgIds: OrgId[] = [];
    const createdSchemas: string[] = [];

    const hasher = createPasswordHasher(AUTH_ARGON2ID_TEST_PARAMS);
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
      await getSodium();
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
          // care-y-ignore-next-line ast-pii-in-db-write -- seeding plaintext branding columns (ADR-094)
          name: null,
          logo: null,
          primary_color: null,
          client_text: null,
          pii_retention_days: null,
        })
        .execute();
      await seedOrgPublicKey(tenantDb);

      orgContext = {
        orgId: org.id,
        orgSlug: org.slug,
        orgSchema: testDb.schemaName as OrgSchema,
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
      // Shared by authDeps and twoFactorDeps, matching production wiring.
      const totpReplayCache = createInMemoryTotpReplayCache();
      return createAppRouter({
        ...NO_OPTIONAL_ROUTERS,
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
          providerFactory: createThrowingProviderFactory(),
          resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
          totpReplayCache,
          createAuditSvc: null,
        },
        profileDeps: {
          hasher,
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          tokenizer: testSessionTokenizer,
          passwordChangeLimiter: createInMemoryRateLimiter({
            windowMs: 60_000,
            maxRequests: 100,
          }),
        },
        twoFactorDeps: {
          emailSender: createMockEmailSender(),
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          tokenizer: testSessionTokenizer,
          providerFactory: createThrowingProviderFactory(),
          resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
          pushSender: null,
          pushHmacKey: null,
          totpReplayCache,
          verifyLimiter: createInMemoryRateLimiter({
            windowMs: 60_000,
            maxRequests: 1000,
          }),
        },
        oprfDeps: createMockOprfDeps(),
        orgService,
        providerFactory: createThrowingProviderFactory(),
      });
    }

    function buildCaller(ctx: Context) {
      return createCallerFactory(buildRouter())(ctx);
    }

    async function createSession(userId: UserId): Promise<SessionData> {
      const repo = createDbSessionRepository(
        tenantDb,
        testSessionTokenizer,
        testSealedBox,
      );
      return repo.create({
        token: randomUUID() as SessionToken,
        userId,
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
        expiresAt: new Date(Date.now() + 3_600_000),
      });
    }

    function authedCtx(
      userId: UserId,
      session: SessionData,
      roleId: RoleIdValue = RoleId.VOLUNTEER,
      twofaVerified = false,
    ): Context {
      return {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: twofaVerified ? { ...session, twofaVerified: true } : session,
        user: {
          id: userId,
          encryptedIdentifier: "test-user",
          encryptedDisplayName: "",
          encryptedPreferredLocale: null,
          roleId,
          isActive: true,
          hasSeenBriefing: true,
          mustChangePassword: false,
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
          org: orgContext,
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

    describe("updatePreferredLocale", () => {
      it("updates the preferred locale for the calling user", async () => {
        const user = await createTestUser(tenantDb);
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        const newCiphertext = Buffer.from("new-encrypted-locale").toString(
          "base64",
        );
        const result = await caller.profile.updatePreferredLocale({
          encryptedPreferredLocale: newCiphertext,
        });

        expect(result.success).toBe(true);

        const row = await tenantDb
          .selectFrom("users")
          .select("encrypted_preferred_locale")
          .where("id", "=", user.id)
          .executeTakeFirstOrThrow();

        expect(row.encrypted_preferred_locale?.toString("base64")).toBe(
          newCiphertext,
        );
      });

      it("rejects unauthenticated calls", async () => {
        const caller = buildCaller({
          req: mockReq(),
          res: mockRes(),
          org: orgContext,
          session: null,
          user: null,
        });

        await expectTrpcError(
          caller.profile.updatePreferredLocale({
            encryptedPreferredLocale: "dGVzdA==",
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
          caller.profile.updatePreferredLocale({
            encryptedPreferredLocale: "dGVzdA==",
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
        orgContext.orgId,
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
          testBlindIndexer.hash(newName, orgContext.orgId),
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
        const existingIdentifier = `uname-dup-existing-${randomUUID().slice(0, 8)}`;
        await authService.register({
          identifier: existingIdentifier,
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
            newIdentifier: existingIdentifier,
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
          testBlindIndexer.hash(newName, orgContext.orgId),
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
        const existingIdentifier = `uname-admdup-tgt-${randomUUID().slice(0, 8)}`;
        await authService.register({
          identifier: existingIdentifier,
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
            newIdentifier: existingIdentifier,
          }),
          "CONFLICT",
          "USERNAME_ALREADY_TAKEN",
        );
      });
    });

    describe("changePassword", () => {
      async function seedUserKeys(userId: UserId): Promise<void> {
        await tenantDb
          .insertInto("user_keys")
          .values({
            user_id: userId,
            salt: randomBytes(16),
            vol_public: randomBytes(32),
            rotation_lock: false,
          })
          .execute();
      }

      function makeChangeInput(
        currentPassword: string,
        newPassword: string,
      ): {
        currentPassword: string;
        newPassword: string;
        saltNew: string;
        volPublicNew: string;
        reWrappedKeys: never[];
      } {
        return {
          currentPassword,
          newPassword,
          saltNew: randomBytes(16).toString("base64"),
          volPublicNew: randomBytes(32).toString("base64"),
          reWrappedKeys: [],
        };
      }

      it("updates password hash and rotates keys atomically", async () => {
        const authService = makeAuthService();
        const identifier = `pw-atomic-${randomUUID().slice(0, 8)}`;
        const user = await authService.register({
          identifier,
          password: "old-password-long-enough!!",
          displayName: "Atomic PW",
          roleId: RoleId.VOLUNTEER,
        });
        await seedUserKeys(user.id);
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        const result = await caller.profile.changePassword(
          makeChangeInput(
            "old-password-long-enough!!",
            "new-password-long-enough!!",
          ),
        );

        expect(result.success).toBe(true);

        const row = await tenantDb
          .selectFrom("user_keys")
          .select(["key_version", "rotation_lock"])
          .where("user_id", "=", user.id)
          .executeTakeFirstOrThrow();
        expect(row.key_version).toBe(2);
        expect(row.rotation_lock).toBe(false);
      });

      it("rejects wrong current password without changing anything", async () => {
        const authService = makeAuthService();
        const user = await authService.register({
          identifier: `pw-wrong-${randomUUID().slice(0, 8)}`,
          password: "correct-password-long-enough",
          displayName: "Wrong PW",
          roleId: RoleId.VOLUNTEER,
        });
        await seedUserKeys(user.id);
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        await expectTrpcError(
          caller.profile.changePassword(
            makeChangeInput(
              "wrong-password-long-enough!!",
              "does-not-matter-long-enough",
            ),
          ),
          "UNAUTHORIZED",
          "INVALID_CREDENTIALS",
        );

        const row = await tenantDb
          .selectFrom("user_keys")
          .select("key_version")
          .where("user_id", "=", user.id)
          .executeTakeFirstOrThrow();
        expect(row.key_version).toBe(1);
      });

      it("new password works for login after change", async () => {
        const authService = makeAuthService();
        const identifier = `pw-login-${randomUUID().slice(0, 8)}`;
        const user = await authService.register({
          identifier,
          password: "original-password-long-enough",
          displayName: "Login After PW",
          roleId: RoleId.VOLUNTEER,
        });
        await seedUserKeys(user.id);
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        await caller.profile.changePassword(
          makeChangeInput(
            "original-password-long-enough",
            "brand-new-password-long-enough",
          ),
        );

        const loginResult = await authService.login({
          identifier,
          password: "brand-new-password-long-enough",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
        });
        expect(loginResult.user.id).toBe(user.id);
      });

      it("kills other sessions but preserves the current one", async () => {
        const authService = makeAuthService();
        const user = await authService.register({
          identifier: `pw-sessions-${randomUUID().slice(0, 8)}`,
          password: "session-test-password-long!!",
          displayName: "Session Kill Test",
          roleId: RoleId.VOLUNTEER,
        });
        await seedUserKeys(user.id);

        const currentSession = await createSession(user.id);
        const otherSession1 = await createSession(user.id);
        const otherSession2 = await createSession(user.id);

        const caller = buildCaller(authedCtx(user.id, currentSession));

        await caller.profile.changePassword(
          makeChangeInput(
            "session-test-password-long!!",
            "new-session-test-password!!!!",
          ),
        );

        const repo = createDbSessionRepository(
          tenantDb,
          testSessionTokenizer,
          testSealedBox,
        );
        expect(await repo.findByToken(currentSession.token)).not.toBeNull();
        expect(await repo.findByToken(otherSession1.token)).toBeNull();
        expect(await repo.findByToken(otherSession2.token)).toBeNull();
      });

      /** Inserts a ticket key wrap held by the volunteer. */
      async function insertHeldWrap(
        ticketId: TicketId,
        volunteerId: UserId,
        keyGeneration: KeyGeneration,
      ): Promise<void> {
        // care-y-ignore-next-line no-plaintext-db-write -- test key wrap data, not real cryptographic material
        await tenantDb
          .insertInto("ticket_key_wraps")
          .values({
            ticket_id: ticketId,
            volunteer_id: volunteerId,
            key_generation: keyGeneration,
            ephemeral_point: randomBytes(32),
            nonce: randomBytes(24),
            wrapped_key: randomBytes(48),
            algorithm: "ecies-ristretto255-v1",
          })
          .execute();
      }

      function reWrapInput(
        ticketId: TicketId,
        keyGeneration: KeyGeneration,
      ): {
        ticketId: TicketId;
        keyGeneration: KeyGeneration;
        ephemeralPoint: string;
        nonce: string;
        wrappedKey: string;
      } {
        return {
          ticketId,
          keyGeneration,
          ephemeralPoint: randomBytes(32).toString("base64"),
          nonce: randomBytes(24).toString("base64"),
          wrappedKey: randomBytes(48).toString("base64"),
        };
      }

      async function registerWithKeys(
        prefix: string,
        password: string,
        mustChangePassword = false,
      ): Promise<Awaited<ReturnType<AuthService["register"]>>> {
        const user = await makeAuthService().register({
          identifier: `${prefix}-${randomUUID().slice(0, 8)}`,
          password,
          displayName: prefix,
          roleId: RoleId.VOLUNTEER,
          mustChangePassword,
        });
        await seedUserKeys(user.id);
        return user;
      }

      it("refuses a new password equal to the current one", async () => {
        const password = "unchanged-password-long-enough";
        const user = await registerWithKeys("pw-same", password);
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        await expectTrpcError(
          caller.profile.changePassword(makeChangeInput(password, password)),
          "BAD_REQUEST",
          "PASSWORD_UNCHANGED",
        );

        const row = await tenantDb
          .selectFrom("user_keys")
          .select(["key_version", "rotation_lock"])
          .where("user_id", "=", user.id)
          .executeTakeFirstOrThrow();
        expect(row.key_version).toBe(1);
        expect(row.rotation_lock).toBe(false);
      });

      it("refuses a password-only session when the account has a second factor", async () => {
        const password = "factor-guard-password-long";
        const user = await registerWithKeys("pw-factor", password);
        await registerMethodDirectly(tenantDb, user.id, TwoFactorMethod.TOTP);
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        await expectTrpcError(
          caller.profile.changePassword(
            makeChangeInput(password, "factor-guard-new-password!!"),
          ),
          "UNAUTHORIZED",
          "TWOFA_REQUIRED",
        );

        const row = await tenantDb
          .selectFrom("user_keys")
          .select("key_version")
          .where("user_id", "=", user.id)
          .executeTakeFirstOrThrow();
        expect(row.key_version).toBe(1);
      });

      it("allows a 2FA-verified session when the account has a second factor", async () => {
        const password = "factor-verified-password-l";
        const user = await registerWithKeys("pw-factor-ok", password);
        await registerMethodDirectly(tenantDb, user.id, TwoFactorMethod.TOTP);
        const session = await createSession(user.id);
        const caller = buildCaller(
          authedCtx(user.id, session, RoleId.VOLUNTEER, true),
        );

        const result = await caller.profile.changePassword(
          makeChangeInput(password, "factor-verified-new-password"),
        );
        expect(result.success).toBe(true);
      });

      it("allows a password-only session when the account has no second factor", async () => {
        const password = "no-factor-password-long-e";
        const user = await registerWithKeys("pw-no-factor", password);
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        const result = await caller.profile.changePassword(
          makeChangeInput(password, "no-factor-new-password-long"),
        );
        expect(result.success).toBe(true);
      });

      it("clears must_change_password on success", async () => {
        const password = "temporary-admin-set-password";
        const user = await registerWithKeys("pw-forced", password, true);
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        await caller.profile.changePassword(
          makeChangeInput(password, "self-chosen-password-long-en"),
        );

        const row = await tenantDb
          .selectFrom("users")
          .select("must_change_password")
          .where("id", "=", user.id)
          .executeTakeFirstOrThrow();
        expect(row.must_change_password).toBe(false);
      });

      it("is not blocked by a pending intake_key_wraps row", async () => {
        const password = "intake-pending-password-lo";
        const user = await registerWithKeys("pw-intake", password);
        const fixture = await createTestTicketFixture(tenantDb);
        await tenantDb
          .insertInto("intake_key_wraps")
          .values({
            ticket_id: fixture.ticketId,
            wrapped_tk: Buffer.alloc(80, 0xab),
          })
          .execute();
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        try {
          const result = await caller.profile.changePassword(
            makeChangeInput(password, "intake-pending-new-password"),
          );
          expect(result.success).toBe(true);
        } finally {
          await tenantDb
            .deleteFrom("intake_key_wraps")
            .where("ticket_id", "=", fixture.ticketId)
            .execute();
        }
      });

      it("drops a re-wrap for a deleted ticket and commits the rest", async () => {
        const password = "stale-ticket-password-long";
        const user = await registerWithKeys("pw-stale", password);
        const kept = await createTestTicketFixture(tenantDb);
        const deleted = await createTestTicketFixture(tenantDb);
        const keptGen = randomUUID() as KeyGeneration;
        const deletedGen = randomUUID() as KeyGeneration;
        await insertHeldWrap(kept.ticketId, user.id, keptGen);
        await insertHeldWrap(deleted.ticketId, user.id, deletedGen);
        await tenantDb
          .deleteFrom("tickets")
          .where("id", "=", deleted.ticketId)
          .execute();
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        const result = await caller.profile.changePassword({
          ...makeChangeInput(password, "stale-ticket-new-password-l"),
          reWrappedKeys: [
            reWrapInput(kept.ticketId, keptGen),
            reWrapInput(deleted.ticketId, deletedGen),
          ],
        });
        expect(result.success).toBe(true);

        const wraps = await tenantDb
          .selectFrom("ticket_key_wraps")
          .select("ticket_id")
          .where("volunteer_id", "=", user.id)
          .execute();
        expect(wraps.map((w) => w.ticket_id)).toEqual([kept.ticketId]);
      });

      it("refuses with STALE_KEY_WRAPS when a held wrap is missing and changes nothing", async () => {
        const password = "stale-wraps-password-long-e";
        const user = await registerWithKeys("pw-missing", password);
        const known = await createTestTicketFixture(tenantDb);
        const granted = await createTestTicketFixture(tenantDb);
        const knownGen = randomUUID() as KeyGeneration;
        const grantedGen = randomUUID() as KeyGeneration;
        await insertHeldWrap(known.ticketId, user.id, knownGen);
        // Granted after the client fetched its list.
        await insertHeldWrap(granted.ticketId, user.id, grantedGen);
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        const beforeUser = await tenantDb
          .selectFrom("users")
          .select("password_hash")
          .where("id", "=", user.id)
          .executeTakeFirstOrThrow();
        const beforeKeys = await tenantDb
          .selectFrom("user_keys")
          .select(["salt", "vol_public", "key_version"])
          .where("user_id", "=", user.id)
          .executeTakeFirstOrThrow();
        const beforeWraps = await tenantDb
          .selectFrom("ticket_key_wraps")
          .select(["ticket_id", "wrapped_key"])
          .where("volunteer_id", "=", user.id)
          .orderBy("ticket_id")
          .execute();

        await expectTrpcError(
          caller.profile.changePassword({
            ...makeChangeInput(password, "stale-wraps-new-password-lo"),
            reWrappedKeys: [reWrapInput(known.ticketId, knownGen)],
          }),
          "CONFLICT",
          "STALE_KEY_WRAPS",
        );

        const afterUser = await tenantDb
          .selectFrom("users")
          .select("password_hash")
          .where("id", "=", user.id)
          .executeTakeFirstOrThrow();
        expect(afterUser.password_hash).toBe(beforeUser.password_hash);

        const afterKeys = await tenantDb
          .selectFrom("user_keys")
          .select(["salt", "vol_public", "key_version", "rotation_lock"])
          .where("user_id", "=", user.id)
          .executeTakeFirstOrThrow();
        expect(Buffer.compare(afterKeys.salt, beforeKeys.salt)).toBe(0);
        expect(
          Buffer.compare(
            afterKeys.vol_public ?? Buffer.alloc(0),
            beforeKeys.vol_public ?? Buffer.alloc(0),
          ),
        ).toBe(0);
        expect(afterKeys.key_version).toBe(beforeKeys.key_version);
        // The lock is released on failure, so the volunteer keeps
        // receiving wraps for new tickets.
        expect(afterKeys.rotation_lock).toBe(false);

        const afterWraps = await tenantDb
          .selectFrom("ticket_key_wraps")
          .select(["ticket_id", "wrapped_key"])
          .where("volunteer_id", "=", user.id)
          .orderBy("ticket_id")
          .execute();
        expect(afterWraps).toEqual(beforeWraps);
      });
    });

    describe("myTicketKeyWraps", () => {
      async function insertKeyWrap(
        ticketId: TicketId,
        volunteerId: UserId,
        keyGeneration: KeyGeneration,
      ): Promise<{
        ephemeralPoint: Buffer;
        nonce: Buffer;
        wrappedKey: Buffer;
      }> {
        const ephemeralPoint = randomBytes(32);
        const nonce = randomBytes(24);
        const wrappedKey = randomBytes(48);

        // care-y-ignore-next-line no-plaintext-db-write -- test key wrap data, not real cryptographic material
        await tenantDb
          .insertInto("ticket_key_wraps")
          .values({
            ticket_id: ticketId,
            volunteer_id: volunteerId,
            key_generation: keyGeneration,
            ephemeral_point: ephemeralPoint,
            nonce,
            wrapped_key: wrappedKey,
            algorithm: "ecies-ristretto255-v1",
          })
          .execute();

        return { ephemeralPoint, nonce, wrappedKey };
      }

      it("returns wraps for the calling user only", async () => {
        const user = await createTestUser(tenantDb);
        const otherUser = await createTestUser(tenantDb);
        const session = await createSession(user.id);

        const fixture1 = await createTestTicketFixture(tenantDb);
        const fixture2 = await createTestTicketFixture(tenantDb);
        const fixture3 = await createTestTicketFixture(tenantDb);

        const kg1 = randomUUID() as KeyGeneration;
        const kg2 = randomUUID() as KeyGeneration;
        const kg3 = randomUUID() as KeyGeneration;

        const wrap1 = await insertKeyWrap(fixture1.ticketId, user.id, kg1);
        const wrap2 = await insertKeyWrap(fixture2.ticketId, user.id, kg2);
        await insertKeyWrap(fixture3.ticketId, otherUser.id, kg3);

        const caller = buildCaller(authedCtx(user.id, session));
        const result = await caller.profile.myTicketKeyWraps();

        expect(result).toHaveLength(2);

        const ids = result.map((r) => r.ticketId).sort();
        expect(ids).toEqual([fixture1.ticketId, fixture2.ticketId].sort());

        const first = result.find((r) => r.ticketId === fixture1.ticketId)!;
        expect(first.keyGeneration).toBe(kg1);
        expect(first.ephemeralPoint).toBe(encode(wrap1.ephemeralPoint));
        expect(first.nonce).toBe(encode(wrap1.nonce));
        expect(first.wrappedKey).toBe(encode(wrap1.wrappedKey));

        const second = result.find((r) => r.ticketId === fixture2.ticketId)!;
        expect(second.keyGeneration).toBe(kg2);
        expect(second.ephemeralPoint).toBe(encode(wrap2.ephemeralPoint));
        expect(second.nonce).toBe(encode(wrap2.nonce));
        expect(second.wrappedKey).toBe(encode(wrap2.wrappedKey));
      });

      it("returns empty array when user has no wraps", async () => {
        const user = await createTestUser(tenantDb);
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        const result = await caller.profile.myTicketKeyWraps();

        expect(result).toEqual([]);
      });
    });

    describe("changePassword rate limiting", () => {
      it("returns TOO_MANY_REQUESTS after passwordChangeLimiter exhaustion", async () => {
        const isolatedLimiter = createInMemoryRateLimiter({
          windowMs: 60_000,
          maxRequests: 1,
        });

        function buildRateLimitedRouter() {
          const orgService = createOrgService(
            testDb.platformDb,
            makeTenantDbFactory(testDb.platformDb),
          );
          const totpReplayCache = createInMemoryTotpReplayCache();
          return createAppRouter({
            ...NO_OPTIONAL_ROUTERS,
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
              providerFactory: createThrowingProviderFactory(),
              resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
              totpReplayCache,
              createAuditSvc: null,
            },
            profileDeps: {
              hasher,
              encryptor: testFieldEncryptor,
              indexer: testBlindIndexer,
              tokenizer: testSessionTokenizer,
              passwordChangeLimiter: isolatedLimiter,
            },
            twoFactorDeps: {
              emailSender: createMockEmailSender(),
              encryptor: testFieldEncryptor,
              indexer: testBlindIndexer,
              tokenizer: testSessionTokenizer,
              providerFactory: createThrowingProviderFactory(),
              resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
              pushSender: null,
              pushHmacKey: null,
              totpReplayCache,
              verifyLimiter: createInMemoryRateLimiter({
                windowMs: 60_000,
                maxRequests: 1000,
              }),
            },
            oprfDeps: createMockOprfDeps(),
            orgService,
            providerFactory: createThrowingProviderFactory(),
          });
        }

        const authService = makeAuthService();
        const user = await authService.register({
          identifier: `pw-rl-${randomUUID().slice(0, 8)}`,
          password: "ratelimit-test-password-long",
          displayName: "Rate Limit User",
          roleId: RoleId.VOLUNTEER,
        });
        await tenantDb
          .insertInto("user_keys")
          .values({
            user_id: user.id,
            salt: randomBytes(16),
            vol_public: randomBytes(32),
            rotation_lock: false,
          })
          .execute();
        const session = await createSession(user.id);

        // First call: allowed (but will fail on wrong password, which is fine;
        // the rate limit check happens before the password check).
        const router1 = buildRateLimitedRouter();
        const caller1 = createCallerFactory(router1)(
          authedCtx(user.id, session),
        );
        // First call consumes the single allowed request. The call may
        // succeed or fail on key rotation; we only care that it consumed
        // the rate limit token, not its outcome.
        await caller1.profile
          .changePassword({
            currentPassword: "ratelimit-test-password-long",
            newPassword: "new-ratelimit-password-long!",
            saltNew: randomBytes(16).toString("base64"),
            volPublicNew: randomBytes(32).toString("base64"),
            reWrappedKeys: [],
          })
          .catch((_err: unknown) => undefined);

        // Second call: should hit rate limit.
        const router2 = buildRateLimitedRouter();
        const caller2 = createCallerFactory(router2)(
          authedCtx(user.id, session),
        );
        await expectTrpcError(
          caller2.profile.changePassword({
            currentPassword: "ratelimit-test-password-long",
            newPassword: "new-ratelimit-password-long!",
            saltNew: randomBytes(16).toString("base64"),
            volPublicNew: randomBytes(32).toString("base64"),
            reWrappedKeys: [],
          }),
          "TOO_MANY_REQUESTS",
          "REQUEST_RATE_LIMITED",
        );
      });
    });

    describe("changePassword with reWrappedOrgKey", () => {
      async function seedUserKeys(userId: UserId): Promise<void> {
        await tenantDb
          .insertInto("user_keys")
          .values({
            user_id: userId,
            salt: randomBytes(16),
            vol_public: randomBytes(32),
            rotation_lock: false,
          })
          .execute();
      }

      async function seedWrappedOrgKey(userId: UserId): Promise<void> {
        await tenantDb
          .insertInto("wrapped_org_keys")
          .values({
            user_id: userId,
            ephemeral_point: randomBytes(32),
            nonce: randomBytes(24),
            wrapped_key: randomBytes(48),
          })
          .execute();
      }

      it("triggers org key re-wrap when reWrappedOrgKey is present", async () => {
        const authService = makeAuthService();
        const identifier = `pw-orgkey-${randomUUID().slice(0, 8)}`;
        const user = await authService.register({
          identifier,
          password: "orgkey-change-password-long",
          displayName: "OrgKey PW User",
          roleId: RoleId.VOLUNTEER,
        });
        await seedUserKeys(user.id);
        await seedWrappedOrgKey(user.id);
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        const newEphemeral = randomBytes(32).toString("base64");
        const newNonce = randomBytes(24).toString("base64");
        const newWrapped = randomBytes(48).toString("base64");

        const result = await caller.profile.changePassword({
          currentPassword: "orgkey-change-password-long",
          newPassword: "new-orgkey-change-password-l",
          saltNew: randomBytes(16).toString("base64"),
          volPublicNew: randomBytes(32).toString("base64"),
          reWrappedKeys: [],
          reWrappedOrgKey: {
            ephemeralPoint: newEphemeral,
            nonce: newNonce,
            wrappedKey: newWrapped,
          },
        });

        expect(result.success).toBe(true);

        // Verify that the wrapped_org_keys row was updated.
        const orgKeyRow = await tenantDb
          .selectFrom("wrapped_org_keys")
          .select(["ephemeral_point", "nonce", "wrapped_key"])
          .where("user_id", "=", user.id)
          .executeTakeFirstOrThrow();

        expect(orgKeyRow.ephemeral_point.toString("base64")).toBe(newEphemeral);
        expect(orgKeyRow.nonce.toString("base64")).toBe(newNonce);
        expect(orgKeyRow.wrapped_key.toString("base64")).toBe(newWrapped);
      });
    });

    describe("changePassword rotation lock release", () => {
      it("leaves the rotation lock released so a second change succeeds", async () => {
        const authService = makeAuthService();
        const identifier = `pw-lockrel-${randomUUID().slice(0, 8)}`;
        const user = await authService.register({
          identifier,
          password: "lockrelease-test-password-l",
          displayName: "Lock Release User",
          roleId: RoleId.VOLUNTEER,
        });
        await tenantDb
          .insertInto("user_keys")
          .values({
            user_id: user.id,
            salt: randomBytes(16),
            vol_public: randomBytes(32),
            rotation_lock: false,
          })
          .execute();
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        // The failure path (lock released after a refused rotation) is
        // covered by the STALE_KEY_WRAPS test above. Here a second change
        // must not fail with "Key rotation already in progress", which
        // would mean the first left the lock stuck.

        // First: make a call that succeeds (sets lock, does rotation, releases).
        const result = await caller.profile.changePassword({
          currentPassword: "lockrelease-test-password-l",
          newPassword: "new-lockrelease-password-lon",
          saltNew: randomBytes(16).toString("base64"),
          volPublicNew: randomBytes(32).toString("base64"),
          reWrappedKeys: [],
        });
        expect(result.success).toBe(true);

        // Verify the lock is released after successful rotation.
        const row = await tenantDb
          .selectFrom("user_keys")
          .select("rotation_lock")
          .where("user_id", "=", user.id)
          .executeTakeFirstOrThrow();
        expect(row.rotation_lock).toBe(false);

        // Now do a second changePassword. If the lock had been stuck,
        // acquireLock would throw KeyRotationError.
        const session2 = await createSession(user.id);
        const caller2 = buildCaller(authedCtx(user.id, session2));
        const result2 = await caller2.profile.changePassword({
          currentPassword: "new-lockrelease-password-lon",
          newPassword: "final-lockrelease-password-l",
          saltNew: randomBytes(16).toString("base64"),
          volPublicNew: randomBytes(32).toString("base64"),
          reWrappedKeys: [],
        });
        expect(result2.success).toBe(true);
      });
    });

    describe("markBriefingSeen", () => {
      it("marks the calling user's briefing as seen", async () => {
        const user = await createTestUser(tenantDb, {
          overrides: { has_seen_briefing: false },
        });
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        const before = await tenantDb
          .selectFrom("users")
          .select("has_seen_briefing")
          .where("id", "=", user.id)
          .executeTakeFirstOrThrow();
        expect(before.has_seen_briefing).toBe(false);

        const result = await caller.profile.markBriefingSeen();
        expect(result).toEqual({ success: true });

        const after = await tenantDb
          .selectFrom("users")
          .select("has_seen_briefing")
          .where("id", "=", user.id)
          .executeTakeFirstOrThrow();
        expect(after.has_seen_briefing).toBe(true);
      });
    });
  },
);
