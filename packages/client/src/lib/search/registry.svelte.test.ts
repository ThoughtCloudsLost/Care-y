// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/svelte";
import type { SearchProvider, FullSearchState } from "./types.js";
import {
  registerSearchProvider,
  searchAll,
  getProvider,
  getContentMatchIds,
  runFullSearch,
  runFullSearchForProvider,
  getFullSearchStates,
  resetFullSearch,
  resetFullSearchForProvider,
  hasFullSearch,
  providerHasFullSearch,
  getFullSearchStateForProvider,
  setPromotedOverride,
} from "./registry.svelte.js";

afterEach(() => {
  cleanup();
  // Clear any lingering full search state between tests
  resetFullSearch();
});

/** Minimal mock provider for registry tests. */
function mockProvider(
  id: string,
  results: { id: string }[] = [],
): SearchProvider {
  return {
    id,
    label: () => id,
    icon: null as never, // Not used in registry tests
    renderMode: "list",
    showAllHref: (q: string) => `/${id}?q=${q}`,
    getResultHref: (resultId: string) => `/${id}/${resultId}`,
    search: () => ({
      results: results.map((r) => ({ id: r.id, data: r })),
      loading: false,
      totalCached: results.length,
    }),
    ResultItem: null as never, // Not used in registry tests
  };
}

/** Provider with fullSearch, getContentMatchIds, and reset support. */
function mockFullSearchProvider(
  id: string,
  opts: {
    results?: { id: string }[];
    contentMatchIds?: Set<string>;
    fullSearchFn?: (
      query: string,
      state: FullSearchState,
      onProgress: () => void,
    ) => Promise<void>;
    resetFn?: () => void;
  } = {},
): SearchProvider {
  const {
    results = [],
    contentMatchIds = new Set<string>(),
    fullSearchFn,
    resetFn,
  } = opts;
  return {
    id,
    label: () => id,
    icon: null as never,
    renderMode: "list",
    showAllHref: (q: string) => `/${id}?q=${q}`,
    getResultHref: (resultId: string) => `/${id}/${resultId}`,
    search: () => ({
      results: results.map((r) => ({ id: r.id, data: r })),
      loading: false,
      totalCached: results.length,
    }),
    ResultItem: null as never,
    fullSearch:
      fullSearchFn ??
      (async (
        _query: string,
        state: FullSearchState,
        onProgress: () => void,
      ) => {
        state.total = 10;
        state.searched = 10;
        state.matchCount = contentMatchIds.size;
        onProgress();
      }),
    getContentMatchIds: () => contentMatchIds,
    reset: resetFn ?? vi.fn(),
  };
}

describe("registerSearchProvider / searchAll", () => {
  it("returns registered provider's results", () => {
    const unregister = registerSearchProvider(
      mockProvider("tickets", [{ id: "t1" }, { id: "t2" }]),
    );

    const groups = searchAll("test query");
    expect(groups).toHaveLength(1);
    expect(groups[0]!.providerId).toBe("tickets");
    expect(groups[0]!.results).toHaveLength(2);

    unregister();
  });

  it("promoted provider sorts to first position", () => {
    const unregA = registerSearchProvider(mockProvider("kb", [{ id: "k1" }]));
    const unregB = registerSearchProvider(
      mockProvider("tickets", [{ id: "t1" }]),
    );

    const groups = searchAll("test query", "tickets");
    expect(groups[0]!.providerId).toBe("tickets");
    expect(groups[1]!.providerId).toBe("kb");

    unregA();
    unregB();
  });

  it("unregistered provider no longer appears in results", () => {
    const unregister = registerSearchProvider(
      mockProvider("tickets", [{ id: "t1" }]),
    );
    unregister();

    const groups = searchAll("test query");
    expect(groups).toHaveLength(0);
  });

  it("returns empty array for empty query", () => {
    const unregister = registerSearchProvider(
      mockProvider("tickets", [{ id: "t1" }]),
    );

    const groups = searchAll("");
    expect(groups).toEqual([]);

    unregister();
  });

  it("returns empty array for single-character query", () => {
    const unregister = registerSearchProvider(
      mockProvider("tickets", [{ id: "t1" }]),
    );

    const groups = searchAll("a");
    expect(groups).toEqual([]);

    unregister();
  });

  it("passes query through to provider showAllHref", () => {
    const unregister = registerSearchProvider(
      mockProvider("tickets", [{ id: "t1" }]),
    );

    const groups = searchAll("housing");
    expect(groups[0]!.showAllHref).toBe("/tickets?q=housing");

    unregister();
  });
});

