/**
 * Page-side navigation guard for dirty simulator state.
 *
 * Wraps the pure dirtyGuardDecision function with module-level rune
 * state that tracks the last suppression timestamp. The scroll engine
 * calls guardNavigation before every handbook-originated navigation;
 * on "suppress", the timestamp is recorded so a second tap within the
 * override window passes through.
 *
 * The suppressed flag is reactive so the App chrome can read it and
 * show the "unsaved input" notice.
 */

import {
  dirtyGuardDecision,
  type DirtyGuardDecision,
} from "./scroll-intent-guard.js";

// -----------------------------------------------------------------------
// State
// -----------------------------------------------------------------------

let lastSuppressedAt = $state(0);
let suppressed = $state(false);

/**
 * Timer handle for the auto-clear of the suppressed flag. The notice
 * disappears after the override window expires so the reader is not
 * left with a stale warning.
 */
let clearTimer: ReturnType<typeof setTimeout> | undefined;

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------

/**
 * Evaluate whether navigation should proceed given the phone's dirty
 * state. On "suppress", records the timestamp and sets the suppressed
 * flag. On "navigate", resets both.
 */
export function guardNavigation(
  dirty: boolean,
  now: number = Date.now(),
): DirtyGuardDecision {
  const decision = dirtyGuardDecision(dirty, lastSuppressedAt, now);
  if (decision === "suppress") {
    lastSuppressedAt = now;
    suppressed = true;
    clearTimeout(clearTimer);
    // Auto-clear the suppressed flag after the override window so the
    // chrome notice does not outlive the window.
    clearTimer = setTimeout(() => {
      suppressed = false;
    }, 4000);
    return "suppress";
  }
  // Navigate: reset everything.
  lastSuppressedAt = 0;
  suppressed = false;
  clearTimeout(clearTimer);
  return "navigate";
}

/** Whether the guard just suppressed a navigation (reactive). */
export function isNavSuppressed(): boolean {
  return suppressed;
}

/** Full reset on demo restart. */
export function resetNavGuard(): void {
  lastSuppressedAt = 0;
  suppressed = false;
  clearTimeout(clearTimer);
}
