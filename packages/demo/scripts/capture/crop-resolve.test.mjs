import { describe, expect, it } from "vitest";
import { clampCropToPhone, resolveCropRect } from "./crop-resolve.mjs";

describe("clampCropToPhone", () => {
  it("returns the rect unchanged when it fits inside the phone", () => {
    const result = clampCropToPhone({ x: 10, y: 20, w: 200, h: 100 }, 390, 844);
    expect(result).toEqual({ x: 10, y: 20, w: 200, h: 100 });
  });

  it("clamps width when the rect extends past the right edge", () => {
    const result = clampCropToPhone({ x: 300, y: 0, w: 200, h: 100 }, 390, 844);
    expect(result).toEqual({ x: 300, y: 0, w: 90, h: 100 });
  });

  it("clamps height when the rect extends past the bottom", () => {
    const result = clampCropToPhone({ x: 0, y: 800, w: 100, h: 100 }, 390, 844);
    expect(result).toEqual({ x: 0, y: 800, w: 100, h: 44 });
  });

  it("shifts negative x origin to zero and shrinks width", () => {
    const result = clampCropToPhone({ x: -10, y: 0, w: 100, h: 50 }, 390, 844);
    expect(result).toEqual({ x: 0, y: 0, w: 90, h: 50 });
  });

  it("shifts negative y origin to zero and shrinks height", () => {
    const result = clampCropToPhone({ x: 0, y: -20, w: 100, h: 50 }, 390, 844);
    expect(result).toEqual({ x: 0, y: 0, w: 100, h: 30 });
  });

  it("floors dimensions to zero when rect is entirely outside", () => {
    const result = clampCropToPhone(
      { x: -200, y: -200, w: 100, h: 100 },
      390,
      844,
    );
    expect(result.w).toBe(0);
    expect(result.h).toBe(0);
  });
});

describe("resolveCropRect", () => {
  const phoneW = 390;
  const phoneH = 844;
  const fallback = { x: 0, y: 56, w: 390, h: 220 };

  it("uses the element rect when available", () => {
    const elemRect = { x: 20, y: 100, w: 350, h: 180 };
    const result = resolveCropRect(elemRect, fallback, phoneW, phoneH);
    expect(result).toEqual(elemRect);
  });

  it("falls back to the authored rect when element rect is null", () => {
    const result = resolveCropRect(null, fallback, phoneW, phoneH);
    expect(result).toEqual(fallback);
  });

  it("clamps the element rect to the phone dimensions", () => {
    const elemRect = { x: 350, y: 800, w: 100, h: 100 };
    const result = resolveCropRect(elemRect, fallback, phoneW, phoneH);
    expect(result).toEqual({ x: 350, y: 800, w: 40, h: 44 });
  });

  it("clamps the fallback rect when it exceeds phone bounds", () => {
    const bigFallback = { x: 0, y: 0, w: 500, h: 900 };
    const result = resolveCropRect(null, bigFallback, phoneW, phoneH);
    expect(result).toEqual({ x: 0, y: 0, w: 390, h: 844 });
  });
});
