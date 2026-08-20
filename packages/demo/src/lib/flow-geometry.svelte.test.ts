import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { flushSync } from "svelte";
import {
  setFlowGeometrySource,
  scrollTargetFor,
  flowGeometryReady,
  setTopChromeHeight,
  topChromeHeight,
  stickyTopOffset,
  locationWithVisibleHeading,
  setViewportScrollY,
  setHeaderBottom,
  TOP_BAR_HEIGHT,
  CHROME_GAP,
} from "./flow-geometry.svelte.js";
import type {
  FlowGeometrySource,
  FlowLocation,
} from "./flow-geometry.svelte.js";
import type {
  FlowBlock,
  FlowBlockGeometry,
  FlowHole,
  FlowLayoutResult,
} from "./flow-layout.js";

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function makeBlock(
  subSlug: string | null,
  kind: "sub-heading" | "sub-body" = "sub-heading",
  sectionId = "login" as FlowBlock["sectionId"],
): FlowBlock {
  return {
    id: `b-${subSlug ?? "title"}`,
    sectionId,
    subSlug,
    kind,
    text: "placeholder",
  };
}

function makeLayout(blockGeos: FlowBlockGeometry[]): FlowLayoutResult {
  const lastGeo = blockGeos[blockGeos.length - 1];
  return {
    lines: blockGeos.map((bg, i) => ({
      blockIndex: i,
      x: 0,
      y: bg.topY,
      width: 400,
      text: "line",
    })),
    blocks: blockGeos,
    figures: [],
    totalHeight: lastGeo !== undefined ? lastGeo.bottomY : 0,
  };
}

/**
 * Build a FlowGeometrySource with a layoutForHole that shifts block
 * positions as a function of the hole. This exercises the fixed-point
 * convergence: the target moves when the layout changes.
 */
function makeConvergingSource(
  blocks: readonly FlowBlock[],
  containerTop: number,
  baseTopY: number,
): FlowGeometrySource {
  const baseGeo: FlowBlockGeometry = {
    topY: baseTopY,
    bottomY: baseTopY + 24,
    firstLineIndex: 0,
    lineCount: 1,
  };
  const baseLayout = makeLayout([baseGeo]);

  return {
    layoutResult: baseLayout,
    blocks,
    containerTop,
    holeAtScrollY(scrollY: number): FlowHole | null {
      // Hole moves with scrollY (viewport-fixed frame)
      return {
        left: 100,
        top: 200 - scrollY + containerTop,
        right: 300,
        bottom: 400 - scrollY + containerTop,
      };
    },
    layoutForHole(hole: FlowHole | null): FlowLayoutResult {
      if (hole === null) return baseLayout;
      // When the hole overlaps the block region, the block shifts down
      // by a fraction of the overlap. This converges because the shift
      // decreases as the candidate stabilizes.
      const holeBottom = hole.bottom;
      const shift =
        holeBottom > baseTopY ? Math.min(holeBottom - baseTopY, 50) : 0;
      const shiftedGeo: FlowBlockGeometry = {
        topY: baseTopY + shift,
        bottomY: baseTopY + shift + 24,
        firstLineIndex: 0,
        lineCount: 1,
      };
      return makeLayout([shiftedGeo]);
    },
  };
}

/**
 * Build a deliberately oscillating source whose target alternates
 * between two values, never converging. Tests the iteration cap.
 */
function makeOscillatingSource(
  blocks: readonly FlowBlock[],
  containerTop: number,
): FlowGeometrySource {
  let callCount = 0;
  const geoA: FlowBlockGeometry = {
    topY: 500,
    bottomY: 524,
    firstLineIndex: 0,
    lineCount: 1,
  };
  const geoB: FlowBlockGeometry = {
    topY: 520,
    bottomY: 544,
    firstLineIndex: 0,
    lineCount: 1,
  };

  return {
    layoutResult: makeLayout([geoA]),
    blocks,
    containerTop,
    holeAtScrollY(): FlowHole | null {
      return { left: 100, top: 100, right: 300, bottom: 300 };
    },
    layoutForHole(): FlowLayoutResult {
      callCount++;
      // Alternate between two layouts so the target oscillates
      return callCount % 2 === 0 ? makeLayout([geoA]) : makeLayout([geoB]);
    },
  };
}

// -----------------------------------------------------------------------
// Setup
// -----------------------------------------------------------------------

beforeEach(() => {
  setFlowGeometrySource(null);
  setTopChromeHeight(TOP_BAR_HEIGHT);
});

// -----------------------------------------------------------------------
// Top chrome height
// -----------------------------------------------------------------------

