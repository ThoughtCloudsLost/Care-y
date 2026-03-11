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
    // Upsert: if the method was previously deactivated, reactivate it
    const existing = await db
      .selectFrom("two_factor_methods")
      .select("id")
      .where("user_id", "=", userId)
      .where("method_type", "=", method)
      .executeTakeFirst();

    if (existing) {
      await db
        .updateTable("two_factor_methods")
        .set({ is_active: true })
        .where("id", "=", existing.id)
        .execute();
    } else {
      await db
        .insertInto("two_factor_methods")
        .values({ user_id: userId, method_type: method })
        .execute();
    }
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
      const methods = await getActiveMethods(userId);

      const enrolledMethods: EnrolledMethodInfo[] = [];
      for (const m of methods) {
        if (m.method_type === TwoFactorMethod.WEBAUTHN) {
          enrolledMethods.push(...(await listWebauthnCredentials(userId)));
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
        backupCodesRemaining: await countRemainingBackupCodes(userId),
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
      const row = await db
        .selectFrom("totp_secrets")
        .selectAll()
        .where("user_id", "=", userId)
        .where("verified", "=", false)
        .executeTakeFirst();

      if (!row) {
        throw new ValidationError("No pending TOTP enrollment found.");
      }

      // care-y-ignore-next-line server-no-decrypt -- TOTP secrets are operational server-side PII (not E2EE client data)
      const secretB32 = encryptor.decrypt(row.encrypted_secret);
      const secret = base32Decode(secretB32);

      if (!verifyTotpCode(secret, code)) {
        return false;
      }

      // Mark as verified and register method
      await db
        .updateTable("totp_secrets")
        .set({ verified: true })
        .where("id", "=", row.id)
        .execute();

      await registerMethod(userId, TwoFactorMethod.TOTP);
      return true;
    },

    async verifyTotp(userId: string, code: string): Promise<boolean> {
      const row = await db
        .selectFrom("totp_secrets")
        .selectAll()
        .where("user_id", "=", userId)
        .where("verified", "=", true)
        .executeTakeFirst();

      if (!row) {
        throw new ValidationError("TOTP is not enrolled.");
      }

      // care-y-ignore-next-line server-no-decrypt -- TOTP secrets are operational server-side PII (not E2EE client data)
      const secretB32 = encryptor.decrypt(row.encrypted_secret);
      const secret = base32Decode(secretB32);

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
      const session = await sessions.findByToken(sessionToken);
      if (
        session?.webauthnChallenge === undefined ||
        session.webauthnChallenge === null
      ) {
        throw new ValidationError(
          "No WebAuthn challenge found for this session.",
        );
      }

      const expected: RegistrationChecks = {
        challenge: session.webauthnChallenge,
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
      const session = await sessions.findByToken(sessionToken);
      if (
        session?.webauthnChallenge === undefined ||
        session.webauthnChallenge === null
      ) {
        throw new ValidationError(
          "No WebAuthn challenge found for this session.",
        );
      }

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
        challenge: session.webauthnChallenge,
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
