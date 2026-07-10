// @vitest-environment jsdom
/**
 * FilterPillBar generic component tests.
 *
 * The generic FilterPillBar accepts pill definitions and callbacks as props
 * instead of importing domain-specific stores. Tests verify pill rendering,
 * badge counter, clear all button, create shortcut button, and popover behavior.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { SvelteSet } from "svelte/reactivity";

// --- Mock i18n ---
vi.mock("$lib/paraglide/messages.js", () => ({
  tickets_filter: () => "Filter",
  tickets_filter_all: () => "All",
  tickets_clear_filters: () => "Clear all",
  tickets_create_shortcut: () => "Save filter shortcut",
  tickets_filter_date_from: () => "From",
  tickets_filter_date_to: () => "To",
  tickets_filter_date_clear: () => "Clear dates",
}));

import FilterPillBar from "./FilterPillBar.svelte";
import type { PillDefinition } from "./filter-types.js";

afterEach(cleanup);

function makePills(): PillDefinition[] {
  return [
    {
      id: "status",
      label: "Status",
      mode: "multi",
      options: [
        { value: "new", label: "New (3)" },
        { value: "active", label: "Active (5)" },
      ],
      selected: new SvelteSet<string>(),
    },
    {
      id: "queue",
      label: "Queue",
      mode: "multi",
      options: [{ value: "q-1", label: "Intake (5)" }],
      selected: new SvelteSet<string>(),
    },
    {
      id: "assignee",
      label: "Assignee",
      mode: "single",
      options: [{ value: "u-1", label: "Me (2)" }],
      selected: null,
    },
    {
      id: "date",
      label: "Date",
      mode: "date",
      options: [],
      selected: null,
    },
  ];
}

const noop = vi.fn();

describe("FilterPillBar", () => {
  it("renders all pill labels", () => {
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 0,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    });
    const text = container.textContent;
    expect(text).toContain("Status");
    expect(text).toContain("Queue");
    expect(text).toContain("Assignee");
    expect(text).toContain("Date");
  });

  it("hides badge counter and actions when no filters active", () => {
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 0,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    });
    expect(container.textContent).not.toContain("Clear all");
    expect(
      container.querySelector("[aria-label='Save filter shortcut']"),
    ).toBeNull();
  });

  it("shows badge counter matching active filter count", () => {
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 2,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
      oncreateshortcut: noop,
    });
    const bookmarkLink = container.querySelector(
      "[aria-label='Save filter shortcut']",
    );
    expect(bookmarkLink).not.toBeNull();
    expect(bookmarkLink!.textContent).toContain("2");
  });

  it("shows clear all button when filters are active", () => {
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 1,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    });
    expect(container.textContent).toContain("Clear all");
  });

  it("shows create shortcut button when filters are active", () => {
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 1,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
      oncreateshortcut: noop,
    });
    const btn = container.querySelector("[aria-label='Save filter shortcut']");
    expect(btn).not.toBeNull();
  });

  it("has toolbar role with accessible label", () => {
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 0,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
      filterLabel: "Filter tickets",
    });
    const toolbar = container.querySelector("[role='toolbar']");
    expect(toolbar).not.toBeNull();
    expect(toolbar?.getAttribute("aria-label")).toBe("Filter tickets");
  });

  it("accepts custom i18n label overrides", () => {
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 1,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
      clearLabel: "Reset",
    });
    expect(container.textContent).toContain("Reset");
  });

  // --- Toggle pill (client-side unread filter) ---
  // The "New replies first" sort toggle lives in the sort popover
  // (SubNavbarFilterLayout), not in the pill bar.

  it("renders the unread toggle as the first pill", () => {
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 0,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
      unreadFilter: { label: "Unread", active: false, ontoggle: noop },
    });
    const scroll = container.querySelector(".pill-scroll");
    expect(scroll).not.toBeNull();
    const children = Array.from(scroll!.children);
    expect(children[0]?.textContent.trim()).toBe("Unread");
  });

  it("marks the active unread toggle with aria-pressed", () => {
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 0,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
      unreadFilter: { label: "Unread", active: true, ontoggle: noop },
    });
    const toggles = container.querySelectorAll(".toggle-pill");
    expect(toggles.length).toBe(1);
    expect(toggles[0]?.getAttribute("aria-pressed")).toBe("true");
  });

  it("fires ontoggle when the unread pill is clicked", async () => {
    const onUnread = vi.fn();
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 0,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
      unreadFilter: { label: "Unread", active: false, ontoggle: onUnread },
    });
    const toggle = container.querySelector(".toggle-pill");
    await fireEvent.click(toggle!);
    expect(onUnread).toHaveBeenCalledTimes(1);
  });

  it("renders no toggle pill when the config is absent", () => {
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 0,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    });
    expect(container.querySelector(".toggle-pill")).toBeNull();
  });
});
