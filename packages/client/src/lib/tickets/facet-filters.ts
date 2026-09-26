/**
 * Faceted filter counts and row matching, both driven by one predicate.
 *
 * A dimension's own filter is excluded from its own counts so that
 * selecting an option does not zero its siblings (standard faceted
 * search behaviour). For example, clicking "New" in the status chips
 * does not hide the counts for "Active", "Hold", and "Closed"; those
 * counts still reflect how many rows match everything else.
 *
 * Unread and needs-attention are computed here rather than server-side
 * because the read cursor is encrypted and only the browser holds the
 * decryption key.
 *
 * The same `matchesFilters` predicate is used for both counting and
 * actual list filtering. No second copy of the matching logic exists.
 */

import { deriveDisplayStatus, type DisplayStatus } from "./display-status.js";
import type { TicketForServerFilter } from "./ticket-list-utils.js";
import { isNeedsAttention } from "$lib/components/dashboard/filters.js";

export type FacetDimension =
  "status" | "queue" | "priority" | "assignee" | "unread" | "needsAttention";

export interface FacetFilterState {
  readonly statuses: ReadonlySet<DisplayStatus>;
  readonly queueIds: ReadonlySet<string>;
  readonly priorities: ReadonlySet<string>;
  /** undefined = no filter, null = unassigned, string = that user */
  readonly assigneeId: string | null | undefined;
  readonly dateFrom: Date | null;
  readonly dateTo: Date | null;
  readonly unreadOnly: boolean;
  readonly needsAttentionOnly: boolean;
}

export interface FacetContext {
  readonly currentUserId: string | undefined;
  readonly isUnread: (ticketId: string) => boolean;
}

export interface TicketFacets {
  readonly status: Readonly<Record<DisplayStatus, number>>;
  readonly priority: Readonly<Record<string, number>>;
  readonly queue: ReadonlyMap<string, number>;
  readonly assignee: { readonly mine: number; readonly unassigned: number };
  readonly unread: number;
  readonly needsAttention: number;
  /** Rows matching every active filter. Matches the list's own length. */
  readonly total: number;
}

/**
 * Returns true when the row passes every active filter dimension,
 * except the one named by `exclude` (which is skipped entirely).
 * Date range applies unconditionally regardless of the `exclude` argument.
 */
export function matchesFilters(
  row: TicketForServerFilter,
  filters: FacetFilterState,
  ctx: FacetContext,
  exclude?: FacetDimension,
): boolean {
  // Status
  if (exclude !== "status" && filters.statuses.size > 0) {
    const ds = deriveDisplayStatus(row.status, row.onHold, row.followUpCount);
    if (!filters.statuses.has(ds)) return false;
  }

  // Queue
  if (exclude !== "queue" && filters.queueIds.size > 0) {
    if (!filters.queueIds.has(row.queueId)) return false;
  }

  // Priority
  if (exclude !== "priority" && filters.priorities.size > 0) {
    if (!filters.priorities.has(row.priority)) return false;
  }

  // Assignee
  if (exclude !== "assignee" && filters.assigneeId !== undefined) {
    if (filters.assigneeId === null) {
      if (row.assignedTo !== null) return false;
    } else {
      if (row.assignedTo !== filters.assigneeId) return false;
    }
  }

  // Date range applies unconditionally (not a facet dimension)
  const created =
    typeof row.createdAt === "string"
      ? Date.parse(row.createdAt)
      : row.createdAt.getTime();
  if (filters.dateFrom !== null && created < filters.dateFrom.getTime()) {
    return false;
  }
  if (filters.dateTo !== null && created > filters.dateTo.getTime()) {
    return false;
  }

  // Unread (client-only)
  if (exclude !== "unread" && filters.unreadOnly) {
    if (!ctx.isUnread(row.id)) return false;
  }

  // Needs attention (client-only)
  if (exclude !== "needsAttention" && filters.needsAttentionOnly) {
    if (!isNeedsAttention(row, ctx.currentUserId, ctx.isUnread)) return false;
  }

  return true;
}

/**
 * Computes facet counts for every dimension, excluding each dimension's
 * own filter from its own counts.
 */
export function computeFacets(
  rows: readonly TicketForServerFilter[],
  filters: FacetFilterState,
  ctx: FacetContext,
): TicketFacets {
  // Status facet. Counted into a Map and then spelled out, the same way
  // the queue facet below works. Tallying into a plain object needs a
  // computed key, which the object-injection lint rule rejects, and the
  // explicit shape also states outright that all four keys are present
  // whether or not any row matched.
  const statusTally = new Map<DisplayStatus, number>();
  for (const row of rows) {
    if (matchesFilters(row, filters, ctx, "status")) {
      const ds = deriveDisplayStatus(row.status, row.onHold, row.followUpCount);
      statusTally.set(ds, (statusTally.get(ds) ?? 0) + 1);
    }
  }
  const status: Record<DisplayStatus, number> = {
    new: statusTally.get("new") ?? 0,
    active: statusTally.get("active") ?? 0,
    hold: statusTally.get("hold") ?? 0,
    closed: statusTally.get("closed") ?? 0,
  };

  // Priority facet, same shape. The four priorities are a closed set, so
  // a row carrying anything else has no option to be counted under.
  const priorityTally = new Map<string, number>();
  for (const row of rows) {
    if (matchesFilters(row, filters, ctx, "priority")) {
      priorityTally.set(
        row.priority,
        (priorityTally.get(row.priority) ?? 0) + 1,
      );
    }
  }
  const priority: Record<string, number> = {
    low: priorityTally.get("low") ?? 0,
    normal: priorityTally.get("normal") ?? 0,
    high: priorityTally.get("high") ?? 0,
    urgent: priorityTally.get("urgent") ?? 0,
  };

  // Queue facet
  const queue = new Map<string, number>();
  for (const row of rows) {
    if (matchesFilters(row, filters, ctx, "queue")) {
      queue.set(row.queueId, (queue.get(row.queueId) ?? 0) + 1);
    }
  }

  // Assignee facet
  let mine = 0;
  let unassigned = 0;
  for (const row of rows) {
    if (matchesFilters(row, filters, ctx, "assignee")) {
      if (row.assignedTo === null) unassigned++;
      if (
        ctx.currentUserId !== undefined &&
        row.assignedTo === ctx.currentUserId
      ) {
        mine++;
      }
    }
  }

  // Unread facet
  let unreadCount = 0;
  for (const row of rows) {
    if (matchesFilters(row, filters, ctx, "unread") && ctx.isUnread(row.id)) {
      unreadCount++;
    }
  }

  // Needs attention facet
  let needsAttentionCount = 0;
  for (const row of rows) {
    if (
      matchesFilters(row, filters, ctx, "needsAttention") &&
      isNeedsAttention(row, ctx.currentUserId, ctx.isUnread)
    ) {
      needsAttentionCount++;
    }
  }

  // Total (no exclusion)
  let total = 0;
  for (const row of rows) {
    if (matchesFilters(row, filters, ctx)) total++;
  }

  return {
    status,
    priority,
    queue,
    assignee: { mine, unassigned },
    unread: unreadCount,
    needsAttention: needsAttentionCount,
    total,
  };
}
