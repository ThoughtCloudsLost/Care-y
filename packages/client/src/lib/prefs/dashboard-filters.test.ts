import { describe, it, expect, vi, afterEach } from "vitest";
import {
  kbCategoryIdSchema,
  userIdSchema,
  type LaneFilterState,
} from "@care-y/shared";
import {
  createDashboardFilters,
  emptyDashboardFilters,
  emptyLaneFilterState,
  parseDashboardFilters,
  type DashboardFiltersDeps,
} from "./dashboard-filters.svelte.js";
import {
  createFakeSelfBlobTransport,
  envelopeOf,
  lastPushedJson,
} from "$mocks/fake-self-blob-transport.js";

const CATEGORY = kbCategoryIdSchema.parse(
  "00000000-0000-4000-8000-0000000000c1",
);
const AUTHOR = userIdSchema.parse("00000000-0000-4000-8000-0000000000d1");

const NEW_IN_QUEUE: LaneFilterState = {
  ...emptyLaneFilterState(),
  statuses: ["new"],
  queueIds: ["q-1"],
};

function makeHarness(overrides?: Partial<DashboardFiltersDeps>) {
  const deps: DashboardFiltersDeps = {
    ...createFakeSelfBlobTransport(),
    pushDelayMs: 100,
    ...overrides,
  };
  return { deps, store: createDashboardFilters(deps) };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("emptyDashboardFilters", () => {
  it("has an empty filter for every lane and section", () => {
    expect(emptyDashboardFilters()).toEqual({
      lanes: {
        "needs-attention": emptyLaneFilterState(),
        "my-tickets": emptyLaneFilterState(),
        unassigned: emptyLaneFilterState(),
        "on-hold": emptyLaneFilterState(),
      },
      activity: { kinds: [], queueIds: [] },
      kb: { categoryIds: [], createdBy: null },
      merge: { matchKinds: [] },
    });
  });
});

describe("parseDashboardFilters", () => {
  it("fills lanes and sections missing from a partial document", () => {
    const parsed = parseDashboardFilters({
      v: 1,
      type: "dashboard_filters",
      lanes: { "on-hold": NEW_IN_QUEUE },
      kb: { categoryIds: [CATEGORY] },
    });

    expect(parsed).toEqual({
      ...emptyDashboardFilters(),
      lanes: { ...emptyDashboardFilters().lanes, "on-hold": NEW_IN_QUEUE },
      kb: { categoryIds: [CATEGORY], createdBy: null },
    });
  });

  it("rejects another kind's payload", () => {
    expect(
      parseDashboardFilters({ v: 1, type: "recent_views", lanes: {} }),
    ).toBeNull();
    // The recently-viewed payload carries no type at all.
    expect(parseDashboardFilters({ v: 1, entries: [] })).toBeNull();
  });

  it("rejects an unknown version", () => {
    expect(
      parseDashboardFilters({ v: 2, type: "dashboard_filters" }),
    ).toBeNull();
  });
});

describe("hydration", () => {
  it("round trips the document through the bridge", async () => {
    vi.useFakeTimers();
    const first = makeHarness();
    first.store.setLane("on-hold", NEW_IN_QUEUE);
    first.store.setMerge({ matchKinds: ["phone"] });
    await first.store.flush();
    const stored = lastPushedJson(first.deps);

    const second = makeHarness({
      fetchEnvelope: vi.fn(async () => envelopeOf(stored)),
    });
    second.store.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(second.store.hydrated).toBe(true);
    expect(second.store.value).toEqual(first.store.value);
    expect(second.store.value.lanes["on-hold"]).toEqual(NEW_IN_QUEUE);
    expect(second.store.value.merge.matchKinds).toEqual(["phone"]);
  });

  it("loads empty filters when the server serves another kind's row", async () => {
    vi.useFakeTimers();
    const { store } = makeHarness({
      fetchEnvelope: vi.fn(async () =>
        envelopeOf({
          v: 1,
          entries: [{ type: "ticket", id: "t-1", viewedAt: 1 }],
        }),
      ),
    });

    store.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(store.hydrated).toBe(true);
    expect(store.value).toEqual(emptyDashboardFilters());
  });

  it("loads empty filters for an unknown version", async () => {
    vi.useFakeTimers();
    const { store } = makeHarness({
      fetchEnvelope: vi.fn(async () =>
        envelopeOf({
          v: 2,
          type: "dashboard_filters",
          lanes: { "on-hold": NEW_IN_QUEUE },
        }),
      ),
    });

    store.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(store.value).toEqual(emptyDashboardFilters());
  });
});

describe("setters", () => {
  it("setLane changes one lane and pushes the whole document", async () => {
    vi.useFakeTimers();
    const { store, deps } = makeHarness();

    store.setLane("my-tickets", NEW_IN_QUEUE);
    expect(store.value.lanes["my-tickets"]).toEqual(NEW_IN_QUEUE);
    expect(store.value.lanes.unassigned).toEqual(emptyLaneFilterState());
    expect(deps.pushEnvelope).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(100);

    expect(deps.pushEnvelope).toHaveBeenCalledTimes(1);
    expect(lastPushedJson(deps)).toEqual({
      v: 1,
      type: "dashboard_filters",
      ...emptyDashboardFilters(),
      lanes: { ...emptyDashboardFilters().lanes, "my-tickets": NEW_IN_QUEUE },
    });
  });

  it("setActivity, setKb and setMerge replace their section and push once", async () => {
    vi.useFakeTimers();
    const { store, deps } = makeHarness();

    store.setActivity({ kinds: ["org"], queueIds: [] });
    store.setKb({ categoryIds: [CATEGORY], createdBy: AUTHOR });
    store.setMerge({ matchKinds: ["email"] });
    await vi.advanceTimersByTimeAsync(100);

    expect(deps.pushEnvelope).toHaveBeenCalledTimes(1);
    expect(lastPushedJson(deps)).toMatchObject({
      activity: { kinds: ["org"], queueIds: [] },
      kb: { categoryIds: [CATEGORY], createdBy: AUTHOR },
      merge: { matchKinds: ["email"] },
    });
    expect(store.saveStatus).toBe("idle");
  });

  it("surfaces a failed save", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { store } = makeHarness({
      pushEnvelope: vi.fn(async () => Promise.reject(new Error("offline"))),
    });

    store.setMerge({ matchKinds: ["phone"] });
    await vi.advanceTimersByTimeAsync(100);

    expect(store.saveStatus).toBe("error");
  });

  it("keeps filters set before hydration over the stored copy", async () => {
    vi.useFakeTimers();
    const { store } = makeHarness({
      fetchEnvelope: vi.fn(async () =>
        envelopeOf({
          v: 1,
          type: "dashboard_filters",
          lanes: { unassigned: NEW_IN_QUEUE },
        }),
      ),
    });

    store.setLane("on-hold", NEW_IN_QUEUE);
    store.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(store.value.lanes["on-hold"]).toEqual(NEW_IN_QUEUE);
    expect(store.value.lanes.unassigned).toEqual(emptyLaneFilterState());
  });
});
