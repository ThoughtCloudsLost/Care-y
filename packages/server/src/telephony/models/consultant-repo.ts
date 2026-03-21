/**
 * Consultant (volunteer phone) repository.
 *
 * Stores encrypted phone numbers and verification state for volunteers
 * who receive forwarded calls. Phone numbers are encrypted at rest;
 * lookup uses a pre-computed hash (phone_hash).
 *
 * All queries go through a Kysely instance bound to the tenant schema
 * via .withSchema(). Schema scoping is the caller's responsibility.
 */

import type { Kysely, Selectable } from "kysely";
import type { TenantDatabase, ConsultantsTable } from "../../db/types.js";

export interface ConsultantRecord {
  readonly id: string;
  readonly userId: string;
  readonly encryptedPhone: Buffer;
  readonly phoneHash: string;
  readonly isVerified: boolean;
  readonly preferredCallMethod: string;
}

export interface ConsultantRepository {
  findByUserId(userId: string): Promise<ConsultantRecord | null>;
  create(input: {
    userId: string;
    encryptedPhone: Buffer;
    phoneHash: string;
    preferredCallMethod: string;
  }): Promise<ConsultantRecord>;
  setVerificationCode(
    id: string,
    codeHash: string,
    expiresAt: Date,
  ): Promise<void>;
  verifyAndActivate(id: string, codeHash: string, now: Date): Promise<boolean>;
  updatePreferredCallMethod(id: string, method: string): Promise<void>;
  delete(id: string): Promise<void>;
}

function toConsultantRecord(
  row: Selectable<ConsultantsTable>,
): ConsultantRecord {
  return {
    id: row.id,
    userId: row.user_id,
    encryptedPhone: row.encrypted_phone,
    phoneHash: row.phone_hash,
    isVerified: row.is_verified,
    preferredCallMethod: row.preferred_call_method,
  };
}

export function createConsultantRepository(
  db: Kysely<TenantDatabase>,
): ConsultantRepository {
  return {
    async findByUserId(userId: string): Promise<ConsultantRecord | null> {
      const row = await db
        .selectFrom("consultants")
        .selectAll()
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (!row) return null;
      return toConsultantRecord(row);
    },

    async create(input: {
      userId: string;
      encryptedPhone: Buffer;
      phoneHash: string;
      preferredCallMethod: string;
    }): Promise<ConsultantRecord> {
      const row = await db
        .insertInto("consultants")
        .values({
          user_id: input.userId,
          encrypted_phone: input.encryptedPhone,
          phone_hash: input.phoneHash,
          preferred_call_method: input.preferredCallMethod,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toConsultantRecord(row);
    },

    async setVerificationCode(
      id: string,
      codeHash: string,
      expiresAt: Date,
    ): Promise<void> {
      await db
        .updateTable("consultants")
        .set({
          verification_code_hash: codeHash,
          verification_expires_at: expiresAt,
        })
        .where("id", "=", id)
        .execute();
    },

    async verifyAndActivate(
      id: string,
      codeHash: string,
      now: Date,
    ): Promise<boolean> {
      const row = await db
        .selectFrom("consultants")
        .select(["verification_code_hash", "verification_expires_at"])
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
        })
        .where("id", "=", id)
        .execute();

      return true;
    },

    async updatePreferredCallMethod(id: string, method: string): Promise<void> {
      await db
        .updateTable("consultants")
        .set({ preferred_call_method: method })
        .where("id", "=", id)
        .execute();
    },

    async delete(id: string): Promise<void> {
      await db.deleteFrom("consultants").where("id", "=", id).execute();
    },
  };
}
