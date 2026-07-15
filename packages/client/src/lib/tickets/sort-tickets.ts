/**
 * Client-side ticket sorting.
 *
 * The server returns tickets in keyset order (created_at-based).
 * Sorting by priority or last activity is a client-side stable sort
 * on the already-fetched data. The server only handles keyset
 * pagination, not arbitrary ordering.
 */

import type { SortConfig } from "$lib/stores/filters.svelte.js";

interface SortableTicket {
  readonly id: string;
  readonly priority: string;
  readonly createdAt: string;
  readonly lastActivityAt: string | null;
  readonly queueSortOrder: number;
  readonly clientAlias?: string;
  readonly followUpCount?: number;
}

const PRIORITY_ORDER = new Map<string, number>([
  ["urgent", 0],
  ["high", 1],
  ["normal", 2],
  ["low", 3],
]);

function priorityRank(priority: string): number {
  return PRIORITY_ORDER.get(priority) ?? 4;
}

/**
 * Stable-sort tickets by the given sort config.
 * Returns a new array (does not mutate the input).
 */
export function sortTickets<T extends SortableTicket>(
  tickets: readonly T[],
  sort: SortConfig,
): T[] {
  const sorted = [...tickets];
  const dir = sort.direction === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    let cmp: number;

    switch (sort.field) {
      case "priority":
        // Priority rank is inverted: urgent=0 (highest priority) to low=3.
        // "desc" should show highest priority first, so negate the comparison
        // to align with the direction multiplier.
        cmp = priorityRank(b.priority) - priorityRank(a.priority);
        break;
      case "last_activity": {
        const aTime = a.lastActivityAt ?? a.createdAt;
        const bTime = b.lastActivityAt ?? b.createdAt;
        cmp = aTime < bTime ? -1 : aTime > bTime ? 1 : 0;
        break;
      }
      case "queue":
        cmp = a.queueSortOrder - b.queueSortOrder;
        break;
      case "client": {
        const aAlias = a.clientAlias ?? "";
        const bAlias = b.clientAlias ?? "";
        cmp = aAlias.localeCompare(bAlias);
        break;
      }
      case "msgs":
        cmp = (a.followUpCount ?? 0) - (b.followUpCount ?? 0);
        break;
      case "date":
      default:
        cmp =
          a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
        break;
    }

    // Stable tiebreaker: fall back to id comparison
    if (cmp === 0) {
      cmp = a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    }

    return cmp * dir;
  });

  return sorted;
}
