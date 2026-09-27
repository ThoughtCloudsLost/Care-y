// @vitest-environment jsdom
/**
 * Runes-mode tests for createDashboardLane.
 *
 * The lane's tickets.list query is a controllable fake: TanStack's
 * createInfiniteQuery needs a component context this test does not have.
 * The fake records the options the lane builds, so the tests read the
 * params and key the lane would fetch with. The dashboard filters
 * document is a fake facade over reactive state.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushSync } from "svelte";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as DashboardFiltersNS from "$lib/prefs/dashboard-filters.svelte.js";
import type { DashboardLaneId, LaneFilterState } from "@care-y/shared";
import {
  createDashboardLane,
  type DashboardLane,
  type DashboardLaneDeps,
} from "./create-dashboard-lane.svelte.js";
import { ticketsKeys } from "$lib/query/keys.js";
import { filterStore } from "$lib/stores/filters.svelte.js";
import {
  getLaneDefinition,
  mergeLaneParams,
} from "$lib/tickets/dashboard-lanes.js";
import type {
  FacetIndexData,
  TicketListQueryOptions,
  TicketRouter,
} from "$lib/tickets/queries.js";
import type { TicketForServerFilter } from "$lib/tickets/ticket-list-utils.js";
import { filterRow as row } from "$lib/tickets/test-helpers/filter-row.js";

// ── Fake tickets.list query ──

const fakeQuery = $state({
  data: undefined as
    { pages: TicketForServerFilter[][]; pageParams: unknown[] } | undefined,
  isLoading: false,
  isFetching: false,
  isSuccess: false,
  isError: false,
  isFetchNextPageError: false,
  error: null as unknown,
  hasNextPage: false,
});

const fetchNextPage = vi.fn(async () => undefined);
const refetch = vi.fn(async () => undefined);

let lastOptions: (() => TicketListQueryOptions) | undefined;

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
  createInfiniteQuery: (optsFn: () => TicketListQueryOptions) => {
    lastOptions = optsFn;
    return {
      get data() {
        return fakeQuery.data;
      },
      get isLoading() {
        return fakeQuery.isLoading;
      },
      get isFetching() {
        return fakeQuery.isFetching;
      },
      get isSuccess() {
        return fakeQuery.isSuccess;
      },
      get isError() {
        return fakeQuery.isError;
      },
      get isFetchNextPageError() {
        return fakeQuery.isFetchNextPageError;
      },
      get error() {
        return fakeQuery.error;
      },
      get hasNextPage() {
        return fakeQuery.hasNextPage;
      },
      fetchNextPage,
      refetch,
    };
  },
}));

function options(): TicketListQueryOptions {
  if (lastOptions === undefined) throw new Error("no query created");
  return lastOptions();
}

// ── Fake dashboard filters document ──

const fakeFilters = $state({
  hydrated: false,
  lanes: {} as Partial<Record<DashboardLaneId, LaneFilterState>>,
});

const setLane = vi.fn((laneId: DashboardLaneId, state: LaneFilterState) => {
  fakeFilters.lanes = { ...fakeFilters.lanes, [laneId]: state };
});

vi.mock("$lib/prefs/dashboard-filters.svelte.js", async (importOriginal) => {
  const actual = await importOriginal<typeof DashboardFiltersNS>();
  return {
    ...actual,
    dashboardFilters: {
      get hydrated() {
        return fakeFilters.hydrated;
      },
      get value() {
        const empty = actual.emptyLaneFilterState();
        return {
          lanes: {
            "needs-attention": fakeFilters.lanes["needs-attention"] ?? empty,
            "my-tickets": fakeFilters.lanes["my-tickets"] ?? empty,
            unassigned: fakeFilters.lanes.unassigned ?? empty,
            "on-hold": fakeFilters.lanes["on-hold"] ?? empty,
          },
        };
      },
      // Deferred: the factory runs during imports, before setLane exists.
      setLane: (laneId: DashboardLaneId, state: LaneFilterState) => {
        setLane(laneId, state);
      },
    },
  };
});

// ── Harness ──

const ME = "user-me";
const OTHER = "user-other";

let facetIndex = $state<FacetIndexData | undefined>(undefined);

const openTickets = vi.fn();

function makeDeps(
  overrides: Partial<DashboardLaneDeps> = {},
): DashboardLaneDeps {
  return {
    currentUserId: () => ME,
    // The fake query never calls the router.
    ticketRouter: {} as TicketRouter,
    facetIndex: () => facetIndex,
    isUnread: () => false,
    cap: () => 3,
    queryClient: {} as DashboardLaneDeps["queryClient"],
    openTickets,
    ...overrides,
  };
}

let destroy: (() => void) | undefined;

function createLane(
  laneId: DashboardLaneId,
  overrides: Partial<DashboardLaneDeps> = {},
): DashboardLane {
  const box: { lane?: DashboardLane } = {};
  destroy = $effect.root(() => {
    box.lane = createDashboardLane(laneId, makeDeps(overrides));
  });
  flushSync();
  if (!box.lane) throw new Error("lane did not initialize");
  return box.lane;
}

function loadRows(rows: TicketForServerFilter[], hasNextPage = false): void {
  fakeQuery.data = { pages: [rows], pageParams: [undefined] };
  fakeQuery.isSuccess = true;
  fakeQuery.hasNextPage = hasNextPage;
  flushSync();
}

// Mine unless stated; one of mine is held, one belongs to someone else.
const MINE = [
  row({ id: "m1", assignedTo: ME }),
  row({ id: "m2", assignedTo: ME, priority: "high" }),
  row({ id: "m3", assignedTo: ME, priority: "high" }),
  row({ id: "m-held", assignedTo: ME, onHold: true }),
  row({ id: "o1", assignedTo: OTHER }),
];

beforeEach(() => {
  fakeQuery.data = undefined;
  fakeQuery.isLoading = false;
  fakeQuery.isFetching = false;
  fakeQuery.isSuccess = false;
  fakeQuery.isError = false;
  fakeQuery.isFetchNextPageError = false;
  fakeQuery.error = null;
  fakeQuery.hasNextPage = false;
  fakeFilters.hydrated = false;
  fakeFilters.lanes = {};
  facetIndex = undefined;
  lastOptions = undefined;
  fetchNextPage.mockClear();
  refetch.mockClear();
  setLane.mockClear();
  openTickets.mockClear();
  filterStore.clearAll();
});

afterEach(() => {
  destroy?.();
  destroy = undefined;
});

// ── Tests ──

describe("createDashboardLane", () => {
  describe("params", () => {
    it("fetches the lane's params merged with the user's filters", () => {
      const lane = createLane("my-tickets");
      const merged = mergeLaneParams(
        getLaneDefinition("my-tickets", ME).serverParams,
        lane.filters.serverParams,
      );
      expect(merged.kind).toBe("query");
      if (merged.kind !== "query") return;
      expect(options().queryKey).toEqual(ticketsKeys.list(merged.params));
      expect(options().enabled).not.toBe(false);

      lane.filters.togglePriority("high");
      flushSync();

      const key = options().queryKey;
      expect(key).toEqual(
        ticketsKeys.list({
          ...merged.params,
          priorities: ["high"],
        }),
      );
    });

    it("sends no request when the user's filters empty the lane", () => {
      const lane = createLane("on-hold");
      lane.filters.toggleStatus("new");
      flushSync();

      expect(options().enabled).toBe(false);
      expect(lane.loading).toBe(false);
      expect(lane.settled).toBe(true);

      // Rows under the idle key never reach the lane.
      loadRows([row({ id: "h1", onHold: true })]);
      expect(lane.items).toEqual([]);
    });

    it("is inert without a signed-in user", () => {
      facetIndex = { rows: MINE, complete: true };
      const lane = createLane("my-tickets", {
        currentUserId: () => undefined,
      });
      loadRows(MINE);

      expect(options().enabled).toBe(false);
      expect(lane.items).toEqual([]);
      expect(lane.count).toBeUndefined();
      expect(lane.hiddenPills).toEqual([]);
      expect(lane.settled).toBe(false);
    });
  });

  describe("items and count", () => {
    it("narrows loaded rows to the lane's rule", () => {
      const lane = createLane("my-tickets", { cap: () => 10 });
      loadRows(MINE);
      expect(lane.items.map((t) => t.id)).toEqual(["m1", "m2", "m3"]);
      expect(lane.rows).toHaveLength(MINE.length);
    });

    it("counts exactly the rows the list holds once every row is loaded", () => {
      facetIndex = { rows: MINE, complete: true };
      const lane = createLane("my-tickets", { cap: () => 10 });
      loadRows(MINE);
      expect(lane.count).toBe(lane.items.length);

      lane.filters.togglePriority("high");
      flushSync();
      loadRows(MINE);
      expect(lane.items.map((t) => t.id)).toEqual(["m2", "m3"]);
      expect(lane.count).toBe(lane.items.length);
      expect(lane.baseCount).toBe(3);
    });

    it("leaves the count undefined until the facet index lands", () => {
      const lane = createLane("my-tickets");
      loadRows(MINE);
      expect(lane.count).toBeUndefined();

      facetIndex = { rows: MINE, complete: true };
      flushSync();
      expect(lane.count).toBe(3);
    });

    it("marks the count as a floor while the facet index is incomplete", () => {
      facetIndex = { rows: MINE, complete: false };
      const lane = createLane("my-tickets");
      expect(lane.countIsFloor).toBe(true);
    });

    it("caps the shown count", () => {
      const lane = createLane("my-tickets", { cap: () => 2 });
      loadRows(MINE);
      expect(lane.shownCount).toBe(2);
    });
  });

  describe("option counts", () => {
    it("computes option counts only while the filter row shows", () => {
      facetIndex = { rows: MINE, complete: true };
      const lane = createLane("my-tickets");
      expect(lane.filterToggle.shown).toBe(false);
      expect(lane.facets).toBeUndefined();
      // The heading count does not wait for the options.
      expect(lane.count).toBe(3);

      lane.filterToggle.toggle();
      flushSync();
      expect(lane.facets?.total).toBe(3);
      expect(lane.facets?.priority.high).toBe(2);
      expect(lane.count).toBe(3);

      lane.filterToggle.toggle();
      flushSync();
      expect(lane.facets).toBeUndefined();
    });

    it("counts options under the lane's active filters while the row shows", () => {
      facetIndex = { rows: MINE, complete: true };
      const lane = createLane("my-tickets");
      lane.filters.togglePriority("high");
      flushSync();
      // Filters set after the load leave the button where it was.
      expect(lane.filterToggle.shown).toBe(false);

      lane.filterToggle.toggle();
      flushSync();
      expect(lane.facets?.total).toBe(2);
      expect(lane.count).toBe(2);
    });

    it("names its filter row after the lane", () => {
      const lane = createLane("on-hold");
      expect(lane.filterToggle.rowId).toBe("on-hold-filters");
    });
  });

  describe("user filters", () => {
    it("reads the user's filters without sort or the lane's rule", () => {
      const lane = createLane("my-tickets");
      lane.filters.togglePriority("urgent");
      flushSync();
      const state = lane.userFilters();
      expect(state.priorities).toEqual(["urgent"]);
      expect(state.assigneeId).toBeUndefined();
      expect(state.statuses).toEqual([]);
      expect(state).not.toHaveProperty("sortField");
    });

    it("applies filters, keeps the lane's sort, and saves them", () => {
      fakeFilters.hydrated = true;
      const lane = createLane("unassigned");
      const sort = lane.filters.sort;
      lane.applyUserFilters({
        statuses: ["new"],
        queueIds: ["q-1"],
        priorities: [],
        dateFrom: null,
        dateTo: null,
        unreadOnly: true,
        needsAttentionOnly: false,
      });
      flushSync();

      expect([...lane.filters.statuses]).toEqual(["new"]);
      expect([...lane.filters.queueIds]).toEqual(["q-1"]);
      expect(lane.filters.unreadOnly).toBe(true);
      expect(lane.filters.sort).toEqual(sort);
      expect(setLane).toHaveBeenCalledOnce();
      expect(setLane.mock.calls[0]?.[1].queueIds).toEqual(["q-1"]);
    });
  });

  describe("sparse-page refill", () => {
    // One matching row loaded, cap 3, more pages on the server.
    function sparse(): DashboardLane {
      const lane = createLane("my-tickets");
      loadRows([row({ id: "m1", assignedTo: ME }), row({ id: "o1" })], true);
      return lane;
    }

    it("fetches the next page while the lane is short of its cap", () => {
      sparse();
      expect(fetchNextPage).toHaveBeenCalled();
    });

    it("stops when the server has no next page", () => {
      const lane = createLane("my-tickets");
      loadRows([row({ id: "m1", assignedTo: ME })], false);
      expect(lane.items).toHaveLength(1);
      expect(fetchNextPage).not.toHaveBeenCalled();
    });

    it("stops while a fetch is in flight", () => {
      fakeQuery.isFetching = true;
      sparse();
      expect(fetchNextPage).not.toHaveBeenCalled();
    });

    it("stops after a failed fetch", () => {
      fakeQuery.isError = true;
      sparse();
      expect(fetchNextPage).not.toHaveBeenCalled();
    });

    it("stops once the cap is filled", () => {
      createLane("my-tickets", { cap: () => 2 });
      loadRows(MINE, true);
      expect(fetchNextPage).not.toHaveBeenCalled();
    });

    it("stops once the loaded rows reach the lane's count", () => {
      facetIndex = {
        rows: [row({ id: "m1", assignedTo: ME })],
        complete: true,
      };
      sparse();
      expect(fetchNextPage).not.toHaveBeenCalled();
    });

    it("keeps going when the count is only a floor", () => {
      facetIndex = {
        rows: [row({ id: "m1", assignedTo: ME })],
        complete: false,
      };
      sparse();
      expect(fetchNextPage).toHaveBeenCalled();
    });

    it("does not refill a lane without a cap", () => {
      createLane("my-tickets", { cap: () => undefined });
      loadRows([row({ id: "m1", assignedTo: ME })], true);
      expect(fetchNextPage).not.toHaveBeenCalled();
    });
  });

  describe("errors", () => {
    it("reports the error and keeps the loaded rows", () => {
      const lane = createLane("my-tickets", { cap: () => 10 });
      loadRows(MINE);
      const failure = new Error("page failed");
      fakeQuery.isError = true;
      fakeQuery.isFetchNextPageError = true;
      fakeQuery.error = failure;
      flushSync();

      expect(lane.error).toBe(failure);
      expect(lane.items).toHaveLength(3);
    });

    it("retries a failed next page by fetching it again", () => {
      const lane = createLane("my-tickets");
      fakeQuery.isError = true;
      fakeQuery.isFetchNextPageError = true;
      flushSync();
      lane.retry();
      expect(fetchNextPage).toHaveBeenCalledOnce();
      expect(refetch).not.toHaveBeenCalled();
    });

    it("retries a failed first page by refetching", () => {
      const lane = createLane("my-tickets");
      fakeQuery.isError = true;
      flushSync();
      lane.retry();
      expect(refetch).toHaveBeenCalledOnce();
    });
  });

  describe("saved filters", () => {
    it("applies the saved filters once the document loads", () => {
      fakeFilters.lanes = {
        "my-tickets": {
          statuses: [],
          queueIds: ["q-1"],
          priorities: ["high"],
          dateFrom: null,
          dateTo: null,
          unreadOnly: false,
          needsAttentionOnly: false,
        },
      };
      const lane = createLane("my-tickets");
      expect(lane.filters.priorities.size).toBe(0);

      fakeFilters.hydrated = true;
      flushSync();

      expect([...lane.filters.priorities]).toEqual(["high"]);
      expect([...lane.filters.queueIds]).toEqual(["q-1"]);
      // Loading the saved state does not write it straight back.
      expect(setLane).not.toHaveBeenCalled();
    });

    it("opens the filter row when the loaded filters apply", () => {
      fakeFilters.lanes = {
        "my-tickets": {
          statuses: [],
          queueIds: [],
          priorities: ["high"],
          dateFrom: null,
          dateTo: null,
          unreadOnly: false,
          needsAttentionOnly: false,
        },
      };
      const lane = createLane("my-tickets");
      expect(lane.filterToggle.open).toBe(false);

      // The lane signals its row once the saved filters are in its store,
      // so the row opens in the same update, with no tick to wait on.
      fakeFilters.hydrated = true;
      flushSync();

      expect(lane.filterToggle.open).toBe(true);
    });

    it("leaves the filter row closed when no saved filters apply", () => {
      const lane = createLane("my-tickets");
      fakeFilters.hydrated = true;
      flushSync();

      expect(lane.filterToggle.open).toBe(false);
    });

    it("keeps the lane's sort when applying saved filters", () => {
      const lane = createLane("my-tickets");
      const sort = lane.filters.sort;
      fakeFilters.hydrated = true;
      flushSync();
      expect(lane.filters.sort).toEqual(sort);
    });

    it("saves a filter change without the sort, and reads it back", () => {
      fakeFilters.hydrated = true;
      const lane = createLane("unassigned");
      lane.filters.togglePriority("urgent");
      flushSync();

      expect(setLane).toHaveBeenCalledOnce();
      const [laneId, saved] = setLane.mock.calls[0]!;
      expect(laneId).toBe("unassigned");
      expect(saved.priorities).toEqual(["urgent"]);
      expect(saved).not.toHaveProperty("sortField");
      expect(saved).not.toHaveProperty("sortDirection");

      // A fresh lane over the same document starts from the saved state.
      destroy?.();
      const reloaded = createLane("unassigned");
      expect([...reloaded.filters.priorities]).toEqual(["urgent"]);
    });

    it("does not save before anything changes", () => {
      createLane("my-tickets");
      fakeFilters.hydrated = true;
      flushSync();
      expect(setLane).not.toHaveBeenCalled();
    });
  });

  describe("seeAll", () => {
    it("applies the lane and the user's filters to the tickets page, then opens it", () => {
      const lane = createLane("needs-attention");
      lane.filters.toggleQueue("q-1");
      flushSync();

      lane.seeAll();

      expect([...filterStore.statuses]).toEqual(["new", "active"]);
      expect(filterStore.needsAttentionOnly).toBe(true);
      expect([...filterStore.queueIds]).toEqual(["q-1"]);
      expect(openTickets).toHaveBeenCalledOnce();
    });

    it("lands On hold on the Hold status", () => {
      const lane = createLane("on-hold");
      lane.seeAll();
      expect([...filterStore.statuses]).toEqual(["hold"]);
      expect(filterStore.assigneeId).toBeUndefined();
    });

    it("lands My tickets on the viewer as assignee", () => {
      const lane = createLane("my-tickets");
      lane.seeAll();
      expect(filterStore.assigneeId).toBe(ME);
    });
  });
});
