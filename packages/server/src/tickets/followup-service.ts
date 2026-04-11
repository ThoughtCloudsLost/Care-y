/**
 * Follow-up CRUD service.
 *
 * Follow-ups are comments/events on a ticket. Read state is tracked
 * separately via ticket_read_cursors (one encrypted timestamp per
 * volunteer per ticket). See ReadCursorService.
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
  readonly createdBy: string | null;
  readonly createdAt: Date;
  readonly hasRecording: boolean;
  readonly hasImage: boolean;
  readonly hasFile: boolean;
}

export interface CreateFollowUpInput {
  readonly ticketId: string;
  readonly encryptedContent: Buffer;
  readonly source: string;
  readonly type: string;
  readonly isPrivate: boolean;
  readonly mentionedPseudonyms: string[];
}

/** Lightweight follow-up for timeline rendering. Plain messages omit encryptedContent. */
export interface FollowUpSummaryRecord {
  readonly id: string;
  readonly ticketId: string;
  readonly source: string;
  readonly type: string;
  /** Present for system events and internal notes, null for plain messages. */
  readonly encryptedContent: Buffer | null;
  readonly createdAt: Date;
  readonly hasRecording: boolean;
  readonly recordingDurationSeconds: number | null;
  readonly hasImage: boolean;
  readonly hasFile: boolean;
}

