// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import type { TicketForServerFilter } from "./ticket-list-utils.js";
import type {
  FacetFilterState,
  FacetContext,
  FacetDimension,
} from "./facet-filters.js";
import {
  matchesFilters,
  computeFacets,
  countMatches,
  facetFiltersOf,
  NO_FACET_FILTERS,
} from "./facet-filters.js";
import { createFilterStore } from "$lib/stores/filters.svelte.js";
import type { DisplayStatus } from "./display-status.js";
import { filterRow as row } from "./test-helpers/filter-row.js";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ME = "user-me";

/** ISO timestamps spread across January 2024. */
const JAN_05 = "2024-01-05T12:00:00Z";
const JAN_10 = "2024-01-10T12:00:00Z";
const JAN_15 = "2024-01-15T12:00:00Z";
const JAN_20 = "2024-01-20T12:00:00Z";
const JAN_25 = "2024-01-25T12:00:00Z";

/**
 * The fixture set covers all four display statuses, two queues, four
 * priorities, assigned/unassigned/assigned-to-me, and a spread of dates.
 */
const ROWS: readonly TicketForServerFilter[] = [
  // new: open, 0 follow-ups, unassigned, general queue
  row({ id: "t-new-1", priority: "low", createdAt: JAN_05 }),
  row({
    id: "t-new-2",
    priority: "normal",
    createdAt: JAN_10,
    queueId: "q-support",
  }),

  // active: open, follow-ups > 0, assigned to me
  row({
    id: "t-active-1",
    followUpCount: 3,
    priority: "high",
    assignedTo: ME,
    createdAt: JAN_15,
  }),
  row({
    id: "t-active-2",
    followUpCount: 1,
    priority: "urgent",
    assignedTo: ME,
    createdAt: JAN_20,
    queueId: "q-support",
  }),

  // hold: onHold = true
  row({
    id: "t-hold-1",
    onHold: true,
    followUpCount: 2,
    priority: "normal",
    assignedTo: "user-other",
    createdAt: JAN_15,
  }),

  // closed
  row({
    id: "t-closed-1",
    status: "closed",
    followUpCount: 5,
    priority: "low",
    createdAt: JAN_25,
  }),
  row({
    id: "t-closed-2",
    status: "closed",
    followUpCount: 1,
    priority: "urgent",
    assignedTo: ME,
    createdAt: JAN_20,
    queueId: "q-support",
  }),
];

const UNREAD_IDS = new Set(["t-new-1", "t-active-2", "t-hold-1"]);

function makeCtx(currentUserId: string | undefined = ME): FacetContext {
  return {
    currentUserId,
    isUnread: (id: string) => UNREAD_IDS.has(id),
  };
}

// ---------------------------------------------------------------------------
// matchesFilters
// ---------------------------------------------------------------------------

