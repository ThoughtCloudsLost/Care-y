/**
 * Service layer for volunteer consultant phone registration and verification.
 *
 * Owns the verification code generation, hashing, and expiry logic.
 * Routes delegate here instead of creating repositories directly.
 *
 * ADR-065: register() carries metadata only (preferredCallMethod,
 * smsPingsOptIn). All phone-derived data is written exclusively by
 * prepareVerification(), which the relay verification endpoint calls
 * after deriving all artifacts from a single plaintext Buffer.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createConsultantRepository,
  type ConsultantRecord,
  type ConsultantRepository,
} from "./models/consultant-repo.js";
import { randomInt, createHash } from "node:crypto";
import {
  NotFoundError,
  AuthError,
  RateLimitError,
  ValidationError,
} from "../errors.js";
import { ErrorCode, verificationCodeHashSchema } from "@care-y/shared";
import type {
  ConsultantId,
  UserId,
  OpsPhoneHash,
  VerificationCodeHash,
} from "@care-y/shared";

const VERIFICATION_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const COOLDOWN_MS = 60 * 1000; // 60 seconds between sends
const HOURLY_LIMIT = 5; // max 5 sends per hour
const HOURLY_WINDOW_MS = 60 * 60 * 1000;
// Wrong-code lockout mirrors the 2FA code services (sms-code.ts, email-code.ts)
// which use MAX_ATTEMPTS = 3 per active code. The security-hardening.md
// "Brute Force Specifics" section specifies 10 failed login attempts for
// account lockout; 2FA code verification is stricter at 3 attempts per code
// because codes are short (6 digits) and a single code grants access. We
// mirror that 2FA threshold here.
const MAX_VERIFICATION_ATTEMPTS = 3;

function hashCode(code: string): VerificationCodeHash {
  return verificationCodeHashSchema.parse(
    createHash("sha256").update(code).digest("hex"),
  );
}

export interface ConsultantInfo {
  readonly id: ConsultantId;
  readonly isVerified: boolean;
  readonly preferredCallMethod: string;
  readonly encryptedPhone: string | null;
  readonly smsPingsEnabled: boolean;
  readonly hasOpsPhone: boolean;
}

export interface ConsultantService {
  getByUserId(userId: UserId): Promise<ConsultantInfo | null>;
  /** Metadata-only registration. No phone fields (ADR-065). */
  register(
    userId: UserId,
    preferredCallMethod: string,
    smsPingsOptIn: boolean,
  ): Promise<{ id: ConsultantId }>;
  /**
   * Called by the relay verify endpoint (the ONLY phone write path, ADR-065).
   * In one transaction: stages org-tier sealed copy, ops_phone_hash, and the
   * staged OPS copy, resets is_verified, enforces cooldown + hourly cap,
   * generates the code, stores codeHash/expiry. Returns the code for the
   * caller to send (caller owns SMS + zeroing).
   */
  prepareVerification(
    userId: UserId,
    artifacts: {
      readonly orgSealedPhone: Buffer;
      readonly opsPhoneHash: OpsPhoneHash;
      readonly opsEncryptedPhone: Buffer | null;
    },
  ): Promise<{ code: string }>;
  /**
   * Verifies the code. On success, sets is_verified and finalizes staged
   * opt-in state in one UPDATE. On repeated failure past the lockout
   * threshold, clears the code and requires a fresh send.
   */
  verify(userId: UserId, code: string): Promise<void>;
  updatePreference(userId: UserId, preferredCallMethod: string): Promise<void>;
  /** Atomically clears encrypted_phone, ops trio, and is_verified. */
  deleteByUserId(userId: UserId): Promise<void>;
  /**
   * Disabling: ops_encrypted_phone = NULL in the same statement.
   * Enabling after the fact requires re-verification (the server no longer
   * has the plaintext to encrypt): throws REVERIFICATION_REQUIRED.
   */
  setSmsPings(userId: UserId, enabled: boolean): Promise<void>;
}

/** Looks up a consultant by userId, throwing NotFoundError if missing. */
async function requireConsultantByUserId(
  repo: ConsultantRepository,
  userId: UserId,
): Promise<ConsultantRecord> {
  const record = await repo.findByUserId(userId);
  if (!record) {
    throw new NotFoundError(ErrorCode.NO_CONSULTANT_REGISTRATION);
  }
  return record;
}

