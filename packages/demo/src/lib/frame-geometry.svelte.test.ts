import { describe, it, expect } from "vitest";
import {
  createFrameGeometry,
  computeBandRescale,
  deriveZoomViewport,
  deriveBezelRadius,
  computeSpawn,
  computeShrunkFootprint,
  computeAutoGrowTarget,
  bottomCentrePosition,
  isAutoShrinkSize,
  AUTO_SHRINK_MAX_EDGE,
  AUTO_GROW_FACTOR,
  clampPosition,
  presetAnchoredLeft,
  presetAnchoredTop,
  clampTopToViewport,
  FRAME_FIT_MARGIN,
  SPAWN_MARGIN,
  PHONE_PRESET,
  DESKTOP_PRESET,
  MIN_FOOTPRINT,
  MIN_VIEWPORT,
  BEZEL,
  SHRINK_VH_FRACTION,
  contentBandFor,
  frameSlotFor,
  computeFitBand,
  fitPreset,
  RAIL_WIDTH,
  RAIL_GAP,
  WRAPPER_PAD_LEFT,
  WRAPPER_PAD_RIGHT,
  WIDE_BREAKPOINT,
} from "./frame-geometry.svelte.js";
import { TOOLBAR_CLEARANCE } from "./flow-layout.js";
import { TOP_BAR_HEIGHT } from "./flow-geometry.svelte.js";
import { DEFAULT_BAND_HEIGHT } from "./flow-band.svelte.js";

/**
 * A representative open-chrome height: the top bar plus the flow band's
 * default lane area. The band's own header and resize handle add a bit
 * more in the page, which none of these assertions depend on.
 */
const OPEN_CHROME = TOP_BAR_HEIGHT + DEFAULT_BAND_HEIGHT;

// -----------------------------------------------------------------------
// deriveZoomViewport
// -----------------------------------------------------------------------

describe("deriveZoomViewport", () => {
  it("returns zoom 1 and viewport equal to footprint at the phone preset", () => {
    const result = deriveZoomViewport(PHONE_PRESET.w, PHONE_PRESET.h);
    expect(result.zoom).toBe(1);
    expect(result.viewport.w).toBe(390);
    expect(result.viewport.h).toBe(844);
  });

  it("returns zoom 1 when footprint exceeds the minimum viewport", () => {
    const result = deriveZoomViewport(800, 1000);
    expect(result.zoom).toBe(1);
    expect(result.viewport.w).toBe(800);
    expect(result.viewport.h).toBe(1000);
  });

  it("scales down when footprint is smaller than minimum viewport", () => {
    // 195 / 390 = 0.5, 422 / 844 = 0.5
    const result = deriveZoomViewport(195, 422);
    expect(result.zoom).toBe(0.5);
    // viewport = footprint / zoom = 195/0.5 = 390, 422/0.5 = 844
    expect(result.viewport.w).toBe(390);
    expect(result.viewport.h).toBe(844);
  });

  it("uses the smaller ratio when width is the limiting factor", () => {
    // Width ratio: 200/390 = ~0.513, Height ratio: 844/844 = 1
    const result = deriveZoomViewport(200, 844);
    const expectedZoom = 200 / MIN_VIEWPORT.w;
    expect(result.zoom).toBeCloseTo(expectedZoom, 5);
    expect(result.viewport.w).toBe(Math.round(200 / expectedZoom));
  });

  it("uses the smaller ratio when height is the limiting factor", () => {
    // Width ratio: 390/390 = 1, Height ratio: 400/844 = ~0.474
    const result = deriveZoomViewport(390, 400);
    const expectedZoom = 400 / MIN_VIEWPORT.h;
    expect(result.zoom).toBeCloseTo(expectedZoom, 5);
    expect(result.viewport.h).toBe(Math.round(400 / expectedZoom));
  });

  it("desktop preset yields zoom below 1 with viewport past 1024", () => {
    const result = deriveZoomViewport(DESKTOP_PRESET.w, DESKTOP_PRESET.h);
    // zoom = min(1, 760/390, 475/844) = min(1, 1.949, 0.563) = 0.563
    const expectedZoom = DESKTOP_PRESET.h / MIN_VIEWPORT.h;
    expect(result.zoom).toBeCloseTo(expectedZoom, 2);
    // viewport width = 760 / 0.563 ~= 1350
    expect(result.viewport.w).toBeGreaterThan(1024);
  });

  it("clamps zoom to minimum 0.01 to avoid division by zero", () => {
    // Very tiny footprint (below any reasonable size)
    const result = deriveZoomViewport(1, 1);
    expect(result.zoom).toBe(0.01);
    expect(result.viewport.w).toBe(100);
    expect(result.viewport.h).toBe(100);
  });

  it("grows viewport past minimum when footprint exceeds it", () => {
    const result = deriveZoomViewport(500, 1000);
    expect(result.zoom).toBe(1);
    expect(result.viewport.w).toBe(500);
    expect(result.viewport.h).toBe(1000);
  });
});

// -----------------------------------------------------------------------
// computeSpawn
// -----------------------------------------------------------------------

