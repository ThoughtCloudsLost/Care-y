/**
 * Integration tests for the two-factor tRPC router.
 *
 * Tests the tRPC wiring layer: auth middleware enforcement, input validation,
 * error mapping via throwAsTrpc, and the deriveOrigin helper. The underlying
 * TwoFactorService is at 100% coverage already; these tests exercise the
 * route-level plumbing.
 *
 * Requires DATABASE_URL (runs inside Docker container via pnpm test:server:db).
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import {
  createTestDb,
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
  createMockProviderFactory,
  createMockTelephonyProvider,
  createTestUser,
  createTestSession,
  enrollTotp,
  extractEmailCode,
  type TestDb,
  type MockEmailSender,
} from "../test-utils.js";
import { createScryptHasher } from "../auth/password.js";
import { _resetEnvCache } from "../env.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { createInMemoryTotpReplayCache } from "../auth/totp-replay-cache.js";
import { createDbSessionRepository } from "../auth/session-repository.js";
import { createAuthService } from "../auth/service.js";
import { createOrgService } from "../org/service.js";
import { createAppRouter } from "./router.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import { createTwoFactorService } from "../auth/two-factor-service.js";
import { createEmailCodeService } from "../auth/email-code.js";
import { generateTotpCode, base32Decode } from "../auth/totp.js";
import { TwoFactorMethod } from "@care-y/shared";
import * as webauthnVerify from "../auth/webauthn/verify.js";

function makeTenantDbFactory(
  platformDb: Kysely<PlatformDatabase>,
): (schema: string) => Kysely<TenantDatabase> {
  return (schema: string) =>
    platformDb.withSchema(schema) as unknown as Kysely<TenantDatabase>;
}

describe.skipIf(!process.env.DATABASE_URL)(
  "two-factor router (DB integration)",
  () => {
    let testDb: TestDb;
    let tenantDb: Kysely<TenantDatabase>;
    let orgContext: OrgContext;
    let mockEmail: MockEmailSender;

    const createdOrgIds: string[] = [];
    const createdSchemas: string[] = [];

    const hasher = createScryptHasher();
    const loginLimiter = createInMemoryRateLimiter({
      windowMs: 60_000,
      maxRequests: 20,
    });
    const saltLimiter = createInMemoryRateLimiter({
      windowMs: 60_000,
      maxRequests: 20,
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
      const org = await orgService.createOrg({ slug: `test-2fa-${suffix}` });
      createdOrgIds.push(org.id);
      createdSchemas.push(org.schemaName);

      // Seed org_config + public key for session creation
      await tenantDb
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
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

    // --- Router + caller factories ---

    function buildRouter(emailSender?: MockEmailSender) {
      mockEmail = emailSender ?? createMockEmailSender();
      const orgService = createOrgService(
        testDb.platformDb,
        makeTenantDbFactory(testDb.platformDb),
      );
      // Shared by authDeps and twoFactorDeps, matching production wiring.
      const totpReplayCache = createInMemoryTotpReplayCache();
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
          emailSender: mockEmail,
          providerFactory: createThrowingProviderFactory(),
          resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
          totpReplayCache,
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
          emailSender: mockEmail,
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          tokenizer: testSessionTokenizer,
          providerFactory: createThrowingProviderFactory(),
          resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
          pushSender: null,
          pushHmacKey: null,
          totpReplayCache,
        },
        oprfDeps: createMockOprfDeps(),
        orgService,
        providerFactory: createThrowingProviderFactory(),
      });
    }

    /** Unauthenticated caller (session: null, user: null). */
    function createTestCaller() {
      const appRouter = buildRouter();
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

    /** Authed caller with twofaVerified: false. */
    function createAuthedCaller(
      user: {
        id: string;
        encryptedIdentifier: string;
        encryptedDisplayName: string;
        encryptedPreferredLocale: string | null;
        roleId: string;
        isActive: boolean;
        hasSeenBriefing: boolean;
      },
      sessionToken: string,
      emailSender?: MockEmailSender,
    ) {
      const appRouter = buildRouter(emailSender);
      const factory = createCallerFactory(appRouter);
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: {
          id: "test-session-id",
          token: sessionToken,
          userId: user.id,
          ipToken: "test-ip-token",
          uaToken: "test-ua-token",
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          twofaVerified: false,
          webauthnChallenge: null,
        },
        user,
      };
      return { caller: factory(ctx), emailSender: mockEmail };
    }

    /** Authed caller with twofaVerified: true (for methods sub-router). */
    function createVerifiedCaller(
      user: {
        id: string;
        encryptedIdentifier: string;
        encryptedDisplayName: string;
        encryptedPreferredLocale: string | null;
        roleId: string;
        isActive: boolean;
        hasSeenBriefing: boolean;
      },
      sessionToken: string,
    ) {
      const appRouter = buildRouter();
      const factory = createCallerFactory(appRouter);
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: {
          id: "test-session-id",
          token: sessionToken,
          userId: user.id,
          ipToken: "test-ip-token",
          uaToken: "test-ua-token",
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          twofaVerified: true,
          webauthnChallenge: null,
        },
        user,
      };
      return factory(ctx);
    }

    /** Creates a registered user via the auth service and returns the user record. */
    async function registerUser(suffix: string) {
      const sessions = createDbSessionRepository(
        tenantDb,
        testSessionTokenizer,
        testSealedBox,
      );
      const authService = createAuthService(
        tenantDb,
        hasher,
        sessions,
        testFieldEncryptor,
        testSealedBox,
        testBlindIndexer,
        testSessionTokenizer,
        orgContext.orgId,
      );
      return authService.register({
        identifier: `2fa-user-${suffix}`,
        password: "test-password-long-enough",
        displayName: `2FA User ${suffix}`,
        roleId: "volunteer",
      });
    }

    /** Creates a TwoFactorService scoped to the test tenant DB. */
    function makeTwoFactorService(emailSender?: MockEmailSender) {
      const sessions = createDbSessionRepository(
        tenantDb,
        testSessionTokenizer,
        testSealedBox,
      );
      const emailCodes = createEmailCodeService(
        tenantDb,
        emailSender ?? createMockEmailSender(),
      );
      return createTwoFactorService(
        tenantDb,
        sessions,
        emailCodes,
        testFieldEncryptor,
        "CARE-Y",
        { cache: createInMemoryTotpReplayCache(), orgId: orgContext.orgId },
      );
    }

    // =========================================================================
    // 1. Auth enforcement
    // =========================================================================

    describe("auth enforcement", () => {
      it("twoFactor.status rejects unauthenticated caller", async () => {
        const caller = createTestCaller();
        await expectTrpcError(
          caller.twoFactor.status(),
          "UNAUTHORIZED",
          "NOT_AUTHENTICATED",
        );
      });

      it("twoFactor.enroll.totpSetup rejects unauthenticated caller", async () => {
        const caller = createTestCaller();
        await expectTrpcError(
          caller.twoFactor.enroll.totpSetup(),
          "UNAUTHORIZED",
          "NOT_AUTHENTICATED",
        );
      });

      it("twoFactor.methods.list rejects caller with twofaVerified: false", async () => {
        const user = await registerUser("auth-2fa");
        const { caller } = createAuthedCaller(user, "auth-2fa-token");
        await expectTrpcError(
          caller.twoFactor.methods.list(),
          "UNAUTHORIZED",
          "TWOFA_REQUIRED",
        );
      });
    });

    // =========================================================================
    // 2. TOTP enrollment flow
    // =========================================================================

    describe("enroll.totp", () => {
      it("totpSetup returns secret and uri with valid base32/otpauth format", async () => {
        const user = await registerUser("totp-setup");
        const { caller } = createAuthedCaller(user, "totp-setup-token");
        const result = await caller.twoFactor.enroll.totpSetup();

        expect(result).toBeDefined();
        expect(result!.secret).toMatch(/^[A-Z2-7]+$/);
        expect(result!.uri).toMatch(/^otpauth:\/\/totp\//);
        expect(result!.uri).toContain("CARE-Y");
      });

      it("totpVerify accepts valid TOTP code after setup", async () => {
        const user = await registerUser("totp-verify-ok");
        const { caller } = createAuthedCaller(user, "totp-verify-ok-token");

        const setup = await caller.twoFactor.enroll.totpSetup();
        const secret = base32Decode(setup!.secret);
        const validCode = generateTotpCode(secret, Date.now());

        const result = await caller.twoFactor.enroll.totpVerify({
          code: validCode,
        });
        expect(result).toEqual({ success: true });
      });

      it("totpVerify returns success: false for wrong code", async () => {
        const user = await registerUser("totp-verify-bad");
        const { caller } = createAuthedCaller(user, "totp-verify-bad-token");

        await caller.twoFactor.enroll.totpSetup();

        const result = await caller.twoFactor.enroll.totpVerify({
          code: "000000",
        });
        expect(result).toEqual({ success: false });
      });
    });

    // =========================================================================
    // 3. Email enrollment flow
    // =========================================================================

    describe("enroll.email", () => {
      it("emailSend sends email and returns sent: true", async () => {
        const emailSender = createMockEmailSender();
        // Create user with notification email set
        const user = await createTestUser(tenantDb, {
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          orgId: orgContext.orgId,
          overrides: {
            encrypted_notification_addr:
              testFieldEncryptor.encrypt("user@example.com"),
            password_hash: "scrypt:" + "aa".repeat(16) + ":" + "bb".repeat(64),
          },
        });
        const userRecord = {
          id: user.id,
          encryptedIdentifier: "email-send-user",
          encryptedDisplayName: "Email Send User",
          encryptedPreferredLocale: null,
          roleId: user.role_id,
          isActive: user.is_active,
          hasSeenBriefing: user.has_seen_briefing,
        };

        const { caller } = createAuthedCaller(
          userRecord,
          "email-send-token",
          emailSender,
        );
        const result = await caller.twoFactor.enroll.emailSend({
          email: "user@example.com",
        });

        expect(result).toEqual({ sent: true });
        expect(emailSender.calls).toHaveLength(1);
        expect(emailSender.calls[0]!.to).toBe("user@example.com");
      });

      it("emailVerify returns success: true with valid code", async () => {
        const emailSender = createMockEmailSender();
        const user = await createTestUser(tenantDb, {
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          orgId: orgContext.orgId,
          overrides: {
            encrypted_notification_addr:
              testFieldEncryptor.encrypt("verify@example.com"),
            password_hash: "scrypt:" + "aa".repeat(16) + ":" + "bb".repeat(64),
          },
        });
        const userRecord = {
          id: user.id,
          encryptedIdentifier: "email-verify-user",
          encryptedDisplayName: "Email Verify User",
          encryptedPreferredLocale: null,
          roleId: user.role_id,
          isActive: user.is_active,
          hasSeenBriefing: user.has_seen_briefing,
        };

        // Send the email to get the code
        const { caller } = createAuthedCaller(
          userRecord,
          "email-verify-token",
          emailSender,
        );
        await caller.twoFactor.enroll.emailSend({
          email: "verify@example.com",
        });

        // Extract code from email body
        const code = extractEmailCode(emailSender.calls[0]!.text);

        const result = await caller.twoFactor.enroll.emailVerify({ code });
        expect(result).toEqual({ success: true });
      });
    });

    // =========================================================================
    // 4. Backup codes
    // =========================================================================

    describe("enroll.backupCodes", () => {
      it("returns 8 formatted backup codes", async () => {
        const user = await registerUser("backup-codes");
        const { caller } = createAuthedCaller(user, "backup-codes-token");

        const result = await caller.twoFactor.enroll.backupCodes();
        expect(result).toBeDefined();
        expect(result!.codes).toHaveLength(8);
        // Each code should be formatted (contains a dash separator)
        for (const code of result!.codes) {
          expect(code).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
        }
      });
    });

    // =========================================================================
    // 5. Status
    // =========================================================================

    describe("status", () => {
      it("returns not enrolled for fresh user", async () => {
        const user = await registerUser("status-fresh");
        const { caller } = createAuthedCaller(user, "status-fresh-token");

        const result = await caller.twoFactor.status();
        expect(result).toBeDefined();
        expect(result!.enrolled).toBe(false);
        expect(result!.methods).toEqual([]);
        expect(result!.backupCodesRemaining).toBe(0);
      });

      it("returns enrolled info after TOTP enrollment", async () => {
        const user = await registerUser("status-enrolled");
        const { caller } = createAuthedCaller(user, "status-enrolled-token");

        // Enroll TOTP
        const setup = await caller.twoFactor.enroll.totpSetup();
        const secret = base32Decode(setup!.secret);
        const validCode = generateTotpCode(secret, Date.now());
        await caller.twoFactor.enroll.totpVerify({ code: validCode });

        const result = await caller.twoFactor.status();
        expect(result!.enrolled).toBe(true);
        expect(result!.methods.length).toBeGreaterThanOrEqual(1);
        expect(
          result!.methods.some((m) => m.type === TwoFactorMethod.TOTP),
        ).toBe(true);
      });
    });

    // =========================================================================
    // 6. Verification flow
    // =========================================================================

    describe("verify", () => {
      it("verify.totp marks session verified on valid code", async () => {
        const user = await registerUser("verify-totp");
        // Enroll TOTP via service (bypass route, already tested)
        const twoFactor = makeTwoFactorService();
        const secret = await enrollTotp(twoFactor, user.id);

        // Create a real session in the DB (must use testFieldEncryptor to
        // match the encryptor the route handler uses internally)
        const session = await createTestSession(
          tenantDb,
          { user_id: user.id },
          testFieldEncryptor,
        );

        const { caller } = createAuthedCaller(user, session.token);
        const code = generateTotpCode(secret, Date.now());
        const result = await caller.twoFactor.verify.totp({ code });
        expect(result).toEqual({ success: true });

        // Check session is marked verified in DB
        const sessions = createDbSessionRepository(
          tenantDb,
          testSessionTokenizer,
          testSealedBox,
        );
        const updated = await sessions.findByToken(session.token);
        expect(updated?.twofaVerified).toBe(true);
      });

      it("verify.backupCode marks session verified on valid backup code", async () => {
        const user = await registerUser("verify-backup");
        const twoFactor = makeTwoFactorService();
        // Need at least one method enrolled for backup codes to work
        await enrollTotp(twoFactor, user.id);
        const backupResult = await twoFactor.generateBackupCodes(user.id);

        const session = await createTestSession(
          tenantDb,
          { user_id: user.id },
          testFieldEncryptor,
        );

        const { caller } = createAuthedCaller(user, session.token);
        const firstCode = backupResult.codes[0];
        expect(firstCode).toBeDefined();
        const result = await caller.twoFactor.verify.backupCode({
          code: firstCode as string,
        });
        expect(result).toEqual({ success: true });

        const sessions = createDbSessionRepository(
          tenantDb,
          testSessionTokenizer,
          testSealedBox,
        );
        const updated = await sessions.findByToken(session.token);
        expect(updated?.twofaVerified).toBe(true);
      });

      it("verify.emailComplete marks session verified on valid email code", async () => {
        const emailSender = createMockEmailSender();
        const user = await createTestUser(tenantDb, {
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          orgId: orgContext.orgId,
          overrides: {
            encrypted_notification_addr: testFieldEncryptor.encrypt(
              "verify-email@example.com",
            ),
            password_hash: "scrypt:" + "aa".repeat(16) + ":" + "bb".repeat(64),
          },
        });
        const userRecord = {
          id: user.id,
          encryptedIdentifier: "verify-email-user",
          encryptedDisplayName: "Verify Email User",
          encryptedPreferredLocale: null,
          roleId: user.role_id,
          isActive: user.is_active,
          hasSeenBriefing: user.has_seen_briefing,
        };

        // Enroll email 2FA first (need the method registered)
        const twoFactor = makeTwoFactorService(emailSender);
        const emailCodes = createEmailCodeService(tenantDb, emailSender);
        const email = await twoFactor.resolveUserEmail(user.id);
        await emailCodes.sendCode(user.id, email);
        const enrollCode = extractEmailCode(emailSender.calls[0]!.text);
        await twoFactor.verifyEmailEnrollment(user.id, enrollCode);

        // Now do the verification flow via route
        const session = await createTestSession(
          tenantDb,
          { user_id: user.id },
          testFieldEncryptor,
        );

        const { caller, emailSender: routeEmailSender } = createAuthedCaller(
          userRecord,
          session.token,
          emailSender,
        );

        // Send code via verify route
        await caller.twoFactor.verify.emailSend();
        const lastCall =
          routeEmailSender.calls[routeEmailSender.calls.length - 1];
        const verifyCode = extractEmailCode(lastCall!.text);

        const result = await caller.twoFactor.verify.emailComplete({
          code: verifyCode,
        });
        expect(result).toEqual({ success: true });

        const sessions = createDbSessionRepository(
          tenantDb,
          testSessionTokenizer,
          testSealedBox,
        );
        const updated = await sessions.findByToken(session.token);
        expect(updated?.twofaVerified).toBe(true);
      });
    });

    // =========================================================================
    // 7. Methods management
    // =========================================================================

    describe("methods", () => {
      it("methods.list returns enrolled methods with verified caller", async () => {
        const user = await registerUser("methods-list");
        const twoFactor = makeTwoFactorService();
        await enrollTotp(twoFactor, user.id);

        const caller = createVerifiedCaller(user, "methods-list-token");
        const result = await caller.twoFactor.methods.list();
        expect(result).toBeDefined();
        expect(result!.enrolled).toBe(true);
        expect(result!.methods.length).toBeGreaterThanOrEqual(1);
      });

      it("methods.remove removes a method when another exists", async () => {
        const emailSender = createMockEmailSender();
        const user = await createTestUser(tenantDb, {
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          orgId: orgContext.orgId,
          overrides: {
            encrypted_notification_addr: testFieldEncryptor.encrypt(
              "remove-test@example.com",
            ),
            password_hash: "scrypt:" + "aa".repeat(16) + ":" + "bb".repeat(64),
          },
        });
        const userRecord = {
          id: user.id,
          encryptedIdentifier: "methods-remove-user",
          encryptedDisplayName: "Methods Remove User",
          encryptedPreferredLocale: null,
          roleId: user.role_id,
          isActive: user.is_active,
          hasSeenBriefing: user.has_seen_briefing,
        };

        // Enroll TOTP + EMAIL (two methods, so one can be removed)
        const twoFactor = makeTwoFactorService(emailSender);
        await enrollTotp(twoFactor, user.id);
        const emailCodes = createEmailCodeService(tenantDb, emailSender);
        const email = await twoFactor.resolveUserEmail(user.id);
        await emailCodes.sendCode(user.id, email);
        const code = extractEmailCode(emailSender.calls[0]!.text);
        await twoFactor.verifyEmailEnrollment(user.id, code);

        const caller = createVerifiedCaller(userRecord, "methods-remove-token");
        const result = await caller.twoFactor.methods.remove({
          method: TwoFactorMethod.EMAIL,
        });
        expect(result).toEqual({ success: true });

        // Verify email method is gone
        const status = await caller.twoFactor.methods.list();
        expect(
          status!.methods.some((m) => m.type === TwoFactorMethod.EMAIL),
        ).toBe(false);
        // TOTP should still be there
        expect(
          status!.methods.some((m) => m.type === TwoFactorMethod.TOTP),
        ).toBe(true);
      });

      it("methods.remove rejects removing last method", async () => {
        const user = await registerUser("methods-remove-last");
        const twoFactor = makeTwoFactorService();
        await enrollTotp(twoFactor, user.id);

        const caller = createVerifiedCaller(user, "methods-remove-last-token");
        await expectTrpcError(
          caller.twoFactor.methods.remove({ method: TwoFactorMethod.TOTP }),
          "BAD_REQUEST",
        );
      });
    });

    // =========================================================================
    // 8. deriveOrigin helper
    // =========================================================================

    // =========================================================================
    // 8. markVerifiedOnFirstEnrollment
    // =========================================================================

    describe("enroll.markVerifiedOnFirstEnrollment", () => {
      it("marks session verified when at least one method is enrolled", async () => {
        const user = await registerUser("mark-verified-ok");
        const session = await createTestSession(
          tenantDb,
          { user_id: user.id },
          testFieldEncryptor,
        );
        const { caller } = createAuthedCaller(user, session.token);

        const setup = await caller.twoFactor.enroll.totpSetup();
        const secret = base32Decode(setup!.secret);
        const validCode = generateTotpCode(secret, Date.now());
        await caller.twoFactor.enroll.totpVerify({ code: validCode });

        const result =
          await caller.twoFactor.enroll.markVerifiedOnFirstEnrollment();
        expect(result!.success).toBe(true);

        const sessions = createDbSessionRepository(
          tenantDb,
          testSessionTokenizer,
          testSealedBox,
        );
        const updatedSession = await sessions.findByToken(session.token);
        expect(updatedSession!.twofaVerified).toBe(true);
      });

      it("rejects when no methods are enrolled", async () => {
        const user = await registerUser("mark-verified-no-methods");
        const session = await createTestSession(
          tenantDb,
          { user_id: user.id },
          testFieldEncryptor,
        );
        const { caller } = createAuthedCaller(user, session.token);

        await expectTrpcError(
          caller.twoFactor.enroll.markVerifiedOnFirstEnrollment(),
          "PRECONDITION_FAILED",
        );
      });

      it("is idempotent when session is already verified", async () => {
        const user = await registerUser("mark-verified-idempotent");
        const session = await createTestSession(
          tenantDb,
          { user_id: user.id },
          testFieldEncryptor,
        );
        const { caller } = createAuthedCaller(user, session.token);

        const setup = await caller.twoFactor.enroll.totpSetup();
        const secret = base32Decode(setup!.secret);
        const validCode = generateTotpCode(secret, Date.now());
        await caller.twoFactor.enroll.totpVerify({ code: validCode });

        await caller.twoFactor.enroll.markVerifiedOnFirstEnrollment();
        const result =
          await caller.twoFactor.enroll.markVerifiedOnFirstEnrollment();
        expect(result!.success).toBe(true);
      });
    });

    // =========================================================================
    // 9. deriveOrigin
    // =========================================================================

    describe("deriveOrigin", () => {
      /** Valid registration input that passes the Zod schema. */
      function fakeRegistrationInput(id: string) {
        return {
          id,
          rawId: Buffer.from(id).toString("base64"),
          type: "public-key" as const,
          authenticatorAttachment: "platform" as const,
          response: {
            clientDataJSON: "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIn0",
            attestationObject: "o2NmbXRkbm9uZQ",
            authenticatorData: "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2M",
            publicKey: "pQECAyYgASFYIJK-2epPEw0fHy8lsU-FFFMvYNaDkkXEn...",
            publicKeyAlgorithm: -7,
          },
        };
      }

      /** Mock return value matching RegistrationResult type. */
      function fakeRegistrationResult(credId: string) {
        return {
          credential: {
            id: credId,
            publicKey: "test-pk",
            algorithm: "ES256" as const,
            transports: ["internal"],
          },
          authenticator: {
            aaguid: "00000000-0000-0000-0000-000000000000",
            signCount: 0,
          },
          synced: false,
          userVerified: true,
        };
      }

      it("uses CORS_ORIGIN or localhost fallback in development", async () => {
        const prevEnv = process.env.NODE_ENV;
        const prevCors = process.env.CORS_ORIGIN;
        process.env.NODE_ENV = "development";
        process.env.CORS_ORIGIN = "http://localhost:3000";
        _resetEnvCache();

        try {
          const user = await registerUser("origin-dev");
          const session = await createTestSession(
            tenantDb,
            { user_id: user.id },
            testFieldEncryptor,
          );

          const spy = vi
            .spyOn(webauthnVerify, "verifyRegistration")
            .mockResolvedValue(fakeRegistrationResult("test-cred-dev"));

          const { caller } = createAuthedCaller(user, session.token);

          // Get registration options (sets challenge on session)
          await caller.twoFactor.enroll.webauthnOptions();

          // Verify registration (route calls deriveOrigin internally)
          await caller.twoFactor.enroll.webauthnVerify(
            fakeRegistrationInput("test-cred-dev"),
          );

          // deriveOrigin is unexported, so the spy on verifyRegistration is the only test point.
          // The origin value is security-critical for WebAuthn RP binding: wrong origin allows cross-origin credential use.
          expect(spy).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              origin: "http://localhost:3000",
            }),
          );

          spy.mockRestore();
        } finally {
          process.env.NODE_ENV = prevEnv;
          if (prevCors === undefined) {
            delete process.env.CORS_ORIGIN;
          } else {
            process.env.CORS_ORIGIN = prevCors;
          }
          _resetEnvCache();
        }
      });

      it("uses https://<slug>.care-y.app in production", async () => {
        const prevEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";
        _resetEnvCache();

        try {
          const user = await registerUser("origin-prod");
          const session = await createTestSession(
            tenantDb,
            { user_id: user.id },
            testFieldEncryptor,
          );

          const spy = vi
            .spyOn(webauthnVerify, "verifyRegistration")
            .mockResolvedValue(fakeRegistrationResult("test-cred-prod"));

          const { caller } = createAuthedCaller(user, session.token);
          await caller.twoFactor.enroll.webauthnOptions();

          await caller.twoFactor.enroll.webauthnVerify(
            fakeRegistrationInput("test-cred-prod"),
          );

          // deriveOrigin is unexported, so the spy on verifyRegistration is the only test point.
          // The origin value is security-critical for WebAuthn RP binding: wrong origin allows cross-origin credential use.
          expect(spy).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              origin: `https://${orgContext.orgSlug}.care-y.app`,
            }),
          );

          spy.mockRestore();
        } finally {
          process.env.NODE_ENV = prevEnv;
          _resetEnvCache();
        }
      });
    });

    // =========================================================================
    // 10. SMS enrollment and verification routes
    // =========================================================================

    describe("enroll.smsSend and verify.smsSend (smsCodes null)", () => {
      it("enroll.smsSend rejects with PRECONDITION_FAILED when smsCodes is null", async () => {
        const user = await registerUser("sms-enroll-null");
        const { caller } = createAuthedCaller(user, "sms-enroll-null-token");
        await expectTrpcError(
          caller.twoFactor.enroll.smsSend({ phone: "+15551110000" }),
          "PRECONDITION_FAILED",
        );
      });

      it("verify.smsSend rejects with PRECONDITION_FAILED when smsCodes is null", async () => {
        const user = await registerUser("sms-verify-null");
        const { caller } = createAuthedCaller(user, "sms-verify-null-token");
        await expectTrpcError(
          caller.twoFactor.verify.smsSend(),
          "PRECONDITION_FAILED",
        );
      });
    });

    describe("SMS-enabled routes", () => {
      const mockProvider = createMockTelephonyProvider();

      /** Builds a router with a mock telephony provider so smsCodes is non-null. */
      function buildRouterWithSms(emailSender?: MockEmailSender) {
        mockEmail = emailSender ?? createMockEmailSender();
        const orgService = createOrgService(
          testDb.platformDb,
          makeTenantDbFactory(testDb.platformDb),
        );
        const totpReplayCache = createInMemoryTotpReplayCache();
        const smsProviderFactory = createMockProviderFactory({
          getProvider: vi.fn().mockResolvedValue(mockProvider),
        });
        return createAppRouter({
          authDeps: {
            hasher,
            loginLimiter: createInMemoryRateLimiter({
              windowMs: 60_000,
              maxRequests: 100,
            }),
            saltLimiter,
            fakeSaltKey,
            encryptor: testFieldEncryptor,
            indexer: testBlindIndexer,
            tokenizer: testSessionTokenizer,
            isSecureCookie: false,
            emailSender: mockEmail,
            providerFactory: createThrowingProviderFactory(),
            resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
            totpReplayCache,
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
            emailSender: mockEmail,
            encryptor: testFieldEncryptor,
            indexer: testBlindIndexer,
            tokenizer: testSessionTokenizer,
            providerFactory: smsProviderFactory,
            resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
            pushSender: null,
            pushHmacKey: null,
            totpReplayCache,
          },
          oprfDeps: createMockOprfDeps(),
          orgService,
          providerFactory: createThrowingProviderFactory(),
        });
      }

      function createSmsAuthedCaller(
        user: {
          id: string;
          encryptedIdentifier: string;
          encryptedDisplayName: string;
          encryptedPreferredLocale: string | null;
          roleId: string;
          isActive: boolean;
          hasSeenBriefing: boolean;
        },
        sessionToken: string,
        emailSender?: MockEmailSender,
      ) {
        const appRouter = buildRouterWithSms(emailSender);
        const factory = createCallerFactory(appRouter);
        const ctx: Context = {
          req: mockReq(),
          res: mockRes(),
          org: orgContext,
          session: {
            id: "test-session-id",
            token: sessionToken,
            userId: user.id,
            ipToken: "test-ip-token",
            uaToken: "test-ua-token",
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            twofaVerified: false,
            webauthnChallenge: null,
          },
          user,
        };
        return { caller: factory(ctx), emailSender: mockEmail };
      }

      describe("enroll.smsVerify", () => {
        it("returns success: true when SMS code is valid", async () => {
          const user = await registerUser("sms-enroll-ok");
          const session = await createTestSession(
            tenantDb,
            { user_id: user.id },
            testFieldEncryptor,
          );
          const { caller } = createSmsAuthedCaller(user, session.token);

          // Enroll phone (sends code via mock provider)
          await caller.twoFactor.enroll.smsSend({ phone: "+15559990001" });

          // Extract code from the SMS body captured by the mock provider
          const smsBody =
            mockProvider.smsCalls[mockProvider.smsCalls.length - 1]?.body ?? "";
          const codeMatch = /(\d{6})/.exec(smsBody);
          expect(codeMatch).not.toBeNull();
          const code = codeMatch![1] as string;

          const result = await caller.twoFactor.enroll.smsVerify({ code });
          expect(result).toEqual({ success: true });
        });

        it("returns success: false when SMS code is wrong", async () => {
          const user = await registerUser("sms-enroll-bad");
          const session = await createTestSession(
            tenantDb,
            { user_id: user.id },
            testFieldEncryptor,
          );
          const { caller } = createSmsAuthedCaller(user, session.token);

          await caller.twoFactor.enroll.smsSend({ phone: "+15559990002" });

          const result = await caller.twoFactor.enroll.smsVerify({
            code: "000000",
          });
          expect(result).toEqual({ success: false });
        });
      });

      describe("verify.smsComplete", () => {
        it("returns success: true and marks session verified with valid SMS code", async () => {
          const user = await registerUser("sms-verify-ok");
          const session = await createTestSession(
            tenantDb,
            { user_id: user.id },
            testFieldEncryptor,
          );
          const { caller } = createSmsAuthedCaller(user, session.token);

          // Enroll SMS first
          await caller.twoFactor.enroll.smsSend({ phone: "+15559990003" });
          const enrollBody =
            mockProvider.smsCalls[mockProvider.smsCalls.length - 1]?.body ?? "";
          const enrollMatch = /(\d{6})/.exec(enrollBody);
          expect(enrollMatch).not.toBeNull();
          await caller.twoFactor.enroll.smsVerify({
            code: enrollMatch![1] as string,
          });

          // Send verification code
          await caller.twoFactor.verify.smsSend();
          const verifyBody =
            mockProvider.smsCalls[mockProvider.smsCalls.length - 1]?.body ?? "";
          const verifyMatch = /(\d{6})/.exec(verifyBody);
          expect(verifyMatch).not.toBeNull();

          const result = await caller.twoFactor.verify.smsComplete({
            code: verifyMatch![1] as string,
          });
          expect(result).toEqual({ success: true });

          const sessions = createDbSessionRepository(
            tenantDb,
            testSessionTokenizer,
            testSealedBox,
          );
          const updated = await sessions.findByToken(session.token);
          expect(updated?.twofaVerified).toBe(true);
        });

        it("returns success: false with invalid SMS code (session not marked verified)", async () => {
          const user = await registerUser("sms-verify-bad");
          const session = await createTestSession(
            tenantDb,
            { user_id: user.id },
            testFieldEncryptor,
          );
          const { caller } = createSmsAuthedCaller(user, session.token);

          // Enroll SMS
          await caller.twoFactor.enroll.smsSend({ phone: "+15559990004" });
          const enrollBody =
            mockProvider.smsCalls[mockProvider.smsCalls.length - 1]?.body ?? "";
          const enrollMatch = /(\d{6})/.exec(enrollBody);
          expect(enrollMatch).not.toBeNull();
          await caller.twoFactor.enroll.smsVerify({
            code: enrollMatch![1] as string,
          });

          // Send verification code then supply wrong code
          await caller.twoFactor.verify.smsSend();

          const result = await caller.twoFactor.verify.smsComplete({
            code: "000000",
          });
          expect(result).toEqual({ success: false });

          const sessions = createDbSessionRepository(
            tenantDb,
            testSessionTokenizer,
            testSealedBox,
          );
          const updated = await sessions.findByToken(session.token);
          expect(updated?.twofaVerified).toBe(false);
        });
      });
    });

    // =========================================================================
    // 11. Push-enabled routes
    // =========================================================================

    describe("push-enabled routes", () => {
      const pushHmacKey = Buffer.alloc(32, 0xab);

      /** Stub PushNotificationSender that records calls and resolves. */
      const mockPushSender = {
        sendToUsers: vi.fn().mockResolvedValue(undefined),
        removeSubscription: vi.fn().mockResolvedValue(undefined),
      };

      function buildRouterWithPush(emailSender?: MockEmailSender) {
        mockEmail = emailSender ?? createMockEmailSender();
        const orgService = createOrgService(
          testDb.platformDb,
          makeTenantDbFactory(testDb.platformDb),
        );
        const totpReplayCache = createInMemoryTotpReplayCache();
        return createAppRouter({
          authDeps: {
            hasher,
            loginLimiter: createInMemoryRateLimiter({
              windowMs: 60_000,
              maxRequests: 100,
            }),
            saltLimiter,
            fakeSaltKey,
            encryptor: testFieldEncryptor,
            indexer: testBlindIndexer,
            tokenizer: testSessionTokenizer,
            isSecureCookie: false,
            emailSender: mockEmail,
            providerFactory: createThrowingProviderFactory(),
            resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
            totpReplayCache,
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
            emailSender: mockEmail,
            encryptor: testFieldEncryptor,
            indexer: testBlindIndexer,
            tokenizer: testSessionTokenizer,
            providerFactory: createThrowingProviderFactory(),
            resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
            pushSender: mockPushSender,
            pushHmacKey,
            totpReplayCache,
          },
          oprfDeps: createMockOprfDeps(),
          orgService,
          providerFactory: createThrowingProviderFactory(),
        });
      }

      function createPushAuthedCaller(
        user: {
          id: string;
          encryptedIdentifier: string;
          encryptedDisplayName: string;
          encryptedPreferredLocale: string | null;
          roleId: string;
          isActive: boolean;
          hasSeenBriefing: boolean;
        },
        sessionToken: string,
      ) {
        const appRouter = buildRouterWithPush();
        const factory = createCallerFactory(appRouter);
        const ctx: Context = {
          req: mockReq(),
          res: mockRes(),
          org: orgContext,
          session: {
            id: "test-session-id",
            token: sessionToken,
            userId: user.id,
            ipToken: "test-ip-token",
            uaToken: "test-ua-token",
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            twofaVerified: false,
            webauthnChallenge: null,
          },
          user,
        };
        return factory(ctx);
      }

      function createPushVerifiedCaller(
        user: {
          id: string;
          encryptedIdentifier: string;
          encryptedDisplayName: string;
          encryptedPreferredLocale: string | null;
          roleId: string;
          isActive: boolean;
          hasSeenBriefing: boolean;
        },
        sessionToken: string,
      ) {
        const appRouter = buildRouterWithPush();
        const factory = createCallerFactory(appRouter);
        const ctx: Context = {
          req: mockReq(),
          res: mockRes(),
          org: orgContext,
          session: {
            id: "test-session-id",
            token: sessionToken,
            userId: user.id,
            ipToken: "test-ip-token",
            uaToken: "test-ua-token",
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            twofaVerified: true,
            webauthnChallenge: null,
          },
          user,
        };
        return factory(ctx);
      }

      /** Inserts a push subscription so the user has a device to send to. */
      async function seedPushSubscription(userId: string): Promise<void> {
        const uid = randomUUID().slice(0, 8);
        await tenantDb
          .insertInto("push_subscriptions")
          .values({
            user_id: userId,
            endpoint: `https://push.example.com/${uid}`,
            key_p256dh: `p256dh-${uid}`,
            key_auth: `auth-${uid}`,
          })
          .execute();
      }

      describe("enroll.pushVerify", () => {
        it("enrolls push method when user has working subscriptions", async () => {
          const user = await registerUser("push-enroll-ok");
          await seedPushSubscription(user.id);

          const session = await createTestSession(
            tenantDb,
            { user_id: user.id },
            testFieldEncryptor,
          );
          const caller = createPushAuthedCaller(user, session.token);
          const result = await caller.twoFactor.enroll.pushVerify();

          expect(result).toEqual({ success: true });
        });
      });

      describe("verify.pushSend", () => {
        it("sends a push challenge and returns challengeId with sent: true", async () => {
          const user = await registerUser("push-send-ok");
          await seedPushSubscription(user.id);

          const session = await createTestSession(
            tenantDb,
            { user_id: user.id },
            testFieldEncryptor,
          );
          const caller = createPushAuthedCaller(user, session.token);

          const result = await caller.twoFactor.verify.pushSend();
          expect(result.sent).toBe(true);
          expect(result.challengeId).toBeTruthy();
        });
      });

      describe("verify.pushPoll", () => {
        it("returns pending when challenge has not been approved", async () => {
          const user = await registerUser("push-poll-pending");
          await seedPushSubscription(user.id);

          const session = await createTestSession(
            tenantDb,
            { user_id: user.id },
            testFieldEncryptor,
          );
          const caller = createPushAuthedCaller(user, session.token);

          const sendResult = await caller.twoFactor.verify.pushSend();
          const pollResult = await caller.twoFactor.verify.pushPoll({
            challengeId: sendResult.challengeId,
          });

          expect(pollResult.status).toBe("pending");

          // Session should NOT be marked verified
          const sessions = createDbSessionRepository(
            tenantDb,
            testSessionTokenizer,
            testSealedBox,
          );
          const updated = await sessions.findByToken(session.token);
          expect(updated?.twofaVerified).toBe(false);
        });

        it("returns approved and marks session verified when challenge is approved", async () => {
          const user = await registerUser("push-poll-approved");
          await seedPushSubscription(user.id);

          const session = await createTestSession(
            tenantDb,
            { user_id: user.id },
            testFieldEncryptor,
          );
          const caller = createPushAuthedCaller(user, session.token);

          // Send the challenge
          const sendResult = await caller.twoFactor.verify.pushSend();

          // Approve it directly in the DB (simulates the approving device)
          await tenantDb
            .updateTable("push_challenges")
            .set({ status: "approved" })
            .where("id", "=", sendResult.challengeId)
            .execute();

          // Poll should see approved and mark session verified
          const pollResult = await caller.twoFactor.verify.pushPoll({
            challengeId: sendResult.challengeId,
          });
          expect(pollResult.status).toBe("approved");

          const sessions = createDbSessionRepository(
            tenantDb,
            testSessionTokenizer,
            testSealedBox,
          );
          const updated = await sessions.findByToken(session.token);
          expect(updated?.twofaVerified).toBe(true);
        });
      });

      describe("verify.pushApprove", () => {
        it("approves a pending challenge from a verified session", async () => {
          const user = await registerUser("push-approve-ok");
          await seedPushSubscription(user.id);

          // Use an unverified caller to create the challenge
          const session = await createTestSession(
            tenantDb,
            { user_id: user.id },
            testFieldEncryptor,
          );
          const unverifiedCaller = createPushAuthedCaller(user, session.token);
          const sendResult = await unverifiedCaller.twoFactor.verify.pushSend();

          // Use a verified caller (different session) to approve
          const verifiedSession = await createTestSession(
            tenantDb,
            { user_id: user.id },
            testFieldEncryptor,
          );
          const verifiedCaller = createPushVerifiedCaller(
            user,
            verifiedSession.token,
          );
          const result = await verifiedCaller.twoFactor.verify.pushApprove({
            challengeId: sendResult.challengeId,
          });

          expect(result).toEqual({ success: true });
        });
      });

      describe("verify.pushDeny", () => {
        it("denies a pending challenge from a verified session", async () => {
          const user = await registerUser("push-deny-ok");
          await seedPushSubscription(user.id);

          const session = await createTestSession(
            tenantDb,
            { user_id: user.id },
            testFieldEncryptor,
          );
          const unverifiedCaller = createPushAuthedCaller(user, session.token);
          const sendResult = await unverifiedCaller.twoFactor.verify.pushSend();

          const verifiedSession = await createTestSession(
            tenantDb,
            { user_id: user.id },
            testFieldEncryptor,
          );
          const verifiedCaller = createPushVerifiedCaller(
            user,
            verifiedSession.token,
          );
          const result = await verifiedCaller.twoFactor.verify.pushDeny({
            challengeId: sendResult.challengeId,
          });

          expect(result).toEqual({ success: true });
        });
      });
    });

    // =========================================================================
    // 12. WebAuthn assertion (verify) routes
    // =========================================================================

    describe("verify.webauthn", () => {
      /** Valid assertion input that passes the Zod schema. */
      function fakeAssertionInput(credId: string) {
        return {
          id: credId,
          rawId: Buffer.from(credId).toString("base64"),
          type: "public-key" as const,
          authenticatorAttachment: "platform" as const,
          response: {
            clientDataJSON: "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0In0",
            authenticatorData: "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2M",
            signature: "MEUCIQDTest",
            userHandle: null,
          },
        };
      }

      it("verify.webauthnOptions returns a challenge and rpId", async () => {
        const user = await registerUser("webauthn-assert-opts");
        const session = await createTestSession(
          tenantDb,
          { user_id: user.id },
          testFieldEncryptor,
        );
        const { caller } = createAuthedCaller(user, session.token);

        const result = await caller.twoFactor.verify.webauthnOptions();
        expect(result).toBeDefined();
        expect(result!.challenge).toBeTruthy();
        expect(result!.rpId).toBeTruthy();
        expect(result!.allowCredentials).toBeDefined();
      });

      it("verify.webauthnComplete marks session verified on valid assertion", async () => {
        const user = await registerUser("webauthn-assert-ok");
        const session = await createTestSession(
          tenantDb,
          { user_id: user.id },
          testFieldEncryptor,
        );
        const { caller } = createAuthedCaller(user, session.token);

        // Seed a credential row so the service's DB lookup succeeds
        await tenantDb
          .insertInto("webauthn_credentials")
          .values({
            user_id: user.id,
            credential_id: "test-cred-assert",
            public_key: "fakePubKeyBase64url",
            sign_count: 0,
            ordinal: 1,
          })
          .execute();

        // Request assertion options (stores challenge on session)
        await caller.twoFactor.verify.webauthnOptions();

        // Mock the verifyAuthentication function to return a valid result
        const spy = vi
          .spyOn(webauthnVerify, "verifyAuthentication")
          .mockResolvedValue({
            credentialId: "test-cred-assert",
            userVerified: true,
            signCount: 1,
          });

        await caller.twoFactor.verify.webauthnComplete(
          fakeAssertionInput("test-cred-assert"),
        );

        expect(spy).toHaveBeenCalled();

        // Session should be marked verified
        const sessions = createDbSessionRepository(
          tenantDb,
          testSessionTokenizer,
          testSealedBox,
        );
        const updated = await sessions.findByToken(session.token);
        expect(updated?.twofaVerified).toBe(true);

        spy.mockRestore();
      });
    });
  },
);
