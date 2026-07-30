import { describe, it, expect } from "vitest";
import {
  createFrameGeometry,
  deriveZoomViewport,
  deriveBezelRadius,
  computeSpawn,
  computeShrunkFootprint,
  clampPosition,
  presetAnchoredLeft,
  presetAnchoredTop,
  clampTopToViewport,
  FRAME_FIT_MARGIN,
  PHONE_PRESET,
  DESKTOP_PRESET,
  MIN_FOOTPRINT,
  MIN_VIEWPORT,
  BEZEL,
  SHRINK_VH_FRACTION,
} from "./frame-geometry.svelte.js";

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
  const topBar = 56;

  it("uses phone preset dimensions for wide windows (>= 900px)", () => {
    const spawn = computeSpawn(1280, 900, topBar);
    expect(spawn.footprintW).toBe(PHONE_PRESET.w);
    expect(spawn.footprintH).toBe(PHONE_PRESET.h);
  });

  it("places the frame on the right side at >= 900px", () => {
    const spawn = computeSpawn(1280, 900, topBar);
    // left = 1280 - 390 - 24 - 24 = 842
    expect(spawn.left).toBe(1280 - PHONE_PRESET.w - BEZEL * 2 - 24);
    expect(spawn.top).toBeGreaterThanOrEqual(topBar);
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

  it("places below the top bar on narrow windows", () => {
    const spawn = computeSpawn(400, 800, topBar);
    expect(spawn.top).toBe(topBar + 16);
  });

  it("enforces minimum footprint dimensions", () => {
    const spawn = computeSpawn(100, 200, topBar);
    expect(spawn.footprintW).toBeGreaterThanOrEqual(MIN_FOOTPRINT.w);
    expect(spawn.footprintH).toBeGreaterThanOrEqual(MIN_FOOTPRINT.h);
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
});