describe("computeSpawn", () => {
  const topBar = TOP_BAR_HEIGHT;

  it("scales the phone down to fit the window height, keeping its ratio", () => {
    // 900px tall cannot hold an 844px phone plus bezel, top bar, and
    // toolbar, so the spawn must shrink rather than overflow.
    const spawn = computeSpawn(1280, 900, topBar);

    expect(spawn.footprintH).toBeLessThan(PHONE_PRESET.h);
    expect(spawn.footprintW / spawn.footprintH).toBeCloseTo(
      PHONE_PRESET.w / PHONE_PRESET.h,
      2,
    );
  });

  it("leaves the toolbar visible below the top bar", () => {
    // The toolbar is absolutely positioned above frameRect.top, so the
    // frame must start at least its clearance below the bar.
    const spawn = computeSpawn(1280, 900, topBar);
    expect(spawn.top).toBeGreaterThanOrEqual(topBar + TOOLBAR_CLEARANCE);
  });

  it("leaves clear space below the frame", () => {
    const windowH = 900;
    const spawn = computeSpawn(1280, windowH, topBar);
    const outerH = spawn.footprintH + BEZEL * 2;
    expect(spawn.top + outerH).toBeLessThanOrEqual(windowH - SPAWN_MARGIN);
  });

  it("does not scale down when the window is tall enough", () => {
    // Plenty of height: full phone preset, no shrinking.
    const spawn = computeSpawn(1600, 1200, topBar);
    expect(spawn.footprintW).toBe(PHONE_PRESET.w);
    expect(spawn.footprintH).toBe(PHONE_PRESET.h);
  });

  it("centres the frame in its slot at >= 900px", () => {
    const windowW = 1280;
    const spawn = computeSpawn(windowW, 900, topBar);
    const outerW = spawn.footprintW + BEZEL * 2;
    const slot = frameSlotFor(windowW);

    // Equal slack on both sides of the frame within its slot.
    const slackLeft = spawn.left - slot.left;
    const slackRight = slot.right - (spawn.left + outerW);
    expect(slackLeft).toBeCloseTo(slackRight, 5);
    expect(slackLeft).toBeGreaterThan(0);
    expect(spawn.top).toBeGreaterThanOrEqual(topBar);
  });

  it("clears the rail the slot starts after", () => {
    // The slot begins right of the rail track, so a centred frame never
    // sits over the rail.
    const spawn = computeSpawn(1280, 900, topBar);
    expect(spawn.left).toBeGreaterThanOrEqual(WRAPPER_PAD_LEFT + RAIL_WIDTH);
  });

  it("keeps a frame wider than its slot fully on screen", () => {
    // 900px window: the slot is narrow enough that the frame plus
    // margins does not fit once centred. The clamp keeps it on screen.
    const windowW = 900;
    const spawn = computeSpawn(windowW, 900, topBar);
    const outerW = spawn.footprintW + BEZEL * 2;

    expect(spawn.left).toBeGreaterThanOrEqual(FRAME_FIT_MARGIN);
    expect(spawn.left + outerW).toBeLessThanOrEqual(windowW - FRAME_FIT_MARGIN);
  });

  it("scales down on narrow windows (< 900px)", () => {
    const spawn = computeSpawn(400, 800, topBar);
    // Should be scaled to ~40vh = 320px height
    expect(spawn.footprintH).toBeLessThan(PHONE_PRESET.h);
    expect(spawn.footprintW).toBeLessThan(PHONE_PRESET.w);
    expect(spawn.footprintW).toBeGreaterThanOrEqual(MIN_FOOTPRINT.w);
    expect(spawn.footprintH).toBeGreaterThanOrEqual(MIN_FOOTPRINT.h);
  });

  it("centers horizontally on narrow windows", () => {
    const spawn = computeSpawn(400, 800, topBar);
    const outerW = spawn.footprintW + BEZEL * 2;
    const expectedLeft = Math.max(0, (400 - outerW) / 2);
    expect(spawn.left).toBeCloseTo(expectedLeft, 0);
  });

  it("places below the top bar and toolbar on narrow windows", () => {
    const spawn = computeSpawn(400, 800, topBar);
    expect(spawn.top).toBeGreaterThanOrEqual(topBar + TOOLBAR_CLEARANCE);
  });

  it("enforces minimum footprint dimensions", () => {
    const spawn = computeSpawn(100, 200, topBar);
    expect(spawn.footprintW).toBeGreaterThanOrEqual(MIN_FOOTPRINT.w);
    expect(spawn.footprintH).toBeGreaterThanOrEqual(MIN_FOOTPRINT.h);
  });

  it("spawns below an open flow band, not just below the top bar", () => {
    const spawn = computeSpawn(1280, 900, OPEN_CHROME);
    expect(spawn.top).toBeGreaterThanOrEqual(OPEN_CHROME + TOOLBAR_CLEARANCE);
  });

  it("shrinks the spawn to fit the band that an open chrome leaves", () => {
    const tall = computeSpawn(1280, 900, topBar);
    const short = computeSpawn(1280, 900, OPEN_CHROME);
    expect(short.footprintH).toBeLessThan(tall.footprintH);
    expect(short.footprintW / short.footprintH).toBeCloseTo(
      PHONE_PRESET.w / PHONE_PRESET.h,
      2,
    );
  });
});

// -----------------------------------------------------------------------
// Story bands and slots
// -----------------------------------------------------------------------

describe("contentBandFor", () => {
  it("starts the container after the wrapper padding and the rail", () => {
    const band = contentBandFor(1512);
    expect(band.left).toBe(WRAPPER_PAD_LEFT + RAIL_WIDTH + RAIL_GAP);
    expect(band.left + band.width).toBe(1512 - WRAPPER_PAD_RIGHT);
  });

  it("drops the rail allowance below the wide breakpoint", () => {
    const band = contentBandFor(WIDE_BREAKPOINT - 1);
    expect(band.left).toBe(WRAPPER_PAD_LEFT);
  });
});

