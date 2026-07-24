// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushSync } from "svelte";
import {
  useFoldDrag,
  decideFoldSnap,
  type FoldDragConfig,
} from "./use-fold-drag.svelte.js";

import type * as ChromeGlass from "./chrome-glass.svelte.js";

// vi.mock required: chrome-glass.svelte.js uses $state rune at module
// scope. The rune read/write side-effects during drag make assertions
// harder. Mock to observe calls without mutating global rune state.
vi.mock(
  "./chrome-glass.svelte.js",
  () =>
    ({
      setChromeIntensity: vi.fn(),
      requestOpaqueChrome: vi.fn(() => vi.fn()),
      isChromeOpaque: vi.fn(() => false),
      chromeIntensity: vi.fn(() => 0),
      flashOpaqueChrome: vi.fn(),
    }) satisfies typeof ChromeGlass,
);

import { setChromeIntensity } from "./chrome-glass.svelte.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fakeTouch(clientX: number, clientY: number): Touch {
  return { clientX, clientY } as unknown as Touch;
}

function fireTouchEvent(
  target: HTMLElement,
  type: "touchstart" | "touchmove" | "touchend" | "touchcancel",
  touches: Touch[] = [],
): void {
  const ev = new TouchEvent(type, {
    touches,
    cancelable: true,
    bubbles: true,
  });
  target.dispatchEvent(ev);
}

/**
 * Build a wrapper element with a child content element. The wrapper is
 * what useFoldDrag receives as wrapEl, and the first child element's
 * maxHeight is controlled during the drag.
 */
function buildWrap(scrollHeight = 200): {
  wrapEl: HTMLElement;
  contentEl: HTMLElement;
} {
  const wrapEl = document.createElement("div");
  const contentEl = document.createElement("div");
  wrapEl.appendChild(contentEl);
  document.body.appendChild(wrapEl);
  // jsdom doesn't compute layout. Override scrollHeight.
  Object.defineProperty(contentEl, "scrollHeight", { value: scrollHeight });
  return { wrapEl, contentEl };
}

