import type { Component } from "svelte";

/** How the search UI lays out results for this provider. */
export type SearchRenderMode = "card-strip" | "list";

/** A single search result returned by a provider. */
export interface SearchResult<T = unknown> {
  /** Unique ID within this provider (e.g., ticket ID, article ID). */
  readonly id: string;
  /** Provider-specific data needed to render the result item. */
  readonly data: T;
}

/** A group of results from one provider, ready for the UI to render. */
export interface SearchResultGroup<T = unknown> {
  readonly providerId: string;
  readonly label: string;
  /** Lucide icon component for the section header. */
  readonly icon: Component;
  readonly results: readonly SearchResult<T>[];
  readonly renderMode: SearchRenderMode;
  /** URL path the "Show all" link navigates to. */
  readonly showAllHref: string;
  /** True while the provider is still searching (show skeletons). */
  readonly loading: boolean;
  /** Items searched (for "Searched X of Y" hint). */
  readonly totalCached: number;
  /** Total items in this provider's dataset (including not-yet-searchable). */
  readonly totalItems?: number;
  /** Total matching results (when results array is a truncated preview). */
  readonly totalResults?: number;
  /** When present, "Show all" calls this instead of navigating via showAllHref. */
  readonly onviewall?: (query: string) => void;
  /** When present, result taps call this instead of navigating via getResultHref. */
  readonly onresulttap?: (id: string, query: string) => void;
  /** Quiet line shown when this section has zero results ("No teammates match X."). */
  readonly emptyText?: string;
}

/** Contract that every search provider must implement. */
export interface SearchProvider<T = unknown> {
  readonly id: string;
  /** Returns the localized display name for this provider's section header. */
  readonly label: () => string;
  /** Lucide icon component shown in the section header. */
  readonly icon: Component;
  /** Layout mode for results (horizontal card strip vs vertical list). */
  readonly renderMode: SearchRenderMode;
  /** Returns the route path for "Show all" with the given query. */
  readonly showAllHref: (query: string) => string;
  /** Returns the URL path for navigating to a single result. */
  readonly getResultHref: (id: string) => string;
  /**
   * Search the provider's local cache. Called from a $derived context,
   * so reads from reactive stores (SvelteMap, $state) are tracked.
   * Must NOT make network requests.
   */
  search(query: string): {
    results: readonly SearchResult<T>[];
    loading: boolean;
    /** Items searched (not just matches). */
    totalCached: number;
    /** Total items in the dataset (including not-yet-searchable). Omit if same as totalCached. */
    totalItems?: number;
    /** Total matching results (when results array is a truncated preview). */
    totalResults?: number;
  };
  /**
   * Svelte component that renders a single result item.
   * Receives props: { result: T; ontap: (id: string) => void }
   */
  readonly ResultItem: Component<{ result: T; ontap: (id: string) => void }>;
  /**
   * Optional server-backed full search. Called when the user taps "Search all".
   * Providers that only have client-side data omit this.
   * Mutate `state` fields and call `onProgress()` to propagate changes to the UI.
   */
  fullSearch?(
    query: string,
    state: FullSearchState,
    onProgress: () => void,
  ): Promise<void>;
  /**
   * Optional callback for "View all" that bypasses navigation. When present,
   * the search UI calls this instead of navigating via showAllHref. Used by
   * providers that display results in-page (e.g., conversation search overlay).
   */
  onviewall?(query: string): void;
  /**
   * Optional callback when a result is tapped. When present, called instead
   * of navigating via getResultHref. Used by providers that handle result
   * selection in-page (e.g., scroll-to-match in conversation search).
   */
  onresulttap?(id: string, query: string): void;
  /**
   * Returns IDs matched by content search during fullSearch().
   * Pages use this to merge content matches into in-page search overlays.
   * Reactive (backed by SvelteSet), so $derived contexts track additions.
   */
  getContentMatchIds?(): ReadonlySet<string>;
  /**
   * Called when the search sheet closes or the query changes.
   * Providers should clear full-search state (content match sets,
   * cached decrypted follow-up content) to free memory.
   */
  reset?(): void;
  /**
   * Copy for the section's quiet empty line ("No teammates match X.").
   * Omit to render nothing when the section is empty.
   */
  emptyText?(query: string): string;
}

/** Per-provider progress state for opt-in full search. Managed by the registry. */
export interface FullSearchState {
  status: "idle" | "searching" | "done";
  /** Items processed so far. */
  searched: number;
  /** Total items to process. */
  total: number;
  /** Matches found so far (title + content). */
  matchCount: number;
}
