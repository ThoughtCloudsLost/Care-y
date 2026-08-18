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
