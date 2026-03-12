/**
 * Session persistence via Kysely (tenant-scoped).
 *
 * All queries go through a Kysely instance bound to the tenant schema
 * via .withSchema(). The repository is multi-tenancy-unaware; schema
 * scoping is the caller's responsibility (pass tenantDb(orgSchema)).
 *
 * IP address and user agent are encrypted at rest via FieldEncryptor.
 * The domain layer (SessionData) uses plaintext strings; encryption is
 * an internal persistence concern handled transparently by this repository.
 */

import type { Kysely, Selectable } from "kysely";
import type { SessionsTable, TenantDatabase } from "../db/types.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";

export interface SessionData {
  readonly id: string;
  readonly token: string;
  readonly userId: string;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly twofaVerified: boolean;
  readonly webauthnChallenge: string | null;
}

export interface CreateSessionInput {
  readonly token: string;
  readonly userId: string;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly expiresAt: Date;
}

export interface SessionRepository {
  create(input: CreateSessionInput): Promise<SessionData>;
  findByToken(token: string): Promise<SessionData | null>;
  deleteByToken(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<number>;
  markTwoFactorVerified(token: string): Promise<void>;
  clearTwoFactorVerified(token: string): Promise<void>;
  setWebauthnChallenge(token: string, challenge: string | null): Promise<void>;
}

function toSessionData(
  row: Selectable<SessionsTable>,
  encryptor: FieldEncryptor,
): SessionData {
  return {
    id: row.id,
    token: row.token,
    userId: row.user_id,
    ipAddress: encryptor.decrypt(row.encrypted_ip_address),
    userAgent: encryptor.decrypt(row.encrypted_user_agent),
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    twofaVerified: row.twofa_verified,
    webauthnChallenge: row.webauthn_challenge,
  };
}

/** Creates a SessionRepository backed by Kysely against the tenant schema. */
export function createDbSessionRepository(
  db: Kysely<TenantDatabase>,
  encryptor: FieldEncryptor,
): SessionRepository {
  return {
    async create(input: CreateSessionInput): Promise<SessionData> {
      const row = await db
        .insertInto("sessions")
        .values({
          token: input.token,
          user_id: input.userId,
          encrypted_ip_address: encryptor.encrypt(input.ipAddress),
          encrypted_user_agent: encryptor.encrypt(input.userAgent),
          expires_at: input.expiresAt,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toSessionData(row, encryptor);
    },

    async findByToken(token: string): Promise<SessionData | null> {
      const row = await db
        .selectFrom("sessions")
        .selectAll()
        .where("token", "=", token)
        .executeTakeFirst();

      if (!row) return null;
      return toSessionData(row, encryptor);
    },

    async deleteByToken(token: string): Promise<void> {
      await db.deleteFrom("sessions").where("token", "=", token).execute();
    },

    async deleteByUserId(userId: string): Promise<void> {
      await db.deleteFrom("sessions").where("user_id", "=", userId).execute();
    },

    async deleteExpired(): Promise<number> {
      const result = await db
        .deleteFrom("sessions")
        .where("expires_at", "<", new Date())
        .executeTakeFirst();

      return Number(result.numDeletedRows);
    },

    async markTwoFactorVerified(token: string): Promise<void> {
      await db
        .updateTable("sessions")
        .set({ twofa_verified: true })
        .where("token", "=", token)
        .execute();
    },

    async clearTwoFactorVerified(token: string): Promise<void> {
      await db
        .updateTable("sessions")
        .set({ twofa_verified: false })
        .where("token", "=", token)
        .execute();
    },

    async setWebauthnChallenge(
      token: string,
      challenge: string | null,
    ): Promise<void> {
      await db
        .updateTable("sessions")
        .set({ webauthn_challenge: challenge })
        .where("token", "=", token)
        .execute();
    },
  };
}
