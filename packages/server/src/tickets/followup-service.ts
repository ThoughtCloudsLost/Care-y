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
import {
  ErrorCode,
  getAllowedRoleIds,
  meetsRoleThreshold,
} from "@care-y/shared";
import { REACTION_TYPES } from "@care-y/shared";
import type { ReactionSummary, ReactionType } from "@care-y/shared";

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
  readonly noteTypeId: string | null;
  readonly fullPosition?: number;
  readonly totalCount?: number;
}

export interface CreateFollowUpInput {
  readonly ticketId: string;
  readonly encryptedContent: Buffer;
  readonly source: string;
  readonly type: string;
  readonly isPrivate: boolean;
  readonly mentionedPseudonyms: string[];
  readonly noteTypeId?: string;
}

/** Lightweight follow-up for timeline rendering. Plain messages omit encryptedContent. */
export interface FollowUpSummaryRecord {
  readonly id: string;
  readonly ticketId: string;
  readonly source: string;
  readonly type: string;
  /** Present for system events and internal notes, null for plain messages. */
  readonly encryptedContent: Buffer | null;
  readonly createdBy: string | null;
  readonly createdAt: Date;
  readonly hasRecording: boolean;
  readonly recordingDurationSeconds: number | null;
  readonly hasImage: boolean;
  readonly hasFile: boolean;
  readonly noteTypeId: string | null;
  readonly fullPosition?: number;
  readonly totalCount?: number;
}

export interface FollowUpListOpts {
  limit: number;
  cursor?: string;
  direction?: "newer" | "older";
  types?: string[];
  mediaFlags?: string[];
  createdBy?: string[];
  includeClientSource?: boolean;
  dateFrom?: string;
  dateTo?: string;
  userRoleId?: string;
}

