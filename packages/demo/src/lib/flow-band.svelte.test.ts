import { describe, it, expect } from "vitest";
import { flushSync } from "svelte";
import {
  createFlowBandStore,
  ingestFlowEvent,
  toggleSliceCollapsed,
  sliceEventsByLane,
  groupSliceEvents,
  cellSpan,
  cellsColumnCount,
  connectorPoints,
  clampBandHeight,
  truncatePreview,
  laneIndex,
  laneColorVar,
  FLOW_LANES,
  MIN_BAND_HEIGHT,
  MAX_BAND_HEIGHT,
  DEFAULT_BAND_HEIGHT,
  MAX_SLICES,
  EXPANDED_SLICE_WINDOW,
  CARD_COLUMN_WIDTH,
  CARD_COLUMN_GAP,
  PREVIEW_MAX_CHARS,
  eventSlicePosition,
  findSpanPartner,
  type FlowBandStore,
  type FlowSlice,
} from "./flow-band.svelte.js";
import type { DemoFlowEvent, FlowLane } from "./bridge.js";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

interface EventOverrides {
  id: number;
  interactionId: number;
  lane?: FlowLane;
  label?: string;
  seamKey?: DemoFlowEvent["seamKey"];
  payloadPreview?: DemoFlowEvent["payloadPreview"];
  durationMs?: number | null;
  direction?: DemoFlowEvent["direction"];
  detail?: DemoFlowEvent["detail"];
  spanId?: number | null;
  groupKey?: string | null;
  at?: number;
}

