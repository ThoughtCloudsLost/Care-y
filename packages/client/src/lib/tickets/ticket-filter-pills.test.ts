// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  buildTicketFilterPills,
  ticketDatePillProps,
  ticketFilterFields,
  type TicketFilterPillsInput,
} from "./ticket-filter-pills.js";
import type { TicketFacets } from "./facet-filters.js";
import { createFilterStore } from "$lib/stores/filters.svelte.js";
import { createFilterDispatch } from "$lib/composables/create-filter-dispatch.svelte.js";
import type { PillDefinition } from "$lib/components/filters/filter-types.js";

const ME = "user-me";

const FACETS: TicketFacets = {
  status: { new: 4, active: 3, hold: 2, closed: 1 },
  priority: { low: 1, normal: 5, high: 2, urgent: 1 },
  queue: new Map([["q-1", 6]]),
  assignee: { mine: 3, unassigned: 4 },
  unread: 2,
  needsAttention: 5,
  total: 9,
};

function input(
  overrides: Partial<TicketFilterPillsInput> = {},
): TicketFilterPillsInput {
  return {
    filters: createFilterStore(),
    facets: FACETS,
    facetsComplete: true,
    unreadCountReady: true,
    queues: [{ id: "q-1", name: "Intake" }],
    queuesLoading: false,
    currentUserId: ME,
    ...overrides,
  };
}

function pill(pills: PillDefinition[], id: string): PillDefinition {
  const found = pills.find((p) => p.id === id);
  if (found === undefined) throw new Error(`no ${id} pill`);
  return found;
}

function labels(p: PillDefinition): string[] {
  return p.options.map((o) => o.label);
}

describe("buildTicketFilterPills", () => {
  it("builds the tickets page's pills in bar order with counts", () => {
    const pills = buildTicketFilterPills(input());

    expect(pills.map((p) => [p.id, p.mode])).toEqual([
      ["status", "multi"],
      ["queue", "multi"],
      ["priority", "multi"],
      ["assignee", "single"],
      ["date", "date"],
    ]);
    expect(pills.map((p) => p.label)).toEqual([
      "Status",
      "Queue",
      "Priority",
      "Assignee",
      "Date",
    ]);
    expect(labels(pill(pills, "status"))).toEqual([
      "New (4)",
      "Active (3)",
      "On Hold (2)",
      "Closed (1)",
      "Unread (2)",
    ]);
    expect(pill(pills, "status").options.map((o) => o.value)).toEqual([
      "new",
      "active",
      "hold",
      "closed",
      "unread",
    ]);
    expect(labels(pill(pills, "queue"))).toEqual(["Intake (6)"]);
    expect(labels(pill(pills, "priority"))).toEqual([
      "Low (1)",
      "Normal (5)",
      "High (2)",
      "Urgent (1)",
      "Needs attention (5)",
    ]);
    expect(pill(pills, "assignee").options).toEqual([
      { value: ME, label: "Me (3)" },
      { value: "__unassigned__", label: "Unassigned (4)" },
    ]);
  });

  it("leaves labels bare until counts are known", () => {
    const pills = buildTicketFilterPills(input({ facets: undefined }));
    expect(labels(pill(pills, "status"))[0]).toBe("New");
    expect(labels(pill(pills, "queue"))).toEqual(["Intake"]);
  });

  it("marks counts as floors while the index is incomplete", () => {
    const pills = buildTicketFilterPills(input({ facetsComplete: false }));
    expect(labels(pill(pills, "status"))[0]).toBe("New (4+)");
  });

  it("keeps the unread count bare until read state settles", () => {
    const pills = buildTicketFilterPills(input({ unreadCountReady: false }));
    expect(labels(pill(pills, "status"))[4]).toBe("Unread");
  });

  it("marks a decrypting queue name", () => {
    const pills = buildTicketFilterPills(
      input({ queues: [{ id: "q-1", name: null }] }),
    );
    expect(labels(pill(pills, "queue"))).toEqual(["... (6)"]);
  });

  it("selects the unread and needs-attention options from the store's toggles", () => {
    const store = createFilterStore();
    store.toggleStatus("new");
    store.setUnreadOnly(true);
    store.togglePriority("high");
    store.setNeedsAttentionOnly(true);
    store.setAssignee(null);
    const pills = buildTicketFilterPills(input({ filters: store }));

    expect(pill(pills, "status").selected).toEqual(new Set(["new", "unread"]));
    expect(pill(pills, "priority").selected).toEqual(
      new Set(["high", "needs-attention"]),
    );
    expect(pill(pills, "assignee").selected).toBe("__unassigned__");
  });

  it("leaves out hidden pills", () => {
    const pills = buildTicketFilterPills(input({ hidden: ["assignee"] }));
    expect(pills.map((p) => p.id)).toEqual([
      "status",
      "queue",
      "priority",
      "date",
    ]);

    const onHold = buildTicketFilterPills(input({ hidden: ["status"] }));
    expect(onHold.map((p) => p.id)).not.toContain("status");
  });

  it("drops the needs-attention option but keeps the priority pill", () => {
    const pills = buildTicketFilterPills(
      input({ hidden: ["needs-attention"] }),
    );
    const priority = pill(pills, "priority");
    expect(priority.options.map((o) => o.value)).toEqual([
      "low",
      "normal",
      "high",
      "urgent",
    ]);
    expect(pills).toHaveLength(5);
  });
});

describe("ticketFilterFields", () => {
  it("routes every pill to its store update", () => {
    const store = createFilterStore();
    const dispatch = createFilterDispatch({
      fields: ticketFilterFields(store),
      clearAll: () => {
        store.clearAll();
      },
    });

    dispatch.handlePillToggle("status", "hold");
    dispatch.handlePillToggle("status", "unread");
    dispatch.handlePillToggle("queue", "q-1");
    dispatch.handlePillToggle("priority", "urgent");
    dispatch.handlePillToggle("priority", "needs-attention");
    dispatch.handlePillToggle("priority", "not-a-priority");
    dispatch.handlePillSelect("assignee", "__unassigned__");

    expect([...store.statuses]).toEqual(["hold"]);
    expect(store.unreadOnly).toBe(true);
    expect([...store.queueIds]).toEqual(["q-1"]);
    expect([...store.priorities]).toEqual(["urgent"]);
    expect(store.needsAttentionOnly).toBe(true);
    expect(store.assigneeId).toBeNull();

    dispatch.handlePillSelect("assignee", ME);
    expect(store.assigneeId).toBe(ME);

    const from = new Date("2026-01-01T00:00:00Z");
    dispatch.handlePillDateChange(from, null);
    expect(store.dateFrom).toEqual(from);
    expect(store.dateTo).toBeNull();
  });
});

describe("ticketDatePillProps", () => {
  it("is inactive with no range", () => {
    expect(ticketDatePillProps({ dateFrom: null, dateTo: null })).toEqual({
      dateFrom: "",
      dateTo: "",
      dateActive: false,
      dateLabel: "Date",
    });
  });

  it("carries the range as input values", () => {
    const props = ticketDatePillProps({
      dateFrom: new Date("2026-01-05T00:00:00Z"),
      dateTo: new Date("2026-01-20T00:00:00Z"),
    });
    expect(props.dateFrom).toBe("2026-01-05");
    expect(props.dateTo).toBe("2026-01-20");
    expect(props.dateActive).toBe(true);
  });
});