describe("matchesFilters", () => {
  it("accepts every row when no filters are active", () => {
    const filters = NO_FACET_FILTERS;
    const ctx = makeCtx();
    for (const r of ROWS) {
      expect(matchesFilters(r, filters, ctx)).toBe(true);
    }
  });

  it("filters by status using deriveDisplayStatus", () => {
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      statuses: new Set<DisplayStatus>(["new"]),
    };
    const ctx = makeCtx();
    const passing = ROWS.filter((r) => matchesFilters(r, filters, ctx));
    expect(passing.map((r) => r.id)).toEqual(["t-new-1", "t-new-2"]);
  });

  it("filters by queue", () => {
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      queueIds: new Set(["q-support"]),
    };
    const ctx = makeCtx();
    const passing = ROWS.filter((r) => matchesFilters(r, filters, ctx));
    expect(passing.map((r) => r.id)).toEqual([
      "t-new-2",
      "t-active-2",
      "t-closed-2",
    ]);
  });

  it("filters by priority", () => {
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      priorities: new Set(["urgent"]),
    };
    const ctx = makeCtx();
    const passing = ROWS.filter((r) => matchesFilters(r, filters, ctx));
    expect(passing.map((r) => r.id)).toEqual(["t-active-2", "t-closed-2"]);
  });

  it("filters by assignee null (unassigned)", () => {
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      assigneeId: null,
    };
    const ctx = makeCtx();
    const passing = ROWS.filter((r) => matchesFilters(r, filters, ctx));
    // t-new-1, t-new-2, t-closed-1 have assignedTo === null
    expect(passing.map((r) => r.id)).toEqual([
      "t-new-1",
      "t-new-2",
      "t-closed-1",
    ]);
  });

  it("filters by assignee string (specific user)", () => {
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      assigneeId: ME,
    };
    const ctx = makeCtx();
    const passing = ROWS.filter((r) => matchesFilters(r, filters, ctx));
    expect(passing.map((r) => r.id)).toEqual([
      "t-active-1",
      "t-active-2",
      "t-closed-2",
    ]);
  });

  it("applies date range (dateFrom)", () => {
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      dateFrom: new Date(JAN_15),
    };
    const ctx = makeCtx();
    const passing = ROWS.filter((r) => matchesFilters(r, filters, ctx));
    // JAN_15 and later
    expect(passing.map((r) => r.id)).toEqual([
      "t-active-1",
      "t-active-2",
      "t-hold-1",
      "t-closed-1",
      "t-closed-2",
    ]);
  });

  it("applies date range (dateTo)", () => {
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      dateTo: new Date(JAN_10),
    };
    const ctx = makeCtx();
    const passing = ROWS.filter((r) => matchesFilters(r, filters, ctx));
    expect(passing.map((r) => r.id)).toEqual(["t-new-1", "t-new-2"]);
  });

  it("filters by unreadOnly", () => {
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      unreadOnly: true,
    };
    const ctx = makeCtx();
    const passing = ROWS.filter((r) => matchesFilters(r, filters, ctx));
    expect(passing.map((r) => r.id)).toEqual([
      "t-new-1",
      "t-active-2",
      "t-hold-1",
    ]);
  });

  it("filters by needsAttentionOnly", () => {
    // isNeedsAttention: open, not on hold, urgent/high, unassigned OR (assigned to me AND unread)
    // t-active-1: open, high, assigned to ME, but NOT unread -> no
    // t-active-2: open, urgent, assigned to ME, unread -> yes
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      needsAttentionOnly: true,
    };
    const ctx = makeCtx();
    const passing = ROWS.filter((r) => matchesFilters(r, filters, ctx));
    expect(passing.map((r) => r.id)).toEqual(["t-active-2"]);
  });

  it("skips the excluded dimension", () => {
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      statuses: new Set<DisplayStatus>(["new"]),
      priorities: new Set(["urgent"]),
    };
    const ctx = makeCtx();
    // With status excluded, priority filter still applies, so only urgent rows pass
    const passingExcludeStatus = ROWS.filter((r) =>
      matchesFilters(r, filters, ctx, "status"),
    );
    expect(passingExcludeStatus.map((r) => r.id)).toEqual([
      "t-active-2",
      "t-closed-2",
    ]);
  });

  it("applies date range even when its logical dimension is excluded", () => {
    // Date range has no FacetDimension, so excluding any dimension does not skip it
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      dateTo: new Date(JAN_10),
    };
    const ctx = makeCtx();
    for (const dim of [
      "status",
      "queue",
      "priority",
      "assignee",
      "unread",
      "needsAttention",
    ] as FacetDimension[]) {
      const passing = ROWS.filter((r) => matchesFilters(r, filters, ctx, dim));
      // Only JAN_05 and JAN_10 rows pass regardless of which dimension is excluded
      expect(passing.map((r) => r.id)).toEqual(["t-new-1", "t-new-2"]);
    }
  });
});

// ---------------------------------------------------------------------------
// computeFacets
// ---------------------------------------------------------------------------