describe("getProvider", () => {
  it("returns registered provider by ID", () => {
    const provider = mockProvider("tickets");
    const unregister = registerSearchProvider(provider);

    expect(getProvider("tickets")).toBe(provider);

    unregister();
  });

  it("returns undefined for unknown ID", () => {
    expect(getProvider("nonexistent")).toBeUndefined();
  });
});

describe("getContentMatchIds", () => {
  it("returns the content match set from a provider", () => {
    const matchIds = new Set(["t1", "t5", "t9"]);
    const unregister = registerSearchProvider(
      mockFullSearchProvider("tickets", { contentMatchIds: matchIds }),
    );

    const result = getContentMatchIds("tickets");
    expect(result).toBe(matchIds);
    expect(result?.has("t1")).toBe(true);
    expect(result?.has("t5")).toBe(true);
    expect(result?.has("t9")).toBe(true);
    expect(result?.has("t2")).toBe(false);

    unregister();
  });

  it("returns undefined for unknown provider", () => {
    expect(getContentMatchIds("nonexistent")).toBeUndefined();
  });

  it("returns undefined when provider has no getContentMatchIds", () => {
    const unregister = registerSearchProvider(mockProvider("basic"));

    expect(getContentMatchIds("basic")).toBeUndefined();

    unregister();
  });

  it("returns empty set when provider has no matches", () => {
    const emptySet = new Set<string>();
    const unregister = registerSearchProvider(
      mockFullSearchProvider("tickets", { contentMatchIds: emptySet }),
    );

    const result = getContentMatchIds("tickets");
    expect(result).toBeDefined();
    expect(result?.size).toBe(0);

    unregister();
  });
});

describe("fullSearch callback coordination", () => {
  it("runFullSearch sets all providers to searching, then done", async () => {
    let resolveA: () => void;
    let resolveB: () => void;
    const promiseA = new Promise<void>((r) => {
      resolveA = r;
    });
    const promiseB = new Promise<void>((r) => {
      resolveB = r;
    });

    const unregA = registerSearchProvider(
      mockFullSearchProvider("alpha", {
        fullSearchFn: async (
          _q: string,
          state: FullSearchState,
          onProgress: () => void,
        ) => {
          state.total = 5;
          state.searched = 5;
          state.matchCount = 2;
          onProgress();
          await promiseA;
        },
      }),
    );
    const unregB = registerSearchProvider(
      mockFullSearchProvider("beta", {
        fullSearchFn: async (
          _q: string,
          state: FullSearchState,
          onProgress: () => void,
        ) => {
          state.total = 8;
          state.searched = 8;
          state.matchCount = 3;
          onProgress();
          await promiseB;
        },
      }),
    );

    runFullSearch("test");

    // Both start as "searching"
    const states = getFullSearchStates();
    expect(states).toHaveLength(2);
    expect(states.find((s) => s.providerId === "alpha")?.status).toBe(
      "searching",
    );
    expect(states.find((s) => s.providerId === "beta")?.status).toBe(
      "searching",
    );

    // Resolve provider A only
    resolveA!();
    await promiseA;
    // Allow microtask (.then) to run
    await new Promise((r) => setTimeout(r, 0));

    const afterA = getFullSearchStates();
    expect(afterA.find((s) => s.providerId === "alpha")?.status).toBe("done");
    expect(afterA.find((s) => s.providerId === "beta")?.status).toBe(
      "searching",
    );

    // Resolve provider B
    resolveB!();
    await promiseB;
    await new Promise((r) => setTimeout(r, 0));

    const afterBoth = getFullSearchStates();
    expect(afterBoth.find((s) => s.providerId === "alpha")?.status).toBe(
      "done",
    );
    expect(afterBoth.find((s) => s.providerId === "beta")?.status).toBe("done");

    unregA();
    unregB();
  });

  it("onProgress propagates intermediate match counts", async () => {
    const unregister = registerSearchProvider(
      mockFullSearchProvider("tickets", {
        fullSearchFn: async (
          _q: string,
          state: FullSearchState,
          onProgress: () => void,
        ) => {
          state.total = 20;
          state.searched = 5;
          state.matchCount = 1;
          onProgress();

          state.searched = 15;
          state.matchCount = 3;
          onProgress();

          state.searched = 20;
          state.matchCount = 4;
          onProgress();
        },
      }),
    );

    runFullSearch("housing");
    // Wait for the async fullSearch to complete
    await new Promise((r) => setTimeout(r, 0));

    const states = getFullSearchStates();
    const ticketState = states.find((s) => s.providerId === "tickets");
    expect(ticketState?.status).toBe("done");
    expect(ticketState?.searched).toBe(20);
    expect(ticketState?.matchCount).toBe(4);

    unregister();
  });
});

