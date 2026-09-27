// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { dashboardLaneIdSchema, type DashboardLaneId } from "@care-y/shared";
import {
  DASHBOARD_LANE_CAP,
  DASHBOARD_LANE_IDS,
  dashboardLaneCap,
  dropHiddenDimensions,
  getLaneDefinition,
  isEmptyLaneFilterState,
  laneFilterStatesEqual,
  laneSeeAllState,
  mergeLaneParams,
  planApplyToAll,
  type ApplyToAllTarget,
  type LaneQuery,
  type LaneServerParams,
} from "./dashboard-lanes.js";
import { facetFiltersOf, matchesFilters } from "./facet-filters.js";
import { emptyLaneFilterState } from "$lib/prefs/dashboard-filters.svelte.js";
import type { DisplayStatus } from "./display-status.js";
import { isNeedsAttention } from "$lib/components/dashboard/filters.js";
import {
  createFilterStore,
  type FilterStore,
  type TicketListServerParams,
} from "$lib/stores/filters.svelte.js";
import { filterRow as row } from "./test-helpers/filter-row.js";

const ME = "user-me";
const OTHER = "user-other";

const UNREAD_IDS = new Set(["t-mine-high-unread"]);
const ctx = { isUnread: (id: string): boolean => UNREAD_IDS.has(id) };

/**
 * The user's params as the lane's filter store produces them, so status
 * selections go through the store's own display-status translation.
 */
function userParams(
  statuses: readonly DisplayStatus[] = [],
  set?: (store: FilterStore) => void,
): TicketListServerParams {
  const store = createFilterStore();
  for (const s of statuses) store.toggleStatus(s);
  set?.(store);
  return store.serverParams;
}

function merge(
  id: DashboardLaneId,
  user: TicketListServerParams,
): LaneQuery<TicketListServerParams> {
  return mergeLaneParams(getLaneDefinition(id, ME).serverParams, user);
}

const ROWS = [
  row({ id: "t-mine", assignedTo: ME }),
  row({ id: "t-mine-high-unread", assignedTo: ME, priority: "high" }),
  row({ id: "t-mine-high-read", assignedTo: ME, priority: "high" }),
  row({ id: "t-mine-held", assignedTo: ME, onHold: true }),
  row({ id: "t-mine-closed", assignedTo: ME, status: "closed" }),
  row({ id: "t-other", assignedTo: OTHER }),
  row({ id: "t-other-urgent", assignedTo: OTHER, priority: "urgent" }),
  row({ id: "t-unassigned" }),
  row({ id: "t-unassigned-urgent", priority: "urgent" }),
  row({ id: "t-unassigned-held", onHold: true }),
  row({ id: "t-unassigned-closed", status: "closed" }),
  row({ id: "t-other-held", assignedTo: OTHER, onHold: true }),
];

function laneIds(id: DashboardLaneId): string[] {
  const { base } = getLaneDefinition(id, ME);
  return ROWS.filter((r) => base(r, ctx)).map((r) => r.id);
}

describe("DASHBOARD_LANE_IDS", () => {
  it("lists the lanes in work-priority order", () => {
    expect(DASHBOARD_LANE_IDS).toEqual([
      "needs-attention",
      "my-tickets",
      "unassigned",
      "on-hold",
    ]);
  });

  it("holds exactly the schema's lane ids", () => {
    expect(DASHBOARD_LANE_IDS).toEqual(dashboardLaneIdSchema.options);
  });
});

describe("dashboardLaneCap", () => {
  it("keeps the cap for a single-column list", () => {
    expect(dashboardLaneCap(1)).toBe(DASHBOARD_LANE_CAP);
  });

  it("rounds the cap up to whole grid rows", () => {
    // 8 rows: 3 across needs 3 rows of 3; 5 across needs 2 rows of 5.
    expect(dashboardLaneCap(3)).toBe(9);
    expect(dashboardLaneCap(5)).toBe(10);
  });

  it("keeps a cap that already fills whole rows", () => {
    expect(dashboardLaneCap(2)).toBe(8);
    expect(dashboardLaneCap(4)).toBe(8);
  });

  it("treats a column count below one as one", () => {
    expect(dashboardLaneCap(0)).toBe(DASHBOARD_LANE_CAP);
  });
});

