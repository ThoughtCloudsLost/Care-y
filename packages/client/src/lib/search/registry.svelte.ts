import { SvelteMap } from "svelte/reactivity";
import type {
  FullSearchState,
  SearchProvider,
  SearchResult,
  SearchResultGroup,
} from "./types.js";

// Module-level singleton. SvelteMap so $derived contexts track
// provider registration/unregistration.
const providers = new SvelteMap<string, SearchProvider>();

// Route-level override for promoted provider. When set, takes precedence
// over the AppShell-derived promotedProviderId in searchAll().
let promotedOverride = $state<string | undefined>(undefined);

/**
 * Override the promoted provider ID for the duration of a route mount.
 * Returns a cleanup function that clears the override.
 */
export function setPromotedOverride(providerId: string): () => void {
  promotedOverride = providerId;
  return () => {
    if (promotedOverride === providerId) {
      promotedOverride = undefined;
    }
  };
}

/**
 * Register a search provider. Returns a cleanup function
 * that removes it (call in onDestroy or $effect cleanup).
 *
 * Generic so providers with specific result types (SearchProvider<TicketSearchData>)
 * can register without a cast. The registry stores them as SearchProvider<unknown>
 * since it only passes result.data through to the provider's own ResultItem.
 */
export function registerSearchProvider<T>(
  provider: SearchProvider<T>,
): () => void {
  // Variance erasure: providers are stored as SearchProvider<unknown>.
  // Safe because the registry only passes result.data back to the
  // provider's own ResultItem, which knows the concrete type.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- variance erasure at registry boundary
  providers.set(provider.id, provider as unknown as SearchProvider);
  return () => {
    providers.delete(provider.id);
  };
}

/**
 * Search all registered providers. Call from a $derived block
 * so reactive cache reads inside providers are tracked.
 *
 * @param query - The search string (already trimmed by caller).
 * @param promotedProviderId - Provider ID to sort to the top (context promotion).
 * @returns Grouped results sorted with promoted provider first.
 */
export function searchAll(
  query: string,
  promotedProviderId?: string,
): readonly SearchResultGroup[] {
  if (query.length < 2) return [];

  const groups: SearchResultGroup[] = [];

  for (const [, provider] of providers) {
    const searchResult = provider.search(query);
    groups.push({
      providerId: provider.id,
      label: provider.label(),
      icon: provider.icon,
      results: searchResult.results,
      renderMode: provider.renderMode,
      showAllHref: provider.showAllHref(query),
      loading: searchResult.loading,
      totalCached: searchResult.totalCached,
      totalItems: searchResult.totalItems,
      totalResults: searchResult.totalResults,
      onviewall: provider.onviewall?.bind(provider),
      onresulttap: provider.onresulttap?.bind(provider),
    });
  }

  // Stable sort: promoted provider first, others in registration order.
  // Route-level override takes precedence over the AppShell-derived value.
  const effectivePromoted = promotedOverride ?? promotedProviderId;
  if (effectivePromoted !== undefined && effectivePromoted !== "") {
    groups.sort((a, b) => {
      if (a.providerId === effectivePromoted) return -1;
      if (b.providerId === effectivePromoted) return 1;
      return 0;
    });
  }

  return groups;
}

/** Returns the provider instance by ID (for rendering its ResultItem). */
export function getProvider(id: string): SearchProvider | undefined {
  return providers.get(id);
}

// -- Full search coordination ------------------------------------------------

interface FullSearchProviderState {
  readonly providerId: string;
  readonly label: string;
  status: "idle" | "searching" | "done";
  results: SearchResult[];
  searched: number;
  total: number;
}

let fullSearchStates = $state<FullSearchProviderState[]>([]);

/** True if at least one registered provider implements fullSearch(). */
export function hasFullSearch(): boolean {
  return [...providers.values()].some((p) => p.fullSearch !== undefined);
}

/** Get current full search state for all providers. */
export function getFullSearchStates(): readonly FullSearchProviderState[] {
  return fullSearchStates;
}

/**
 * Trigger full search across all providers that implement fullSearch().
 * Runs all providers in parallel. Each updates its own state progressively.
 */
export function runFullSearch(query: string): void {
  const providersWithFullSearch = [...providers.values()].filter(
    (p) => p.fullSearch !== undefined,
  );

  // Initialize per-provider state.
  fullSearchStates = providersWithFullSearch.map((p) => ({
    providerId: p.id,
    label: p.label(),
    status: "idle" as const,
    results: [],
    searched: 0,
    total: 0,
  }));

  // Run all in parallel (each provider manages its own API calls).
  for (const provider of providersWithFullSearch) {
    const state = fullSearchStates.find((s) => s.providerId === provider.id);
    if (!state || !provider.fullSearch) continue;
    state.status = "searching";
    void provider.fullSearch(query, state as FullSearchState).then(() => {
      state.status = "done";
    });
  }
}

/**
 * Reset full search state. Called when the search query changes
 * or when the search sheet closes.
 */
export function resetFullSearch(): void {
  fullSearchStates = [];
}
