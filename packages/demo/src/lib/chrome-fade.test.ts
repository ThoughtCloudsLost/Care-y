import { describe, it, expect, vi, afterEach } from "vitest";
import { chromeFade, UI_FADE_MS } from "./chrome-fade.js";

/**
 * prefersReducedMotion is a MediaQuery built at module load from
 * window.matchMedia (stubbed to matches:false in test-setup). Spying on
 * the getter is the only way to exercise the reduced-motion branch
 * without a real media query.
 */
async function withReducedMotion<T>(fn: () => T): Promise<T> {
  const motion = await import("svelte/motion");
  const spy = vi
    .spyOn(motion.prefersReducedMotion, "current", "get")
    .mockReturnValue(true);
  try {
    return fn();
  } finally {
    spy.mockRestore();
  }
}

function node(): Element {
  return document.createElement("div");
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("chromeFade", () => {
  it("fades over the shared duration by default", () => {
    expect(chromeFade(node()).duration).toBe(UI_FADE_MS);
  });

  it("honours an explicit duration", () => {
    expect(chromeFade(node(), { duration: 400 }).duration).toBe(400);
  });

  it("defaults to no delay", () => {
    expect(chromeFade(node()).delay).toBe(0);
  });

  it("honours an explicit delay", () => {
    expect(chromeFade(node(), { delay: 90 }).delay).toBe(90);
  });

  it("interpolates opacity", () => {
    const css = chromeFade(node()).css;
    expect(css).toBeTypeOf("function");
    expect(css?.(0.5, 0.5)).toContain("opacity");
  });

  // -----------------------------------------------------------------
  // Reduced motion: the cut is what the preference asks for
  // -----------------------------------------------------------------

  it("collapses to zero duration under reduced motion", async () => {
    const config = await withReducedMotion(() => chromeFade(node()));
    expect(config.duration).toBe(0);
  });

  it("overrides an explicit duration under reduced motion", async () => {
    const config = await withReducedMotion(() =>
      chromeFade(node(), { duration: 400 }),
    );
    expect(config.duration).toBe(0);
  });
});

describe("UI_FADE_MS", () => {
  it("finishes before the 180ms device chrome fade", () => {
    // Chrome arriving alongside the bezel must not outlast it.
    expect(UI_FADE_MS).toBeLessThanOrEqual(180);
  });

  it("is long enough to read as a fade rather than a flicker", () => {
    expect(UI_FADE_MS).toBeGreaterThanOrEqual(100);
  });
});
