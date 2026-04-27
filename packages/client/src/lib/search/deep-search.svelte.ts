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

export function createDeepSearch(options: DeepSearchOptions): DeepSearch {
  let phase = $state<"idle" | "fetching" | "content" | "done">("idle");
  let searchTerm = $state<string | null>(null);
  let pendingFromUrl = $state(false);

  const fsState = $derived(getFullSearchStateForProvider(options.providerId));
  const contentMatchIds = $derived(getContentMatchIds(options.providerId));
  const hasCapability = $derived(providerHasFullSearch(options.providerId));

  const status = $derived.by((): "idle" | "searching" | "done" => {
    if (phase === "fetching" || phase === "content") return "searching";
    if (phase === "done") return "done";
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

  async function doTrigger(): Promise<void> {
    if (phase !== "idle") return;
    const term = options.overlay.term ?? "";
    if (term.length < 2) return;

    searchTerm = term;

    // Fetch all remaining pages into the list view
    phase = "fetching";
    while (options.hasNextPage() && !options.isFetchingNextPage()) {
      await options.fetchNextPage();
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
