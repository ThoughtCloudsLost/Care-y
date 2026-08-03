import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushSync } from "svelte";
import {
  createPeekController,
  computePeekFootprint,
  computePeekPosition,
  COMMIT_DRAG_PX,
  type ClipRect,
  type PeekController,
} from "./peek-controller.svelte.js";
import {
  createFrameGeometry,
  PHONE_PRESET,
  BEZEL,
  FRAME_FIT_MARGIN,
  type FrameGeometry,
} from "./frame-geometry.svelte.js";

// ---------------------------------------------------------------------------
// Pure sizing functions
// ---------------------------------------------------------------------------

describe("computePeekFootprint", () => {
  it("returns phone-aspect dimensions", () => {
    const aspect = PHONE_PRESET.w / PHONE_PRESET.h;
    const result = computePeekFootprint(1200, 900);
    const got = result.w / result.h;
    expect(Math.abs(got - aspect)).toBeLessThan(0.02);
  });

  it("spans nearly full width on narrow viewports", () => {
    const result = computePeekFootprint(390, 844);
    const maxW = 390 - FRAME_FIT_MARGIN * 2 - BEZEL * 2;
    // The footprint should be close to the available width
    expect(result.w).toBeLessThanOrEqual(maxW);
    expect(result.w).toBeGreaterThan(maxW * 0.8);
  });

  it("uses moderate width on wide viewports", () => {
    const result = computePeekFootprint(1400, 900);
    // Should not exceed PHONE_PRESET.w on wide screens
    expect(result.w).toBeLessThanOrEqual(PHONE_PRESET.w);
    expect(result.w).toBeGreaterThan(0);
  });

  it("caps height when viewport is short", () => {
    const result = computePeekFootprint(1200, 300);
    const maxH = 300 - FRAME_FIT_MARGIN * 2 - BEZEL * 2;
    expect(result.h).toBeLessThanOrEqual(maxH);
  });

  it("caps height for narrow viewport when viewport is very short", () => {
    const result = computePeekFootprint(390, 250);
    const maxH = 250 - FRAME_FIT_MARGIN * 2 - BEZEL * 2;
    expect(result.h).toBeLessThanOrEqual(maxH);
  });

  it("stays positive and aspect-true on degenerate windows", () => {
    // Fit wins over MIN_FOOTPRINT here: an aspect-true frame with both
    // axes at 200 cannot fit a 100px window. FrameGeometry.setFootprint
    // applies the 200px floor at apply time.
    const aspect = PHONE_PRESET.w / PHONE_PRESET.h;
    const result = computePeekFootprint(100, 100);
    expect(result.w).toBeGreaterThan(0);
    expect(result.h).toBeGreaterThan(0);
    expect(Math.abs(result.w / result.h - aspect)).toBeLessThan(0.02);
  });
});

describe("computePeekPosition", () => {
  it("centres the frame horizontally", () => {
    const pos = computePeekPosition(400, 600, 1200, 900);
    expect(pos.left).toBe(Math.round((1200 - 400) / 2));
  });

  it("places the frame in the upper portion of the viewport", () => {
    const pos = computePeekPosition(400, 300, 1200, 900);
    expect(pos.top).toBeLessThan(900 / 2);
  });

  it("clamps left to FRAME_FIT_MARGIN when frame is wider than window", () => {
    const pos = computePeekPosition(2000, 300, 500, 900);
    expect(pos.left).toBe(FRAME_FIT_MARGIN);
  });

  it("clamps top when frame is too tall for the viewport", () => {
    const pos = computePeekPosition(400, 1800, 1200, 900);
    // clampTopToViewport pins to margin when too tall
    expect(pos.top).toBe(FRAME_FIT_MARGIN);
  });
});

// ---------------------------------------------------------------------------
// Controller state machine
// ---------------------------------------------------------------------------

