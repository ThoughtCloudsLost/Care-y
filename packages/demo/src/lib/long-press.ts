/**
 * Long-press gesture primitive with progress feedback.
 *
 * Cancellation is by movement threshold (not pointerleave). Leaving the
 * element by a few pixels while holding is normal on iOS; pointerleave
 * cancellation made an earlier prototype only fire near the target center.
 *
 * After the hold fires, the same pointer stream stays active. The consumer
 * receives drag deltas and a secondary-tap signal, both of which can
 * commit the peek. Release or cancel ends the gesture.
 *
 * Consumer responsibilities:
 *   - Set `touch-action: none` on the target element.
 *   - Set `-webkit-touch-callout: none; user-select: none` on the target.
 *   - Mount a HoldRing with the progress value for visual feedback.
 */

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

/** How long the user must hold before the press fires (ms). */
export const HOLD_DURATION_MS = 400;

/**
 * Movement radius (px) that cancels a hold in progress. Generous enough
 * for finger tremor on a phone held single-handed.
 */
export const MOVE_THRESHOLD_PX = 12;

// -----------------------------------------------------------------------
// Haptic seam
//
// navigator.vibrate is unsupported on every iOS version. The checkbox
// toggle trick was tested across thirteen variations and produced nothing.
// Keep this no-op so a future Vibration API is a one-line change.
// -----------------------------------------------------------------------

/** No-op today. Swap the body when a vibration API lands on iOS. */
export function haptic(): void {
  // intentionally empty
}

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

/** Gesture phase reported to the consumer. */
export type LongPressPhase = "idle" | "holding" | "held" | "cancelled";

export interface LongPressCallbacks {
  /** Hold completed: the press fired. */
  onFire: () => void;
  /** Progress update during the hold, 0..1. */
  onProgress?: (t: number) => void;
  /** Primary pointer moved after fire. dy < 0 = upward screen motion. */
  onDrag?: (dx: number, dy: number) => void;
  /** A second pointer tapped while the primary was held. */
  onSecondaryTap?: () => void;
  /** Primary pointer released after fire. */
  onRelease?: () => void;
  /** Gesture cancelled (movement during hold, or pointercancel). */
  onCancel?: () => void;
}

export interface LongPressState {
  readonly phase: LongPressPhase;
  /** Hold progress, 0..1 (only meaningful during "holding"). */
  readonly progress: number;
}

export interface LongPressController {
  /** Current gesture state. */
  readonly state: LongPressState;
  /** Attach to the target element. Call destroy() on teardown. */
  attach(el: HTMLElement): LongPressCleanup;
}

export interface LongPressCleanup {
  destroy(): void;
}

// -----------------------------------------------------------------------
// Pure helpers (exported for testing)
// -----------------------------------------------------------------------

/** Squared distance between two points. Avoids sqrt for threshold checks. */
export function distSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

// -----------------------------------------------------------------------
// Factory
// -----------------------------------------------------------------------

export function createLongPress(
  callbacks: LongPressCallbacks,
): LongPressController {
  let phase: LongPressPhase = "idle";
  let progress = 0;

  // Primary pointer tracking
  let primaryId: number | null = null;
  let startX = 0;
  let startY = 0;
  let holdStart = 0;
  let holdTimer: ReturnType<typeof setTimeout> | null = null;
  let progressRaf = 0;

  function resetState(): void {
    if (holdTimer !== null) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    if (progressRaf !== 0) {
      cancelAnimationFrame(progressRaf);
      progressRaf = 0;
    }
    primaryId = null;
    phase = "idle";
    progress = 0;
  }

  // Progress animation loop during the hold phase
  function tickProgress(): void {
    if (phase !== "holding") return;
    const elapsed = Date.now() - holdStart;
    progress = Math.min(1, elapsed / HOLD_DURATION_MS);
    callbacks.onProgress?.(progress);
    if (progress < 1) {
      progressRaf = requestAnimationFrame(tickProgress);
    }
  }

  function onPointerDown(e: PointerEvent): void {
    // A secondary pointer while the primary is held fires the tap signal.
    if (primaryId !== null && phase === "held") {
      callbacks.onSecondaryTap?.();
      return;
    }

    // Only accept the primary pointer for the initial hold.
    if (!e.isPrimary) return;
    if (primaryId !== null) return;
    if (e.button !== 0) return;

    // Suppress text selection and context menu on iOS. Without this,
    // iOS starts its own selection gesture during the hold.
    e.preventDefault();

    const target = e.currentTarget;
    if (target instanceof HTMLElement) {
      // Capture the pointer so the stream continues when the finger
      // drifts past the element boundary.
      if (typeof target.setPointerCapture === "function") {
        target.setPointerCapture(e.pointerId);
      }
    }

    primaryId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    holdStart = Date.now();
    phase = "holding";
    progress = 0;

    callbacks.onProgress?.(0);

    // Start the progress animation loop
    progressRaf = requestAnimationFrame(tickProgress);

    // Schedule the fire
    holdTimer = setTimeout(() => {
      holdTimer = null;
      if (phase !== "holding") return;
      phase = "held";
      progress = 1;
      callbacks.onProgress?.(1);
      haptic();
      callbacks.onFire();
    }, HOLD_DURATION_MS);
  }

  function onPointerMove(e: PointerEvent): void {
    if (e.pointerId !== primaryId) return;

    if (phase === "holding") {
      // Cancel if the pointer moves past the threshold.
      const d2 = distSq(startX, startY, e.clientX, e.clientY);
      if (d2 > MOVE_THRESHOLD_PX * MOVE_THRESHOLD_PX) {
        phase = "cancelled";
        progress = 0;
        if (holdTimer !== null) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
        if (progressRaf !== 0) {
          cancelAnimationFrame(progressRaf);
          progressRaf = 0;
        }
        callbacks.onCancel?.();
        resetState();
      }
      return;
    }

    if (phase === "held") {
      // Route drag deltas to the consumer after the hold fires.
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      callbacks.onDrag?.(dx, dy);
    }
  }

  function onPointerUp(e: PointerEvent): void {
    if (e.pointerId !== primaryId) return;

    if (phase === "holding") {
      // Released before the hold completed: cancel.
      callbacks.onCancel?.();
      resetState();
      return;
    }

    if (phase === "held") {
      callbacks.onRelease?.();
      resetState();
      return;
    }

    resetState();
  }

  function onPointerCancel(e: PointerEvent): void {
    if (e.pointerId !== primaryId) return;
    callbacks.onCancel?.();
    resetState();
  }

  function onContextMenu(e: Event): void {
    // Suppress the iOS callout bubble during long press.
    e.preventDefault();
  }

  function attach(el: HTMLElement): LongPressCleanup {
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerCancel);
    el.addEventListener("contextmenu", onContextMenu);

    return {
      destroy(): void {
        el.removeEventListener("pointerdown", onPointerDown);
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("pointerup", onPointerUp);
        el.removeEventListener("pointercancel", onPointerCancel);
        el.removeEventListener("contextmenu", onContextMenu);
        resetState();
      },
    };
  }

  return {
    get state(): LongPressState {
      return { phase, progress };
    },
    attach,
  };
}
