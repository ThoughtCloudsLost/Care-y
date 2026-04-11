/**
 * Ticket CRUD service.
 *
 * Implements the one-ticket-per-client model (ADR-018):
 * - Each client has at most one open ticket
 * - Creating a ticket for a client with a closed ticket reopens it
 * - Close checks unresolved dependencies
 * - Status transitions are recorded as system follow-ups
 * - No activity timestamps on the ticket row (ADR-018 section 7)
 */

import { type Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type {
  RecentFollowUpsInput,
  TicketStatus,
  TicketPriority,
} from "@care-y/shared";
import type { TicketAccessChecker } from "./access.js";
import { NotFoundError, TicketError, MergeError } from "../errors.js";
import { createDependencyService } from "./dependency-service.js";
import { ErrorCode } from "@care-y/shared";
import { encode } from "@care-y/crypto";

export interface TicketRecord {
  readonly id: string;
  readonly clientId: string;
  readonly queueId: string;
  readonly status: TicketStatus;
  readonly priority: TicketPriority;
  readonly onHold: boolean;
  readonly assignedTo: string | null;
  readonly encryptedTitle: Buffer;
  readonly encryptedDescription: Buffer;
  readonly keyGeneration: string;
  readonly createdAt: Date;
}

/** Enriched ticket with joined metadata for list/detail views. */
export interface TicketListRecord extends TicketRecord {
  readonly clientAlias: string;
  readonly encryptedQueueName: Buffer;
  readonly queueSortOrder: number;
  readonly lastActivityAt: Date | null;
  readonly followUpCount: number;
  /** Org-key encrypted display name of the assigned volunteer, or null if unassigned. */
  readonly assignedDisplayName: Buffer | null;
}

export interface TicketKeyWrap {
  readonly ephemeralPoint: string; // base64url (no padding)
  readonly nonce: string; // base64url (no padding)
  readonly wrappedKey: string; // base64url (no padding)
}

export interface TicketWithKeyWrap extends TicketListRecord {
  readonly keyWrap: TicketKeyWrap | null;
}

export interface FollowUpPreview {
  readonly id: string;
  readonly ticketId: string;
  readonly source: string;
  readonly type: string;
  readonly encryptedContent: Buffer;
  readonly createdAt: Date;
  readonly keyWrap: TicketKeyWrap | null;
  readonly hasRecording: boolean;
  readonly hasImage: boolean;
  readonly hasFile: boolean;
}

export interface CreateTicketInput {
  readonly clientId: string;
  readonly queueId: string;
  readonly encryptedTitle: Buffer;
  readonly encryptedDescription: Buffer;
  readonly priority: TicketPriority;
  readonly keyGeneration: string;
}

export interface UpdateTicketInput {
  readonly ticketId: string;
  readonly status?: TicketStatus;
  readonly priority?: TicketPriority;
  readonly queueId?: string;
  readonly onHold?: boolean;
}

export type TicketSortField = "date" | "priority" | "last_activity" | "queue";
export type TicketSortDirection = "asc" | "desc";

export interface TicketListOpts {
  readonly statuses?: TicketStatus[];
  readonly queueIds?: string[];
  readonly priorities?: TicketPriority[];
  readonly onHold?: boolean;
  readonly assignedTo?: string | null;
  readonly createdAfter?: string;
  readonly createdBefore?: string;
  readonly sortBy?: TicketSortField;
  readonly sortDirection?: TicketSortDirection;
  readonly limit: number;
  readonly cursor?: string;
}

export interface TicketService {
  create(userId: string, input: CreateTicketInput): Promise<TicketRecord>;
  findById(ticketId: string, userId: string): Promise<TicketWithKeyWrap>;
  list(userId: string, opts: TicketListOpts): Promise<TicketWithKeyWrap[]>;
  update(userId: string, input: UpdateTicketInput): Promise<TicketRecord>;
  close(userId: string, ticketId: string): Promise<TicketRecord>;
  reopen(
    userId: string,
    ticketId: string,
    newKeyGeneration: string,
  ): Promise<TicketRecord>;
  recentFollowUps(
    userId: string,
    input: RecentFollowUpsInput,
  ): Promise<Record<string, FollowUpPreview[]>>;
  counts(userId: string): Promise<TicketCounts>;
}

export interface TicketCounts {
  readonly new: number;
  readonly active: number;
  readonly closed: number;
  readonly onHold: number;
  readonly unassigned: number;
  readonly mine: number;
  readonly byPriority: {
    readonly low: number;
    readonly normal: number;
    readonly high: number;
    readonly urgent: number;
  };
}

interface BaseTicketRow {
  id: string;
  client_id: string;
  queue_id: string;
  status: TicketStatus;
  priority: TicketPriority;
  on_hold: boolean;
  assigned_to: string | null;
  encrypted_title: Buffer;
  encrypted_description: Buffer;
  key_generation: string;
  created_at: Date;
}

interface EnrichedTicketRow extends BaseTicketRow {
  client_alias: string;
  encrypted_queue_name: Buffer;
  queue_sort_order: number;
  last_activity_at: Date | null;
  followup_count: string | number | bigint | null;
  assigned_display_name: Buffer | null;
}

function toRecord(row: BaseTicketRow): TicketRecord {
  return {
    id: row.id,
    clientId: row.client_id,
    queueId: row.queue_id,
    status: row.status,
    priority: row.priority,
    onHold: row.on_hold,
    assignedTo: row.assigned_to,
    encryptedTitle: row.encrypted_title,
    encryptedDescription: row.encrypted_description,
    keyGeneration: row.key_generation,
    createdAt: row.created_at,
  };
}

function toListRecord(row: EnrichedTicketRow): TicketListRecord {
  return {
    ...toRecord(row),
    clientAlias: row.client_alias,
    encryptedQueueName: row.encrypted_queue_name,
    queueSortOrder: row.queue_sort_order,
    lastActivityAt: row.last_activity_at,
    followUpCount: Number(row.followup_count),
    assignedDisplayName: row.assigned_display_name,
  };
}

function toRecordWithKeyWrap(
  row: EnrichedTicketRow & {
    ephemeral_point: Buffer | null;
    nonce: Buffer | null;
    wrapped_key: Buffer | null;
  },
): TicketWithKeyWrap {
  const ep = row.ephemeral_point;
  const n = row.nonce;
  const wk = row.wrapped_key;
  // All three columns are NOT NULL in ticket_key_wraps. If the LEFT JOIN
  // matched a row, all three are present. Check all to satisfy the linter.
  const keyWrap: TicketKeyWrap | null =
    ep && n && wk
      ? {
          ephemeralPoint: encode(new Uint8Array(ep)),
          nonce: encode(new Uint8Array(n)),
          wrappedKey: encode(new Uint8Array(wk)),
        }
      : null;
  return { ...toListRecord(row), keyWrap };
}

export function createTicketService(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
  getAccessibleQueueIds: (userId: string) => Promise<readonly string[]>,
): TicketService {
  const depService = createDependencyService(db);

  async function createSystemFollowUp(
    ticketId: string,
    type: string,
  ): Promise<void> {
    await db
      .insertInto("followups")
      .values({
        ticket_id: ticketId,
        source: "system",
        type,
        encrypted_content: Buffer.from("system"),
      })
      .execute();
  }

  return {
    async create(userId, input) {
      // Validate queue exists
      const queue = await db
        .selectFrom("queues")
        .select("id")
        .where("id", "=", input.queueId)
        .where("is_active", "=", true)
        .executeTakeFirst();
      if (!queue) throw new NotFoundError(ErrorCode.QUEUE_NOT_FOUND);

      // Validate client exists and is not merged
      const client = await db
        .selectFrom("clients")
        .select(["id", "merged_into"])
        .where("id", "=", input.clientId)
        .executeTakeFirst();
      if (!client) throw new NotFoundError(ErrorCode.CLIENT_NOT_FOUND);
      if (client.merged_into !== null) {
        throw new MergeError(ErrorCode.CLIENT_MERGED);
      }

      // One-ticket-per-client: check for existing ticket
      const existing = await db
        .selectFrom("tickets")
        .selectAll()
        .where("client_id", "=", input.clientId)
        .executeTakeFirst();

      if (existing) {
        if (existing.status === "open") {
          // Already has an open ticket, return it
          return toRecord(existing);
        }
        // Closed ticket exists: reopen it (ADR-018 section 2)
        const reopened = await db
          .updateTable("tickets")
          .set({
            status: "open",
            key_generation: input.keyGeneration,
            encrypted_title: input.encryptedTitle,
            encrypted_description: input.encryptedDescription,
            queue_id: input.queueId,
            priority: input.priority,
          })
          .where("id", "=", existing.id)
          .returningAll()
          .executeTakeFirstOrThrow();

        await createSystemFollowUp(existing.id, "status_change");
        return toRecord(reopened);
      }

      // No existing ticket: create new
      const row = await db
        .insertInto("tickets")
        .values({
          client_id: input.clientId,
          queue_id: input.queueId,
          encrypted_title: input.encryptedTitle,
          encrypted_description: input.encryptedDescription,
          priority: input.priority,
          key_generation: input.keyGeneration,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toRecord(row);
    },

    async findById(ticketId, userId) {
      await access.assertAccess(userId, ticketId);

      const row = await db
        .selectFrom("tickets as t")
        .leftJoin("ticket_key_wraps as tkw", (join) =>
          join
            .onRef("tkw.ticket_id", "=", "t.id")
            .on("tkw.volunteer_id", "=", userId)
            .onRef("tkw.key_generation", "=", "t.key_generation"),
        )
        .innerJoin("clients as c", "c.id", "t.client_id")
        .innerJoin("queues as q", "q.id", "t.queue_id")
        .leftJoin("users as u", (join) =>
          join.on((eb) =>
            eb(eb.cast("t.assigned_to", "uuid"), "=", eb.ref("u.id")),
          ),
        )
        .selectAll("t")
        .select(["tkw.ephemeral_point", "tkw.nonce", "tkw.wrapped_key"])
        .select("c.alias as client_alias")
        .select("q.encrypted_name as encrypted_queue_name")
        .select("q.sort_order as queue_sort_order")
        .select("u.encrypted_display_name as assigned_display_name")
        .select((eb) => [
          eb
            .selectFrom("followups as f")
            .select((sb) => sb.fn.max("f.created_at").as("max_at"))
            .whereRef("f.ticket_id", "=", "t.id")
            .as("last_activity_at"),
          eb
            .selectFrom("followups as f")
            .select((sb) => sb.fn.countAll().as("cnt"))
            .whereRef("f.ticket_id", "=", "t.id")
            .as("followup_count"),
        ])
        .where("t.id", "=", ticketId)
        .executeTakeFirst();

      if (!row) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND);
      return toRecordWithKeyWrap(row);
    },

    async list(userId, opts) {
      const sortBy: TicketSortField = opts.sortBy ?? "date";
      const sortDirection: TicketSortDirection = opts.sortDirection ?? "desc";

      // Scope to queues the user has access to (queue membership check).
      // Without this, any authenticated volunteer could enumerate all
      // ticket metadata across queues they are not assigned to.
      const accessibleQueues = await getAccessibleQueueIds(userId);
      if (accessibleQueues.length === 0) return [];

      let query = db
        .selectFrom("tickets as t")
        .leftJoin("ticket_key_wraps as tkw", (join) =>
          join
            .onRef("tkw.ticket_id", "=", "t.id")
            .on("tkw.volunteer_id", "=", userId)
            .onRef("tkw.key_generation", "=", "t.key_generation"),
        )
        .innerJoin("clients as c", "c.id", "t.client_id")
        .innerJoin("queues as q", "q.id", "t.queue_id")
        .leftJoin("users as u", (join) =>
          join.on((eb) =>
            eb(eb.cast("t.assigned_to", "uuid"), "=", eb.ref("u.id")),
          ),
        )
        .selectAll("t")
        .select(["tkw.ephemeral_point", "tkw.nonce", "tkw.wrapped_key"])
        .select("c.alias as client_alias")
        .select("q.encrypted_name as encrypted_queue_name")
        .select("q.sort_order as queue_sort_order")
        .select("u.encrypted_display_name as assigned_display_name")
        .select((eb) => [
          eb
            .selectFrom("followups as f")
            .select((sb) => sb.fn.max("f.created_at").as("max_at"))
            .whereRef("f.ticket_id", "=", "t.id")
            .as("last_activity_at"),
          eb
            .selectFrom("followups as f")
            .select((sb) => sb.fn.countAll().as("cnt"))
            .whereRef("f.ticket_id", "=", "t.id")
            .as("followup_count"),
        ])
        .where("t.queue_id", "in", [...accessibleQueues]);

      if (opts.queueIds !== undefined && opts.queueIds.length > 0) {
        query = query.where("t.queue_id", "in", opts.queueIds);
      }
      if (opts.statuses !== undefined && opts.statuses.length > 0) {
        query = query.where("t.status", "in", opts.statuses);
      }
      if (opts.priorities !== undefined && opts.priorities.length > 0) {
        query = query.where("t.priority", "in", opts.priorities);
      }
      if (opts.onHold !== undefined) {
        query = query.where("t.on_hold", "=", opts.onHold);
      }
      if (opts.assignedTo === null) {
        query = query.where("t.assigned_to", "is", null);
      } else if (opts.assignedTo !== undefined) {
        query = query.where("t.assigned_to", "=", opts.assignedTo);
      }
      if (opts.createdAfter !== undefined) {
        query = query.where("t.created_at", ">=", new Date(opts.createdAfter));
      }
      if (opts.createdBefore !== undefined) {
        query = query.where("t.created_at", "<=", new Date(opts.createdBefore));
      }
      // --- Dynamic sort + keyset cursor ---
      //
      // Keyset pagination: the cursor WHERE must match the ORDER BY columns.
      // Each sort mode produces a different composite keyset comparison.
      // Timestamp comparisons use subqueries to preserve PostgreSQL's
      // microsecond precision (JS Date truncates to milliseconds).

      const gt = sortDirection === "asc" ? (">" as const) : ("<" as const);

      if (opts.cursor !== undefined) {
        const cursorId = opts.cursor;

        // Subquery: cursor row's created_at (reused across all sort modes)
        const cursorCreatedAt = db
          .selectFrom("tickets")
          .select("created_at")
          .where("id", "=", cursorId);

        if (sortBy === "priority") {
          // Subquery: cursor row's priority sort key
          const cursorPriorityKey = db
            .selectFrom("tickets")
            .select((sub) =>
              sub
                .case("priority")
                .when("urgent")
                .then(0)
                .when("high")
                .then(1)
                .when("normal")
                .then(2)
                .when("low")
                .then(3)
                .else(4)
                .end()
                .as("sort_key"),
            )
            .where("id", "=", cursorId);

          // Three-column keyset: (priority_sort_key, created_at, id)
          query = query.where((eb) => {
            const rowKey = eb
              .case("t.priority")
              .when("urgent")
              .then(0)
              .when("high")
              .then(1)
              .when("normal")
              .then(2)
              .when("low")
              .then(3)
              .else(4)
              .end();

            return eb.or([
              eb(rowKey, gt, cursorPriorityKey),
              eb.and([
                eb(rowKey, "=", cursorPriorityKey),
                eb("t.created_at", gt, cursorCreatedAt),
              ]),
              eb.and([
                eb(rowKey, "=", cursorPriorityKey),
                eb("t.created_at", "=", cursorCreatedAt),
                eb("t.id", gt, cursorId),
              ]),
            ]);
          });
        } else if (sortBy === "last_activity") {
          // Subquery expressions for the cursor row and the current row
          const cursorLastActivity = db
            .selectFrom("followups")
            .select((sb) => sb.fn.max("followups.created_at").as("max_at"))
            .where("followups.ticket_id", "=", cursorId);

          // NULLS LAST keyset: NULL activity rows sort after all non-NULL rows.
          // Three regions in sort order:
          //   1. Non-NULL activity values (sorted by gt direction)
          //   2. NULL activity values (sorted by created_at tiebreaker)
          //
          // If cursor has non-NULL activity: rows "after" are either
          //   (a) non-NULL with activity gt cursor, or
          //   (b) non-NULL with equal activity + later tiebreaker, or
          //   (c) NULL activity (always after non-NULL with NULLS LAST)
          // If cursor has NULL activity: rows "after" are other NULLs
          //   with later tiebreaker (created_at, then id)
          query = query.where((eb) => {
            const rowActivity = eb
              .selectFrom("followups as f2")
              .select((sb) => sb.fn.max("f2.created_at").as("max_at"))
              .whereRef("f2.ticket_id", "=", "t.id");

            // Cursor has non-NULL activity
            const cursorNonNull = eb.and([
              eb(cursorLastActivity, "is not", null),
              eb.or([
                // (a) Row has non-NULL activity that sorts after cursor
                eb(rowActivity, gt, cursorLastActivity),
                // (b) Same activity, later tiebreaker
                eb.and([
                  eb(rowActivity, "=", cursorLastActivity),
                  eb("t.created_at", gt, cursorCreatedAt),
                ]),
                eb.and([
                  eb(rowActivity, "=", cursorLastActivity),
                  eb("t.created_at", "=", cursorCreatedAt),
                  eb("t.id", gt, cursorId),
                ]),
                // (c) Row has NULL activity (NULLS LAST: after all non-NULL)
                eb(rowActivity, "is", null),
              ]),
            ]);

            // Cursor has NULL activity (we're in the NULL tail)
            const cursorNull = eb.and([
              eb(cursorLastActivity, "is", null),
              eb(rowActivity, "is", null),
              eb.or([
                eb("t.created_at", gt, cursorCreatedAt),
                eb.and([
                  eb("t.created_at", "=", cursorCreatedAt),
                  eb("t.id", gt, cursorId),
                ]),
              ]),
            ]);

            return eb.or([cursorNonNull, cursorNull]);
          });
        } else if (sortBy === "queue") {
          // Subquery: cursor row's queue sort_order via JOIN
          const cursorSortOrder = db
            .selectFrom("tickets")
            .innerJoin("queues", "queues.id", "tickets.queue_id")
            .select("queues.sort_order")
            .where("tickets.id", "=", cursorId);

          // Three-column keyset: (sort_order, created_at, id)
          query = query.where((eb) =>
            eb.or([
              eb("q.sort_order", gt, cursorSortOrder),
              eb.and([
                eb("q.sort_order", "=", cursorSortOrder),
                eb("t.created_at", gt, cursorCreatedAt),
              ]),
              eb.and([
                eb("q.sort_order", "=", cursorSortOrder),
                eb("t.created_at", "=", cursorCreatedAt),
                eb("t.id", gt, cursorId),
              ]),
            ]),
          );
        } else {
          // "date": two-column keyset (created_at, id)
          query = query.where((eb) =>
            eb.or([
              eb("t.created_at", gt, cursorCreatedAt),
              eb.and([
                eb("t.created_at", "=", cursorCreatedAt),
                eb("t.id", gt, cursorId),
              ]),
            ]),
          );
        }
      }

      // ORDER BY: must match the keyset cursor columns above
      if (sortBy === "priority") {
        query = query
          .orderBy(
            (eb) =>
              eb
                .case("t.priority")
                .when("urgent")
                .then(0)
                .when("high")
                .then(1)
                .when("normal")
                .then(2)
                .when("low")
                .then(3)
                .else(4)
                .end(),
            sortDirection,
          )
          .orderBy("t.created_at", sortDirection)
          .orderBy("t.id", "asc");
      } else if (sortBy === "last_activity") {
        // Tickets with no follow-ups (NULL last_activity_at) sort to the end
        // regardless of direction. A volunteer sorting by "most recent activity"
        // wants active tickets first; sorting "least recent" wants stale tickets
        // first. Either way, tickets with zero activity belong at the bottom.
        query = query
          .orderBy("last_activity_at", (ob) =>
            sortDirection === "desc"
              ? ob.desc().nullsLast()
              : ob.asc().nullsLast(),
          )
          .orderBy("t.created_at", sortDirection)
          .orderBy("t.id", "asc");
      } else if (sortBy === "queue") {
        query = query
          .orderBy("q.sort_order", sortDirection)
          .orderBy("t.created_at", sortDirection)
          .orderBy("t.id", "asc");
      } else {
        // "date" (default)
        query = query
          .orderBy("t.created_at", sortDirection)
          .orderBy("t.id", "asc");
      }

      const rows = await query.limit(opts.limit).execute();

      return rows.map(toRecordWithKeyWrap);
    },

    async counts(userId) {
      const queueIds = await getAccessibleQueueIds(userId);
      if (queueIds.length === 0) {
        return {
          new: 0,
          active: 0,
          closed: 0,
          onHold: 0,
          unassigned: 0,
          mine: 0,
          byPriority: { low: 0, normal: 0, high: 0, urgent: 0 },
        };
      }

      // Left join follow-up counts so we can distinguish new (0 follow-ups)
      // from active (1+ follow-ups) within open tickets.
      const rows = await db
        .selectFrom("tickets as t")
        .leftJoin(
          (eb) =>
            eb
              .selectFrom("followups")
              .select([
                "followups.ticket_id",
                (sb) => sb.fn.countAll().as("fu_count"),
              ])
              .groupBy("followups.ticket_id")
              .as("fc"),
          (join) => join.onRef("fc.ticket_id", "=", "t.id"),
        )
        .where("t.queue_id", "in", [...queueIds])
        .select([
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.status", "=", "open"),
                      eb("t.on_hold", "=", false),
                      eb(eb.fn.coalesce("fc.fu_count", eb.lit(0)), "=", 0),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("new_count"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.status", "=", "open"),
                      eb("t.on_hold", "=", false),
                      eb(eb.fn.coalesce("fc.fu_count", eb.lit(0)), ">", 0),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("active_count"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(eb("t.status", "=", "closed"))
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("closed_count"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(eb("t.on_hold", "=", true))
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("on_hold_count"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.assigned_to", "is", null),
                      eb("t.status", "=", "open"),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("unassigned_count"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.priority", "=", "low"),
                      eb("t.status", "=", "open"),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("p_low"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.priority", "=", "normal"),
                      eb("t.status", "=", "open"),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("p_normal"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.priority", "=", "high"),
                      eb("t.status", "=", "open"),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("p_high"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.priority", "=", "urgent"),
                      eb("t.status", "=", "open"),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("p_urgent"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.assigned_to", "=", userId),
                      eb("t.status", "=", "open"),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("mine_count"),
        ])
        .executeTakeFirstOrThrow();

      return {
        new: Number(rows.new_count),
        active: Number(rows.active_count),
        closed: Number(rows.closed_count),
        onHold: Number(rows.on_hold_count),
        unassigned: Number(rows.unassigned_count),
        mine: Number(rows.mine_count),
        byPriority: {
          low: Number(rows.p_low),
          normal: Number(rows.p_normal),
          high: Number(rows.p_high),
          urgent: Number(rows.p_urgent),
        },
      };
    },

    async update(userId, input) {
      await access.assertAccess(userId, input.ticketId);

      const updates: Record<string, unknown> = {};
      if (input.status !== undefined) updates.status = input.status;
      if (input.priority !== undefined) updates.priority = input.priority;
      if (input.queueId !== undefined) updates.queue_id = input.queueId;
      if (input.onHold !== undefined) updates.on_hold = input.onHold;

      if (Object.keys(updates).length === 0) {
        const existing = await db
          .selectFrom("tickets")
          .selectAll()
          .where("id", "=", input.ticketId)
          .executeTakeFirst();
        if (!existing) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND);
        return toRecord(existing);
      }

      const row = await db
        .updateTable("tickets")
        .set(updates)
        .where("id", "=", input.ticketId)
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND);

      // Create system follow-ups for state changes
      if (input.onHold !== undefined) {
        await createSystemFollowUp(input.ticketId, "hold_change");
      }
      if (input.priority !== undefined) {
        await createSystemFollowUp(input.ticketId, "priority_change");
      }
      if (input.status !== undefined) {
        await createSystemFollowUp(input.ticketId, "status_change");
      }

      return toRecord(row);
    },

    async close(userId, ticketId) {
      await access.assertAccess(userId, ticketId);

      // Check unresolved dependencies
      const resolved = await depService.allResolved(ticketId);
      if (!resolved) {
        throw new TicketError(ErrorCode.TICKET_UNRESOLVED_DEPS);
      }

      const row = await db
        .updateTable("tickets")
        .set({ status: "closed" })
        .where("id", "=", ticketId)
        .where("status", "=", "open")
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND_OR_CLOSED);

      await createSystemFollowUp(ticketId, "status_change");
      return toRecord(row);
    },

    async reopen(userId, ticketId, newKeyGeneration) {
      await access.assertAccess(userId, ticketId);

      const row = await db
        .updateTable("tickets")
        .set({
          status: "open",
          key_generation: newKeyGeneration,
        })
        .where("id", "=", ticketId)
        .where("status", "=", "closed")
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND_OR_OPEN);

      await createSystemFollowUp(ticketId, "status_change");
      return toRecord(row);
    },

    async recentFollowUps(
      userId: string,
      input: RecentFollowUpsInput,
    ): Promise<Record<string, FollowUpPreview[]>> {
      const accessibleQueues = await getAccessibleQueueIds(userId);
      if (accessibleQueues.length === 0) return {};

      // Derived table: rank follow-ups per ticket by recency.
      // Uses eb.fn.agg("row_number") with .over() for typesafe window function
      // (column names checked by Kysely). LATERAL JOIN is not supported by
      // Kysely, so ROW_NUMBER + outer filter achieves the same top-N-per-group.
      const ranked = db
        .selectFrom("followups as f")
        .select((eb) => [
          eb.ref("f.id").as("id"),
          eb.ref("f.ticket_id").as("ticket_id"),
          eb.ref("f.source").as("source"),
          eb.ref("f.type").as("type"),
          eb.ref("f.encrypted_content").as("encrypted_content"),
          eb.ref("f.created_at").as("created_at"),
          eb.fn
            .agg<number>("row_number")
            .over((ob) =>
              ob.partitionBy("f.ticket_id").orderBy("f.created_at", "desc"),
            )
            .as("rn"),
          eb
            .exists(
              eb
                .selectFrom("recordings as r")
                .whereRef("r.followup_id", "=", "f.id")
                .where("r.deleted_at", "is", null)
                .select(eb.lit(1).as("one")),
            )
            .as("has_recording"),
          eb
            .exists(
              eb
                .selectFrom("attachments as a")
                .whereRef("a.followup_id", "=", "f.id")
                .where("a.deleted_at", "is", null)
                .where("a.content_type", "like", "image/%")
                .select(eb.lit(1).as("one")),
            )
            .as("has_image"),
          eb
            .exists(
              eb
                .selectFrom("attachments as a2")
                .whereRef("a2.followup_id", "=", "f.id")
                .where("a2.deleted_at", "is", null)
                .where((w) =>
                  w.or([
                    w("a2.content_type", "is", null),
                    w("a2.content_type", "not like", "image/%"),
                  ]),
                )
                .select(eb.lit(1).as("one")),
            )
            .as("has_file"),
        ])
        .where("f.ticket_id", "in", input.ticketIds)
        .$if(input.types !== undefined && input.types.length > 0, (qb) => {
          const types = input.types;
          if (types === undefined) return qb;
          return qb.where("f.type", "in", types);
        })
        .as("ranked_f");

      const rows = await db
        .selectFrom("tickets as t")
        .innerJoin(ranked, (join) =>
          join
            .onRef("ranked_f.ticket_id", "=", "t.id")
            .on("ranked_f.rn", "<=", input.perTicket),
        )
        .leftJoin("ticket_key_wraps as tkw", (join) =>
          join
            .onRef("tkw.ticket_id", "=", "t.id")
            .on("tkw.volunteer_id", "=", userId)
            .onRef("tkw.key_generation", "=", "t.key_generation"),
        )
        .select([
          "ranked_f.id",
          "ranked_f.ticket_id",
          "ranked_f.source",
          "ranked_f.type",
          "ranked_f.encrypted_content",
          "ranked_f.created_at",
          "ranked_f.has_recording",
          "ranked_f.has_image",
          "ranked_f.has_file",
          "tkw.ephemeral_point",
          "tkw.nonce",
          "tkw.wrapped_key",
        ])
        .where("t.id", "in", input.ticketIds)
        .where("t.queue_id", "in", [...accessibleQueues])
        .orderBy("ranked_f.ticket_id")
        .orderBy("ranked_f.created_at", "desc")
        .execute();

      const result: Record<string, FollowUpPreview[]> = {};
      for (const row of rows) {
        const ep = row.ephemeral_point;
        const n = row.nonce;
        const wk = row.wrapped_key;
        const keyWrap: TicketKeyWrap | null =
          ep && n && wk
            ? {
                ephemeralPoint: encode(new Uint8Array(ep)),
                nonce: encode(new Uint8Array(n)),
                wrappedKey: encode(new Uint8Array(wk)),
              }
            : null;
        const preview: FollowUpPreview = {
          id: row.id,
          ticketId: row.ticket_id,
          source: row.source,
          type: row.type,
          encryptedContent: row.encrypted_content,
          createdAt: row.created_at,
          keyWrap,
          hasRecording: Boolean(row.has_recording),
          hasImage: Boolean(row.has_image),
          hasFile: Boolean(row.has_file),
        };
        const list = result[row.ticket_id];
        if (list) {
          list.push(preview);
        } else {
          result[row.ticket_id] = [preview];
        }
      }
      return result;
    },
  };
}
