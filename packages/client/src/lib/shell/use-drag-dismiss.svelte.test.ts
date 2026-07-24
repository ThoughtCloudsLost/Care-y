// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushSync } from "svelte";
import {
  useDragDismiss,
  type DragDismissConfig,
} from "./use-drag-dismiss.svelte.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal Touch-like object carrying only clientX/clientY. */
function fakeTouch(clientX: number, clientY: number): Touch {
  return { clientX, clientY } as unknown as Touch;
}

/** Dispatch a synthetic TouchEvent on `target`. */
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
 * Build a DOM tree: grandparent > parent > node.
 * Returns the node (action target), parent (default base at depth 1),
 * and grandparent (base at depth 2).
 */
function buildDom(): {
  node: HTMLElement;
  parent: HTMLElement;
  grandparent: HTMLElement;
} {
  const grandparent = document.createElement("div");
  const parent = document.createElement("div");
  const node = document.createElement("div");
  grandparent.appendChild(parent);
  parent.appendChild(node);
  document.body.appendChild(grandparent);
  return { node, parent, grandparent };
}

function makeConfig(overrides?: Partial<DragDismissConfig>): DragDismissConfig {
  const handle = document.createElement("div");
  return {
    ondismiss: vi.fn(),
    opened: true,
    handleEl: handle,
    axis: "y",
    direction: 1,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useDragDismiss", () => {
  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  /**
   * Initialize the composable inside an $effect.root so runes execute,
   * attach the action, and return handles needed by every test.
   */
  function setup(configOverrides?: Partial<DragDismissConfig>): {
    config: DragDismissConfig;
    node: HTMLElement;
    base: HTMLElement;
    destroy: () => void;
  } {
    const cfg = makeConfig(configOverrides);
    const { node, parent, grandparent } = buildDom();

    // Place the handle inside the node so contains() returns true.
    if (cfg.handleEl != null) {
      node.appendChild(cfg.handleEl);
    }

    let destroyAction: (() => void) | undefined;
    const teardown = $effect.root(() => {
      const drag = useDragDismiss(cfg);
      const result = drag.action(node);
      destroyAction = result.destroy;
    });
    flushSync();

    const depth = cfg.parentDepth ?? 1;
    const base = depth === 2 ? grandparent : parent;

    cleanup = (): void => {
      destroyAction?.();
      teardown();
    };

    return { config: cfg, node, base, destroy: destroyAction! };
  }

  // -----------------------------------------------------------------------
  // Action setup
  // -----------------------------------------------------------------------

  it("attaches touch listeners on the node", () => {
    const addSpy = vi.spyOn(HTMLElement.prototype, "addEventListener");
    setup();

    const calls = addSpy.mock.calls.map(([type]) => type);
    expect(calls).toContain("touchstart");
    expect(calls).toContain("touchmove");
    expect(calls).toContain("touchend");
    expect(calls).toContain("touchcancel");
    addSpy.mockRestore();
  });

  it("returns no-op destroy when parentElement chain is null", () => {
    const cfg = makeConfig();
    const orphan = document.createElement("div");

    let destroyAction: { destroy: () => void } | undefined;
    const teardown = $effect.root(() => {
      const drag = useDragDismiss(cfg);
      destroyAction = drag.action(orphan);
    });
    flushSync();

    // Should not throw.
    destroyAction!.destroy();
    teardown();
  });

  it("cleans up event listeners and resets styles on destroy", () => {
    const { base, destroy } = setup();

    base.style.transform = "translateY(50px)";
    base.style.transition = "transform 0.3s";

    destroy();

    expect(base.style.transform).toBe("");
    expect(base.style.transition).toBe("");
  });

  // -----------------------------------------------------------------------
  // Drag below threshold (no dismiss)
  // -----------------------------------------------------------------------

  it("does not dismiss when drag distance is below 80px threshold", () => {
    const { config, node } = setup();
    const handle = config.handleEl!;

    // Start touch on the handle at y=100 (bubbles to the node listener
    // with target=handle, so fromHandle commits the drag).
    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    // Move down 4px to commit (past COMMIT_DELTA_PX = 3).
    vi.advanceTimersByTime(10);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 104)]);
    // Move down total ~50px from commit point (below 80px threshold).
    vi.advanceTimersByTime(500);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 154)]);
    fireTouchEvent(node, "touchend");

    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Drag above threshold (dismiss fires)
  // -----------------------------------------------------------------------

  it("dismisses when drag distance exceeds 80px threshold", () => {
    const { config, node } = setup();
    const handle = config.handleEl!;

    fireTouchEvent(handle, "touchstart", [fakeTouch(0, 100)]);
    // Commit.
    vi.advanceTimersByTime(10);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 104)]);
    // Drag well past 80px (no swiping back: each move is further down).
    vi.advanceTimersByTime(400);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 180)]);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 210)]);
    fireTouchEvent(node, "touchend");

    expect(config.ondismiss).toHaveBeenCalledOnce();
  });

  // -----------------------------------------------------------------------
  // Wrong direction blocked
  // -----------------------------------------------------------------------

  it("ignores drag in the negative direction when direction is 1", () => {
    const { config, node } = setup({ direction: 1 });

    fireTouchEvent(config.handleEl!, "touchstart", [fakeTouch(0, 200)]);
    // Move upward (negative delta, wrong direction). Delta = -100.
    vi.advanceTimersByTime(100);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 100)]);
    fireTouchEvent(node, "touchend");

    // Never committed, so no dismiss.
    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  it("ignores drag in the positive direction when direction is -1", () => {
    const { config, node } = setup({ direction: -1, axis: "x" });

    fireTouchEvent(config.handleEl!, "touchstart", [fakeTouch(200, 0)]);
    // Move right (positive delta). For direction=-1, commit requires
    // delta * direction >= COMMIT_DELTA_PX, i.e. negative delta needed.
    vi.advanceTimersByTime(100);
    fireTouchEvent(node, "touchmove", [fakeTouch(300, 0)]);
    fireTouchEvent(node, "touchend");

    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Velocity-based dismiss (fast flick below distance threshold)
  // -----------------------------------------------------------------------

  it("dismisses on fast flick even when distance is below 80px threshold", () => {
    const { config, node } = setup();

    fireTouchEvent(config.handleEl!, "touchstart", [fakeTouch(0, 100)]);
    // Commit.
    vi.advanceTimersByTime(1);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 104)]);
    // Fast move: 40px in ~5ms. velocity = 40/6 ~= 6.67 px/ms > 0.4.
    vi.advanceTimersByTime(5);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 144)]);
    fireTouchEvent(node, "touchend");

    expect(config.ondismiss).toHaveBeenCalledOnce();
  });

  // -----------------------------------------------------------------------
  // Cancel mid-drag
  // -----------------------------------------------------------------------

  it("springs back on touchcancel without dismissing", () => {
    const { config, node, base } = setup();

    fireTouchEvent(config.handleEl!, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 104)]);
    // 46px over 200ms keeps velocity at 0.23, under the 0.4 dismiss cutoff.
    vi.advanceTimersByTime(200);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 150)]);

    // Cancel instead of end.
    fireTouchEvent(node, "touchcancel");

    // touchcancel routes through the same onTouchEnd handler.
    // With only ~46px offset and slow velocity, no dismiss.
    expect(config.ondismiss).not.toHaveBeenCalled();
    // The spring-back transition is applied.
    expect(base.style.transition).toContain("ease-out");
  });

  // -----------------------------------------------------------------------
  // X-axis with direction=-1 (left panel dismiss)
  // -----------------------------------------------------------------------

  it("dismisses on x-axis with direction=-1 when dragged left past threshold", () => {
    const { config, node } = setup({
      axis: "x",
      direction: -1,
    });

    fireTouchEvent(config.handleEl!, "touchstart", [fakeTouch(300, 0)]);
    // Commit: delta (300 - 296) * -1 = 4 > 3.
    vi.advanceTimersByTime(10);
    fireTouchEvent(node, "touchmove", [fakeTouch(296, 0)]);
    // Drag left past 80px threshold.
    vi.advanceTimersByTime(300);
    fireTouchEvent(node, "touchmove", [fakeTouch(210, 0)]);
    fireTouchEvent(node, "touchmove", [fakeTouch(200, 0)]);
    fireTouchEvent(node, "touchend");

    expect(config.ondismiss).toHaveBeenCalledOnce();
  });

  // -----------------------------------------------------------------------
  // Swiping back negates dismiss despite passing threshold
  // -----------------------------------------------------------------------

  it("does not dismiss when user reverses drag direction (swiping back)", () => {
    const { config, node } = setup();

    fireTouchEvent(config.handleEl!, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 104)]);
    // Drag past threshold.
    vi.advanceTimersByTime(400);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 250)]);
    // Swipe back: final position is less than the previous.
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 200)]);
    fireTouchEvent(node, "touchend");

    // swipingBack is true because currentTouchPos < prevTouchPos.
    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Opened=false guard
  // -----------------------------------------------------------------------

  it("ignores touch events when overlay is not opened", () => {
    const { config, node } = setup({ opened: false });

    fireTouchEvent(config.handleEl!, "touchstart", [fakeTouch(0, 100)]);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 200)]);
    fireTouchEvent(node, "touchend");

    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Multi-touch ignored
  // -----------------------------------------------------------------------

  it("ignores multi-touch (more than one finger)", () => {
    const { config, node } = setup();

    fireTouchEvent(config.handleEl!, "touchstart", [
      fakeTouch(0, 100),
      fakeTouch(50, 200),
    ]);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 200), fakeTouch(50, 300)]);
    fireTouchEvent(node, "touchend");

    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Non-handle touch does not start drag
  // -----------------------------------------------------------------------

  it("does not commit drag when touch starts outside the handle", () => {
    const { config, node } = setup();

    // touchstart fires on the node itself; the target is the node, not the handle.
    const startEvent = new TouchEvent("touchstart", {
      touches: [fakeTouch(0, 100)],
      cancelable: true,
      bubbles: true,
    });
    // Override event.target to point at the node, not the handle.
    Object.defineProperty(startEvent, "target", { value: node });
    node.dispatchEvent(startEvent);

    vi.advanceTimersByTime(100);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 300)]);
    fireTouchEvent(node, "touchend");

    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Non-committed touchend resets transition
  // -----------------------------------------------------------------------

  it("resets transition on touchend when drag was never committed", () => {
    const { node, base } = setup();

    fireTouchEvent(node, "touchstart", [fakeTouch(0, 100)]);
    // No touchmove, so not committed.
    fireTouchEvent(node, "touchend");

    expect(base.style.transition).toBe("");
  });

  // -----------------------------------------------------------------------
  // parentDepth=2
  // -----------------------------------------------------------------------

  it("uses grandparent as base when parentDepth is 2", () => {
    const { config, node, base } = setup({ parentDepth: 2 });

    fireTouchEvent(config.handleEl!, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 104)]);
    vi.advanceTimersByTime(300);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 210)]);

    // The drag transform lands on the grandparent, not the direct parent.
    expect(base.style.transform).toContain("translateY(");

    fireTouchEvent(node, "touchmove", [fakeTouch(0, 220)]);
    fireTouchEvent(node, "touchend");

    // 116px offset exceeds the 80px threshold, so the dismiss fires too.
    expect(config.ondismiss).toHaveBeenCalledOnce();
  });

  // -----------------------------------------------------------------------
  // $effect resets transform when opened flips to false
  // -----------------------------------------------------------------------

  it("clears transform and transition when opened becomes false", () => {
    // Use a reactive config object so we can toggle `opened`.
    const handle = document.createElement("div");
    let opened = $state(true);

    const cfg: DragDismissConfig = {
      ondismiss: vi.fn(),
      get opened() {
        return opened;
      },
      handleEl: handle,
      axis: "y",
      direction: 1,
    };

    const { node, parent } = buildDom();
    node.appendChild(handle);

    let destroyAction: (() => void) | undefined;
    const teardown = $effect.root(() => {
      const drag = useDragDismiss(cfg);
      const result = drag.action(node);
      destroyAction = result.destroy;
    });
    flushSync();

    // Simulate a partial drag to set inline styles on the base.
    parent.style.transform = "translateY(40px)";
    parent.style.transition = "transform 0.3s";

    // Toggle opened to false.
    opened = false;
    flushSync();

    expect(parent.style.transform).toBe("");
    expect(parent.style.transition).toBe("");

    destroyAction?.();
    teardown();
  });

  // -----------------------------------------------------------------------
  // Clamping: direction=1 clamps offset to >= 0
  // -----------------------------------------------------------------------

  it("clamps drag offset to non-negative for direction=1", () => {
    const { config, node, base } = setup({ direction: 1 });

    fireTouchEvent(config.handleEl!, "touchstart", [fakeTouch(0, 200)]);
    vi.advanceTimersByTime(10);
    // Move down to commit, then move up so dragDelta goes negative.
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 204)]);
    // Now move up past the commit start point (dragDelta becomes negative).
    vi.advanceTimersByTime(100);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 190)]);

    // Transform should clamp to 0, not go negative.
    expect(base.style.transform).toBe("translateY(0px)");

    fireTouchEvent(node, "touchend");
  });

  // -----------------------------------------------------------------------
  // Clamping: direction=-1 clamps offset to <= 0
  // -----------------------------------------------------------------------

  it("clamps drag offset to non-positive for direction=-1 on x-axis", () => {
    const { config, node, base } = setup({ axis: "x", direction: -1 });

    fireTouchEvent(config.handleEl!, "touchstart", [fakeTouch(200, 0)]);
    vi.advanceTimersByTime(10);
    // Commit: move left.
    fireTouchEvent(node, "touchmove", [fakeTouch(196, 0)]);
    // Move right past the commit start (dragDelta becomes positive).
    vi.advanceTimersByTime(100);
    fireTouchEvent(node, "touchmove", [fakeTouch(210, 0)]);

    // Transform should clamp to 0.
    expect(base.style.transform).toBe("translateX(0px)");

    fireTouchEvent(node, "touchend");
  });

  // -----------------------------------------------------------------------
  // translate uses correct axis
  // -----------------------------------------------------------------------

  it("applies translateX when axis is x", () => {
    const { config, node, base } = setup({ axis: "x", direction: 1 });

    fireTouchEvent(config.handleEl!, "touchstart", [fakeTouch(100, 0)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(node, "touchmove", [fakeTouch(104, 0)]);
    vi.advanceTimersByTime(100);
    fireTouchEvent(node, "touchmove", [fakeTouch(150, 0)]);

    expect(base.style.transform).toContain("translateX(");

    fireTouchEvent(node, "touchend");
  });

  it("applies translateY when axis is y", () => {
    const { config, node, base } = setup({ axis: "y", direction: 1 });

    fireTouchEvent(config.handleEl!, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 104)]);
    vi.advanceTimersByTime(100);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 150)]);

    expect(base.style.transform).toContain("translateY(");

    fireTouchEvent(node, "touchend");
  });

  // -----------------------------------------------------------------------
  // Spring-back adds transition on non-dismiss
  // -----------------------------------------------------------------------

  it("applies spring-back transition and clears it on transitionend", () => {
    const { config, node, base } = setup();

    fireTouchEvent(config.handleEl!, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 104)]);
    // Small drag, slow velocity, not enough to dismiss.
    vi.advanceTimersByTime(500);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 130)]);
    fireTouchEvent(node, "touchend");

    expect(config.ondismiss).not.toHaveBeenCalled();
    expect(base.style.transition).toBe("transform 0.3s ease-out");
    expect(base.style.transform).toBe("");

    // Fire transitionend to clear the transition style.
    base.dispatchEvent(new Event("transitionend"));
    expect(base.style.transition).toBe("");
  });

  // -----------------------------------------------------------------------
  // handleEl undefined (target is not HTMLElement)
  // -----------------------------------------------------------------------

  it("sets fromHandle to false when handleEl is undefined", () => {
    const { config, node } = setup({ handleEl: undefined });

    fireTouchEvent(node, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(100);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 250)]);
    fireTouchEvent(node, "touchend");

    // fromHandle is false, so commit never happens.
    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Prevent default on committed touchmove
  // -----------------------------------------------------------------------

  it("calls preventDefault on touchmove after commit", () => {
    const { config, node } = setup();

    fireTouchEvent(config.handleEl!, "touchstart", [fakeTouch(0, 100)]);
    vi.advanceTimersByTime(10);
    fireTouchEvent(node, "touchmove", [fakeTouch(0, 104)]);

    // Next move is post-commit.
    vi.advanceTimersByTime(100);
    const moveEvent = new TouchEvent("touchmove", {
      touches: [fakeTouch(0, 150)],
      cancelable: true,
      bubbles: true,
    });
    const pdSpy = vi.spyOn(moveEvent, "preventDefault");
    node.dispatchEvent(moveEvent);

    expect(pdSpy).toHaveBeenCalledOnce();
    pdSpy.mockRestore();

    fireTouchEvent(node, "touchend");
  });
});
