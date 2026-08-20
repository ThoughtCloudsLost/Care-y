import { describe, it, expect, beforeEach } from "vitest";
import { flushSync } from "svelte";
import {
  initColumnSlot,
  setColumnContainer,
  setColumnWindowWidth,
  evaluateColumnPressure,
  columnRect,
  restingColumnRect,
  columnSlot,
  resetColumnForTests,
} from "./flow-column.svelte.js";
import type { FlowHole } from "./flow-layout.js";
import {
  MAX_MEASURE,
  SLOT_FLIP_RATIO,
  SLOT_FLIP_DEADBAND,
} from "./flow-layout.js";

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

/** Container width wide enough for two MAX_MEASURE slots. */
const WIDE_CW = MAX_MEASURE * 3;

/** Standard slot width at WIDE_CW. */
const SLOT_W = Math.min(MAX_MEASURE, WIDE_CW / 2);

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

  it("walk mode places the column in the right slot instantly", () => {
    setupWide();
    initColumnSlot("walk");
    flushSync();

    expect(columnSlot()).toBe("right");
    expect(columnRect().x).toBe(WIDE_CW / 2);
    expect(restingColumnRect().x).toBe(WIDE_CW / 2);
  });

  it("init snaps without animation (animated x equals resting x)", () => {
    setupWide();
    initColumnSlot("walk");
    flushSync();

    // Animated and resting should match immediately (duration 0 snap)
    expect(columnRect().x).toBe(restingColumnRect().x);
  });
});

// -----------------------------------------------------------------------
// Slot width
// -----------------------------------------------------------------------

describe("slot width", () => {
  it("is capped at MAX_MEASURE", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    expect(columnRect().width).toBe(MAX_MEASURE);
  });

  it("is half the container when container is narrow enough", () => {
    setColumnWindowWidth(1200);
    // Container narrow enough that half < MAX_MEASURE
    const narrowCW = MAX_MEASURE * 1.5;
    setColumnContainer(narrowCW, 0);
    initColumnSlot("read");
    flushSync();

    expect(columnRect().width).toBe(narrowCW / 2);
  });
});

// -----------------------------------------------------------------------
// Pressure threshold boundary
// -----------------------------------------------------------------------

describe("evaluateColumnPressure threshold", () => {
  it("does not flip when overlap equals exactly slotW * SLOT_FLIP_RATIO", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    // Left slot spans [0, SLOT_W]. Place a hole that overlaps exactly
    // slotW * SLOT_FLIP_RATIO from the right edge of the slot.
    const overlapTarget = SLOT_W * SLOT_FLIP_RATIO;
    // Hole left edge at (SLOT_W - overlapTarget), right edge past the slot
    const hole = holeAt(SLOT_W - overlapTarget, SLOT_W + 200);
    evaluateColumnPressure(hole);
    flushSync();

    expect(columnSlot()).toBe("left");
  });

  it("flips when overlap exceeds slotW * SLOT_FLIP_RATIO by 1px", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    const overlapTarget = SLOT_W * SLOT_FLIP_RATIO + 1;
    // Hole overlaps the left slot by just over the threshold, and does NOT
    // meaningfully overlap the right slot (well clear of it), so dead band
    // does not suppress the flip.
    const hole = holeAt(SLOT_W - overlapTarget, SLOT_W + 10);
    evaluateColumnPressure(hole);
    flushSync();

    expect(columnSlot()).toBe("right");
  });
});

// -----------------------------------------------------------------------
// Dead band
// -----------------------------------------------------------------------

describe("dead band", () => {
  it("suppresses flip when current/other overlap differ by less than SLOT_FLIP_DEADBAND", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    // A hole centered between the two slots so both overlaps are equal.
    // Left slot [0, SLOT_W], right slot [WIDE_CW/2, WIDE_CW/2 + SLOT_W].
    // Equal-width slots make the symmetric point the midpoint of the
    // slot centers: (SLOT_W + WIDE_CW/2) / 2. At WIDE_CW 1860 that is
    // 775; a 400px half-span overlaps each slot by 245 (> threshold
    // 206.7) with difference 0 (< dead band).
    const center = (SLOT_W + WIDE_CW / 2) / 2;
    const halfSpan = 400;
    const hole = holeAt(center - halfSpan, center + halfSpan);

    // Verify the overlap difference is within the dead band
    const leftOverlap = Math.max(
      0,
      Math.min(SLOT_W, center + halfSpan) - Math.max(0, center - halfSpan),
    );
    const rightOverlap = Math.max(
      0,
      Math.min(WIDE_CW / 2 + SLOT_W, center + halfSpan) -
        Math.max(WIDE_CW / 2, center - halfSpan),
    );
    const diff = leftOverlap - rightOverlap;

    // Precondition: both overlaps exceed threshold but difference is small
    expect(leftOverlap).toBeGreaterThan(SLOT_W * SLOT_FLIP_RATIO);
    expect(Math.abs(diff)).toBeLessThan(SLOT_FLIP_DEADBAND);

    evaluateColumnPressure(hole);
    flushSync();

    // Should NOT flip because the dead band suppresses it
    expect(columnSlot()).toBe("left");
  });

  it("flips when overlap difference exceeds SLOT_FLIP_DEADBAND", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    // A hole that overlaps the left slot heavily but barely touches the
    // right slot. The difference will exceed the dead band.
    const hole = holeAt(0, SLOT_W - 10);
    evaluateColumnPressure(hole);
    flushSync();

    // Left overlap is nearly the full slot width, right overlap is 0.
    // Difference (SLOT_W - 10) is well above SLOT_FLIP_DEADBAND (40).
    expect(columnSlot()).toBe("right");
  });
});

// -----------------------------------------------------------------------
// Straddling frame: lesser overlap wins
// -----------------------------------------------------------------------

describe("straddling frame tie-break", () => {
  it("flips to the slot with lesser overlap", () => {
    setupWide();
    initColumnSlot("read");
    flushSync();

    // Hole covers more of the left slot than the right. The right slot
    // has strictly less overlap, so it wins.
    // Left slot [0, SLOT_W], right slot [WIDE_CW/2, WIDE_CW/2 + SLOT_W].
    // Place a hole that spans from inside the left slot well into the gap,
    // overlapping the right slot only slightly.
    const hole = holeAt(SLOT_W * 0.3, WIDE_CW / 2 + SLOT_FLIP_DEADBAND + 20);
    const leftOverlap = Math.max(
      0,
      Math.min(SLOT_W, WIDE_CW / 2 + SLOT_FLIP_DEADBAND + 20) -
        Math.max(0, SLOT_W * 0.3),
    );
    const rightOverlap = Math.max(
      0,
      Math.min(WIDE_CW / 2 + SLOT_W, WIDE_CW / 2 + SLOT_FLIP_DEADBAND + 20) -
        Math.max(WIDE_CW / 2, SLOT_W * 0.3),
    );

    // Preconditions
    expect(leftOverlap).toBeGreaterThan(SLOT_W * SLOT_FLIP_RATIO);
    expect(leftOverlap - rightOverlap).toBeGreaterThanOrEqual(
      SLOT_FLIP_DEADBAND,
    );

    evaluateColumnPressure(hole);
    flushSync();

    // Lesser overlap is on the right slot, so column moves there
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

    // Force a flip to right
    const hole = holeAt(0, SLOT_W);
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
    initColumnSlot("walk");
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
