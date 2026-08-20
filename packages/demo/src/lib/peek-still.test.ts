// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import {
  STILL_MAX_EDGE,
  computeStillSize,
  captureStill,
  type StillSource,
  type DrawableSource,
} from "./peek-still.js";

// ---------------------------------------------------------------------------
// computeStillSize (pure, no canvas needed)
// ---------------------------------------------------------------------------

describe("computeStillSize", () => {
  it("scales a landscape source so the long edge equals STILL_MAX_EDGE", () => {
    const src: StillSource = { videoWidth: 390, videoHeight: 844 };
    const size = computeStillSize(src);
    expect(size).not.toBeNull();
    expect(Math.max(size!.w, size!.h)).toBe(STILL_MAX_EDGE);
  });

  it("scales a portrait source so the long edge equals STILL_MAX_EDGE", () => {
    const src: StillSource = { videoWidth: 844, videoHeight: 390 };
    const size = computeStillSize(src);
    expect(size).not.toBeNull();
    expect(Math.max(size!.w, size!.h)).toBe(STILL_MAX_EDGE);
  });

  it("preserves aspect ratio (landscape)", () => {
    const src: StillSource = { videoWidth: 1920, videoHeight: 1080 };
    const size = computeStillSize(src)!;
    const srcRatio = 1920 / 1080;
    const outRatio = size.w / size.h;
    // Rounding tolerance: integer pixels
    expect(Math.abs(srcRatio - outRatio)).toBeLessThan(0.1);
  });

  it("preserves aspect ratio (portrait)", () => {
    const src: StillSource = { videoWidth: 390, videoHeight: 844 };
    const size = computeStillSize(src)!;
    const srcRatio = 390 / 844;
    const outRatio = size.w / size.h;
    expect(Math.abs(srcRatio - outRatio)).toBeLessThan(0.1);
  });

  it("returns at least 1px on each axis for very small sources", () => {
    const src: StillSource = { videoWidth: 1, videoHeight: 1 };
    const size = computeStillSize(src)!;
    expect(size.w).toBeGreaterThanOrEqual(1);
    expect(size.h).toBeGreaterThanOrEqual(1);
  });

  it("returns null when videoWidth is 0 (not yet loaded)", () => {
    expect(computeStillSize({ videoWidth: 0, videoHeight: 844 })).toBeNull();
  });

  it("returns null when videoHeight is 0", () => {
    expect(computeStillSize({ videoWidth: 390, videoHeight: 0 })).toBeNull();
  });

  it("returns null when both dimensions are 0", () => {
    expect(computeStillSize({ videoWidth: 0, videoHeight: 0 })).toBeNull();
  });

  it("returns null for negative dimensions", () => {
    expect(computeStillSize({ videoWidth: -100, videoHeight: 200 })).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// captureStill (requires minimal canvas mock)
// ---------------------------------------------------------------------------

describe("captureStill", () => {
  /**
   * Build a mock DrawableSource. jsdom does not provide a real
   * CanvasImageSource, so this fakes just enough for drawImage to
   * receive something without throwing.
   */
  function makeMockSource(
    videoWidth: number,
    videoHeight: number,
  ): DrawableSource {
    // CanvasImageSource requires being one of several DOM types.
    // We cast through unknown because jsdom's canvas is not real.
    return {
      videoWidth,
      videoHeight,
    } as unknown as DrawableSource;
  }

  it("returns null for a source with no intrinsic size", () => {
    const result = captureStill(makeMockSource(0, 0));
    expect(result).toBeNull();
  });

  it("creates a canvas at the computed still size", () => {
    const drawImage = vi.fn();
    const fakeCtx = { drawImage } as unknown as CanvasRenderingContext2D;

    // Build a real canvas with a mocked getContext, then return it
    // from the spy. Using a pre-built element avoids calling the
    // deprecated createElement(string) overload inside the mock.
    const fakeCanvas = document.createElement("canvas");
    vi.spyOn(fakeCanvas, "getContext").mockReturnValue(fakeCtx);
    vi.spyOn(document, "createElement").mockReturnValue(fakeCanvas);

    const src = makeMockSource(390, 844);
    const result = captureStill(src);

    expect(result).not.toBeNull();
    const size = computeStillSize(src)!;
    expect(result!.width).toBe(size.w);
    expect(result!.height).toBe(size.h);
    expect(drawImage).toHaveBeenCalledWith(src, 0, 0, size.w, size.h);

    vi.restoreAllMocks();
  });

  it("returns null when getContext returns null", () => {
    const fakeCanvas = document.createElement("canvas");
    vi.spyOn(fakeCanvas, "getContext").mockReturnValue(null);
    vi.spyOn(document, "createElement").mockReturnValue(fakeCanvas);

    const result = captureStill(makeMockSource(390, 844));
    expect(result).toBeNull();

    vi.restoreAllMocks();
  });
});