describe("resetFullSearchForProvider with concurrent requests", () => {
  it("resetting one provider preserves another in-flight provider", async () => {
    let resolveB: () => void;
    const promiseB = new Promise<void>((r) => {
      resolveB = r;
    });

    const resetA = vi.fn();
    const unregA = registerSearchProvider(
      mockFullSearchProvider("alpha", {
        resetFn: resetA,
        fullSearchFn: async (
          _q: string,
          state: FullSearchState,
          onProgress: () => void,
        ) => {
          state.total = 5;
          state.searched = 5;
          state.matchCount = 2;
          onProgress();
        },
      }),
    );
    const unregB = registerSearchProvider(
      mockFullSearchProvider("beta", {
        fullSearchFn: async (
          _q: string,
          state: FullSearchState,
          onProgress: () => void,
        ) => {
          state.total = 10;
          state.searched = 3;
          state.matchCount = 1;
          onProgress();
          await promiseB;
        },
      }),
    );

    runFullSearch("test");
    // Let alpha finish synchronously
    await new Promise((r) => setTimeout(r, 0));

    // Reset alpha while beta is still searching
    resetFullSearchForProvider("alpha");

    expect(resetA).toHaveBeenCalled();
    const states = getFullSearchStates();
    expect(states.find((s) => s.providerId === "alpha")).toBeUndefined();
    expect(states.find((s) => s.providerId === "beta")?.status).toBe(
      "searching",
    );

    // Now let beta finish
    resolveB!();
    await promiseB;
    await new Promise((r) => setTimeout(r, 0));

    const afterDone = getFullSearchStates();
    expect(afterDone.find((s) => s.providerId === "alpha")).toBeUndefined();
    expect(afterDone.find((s) => s.providerId === "beta")?.status).toBe("done");

    unregA();
    unregB();
  });

  it("resetFullSearch clears all states and calls reset on each provider", () => {
    const resetA = vi.fn();
    const resetB = vi.fn();
    const unregA = registerSearchProvider(
      mockFullSearchProvider("alpha", { resetFn: resetA }),
    );
    const unregB = registerSearchProvider(
      mockFullSearchProvider("beta", { resetFn: resetB }),
    );

    runFullSearch("test");

    resetFullSearch();

    expect(getFullSearchStates()).toHaveLength(0);
    expect(resetA).toHaveBeenCalled();
    expect(resetB).toHaveBeenCalled();

    unregA();
    unregB();
  });
});

