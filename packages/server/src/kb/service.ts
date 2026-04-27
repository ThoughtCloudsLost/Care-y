/**
 * Knowledge Base service layer.
 *
 * Three factory functions for category CRUD, article CRUD, and voting.
 * Each takes a tenant-scoped Kysely instance (already bound to the org
 * schema via tenantDb/withSchema).
 *
 * KB content (category names, article titles, bodies) is encrypted with the org
 * key (non-PII tier). The server stores only ciphertext in bytea
 * columns and plaintext metadata (sort order, vote counts, timestamps).
 * Decryption happens client-side after the browser unwraps the org key
 * at login.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { NotFoundError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";

// --- Category records ---

export interface KBCategoryRecord {
  readonly id: string;
  readonly encryptedName: Buffer;
  readonly sortOrder: number;
  readonly encryptedDescription: Buffer | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// --- Item records ---

/** Lightweight item record for list endpoints (no body). */
export interface KBItemSummary {
  readonly id: string;
  readonly categoryId: string;
  readonly encryptedTitle: Buffer;
  readonly encryptedExcerpt: Buffer | null;
  readonly createdBy: string;
  readonly voteUpCount: number;
  readonly voteDownCount: number;
  readonly rating: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Full item record for detail endpoints (includes body). */
export interface KBItemRecord extends KBItemSummary {
  readonly encryptedBody: Buffer;
  readonly attachmentCount: number;
}

export interface KBItemPage {
  readonly items: KBItemSummary[];
  readonly nextCursor: string | null;
  readonly total: number;
}

// --- Author records ---

/** Distinct KB article author with encrypted display name for client resolution. */
export interface KBAuthorRecord {
  readonly id: string;
  readonly encryptedDisplayName: Buffer;
}

// --- Vote records ---

export interface KBVoteRecord {
  readonly id: string;
  readonly kbItemId: string;
  readonly voterPseudonym: string;
  readonly direction: string;
  readonly createdAt: Date;
}

// --- Service interfaces ---

export interface KBCategoryService {
  create(input: {
    encryptedName: Buffer;
    encryptedDescription?: Buffer;
  }): Promise<KBCategoryRecord>;

  list(): Promise<KBCategoryRecord[]>;

  update(
    categoryId: string,
    input: {
      encryptedName?: Buffer;
      encryptedDescription?: Buffer;
    },
  ): Promise<KBCategoryRecord>;

  delete(categoryId: string): Promise<void>;

  reorder(items: { categoryId: string; sortOrder: number }[]): Promise<void>;
}

export interface KBItemService {
  create(
    createdBy: string,
    input: {
      categoryId: string;
      encryptedTitle: Buffer;
      encryptedBody: Buffer;
      encryptedExcerpt?: Buffer;
    },
  ): Promise<KBItemRecord>;

  findById(itemId: string): Promise<KBItemRecord>;

  list(input: {
    categoryId?: string;
    sortBy: "created_at" | "updated_at" | "rating";
    sortDirection: "asc" | "desc";
    minRating?: number;
    createdBy?: string;
    createdAfter?: string;
    createdBefore?: string;
    limit: number;
    cursor?: string;
  }): Promise<KBItemPage>;

  update(
    itemId: string,
    input: {
      categoryId?: string;
      encryptedTitle?: Buffer;
      encryptedBody?: Buffer;
      encryptedExcerpt?: Buffer;
    },
  ): Promise<KBItemRecord>;

  delete(itemId: string): Promise<void>;

  /** Return the N most recently updated items, ordered by updated_at desc. */
  listRecentlyUpdated(limit: number): Promise<KBItemSummary[]>;

  /** Return distinct authors who have written KB articles. */
  listAuthors(): Promise<KBAuthorRecord[]>;

  /** Return encrypted bodies for a set of item IDs (max 200). */
  listBodies(
    itemIds: readonly string[],
  ): Promise<readonly { id: string; encryptedBody: Buffer }[]>;
}

export interface KBVoteService {
  castVote(
    voterPseudonym: string,
    input: {
      itemId: string;
      direction: string;
    },
  ): Promise<void>;

  removeVote(voterPseudonym: string, itemId: string): Promise<void>;

