/**
 * Allowlist for pulse outcomes that are known to resolve as "missing"
 * or have no entry at all. Entries here keep the strict pulse assertion
 * from failing the suite while the underlying demo-source gap persists.
 *
 * Keyed by topic string. When a topic resolves as "missing" during the
 * walk, the suite checks this map: allowed entries produce a warning
 * annotation instead of a hard failure; unknown entries fail the test.
 *
 * Frame-specific entries use "phone:<topic>" or "desktop:<topic>" keys
 * when only one preset is affected. A bare "<topic>" key covers both.
 */

import type { DemoTopic } from "../packages/demo/src/lib/bridge.js";

export interface AllowlistEntry {
  /** One-line reason the gap is accepted. */
  readonly reason: string;
}

/**
 * Build an allowlist key. When `framePreset` is null, the entry applies
 * to all presets.
 */
export function allowlistKey(
  topic: DemoTopic,
  framePreset: "phone" | "desktop" | null,
): string {
  if (framePreset === null) return topic;
  return `${framePreset}:${topic}`;
}

/**
 * Look up a topic in the allowlist. Checks the frame-specific key
 * first, then falls back to the bare topic key.
 */
export function findAllowlistEntry(
  topic: DemoTopic,
  framePreset: "phone" | "desktop",
): AllowlistEntry | undefined {
  const specific = PULSE_ALLOWLIST.get(allowlistKey(topic, framePreset));
  if (specific !== undefined) return specific;
  return PULSE_ALLOWLIST.get(allowlistKey(topic, null));
}

// -----------------------------------------------------------------------
// The allowlist
//
// Each entry documents why the pulse is expected to be missing. Shrink
// this list as demo-source gaps are closed.
// -----------------------------------------------------------------------

export const PULSE_ALLOWLIST: ReadonlyMap<string, AllowlistEntry> = new Map([
  // -- Login section --------------------------------------------------

  // The deriving screen only appears during a completed sign-in, which
  // the demo fast-forwards behind the splash; the walk visits
  // key-derivation as a sub-section without triggering completion, so
  // no deriving UI is mounted and the pulse finds nothing to mark.
  [
    allowlistKey("key-derivation", null),
    { reason: "deriving screen requires a completed sign-in, never on screen" },
  ],

  // -- Admin-people section -------------------------------------------

  // Client merge is an action sheet opened from the clients sub-page.
  // The pulse cannot open it; the merge label is absent.
  [
    allowlistKey("admin-client-merge", null),
    { reason: "merge action is sheet-gated, not visible at page level" },
  ],
]);