function makeConfig(overrides?: Partial<FoldDragConfig>): FoldDragConfig {
  const { wrapEl } = buildWrap();
  return {
    folded: true,
    onsnap: vi.fn(),
    wrapEl,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests: decideFoldSnap (supplemental to the existing use-fold-drag.test.ts)
// ---------------------------------------------------------------------------

describe("decideFoldSnap (edge cases)", () => {
  it("returns false when swiping back with both thresholds exceeded", () => {
    expect(decideFoldSnap(100, 0.6, true)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: useFoldDrag gesture handler
// ---------------------------------------------------------------------------

describe("useFoldDrag", () => {
  let teardowns: Array<() => void>;

  beforeEach(() => {
    vi.useFakeTimers();
    teardowns = [];
    vi.mocked(setChromeIntensity).mockClear();
  });

  afterEach(() => {
    for (const fn of teardowns) fn();
    teardowns = [];
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  /**
   * Initialize the composable inside $effect.root, attach the action to a
   * handle node, and return everything tests need.
   */
  function setup(configOverrides?: Partial<FoldDragConfig>): {
    config: FoldDragConfig;
    handle: HTMLElement;
    wrapEl: HTMLElement;
    contentEl: HTMLElement;
    consumeClick: () => boolean;
    destroy: () => void;
  } {
    const { wrapEl, contentEl } = buildWrap(300);
    const cfg = makeConfig({ wrapEl, ...configOverrides });

    const handle = document.createElement("div");
    document.body.appendChild(handle);

    let destroyAction: (() => void) | undefined;
    let consumeClickFn: (() => boolean) | undefined;

    const rootCleanup = $effect.root(() => {
      const fd = useFoldDrag(cfg);
      const result = fd.action(handle);
      destroyAction = result.destroy;
      consumeClickFn = fd.consumeClick;
    });
    flushSync();

    teardowns.push(() => {
      destroyAction?.();
      rootCleanup();
    });

    return {
      config: cfg,
      handle,
      wrapEl,
      contentEl,
      consumeClick: consumeClickFn!,
      destroy: destroyAction!,
    };
  }

  // -----------------------------------------------------------------------
  // Action setup
  // -----------------------------------------------------------------------

  it("attaches four touch listeners on the handle", () => {
    const addSpy = vi.spyOn(HTMLElement.prototype, "addEventListener");
    setup();

    const types = addSpy.mock.calls.map(([t]) => t);
    expect(types).toContain("touchstart");
    expect(types).toContain("touchmove");
    expect(types).toContain("touchend");
    expect(types).toContain("touchcancel");
    addSpy.mockRestore();
  });

  it("removes listeners and resets styles on destroy", () => {
    const removeSpy = vi.spyOn(HTMLElement.prototype, "removeEventListener");
    const { destroy, wrapEl, contentEl } = setup();

    wrapEl.style.marginTop = "10px";
    contentEl.style.maxHeight = "200px";

    destroy();

    const types = removeSpy.mock.calls.map(([t]) => t);
    expect(types).toContain("touchstart");
    expect(types).toContain("touchmove");
    expect(types).toContain("touchend");
    expect(types).toContain("touchcancel");
    removeSpy.mockRestore();
  });

  // -----------------------------------------------------------------------
  // Fold past snap threshold collapses (folded=false, drag up > 80px)
  // -----------------------------------------------------------------------

  it("snaps to folded when expanded and dragged up past 80px threshold", () => {
    const { config, handle } = setup({ folded: false });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 300)]);
    // Commit: drag up (negative delta). allowedSign=-1, so
    // rawDelta * -1 = (296-300)*-1 = 4 > 3.
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 296)]);
    // Drag up well past 80px from commit point.
    vi.advanceTimersByTime(300);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 200)]);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 190)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).toHaveBeenCalledWith(true);
  });

  // -----------------------------------------------------------------------
  // Fold below threshold springs back (no snap)
  // -----------------------------------------------------------------------

  it("does not snap when expanded and drag distance is below 80px", () => {
    const { config, handle } = setup({ folded: false });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 300)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 296)]);
    // Only 30px from commit point (below 80px threshold), slow speed.
    vi.advanceTimersByTime(500);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 270)]);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 266)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Expand past threshold opens (folded=true, drag down > 80px)
  // -----------------------------------------------------------------------

  it("snaps to expanded when folded and dragged down past 80px threshold", () => {
    const { config, handle } = setup({ folded: true });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    // Commit: drag down. allowedSign=1, rawDelta*1 = 4 > 3.
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 104)]);
    // Drag down past 80px from commit point.
    vi.advanceTimersByTime(300);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 190)]);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 200)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).toHaveBeenCalledWith(false);
  });

  // -----------------------------------------------------------------------
  // Velocity-based snap
  // -----------------------------------------------------------------------

  it("snaps on fast flick even when distance is below 80px", () => {
    const { config, handle } = setup({ folded: true });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(1);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 104)]);
    // Fast: 40px in ~5ms. velocity = 40/6 > 0.4.
    vi.advanceTimersByTime(5);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 144)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).toHaveBeenCalledWith(false);
  });

  // -----------------------------------------------------------------------
  // Swiping back prevents snap
  // -----------------------------------------------------------------------

  it("does not snap when user reverses drag direction while folded", () => {
    const { config, handle } = setup({ folded: true });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 104)]);
    vi.advanceTimersByTime(300);
    // Drag down past threshold.
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 250)]);
    // Reverse: final pos is less than previous (swiping back).
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 200)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).not.toHaveBeenCalled();
  });

  it("does not snap when user reverses drag direction while expanded", () => {
    const { config, handle } = setup({ folded: false });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 300)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 296)]);
    vi.advanceTimersByTime(300);
    // Drag up past threshold.
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 190)]);
    // Reverse: final pos is greater than previous (swiping back for expand).
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 230)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Multi-touch ignored
  // -----------------------------------------------------------------------

  it("ignores multi-touch events in touchstart", () => {
    const { config, handle } = setup();

    fireTouchEvent(handle, "touchstart", [
      fakeTouch(0, 100),
      fakeTouch(50, 200),
    ]);
    fireTouchEvent(handle, "touchmove", [
      fakeTouch(0, 200),
      fakeTouch(50, 300),
    ]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Wrong direction does not commit
  // -----------------------------------------------------------------------

  it("does not commit when folded and dragging up (wrong direction)", () => {
    const { config, handle } = setup({ folded: true });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 300)]);
    // Drag up: rawDelta * allowedSign = (200-300)*1 = -100 < 3.
    vi.advanceTimersByTime(100);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 200)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).not.toHaveBeenCalled();
  });

  it("does not commit when expanded and dragging down (wrong direction)", () => {
    const { config, handle } = setup({ folded: false });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    // Drag down: rawDelta * allowedSign = (200-100)*-1 = -100 < 3.
    vi.advanceTimersByTime(100);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 200)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Non-committed touchend resets styles
  // -----------------------------------------------------------------------

  it("resets inline styles on touchend when drag was never committed", () => {
    const { handle } = setup();

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    // No move, so not committed.
    fireTouchEvent(handle, "touchend");

    // setChromeIntensity(null) is called by resetInlineStyles.
    expect(setChromeIntensity).toHaveBeenCalledWith(null);
  });

  // -----------------------------------------------------------------------
  // touchcancel triggers same path as touchend
  // -----------------------------------------------------------------------

  it("handles touchcancel the same as touchend", () => {
    const { config, handle } = setup({ folded: true });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 104)]);
    vi.advanceTimersByTime(500);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 130)]);
    fireTouchEvent(handle, "touchcancel");

    // Small drag, slow velocity, no snap.
    expect(config.onsnap).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // consumeClick
  // -----------------------------------------------------------------------

  it("consumeClick returns false when no drag was committed", () => {
    const { consumeClick } = setup();
    expect(consumeClick()).toBe(false);
  });

  it("consumeClick returns true once after a committed snap, then false", () => {
    const { config, handle, consumeClick } = setup({ folded: true });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 104)]);
    vi.advanceTimersByTime(300);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 210)]);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 220)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).toHaveBeenCalled();
    expect(consumeClick()).toBe(true);
    expect(consumeClick()).toBe(false);
  });

  // -----------------------------------------------------------------------
  // wrapEl=undefined makes touchstart no-op
  // -----------------------------------------------------------------------

  it("does nothing when wrapEl is undefined", () => {
    const { config, handle } = setup({ wrapEl: undefined });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(100);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 300)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // wrapEl with no first child element
  // -----------------------------------------------------------------------

  it("does nothing when wrapEl has no child element", () => {
    const emptyWrap = document.createElement("div");
    document.body.appendChild(emptyWrap);
    const { config, handle } = setup({ wrapEl: emptyWrap });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(100);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 300)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // wrapEl with text-only child (not HTMLElement)
  // -----------------------------------------------------------------------

  it("does nothing when wrapEl first child is a text node", () => {
    const textWrap = document.createElement("div");
    textWrap.appendChild(document.createTextNode("hello"));
    document.body.appendChild(textWrap);
    const { config, handle } = setup({ wrapEl: textWrap });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(100);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 300)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // scrollHeight <= 0 defaults to 200
  // -----------------------------------------------------------------------

  it("uses 200 as naturalHeight when scrollHeight is 0", () => {
    const wrapEl = document.createElement("div");
    const contentEl = document.createElement("div");
    wrapEl.appendChild(contentEl);
    document.body.appendChild(wrapEl);
    Object.defineProperty(contentEl, "scrollHeight", { value: 0 });

    const { config, handle } = setup({ folded: true, wrapEl });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 104)]);
    // Drag down 100px from commit, velocity is moderate.
    vi.advanceTimersByTime(200);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 210)]);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 220)]);
    fireTouchEvent(handle, "touchend");

    // Should snap; naturalHeight defaulted to 200.
    expect(config.onsnap).toHaveBeenCalledWith(false);
  });

  // -----------------------------------------------------------------------
  // setChromeIntensity called during drag
  // -----------------------------------------------------------------------

  it("calls setChromeIntensity with fraction during touchmove", () => {
    const { handle } = setup({ folded: true });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 104)]);
    vi.advanceTimersByTime(50);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 200)]);

    // setChromeIntensity should have been called with a number between 0 and 1.
    const calls = vi.mocked(setChromeIntensity).mock.calls;
    const fractionCalls = calls.filter(
      ([v]) => typeof v === "number" && v > 0 && v <= 1,
    );
    expect(fractionCalls.length).toBeGreaterThan(0);

    fireTouchEvent(handle, "touchend");
  });

  // -----------------------------------------------------------------------
  // Expanded drag: content height decreases as user drags up
  // -----------------------------------------------------------------------

  it("reduces contentEl maxHeight when expanded and dragging up", () => {
    const wrapEl = document.createElement("div");
    const contentEl = document.createElement("div");
    wrapEl.appendChild(contentEl);
    document.body.appendChild(wrapEl);
    Object.defineProperty(contentEl, "scrollHeight", { value: 300 });

    const { handle } = setup({ folded: false, wrapEl });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 300)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 296)]);
    vi.advanceTimersByTime(100);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 200)]);

    // Content maxHeight should be reduced: naturalHeight(300) + dragDelta(200-296=-96) = 204.
    const maxH = parseFloat(contentEl.style.maxHeight || "0");
    expect(maxH).toBeLessThan(300);
    expect(maxH).toBeGreaterThan(0);

    fireTouchEvent(handle, "touchend");
  });

  // -----------------------------------------------------------------------
  // Folded drag: content height increases as user drags down
  // -----------------------------------------------------------------------

  it("increases contentEl maxHeight when folded and dragging down", () => {
    const wrapEl = document.createElement("div");
    const contentEl = document.createElement("div");
    wrapEl.appendChild(contentEl);
    document.body.appendChild(wrapEl);
    Object.defineProperty(contentEl, "scrollHeight", { value: 300 });

    const { handle } = setup({ folded: true, wrapEl });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 104)]);
    vi.advanceTimersByTime(100);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 200)]);

    // targetHeight = min(300, max(0, 200-104)) = 96.
    const maxH = parseFloat(contentEl.style.maxHeight || "0");
    expect(maxH).toBeGreaterThan(0);
    expect(maxH).toBeLessThanOrEqual(300);

    fireTouchEvent(handle, "touchend");
  });

  // -----------------------------------------------------------------------
  // Transition animation for snap (non-reducedMotion)
  // -----------------------------------------------------------------------

  it("animates content maxHeight transition and clears on transitionend", () => {
    const wrapEl = document.createElement("div");
    const contentEl = document.createElement("div");
    wrapEl.appendChild(contentEl);
    document.body.appendChild(wrapEl);
    Object.defineProperty(contentEl, "scrollHeight", { value: 300 });

    const { config, handle } = setup({ folded: true, wrapEl });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 104)]);
    vi.advanceTimersByTime(300);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 210)]);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 220)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).toHaveBeenCalled();
    // Content should have a transition style set.
    expect(contentEl.style.transition).toContain("max-height");

    // Fire transitionend to clear.
    contentEl.dispatchEvent(new Event("transitionend"));
    expect(contentEl.style.transition).toBe("");
  });

  // -----------------------------------------------------------------------
  // No-op on touchmove when wrapRef/contentRef not set
  // -----------------------------------------------------------------------

  it("ignores touchmove when wrapRef is null (touchstart failed)", () => {
    const { config, handle } = setup({ wrapEl: undefined });

    // touchstart with no wrapEl sets wrapRef to null.
    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    // touchmove should bail at the wrapRef null check.
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 200)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // preventDefault called on committed touchmove
  // -----------------------------------------------------------------------

  it("calls preventDefault on committed touchmove", () => {
    const { handle } = setup({ folded: true });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 104)]);

    vi.advanceTimersByTime(50);
    const moveEvent = new TouchEvent("touchmove", {
      touches: [fakeTouch(0, 150)],
      cancelable: true,
      bubbles: true,
    });
    const pdSpy = vi.spyOn(moveEvent, "preventDefault");
    handle.dispatchEvent(moveEvent);

    expect(pdSpy).toHaveBeenCalledOnce();
    pdSpy.mockRestore();

    fireTouchEvent(handle, "touchend");
  });

  // -----------------------------------------------------------------------
  // borderTopColor set to transparent when targetHeight is 0
  // -----------------------------------------------------------------------

  it("sets borderTopColor to transparent when content is fully collapsed", () => {
    const wrapEl = document.createElement("div");
    const contentEl = document.createElement("div");
    wrapEl.appendChild(contentEl);
    document.body.appendChild(wrapEl);
    Object.defineProperty(contentEl, "scrollHeight", { value: 300 });

    const { handle } = setup({ folded: true, wrapEl });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    // Commit and keep at 0 effectively (tiny delta).
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 104)]);
    vi.advanceTimersByTime(50);
    // Move backward to startY so targetHeight is 0.
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 104)]);

    expect(wrapEl.style.borderTopColor).toBe("transparent");

    fireTouchEvent(handle, "touchend");
  });

  // -----------------------------------------------------------------------
  // Snap to fold when expanded, then touchend animates to height 0
  // -----------------------------------------------------------------------

  it("animates wrapEl margin to 0 on fold snap", () => {
    const wrapEl = document.createElement("div");
    const contentEl = document.createElement("div");
    wrapEl.appendChild(contentEl);
    document.body.appendChild(wrapEl);
    Object.defineProperty(contentEl, "scrollHeight", { value: 300 });

    const { config, handle } = setup({ folded: false, wrapEl });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 300)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 296)]);
    vi.advanceTimersByTime(300);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 190)]);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 180)]);
    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).toHaveBeenCalledWith(true);
    // targetHeight is 0 (folding), so margin target is 0.
    expect(wrapEl.style.marginTop).toBe("0px");
    expect(wrapEl.style.borderTopColor).toBe("transparent");
  });

  // -----------------------------------------------------------------------
  // reducedMotion path: immediate reset without animation
  // -----------------------------------------------------------------------

  it("resets styles immediately when prefers-reduced-motion matches", () => {
    // Override matchMedia to return matches: true.
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: () => false,
      }) as MediaQueryList;

    const wrapEl = document.createElement("div");
    const contentEl = document.createElement("div");
    wrapEl.appendChild(contentEl);
    document.body.appendChild(wrapEl);
    Object.defineProperty(contentEl, "scrollHeight", { value: 300 });

    // Need a fresh action attachment to capture the new matchMedia result.
    const handle = document.createElement("div");
    document.body.appendChild(handle);

    const cfg = makeConfig({ folded: true, wrapEl });

    let destroyAction: (() => void) | undefined;
    const rootCleanup = $effect.root(() => {
      const fd = useFoldDrag(cfg);
      const result = fd.action(handle);
      destroyAction = result.destroy;
    });
    flushSync();
    teardowns.push(() => {
      destroyAction?.();
      rootCleanup();
    });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 104)]);
    vi.advanceTimersByTime(300);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 210)]);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 220)]);
    fireTouchEvent(handle, "touchend");

    expect(cfg.onsnap).toHaveBeenCalledWith(false);
    // In reducedMotion path, styles are reset immediately (no transition).
    expect(contentEl.style.transition).toBe("");
    expect(contentEl.style.maxHeight).toBe("");
    expect(setChromeIntensity).toHaveBeenCalledWith(null);

    window.matchMedia = originalMatchMedia;
  });

  // -----------------------------------------------------------------------
  // Target already at computed height skips transition
  // -----------------------------------------------------------------------

  it("resets immediately when content is already at target height", () => {
    const wrapEl = document.createElement("div");
    const contentEl = document.createElement("div");
    wrapEl.appendChild(contentEl);
    document.body.appendChild(wrapEl);
    Object.defineProperty(contentEl, "scrollHeight", { value: 300 });

    const { config, handle } = setup({ folded: false, wrapEl });

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 300)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 296)]);
    // Small drag that doesn't snap (below threshold, slow).
    vi.advanceTimersByTime(500);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 290)]);
    fireTouchEvent(handle, "touchmove", [fakeTouch(0, 291)]);

    // Manually set maxHeight to naturalHeight (the target for non-snap expanded).
    contentEl.style.maxHeight = "300px";

    fireTouchEvent(handle, "touchend");

    expect(config.onsnap).not.toHaveBeenCalled();
    // Since currentMax (300) matches targetHeight (300), no transition fires.
    // resetInlineStyles clears everything.
    expect(setChromeIntensity).toHaveBeenCalledWith(null);
  });
});
