// @vitest-environment jsdom
/**
 * CollapsibleSection component tests.
 *
 * Verifies heading with count, aria-expanded, toggle callback,
 * conditional content rendering, and DecryptPlaceholder count badge.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
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

describe("CollapsibleSection", () => {
  it("renders heading with count", () => {
    render(CollapsibleSection, {
      props: {
        heading: "My Tickets",
        count: 5,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    const button = screen.getByRole("button");
    expect(button.textContent).toContain("My Tickets");
    expect(button.textContent).toContain("5");
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

  it("shows DecryptPlaceholder in badge area when loading and count is undefined", () => {
    const { container } = render(CollapsibleSection, {
      props: {
        heading: "My Tickets",
        loading: true,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    const badge = container.querySelector("[data-count]");
    expect(badge).toBeTruthy();
    // DecryptPlaceholder renders with aria-busy="true" and role="status" while loading
    const dp = badge?.querySelector('[aria-busy="true"]');
    expect(dp).toBeTruthy();
  });

  it("shows count badge when count is provided and loading is false", () => {
    render(CollapsibleSection, {
      props: {
        heading: "My Tickets",
        count: 5,
        loading: false,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    const button = screen.getByRole("button");
    expect(button.textContent).toContain("5");
  });

  it("shows count badge (not placeholder) when count is provided even if loading", () => {
    render(CollapsibleSection, {
      props: {
        heading: "My Tickets",
        count: 3,
        loading: true,
        expanded: false,
        ontoggle: vi.fn(),
      },
    });

    const button = screen.getByRole("button");
    expect(button.textContent).toContain("3");
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
});