describe("computeFacets", () => {
  it("reports correct totals with no filters", () => {
    const facets = computeFacets(ROWS, NO_FACET_FILTERS, makeCtx());
    expect(facets.status).toEqual({ new: 2, active: 2, hold: 1, closed: 2 });
    expect(facets.priority).toEqual({ low: 2, normal: 2, high: 1, urgent: 2 });
    expect(facets.queue.get("q-general")).toBe(4);
    expect(facets.queue.get("q-support")).toBe(3);
    expect(facets.assignee).toEqual({ mine: 3, unassigned: 3 });
    expect(facets.unread).toBe(3);
    expect(facets.needsAttention).toBe(1);
    expect(facets.total).toBe(7);
  });

  describe("each dimension's facet ignores its own filter", () => {
    it("status facet still shows all four statuses when one status is selected", () => {
      const filters: FacetFilterState = {
        ...NO_FACET_FILTERS,
        statuses: new Set<DisplayStatus>(["new"]),
      };
      const facets = computeFacets(ROWS, filters, makeCtx());
      // Status facet excludes the status filter from its own count
      expect(facets.status.new).toBe(2);
      expect(facets.status.active).toBe(2);
      expect(facets.status.hold).toBe(1);
      expect(facets.status.closed).toBe(2);
    });

    it("priority facet still shows all priorities when one is selected", () => {
      const filters: FacetFilterState = {
        ...NO_FACET_FILTERS,
        priorities: new Set(["urgent"]),
      };
      const facets = computeFacets(ROWS, filters, makeCtx());
      expect(facets.priority.low).toBe(2);
      expect(facets.priority.normal).toBe(2);
      expect(facets.priority.high).toBe(1);
      expect(facets.priority.urgent).toBe(2);
    });

    it("queue facet still shows both queues when one is selected", () => {
      const filters: FacetFilterState = {
        ...NO_FACET_FILTERS,
        queueIds: new Set(["q-general"]),
      };
      const facets = computeFacets(ROWS, filters, makeCtx());
      expect(facets.queue.get("q-general")).toBe(4);
      expect(facets.queue.get("q-support")).toBe(3);
    });

    it("assignee facet still shows both mine and unassigned when filtered to unassigned", () => {
      const filters: FacetFilterState = {
        ...NO_FACET_FILTERS,
        assigneeId: null,
      };
      const facets = computeFacets(ROWS, filters, makeCtx());
      expect(facets.assignee.mine).toBe(3);
      expect(facets.assignee.unassigned).toBe(3);
    });

    it("unread facet count is not reduced by the unreadOnly filter", () => {
      const filters: FacetFilterState = {
        ...NO_FACET_FILTERS,
        unreadOnly: true,
      };
      const facets = computeFacets(ROWS, filters, makeCtx());
      // Unread facet excludes its own filter, so count reflects all unread rows
      expect(facets.unread).toBe(3);
    });

    it("needsAttention facet count is not reduced by needsAttentionOnly filter", () => {
      const filters: FacetFilterState = {
        ...NO_FACET_FILTERS,
        needsAttentionOnly: true,
      };
      const facets = computeFacets(ROWS, filters, makeCtx());
      expect(facets.needsAttention).toBe(1);
    });
  });

  describe("each dimension's facet respects other active filters", () => {
    it("status facet only counts rows in the selected queue", () => {
      const filters: FacetFilterState = {
        ...NO_FACET_FILTERS,
        queueIds: new Set(["q-support"]),
      };
      const facets = computeFacets(ROWS, filters, makeCtx());
      // q-support rows: t-new-2 (new), t-active-2 (active), t-closed-2 (closed)
      expect(facets.status).toEqual({ new: 1, active: 1, hold: 0, closed: 1 });
    });

    it("priority facet only counts rows matching the selected status", () => {
      const filters: FacetFilterState = {
        ...NO_FACET_FILTERS,
        statuses: new Set<DisplayStatus>(["active"]),
      };
      const facets = computeFacets(ROWS, filters, makeCtx());
      // Active rows: t-active-1 (high), t-active-2 (urgent)
      expect(facets.priority).toEqual({
        low: 0,
        normal: 0,
        high: 1,
        urgent: 1,
      });
    });

    it("unreadOnly narrows status and priority facets to unread rows only", () => {
      const filters: FacetFilterState = {
        ...NO_FACET_FILTERS,
        unreadOnly: true,
      };
      const facets = computeFacets(ROWS, filters, makeCtx());
      // Unread rows: t-new-1 (new, low), t-active-2 (active, urgent), t-hold-1 (hold, normal)
      expect(facets.status).toEqual({ new: 1, active: 1, hold: 1, closed: 0 });
      expect(facets.priority).toEqual({
        low: 1,
        normal: 1,
        high: 0,
        urgent: 1,
      });
    });
  });

  describe("date range always applies and no dimension excludes it", () => {
    it("date range restricts all facet dimensions", () => {
      const filters: FacetFilterState = {
        ...NO_FACET_FILTERS,
        dateFrom: new Date(JAN_15),
        dateTo: new Date(JAN_20),
      };
      const facets = computeFacets(ROWS, filters, makeCtx());
      // Rows in range: t-active-1 (JAN_15), t-active-2 (JAN_20),
      //                t-hold-1 (JAN_15), t-closed-2 (JAN_20)
      expect(facets.status).toEqual({ new: 0, active: 2, hold: 1, closed: 1 });
      expect(facets.total).toBe(4);
    });

    it("status dimension exclusion does not bypass the date range", () => {
      const filters: FacetFilterState = {
        ...NO_FACET_FILTERS,
        statuses: new Set<DisplayStatus>(["new"]),
        dateTo: new Date(JAN_10),
      };
      const facets = computeFacets(ROWS, filters, makeCtx());
      // Status facet excludes its own filter but date range still limits to JAN_05 + JAN_10
      // In-range rows: t-new-1 (new, JAN_05), t-new-2 (new, JAN_10)
      expect(facets.status).toEqual({ new: 2, active: 0, hold: 0, closed: 0 });
    });
  });

  it("total equals the length of the fully filtered set", () => {
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      statuses: new Set<DisplayStatus>(["active"]),
      queueIds: new Set(["q-support"]),
    };
    const ctx = makeCtx();
    const facets = computeFacets(ROWS, filters, ctx);
    const manualCount = ROWS.filter((r) =>
      matchesFilters(r, filters, ctx),
    ).length;
    expect(facets.total).toBe(manualCount);
    expect(facets.total).toBe(1); // only t-active-2
  });
});