export interface FollowUpService {
  create(userId: string, input: CreateFollowUpInput): Promise<FollowUpRecord>;
  listByTicket(
    userId: string,
    ticketId: string,
    opts: {
      limit: number;
      cursor?: string;
      direction?: "newer" | "older";
      types?: string[];
    },
  ): Promise<FollowUpRecord[]>;
  /**
   * Follow-ups for timeline rendering with optional pagination and type
   * filtering. Plain messages carry no encryptedContent. System events and
   * notes include it for client-side decryption. Joins recordings/attachments
   * for media flags.
   */
  listSummary(
    userId: string,
    ticketId: string,
    opts: {
      limit: number;
      cursor?: string;
      direction?: "newer" | "older";
      types?: string[];
    },
  ): Promise<FollowUpSummaryRecord[]>;
  /** Fetch specific follow-ups by ID (for expanding timeline clusters). */
  listByIds(
    userId: string,
    ticketId: string,
    followUpIds: string[],
    opts?: { types?: string[] },
  ): Promise<FollowUpRecord[]>;
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
  created_by: string | null;
  deleted_at: Date | null;
  created_at: Date;
  has_recording?: boolean | number;
  has_image?: boolean | number;
  has_file?: boolean | number;
}): FollowUpRecord {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    source: row.source,
    type: row.type,
    isPrivate: row.is_private,
    mentionedPseudonyms: row.mentioned_pseudonyms,
    encryptedContent: row.encrypted_content,
    createdBy: row.created_by,
    createdAt: row.created_at,
    hasRecording: Boolean(row.has_recording),
    hasImage: Boolean(row.has_image),
    hasFile: Boolean(row.has_file),
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
          created_by: userId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toRecord(row);
    },

    async listByTicket(userId, ticketId, opts) {
      await access.assertAccess(userId, ticketId);

      const isOlder = opts.direction === "older";

      let query = db
        .selectFrom("followups")
        .selectAll()
        .select((eb) => [
          eb
            .exists(
              eb
                .selectFrom("recordings as r")
                .whereRef("r.followup_id", "=", "followups.id")
                .where("r.deleted_at", "is", null)
                .select(eb.lit(1).as("one")),
            )
            .as("has_recording"),
          eb
            .exists(
              eb
                .selectFrom("attachments as a")
                .whereRef("a.followup_id", "=", "followups.id")
                .where("a.deleted_at", "is", null)
                .where("a.content_type", "like", "image/%")
                .select(eb.lit(1).as("one")),
            )
            .as("has_image"),
          eb
            .exists(
              eb
                .selectFrom("attachments as a2")
                .whereRef("a2.followup_id", "=", "followups.id")
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
        .where("ticket_id", "=", ticketId)
        .where("deleted_at", "is", null);

      if (opts.types !== undefined && opts.types.length > 0) {
        query = query.where("type", "in", opts.types);
      }

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

        // "newer" pages forward (after cursor), "older" pages backward (before cursor).
        const timeOp = isOlder ? "<" : ">";
        const tieOp = isOlder ? "<" : ">";

        query = query.where((eb) =>
          eb.or([
            eb("created_at", timeOp, cursorCreatedAt),
            eb.and([
              eb("created_at", "=", cursorCreatedAt),
              eb("id", tieOp, cursorId),
            ]),
          ]),
        );
      }

      // "older" queries DESC to get the N rows closest to the cursor,
      // then reverses to chronological order before returning.
      const sortDir = isOlder ? "desc" : "asc";
      const rows = await query
        .orderBy("created_at", sortDir)
        .orderBy("id", sortDir)
        .limit(opts.limit)
        .execute();

      const records = rows.map(toRecord);
      return isOlder ? records.reverse() : records;
    },

    async listSummary(userId, ticketId, opts) {
      await access.assertAccess(userId, ticketId);

      const isOlder = opts.direction === "older";

      let query = db
        .selectFrom("followups")
        .select([
          "followups.id",
          "followups.ticket_id",
          "followups.source",
          "followups.type",
          "followups.encrypted_content",
          "followups.created_at",
        ])
        .where("followups.ticket_id", "=", ticketId)
        .where("followups.deleted_at", "is", null);

      if (opts.types !== undefined && opts.types.length > 0) {
        query = query.where("followups.type", "in", opts.types);
      }

      if (opts.cursor !== undefined) {
        const cursorId = opts.cursor;
        const cursorCreatedAt = db
          .selectFrom("followups")
          .select("created_at")
          .where("id", "=", cursorId);

        const timeOp = isOlder ? "<" : ">";
        const tieOp = isOlder ? "<" : ">";

        query = query.where((eb) =>
          eb.or([
            eb("followups.created_at", timeOp, cursorCreatedAt),
            eb.and([
              eb("followups.created_at", "=", cursorCreatedAt),
              eb("followups.id", tieOp, cursorId),
            ]),
          ]),
        );
      }

      const sortDir = isOlder ? "desc" : "asc";
      const rows = await query
        .orderBy("followups.created_at", sortDir)
        .orderBy("followups.id", sortDir)
        .limit(opts.limit)
        .execute();

      const orderedRows = isOlder ? rows.reverse() : rows;

      // Batch-fetch recordings and attachments scoped to this page's
      // follow-up IDs (not the full ticket).
      const fuIds = orderedRows.map((r) => r.id);

      const [recRows, attRows] =
        fuIds.length > 0
          ? await Promise.all([
              db
                .selectFrom("recordings")
                .select(["followup_id", "duration_seconds"])
                .where("followup_id", "in", fuIds)
                .where("deleted_at", "is", null)
                .execute(),
              db
                .selectFrom("attachments")
                .select(["followup_id", "content_type"])
                .where("followup_id", "in", fuIds)
                .where("deleted_at", "is", null)
                .execute(),
            ])
          : [[], []];

      // Build lookup maps.
      const recByFu = new Map<
        string,
        { count: number; maxDuration: number | null }
      >();
      for (const r of recRows) {
        if (r.followup_id === null) continue;
        const existing = recByFu.get(r.followup_id) ?? {
          count: 0,
          maxDuration: null,
        };
        existing.count++;
        if (r.duration_seconds !== null) {
          existing.maxDuration =
            existing.maxDuration !== null
              ? Math.max(existing.maxDuration, r.duration_seconds)
              : r.duration_seconds;
        }
        recByFu.set(r.followup_id, existing);
      }

      const attByFu = new Map<
        string,
        { hasImage: boolean; hasFile: boolean }
      >();
      for (const a of attRows) {
        if (a.followup_id === null) continue;
        const existing = attByFu.get(a.followup_id) ?? {
          hasImage: false,
          hasFile: false,
        };
        if (a.content_type?.startsWith("image/") === true) {
          existing.hasImage = true;
        } else {
          existing.hasFile = true;
        }
        attByFu.set(a.followup_id, existing);
      }

      return orderedRows.map((row): FollowUpSummaryRecord => {
        const isPlainMessage =
          row.source !== "system" && row.type !== "internal_note";
        const rec = recByFu.get(row.id);
        const att = attByFu.get(row.id);

        return {
          id: row.id,
          ticketId: row.ticket_id,
          source: row.source,
          type: row.type,
          encryptedContent: isPlainMessage ? null : row.encrypted_content,
          createdAt: row.created_at,
          hasRecording: (rec?.count ?? 0) > 0,
          recordingDurationSeconds: rec?.maxDuration ?? null,
          hasImage: att?.hasImage ?? false,
          hasFile: att?.hasFile ?? false,
        };
      });
    },

    async listByIds(userId, ticketId, followUpIds, opts) {
      await access.assertAccess(userId, ticketId);

      if (followUpIds.length === 0) return [];

      let query = db
        .selectFrom("followups")
        .selectAll()
        .select((eb) => [
          eb
            .exists(
              eb
                .selectFrom("recordings as r")
                .whereRef("r.followup_id", "=", "followups.id")
                .where("r.deleted_at", "is", null)
                .select(eb.lit(1).as("one")),
            )
            .as("has_recording"),
          eb
            .exists(
              eb
                .selectFrom("attachments as a")
                .whereRef("a.followup_id", "=", "followups.id")
                .where("a.deleted_at", "is", null)
                .where("a.content_type", "like", "image/%")
                .select(eb.lit(1).as("one")),
            )
            .as("has_image"),
          eb
            .exists(
              eb
                .selectFrom("attachments as a2")
                .whereRef("a2.followup_id", "=", "followups.id")
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
        .where("ticket_id", "=", ticketId)
        .where("id", "in", followUpIds)
        .where("deleted_at", "is", null);

      if (opts?.types !== undefined && opts.types.length > 0) {
        query = query.where("type", "in", opts.types);
      }

      const rows = await query
        .orderBy("created_at", "asc")
        .orderBy("id", "asc")
        .execute();

      return rows.map(toRecord);
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
