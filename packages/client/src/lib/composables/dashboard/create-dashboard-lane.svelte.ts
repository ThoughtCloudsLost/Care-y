/**
 * One dashboard ticket lane: a paged tickets.list query fetched with the
 * lane's superset params, narrowed on the client by the lane's rule and
 * the user's own filters, and counted from the facet index with the same
 * predicate, so the heading count and the list agree.
 *
 * The user's filters live in a filter store of the lane's own, loaded
 * from and saved to the encrypted dashboard filters document. The lane's
 * rule never enters that store (see dashboard-lanes.ts).
 */

import { untrack } from "svelte";
import { createInfiniteQuery, type QueryClient } from "@tanstack/svelte-query";
import type { DashboardLaneId, LaneFilterState } from "@care-y/shared";
import { ticketsKeys } from "$lib/query/keys.js";
import {
  createFilterStore,
  filterStore as ticketsFilterStore,
  type FilterStore,
} from "$lib/stores/filters.svelte.js";
import {
  dashboardFilters,
  emptyLaneFilterState,
} from "$lib/prefs/dashboard-filters.svelte.js";
import {
  computeFacets,
  countMatches,
  facetFiltersOf,
  matchesFilters,
  NO_FACET_FILTERS,
  type FacetBase,
  type FacetContext,
  type TicketFacets,
} from "$lib/tickets/facet-filters.js";
import {
  getLaneDefinition,
  laneSeeAllState,
  mergeLaneParams,
  type DashboardLaneDefinition,
  type LaneHiddenPill,
} from "$lib/tickets/dashboard-lanes.js";
import {
  ticketListQueryOptions,
  type FacetIndexData,
  type TicketListQueryOptions,
  type TicketListRow,
  type TicketRouter,
} from "$lib/tickets/queries.js";
import {
  createSectionFilterToggle,
  type SectionFilterToggle,
} from "./create-section-filter-toggle.svelte.js";

export interface DashboardLaneDeps {
  /** The signed-in user; undefined leaves the lane inert. */
  readonly currentUserId: () => string | undefined;
  readonly ticketRouter: TicketRouter;
  /** The page's one facet index; undefined until it lands. */
  readonly facetIndex: () => FacetIndexData | undefined;
  /** Read state, shared by every lane on the page. */
  readonly isUnread: (ticketId: string) => boolean;
  /**
   * Rows shown before "See all"; undefined when the lane shows every
   * loaded row and pages as its end nears (its own scroller in board
   * mode, or a lifted cap).
   */
  readonly cap: () => number | undefined;
  readonly queryClient: QueryClient;
  /** Opens the tickets page. The route owns navigation. */
  readonly openTickets: () => void;
}

export interface DashboardLane {
  readonly id: DashboardLaneId;
  /** The user's filters for this lane. */
  readonly filters: FilterStore;
  /** Filter controls the lane's rule already fixes. Empty while inert. */
  readonly hiddenPills: readonly LaneHiddenPill[];
  /** The lane's filter row: open state and visibility. */
  readonly filterToggle: SectionFilterToggle;
  /** Every loaded row, before narrowing. */
  readonly rows: readonly TicketListRow[];
  /** Loaded rows inside the lane's rule and the user's filters. */
  readonly items: readonly TicketListRow[];
  /** Items the capped list shows. */
  readonly shownCount: number;
  /**
   * Tickets in the lane under the user's filters, from the facet index.
   * Undefined until the index lands and while the lane is inert.
   */
  readonly count: number | undefined;
  /** True when `count` is a floor: the facet index stopped short. */
  readonly countIsFloor: boolean;
  /** Tickets in the lane ignoring the user's filters. */
  readonly baseCount: number | undefined;
  /**
   * Option counts for the lane's filter controls. Computed only while the
   * filter row shows (the options are needed); undefined otherwise.
   */
  readonly facets: TicketFacets | undefined;
  /** The first page is loading. */
  readonly loading: boolean;
  /** The lane has loaded, failed, or needs no request. */
  readonly settled: boolean;
  /** The last fetch's error, or null. Rows already loaded stay. */
  readonly error: unknown;
  /** Retry the failed fetch. */
  retry(): void;
  /** Fetch the next page when the list end nears (uncapped lanes). */
  loadMore(): void;
  /** Open the tickets page filtered to this lane plus the user's filters. */
  seeAll(): void;
  /** The user's filters, without sort and never the lane's rule. */
  userFilters(): LaneFilterState;
  /** Replace the user's filters, keeping the lane's sort. */
  applyUserFilters(state: LaneFilterState): void;
}

