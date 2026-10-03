import { untrack } from "svelte";
import {
  getFullSearchStateForProvider,
  getContentMatchIds,
  providerHasFullSearch,
  runFullSearchForProvider,
  resetFullSearchForProvider,
} from "./registry.svelte.js";
import type { SearchOverlay } from "./search-overlay.svelte.js";

/** Deep search status as SearchNavigator renders it. */
export type DeepSearchStatus = "idle" | "searching" | "done" | "incomplete";

export interface DeepSearchOptions {
  /** The page's search overlay composable. */
  overlay: SearchOverlay;
  /** Registry provider ID (e.g., "tickets", "kb"). */
  providerId: string;
  /** Reactive getter: does the infinite query have more pages? */
  hasNextPage: () => boolean;
  /** Reactive getter: is the infinite query currently fetching the next page? */
  isFetchingNextPage: () => boolean;
  /**
   * Fetch the next page. TanStack resolves (does not reject) on a failed
   * page unless called with throwOnError, so the resolved result's
   * isFetchNextPageError is how a failure is seen.
   */
  fetchNextPage: () => Promise<{ readonly isFetchNextPageError: boolean }>;
  /** Reactive getter: is the initial query still loading? */
  isInitialLoading: () => boolean;
  /** Reactive getter: current number of loaded items (for progress display). */
  loadedCount: () => number;
  /**
   * Reactive getter: size of the full dataset when the server reports it,
   * used for the stopped-run coverage line.
   */
  totalCount: () => number | undefined;
  /** Reactive getter: number of search matches from decrypted data (for auto-trigger). */
  matchCount: () => number;
  /**
   * Reactive getter for the provider-specific filter scope of a run. Read
   * when the run starts and handed to the provider's fullSearch; a change to
   * it reruns a started run over the new scope. Omit on a surface with no
   * filters.
   */
  fullSearchScope?: () => unknown;
}

export interface DeepSearch {
  /** Mapped status for SearchNavigator props. */
  readonly status: DeepSearchStatus;
  /** Progress: items processed so far. */
  readonly searched: number;
  /** Progress: total items to process. */
  readonly total: number;
  /** True when deep search can be triggered (provider supports it and not already running). */
  readonly canTrigger: boolean;
  /**
   * Content match IDs from the provider's fullSearch, plus matches carried
   * over from a run a filter change replaced, until the new run is done.
   */
  readonly contentMatchIds: ReadonlySet<string> | undefined;
  /** Trigger deep search (fetch all pages + content search). */
  trigger: () => void;
  /** Schedule deep search after initial data load (call from URL param handler). */
  scheduleFromNavigation: () => void;
  /**
   * Retry a stopped (incomplete) run: resets the provider's full search and
   * triggers again.
   */
  retry: () => void;
}

/** Poll interval while waiting out a page fetch the list view already started. */
const FETCH_POLL_MS = 16;

/** Empty carried-match set; shared so clearing allocates nothing. */
const NO_MATCHES: ReadonlySet<string> = new Set();

