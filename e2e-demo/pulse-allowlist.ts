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

  // The deriving screen only appears during completeLogin; the walk
  // visits key-derivation as a sub-section without triggering the full
  // login completion, so no deriving UI is mounted and the pulse finds
  // nothing to mark.
  [
    allowlistKey("key-derivation", null),
    { reason: "deriving screen requires completeLogin, walk visits sub only" },
  ],

  // Each 2FA method sub narrates one method, but the phone shows a
  // method's own screen only while the scripted login sits at that
  // method's stage. The walk steps through the subs without driving
  // the method screens, so the method-specific labels are absent and
  // no pulse entry is recorded.
  [
    allowlistKey("twofa-totp", null),
    { reason: "method screen is stage-gated within the scripted login" },
  ],
  [
    allowlistKey("twofa-email", null),
    { reason: "method screen is stage-gated within the scripted login" },
  ],
  [
    allowlistKey("twofa-sms", null),
    { reason: "method screen is stage-gated within the scripted login" },
  ],
  [
    allowlistKey("twofa-push", null),
    { reason: "method screen is stage-gated within the scripted login" },
  ],
  [
    allowlistKey("twofa-backup", null),
    { reason: "method screen is stage-gated within the scripted login" },
  ],

  // -- Tickets section ------------------------------------------------

  // The decryption pulse targets the "Unlocking" busy placeholders
  // ([role="status"][aria-busy="true"]). Since the phone signs in
  // during boot, the ticket list is fully decrypted before a visitor
  // can reach this sub, so no busy elements remain to mark. The
  // staggered descramble reveal now plays at boot time.
  [
    allowlistKey("decryption", null),
    { reason: "list decrypts during boot sign-in, busy placeholders gone" },
  ],

  // -- Admin-people section -------------------------------------------

  // Client merge is an action sheet opened from the clients sub-page.
  // The pulse cannot open it; the merge label is absent.
  [
    allowlistKey("admin-client-merge", null),
    { reason: "merge action is sheet-gated, not visible at page level" },
  ],
]);
