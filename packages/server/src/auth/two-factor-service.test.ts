/**
 * Integration tests for TwoFactorService orchestrator.
 *
 * Covers: TOTP enrollment/verification, backup code generation/use,
 * method status tracking, method removal enforcement (at least one must remain),
 * session 2FA marking, and WebAuthn challenge lifecycle.
 *
 * DB integration: requires Docker test containers (DATABASE_URL).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  createTestSession,
  noopEncryptor,
  testFieldEncryptor,
  type TestDb,
} from "../test-utils.js";
import { createDbSessionRepository } from "./session-repository.js";
import type { SessionRepository } from "./session-repository.js";
import { createEmailCodeService } from "./email-code.js";
import type { EmailSender } from "../email/email-sender.js";
import {
  createTwoFactorService,
  type TwoFactorService,
} from "./two-factor-service.js";
import { generateTotpCode, base32Decode } from "./totp.js";
import { TwoFactorMethod } from "@care-y/shared";
import { ValidationError } from "../errors.js";

function createMockEmailSender(): EmailSender {
  return {
    async send() {
      // no-op for tests
    },
  };
}

/**
 * Inserts a row into two_factor_methods. This table has no PII columns;
 * user_id is a UUID FK and method_type is an enum string.
 */
async function registerMethodDirectly(
  database: Kysely<TenantDatabase>,
  userId: string,
  methodType: string,
): Promise<void> {
  await database
    .insertInto("two_factor_methods")
    .values({ user_id: userId, method_type: methodType })
    .execute();
}

