import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  ringBox,
  showHighlightRing,
  clearHighlightRing,
  hasHighlightRing,
  MIN_RING_SIZE,
  RING_HOLD_MS,
  RING_FADE_MS,
} from "./highlight-ring.js";

const RING_SELECTOR = '[data-demo-highlight-ring="true"]';

/** jsdom reports every rect as zero, so targets declare their own. */
function mountTarget(rect: {
  top: number;
  left: number;
  width: number;
  height: number;
}): HTMLElement {
  const el = document.createElement("div");
  document.body.appendChild(el);
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    ...rect,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    x: rect.left,
    y: rect.top,
    toJSON: () => ({}),
  } as DOMRect);
  return el;
}

function ringEl(): HTMLElement | null {
  return document.querySelector<HTMLElement>(RING_SELECTOR);
}

describe("ringBox", () => {
  it("inflates the target rect by the inset on every side", () => {
    const box = ringBox(
      { top: 100, left: 50, width: 200, height: 120 },
      400,
      800,
    );
    expect(box).toEqual({ top: 94, left: 44, width: 212, height: 132 });
  });

  it("clamps a target taller than the viewport to the visible band", () => {
    // A dashboard section can outrun the phone screen. Unclamped, both
    // horizontal edges land off-frame and nothing reads as a ring.
    const box = ringBox(
      { top: -300, left: 0, width: 390, height: 1200 },
      390,
      700,
    );
    expect(box.top).toBe(0);
    expect(box.height).toBe(700);
  });

  it("clamps a target scrolled off the left edge", () => {
    const box = ringBox(
      { top: 40, left: -80, width: 200, height: 60 },
      390,
      700,
    );
    expect(box.left).toBe(0);
    expect(box.width).toBe(126);
  });

  it("grows a sliver back to the minimum size", () => {
    // Only 2px of the target is still on screen at the bottom.
    const box = ringBox(
      { top: 698, left: 10, width: 200, height: 80 },
      390,
      700,
    );
    expect(box.height).toBe(MIN_RING_SIZE);
  });

  it("pushes the minimum-size box back inside the viewport", () => {
    const box = ringBox({ top: 699, left: 380, width: 4, height: 4 }, 390, 700);
    expect(box.top + box.height).toBeLessThanOrEqual(700);
    expect(box.left + box.width).toBeLessThanOrEqual(390);
    expect(box.height).toBe(MIN_RING_SIZE);
    expect(box.width).toBe(MIN_RING_SIZE);
  });
});

describe("showHighlightRing", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    clearHighlightRing();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it("draws a ring positioned over the target", () => {
    const target = mountTarget({ top: 100, left: 50, width: 200, height: 120 });
    showHighlightRing(target);

    const ring = ringEl();
    expect(ring).not.toBeNull();
    expect(ring?.style.position).toBe("fixed");
    expect(ring?.style.top).toBe("94px");
    expect(ring?.style.left).toBe("44px");
    expect(ring?.style.width).toBe("212px");
    expect(ring?.style.height).toBe("132px");
  });

  it("is inert and invisible to assistive tech", () => {
    const target = mountTarget({ top: 10, left: 10, width: 100, height: 100 });
    showHighlightRing(target);

    const ring = ringEl();
    expect(ring?.getAttribute("aria-hidden")).toBe("true");
    expect(ring?.style.pointerEvents).toBe("none");
  });

  it("keeps only one ring when a second target is highlighted", () => {
    const first = mountTarget({ top: 0, left: 0, width: 100, height: 100 });
    const second = mountTarget({ top: 300, left: 0, width: 100, height: 100 });

    showHighlightRing(first);
    showHighlightRing(second);

    expect(document.querySelectorAll(RING_SELECTOR)).toHaveLength(1);
    expect(ringEl()?.style.top).toBe("294px");
  });

  it("removes the ring after the hold and fade", () => {
    const target = mountTarget({ top: 10, left: 10, width: 100, height: 100 });
    showHighlightRing(target);
    expect(hasHighlightRing()).toBe(true);

    vi.advanceTimersByTime(RING_HOLD_MS + RING_FADE_MS + 100);

    expect(hasHighlightRing()).toBe(false);
    expect(ringEl()).toBeNull();
  });

  it("does nothing for a target with no box", () => {
    const target = mountTarget({ top: 0, left: 0, width: 0, height: 0 });
    showHighlightRing(target);

    expect(hasHighlightRing()).toBe(false);
    expect(ringEl()).toBeNull();
  });

  it("clears itself when the target leaves the DOM", () => {
    const target = mountTarget({ top: 10, left: 10, width: 100, height: 100 });
    showHighlightRing(target);
    target.remove();

    // One tracking frame is enough to notice the detachment.
    vi.advanceTimersByTime(50);

    expect(hasHighlightRing()).toBe(false);
    expect(ringEl()).toBeNull();
  });

  it("skips the opacity transition under reduced motion", () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList) as typeof window.matchMedia;

    try {
      const target = mountTarget({
        top: 10,
        left: 10,
        width: 100,
        height: 100,
      });
      showHighlightRing(target);

      expect(ringEl()?.style.transition).toBe("");

      vi.advanceTimersByTime(RING_HOLD_MS + 10);
      expect(ringEl()).toBeNull();
    } finally {
      window.matchMedia = original;
    }
  });
});

describe("clearHighlightRing", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("is a no-op when no ring is up", () => {
    expect(() => {
      clearHighlightRing();
    }).not.toThrow();
    expect(hasHighlightRing()).toBe(false);
  });

  it("removes an active ring immediately", () => {
    const target = mountTarget({ top: 10, left: 10, width: 100, height: 100 });
    showHighlightRing(target);
    expect(hasHighlightRing()).toBe(true);

    clearHighlightRing();

    expect(hasHighlightRing()).toBe(false);
    expect(ringEl()).toBeNull();
  });
});
