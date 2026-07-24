/**
 * Two-state drag gesture for fold/expand toggles.
 *
 * Finger-tracked vertical drag on a handle element that progressively
 * reveals or hides a content area by controlling its visible height.
 * Drag down when folded reveals the content; drag up when expanded
 * hides it. The finger position maps 1:1 to the content height, so the
 * panel slides open or closed directly under the user's finger.
 *
 * The action attaches to the handle element. The caller passes a
 * reference to the content wrapper (wrapEl) whose first child element's
 * maxHeight is controlled during the drag. The wrapper's CSS
 * grid-template-rows is temporarily overridden to allow height control.
 *
 * Touch-only: desktop mice do not fire touch events, so drag is naturally
 * inert on desktop without an explicit guard.
 *
 * Must be called during component initialization (top-level script).
 */

import { setChromeIntensity } from "./chrome-glass.svelte.js";

const SNAP_THRESHOLD_PX = 80;
const VELOCITY_SNAP_PX_MS = 0.4;
const COMMIT_DELTA_PX = 3;

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
  /** The grid wrapper element whose first child's maxHeight is controlled. */
  readonly wrapEl?: HTMLElement;
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
  let naturalHeight = 0;

  let wrapRef: HTMLElement | null = null;
  let contentRef: HTMLElement | null = null;

  function onTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    if (e.touches.length !== 1 || touch == null) return;

    wrapRef = config.wrapEl ?? null;
    if (wrapRef == null) return;
    const first = wrapRef.firstElementChild;
    contentRef = first instanceof HTMLElement ? first : null;
    if (contentRef == null) return;

    naturalHeight = contentRef.scrollHeight;
    if (naturalHeight <= 0) naturalHeight = 200;

    startY = touch.clientY;
    startTime = Date.now();
    committed = false;
    currentOffset = 0;
  }

  function onTouchMove(e: TouchEvent): void {
    const touch = e.touches[0];
    if (e.touches.length !== 1 || touch == null) return;
    if (wrapRef == null || contentRef == null) return;

    const current = touch.clientY;
    const rawDelta = current - startY;

    // Folded: drag DOWN (positive delta) to reveal.
    // Expanded: drag UP (negative delta) to hide.
    const allowedSign = config.folded ? 1 : -1;

    if (!committed) {
      if (rawDelta * allowedSign < COMMIT_DELTA_PX) return;

      committed = true;
      startY = current;
      startTime = Date.now();

      // Take over layout from CSS: override grid, disable transitions.
      wrapRef.style.transition = "none";
      wrapRef.style.gridTemplateRows = "1fr";
      contentRef.style.transition = "none";
      contentRef.style.maxHeight =
        String(config.folded ? 0 : naturalHeight) + "px";
    }

    prevTouchY = currentTouchY;
    currentTouchY = current;

    const dragDelta = current - startY;

    let targetHeight: number;
    if (config.folded) {
      targetHeight = Math.min(naturalHeight, Math.max(0, dragDelta));
    } else {
      targetHeight = Math.min(
        naturalHeight,
        Math.max(0, naturalHeight + dragDelta),
      );
    }

    // Track absolute displacement from the starting edge for snap decision.
    currentOffset = config.folded ? targetHeight : naturalHeight - targetHeight;

    contentRef.style.maxHeight = String(targetHeight) + "px";

    const fraction = targetHeight / naturalHeight;

    setChromeIntensity(fraction);

    wrapRef.style.marginTop = String(Math.round(fraction * 10)) + "px";
    wrapRef.style.borderTopColor = targetHeight > 0 ? "" : "transparent";

    e.preventDefault();
  }

  function onTouchEnd(reducedMotion: boolean): void {
    if (!committed || wrapRef == null || contentRef == null) {
      resetInlineStyles();
      return;
    }

    const elapsed = Math.max(1, Date.now() - startTime);
    const velocity = currentOffset / elapsed;

    // Swiping back = finger reversed from the primary drag direction.
    const swipingBack = config.folded
      ? currentTouchY < prevTouchY
      : currentTouchY > prevTouchY;

    const shouldToggle = decideFoldSnap(currentOffset, velocity, swipingBack);

    // Compute target height before onsnap changes reactive state.
    const targetHeight = shouldToggle
      ? config.folded
        ? naturalHeight
        : 0
      : config.folded
        ? 0
        : naturalHeight;

    if (shouldToggle) {
      dragConsumed = true;
      config.onsnap(!config.folded);
    }

    if (reducedMotion) {
      resetInlineStyles();
    } else {
      // Animate margin alongside content height.
      const targetMargin = targetHeight > 0 ? 10 : 0;
      wrapRef.style.transition =
        "margin-top 0.2s ease-out, border-top-color 0.2s ease-out";
      wrapRef.style.marginTop = String(targetMargin) + "px";
      wrapRef.style.borderTopColor = targetHeight > 0 ? "" : "transparent";

      // Check if content is already at the target (no transition fires).
      const currentMax = parseFloat(contentRef.style.maxHeight || "0");
      if (Math.abs(currentMax - targetHeight) < 1) {
        resetInlineStyles();
      } else {
        contentRef.style.transition = "max-height 0.2s ease-out";
        contentRef.style.maxHeight = String(targetHeight) + "px";

        contentRef.addEventListener(
          "transitionend",
          () => {
            resetInlineStyles();
          },
          { once: true },
        );
      }
    }

    committed = false;
    currentOffset = 0;
  }

  function resetInlineStyles(): void {
    setChromeIntensity(null);
    if (wrapRef != null) {
      // Suppress CSS grid transition when switching from inline to class.
      // Transition stays disabled through Svelte's reactive class update
      // (microtask), then re-enables in the next rAF, after the class
      // change has been committed. Without this, the class flip triggers
      // the 300ms grid-template-rows transition and "replays" the drag.
      const w = wrapRef;
      w.style.transition = "none";
      w.style.gridTemplateRows = "";
      w.style.marginTop = "";
      w.style.borderTopColor = "";
      void w.offsetHeight;
      requestAnimationFrame(() => {
        w.style.transition = "";
      });
    }
    if (contentRef != null) {
      contentRef.style.transition = "";
      contentRef.style.maxHeight = "";
    }
    wrapRef = null;
    contentRef = null;
  }

  function action(node: HTMLElement): { destroy: () => void } {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    const boundStart = (e: TouchEvent): void => onTouchStart(e);
    const boundMove = (e: TouchEvent): void => onTouchMove(e);
    const boundEnd = (): void => onTouchEnd(mql.matches);
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
        resetInlineStyles();
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