function makeEvent(overrides: EventOverrides): DemoFlowEvent {
  return {
    id: overrides.id,
    interactionId: overrides.interactionId,
    lane: overrides.lane ?? "ui",
    direction: overrides.direction ?? "up",
    label: overrides.label ?? "step",
    seamKey: overrides.seamKey ?? null,
    payloadPreview: overrides.payloadPreview ?? null,
    durationMs: overrides.durationMs ?? null,
    detail: overrides.detail ?? null,
    spanId: overrides.spanId ?? null,
    groupKey: overrides.groupKey ?? null,
    at: overrides.at ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Lanes
// ---------------------------------------------------------------------------

describe("lane order", () => {
  it("runs from the database down to the screen", () => {
    expect(FLOW_LANES).toEqual(["db", "server", "trpc", "crypto", "ui"]);
  });

  it("maps every lane to its row", () => {
    expect(laneIndex("db")).toBe(0);
    expect(laneIndex("ui")).toBe(FLOW_LANES.length - 1);
  });

  it("gives every lane its own color variable", () => {
    const vars = FLOW_LANES.map((lane) => laneColorVar(lane));
    expect(new Set(vars).size).toBe(FLOW_LANES.length);
  });
});

// ---------------------------------------------------------------------------
// Height clamp
// ---------------------------------------------------------------------------

describe("clampBandHeight", () => {
  it("keeps a height inside the range", () => {
    expect(clampBandHeight(300)).toBe(300);
  });

  it("clamps below the minimum", () => {
    expect(clampBandHeight(10)).toBe(MIN_BAND_HEIGHT);
  });

  it("clamps above the maximum", () => {
    expect(clampBandHeight(9000)).toBe(MAX_BAND_HEIGHT);
  });

  it("rounds fractional heights", () => {
    expect(clampBandHeight(260.6)).toBe(261);
  });

  it("falls back to the default for a non-finite height", () => {
    expect(clampBandHeight(Number.NaN)).toBe(DEFAULT_BAND_HEIGHT);
  });
});

// ---------------------------------------------------------------------------
// Payload previews
// ---------------------------------------------------------------------------

describe("truncatePreview", () => {
  it("passes null through", () => {
    expect(truncatePreview(null)).toBeNull();
  });

  it("leaves a short preview untouched", () => {
    expect(truncatePreview("aGVsbG8=")).toBe("aGVsbG8=");
  });

  it("caps a long preview", () => {
    const long = "x".repeat(PREVIEW_MAX_CHARS + 50);
    const result = truncatePreview(long);
    expect(result).not.toBeNull();
    expect(result?.length).toBe(PREVIEW_MAX_CHARS + 3);
    expect(result?.endsWith("...")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Grouping
// ---------------------------------------------------------------------------

describe("ingestFlowEvent", () => {
  it("starts a slice for a new interaction", () => {
    const result = ingestFlowEvent([], makeEvent({ id: 1, interactionId: 7 }));
    expect(result).toHaveLength(1);
    expect(result.at(0)?.interactionId).toBe(7);
    expect(result.at(0)?.events).toHaveLength(1);
    expect(result.at(0)?.collapsed).toBe(false);
  });

  it("appends to the slice of the same interaction", () => {
    const first = ingestFlowEvent([], makeEvent({ id: 1, interactionId: 1 }));
    const second = ingestFlowEvent(
      first,
      makeEvent({ id: 2, interactionId: 1, lane: "crypto" }),
    );
    expect(second).toHaveLength(1);
    expect(second.at(0)?.events).toHaveLength(2);
  });

  it("opens a new slice for a different interaction", () => {
    const first = ingestFlowEvent([], makeEvent({ id: 1, interactionId: 1 }));
    const second = ingestFlowEvent(
      first,
      makeEvent({ id: 2, interactionId: 2 }),
    );
    expect(second).toHaveLength(2);
    expect(second.at(1)?.interactionId).toBe(2);
  });

  it("routes a late event back to its own slice", () => {
    let slices = ingestFlowEvent([], makeEvent({ id: 1, interactionId: 1 }));
    slices = ingestFlowEvent(slices, makeEvent({ id: 2, interactionId: 2 }));
    slices = ingestFlowEvent(
      slices,
      makeEvent({ id: 3, interactionId: 1, lane: "db" }),
    );
    expect(slices).toHaveLength(2);
    expect(slices.at(0)?.events).toHaveLength(2);
    expect(slices.at(1)?.events).toHaveLength(1);
  });

  it("ignores an event id the slice already holds", () => {
    const first = ingestFlowEvent([], makeEvent({ id: 1, interactionId: 1 }));
    const again = ingestFlowEvent(
      first,
      makeEvent({ id: 1, interactionId: 1 }),
    );
    expect(again.at(0)?.events).toHaveLength(1);
  });

  it("drops the oldest slice past the cap", () => {
    let slices: FlowSlice[] = [];
    for (let i = 1; i <= MAX_SLICES + 3; i++) {
      slices = ingestFlowEvent(slices, makeEvent({ id: i, interactionId: i }));
    }
    expect(slices).toHaveLength(MAX_SLICES);
    expect(slices.at(0)?.interactionId).toBe(4);
    expect(slices.at(-1)?.interactionId).toBe(MAX_SLICES + 3);
  });

  it("honours a caller-supplied cap", () => {
    let slices: FlowSlice[] = [];
    for (let i = 1; i <= 5; i++) {
      slices = ingestFlowEvent(
        slices,
        makeEvent({ id: i, interactionId: i }),
        2,
      );
    }
    expect(slices).toHaveLength(2);
  });

  it("leaves the input array untouched", () => {
    const first = ingestFlowEvent([], makeEvent({ id: 1, interactionId: 1 }));
    ingestFlowEvent(first, makeEvent({ id: 2, interactionId: 1 }));
    expect(first.at(0)?.events).toHaveLength(1);
  });

  it("caps events per slice, dropping oldest from the front", () => {
    let slices: FlowSlice[] = [];
    const cap = 5;
    for (let i = 1; i <= cap + 3; i++) {
      slices = ingestFlowEvent(
        slices,
        makeEvent({ id: i, interactionId: 1 }),
        MAX_SLICES,
        cap,
      );
    }
    expect(slices).toHaveLength(1);
    expect(slices.at(0)?.events).toHaveLength(cap);
    // Oldest (id=1,2,3) dropped; first retained is id=4
    expect(slices.at(0)?.events.at(0)?.id).toBe(4);
    expect(slices.at(0)?.events.at(-1)?.id).toBe(cap + 3);
  });

  it("uses monotonic id comparison for dedup (O(1) instead of linear scan)", () => {
    const first = ingestFlowEvent([], makeEvent({ id: 5, interactionId: 1 }));
    // Re-ingest with the same id: should be a no-op
    const again = ingestFlowEvent(
      first,
      makeEvent({ id: 5, interactionId: 1 }),
    );
    expect(again.at(0)?.events).toHaveLength(1);
    // An id LOWER than the last should also be treated as duplicate
    const lower = ingestFlowEvent(
      first,
      makeEvent({ id: 3, interactionId: 1 }),
    );
    expect(lower.at(0)?.events).toHaveLength(1);
  });

  it("preserves identity of untouched slices (shallow-copy optimization)", () => {
    let slices = ingestFlowEvent([], makeEvent({ id: 1, interactionId: 1 }));
    slices = ingestFlowEvent(slices, makeEvent({ id: 2, interactionId: 2 }));
    const beforeFirst = slices[0];
    // Appending to slice 2 should not copy slice 1
    const after = ingestFlowEvent(
      slices,
      makeEvent({ id: 3, interactionId: 2, lane: "crypto" }),
    );
    expect(after[0]).toBe(beforeFirst);
  });

  it("auto-collapses older slices outside the expanded window", () => {
    let slices: FlowSlice[] = [];
    const total = EXPANDED_SLICE_WINDOW + 2;
    for (let i = 1; i <= total; i++) {
      slices = ingestFlowEvent(slices, makeEvent({ id: i, interactionId: i }));
    }
    // The newest EXPANDED_SLICE_WINDOW slices should be expanded
    for (
      let i = slices.length - EXPANDED_SLICE_WINDOW;
      i < slices.length;
      i++
    ) {
      expect(slices.at(i)?.collapsed).toBe(false);
    }
    // Older slices should be collapsed
    for (let i = 0; i < slices.length - EXPANDED_SLICE_WINDOW; i++) {
      expect(slices.at(i)?.collapsed).toBe(true);
    }
  });
});

describe("toggleSliceCollapsed", () => {
  it("flips only the named slice", () => {
    let slices = ingestFlowEvent([], makeEvent({ id: 1, interactionId: 1 }));
    slices = ingestFlowEvent(slices, makeEvent({ id: 2, interactionId: 2 }));

    const toggled = toggleSliceCollapsed(slices, 1);
    expect(toggled.at(0)?.collapsed).toBe(true);
    expect(toggled.at(1)?.collapsed).toBe(false);

    const back = toggleSliceCollapsed(toggled, 1);
    expect(back.at(0)?.collapsed).toBe(false);
  });

  it("is a no-op for an unknown interaction", () => {
    const slices = ingestFlowEvent([], makeEvent({ id: 1, interactionId: 1 }));
    expect(toggleSliceCollapsed(slices, 99).at(0)?.collapsed).toBe(false);
  });
});

describe("sliceEventsByLane", () => {
  it("returns nothing for a slice with no events", () => {
    expect(
      sliceEventsByLane({ interactionId: 1, events: [], collapsed: false }),
    ).toEqual([]);
  });

  it("buckets by lane in render order, skipping untouched lanes", () => {
    const slice: FlowSlice = {
      interactionId: 1,
      collapsed: true,
      events: [
        makeEvent({ id: 1, interactionId: 1, lane: "ui" }),
        makeEvent({ id: 2, interactionId: 1, lane: "db" }),
        makeEvent({ id: 3, interactionId: 1, lane: "ui" }),
      ],
    };
    const buckets = sliceEventsByLane(slice);

    // db before ui: FLOW_LANES order, not arrival order.
    expect(buckets.map((b) => b.lane)).toEqual(["db", "ui"]);
    expect(buckets.at(1)?.events).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Runs and cells
// ---------------------------------------------------------------------------

describe("groupSliceEvents", () => {
  /** A run member: same lane, direction, and group key. */
  function decrypt(id: number): DemoFlowEvent {
    return makeEvent({
      id,
      interactionId: 1,
      lane: "crypto",
      direction: "local",
      label: `decrypt title tk-000${String(id)}`,
      groupKey: "decrypt:title",
    });
  }

  it("leaves events without a group key alone", () => {
    const events = [1, 2, 3, 4].map((id) =>
      makeEvent({ id, interactionId: 1, lane: "db" }),
    );
    const cells = groupSliceEvents(events);

    // Four consecutive same-lane events, but no tap opted them in.
    expect(cells).toHaveLength(4);
    expect(cells.every((c) => !c.isRun)).toBe(true);
  });

  it("folds a run at the minimum length", () => {
    const cells = groupSliceEvents([decrypt(1), decrypt(2), decrypt(3)]);
    expect(cells).toHaveLength(1);
    expect(cells.at(0)?.isRun).toBe(true);
  });

  it("leaves a pair unfolded", () => {
    // Two events are a request and its response often enough that hiding
    // them would cost more than the column it saves.
    const cells = groupSliceEvents([decrypt(1), decrypt(2)]);
    expect(cells).toHaveLength(2);
    expect(cells.every((c) => !c.isRun)).toBe(true);
  });

  it("splits a run when the group key changes", () => {
    const query = (id: number, key: string): DemoFlowEvent =>
      makeEvent({
        id,
        interactionId: 1,
        lane: "db",
        direction: "local",
        groupKey: key,
      });
    const cells = groupSliceEvents([
      query(1, "select tickets"),
      query(2, "select tickets"),
      query(3, "select tickets"),
      query(4, "select queues"),
    ]);
    expect(cells).toHaveLength(2);
    expect(cells.at(0)?.isRun).toBe(true);
    expect(cells.at(1)?.isRun).toBe(false);
  });

  it("folds the crypto lane on adjacency alone", () => {
    // A burst of unwraps is the same work over different rows, so the
    // crypto lane does not need a tap to opt each kind in.
    const events = [1, 2, 3, 4].map((id) =>
      makeEvent({
        id,
        interactionId: 1,
        lane: "crypto",
        direction: "local",
      }),
    );
    const cells = groupSliceEvents(events);
    expect(cells).toHaveLength(1);
    expect(cells.at(0)?.events).toHaveLength(4);
  });

  it("folds crypto events together across different group keys", () => {
    const cells = groupSliceEvents([
      makeEvent({
        id: 1,
        interactionId: 1,
        lane: "crypto",
        direction: "local",
        groupKey: "decrypt:title",
      }),
      makeEvent({
        id: 2,
        interactionId: 1,
        lane: "crypto",
        direction: "local",
        groupKey: "decrypt:body",
      }),
      makeEvent({
        id: 3,
        interactionId: 1,
        lane: "crypto",
        direction: "local",
        groupKey: "decryptAndRewrap",
      }),
    ]);
    expect(cells).toHaveLength(1);
    expect(cells.at(0)?.isRun).toBe(true);
  });

  it("still splits crypto events by direction", () => {
    const events = [
      ...[1, 2, 3].map((id) =>
        makeEvent({ id, interactionId: 1, lane: "crypto", direction: "local" }),
      ),
      ...[4, 5, 6].map((id) =>
        makeEvent({ id, interactionId: 1, lane: "crypto", direction: "up" }),
      ),
    ];
    expect(groupSliceEvents(events)).toHaveLength(2);
  });

  it("splits a run when the direction changes", () => {
    const up = [1, 2, 3].map((id) =>
      makeEvent({
        id,
        interactionId: 1,
        lane: "trpc",
        direction: "up",
        groupKey: "tickets.list",
      }),
    );
    const down = [4, 5, 6].map((id) =>
      makeEvent({
        id,
        interactionId: 1,
        lane: "trpc",
        direction: "down",
        groupKey: "tickets.list",
      }),
    );
    const cells = groupSliceEvents([...up, ...down]);

    // Three requests then three responses is two stacks, not one of six.
    expect(cells).toHaveLength(2);
    expect(cells.every((c) => c.isRun)).toBe(true);
  });

  it("splits a run when the lane changes", () => {
    const events = [
      decrypt(1),
      decrypt(2),
      decrypt(3),
      makeEvent({
        id: 4,
        interactionId: 1,
        lane: "db",
        direction: "local",
        groupKey: "decrypt:title",
      }),
    ];
    expect(groupSliceEvents(events)).toHaveLength(2);
  });

  it("keeps a run as one cell whether or not it is open", () => {
    const cells = groupSliceEvents([decrypt(1), decrypt(2), decrypt(3)]);
    const cell = cells.at(0);
    expect(cell).toBeDefined();
    if (cell === undefined) return;

    // Opening widens the cell rather than replacing it with three, which
    // is what lets the same card elements slide apart.
    expect(cellSpan(cell)).toBe(1);
    expect(cellSpan(cell, new Set([cell.id]))).toBe(3);
  });

  it("keeps unrelated events either side of a fold", () => {
    const events = [
      makeEvent({ id: 1, interactionId: 1, lane: "ui" }),
      decrypt(2),
      decrypt(3),
      decrypt(4),
      makeEvent({ id: 5, interactionId: 1, lane: "db" }),
    ];
    const cells = groupSliceEvents(events);
    expect(cells.map((c) => c.isRun)).toEqual([false, true, false]);
  });

  it("returns nothing for no events", () => {
    expect(groupSliceEvents([])).toEqual([]);
  });
});

describe("cell anchor and identity", () => {
  function decrypt(id: number): DemoFlowEvent {
    return makeEvent({
      id,
      interactionId: 1,
      lane: "crypto",
      direction: "local",
      groupKey: "decrypt:title",
    });
  }

  it("anchors a run on its newest member", () => {
    const cells = groupSliceEvents([decrypt(1), decrypt(2), decrypt(3)]);
    const cell = cells.at(0);
    expect(cell).toBeDefined();
    if (cell === undefined) return;
    // Cards pile up as they arrive, so the last one is on top.
    expect(cell.anchor.id).toBe(3);
  });

  it("identifies a run by its first member, so the id survives growth", () => {
    const three = groupSliceEvents([decrypt(1), decrypt(2), decrypt(3)]);
    const four = groupSliceEvents([
      decrypt(1),
      decrypt(2),
      decrypt(3),
      decrypt(4),
    ]);
    const a = three.at(0);
    const b = four.at(0);
    expect(a).toBeDefined();
    expect(b).toBeDefined();
    if (a === undefined || b === undefined) return;
    expect(a.id).toBe(b.id);
  });

  it("anchors and identifies a single event by itself", () => {
    const cells = groupSliceEvents([makeEvent({ id: 9, interactionId: 1 })]);
    const cell = cells.at(0);
    expect(cell).toBeDefined();
    if (cell === undefined) return;
    expect(cell.anchor.id).toBe(9);
    expect(cell.id).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// Connector geometry
// ---------------------------------------------------------------------------

describe("connectorPoints", () => {
  it("returns nothing to draw for a single column", () => {
    const cells = groupSliceEvents([makeEvent({ id: 1, interactionId: 1 })]);
    expect(connectorPoints(cells, 40)).toBe("");
  });

  it("places each point at its card centre", () => {
    const cells = groupSliceEvents([
      makeEvent({ id: 1, interactionId: 1, lane: "ui" }),
      makeEvent({ id: 2, interactionId: 1, lane: "db" }),
    ]);
    const pitch = CARD_COLUMN_WIDTH + CARD_COLUMN_GAP;
    const expected = [
      `${String(CARD_COLUMN_WIDTH / 2)},${String(4 * 40 + 20)}`,
      `${String(pitch + CARD_COLUMN_WIDTH / 2)},${String(20)}`,
    ].join(" ");
    expect(connectorPoints(cells, 40)).toBe(expected);
  });

  it("shifts later columns along when a run is open", () => {
    const decrypts = [1, 2, 3].map((id) =>
      makeEvent({
        id,
        interactionId: 1,
        lane: "crypto",
        direction: "local",
        groupKey: "decrypt:title",
      }),
    );
    const cells = groupSliceEvents([
      ...decrypts,
      makeEvent({ id: 4, interactionId: 1, lane: "db" }),
    ]);
    const first = cells.at(0);
    expect(first).toBeDefined();
    if (first === undefined) return;
    const runId = first.id;
    const pitch = CARD_COLUMN_WIDTH + CARD_COLUMN_GAP;

    // Folded, the db card sits in column 1. Open, the run holds three
    // columns and the db card has moved to column 3.
    expect(connectorPoints(cells, 40).split(" ").at(1)).toBe(
      `${String(pitch + CARD_COLUMN_WIDTH / 2)},${String(20)}`,
    );
    expect(
      connectorPoints(cells, 40, new Set([runId]))
        .split(" ")
        .at(1),
    ).toBe(`${String(3 * pitch + CARD_COLUMN_WIDTH / 2)},${String(20)}`);
  });

  it("gives a folded run one point, not one per member", () => {
    const decrypts = [1, 2, 3, 4].map((id) =>
      makeEvent({
        id,
        interactionId: 1,
        lane: "crypto",
        direction: "local",
        groupKey: "decrypt:title",
      }),
    );
    const cells = groupSliceEvents([
      makeEvent({ id: 0, interactionId: 1, lane: "ui" }),
      ...decrypts,
    ]);
    const points = connectorPoints(cells, 40).split(" ");

    // Two columns, so two points: the connector has to land on the stack
    // that replaced the four cards, not where they used to be.
    expect(points).toHaveLength(2);
    const pitch = CARD_COLUMN_WIDTH + CARD_COLUMN_GAP;
    expect(points.at(1)).toBe(
      `${String(pitch + CARD_COLUMN_WIDTH / 2)},${String(3 * 40 + 20)}`,
    );
  });
});

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

describe("createFlowBandStore", () => {
  function setup(): { store: FlowBandStore; teardown: () => void } {
    let store!: FlowBandStore;
    const teardown = $effect.root(() => {
      store = createFlowBandStore();
    });
    flushSync();
    return { store, teardown };
  }

  it("starts closed, empty, and at the default height", () => {
    const { store, teardown } = setup();
    expect(store.open).toBe(false);
    expect(store.height).toBe(DEFAULT_BAND_HEIGHT);
    expect(store.slices).toHaveLength(0);
    expect(store.eventCount).toBe(0);
    expect(store.expandedEvent).toBeNull();
    teardown();
  });

  it("toggles open and closed", () => {
    const { store, teardown } = setup();
    store.toggleOpen();
    flushSync();
    expect(store.open).toBe(true);
    store.toggleOpen();
    flushSync();
    expect(store.open).toBe(false);
    store.setOpen(true);
    flushSync();
    expect(store.open).toBe(true);
    teardown();
  });

  it("clamps a height set from a drag", () => {
    const { store, teardown } = setup();
    store.setHeight(10_000);
    flushSync();
    expect(store.height).toBe(MAX_BAND_HEIGHT);
    store.setHeight(0);
    flushSync();
    expect(store.height).toBe(MIN_BAND_HEIGHT);
    teardown();
  });

  it("groups ingested events into slices", () => {
    const { store, teardown } = setup();
    store.ingest(makeEvent({ id: 1, interactionId: 1, lane: "ui" }));
    store.ingest(makeEvent({ id: 2, interactionId: 1, lane: "crypto" }));
    store.ingest(makeEvent({ id: 3, interactionId: 2, lane: "ui" }));
    flushSync();
    expect(store.slices).toHaveLength(2);
    expect(store.eventCount).toBe(3);
    teardown();
  });

  it("collapses and expands a slice", () => {
    const { store, teardown } = setup();
    store.ingest(makeEvent({ id: 1, interactionId: 4 }));
    store.toggleSlice(4);
    flushSync();
    expect(store.slices.at(0)?.collapsed).toBe(true);
    teardown();
  });

  it("expands one card at a time", () => {
    const { store, teardown } = setup();
    store.ingest(makeEvent({ id: 1, interactionId: 1, label: "first" }));
    store.ingest(makeEvent({ id: 2, interactionId: 1, label: "second" }));

    store.toggleExpanded(1);
    flushSync();
    expect(store.isExpanded(1)).toBe(true);
    expect(store.expandedEvent?.label).toBe("first");

    store.toggleExpanded(2);
    flushSync();
    expect(store.isExpanded(1)).toBe(false);
    expect(store.expandedEvent?.label).toBe("second");

    store.toggleExpanded(2);
    flushSync();
    expect(store.expandedEvent).toBeNull();
    teardown();
  });

  it("tracks event count accurately when slices are dropped", () => {
    const { store, teardown } = setup();
    // Ingest enough interactions to exceed MAX_SLICES
    for (let i = 1; i <= MAX_SLICES + 2; i++) {
      store.ingest(makeEvent({ id: i, interactionId: i }));
    }
    flushSync();
    expect(store.slices).toHaveLength(MAX_SLICES);
    expect(store.eventCount).toBe(MAX_SLICES);
    teardown();
  });

  it("resolves expandedEvent via O(1) map lookup", () => {
    const { store, teardown } = setup();
    // Ingest events across multiple slices
    store.ingest(makeEvent({ id: 1, interactionId: 1, label: "alpha" }));
    store.ingest(makeEvent({ id: 2, interactionId: 2, label: "beta" }));
    store.ingest(makeEvent({ id: 3, interactionId: 1, label: "gamma" }));
    store.toggleExpanded(3);
    flushSync();
    expect(store.expandedEvent?.label).toBe("gamma");
    teardown();
  });

  it("clears slices and the expanded card on reset", () => {
    const { store, teardown } = setup();
    store.setOpen(true);
    store.setHeight(300);
    store.ingest(makeEvent({ id: 1, interactionId: 1 }));
    store.toggleExpanded(1);
    flushSync();

    store.reset();
    flushSync();

    expect(store.slices).toHaveLength(0);
    expect(store.eventCount).toBe(0);
    expect(store.expandedEvent).toBeNull();
    // The visitor's own choices survive a restart; only the data clears.
    expect(store.open).toBe(true);
    expect(store.height).toBe(300);
    teardown();
  });
});

// ---------------------------------------------------------------------------
// Expanded event context
// ---------------------------------------------------------------------------

describe("eventSlicePosition", () => {
  const slices: FlowSlice[] = [
    {
      interactionId: 1,
      collapsed: false,
      events: [
        makeEvent({ id: 1, interactionId: 1, at: 100 }),
        makeEvent({ id: 2, interactionId: 1, at: 140 }),
        makeEvent({ id: 3, interactionId: 1, at: 205 }),
      ],
    },
  ];

  it("reports a 1-based step index against the slice total", () => {
    const pos = eventSlicePosition(
      slices,
      makeEvent({ id: 2, interactionId: 1 }),
    );
    expect(pos?.stepIndex).toBe(2);
    expect(pos?.stepCount).toBe(3);
  });

  it("measures the offset from the slice's first event, not from zero", () => {
    // The slice starts at 100, so the third event is 105ms into the
    // interaction rather than 205ms into the session.
    const event = makeEvent({ id: 3, interactionId: 1, at: 205 });
    expect(eventSlicePosition(slices, event)?.offsetMs).toBe(105);
  });

  it("gives the first event a zero offset", () => {
    const event = makeEvent({ id: 1, interactionId: 1, at: 100 });
    expect(eventSlicePosition(slices, event)?.offsetMs).toBe(0);
  });

  it("returns null for an event that is not in any slice", () => {
    const orphan = makeEvent({ id: 99, interactionId: 1 });
    expect(eventSlicePosition(slices, orphan)).toBeNull();
  });

  it("returns null when the interaction has no slice", () => {
    const other = makeEvent({ id: 1, interactionId: 7 });
    expect(eventSlicePosition(slices, other)).toBeNull();
  });
});

describe("findSpanPartner", () => {
  const request = makeEvent({ id: 4, interactionId: 1, spanId: 4 });
  const response = makeEvent({
    id: 9,
    interactionId: 1,
    spanId: 4,
    direction: "down",
  });
  const index = new Map([[4, [request, response]]]);

  it("resolves the response from the request", () => {
    expect(findSpanPartner(index, request)?.id).toBe(9);
  });

  it("resolves the request from the response", () => {
    // Both halves carry the same spanId, so the lookup is symmetric and
    // neither half has to be found through the other.
    expect(findSpanPartner(index, response)?.id).toBe(4);
  });

  it("returns null for an event with no spanId", () => {
    expect(
      findSpanPartner(index, makeEvent({ id: 1, interactionId: 1 })),
    ).toBeNull();
  });

  it("returns null while the response is still in flight", () => {
    const pending = new Map([[4, [request]]]);
    expect(findSpanPartner(pending, request)).toBeNull();
  });

  it("returns null when the spanId is unknown to the index", () => {
    const stray = makeEvent({ id: 12, interactionId: 1, spanId: 77 });
    expect(findSpanPartner(index, stray)).toBeNull();
  });
});

describe("store expandedContext", () => {
  function withStore(fn: (store: FlowBandStore) => void): void {
    const teardown = $effect.root(() => {
      fn(createFlowBandStore());
    });
    teardown();
  }

  it("is null while nothing is expanded", () => {
    withStore((store) => {
      store.ingest(makeEvent({ id: 1, interactionId: 1 }));
      flushSync();
      expect(store.expandedContext).toBeNull();
    });
  });

  it("carries position and partner for the expanded event", () => {
    withStore((store) => {
      store.ingest(makeEvent({ id: 1, interactionId: 1, at: 10 }));
      store.ingest(makeEvent({ id: 2, interactionId: 1, at: 30, spanId: 2 }));
      store.ingest(
        makeEvent({
          id: 3,
          interactionId: 1,
          at: 75,
          spanId: 2,
          direction: "down",
        }),
      );
      store.toggleExpanded(2);
      flushSync();

      const ctx = store.expandedContext;
      expect(ctx?.event.id).toBe(2);
      expect(ctx?.stepIndex).toBe(2);
      expect(ctx?.stepCount).toBe(3);
      expect(ctx?.offsetMs).toBe(20);
      expect(ctx?.partner?.id).toBe(3);
    });
  });

  it("clears when the expanded card is collapsed again", () => {
    withStore((store) => {
      store.ingest(makeEvent({ id: 1, interactionId: 1 }));
      store.toggleExpanded(1);
      flushSync();
      expect(store.expandedContext).not.toBeNull();

      store.toggleExpanded(1);
      flushSync();
      expect(store.expandedContext).toBeNull();
    });
  });

  it("clears on reset", () => {
    withStore((store) => {
      store.ingest(makeEvent({ id: 1, interactionId: 1, spanId: 1 }));
      store.toggleExpanded(1);
      flushSync();

      store.reset();
      flushSync();
      expect(store.expandedContext).toBeNull();
    });
  });
});

describe("store run expansion", () => {
  function withStore(fn: (store: FlowBandStore) => void): void {
    const teardown = $effect.root(() => {
      fn(createFlowBandStore());
    });
    teardown();
  }

  it("starts with nothing unfolded", () => {
    withStore((store) => {
      expect(store.expandedRuns.size).toBe(0);
    });
  });

  it("toggles a run open and shut", () => {
    withStore((store) => {
      store.toggleRun(4);
      flushSync();
      expect(store.expandedRuns.has(4)).toBe(true);

      store.toggleRun(4);
      flushSync();
      expect(store.expandedRuns.has(4)).toBe(false);
    });
  });

  it("tracks several runs independently", () => {
    withStore((store) => {
      store.toggleRun(4);
      store.toggleRun(9);
      flushSync();
      expect(store.expandedRuns.size).toBe(2);
    });
  });

  it("refolds everything on reset", () => {
    withStore((store) => {
      store.toggleRun(4);
      flushSync();

      store.reset();
      flushSync();
      expect(store.expandedRuns.size).toBe(0);
    });
  });
});

describe("cellsColumnCount", () => {
  function decrypt(id: number): DemoFlowEvent {
    return makeEvent({
      id,
      interactionId: 1,
      lane: "crypto",
      direction: "local",
      groupKey: "decrypt:title",
    });
  }

  it("counts one column per cell while everything is folded", () => {
    const cells = groupSliceEvents([
      makeEvent({ id: 1, interactionId: 1 }),
      decrypt(2),
      decrypt(3),
      decrypt(4),
    ]);
    expect(cellsColumnCount(cells)).toBe(2);
  });

  it("widens by the run's size when it is open", () => {
    const cells = groupSliceEvents([decrypt(1), decrypt(2), decrypt(3)]);
    const first = cells.at(0);
    expect(first).toBeDefined();
    if (first === undefined) return;
    const runId = first.id;
    expect(cellsColumnCount(cells, new Set([runId]))).toBe(3);
  });

  it("counts nothing for no cells", () => {
    expect(cellsColumnCount([])).toBe(0);
  });
});