describe("topChromeHeight", () => {
  it("starts at the top bar's height", () => {
    expect(topChromeHeight()).toBe(TOP_BAR_HEIGHT);
  });

  it("reports the published height", () => {
    setTopChromeHeight(TOP_BAR_HEIGHT + 292);
    expect(topChromeHeight()).toBe(TOP_BAR_HEIGHT + 292);
  });

  it("rounds a fractional measurement", () => {
    setTopChromeHeight(TOP_BAR_HEIGHT + 40.4);
    expect(topChromeHeight()).toBe(TOP_BAR_HEIGHT + 40);
  });

  it("never falls below the top bar", () => {
    setTopChromeHeight(0);
    expect(topChromeHeight()).toBe(TOP_BAR_HEIGHT);
  });

  it("falls back to the top bar for a non-finite measurement", () => {
    setTopChromeHeight(Number.NaN);
    expect(topChromeHeight()).toBe(TOP_BAR_HEIGHT);
  });

  it("is a no-op when the rounded value is unchanged", () => {
    setTopChromeHeight(TOP_BAR_HEIGHT + 100);
    expect(topChromeHeight()).toBe(TOP_BAR_HEIGHT + 100);
    // Same integer value after rounding: should not invalidate reactivity
    setTopChromeHeight(TOP_BAR_HEIGHT + 100.3);
    expect(topChromeHeight()).toBe(TOP_BAR_HEIGHT + 100);
  });
});

describe("stickyTopOffset", () => {
  it("parks a gap below the bare top bar", () => {
    expect(stickyTopOffset()).toBe(TOP_BAR_HEIGHT + CHROME_GAP);
  });

  it("moves down with the chrome", () => {
    setTopChromeHeight(TOP_BAR_HEIGHT + 292);
    expect(stickyTopOffset()).toBe(TOP_BAR_HEIGHT + 292 + CHROME_GAP);
  });
});

// -----------------------------------------------------------------------
// scrollTargetFor: source null
// -----------------------------------------------------------------------

describe("scrollTargetFor", () => {
  it("returns null when source is not set", () => {
    const result = scrollTargetFor(
      "login" as FlowBlock["sectionId"],
      "overview",
    );
    expect(result).toBeNull();
  });
});

// -----------------------------------------------------------------------
// scrollTargetFor: stale-page guard
// -----------------------------------------------------------------------

describe("scrollTargetFor stale-page guard", () => {
  it("returns null when blocks array is empty", () => {
    const source: FlowGeometrySource = {
      layoutResult: makeLayout([]),
      blocks: [],
      containerTop: 0,
      holeAtScrollY: () => null,
      layoutForHole: (_h) => makeLayout([]),
    };
    setFlowGeometrySource(source);
    const result = scrollTargetFor(
      "login" as FlowBlock["sectionId"],
      "overview",
    );
    expect(result).toBeNull();
  });

  it("returns null when first block's sectionId does not match", () => {
    const blocks = [
      makeBlock(
        "overview",
        "sub-heading",
        "dashboard" as FlowBlock["sectionId"],
      ),
    ];
    const geo: FlowBlockGeometry = {
      topY: 0,
      bottomY: 24,
      firstLineIndex: 0,
      lineCount: 1,
    };
    const source: FlowGeometrySource = {
      layoutResult: makeLayout([geo]),
      blocks,
      containerTop: 0,
      holeAtScrollY: () => null,
      layoutForHole: () => makeLayout([geo]),
    };
    setFlowGeometrySource(source);
    const result = scrollTargetFor(
      "login" as FlowBlock["sectionId"],
      "overview",
    );
    expect(result).toBeNull();
  });
});

// -----------------------------------------------------------------------
// scrollTargetFor: null sub returns 0
// -----------------------------------------------------------------------

describe("scrollTargetFor null sub", () => {
  it("returns 0 for a section-level target (subSlug null)", () => {
    const blocks = [
      makeBlock("overview", "sub-heading", "login" as FlowBlock["sectionId"]),
    ];
    const geo: FlowBlockGeometry = {
      topY: 100,
      bottomY: 124,
      firstLineIndex: 0,
      lineCount: 1,
    };
    const source: FlowGeometrySource = {
      layoutResult: makeLayout([geo]),
      blocks,
      containerTop: 50,
      holeAtScrollY: () => null,
      layoutForHole: () => makeLayout([geo]),
    };
    setFlowGeometrySource(source);

    const result = scrollTargetFor("login" as FlowBlock["sectionId"], null);
    expect(result).toBe(0);
  });
});

// -----------------------------------------------------------------------
// scrollTargetFor: fixed-point convergence
// -----------------------------------------------------------------------

