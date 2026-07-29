import { describe, it, expect } from "vitest";
import {
  deriveZoomViewport,
  computeSpawn,
  clampPosition,
  PHONE_PRESET,
  DESKTOP_PRESET,
  MIN_FOOTPRINT,
  MIN_VIEWPORT,
  BEZEL,
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
