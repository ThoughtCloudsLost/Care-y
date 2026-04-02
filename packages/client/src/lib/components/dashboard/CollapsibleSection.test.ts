// @vitest-environment jsdom
/**
 * CollapsibleSection component tests.
 *
 * Verifies heading with count, aria-expanded, toggle callback,
 * and conditional content rendering.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import CollapsibleSection from "./CollapsibleSection.svelte";

afterEach(cleanup);

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

    expect(container.querySelector(".section-content")).toBeNull();
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

    expect(container.querySelector(".section-content")).toBeTruthy();
  });
});
