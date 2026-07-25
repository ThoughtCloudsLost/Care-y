import {
  getFullSearchStateForProvider,
  getContentMatchIds,
  providerHasFullSearch,
  runFullSearchForProvider,
  resetFullSearchForProvider,
} from "./registry.svelte.js";
import type { SearchOverlay } from "./search-overlay.svelte.js";

export interface DeepSearchOptions {
  /** The page's search overlay composable. */
  overlay: SearchOverlay;
  /** Registry provider ID (e.g., "tickets", "kb"). */
  providerId: string;
  /** Reactive getter: does the infinite query have more pages? */
  hasNextPage: () => boolean;
  /** Reactive getter: is the infinite query currently fetching the next page? */
  isFetchingNextPage: () => boolean;
  /** Fetch the next page of the infinite query. */
  fetchNextPage: () => Promise<unknown>;
  /** Reactive getter: is the initial query still loading? */
  isInitialLoading: () => boolean;
  /** Reactive getter: current number of loaded items (for progress display). */
  loadedCount: () => number;
  /** Reactive getter: number of search matches from decrypted data (for auto-trigger). */
  matchCount: () => number;
}

export interface DeepSearch {
  /** Mapped status for SearchNavigator props. */
  readonly status: "idle" | "searching" | "done";
  /** Progress: items processed so far. */
  readonly searched: number;
  /** Progress: total items to process. */
  readonly total: number;
  /** True when deep search can be triggered (provider supports it and not already running). */
  readonly canTrigger: boolean;
  /** Content match IDs from the provider's fullSearch (reactive SvelteSet). */
  readonly contentMatchIds: ReadonlySet<string> | undefined;
  /** Trigger deep search (fetch all pages + content search). */
  trigger: () => void;
  /** Schedule deep search after initial data load (call from URL param handler). */
  scheduleFromNavigation: () => void;
}

/** Poll interval while waiting out a page fetch the list view already started. */
const FETCH_POLL_MS = 16;

export function createDeepSearch(options: DeepSearchOptions): DeepSearch {
  let phase = $state<"idle" | "fetching" | "content" | "done" | "error">(
    "idle",
  );
  let searchTerm = $state<string | null>(null);
  let pendingFromUrl = $state(false);

  const fsState = $derived(getFullSearchStateForProvider(options.providerId));
  const contentMatchIds = $derived(getContentMatchIds(options.providerId));
  const hasCapability = $derived(providerHasFullSearch(options.providerId));

  const status = $derived.by((): "idle" | "searching" | "done" => {
    if (phase === "fetching" || phase === "content") return "searching";
    // "error" reports as done because it is terminal, not because it
    // succeeded. Reporting idle instead would re-arm the zero-match
    // auto-trigger below and retry the failing fetch in a loop.
    if (phase === "done" || phase === "error") return "done";
    return "idle";
  });

  const searched = $derived.by((): number => {
    if (phase === "fetching") return options.loadedCount();
    if (phase === "content") return fsState?.searched ?? 0;
    if (phase === "done") return fsState?.total ?? 0;
    return 0;
  });

  const total = $derived.by((): number => {
    if (phase === "fetching") return options.loadedCount();
    if (phase === "content" || phase === "done") return fsState?.total ?? 0;
    return 0;
  });

  const canTrigger = $derived(hasCapability && phase === "idle");

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
    if (phase !== "idle") return;
    const term = options.overlay.term ?? "";
    if (term.length < 2) return;

    searchTerm = term;

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
        if ((phase as string) !== "fetching") return;
        continue;
      }
      try {
        await options.fetchNextPage();
      } catch {
        // Stop here rather than matching over a partial page set. Terminal,
        // so the run does not silently present itself as complete coverage.
        phase = "error";
        return;
      }
      if ((phase as string) !== "fetching") return;
    }

    // Content search (skip if search sheet already completed it)
    if (fsState?.status === "done") {
      phase = "done";
    } else {
      phase = "content";
      runFullSearchForProvider(options.providerId, term);
    }
  }

  // Transition to done when content search completes
  $effect(() => {
    if (phase === "content" && fsState?.status === "done") {
      phase = "done";
    }
  });

  // Reset when term changes or overlay closes during/after deep search
  $effect(() => {
    if (searchTerm == null) return;
    if (!options.overlay.active || options.overlay.term !== searchTerm) {
      phase = "idle";
      resetFullSearchForProvider(options.providerId);
      searchTerm = null;
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

  // "Show all" navigation: trigger after initial data load
  $effect(() => {
    if (pendingFromUrl && !options.isInitialLoading() && phase === "idle") {
      pendingFromUrl = false;
      void doTrigger();
    }
  });

  return {
    get status(): "idle" | "searching" | "done" {
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
      return contentMatchIds;
    },
    trigger(): void {
      void doTrigger();
    },
    scheduleFromNavigation(): void {
      pendingFromUrl = true;
    },
  };
}