describe("createPeekController", () => {
  const sampleClip: ClipRect = {
    left: 50,
    top: 100,
    width: 300,
    height: 200,
  };

  beforeEach(() => {
    vi.stubGlobal("innerWidth", 1200);
    vi.stubGlobal("innerHeight", 900);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function setup(): {
    geo: FrameGeometry;
    ctrl: PeekController;
    teardown: () => void;
  } {
    let geo!: FrameGeometry;
    let ctrl!: PeekController;

    const teardown = $effect.root(() => {
      geo = createFrameGeometry();
      ctrl = createPeekController(geo);
    });
    flushSync();

    return { geo, ctrl, teardown };
  }

  it("starts in idle phase", () => {
    const { ctrl, teardown } = setup();
    expect(ctrl.phase).toBe("idle");
    expect(ctrl.savedGeometry).toBeNull();
    teardown();
  });

  it("saves the prior geometry on open", () => {
    const { ctrl, geo, teardown } = setup();

    const priorW = geo.footprintW;
    const priorH = geo.footprintH;
    const priorTop = geo.top;
    const priorLeft = geo.left;

    ctrl.open(sampleClip);
    flushSync();

    expect(ctrl.savedGeometry).toEqual({
      footprintW: priorW,
      footprintH: priorH,
      top: priorTop,
      left: priorLeft,
    });

    teardown();
  });

  it("transitions away from idle on open", () => {
    const { ctrl, teardown } = setup();

    ctrl.open(sampleClip);
    flushSync();

    // Either opening (animation in flight) or peeking (instant settle)
    expect(["opening", "peeking"]).toContain(ctrl.phase);

    teardown();
  });

  it("ignores a second open while not idle", () => {
    const { ctrl, teardown } = setup();

    ctrl.open(sampleClip);
    flushSync();

    const phaseAfterFirst = ctrl.phase;
    const savedAfterFirst = ctrl.savedGeometry;

    ctrl.open({ left: 200, top: 300, width: 400, height: 300 });
    flushSync();

    expect(ctrl.phase).toBe(phaseAfterFirst);
    expect(ctrl.savedGeometry).toBe(savedAfterFirst);

    teardown();
  });

  it("transitions to committed on commit from opening or peeking", () => {
    const { ctrl, teardown } = setup();

    ctrl.open(sampleClip);
    flushSync();

    ctrl.commit();
    flushSync();

    expect(ctrl.phase).toBe("committed");
    // Saved geometry stays so the consumer can restore the frame
    expect(ctrl.savedGeometry).not.toBeNull();

    teardown();
  });

  it("commit is a no-op from idle", () => {
    const { ctrl, teardown } = setup();

    ctrl.commit();
    flushSync();

    expect(ctrl.phase).toBe("idle");

    teardown();
  });

  it("collapse is a no-op from idle", () => {
    const { ctrl, teardown } = setup();

    ctrl.collapse();
    flushSync();

    expect(ctrl.phase).toBe("idle");

    teardown();
  });

  it("collapse from opening or peeking starts collapsing", () => {
    const { ctrl, teardown } = setup();

    ctrl.open(sampleClip);
    flushSync();

    expect(["opening", "peeking"]).toContain(ctrl.phase);

    ctrl.collapse();
    flushSync();

    // Either animating the collapse or already resolved to idle
    expect(["collapsing", "idle"]).toContain(ctrl.phase);

    teardown();
  });

  it("modifies geo footprint on open", () => {
    const { ctrl, geo, teardown } = setup();

    const priorW = geo.footprintW;

    ctrl.open(sampleClip);
    flushSync();

    // Geo should have changed from its prior value (either to the clip
    // rect starting point or the peek target)
    expect(geo.footprintW).not.toBe(priorW);

    teardown();
  });
});

// ---------------------------------------------------------------------------
// COMMIT_DRAG_PX exported for consumer reference
// ---------------------------------------------------------------------------

describe("COMMIT_DRAG_PX", () => {
  it("is a positive number", () => {
    expect(COMMIT_DRAG_PX).toBeGreaterThan(0);
  });
});
