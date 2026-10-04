// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import type { DeepSearchStatus } from "$lib/search/deep-search.svelte.js";
import SearchNavigator from "./SearchNavigator.svelte";

afterEach(cleanup);

interface OverrideProps {
  ondeepsearch?: () => void;
  deepSearchStatus?: DeepSearchStatus;
  deepSearchSearched?: number;
  deepSearchTotal?: number;
  ondeepsearchretry?: () => void;
  deepSearchIncompleteText?: string;
  onclearfilters?: () => void;
  clearFiltersLabel?: string;
}

function baseProps(overrides: OverrideProps = {}) {
  return {
    term: "harbor",
    position: 0,
    total: 0,
    onup: vi.fn(),
    ondown: vi.fn(),
    onexit: vi.fn(),
    ...overrides,
  };
}

describe("SearchNavigator", () => {
  it("shows how far a stopped deep search got with a retry button in place of the trigger", async () => {
    const ondeepsearchretry = vi.fn();
    const { getByText, getByRole, queryByRole } = render(SearchNavigator, {
      props: baseProps({
        deepSearchStatus: "incomplete",
        deepSearchIncompleteText:
          "Deeper search stopped. Searched 3 of 9 tickets.",
        ondeepsearchretry,
      }),
    });

    expect(
      getByText("Deeper search stopped. Searched 3 of 9 tickets."),
    ).toBeDefined();
    expect(
      queryByRole("button", { name: m.search_deep_nav_trigger() }),
    ).toBeNull();

    await fireEvent.click(getByRole("button", { name: m.common_retry() }));
    expect(ondeepsearchretry).toHaveBeenCalledOnce();
  });

  it("renders no retry button once a deep search is done", () => {
    const { queryByRole } = render(SearchNavigator, {
      props: baseProps({
        deepSearchStatus: "done",
        ondeepsearchretry: vi.fn(),
      }),
    });

    expect(queryByRole("button", { name: m.common_retry() })).toBeNull();
  });

  it("shows the filter-scope row with a clear button while filters are active", async () => {
    const onclearfilters = vi.fn();
    const { getByText, getByRole } = render(SearchNavigator, {
      props: baseProps({
        onclearfilters,
        clearFiltersLabel: "Search all tickets",
      }),
    });

    expect(getByText(m.search_filter_scoped_notice())).toBeDefined();

    await fireEvent.click(getByRole("button", { name: "Search all tickets" }));
    expect(onclearfilters).toHaveBeenCalledOnce();
  });

  it("renders no filter-scope row without a clear handler", () => {
    const { queryByText } = render(SearchNavigator, {
      props: baseProps(),
    });

    expect(queryByText(m.search_filter_scoped_notice())).toBeNull();
  });
});