describe("edge cases", () => {
  describe("provider returns empty results", () => {
    it("searchAll includes group with zero results", () => {
      const unregister = registerSearchProvider(mockProvider("empty", []));

      const groups = searchAll("test query");
      expect(groups).toHaveLength(1);
      expect(groups[0]!.providerId).toBe("empty");
      expect(groups[0]!.results).toHaveLength(0);
      expect(groups[0]!.totalCached).toBe(0);

      unregister();
    });

    it("fullSearch with no matches sets matchCount to 0", async () => {
      const unregister = registerSearchProvider(
        mockFullSearchProvider("tickets", {
          fullSearchFn: async (
            _q: string,
            state: FullSearchState,
            onProgress: () => void,
          ) => {
            state.total = 100;
            state.searched = 100;
            state.matchCount = 0;
            onProgress();
          },
        }),
      );

      runFullSearch("zzzzz");
      await new Promise((r) => setTimeout(r, 0));

      const ticketState = getFullSearchStateForProvider("tickets");
      expect(ticketState?.status).toBe("done");
      expect(ticketState?.matchCount).toBe(0);
      expect(ticketState?.searched).toBe(100);

      unregister();
    });
  });

  describe("search with no registered providers", () => {
    it("searchAll returns empty array", () => {
      const groups = searchAll("test query");
      expect(groups).toEqual([]);
    });

    it("hasFullSearch returns false", () => {
      expect(hasFullSearch()).toBe(false);
    });

    it("runFullSearch produces no states", () => {
      runFullSearch("test");
      expect(getFullSearchStates()).toHaveLength(0);
    });

    it("getContentMatchIds returns undefined", () => {
      expect(getContentMatchIds("anything")).toBeUndefined();
    });

    it("providerHasFullSearch returns false", () => {
      expect(providerHasFullSearch("anything")).toBe(false);
    });

    it("getFullSearchStateForProvider returns undefined", () => {
      expect(getFullSearchStateForProvider("anything")).toBeUndefined();
    });

    it("resetFullSearchForProvider does not throw", () => {
      expect(() => {
        resetFullSearchForProvider("anything");
      }).not.toThrow();
    });
  });

  describe("runFullSearchForProvider", () => {
    it("skips providers without fullSearch", () => {
      const unregister = registerSearchProvider(mockProvider("basic"));

      runFullSearchForProvider("basic", "test");
      expect(getFullSearchStates()).toHaveLength(0);

      unregister();
    });

    it("skips when provider is already searching", async () => {
      let callCount = 0;
      let resolve: () => void;
      const promise = new Promise<void>((r) => {
        resolve = r;
      });

      const unregister = registerSearchProvider(
        mockFullSearchProvider("tickets", {
          fullSearchFn: async (
            _q: string,
            state: FullSearchState,
            onProgress: () => void,
          ) => {
            callCount++;
            state.total = 10;
            onProgress();
            await promise;
          },
        }),
      );

      runFullSearchForProvider("tickets", "first");
      // Second call while first is still in-flight should be a no-op
      runFullSearchForProvider("tickets", "second");

      expect(callCount).toBe(1);

      resolve!();
      await promise;
      await new Promise((r) => setTimeout(r, 0));

      unregister();
    });

    it("creates state entry when none existed before", async () => {
      const unregister = registerSearchProvider(
        mockFullSearchProvider("tickets", {
          fullSearchFn: async (
            _q: string,
            state: FullSearchState,
            onProgress: () => void,
          ) => {
            state.total = 5;
            state.searched = 5;
            state.matchCount = 2;
            onProgress();
          },
        }),
      );

      // No prior runFullSearch call, so no state exists yet
      expect(getFullSearchStateForProvider("tickets")).toBeUndefined();

      runFullSearchForProvider("tickets", "test");
      await new Promise((r) => setTimeout(r, 0));

      const ticketState = getFullSearchStateForProvider("tickets");
      expect(ticketState?.status).toBe("done");
      expect(ticketState?.matchCount).toBe(2);

      unregister();
    });
  });

  describe("setPromotedOverride", () => {
    it("overrides the promoted provider in searchAll", () => {
      const unregA = registerSearchProvider(mockProvider("kb", [{ id: "k1" }]));
      const unregB = registerSearchProvider(
        mockProvider("tickets", [{ id: "t1" }]),
      );

      // Without override, "kb" is promoted
      const before = searchAll("test query", "kb");
      expect(before[0]!.providerId).toBe("kb");

      // Override to promote "tickets" regardless of the argument
      const clearOverride = setPromotedOverride("tickets");
      const after = searchAll("test query", "kb");
      expect(after[0]!.providerId).toBe("tickets");

      clearOverride();
      unregA();
      unregB();
    });

    it("cleanup only clears if override has not been replaced", () => {
      const unregA = registerSearchProvider(mockProvider("kb", [{ id: "k1" }]));
      const unregB = registerSearchProvider(
        mockProvider("tickets", [{ id: "t1" }]),
      );

      const clearFirst = setPromotedOverride("tickets");
      // Replace with a different override before cleaning up the first
      const clearSecond = setPromotedOverride("kb");

      // Cleaning up the first should not affect the second override
      clearFirst();
      const groups = searchAll("test query");
      expect(groups[0]!.providerId).toBe("kb");

      clearSecond();
      unregA();
      unregB();
    });
  });

  describe("hasFullSearch and providerHasFullSearch", () => {
    it("hasFullSearch returns true when at least one provider has fullSearch", () => {
      const unregA = registerSearchProvider(mockProvider("basic"));
      const unregB = registerSearchProvider(mockFullSearchProvider("tickets"));

      expect(hasFullSearch()).toBe(true);

      unregA();
      unregB();
    });

    it("hasFullSearch returns false when no provider has fullSearch", () => {
      const unregister = registerSearchProvider(mockProvider("basic"));

      expect(hasFullSearch()).toBe(false);

      unregister();
    });

    it("providerHasFullSearch returns true for provider with fullSearch", () => {
      const unregister = registerSearchProvider(
        mockFullSearchProvider("tickets"),
      );

      expect(providerHasFullSearch("tickets")).toBe(true);

      unregister();
    });

    it("providerHasFullSearch returns false for provider without fullSearch", () => {
      const unregister = registerSearchProvider(mockProvider("basic"));

      expect(providerHasFullSearch("basic")).toBe(false);

      unregister();
    });
  });
});
