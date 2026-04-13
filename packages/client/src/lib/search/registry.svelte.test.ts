// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/svelte";
import type { SearchProvider } from "./types.js";
import {
  registerSearchProvider,
  searchAll,
  getProvider,
} from "./registry.svelte.js";

afterEach(cleanup);

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
