import { describe, it, expect, beforeEach } from "vitest";
import { flushSync } from "svelte";
import {
  initColumnSlot,
  moveColumnToSlot,
  setColumnContainer,
  setColumnWindowWidth,
  evaluateColumnPressure,
  columnRect,
  restingColumnRect,
  columnSlot,
  resetColumnForTests,
} from "./flow-column.svelte.js";
import type { FlowHole } from "./flow-layout.js";
import { MAX_MEASURE, SLOT_FLIP_RATIO } from "./flow-layout.js";

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

/** A wide container. Slots take a half each, so both clear MAX_MEASURE. */
const WIDE_CW = MAX_MEASURE * 3;

/** Standard slot width at WIDE_CW: a full container half. */
const SLOT_W = WIDE_CW / 2;

/**
 * Build a FlowHole with the given left/right. Top/bottom are arbitrary
 * since pressure reads only the horizontal extent.
 */
function holeAt(left: number, right: number): FlowHole {
  return { left, right, top: 100, bottom: 500 };
}

/**
 * Set up a standard wide container and window.
 */
function setupWide(): void {
  setColumnWindowWidth(1200);
  setColumnContainer(WIDE_CW, 0);
}

// -----------------------------------------------------------------------
// Setup
// -----------------------------------------------------------------------

beforeEach(() => {
  resetColumnForTests();
});

// -----------------------------------------------------------------------
// initColumnSlot
// -----------------------------------------------------------------------

describe("initColumnSlot", () => {
  it("read mode places the column in the left slot instantly", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    expect(columnSlot()).toBe("left");
    expect(columnRect().x).toBe(0);
    expect(restingColumnRect().x).toBe(0);
  });

  it("simulate mode places the column in the right slot instantly", () => {
    setupWide();
    initColumnSlot("simulate");
    flushSync();

    expect(columnSlot()).toBe("right");
    expect(columnRect().x).toBe(WIDE_CW / 2);
    expect(restingColumnRect().x).toBe(WIDE_CW / 2);
  });

  it("places the column correctly when init precedes the container measurement", () => {
    // App calls initColumnSlot during script init, before FlowStory has
    // measured the container. The slot must resolve against the width
    // that arrives afterwards, not the zero it was chosen under.
    setColumnWindowWidth(1200);
    initColumnSlot("simulate");
    setColumnContainer(WIDE_CW, 0);
    flushSync();

    expect(columnRect().x).toBe(WIDE_CW / 2);
    expect(columnRect().x).toBe(restingColumnRect().x);
  });

  it("init snaps without animation (animated x equals resting x)", () => {
    setupWide();
    initColumnSlot("simulate");
    flushSync();

    // Animated and resting should match immediately (duration 0 snap)
    expect(columnRect().x).toBe(restingColumnRect().x);
  });
});

// -----------------------------------------------------------------------
// Slot width
// -----------------------------------------------------------------------

describe("slot width", () => {
  it("takes a full container half, uncapped", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    expect(columnRect().width).toBe(WIDE_CW / 2);
    expect(columnRect().width).toBeGreaterThan(MAX_MEASURE);
  });

  it("tracks the container half at any wide width", () => {
    setColumnWindowWidth(1200);
    const otherCW = MAX_MEASURE * 1.5;
    setColumnContainer(otherCW, 0);
    initColumnSlot("read");
    flushSync();

    expect(columnRect().width).toBe(otherCW / 2);
  });

  it("leaves no gutter between the two slots", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();
    const left = restingColumnRect();

    initColumnSlot("simulate");
    flushSync();
    const right = restingColumnRect();

    expect(left.x + left.width).toBe(right.x);
    expect(right.x + right.width).toBe(WIDE_CW);
  });
});

// -----------------------------------------------------------------------
// Pressure: frame center crossing the flip depth
// -----------------------------------------------------------------------