  getUserVote(
    voterPseudonym: string,
    itemId: string,
  ): Promise<KBVoteRecord | null>;
}

// --- Row mappers ---

function toCategoryRecord(row: {
  id: string;
  encrypted_name: Buffer;
  sort_order: number;
  encrypted_description: Buffer | null;
  created_at: Date;
  updated_at: Date;
}): KBCategoryRecord {
  return {
    id: row.id,
    encryptedName: row.encrypted_name,
    sortOrder: row.sort_order,
    encryptedDescription: row.encrypted_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toItemSummary(row: {
  id: string;
  category_id: string;
  encrypted_title: Buffer;
  encrypted_excerpt: Buffer | null;
  created_by: string;
  vote_up_count: number;
  vote_down_count: number;
  rating: number;
  created_at: Date;
  updated_at: Date;
}): KBItemSummary {
  return {
    id: row.id,
    categoryId: row.category_id,
    encryptedTitle: row.encrypted_title,
    encryptedExcerpt: row.encrypted_excerpt,
    createdBy: row.created_by,
    voteUpCount: row.vote_up_count,
    voteDownCount: row.vote_down_count,
    rating: row.rating,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toItemRecord(
  row: {
    id: string;
    category_id: string;
    encrypted_title: Buffer;
    encrypted_body: Buffer;
    encrypted_excerpt: Buffer | null;
    created_by: string;
    vote_up_count: number;
    vote_down_count: number;
    rating: number;
    created_at: Date;
    updated_at: Date;
  },
  attachmentCount: number,
): KBItemRecord {
  return {
    ...toItemSummary(row),
    encryptedBody: row.encrypted_body,
    attachmentCount,
  };
}

// --- Wilson score lower bound ---
// Returns the lower bound of the Wilson score confidence interval.
// With zero votes, returns 0. p = positive / total, z = 1.96 (95% CI).

export function wilsonScore(up: number, down: number): number {
  const n = up + down;
  if (n === 0) return 0;
  const p = up / n;
  const z = 1.96;
  const denominator = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  return (centre - spread) / denominator;
}

// --- Factory functions ---

export function createKBCategoryService(
  db: Kysely<TenantDatabase>,
): KBCategoryService {
  return {
    async create(input) {
      const { max } = await db
        .selectFrom("kb_categories")
        .select((eb) =>
          eb.fn.coalesce(eb.fn.max("sort_order"), eb.lit(0)).as("max"),
        )
        .executeTakeFirstOrThrow();

      const nextSortOrder = max + 1;

      const row = await db
        .insertInto("kb_categories")
        .values({
          encrypted_name: input.encryptedName,
          sort_order: nextSortOrder,
          encrypted_description: input.encryptedDescription ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return toCategoryRecord(row);
    },

    async list() {
      const rows = await db
        .selectFrom("kb_categories")
        .selectAll()
        .orderBy("sort_order", "asc")
        .execute();
      return rows.map(toCategoryRecord);
    },

    async update(categoryId, input) {
      const updates: Record<string, unknown> = {};
      if (input.encryptedName !== undefined)
        updates.encrypted_name = input.encryptedName;
      if (input.encryptedDescription !== undefined)
        updates.encrypted_description = input.encryptedDescription;

      if (Object.keys(updates).length === 0) {
        const existing = await db
          .selectFrom("kb_categories")
          .selectAll()
          .where("id", "=", categoryId)
          .executeTakeFirst();
        if (!existing) throw new NotFoundError(ErrorCode.KB_CATEGORY_NOT_FOUND);
        return toCategoryRecord(existing);
      }

      updates.updated_at = new Date();

      const row = await db
        .updateTable("kb_categories")
        .set(updates)
        .where("id", "=", categoryId)
        .returningAll()
        .executeTakeFirst();
      if (!row) throw new NotFoundError(ErrorCode.KB_CATEGORY_NOT_FOUND);
      return toCategoryRecord(row);
    },

    async delete(categoryId) {
      // RESTRICT FK will throw if items still reference this category.
      // Let the DB error propagate; the route maps it to a ConflictError.
      const result = await db
        .deleteFrom("kb_categories")
        .where("id", "=", categoryId)
        .executeTakeFirst();
      if (result.numDeletedRows === 0n) {
        throw new NotFoundError(ErrorCode.KB_CATEGORY_NOT_FOUND);
      }
    },

    async reorder(items) {
      await db.transaction().execute(async (trx) => {
        // Set all affected rows to negative sort_order to avoid unique
        // constraint conflicts during the reorder swap.
        for (const item of items) {
          await trx
            .updateTable("kb_categories")
            .set({ sort_order: -item.sortOrder })
            .where("id", "=", item.categoryId)
            .execute();
        }

        // Apply the final positive sort_order values.
        for (const item of items) {
          await trx
            .updateTable("kb_categories")
            .set({
              sort_order: item.sortOrder,
              updated_at: new Date(),
            })
            .where("id", "=", item.categoryId)
            .execute();
        }
      });
    },
  };
}

export function createKBItemService(db: Kysely<TenantDatabase>): KBItemService {
  return {
    async create(createdBy, input) {
      // Verify category exists
      const category = await db
        .selectFrom("kb_categories")
        .select("id")
        .where("id", "=", input.categoryId)
        .executeTakeFirst();
      if (!category) throw new NotFoundError(ErrorCode.KB_CATEGORY_NOT_FOUND);

      const row = await db
        .insertInto("kb_items")
        .values({
          category_id: input.categoryId,
          encrypted_title: input.encryptedTitle,
          encrypted_body: input.encryptedBody,
          encrypted_excerpt: input.encryptedExcerpt ?? null,
          created_by: createdBy,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return toItemRecord(row, 0);
    },

    async findById(itemId) {
      const row = await db
        .selectFrom("kb_items")
        .selectAll()
        .select((eb) =>
          eb
            .selectFrom("kb_attachments")
            .select(eb.fn.countAll<string>().as("cnt"))
            .whereRef("kb_attachments.item_id", "=", "kb_items.id")
            .where("kb_attachments.deleted_at", "is", null)
            .as("attachment_count"),
        )
        .where("id", "=", itemId)
        .executeTakeFirst();
      if (!row) throw new NotFoundError(ErrorCode.KB_ARTICLE_NOT_FOUND);
      return toItemRecord(row, Number(row.attachment_count ?? 0));
    },

    async list(input) {
      const summaryColumns = [
        "id",
        "category_id",
        "encrypted_title",
        "encrypted_excerpt",
        "created_by",
        "vote_up_count",
        "vote_down_count",
        "rating",
        "created_at",
        "updated_at",
      ] as const;

      const sortBy = input.sortBy;
      const sortDir = input.sortDirection;

      let query = db.selectFrom("kb_items").select(summaryColumns);

      // --- Filters ---
      if (input.categoryId !== undefined) {
        query = query.where("category_id", "=", input.categoryId);
      }
      if (input.minRating !== undefined) {
        query = query.where("rating", ">=", input.minRating);
      }
      if (input.createdBy !== undefined) {
        query = query.where("created_by", "=", input.createdBy);
      }
      if (input.createdAfter !== undefined) {
        query = query.where("created_at", ">=", new Date(input.createdAfter));
      }
      if (input.createdBefore !== undefined) {
        query = query.where("created_at", "<=", new Date(input.createdBefore));
      }

      // --- Cursor keyset ---
      // Cursor format: "sortValue|id" where sortValue is ISO date or numeric rating.
      // The comparison operator flips based on sort direction.
      if (input.cursor !== undefined) {
        const pipeIdx = input.cursor.indexOf("|");
        if (pipeIdx > 0) {
          const cursorSortRaw = input.cursor.slice(0, pipeIdx);
          const cursorId = input.cursor.slice(pipeIdx + 1);

          // For date columns, parse as Date. For rating, parse as number.
          const cursorSortValue: Date | number =
            sortBy === "rating"
              ? Number(cursorSortRaw)
              : new Date(cursorSortRaw);

          // "desc" pages forward with <, "asc" pages forward with >
          const op = sortDir === "desc" ? ("<" as const) : (">" as const);

          query = query.where((eb) =>
            eb.or([
              eb(sortBy, op, cursorSortValue),
              eb.and([
                eb(sortBy, "=", cursorSortValue),
                // Secondary sort by id always descending for stable ordering
                eb("id", "<", cursorId),
              ]),
            ]),
          );
        }
      }

      // Fetch limit + 1 to determine if there's a next page
      const rows = await query
        .orderBy(sortBy, sortDir)
        .orderBy("id", "desc")
        .limit(input.limit + 1)
        .execute();

      const hasMore = rows.length > input.limit;
      const pageRows = hasMore ? rows.slice(0, input.limit) : rows;

      let nextCursor: string | null = null;
      if (hasMore && pageRows.length > 0) {
        const last = pageRows.at(-1);
        if (last !== undefined) {
          const sortValue =
            sortBy === "rating"
              ? String(last.rating)
              : sortBy === "updated_at"
                ? last.updated_at.toISOString()
                : last.created_at.toISOString();
          nextCursor = `${sortValue}|${last.id}`;
        }
      }

      let countQuery = db
        .selectFrom("kb_items")
        .select((eb) => eb.fn.countAll<number>().as("total"));
      if (input.categoryId !== undefined) {
        countQuery = countQuery.where("category_id", "=", input.categoryId);
      }
      if (input.minRating !== undefined) {
        countQuery = countQuery.where("rating", ">=", input.minRating);
      }
      if (input.createdBy !== undefined) {
        countQuery = countQuery.where("created_by", "=", input.createdBy);
      }
      if (input.createdAfter !== undefined) {
        countQuery = countQuery.where(
          "created_at",
          ">=",
          new Date(input.createdAfter),
        );
      }
      if (input.createdBefore !== undefined) {
        countQuery = countQuery.where(
          "created_at",
          "<=",
          new Date(input.createdBefore),
        );
      }
      const countRow = await countQuery.executeTakeFirstOrThrow();

      return {
        items: pageRows.map(toItemSummary),
        nextCursor,
        total: countRow.total,
      };
    },

    async update(itemId, input) {
      const updates: Record<string, unknown> = {};
      if (input.categoryId !== undefined) {
        // Verify new category exists
        const category = await db
          .selectFrom("kb_categories")
          .select("id")
          .where("id", "=", input.categoryId)
          .executeTakeFirst();
        if (!category) throw new NotFoundError(ErrorCode.KB_CATEGORY_NOT_FOUND);
        updates.category_id = input.categoryId;
      }
      if (input.encryptedTitle !== undefined)
        updates.encrypted_title = input.encryptedTitle;
      if (input.encryptedBody !== undefined)
        updates.encrypted_body = input.encryptedBody;
      if (input.encryptedExcerpt !== undefined)
        updates.encrypted_excerpt = input.encryptedExcerpt;

      if (Object.keys(updates).length === 0) {
        return this.findById(itemId);
      }

      updates.updated_at = new Date();

      await db
        .updateTable("kb_items")
        .set(updates)
        .where("id", "=", itemId)
        .execute();

      return this.findById(itemId);
    },

    async delete(itemId) {
      // CASCADE on kb_votes handles vote cleanup
      const result = await db
        .deleteFrom("kb_items")
        .where("id", "=", itemId)
        .executeTakeFirst();
      if (result.numDeletedRows === 0n) {
        throw new NotFoundError(ErrorCode.KB_ARTICLE_NOT_FOUND);
      }
    },

    async listRecentlyUpdated(limit) {
      const rows = await db
        .selectFrom("kb_items")
        .select([
          "id",
          "category_id",
          "encrypted_title",
          "encrypted_excerpt",
          "created_by",
          "vote_up_count",
          "vote_down_count",
          "rating",
          "created_at",
          "updated_at",
        ])
        .orderBy("updated_at", "desc")
        .limit(limit)
        .execute();
      return rows.map(toItemSummary);
    },

    async listAuthors() {
      const rows = await db
        .selectFrom("kb_items")
        .innerJoin("users", (join) =>
          join.on((eb) =>
            eb(eb.cast("kb_items.created_by", "uuid"), "=", eb.ref("users.id")),
          ),
        )
        .select(["users.id", "users.encrypted_display_name"])
        .groupBy(["users.id", "users.encrypted_display_name"])
        .execute();
      return rows.map((r) => ({
        id: r.id,
        encryptedDisplayName: r.encrypted_display_name,
      }));
    },

    async listBodies(itemIds) {
      if (itemIds.length === 0) return [];
      const rows = await db
        .selectFrom("kb_items")
        .select(["id", "encrypted_body"])
        .where("id", "in", [...itemIds])
        .execute();
      return rows.map((r) => ({ id: r.id, encryptedBody: r.encrypted_body }));
    },
  };
}

export function createKBVoteService(db: Kysely<TenantDatabase>): KBVoteService {
  /** Recalculates and persists vote counts + Wilson score for an item. */
  async function updateVoteCounts(
    itemId: string,
    currentUp: number,
    currentDown: number,
    upDelta: number,
    downDelta: number,
  ): Promise<void> {
    const newUp = currentUp + upDelta;
    const newDown = currentDown + downDelta;
    await db
      .updateTable("kb_items")
      .set({
        vote_up_count: newUp,
        vote_down_count: newDown,
        rating: wilsonScore(newUp, newDown),
      })
      .where("id", "=", itemId)
      .execute();
  }

  /** Computes the up/down deltas when changing from one direction to another. */
  function voteDelta(
    direction: string,
    previous: string | null,
  ): { upDelta: number; downDelta: number } {
    const upDelta = (direction === "up" ? 1 : 0) - (previous === "up" ? 1 : 0);
    const downDelta =
      (direction === "down" ? 1 : 0) - (previous === "down" ? 1 : 0);
    return { upDelta, downDelta };
  }

  return {
    async castVote(voterPseudonym, input) {
      const item = await db
        .selectFrom("kb_items")
        .select(["id", "vote_up_count", "vote_down_count"])
        .where("id", "=", input.itemId)
        .executeTakeFirst();
      if (!item) throw new NotFoundError(ErrorCode.KB_ARTICLE_NOT_FOUND);

      const existing = await db
        .selectFrom("kb_votes")
        .selectAll()
        .where("kb_item_id", "=", input.itemId)
        .where("voter_pseudonym", "=", voterPseudonym)
        .executeTakeFirst();

      if (existing) {
        if (existing.direction === input.direction) return;

        await db
          .updateTable("kb_votes")
          .set({ direction: input.direction })
          .where("id", "=", existing.id)
          .execute();

        const { upDelta, downDelta } = voteDelta(
          input.direction,
          existing.direction,
        );
        await updateVoteCounts(
          input.itemId,
          item.vote_up_count,
          item.vote_down_count,
          upDelta,
          downDelta,
        );
      } else {
        await db
          .insertInto("kb_votes")
          .values({
            kb_item_id: input.itemId,
            voter_pseudonym: voterPseudonym,
            direction: input.direction,
          })
          .execute();

        const { upDelta, downDelta } = voteDelta(input.direction, null);
        await updateVoteCounts(
          input.itemId,
          item.vote_up_count,
          item.vote_down_count,
          upDelta,
          downDelta,
        );
      }
    },

    async removeVote(voterPseudonym, itemId) {
      const existing = await db
        .selectFrom("kb_votes")
        .selectAll()
        .where("kb_item_id", "=", itemId)
        .where("voter_pseudonym", "=", voterPseudonym)
        .executeTakeFirst();

      if (!existing) return;

      await db.deleteFrom("kb_votes").where("id", "=", existing.id).execute();

      const item = await db
        .selectFrom("kb_items")
        .select(["id", "vote_up_count", "vote_down_count"])
        .where("id", "=", itemId)
        .executeTakeFirst();

      if (item) {
        const { upDelta, downDelta } = voteDelta("none", existing.direction);
        await updateVoteCounts(
          itemId,
          item.vote_up_count,
          item.vote_down_count,
          upDelta,
          downDelta,
        );
      }
    },

    async getUserVote(voterPseudonym, itemId) {
      const row = await db
        .selectFrom("kb_votes")
        .selectAll()
        .where("kb_item_id", "=", itemId)
        .where("voter_pseudonym", "=", voterPseudonym)
        .executeTakeFirst();
      if (!row) return null;
      return {
        id: row.id,
        kbItemId: row.kb_item_id,
        voterPseudonym: row.voter_pseudonym,
        direction: row.direction,
        createdAt: row.created_at,
      };
    },
  };
}
