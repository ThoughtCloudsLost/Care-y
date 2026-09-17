import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushSync } from "svelte";
import {
  isFullscreenPressure,
  clampDrawerMeasure,
  resolveTabPosition,
  edgeFromDragPosition,
  createFullscreenController,
  DRAWER_MAX_MEASURE,
  DRAWER_DEFAULT_MEASURE,
  DRAWER_SNAP_CLOSE_MEASURE,
  TAB_SIZE,
  TAB_MARGIN,
  type FullscreenController,
  type DockEdge,
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
    const result = isFullscreenPressure(1200, 850, 1280, 900, chromeH);
    expect(result).toBe(true);
  });

  it("returns false when the horizontal axis has room for a text column", () => {
    const outerW = 1280 - MIN_SEGMENT - HOLE_GAP * 2;
    const result = isFullscreenPressure(outerW, 850, 1280, 900, chromeH);
    expect(result).toBe(false);
  });

  it("returns false when the vertical gap exceeds FULL_BLEED_SLIVER", () => {
    const usableH = 900 - chromeH;
    const outerH = usableH - FULL_BLEED_SLIVER;
    const result = isFullscreenPressure(1200, outerH, 1280, 900, chromeH);
    expect(result).toBe(false);
  });

  it("triggers at exactly the horizontal threshold (boundary -1px)", () => {
    const outerW = 1280 - (MIN_SEGMENT - 1) - HOLE_GAP * 2;
    const result = isFullscreenPressure(outerW, 850, 1280, 900, chromeH);
    expect(result).toBe(true);
  });

  it("does not trigger at exactly MIN_SEGMENT room (boundary)", () => {
    const outerW = 1280 - MIN_SEGMENT - HOLE_GAP * 2;
    const result = isFullscreenPressure(outerW, 850, 1280, 900, chromeH);
    expect(result).toBe(false);
  });

  it("triggers at exactly the vertical threshold (boundary -1px)", () => {
    const usableH = 900 - chromeH;
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
    expect(isFullscreenPressure(1200, 850, 1280, 900, chromeH)).toBe(true);
    expect(isFullscreenPressure(1200, 850, 1600, 900, chromeH)).toBe(false);
  });

  it("responds to chromeH: taller chrome makes vertical pressure easier", () => {
    const outerH = 800;
    expect(isFullscreenPressure(1200, outerH, 1280, 900, 20)).toBe(false);
    expect(isFullscreenPressure(1200, outerH, 1280, 900, 200)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// clampDrawerMeasure
// ---------------------------------------------------------------------------

describe("clampDrawerMeasure", () => {
  it("returns the desired measure untouched for left/right edges", () => {
    expect(clampDrawerMeasure(400, 1280, 900, "right")).toBe(400);
    expect(clampDrawerMeasure(400, 1280, 900, "left")).toBe(400);
  });

  it("returns the desired measure untouched for top/bottom edges", () => {
    expect(clampDrawerMeasure(400, 1280, 900, "top")).toBe(400);
    expect(clampDrawerMeasure(400, 1280, 900, "bottom")).toBe(400);
  });

  it("clamps left/right edges against windowW", () => {
    expect(clampDrawerMeasure(2000, 1280, 900, "right")).toBe(1280);
    expect(clampDrawerMeasure(2000, 1280, 900, "left")).toBe(1280);
  });

  it("clamps top/bottom edges against windowH", () => {
    expect(clampDrawerMeasure(2000, 1280, 900, "top")).toBe(900);
    expect(clampDrawerMeasure(2000, 1280, 900, "bottom")).toBe(900);
  });

  it("clamps negative values to zero", () => {
    expect(clampDrawerMeasure(-200, 1280, 900, "right")).toBe(0);
    expect(clampDrawerMeasure(-200, 1280, 900, "top")).toBe(0);
  });

  it("allows zero", () => {
    expect(clampDrawerMeasure(0, 1280, 900, "left")).toBe(0);
  });

  it("allows edge-to-edge coverage for both axis types", () => {
    expect(clampDrawerMeasure(1280, 1280, 900, "right")).toBe(1280);
    expect(clampDrawerMeasure(900, 1280, 900, "bottom")).toBe(900);
  });

  it("never returns negative on a zero-size window", () => {
    expect(clampDrawerMeasure(-50, 0, 0, "right")).toBe(0);
    expect(clampDrawerMeasure(-50, 0, 0, "top")).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// resolveTabPosition
// ---------------------------------------------------------------------------

describe("resolveTabPosition", () => {
  const winW = 1280;
  const winH = 900;

  it("places the tab at the start of the top edge at offset 0", () => {
    const pos = resolveTabPosition("top", 0, TAB_SIZE, winW, winH);
    expect(pos.top).toBe(0);
    expect(pos.left).toBe(TAB_MARGIN);
  });

  it("places the tab at the end of the top edge at offset 1", () => {
    const pos = resolveTabPosition("top", 1, TAB_SIZE, winW, winH);
    expect(pos.top).toBe(0);
    expect(pos.left).toBe(winW - TAB_SIZE - TAB_MARGIN);
  });

  it("places the tab at the midpoint of the bottom edge at offset 0.5", () => {
    const pos = resolveTabPosition("bottom", 0.5, TAB_SIZE, winW, winH);
    expect(pos.top).toBe(winH - TAB_SIZE);
    const range = winW - TAB_SIZE - TAB_MARGIN * 2;
    expect(pos.left).toBe(TAB_MARGIN + range * 0.5);
  });

  it("places the tab at the start of the left edge at offset 0", () => {
    const pos = resolveTabPosition("left", 0, TAB_SIZE, winW, winH);
    expect(pos.left).toBe(0);
    expect(pos.top).toBe(TAB_MARGIN);
  });

  it("places the tab at the end of the right edge at offset 1", () => {
    const pos = resolveTabPosition("right", 1, TAB_SIZE, winW, winH);
    expect(pos.left).toBe(winW - TAB_SIZE);
    expect(pos.top).toBe(winH - TAB_SIZE - TAB_MARGIN);
  });

  it("clamps offset below 0 to 0", () => {
    const pos = resolveTabPosition("top", -5, TAB_SIZE, winW, winH);
    expect(pos.left).toBe(TAB_MARGIN);
  });

  it("clamps offset above 1 to 1", () => {
    const pos = resolveTabPosition("top", 10, TAB_SIZE, winW, winH);
    expect(pos.left).toBe(winW - TAB_SIZE - TAB_MARGIN);
  });

  it("handles a window smaller than the tab gracefully", () => {
    const pos = resolveTabPosition("top", 0.5, TAB_SIZE, 20, 20);
    expect(pos.top).toBe(0);
    expect(pos.left).toBe(TAB_MARGIN);
  });
});

// ---------------------------------------------------------------------------
// edgeFromDragPosition
// ---------------------------------------------------------------------------

describe("edgeFromDragPosition", () => {
  const winW = 1280;
  const winH = 900;

  it("returns 'top' when the pointer is near the top edge", () => {
    expect(edgeFromDragPosition(640, 5, winW, winH)).toBe("top");
  });

  it("returns 'bottom' when the pointer is near the bottom edge", () => {
    expect(edgeFromDragPosition(640, 895, winW, winH)).toBe("bottom");
  });

  it("returns 'left' when the pointer is near the left edge", () => {
    expect(edgeFromDragPosition(5, 450, winW, winH)).toBe("left");
  });

  it("returns 'right' when the pointer is near the right edge", () => {
    expect(edgeFromDragPosition(1275, 450, winW, winH)).toBe("right");
  });

  it("returns 'top' for the top-left corner (top and left tie, top wins by sort stability)", () => {
    // At (0, 0), distance to top = 0, distance to left = 0.
    // Sort is stable, so whichever appears first in the array wins.
    const edge = edgeFromDragPosition(0, 0, winW, winH);
    expect(edge).toBe("top");
  });

  it("picks the nearest edge from a center-ish point biased toward one side", () => {
    // x=100, y=450: distances are top=450, bottom=450, left=100, right=1180
    expect(edgeFromDragPosition(100, 450, winW, winH)).toBe("left");
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

  it("starts inactive with default dock state", () => {
    const { ctrl, teardown } = setup();
    expect(ctrl.active).toBe(false);
    expect(ctrl.autoEntered).toBe(false);
    expect(ctrl.saved).toBeNull();
    expect(ctrl.drawerOpen).toBe(false);
    expect(ctrl.dockEdge).toBe("right");
    expect(ctrl.dockOffset).toBe(0.85);
    expect(ctrl.drawerMeasure).toBe(DRAWER_DEFAULT_MEASURE);
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

    geo.setFootprint(800, 600);
    geo.setPosition(0, 0);

    ctrl.exit();
    flushSync();

    expect(ctrl.active).toBe(false);
    expect(ctrl.saved).toBeNull();
    expect(geo.footprintW).toBe(priorW);
    expect(geo.footprintH).toBe(priorH);
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

    geo.setFootprint(800, 600);
    geo.setPosition(50, 50);

    ctrl.exitIntoResize();
    flushSync();

    expect(ctrl.active).toBe(false);
    expect(ctrl.saved).toBeNull();
    expect(geo.footprintW).toBe(800);
    expect(geo.footprintH).toBe(600);
    expect(geo.top).toBe(50);
    expect(geo.left).toBe(50);
    teardown();
  });

  it("enter/exit round-trip restores exact geometry against a real createFrameGeometry", () => {
    const { ctrl, geo, teardown } = setup();

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

  it("setDock updates edge and offset", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    flushSync();

    ctrl.setDock("left", 0.75);
    flushSync();

    expect(ctrl.dockEdge).toBe("left");
    expect(ctrl.dockOffset).toBe(0.75);
    teardown();
  });

  it("setDock clamps offset to [0, 1]", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    flushSync();

    ctrl.setDock("top", -5);
    flushSync();
    expect(ctrl.dockOffset).toBe(0);

    ctrl.setDock("bottom", 99);
    flushSync();
    expect(ctrl.dockOffset).toBe(1);
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
    ctrl.setDrawerMeasure(0);
    ctrl.settleDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(false);

    ctrl.openDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(true);
    expect(ctrl.drawerMeasure).toBe(DRAWER_DEFAULT_MEASURE);
    teardown();
  });

  it("openDrawer keeps a measure that was already usable", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    ctrl.toggleDrawer();
    ctrl.setDrawerMeasure(500);
    ctrl.closeDrawer();
    flushSync();

    ctrl.openDrawer();
    flushSync();
    expect(ctrl.drawerMeasure).toBe(500);
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

    for (const m of [-500, 0, 1, DRAWER_SNAP_CLOSE_MEASURE - 1]) {
      ctrl.openDrawer();
      ctrl.setDrawerMeasure(m);
      ctrl.settleDrawer();
      flushSync();
      expect(ctrl.drawerOpen).toBe(false);

      ctrl.openDrawer();
      flushSync();
      expect(ctrl.drawerMeasure).toBeGreaterThanOrEqual(
        DRAWER_SNAP_CLOSE_MEASURE,
      );
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

  it("setDrawerMeasure resizes freely inside the window", () => {
    const { ctrl, geo, teardown } = setup();

    const snapshot: SavedGeometry = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };

    ctrl.enter(false, snapshot);
    flushSync();

    ctrl.setDrawerMeasure(1);
    flushSync();
    expect(ctrl.drawerMeasure).toBe(1);

    ctrl.setDrawerMeasure(9999);
    flushSync();
    expect(ctrl.drawerMeasure).toBe(winSize.w);

    ctrl.setDrawerMeasure(400);
    flushSync();
    expect(ctrl.drawerMeasure).toBe(400);
    teardown();
  });

  it("setDrawerMeasure never closes the drawer mid-drag", () => {
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

    ctrl.setDrawerMeasure(10);
    flushSync();
    expect(ctrl.drawerOpen).toBe(true);
    expect(ctrl.drawerMeasure).toBe(10);

    ctrl.setDrawerMeasure(420);
    ctrl.settleDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(true);
    expect(ctrl.drawerMeasure).toBe(420);
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

    ctrl.setDrawerMeasure(DRAWER_SNAP_CLOSE_MEASURE - 1);
    ctrl.settleDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(false);

    expect(ctrl.drawerMeasure).toBe(DRAWER_SNAP_CLOSE_MEASURE - 1);
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
    ctrl.setDrawerMeasure(DRAWER_SNAP_CLOSE_MEASURE);
    ctrl.settleDrawer();
    flushSync();
    expect(ctrl.drawerOpen).toBe(true);
    teardown();
  });

  it("reset clears all state to defaults", () => {
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
    ctrl.setDrawerMeasure(500);
    ctrl.setDock("left", 0.2);
    flushSync();

    ctrl.reset();
    flushSync();

    expect(ctrl.active).toBe(false);
    expect(ctrl.autoEntered).toBe(false);
    expect(ctrl.saved).toBeNull();
    expect(ctrl.drawerOpen).toBe(false);
    expect(ctrl.drawerMeasure).toBe(DRAWER_DEFAULT_MEASURE);
    expect(ctrl.dockEdge).toBe("right");
    expect(ctrl.dockOffset).toBe(0.85);
    teardown();
  });
});
