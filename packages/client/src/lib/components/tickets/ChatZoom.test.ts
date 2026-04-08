// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import ChatZoomHarness from "./ChatZoomHarness.svelte";
import {
  computeTextOpacity,
  computeTimestampOpacity,
  MIN_SCALE,
  MAX_SCALE,
  TEXT_FADE_THRESHOLD,
} from "./chat-zoom-utils.js";

afterEach(() => {
  cleanup();
});

// --- Pure function tests (opacity math) ---

describe("computeTextOpacity", () => {
  it("returns 1 at full scale", () => {
    expect(computeTextOpacity(1.0)).toBe(1);
  });

  it("returns 1 at threshold boundary (0.5)", () => {
    expect(computeTextOpacity(TEXT_FADE_THRESHOLD)).toBe(1);
  });

  it("returns 0.6 at scale 0.3 (linear interpolation below threshold)", () => {
    expect(computeTextOpacity(0.3)).toBeCloseTo(0.6);
  });

  it("returns value near 0.3 at MIN_SCALE (0.15)", () => {
    // 0.15 / 0.5 = 0.3
    expect(computeTextOpacity(MIN_SCALE)).toBeCloseTo(0.3);
  });

  it("never returns negative", () => {
    expect(computeTextOpacity(0)).toBe(0);
    expect(computeTextOpacity(-1)).toBe(0);
  });
});

describe("computeTimestampOpacity", () => {
  it("returns 1 at MIN_SCALE", () => {
    expect(computeTimestampOpacity(MIN_SCALE)).toBe(1);
  });

  it("returns 1 at threshold boundary (0.5)", () => {
    expect(computeTimestampOpacity(TEXT_FADE_THRESHOLD)).toBe(1);
  });

  it("returns 0 at full scale (1.0)", () => {
    expect(computeTimestampOpacity(MAX_SCALE)).toBe(0);
  });

  it("returns 0.5 at scale 0.75 (midpoint above threshold)", () => {
    // (1 - 0.75) / (1 - 0.5) = 0.5
    expect(computeTimestampOpacity(0.75)).toBeCloseTo(0.5);
  });

  it("never returns negative", () => {
    expect(computeTimestampOpacity(2.0)).toBe(0);
  });
});

// --- Scale constant invariants ---

describe("scale constant invariants", () => {
  it("MIN_SCALE is less than TEXT_FADE_THRESHOLD (crossfade requires this)", () => {
    expect(MIN_SCALE).toBeLessThan(TEXT_FADE_THRESHOLD);
  });

  it("MAX_SCALE is greater than TEXT_FADE_THRESHOLD", () => {
    expect(MAX_SCALE).toBeGreaterThan(TEXT_FADE_THRESHOLD);
  });
});

// --- Component rendering tests (via harness) ---

describe("ChatZoom component", () => {
  function renderZoom(
    overrides: Record<string, unknown> = {},
  ): ReturnType<typeof render> {
    return render(ChatZoomHarness, {
      props: {
        totalMessages: 47,
        earliestDate: "2026-04-01T10:00:00Z",
        latestDate: "2026-04-04T14:15:00Z",
        ...overrides,
      },
    });
  }

  it("renders children inside the zoom container", () => {
    const { container } = renderZoom();
    // Children are rendered (harness injects test bubbles with data-fu-id).
    const bubbles = container.querySelectorAll("[data-fu-id]");
    expect(bubbles.length).toBeGreaterThan(0);
  });
});

// --- Opacity crossfade relationship ---

describe("opacity crossfade relationship", () => {
  it("text is fully visible and timestamps invisible at scale 1.0", () => {
    expect(computeTextOpacity(1.0)).toBe(1);
    expect(computeTimestampOpacity(1.0)).toBe(0);
  });

  it("both are fully visible at the threshold (0.5)", () => {
    expect(computeTextOpacity(0.5)).toBe(1);
    expect(computeTimestampOpacity(0.5)).toBe(1);
  });

  it("text fades out below threshold while timestamps stay visible", () => {
    const scale = 0.25;
    const textOp = computeTextOpacity(scale);
    const tsOp = computeTimestampOpacity(scale);
    expect(textOp).toBeLessThan(1);
    expect(textOp).toBeGreaterThan(0);
    expect(tsOp).toBe(1);
  });

  it("text is partially visible and timestamps fully visible at MIN_SCALE", () => {
    const textOp = computeTextOpacity(MIN_SCALE);
    const tsOp = computeTimestampOpacity(MIN_SCALE);
    expect(textOp).toBeCloseTo(0.3);
    expect(tsOp).toBe(1);
  });
});
