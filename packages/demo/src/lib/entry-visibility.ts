/**
 * Pure decision logic for auto-dismissing the entry page.
 *
 * The entry page auto-dismisses only when the location store MOVED
 * since the entry was shown. First-load semantics are preserved
 * because the first-load snapshot is 0 and any real transition bumps
 * locationSeq. When entry is re-shown (home button), the snapshot
 * captures the current seq, so bridge echoes at the same seq cannot
 * re-dismiss the entry.
 *
 * Extracted so the rule can be tested without DOM or runes.
 */

import type { LocationOrigin } from "./bridge.js";

/**
 * Whether the entry page should be auto-dismissed.
 *
 * Returns true when all conditions hold:
 *   1. `entryVisible` is true (entry is currently showing)
 *   2. `origin` is not "init" (a real transition happened)
 *   3. `locationSeq` differs from `entryShownAtSeq` (the location
 *      store moved since the entry was shown)
 */
export function entryAutoDismisses(
  entryVisible: boolean,
  origin: LocationOrigin,
  locationSeq: number,
  entryShownAtSeq: number,
): boolean {
  return entryVisible && origin !== "init" && locationSeq !== entryShownAtSeq;
}
