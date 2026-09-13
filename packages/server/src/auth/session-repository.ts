/**
 * Session persistence via Kysely (tenant-scoped).
 *
 * All queries go through a Kysely instance bound to the tenant schema
 * via .withSchema(). The repository is multi-tenancy-unaware; schema
 * scoping is the caller's responsibility (pass tenantDb(orgSchema)).
 *
 * IP address and user agent are encrypted at rest for forensic storage.
 * Drift detection uses pre-computed HMAC tokens (ip_token, ua_token)
 * so the server never decrypts these values during normal operation.
 */

import type { Kysely, Selectable } from "kysely";
import type { SessionsTable, TenantDatabase } from "../db/types.js";
import type { SessionTokenizer } from "../crypto/session-tokenizer.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type {
  SessionId,
  SessionToken,
  UserId,
  IpToken,
  UaToken,
  WebauthnChallenge,
} from "@care-y/shared";

export interface SessionData {
  readonly id: SessionId;
  readonly token: SessionToken;
  readonly userId: UserId;
  readonly ipToken: IpToken;
  readonly uaToken: UaToken;
  readonly expiresAt: Date;
  readonly twofaVerified: boolean;
  readonly webauthnChallenge: WebauthnChallenge | null;
}

export interface CreateSessionInput {
  readonly token: SessionToken;
  readonly userId: UserId;
  readonly ipAddress: string; // plaintext input, tokenized + encrypted internally
  readonly userAgent: string;
  readonly expiresAt: Date;
}

export interface SessionRepository {
  create(input: CreateSessionInput): Promise<SessionData>;
  findByToken(token: SessionToken): Promise<SessionData | null>;
  deleteByToken(token: SessionToken): Promise<void>;
  deleteByUserId(userId: UserId): Promise<void>;
  deleteByUserIdExceptToken(
    userId: UserId,
    exceptToken: SessionToken,
  ): Promise<number>;
  deleteExpired(): Promise<number>;
  markTwoFactorVerified(token: SessionToken): Promise<void>;
  clearTwoFactorVerified(token: SessionToken): Promise<void>;
  setWebauthnChallenge(
    token: SessionToken,
    challenge: WebauthnChallenge | null,
  ): Promise<void>;
}

function toSessionData(row: Selectable<SessionsTable>): SessionData {
  return {
    id: row.id,
    token: row.token,
    userId: row.user_id,
    ipToken: row.ip_token,
    uaToken: row.ua_token,
    expiresAt: row.expires_at,
    twofaVerified: row.twofa_verified,
    webauthnChallenge: row.webauthn_challenge,
  };
}

/**
 * Creates a SessionRepository backed by Kysely against the tenant schema.
 *
 * Dependencies:
 * - tokenizer: computes HMAC tokens for drift detection
 * - sealedBox: seals IP/UA with org public key (server-blind org-key tier)
 */
export function createDbSessionRepository(
  db: Kysely<TenantDatabase>,
  tokenizer: SessionTokenizer,
  sealedBox: SealedBoxEncryptor,
): SessionRepository {
  return {
    async create(input: CreateSessionInput): Promise<SessionData> {
      const ipToken = tokenizer.tokenizeIp(input.ipAddress);
      const uaToken = tokenizer.tokenizeUa(input.userAgent);

      const encryptedIp = sealedBox.seal(input.ipAddress);
      const encryptedUa = sealedBox.seal(input.userAgent);

      const row = await db
        .insertInto("sessions")
        .values({
          token: input.token,
          user_id: input.userId,
          encrypted_ip_address: encryptedIp,
          encrypted_user_agent: encryptedUa,
          ip_token: ipToken,
          ua_token: uaToken,
          expires_at: input.expiresAt,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toSessionData(row);
    },

    async findByToken(token: SessionToken): Promise<SessionData | null> {
      const row = await db
        .selectFrom("sessions")
        .selectAll()
        .where("token", "=", token)
        .executeTakeFirst();

      if (!row) return null;
      return toSessionData(row);
    },

    async deleteByToken(token: SessionToken): Promise<void> {
      await db.deleteFrom("sessions").where("token", "=", token).execute();
    },

    async deleteByUserId(userId: UserId): Promise<void> {
      await db.deleteFrom("sessions").where("user_id", "=", userId).execute();
    },

    async deleteByUserIdExceptToken(
      userId: UserId,
      exceptToken: SessionToken,
    ): Promise<number> {
      const result = await db
        .deleteFrom("sessions")
        .where("user_id", "=", userId)
        .where("token", "!=", exceptToken)
        .executeTakeFirst();

      return Number(result.numDeletedRows);
    },

    async deleteExpired(): Promise<number> {
      const result = await db
        .deleteFrom("sessions")
        .where("expires_at", "<", new Date())
        .executeTakeFirst();

      return Number(result.numDeletedRows);
    },

    async markTwoFactorVerified(token: SessionToken): Promise<void> {
      await db
        .updateTable("sessions")
        .set({ twofa_verified: true })
        .where("token", "=", token)
        .execute();
    },

    async clearTwoFactorVerified(token: SessionToken): Promise<void> {
      await db
        .updateTable("sessions")
        .set({ twofa_verified: false })
        .where("token", "=", token)
        .execute();
    },

    async setWebauthnChallenge(
      token: SessionToken,
      challenge: WebauthnChallenge | null,
    ): Promise<void> {
      await db
        .updateTable("sessions")
        .set({ webauthn_challenge: challenge })
        .where("token", "=", token)
        .execute();
    },
  };
}
