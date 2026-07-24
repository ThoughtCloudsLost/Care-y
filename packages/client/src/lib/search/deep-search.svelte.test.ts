// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, type Mock } from "vitest";
import { flushSync } from "svelte";
import { cleanup } from "@testing-library/svelte";
import { createDeepSearch, type DeepSearch } from "./deep-search.svelte.js";
import {
  createSearchOverlay,
  type SearchOverlay,
} from "./search-overlay.svelte.js";
import {
  registerSearchProvider,
  resetFullSearch,
  getFullSearchStateForProvider,
  runFullSearchForProvider,
} from "./registry.svelte.js";
import type { SearchProvider, FullSearchState } from "./types.js";

// Effect roots and provider registrations created per test, torn down LIFO.
const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length > 0) {
    cleanups.pop()?.();
  }
  resetFullSearch();
  cleanup();
});

/** Wait for scheduled microtasks and flush any pending effects. */
async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  flushSync();
}

/** A single in-flight fullSearch call, controllable from the test. */
interface ProviderRun {
  readonly query: string;
  /** Mutate progress fields and notify the registry. */
  progress: (
    patch: Partial<Pick<FullSearchState, "searched" | "total" | "matchCount">>,
  ) => void;
  /** Apply a final patch, notify, and resolve the fullSearch promise. */
  finish: (
    patch?: Partial<Pick<FullSearchState, "searched" | "total" | "matchCount">>,
  ) => void;
}

interface ProviderHandle {
  readonly runs: ProviderRun[];
  readonly contentMatchIds: Set<string>;
  readonly reset: Mock<() => void>;
  readonly unregister: () => void;
}

/**
 * Register a provider whose fullSearch resolution is driven by the test.
 * Local to this file: the run handles are coupled to these assertions.
 */
function registerFullSearchProvider(id = "tickets"): ProviderHandle {
  const contentMatchIds = new Set<string>();
  const reset = vi.fn<() => void>();
  const runs: ProviderRun[] = [];

  const provider: SearchProvider = {
    id,
    label: () => id,
    icon: null as never, // Not rendered in these tests
    renderMode: "list",
    showAllHref: (query: string) => `/${id}?q=${query}`,
    getResultHref: (resultId: string) => `/${id}/${resultId}`,
    search: () => ({ results: [], loading: false, totalCached: 0 }),
    ResultItem: null as never, // Not rendered in these tests
    fullSearch: (
      query: string,
      state: FullSearchState,
      onProgress: () => void,
    ) =>
      new Promise<void>((resolve) => {
        runs.push({
          query,
          progress(patch) {
            Object.assign(state, patch);
            onProgress();
          },
          finish(patch = {}) {
            Object.assign(state, patch);
            onProgress();
            resolve();
          },
        });
      }),
    getContentMatchIds: () => contentMatchIds,
    reset,
  };

  const unregister = registerSearchProvider(provider);
  cleanups.push(unregister);
  return { runs, contentMatchIds, reset, unregister };
}

/** Register a provider without fullSearch support. */
function registerPlainProvider(id = "tickets"): void {
  const provider: SearchProvider = {
    id,
    label: () => id,
    icon: null as never, // Not rendered in these tests
    renderMode: "list",
    showAllHref: (query: string) => `/${id}?q=${query}`,
    getResultHref: (resultId: string) => `/${id}/${resultId}`,
    search: () => ({ results: [], loading: false, totalCached: 0 }),
    ResultItem: null as never, // Not rendered in these tests
  };
  cleanups.push(registerSearchProvider(provider));
}

interface HarnessOptions {
  providerId?: string;
  hasNext?: boolean;
  initialLoading?: boolean;
  loaded?: number;
  /** Local (already decrypted) match count. Non-zero blocks auto-trigger. */
  localMatchCount?: number;
}

interface Harness {
  ds: DeepSearch;
  overlay: SearchOverlay;
  fetchNextPage: Mock<() => Promise<unknown>>;
  /** Resolve the oldest pending page fetch, mutating state first if given. */
  resolveNextFetch: (beforeResolve?: () => void) => void;
  setHasNext: (value: boolean) => void;
  setInitialLoading: (value: boolean) => void;
  setLoaded: (count: number) => void;
  destroy: () => void;
}

/**
 * Build a deep search wired to a real search overlay, mirroring how the
 * tickets and library pages compose the two. Query getters are backed by
 * local $state so the deep search effects react to changes.
 */
