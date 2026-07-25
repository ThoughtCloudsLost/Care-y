import { SvelteMap } from "svelte/reactivity";
import type {
  FullSearchState,
  SearchProvider,
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

  // Read fullSearchStates so this $derived re-evaluates when onProgress()
  // fires. Guarantees content match propagation even if SvelteSet reads
  // from async code don't trigger reactivity on their own.
  void fullSearchStates.length;

  const groups: SearchResultGroup[] = [];

  for (const [, provider] of providers) {
    const searchResult = provider.search(query);
    const fs = fullSearchStates.find((s) => s.providerId === provider.id);

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
      emptyText: provider.emptyText?.(query),
      coverageText: provider.coverage?.({
        searched: searchResult.totalCached,
        total: searchResult.totalItems,
        fullSearch: fs?.status,
        fsSearched: fs?.searched ?? 0,
        fsTotal: fs?.total ?? 0,
      }),
      // The calm escalation only offers itself before a full search has
      // run; while searching or after done the coverage line carries it.
      fetchMoreLabel:
        fs === undefined || fs.status === "idle"
          ? provider.fullSearchLabel?.(
              searchResult.totalCached,
              searchResult.totalItems,
            )
          : undefined,
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

export interface FullSearchProviderState {
  readonly providerId: string;
  readonly label: string;
  status: "idle" | "searching" | "done";
  searched: number;
  total: number;
  matchCount: number;
}

// Immutable array reassignment after every async mutation ensures
// $derived consumers in other modules re-evaluate.
let fullSearchStates = $state<FullSearchProviderState[]>([]);

// -- Run identity -------------------------------------------------------------
//
// A full search is a long chain of awaits. Without run identity, an
// abandoned run (the user retyped, or the sheet closed and reopened) keeps
// resolving and writes its progress and its "done" over the run the user is
// actually waiting on, which then reports finished with the old counts.
//
// Every run takes a generation number. Writes check it first and drop
// themselves if a newer run has started. The paired AbortSignal is the other
// half: the generation stops stale writes, the signal stops the stale work
// and the provider-side mutation that produced it.
const runGenerations = new SvelteMap<string, number>();
const runControllers = new SvelteMap<string, AbortController>();

/** Claim run identity for a provider, aborting whatever it was doing. */
function beginRun(providerId: string): {
  generation: number;
  signal: AbortSignal;
} {
  const generation = bumpGeneration(providerId);
  const controller = new AbortController();
  runControllers.set(providerId, controller);
  return { generation, signal: controller.signal };
}

/** Abort the provider's current run and invalidate its pending writes. */
function bumpGeneration(providerId: string): number {
  runControllers.get(providerId)?.abort();
  runControllers.delete(providerId);
  const generation = (runGenerations.get(providerId) ?? 0) + 1;
  runGenerations.set(providerId, generation);
  return generation;
}

/** False once a newer run has claimed this provider. */
function isCurrentRun(providerId: string, generation: number): boolean {
  return runGenerations.get(providerId) === generation;
}

/**
 * Wire a provider's run to the registry: progress and completion writes are
 * gated on run identity, so an abandoned run cannot report over a live one.
 */
function startProviderRun(
  provider: SearchProvider,
  query: string,
  state: FullSearchState,
): void {
  if (!provider.fullSearch) return;

  const { generation, signal } = beginRun(provider.id);
  const onProgress = (): void => {
    if (!isCurrentRun(provider.id, generation)) return;
    updateProviderState(provider.id, state);
  };

  void provider.fullSearch(query, state, onProgress, signal).then(() => {
    if (!isCurrentRun(provider.id, generation)) return;
    state.status = "done";
    updateProviderState(provider.id, state);
  });
}

function updateProviderState(providerId: string, state: FullSearchState): void {
  fullSearchStates = fullSearchStates.map((s) =>
    s.providerId === providerId
      ? {
          ...s,
          status: state.status,
          searched: state.searched,
          total: state.total,
          matchCount: state.matchCount,
        }
      : s,
  );
}

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
 * Runs all providers in parallel. Each updates its own state progressively
 * via the onProgress callback, which does immutable array reassignment.
 */
export function runFullSearch(query: string): void {
  const providersWithFullSearch = [...providers.values()].filter(
    (p) => p.fullSearch !== undefined,
  );

  fullSearchStates = providersWithFullSearch.map((p) => ({
    providerId: p.id,
    label: p.label(),
    status: "searching" as const,
    searched: 0,
    total: 0,
    matchCount: 0,
  }));

  for (const provider of providersWithFullSearch) {
    startProviderRun(provider, query, {
      status: "searching",
      searched: 0,
      total: 0,
      matchCount: 0,
    });
  }
}

/** True if a specific provider implements fullSearch(). */
export function providerHasFullSearch(providerId: string): boolean {
  const provider = providers.get(providerId);
  return provider?.fullSearch !== undefined;
}

/** Get full search state for a specific provider. */
export function getFullSearchStateForProvider(
  providerId: string,
): FullSearchProviderState | undefined {
  return fullSearchStates.find((s) => s.providerId === providerId);
}

/** Content match IDs from a provider's fullSearch (reactive SvelteSet). */
export function getContentMatchIds(
  providerId: string,
): ReadonlySet<string> | undefined {
  return providers.get(providerId)?.getContentMatchIds?.();
}

/** Trigger full search for a single provider. */
export function runFullSearchForProvider(
  providerId: string,
  query: string,
): void {
  const provider = providers.get(providerId);
  if (!provider?.fullSearch) return;

  const existing = fullSearchStates.find((s) => s.providerId === providerId);
  if (existing?.status === "searching") return;

  const state: FullSearchState = {
    status: "searching",
    searched: 0,
    total: 0,
    matchCount: 0,
  };

  if (!existing) {
    fullSearchStates = [
      ...fullSearchStates,
      {
        providerId: provider.id,
        label: provider.label(),
        ...state,
      },
    ];
  } else {
    updateProviderState(providerId, state);
  }

  startProviderRun(provider, query, state);
}

/**
 * Reset full search state. Called when the search query changes
 * or when the search sheet closes.
 */
export function resetFullSearch(): void {
  fullSearchStates = [];
  for (const [, provider] of providers) {
    // Bump before reset(): a run still in flight would otherwise repopulate
    // the content-match set the reset just cleared.
    bumpGeneration(provider.id);
    provider.reset?.();
  }
}

/** Reset full search state for a single provider. */
export function resetFullSearchForProvider(providerId: string): void {
  fullSearchStates = fullSearchStates.filter(
    (s) => s.providerId !== providerId,
  );
  bumpGeneration(providerId);
  providers.get(providerId)?.reset?.();
}
