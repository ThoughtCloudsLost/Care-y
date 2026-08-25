/**
 * Client-side ticket sorting.
 *
 * The server returns tickets in keyset order (created_at-based).
 * Sorting by priority or last activity is a client-side stable sort
 * on the already-fetched data. The server only handles keyset
 * pagination, not arbitrary ordering.
 */

import { getCollator } from "$lib/utils/collator.js";

export interface SortableTicket {
  readonly id: string;
  readonly priority: string;
  readonly createdAt: string | Date;
  readonly lastActivityAt: string | Date | null;
  readonly queueSortOrder: number;
  readonly followUpCount?: number;
  readonly displayStatus?: string;
  readonly title?: string | null;
  readonly clientAlias?: string | null;
  readonly assigneeName?: string | null;
}

export interface SortableTicketSort {
  readonly field: string;
  readonly direction: "asc" | "desc";
}

const PRIORITY_ORDER = new Map<string, number>([
  ["urgent", 0],
  ["high", 1],
  ["normal", 2],
  ["low", 3],
]);

const STATUS_RANK = new Map<string, number>([
  ["new", 0],
  ["active", 1],
  ["hold", 2],
  ["closed", 3],
]);

function priorityRank(priority: string): number {
  return PRIORITY_ORDER.get(priority) ?? 4;
}

function toTimestamp(v: string | Date): number {
  return typeof v === "string" ? Date.parse(v) : v.getTime();
}

function toIsoString(v: string | Date): string {
  return typeof v === "string" ? v : v.toISOString();
}

/**
 * Stable-sort tickets by the given sort config.
 * Returns a new array (does not mutate the input).
 */
export function sortTickets<T extends SortableTicket>(
  tickets: readonly T[],
  sort: SortableTicketSort,
): T[] {
  const sorted = [...tickets];
  const dir = sort.direction === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    let cmp: number;

    switch (sort.field) {
      case "priority":
        cmp = priorityRank(b.priority) - priorityRank(a.priority);
        break;
      case "last_activity": {
        const aTime = toTimestamp(a.lastActivityAt ?? a.createdAt);
        const bTime = toTimestamp(b.lastActivityAt ?? b.createdAt);
        cmp = aTime - bTime;
        break;
      }
      case "queue":
        cmp = a.queueSortOrder - b.queueSortOrder;
        break;
      case "msgs": {
        if (a.followUpCount == null && b.followUpCount != null) return 1;
        if (a.followUpCount != null && b.followUpCount == null) return -1;
        cmp =
          a.followUpCount != null && b.followUpCount != null
            ? a.followUpCount - b.followUpCount
            : 0;
        break;
      }
      case "status":
        cmp =
          (STATUS_RANK.get(a.displayStatus ?? "") ?? 4) -
          (STATUS_RANK.get(b.displayStatus ?? "") ?? 4);
        break;
      case "client":
        // Pending-decrypt: null/undefined coerces to "" and sorts first,
        // surfacing undecryptable rows rather than hiding them at the bottom.
        cmp = getCollator().compare(a.clientAlias ?? "", b.clientAlias ?? "");
        break;
      case "title":
        // Pending-decrypt: null/undefined coerces to "" and sorts first,
        // surfacing undecryptable rows rather than hiding them at the bottom.
        cmp = getCollator().compare(a.title ?? "", b.title ?? "");
        break;
      case "assignee": {
        if (a.assigneeName == null && b.assigneeName == null) {
          cmp = 0;
          break;
        }
        if (a.assigneeName == null) return 1;
        if (b.assigneeName == null) return -1;
        cmp = getCollator().compare(a.assigneeName, b.assigneeName);
        break;
      }
      case "date":
      default: {
        const aIso = toIsoString(a.createdAt);
        const bIso = toIsoString(b.createdAt);
        cmp = aIso < bIso ? -1 : aIso > bIso ? 1 : 0;
        break;
      }
    }

    // Server parity: every server sort uses created_at (in the sort
    // direction) as the secondary key. "date" already compared it as
    // the primary.
    if (cmp === 0 && sort.field !== "date") {
      cmp = toTimestamp(a.createdAt) - toTimestamp(b.createdAt);
    }

    const scaled = cmp * dir;
    if (scaled !== 0) return scaled;

    // Server parity: id ties always break ascending regardless of the
    // sort direction (the server pins t.id ASC in every ORDER BY).
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  return sorted;
}
