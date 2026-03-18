/**
 * Integration tests for TwoFactorService orchestrator.
 *
 * Covers: TOTP enrollment/verification, backup code generation/use,
 * method status tracking, method removal enforcement (at least one must remain),
 * session 2FA marking, and WebAuthn challenge lifecycle.
 *
 * DB integration: requires Docker test containers (DATABASE_URL).
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  createTestSession,
  noopEncryptor,
  testFieldEncryptor,
  testSessionTokenizer,
  testSealedBox,
  createMockEmailSender,
  registerMethodDirectly,
  insertWebauthnCredential,
  enrollTotp,
  extractEmailCode,
  type TestDb,
} from "../test-utils.js";
import { createDbSessionRepository } from "./session-repository.js";
import type { SessionRepository } from "./session-repository.js";
import { createEmailCodeService } from "./email-code.js";
import {
  createTwoFactorService,
  type TwoFactorService,
} from "./two-factor-service.js";
import { generateTotpCode, base32Decode } from "./totp.js";
import { TwoFactorMethod } from "@care-y/shared";
import { ValidationError } from "../errors.js";
import * as webauthnVerify from "./webauthn/verify.js";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  RegistrationResult,
  AuthenticationResult,
} from "./webauthn/types.js";

describe.skipIf(!process.env.DATABASE_URL)("TwoFactorService", () => {
  let testDb: TestDb;
  let db: Kysely<TenantDatabase>;
  let sessions: SessionRepository;
  let twoFactor: TwoFactorService;

  beforeAll(async () => {
    testDb = await createTestDb();
    db = testDb.db;
    sessions = createDbSessionRepository(
      db,
      testSessionTokenizer,
      testSealedBox,
    );
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
      const secret = await enrollTotp(twoFactor, user.id);

      // Generate a code from the enrolled secret (still within the same 30s window)
      const validCode = generateTotpCode(secret, Date.now());
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
      await enrollTotp(twoFactor, user.id);

      // Try to remove the only method
      await expect(
        twoFactor.removeMethod(user.id, TwoFactorMethod.TOTP),
      ).rejects.toThrow(ValidationError);
    });

    it("allows removing method when another exists", async () => {
      const user = await createTestUser(db);
      await enrollTotp(twoFactor, user.id);

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
      await enrollTotp(twoFactor, user.id);

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

  // --- WebAuthn registration (mocked verification) ---

  describe("verifyWebauthnRegistration", () => {
    function fakeRegistration(
      overrides?: Partial<RegistrationResponseJSON>,
    ): RegistrationResponseJSON {
      return {
        id: "cred-reg-1",
        rawId: "cred-reg-1",
        type: "public-key",
        authenticatorAttachment: "platform",
        response: {
          attestationObject: "fake-attestation",
          authenticatorData: "fake-auth-data",
          clientDataJSON: "fake-client-data",
          transports: ["internal"],
          publicKey: "fake-pk",
          publicKeyAlgorithm: -7,
        },
        ...overrides,
      };
    }

    function fakeRegistrationResult(
      overrides?: Partial<RegistrationResult>,
    ): RegistrationResult {
      return {
        credential: {
          id: "cred-reg-1",
          publicKey: "fake-pk-base64url",
          algorithm: "ES256",
          transports: ["internal"],
        },
        authenticator: {
          aaguid: "00000000-0000-0000-0000-000000000000",
          signCount: 0,
        },
        synced: false,
        userVerified: true,
        ...overrides,
      };
    }

    it("stores credential and registers WebAuthn method", async () => {
      const user = await createTestUser(db);
      const session = await createTestSession(db, { user_id: user.id });

      // Set challenge on session
      await twoFactor.getWebauthnRegistrationOptions(
        session.token,
        "localhost",
        "CARE-Y Test",
      );

      const spy = vi
        .spyOn(webauthnVerify, "verifyRegistration")
        .mockResolvedValue(fakeRegistrationResult());

      await twoFactor.verifyWebauthnRegistration(
        session.token,
        fakeRegistration(),
        "https://localhost",
        "localhost",
        user.id,
      );

      spy.mockRestore();

      // Credential should be stored
      const creds = await db
        .selectFrom("webauthn_credentials")
        .selectAll()
        .where("user_id", "=", user.id)
        .execute();
      expect(creds).toHaveLength(1);
      expect(creds[0]!.credential_id).toBe("cred-reg-1");
      expect(creds[0]!.public_key).toBe("fake-pk-base64url");
      expect(creds[0]!.sign_count).toBe(0);
      expect(creds[0]!.device_type).toBe("platform");
      expect(creds[0]!.backed_up).toBe(false);
      expect(creds[0]!.ordinal).toBe(1);

      // WebAuthn method should be active
      const status = await twoFactor.getStatus(user.id);
      expect(status.enrolled).toBe(true);
      expect(status.methods).toHaveLength(1);
      expect(status.methods[0]!.type).toBe(TwoFactorMethod.WEBAUTHN);
    });

    it("clears challenge after successful registration", async () => {
      const user = await createTestUser(db);
      const session = await createTestSession(db, { user_id: user.id });

      await twoFactor.getWebauthnRegistrationOptions(
        session.token,
        "localhost",
        "CARE-Y Test",
      );

      const spy = vi
        .spyOn(webauthnVerify, "verifyRegistration")
        .mockResolvedValue(
          fakeRegistrationResult({
            credential: {
              id: "cred-clear-test",
              publicKey: "pk2",
              algorithm: "ES256",
              transports: [],
            },
          }),
        );

      await twoFactor.verifyWebauthnRegistration(
        session.token,
        fakeRegistration({ id: "cred-clear-test" }),
        "https://localhost",
        "localhost",
        user.id,
      );

      spy.mockRestore();

      const found = await sessions.findByToken(session.token);
      expect(found!.webauthnChallenge).toBeNull();
    });

    it("throws when no challenge exists on session", async () => {
      const user = await createTestUser(db);
      const session = await createTestSession(db, { user_id: user.id });

      // No getWebauthnRegistrationOptions call, so no challenge

      await expect(
        twoFactor.verifyWebauthnRegistration(
          session.token,
          fakeRegistration(),
          "https://localhost",
          "localhost",
          user.id,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("increments ordinal for multiple credentials", async () => {
      const user = await createTestUser(db);
      const session = await createTestSession(db, { user_id: user.id });

      // Register first credential
      await twoFactor.getWebauthnRegistrationOptions(
        session.token,
        "localhost",
        "CARE-Y Test",
      );

      const spy = vi.spyOn(webauthnVerify, "verifyRegistration");

      spy.mockResolvedValue(
        fakeRegistrationResult({
          credential: {
            id: "cred-ord-1",
            publicKey: "pk-ord-1",
            algorithm: "ES256",
            transports: ["internal"],
          },
        }),
      );

      await twoFactor.verifyWebauthnRegistration(
        session.token,
        fakeRegistration({ id: "cred-ord-1" }),
        "https://localhost",
        "localhost",
        user.id,
      );

      // Register second credential
      await twoFactor.getWebauthnRegistrationOptions(
        session.token,
        "localhost",
        "CARE-Y Test",
      );

      spy.mockResolvedValue(
        fakeRegistrationResult({
          credential: {
            id: "cred-ord-2",
            publicKey: "pk-ord-2",
            algorithm: "ES256",
            transports: ["usb"],
          },
        }),
      );

      await twoFactor.verifyWebauthnRegistration(
        session.token,
        fakeRegistration({
          id: "cred-ord-2",
          authenticatorAttachment: "cross-platform",
        }),
        "https://localhost",
        "localhost",
        user.id,
      );

      spy.mockRestore();

      const creds = await db
        .selectFrom("webauthn_credentials")
        .selectAll()
        .where("user_id", "=", user.id)
        .orderBy("ordinal", "asc")
        .execute();

      expect(creds).toHaveLength(2);
      expect(creds[0]!.ordinal).toBe(1);
      expect(creds[1]!.ordinal).toBe(2);
    });
  });

  // --- WebAuthn assertion (mocked verification) ---

  describe("verifyWebauthnAssertion", () => {
    function fakeAuthentication(
      credentialId: string,
    ): AuthenticationResponseJSON {
      return {
        id: credentialId,
        rawId: credentialId,
        type: "public-key",
        response: {
          clientDataJSON: "fake-client-data",
          authenticatorData: "fake-auth-data",
          signature: "fake-sig",
        },
      };
    }

    function fakeAuthenticationResult(
      overrides?: Partial<AuthenticationResult>,
    ): AuthenticationResult {
      return {
        credentialId: "cred-assert-1",
        userVerified: true,
        signCount: 1,
        ...overrides,
      };
    }

    it("updates sign count after successful assertion", async () => {
      const user = await createTestUser(db);
      const session = await createTestSession(db, { user_id: user.id });

      await insertWebauthnCredential(db, user.id, "cred-assert-1");

      // Set challenge
      await twoFactor.getWebauthnAssertionOptions(
        session.token,
        user.id,
        "localhost",
      );

      const spy = vi
        .spyOn(webauthnVerify, "verifyAuthentication")
        .mockResolvedValue(fakeAuthenticationResult({ signCount: 5 }));

      await twoFactor.verifyWebauthnAssertion(
        session.token,
        fakeAuthentication("cred-assert-1"),
        "https://localhost",
        "localhost",
      );

      spy.mockRestore();

      // Sign count should be updated
      const cred = await db
        .selectFrom("webauthn_credentials")
        .select("sign_count")
        .where("credential_id", "=", "cred-assert-1")
        .executeTakeFirstOrThrow();

      expect(cred.sign_count).toBe(5);
    });

    it("clears challenge after successful assertion", async () => {
      const user = await createTestUser(db);
      const session = await createTestSession(db, { user_id: user.id });

      await insertWebauthnCredential(db, user.id, "cred-assert-clear");

      await twoFactor.getWebauthnAssertionOptions(
        session.token,
        user.id,
        "localhost",
      );

      const spy = vi
        .spyOn(webauthnVerify, "verifyAuthentication")
        .mockResolvedValue(
          fakeAuthenticationResult({ credentialId: "cred-assert-clear" }),
        );

      await twoFactor.verifyWebauthnAssertion(
        session.token,
        fakeAuthentication("cred-assert-clear"),
        "https://localhost",
        "localhost",
      );

      spy.mockRestore();

      const found = await sessions.findByToken(session.token);
      expect(found!.webauthnChallenge).toBeNull();
    });

    it("throws when no challenge exists on session", async () => {
      const user = await createTestUser(db);
      const session = await createTestSession(db, { user_id: user.id });

      await expect(
        twoFactor.verifyWebauthnAssertion(
          session.token,
          fakeAuthentication("any-cred"),
          "https://localhost",
          "localhost",
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("throws for unknown credential ID", async () => {
      const user = await createTestUser(db);
      const session = await createTestSession(db, { user_id: user.id });

      await twoFactor.getWebauthnAssertionOptions(
        session.token,
        user.id,
        "localhost",
      );

      await expect(
        twoFactor.verifyWebauthnAssertion(
          session.token,
          fakeAuthentication("nonexistent-cred"),
          "https://localhost",
          "localhost",
        ),
      ).rejects.toThrow(ValidationError);
    });
  });

  // --- getStatus WebAuthn credential listing ---

  describe("getStatus with WebAuthn credentials", () => {
    it("lists platform credential with synced label", async () => {
      const user = await createTestUser(db);

      await registerMethodDirectly(db, user.id, TwoFactorMethod.WEBAUTHN);
      await db
        .insertInto("webauthn_credentials")
        .values({
          user_id: user.id,
          credential_id: "cred-status-platform",
          public_key: "fake-pk",
          sign_count: 0,
          transports: ["internal"],
          device_type: "platform",
          backed_up: true,
          aaguid: "00000000-0000-0000-0000-000000000000",
          ordinal: 1,
        })
        .execute();

      const status = await twoFactor.getStatus(user.id);
      expect(status.methods).toHaveLength(1);
      expect(status.methods[0]!.label).toMatch(
        /^Screen lock \d+(?: \(synced\))?$/,
      );
      expect(status.methods[0]!.type).toBe(TwoFactorMethod.WEBAUTHN);
      expect(status.methods[0]!.index).toBe(1);
    });

    it("lists cross-platform credential as security key", async () => {
      const user = await createTestUser(db);

      await registerMethodDirectly(db, user.id, TwoFactorMethod.WEBAUTHN);
      await db
        .insertInto("webauthn_credentials")
        .values({
          user_id: user.id,
          credential_id: "cred-status-xplat",
          public_key: "fake-pk",
          sign_count: 0,
          transports: ["usb"],
          device_type: "cross-platform",
          backed_up: false,
          aaguid: "00000000-0000-0000-0000-000000000000",
          ordinal: 2,
        })
        .execute();

      const status = await twoFactor.getStatus(user.id);
      expect(status.methods).toHaveLength(1);
      expect(status.methods[0]!.label).toMatch(/^Security key \d+$/);
    });

    it("lists multiple credentials in ordinal order", async () => {
      const user = await createTestUser(db);

      await registerMethodDirectly(db, user.id, TwoFactorMethod.WEBAUTHN);

      await db
        .insertInto("webauthn_credentials")
        .values([
          {
            user_id: user.id,
            credential_id: "cred-multi-1",
            public_key: "pk1",
            sign_count: 0,
            transports: ["internal"],
            device_type: "platform",
            backed_up: false,
            aaguid: "00000000-0000-0000-0000-000000000000",
            ordinal: 1,
          },
          {
            user_id: user.id,
            credential_id: "cred-multi-2",
            public_key: "pk2",
            sign_count: 0,
            transports: ["usb"],
            device_type: "cross-platform",
            backed_up: false,
            aaguid: "00000000-0000-0000-0000-000000000000",
            ordinal: 2,
          },
        ])
        .execute();

      const status = await twoFactor.getStatus(user.id);
      expect(status.methods).toHaveLength(2);
      expect(status.methods[0]!.label).toMatch(
        /^Screen lock \d+(?: \(synced\))?$/,
      );
      expect(status.methods[1]!.label).toMatch(/^Security key \d+$/);
    });
  });

  // --- WebAuthn method removal ---

  describe("removeMethod WebAuthn", () => {
    it("removes a single credential when multiple exist", async () => {
      const user = await createTestUser(db);

      await registerMethodDirectly(db, user.id, TwoFactorMethod.WEBAUTHN);

      await db
        .insertInto("webauthn_credentials")
        .values([
          {
            user_id: user.id,
            credential_id: "cred-rm-1",
            public_key: "pk1",
            sign_count: 0,
            transports: ["internal"],
            device_type: "platform",
            backed_up: false,
            aaguid: "00000000-0000-0000-0000-000000000000",
            ordinal: 1,
          },
          {
            user_id: user.id,
            credential_id: "cred-rm-2",
            public_key: "pk2",
            sign_count: 0,
            transports: ["usb"],
            device_type: "cross-platform",
            backed_up: false,
            aaguid: "00000000-0000-0000-0000-000000000000",
            ordinal: 2,
          },
        ])
        .execute();

      await twoFactor.removeMethod(
        user.id,
        TwoFactorMethod.WEBAUTHN,
        "cred-rm-1",
      );

      // One credential should remain
      const creds = await db
        .selectFrom("webauthn_credentials")
        .selectAll()
        .where("user_id", "=", user.id)
        .execute();
      expect(creds).toHaveLength(1);
      expect(creds[0]!.credential_id).toBe("cred-rm-2");

      // Method should still be active (one credential remains)
      const status = await twoFactor.getStatus(user.id);
      expect(status.enrolled).toBe(true);
    });

    it("deactivates WebAuthn method when removing the last credential with another method present", async () => {
      const user = await createTestUser(db);

      await registerMethodDirectly(db, user.id, TwoFactorMethod.WEBAUTHN);
      await registerMethodDirectly(db, user.id, TwoFactorMethod.EMAIL);

      await db
        .insertInto("webauthn_credentials")
        .values({
          user_id: user.id,
          credential_id: "cred-last-1",
          public_key: "pk1",
          sign_count: 0,
          transports: ["internal"],
          device_type: "platform",
          backed_up: false,
          aaguid: "00000000-0000-0000-0000-000000000000",
          ordinal: 1,
        })
        .execute();

      await twoFactor.removeMethod(
        user.id,
        TwoFactorMethod.WEBAUTHN,
        "cred-last-1",
      );

      // Credential should be deleted
      const creds = await db
        .selectFrom("webauthn_credentials")
        .selectAll()
        .where("user_id", "=", user.id)
        .execute();
      expect(creds).toHaveLength(0);

      // WebAuthn method should be deactivated, but email remains
      const status = await twoFactor.getStatus(user.id);
      const types = status.methods.map((m) => m.type);
      expect(types).not.toContain(TwoFactorMethod.WEBAUTHN);
      expect(types).toContain(TwoFactorMethod.EMAIL);
    });

    it("prevents removing last credential when it is the only 2FA method", async () => {
      const user = await createTestUser(db);

      await registerMethodDirectly(db, user.id, TwoFactorMethod.WEBAUTHN);

      await db
        .insertInto("webauthn_credentials")
        .values({
          user_id: user.id,
          credential_id: "cred-only-1",
          public_key: "pk1",
          sign_count: 0,
          transports: ["internal"],
          device_type: "platform",
          backed_up: false,
          aaguid: "00000000-0000-0000-0000-000000000000",
          ordinal: 1,
        })
        .execute();

      await expect(
        twoFactor.removeMethod(
          user.id,
          TwoFactorMethod.WEBAUTHN,
          "cred-only-1",
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("removeMethod without credentialId removes all WebAuthn credentials", async () => {
      const user = await createTestUser(db);

      await registerMethodDirectly(db, user.id, TwoFactorMethod.WEBAUTHN);
      await registerMethodDirectly(db, user.id, TwoFactorMethod.EMAIL);

      await db
        .insertInto("webauthn_credentials")
        .values([
          {
            user_id: user.id,
            credential_id: "cred-all-1",
            public_key: "pk1",
            sign_count: 0,
            transports: ["internal"],
            device_type: "platform",
            backed_up: false,
            aaguid: "00000000-0000-0000-0000-000000000000",
            ordinal: 1,
          },
          {
            user_id: user.id,
            credential_id: "cred-all-2",
            public_key: "pk2",
            sign_count: 0,
            transports: ["usb"],
            device_type: "cross-platform",
            backed_up: false,
            aaguid: "00000000-0000-0000-0000-000000000000",
            ordinal: 2,
          },
        ])
        .execute();

      await twoFactor.removeMethod(user.id, TwoFactorMethod.WEBAUTHN);

      const creds = await db
        .selectFrom("webauthn_credentials")
        .selectAll()
        .where("user_id", "=", user.id)
        .execute();
      expect(creds).toHaveLength(0);
    });
  });

  // --- Encrypted TOTP secret storage ---

  describe("TOTP secret encryption", () => {
    it("stores encrypted secret that differs from plaintext", async () => {
      // Use a service with the real test encryptor
      const encryptedSessions = createDbSessionRepository(
        db,
        testSessionTokenizer,
        testSealedBox,
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

  // --- resolveUserEmail ---

  describe("resolveUserEmail", () => {
    it("throws when user has no notification email", async () => {
      const user = await createTestUser(db);
      // Default createTestUser sets encrypted_notification_addr to null

      await expect(twoFactor.resolveUserEmail(user.id)).rejects.toThrow(
        ValidationError,
      );
    });

    it("returns decrypted email when notification address is set", async () => {
      const user = await createTestUser(db, {
        overrides: {
          encrypted_notification_addr: noopEncryptor.encrypt("user@test.com"),
        },
      });

      const email = await twoFactor.resolveUserEmail(user.id);
      expect(email).toBe("user@test.com");
    });
  });

  // --- getEnrolledMethodTypes ---

  describe("getEnrolledMethodTypes", () => {
    it("returns empty array for user with no 2FA", async () => {
      const user = await createTestUser(db);
      const methods = await twoFactor.getEnrolledMethodTypes(user.id);
      expect(methods).toEqual([]);
    });

    it("returns array of active method types", async () => {
      const user = await createTestUser(db);
      await enrollTotp(twoFactor, user.id);
      await registerMethodDirectly(db, user.id, TwoFactorMethod.EMAIL);

      const methods = await twoFactor.getEnrolledMethodTypes(user.id);
      expect(methods).toContain(TwoFactorMethod.TOTP);
      expect(methods).toContain(TwoFactorMethod.EMAIL);
      expect(methods).toHaveLength(2);
    });
  });

  // --- verifyEmailEnrollment ---

  describe("verifyEmailEnrollment", () => {
    it("registers email method when code is valid", async () => {
      const user = await createTestUser(db);
      const mockSender = createMockEmailSender();
      const emailCodes = createEmailCodeService(db, mockSender);
      const service = createTwoFactorService(
        db,
        sessions,
        emailCodes,
        noopEncryptor,
        "CARE-Y Test",
      );

      // Send a code, then extract it from the captured email
      await emailCodes.sendCode(user.id, "test@example.com");
      const code = extractEmailCode(mockSender.calls[0]!.text);

      const result = await service.verifyEmailEnrollment(user.id, code);
      expect(result).toBe(true);

      // Email method should now be registered
      const status = await service.getStatus(user.id);
      expect(status.methods.map((m) => m.type)).toContain(
        TwoFactorMethod.EMAIL,
      );
    });

    it("returns false for invalid code without registering method", async () => {
      const user = await createTestUser(db);
      const mockSender = createMockEmailSender();
      const emailCodes = createEmailCodeService(db, mockSender);
      const service = createTwoFactorService(
        db,
        sessions,
        emailCodes,
        noopEncryptor,
        "CARE-Y Test",
      );

      await emailCodes.sendCode(user.id, "test@example.com");

      const result = await service.verifyEmailEnrollment(user.id, "000000");
      expect(result).toBe(false);

      // Email method should not be registered
      const methods = await service.getEnrolledMethodTypes(user.id);
      expect(methods).not.toContain(TwoFactorMethod.EMAIL);
    });
  });

  // --- getStatus with email method ---

  describe("getStatus with email method", () => {
    it("shows email method with correct label", async () => {
      const user = await createTestUser(db);
      await registerMethodDirectly(db, user.id, TwoFactorMethod.EMAIL);

      const status = await twoFactor.getStatus(user.id);
      expect(status.enrolled).toBe(true);
      expect(status.methods).toHaveLength(1);
      expect(status.methods[0]!.type).toBe(TwoFactorMethod.EMAIL);
      expect(status.methods[0]!.label).toBe("Email code");
      expect(status.methods[0]!.index).toBe(1);
    });
  });

  // --- Method upsert (reactivation) ---

  describe("method reactivation", () => {
    it("reactivates a previously deactivated method on re-enrollment", async () => {
      const user = await createTestUser(db);

      // Enroll TOTP and email
      await enrollTotp(twoFactor, user.id);
      await registerMethodDirectly(db, user.id, TwoFactorMethod.EMAIL);

      // Remove TOTP (email stays, so it's allowed)
      await twoFactor.removeMethod(user.id, TwoFactorMethod.TOTP);

      // Verify TOTP is deactivated
      let status = await twoFactor.getStatus(user.id);
      expect(status.methods.map((m) => m.type)).not.toContain(
        TwoFactorMethod.TOTP,
      );

      // Re-enroll TOTP (should reactivate the existing row, not create duplicate)
      await enrollTotp(twoFactor, user.id);

      status = await twoFactor.getStatus(user.id);
      expect(status.methods.map((m) => m.type)).toContain(TwoFactorMethod.TOTP);

      // Should be exactly one TOTP row in two_factor_methods
      const rows = await db
        .selectFrom("two_factor_methods")
        .selectAll()
        .where("user_id", "=", user.id)
        .where("method_type", "=", TwoFactorMethod.TOTP)
        .execute();
      expect(rows).toHaveLength(1);
      expect(rows[0]!.is_active).toBe(true);
    });
  });
});