describe("scrollTargetFor fixed-point convergence", () => {
  it("converges to a stable target with a hole-dependent layout", () => {
    // Window height 800, reading line at 0.4 * 800 = 320
    Object.defineProperty(window, "innerHeight", {
      value: 800,
      configurable: true,
    });

    const blocks = [
      makeBlock("overview", "sub-heading", "login" as FlowBlock["sectionId"]),
    ];
    const containerTop = 100;
    const source = makeConvergingSource(blocks, containerTop, 300);
    setFlowGeometrySource(source);

    const result = scrollTargetFor(
      "login" as FlowBlock["sectionId"],
      "overview",
    );
    expect(result).not.toBeNull();
    if (result === null) throw new Error("expected non-null result");
    // The result should be a reasonable scrollY value
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("respects the iteration cap with an oscillating source", () => {
    Object.defineProperty(window, "innerHeight", {
      value: 800,
      configurable: true,
    });

    const blocks = [
      makeBlock("overview", "sub-heading", "login" as FlowBlock["sectionId"]),
    ];
    const containerTop = 100;
    const source = makeOscillatingSource(blocks, containerTop);
    setFlowGeometrySource(source);

    // Should not throw or loop forever; returns a value after cap iterations
    const result = scrollTargetFor(
      "login" as FlowBlock["sectionId"],
      "overview",
    );
    expect(result).not.toBeNull();
    expect(typeof result).toBe("number");
  });

  it("returns null when the target block disappears during iteration", () => {
    Object.defineProperty(window, "innerHeight", {
      value: 800,
      configurable: true,
    });

    const blocks = [
      makeBlock("overview", "sub-heading", "login" as FlowBlock["sectionId"]),
    ];
    const containerTop = 100;
    const geo: FlowBlockGeometry = {
      topY: 300,
      bottomY: 324,
      firstLineIndex: 0,
      lineCount: 1,
    };
    const source: FlowGeometrySource = {
      layoutResult: makeLayout([geo]),
      blocks,
      containerTop,
      holeAtScrollY: () => ({ left: 0, top: 0, right: 500, bottom: 500 }),
      // layoutForHole returns empty layout, so scrollTargetForBlock returns null
      layoutForHole: () => makeLayout([]),
    };
    setFlowGeometrySource(source);

    const result = scrollTargetFor(
      "login" as FlowBlock["sectionId"],
      "overview",
    );
    expect(result).toBeNull();
  });
});

// -----------------------------------------------------------------------
// flowGeometryReady
// -----------------------------------------------------------------------

describe("flowGeometryReady", () => {
  it("returns false when no source is set", () => {
    expect(flowGeometryReady()).toBe(false);
  });

  it("returns true after setting a source", () => {
    const blocks = [makeBlock("overview")];
    const geo: FlowBlockGeometry = {
      topY: 0,
      bottomY: 24,
      firstLineIndex: 0,
      lineCount: 1,
    };
    setFlowGeometrySource({
      layoutResult: makeLayout([geo]),
      blocks,
      containerTop: 0,
      holeAtScrollY: () => null,
      layoutForHole: (_h) => makeLayout([geo]),
    });
    expect(flowGeometryReady()).toBe(true);
  });

  it("returns false after clearing the source", () => {
    const blocks = [makeBlock("overview")];
    const geo: FlowBlockGeometry = {
      topY: 0,
      bottomY: 24,
      firstLineIndex: 0,
      lineCount: 1,
    };
    setFlowGeometrySource({
      layoutResult: makeLayout([geo]),
      blocks,
      containerTop: 0,
      holeAtScrollY: () => null,
      layoutForHole: (_h) => makeLayout([geo]),
    });
    setFlowGeometrySource(null);
    expect(flowGeometryReady()).toBe(false);
  });
});

// -----------------------------------------------------------------------
// locationWithVisibleHeading: selection rule + scroll reactivity
// -----------------------------------------------------------------------

describe("locationWithVisibleHeading", () => {
  // Two sub-headings: the first sits at the container top, the second
  // 500px lower. containerTop 200 puts the first heading below the
  // band at scroll 0 (band = headerBottom 100 + BAND_GAP).
  function makeHeadingSource(): FlowGeometrySource {
    const blocks = [makeBlock("credentials"), makeBlock("two-factor")];
    const geos: FlowBlockGeometry[] = [
      { topY: 0, bottomY: 40, firstLineIndex: 0, lineCount: 1 },
      { topY: 500, bottomY: 540, firstLineIndex: 1, lineCount: 1 },
    ];
    return {
      layoutResult: makeLayout(geos),
      blocks,
      containerTop: 200,
      holeAtScrollY: () => null,
      layoutForHole: () => makeLayout(geos),
    };
  }

  beforeEach(() => {
    setHeaderBottom(100);
    setViewportScrollY(0);
  });

  afterEach(() => {
    setHeaderBottom(0);
    setViewportScrollY(0);
  });

  it("selects the first sub whose heading has not passed above the band", () => {
    setFlowGeometrySource(makeHeadingSource());
    expect(locationWithVisibleHeading()).toEqual({
      sectionId: "login",
      subSlug: "credentials",
    });
    // Scroll the first heading above the band: the next one is selected.
    setViewportScrollY(300);
    expect(locationWithVisibleHeading()).toEqual({
      sectionId: "login",
      subSlug: "two-factor",
    });
  });

  it("keeps the aligned sub selected through sub-pixel overshoot", () => {
    // Regression: alignment solves heading top == band exactly
    // (credentials aligns at scrollY 84 here: 200 - band 116). Browser
    // scroll rounding or a fixed-point residual can overshoot by a
    // fraction, leaving the heading just above the band. A strict
    // top >= band then flips selection to the next sub and fires a
    // stale page-scroll intent that overrides the click that caused
    // the alignment.
    setFlowGeometrySource(makeHeadingSource());
    setViewportScrollY(84);
    expect(locationWithVisibleHeading()?.subSlug).toBe("credentials");
    // Overshoot within tolerance still selects the aligned sub
    setViewportScrollY(88);
    expect(locationWithVisibleHeading()?.subSlug).toBe("credentials");
    // Beyond tolerance the heading has genuinely passed the band
    setViewportScrollY(89);
    expect(locationWithVisibleHeading()?.subSlug).toBe("two-factor");
  });

  it("falls back to the last sub once every heading is above the band", () => {
    setFlowGeometrySource(makeHeadingSource());
    setViewportScrollY(900);
    expect(locationWithVisibleHeading()).toEqual({
      sectionId: "login",
      subSlug: "two-factor",
    });
  });

  it("recomputes reactively from the published scroll position alone", () => {
    // Regression: FlowStory's runLayout skips republishing the geometry
    // source when a pass is a no-op (hole unchanged or disjoint), which
    // is the common case during plain scrolling. The selection must
    // therefore depend on the published scroll position, not on
    // window.scrollY, or a derived over it freezes and the story stops
    // selecting subs as the visitor scrolls.
    setFlowGeometrySource(makeHeadingSource());
    let computeCount = 0;
    let latest: FlowLocation | null = null;
    const cleanup = $effect.root(() => {
      const loc = $derived.by(() => {
        computeCount++;
        return locationWithVisibleHeading();
      });
      $effect(() => {
        latest = loc;
      });
    });
    flushSync();
    expect(latest).toEqual({ sectionId: "login", subSlug: "credentials" });
    const before = computeCount;
    // Only the scroll position changes; the source is untouched.
    setViewportScrollY(300);
    flushSync();
    expect(computeCount).toBeGreaterThan(before);
    expect(latest).toEqual({ sectionId: "login", subSlug: "two-factor" });
    cleanup();
  });
});

// -----------------------------------------------------------------------
// Published geometry: scroll-invariant hole left/right
// -----------------------------------------------------------------------

describe("published geometry scroll-invariance", () => {
  it("produces identical hole left/right across varying scrollY values", () => {
    // A synthetic source whose holeAtScrollY varies only top/bottom with
    // sy (mirroring rawHoleAt: the frame is viewport-fixed, so only the
    // document translation changes during scroll).
    const blocks = [makeBlock("overview")];
    const geo: FlowBlockGeometry = {
      topY: 0,
      bottomY: 24,
      firstLineIndex: 0,
      lineCount: 1,
    };
    const layout = makeLayout([geo]);
    const containerTop = 100;
    const frameLeft = 200;
    const frameRight = 500;

    const source: FlowGeometrySource = {
      layoutResult: layout,
      blocks,
      containerTop,
      holeAtScrollY(sy: number): FlowHole | null {
        // Only top/bottom depend on scrollY; left/right are scroll-invariant.
        return {
          left: frameLeft,
          top: 300 - sy + containerTop,
          right: frameRight,
          bottom: 700 - sy + containerTop,
        };
      },
      layoutForHole(): FlowLayoutResult {
        return layout;
      },
    };
    setFlowGeometrySource(source);

    const scrollValues = [0, 100, 250, 500, 999];
    const holes = scrollValues.map((sy) => source.holeAtScrollY(sy));

    for (const hole of holes) {
      expect(hole).not.toBeNull();
      expect(hole!.left).toBe(frameLeft);
      expect(hole!.right).toBe(frameRight);
    }

    // Verify top/bottom actually vary (the point of the test is that
    // left/right do NOT, while top/bottom DO).
    const tops = holes.map((h) => h!.top);
    const uniqueTops = new Set(tops);
    expect(uniqueTops.size).toBe(scrollValues.length);
  });
});
