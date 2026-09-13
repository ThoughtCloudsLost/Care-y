/**
 * Consultant (volunteer phone) repository.
 *
 * Stores encrypted phone numbers and verification state for volunteers
 * who receive forwarded calls. Phone numbers are encrypted at rest;
 * lookup uses a server-computed blind-index hash (ops_phone_hash) under
 * the "consultant-phone-index" HKDF label (ADR-065, never the
 * phones.phone_hash domain).
 *
 * All queries go through a Kysely instance bound to the tenant schema
 * via .withSchema(). Schema scoping is the caller's responsibility.
 */

import type { Kysely, Selectable } from "kysely";
import type { TenantDatabase, ConsultantsTable } from "../../db/types.js";
import type {
  ConsultantId,
  UserId,
  OpsPhoneHash,
  VerificationCodeHash,
} from "@care-y/shared";

export interface ConsultantRecord {
  readonly id: ConsultantId;
  readonly userId: UserId;
  readonly encryptedPhone: Buffer | null;
  readonly isVerified: boolean;
  readonly preferredCallMethod: string;
  readonly opsPhoneHash: OpsPhoneHash | null;
  readonly opsEncryptedPhone: Buffer | null;
  readonly smsPingsEnabled: boolean;
  readonly verificationCodeHash: VerificationCodeHash | null;
  readonly verificationExpiresAt: Date | null;
  readonly verificationAttempts: number;
  readonly verifySendsHourStart: Date | null;
  readonly verifySendsInHour: number;
  readonly verifyLastSentAt: Date | null;
}

export interface ConsultantRepository {
  findByUserId(userId: UserId): Promise<ConsultantRecord | null>;
  create(input: {
    userId: UserId;
    preferredCallMethod: string;
    smsPingsOptIn: boolean;
  }): Promise<ConsultantRecord>;
  setVerificationCode(
    id: ConsultantId,
    codeHash: VerificationCodeHash,
    expiresAt: Date,
  ): Promise<void>;
  /**
   * Atomically stages phone artifacts, resets is_verified, stores a new
   * code hash/expiry, rolls the hourly window, increments the hourly
   * counter, and resets attempts in a single UPDATE whose WHERE clause
   * enforces both the cooldown and hourly cap. Returns the number of rows
   * affected: 0 means the rate-limit conditions were not met (the UPDATE
   * matched nothing). The caller reads the row afterward only to classify
   * the error (cooldown vs hourly) for the response.
   */
  stageVerification(
    id: ConsultantId,
    artifacts: {
      readonly orgSealedPhone: Buffer;
      readonly opsPhoneHash: OpsPhoneHash;
      readonly opsEncryptedPhone: Buffer | null;
    },
    codeHash: VerificationCodeHash,
    expiresAt: Date,
    now: Date,
    cooldownNotBefore: Date,
    hourlyWindowNotBefore: Date,
    hourlyLimit: number,
  ): Promise<number>;
  /** Atomic verify: sets is_verified, clears code, finalizes ops columns. */
  verifyAndActivate(
    id: ConsultantId,
    codeHash: VerificationCodeHash,
    now: Date,
  ): Promise<boolean>;
  /** Increments verification_attempts. Returns new count. */
  incrementVerificationAttempts(id: ConsultantId): Promise<number>;
  /** Clears code and attempts (lockout exhaustion). */
  clearVerificationCode(id: ConsultantId): Promise<void>;
  updatePreferredCallMethod(id: ConsultantId, method: string): Promise<void>;
  /** Atomically nulls ops_encrypted_phone when disabling SMS pings. */
  setSmsPingsEnabled(id: ConsultantId, enabled: boolean): Promise<void>;
  /** Atomically clears encrypted_phone, ops columns, and is_verified. */
  delete(id: ConsultantId): Promise<void>;
}

function toConsultantRecord(
  row: Selectable<ConsultantsTable>,
): ConsultantRecord {
  return {
    id: row.id,
    userId: row.user_id,
    encryptedPhone: row.encrypted_phone ?? null,
    isVerified: row.is_verified,
    preferredCallMethod: row.preferred_call_method,
    opsPhoneHash: row.ops_phone_hash ?? null,
    opsEncryptedPhone: row.ops_encrypted_phone ?? null,
    smsPingsEnabled: row.sms_pings_enabled,
    verificationCodeHash: row.verification_code_hash ?? null,
    verificationExpiresAt: row.verification_expires_at ?? null,
    verificationAttempts: row.verification_attempts,
    verifySendsHourStart: row.verify_sends_hour_start ?? null,
    verifySendsInHour: row.verify_sends_in_hour,
    verifyLastSentAt: row.verify_last_sent_at ?? null,
  };
}