/** A hole of the given width centered on centerX. */
function holeCenteredAt(centerX: number, width = 400): FlowHole {
  return holeAt(centerX - width / 2, centerX + width / 2);
}

/** Container-space x the frame center must pass to flip a left column. */
const LEFT_FLIP_X = SLOT_W - SLOT_W * SLOT_FLIP_RATIO;

/** Same for a right column, measured in from its left edge. */
const RIGHT_FLIP_X = SLOT_W + SLOT_W * SLOT_FLIP_RATIO;

describe("evaluateColumnPressure flip depth", () => {
  it("holds while the center sits at exactly the flip depth", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    // Left column [0, SLOT_W]: the frame enters at the right edge and
    // must travel two thirds of the width to take the side.
    evaluateColumnPressure(holeCenteredAt(LEFT_FLIP_X));
    flushSync();

    expect(columnSlot()).toBe("left");
  });

  it("flips once the center passes the flip depth", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    evaluateColumnPressure(holeCenteredAt(LEFT_FLIP_X - 1));
    flushSync();

    expect(columnSlot()).toBe("right");
  });

  it("flips a right column when the center passes its flip depth", () => {
    setupWide();
    initColumnSlot("simulate");
    flushSync();

    evaluateColumnPressure(holeCenteredAt(RIGHT_FLIP_X + 1));
    flushSync();

    expect(columnSlot()).toBe("left");
  });

  it("ignores frame width: only the center position decides", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    // A frame far narrower than the flip depth still flips the column
    // once its center is deep enough, which a rule measured against
    // overlap could never let it reach.
    evaluateColumnPressure(holeCenteredAt(LEFT_FLIP_X - 1, 80));
    flushSync();
    expect(columnSlot()).toBe("right");

    // A very wide frame at a shallow center does not.
    initColumnSlot("read");
    flushSync();
    evaluateColumnPressure(holeCenteredAt(SLOT_W, 1200));
    flushSync();
    expect(columnSlot()).toBe("left");
  });

  it("holds a frame parked on the seam between the slots", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    // The seam is one third short of either flip depth, so a frame
    // centered there is absorbed by the line dodge instead.
    evaluateColumnPressure(holeCenteredAt(WIDE_CW / 2));
    flushSync();

    expect(columnSlot()).toBe("left");
  });

  it("does not flip back when the frame holds still after a flip", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    // The flip points sit at one sixth and five sixths of the container,
    // so the position that triggers a flip always leaves the column
    // somewhere the reverse test fails. No dead band needed.
    const hole = holeCenteredAt(LEFT_FLIP_X - 1);
    evaluateColumnPressure(hole);
    flushSync();
    expect(columnSlot()).toBe("right");

    evaluateColumnPressure(hole);
    evaluateColumnPressure(hole);
    flushSync();
    expect(columnSlot()).toBe("right");
  });
});

// -----------------------------------------------------------------------
// Layout-dictated moves
// -----------------------------------------------------------------------

describe("moveColumnToSlot", () => {
  it("moves the column to the named slot", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    moveColumnToSlot("right");
    flushSync();

    expect(columnSlot()).toBe("right");
    expect(restingColumnRect().x).toBe(WIDE_CW / 2);
  });

  it("is a no-op when the column already holds that slot", () => {
    setupWide();
    initColumnSlot("simulate");
    flushSync();

    moveColumnToSlot("right");
    flushSync();

    expect(columnSlot()).toBe("right");
  });

  it("covers a frame appearing on top of the column", () => {
    // Entering simulate spawns the frame centred in the left slot while the
    // column is still there. Its center lands at the column's midpoint,
    // short of the flip depth, so pressure alone leaves the two stacked.
    // The mode change moves the column instead.
    setupWide();
    initColumnSlot("read");
    flushSync();

    evaluateColumnPressure(holeCenteredAt(SLOT_W / 2));
    flushSync();
    expect(columnSlot()).toBe("left");

    moveColumnToSlot("right");
    flushSync();
    expect(columnSlot()).toBe("right");
  });
});

