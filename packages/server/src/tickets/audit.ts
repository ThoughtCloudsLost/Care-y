// Audit log service: append-only ticket lifecycle event logging.
// No UPDATE or DELETE operations. Manager+ can query.
// Stores pseudonyms only, never PII (names, phone numbers, ticket content).

import type { Expression, ExpressionBuilder, Kysely, SqlBool } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type {
  AuditEventType,
  AuditLogQueryInput,
  AuditLogId,
  UserId,
  TicketId,
  ClientId,
  QueueId,
  DashboardActivityKind,
} from "@care-y/shared";
import { toCount } from "../db/query-utils.js";

export interface AuditEntry {
  readonly eventType: AuditEventType;
  readonly actorId: UserId;
  readonly ticketId?: TicketId;
  readonly metadata?: Record<string, unknown>;
}

export interface AuditLogResult {
  readonly entries: readonly {
    readonly id: AuditLogId;
    readonly eventType: string;
    readonly actorId: UserId;
    readonly ticketId: TicketId | null;
    readonly metadata: Record<string, unknown>;
    readonly createdAt: Date;
  }[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

/**
 * One row of the dashboard activity feed, discriminated on `kind`.
 *
 * - `ticket`: an event on a ticket in one of the caller's queues.
 * - `ticket_outside_queues`: an event on a ticket in a queue the caller is
 *   not a member of. Returned only when the caller asked for every queue.
 *   The ticket, its client and the client alias are withheld; only the
 *   queue is named.
 * - `org`: an organization event with no ticket.
 *
 * `encryptedQueueName` and `encryptedClientAlias` are org-key ciphertext.
 * This service never decrypts either; the browser handles both via
 * OrgDecryptCache.
 */
export type RecentActivityEntry =
  | {
      readonly kind: "ticket";
      readonly id: AuditLogId;
      readonly eventType: string;
      readonly ticketId: TicketId;
      readonly clientId: ClientId;
      readonly encryptedClientAlias: Buffer;
      readonly queueId: QueueId;
      readonly encryptedQueueName: Buffer;
      readonly createdAt: Date;
    }
  | {
      readonly kind: "ticket_outside_queues";
      readonly id: AuditLogId;
      readonly eventType: string;
      readonly queueId: QueueId;
      readonly encryptedQueueName: Buffer;
      readonly createdAt: Date;
    }
  | {
      readonly kind: "org";
      readonly id: AuditLogId;
      readonly eventType: string;
      readonly createdAt: Date;
    };

/** Which audit events the dashboard activity feed covers for one caller. */
export interface RecentActivityScope {
  /** Ticket-linked event types to return. */
  readonly ticketEventTypes: readonly AuditEventType[];
  /** Organization (ticket-less) event types to return. */
  readonly orgEventTypes: readonly AuditEventType[];
  /** The caller's queues. Ticket events here come back as `ticket`. */
  readonly ownQueueIds: readonly QueueId[];
  /**
   * When true, ticket events from every queue are returned, and those
   * outside `ownQueueIds` come back as `ticket_outside_queues`.
   */
  readonly allQueues: boolean;
  /**
   * Viewer filter on feed kinds: "ticket" covers `ticket` and
   * `ticket_outside_queues` rows. Absent or empty means every kind.
   */
  readonly kinds?: readonly DashboardActivityKind[];
  /**
   * Viewer filter on queues: ticket rows outside these queues and every org
   * row (org events have no queue) are left out. Absent or empty means no
   * filter. It only narrows the scope above, never widens it.
   */
  readonly queueIds?: readonly QueueId[];
}

export interface RecentActivityQuery extends RecentActivityScope {
  readonly limit: number;
}

export interface RecentActivityCountQuery extends RecentActivityScope {
  /** Only events created at or after this instant are counted. */
  readonly since: Date;
}

export interface AuditService {
  /** Appends an audit log entry. Never throws (best-effort logging). */
  log(entry: AuditEntry): Promise<void>;

  /** Queries audit log entries with filtering and pagination. */
  query(input: AuditLogQueryInput): Promise<AuditLogResult>;

  /**
   * Recent audit events for the dashboard activity feed, newest first, at
   * most `limit` entries across ticket and organization events.
   *
   * Callers resolve the event types and `allQueues` from the requesting
   * user's permissions, and `ownQueueIds` from their queue membership; this
   * method applies no access control of its own.
   */
  listRecentActivity(
    query: RecentActivityQuery,
  ): Promise<readonly RecentActivityEntry[]>;

  /**
   * How many events `listRecentActivity` would include for the same scope
   * were it not cut to `limit`, counting only those created at or after
   * `since`. Applies no access control of its own, as above.
   */
  countRecentActivity(query: RecentActivityCountQuery): Promise<number>;
}

/**
 * The `query` filters as one WHERE expression, shared by the page query and
 * the `total` count so the two can never disagree. No filters yields a
 * condition that is always true.
 */
function auditLogFilterWhere(
  eb: ExpressionBuilder<TenantDatabase, "audit_log">,
  filters: AuditLogQueryInput,
): Expression<SqlBool> {
  const conditions: Expression<SqlBool>[] = [];
  if (filters.eventType !== undefined) {
    conditions.push(eb("event_type", "=", filters.eventType));
  }
  if (filters.actorId !== undefined) {
    conditions.push(eb("actor_id", "=", filters.actorId));
  }
  if (filters.ticketId !== undefined) {
    conditions.push(eb("ticket_id", "=", filters.ticketId));
  }
  if (filters.dateFrom !== undefined) {
    conditions.push(eb("created_at", ">=", new Date(filters.dateFrom)));
  }
  if (filters.dateTo !== undefined) {
    conditions.push(eb("created_at", "<=", new Date(filters.dateTo)));
  }
  return eb.and(conditions);
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
      const countResult = await db
        .selectFrom("audit_log")
        .where((eb) => auditLogFilterWhere(eb, input))
        .select(db.fn.countAll().as("count"))
        .executeTakeFirstOrThrow();

      const entries = await db
        .selectFrom("audit_log")
        .select([
          "id",
          "event_type as eventType",
          "actor_id as actorId",
          "ticket_id as ticketId",
          "metadata",
          "created_at as createdAt",
        ])
        .where((eb) => auditLogFilterWhere(eb, input))
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

    async listRecentActivity(query): Promise<readonly RecentActivityEntry[]> {
      const [ticketEntries, orgEntries] = await Promise.all([
        listRecentTicketActivity(db, query),
        listRecentOrgActivity(db, query),
      ]);
      // Each list is already newest first and cut to `limit`, so the newest
      // `limit` of the two together are all in this merge.
      return [...ticketEntries, ...orgEntries]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, query.limit);
    },

    async countRecentActivity(query): Promise<number> {
      const [ticketCount, orgCount] = await Promise.all([
        countRecentTicketActivity(db, query),
        countRecentOrgActivity(db, query),
      ]);
      return ticketCount + orgCount;
    },
  };
}