function createHarness(options: HarnessOptions = {}): Harness {
  let hasNext = $state(options.hasNext ?? false);
  let initialLoading = $state(options.initialLoading ?? false);
  let loaded = $state(options.loaded ?? 0);
  // Never changes mid-test, so plain (non-reactive) is sufficient.
  const localMatchCount = options.localMatchCount ?? 5;

  const pendingFetches: Array<() => void> = [];
  const fetchNextPage = vi.fn(
    (): Promise<unknown> =>
      new Promise<void>((resolve) => {
        pendingFetches.push(resolve);
      }),
  );

  let overlay!: SearchOverlay;
  let ds!: DeepSearch;
  const destroyRoot = $effect.root(() => {
    overlay = createSearchOverlay({
      matches: () => [],
      getElementId: (id) => id,
      scrollContainer: () => undefined,
      onscroll: () => undefined,
    });
    ds = createDeepSearch({
      overlay,
      providerId: options.providerId ?? "tickets",
      hasNextPage: () => hasNext,
      isFetchingNextPage: () => false,
      fetchNextPage,
      isInitialLoading: () => initialLoading,
      loadedCount: () => loaded,
      matchCount: () => localMatchCount,
    });
  });
  // Idempotent: tests may destroy early, afterEach destroys again.
  let destroyed = false;
  const destroy = (): void => {
    if (destroyed) return;
    destroyed = true;
    destroyRoot();
  };
  cleanups.push(destroy);
  flushSync();

  return {
    ds,
    overlay,
    fetchNextPage,
    resolveNextFetch(beforeResolve) {
      const resolve = pendingFetches.shift();
      if (resolve === undefined) {
        throw new Error("no pending fetchNextPage call to resolve");
      }
      beforeResolve?.();
      resolve();
    },
    setHasNext(value) {
      hasNext = value;
    },
    setInitialLoading(value) {
      initialLoading = value;
    },
    setLoaded(count) {
      loaded = count;
    },
    destroy,
  };
}