// ---------------------------------------------------------------------------
// Invariant: a facet count equals the list its option would produce
// ---------------------------------------------------------------------------

describe("facet count matches its own filtered list length", () => {
  const ctx = makeCtx();

  function assertFacetCountMatchesFilteredList(
    label: string,
    baseFilters: FacetFilterState,
  ): void {
    it(label, () => {
      const facets = computeFacets(ROWS, baseFilters, ctx);

      // Status dimension
      for (const ds of ["new", "active", "hold", "closed"] as DisplayStatus[]) {
        const withStatus: FacetFilterState = {
          ...baseFilters,
          statuses: new Set<DisplayStatus>([ds]),
        };
        const count = ROWS.filter((r) =>
          matchesFilters(r, withStatus, ctx),
        ).length;
        expect(facets.status[ds]).toBe(count);
      }

      // Priority dimension
      for (const p of ["low", "normal", "high", "urgent"]) {
        const withPriority: FacetFilterState = {
          ...baseFilters,
          priorities: new Set([p]),
        };
        const count = ROWS.filter((r) =>
          matchesFilters(r, withPriority, ctx),
        ).length;
        expect(facets.priority[p]).toBe(count);
      }

      // Assignee dimension
      const withMine: FacetFilterState = { ...baseFilters, assigneeId: ME };
      expect(facets.assignee.mine).toBe(
        ROWS.filter((r) => matchesFilters(r, withMine, ctx)).length,
      );
      const withUnassigned: FacetFilterState = {
        ...baseFilters,
        assigneeId: null,
      };
      expect(facets.assignee.unassigned).toBe(
        ROWS.filter((r) => matchesFilters(r, withUnassigned, ctx)).length,
      );

      // Unread dimension
      const withUnread: FacetFilterState = { ...baseFilters, unreadOnly: true };
      expect(facets.unread).toBe(
        ROWS.filter((r) => matchesFilters(r, withUnread, ctx)).length,
      );

      // Needs attention dimension
      const withNA: FacetFilterState = {
        ...baseFilters,
        needsAttentionOnly: true,
      };
      expect(facets.needsAttention).toBe(
        ROWS.filter((r) => matchesFilters(r, withNA, ctx)).length,
      );

      // Total
      expect(facets.total).toBe(
        ROWS.filter((r) => matchesFilters(r, baseFilters, ctx)).length,
      );
    });
  }

  assertFacetCountMatchesFilteredList("no filters", NO_FACET_FILTERS);

  assertFacetCountMatchesFilteredList("one status selected (new)", {
    ...NO_FACET_FILTERS,
    statuses: new Set<DisplayStatus>(["new"]),
  });

  assertFacetCountMatchesFilteredList(
    "two statuses spanning the held boundary (new + hold)",
    { ...NO_FACET_FILTERS, statuses: new Set<DisplayStatus>(["new", "hold"]) },
  );

  assertFacetCountMatchesFilteredList("queue plus priority", {
    ...NO_FACET_FILTERS,
    queueIds: new Set(["q-support"]),
    priorities: new Set(["urgent"]),
  });

  assertFacetCountMatchesFilteredList("assignee unassigned", {
    ...NO_FACET_FILTERS,
    assigneeId: null,
  });

  assertFacetCountMatchesFilteredList("unreadOnly combined with a status", {
    ...NO_FACET_FILTERS,
    statuses: new Set<DisplayStatus>(["active"]),
    unreadOnly: true,
  });
});

// ---------------------------------------------------------------------------
// base predicate
// ---------------------------------------------------------------------------

