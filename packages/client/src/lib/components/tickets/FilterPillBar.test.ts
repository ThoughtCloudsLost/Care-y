// @vitest-environment jsdom
/**
 * FilterPillBar component tests.
 *
 * Verifies pill rendering for each dimension, badge counter, clear all button,
 * create shortcut button visibility, and shared Popover behavior.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import { SvelteSet } from "svelte/reactivity";

// --- Mock i18n ---
vi.mock("$lib/paraglide/messages.js", () => ({
  tickets_filter: () => "Filter tickets",
  tickets_filter_status: () => "Status",
  tickets_filter_queue: () => "Queue",
  tickets_filter_priority: () => "Priority",
  tickets_filter_assignee: () => "Assignee",
  tickets_filter_date_range: () => "Date",
  tickets_filter_date_from: () => "From",
  tickets_filter_date_to: () => "To",
  tickets_filter_new: () => "New",
  tickets_filter_active: () => "Active",
  tickets_filter_hold: () => "On Hold",
  tickets_filter_closed: () => "Closed",
  tickets_filter_priority_low: () => "Low",
  tickets_filter_priority_normal: () => "Normal",
  tickets_filter_priority_high: () => "High",
  tickets_filter_priority_urgent: () => "Urgent",
  tickets_filter_all: () => "All",
  tickets_clear_filters: () => "Clear all",
  tickets_create_shortcut: () => "Save filter shortcut",
}));

// --- Mock TanStack Query ---
vi.mock("@tanstack/svelte-query", () => ({
  createQuery: () => ({
    isLoading: false,
    isError: false,
    data: [
      { id: "q-1", name: "Intake", openCount: "5" },
      { id: "q-2", name: "Housing", openCount: "3" },
    ],
  }),
}));

// --- Mock tRPC ---
vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      myQueues: { query: vi.fn() },
    },
  },
}));

// --- Mock errors ---
vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
}));

// --- Controllable filter store mock ---
let mockStatuses: SvelteSet<string>;
let mockQueueIds: SvelteSet<string>;
let mockPriorities: SvelteSet<string>;
let mockAssigneeId: string | null;
let mockDateFrom: Date | null;
let mockDateTo: Date | null;
let mockActiveCount: number;

function resetFilterMock(): void {
  mockStatuses = new SvelteSet<string>();
  mockQueueIds = new SvelteSet<string>();
  mockPriorities = new SvelteSet<string>();
  mockAssigneeId = null;
  mockDateFrom = null;
  mockDateTo = null;
  mockActiveCount = 0;
}

vi.mock("$lib/stores/filters.svelte.js", () => ({
  filterStore: {
    get statuses() {
      return mockStatuses;
    },
    toggleStatus: vi.fn((v: string) => {
      if (mockStatuses.has(v)) mockStatuses.delete(v);
      else mockStatuses.add(v);
    }),
    get queueIds() {
      return mockQueueIds;
    },
    toggleQueue: vi.fn(),
    get priorities() {
      return mockPriorities;
    },
    togglePriority: vi.fn(),
    get assigneeId() {
      return mockAssigneeId;
    },
    setAssignee: vi.fn(),
    get dateFrom() {
      return mockDateFrom;
    },
    get dateTo() {
      return mockDateTo;
    },
    setDateRange: vi.fn(),
    get activeCount() {
      return mockActiveCount;
    },
    clearAll: vi.fn(() => {
      resetFilterMock();
    }),
  },
}));

import FilterPillBar from "./FilterPillBar.svelte";

beforeEach(resetFilterMock);
afterEach(cleanup);

describe("FilterPillBar", () => {
  it("renders all filter dimension pills", () => {
    const { container } = render(FilterPillBar);
    const text = container.textContent;
    expect(text).toContain("Status");
    expect(text).toContain("Queue");
    expect(text).toContain("Priority");
    expect(text).toContain("Assignee");
    expect(text).toContain("Date");
  });

  it("hides badge counter and actions when no filters active", () => {
    mockActiveCount = 0;
    const { container } = render(FilterPillBar);
    expect(container.textContent).not.toContain("Clear all");
    expect(
      container.querySelector("[aria-label='Save filter shortcut']"),
    ).toBeNull();
  });

  it("shows badge counter matching active filter count", () => {
    mockActiveCount = 2;
    const { container } = render(FilterPillBar);
    const badge = container.querySelector(".filter-badge");
    expect(badge).not.toBeNull();
    expect(badge!.textContent!.trim()).toBe("2");
  });

  it("shows clear all button when filters are active", () => {
    mockActiveCount = 1;
    const { container } = render(FilterPillBar);
    expect(container.textContent).toContain("Clear all");
  });

  it("shows create shortcut button when filters are active", () => {
    mockActiveCount = 1;
    const { container } = render(FilterPillBar);
    const btn = container.querySelector("[aria-label='Save filter shortcut']");
    expect(btn).not.toBeNull();
  });

  it("has toolbar role with accessible label", () => {
    const { container } = render(FilterPillBar);
    const toolbar = container.querySelector("[role='toolbar']");
    expect(toolbar).not.toBeNull();
    expect(toolbar?.getAttribute("aria-label")).toBe("Filter tickets");
  });

  it("renders Popover outside the scroll container", () => {
    const { container } = render(FilterPillBar);
    const pillScroll = container.querySelector(".pill-scroll");
    // Konsta Popover renders a div with class containing "popover"
    // It should NOT be inside .pill-scroll
    const popoverInScroll = pillScroll?.querySelector(".popover");
    expect(popoverInScroll).toBeNull();
  });
});