/** A lane's saved filters, or none. */
function savedLaneFilters(laneId: DashboardLaneId): LaneFilterState {
  const saved = Object.entries(dashboardFilters.value.lanes).find(
    ([id]) => id === laneId,
  );
  return saved?.[1] ?? emptyLaneFilterState();
}

/** A filter store's state without sort, which lanes fix. */
function laneFiltersOf(store: FilterStore): LaneFilterState {
  const state = store.captureState();
  return {
    statuses: state.statuses,
    queueIds: state.queueIds,
    priorities: state.priorities,
    assigneeId: state.assigneeId,
    dateFrom: state.dateFrom,
    dateTo: state.dateTo,
    unreadOnly: state.unreadOnly,
    needsAttentionOnly: state.needsAttentionOnly,
  };
}

export function createDashboardLane(
  laneId: DashboardLaneId,
  deps: DashboardLaneDeps,
): DashboardLane {
  const store = createFilterStore();
  // True once the saved filters are in the store, so the filter row's
  // first open state counts them.
  let savedFiltersApplied = $state(false);
  const filterToggle = createSectionFilterToggle(
    `${laneId}-filters`,
    () => store.activeCount,
    () => savedFiltersApplied,
  );

  function applyUserFilters(state: LaneFilterState): void {
    store.applyState({
      ...state,
      sortField: store.sort.field,
      sortDirection: store.sort.direction,
    });
  }

  const definition = $derived.by((): DashboardLaneDefinition | null => {
    const userId = deps.currentUserId();
    return userId === undefined ? null : getLaneDefinition(laneId, userId);
  });

  // Null when the lane sends no request: no user yet, or the user's
  // filters leave nothing inside the lane's rule.
  const params = $derived.by(() => {
    if (definition === null) return null;
    const merged = mergeLaneParams(definition.serverParams, store.serverParams);
    return merged.kind === "query" ? merged.params : null;
  });

  const query = createInfiniteQuery(
    (): TicketListQueryOptions => {
      if (params !== null) {
        return ticketListQueryOptions(deps.ticketRouter, params);
      }
      // A lane with nothing to fetch still needs an observer. Its own key
      // keeps it off every real list's cache entry.
      return {
        ...ticketListQueryOptions(deps.ticketRouter, store.serverParams),
        queryKey: ticketsKeys.list({ dashboardLane: laneId, idle: true }),
        enabled: false,
      };
    },
    () => deps.queryClient,
  );

  const rows = $derived(
    params === null ? [] : (query.data?.pages.flat() ?? []),
  );

  const facetFilters = $derived(facetFiltersOf(store));

  const ctx: FacetContext = $derived({
    currentUserId: deps.currentUserId(),
    isUnread: deps.isUnread,
  });

  const base = $derived.by((): FacetBase | undefined => {
    const lane = definition;
    if (lane === null) return undefined;
    const laneCtx = ctx;
    return (row) => lane.base(row, laneCtx);
  });

  const items = $derived.by(() => {
    const laneBase = base;
    if (laneBase === undefined) return [];
    return rows.filter((row) =>
      matchesFilters(row, facetFilters, ctx, undefined, laneBase),
    );
  });

  // Option counts take one pass per dimension over the whole index, so
  // they run only while the filter row shows. The heading count needs a
  // single pass and runs whenever the index is there.
  const optionsNeeded = $derived(filterToggle.shown);

  const facets = $derived.by(() => {
    if (!optionsNeeded) return undefined;
    const index = deps.facetIndex();
    if (index === undefined || base === undefined) return undefined;
    return computeFacets(index.rows, facetFilters, ctx, base);
  });

  const count = $derived.by(() => {
    if (facets !== undefined) return facets.total;
    const index = deps.facetIndex();
    if (index === undefined || base === undefined) return undefined;
    return countMatches(index.rows, facetFilters, ctx, base);
  });
  const countIsFloor = $derived(deps.facetIndex()?.complete === false);

  const baseCount = $derived.by(() => {
    const index = deps.facetIndex();
    if (index === undefined || base === undefined) return undefined;
    return countMatches(index.rows, NO_FACET_FILTERS, ctx, base);
  });

  const shownCount = $derived.by(() => {
    const cap = deps.cap();
    return cap === undefined ? items.length : Math.min(items.length, cap);
  });

  const loading = $derived(params !== null && query.isLoading);

  const settled = $derived(
    definition !== null &&
      (params === null || query.isSuccess || query.isError),
  );

  const error = $derived(params !== null && query.isError ? query.error : null);

  function canFetchNext(): boolean {
    return (
      params !== null &&
      query.hasNextPage &&
      !query.isFetching &&
      !query.isError
    );
  }

  // Sparse-page refill. A page can hold few rows inside the lane (the
  // client narrowing drops the rest), so fetch on until the cap fills,
  // the loaded rows reach the lane's count, the server runs out, or a
  // fetch fails. A filter change swaps the query key, which abandons
  // the old query and restarts the loop against the new one.
  $effect(() => {
    const target = deps.cap();
    if (target === undefined || !canFetchNext()) return;
    if (items.length >= target) return;
    // A floor count cannot prove the lane is exhausted and does not stop
    // the refill.
    if (count !== undefined && !countIsFloor && items.length >= count) return;
    void query.fetchNextPage();
  });

  // Saved filters apply once the document has loaded. `lastSaved` is the
  // state last read from or written to it, so applying it does not write
  // it straight back.
  let hydrated = false;
  let lastSaved = JSON.stringify(laneFiltersOf(store));

  $effect(() => {
    if (hydrated || !dashboardFilters.hydrated) return;
    hydrated = true;
    untrack(() => {
      applyUserFilters(savedLaneFilters(laneId));
      lastSaved = JSON.stringify(laneFiltersOf(store));
      savedFiltersApplied = true;
    });
  });

  // Changes before the document loads are written too: the document
  // keeps local changes over the stored copy, so they survive the load.
  $effect(() => {
    const current = laneFiltersOf(store);
    const serialized = JSON.stringify(current);
    if (serialized === lastSaved) return;
    lastSaved = serialized;
    untrack(() => {
      dashboardFilters.setLane(laneId, current);
    });
  });

  return {
    id: laneId,
    filters: store,
    get hiddenPills(): readonly LaneHiddenPill[] {
      return definition?.hiddenPills ?? [];
    },
    filterToggle,
    get rows(): readonly TicketListRow[] {
      return rows;
    },
    get items(): readonly TicketListRow[] {
      return items;
    },
    get shownCount(): number {
      return shownCount;
    },
    get count(): number | undefined {
      return count;
    },
    get countIsFloor(): boolean {
      return countIsFloor;
    },
    get baseCount(): number | undefined {
      return baseCount;
    },
    get facets(): TicketFacets | undefined {
      return facets;
    },
    get loading(): boolean {
      return loading;
    },
    get settled(): boolean {
      return settled;
    },
    get error(): unknown {
      return error;
    },
    retry(): void {
      if (params === null) return;
      if (query.isFetchNextPageError) void query.fetchNextPage();
      else void query.refetch();
    },
    loadMore(): void {
      if (canFetchNext()) void query.fetchNextPage();
    },
    seeAll(): void {
      const lane = definition;
      if (lane === null) return;
      ticketsFilterStore.applyState(
        laneSeeAllState(lane, laneFiltersOf(store), store.sort),
      );
      deps.openTickets();
    },
    userFilters(): LaneFilterState {
      return laneFiltersOf(store);
    },
    applyUserFilters,
  };
}