// -----------------------------------------------------------------------
// Null hole
// -----------------------------------------------------------------------

describe("null hole", () => {
  it("is a no-op (slot unchanged)", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    evaluateColumnPressure(null);
    flushSync();

    expect(columnSlot()).toBe("left");
    expect(columnRect().x).toBe(0);
  });
});

// -----------------------------------------------------------------------
// Frame-hidden slot persistence
// -----------------------------------------------------------------------

describe("frame-hidden slot persistence", () => {
  it("preserves the slot after a flip even when the hole disappears", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    // Drive the frame's centre past the flip depth so the column moves.
    const hole = holeCenteredAt(LEFT_FLIP_X - 1);
    evaluateColumnPressure(hole);
    flushSync();
    expect(columnSlot()).toBe("right");

    // Frame disappears: null hole, slot stays right
    evaluateColumnPressure(null);
    flushSync();
    expect(columnSlot()).toBe("right");
  });
});

// -----------------------------------------------------------------------
// Degenerate slot below WIDE_BREAKPOINT (900)
// -----------------------------------------------------------------------

describe("degenerate slot below 900px window", () => {
  it("reports a centered rect capped at MAX_MEASURE", () => {
    setColumnWindowWidth(800);
    const cw = 760;
    setColumnContainer(cw, 20);
    initColumnSlot("read");
    flushSync();

    const rect = columnRect();
    expect(rect.width).toBe(Math.min(MAX_MEASURE, cw));
    expect(rect.x).toBe(Math.max(0, (cw - MAX_MEASURE) / 2));
  });

  it("uses full container width when container is narrower than MAX_MEASURE", () => {
    setColumnWindowWidth(500);
    const cw = 400;
    setColumnContainer(cw, 50);
    initColumnSlot("read");
    flushSync();

    const rect = columnRect();
    expect(rect.width).toBe(cw);
    expect(rect.x).toBe(0);
  });

  it("pressure evaluation is a no-op in degenerate mode", () => {
    setColumnWindowWidth(800);
    setColumnContainer(760, 20);
    initColumnSlot("read");
    flushSync();

    const before = columnSlot();
    evaluateColumnPressure(holeAt(0, 400));
    flushSync();
    expect(columnSlot()).toBe(before);
  });

  it("resting and animated rects match in degenerate mode", () => {
    setColumnWindowWidth(800);
    setColumnContainer(760, 20);
    initColumnSlot("simulate");
    flushSync();

    expect(columnRect()).toEqual(restingColumnRect());
  });
});

// -----------------------------------------------------------------------
// Scroll invariance
// -----------------------------------------------------------------------

describe("scroll invariance", () => {
  it("two holes differing only in top/bottom produce identical slot decisions", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    // Hole A: same left/right, different vertical extent
    const holeA: FlowHole = { left: 0, right: SLOT_W, top: 0, bottom: 300 };
    evaluateColumnPressure(holeA);
    flushSync();
    const slotAfterA = columnSlot();

    // Reset and replay with hole B: same left/right, very different top/bottom
    resetColumnForTests();
    setupWide();
    initColumnSlot("read");
    flushSync();

    const holeB: FlowHole = { left: 0, right: SLOT_W, top: 5000, bottom: 8000 };
    evaluateColumnPressure(holeB);
    flushSync();
    const slotAfterB = columnSlot();

    expect(slotAfterA).toBe(slotAfterB);
  });
});

// -----------------------------------------------------------------------
// First evaluation instant, subsequent animate
// -----------------------------------------------------------------------

describe("first evaluation instant", () => {
  it("first pressure evaluation after init applies instantly", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    // Force a flip (first evaluation after init)
    evaluateColumnPressure(holeAt(0, SLOT_W));
    flushSync();

    // Because the first evaluation snaps (duration 0), animated x should
    // equal the resting x immediately.
    expect(columnRect().x).toBe(restingColumnRect().x);
  });
});