export interface FollowUpService {
  create(userId: string, input: CreateFollowUpInput): Promise<FollowUpRecord>;
  listByTicket(
    userId: string,
    ticketId: string,
    opts: FollowUpListOpts,
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
    opts: FollowUpListOpts,
  ): Promise<FollowUpSummaryRecord[]>;
  /** Fetch specific follow-ups by ID (for expanding timeline clusters). */
  listByIds(
    userId: string,
    ticketId: string,
    followUpIds: string[],
    opts?: { types?: string[] },
  ): Promise<FollowUpRecord[]>;
  /** Update encrypted content and/or note type of an internal note. Only the author can edit. */
  updateInternalNote(
    userId: string,
    followUpId: string,
    encryptedContent: Buffer,
    noteTypeId?: string,
  ): Promise<{ record: FollowUpRecord; previousNoteTypeId: string | null }>;
  /** Soft-delete an internal note. Author or admin can delete. */
  softDeleteInternalNote(
    userId: string,
    followUpId: string,
    isAdmin: boolean,
  ): Promise<void>;
  /** Return distinct volunteer authors on a ticket with encrypted display names. */
  listParticipants(
    userId: string,
    ticketId: string,
  ): Promise<readonly { volunteerId: string; encryptedDisplayName: Buffer }[]>;
  /** Toggle a reaction on an internal note. Returns updated summaries. */
  toggleReaction(
    userId: string,
    userRoleId: string,
    followUpId: string,
    reaction: ReactionType,
  ): Promise<ReactionSummary[]>;
  /** Batch-load reactions for a list of followup IDs. */
  getReactions(followUpIds: string[]): Promise<Map<string, ReactionSummary[]>>;
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
  note_type_id?: string | null;
  has_recording?: boolean | number;
  has_image?: boolean | number;
  has_file?: boolean | number;
  full_position?: string | number | bigint;
  total_count?: string | number | bigint;
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
    noteTypeId: row.note_type_id ?? null,
    fullPosition:
      row.full_position !== undefined ? Number(row.full_position) : undefined,
    totalCount:
      row.total_count !== undefined ? Number(row.total_count) : undefined,
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
          note_type_id: input.noteTypeId ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toRecord(row);
    },

    async listByTicket(userId, ticketId, opts) {
      await access.assertAccess(userId, ticketId);

      const isOlder = opts.direction === "older";

      const allowedViewRoles =
        opts.userRoleId !== undefined
          ? getAllowedRoleIds(opts.userRoleId)
          : undefined;

      let query = db
        .selectFrom("followups")
        .leftJoin("note_types as nt", "nt.id", "followups.note_type_id")
        .selectAll("followups")
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
        .where("followups.ticket_id", "=", ticketId)
        .where("followups.deleted_at", "is", null);

      if (allowedViewRoles !== undefined) {
        query = query.where((eb) =>
          eb.or([
            eb("followups.type", "!=", "internal_note"),
            eb("followups.note_type_id", "is", null),
            eb("followups.created_by", "=", userId),
            eb("nt.min_view_role", "in", allowedViewRoles),
          ]),
        );
      }

      // Position tracking for gap indicators (only when filters active)
      const hasAnyFilter =
        (opts.types !== undefined && opts.types.length > 0) ||
        (opts.mediaFlags !== undefined && opts.mediaFlags.length > 0) ||
        (opts.createdBy !== undefined && opts.createdBy.length > 0) ||
        opts.includeClientSource === true ||
        opts.dateFrom !== undefined ||
        opts.dateTo !== undefined;

      if (hasAnyFilter) {
        query = query.select((eb) => [
          eb
            .selectFrom("followups as fp")
            .select(eb.fn.countAll().as("cnt"))
            .where("fp.ticket_id", "=", ticketId)
            .where("fp.deleted_at", "is", null)
            .where((wb) =>
              wb.or([
                wb("fp.created_at", "<", eb.ref("followups.created_at")),
                wb.and([
                  wb("fp.created_at", "=", eb.ref("followups.created_at")),
                  wb("fp.id", "<=", eb.ref("followups.id")),
                ]),
              ]),
            )
            .as("full_position"),
          eb
            .selectFrom("followups as ft")
            .select(eb.fn.countAll().as("cnt"))
            .where("ft.ticket_id", "=", ticketId)
            .where("ft.deleted_at", "is", null)
            .as("total_count"),
        ]);
      }

      // --- Type + media filter group (OR'd together) ---
      const hasTypes = opts.types !== undefined && opts.types.length > 0;
      const hasMedia =
        opts.mediaFlags !== undefined && opts.mediaFlags.length > 0;
      if (hasTypes || hasMedia) {
        const types = opts.types ?? [];
        const flags = new Set(opts.mediaFlags ?? []);
        query = query.where((eb) => {
          const conditions = [];
          if (hasTypes) conditions.push(eb("followups.type", "in", types));
          if (flags.has("recording"))
            conditions.push(
              eb.exists(
                eb
                  .selectFrom("recordings as rf")
                  .whereRef("rf.followup_id", "=", "followups.id")
                  .where("rf.deleted_at", "is", null)
                  .select(eb.lit(1).as("one")),
              ),
            );
          if (flags.has("image"))
            conditions.push(
              eb.exists(
                eb
                  .selectFrom("attachments as ai")
                  .whereRef("ai.followup_id", "=", "followups.id")
                  .where("ai.deleted_at", "is", null)
                  .where("ai.content_type", "like", "image/%")
                  .select(eb.lit(1).as("one")),
              ),
            );
          if (flags.has("file"))
            conditions.push(
              eb.exists(
                eb
                  .selectFrom("attachments as af")
                  .whereRef("af.followup_id", "=", "followups.id")
                  .where("af.deleted_at", "is", null)
                  .where((w) =>
                    w.or([
                      w("af.content_type", "is", null),
                      w("af.content_type", "not like", "image/%"),
                    ]),
                  )
                  .select(eb.lit(1).as("one")),
              ),
            );
          return conditions.length === 1
            ? (conditions[0] ?? eb.or(conditions))
            : eb.or(conditions);
        });
      }

      // --- Author filter group (OR'd: client source OR specific volunteers) ---
      const hasCreatedBy =
        opts.createdBy !== undefined && opts.createdBy.length > 0;
      if (hasCreatedBy || opts.includeClientSource === true) {
        query = query.where((eb) => {
          const conditions = [];
          if (opts.includeClientSource === true)
            conditions.push(eb("followups.source", "=", "client"));
          if (hasCreatedBy)
            conditions.push(
              eb("followups.created_by", "in", opts.createdBy ?? []),
            );
          return conditions.length === 1
            ? (conditions[0] ?? eb.or(conditions))
            : eb.or(conditions);
        });
      }

      // --- Date range filter (AND'd) ---
      if (opts.dateFrom !== undefined) {
        query = query.where(
          "followups.created_at",
          ">=",
          new Date(opts.dateFrom),
        );
      }
      if (opts.dateTo !== undefined) {
        const dayEnd = new Date(opts.dateTo);
        dayEnd.setHours(23, 59, 59, 999);
        query = query.where("followups.created_at", "<=", dayEnd);
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

      const records = rows.map(toRecord);
      return isOlder ? records.reverse() : records;
    },

    async listSummary(userId, ticketId, opts) {
      await access.assertAccess(userId, ticketId);

      const isOlder = opts.direction === "older";
      const allowedViewRoles =
        opts.userRoleId !== undefined
          ? getAllowedRoleIds(opts.userRoleId)
          : undefined;

      let query = db
        .selectFrom("followups")
        .leftJoin("note_types as nt", "nt.id", "followups.note_type_id")
        .select([
          "followups.id",
          "followups.ticket_id",
          "followups.source",
          "followups.type",
          "followups.encrypted_content",
          "followups.created_by",
          "followups.created_at",
          "followups.note_type_id",
        ])
        .where("followups.ticket_id", "=", ticketId)
        .where("followups.deleted_at", "is", null);

      if (allowedViewRoles !== undefined) {
        query = query.where((eb) =>
          eb.or([
            eb("followups.type", "!=", "internal_note"),
            eb("followups.note_type_id", "is", null),
            eb("followups.created_by", "=", userId),
            eb("nt.min_view_role", "in", allowedViewRoles),
          ]),
        );
      }

      // --- Type + media filter group (OR'd together) ---
      const hasTypes = opts.types !== undefined && opts.types.length > 0;
      const hasMedia =
        opts.mediaFlags !== undefined && opts.mediaFlags.length > 0;
      if (hasTypes || hasMedia) {
        const types = opts.types ?? [];
        const flags = new Set(opts.mediaFlags ?? []);
        query = query.where((eb) => {
          const conditions = [];
          if (hasTypes) conditions.push(eb("followups.type", "in", types));
          if (flags.has("recording"))
            conditions.push(
              eb.exists(
                eb
                  .selectFrom("recordings as rf")
                  .whereRef("rf.followup_id", "=", "followups.id")
                  .where("rf.deleted_at", "is", null)
                  .select(eb.lit(1).as("one")),
              ),
            );
          if (flags.has("image"))
            conditions.push(
              eb.exists(
                eb
                  .selectFrom("attachments as ai")
                  .whereRef("ai.followup_id", "=", "followups.id")
                  .where("ai.deleted_at", "is", null)
                  .where("ai.content_type", "like", "image/%")
                  .select(eb.lit(1).as("one")),
              ),
            );
          if (flags.has("file"))
            conditions.push(
              eb.exists(
                eb
                  .selectFrom("attachments as af")
                  .whereRef("af.followup_id", "=", "followups.id")
                  .where("af.deleted_at", "is", null)
                  .where((w) =>
                    w.or([
                      w("af.content_type", "is", null),
                      w("af.content_type", "not like", "image/%"),
                    ]),
                  )
                  .select(eb.lit(1).as("one")),
              ),
            );
          return conditions.length === 1
            ? (conditions[0] ?? eb.or(conditions))
            : eb.or(conditions);
        });
      }

      // --- Author filter group (OR'd: client source OR specific volunteers) ---
      const hasCreatedBy =
        opts.createdBy !== undefined && opts.createdBy.length > 0;
      if (hasCreatedBy || opts.includeClientSource === true) {
        query = query.where((eb) => {
          const conditions = [];
          if (opts.includeClientSource === true)
            conditions.push(eb("followups.source", "=", "client"));
          if (hasCreatedBy)
            conditions.push(
              eb("followups.created_by", "in", opts.createdBy ?? []),
            );
          return conditions.length === 1
            ? (conditions[0] ?? eb.or(conditions))
            : eb.or(conditions);
        });
      }

      // --- Date range filter (AND'd) ---
      if (opts.dateFrom !== undefined) {
        query = query.where(
          "followups.created_at",
          ">=",
          new Date(opts.dateFrom),
        );
      }
      if (opts.dateTo !== undefined) {
        const dayEnd = new Date(opts.dateTo);
        dayEnd.setHours(23, 59, 59, 999);
        query = query.where("followups.created_at", "<=", dayEnd);
      }

      // Position tracking for gap indicators (only when filters active)
      const hasAnyFilter =
        (opts.types !== undefined && opts.types.length > 0) ||
        (opts.mediaFlags !== undefined && opts.mediaFlags.length > 0) ||
        (opts.createdBy !== undefined && opts.createdBy.length > 0) ||
        opts.includeClientSource === true ||
        opts.dateFrom !== undefined ||
        opts.dateTo !== undefined;

      if (hasAnyFilter) {
        query = query.select((eb) => [
          eb
            .selectFrom("followups as fp")
            .select(eb.fn.countAll().as("cnt"))
            .where("fp.ticket_id", "=", ticketId)
            .where("fp.deleted_at", "is", null)
            .where((wb) =>
              wb.or([
                wb("fp.created_at", "<", eb.ref("followups.created_at")),
                wb.and([
                  wb("fp.created_at", "=", eb.ref("followups.created_at")),
                  wb("fp.id", "<=", eb.ref("followups.id")),
                ]),
              ]),
            )
            .as("full_position"),
          eb
            .selectFrom("followups as ft")
            .select(eb.fn.countAll().as("cnt"))
            .where("ft.ticket_id", "=", ticketId)
            .where("ft.deleted_at", "is", null)
            .as("total_count"),
        ]);
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

        const fullPos = (row as Record<string, unknown>).full_position;
        const totCnt = (row as Record<string, unknown>).total_count;
        return {
          id: row.id,
          ticketId: row.ticket_id,
          source: row.source,
          type: row.type,
          encryptedContent: isPlainMessage ? null : row.encrypted_content,
          createdBy: row.created_by,
          createdAt: row.created_at,
          hasRecording: (rec?.count ?? 0) > 0,
          recordingDurationSeconds: rec?.maxDuration ?? null,
          hasImage: att?.hasImage ?? false,
          hasFile: att?.hasFile ?? false,
          noteTypeId: row.note_type_id ?? null,
          fullPosition: fullPos !== undefined ? Number(fullPos) : undefined,
          totalCount: totCnt !== undefined ? Number(totCnt) : undefined,
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

    async updateInternalNote(userId, followUpId, encryptedContent, noteTypeId) {
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

      const updates: Record<string, unknown> = {
        encrypted_content: encryptedContent,
      };
      if (noteTypeId !== undefined) {
        updates.note_type_id = noteTypeId;
      }

      const row = await db
        .updateTable("followups")
        .set(updates)
        .where("id", "=", followUpId)
        .where("created_by", "=", userId)
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new ForbiddenError(ErrorCode.FOLLOWUP_NOT_OWNED);
      return {
        record: toRecord(row),
        previousNoteTypeId: existing.note_type_id ?? null,
      };
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

    async listParticipants(userId, ticketId) {
      await access.assertAccess(userId, ticketId);

      const rows = await db
        .selectFrom("followups as f")
        .innerJoin("users as u", "u.id", "f.created_by")
        .select(["f.created_by", "u.encrypted_display_name"])
        .where("f.ticket_id", "=", ticketId)
        .where("f.deleted_at", "is", null)
        .where("f.source", "=", "volunteer")
        .groupBy(["f.created_by", "u.encrypted_display_name"])
        .execute();

      return rows.flatMap((r) =>
        r.created_by !== null
          ? [
              {
                volunteerId: r.created_by,
                encryptedDisplayName: r.encrypted_display_name,
              },
            ]
          : [],
      );
    },

    async toggleReaction(userId, userRoleId, followUpId, reaction) {
      const row = await db
        .selectFrom("followups")
        .leftJoin("note_types as nt", "nt.id", "followups.note_type_id")
        .select([
          "followups.type",
          "followups.deleted_at",
          "followups.created_by",
          "followups.ticket_id",
          "nt.min_view_role",
        ])
        .where("followups.id", "=", followUpId)
        .executeTakeFirst();

      if (row === undefined) {
        throw new NotFoundError(ErrorCode.FOLLOWUP_NOT_FOUND);
      }
      if (row.deleted_at !== null) {
        throw new NotFoundError(ErrorCode.FOLLOWUP_NOT_FOUND);
      }
      if (row.type !== "internal_note") {
        throw new ForbiddenError(ErrorCode.INSUFFICIENT_PERMISSIONS);
      }

      if (
        row.min_view_role !== null &&
        row.created_by !== userId &&
        !meetsRoleThreshold(userRoleId, row.min_view_role)
      ) {
        throw new ForbiddenError(ErrorCode.INSUFFICIENT_ROLE);
      }

      const existing = await db
        .selectFrom("followup_reactions")
        .select("id")
        .where("followup_id", "=", followUpId)
        .where("user_id", "=", userId)
        .where("reaction", "=", reaction)
        .executeTakeFirst();

      if (existing !== undefined) {
        await db
          .deleteFrom("followup_reactions")
          .where("id", "=", existing.id)
          .execute();
      } else {
        await db
          .insertInto("followup_reactions")
          .values({
            followup_id: followUpId,
            user_id: userId,
            reaction,
          })
          .execute();
      }

      return buildReactionSummaries(db, followUpId);
    },

    async getReactions(followUpIds) {
      if (followUpIds.length === 0) return new Map();

      const rows = await db
        .selectFrom("followup_reactions")
        .select(["followup_id", "user_id", "reaction"])
        .where("followup_id", "in", followUpIds)
        .orderBy("created_at", "asc")
        .execute();

      const grouped = new Map<string, Map<string, string[]>>();
      for (const r of rows) {
        let byReaction = grouped.get(r.followup_id);
        if (byReaction === undefined) {
          byReaction = new Map();
          grouped.set(r.followup_id, byReaction);
        }
        let users = byReaction.get(r.reaction);
        if (users === undefined) {
          users = [];
          byReaction.set(r.reaction, users);
        }
        users.push(r.user_id);
      }

      const result = new Map<string, ReactionSummary[]>();
      for (const [fId, byReaction] of grouped) {
        const summaries: ReactionSummary[] = [];
        for (const [reaction, userIds] of byReaction) {
          summaries.push({
            reaction: toReactionType(reaction),
            userIds,
          });
        }
        result.set(fId, summaries);
      }
      return result;
    },
  };
}

function toReactionType(value: string): ReactionType {
  for (const rt of REACTION_TYPES) {
    if (rt === value) return rt;
  }
  return "acknowledge";
}

async function buildReactionSummaries(
  db: Kysely<TenantDatabase>,
  followUpId: string,
): Promise<ReactionSummary[]> {
  const rows = await db
    .selectFrom("followup_reactions")
    .select(["reaction", "user_id"])
    .where("followup_id", "=", followUpId)
    .orderBy("created_at", "asc")
    .execute();

  const grouped = new Map<string, string[]>();
  for (const r of rows) {
    let users = grouped.get(r.reaction);
    if (users === undefined) {
      users = [];
      grouped.set(r.reaction, users);
    }
    users.push(r.user_id);
  }

  const summaries: ReactionSummary[] = [];
  for (const [reaction, userIds] of grouped) {
    summaries.push({ reaction: toReactionType(reaction), userIds });
  }
  return summaries;
}