describe("frameSlotFor", () => {
  it("gives the frame the container's left half at wide widths", () => {
    const content = contentBandFor(1512);
    const slot = frameSlotFor(1512);
    expect(slot.left).toBe(content.left);
    expect(slot.right - slot.left).toBe(content.width / 2);
  });

  it("clears the rail track", () => {
    expect(frameSlotFor(1512).left).toBeGreaterThanOrEqual(
      WRAPPER_PAD_LEFT + RAIL_WIDTH,
    );
  });

  it("gives the whole window below the wide breakpoint", () => {
    const slot = frameSlotFor(600);
    expect(slot.left).toBe(0);
    expect(slot.right).toBe(600);
  });
});

// -----------------------------------------------------------------------
// fitPreset
// -----------------------------------------------------------------------

describe("fitPreset", () => {
  const roomy = { w: 2000, h: 2000 };

  it("leaves a preset that already fits untouched", () => {
    expect(fitPreset(PHONE_PRESET.w, PHONE_PRESET.h, roomy)).toEqual({
      w: PHONE_PRESET.w,
      h: PHONE_PRESET.h,
    });
    expect(fitPreset(DESKTOP_PRESET.w, DESKTOP_PRESET.h, roomy)).toEqual({
      w: DESKTOP_PRESET.w,
      h: DESKTOP_PRESET.h,
    });
  });

  it("scales a preset down to the band, preserving aspect ratio", () => {
    const fitted = fitPreset(PHONE_PRESET.w, PHONE_PRESET.h, {
      w: 600,
      h: 500,
    });
    expect(fitted.h).toBeLessThan(PHONE_PRESET.h);
    expect(fitted.w / fitted.h).toBeCloseTo(PHONE_PRESET.w / PHONE_PRESET.h, 2);
  });

  it("never scales a preset up past its nominal size", () => {
    const fitted = fitPreset(PHONE_PRESET.w, PHONE_PRESET.h, {
      w: 10000,
      h: 10000,
    });
    expect(fitted.w).toBe(PHONE_PRESET.w);
  });

  it("holds the footprint at the minimum without distorting it", () => {
    const fitted = fitPreset(PHONE_PRESET.w, PHONE_PRESET.h, { w: 20, h: 20 });
    expect(fitted.w).toBeGreaterThanOrEqual(MIN_FOOTPRINT.w);
    expect(fitted.h).toBeGreaterThanOrEqual(MIN_FOOTPRINT.h);
    expect(fitted.w / fitted.h).toBeCloseTo(PHONE_PRESET.w / PHONE_PRESET.h, 2);
  });

  it("keeps the derived viewport when a preset is scaled down", () => {
    // zoom is footprint over the minimum viewport, so a scaled footprint
    // scales zoom with it and the viewport comes out unchanged. This is
    // what lets a fitted desktop preset still clear the desktop
    // breakpoint inside the iframe.
    const full = deriveZoomViewport(DESKTOP_PRESET.w, DESKTOP_PRESET.h);
    const fitted = fitPreset(DESKTOP_PRESET.w, DESKTOP_PRESET.h, {
      w: 520,
      h: 400,
    });
    const scaled = deriveZoomViewport(fitted.w, fitted.h);
    expect(scaled.viewport.w).toBeCloseTo(full.viewport.w, -1);
    expect(scaled.viewport.h).toBeCloseTo(full.viewport.h, -1);
  });
});

describe("computeFitBand", () => {
  it("excludes the top bar, the toolbar clearance, and the bottom margin", () => {
    const band = computeFitBand(1512, 982, TOP_BAR_HEIGHT, false);
    expect(band.h).toBe(
      982 - TOP_BAR_HEIGHT - TOOLBAR_CLEARANCE - SPAWN_MARGIN,
    );
    expect(band.w).toBe(1512 - SPAWN_MARGIN * 2);
  });

  it("narrows to the frame's slot when asked for the half band", () => {
    const slot = frameSlotFor(1512);
    const band = computeFitBand(1512, 982, TOP_BAR_HEIGHT, true);
    expect(band.w).toBe(slot.right - slot.left - SPAWN_MARGIN * 2);
  });
});

// -----------------------------------------------------------------------
// bottomCentrePosition
// -----------------------------------------------------------------------

describe("bottomCentrePosition", () => {
  it("centres horizontally and docks to the bottom", () => {
    const pos = bottomCentrePosition(200, 300, 800, 1000);

    expect(pos.left).toBe((800 - 200) / 2);
    expect(pos.top).toBe(1000 - 300 - FRAME_FIT_MARGIN);
  });

  it("keeps a frame taller than the window from going off the top", () => {
    const pos = bottomCentrePosition(200, 1200, 800, 1000);
    expect(pos.top).toBe(FRAME_FIT_MARGIN);
  });

  it("keeps a frame wider than the window from going off the left", () => {
    const pos = bottomCentrePosition(900, 300, 800, 1000);
    expect(pos.left).toBe(FRAME_FIT_MARGIN);
  });
});

// -----------------------------------------------------------------------
// clampPosition
// -----------------------------------------------------------------------

