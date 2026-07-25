// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/svelte";
import { Ticket } from "@lucide/svelte";
import FullSearchPanel from "./FullSearchPanel.svelte";
import FakeResultItem from "./test-helpers/FakeResultItem.svelte";
import {
  registerSearchProvider,
  resetFullSearch,
} from "$lib/search/registry.svelte.js";
import type { SearchProvider, SearchResultGroup } from "$lib/search/types.js";

const cleanups: (() => void)[] = [];

afterEach(() => {
  resetFullSearch();
  for (const c of cleanups.splice(0)) c();
  cleanup();
});

function makeGroup(totalCached: number): SearchResultGroup {
  return {
    providerId: "aa",
    label: "AA",
    icon: Ticket,
    results: [],
    renderMode: "list",
    showAllHref: "/aa",
    loading: false,
    totalCached,
  };
}

interface FakeResultData {
  id: string;
  label: string;
}

function providerWithFullSearch(
  fullSearch: NonNullable<SearchProvider["fullSearch"]>,
): SearchProvider<FakeResultData> {
  return {
    id: "aa",
    label: () => "AA",
    icon: Ticket,
    renderMode: "list",
    showAllHref: () => "/aa",
    getResultHref: (id: string) => `/aa/${id}`,
    search: () => ({ results: [], loading: false, totalCached: 0 }),
    ResultItem: FakeResultItem,
    fullSearch,
  };
}

describe("FullSearchPanel", () => {
  it("renders the calm trigger and honest hint when idle", async () => {
    const fullSearch = vi.fn(async () => undefined);
    cleanups.push(registerSearchProvider(providerWithFullSearch(fullSearch)));
    const { getByRole, getByText } = render(FullSearchPanel, {
      props: {
        query: "housing",
        groups: [makeGroup(0)],
        hasAnyResults: false,
      },
    });
    const trigger = getByRole("button", {
      name: "Search everything not yet unlocked",
    });
    expect(
      getByText(
        "Results so far come from what this device has already unlocked.",
      ),
    ).toBeDefined();
    await fireEvent.click(trigger);
    expect(fullSearch).toHaveBeenCalledWith(
      "housing",
      expect.anything(),
      expect.any(Function),
      expect.any(AbortSignal),
    );
  });

  it("auto-runs the full search when the cache has data but no matches", async () => {
    const fullSearch = vi.fn(async () => undefined);
    cleanups.push(registerSearchProvider(providerWithFullSearch(fullSearch)));
    render(FullSearchPanel, {
      props: {
        query: "housing",
        groups: [makeGroup(5)],
        hasAnyResults: false,
      },
    });
    await waitFor(() => {
      expect(fullSearch).toHaveBeenCalledOnce();
    });
  });

  it("does not auto-run while matches already exist", async () => {
    const fullSearch = vi.fn(async () => undefined);
    cleanups.push(registerSearchProvider(providerWithFullSearch(fullSearch)));
    render(FullSearchPanel, {
      props: {
        query: "housing",
        groups: [makeGroup(5)],
        hasAnyResults: true,
      },
    });
    await Promise.resolve();
    expect(fullSearch).not.toHaveBeenCalled();
  });
});
