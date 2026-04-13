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
  /** Total items in this provider's cache (for "Searching N items" hint). */
  readonly totalCached: number;
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
    /** Total items in this provider's cache (not just matches). Shown as "Searching N items". */
    totalCached: number;
  };
  /**
   * Svelte component that renders a single result item.
   * Receives props: { result: T; ontap: (id: string) => void }
   */
  readonly ResultItem: Component<{ result: T; ontap: (id: string) => void }>;
  /**
   * Optional server-backed full search. Called when the user taps "Search all".
   * Providers that only have client-side data omit this.
   * Implementations should update `state` progressively as batches are processed.
   */
  fullSearch?(query: string, state: FullSearchState<T>): Promise<void>;
}

/** Per-provider state for opt-in full search. Managed by the registry. */
export interface FullSearchState<T = unknown> {
  status: "idle" | "searching" | "done";
  /** Results found so far (accumulates across pages). */
  results: SearchResult<T>[];
  /** Items processed so far. */
  searched: number;
  /** Total items to process (from server count). */
  total: number;
}
