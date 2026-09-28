// @vitest-environment jsdom
/**
 * CollapsibleSection component tests.
 *
 * Verifies heading with count, aria-expanded, toggle callback,
 * conditional content rendering, DecryptPlaceholder count badge, the
 * header row order (action, count, chevron), the filter row slot, and the
 * non-collapsible form.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import CollapsibleSection from "./CollapsibleSection.svelte";

// IntersectionObserver stub for DecryptPlaceholder
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

const MockIntersectionObserver = vi.fn(function (this: {
  observe: typeof mockObserve;
  disconnect: typeof mockDisconnect;
  unobserve: ReturnType<typeof vi.fn>;
}) {
  this.observe = mockObserve;
  this.disconnect = mockDisconnect;
  this.unobserve = vi.fn();
});

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

afterEach(() => {
  cleanup();
  mockObserve.mockClear();
  mockDisconnect.mockClear();
});

// The visible count sits in the header row, outside the toggle.
function visibleCount(container: HTMLElement): Element | null {
  return container.querySelector(".section-header > .secline-cnt");
}

describe("CollapsibleSection", () => {
  it("renders heading with count", () => {
    const { container } = render(CollapsibleSection, {
      props: {
        heading: "My Tickets",
        count: 5,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    const button = screen.getByRole("button");
    expect(button.textContent).toContain("My Tickets");
    expect(visibleCount(container)?.textContent).toBe("5");
  });

  it("keeps the visible count and the chevron out of the toggle", () => {
    const { container } = render(CollapsibleSection, {
      props: {
        heading: "My Tickets",
        count: 5,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    const button = screen.getByRole("button");
    expect(button.querySelector(".secline-cnt")).toBeNull();
    expect(button.querySelector(".toggle-chevron")).toBeNull();
    expect(
      container.querySelector(".section-header > .toggle-chevron"),
    ).toBeTruthy();
  });

  it("sets aria-expanded to false when collapsed", () => {
    render(CollapsibleSection, {
      props: {
        heading: "Urgent",
        count: 2,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("sets aria-expanded to true when expanded", () => {
    render(CollapsibleSection, {
      props: {
        heading: "Urgent",
        count: 2,
        expanded: true,
        ontoggle: vi.fn(),
      },
    });

    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-expanded")).toBe("true");
  });

  it("calls ontoggle when header is clicked", async () => {
    const ontoggle = vi.fn();
    render(CollapsibleSection, {
      props: {
        heading: "On Hold",
        count: 1,
        expanded: false,
        ontoggle,
      },
    });

    const button = screen.getByRole("button");
    await fireEvent.click(button);
    expect(ontoggle).toHaveBeenCalledOnce();
  });

  it("does not render children when collapsed", () => {
    const { container } = render(CollapsibleSection, {
      props: {
        heading: "Test",
        count: 0,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    expect(container.querySelector('[role="region"]')).toBeNull();
  });

  it("renders children when expanded", () => {
    const { container } = render(CollapsibleSection, {
      props: {
        heading: "Test",
        count: 3,
        expanded: true,
        ontoggle: vi.fn(),
      },
    });

    expect(container.querySelector('[role="region"]')).toBeTruthy();
  });

  it("shows DecryptPlaceholder in count area when loading and count is undefined", () => {
    const { container } = render(CollapsibleSection, {
      props: {
        heading: "My Tickets",
        loading: true,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    const cnt = visibleCount(container);
    expect(cnt).toBeTruthy();
    const dp = cnt?.querySelector(".dp");
    expect(dp).toBeTruthy();
  });

  it("shows count badge when count is provided and loading is false", () => {
    const { container } = render(CollapsibleSection, {
      props: {
        heading: "My Tickets",
        count: 5,
        loading: false,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    expect(visibleCount(container)?.textContent).toBe("5");
  });

  it("shows count badge (not placeholder) when count is provided even if loading", () => {
    const { container } = render(CollapsibleSection, {
      props: {
        heading: "My Tickets",
        count: 3,
        loading: true,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    const cnt = visibleCount(container);
    expect(cnt?.textContent).toBe("3");
    expect(cnt?.querySelector(".dp")).toBeNull();
  });

  it("renders 'N of M' when both count and totalCount are provided", () => {
    const { container } = render(CollapsibleSection, {
      props: {
        heading: "Unassigned",
        count: 5,
        totalCount: 30,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    expect(visibleCount(container)?.textContent).toBe("5 of 30");
  });

  it("marks a floor total with a plus", () => {
    const { container } = render(CollapsibleSection, {
      props: {
        heading: "Unassigned",
        count: 5,
        totalCount: 30,
        totalCountIsFloor: true,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    expect(visibleCount(container)?.textContent).toBe("5 of 30+");
  });

  it("renders heading and icon regardless of loading state", () => {
    render(CollapsibleSection, {
      props: {
        heading: "Urgent",
        loading: true,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    const button = screen.getByRole("button");
    expect(button.textContent).toContain("Urgent");
  });

  it("puts the count in the toggle's accessible name", () => {
    render(CollapsibleSection, {
      props: {
        heading: "Unassigned",
        count: 5,
        totalCount: 30,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    expect(
      screen.getByRole("button", { name: /Unassigned.*5 of 30/ }),
    ).toBeTruthy();
  });

  it("renders the header action beside the toggle", () => {
    const headerAction = createRawSnippet(() => ({
      render: () => `<button type="button">Filter Unassigned</button>`,
    }));
    render(CollapsibleSection, {
      props: {
        heading: "Unassigned",
        expanded: false,
        ontoggle: vi.fn(),
        headerAction,
      },
    });

    const action = screen.getByRole("button", { name: "Filter Unassigned" });
    expect(action.closest(".section-header")).toBeTruthy();
  });

  it("puts the header action before the count and keeps the count in the toggle's name", () => {
    const headerAction = createRawSnippet(() => ({
      render: () => `<button type="button">Filter Unassigned</button>`,
    }));
    const { container } = render(CollapsibleSection, {
      props: {
        heading: "Unassigned",
        count: 5,
        totalCount: 30,
        expanded: false,
        ontoggle: vi.fn(),
        headerAction,
      },
    });

    const action = screen.getByRole("button", { name: "Filter Unassigned" });
    const cnt = visibleCount(container);
    if (cnt === null) throw new Error("header row did not render its count");
    expect(action.compareDocumentPosition(cnt)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(
      screen.getByRole("button", { name: /Unassigned.*5 of 30/ }),
    ).toBeTruthy();
  });

  it("keeps the filter row outside the collapsible region", () => {
    const filterRow = createRawSnippet(() => ({
      render: () => `<div data-testid="filter-row">pills</div>`,
    }));
    render(CollapsibleSection, {
      props: {
        heading: "Unassigned",
        expanded: true,
        ontoggle: vi.fn(),
        filterRow,
      },
    });

    const row = screen.getByTestId("filter-row");
    expect(row.closest('[role="region"]')).toBeNull();
  });

  it("hides the filter row with the body while the section is collapsed", () => {
    const filterRow = createRawSnippet(() => ({
      render: () => `<div data-testid="filter-row">pills</div>`,
    }));
    const { container } = render(CollapsibleSection, {
      props: {
        heading: "Unassigned",
        expanded: false,
        ontoggle: vi.fn(),
        filterRow,
      },
    });

    expect(container.querySelector('[role="region"]')).toBeNull();
    expect(screen.queryByTestId("filter-row")).toBeNull();
  });

  describe("not collapsible", () => {
    function renderStatic(): HTMLElement {
      const { container } = render(CollapsibleSection, {
        props: {
          heading: "My Tickets",
          count: 4,
          expanded: false,
          ontoggle: vi.fn(),
          collapsible: false,
        },
      });
      return container;
    }

    it("renders a heading with no toggle", () => {
      const container = renderStatic();
      expect(screen.queryByRole("button")).toBeNull();
      expect(
        screen.getByRole("heading", { level: 2, name: /My Tickets.*4/ }),
      ).toBeTruthy();
      expect(container.querySelector(".toggle-chevron")).toBeNull();
    });

    it("always shows the body", () => {
      const container = renderStatic();
      expect(container.querySelector("#my-tickets-region")).toBeTruthy();
    });

    // With no toggle there is nothing for a region to be controlled by;
    // the heading names the section, and a lane body that scrolls on its
    // own takes the region role without repeating the name.
    it("does not make the body a region", () => {
      const container = renderStatic();
      expect(container.querySelector('[role="region"]')).toBeNull();
      expect(
        container
          .querySelector("#my-tickets-region")
          ?.hasAttribute("aria-labelledby"),
      ).toBe(false);
    });
  });
});
