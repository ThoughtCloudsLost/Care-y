/**
 * Session persistence via Kysely (tenant-scoped).
 *
 * All queries go through a Kysely instance bound to the tenant schema
 * via .withSchema(). The repository is multi-tenancy-unaware; schema
 * scoping is the caller's responsibility (pass tenantDb(orgSchema)).
 */

import type { Kysely, Selectable } from "kysely";
import type { SessionsTable, TenantDatabase } from "../db/types.js";

export interface SessionData {
  readonly id: string;
  readonly token: string;
  readonly userId: string;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly expiresAt: Date;
  readonly createdAt: Date;
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
}

function toSessionData(row: Selectable<SessionsTable>): SessionData {
  return {
    id: row.id,
    token: row.token,
    userId: row.user_id,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

/** Creates a SessionRepository backed by Kysely against the tenant schema. */
export function createDbSessionRepository(
  db: Kysely<TenantDatabase>,
): SessionRepository {
  return {
    async create(input: CreateSessionInput): Promise<SessionData> {
      const row = await db
        .insertInto("sessions")
        .values({
          token: input.token,
          user_id: input.userId,
          ip_address: input.ipAddress,
          user_agent: input.userAgent,
          expires_at: input.expiresAt,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toSessionData(row);
    },

    async findByToken(token: string): Promise<SessionData | null> {
      const row = await db
        .selectFrom("sessions")
        .selectAll()
        .where("token", "=", token)
        .executeTakeFirst();

      if (!row) return null;
      return toSessionData(row);
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
  };
}
