/**
 * Pagination state for a chat view, on either side of the product.
 *
 * Owns the page array, older-page fetching, scroll-position preservation
 * on prepend, and the "load until read boundary" loop for unread messages.
 * The component provides the initial query data via seed() and the scroll
 * container via a getter; the paginator handles the rest.
 *
 * The cache key arrives as a getter rather than being built here, so the
 * volunteer ticket thread and the client portal thread page through one
 * implementation instead of two that drift apart.
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
  /** Cache key for the older page starting at `cursor`. */
  getPageQueryKey: (cursor: string) => readonly unknown[];
  fetchPage: (cursor: string) => Promise<T[]>;
  /** Getter for the scroll container element (avoids stale closures). */
  getScrollContainer: () => HTMLDivElement | undefined;
  /**
   * Total messages the conversation holds, when the transport reports one.
   *
   * Checked alongside the short-page signal because a partial page must not
   * read as the end of history on its own: a page can come back short for
   * reasons that have nothing to do with reaching the beginning.
   */
  getTotalCount?: () => number | undefined;
}

export interface ChatPaginator<T extends PaginatedRecord> {
  readonly items: T[];
  readonly hasMore: boolean;
  readonly loadingOlder: boolean;
  readonly loadingUnread: boolean;
  /** Seed with the initial query data. Call from an $effect watching the query. */
  seed(data: T[]): void;
  /** Replace the initial (most-recent) page with fresh query data. Handles optimistic adds and pending-entry cleanup. */
  syncInitialPage(data: T[]): void;
  /** Fetch one older page and prepend it, preserving scroll position. */
  loadOlderPage(): Promise<void>;
  /** Fetch pages until the oldest loaded item predates cutoffMs. */
  loadUntilReadBoundary(cutoffMs: number): Promise<void>;
}

export function createChatPaginator<T extends PaginatedRecord>(
  options: ChatPaginatorOptions<T>,
): ChatPaginator<T> {
  const { pageSize, queryClient, fetchPage, getScrollContainer } = options;

  /** True once either signal says there is no earlier history to fetch. */
  function reachedStart(pageLength: number, loadedCount: number): boolean {
    if (pageLength < pageSize) return true;
    const total = options.getTotalCount?.();
    return total !== undefined && loadedCount >= total;
  }

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

  function syncInitialPage(data: T[]): void {
    if (olderPages.length === 0 || data.length === 0) return;
    const current = olderPages.at(-1);
    if (current === undefined) return;
    if (
      current.length === data.length &&
      current.every((r, i) => r.id === data.at(i)?.id)
    )
      return;

    // When the paginator has only a single page, the refetch data is the
    // complete window and a wholesale replace is safe. When multiple pages
    // exist, the refetch covers the newest PAGE_SIZE messages, whose lower
    // boundary can shift relative to the adjacent older page. A wholesale
    // replace would create a gap or overlap at that seam. Instead, keep
    // the existing page entries stable and merge changes at the tail.
    if (olderPages.length === 1) {
      olderPages.splice(-1, 1, data);
      return;
    }

    // Build a set of IDs already present across all pages.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- ephemeral lookup used only within this sync function
    const existingIds = new Set<string>();
    for (const page of olderPages) {
      for (const r of page) {
        existingIds.add(r.id);
      }
    }

    // Collect genuinely new items from the refetch (not already loaded).
    const added: T[] = [];
    for (const r of data) {
      if (!existingIds.has(r.id)) {
        added.push(r);
      }
    }

    // Build a set of IDs present in the server response so we can
    // identify stale pending entries that the server has replaced.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- ephemeral lookup used only within this sync function
    const serverIds = new Set<string>();
    for (const r of data) {
      serverIds.add(r.id);
    }

    // Remove pending/optimistic entries from the newest page. Pending
    // IDs start with "pending-" and will not appear in server data.
    const cleaned = current.filter(
      (r) => !r.id.startsWith("pending-") || serverIds.has(r.id),
    );

    if (added.length === 0 && cleaned.length === current.length) return;

    olderPages.splice(-1, 1, [...cleaned, ...added]);
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
        queryKey: options.getPageQueryKey(oldestId),
        queryFn: async () => fetchPage(oldestId),
      });

      if (reachedStart(older.length, items.length + older.length)) {
        hasMore = false;
      }
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
          queryKey: options.getPageQueryKey(oldestId),
          queryFn: async () => fetchPage(oldestId),
        });

        if (reachedStart(older.length, items.length + older.length)) {
          hasMore = false;
        }
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
    syncInitialPage,
    loadOlderPage,
    loadUntilReadBoundary,
  };
}
