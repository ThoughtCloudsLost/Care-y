/**
 * Two-factor authentication orchestration service.
 *
 * Coordinates enrollment, verification, and method management across all 2FA
 * method types (WebAuthn, TOTP, email, backup codes). Individual method logic
 * lives in dedicated modules; this service handles DB persistence, method
 * registry, and cross-method coordination.
 *
 * All queries run against a tenant-scoped Kysely instance.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type { SessionRepository } from "./session-repository.js";
import type { EmailCodeService } from "./email-code.js";
import {
  generateTotpSecret,
  getTotpUri,
  verifyTotpCode,
  base32Encode,
  base32Decode,
} from "./totp.js";
import {
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
  formatCode,
} from "./backup-codes.js";
import {
  verifyRegistration,
  verifyAuthentication,
  randomChallenge,
} from "./webauthn/index.js";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  CredentialInfo,
  RegistrationChecks,
  AuthenticationChecks,
} from "./webauthn/index.js";
import { TwoFactorMethod } from "@care-y/shared";
import type { TwoFactorMethodType } from "@care-y/shared";
import { ValidationError } from "../errors.js";

// --- Types ---

export interface TotpSetupResult {
  readonly secret: string; // base32-encoded, shown to user once
  readonly uri: string; // otpauth:// URI for QR code
}

export interface BackupCodesResult {
  readonly codes: readonly string[]; // formatted codes, shown to user once
}

export interface WebauthnRegistrationOptions {
  readonly challenge: string;
  readonly rpId: string;
  readonly rpName: string;
}

export interface WebauthnAssertionOptions {
  readonly challenge: string;
  readonly rpId: string;
  readonly allowCredentials: readonly {
    readonly id: string;
    readonly transports: string[];
  }[];
}

export interface EnrolledMethodInfo {
  readonly type: TwoFactorMethodType;
  readonly label: string;
  readonly index: number;
}

export interface TwoFactorStatusResult {
  readonly enrolled: boolean;
  readonly methods: readonly EnrolledMethodInfo[];
  readonly backupCodesRemaining: number;
}

export interface TwoFactorService {
  getStatus(userId: string): Promise<TwoFactorStatusResult>;

  // TOTP enrollment
  setupTotp(userId: string): Promise<TotpSetupResult>;
  verifyTotpEnrollment(userId: string, code: string): Promise<boolean>;

  // TOTP verification (login)
  verifyTotp(userId: string, code: string): Promise<boolean>;

  // Backup codes
  generateBackupCodes(userId: string): Promise<BackupCodesResult>;
  checkBackupCode(userId: string, code: string): Promise<boolean>;

  // WebAuthn enrollment
  getWebauthnRegistrationOptions(
    sessionToken: string,
    rpId: string,
    rpName: string,
  ): Promise<WebauthnRegistrationOptions>;
  verifyWebauthnRegistration(
    sessionToken: string,
    registration: RegistrationResponseJSON,
    origin: string,
    rpId: string,
    userId: string,
  ): Promise<void>;

  // WebAuthn verification (login)
  getWebauthnAssertionOptions(
    sessionToken: string,
    userId: string,
    rpId: string,
  ): Promise<WebauthnAssertionOptions>;
  verifyWebauthnAssertion(
    sessionToken: string,
    authentication: AuthenticationResponseJSON,
    origin: string,
    rpId: string,
  ): Promise<void>;

  // Email enrollment
  verifyEmailEnrollment(userId: string, code: string): Promise<boolean>;

  // Method queries
  getEnrolledMethodTypes(userId: string): Promise<string[]>;

  // User email resolution (decrypts notification email for 2FA code delivery)
  resolveUserEmail(userId: string): Promise<string>;

  // Method management
  removeMethod(
    userId: string,
    method: TwoFactorMethodType,
    credentialId?: string,
  ): Promise<void>;

  // Session
  markSessionVerified(sessionToken: string): Promise<void>;
}

export function createTwoFactorService(
  db: Kysely<TenantDatabase>,
  sessions: SessionRepository,
  emailCodes: EmailCodeService,
  encryptor: FieldEncryptor,
  issuer: string,
): TwoFactorService {
  // --- Internal helpers ---

  async function getActiveMethods(
    userId: string,
  ): Promise<{ method_type: string }[]> {
    return db
      .selectFrom("two_factor_methods")
      .select("method_type")
      .where("user_id", "=", userId)
      .where("is_active", "=", true)
      .execute();
  }

  async function registerMethod(
    userId: string,
    method: TwoFactorMethodType,
  ): Promise<void> {
    // Single-query upsert via the unique index on (user_id, method_type).
    // Reactivates previously deactivated methods without a separate SELECT.
    await db
      .insertInto("two_factor_methods")
      .values({ user_id: userId, method_type: method, is_active: true })
      .onConflict((oc) =>
        oc.columns(["user_id", "method_type"]).doUpdateSet({ is_active: true }),
      )
      .execute();
  }

  async function getNextWebauthnOrdinal(userId: string): Promise<number> {
    const result = await db
      .selectFrom("webauthn_credentials")
      .select(db.fn.max("ordinal").as("max_ordinal"))
      .where("user_id", "=", userId)
      .executeTakeFirst();

    const current = result?.max_ordinal ?? 0;
    return current + 1;
  }

  /** Builds display info for each WebAuthn credential (platform vs cross-platform). */
  async function listWebauthnCredentials(
    userId: string,
  ): Promise<EnrolledMethodInfo[]> {
    const creds = await db
      .selectFrom("webauthn_credentials")
      .select(["credential_id", "device_type", "backed_up", "ordinal"])
      .where("user_id", "=", userId)
      .orderBy("ordinal", "asc")
      .execute();

    return creds.map((c) => {
      const isPlatform = c.device_type === "platform";
      const label = isPlatform
        ? `Screen lock ${String(c.ordinal)}${c.backed_up ? " (synced)" : ""}`
        : `Security key ${String(c.ordinal)}`;
      return { type: TwoFactorMethod.WEBAUTHN, label, index: c.ordinal };
    });
  }

  /** Returns the number of unused backup codes for a user. */
  async function countRemainingBackupCodes(userId: string): Promise<number> {
    const { count } = await db
      .selectFrom("backup_codes")
      .select(db.fn.countAll().as("count"))
      .where("user_id", "=", userId)
      .where("is_used", "=", false)
      .executeTakeFirstOrThrow();
    return Number(count);
  }

  /**
   * Retrieves the WebAuthn challenge stored on the session. Throws if the
   * session has no pending challenge (the user didn't request options first).
   */
  async function requireWebauthnChallenge(
    sessionToken: string,
  ): Promise<string> {
    const session = await sessions.findByToken(sessionToken);
    if (
      session?.webauthnChallenge === undefined ||
      session.webauthnChallenge === null
    ) {
      throw new ValidationError(
        "No WebAuthn challenge found for this session.",
      );
    }
    return session.webauthnChallenge;
  }

  /**
   * Loads and decrypts the TOTP secret for a user. The `verified` parameter
   * selects whether to load a pending enrollment (false) or a confirmed
   * secret (true). Returns the decoded secret bytes and the row ID (needed
   * by enrollment to mark the row as verified).
   */
  async function loadTotpSecret(
    userId: string,
    verified: boolean,
  ): Promise<{ secret: Buffer; rowId: string }> {
    const row = await db
      .selectFrom("totp_secrets")
      .selectAll()
      .where("user_id", "=", userId)
      .where("verified", "=", verified)
      .executeTakeFirst();

    if (!row) {
      throw new ValidationError(
        verified
          ? "TOTP is not enrolled."
          : "No pending TOTP enrollment found.",
      );
    }

    // care-y-ignore-next-line server-no-decrypt -- TOTP secrets are operational server-side PII (not E2EE client data)
    const secretB32 = encryptor.decrypt(row.encrypted_secret);
    const secret = base32Decode(secretB32);

    return { secret, rowId: row.id };
  }

  /** Maps a simple method type (TOTP, email) to its display info. */
  function simpleMethodInfo(
    type: TwoFactorMethodType,
    label: string,
  ): EnrolledMethodInfo {
    return { type, label, index: 1 };
  }

  /**
   * Throws if removing `methodToRemove` would leave the user with zero
   * active 2FA methods.
   */
  function ensureNotLastMethod(
    activeMethods: { method_type: string }[],
    methodToRemove: string,
  ): void {
    const remaining = activeMethods.filter(
      (m) => m.method_type !== methodToRemove,
    );
    if (remaining.length === 0) {
      throw new ValidationError(
        "Cannot remove the last 2FA method. At least one must remain active.",
      );
    }
  }

  /** Deactivates a method type in the two_factor_methods table. */
  async function deactivateMethod(
    userId: string,
    method: TwoFactorMethodType,
  ): Promise<void> {
    await db
      .updateTable("two_factor_methods")
      .set({ is_active: false })
      .where("user_id", "=", userId)
      .where("method_type", "=", method)
      .execute();
  }

  /** Removes a single WebAuthn credential, deactivating the method if it was the last one. */
  async function removeSingleWebauthnCredential(
    userId: string,
    credentialId: string,
    activeMethods: { method_type: string }[],
  ): Promise<void> {
    const credCount = await db
      .selectFrom("webauthn_credentials")
      .select(db.fn.countAll().as("count"))
      .where("user_id", "=", userId)
      .executeTakeFirstOrThrow();

    if (Number(credCount.count) <= 1) {
      ensureNotLastMethod(activeMethods, TwoFactorMethod.WEBAUTHN);
      await deactivateMethod(userId, TwoFactorMethod.WEBAUTHN);
    }

    await db
      .deleteFrom("webauthn_credentials")
      .where("user_id", "=", userId)
      .where("credential_id", "=", credentialId)
      .execute();
  }

  /** Removes an entire 2FA method type, deleting associated data. */
  async function removeEntireMethod(
    userId: string,
    method: TwoFactorMethodType,
    activeMethods: { method_type: string }[],
  ): Promise<void> {
    ensureNotLastMethod(activeMethods, method);
    await deactivateMethod(userId, method);

    if (method === TwoFactorMethod.TOTP) {
      await db
        .deleteFrom("totp_secrets")
        .where("user_id", "=", userId)
        .execute();
    } else if (method === TwoFactorMethod.WEBAUTHN) {
      await db
        .deleteFrom("webauthn_credentials")
        .where("user_id", "=", userId)
        .execute();
    }
  }

  return {
    async getStatus(userId: string): Promise<TwoFactorStatusResult> {
      // First fetch active methods (needed to build the response).
      // Then run WebAuthn + backup count in parallel (independent queries).
      const methods = await getActiveMethods(userId);

      const [webauthnCreds, backupCount] = await Promise.all([
        listWebauthnCredentials(userId),
        countRemainingBackupCodes(userId),
      ]);

      const enrolledMethods: EnrolledMethodInfo[] = [];
      for (const m of methods) {
        if (m.method_type === TwoFactorMethod.WEBAUTHN) {
          enrolledMethods.push(...webauthnCreds);
        } else if (m.method_type === TwoFactorMethod.TOTP) {
          enrolledMethods.push(
            simpleMethodInfo(TwoFactorMethod.TOTP, "Authenticator app"),
          );
        } else if (m.method_type === TwoFactorMethod.EMAIL) {
          enrolledMethods.push(
            simpleMethodInfo(TwoFactorMethod.EMAIL, "Email code"),
          );
        }
      }

      return {
        enrolled: methods.length > 0,
        methods: enrolledMethods,
        backupCodesRemaining: backupCount,
      };
    },

    // --- TOTP ---

    async setupTotp(userId: string): Promise<TotpSetupResult> {
      const secret = generateTotpSecret();
      const uri = getTotpUri(secret, issuer);
      const b32 = base32Encode(secret);

      // Encrypt and store (replace existing unverified secret)
      const encrypted = encryptor.encrypt(b32);

      await db
        .deleteFrom("totp_secrets")
        .where("user_id", "=", userId)
        .execute();

      await db
        .insertInto("totp_secrets")
        .values({
          user_id: userId,
          encrypted_secret: encrypted,
          verified: false,
        })
        .execute();

      return { secret: b32, uri };
    },

    async verifyTotpEnrollment(userId: string, code: string): Promise<boolean> {
      const { secret, rowId } = await loadTotpSecret(userId, false);

      if (!verifyTotpCode(secret, code)) {
        return false;
      }

      // Mark as verified and register method
      await db
        .updateTable("totp_secrets")
        .set({ verified: true })
        .where("id", "=", rowId)
        .execute();

      await registerMethod(userId, TwoFactorMethod.TOTP);
      return true;
    },

    async verifyTotp(userId: string, code: string): Promise<boolean> {
      const { secret } = await loadTotpSecret(userId, true);
      return verifyTotpCode(secret, code);
    },

    // --- Backup codes ---

    async generateBackupCodes(userId: string): Promise<BackupCodesResult> {
      // Delete existing codes
      await db
        .deleteFrom("backup_codes")
        .where("user_id", "=", userId)
        .execute();

      const codes = generateBackupCodes();
      const hashes = await Promise.all(codes.map(hashBackupCode));

      // Insert all 8 codes
      await db
        .insertInto("backup_codes")
        .values(
          hashes.map((hash) => ({
            user_id: userId,
            code_hash: hash,
          })),
        )
        .execute();

      return { codes: codes.map(formatCode) };
    },

    async checkBackupCode(userId: string, code: string): Promise<boolean> {
      const rows = await db
        .selectFrom("backup_codes")
        .selectAll()
        .where("user_id", "=", userId)
        .where("is_used", "=", false)
        .execute();

      if (rows.length === 0) {
        throw new ValidationError("No backup codes available.");
      }

      // Sequential by design: scrypt is CPU-bound (saturates the thread pool
      // under Promise.all), and early return on first match is faster for the
      // common case (valid code). Route-level rate limiting prevents brute-force.
      for (const row of rows) {
        const valid = await verifyBackupCode(code, row.code_hash);
        if (valid) {
          // Mark as used immediately (one-time use)
          await db
            .updateTable("backup_codes")
            .set({ is_used: true })
            .where("id", "=", row.id)
            .execute();
          return true;
        }
      }

      return false;
    },

    // --- WebAuthn ---

    async getWebauthnRegistrationOptions(
      sessionToken: string,
      rpId: string,
      rpName: string,
    ): Promise<WebauthnRegistrationOptions> {
      const challenge = randomChallenge();
      await sessions.setWebauthnChallenge(sessionToken, challenge);
      return { challenge, rpId, rpName };
    },

    async verifyWebauthnRegistration(
      sessionToken: string,
      registration: RegistrationResponseJSON,
      origin: string,
      rpId: string,
      userId: string,
    ): Promise<void> {
      const challenge = await requireWebauthnChallenge(sessionToken);

      const expected: RegistrationChecks = {
        challenge,
        origin,
        domain: rpId,
        userVerified: true,
      };

      const result = await verifyRegistration(registration, expected);

      // Clear challenge
      await sessions.setWebauthnChallenge(sessionToken, null);

      // Determine device type from authenticatorAttachment
      const deviceType = registration.authenticatorAttachment ?? null;
      const ordinal = await getNextWebauthnOrdinal(userId);

      // Store credential
      await db
        .insertInto("webauthn_credentials")
        .values({
          user_id: userId,
          credential_id: result.credential.id,
          public_key: result.credential.publicKey,
          sign_count: result.authenticator.signCount,
          transports: result.credential.transports,
          device_type: deviceType,
          backed_up: result.synced,
          aaguid: result.authenticator.aaguid,
          ordinal,
        })
        .execute();

      await registerMethod(userId, TwoFactorMethod.WEBAUTHN);
    },

    async getWebauthnAssertionOptions(
      sessionToken: string,
      userId: string,
      rpId: string,
    ): Promise<WebauthnAssertionOptions> {
      const challenge = randomChallenge();
      await sessions.setWebauthnChallenge(sessionToken, challenge);

      const credentials = await db
        .selectFrom("webauthn_credentials")
        .select(["credential_id", "transports"])
        .where("user_id", "=", userId)
        .execute();

      return {
        challenge,
        rpId,
        allowCredentials: credentials.map((c) => ({
          id: c.credential_id,
          transports: c.transports ?? [],
        })),
      };
    },

    async verifyWebauthnAssertion(
      sessionToken: string,
      authentication: AuthenticationResponseJSON,
      origin: string,
      rpId: string,
    ): Promise<void> {
      const challenge = await requireWebauthnChallenge(sessionToken);

      // Look up the credential
      const credRow = await db
        .selectFrom("webauthn_credentials")
        .selectAll()
        .where("credential_id", "=", authentication.id)
        .executeTakeFirst();

      if (!credRow) {
        throw new ValidationError("Unknown credential.");
      }

      const credential: CredentialInfo = {
        id: credRow.credential_id,
        publicKey: credRow.public_key,
        algorithm: "ES256", // We'll determine from stored data in production
        transports: credRow.transports ?? [],
      };

      const expected: AuthenticationChecks = {
        challenge,
        origin,
        domain: rpId,
        userVerified: true,
        counter: credRow.sign_count,
      };

      const result = await verifyAuthentication(
        authentication,
        credential,
        expected,
      );

      // Clear challenge and update sign count
      await sessions.setWebauthnChallenge(sessionToken, null);

      await db
        .updateTable("webauthn_credentials")
        .set({ sign_count: result.signCount })
        .where("credential_id", "=", credRow.credential_id)
        .execute();
    },

    // --- Email enrollment ---

    async verifyEmailEnrollment(
      userId: string,
      code: string,
    ): Promise<boolean> {
      const valid = await emailCodes.verifyCode(userId, code);
      if (valid) {
        await registerMethod(userId, TwoFactorMethod.EMAIL);
      }
      return valid;
    },

    // --- Method queries ---

    async getEnrolledMethodTypes(userId: string): Promise<string[]> {
      const methods = await getActiveMethods(userId);
      return methods.map((m) => m.method_type);
    },

    async resolveUserEmail(userId: string): Promise<string> {
      const row = await db
        .selectFrom("users")
        .select("encrypted_notification_addr")
        .where("id", "=", userId)
        .executeTakeFirst();

      if (!row?.encrypted_notification_addr) {
        throw new ValidationError(
          "No notification email configured. Set an email address in your profile first.",
        );
      }

      // care-y-ignore-next-line server-no-decrypt -- notification email is operational server-side PII (Tier 2, not E2EE)
      return encryptor.decrypt(row.encrypted_notification_addr);
    },

    // --- Method management ---

    async removeMethod(
      userId: string,
      method: TwoFactorMethodType,
      credentialId?: string,
    ): Promise<void> {
      const activeMethods = await getActiveMethods(userId);

      if (
        method === TwoFactorMethod.WEBAUTHN &&
        credentialId !== undefined &&
        credentialId !== ""
      ) {
        await removeSingleWebauthnCredential(
          userId,
          credentialId,
          activeMethods,
        );
      } else {
        await removeEntireMethod(userId, method, activeMethods);
      }
    },

    async markSessionVerified(sessionToken: string): Promise<void> {
      await sessions.markTwoFactorVerified(sessionToken);
    },
  };
}