describe("getLaneDefinition", () => {
  describe("serverParams", () => {
    it("needs attention fetches open, unheld tickets", () => {
      expect(getLaneDefinition("needs-attention", ME).serverParams).toEqual({
        statuses: ["open"],
        onHold: false,
      });
    });

    it("my tickets fetches open, unheld tickets assigned to the viewer", () => {
      expect(getLaneDefinition("my-tickets", ME).serverParams).toEqual({
        statuses: ["open"],
        onHold: false,
        assignedTo: ME,
      });
    });

    it("unassigned fetches open, unheld, unassigned tickets", () => {
      expect(getLaneDefinition("unassigned", ME).serverParams).toEqual({
        statuses: ["open"],
        onHold: false,
        assignedTo: null,
      });
    });

    it("on hold fetches open, held tickets", () => {
      expect(getLaneDefinition("on-hold", ME).serverParams).toEqual({
        statuses: ["open"],
        onHold: true,
      });
    });
  });

  describe("base", () => {
    it("needs attention admits exactly the rows isNeedsAttention does", () => {
      expect(laneIds("needs-attention")).toEqual(
        ROWS.filter((r) => isNeedsAttention(r, ME, ctx.isUnread)).map(
          (r) => r.id,
        ),
      );
      expect(laneIds("needs-attention")).toEqual([
        "t-mine-high-unread",
        "t-unassigned-urgent",
      ]);
    });

    it("my tickets admits open, unheld tickets assigned to the viewer", () => {
      expect(laneIds("my-tickets")).toEqual([
        "t-mine",
        "t-mine-high-unread",
        "t-mine-high-read",
      ]);
    });

    it("unassigned admits open, unheld, unassigned tickets", () => {
      expect(laneIds("unassigned")).toEqual([
        "t-unassigned",
        "t-unassigned-urgent",
      ]);
    });

    it("on hold admits open, held tickets whoever holds them", () => {
      expect(laneIds("on-hold")).toEqual([
        "t-mine-held",
        "t-unassigned-held",
        "t-other-held",
      ]);
    });

    it("on hold leaves out a closed ticket that still carries the flag", () => {
      const { base } = getLaneDefinition("on-hold", ME);
      expect(base(row({ id: "t", status: "closed", onHold: true }), ctx)).toBe(
        false,
      );
    });
  });

  describe("hiddenPills", () => {
    it("hides the control each lane already fixes", () => {
      expect(getLaneDefinition("needs-attention", ME).hiddenPills).toEqual([
        "needs-attention",
      ]);
      expect(getLaneDefinition("my-tickets", ME).hiddenPills).toEqual([
        "assignee",
      ]);
      expect(getLaneDefinition("unassigned", ME).hiddenPills).toEqual([
        "assignee",
      ]);
      expect(getLaneDefinition("on-hold", ME).hiddenPills).toEqual(["status"]);
    });
  });
});