describe("clampPosition", () => {
  const outerW = 414; // 390 + 24 bezel
  const outerH = 868; // 844 + 24 bezel
  const winW = 1280;
  const winH = 900;

  it("returns the same position when within bounds", () => {
    const result = clampPosition(100, 200, outerW, outerH, winW, winH);
    expect(result.top).toBe(100);
    expect(result.left).toBe(200);
  });

  it("clamps top so at least 80px stays visible from the bottom", () => {
    const result = clampPosition(2000, 200, outerW, outerH, winW, winH);
    expect(result.top).toBe(winH - 80);
  });

  it("clamps top so at least 80px stays visible from the top", () => {
    const result = clampPosition(-5000, 200, outerW, outerH, winW, winH);
    expect(result.top).toBe(-outerH + 80);
  });

  it("clamps left so at least 80px stays visible from the right", () => {
    const result = clampPosition(100, 5000, outerW, outerH, winW, winH);
    expect(result.left).toBe(winW - 80);
  });

  it("clamps left so at least 80px stays visible from the left", () => {
    const result = clampPosition(100, -5000, outerW, outerH, winW, winH);
    expect(result.left).toBe(-outerW + 80);
  });
});

// -----------------------------------------------------------------------
// deriveBezelRadius
// -----------------------------------------------------------------------

describe("deriveBezelRadius", () => {
  it("returns 48 at phone-preset width (390)", () => {
    expect(deriveBezelRadius(390)).toBe(48);
  });

  it("returns 48 below phone-preset width", () => {
    expect(deriveBezelRadius(200)).toBe(48);
  });

  it("returns 16 at 600px and above", () => {
    expect(deriveBezelRadius(600)).toBe(16);
    expect(deriveBezelRadius(800)).toBe(16);
  });

  it("interpolates between 390 and 600", () => {
    const mid = deriveBezelRadius(495); // midpoint
    expect(mid).toBeGreaterThan(16);
    expect(mid).toBeLessThan(48);
  });
});

// -----------------------------------------------------------------------
// computeShrunkFootprint
// -----------------------------------------------------------------------

describe("computeShrunkFootprint", () => {
  it("preserves aspect ratio when shrinking a phone-preset footprint", () => {
    const result = computeShrunkFootprint(390, 844, 900);
    const originalAspect = 390 / 844;
    const shrunkAspect = result.w / result.h;
    expect(shrunkAspect).toBeCloseTo(originalAspect, 1);
  });

  it("produces a smaller footprint than the original", () => {
    const result = computeShrunkFootprint(PHONE_PRESET.w, PHONE_PRESET.h, 900);
    expect(result.h).toBeLessThan(PHONE_PRESET.h);
    expect(result.w).toBeLessThan(PHONE_PRESET.w);
  });

  it("targets SHRINK_VH_FRACTION of viewport height when the size floor does not bind", () => {
    const viewportH = 900;
    // 600x844 is tall enough to scale by height, and at the 315px
    // target its width lands at 224, clear of the 200px floor.
    const result = computeShrunkFootprint(600, 844, viewportH);
    const targetH = viewportH * SHRINK_VH_FRACTION;
    expect(result.h).toBeCloseTo(targetH, 0);
    expect(result.w).toBeGreaterThan(MIN_FOOTPRINT.w);
  });

  it("overshoots the target height rather than distorting a narrow footprint", () => {
    // A 390x844 phone at the 315px target would be 146 wide, under the
    // 200px floor. Scaling both axes to clear the floor is preferred
    // over stretching the width on its own, so the result is taller
    // than SHRINK_VH_FRACTION would suggest but still phone-shaped.
    const viewportH = 900;
    const result = computeShrunkFootprint(390, 844, viewportH);
    expect(result.w).toBe(MIN_FOOTPRINT.w);
    expect(result.h).toBeGreaterThan(viewportH * SHRINK_VH_FRACTION);
    expect(result.w / result.h).toBeCloseTo(390 / 844, 1);
  });

  it("clamps to MIN_FOOTPRINT", () => {
    // Very small viewport makes the target tiny
    const result = computeShrunkFootprint(390, 844, 100);
    expect(result.w).toBeGreaterThanOrEqual(MIN_FOOTPRINT.w);
    expect(result.h).toBeGreaterThanOrEqual(MIN_FOOTPRINT.h);
  });

  it("preserves aspect ratio for desktop-preset footprints", () => {
    const result = computeShrunkFootprint(760, 475, 900);
    const originalAspect = 760 / 475;
    const shrunkAspect = result.w / result.h;
    expect(shrunkAspect).toBeCloseTo(originalAspect, 1);
  });

  it("shrinks wide footprints by constraining the width", () => {
    // A 2:1 landscape footprint at large viewport
    const result = computeShrunkFootprint(800, 400, 900);
    expect(result.w).toBeLessThan(800);
    expect(result.h).toBeLessThan(400);
  });
});

// -----------------------------------------------------------------------
// computeBandRescale
// -----------------------------------------------------------------------

