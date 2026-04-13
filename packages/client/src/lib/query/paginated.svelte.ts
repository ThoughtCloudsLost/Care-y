/**
 * Runes-based pagination wrapper for TanStack createQuery results.
 *
 * Wraps a single-page createQuery with manual "load more" state.
 * Page 1 is TanStack-managed (SSE invalidation resets it). Extra
 * pages are held in local $state and cleared when page 1 changes,
 * so the user sees fresh data with "Load more" available again.
 *
 * Avoids createInfiniteQuery to keep the data shape flat (T[])
 * and simplify SSE cache invalidation.
 */

import type { CreateQueryResult } from "@tanstack/svelte-query";

export interface PaginatedQueryOptions<T> {
  /** The initial TanStack query (page 1). */
  query: CreateQueryResult<T[]>;
  /** Must match the limit passed to the server. */
  limit: number;
  /** Fetch the next page given a cursor value. */
  fetchPage: (cursor: string) => Promise<T[]>;
  /** Extract the cursor value from the last item in a page. */
  getCursor: (item: T) => string;
}

export interface PaginatedQuery<T> {
  /** All loaded items (page 1 + extra pages), reactive. */
  readonly items: T[];
  /** Whether more data likely exists beyond what's loaded. */
  readonly hasMore: boolean;
  /** Whether a page fetch is in flight. */
  readonly loading: boolean;
  /** Fetch the next page. No-op if !hasMore or already loading. */
  loadMore: () => Promise<void>;
}

/**
 * Creates a paginated query wrapper around a TanStack createQuery result.
 *
 * Must be called during component initialization (accesses runes).
 */
export function createPaginatedQuery<T>(
  opts: PaginatedQueryOptions<T>,
): PaginatedQuery<T> {
  let extraPages = $state<T[][]>([]);
  let loading = $state(false);

  // Track page 1 data identity. When the reference changes
  // (SSE invalidation triggers a refetch), we clear extras.
  // Uses $effect.pre so the reset applies before the next render.
  let lastDataRef: T[] | undefined;

  $effect.pre(() => {
    const page1 = opts.query.data;
    if (page1 !== lastDataRef) {
      lastDataRef = page1;
      extraPages = [];
    }
  });

  // Pure derivation: concatenate page 1 + extras.
  const items = $derived.by(() => {
    const page1 = opts.query.data ?? [];
    return [...page1, ...extraPages.flat()];
  });

  const hasMore = $derived.by(() => {
    // Check the most recent page: if it returned a full page,
    // there's likely more data.
    if (extraPages.length > 0) {
      const lastPage = extraPages[extraPages.length - 1];
      return lastPage !== undefined && lastPage.length >= opts.limit;
    }
    // No extra pages loaded yet: check page 1.
    const page1 = opts.query.data;
    if (!page1) return false;
    return page1.length >= opts.limit;
  });

  async function loadMore(): Promise<void> {
    if (!hasMore || loading) return;

    const allItems = items;
    const lastItem = allItems[allItems.length - 1];
    if (lastItem === undefined) return;

    loading = true;
    try {
      const cursor = opts.getCursor(lastItem);
      const nextPage = await opts.fetchPage(cursor);
      extraPages = [...extraPages, nextPage];
    } finally {
      loading = false;
    }
  }

  return {
    get items() {
      return items;
    },
    get hasMore() {
      return hasMore;
    },
    get loading() {
      return loading;
    },
    loadMore,
  };
}