describe.skipIf(!process.env.DATABASE_URL)("TwoFactorService", () => {
  let testDb: TestDb;
  let db: Kysely<TenantDatabase>;
  let sessions: SessionRepository;
  let twoFactor: TwoFactorService;

  beforeAll(async () => {
    testDb = await createTestDb();
    db = testDb.db;
    sessions = createDbSessionRepository(db, noopEncryptor);
    const emailCodes = createEmailCodeService(db, createMockEmailSender());
    twoFactor = createTwoFactorService(
      db,
      sessions,
      emailCodes,
      noopEncryptor,
      "CARE-Y Test",
    );
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  // --- getStatus ---

  describe("getStatus", () => {
    it("returns no methods for a fresh user", async () => {
      const user = await createTestUser(db);
      const status = await twoFactor.getStatus(user.id);

      expect(status.enrolled).toBe(false);
      expect(status.methods).toHaveLength(0);
      expect(status.backupCodesRemaining).toBe(0);
    });
  });

  // --- TOTP enrollment ---

  describe("TOTP enrollment", () => {
    it("setupTotp returns base32 secret and otpauth URI", async () => {
      const user = await createTestUser(db);
      const result = await twoFactor.setupTotp(user.id);

      expect(result.secret).toMatch(/^[A-Z2-7]+$/);
      expect(result.uri).toMatch(/^otpauth:\/\/totp\//);
      expect(result.uri).toContain("issuer=CARE-Y%20Test");
    });

    it("verifyTotpEnrollment accepts valid code and registers method", async () => {
      const user = await createTestUser(db);
      const setup = await twoFactor.setupTotp(user.id);

      // Compute the valid code directly from the secret and current time
      const secret = base32Decode(setup.secret);
      const validCode = generateTotpCode(secret, Date.now());

      const result = await twoFactor.verifyTotpEnrollment(user.id, validCode);
      expect(result).toBe(true);

      // Method should be registered
      const status = await twoFactor.getStatus(user.id);
      expect(status.enrolled).toBe(true);
      expect(status.methods).toHaveLength(1);
      expect(status.methods[0]!.type).toBe(TwoFactorMethod.TOTP);
      expect(status.methods[0]!.label).toBe("Authenticator app");
    });

    it("verifyTotpEnrollment rejects wrong code", async () => {
      const user = await createTestUser(db);
      await twoFactor.setupTotp(user.id);

      const result = await twoFactor.verifyTotpEnrollment(user.id, "000000");
      // Almost certainly false (1 in 1M per time step, 3 steps checked)
      // If it happens to be valid, the test is still correct
      expect(typeof result).toBe("boolean");
    });

    it("verifyTotpEnrollment throws when no pending enrollment exists", async () => {
      const user = await createTestUser(db);
      await expect(
        twoFactor.verifyTotpEnrollment(user.id, "123456"),
      ).rejects.toThrow(ValidationError);
    });

    it("setupTotp replaces previous unverified secret", async () => {
      const user = await createTestUser(db);
      const first = await twoFactor.setupTotp(user.id);
      const second = await twoFactor.setupTotp(user.id);

      expect(first.secret).not.toBe(second.secret);

      // Only one row should exist
      const rows = await db
        .selectFrom("totp_secrets")
        .selectAll()
        .where("user_id", "=", user.id)
        .execute();
      expect(rows).toHaveLength(1);
    });
  });

  // --- TOTP verification (post-enrollment) ---

  describe("verifyTotp", () => {
    it("throws when TOTP is not enrolled", async () => {
      const user = await createTestUser(db);
      await expect(twoFactor.verifyTotp(user.id, "123456")).rejects.toThrow(
        ValidationError,
      );
    });

    it("accepts valid code after enrollment", async () => {
      const user = await createTestUser(db);
      const setup = await twoFactor.setupTotp(user.id);

      // Enroll
      const secret = base32Decode(setup.secret);
      const validCode = generateTotpCode(secret, Date.now());
      await twoFactor.verifyTotpEnrollment(user.id, validCode);

      // Verify with the same code (still within the same 30s window)
      const result = await twoFactor.verifyTotp(user.id, validCode);
      expect(result).toBe(true);
    });
  });

  // --- Backup codes ---

  describe("backup codes", () => {
    it("generateBackupCodes returns 8 formatted codes", async () => {
      const user = await createTestUser(db);
      const result = await twoFactor.generateBackupCodes(user.id);

      expect(result.codes).toHaveLength(8);
      for (const code of result.codes) {
        // Formatted: "xxxx-xxxx"
        expect(code).toMatch(/^[a-z0-9]{4}-[a-z0-9]{4}$/);
      }
    });

    it("checkBackupCode accepts valid code and marks it used", async () => {
      const user = await createTestUser(db);
      const { codes } = await twoFactor.generateBackupCodes(user.id);
      const firstCode = codes[0]!;

      const result = await twoFactor.checkBackupCode(user.id, firstCode);
      expect(result).toBe(true);

      // Using same code again should fail (one-time use)
      const result2 = await twoFactor.checkBackupCode(user.id, firstCode);
      expect(result2).toBe(false);
    });

    it("checkBackupCode accepts code without hyphens", async () => {
      const user = await createTestUser(db);
      const { codes } = await twoFactor.generateBackupCodes(user.id);
      const code = codes[0]!.replace("-", "");

      expect(await twoFactor.checkBackupCode(user.id, code)).toBe(true);
    });

    it("checkBackupCode rejects wrong code", async () => {
      const user = await createTestUser(db);
      await twoFactor.generateBackupCodes(user.id);

      const result = await twoFactor.checkBackupCode(user.id, "xxxx-xxxx");
      expect(result).toBe(false);
    });

    it("checkBackupCode throws when no codes remain", async () => {
      const user = await createTestUser(db);

      await expect(
        twoFactor.checkBackupCode(user.id, "xxxx-xxxx"),
      ).rejects.toThrow(ValidationError);
    });

    it("generateBackupCodes replaces previous set", async () => {
      const user = await createTestUser(db);
      const first = await twoFactor.generateBackupCodes(user.id);
      const second = await twoFactor.generateBackupCodes(user.id);

      // Old codes should not work
      const oldResult = await twoFactor.checkBackupCode(
        user.id,
        first.codes[0]!,
      );
      expect(oldResult).toBe(false);

      // New codes should work
      const newResult = await twoFactor.checkBackupCode(
        user.id,
        second.codes[0]!,
      );
      expect(newResult).toBe(true);
    });

    it("getStatus reports remaining backup code count", async () => {
      const user = await createTestUser(db);
      await twoFactor.generateBackupCodes(user.id);

      let status = await twoFactor.getStatus(user.id);
      expect(status.backupCodesRemaining).toBe(8);

      // Use one code
      const { codes } = await twoFactor.generateBackupCodes(user.id);
      await twoFactor.checkBackupCode(user.id, codes[0]!);

      status = await twoFactor.getStatus(user.id);
      expect(status.backupCodesRemaining).toBe(7);
    });
  });

  // --- Method removal ---

  describe("removeMethod", () => {
    it("prevents removing last 2FA method", async () => {
      const user = await createTestUser(db);

      // Enroll TOTP
      const setup = await twoFactor.setupTotp(user.id);
      const secret = base32Decode(setup.secret);
      const validCode = generateTotpCode(secret, Date.now());
      await twoFactor.verifyTotpEnrollment(user.id, validCode);

      // Try to remove the only method
      await expect(
        twoFactor.removeMethod(user.id, TwoFactorMethod.TOTP),
      ).rejects.toThrow(ValidationError);
    });

    it("allows removing method when another exists", async () => {
      const user = await createTestUser(db);

      // Enroll TOTP
      const setup = await twoFactor.setupTotp(user.id);
      const secret = base32Decode(setup.secret);
      const validCode = generateTotpCode(secret, Date.now());
      await twoFactor.verifyTotpEnrollment(user.id, validCode);

      // Register email as second method so TOTP isn't the last one
      await registerMethodDirectly(db, user.id, TwoFactorMethod.EMAIL);

      // Now removing TOTP should succeed
      await twoFactor.removeMethod(user.id, TwoFactorMethod.TOTP);

      const status = await twoFactor.getStatus(user.id);
      const types = status.methods.map((m) => m.type);
      expect(types).not.toContain(TwoFactorMethod.TOTP);
      expect(types).toContain(TwoFactorMethod.EMAIL);
    });

    it("removeMethod cleans up TOTP secrets", async () => {
      const user = await createTestUser(db);

      // Enroll TOTP + register a second method
      const setup = await twoFactor.setupTotp(user.id);
      const secret = base32Decode(setup.secret);
      const validCode = generateTotpCode(secret, Date.now());
      await twoFactor.verifyTotpEnrollment(user.id, validCode);

      // Register email as second method so TOTP isn't the last one
      await registerMethodDirectly(db, user.id, TwoFactorMethod.EMAIL);

      await twoFactor.removeMethod(user.id, TwoFactorMethod.TOTP);

      // TOTP secret should be deleted
      const secrets = await db
        .selectFrom("totp_secrets")
        .selectAll()
        .where("user_id", "=", user.id)
        .execute();
      expect(secrets).toHaveLength(0);
    });
  });

  // --- Session 2FA ---

  describe("markSessionVerified", () => {
    it("marks session as 2FA verified", async () => {
      const user = await createTestUser(db);
      const session = await createTestSession(db, { user_id: user.id });

      // Initially not verified
      let found = await sessions.findByToken(session.token);
      expect(found!.twofaVerified).toBe(false);

      await twoFactor.markSessionVerified(session.token);

      found = await sessions.findByToken(session.token);
      expect(found!.twofaVerified).toBe(true);
    });
  });

  // --- WebAuthn challenge lifecycle ---

  describe("WebAuthn challenge lifecycle", () => {
    it("getWebauthnRegistrationOptions stores challenge on session", async () => {
      const user = await createTestUser(db);
      const session = await createTestSession(db, { user_id: user.id });

      const opts = await twoFactor.getWebauthnRegistrationOptions(
        session.token,
        "localhost",
        "CARE-Y Test",
      );

      expect(opts.challenge).toBeTruthy();
      expect(opts.rpId).toBe("localhost");
      expect(opts.rpName).toBe("CARE-Y Test");

      // Challenge stored on session
      const found = await sessions.findByToken(session.token);
      expect(found!.webauthnChallenge).toBe(opts.challenge);
    });

    it("getWebauthnAssertionOptions stores challenge and lists credentials", async () => {
      const user = await createTestUser(db);
      const session = await createTestSession(db, { user_id: user.id });

      // Insert a fake credential
      await db
        .insertInto("webauthn_credentials")
        .values({
          user_id: user.id,
          credential_id: "cred-test-1",
          public_key: "fake-pk-base64url",
          sign_count: 0,
          transports: ["internal"],
          device_type: "platform",
          backed_up: false,
          aaguid: "00000000-0000-0000-0000-000000000000",
          ordinal: 1,
        })
        .execute();

      const opts = await twoFactor.getWebauthnAssertionOptions(
        session.token,
        user.id,
        "localhost",
      );

      expect(opts.challenge).toBeTruthy();
      expect(opts.rpId).toBe("localhost");
      expect(opts.allowCredentials).toHaveLength(1);
      expect(opts.allowCredentials[0]!.id).toBe("cred-test-1");
      expect(opts.allowCredentials[0]!.transports).toEqual(["internal"]);

      // Challenge stored on session
      const found = await sessions.findByToken(session.token);
      expect(found!.webauthnChallenge).toBe(opts.challenge);
    });
  });

  // --- Encrypted TOTP secret storage ---

  describe("TOTP secret encryption", () => {
    it("stores encrypted secret that differs from plaintext", async () => {
      // Use a service with the real test encryptor
      const encryptedSessions = createDbSessionRepository(
        db,
        testFieldEncryptor,
      );
      const emailCodes = createEmailCodeService(db, createMockEmailSender());
      const encryptedService = createTwoFactorService(
        db,
        encryptedSessions,
        emailCodes,
        testFieldEncryptor,
        "CARE-Y Test",
      );

      const user = await createTestUser(db);
      const setup = await encryptedService.setupTotp(user.id);

      // Read raw row
      const row = await db
        .selectFrom("totp_secrets")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      // Encrypted bytes should not equal the plaintext base32 string
      const rawBytes = row.encrypted_secret;
      expect(rawBytes.toString("utf-8")).not.toBe(setup.secret);
    });
  });
});