describe("mergeLaneParams", () => {
  it("sends the lane's params plus the user's sort and page size when the user filters nothing", () => {
    const user = userParams();
    expect(merge("my-tickets", user)).toEqual({
      kind: "query",
      params: {
        ...user,
        statuses: ["open"],
        onHold: false,
        assignedTo: ME,
      },
    });
  });

  it("keeps the lane's hold state under a status the lane admits", () => {
    const result = merge("my-tickets", userParams(["new"]));
    expect(result.kind).toBe("query");
    if (result.kind !== "query") return;
    expect(result.params.statuses).toEqual(["open"]);
    expect(result.params.onHold).toBe(false);
    expect(result.params.assignedTo).toBe(ME);
  });

  it("keeps the lane's hold state under a selection spanning the held boundary", () => {
    // New + Hold sends no onHold on its own; the lane still pins it.
    const result = merge("my-tickets", userParams(["new", "hold"]));
    expect(result.kind).toBe("query");
    if (result.kind !== "query") return;
    expect(result.params.onHold).toBe(false);
  });

  it("on hold with a user status of New is empty", () => {
    expect(merge("on-hold", userParams(["new"]))).toEqual({ kind: "empty" });
  });

  it("on hold with a user status of Closed is empty", () => {
    expect(merge("on-hold", userParams(["closed"]))).toEqual({
      kind: "empty",
    });
  });

  it("on hold with a user status of Hold queries held tickets", () => {
    const result = merge("on-hold", userParams(["hold"]));
    expect(result.kind).toBe("query");
    if (result.kind !== "query") return;
    expect(result.params.statuses).toEqual(["open"]);
    expect(result.params.onHold).toBe(true);
  });

  it("an unheld lane with a user status of Hold is empty", () => {
    for (const id of ["needs-attention", "my-tickets", "unassigned"] as const) {
      expect(merge(id, userParams(["hold"]))).toEqual({ kind: "empty" });
    }
  });

  it("an open lane with a user status of Closed is empty", () => {
    for (const id of DASHBOARD_LANE_IDS) {
      expect(merge(id, userParams(["closed"]))).toEqual({ kind: "empty" });
    }
  });

  it("a user assignee that disagrees with the lane's is empty", () => {
    expect(
      merge(
        "unassigned",
        userParams([], (s) => {
          s.setAssignee(ME);
        }),
      ),
    ).toEqual({ kind: "empty" });
    expect(
      merge(
        "my-tickets",
        userParams([], (s) => {
          s.setAssignee(null);
        }),
      ),
    ).toEqual({ kind: "empty" });
  });

  it("passes the user's assignee through a lane that leaves it open", () => {
    const result = merge(
      "on-hold",
      userParams([], (s) => {
        s.setAssignee(OTHER);
      }),
    );
    expect(result.kind).toBe("query");
    if (result.kind !== "query") return;
    expect(result.params.assignedTo).toBe(OTHER);
  });

  it("passes the user's queue, priority and date filters through", () => {
    const from = new Date("2024-01-01T00:00:00Z");
    const user = userParams([], (s) => {
      s.toggleQueue("q-1");
      s.togglePriority("urgent");
      s.setDateRange(from, null);
    });
    const result = merge("unassigned", user);
    expect(result.kind).toBe("query");
    if (result.kind !== "query") return;
    expect(result.params.queueIds).toEqual(["q-1"]);
    expect(result.params.priorities).toEqual(["urgent"]);
    expect(result.params.createdAfter).toBe(from.toISOString());
  });

  it("intersects an array dimension both sides set", () => {
    const lane: LaneServerParams = {
      priorities: ["high", "urgent"],
    };
    const both = mergeLaneParams(
      lane,
      userParams([], (s) => {
        s.togglePriority("urgent");
        s.togglePriority("low");
      }),
    );
    expect(both.kind).toBe("query");
    if (both.kind !== "query") return;
    expect(both.params.priorities).toEqual(["urgent"]);

    expect(
      mergeLaneParams(
        lane,
        userParams([], (s) => {
          s.togglePriority("low");
        }),
      ),
    ).toEqual({ kind: "empty" });
  });

  it("reads a user's empty array as no filter", () => {
    const lane = getLaneDefinition("on-hold", ME).serverParams;
    const result = mergeLaneParams(lane, { ...userParams(), statuses: [] });
    expect(result.kind).toBe("query");
    if (result.kind !== "query") return;
    expect(result.params.statuses).toEqual(["open"]);
  });

  it("never sends an empty array for any lane and status selection", () => {
    const all: DisplayStatus[] = ["new", "active", "hold", "closed"];
    for (const id of DASHBOARD_LANE_IDS) {
      for (let mask = 0; mask < 1 << all.length; mask++) {
        const selected = all.filter((_, i) => (mask & (1 << i)) !== 0);
        const result = merge(id, userParams(selected));
        if (result.kind !== "query") continue;
        for (const value of Object.values(result.params)) {
          if (Array.isArray(value)) expect(value.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("laneSeeAllState", () => {
  const SORT = { field: "last_activity", direction: "desc" } as const;
  const facetCtx = { currentUserId: ME, isUnread: ctx.isUnread };

  /** Rows the tickets page shows once "See all" applies the state. */
  function ticketsPageIds(
    id: DashboardLaneId,
    user = emptyLaneFilterState(),
  ): string[] {
    const store = createFilterStore();
    store.applyState(laneSeeAllState(getLaneDefinition(id, ME), user, SORT));
    const filters = facetFiltersOf(store);
    return ROWS.filter((r) => matchesFilters(r, filters, facetCtx)).map(
      (r) => r.id,
    );
  }

  it("lands every lane on exactly the tickets the lane holds", () => {
    for (const id of DASHBOARD_LANE_IDS) {
      expect(ticketsPageIds(id)).toEqual(laneIds(id));
    }
  });

  it("keeps the user's own filters alongside the lane's rule", () => {
    const user = { ...emptyLaneFilterState(), priorities: ["high" as const] };
    expect(ticketsPageIds("my-tickets", user)).toEqual([
      "t-mine-high-unread",
      "t-mine-high-read",
    ]);
  });

  it("narrows the lane's statuses to those the user picked", () => {
    const state = laneSeeAllState(
      getLaneDefinition("unassigned", ME),
      { ...emptyLaneFilterState(), statuses: ["active", "closed"] },
      SORT,
    );
    expect(state.statuses).toEqual(["active"]);
  });

  it("lets the lane's assignee override the user's", () => {
    const state = laneSeeAllState(
      getLaneDefinition("unassigned", ME),
      { ...emptyLaneFilterState(), assigneeId: OTHER },
      SORT,
    );
    expect(state.assigneeId).toBeNull();
  });

  it("carries the user's assignee through a lane that leaves it open", () => {
    const state = laneSeeAllState(
      getLaneDefinition("on-hold", ME),
      { ...emptyLaneFilterState(), assigneeId: OTHER },
      SORT,
    );
    expect(state.assigneeId).toBe(OTHER);
    expect(state.statuses).toEqual(["hold"]);
  });

  it("applies the lane's sort", () => {
    const state = laneSeeAllState(
      getLaneDefinition("needs-attention", ME),
      emptyLaneFilterState(),
      { field: "date", direction: "asc" },
    );
    expect(state.sortField).toBe("date");
    expect(state.sortDirection).toBe("asc");
    expect(state.needsAttentionOnly).toBe(true);
  });
});

describe("dropHiddenDimensions", () => {
  const FULL = {
    statuses: ["new" as const],
    queueIds: ["q-1"],
    priorities: ["high" as const],
    assigneeId: OTHER,
    dateFrom: "2026-01-01T00:00:00.000Z",
    dateTo: "2026-02-01T00:00:00.000Z",
    unreadOnly: true,
    needsAttentionOnly: true,
  };

  it("keeps everything when nothing is hidden", () => {
    expect(dropHiddenDimensions(FULL, [])).toEqual(FULL);
  });

  it("drops the assignee for a lane that hides it", () => {
    const next = dropHiddenDimensions(FULL, ["assignee"]);
    expect(next.assigneeId).toBeUndefined();
    expect(next.priorities).toEqual(["high"]);
  });

  it("drops statuses and the unread toggle with the status pill", () => {
    const next = dropHiddenDimensions(FULL, ["status"]);
    expect(next.statuses).toEqual([]);
    expect(next.unreadOnly).toBe(false);
    expect(next.needsAttentionOnly).toBe(true);
  });

  it("drops only the needs-attention toggle with that option", () => {
    const next = dropHiddenDimensions(FULL, ["needs-attention"]);
    expect(next.needsAttentionOnly).toBe(false);
    expect(next.priorities).toEqual(["high"]);
  });

  it("drops the date range with the date pill", () => {
    const next = dropHiddenDimensions(FULL, ["date"]);
    expect(next.dateFrom).toBeNull();
    expect(next.dateTo).toBeNull();
  });
});

describe("laneFilterStatesEqual and isEmptyLaneFilterState", () => {
  it("ignores list order", () => {
    expect(
      laneFilterStatesEqual(
        { ...emptyLaneFilterState(), priorities: ["high", "urgent"] },
        { ...emptyLaneFilterState(), priorities: ["urgent", "high"] },
      ),
    ).toBe(true);
  });

  it("tells differing states apart", () => {
    expect(
      laneFilterStatesEqual(
        { ...emptyLaneFilterState(), queueIds: ["q-1"] },
        { ...emptyLaneFilterState(), queueIds: ["q-2"] },
      ),
    ).toBe(false);
  });

  it("treats an absent and an undefined assignee alike", () => {
    expect(
      laneFilterStatesEqual(emptyLaneFilterState(), {
        ...emptyLaneFilterState(),
        assigneeId: undefined,
      }),
    ).toBe(true);
  });

  it("recognises the empty state", () => {
    expect(isEmptyLaneFilterState(emptyLaneFilterState())).toBe(true);
    expect(
      isEmptyLaneFilterState({ ...emptyLaneFilterState(), unreadOnly: true }),
    ).toBe(false);
    expect(
      isEmptyLaneFilterState({ ...emptyLaneFilterState(), assigneeId: null }),
    ).toBe(false);
  });
});

describe("planApplyToAll", () => {
  function target(
    id: DashboardLaneId,
    current = emptyLaneFilterState(),
  ): ApplyToAllTarget {
    return { id, hiddenPills: getLaneDefinition(id, ME).hiddenPills, current };
  }

  const SOURCE = {
    ...emptyLaneFilterState(),
    statuses: ["new" as const],
    priorities: ["urgent" as const],
    assigneeId: null,
    needsAttentionOnly: true,
  };

  it("copies the filter to every target, dropping what each hides", () => {
    const plan = planApplyToAll(SOURCE, [
      target("needs-attention"),
      target("my-tickets"),
      target("on-hold"),
    ]);
    const byId = new Map(plan.updates.map((u) => [u.id, u.state]));

    expect(byId.get("needs-attention")).toMatchObject({
      statuses: ["new"],
      priorities: ["urgent"],
      assigneeId: null,
      needsAttentionOnly: false,
    });
    expect(byId.get("my-tickets")?.assigneeId).toBeUndefined();
    expect(byId.get("my-tickets")?.needsAttentionOnly).toBe(true);
    expect(byId.get("on-hold")?.statuses).toEqual([]);
    expect(byId.get("on-hold")?.priorities).toEqual(["urgent"]);
  });

  it("never copies the source lane's rule", () => {
    // My tickets' own rule fixes the viewer as assignee; with no user
    // filter, nothing reaches the other lanes.
    const plan = planApplyToAll(emptyLaneFilterState(), [
      target("unassigned"),
      target("on-hold"),
    ]);
    for (const update of plan.updates) {
      expect(isEmptyLaneFilterState(update.state)).toBe(true);
      expect(update.state.assigneeId).toBeUndefined();
    }
  });

  it("needs no confirmation when the targets have no filters", () => {
    const plan = planApplyToAll(SOURCE, [
      target("my-tickets"),
      target("unassigned"),
    ]);
    expect(plan.overwriting).toBe(0);
  });

  it("needs no confirmation when a target already has what it would receive", () => {
    const plan = planApplyToAll(SOURCE, [
      target("on-hold", {
        ...emptyLaneFilterState(),
        priorities: ["urgent"],
        assigneeId: null,
        needsAttentionOnly: true,
      }),
    ]);
    expect(plan.overwriting).toBe(0);
  });

  it("counts targets whose own different filters would be replaced", () => {
    const plan = planApplyToAll(SOURCE, [
      target("my-tickets", { ...emptyLaneFilterState(), queueIds: ["q-1"] }),
      target("unassigned", { ...emptyLaneFilterState(), unreadOnly: true }),
      target("on-hold"),
    ]);
    expect(plan.overwriting).toBe(2);
  });
});
