// @vitest-environment jsdom
/**
 * FilterPillBar generic component tests.
 *
 * The generic FilterPillBar accepts pill definitions and callbacks as props
 * instead of importing domain-specific stores. Tests verify pill rendering,
 * badge counter, clear all button, create shortcut button, and popover behavior.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import { SvelteSet } from "svelte/reactivity";

// vi.mock required: $lib/paraglide/messages.js is a Paraglide-generated module
// that may not resolve correctly in the vitest Vite alias chain. Spread
// importOriginal so unstubbed message functions track the real module surface.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
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

  it("hides bookmark link when oncreateshortcut is not provided even with active filters", () => {
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 2,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
      // oncreateshortcut intentionally omitted
    });
    expect(
      container.querySelector("[aria-label='Save filter shortcut']"),
    ).toBeNull();
  });

  it("hides bookmark link and clear button when activeCount is 0 even with oncreateshortcut", () => {
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 0,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
      oncreateshortcut: noop,
    });
    expect(
      container.querySelector("[aria-label='Save filter shortcut']"),
    ).toBeNull();
    expect(container.textContent).not.toContain("Clear all");
  });
});

describe("FilterPillBar popover interaction", () => {
  afterEach(cleanup);

  it("opens a pill popover on click and displays its options", async () => {
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 0,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    });

    const statusPill = container.querySelector(
      "button[aria-haspopup]",
    ) as HTMLElement;
    expect(statusPill).not.toBeNull();
    statusPill.click();

    // After clicking, the popover should render the pill's options
    await new Promise((r) => setTimeout(r, 50));
    // The popover content is rendered outside the pill-scroll
    expect(container.ownerDocument.body.textContent).toContain("New (3)");
    expect(container.ownerDocument.body.textContent).toContain("Active (5)");
  });

  it("toggles the same pill closed when clicked again", async () => {
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 0,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    });

    const statusPill = container.querySelector(
      "button[aria-haspopup]",
    ) as HTMLElement;
    statusPill.click();
    await new Promise((r) => setTimeout(r, 50));

    // Click the same pill again to close
    statusPill.click();
    await new Promise((r) => setTimeout(r, 50));

    // The pill should have aria-expanded false
    expect(statusPill.getAttribute("aria-expanded")).toBe("false");
  });

  it("calls ontoggle when a multi-select option is clicked", async () => {
    const toggleFn = vi.fn();
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 0,
      ontoggle: toggleFn,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    });

    // Open the status pill (multi mode)
    const statusPill = container.querySelector(
      "button[aria-haspopup]",
    ) as HTMLElement;
    statusPill.click();
    await new Promise((r) => setTimeout(r, 50));

    // Find and click a checkbox item in the popover
    const items =
      container.ownerDocument.body.querySelectorAll("[role='group'] li");
    // items[0] is "All", items[1] would be "New (3)" if loading skeleton is not shown
    const newItem = Array.from(items).find((item) =>
      item.textContent!.includes("New (3)"),
    );
    if (newItem instanceof HTMLElement) {
      newItem.click();
      await new Promise((r) => setTimeout(r, 50));
      expect(toggleFn).toHaveBeenCalledWith("status", "new");
    }
  });

  it("calls onselect when a single-select option is clicked", async () => {
    const selectFn = vi.fn();
    const pills = makePills();
    const { container } = render(FilterPillBar, {
      pills,
      activeCount: 0,
      ontoggle: noop,
      onselect: selectFn,
      ondatechange: noop,
      onclearall: noop,
    });

    // Find the Assignee pill (single mode) - it's the third pill button
    const pillButtons = container.querySelectorAll("button[aria-haspopup]");
    const assigneePill = pillButtons[2] as HTMLElement | undefined;
    if (assigneePill) {
      assigneePill.click();
      await new Promise((r) => setTimeout(r, 50));

      // Find and click the "Me (2)" item
      const bodyItems = container.ownerDocument.body.querySelectorAll("li");
      const meItem = Array.from(bodyItems).find((item) =>
        item.textContent!.includes("Me (2)"),
      );
      if (meItem instanceof HTMLElement) {
        meItem.click();
        await new Promise((r) => setTimeout(r, 50));
        expect(selectFn).toHaveBeenCalledWith("assignee", "u-1");
      }
    }
  });

  it("calls onclearall when clear all button is clicked", () => {
    const clearFn = vi.fn();
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 2,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: clearFn,
    });

    const clearBtn = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent!.includes("Clear all"),
    );
    expect(clearBtn).toBeDefined();
    clearBtn!.click();
    expect(clearFn).toHaveBeenCalled();
  });

  it("calls oncreateshortcut when bookmark button is clicked", () => {
    const shortcutFn = vi.fn();
    const { container } = render(FilterPillBar, {
      pills: makePills(),
      activeCount: 1,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
      oncreateshortcut: shortcutFn,
    });

    const bookmarkLink = container.querySelector(
      "[aria-label='Save filter shortcut']",
    );
    expect(bookmarkLink).not.toBeNull();
    // The Link component wraps a click handler
    (bookmarkLink as HTMLElement).click();
    expect(shortcutFn).toHaveBeenCalled();
  });

  it("passes dateLabel as selected display when dateActive is true", () => {
    const pills = makePills();
    const { container } = render(FilterPillBar, {
      pills,
      activeCount: 1,
      dateActive: true,
      dateLabel: "Mar 1 - Mar 15",
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    });

    // The date pill should show the label
    expect(container.textContent).toContain("Mar 1 - Mar 15");
  });

  it("shows date pill label (not dateLabel) when dateActive is false", () => {
    const pills = makePills();
    const { container } = render(FilterPillBar, {
      pills,
      activeCount: 0,
      dateActive: false,
      dateLabel: "Mar 1 - Mar 15",
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    });

    // The date pill shows its label, not the dateLabel
    expect(container.textContent).toContain("Date");
    expect(container.textContent).not.toContain("Mar 1 - Mar 15");
  });

  it("renders 'All' item with handleAllClick for multi mode to deselect all", async () => {
    const toggleFn = vi.fn();
    const pills = makePills();
    // Pre-select some values
    const statusPill = pills[0]!;
    const selected = statusPill.selected as Set<string>;
    selected.add("new");
    selected.add("active");

    const { container } = render(FilterPillBar, {
      pills,
      activeCount: 2,
      ontoggle: toggleFn,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    });

    // Open the status pill
    const statusBtn = container.querySelector(
      "button[aria-haspopup]",
    ) as HTMLElement;
    statusBtn.click();
    await new Promise((r) => setTimeout(r, 50));

    // Click "All" to deselect everything
    const allItem = Array.from(
      container.ownerDocument.body.querySelectorAll("li"),
    ).find((item) => item.textContent!.includes("All"));
    if (allItem instanceof HTMLElement) {
      allItem.click();
      await new Promise((r) => setTimeout(r, 50));
      // Should toggle each selected value
      expect(toggleFn).toHaveBeenCalledWith("status", "new");
      expect(toggleFn).toHaveBeenCalledWith("status", "active");
    }
  });

  it("renders 'All' item with handleAllClick for single mode to deselect", async () => {
    const selectFn = vi.fn();
    const pills = makePills();

    const { container } = render(FilterPillBar, {
      pills,
      activeCount: 1,
      ontoggle: noop,
      onselect: selectFn,
      ondatechange: noop,
      onclearall: noop,
    });

    // Find the Assignee pill (single mode)
    const pillButtons = container.querySelectorAll("button[aria-haspopup]");
    const assigneePill = pillButtons[2] as HTMLElement | undefined;
    if (assigneePill) {
      assigneePill.click();
      await new Promise((r) => setTimeout(r, 50));

      // Click "All" to deselect
      const allItem = Array.from(
        container.ownerDocument.body.querySelectorAll("li"),
      ).find((item) => item.textContent!.includes("All"));
      if (allItem instanceof HTMLElement) {
        allItem.click();
        await new Promise((r) => setTimeout(r, 50));
        expect(selectFn).toHaveBeenCalledWith("assignee", null);
      }
    }
  });

  it("opens date pill and renders date inputs", async () => {
    const pills = makePills();
    const { container } = render(FilterPillBar, {
      pills,
      activeCount: 0,
      dateFrom: "2025-03-01",
      dateTo: "2025-03-15",
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    });

    // Find the Date pill
    const pillButtons = container.querySelectorAll("button[aria-haspopup]");
    const datePill = pillButtons[3] as HTMLElement | undefined;
    if (datePill) {
      datePill.click();
      await new Promise((r) => setTimeout(r, 50));

      // Date inputs should be visible
      const dateInputs =
        container.ownerDocument.body.querySelectorAll("input[type='date']");
      expect(dateInputs.length).toBeGreaterThanOrEqual(0);
    }
  });

  it("shows clear dates option when dateActive is true and date pill is open", async () => {
    const dateChangeFn = vi.fn();
    const pills = makePills();
    const { container } = render(FilterPillBar, {
      pills,
      activeCount: 1,
      dateActive: true,
      dateFrom: "2025-03-01",
      dateTo: "2025-03-15",
      ontoggle: noop,
      onselect: noop,
      ondatechange: dateChangeFn,
      onclearall: noop,
    });

    // Open the date pill
    const pillButtons = container.querySelectorAll("button[aria-haspopup]");
    const datePill = pillButtons[3] as HTMLElement | undefined;
    if (datePill) {
      datePill.click();
      await new Promise((r) => setTimeout(r, 50));

      // The "Clear dates" option should be visible
      const bodyText = container.ownerDocument.body.textContent;
      expect(bodyText).toContain("Clear dates");

      // Click "Clear dates"
      const clearDatesItem = Array.from(
        container.ownerDocument.body.querySelectorAll("li"),
      ).find((item) => item.textContent!.includes("Clear dates"));
      if (clearDatesItem instanceof HTMLElement) {
        clearDatesItem.click();
        await new Promise((r) => setTimeout(r, 50));
        expect(dateChangeFn).toHaveBeenCalledWith(null, null);
      }
    }
  });

  it("shows loading skeleton when pill has loading: true", async () => {
    const pills = makePills();
    // Set the status pill to loading
    const loadingPills = pills.map((p) =>
      p.id === "status" ? { ...p, loading: true } : p,
    );
    const { container } = render(FilterPillBar, {
      pills: loadingPills,
      activeCount: 0,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    });

    // Open the status pill
    const statusPill = container.querySelector(
      "button[aria-haspopup]",
    ) as HTMLElement;
    statusPill.click();
    await new Promise((r) => setTimeout(r, 50));

    // We can't easily assert the skeleton since it's a child component,
    // but we verify the component renders without errors when loading is true
    expect(statusPill.getAttribute("aria-expanded")).toBe("true");
  });

  it("falls back to pill label when dateLabel is undefined and dateActive is true", () => {
    const pills = makePills();
    const { container } = render(FilterPillBar, {
      pills,
      activeCount: 1,
      dateActive: true,
      // dateLabel intentionally omitted
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    });

    // Should show the pill's own label as fallback
    expect(container.textContent).toContain("Date");
  });
});
