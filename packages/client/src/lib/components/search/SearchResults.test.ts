// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { Ticket } from "@lucide/svelte";
import SearchResults from "./SearchResults.svelte";
import FakeResultItem from "./test-helpers/FakeResultItem.svelte";
import { registerSearchProvider } from "$lib/search/registry.svelte.js";
import type { SearchProvider } from "$lib/search/types.js";

interface FakeResultData {
  id: string;
  label: string;
}

const cleanups: (() => void)[] = [];

afterEach(() => {
  for (const c of cleanups.splice(0)) c();
  cleanup();
  window.localStorage.clear();
});

function fakeProvider(
  id: string,
  labels: string[],
  emptyText?: string,
): SearchProvider<FakeResultData> {
  const provider: SearchProvider<FakeResultData> = {
    id,
    label: () => id.toUpperCase(),
    icon: Ticket,
    renderMode: "list",
    showAllHref: () => `/${id}`,
    getResultHref: (rid: string) => `/${id}/${rid}`,
    search: () => ({
      results: labels.map((label, i) => ({
        id: `${id}-${String(i)}`,
        data: { id: `${id}-${String(i)}`, label },
      })),
      loading: false,
      totalCached: labels.length,
    }),
    ResultItem: FakeResultItem,
  };
  if (emptyText !== undefined) {
    provider.emptyText = () => emptyText;
  }
  return provider;
}

function baseProps() {
  return {
    query: "housing",
    ondismiss: vi.fn(),
    onnavigate: vi.fn(),
    onselectrecent: vi.fn(),
  };
}

describe("SearchResults", () => {
  it("stamps the empty room when nothing matches anywhere", () => {
    cleanups.push(
      registerSearchProvider(fakeProvider("aa", [], "No aa match.")),
    );
    const { container, getByText } = render(SearchResults, {
      props: baseProps(),
    });
    expect(getByText("No matches")).toBeDefined();
    expect(getByText("Nothing found")).toBeDefined();
    expect(
      getByText('Nothing unlocked on this device matches "housing".'),
    ).toBeDefined();
    // The room replaces the section list entirely.
    expect(container.querySelector("h3.eb")).toBeNull();
    expect(container.querySelector(".nores")).toBeNull();
  });

  it("renders per-section empty lines beside sections with results", () => {
    cleanups.push(
      registerSearchProvider(fakeProvider("aa", ["Alpha result"])),
      registerSearchProvider(fakeProvider("bb", [], "No bb match.")),
    );
    const { container, getByText } = render(SearchResults, {
      props: baseProps(),
    });
    expect(container.querySelectorAll("h3.eb")).toHaveLength(2);
    expect(getByText("Alpha result")).toBeDefined();
    expect(getByText("No bb match.")).toBeDefined();
    expect(container.querySelector(".section-divider")).toBeNull();
  });

  it("navigates via the provider href when a result is tapped", async () => {
    cleanups.push(registerSearchProvider(fakeProvider("aa", ["Alpha"])));
    const props = baseProps();
    const { getByTestId } = render(SearchResults, { props });
    await fireEvent.click(getByTestId("fake-result"));
    expect(props.onnavigate).toHaveBeenCalledWith("/aa/aa-0");
  });

  it("shows recents instead of sections under two characters", () => {
    cleanups.push(registerSearchProvider(fakeProvider("aa", ["Alpha"])));
    const { container } = render(SearchResults, {
      props: { ...baseProps(), query: "h" },
    });
    expect(container.querySelector("h3.eb")).toBeNull();
  });
});
