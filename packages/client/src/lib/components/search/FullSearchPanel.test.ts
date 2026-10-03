// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/svelte";
import { Ticket } from "@lucide/svelte";
import * as m from "$lib/paraglide/messages.js";
import FullSearchPanel from "./FullSearchPanel.svelte";
import FakeResultItem from "./test-helpers/FakeResultItem.svelte";
import {
  getFullSearchStateForProvider,
  registerSearchProvider,
  resetFullSearch,
} from "$lib/search/registry.svelte.js";
import type {
  FullSearchState,
  SearchProvider,
  SearchResultGroup,
} from "$lib/search/types.js";

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
  id = "aa",
): SearchProvider<FakeResultData> {
  return {
    id,
    label: () => id.toUpperCase(),
    icon: Ticket,
    renderMode: "list",
    showAllHref: () => `/${id}`,
    getResultHref: (resultId: string) => `/${id}/${resultId}`,
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

  it("does not auto-run again after a provider's run stops incomplete", async () => {
    const fullSearch = vi.fn(
      async (
        _query: string,
        state: FullSearchState,
        onProgress: () => void,
      ): Promise<void> => {
        state.total = 5;
        state.searched = 2;
        onProgress();
        throw new Error("page decrypt failed");
      },
    );
    cleanups.push(registerSearchProvider(providerWithFullSearch(fullSearch)));
    render(FullSearchPanel, {
      props: {
        query: "housing",
        groups: [makeGroup(5)],
        hasAnyResults: false,
      },
    });
    await waitFor(() => {
      expect(getFullSearchStateForProvider("aa")?.status).toBe("incomplete");
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fullSearch).toHaveBeenCalledOnce();
  });

  it("marks a stopped provider's row while another provider is still searching", async () => {
    let releaseSlow: () => void = () => undefined;
    cleanups.push(
      registerSearchProvider(
        providerWithFullSearch(
          async (
            _query: string,
            state: FullSearchState,
            onProgress: () => void,
          ): Promise<void> => {
            state.total = 5;
            state.searched = 2;
            onProgress();
            throw new Error("page decrypt failed");
          },
        ),
      ),
    );
    cleanups.push(
      registerSearchProvider(
        providerWithFullSearch(
          async (
            _query: string,
            state: FullSearchState,
            onProgress: () => void,
          ): Promise<void> => {
            state.total = 8;
            state.searched = 3;
            onProgress();
            await new Promise<void>((resolve) => {
              releaseSlow = resolve;
            });
          },
          "bb",
        ),
      ),
    );
    const { getByRole, getByText } = render(FullSearchPanel, {
      props: {
        query: "housing",
        groups: [makeGroup(0)],
        hasAnyResults: true,
      },
    });
    await fireEvent.click(
      getByRole("button", { name: "Search everything not yet unlocked" }),
    );

    await waitFor(() => {
      expect(getByText(m.search_full_stopped())).toBeDefined();
    });
    expect(getByText("AA")).toBeDefined();
    expect(getFullSearchStateForProvider("bb")?.status).toBe("searching");

    releaseSlow();
  });
});
