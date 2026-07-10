// @vitest-environment jsdom
/**
 * SubNavbarFilterLayout sort popover tests.
 *
 * The popover carries the server sort field options plus an optional
 * client-side presentation toggle ("New replies first" on the tickets
 * page). ShellPopover's portal targets .k-page, which does not exist
 * here, so the popover content stays inside the rendered container.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";

// vi.mock required: $lib/paraglide/messages.js is compiler-generated locale
// output; the FilterPillBar rendered inside this layout calls these message
// functions, and deterministic strings keep assertions locale-independent
// (same constraint and key set as FilterPillBar.test.ts).
vi.mock("$lib/paraglide/messages.js", () => ({
  tickets_filter: () => "Filter",
  tickets_filter_all: () => "All",
  tickets_clear_filters: () => "Clear all",
  tickets_create_shortcut: () => "Save filter shortcut",
  tickets_filter_date_from: () => "From",
  tickets_filter_date_to: () => "To",
  tickets_filter_date_clear: () => "Clear dates",
}));

import SubNavbarFilterLayout from "./SubNavbarFilterLayout.svelte";
import type { SortConfig } from "./types.js";

afterEach(cleanup);

const noop = vi.fn();

function makeSort(overrides: Partial<SortConfig> = {}): SortConfig {
  return {
    label: "Sort",
    options: [
      { field: "date", label: "Newest first" },
      { field: "priority", label: "Priority" },
    ],
    currentField: "date",
    currentDirection: "desc",
    onchange: noop,
    ...overrides,
  };
}

function renderLayout(sort: SortConfig) {
  return render(SubNavbarFilterLayout, {
    title: "Tickets",
    selectLabel: "Select",
    onselect: noop,
    sort,
    filterPills: {
      pills: [],
      activeCount: 0,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    },
  });
}

async function openSortPopover(container: HTMLElement): Promise<HTMLElement> {
  const button = container.querySelector<HTMLElement>("[aria-label='Sort']");
  expect(button).not.toBeNull();
  await fireEvent.click(button!);
  return button!;
}

describe("SubNavbarFilterLayout sort popover", () => {
  it("lists the sort field options when opened", async () => {
    const { container } = renderLayout(makeSort());
    await openSortPopover(container);

    expect(container.textContent).toContain("Newest first");
    expect(container.textContent).toContain("Priority");
  });

  it("renders the presentation toggle under the options with aria-pressed", async () => {
    const { container } = renderLayout(
      makeSort({
        toggle: { label: "New replies first", active: true, ontoggle: noop },
      }),
    );
    await openSortPopover(container);

    const item = container.querySelector(".sort-toggle-item");
    expect(item).not.toBeNull();
    expect(item?.textContent).toContain("New replies first");
    expect(item?.getAttribute("aria-pressed")).toBe("true");
  });

  it("marks an inactive toggle aria-pressed false with no check icon", async () => {
    const { container } = renderLayout(
      makeSort({
        toggle: { label: "New replies first", active: false, ontoggle: noop },
      }),
    );
    await openSortPopover(container);

    const item = container.querySelector(".sort-toggle-item");
    expect(item?.getAttribute("aria-pressed")).toBe("false");
    expect(item?.querySelector("svg")).toBeNull();
  });

  it("fires ontoggle and closes the popover when the toggle is tapped", async () => {
    const ontoggle = vi.fn();
    const { container } = renderLayout(
      makeSort({
        toggle: { label: "New replies first", active: false, ontoggle },
      }),
    );
    const button = await openSortPopover(container);
    expect(button.getAttribute("aria-expanded")).toBe("true");

    const item = container.querySelector<HTMLElement>(".sort-toggle-item");
    await fireEvent.click(item!);

    expect(ontoggle).toHaveBeenCalledTimes(1);
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("renders no toggle item when the sort config has none", async () => {
    const { container } = renderLayout(makeSort());
    await openSortPopover(container);

    expect(container.querySelector(".sort-toggle-item")).toBeNull();
  });
});
