/**
 * Pagination state for the ticket detail chat view.
 *
 * Owns the page array, older-page fetching, scroll-position preservation
 * on prepend, and the "load until read boundary" loop for unread messages.
 * The component provides the initial query data via seed() and the scroll
 * container via a getter; the paginator handles the rest.
 */

import type { QueryClient } from "@tanstack/svelte-query";

/** Minimal constraint for records managed by the paginator. */
export interface PaginatedRecord {
  id: string;
  createdAt: string;
}

interface ChatPaginatorOptions<T extends PaginatedRecord> {
  pageSize: number;
  queryClient: QueryClient;
  /** Getter to read the current ticketId (avoids stale prop capture). */
  getTicketId: () => string;
  fetchPage: (cursor: string) => Promise<T[]>;
  /** Getter for the scroll container element (avoids stale closures). */
  getScrollContainer: () => HTMLDivElement | undefined;
}

export interface ChatPaginator<T extends PaginatedRecord> {
  readonly items: T[];
  readonly hasMore: boolean;
  readonly loadingOlder: boolean;
  readonly loadingUnread: boolean;
  /** Seed with the initial query data. Call from an $effect watching the query. */
  seed(data: T[]): void;
  /** Fetch one older page and prepend it, preserving scroll position. */
  loadOlderPage(): Promise<void>;
  /** Fetch pages until the oldest loaded item predates cutoffMs. */
  loadUntilReadBoundary(cutoffMs: number): Promise<void>;
}

export function createChatPaginator<T extends PaginatedRecord>(
  options: ChatPaginatorOptions<T>,
): ChatPaginator<T> {
  const { pageSize, queryClient, fetchPage, getScrollContainer } = options;

  let olderPages = $state<T[][]>([]);
  let hasMore = $state(true);
  let loadingOlder = $state(false);
  let loadingUnread = $state(false);

  const items = $derived(olderPages.flat());

  function seed(data: T[]): void {
    if (olderPages.length > 0 || data.length === 0) return;
    olderPages = [data];
    if (data.length < pageSize) hasMore = false;
  }

  async function loadOlderPage(): Promise<void> {
    if (loadingOlder || !hasMore || items.length === 0) return;
    loadingOlder = true;

    const oldestId = items[0]?.id;
    if (oldestId === undefined) {
      loadingOlder = false;
      return;
    }

    try {
      const older = await queryClient.fetchQuery({
        queryKey: [
          "ticket",
          options.getTicketId(),
          "followUps",
          "page",
          oldestId,
        ],
        queryFn: async () => fetchPage(oldestId),
      });

      if (older.length < pageSize) hasMore = false;
      if (older.length > 0) {
        // Preserve scroll position: measure before prepend, restore after.
        const el = getScrollContainer();
        const prevScrollHeight = el?.scrollHeight ?? 0;
        const prevScrollTop = el?.scrollTop ?? 0;

        olderPages = [older, ...olderPages];

        requestAnimationFrame(() => {
          if (!el) return;
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
        });
      }
    } finally {
      loadingOlder = false;
    }
  }

  async function loadUntilReadBoundary(cutoffMs: number): Promise<void> {
    loadingUnread = true;
    try {
      while (hasMore) {
        const oldestId = items[0]?.id;
        if (oldestId === undefined) break;

        const older = await queryClient.fetchQuery({
          queryKey: [
            "ticket",
            options.getTicketId(),
            "followUps",
            "page",
            oldestId,
          ],
          queryFn: async () => fetchPage(oldestId),
        });

        if (older.length < pageSize) hasMore = false;
        if (older.length > 0) {
          olderPages = [older, ...olderPages];
        }

        const newOldest = items[0];
        if (!newOldest) break;
        if (Date.parse(newOldest.createdAt) <= cutoffMs) break;
      }
    } finally {
      loadingUnread = false;
    }
  }

  return {
    get items(): T[] {
      return items;
    },
    get hasMore(): boolean {
      return hasMore;
    },
    get loadingOlder(): boolean {
      return loadingOlder;
    },
    get loadingUnread(): boolean {
      return loadingUnread;
    },
    seed,
    loadOlderPage,
    loadUntilReadBoundary,
  };
}
