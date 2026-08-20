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

/** Dispatch a synthetic PointerEvent on `target`. */
function firePointerEvent(
  target: HTMLElement,
  type: "pointerdown" | "pointermove" | "pointerup" | "pointercancel",
  init?: Partial<PointerEventInit>,
): PointerEvent {
  const ev = new PointerEvent(type, {
    pointerId: 1,
    isPrimary: true,
    clientX: 0,
    clientY: 0,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(ev);
  return ev;
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

  it("attaches pointer listeners on the node", () => {
    const addSpy = vi.spyOn(HTMLElement.prototype, "addEventListener");
    setup();

    const calls = addSpy.mock.calls.map(([type]) => type);
    expect(calls).toContain("pointerdown");
    expect(calls).toContain("pointermove");
    expect(calls).toContain("pointerup");
    expect(calls).toContain("pointercancel");
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

    // Start on the handle at y=100.
    firePointerEvent(handle, "pointerdown", { clientY: 100 });
    // Move down 4px to commit (past COMMIT_DELTA_PX = 3).
    vi.advanceTimersByTime(10);
    firePointerEvent(node, "pointermove", { clientY: 104 });
    // Move down total ~50px from commit point (below 80px threshold).
    vi.advanceTimersByTime(500);
    firePointerEvent(node, "pointermove", { clientY: 154 });
    firePointerEvent(node, "pointerup");

    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Drag above threshold (dismiss fires)
  // -----------------------------------------------------------------------

  it("dismisses when drag distance exceeds 80px threshold", () => {
    const { config, node } = setup();
    const handle = config.handleEl!;

    firePointerEvent(handle, "pointerdown", { clientY: 100 });
    // Commit.
    vi.advanceTimersByTime(10);
    firePointerEvent(node, "pointermove", { clientY: 104 });
    // Drag well past 80px (no swiping back: each move is further down).
    vi.advanceTimersByTime(400);
    firePointerEvent(node, "pointermove", { clientY: 180 });
    firePointerEvent(node, "pointermove", { clientY: 210 });
    firePointerEvent(node, "pointerup");

    expect(config.ondismiss).toHaveBeenCalledOnce();
  });

  // -----------------------------------------------------------------------
  // Wrong direction blocked
  // -----------------------------------------------------------------------

  it("ignores drag in the negative direction when direction is 1", () => {
    const { config, node } = setup({ direction: 1 });

    firePointerEvent(config.handleEl!, "pointerdown", { clientY: 200 });
    // Move upward (negative delta, wrong direction). Delta = -100.
    vi.advanceTimersByTime(100);
    firePointerEvent(node, "pointermove", { clientY: 100 });
    firePointerEvent(node, "pointerup");

    // Never committed, so no dismiss.
    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  it("ignores drag in the positive direction when direction is -1", () => {
    const { config, node } = setup({ direction: -1, axis: "x" });

    firePointerEvent(config.handleEl!, "pointerdown", { clientX: 200 });
    // Move right (positive delta). For direction=-1, commit requires
    // delta * direction >= COMMIT_DELTA_PX, i.e. negative delta needed.
    vi.advanceTimersByTime(100);
    firePointerEvent(node, "pointermove", { clientX: 300 });
    firePointerEvent(node, "pointerup");

    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Velocity-based dismiss (fast flick below distance threshold)
  // -----------------------------------------------------------------------

  it("dismisses on fast flick even when distance is below 80px threshold", () => {
    const { config, node } = setup();

    firePointerEvent(config.handleEl!, "pointerdown", { clientY: 100 });
    // Commit.
    vi.advanceTimersByTime(1);
    firePointerEvent(node, "pointermove", { clientY: 104 });
    // Fast move: 40px in ~5ms. velocity = 40/6 ~= 6.67 px/ms > 0.4.
    vi.advanceTimersByTime(5);
    firePointerEvent(node, "pointermove", { clientY: 144 });
    firePointerEvent(node, "pointerup");

    expect(config.ondismiss).toHaveBeenCalledOnce();
  });

  // -----------------------------------------------------------------------
  // Cancel mid-drag
  // -----------------------------------------------------------------------

  it("springs back on pointercancel without dismissing", () => {
    const { config, node, base } = setup();

    firePointerEvent(config.handleEl!, "pointerdown", { clientY: 100 });
    vi.advanceTimersByTime(10);
    firePointerEvent(node, "pointermove", { clientY: 104 });
    // 46px over 200ms keeps velocity at 0.23, under the 0.4 dismiss cutoff.
    vi.advanceTimersByTime(200);
    firePointerEvent(node, "pointermove", { clientY: 150 });

    // Cancel instead of end.
    firePointerEvent(node, "pointercancel");

    // pointercancel routes through the same end handler.
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

    firePointerEvent(config.handleEl!, "pointerdown", { clientX: 300 });
    // Commit: delta (300 - 296) * -1 = 4 > 3.
    vi.advanceTimersByTime(10);
    firePointerEvent(node, "pointermove", { clientX: 296 });
    // Drag left past 80px threshold.
    vi.advanceTimersByTime(300);
    firePointerEvent(node, "pointermove", { clientX: 210 });
    firePointerEvent(node, "pointermove", { clientX: 200 });
    firePointerEvent(node, "pointerup");

    expect(config.ondismiss).toHaveBeenCalledOnce();
  });

  // -----------------------------------------------------------------------
  // Swiping back negates dismiss despite passing threshold
  // -----------------------------------------------------------------------

  it("does not dismiss when user reverses drag direction (swiping back)", () => {
    const { config, node } = setup();

    firePointerEvent(config.handleEl!, "pointerdown", { clientY: 100 });
    vi.advanceTimersByTime(10);
    firePointerEvent(node, "pointermove", { clientY: 104 });
    // Drag past threshold.
    vi.advanceTimersByTime(400);
    firePointerEvent(node, "pointermove", { clientY: 250 });
    // Swipe back: final position is less than the previous.
    firePointerEvent(node, "pointermove", { clientY: 200 });
    firePointerEvent(node, "pointerup");

    // swipingBack is true because currentPointerPos < prevPointerPos.
    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Opened=false guard
  // -----------------------------------------------------------------------

  it("ignores pointer events when overlay is not opened", () => {
    const { config, node } = setup({ opened: false });

    firePointerEvent(config.handleEl!, "pointerdown", { clientY: 100 });
    firePointerEvent(node, "pointermove", { clientY: 200 });
    firePointerEvent(node, "pointerup");

    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Non-primary pointer ignored (replaces multi-touch test)
  // -----------------------------------------------------------------------

  it("ignores non-primary pointers", () => {
    const { config, node } = setup();

    firePointerEvent(config.handleEl!, "pointerdown", {
      clientY: 100,
      isPrimary: false,
      pointerId: 2,
    });
    firePointerEvent(node, "pointermove", { clientY: 200, pointerId: 2 });
    firePointerEvent(node, "pointerup", { pointerId: 2 });

    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Second pointer while first is active is ignored
  // -----------------------------------------------------------------------

  it("ignores a second pointerdown while a pointer is already active", () => {
    const { config, node } = setup();

    // First pointer starts on handle.
    firePointerEvent(config.handleEl!, "pointerdown", {
      clientY: 100,
      pointerId: 1,
    });
    // Second pointer arrives (different id), should be ignored.
    firePointerEvent(config.handleEl!, "pointerdown", {
      clientY: 300,
      pointerId: 2,
    });

    vi.advanceTimersByTime(10);
    // Move with the second pointer id: should be ignored.
    firePointerEvent(node, "pointermove", { clientY: 500, pointerId: 2 });
    firePointerEvent(node, "pointerup", { pointerId: 2 });

    // First pointer never moved past commit, so no dismiss.
    firePointerEvent(node, "pointerup", { pointerId: 1 });
    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Non-handle start does not commit drag
  // -----------------------------------------------------------------------

  it("does not commit drag when pointer starts outside the handle", () => {
    const { config, node } = setup();

    // pointerdown fires on the node itself, not the handle.
    const startEvent = new PointerEvent("pointerdown", {
      pointerId: 1,
      isPrimary: true,
      clientX: 0,
      clientY: 100,
      cancelable: true,
      bubbles: true,
    });
    Object.defineProperty(startEvent, "target", { value: node });
    node.dispatchEvent(startEvent);

    vi.advanceTimersByTime(100);
    firePointerEvent(node, "pointermove", { clientY: 300 });
    firePointerEvent(node, "pointerup");

    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Non-committed pointerup resets transition
  // -----------------------------------------------------------------------

  it("resets transition on pointerup when drag was never committed", () => {
    const { node, base } = setup();

    firePointerEvent(node, "pointerdown", { clientY: 100 });
    // No pointermove, so not committed.
    firePointerEvent(node, "pointerup");

    expect(base.style.transition).toBe("");
  });

  // -----------------------------------------------------------------------
  // parentDepth=2
  // -----------------------------------------------------------------------

  it("uses grandparent as base when parentDepth is 2", () => {
    const { config, node, base } = setup({ parentDepth: 2 });

    firePointerEvent(config.handleEl!, "pointerdown", { clientY: 100 });
    vi.advanceTimersByTime(10);
    firePointerEvent(node, "pointermove", { clientY: 104 });
    vi.advanceTimersByTime(300);
    firePointerEvent(node, "pointermove", { clientY: 210 });

    // The drag transform lands on the grandparent, not the direct parent.
    expect(base.style.transform).toContain("translateY(");

    firePointerEvent(node, "pointermove", { clientY: 220 });
    firePointerEvent(node, "pointerup");

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

    firePointerEvent(config.handleEl!, "pointerdown", { clientY: 200 });
    vi.advanceTimersByTime(10);
    // Move down to commit, then move up so dragDelta goes negative.
    firePointerEvent(node, "pointermove", { clientY: 204 });
    // Now move up past the commit start point (dragDelta becomes negative).
    vi.advanceTimersByTime(100);
    firePointerEvent(node, "pointermove", { clientY: 190 });

    // Transform should clamp to 0, not go negative.
    expect(base.style.transform).toBe("translateY(0px)");

    firePointerEvent(node, "pointerup");
  });

  // -----------------------------------------------------------------------
  // Clamping: direction=-1 clamps offset to <= 0
  // -----------------------------------------------------------------------

  it("clamps drag offset to non-positive for direction=-1 on x-axis", () => {
    const { config, node, base } = setup({ axis: "x", direction: -1 });

    firePointerEvent(config.handleEl!, "pointerdown", { clientX: 200 });
    vi.advanceTimersByTime(10);
    // Commit: move left.
    firePointerEvent(node, "pointermove", { clientX: 196 });
    // Move right past the commit start (dragDelta becomes positive).
    vi.advanceTimersByTime(100);
    firePointerEvent(node, "pointermove", { clientX: 210 });

    // Transform should clamp to 0.
    expect(base.style.transform).toBe("translateX(0px)");

    firePointerEvent(node, "pointerup");
  });

  // -----------------------------------------------------------------------
  // translate uses correct axis
  // -----------------------------------------------------------------------

  it("applies translateX when axis is x", () => {
    const { config, node, base } = setup({ axis: "x", direction: 1 });

    firePointerEvent(config.handleEl!, "pointerdown", { clientX: 100 });
    vi.advanceTimersByTime(10);
    firePointerEvent(node, "pointermove", { clientX: 104 });
    vi.advanceTimersByTime(100);
    firePointerEvent(node, "pointermove", { clientX: 150 });

    expect(base.style.transform).toContain("translateX(");

    firePointerEvent(node, "pointerup");
  });

  it("applies translateY when axis is y", () => {
    const { config, node, base } = setup({ axis: "y", direction: 1 });

    firePointerEvent(config.handleEl!, "pointerdown", { clientY: 100 });
    vi.advanceTimersByTime(10);
    firePointerEvent(node, "pointermove", { clientY: 104 });
    vi.advanceTimersByTime(100);
    firePointerEvent(node, "pointermove", { clientY: 150 });

    expect(base.style.transform).toContain("translateY(");

    firePointerEvent(node, "pointerup");
  });

  // -----------------------------------------------------------------------
  // Spring-back adds transition on non-dismiss
  // -----------------------------------------------------------------------

  it("applies spring-back transition and clears it on transitionend", () => {
    const { config, node, base } = setup();

    firePointerEvent(config.handleEl!, "pointerdown", { clientY: 100 });
    vi.advanceTimersByTime(10);
    firePointerEvent(node, "pointermove", { clientY: 104 });
    // Small drag, slow velocity, not enough to dismiss.
    vi.advanceTimersByTime(500);
    firePointerEvent(node, "pointermove", { clientY: 130 });
    firePointerEvent(node, "pointerup");

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

    firePointerEvent(node, "pointerdown", { clientY: 100 });
    vi.advanceTimersByTime(100);
    firePointerEvent(node, "pointermove", { clientY: 250 });
    firePointerEvent(node, "pointerup");

    // fromHandle is false, so commit never happens.
    expect(config.ondismiss).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // preventDefault on handle pointerdown suppresses compat mouse events
  // -----------------------------------------------------------------------

  it("calls preventDefault on pointerdown when it starts on the handle", () => {
    const { config } = setup();
    const handle = config.handleEl!;

    const ev = firePointerEvent(handle, "pointerdown", { clientY: 100 });

    expect(ev.defaultPrevented).toBe(true);
  });

  it("does not call preventDefault on pointerdown outside the handle", () => {
    const { node } = setup();

    const ev = firePointerEvent(node, "pointerdown", { clientY: 100 });

    expect(ev.defaultPrevented).toBe(false);
  });

  // -----------------------------------------------------------------------
  // Mouse pointer (pointerType "mouse") commits and dismisses
  // -----------------------------------------------------------------------

  it("commits and dismisses with a mouse-primary pointer", () => {
    const { config, node } = setup();
    const handle = config.handleEl!;

    firePointerEvent(handle, "pointerdown", {
      clientY: 100,
      pointerType: "mouse",
    });
    vi.advanceTimersByTime(10);
    firePointerEvent(node, "pointermove", {
      clientY: 104,
      pointerType: "mouse",
    });
    vi.advanceTimersByTime(300);
    firePointerEvent(node, "pointermove", {
      clientY: 210,
      pointerType: "mouse",
    });
    firePointerEvent(node, "pointermove", {
      clientY: 220,
      pointerType: "mouse",
    });
    firePointerEvent(node, "pointerup", {
      pointerType: "mouse",
    });

    expect(config.ondismiss).toHaveBeenCalledOnce();
  });
});
