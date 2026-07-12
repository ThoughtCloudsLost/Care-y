// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { Ticket } from "@lucide/svelte";
import SearchSection from "./SearchSection.svelte";

// IntersectionObserver is not available in jsdom (DecryptPlaceholder
// renders the loading count).
vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: () => void;
    disconnect: () => void;
    unobserve: () => void;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

afterEach(cleanup);

const children = createRawSnippet(() => ({
  render: () => `<div data-testid="section-content">items</div>`,
}));

interface OverrideProps {
  count?: number;
  loading?: boolean;
  emptyText?: string;
  ondismiss?: () => void;
  onviewall?: (query: string) => void;
  onnavigate?: (href: string) => void;
}

function baseProps(overrides: OverrideProps = {}) {
  return {
    label: "Tickets",
    icon: Ticket,
    count: 3,
    totalCached: 10,
    showAllHref: "/tickets?q=housing",
    loading: false,
    ondismiss: vi.fn(),
    query: "housing",
    children,
    ...overrides,
  };
}

describe("SearchSection", () => {
  it("renders the secline eyebrow, count, and children", () => {
    const { container, getByText } = render(SearchSection, {
      props: baseProps(),
    });
    const eb = container.querySelector("h3.eb");
    expect(eb?.textContent).toBe("Tickets");
    expect(getByText("3 found")).toBeDefined();
    expect(
      container.querySelector("[data-testid='section-content']"),
    ).not.toBeNull();
  });

  it("uses the singular count copy for one result", () => {
    const { getByText } = render(SearchSection, {
      props: baseProps({ count: 1 }),
    });
    expect(getByText("1 found")).toBeDefined();
  });

  it("Show all calls onviewall with the query after dismissing", async () => {
    const ondismiss = vi.fn();
    const onviewall = vi.fn();
    const { getByRole } = render(SearchSection, {
      props: baseProps({ ondismiss, onviewall }),
    });
    await fireEvent.click(
      getByRole("button", { name: "Show all Tickets results" }),
    );
    expect(ondismiss).toHaveBeenCalledOnce();
    expect(onviewall).toHaveBeenCalledWith("housing");
  });

  it("Show all falls back to onnavigate with the section href", async () => {
    const onnavigate = vi.fn();
    const { getByRole } = render(SearchSection, {
      props: baseProps({ onnavigate }),
    });
    await fireEvent.click(
      getByRole("button", { name: "Show all Tickets results" }),
    );
    expect(onnavigate).toHaveBeenCalledWith("/tickets?q=housing");
  });

  it("hides Show all when the section has no results", () => {
    const { queryByRole } = render(SearchSection, {
      props: baseProps({ count: 0 }),
    });
    expect(queryByRole("button", { name: /show all/i })).toBeNull();
  });

  it("renders the quiet empty line instead of children when empty", () => {
    const { container, getByText } = render(SearchSection, {
      props: baseProps({
        count: 0,
        emptyText: 'No teammates match "housing".',
      }),
    });
    expect(getByText('No teammates match "housing".')).toBeDefined();
    expect(
      container.querySelector("[data-testid='section-content']"),
    ).toBeNull();
  });

  it("keeps children rendered while loading, even with zero results", () => {
    const { container } = render(SearchSection, {
      props: baseProps({ count: 0, loading: true, emptyText: "No matches." }),
    });
    expect(
      container.querySelector("[data-testid='section-content']"),
    ).not.toBeNull();
  });
});