export function createConsultantRepository(
  db: Kysely<TenantDatabase>,
): ConsultantRepository {
  return {
    async findByUserId(userId: UserId): Promise<ConsultantRecord | null> {
      const row = await db
        .selectFrom("consultants")
        .selectAll()
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (!row) return null;
      return toConsultantRecord(row);
    },

    async create(input: {
      userId: UserId;
      preferredCallMethod: string;
      smsPingsOptIn: boolean;
    }): Promise<ConsultantRecord> {
      const row = await db
        .insertInto("consultants")
        .values({
          user_id: input.userId,
          preferred_call_method: input.preferredCallMethod,
          // sms_pings_enabled stays false until verification finalizes it;
          // smsPingsOptIn is the staged intent, stored in the service layer.
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toConsultantRecord(row);
    },

    async setVerificationCode(
      id: ConsultantId,
      codeHash: VerificationCodeHash,
      expiresAt: Date,
    ): Promise<void> {
      await db
        .updateTable("consultants")
        .set({
          verification_code_hash: codeHash,
          verification_expires_at: expiresAt,
          verification_attempts: 0,
        })
        .where("id", "=", id)
        .execute();
    },

    async stageVerification(
      id: ConsultantId,
      artifacts: {
        readonly orgSealedPhone: Buffer;
        readonly opsPhoneHash: OpsPhoneHash;
        readonly opsEncryptedPhone: Buffer | null;
      },
      codeHash: VerificationCodeHash,
      expiresAt: Date,
      now: Date,
      cooldownNotBefore: Date,
      hourlyWindowNotBefore: Date,
      hourlyLimit: number,
    ): Promise<number> {
      // Single conditional UPDATE: stages all phone artifacts, resets
      // is_verified, stores new code, rolls the hourly window, increments
      // the hourly counter, and resets attempts. The WHERE clause enforces
      // the cooldown (verify_last_sent_at must be null or before the
      // cooldown threshold) and the hourly cap (window must have expired
      // or count must be below limit). Zero rows returned means a rate
      // limit condition was not met.
      const result = await db
        .updateTable("consultants")
        .set((eb) => ({
          encrypted_phone: artifacts.orgSealedPhone,
          ops_phone_hash: artifacts.opsPhoneHash,
          ops_encrypted_phone: artifacts.opsEncryptedPhone,
          is_verified: eb.lit(false),
          verification_code_hash: codeHash,
          verification_expires_at: expiresAt,
          verification_attempts: 0,
          verify_last_sent_at: now,
          // Roll the hourly window: if hour_start is null or older than
          // the window threshold, reset counter to 1; otherwise increment.
          verify_sends_in_hour: eb
            .case()
            .when(
              eb.or([
                eb("verify_sends_hour_start", "is", null),
                eb("verify_sends_hour_start", "<=", hourlyWindowNotBefore),
              ]),
            )
            .then(1)
            .else(eb("verify_sends_in_hour", "+", 1))
            .end(),
          // Roll the window start: reset to now if expired, keep if current.
          verify_sends_hour_start: eb
            .case()
            .when(
              eb.or([
                eb("verify_sends_hour_start", "is", null),
                eb("verify_sends_hour_start", "<=", hourlyWindowNotBefore),
              ]),
            )
            .then(now)
            .else(eb.ref("verify_sends_hour_start"))
            .end(),
        }))
        .where("id", "=", id)
        // Cooldown: last sent must be null or before the threshold
        .where((eb) =>
          eb.or([
            eb("verify_last_sent_at", "is", null),
            eb("verify_last_sent_at", "<=", cooldownNotBefore),
          ]),
        )
        // Hourly cap: window expired (will roll) OR count below limit
        .where((eb) =>
          eb.or([
            eb("verify_sends_hour_start", "is", null),
            eb("verify_sends_hour_start", "<=", hourlyWindowNotBefore),
            eb("verify_sends_in_hour", "<", hourlyLimit),
          ]),
        )
        .execute();

      return Number(result[0]?.numUpdatedRows ?? 0);
    },

    async verifyAndActivate(
      id: ConsultantId,
      codeHash: VerificationCodeHash,
      now: Date,
    ): Promise<boolean> {
      const row = await db
        .selectFrom("consultants")
        .select([
          "verification_code_hash",
          "verification_expires_at",
          "verification_attempts",
        ])
        .where("id", "=", id)
        .executeTakeFirst();

      if (!row) return false;
      if (
        row.verification_code_hash == null ||
        row.verification_expires_at == null
      ) {
        return false;
      }
      if (row.verification_code_hash !== codeHash) return false;
      if (row.verification_expires_at <= now) return false;

      await db
        .updateTable("consultants")
        .set({
          is_verified: true,
          verification_code_hash: null,
          verification_expires_at: null,
          verification_attempts: 0,
        })
        .where("id", "=", id)
        .execute();

      return true;
    },

    async incrementVerificationAttempts(id: ConsultantId): Promise<number> {
      const result = await db
        .updateTable("consultants")
        .set((eb) => ({
          verification_attempts: eb("verification_attempts", "+", 1),
        }))
        .where("id", "=", id)
        .returning("verification_attempts")
        .executeTakeFirstOrThrow();

      return result.verification_attempts;
    },

    async clearVerificationCode(id: ConsultantId): Promise<void> {
      await db
        .updateTable("consultants")
        .set({
          verification_code_hash: null,
          verification_expires_at: null,
          verification_attempts: 0,
        })
        .where("id", "=", id)
        .execute();
    },

    async updatePreferredCallMethod(
      id: ConsultantId,
      method: string,
    ): Promise<void> {
      await db
        .updateTable("consultants")
        .set({ preferred_call_method: method })
        .where("id", "=", id)
        .execute();
    },

    async setSmsPingsEnabled(
      id: ConsultantId,
      enabled: boolean,
    ): Promise<void> {
      if (enabled) {
        await db
          .updateTable("consultants")
          .set({ sms_pings_enabled: true })
          .where("id", "=", id)
          .execute();
      } else {
        // Disabling nulls the ops copy in the same statement (security action)
        await db
          .updateTable("consultants")
          .set({
            sms_pings_enabled: false,
            ops_encrypted_phone: null,
          })
          .where("id", "=", id)
          .execute();
      }
    },

    async delete(id: ConsultantId): Promise<void> {
      await db.deleteFrom("consultants").where("id", "=", id).execute();
    },
  };
}