describe("base predicate", () => {
  const ctx = makeCtx();
  /** Open, not held, assigned to me: t-active-1 and t-active-2. */
  const mineOpen = (r: TicketForServerFilter): boolean =>
    r.status === "open" && !r.onHold && r.assignedTo === ME;

  it("matchesFilters rejects a row outside the base whatever the exclusion", () => {
    const outside = ROWS.find((r) => r.id === "t-new-1");
    expect(outside).toBeDefined();
    if (outside === undefined) return;
    const dims: (FacetDimension | undefined)[] = [
      undefined,
      "status",
      "queue",
      "priority",
      "assignee",
      "unread",
      "needsAttention",
    ];
    for (const dim of dims) {
      expect(
        matchesFilters(outside, NO_FACET_FILTERS, ctx, dim, mineOpen),
      ).toBe(false);
    }
  });

  it("option counts exclude rows outside the base", () => {
    const facets = computeFacets(ROWS, NO_FACET_FILTERS, ctx, mineOpen);
    expect(facets.status).toEqual({ new: 0, active: 2, hold: 0, closed: 0 });
    expect(facets.priority).toEqual({
      low: 0,
      normal: 0,
      high: 1,
      urgent: 1,
    });
    expect(facets.queue.get("q-general")).toBe(1);
    expect(facets.queue.get("q-support")).toBe(1);
    expect(facets.assignee).toEqual({ mine: 2, unassigned: 0 });
    expect(facets.unread).toBe(1);
    // t-active-2 is urgent, mine and unread; t-active-1 is high and mine
    // but read.
    expect(facets.needsAttention).toBe(1);
  });

  it("option counts under a user filter still exclude rows outside the base", () => {
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      priorities: new Set(["urgent"]),
    };
    const facets = computeFacets(ROWS, filters, ctx, mineOpen);
    // Without the base, t-closed-2 (urgent, mine, closed) would count here.
    expect(facets.status).toEqual({ new: 0, active: 1, hold: 0, closed: 0 });
    // The priority facet ignores its own filter but not the base.
    expect(facets.priority).toEqual({
      low: 0,
      normal: 0,
      high: 1,
      urgent: 1,
    });
  });

  it("total under base plus user filter equals the rows a list would show", () => {
    const base = (r: TicketForServerFilter): boolean => r.status === "open";
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      queueIds: new Set(["q-support"]),
    };
    const facets = computeFacets(ROWS, filters, ctx, base);
    const listed = ROWS.filter(
      (r) => base(r) && matchesFilters(r, filters, ctx),
    );
    expect(facets.total).toBe(listed.length);
    expect(facets.total).toBe(2);
  });

  it("an empty user filter under a base counts exactly the base", () => {
    const facets = computeFacets(ROWS, NO_FACET_FILTERS, ctx, mineOpen);
    expect(facets.total).toBe(ROWS.filter(mineOpen).length);
    expect(facets.total).toBe(2);
  });

  it("an absent base leaves counts unchanged", () => {
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      statuses: new Set<DisplayStatus>(["new", "hold"]),
    };
    expect(computeFacets(ROWS, filters, ctx, undefined)).toEqual(
      computeFacets(ROWS, filters, ctx),
    );
  });
});

describe("countMatches", () => {
  const ctx = makeCtx();
  const mineOpen = (r: TicketForServerFilter): boolean =>
    r.status === "open" && !r.onHold && r.assignedTo === ME;

  it("equals the facet total with and without a base", () => {
    const filters: FacetFilterState = {
      ...NO_FACET_FILTERS,
      priorities: new Set(["high", "urgent"]),
    };
    expect(countMatches(ROWS, filters, ctx)).toBe(
      computeFacets(ROWS, filters, ctx).total,
    );
    expect(countMatches(ROWS, filters, ctx, mineOpen)).toBe(
      computeFacets(ROWS, filters, ctx, mineOpen).total,
    );
    expect(countMatches(ROWS, NO_FACET_FILTERS, ctx, mineOpen)).toBe(2);
  });
});

describe("facetFiltersOf", () => {
  it("reads every facet dimension off a filter store", () => {
    const store = createFilterStore();
    store.toggleStatus("hold");
    store.toggleQueue("q-1");
    store.togglePriority("urgent");
    store.setAssignee(null);
    store.setUnreadOnly(true);

    const filters = facetFiltersOf(store);

    expect([...filters.statuses]).toEqual(["hold"]);
    expect([...filters.queueIds]).toEqual(["q-1"]);
    expect([...filters.priorities]).toEqual(["urgent"]);
    expect(filters.assigneeId).toBeNull();
    expect(filters.unreadOnly).toBe(true);
    expect(filters.needsAttentionOnly).toBe(false);
    expect(filters.dateFrom).toBeNull();
  });
});