export function createConsultantService(
  tenantDb: Kysely<TenantDatabase>,
): ConsultantService {
  const repo = createConsultantRepository(tenantDb);

  return {
    async getByUserId(userId: UserId): Promise<ConsultantInfo | null> {
      const record = await repo.findByUserId(userId);
      if (!record) return null;
      return {
        id: record.id,
        isVerified: record.isVerified,
        preferredCallMethod: record.preferredCallMethod,
        encryptedPhone: record.encryptedPhone
          ? record.encryptedPhone.toString("base64url")
          : null,
        smsPingsEnabled: record.smsPingsEnabled,
        hasOpsPhone: record.opsEncryptedPhone !== null,
      };
    },

    async register(
      userId: UserId,
      preferredCallMethod: string,
      smsPingsOptIn: boolean,
    ): Promise<{ id: ConsultantId }> {
      // Metadata-only: no phone fields, no code generation (ADR-065).
      // Code lifecycle moved entirely to prepareVerification.
      const consultant = await repo.create({
        userId,
        preferredCallMethod,
        smsPingsOptIn,
      });

      return { id: consultant.id };
    },

    async prepareVerification(
      userId: UserId,
      artifacts: {
        readonly orgSealedPhone: Buffer;
        readonly opsPhoneHash: OpsPhoneHash;
        readonly opsEncryptedPhone: Buffer | null;
      },
    ): Promise<{ code: string }> {
      const record = await requireConsultantByUserId(repo, userId);
      const now = new Date();

      // Generate code before the atomic UPDATE; the code never leaves
      // this return value (anti-pattern: never log or return it elsewhere).
      const code = String(randomInt(100000, 1000000));
      const codeHash = hashCode(code);
      const expiresAt = new Date(now.getTime() + VERIFICATION_EXPIRY_MS);

      // Thresholds for the conditional WHERE clause
      const cooldownNotBefore = new Date(now.getTime() - COOLDOWN_MS);
      const hourlyWindowNotBefore = new Date(now.getTime() - HOURLY_WINDOW_MS);

      // Single conditional UPDATE: stages all phone artifacts, resets
      // is_verified, stores new code, rolls the hourly window, increments
      // the send counter, and resets attempt counter. The WHERE clause
      // enforces both the 60s cooldown and the 5/hour cap atomically.
      // Two concurrent requests both reading count 4 cannot both succeed:
      // only one UPDATE will match the WHERE condition.
      const rowsUpdated = await repo.stageVerification(
        record.id,
        artifacts,
        codeHash,
        expiresAt,
        now,
        cooldownNotBefore,
        hourlyWindowNotBefore,
        HOURLY_LIMIT,
      );

      if (rowsUpdated === 0) {
        // The atomic UPDATE matched nothing. Re-read only to classify
        // the error (cooldown vs hourly) for the client response.
        const current = await repo.findByUserId(userId);
        if (
          current?.verifyLastSentAt &&
          current.verifyLastSentAt > cooldownNotBefore
        ) {
          const elapsed = now.getTime() - current.verifyLastSentAt.getTime();
          const retryAfter = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
          throw new RateLimitError(ErrorCode.RATE_LIMIT_COOLDOWN, retryAfter);
        }
        throw new RateLimitError(ErrorCode.RATE_LIMIT_HOURLY, 3600);
      }

      return { code };
    },

    async verify(userId: UserId, code: string): Promise<void> {
      const record = await requireConsultantByUserId(repo, userId);

      // Check for exhausted attempts before anything else
      if (record.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
        await repo.clearVerificationCode(record.id);
        throw new ValidationError(ErrorCode.TOO_MANY_ATTEMPTS);
      }

      const codeHash = hashCode(code);
      const verified = await repo.verifyAndActivate(
        record.id,
        codeHash,
        new Date(),
      );

      if (!verified) {
        // Increment attempt counter; clear code if max reached
        const newAttempts = await repo.incrementVerificationAttempts(record.id);
        if (newAttempts >= MAX_VERIFICATION_ATTEMPTS) {
          await repo.clearVerificationCode(record.id);
          throw new ValidationError(ErrorCode.TOO_MANY_ATTEMPTS);
        }
        throw new AuthError(ErrorCode.INVALID_VERIFICATION_CODE);
      }
    },

    async updatePreference(
      userId: UserId,
      preferredCallMethod: string,
    ): Promise<void> {
      const record = await requireConsultantByUserId(repo, userId);
      await repo.updatePreferredCallMethod(record.id, preferredCallMethod);
    },

    async deleteByUserId(userId: UserId): Promise<void> {
      const record = await requireConsultantByUserId(repo, userId);
      await repo.delete(record.id);
    },

    async setSmsPings(userId: UserId, enabled: boolean): Promise<void> {
      const record = await requireConsultantByUserId(repo, userId);

      if (enabled) {
        // Enabling requires that the OPS encrypted phone exists (was staged
        // during verification with wantsPings=true). If absent, the server
        // no longer has the plaintext and re-verification is needed.
        if (record.opsEncryptedPhone === null) {
          throw new ValidationError(ErrorCode.REVERIFICATION_REQUIRED);
        }
        await repo.setSmsPingsEnabled(record.id, true);
      } else {
        // Disabling nulls ops_encrypted_phone atomically
        await repo.setSmsPingsEnabled(record.id, false);
      }
    },
  };
}
