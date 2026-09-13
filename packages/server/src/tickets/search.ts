// Search service: metadata filtering (server-side SQL) and content search
// (returns paginated encrypted blobs for client-side decrypt + text matching).
// Encryption precludes server-side content search. At CARE-Y scale
// (200-2,000 tickets), client-side decrypt + search is fast.

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type {
  MetadataSearchInput,
  ContentSearchInput,
  TicketId,
  ClientId,
  QueueId,
  UserId,
  FollowupId,
} from "@care-y/shared";
import { toCount } from "../db/query-utils.js";

export interface MetadataSearchResult {
  readonly tickets: readonly {
    readonly id: TicketId;
    readonly clientId: ClientId;
    readonly encryptedClientAlias: Buffer;
    readonly status: string;
    readonly priority: string;
    readonly queueId: QueueId;
    readonly assignedTo: UserId | null;
    readonly onHold: boolean;
    readonly createdAt: Date;
  }[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface ContentSearchResult {
  readonly followups: readonly {
    readonly ticketId: TicketId;
    readonly followupId: FollowupId;
    readonly encryptedContent: string; // base64-encoded ciphertext
    readonly type: string;
    readonly source: string;
    readonly createdAt: Date;
  }[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface SearchService {
  metadataSearch(
    input: MetadataSearchInput,
    userId: UserId,
  ): Promise<MetadataSearchResult>;

  contentSearch(
    input: ContentSearchInput,
    userId: UserId,
  ): Promise<ContentSearchResult>;
}

export function createSearchService(
  db: Kysely<TenantDatabase>,
  getAccessibleQueueIds: (userId: UserId) => Promise<readonly QueueId[]>,
): SearchService {
  return {
    async metadataSearch(input, userId) {
      const accessibleQueues = await getAccessibleQueueIds(userId);
      if (accessibleQueues.length === 0) {
        return {
          tickets: [],
          total: 0,
          page: input.page,
          pageSize: input.pageSize,
        };
      }

      let query = db
        .selectFrom("tickets")
        .innerJoin("clients", "clients.id", "tickets.client_id")
        .where("tickets.queue_id", "in", [...accessibleQueues])
        .select([
          "tickets.id",
          "clients.id as clientId",
          "clients.encrypted_alias as encryptedClientAlias",
          "tickets.status",
          "tickets.priority",
          "tickets.queue_id as queueId",
          "tickets.assigned_to as assignedTo",
          "tickets.on_hold as onHold",
          "tickets.created_at as createdAt",
        ]);

      if (input.status !== undefined) {
        query = query.where("tickets.status", "=", input.status);
      }
      if (input.queueId !== undefined) {
        query = query.where("tickets.queue_id", "=", input.queueId);
      }
      if (input.assignedTo !== undefined) {
        query = query.where("tickets.assigned_to", "=", input.assignedTo);
      }
      if (input.dateFrom !== undefined) {
        query = query.where(
          "tickets.created_at",
          ">=",
          new Date(input.dateFrom),
        );
      }
      if (input.dateTo !== undefined) {
        query = query.where("tickets.created_at", "<=", new Date(input.dateTo));
      }

      // Count total before pagination
      const countResult = await db
        .selectFrom("tickets")
        .innerJoin("clients", "clients.id", "tickets.client_id")
        .where("tickets.queue_id", "in", [...accessibleQueues])
        .$call((qb) => {
          let q = qb;
          if (input.status !== undefined)
            q = q.where("tickets.status", "=", input.status);
          if (input.queueId !== undefined)
            q = q.where("tickets.queue_id", "=", input.queueId);
          if (input.assignedTo !== undefined)
            q = q.where("tickets.assigned_to", "=", input.assignedTo);
          if (input.dateFrom !== undefined)
            q = q.where("tickets.created_at", ">=", new Date(input.dateFrom));
          if (input.dateTo !== undefined)
            q = q.where("tickets.created_at", "<=", new Date(input.dateTo));
          return q;
        })
        .select(db.fn.countAll().as("count"))
        .executeTakeFirstOrThrow();

      const tickets = await query
        .orderBy("tickets.created_at", "desc")
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize)
        .execute();

      return {
        tickets,
        total: toCount(countResult),
        page: input.page,
        pageSize: input.pageSize,
      };
    },

    async contentSearch(input, userId) {
      const accessibleQueues = await getAccessibleQueueIds(userId);
      if (accessibleQueues.length === 0) {
        return {
          followups: [],
          total: 0,
          page: input.page,
          pageSize: input.pageSize,
        };
      }

      let baseQuery = db
        .selectFrom("followups")
        .innerJoin("tickets", "tickets.id", "followups.ticket_id")
        .where("tickets.queue_id", "in", [...accessibleQueues])
        .where("followups.deleted_at", "is", null);

      if (input.status !== undefined) {
        baseQuery = baseQuery.where("tickets.status", "=", input.status);
      }
      if (input.queueId !== undefined) {
        baseQuery = baseQuery.where("tickets.queue_id", "=", input.queueId);
      }
      if (input.ticketIds !== undefined && input.ticketIds.length > 0) {
        baseQuery = baseQuery.where("followups.ticket_id", "in", [
          ...input.ticketIds,
        ]);
      }

      const countResult = await baseQuery
        .select(db.fn.countAll().as("count"))
        .executeTakeFirstOrThrow();

      const rows = await baseQuery
        .select([
          "followups.id as followupId",
          "followups.ticket_id as ticketId",
          "followups.encrypted_content as encryptedContent",
          "followups.type",
          "followups.source",
          "followups.created_at as createdAt",
        ])
        .orderBy("followups.created_at", "desc")
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize)
        .execute();

      const followups = rows.map((row) => ({
        ...row,
        encryptedContent: row.encryptedContent.toString("base64url"),
      }));

      return {
        followups,
        total: toCount(countResult),
        page: input.page,
        pageSize: input.pageSize,
      };
    },
  };
}
