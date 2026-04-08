/**
 * Follow-up CRUD service with oblivious read pattern.
 *
 * Follow-ups are comments/events on a ticket. Each follow-up carries
 * an encrypted_read_state blob that starts as a dummy value and is
 * updated in-place when a volunteer reads it (no new row created).
 * This prevents a snapshot attacker from inferring read timing.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { TicketAccessChecker } from "./access.js";
import { ForbiddenError, NotFoundError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";

export interface FollowUpRecord {
  readonly id: string;
  readonly ticketId: string;
  readonly source: string;
  readonly type: string;
  readonly isPrivate: boolean;
  readonly mentionedPseudonyms: string[];
  readonly encryptedContent: Buffer;
  readonly encryptedReadState: Buffer;
  readonly createdBy: string | null;
  readonly createdAt: Date;
}

export interface CreateFollowUpInput {
  readonly ticketId: string;
  readonly encryptedContent: Buffer;
  readonly encryptedReadState: Buffer;
  readonly source: string;
  readonly type: string;
  readonly isPrivate: boolean;
  readonly mentionedPseudonyms: string[];
}

export interface FollowUpService {
  create(userId: string, input: CreateFollowUpInput): Promise<FollowUpRecord>;
  listByTicket(
    userId: string,
    ticketId: string,
    opts: { limit: number; cursor?: string },
  ): Promise<FollowUpRecord[]>;
  markRead(
    userId: string,
    followUpId: string,
    encryptedReadState: Buffer,
  ): Promise<void>;
  /** Update encrypted content of an internal note. Only the author can edit. */
  updateInternalNote(
    userId: string,
    followUpId: string,
    encryptedContent: Buffer,
  ): Promise<FollowUpRecord>;
  /** Soft-delete an internal note. Author or admin can delete. */
  softDeleteInternalNote(
    userId: string,
    followUpId: string,
    isAdmin: boolean,
  ): Promise<void>;
}

function toRecord(row: {
  id: string;
  ticket_id: string;
  source: string;
  type: string;
  is_private: boolean;
  mentioned_pseudonyms: string[];
  encrypted_content: Buffer;
  encrypted_read_state: Buffer;
  created_by: string | null;
  deleted_at: Date | null;
  created_at: Date;
}): FollowUpRecord {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    source: row.source,
    type: row.type,
    isPrivate: row.is_private,
    mentionedPseudonyms: row.mentioned_pseudonyms,
    encryptedContent: row.encrypted_content,
    encryptedReadState: row.encrypted_read_state,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export function createFollowUpService(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
): FollowUpService {
  return {
    async create(userId, input) {
      await access.assertAccess(userId, input.ticketId);

      // Verify ticket is open
      const ticket = await db
        .selectFrom("tickets")
        .select(["id", "status"])
        .where("id", "=", input.ticketId)
        .executeTakeFirst();

      if (!ticket) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND);
      if (ticket.status !== "open") {
        throw new NotFoundError(ErrorCode.CANNOT_FOLLOWUP_CLOSED_TICKET);
      }

      const row = await db
        .insertInto("followups")
        .values({
          ticket_id: input.ticketId,
          source: input.source,
          type: input.type,
          is_private: input.isPrivate,
          mentioned_pseudonyms: JSON.stringify(input.mentionedPseudonyms),
          encrypted_content: input.encryptedContent,
          encrypted_read_state: input.encryptedReadState,
          created_by: userId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toRecord(row);
    },

    async listByTicket(userId, ticketId, opts) {
      await access.assertAccess(userId, ticketId);

      let query = db
        .selectFrom("followups")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .where("deleted_at", "is", null);

      if (opts.cursor !== undefined) {
        // Keyset pagination: skip past the cursor row.
        // Uses subquery to keep timestamp comparison in PostgreSQL,
        // avoiding JS Date millisecond precision loss (PostgreSQL
        // stores timestamptz with microsecond precision).
        const cursorId = opts.cursor;
        const cursorCreatedAt = db
          .selectFrom("followups")
          .select("created_at")
          .where("id", "=", cursorId);

        query = query.where((eb) =>
          eb.or([
            eb("created_at", ">", cursorCreatedAt),
            eb.and([
              eb("created_at", "=", cursorCreatedAt),
              eb("id", ">", cursorId),
            ]),
          ]),
        );
      }

      const rows = await query
        .orderBy("created_at", "asc")
        .orderBy("id", "asc")
        .limit(opts.limit)
        .execute();

      return rows.map(toRecord);
    },

    async markRead(userId, followUpId, encryptedReadState) {
      // Find the follow-up to get its ticket_id for access check
      const followUp = await db
        .selectFrom("followups")
        .select(["id", "ticket_id"])
        .where("id", "=", followUpId)
        .executeTakeFirst();

      if (!followUp) throw new NotFoundError(ErrorCode.FOLLOWUP_NOT_FOUND);

      await access.assertAccess(userId, followUp.ticket_id);

      // Update in place (oblivious write: no new row created)
      await db
        .updateTable("followups")
        .set({ encrypted_read_state: encryptedReadState })
        .where("id", "=", followUpId)
        .execute();
    },

    async updateInternalNote(userId, followUpId, encryptedContent) {
      const existing = await db
        .selectFrom("followups")
        .selectAll()
        .where("id", "=", followUpId)
        .executeTakeFirst();

      if (!existing) throw new NotFoundError(ErrorCode.FOLLOWUP_NOT_FOUND);

      await access.assertAccess(userId, existing.ticket_id);

      if (existing.type !== "internal_note") {
        throw new ForbiddenError(ErrorCode.FOLLOWUP_NOT_EDITABLE);
      }
      if (existing.source !== "volunteer") {
        throw new ForbiddenError(ErrorCode.FOLLOWUP_NOT_EDITABLE);
      }
      if (existing.deleted_at !== null) {
        throw new NotFoundError(ErrorCode.FOLLOWUP_NOT_FOUND);
      }

      // Author check: WHERE created_by = userId ensures only the author
      // can edit. If the row doesn't match, the update returns nothing.
      const row = await db
        .updateTable("followups")
        .set({ encrypted_content: encryptedContent })
        .where("id", "=", followUpId)
        .where("created_by", "=", userId)
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new ForbiddenError(ErrorCode.FOLLOWUP_NOT_OWNED);
      return toRecord(row);
    },

    async softDeleteInternalNote(userId, followUpId, isAdmin) {
      const existing = await db
        .selectFrom("followups")
        .selectAll()
        .where("id", "=", followUpId)
        .executeTakeFirst();

      if (!existing) throw new NotFoundError(ErrorCode.FOLLOWUP_NOT_FOUND);

      await access.assertAccess(userId, existing.ticket_id);

      if (existing.type !== "internal_note") {
        throw new ForbiddenError(ErrorCode.FOLLOWUP_NOT_DELETABLE);
      }
      if (existing.deleted_at !== null) {
        throw new NotFoundError(ErrorCode.FOLLOWUP_NOT_FOUND);
      }

      // Author or admin can delete
      if (!isAdmin && existing.created_by !== userId) {
        throw new ForbiddenError(ErrorCode.FOLLOWUP_NOT_OWNED);
      }

      await db
        .updateTable("followups")
        .set({ deleted_at: new Date() })
        .where("id", "=", followUpId)
        .execute();
    },
  };
}