describe("computeBandRescale", () => {
  /**
   * Anchor sized so a halved band keeps both axes clear of the 200px
   * MIN_FOOTPRINT floor (600 * 0.5 = 300); floor behavior gets its own
   * tests with the phone footprint, where halving does bind.
   */
  const anchor = {
    bandTop: TOP_BAR_HEIGHT,
    bandH: 800,
    footprintW: 600,
    footprintH: 1000,
    top: TOP_BAR_HEIGHT + 100,
    preShrinkW: null,
    preShrinkH: null,
  };

  it("scales the footprint by the band height ratio, preserving aspect", () => {
    const result = computeBandRescale(anchor, TOP_BAR_HEIGHT, 400);
    expect(result.footprintW).toBeCloseTo(300, 5);
    expect(result.footprintH).toBeCloseTo(500, 5);
    expect(result.footprintW / result.footprintH).toBeCloseTo(600 / 1000, 2);
  });

  it("scales the top offset within the band by the same factor", () => {
    // Offset in the band is 100; halving the band halves it.
    const result = computeBandRescale(anchor, TOP_BAR_HEIGHT, 400);
    expect(result.top).toBeCloseTo(TOP_BAR_HEIGHT + 50, 5);
  });

  it("translates without scaling when only the band top moves", () => {
    // Same band height at a new top (band dragged, window grown to
    // match): factor 1, so the frame rides the band without resizing.
    const result = computeBandRescale(anchor, OPEN_CHROME, 800);
    expect(result.footprintW).toBe(600);
    expect(result.footprintH).toBe(1000);
    expect(result.top).toBe(OPEN_CHROME + 100);
  });

  it("grows the frame when the band grows", () => {
    const result = computeBandRescale(anchor, TOP_BAR_HEIGHT, 1200);
    expect(result.footprintW).toBeCloseTo(900, 5);
    expect(result.footprintH).toBeCloseTo(1500, 5);
    expect(result.footprintW / result.footprintH).toBeCloseTo(600 / 1000, 2);
  });

  it("applies the MIN_FOOTPRINT floor as a joint scale so the ratio survives", () => {
    // A phone at quarter scale would be 97x211; the floor lifts BOTH
    // axes together (200/390 wins), not just the one that violated it.
    const phoneAnchor = {
      ...anchor,
      footprintW: PHONE_PRESET.w,
      footprintH: PHONE_PRESET.h,
    };
    const result = computeBandRescale(phoneAnchor, TOP_BAR_HEIGHT, 200);
    // Epsilon: the joint scale is 200/390, and 390 * (200/390) lands a
    // float ulp below 200. setFootprint's per-axis floor absorbs it.
    expect(result.footprintW).toBeGreaterThanOrEqual(MIN_FOOTPRINT.w - 1e-6);
    expect(result.footprintH).toBeGreaterThanOrEqual(MIN_FOOTPRINT.h - 1e-6);
    expect(result.footprintW / result.footprintH).toBeCloseTo(
      PHONE_PRESET.w / PHONE_PRESET.h,
      2,
    );
  });

  it("keeps the position tracking the band after the footprint bottoms out", () => {
    // The top offset uses the raw factor even when the floor holds the
    // footprint, so placement still follows the band.
    const phoneAnchor = {
      ...anchor,
      footprintW: PHONE_PRESET.w,
      footprintH: PHONE_PRESET.h,
    };
    const factor = 200 / phoneAnchor.bandH;
    const result = computeBandRescale(phoneAnchor, TOP_BAR_HEIGHT, 200);
    expect(result.top).toBeCloseTo(TOP_BAR_HEIGHT + 100 * factor, 5);
  });

  it("recovers the exact anchor geometry when the band returns to its anchor height", () => {
    // The anti-ratchet property: rescale is anchor-relative, so a band
    // that shrank past the floor and came back restores the anchor
    // exactly, with no drift from the clamped intermediate.
    const result = computeBandRescale(anchor, anchor.bandTop, anchor.bandH);
    expect(result.footprintW).toBe(anchor.footprintW);
    expect(result.footprintH).toBe(anchor.footprintH);
    expect(result.top).toBe(anchor.top);
  });

  it("scales shrink memory by the raw factor and passes null through", () => {
    const withMemory = { ...anchor, preShrinkW: 400, preShrinkH: 866 };
    const scaled = computeBandRescale(withMemory, TOP_BAR_HEIGHT, 400);
    expect(scaled.preShrinkW).toBeCloseTo(200, 5);
    expect(scaled.preShrinkH).toBeCloseTo(433, 5);

    const without = computeBandRescale(anchor, TOP_BAR_HEIGHT, 400);
    expect(without.preShrinkW).toBeNull();
    expect(without.preShrinkH).toBeNull();
  });

  it("returns anchor geometry unchanged for zero or negative band heights", () => {
    // The flow band's bind:offsetHeight reports 0 for a frame while
    // mounting; scaling toward a degenerate band would collapse the
    // frame, so the anchor passes through verbatim.
    for (const bandH of [0, -50]) {
      const result = computeBandRescale(anchor, TOP_BAR_HEIGHT, bandH);
      expect(result.footprintW).toBe(anchor.footprintW);
      expect(result.footprintH).toBe(anchor.footprintH);
      expect(result.top).toBe(anchor.top);
    }
  });
});

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

describe("preset constants", () => {
  it("phone preset matches the minimum viewport", () => {
    expect(PHONE_PRESET.w).toBe(MIN_VIEWPORT.w);
    expect(PHONE_PRESET.h).toBe(MIN_VIEWPORT.h);
  });

  it("desktop preset is wider than phone", () => {
    expect(DESKTOP_PRESET.w).toBeGreaterThan(PHONE_PRESET.w);
  });

  it("desktop preset is shorter than phone", () => {
    expect(DESKTOP_PRESET.h).toBeLessThan(PHONE_PRESET.h);
  });

  it("BEZEL matches the expected 12px", () => {
    expect(BEZEL).toBe(12);
  });
});

