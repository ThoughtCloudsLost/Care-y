// Audit log service: append-only ticket lifecycle event logging.
// No UPDATE or DELETE operations. Manager+ can query.
// Stores pseudonyms only, never PII (names, phone numbers, ticket content).

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { AuditEventType, AuditLogQueryInput } from "@care-y/shared";
import { toCount } from "../db/query-utils.js";

export interface AuditEntry {
  readonly eventType: AuditEventType;
  readonly actorId: string;
  readonly ticketId?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface AuditLogResult {
  readonly entries: readonly {
    readonly id: string;
    readonly eventType: string;
    readonly actorId: string;
    readonly ticketId: string | null;
    readonly metadata: Record<string, unknown>;
    readonly createdAt: Date;
  }[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

/**
 * One row of the dashboard activity feed.
 *
 * Both `encryptedQueueName` and `encryptedClientAlias` are org-key
 * ciphertext. This service never decrypts either; the browser handles
 * both via OrgDecryptCache.
 */
export interface RecentActivityEntry {
  readonly id: string;
  readonly eventType: string;
  readonly ticketId: string | null;
  readonly clientId: string;
  readonly encryptedClientAlias: Buffer;
  readonly queueId: string;
  readonly encryptedQueueName: Buffer;
  readonly createdAt: Date;
}

export interface AuditService {
  /** Appends an audit log entry. Never throws (best-effort logging). */
  log(entry: AuditEntry): Promise<void>;

  /** Queries audit log entries with filtering and pagination. */
  query(input: AuditLogQueryInput): Promise<AuditLogResult>;

  /**
   * Ticket-linked audit events for the given queues, newest first.
   *
   * Backs the dashboard activity feed. Callers scope `queueIds` to what the
   * requesting user may see; this method applies no access control of its own.
   */
  listRecentForQueues(
    queueIds: readonly string[],
    limit: number,
  ): Promise<readonly RecentActivityEntry[]>;
}

export function createAuditService(db: Kysely<TenantDatabase>): AuditService {
  return {
    async log(entry) {
      try {
        await db
          .insertInto("audit_log")
          .values({
            event_type: entry.eventType,
            actor_id: entry.actorId,
            ticket_id: entry.ticketId ?? null,
            metadata: entry.metadata ?? {},
          })
          .execute();
      } catch {
        // Audit logging is best-effort. A failure here should never
        // block the operation that triggered the audit event.
        // The database layer's own error logging captures the failure.
      }
    },

    async query(input) {
      let query = db
        .selectFrom("audit_log")
        .select([
          "id",
          "event_type as eventType",
          "actor_id as actorId",
          "ticket_id as ticketId",
          "metadata",
          "created_at as createdAt",
        ]);

      if (input.eventType !== undefined) {
        query = query.where("event_type", "=", input.eventType);
      }
      if (input.actorId !== undefined) {
        query = query.where("actor_id", "=", input.actorId);
      }
      if (input.ticketId !== undefined) {
        query = query.where("ticket_id", "=", input.ticketId);
      }
      if (input.dateFrom !== undefined) {
        query = query.where("created_at", ">=", new Date(input.dateFrom));
      }
      if (input.dateTo !== undefined) {
        query = query.where("created_at", "<=", new Date(input.dateTo));
      }

      const countQuery = db
        .selectFrom("audit_log")
        .$call((qb) => {
          let q = qb;
          if (input.eventType !== undefined)
            q = q.where("event_type", "=", input.eventType);
          if (input.actorId !== undefined)
            q = q.where("actor_id", "=", input.actorId);
          if (input.ticketId !== undefined)
            q = q.where("ticket_id", "=", input.ticketId);
          if (input.dateFrom !== undefined)
            q = q.where("created_at", ">=", new Date(input.dateFrom));
          if (input.dateTo !== undefined)
            q = q.where("created_at", "<=", new Date(input.dateTo));
          return q;
        })
        .select(db.fn.countAll().as("count"));

      const countResult = await countQuery.executeTakeFirstOrThrow();

      const entries = await query
        .orderBy("created_at", "desc")
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize)
        .execute();

      return {
        entries,
        total: toCount(countResult),
        page: input.page,
        pageSize: input.pageSize,
      };
    },

    async listRecentForQueues(
      queueIds,
      limit,
    ): Promise<readonly RecentActivityEntry[]> {
      // An empty `in ()` list is not valid SQL, so short-circuit here rather
      // than trusting the caller to have checked.
      if (queueIds.length === 0) return [];

      return db
        .selectFrom("audit_log as al")
        .innerJoin("tickets as t", "t.id", "al.ticket_id")
        .innerJoin("clients as c", "c.id", "t.client_id")
        .innerJoin("queues as q", "q.id", "t.queue_id")
        .select([
          "al.id",
          "al.event_type as eventType",
          "al.ticket_id as ticketId",
          "c.id as clientId",
          "c.encrypted_alias as encryptedClientAlias",
          "q.id as queueId",
          "q.encrypted_name as encryptedQueueName",
          "al.created_at as createdAt",
        ])
        .where("t.queue_id", "in", [...queueIds])
        .where("al.ticket_id", "is not", null)
        .orderBy("al.created_at", "desc")
        .limit(limit)
        .execute();
    },
  };
}
