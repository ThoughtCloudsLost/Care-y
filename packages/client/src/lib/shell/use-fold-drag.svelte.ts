/**
 * Two-state drag gesture for fold/expand toggles.
 *
 * Pointer-tracked vertical drag on a handle element that progressively
 * reveals or hides a content area by controlling its visible height.
 * Drag down when folded reveals the content; drag up when expanded
 * hides it. The finger position maps 1:1 to the content height, so the
 * panel slides open or closed directly under the user's finger.
 *
 * Pointer Events are the single event model covering mouse, pen, and
 * touch input (MDN Pointer_events), so one listener set handles all
 * three. Scroll suppression for touch interactions is controlled by
 * the CSS property `touch-action: none` on the drag handle, not by
 * calling preventDefault on pointermove. The handle must carry that
 * declaration; without it, touch drags will scroll instead of dragging.
 *
 * The action attaches to the handle element. The caller passes a
 * reference to the content wrapper (wrapEl) whose first child element's
 * maxHeight is controlled during the drag. The wrapper's CSS
 * grid-template-rows is temporarily overridden to allow height control.
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
  let prevPointerY = 0;
  let currentPointerY = 0;
  let dragConsumed = false;
  let naturalHeight = 0;

  /** pointerId of the active drag, or null when idle. */
  let activePointerId: number | null = null;

  let wrapRef: HTMLElement | null = null;
  let contentRef: HTMLElement | null = null;

  function onPointerDown(e: PointerEvent): void {
    // Ignore secondary pointers (multi-touch, non-primary pen).
    if (!e.isPrimary || activePointerId != null) return;

    wrapRef = config.wrapEl ?? null;
    if (wrapRef == null) return;
    const first = wrapRef.firstElementChild;
    contentRef = first instanceof HTMLElement ? first : null;
    if (contentRef == null) return;

    // Canceling pointerdown on the handle suppresses the compatibility
    // mouse events that would otherwise start text selection.
    e.preventDefault();

    naturalHeight = contentRef.scrollHeight;
    if (naturalHeight <= 0) naturalHeight = 200;

    activePointerId = e.pointerId;
    startY = e.clientY;
    startTime = Date.now();
    committed = false;
    currentOffset = 0;
  }

  function onPointerMove(e: PointerEvent, node: HTMLElement): void {
    if (e.pointerId !== activePointerId) return;
    if (wrapRef == null || contentRef == null) return;

    const current = e.clientY;
    const rawDelta = current - startY;

    // Folded: drag DOWN (positive delta) to reveal.
    // Expanded: drag UP (negative delta) to hide.
    const allowedSign = config.folded ? 1 : -1;

    if (!committed) {
      if (rawDelta * allowedSign < COMMIT_DELTA_PX) return;

      committed = true;
      startY = current;
      startTime = Date.now();

      // Capture the pointer so moves continue even if the finger
      // leaves the node mid-drag. jsdom does not implement capture,
      // so guard with a feature check.
      if (typeof node.setPointerCapture === "function") {
        node.setPointerCapture(e.pointerId);
      }

      // Take over layout from CSS: override grid, disable transitions.
      wrapRef.style.transition = "none";
      wrapRef.style.gridTemplateRows = "1fr";
      contentRef.style.transition = "none";
      contentRef.style.maxHeight =
        String(config.folded ? 0 : naturalHeight) + "px";
    }

    prevPointerY = currentPointerY;
    currentPointerY = current;

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

    // No preventDefault on pointermove: scroll suppression is handled by
    // touch-action CSS on the handle, not by canceling the event.
  }

  function onPointerEnd(
    e: PointerEvent,
    node: HTMLElement,
    reducedMotion: boolean,
  ): void {
    if (e.pointerId !== activePointerId) return;

    activePointerId = null;

    // Release pointer capture if held. hasPointerCapture guards against
    // releasing an already-released capture (pointerup auto-releases).
    if (
      typeof node.hasPointerCapture === "function" &&
      node.hasPointerCapture(e.pointerId)
    ) {
      node.releasePointerCapture(e.pointerId);
    }

    if (!committed || wrapRef == null || contentRef == null) {
      resetInlineStyles();
      return;
    }

    const elapsed = Math.max(1, Date.now() - startTime);
    const velocity = currentOffset / elapsed;

    // Swiping back = finger reversed from the primary drag direction.
    const swipingBack = config.folded
      ? currentPointerY < prevPointerY
      : currentPointerY > prevPointerY;

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

    const boundDown = (e: PointerEvent): void => onPointerDown(e);
    const boundMove = (e: PointerEvent): void => onPointerMove(e, node);
    const boundEnd = (e: PointerEvent): void =>
      onPointerEnd(e, node, mql.matches);

    node.addEventListener("pointerdown", boundDown);
    node.addEventListener("pointermove", boundMove);
    node.addEventListener("pointerup", boundEnd);
    node.addEventListener("pointercancel", boundEnd);

    return {
      destroy(): void {
        node.removeEventListener("pointerdown", boundDown);
        node.removeEventListener("pointermove", boundMove);
        node.removeEventListener("pointerup", boundEnd);
        node.removeEventListener("pointercancel", boundEnd);
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