// An empty `in ()` list is not valid SQL, so each query short-circuits on
// these checks rather than trusting the caller to have checked.
function hasTicketScope(scope: RecentActivityScope): boolean {
  if (scope.ticketEventTypes.length === 0) return false;
  if (!kindRequested(scope, "ticket")) return false;
  return scope.allQueues || scope.ownQueueIds.length > 0;
}

function hasOrgScope(scope: RecentActivityScope): boolean {
  if (scope.orgEventTypes.length === 0) return false;
  if (!kindRequested(scope, "org")) return false;
  // Org events have no queue, so any queue filter leaves them all out.
  return (scope.queueIds ?? []).length === 0;
}

/** An absent or empty `kinds` filter requests every kind. */
function kindRequested(
  scope: RecentActivityScope,
  kind: DashboardActivityKind,
): boolean {
  const kinds = scope.kinds ?? [];
  return kinds.length === 0 || kinds.includes(kind);
}

/**
 * Ticket-linked feed rows in scope, before selection. The inner joins are
 * part of the filter: a row is only in the feed when its ticket, client and
 * queue all resolve. Call only when `hasTicketScope` holds.
 */
function recentTicketActivityRows(
  db: Kysely<TenantDatabase>,
  scope: RecentActivityScope,
) {
  let builder = db
    .selectFrom("audit_log as al")
    .innerJoin("tickets as t", "t.id", "al.ticket_id")
    .innerJoin("clients as c", "c.id", "t.client_id")
    .innerJoin("queues as q", "q.id", "t.queue_id")
    .where("al.ticket_id", "is not", null)
    .where("al.event_type", "in", [...scope.ticketEventTypes]);
  if (!scope.allQueues) {
    builder = builder.where("t.queue_id", "in", [...scope.ownQueueIds]);
  }
  // ANDed with the membership clause above, so the viewer's queue filter
  // narrows the feed and a queue outside it matches nothing.
  if (scope.queueIds !== undefined && scope.queueIds.length > 0) {
    builder = builder.where("t.queue_id", "in", [...scope.queueIds]);
  }
  return builder;
}

