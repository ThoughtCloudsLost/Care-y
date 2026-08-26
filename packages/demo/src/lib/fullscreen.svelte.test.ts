import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushSync } from "svelte";
import {
  isFullscreenPressure,
  clampPillPosition,
  clampDrawerWidth,
  defaultPillPosition,
  createFullscreenController,
  DRAWER_MAX_MEASURE,
  DRAWER_DEFAULT_W,
  DRAWER_SNAP_CLOSE_W,
  type FullscreenController,
} from "./fullscreen.svelte.js";
import {
  createFrameGeometry,
  type FrameGeometry,
} from "./frame-geometry.svelte.js";
import { MIN_SEGMENT, HOLE_GAP, FULL_BLEED_SLIVER } from "./flow-layout.js";
import type { SavedGeometry } from "./peek-controller.svelte.js";

// ---------------------------------------------------------------------------
// isFullscreenPressure
// ---------------------------------------------------------------------------

describe("isFullscreenPressure", () => {
  const chromeH = 48;

  it("returns true when neither axis has room for text", () => {
    // Frame fills most of the window on both axes
    const result = isFullscreenPressure(1200, 850, 1280, 900, chromeH);
    expect(result).toBe(true);
  });

  it("returns false when the horizontal axis has room for a text column", () => {
    // outerW leaves enough room: windowW - outerW - 2*HOLE_GAP >= MIN_SEGMENT
    const outerW = 1280 - MIN_SEGMENT - HOLE_GAP * 2;
    const result = isFullscreenPressure(outerW, 850, 1280, 900, chromeH);
    expect(result).toBe(false);
  });

  it("returns false when the vertical gap exceeds FULL_BLEED_SLIVER", () => {
    // outerH leaves enough vertical gap: usableH - outerH >= FULL_BLEED_SLIVER
    const usableH = 900 - chromeH;
    const outerH = usableH - FULL_BLEED_SLIVER;
    const result = isFullscreenPressure(1200, outerH, 1280, 900, chromeH);
    expect(result).toBe(false);
  });

  it("triggers at exactly the horizontal threshold (boundary -1px)", () => {
    // One pixel short of MIN_SEGMENT room: pressure
    const outerW = 1280 - (MIN_SEGMENT - 1) - HOLE_GAP * 2;
    const result = isFullscreenPressure(outerW, 850, 1280, 900, chromeH);
    expect(result).toBe(true);
  });

  it("does not trigger at exactly MIN_SEGMENT room (boundary)", () => {
    // Exactly MIN_SEGMENT room: no pressure
    const outerW = 1280 - MIN_SEGMENT - HOLE_GAP * 2;
    const result = isFullscreenPressure(outerW, 850, 1280, 900, chromeH);
    expect(result).toBe(false);
  });

  it("triggers at exactly the vertical threshold (boundary -1px)", () => {
    const usableH = 900 - chromeH;
    // One pixel short of FULL_BLEED_SLIVER: pressure
    const outerH = usableH - (FULL_BLEED_SLIVER - 1);
    const result = isFullscreenPressure(1200, outerH, 1280, 900, chromeH);
    expect(result).toBe(true);
  });

  it("does not trigger at exactly FULL_BLEED_SLIVER gap (boundary)", () => {
    const usableH = 900 - chromeH;
    const outerH = usableH - FULL_BLEED_SLIVER;
    const result = isFullscreenPressure(1200, outerH, 1280, 900, chromeH);
    expect(result).toBe(false);
  });

  it("is symmetric: same frame in a wider window does not trigger", () => {
    // Tight in 1280, but comfortable in 1600
    expect(isFullscreenPressure(1200, 850, 1280, 900, chromeH)).toBe(true);
    expect(isFullscreenPressure(1200, 850, 1600, 900, chromeH)).toBe(false);
  });

  it("responds to chromeH: taller chrome makes vertical pressure easier", () => {
    const outerH = 800;
    // With small chrome, the gap is large enough
    expect(isFullscreenPressure(1200, outerH, 1280, 900, 20)).toBe(false);
    // With tall chrome, the usable height shrinks and gap drops below threshold
    expect(isFullscreenPressure(1200, outerH, 1280, 900, 200)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// clampPillPosition
// ---------------------------------------------------------------------------

describe("clampPillPosition", () => {
  const pillW = 160;
  const pillH = 40;
  const winW = 1280;
  const winH = 900;

  it("returns the same position when fully within bounds", () => {
    const result = clampPillPosition(400, 500, pillW, pillH, winW, winH);
    expect(result).toEqual({ top: 400, left: 500 });
  });

  it("clamps to the top edge", () => {
    const result = clampPillPosition(-100, 500, pillW, pillH, winW, winH);
    expect(result.top).toBe(8);
  });

  it("clamps to the bottom edge", () => {
    const result = clampPillPosition(2000, 500, pillW, pillH, winW, winH);
    expect(result.top).toBe(winH - pillH - 8);
  });

  it("clamps to the left edge", () => {
    const result = clampPillPosition(400, -100, pillW, pillH, winW, winH);
    expect(result.left).toBe(8);
  });

  it("clamps to the right edge", () => {
    const result = clampPillPosition(400, 2000, pillW, pillH, winW, winH);
    expect(result.left).toBe(winW - pillW - 8);
  });

  it("clamps all four edges simultaneously for an oversized pill", () => {
    // Pill larger than the window: margin wins on all sides
    const result = clampPillPosition(0, 0, 2000, 2000, 200, 200);
    expect(result.top).toBe(8);
    expect(result.left).toBe(8);
  });

  it("clamps to corner when pill is pushed far off-screen", () => {
    const result = clampPillPosition(-9999, -9999, pillW, pillH, winW, winH);
    expect(result.top).toBe(8);
    expect(result.left).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// clampDrawerWidth
// ---------------------------------------------------------------------------

describe("clampDrawerWidth", () => {
  it("returns the desired width untouched", () => {
    expect(clampDrawerWidth(400, 1280)).toBe(400);
  });

  it("allows a drawer narrower than any prose measure", () => {
    expect(clampDrawerWidth(100, 1280)).toBe(100);
  });

  it("allows the drawer to cover the window edge to edge", () => {
    expect(clampDrawerWidth(1280, 1280)).toBe(1280);
  });

  it("allows the drawer to close down to nothing", () => {
    expect(clampDrawerWidth(0, 1280)).toBe(0);
  });

  it("stops a drag past the left window edge at full width", () => {
    expect(clampDrawerWidth(2000, 1280)).toBe(1280);
  });

  it("stops a drag past the right window edge at zero", () => {
    expect(clampDrawerWidth(-200, 1280)).toBe(0);
  });

  it("never returns a negative width on a zero-width window", () => {
    expect(clampDrawerWidth(-50, 0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// defaultPillPosition
// ---------------------------------------------------------------------------

describe("defaultPillPosition", () => {
  it("rests near the top left, clear of the TopBar reveal strip", () => {
    const pos = defaultPillPosition(160, 40, 1280, 900);
    expect(pos.left).toBe(40);
    // Below the 8px reveal strip, so resting there never pulls the
    // TopBar down
    expect(pos.top).toBeGreaterThan(8);
    expect(pos.top).toBe(10);
  });

  it("stays within bounds on a small window", () => {
    const pos = defaultPillPosition(160, 40, 200, 100);
    expect(pos.top).toBeGreaterThanOrEqual(8);
    expect(pos.left).toBeGreaterThanOrEqual(8);
    expect(pos.top + 40).toBeLessThanOrEqual(100 - 8);
    expect(pos.left + 160).toBeLessThanOrEqual(200 - 8);
  });
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe("fullscreen constants", () => {
  it("DRAWER_MAX_MEASURE matches the flow-layout precedent", () => {
    expect(DRAWER_MAX_MEASURE).toBe(620);
  });
});

// ---------------------------------------------------------------------------
// createFullscreenController
// ---------------------------------------------------------------------------

describe("createFullscreenController", () => {
  const winSize = { w: 1280, h: 900 };

  beforeEach(() => {
    vi.stubGlobal("innerWidth", winSize.w);
    vi.stubGlobal("innerHeight", winSize.h);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function setup(opts?: { peekIdle?: boolean }): {
    geo: FrameGeometry;
    ctrl: FullscreenController;
    teardown: () => void;
  } {
    const peekIdle = opts?.peekIdle ?? true;
    let geo!: FrameGeometry;
    let ctrl!: FullscreenController;

    const teardown = $effect.root(() => {
      geo = createFrameGeometry();
      ctrl = createFullscreenController(
        geo,
        () => peekIdle,
        () => winSize,
      );
    });
    flushSync();

    return { geo, ctrl, teardown };
  }

  it("starts inactive", () => {
    const { ctrl, teardown } = setup();
    expect(ctrl.active).toBe(false);
    expect(ctrl.autoEntered).toBe(false);
    expect(ctrl.saved).toBeNull();
    expect(ctrl.drawerOpen).toBe(false);
    teardown();
  });

  it("enter activates and saves geometry", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    flushSync();

    expect(ctrl.active).toBe(true);
    expect(ctrl.autoEntered).toBe(false);
    expect(ctrl.saved).toEqual(snapshot);
    teardown();
  });

  it("enter with auto=true sets autoEntered", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(true, snapshot);
    flushSync();

    expect(ctrl.autoEntered).toBe(true);
    teardown();
  });

  it("enter is a no-op when peek is not idle", () => {
    const { ctrl, geo, teardown } = setup({ peekIdle: false });

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    flushSync();

    expect(ctrl.active).toBe(false);
    teardown();
  });

  it("enter is a no-op when already active", () => {
    const { ctrl, teardown } = setup();

    const snapshot1: SavedGeometry = {
      footprintW: 400,
      footprintH: 600,
      top: 100,
      left: 200,
    };
    const snapshot2: SavedGeometry = {
      footprintW: 500,
      footprintH: 700,
      top: 150,
      left: 250,
    };

    ctrl.enter(false, snapshot1);
    flushSync();
    ctrl.enter(true, snapshot2);
    flushSync();

    // Still has the first snapshot
    expect(ctrl.saved).toEqual(snapshot1);
    expect(ctrl.autoEntered).toBe(false);
    teardown();
  });

  it("exit restores saved geometry into geo", () => {
    const { ctrl, geo, teardown } = setup();

    const priorW = geo.footprintW;
    const priorH = geo.footprintH;
    const priorTop = geo.top;
    const priorLeft = geo.left;

    const snapshot: SavedGeometry = {
      footprintW: priorW,
      footprintH: priorH,
      top: priorTop,
      left: priorLeft,
    };

    ctrl.enter(false, snapshot);
    flushSync();

    // Mutate geo to simulate the override period
    geo.setFootprint(800, 600);
    geo.setPosition(0, 0);

    ctrl.exit();
    flushSync();

    expect(ctrl.active).toBe(false);
    expect(ctrl.saved).toBeNull();
    expect(geo.footprintW).toBe(priorW);
    expect(geo.footprintH).toBe(priorH);
    // Position is restored then clamped, so it should be close
    expect(geo.top).toBeCloseTo(priorTop, 0);
    expect(geo.left).toBeCloseTo(priorLeft, 0);
    teardown();
  });

  it("exit is a no-op when not active", () => {
    const { ctrl, geo, teardown } = setup();

    const w0 = geo.footprintW;
    const h0 = geo.footprintH;

    ctrl.exit();
    flushSync();

    expect(ctrl.active).toBe(false);
    expect(geo.footprintW).toBe(w0);
    expect(geo.footprintH).toBe(h0);
    teardown();
  });

  it("exit closes the drawer", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    flushSync();
    ctrl.toggleDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(true);

    ctrl.exit();
    flushSync();
    expect(ctrl.drawerOpen).toBe(false);
    teardown();
  });

  it("exitIntoResize deactivates without restoring geo", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    flushSync();

    // Mutate geo to a different size (simulating the live drag)
    geo.setFootprint(800, 600);
    geo.setPosition(50, 50);

    ctrl.exitIntoResize();
    flushSync();

    expect(ctrl.active).toBe(false);
    expect(ctrl.saved).toBeNull();
    // Geo keeps the mutated values, not restored to the snapshot
    expect(geo.footprintW).toBe(800);
    expect(geo.footprintH).toBe(600);
    expect(geo.top).toBe(50);
    expect(geo.left).toBe(50);
    teardown();
  });

  it("enter/exit round-trip restores exact geometry against a real createFrameGeometry", () => {
    const { ctrl, geo, teardown } = setup();

    // Set up a known geometry
    geo.setFootprint(500, 700);
    geo.setPosition(100, 200);
    geo.reanchorBand();

    const snapshot: SavedGeometry = {
      footprintW: 500,
      footprintH: 700,
      top: 100,
      left: 200,
    };

    ctrl.enter(false, snapshot);
    flushSync();
    expect(ctrl.active).toBe(true);

    ctrl.exit();
    flushSync();

    expect(ctrl.active).toBe(false);
    expect(geo.footprintW).toBe(500);
    expect(geo.footprintH).toBe(700);
    teardown();
  });

  it("setPillPos clamps to window bounds", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    flushSync();

    // Push pill off right and bottom
    ctrl.setPillPos(9999, 9999, 160, 40);
    flushSync();

    expect(ctrl.pillPos.top).toBe(winSize.h - 40 - 8);
    expect(ctrl.pillPos.left).toBe(winSize.w - 160 - 8);
    teardown();
  });

  it("toggleDrawer flips drawerOpen", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    flushSync();

    expect(ctrl.drawerOpen).toBe(false);
    ctrl.toggleDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(true);
    ctrl.toggleDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(false);
    teardown();
  });

  it("closeDrawer sets drawerOpen to false", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    flushSync();
    ctrl.toggleDrawer();
    flushSync();

    ctrl.closeDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(false);
    teardown();
  });

  it("openDrawer reopens a snapped-closed drawer", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    ctrl.toggleDrawer();
    ctrl.setDrawerW(0);
    ctrl.settleDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(false);

    ctrl.openDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(true);
    // The sliver it settled at would be unusable, so opening restores
    // a default. Off screen, where the resize cannot be seen.
    expect(ctrl.drawerW).toBe(DRAWER_DEFAULT_W);
    teardown();
  });

  it("openDrawer keeps a width that was already usable", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    ctrl.toggleDrawer();
    ctrl.setDrawerW(500);
    ctrl.closeDrawer();
    flushSync();

    ctrl.openDrawer();
    flushSync();
    expect(ctrl.drawerW).toBe(500);
    teardown();
  });

  it("however narrow a gesture settles, reopening lands somewhere usable", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    flushSync();

    for (const w of [-500, 0, 1, DRAWER_SNAP_CLOSE_W - 1]) {
      ctrl.openDrawer();
      ctrl.setDrawerW(w);
      ctrl.settleDrawer();
      flushSync();
      expect(ctrl.drawerOpen).toBe(false);

      ctrl.openDrawer();
      flushSync();
      expect(ctrl.drawerW).toBeGreaterThanOrEqual(DRAWER_SNAP_CLOSE_W);
    }
    teardown();
  });

  it("openDrawer is idempotent", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    ctrl.openDrawer();
    ctrl.openDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(true);
    teardown();
  });

  it("setDrawerW resizes freely inside the window", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    flushSync();

    // No floor at all: the width follows the drag anywhere
    ctrl.setDrawerW(1);
    flushSync();
    expect(ctrl.drawerW).toBe(1);

    // Past the left window edge stops at full width
    ctrl.setDrawerW(9999);
    flushSync();
    expect(ctrl.drawerW).toBe(winSize.w);

    // Ordinary widths are untouched
    ctrl.setDrawerW(400);
    flushSync();
    expect(ctrl.drawerW).toBe(400);
    teardown();
  });

  it("setDrawerW never closes the drawer mid-drag", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    ctrl.toggleDrawer();
    flushSync();

    // Well under the threshold, and still open: the drawer follows the
    // pointer wherever it goes.
    ctrl.setDrawerW(10);
    flushSync();
    expect(ctrl.drawerOpen).toBe(true);
    expect(ctrl.drawerW).toBe(10);

    // Dragged back out without ever releasing: nothing was decided.
    ctrl.setDrawerW(420);
    ctrl.settleDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(true);
    expect(ctrl.drawerW).toBe(420);
    teardown();
  });

  it("settleDrawer closes when the gesture came to rest under the threshold", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    ctrl.toggleDrawer();
    flushSync();

    ctrl.setDrawerW(DRAWER_SNAP_CLOSE_W - 1);
    ctrl.settleDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(false);

    // The width is left where the drag ended, so the close animates
    // from the size on screen instead of lurching on its way out.
    expect(ctrl.drawerW).toBe(DRAWER_SNAP_CLOSE_W - 1);
    teardown();
  });

  it("settleDrawer leaves a drawer that rests above the threshold alone", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    ctrl.toggleDrawer();
    ctrl.setDrawerW(DRAWER_SNAP_CLOSE_W);
    ctrl.settleDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(true);
    teardown();
  });

  it("reset clears all state", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(true, snapshot);
    flushSync();
    ctrl.toggleDrawer();
    ctrl.setDrawerW(500);
    flushSync();

    ctrl.reset();
    flushSync();

    expect(ctrl.active).toBe(false);
    expect(ctrl.autoEntered).toBe(false);
    expect(ctrl.saved).toBeNull();
    expect(ctrl.drawerOpen).toBe(false);
    expect(ctrl.drawerW).toBe(320);
    teardown();
  });

  it("enter sets a top-left default pill position", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    flushSync();

    // Entry seeds the same resting place defaultPillPosition computes:
    // near the top left, below the TopBar reveal strip.
    expect(ctrl.pillPos).toEqual(
      defaultPillPosition(160, 40, winSize.w, winSize.h),
    );
    expect(ctrl.pillPos.top).toBeGreaterThan(8);
    teardown();
  });
});
