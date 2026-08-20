// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createLongPress,
  distSq,
  haptic,
  HOLD_DURATION_MS,
  MOVE_THRESHOLD_PX,
  type LongPressCallbacks,
} from "./long-press.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fire(
  target: HTMLElement,
  type: "pointerdown" | "pointermove" | "pointerup" | "pointercancel",
  init?: Partial<PointerEventInit>,
): PointerEvent {
  const ev = new PointerEvent(type, {
    pointerId: 1,
    isPrimary: true,
    clientX: 0,
    clientY: 0,
    button: 0,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(ev);
  return ev;
}

function makeCallbacks(
  overrides?: Partial<LongPressCallbacks>,
): LongPressCallbacks {
  return {
    onFire: vi.fn(),
    onProgress: vi.fn(),
    onDrag: vi.fn(),
    onSecondaryTap: vi.fn(),
    onRelease: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe("distSq", () => {
  it("returns squared distance between two points", () => {
    expect(distSq(0, 0, 3, 4)).toBe(25);
  });

  it("returns 0 for the same point", () => {
    expect(distSq(5, 5, 5, 5)).toBe(0);
  });
});

describe("haptic", () => {
  it("is a callable no-op", () => {
    expect(() => {
      haptic();
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Gesture state machine
// ---------------------------------------------------------------------------

describe("createLongPress", () => {
  let el: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    el = document.createElement("div");
    document.body.appendChild(el);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  // -----------------------------------------------------------------------
  // Basic hold to fire
  // -----------------------------------------------------------------------

  it("fires after holding for HOLD_DURATION_MS", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", { clientX: 100, clientY: 200 });
    expect(lp.state.phase).toBe("holding");

    vi.advanceTimersByTime(HOLD_DURATION_MS);
    expect(cb.onFire).toHaveBeenCalledOnce();
    expect(lp.state.phase).toBe("held");

    cleanup.destroy();
  });

  it("reports progress during the hold", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", { clientX: 100, clientY: 200 });

    // The first call is the initial 0 progress
    expect(cb.onProgress).toHaveBeenCalledWith(0);

    // After the hold duration, final progress is 1
    vi.advanceTimersByTime(HOLD_DURATION_MS);
    expect(cb.onProgress).toHaveBeenCalledWith(1);

    cleanup.destroy();
  });

  // -----------------------------------------------------------------------
  // Cancellation by movement
  // -----------------------------------------------------------------------

  it("cancels when pointer moves past the threshold during hold", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", { clientX: 100, clientY: 200 });
    // Move beyond MOVE_THRESHOLD_PX
    fire(el, "pointermove", {
      clientX: 100 + MOVE_THRESHOLD_PX + 1,
      clientY: 200,
    });

    expect(cb.onCancel).toHaveBeenCalledOnce();
    expect(lp.state.phase).toBe("idle");

    // The hold timer should not fire after cancellation
    vi.advanceTimersByTime(HOLD_DURATION_MS);
    expect(cb.onFire).not.toHaveBeenCalled();

    cleanup.destroy();
  });

  it("does not cancel when movement stays within threshold", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", { clientX: 100, clientY: 200 });
    // Move just under the threshold (diagonal: 8px each axis = ~11.3px < 12px)
    fire(el, "pointermove", { clientX: 108, clientY: 208 });

    expect(cb.onCancel).not.toHaveBeenCalled();

    vi.advanceTimersByTime(HOLD_DURATION_MS);
    expect(cb.onFire).toHaveBeenCalledOnce();

    cleanup.destroy();
  });

  // -----------------------------------------------------------------------
  // Early release cancels
  // -----------------------------------------------------------------------

  it("cancels when released before the hold duration", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", { clientX: 100, clientY: 200 });
    vi.advanceTimersByTime(HOLD_DURATION_MS / 2);
    fire(el, "pointerup");

    expect(cb.onCancel).toHaveBeenCalledOnce();
    expect(cb.onFire).not.toHaveBeenCalled();
    expect(lp.state.phase).toBe("idle");

    cleanup.destroy();
  });

  // -----------------------------------------------------------------------
  // pointercancel
  // -----------------------------------------------------------------------

  it("cancels on pointercancel during hold", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", { clientX: 100, clientY: 200 });
    fire(el, "pointercancel");

    expect(cb.onCancel).toHaveBeenCalledOnce();
    expect(lp.state.phase).toBe("idle");

    cleanup.destroy();
  });

  it("cancels on pointercancel during held phase", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", { clientX: 100, clientY: 200 });
    vi.advanceTimersByTime(HOLD_DURATION_MS);
    expect(lp.state.phase).toBe("held");

    fire(el, "pointercancel");
    expect(cb.onCancel).toHaveBeenCalledOnce();
    expect(lp.state.phase).toBe("idle");

    cleanup.destroy();
  });

  // -----------------------------------------------------------------------
  // Post-fire drag
  // -----------------------------------------------------------------------

  it("reports drag deltas after the hold fires", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", { clientX: 100, clientY: 200 });
    vi.advanceTimersByTime(HOLD_DURATION_MS);

    fire(el, "pointermove", { clientX: 110, clientY: 180 });
    expect(cb.onDrag).toHaveBeenCalledWith(10, -20);

    cleanup.destroy();
  });

  // -----------------------------------------------------------------------
  // Post-fire release
  // -----------------------------------------------------------------------

  it("calls onRelease when the primary pointer lifts after fire", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", { clientX: 100, clientY: 200 });
    vi.advanceTimersByTime(HOLD_DURATION_MS);

    fire(el, "pointerup");
    expect(cb.onRelease).toHaveBeenCalledOnce();
    expect(lp.state.phase).toBe("idle");

    cleanup.destroy();
  });

  // -----------------------------------------------------------------------
  // Secondary tap
  // -----------------------------------------------------------------------

  it("fires secondary tap when a second pointer arrives during held phase", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", {
      clientX: 100,
      clientY: 200,
      pointerId: 1,
    });
    vi.advanceTimersByTime(HOLD_DURATION_MS);

    // Second pointer taps
    fire(el, "pointerdown", {
      clientX: 150,
      clientY: 250,
      pointerId: 2,
      isPrimary: false,
    });

    expect(cb.onSecondaryTap).toHaveBeenCalledOnce();

    cleanup.destroy();
  });

  it("ignores secondary pointer during hold phase (before fire)", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", {
      clientX: 100,
      clientY: 200,
      pointerId: 1,
    });

    // Second pointer before hold completes
    fire(el, "pointerdown", {
      clientX: 150,
      clientY: 250,
      pointerId: 2,
      isPrimary: false,
    });

    expect(cb.onSecondaryTap).not.toHaveBeenCalled();

    cleanup.destroy();
  });

  // -----------------------------------------------------------------------
  // Pointer capture and selection suppression
  // -----------------------------------------------------------------------

  it("calls setPointerCapture on pointerdown", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    const captureSpy = vi.fn();
    el.setPointerCapture = captureSpy;

    fire(el, "pointerdown", { clientX: 100, clientY: 200 });
    expect(captureSpy).toHaveBeenCalledWith(1);

    cleanup.destroy();
  });

  it("prevents default on pointerdown to suppress iOS text selection", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    const ev = fire(el, "pointerdown", { clientX: 100, clientY: 200 });
    expect(ev.defaultPrevented).toBe(true);

    cleanup.destroy();
  });

  it("prevents default on contextmenu", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    const ev = new Event("contextmenu", { cancelable: true, bubbles: true });
    el.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);

    cleanup.destroy();
  });

  // -----------------------------------------------------------------------
  // Non-primary button ignored
  // -----------------------------------------------------------------------

  it("ignores non-zero button (right click)", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", { button: 2 });
    expect(lp.state.phase).toBe("idle");

    vi.advanceTimersByTime(HOLD_DURATION_MS);
    expect(cb.onFire).not.toHaveBeenCalled();

    cleanup.destroy();
  });

  // -----------------------------------------------------------------------
  // Non-primary pointer ignored for initial hold
  // -----------------------------------------------------------------------

  it("ignores non-primary pointer for the initial hold", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", {
      clientX: 100,
      clientY: 200,
      isPrimary: false,
      pointerId: 2,
    });

    expect(lp.state.phase).toBe("idle");

    vi.advanceTimersByTime(HOLD_DURATION_MS);
    expect(cb.onFire).not.toHaveBeenCalled();

    cleanup.destroy();
  });

  // -----------------------------------------------------------------------
  // Move events from wrong pointer are ignored
  // -----------------------------------------------------------------------

  it("ignores pointermove from a different pointer id", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", {
      clientX: 100,
      clientY: 200,
      pointerId: 1,
    });

    // Move from a different pointer
    fire(el, "pointermove", {
      clientX: 200,
      clientY: 300,
      pointerId: 99,
    });

    // Should not cancel despite large movement
    expect(cb.onCancel).not.toHaveBeenCalled();

    vi.advanceTimersByTime(HOLD_DURATION_MS);
    expect(cb.onFire).toHaveBeenCalledOnce();

    cleanup.destroy();
  });

  // -----------------------------------------------------------------------
  // Cleanup removes listeners
  // -----------------------------------------------------------------------

  it("removes listeners and resets state on destroy", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", { clientX: 100, clientY: 200 });
    cleanup.destroy();

    // Timer should not fire after destroy
    vi.advanceTimersByTime(HOLD_DURATION_MS);
    expect(cb.onFire).not.toHaveBeenCalled();
    expect(lp.state.phase).toBe("idle");
  });

  // -----------------------------------------------------------------------
  // Reuse after full cycle
  // -----------------------------------------------------------------------

  it("can start a new gesture after a completed one", () => {
    const cb = makeCallbacks();
    const lp = createLongPress(cb);
    const cleanup = lp.attach(el);

    // First gesture: hold and release
    fire(el, "pointerdown", { clientX: 100, clientY: 200 });
    vi.advanceTimersByTime(HOLD_DURATION_MS);
    fire(el, "pointerup");
    expect(cb.onFire).toHaveBeenCalledOnce();

    // Second gesture
    fire(el, "pointerdown", { clientX: 50, clientY: 50 });
    vi.advanceTimersByTime(HOLD_DURATION_MS);
    expect(cb.onFire).toHaveBeenCalledTimes(2);

    fire(el, "pointerup");
    cleanup.destroy();
  });

  // -----------------------------------------------------------------------
  // Optional callbacks
  // -----------------------------------------------------------------------

  it("works with only onFire (all others optional)", () => {
    const onFire = vi.fn();
    const lp = createLongPress({ onFire });
    const cleanup = lp.attach(el);

    fire(el, "pointerdown", { clientX: 100, clientY: 200 });
    vi.advanceTimersByTime(HOLD_DURATION_MS);
    expect(onFire).toHaveBeenCalledOnce();

    fire(el, "pointermove", { clientX: 110, clientY: 180 });
    fire(el, "pointerup");
    // No throws from missing optional callbacks

    cleanup.destroy();
  });
});
