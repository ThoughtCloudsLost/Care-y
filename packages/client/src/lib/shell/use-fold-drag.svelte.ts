/**
 * Two-state drag gesture for fold/expand toggles.
 *
 * Finger-tracked vertical drag on a handle element with threshold + snap.
 * Drag down when expanded folds; drag up when folded expands. Matches the
 * feel of ShellSheet/panel gestures (same constants) but transforms the
 * action node itself rather than a parent overlay.
 *
 * Touch-only: desktop mice do not fire touch events, so drag is naturally
 * inert on desktop without an explicit guard.
 *
 * Must be called during component initialization (top-level script).
 */

const SNAP_THRESHOLD_PX = 80;
const VELOCITY_SNAP_PX_MS = 0.4;
const COMMIT_DELTA_PX = 3;
const MAX_DRAG_PX = 120;

/**
 * Pure snap-decision function. Returns true when the gesture should
 * toggle fold state. Exported for unit testing.
 */
export function decideFoldSnap(
  absOffset: number,
  velocity: number,
  swipingBack: boolean,
): boolean {
  return (
    !swipingBack &&
    (absOffset > SNAP_THRESHOLD_PX || velocity > VELOCITY_SNAP_PX_MS)
  );
}

export interface FoldDragConfig {
  /** Current fold state (reactive getter). */
  readonly folded: boolean;
  /** Called when drag commits a state change. */
  readonly onsnap: (shouldFold: boolean) => void;
}

export interface FoldDragReturn {
  /** Svelte action to attach to the handle element. */
  readonly action: (node: HTMLElement) => { destroy: () => void };
  /**
   * Call from onclick to check whether a committed drag already consumed
   * the interaction. Returns true (and resets) once per committed drag.
   */
  readonly consumeClick: () => boolean;
}

export function useFoldDrag(config: FoldDragConfig): FoldDragReturn {
  let startY = 0;
  let startTime = 0;
  let committed = false;
  let currentOffset = 0;
  let prevTouchY = 0;
  let currentTouchY = 0;
  let dragConsumed = false;

  function onTouchStart(e: TouchEvent, node: HTMLElement): void {
    const touch = e.touches[0];
    if (e.touches.length !== 1 || touch == null) return;

    startY = touch.clientY;
    startTime = Date.now();
    committed = false;
    currentOffset = 0;

    node.style.transition = "none";
  }

  function onTouchMove(e: TouchEvent, node: HTMLElement): void {
    const touch = e.touches[0];
    if (e.touches.length !== 1 || touch == null) return;

    const current = touch.clientY;
    const rawDelta = current - startY;

    // Only allow dragging in the toggle direction.
    // Expanded: drag down (positive) to fold.
    // Folded: drag up (negative) to expand.
    const allowedSign = config.folded ? -1 : 1;

    if (!committed) {
      if (rawDelta * allowedSign < COMMIT_DELTA_PX) return;

      committed = true;
      startY = current;
      startTime = Date.now();
    }

    prevTouchY = currentTouchY;
    currentTouchY = current;

    const dragDelta = current - startY;

    if (allowedSign === 1) {
      currentOffset = Math.min(MAX_DRAG_PX, Math.max(0, dragDelta));
    } else {
      currentOffset = Math.max(-MAX_DRAG_PX, Math.min(0, dragDelta));
    }

    node.style.transform = `translateY(${String(currentOffset)}px)`;
    e.preventDefault();
  }

  function onTouchEnd(node: HTMLElement, reducedMotion: boolean): void {
    if (!committed) {
      node.style.transition = "";
      return;
    }

    const elapsed = Math.max(1, Date.now() - startTime);
    const absOffset = Math.abs(currentOffset);
    const velocity = absOffset / elapsed;

    // Swiping back = finger reversed direction.
    const swipingBack = config.folded
      ? currentTouchY > prevTouchY
      : currentTouchY < prevTouchY;

    const shouldToggle = decideFoldSnap(absOffset, velocity, swipingBack);

    if (shouldToggle) {
      dragConsumed = true;
      config.onsnap(!config.folded);
    }

    // Snap handle back to origin.
    if (reducedMotion) {
      node.style.transform = "";
      node.style.transition = "";
    } else {
      node.style.transition = "transform 0.2s ease-out";
      node.style.transform = "";
      node.addEventListener(
        "transitionend",
        () => {
          node.style.transition = "";
        },
        { once: true },
      );
    }

    committed = false;
    currentOffset = 0;
  }

  function action(node: HTMLElement): { destroy: () => void } {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    const boundStart = (e: TouchEvent): void => onTouchStart(e, node);
    const boundMove = (e: TouchEvent): void => onTouchMove(e, node);
    const boundEnd = (): void => onTouchEnd(node, mql.matches);
    const boundCancel = boundEnd;

    node.addEventListener("touchstart", boundStart, { passive: true });
    node.addEventListener("touchmove", boundMove, { passive: false });
    node.addEventListener("touchend", boundEnd);
    node.addEventListener("touchcancel", boundCancel);

    return {
      destroy(): void {
        node.removeEventListener("touchstart", boundStart);
        node.removeEventListener("touchmove", boundMove);
        node.removeEventListener("touchend", boundEnd);
        node.removeEventListener("touchcancel", boundCancel);
        node.style.transition = "";
        node.style.transform = "";
      },
    };
  }

  function consumeClick(): boolean {
    if (dragConsumed) {
      dragConsumed = false;
      return true;
    }
    return false;
  }

  return { action, consumeClick };
}
