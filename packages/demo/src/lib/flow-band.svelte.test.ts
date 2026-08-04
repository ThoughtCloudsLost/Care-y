import { describe, it, expect } from "vitest";
import { flushSync } from "svelte";
import {
  createFlowBandStore,
  ingestFlowEvent,
  toggleSliceCollapsed,
  sliceLaneSpan,
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
  CARD_COLUMN_WIDTH,
  CARD_COLUMN_GAP,
  PREVIEW_MAX_CHARS,
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
  payloadPreview?: string | null;
  durationMs?: number | null;
  direction?: DemoFlowEvent["direction"];
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

describe("sliceLaneSpan", () => {
  it("returns null for a slice with no events", () => {
    expect(
      sliceLaneSpan({ interactionId: 1, events: [], collapsed: false }),
    ).toBeNull();
  });

  it("spans the topmost and bottommost lanes touched", () => {
    let slices = ingestFlowEvent(
      [],
      makeEvent({ id: 1, interactionId: 1, lane: "ui" }),
    );
    slices = ingestFlowEvent(
      slices,
      makeEvent({ id: 2, interactionId: 1, lane: "server" }),
    );
    const slice = slices.at(0);
    expect(slice).toBeDefined();
    if (slice === undefined) return;
    expect(sliceLaneSpan(slice)).toEqual({
      first: laneIndex("server"),
      last: laneIndex("ui"),
    });
  });
});

// ---------------------------------------------------------------------------
// Connector geometry
// ---------------------------------------------------------------------------

describe("connectorPoints", () => {
  it("returns nothing to draw for a single event", () => {
    expect(connectorPoints([makeEvent({ id: 1, interactionId: 1 })], 40)).toBe(
      "",
    );
  });

  it("places each point at its card centre", () => {
    const events = [
      makeEvent({ id: 1, interactionId: 1, lane: "ui" }),
      makeEvent({ id: 2, interactionId: 1, lane: "db" }),
    ];
    const pitch = CARD_COLUMN_WIDTH + CARD_COLUMN_GAP;
    const expected = [
      `${String(CARD_COLUMN_WIDTH / 2)},${String(4 * 40 + 20)}`,
      `${String(pitch + CARD_COLUMN_WIDTH / 2)},${String(20)}`,
    ].join(" ");
    expect(connectorPoints(events, 40)).toBe(expected);
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