// -----------------------------------------------------------------------
// Shrink state on the factory
// -----------------------------------------------------------------------

describe("createFrameGeometry chrome height", () => {
  it("spawns below the chrome height the getter reports", () => {
    const geo = createFrameGeometry(() => OPEN_CHROME);
    expect(geo.top).toBeGreaterThanOrEqual(OPEN_CHROME + TOOLBAR_CLEARANCE);
  });

  it("re-reads the chrome height on reset", () => {
    let chrome = TOP_BAR_HEIGHT;
    const geo = createFrameGeometry(() => chrome);
    const spawnTop = geo.top;

    chrome = OPEN_CHROME;
    geo.reset();

    expect(geo.top).toBeGreaterThan(spawnTop);
    expect(geo.top).toBeGreaterThanOrEqual(OPEN_CHROME + TOOLBAR_CLEARANCE);
  });
});

describe("createFrameGeometry band rescale", () => {
  // The factory reads the environment's window height (jsdom provides
  // one; 900 is the SSR fallback), so the band is WINDOW_H - chrome.
  const WINDOW_H = typeof window === "undefined" ? 900 : window.innerHeight;

  it("rescaleForBand shrinks the footprint when the chrome grows, preserving aspect", () => {
    let chrome = TOP_BAR_HEIGHT;
    const geo = createFrameGeometry(() => chrome);
    const w0 = geo.footprintW;
    const h0 = geo.footprintH;

    chrome = OPEN_CHROME;
    geo.rescaleForBand();

    // The spawn under a short test window sits near the MIN_FOOTPRINT
    // floor, so the shrink may bottom out; exact-factor behavior is
    // covered by the basis-controlled tests below. What must hold
    // regardless: smaller than before, same shape.
    expect(geo.footprintW).toBeLessThan(w0);
    expect(geo.footprintH).toBeLessThan(h0);
    expect(geo.footprintW / geo.footprintH).toBeCloseTo(w0 / h0, 2);
  });

  it("rescaleForBand is a no-op when the band has not changed", () => {
    let chrome = TOP_BAR_HEIGHT;
    const geo = createFrameGeometry(() => chrome);
    const w0 = geo.footprintW;
    const top0 = geo.top;

    geo.rescaleForBand();
    expect(geo.footprintW).toBe(w0);
    expect(geo.top).toBe(top0);

    chrome = OPEN_CHROME;
    geo.rescaleForBand();
    const w1 = geo.footprintW;
    const top1 = geo.top;
    geo.rescaleForBand();
    expect(geo.footprintW).toBe(w1);
    expect(geo.top).toBe(top1);
  });

  it("reanchorBand makes the current geometry the new scaling basis", () => {
    let chrome = TOP_BAR_HEIGHT;
    const geo = createFrameGeometry(() => chrome);

    // A user-authored size, adopted as the basis (App reanchors at
    // gesture end and preset settle).
    geo.setFootprint(500, 600);
    geo.reanchorBand();

    chrome = OPEN_CHROME;
    geo.rescaleForBand();

    const factor = (WINDOW_H - OPEN_CHROME) / (WINDOW_H - TOP_BAR_HEIGHT);
    expect(geo.footprintW).toBeCloseTo(500 * factor, 5);
    expect(geo.footprintH).toBeCloseTo(600 * factor, 5);
  });

  it("grow after a band rescale returns the proportionally scaled memory", () => {
    let chrome = TOP_BAR_HEIGHT;
    const geo = createFrameGeometry(() => chrome);
    geo.setFootprint(PHONE_PRESET.w, PHONE_PRESET.h);

    const shrunkTarget = geo.shrink();
    geo.setFootprint(shrunkTarget.w, shrunkTarget.h);
    geo.reanchorBand();

    chrome = OPEN_CHROME;
    geo.rescaleForBand();

    const factor = (WINDOW_H - OPEN_CHROME) / (WINDOW_H - TOP_BAR_HEIGHT);
    const grown = geo.grow();
    expect(grown).not.toBeNull();
    expect(grown?.w).toBeCloseTo(PHONE_PRESET.w * factor, 5);
    expect(grown?.h).toBeCloseTo(PHONE_PRESET.h * factor, 5);
  });

  it("reset re-anchors against the current band", () => {
    let chrome = OPEN_CHROME;
    const geo = createFrameGeometry(() => chrome);
    geo.reset();
    const w0 = geo.footprintW;
    const h0 = geo.footprintH;

    // Closing the band scales the fresh spawn from ITS band, not the
    // band that existed before the reset (which would double-scale).
    chrome = TOP_BAR_HEIGHT;
    geo.rescaleForBand();

    const factor = (WINDOW_H - TOP_BAR_HEIGHT) / (WINDOW_H - OPEN_CHROME);
    expect(geo.footprintW).toBeCloseTo(w0 * factor, 5);
    expect(geo.footprintH).toBeCloseTo(h0 * factor, 5);
  });
});

