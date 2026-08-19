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
