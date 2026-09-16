/**
 * Reading-position chip state.
 *
 * Thin reactive store for the "Jump to ..." chip that appears when the
 * phone moves the story while the reader has a recent reading position.
 * The decision logic lives in readingChipDecision (scroll-intent-guard);
 * this module holds only the presentation state: what target to show,
 * whether following is suspended, and the actions the chip exposes.
 *
 * DEV-switchable: CHIP_RESUME_MODE controls the losing-branch trial.
 * After the browser call one branch is deleted and this becomes a const.
 */

import type { SectionId } from "./scroll-sections.js";

// -----------------------------------------------------------------------
// Resume mode flag
// -----------------------------------------------------------------------

/**
 * DEV-switchable trial flag. After the browser call, the losing branch
 * is deleted and this becomes a hardcoded const.
 *
 * - "dwell": after a dwell period with no further reader scrolling,
 *   following resumes automatically and the chip dismisses.
 * - "second-tap": chip tap jumps once but following stays off; the chip
 *   then offers a "resume following" state; tapping again re-enables.
 */
export const CHIP_RESUME_MODE: "dwell" | "second-tap" = "dwell";

// -----------------------------------------------------------------------
// Chip target
// -----------------------------------------------------------------------

export interface ChipTarget {
  readonly sectionId: SectionId;
  readonly subSlug: string;
}

// -----------------------------------------------------------------------
// Reactive state
// -----------------------------------------------------------------------

let chipTarget = $state<ChipTarget | null>(null);
let suspended = $state(false);

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------

/** The current chip target, or null when no chip is shown. */
export function chipTargetValue(): ChipTarget | null {
  return chipTarget;
}

/** Whether following is suspended (second-tap mode only). */
export function isFollowSuspended(): boolean {
  return suspended;
}

/**
 * Show the chip for the given target. Called when readingChipDecision
 * returns "offer-chip" and a phone move is being suppressed.
 */
export function offerChip(target: ChipTarget): void {
  chipTarget = target;
}

/** Hide the chip without jumping or changing suspension state. */
export function dismissChip(): void {
  chipTarget = null;
}

/**
 * Jump to the chip's target. Returns the target so the caller can
 * scroll to it.
 *
 * - dwell mode: dismisses the chip. Following resumes via the dwell
 *   timer (managed by the scroll engine, not here).
 * - second-tap mode: sets followSuspended so the chip switches to its
 *   "resume following" state instead of disappearing.
 */
export function chipJump(
  mode: "dwell" | "second-tap" = CHIP_RESUME_MODE,
): ChipTarget | null {
  const t = chipTarget;
  if (t === null) return null;

  if (mode === "second-tap") {
    suspended = true;
    // The chip stays visible (chipTarget unchanged) so it can show
    // the "resume following" label.
    return t;
  }

  // Dwell mode: the jump is a one-shot catch-up. The chip dismisses
  // and the dwell timer in the engine handles re-enabling follow.
  chipTarget = null;
  return t;
}

/**
 * Resume following (second-tap mode). Clears the suspension and
 * hides the chip.
 */
export function resumeFollow(): void {
  suspended = false;
  chipTarget = null;
}

/** Full reset on demo restart. */
export function resetReadingChip(): void {
  chipTarget = null;
  suspended = false;
}