describe("createFrameGeometry shrink semantics", () => {
  it("retargetShrunkTo stays shrunk and rewrites grow memory to the preset", () => {
    const geo = createFrameGeometry();
    geo.setFootprint(PHONE_PRESET.w, PHONE_PRESET.h);

    const shrunkTarget = geo.shrink();
    geo.setFootprint(shrunkTarget.w, shrunkTarget.h);
    expect(geo.shrunk).toBe(true);

    const retarget = geo.retargetShrunkTo(DESKTOP_PRESET.w, DESKTOP_PRESET.h);
    geo.setFootprint(retarget.w, retarget.h);
    expect(geo.shrunk).toBe(true);
    // Retarget keeps the shrunken scale: smaller than the full preset
    expect(retarget.w).toBeLessThan(DESKTOP_PRESET.w);

    // Grow restores the retargeted preset's FULL footprint
    const grown = geo.grow();
    expect(grown).toEqual({ w: DESKTOP_PRESET.w, h: DESKTOP_PRESET.h });
    expect(geo.shrunk).toBe(false);
  });

  it("grow returns null without shrink memory", () => {
    const geo = createFrameGeometry();
    expect(geo.grow()).toBeNull();
  });

  it("clearShrinkMemory discards the remembered footprint", () => {
    const geo = createFrameGeometry();
    geo.shrink();
    geo.clearShrinkMemory();
    expect(geo.shrunk).toBe(false);
    expect(geo.grow()).toBeNull();
  });
});

// -----------------------------------------------------------------------
// Auto-shrink on manual resize
// -----------------------------------------------------------------------

describe("isAutoShrinkSize", () => {
  it("treats a footprint at the threshold as shrunk", () => {
    expect(isAutoShrinkSize(130, AUTO_SHRINK_MAX_EDGE)).toBe(true);
  });

  it("does not trigger just past the threshold", () => {
    expect(isAutoShrinkSize(130, AUTO_SHRINK_MAX_EDGE + 1)).toBe(false);
  });

  it("keys off the longest edge, not the shortest", () => {
    // Thin but tall: still a usable frame, so not auto-shrunk.
    expect(isAutoShrinkSize(60, 800)).toBe(false);
  });

  it("classifies the footprint the shrink control produces", () => {
    // The manual threshold and the shrink button must agree about the
    // same size, or grabbing a handle to that size would behave
    // differently from pressing shrink.
    const shrunk = computeShrunkFootprint(PHONE_PRESET.w, PHONE_PRESET.h, 900);
    expect(isAutoShrinkSize(shrunk.w, shrunk.h)).toBe(true);
  });
});

describe("computeAutoGrowTarget", () => {
  it("scales both axes by the same factor, preserving the ratio", () => {
    const target = computeAutoGrowTarget(210, 430);

    expect(target.w).toBe(210 * AUTO_GROW_FACTOR);
    expect(target.h).toBe(430 * AUTO_GROW_FACTOR);
    // Ratio survives the round trip
    expect(target.w / target.h).toBeCloseTo(210 / 430, 5);
  });

  it("returns a shrunk phone to roughly the phone preset", () => {
    const shrunk = computeShrunkFootprint(PHONE_PRESET.w, PHONE_PRESET.h, 900);
    const grown = computeAutoGrowTarget(shrunk.w, shrunk.h);

    expect(grown.w).toBeGreaterThan(PHONE_PRESET.w * 0.9);
    expect(grown.h).toBeGreaterThan(PHONE_PRESET.h * 0.9);
  });
});

describe("settleShrinkAfterResize", () => {
  it("adopts a hand-shrunk footprint and remembers a larger one at the same ratio", () => {
    const geo = createFrameGeometry();
    // Above MIN_FOOTPRINT so setFootprint keeps it verbatim.
    geo.setFootprint(210, 430);

    geo.settleShrinkAfterResize();
    expect(geo.shrunk).toBe(true);

    // Grow returns the same shape, AUTO_GROW_FACTOR times larger
    const grown = geo.grow();
    expect(grown).toEqual({
      w: 210 * AUTO_GROW_FACTOR,
      h: 430 * AUTO_GROW_FACTOR,
    });
    expect(geo.shrunk).toBe(false);
  });

  it("clears the shrink state when the frame was resized back up", () => {
    const geo = createFrameGeometry();
    geo.setFootprint(210, 430);
    geo.settleShrinkAfterResize();
    expect(geo.shrunk).toBe(true);

    // User drags it large again
    geo.setFootprint(PHONE_PRESET.w, PHONE_PRESET.h);
    geo.settleShrinkAfterResize();

    expect(geo.shrunk).toBe(false);
    expect(geo.grow()).toBeNull();
  });

  it("leaves a normally sized frame unshrunk", () => {
    const geo = createFrameGeometry();
    geo.setFootprint(DESKTOP_PRESET.w, DESKTOP_PRESET.h);

    geo.settleShrinkAfterResize();

    expect(geo.shrunk).toBe(false);
    expect(geo.grow()).toBeNull();
  });
});

// -----------------------------------------------------------------------
// presetAnchoredLeft
// -----------------------------------------------------------------------

