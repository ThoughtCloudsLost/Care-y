/**
 * Pure decision logic for scroll-engine intent suppression.
 *
 * Extracted so the "no page-scroll intent during misaligned
 * programmatic transition" invariant can be tested without DOM
 * or Svelte runes.
 */

import type { SectionId } from "./bridge.js";

// -----------------------------------------------------------------------
// Suppression backstop decision
// -----------------------------------------------------------------------

/**
 * Whether the suppression backstop timeout should unmute the
 * derived-intent effect. Returns true only when the derived
 * position has reached the suppression target (or when no target
 * was set, as in layout-shift suppression).
 *
 * When the page is still misaligned, returning false keeps
 * suppression active so the effect cannot fire a stale
 * page-scroll intent mid-animation.
 */
export function shouldBackstopUnmute(
  target: { section: SectionId; sub: string | null } | null,
  derivedSection: SectionId | null,
  derivedSub: string | null,
): boolean {
  if (target === null) return true;
  if (derivedSection === null) return true;
  return derivedSection === target.section && derivedSub === target.sub;
}

// -----------------------------------------------------------------------
// Backstop action
// -----------------------------------------------------------------------

export type BackstopDecision = "unmute" | "realign" | "surrender";

/**
 * What the suppression backstop should do when it fires.
 *
 * - "unmute": the derived position reached the target (or no target
 *   was armed); lift suppression normally.
 * - "realign": the page is misaligned and no healing re-align has
 *   run yet for this arming. The first alignment can land short when
 *   geometry moves under it (the preset spring resizing the frame, a
 *   late font swap, a hole re-layout past the fixed-point cap), and
 *   the derived selection then sits on a neighboring sub forever.
 *   Re-aligning against the settled geometry reaches the target and
 *   keeps the visitor's click from being overridden by a stale
 *   page-scroll intent.
 * - "surrender": still misaligned after the re-align; give up and
 *   let the caller schedule the final unmute so the derived
 *   selection is not muted indefinitely.
 */
export function backstopDecision(
  target: { section: SectionId; sub: string | null } | null,
  derivedSection: SectionId | null,
  derivedSub: string | null,
  realignAttempted: boolean,
): BackstopDecision {
  if (shouldBackstopUnmute(target, derivedSection, derivedSub)) {
    return "unmute";
  }
  return realignAttempted ? "surrender" : "realign";
}

// -----------------------------------------------------------------------
// Relink reconciliation
// -----------------------------------------------------------------------

// -----------------------------------------------------------------------
// Dirty-state guard decision
// -----------------------------------------------------------------------

export type DirtyGuardDecision = "navigate" | "suppress";

/**
 * Whether handbook-originated navigation should proceed when the phone
 * simulator has unsaved user input.
 *
 * - Not dirty: always navigate.
 * - Dirty, and a suppression was recorded within the override window:
 *   the reader was just warned and tapped again, so navigate.
 * - Dirty, outside the window (or never suppressed): suppress.
 */
export function dirtyGuardDecision(
  dirty: boolean,
  lastSuppressedAt: number,
  now: number,
  overrideMs = 4000,
): DirtyGuardDecision {
  if (!dirty) return "navigate";
  if (lastSuppressedAt > 0 && now - lastSuppressedAt <= overrideMs) {
    return "navigate";
  }
  return "suppress";
}

// -----------------------------------------------------------------------
// Relink reconciliation
// -----------------------------------------------------------------------

export type RelinkDecision = "push-local" | "adopt-phone" | "none";

/**
 * Who adopts whose position when the visitor relinks the story and
 * the phone: whichever side moved most recently during the unlink
 * wins. Timestamps are epoch ms of the last move on each side, 0
 * meaning that side never moved while unlinked.
 *
 * - "push-local": the story moved last; its location is sent to the
 *   phone as a page-click intent.
 * - "adopt-phone": the phone moved last; its stored snapshot is
 *   presented through the normal linked path.
 * - "none": neither side moved; the two are still in agreement.
 *
 * A tie favors the reader ("push-local"): they were the one holding
 * the page when the link was restored.
 */
export function relinkDecision(
  lastLocalMoveAt: number,
  lastPhoneMoveAt: number,
): RelinkDecision {
  if (lastLocalMoveAt === 0 && lastPhoneMoveAt === 0) return "none";
  return lastLocalMoveAt >= lastPhoneMoveAt ? "push-local" : "adopt-phone";
}

// -----------------------------------------------------------------------
// Reading-position chip decision
// -----------------------------------------------------------------------

export type ChipDecision = "follow" | "offer-chip";

export interface ChipOpts {
  /** How recently the reader must have scrolled for the claim to count. */
  recentLocalMs: number;
  /** In dwell mode, how long after the last reader scroll before
   *  following resumes automatically (counted from lastLocalMoveAt). */
  dwellMs: number;
}

/**
 * Whether a phone-originated location change should auto-scroll the
 * story ("follow") or offer a one-tap chip instead ("offer-chip").
 *
 * The chip protects a reader who has established their own reading
 * position by scrolling the story. When the phone moves the story
 * location and the reader scrolled recently, the story should NOT
 * yank away from wherever they are; a chip lets them jump at their
 * own pace.
 *
 * Rules:
 *
 * 1. lastLocalMoveAt is 0 (the reader never scrolled): "follow".
 *    No reading position to protect.
 *
 * 2. lastLocalMoveAt is within recentLocalMs of now: "offer-chip".
 *    The reader scrolled recently; their position is worth guarding.
 *
 * 3. In "dwell" mode, when the gap between now and lastLocalMoveAt
 *    exceeds dwellMs: "follow". The reader stopped scrolling long
 *    enough for auto-following to resume, and the chip dismisses.
 *    Between recentLocalMs and dwellMs the decision stays
 *    "offer-chip" (the dwell clock runs from the last reader move).
 *
 * 4. In "second-tap" mode, followSuspended forces "offer-chip"
 *    regardless of timestamps. The reader jumped via the chip but
 *    has not yet opted back into following; the chip stays until
 *    they explicitly resume.
 */
export function readingChipDecision(
  now: number,
  lastLocalMoveAt: number,
  lastPhoneMoveAt: number,
  chipMode: "dwell" | "second-tap",
  followSuspended: boolean,
  opts: ChipOpts = { recentLocalMs: 8000, dwellMs: 15000 },
): ChipDecision {
  // Rule 4: second-tap suspension overrides timestamps.
  if (chipMode === "second-tap" && followSuspended) return "offer-chip";

  // Rule 1: reader never scrolled.
  if (lastLocalMoveAt === 0) return "follow";

  const elapsed = now - lastLocalMoveAt;

  // Rule 2: reader scrolled recently.
  if (elapsed <= opts.recentLocalMs) return "offer-chip";

  // Rule 3 (dwell mode): reader stopped scrolling but dwell has
  // not expired yet. Between recentLocalMs and dwellMs the chip
  // remains because the dwell timer has not run out.
  if (chipMode === "dwell" && elapsed <= opts.dwellMs) return "offer-chip";

  // Dwell expired, or second-tap mode without suspension.
  return "follow";
}