export function createDeepSearch(options: DeepSearchOptions): DeepSearch {
  let phase = $state<"idle" | "fetching" | "content" | "done" | "error">(
    "idle",
  );
  let searchTerm = $state<string | null>(null);
  let pendingTrigger = $state(false);
  // Snapshot of the last live counts when a run stops, so the incomplete
  // line reports how far it got.
  let stoppedSearched = $state(0);
  let stoppedTotal = $state(0);
  // The scope the current run started with: the key detects a change, the
  // value is what the provider run was handed.
  let runScopeKey = $state<string | null>(null);
  let runScope: unknown = undefined;
  // Bumped whenever a run is started or abandoned, so a page loop left
  // behind by a rerun stops at its next await instead of running beside it.
  let runToken = 0;
  // Content matches from a run a filter change replaced. They stay on
  // screen under the new run's progress until that run is done.
  let carriedMatchIds = $state.raw<ReadonlySet<string>>(NO_MATCHES);

  const fsState = $derived(getFullSearchStateForProvider(options.providerId));
  const contentMatchIds = $derived(getContentMatchIds(options.providerId));
  const visibleMatchIds = $derived.by((): ReadonlySet<string> | undefined => {
    if (carriedMatchIds.size === 0) return contentMatchIds;
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- immutable snapshot, rebuilt by the derived, never mutated
    return new Set([...carriedMatchIds, ...(contentMatchIds ?? [])]);
  });
  const hasCapability = $derived(providerHasFullSearch(options.providerId));

  const status = $derived.by((): DeepSearchStatus => {
    if (phase === "fetching" || phase === "content") return "searching";
    if (phase === "done") return "done";
    // "error" is terminal and reports as incomplete. Reporting idle instead
    // would re-arm the zero-match auto-trigger below and retry the failing
    // run in a loop; reporting done would claim a sweep that never finished.
    if (phase === "error") return "incomplete";
    return "idle";
  });

  const searched = $derived.by((): number => {
    if (phase === "fetching") return options.loadedCount();
    if (phase === "content") return fsState?.searched ?? 0;
    if (phase === "done") return fsState?.total ?? 0;
    if (phase === "error") return stoppedSearched;
    return 0;
  });

  const total = $derived.by((): number => {
    if (phase === "fetching") return options.loadedCount();
    if (phase === "content" || phase === "done") return fsState?.total ?? 0;
    if (phase === "error") return stoppedTotal;
    return 0;
  });

  const canTrigger = $derived(hasCapability && phase === "idle");

  function stop(searchedAtStop: number, totalAtStop: number): void {
    stoppedSearched = searchedAtStop;
    stoppedTotal = totalAtStop;
    phase = "error";
  }

  function stopAfterFailedFetch(): void {
    stop(options.loadedCount(), options.totalCount() ?? options.loadedCount());
  }

  function currentScopeKey(): string {
    return JSON.stringify(options.fullSearchScope?.() ?? null);
  }

  function finishRun(): void {
    phase = "done";
    carriedMatchIds = NO_MATCHES;
  }

  /**
   * Resolve once no page fetch is in flight. Also gives up if the run was
   * abandoned mid-wait (term changed, overlay closed), so a stale trigger
   * cannot keep polling after its phase was reset.
   */
  async function waitOutInFlightFetch(): Promise<void> {
    while (options.isFetchingNextPage() && (phase as string) === "fetching") {
      await new Promise<void>((resolve) => setTimeout(resolve, FETCH_POLL_MS));
    }
  }

  async function doTrigger(): Promise<void> {
    // Any start consumes a pending trigger. A scope rerun sets the flag, but
    // on the zero-match path the auto-trigger starts the run first; a flag
    // left set would start an unprompted run for the next term.
    pendingTrigger = false;
    if (phase !== "idle") return;
    const term = options.overlay.term ?? "";
    if (term.length < 2) return;
    const run = ++runToken;
    const superseded = (): boolean => run !== runToken;

    searchTerm = term;
    runScope = options.fullSearchScope?.();
    runScopeKey = JSON.stringify(runScope ?? null);

    // Fetch all remaining pages into the list view.
    //
    // A fetch is often already in flight when we get here (the list view's
    // own scroll handler, or the initial page). Waiting it out is the whole
    // point: bailing on isFetchingNextPage left the remaining pages
    // unfetched and ran the content phase over partial data, which reads to
    // the user as "we searched everything and found nothing".
    phase = "fetching";
    while (options.hasNextPage()) {
      if (options.isFetchingNextPage()) {
        await waitOutInFlightFetch();
        if (superseded() || (phase as string) !== "fetching") return;
        continue;
      }
      let result: { readonly isFetchNextPageError: boolean };
      try {
        result = await options.fetchNextPage();
      } catch {
        // Only a run still fetching may record the failure; an abandoned
        // run (term changed, overlay closed) has already been reset.
        if (!superseded() && (phase as string) === "fetching") {
          stopAfterFailedFetch();
        }
        return;
      }
      if (superseded() || (phase as string) !== "fetching") return;
      if (result.isFetchNextPageError) {
        // Stop here rather than matching over a partial page set. Terminal,
        // so the run never presents itself as complete coverage.
        stopAfterFailedFetch();
        return;
      }
    }

    // Content search (skip if search sheet already completed it)
    if (fsState?.status === "done") {
      finishRun();
    } else {
      phase = "content";
      runFullSearchForProvider(options.providerId, term, runScope);
    }
  }

  // Settle the content phase when the provider's run completes or stops.
  $effect(() => {
    if (phase !== "content") return;
    if (fsState?.status === "done") {
      finishRun();
    } else if (fsState?.status === "incomplete") {
      stop(fsState.searched, fsState.total);
    }
  });

  function retryStoppedRun(): void {
    if (phase !== "error") return;
    resetFullSearchForProvider(options.providerId);
    phase = "idle";
    void doTrigger();
  }

  function rerunForScopeChange(): void {
    // Snapshot before the reset clears the provider's set.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- immutable snapshot; reactivity comes from reassigning the state
    carriedMatchIds = new Set([...carriedMatchIds, ...(contentMatchIds ?? [])]);
    runToken++;
    resetFullSearchForProvider(options.providerId);
    phase = "idle";
    runScopeKey = null;
    pendingTrigger = true;
  }

  // A run covers the filter scope it started with. When the scope changes
  // while a run is searching, done or stopped, rerun over the new scope:
  // a done marker left over the old scope would claim items the run never
  // searched. Clearing all filters is one case of this.
  $effect(() => {
    const key = currentScopeKey();
    untrack(() => {
      if (runScopeKey === null || phase === "idle") return;
      if (key !== runScopeKey) rerunForScopeChange();
    });
  });

  // Reset when term changes or overlay closes during/after deep search
  $effect(() => {
    if (searchTerm == null) return;
    if (!options.overlay.active || options.overlay.term !== searchTerm) {
      phase = "idle";
      resetFullSearchForProvider(options.providerId);
      searchTerm = null;
      runScopeKey = null;
      runToken++;
      carriedMatchIds = NO_MATCHES;
    }
  });

  // Auto-trigger when 0 matches in decrypted data
  $effect(() => {
    if (
      options.overlay.active &&
      options.overlay.term != null &&
      options.overlay.term.length >= 2 &&
      options.matchCount() === 0 &&
      phase === "idle" &&
      !options.isInitialLoading()
    ) {
      void doTrigger();
    }
  });

  // Pending trigger ("Show all" navigation, or a rerun after a filter
  // change): run once the initial data has loaded.
  $effect(() => {
    if (pendingTrigger && !options.isInitialLoading() && phase === "idle") {
      pendingTrigger = false;
      void doTrigger();
    }
  });

  return {
    get status(): DeepSearchStatus {
      return status;
    },
    get searched(): number {
      return searched;
    },
    get total(): number {
      return total;
    },
    get canTrigger(): boolean {
      return canTrigger;
    },
    get contentMatchIds(): ReadonlySet<string> | undefined {
      return visibleMatchIds;
    },
    trigger(): void {
      void doTrigger();
    },
    scheduleFromNavigation(): void {
      pendingTrigger = true;
    },
    retry(): void {
      retryStoppedRun();
    },
  };
}