/**
 * Organization feed rows in scope, before selection. Call only when
 * `hasOrgScope` holds.
 */
function recentOrgActivityRows(
  db: Kysely<TenantDatabase>,
  scope: RecentActivityScope,
) {
  return db
    .selectFrom("audit_log")
    .where("ticket_id", "is", null)
    .where("event_type", "in", [...scope.orgEventTypes]);
}

async function listRecentTicketActivity(
  db: Kysely<TenantDatabase>,
  query: RecentActivityQuery,
): Promise<readonly RecentActivityEntry[]> {
  if (!hasTicketScope(query)) return [];

  const rows = await recentTicketActivityRows(db, query)
    .select([
      "al.id",
      "al.event_type as eventType",
      "t.id as ticketId",
      "c.id as clientId",
      "c.encrypted_alias as encryptedClientAlias",
      "q.id as queueId",
      "q.encrypted_name as encryptedQueueName",
      "al.created_at as createdAt",
    ])
    .orderBy("al.created_at", "desc")
    .limit(query.limit)
    .execute();

  const own = new Set<QueueId>(query.ownQueueIds);
  return rows.map((row): RecentActivityEntry => {
    if (own.has(row.queueId)) {
      return { kind: "ticket", ...row };
    }
    return {
      kind: "ticket_outside_queues",
      id: row.id,
      eventType: row.eventType,
      queueId: row.queueId,
      encryptedQueueName: row.encryptedQueueName,
      createdAt: row.createdAt,
    };
  });
}

async function listRecentOrgActivity(
  db: Kysely<TenantDatabase>,
  query: RecentActivityQuery,
): Promise<readonly RecentActivityEntry[]> {
  if (!hasOrgScope(query)) return [];

  const rows = await recentOrgActivityRows(db, query)
    .select(["id", "event_type as eventType", "created_at as createdAt"])
    .orderBy("created_at", "desc")
    .limit(query.limit)
    .execute();

  return rows.map((row): RecentActivityEntry => ({ kind: "org", ...row }));
}

async function countRecentTicketActivity(
  db: Kysely<TenantDatabase>,
  query: RecentActivityCountQuery,
): Promise<number> {
  if (!hasTicketScope(query)) return 0;

  const row = await recentTicketActivityRows(db, query)
    .where("al.created_at", ">=", query.since)
    .select(db.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();
  return toCount(row);
}

async function countRecentOrgActivity(
  db: Kysely<TenantDatabase>,
  query: RecentActivityCountQuery,
): Promise<number> {
  if (!hasOrgScope(query)) return 0;

  const row = await recentOrgActivityRows(db, query)
    .where("created_at", ">=", query.since)
    .select(db.fn.countAll().as("count"))
    .executeTakeFirstOrThrow();
  return toCount(row);
}