describe("presetAnchoredLeft", () => {
  const windowW = 1280;

  it("anchors the right edge when the frame center is in the right half", () => {
    // Frame at left=800, outerW=414. Center = 800 + 207 = 1007. > 640.
    // Growing to outerW=784: newLeft = 800 + 414 - 784 = 430.
    const result = presetAnchoredLeft(800, 414, 784, windowW);
    expect(result).toBe(800 + 414 - 784);
  });

  it("keeps left unchanged when the frame center is in the left half", () => {
    // Frame at left=100, outerW=414. Center = 100 + 207 = 307. < 640.
    const result = presetAnchoredLeft(100, 414, 784, windowW);
    expect(result).toBe(100);
  });

  it("anchors left (keeps startLeft) when the center is exactly at midpoint", () => {
    // Strict > comparison: dead center anchors left.
    // center = startLeft + outerW/2 = windowW/2 = 640.
    // startLeft = 640 - 207 = 433. outerW = 414.
    const startLeft = windowW / 2 - 414 / 2;
    const result = presetAnchoredLeft(startLeft, 414, 784, windowW);
    expect(result).toBe(startLeft);
  });

  it("moves left rightward when shrinking a right-half frame", () => {
    // Frame at left=800, outerW=784. Center = 800 + 392 = 1192. > 640.
    // Shrinking to outerW=414: newLeft = 800 + 784 - 414 = 1170.
    // Left moves rightward (larger value), right edge stays at 800 + 784 = 1584.
    const result = presetAnchoredLeft(800, 784, 414, windowW);
    expect(result).toBe(800 + 784 - 414);
    expect(result).toBeGreaterThan(800);
    // Right edge is preserved: result + targetOuterW = 800 + 784 = 1584
    expect(result + 414).toBe(800 + 784);
  });
});

// -----------------------------------------------------------------------
// clampTopToViewport
// -----------------------------------------------------------------------

describe("clampTopToViewport", () => {
  const windowH = 900;

  it("leaves a fully visible frame alone", () => {
    expect(clampTopToViewport(100, 500, windowH)).toBe(100);
  });

  it("pulls a frame up when its bottom would overflow", () => {
    // top 700 + outerH 500 = 1200, past the 900 viewport.
    const result = clampTopToViewport(700, 500, windowH);
    expect(result).toBe(windowH - 500 - FRAME_FIT_MARGIN);
    expect(result + 500).toBeLessThanOrEqual(windowH);
  });

  it("pushes a frame down when its top would overflow", () => {
    expect(clampTopToViewport(-200, 500, windowH)).toBe(FRAME_FIT_MARGIN);
  });

  it("pins a frame taller than the viewport to the top", () => {
    // Nothing fits, so keep the toolbar and phone header reachable.
    expect(clampTopToViewport(-300, 1200, windowH)).toBe(FRAME_FIT_MARGIN);
  });

  it("pushes a placement out from under an open flow band", () => {
    const result = clampTopToViewport(
      100,
      300,
      windowH,
      FRAME_FIT_MARGIN,
      OPEN_CHROME,
    );
    expect(result).toBe(OPEN_CHROME + FRAME_FIT_MARGIN);
  });

  it("leaves a placement that already clears the band alone", () => {
    const top = OPEN_CHROME + 100;
    const result = clampTopToViewport(
      top,
      300,
      windowH,
      FRAME_FIT_MARGIN,
      OPEN_CHROME,
    );
    expect(result).toBe(top);
  });

  it("pins below the band when the frame no longer fits under it", () => {
    // 800 tall in the ~540px the open band leaves: nothing fits, so the
    // toolbar stays reachable rather than the bottom edge.
    const result = clampTopToViewport(
      400,
      800,
      windowH,
      FRAME_FIT_MARGIN,
      OPEN_CHROME,
    );
    expect(result).toBe(OPEN_CHROME + FRAME_FIT_MARGIN);
  });
});

// -----------------------------------------------------------------------
// presetAnchoredTop
// -----------------------------------------------------------------------

describe("presetAnchoredTop", () => {
  const windowH = 900;

  it("anchors the bottom edge when the frame center is in the lower half", () => {
    // Frame at top=500, outerH=300. Center = 650 > 450.
    // Growing to outerH=500 keeps the bottom at 800, so top becomes 300.
    const result = presetAnchoredTop(500, 300, 500, windowH);
    expect(result).toBe(300);
    expect(result + 500).toBe(500 + 300);
  });

  it("keeps top unchanged when the frame center is in the upper half", () => {
    // Frame at top=100, outerH=300. Center = 250 < 450. Grows downward,
    // and 100 + 500 = 600 still fits, so no fitting adjustment applies.
    expect(presetAnchoredTop(100, 300, 500, windowH)).toBe(100);
  });

  it("anchors top when the center is exactly at the midpoint", () => {
    // Strict > comparison, matching presetAnchoredLeft.
    const startTop = windowH / 2 - 300 / 2;
    expect(presetAnchoredTop(startTop, 300, 500, windowH)).toBe(startTop);
  });

  it("fits a tall preset back on screen instead of hanging off the bottom", () => {
    // Desktop (short) near the bottom, switching to the tall phone shape.
    // Top-anchored growth would put the bottom at 700 + 860 = 1560.
    const result = presetAnchoredTop(700, 475, 860, windowH);
    expect(result).toBe(windowH - 860 - FRAME_FIT_MARGIN);
    expect(result + 860).toBeLessThanOrEqual(windowH);
  });

  it("pins to the top when the phone preset is taller than the viewport", () => {
    // Short viewport: 860 tall frame cannot fit in 700.
    expect(presetAnchoredTop(300, 475, 860, 700)).toBe(FRAME_FIT_MARGIN);
  });

  it("lands a preset below an open flow band", () => {
    // Upper-half start, so the anchor keeps top at 100; the chrome
    // pushes it clear of the band.
    const result = presetAnchoredTop(
      100,
      300,
      500,
      windowH,
      FRAME_FIT_MARGIN,
      OPEN_CHROME,
    );
    expect(result).toBe(OPEN_CHROME + FRAME_FIT_MARGIN);
  });
});
