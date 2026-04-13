import { describe, it, expect, vi } from "vitest";
import { ScrollDirectionTracker } from "./use-scroll-direction.svelte.js";

function createMockElement(initialScrollTop = 0): HTMLElement {
  let scrollTop = initialScrollTop;
  const listeners = new Map<string, Set<() => void>>();

  return {
    get scrollTop(): number {
      return scrollTop;
    },
    set scrollTop(value: number) {
      scrollTop = value;
    },
    addEventListener: vi.fn(
      (type: string, handler: () => void, _opts?: unknown) => {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type)!.add(handler);
      },
    ),
    removeEventListener: vi.fn((type: string, handler: () => void) => {
      listeners.get(type)?.delete(handler);
    }),
  } as unknown as HTMLElement;
}

function scrollTo(el: HTMLElement, position: number): void {
  (el as unknown as { scrollTop: number }).scrollTop = position;
  // Fire attached scroll listeners directly via handleScroll (the tracker
  // attaches a listener internally, but we call handleScroll for simplicity).
}

describe("ScrollDirectionTracker", () => {
  it("starts with hidden = false", () => {
    const tracker = new ScrollDirectionTracker();
    expect(tracker.hidden).toBe(false);
  });

  it("hides when scrolling down past threshold", () => {
    const onChange = vi.fn();
    const el = createMockElement(0);
    const tracker = new ScrollDirectionTracker({ threshold: 60, onChange });

    tracker.attach(el);

    // Scroll down past threshold.
    scrollTo(el, 100);
    tracker.handleScroll();

    expect(tracker.hidden).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("shows when scrolling up after hiding", () => {
    const onChange = vi.fn();
    const el = createMockElement(0);
    const tracker = new ScrollDirectionTracker({
      threshold: 60,
      deadZone: 5,
      onChange,
    });

    tracker.attach(el);

    // Scroll down past threshold.
    scrollTo(el, 200);
    tracker.handleScroll();
    expect(tracker.hidden).toBe(true);

    // Scroll up (still above threshold).
    scrollTo(el, 150);
    tracker.handleScroll();
    expect(tracker.hidden).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("stays visible when scrollTop is below threshold", () => {
    const onChange = vi.fn();
    const el = createMockElement(0);
    const tracker = new ScrollDirectionTracker({ threshold: 60, onChange });

    tracker.attach(el);

    // Scroll down but stay under threshold.
    scrollTo(el, 30);
    tracker.handleScroll();

    expect(tracker.hidden).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reverts to visible when scrolling back near the top", () => {
    const onChange = vi.fn();
    const el = createMockElement(0);
    const tracker = new ScrollDirectionTracker({ threshold: 60, onChange });

    tracker.attach(el);

    // Scroll down past threshold.
    scrollTo(el, 200);
    tracker.handleScroll();
    expect(tracker.hidden).toBe(true);

    // Scroll all the way back to near top.
    scrollTo(el, 10);
    tracker.handleScroll();
    expect(tracker.hidden).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("ignores deltas within dead zone", () => {
    const onChange = vi.fn();
    const el = createMockElement(0);
    const tracker = new ScrollDirectionTracker({
      threshold: 60,
      deadZone: 5,
      onChange,
    });

    tracker.attach(el);

    // Scroll to 100 first.
    scrollTo(el, 100);
    tracker.handleScroll();
    expect(tracker.hidden).toBe(true);
    onChange.mockClear();

    // Tiny scroll up (3px, within dead zone).
    scrollTo(el, 97);
    tracker.handleScroll();

    // Should remain hidden, onChange not called.
    expect(tracker.hidden).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("registers a passive scroll listener on attach", () => {
    const el = createMockElement(0);
    const tracker = new ScrollDirectionTracker();

    tracker.attach(el);

    expect(el.addEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
      { passive: true },
    );
  });

  it("removes the scroll listener on detach", () => {
    const el = createMockElement(0);
    const tracker = new ScrollDirectionTracker();

    tracker.attach(el);
    tracker.detach();

    expect(el.removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
  });

  it("detaches from old element when attaching to a new one", () => {
    const el1 = createMockElement(0);
    const el2 = createMockElement(0);
    const tracker = new ScrollDirectionTracker();

    tracker.attach(el1);
    tracker.attach(el2);

    expect(el1.removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
    expect(el2.addEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
      { passive: true },
    );
  });

  it("does not fire onChange when hidden state stays the same", () => {
    const onChange = vi.fn();
    const el = createMockElement(0);
    const tracker = new ScrollDirectionTracker({
      threshold: 60,
      deadZone: 5,
      onChange,
    });

    tracker.attach(el);

    // Two consecutive scroll-down events past threshold.
    scrollTo(el, 100);
    tracker.handleScroll();
    expect(onChange).toHaveBeenCalledTimes(1);

    scrollTo(el, 200);
    tracker.handleScroll();
    // hidden was already true, no change.
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("syncs lastScrollTop from element on attach", () => {
    const onChange = vi.fn();
    // Element starts at scrollTop 150 (mid-scroll).
    const el = createMockElement(150);
    const tracker = new ScrollDirectionTracker({
      threshold: 60,
      deadZone: 5,
      onChange,
    });

    tracker.attach(el);

    // Small scroll down from 150 to 160 (10px, above dead zone).
    scrollTo(el, 160);
    tracker.handleScroll();

    // Should hide (scrolling down, above threshold).
    expect(tracker.hidden).toBe(true);
  });
});
