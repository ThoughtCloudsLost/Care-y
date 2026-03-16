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
  mockReq,
  mockRes,
  expectTrpcError,
  createMockEmailSender,
  createMockOprfDeps,
  createTestUser,
  createTestSession,
  enrollTotp,
  extractEmailCode,
  type TestDb,
  type MockEmailSender,
} from "../test-utils.js";
import { createScryptHasher } from "../auth/password.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
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

      orgContext = {
        orgId: org.id,
        orgSlug: org.slug,
        orgSchema: testDb.schemaName,
        tenantDb,
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
      return createAppRouter({
        authDeps: {
          hasher,
          loginLimiter,
          saltLimiter,
          fakeSaltKey,
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          tokenizer: testSessionTokenizer,
          sealedBox: null,
          isSecureCookie: false,
          emailSender: mockEmail,
        },
        twoFactorDeps: {
          emailSender: mockEmail,
          encryptor: testFieldEncryptor,
          tokenizer: testSessionTokenizer,
          sealedBox: null,
        },
        oprfDeps: createMockOprfDeps(),
        orgService,
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
        identifier: string;
        encryptedDisplayName: string;
        roleId: string;
        isActive: boolean;
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
        identifier: string;
        encryptedDisplayName: string;
        roleId: string;
        isActive: boolean;
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
        testFieldEncryptor,
        testSessionTokenizer,
        null,
      );
      const authService = createAuthService(
        tenantDb,
        hasher,
        sessions,
        testFieldEncryptor,
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
        testFieldEncryptor,
        testSessionTokenizer,
        null,
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
          "Not authenticated",
        );
      });

      it("twoFactor.enroll.totpSetup rejects unauthenticated caller", async () => {
        const caller = createTestCaller();
        await expectTrpcError(
          caller.twoFactor.enroll.totpSetup(),
          "UNAUTHORIZED",
          "Not authenticated",
        );
      });

      it("twoFactor.methods.list rejects caller with twofaVerified: false", async () => {
        const user = await registerUser("auth-2fa");
        const { caller } = createAuthedCaller(user, "auth-2fa-token");
        await expectTrpcError(
          caller.twoFactor.methods.list(),
          "UNAUTHORIZED",
          "Two-factor verification required",
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
          identifier: "email-send-user",
          encryptedDisplayName: "Email Send User",
          roleId: user.role_id,
          isActive: user.is_active,
        };

        const { caller } = createAuthedCaller(
          userRecord,
          "email-send-token",
          emailSender,
        );
        const result = await caller.twoFactor.enroll.emailSend();

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
          identifier: "email-verify-user",
          encryptedDisplayName: "Email Verify User",
          roleId: user.role_id,
          isActive: user.is_active,
        };

        // Send the email to get the code
        const { caller } = createAuthedCaller(
          userRecord,
          "email-verify-token",
          emailSender,
        );
        await caller.twoFactor.enroll.emailSend();

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
          testFieldEncryptor,
          testSessionTokenizer,
          null,
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
          testFieldEncryptor,
          testSessionTokenizer,
          null,
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
          identifier: "verify-email-user",
          encryptedDisplayName: "Verify Email User",
          roleId: user.role_id,
          isActive: user.is_active,
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
          testFieldEncryptor,
          testSessionTokenizer,
          null,
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
          identifier: "methods-remove-user",
          encryptedDisplayName: "Methods Remove User",
          roleId: user.role_id,
          isActive: user.is_active,
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

          // verifyRegistration(registration, expected) -- check second arg
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
        }
      });

      it("uses https://<slug>.care-y.app in production", async () => {
        const prevEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";

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

          expect(spy).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              origin: `https://${orgContext.orgSlug}.care-y.app`,
            }),
          );

          spy.mockRestore();
        } finally {
          process.env.NODE_ENV = prevEnv;
        }
      });
    });
  },
);