describe("createDeepSearch", () => {
  describe("initial state and capability", () => {
    it("starts idle with zero progress and no capability when no provider is registered", () => {
      const h = createHarness();
      expect(h.ds.status).toBe("idle");
      expect(h.ds.searched).toBe(0);
      expect(h.ds.total).toBe(0);
      expect(h.ds.canTrigger).toBe(false);
      expect(h.ds.contentMatchIds).toBeUndefined();
    });

    it("exposes canTrigger and the provider content match set when the provider supports full search", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness();
      await settle();
      expect(h.ds.canTrigger).toBe(true);
      expect(h.ds.contentMatchIds).toBe(p.contentMatchIds);
    });

    it("drops canTrigger and contentMatchIds when the provider unregisters", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness();
      await settle();
      expect(h.ds.canTrigger).toBe(true);

      p.unregister();
      await settle();
      expect(h.ds.canTrigger).toBe(false);
      expect(h.ds.contentMatchIds).toBeUndefined();
    });

    it("does not offer canTrigger for a provider without full search support", async () => {
      registerPlainProvider();
      const h = createHarness();
      await settle();
      expect(h.ds.canTrigger).toBe(false);
      expect(h.ds.contentMatchIds).toBeUndefined();
    });
  });

  describe("trigger guards", () => {
    it("does nothing when the overlay is closed", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness({ hasNext: true });

      h.ds.trigger();
      await settle();

      expect(h.ds.status).toBe("idle");
      expect(h.fetchNextPage).not.toHaveBeenCalled();
      expect(p.runs).toHaveLength(0);
    });

    it("does nothing for a term shorter than two characters", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness({ hasNext: true });

      h.overlay.enter("h");
      await settle();
      h.ds.trigger();
      await settle();

      expect(h.ds.status).toBe("idle");
      expect(h.fetchNextPage).not.toHaveBeenCalled();
      expect(p.runs).toHaveLength(0);
    });

    it("ignores a second trigger while a search is already running", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness({ hasNext: true });

      h.overlay.enter("harbor");
      await settle();
      h.ds.trigger();
      expect(h.fetchNextPage).toHaveBeenCalledTimes(1);
      expect(h.ds.canTrigger).toBe(false);

      h.ds.trigger();
      await settle();
      expect(h.fetchNextPage).toHaveBeenCalledTimes(1);

      h.resolveNextFetch(() => {
        h.setHasNext(false);
      });
      await settle();
      expect(p.runs).toHaveLength(1);
    });
  });

  describe("page fetching and content search", () => {
    it("fetches pages until none remain, then runs the provider content search with the entered term", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness({ hasNext: true, loaded: 20 });

      h.overlay.enter("harbor");
      await settle();
      h.ds.trigger();

      // While pages stream in, progress mirrors the loaded item count.
      expect(h.ds.status).toBe("searching");
      expect(h.fetchNextPage).toHaveBeenCalledTimes(1);
      expect(h.ds.searched).toBe(20);
      expect(h.ds.total).toBe(20);

      h.setLoaded(40);
      h.resolveNextFetch();
      await settle();
      expect(h.fetchNextPage).toHaveBeenCalledTimes(2);
      expect(h.ds.searched).toBe(40);

      h.setLoaded(60);
      h.resolveNextFetch(() => {
        h.setHasNext(false);
      });
      await settle();

      expect(p.runs).toHaveLength(1);
      expect(p.runs[0]?.query).toBe("harbor");
      expect(h.ds.status).toBe("searching");
    });

    it("reports provider progress during the content search and settles to done", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness();

      h.overlay.enter("harbor");
      await settle();
      h.ds.trigger();
      await settle();
      expect(p.runs).toHaveLength(1);
      expect(h.ds.status).toBe("searching");

      p.runs[0]?.progress({ searched: 30, total: 90, matchCount: 2 });
      await settle();
      expect(h.ds.searched).toBe(30);
      expect(h.ds.total).toBe(90);

      p.runs[0]?.finish({ searched: 90, matchCount: 5 });
      await settle();
      expect(h.ds.status).toBe("done");
      expect(h.ds.searched).toBe(90);
      expect(h.ds.total).toBe(90);
    });

    it("skips the content phase when the provider full search already completed", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness();

      // The search sheet already ran this provider's full search to done.
      runFullSearchForProvider("tickets", "harbor");
      await settle();
      p.runs[0]?.finish({ searched: 12, total: 12, matchCount: 3 });
      await settle();

      h.overlay.enter("harbor");
      await settle();
      h.ds.trigger();
      await settle();

      expect(p.runs).toHaveLength(1); // no second provider search
      expect(h.ds.status).toBe("done");
      expect(h.ds.searched).toBe(12);
      expect(h.ds.total).toBe(12);
    });
  });

  describe("stale search handling", () => {
    it("aborts an in-flight page fetch run when the term changes, never starting the stale content search", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness({ hasNext: true });

      h.overlay.enter("alpha");
      await settle();
      h.ds.trigger();
      expect(h.fetchNextPage).toHaveBeenCalledTimes(1);

      // Term changes while the page fetch is still in flight.
      h.overlay.setTerm("beta");
      await settle();
      expect(h.ds.status).toBe("idle");
      expect(p.reset).toHaveBeenCalledTimes(1);

      // The stale fetch resolving later must not continue the old run.
      h.resolveNextFetch();
      await settle();
      expect(p.runs).toHaveLength(0);
      expect(h.fetchNextPage).toHaveBeenCalledTimes(1);
      expect(h.ds.status).toBe("idle");
      expect(h.ds.canTrigger).toBe(true);
    });

    it("aborts an in-flight page fetch run when the overlay closes", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness({ hasNext: true });

      h.overlay.enter("alpha");
      await settle();
      h.ds.trigger();
      expect(h.fetchNextPage).toHaveBeenCalledTimes(1);

      h.overlay.exit();
      await settle();
      expect(h.ds.status).toBe("idle");

      h.resolveNextFetch();
      await settle();
      expect(p.runs).toHaveLength(0);
      expect(h.fetchNextPage).toHaveBeenCalledTimes(1);
      expect(h.ds.status).toBe("idle");
    });

    it("ignores a stale provider completion that resolves after the search was reset", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness();

      h.overlay.enter("alpha");
      await settle();
      h.ds.trigger();
      await settle();
      expect(p.runs).toHaveLength(1);

      // Reset (term change) while the provider is still resolving.
      h.overlay.setTerm("beta");
      await settle();
      expect(h.ds.status).toBe("idle");

      // The slow stale run resolves afterwards. It must not flip status
      // or resurrect progress state for the abandoned term.
      p.runs[0]?.finish({ searched: 100, total: 100, matchCount: 9 });
      await settle();
      expect(h.ds.status).toBe("idle");
      expect(h.ds.searched).toBe(0);
      expect(h.ds.total).toBe(0);
      expect(getFullSearchStateForProvider("tickets")).toBeUndefined();
    });

    it("keeps per-provider progress isolated when providers resolve out of order", async () => {
      const slow = registerFullSearchProvider("tickets");
      const fast = registerFullSearchProvider("kb");
      const slowHarness = createHarness({ providerId: "tickets" });
      const fastHarness = createHarness({ providerId: "kb" });

      slowHarness.overlay.enter("harbor");
      fastHarness.overlay.enter("harbor");
      await settle();
      slowHarness.ds.trigger();
      fastHarness.ds.trigger();
      await settle();

      slow.runs[0]?.progress({ searched: 10, total: 50 });
      fast.runs[0]?.finish({ searched: 3, total: 3, matchCount: 1 });
      await settle();

      // The fast provider finishing must not finish or overwrite the slow one.
      expect(fastHarness.ds.status).toBe("done");
      expect(fastHarness.ds.searched).toBe(3);
      expect(slowHarness.ds.status).toBe("searching");
      expect(slowHarness.ds.searched).toBe(10);
      expect(slowHarness.ds.total).toBe(50);

      slow.runs[0]?.finish({ searched: 50, matchCount: 2 });
      await settle();
      expect(slowHarness.ds.status).toBe("done");
      expect(slowHarness.ds.total).toBe(50);
    });
  });

  describe("reset and re-trigger", () => {
    it("resets to idle and clears registry state when the overlay closes after done", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness();

      h.overlay.enter("harbor");
      await settle();
      h.ds.trigger();
      await settle();
      p.runs[0]?.finish({ searched: 8, total: 8, matchCount: 1 });
      await settle();
      expect(h.ds.status).toBe("done");

      h.overlay.exit();
      await settle();
      expect(h.ds.status).toBe("idle");
      expect(h.ds.searched).toBe(0);
      expect(h.ds.total).toBe(0);
      expect(p.reset).toHaveBeenCalledTimes(1);
      expect(getFullSearchStateForProvider("tickets")).toBeUndefined();
      expect(h.ds.canTrigger).toBe(true);
    });

    it("starts a fresh provider search for a new term after a completed search resets", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness();

      h.overlay.enter("alpha");
      await settle();
      h.ds.trigger();
      await settle();
      p.runs[0]?.finish({ searched: 4, total: 4 });
      await settle();
      expect(h.ds.status).toBe("done");

      h.overlay.setTerm("beta");
      await settle();
      expect(h.ds.status).toBe("idle");

      h.ds.trigger();
      await settle();
      expect(p.runs).toHaveLength(2);
      expect(p.runs[1]?.query).toBe("beta");
      expect(h.ds.status).toBe("searching");
    });
  });

  describe("auto-trigger", () => {
    it("auto-triggers once when the overlay term has zero local matches", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness({ localMatchCount: 0 });

      h.overlay.enter("harbor");
      await settle();
      expect(p.runs).toHaveLength(1);
      expect(p.runs[0]?.query).toBe("harbor");

      p.runs[0]?.finish({ searched: 6, total: 6 });
      await settle();
      await settle();
      expect(p.runs).toHaveLength(1); // no re-fire while running or after done
      expect(h.ds.status).toBe("done");
    });

    it("waits for the initial load before auto-triggering", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness({ localMatchCount: 0, initialLoading: true });

      h.overlay.enter("harbor");
      await settle();
      expect(p.runs).toHaveLength(0);
      expect(h.ds.status).toBe("idle");

      h.setInitialLoading(false);
      await settle();
      expect(p.runs).toHaveLength(1);
      expect(p.runs[0]?.query).toBe("harbor");
    });

    it("does not auto-trigger when local matches exist", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness({ localMatchCount: 3 });

      h.overlay.enter("harbor");
      await settle();
      expect(p.runs).toHaveLength(0);
      expect(h.ds.status).toBe("idle");
      expect(h.ds.canTrigger).toBe(true);
    });
  });

  describe("scheduleFromNavigation", () => {
    it("defers the deep search until the initial load completes and runs it once", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness({ initialLoading: true });

      h.overlay.enter("harbor");
      h.ds.scheduleFromNavigation();
      await settle();
      expect(p.runs).toHaveLength(0);
      expect(h.ds.status).toBe("idle");

      h.setInitialLoading(false);
      await settle();
      expect(p.runs).toHaveLength(1);
      expect(p.runs[0]?.query).toBe("harbor");

      await settle();
      expect(p.runs).toHaveLength(1); // consumed once
    });
  });

  describe("teardown", () => {
    it("stops auto-triggering after the owning effect root is destroyed", async () => {
      const p = registerFullSearchProvider();
      const h = createHarness({ localMatchCount: 0 });

      h.destroy();
      h.overlay.enter("harbor");
      await settle();

      expect(p.runs).toHaveLength(0);
      expect(h.ds.status).toBe("idle");
    });
  });
});
