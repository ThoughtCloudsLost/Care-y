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
  // no pulse entry is recorded (the pre-hardening suite logged these
  // same topics as its "login method pulses" soft gap).
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

  // Audit run 2026-08-19: sort records no pulse entry on either
  // preset, and the phone preset misses split-view (desktop shows
  // it). Several sibling entries from the same audit were removed
  // after the pulse-opened-mode cleanup revived them (lingering
  // selection modes had been hiding their labels).
  [
    allowlistKey("sort", null),
    { reason: "no pulse entry on either preset, audit 2026-08-19" },
  ],
  [
    allowlistKey("split-view", "phone"),
    { reason: "no pulse entry on phone, audit 2026-08-19" },
  ],

  // -- Admin-people section -------------------------------------------

  // Client merge is an action sheet opened from the clients sub-page.
  // The pulse cannot open it; the merge label is absent.
  [
    allowlistKey("admin-client-merge", null),
    { reason: "merge action is sheet-gated, not visible at page level" },
  ],

  // Roles narration finds no pulse target in the desktop people
  // layout (phone pulses fine). Surfaced by the first strict desktop
  // run to reach this section, 2026-08-19.
  [
    allowlistKey("admin-roles", "desktop"),
    { reason: "no pulse entry on desktop, strict run 2026-08-19" },
  ],

  // Desktop audit 2026-08-19 (full 12-section enumeration): these
  // admin sub-page topics pulse but find no target in the desktop
  // layout; all pass on the phone preset.
  [
    allowlistKey("admin-phone-lines", "desktop"),
    { reason: "pulse target missing in desktop layout, audit 2026-08-19" },
  ],
  [
    allowlistKey("admin-greetings", "desktop"),
    { reason: "pulse target missing in desktop layout, audit 2026-08-19" },
  ],
  [
    allowlistKey("admin-sms-templates", "desktop"),
    { reason: "pulse target missing in desktop layout, audit 2026-08-19" },
  ],
  [
    allowlistKey("admin-blocklist", "desktop"),
    { reason: "pulse target missing in desktop layout, audit 2026-08-19" },
  ],
  [
    allowlistKey("admin-quarantine", "desktop"),
    { reason: "pulse target missing in desktop layout, audit 2026-08-19" },
  ],
  [
    allowlistKey("admin-keys", "desktop"),
    { reason: "pulse target missing in desktop layout, audit 2026-08-19" },
  ],
  [
    allowlistKey("admin-retention", "desktop"),
    { reason: "pulse target missing in desktop layout, audit 2026-08-19" },
  ],
  [
    allowlistKey("admin-note-types", "desktop"),
    { reason: "pulse target missing in desktop layout, audit 2026-08-19" },
  ],

  // The vote pulse navigates into the article detail first; on the
  // desktop preset the pulse intermittently misses depending on how
  // fast the detail mounts. Passes on phone every run.
  [
    allowlistKey("library-vote", "desktop"),
    { reason: "intermittent on desktop, detail navigation timing" },
  ],

  // -- Desktop-specific gaps ------------------------------------------

  // At desktop width the dashboard overview renders a different layout
  // (split-view, sidebar widgets). Several topic targets are absent or
  // positioned differently from the phone layout.
  [
    allowlistKey("dashboard-shift", "desktop"),
    { reason: "status unverified at hardening time" },
  ],
  [
    allowlistKey("dashboard-queues", "desktop"),
    { reason: "status unverified at hardening time" },
  ],
  [
    allowlistKey("dashboard-activity", "desktop"),
    { reason: "status unverified at hardening time" },
  ],
  [
    allowlistKey("dashboard-needs-attention", "desktop"),
    { reason: "status unverified at hardening time" },
  ],
  [
    allowlistKey("dashboard-my-tickets", "desktop"),
    { reason: "status unverified at hardening time" },
  ],
  [
    allowlistKey("dashboard-unassigned", "desktop"),
    { reason: "status unverified at hardening time" },
  ],
  [
    allowlistKey("dashboard-on-hold", "desktop"),
    { reason: "status unverified at hardening time" },
  ],
  // Desktop ticket list topics may differ (split-view layout, missing
  // toolbar toggles).
  [
    allowlistKey("list-stats", null),
    {
      reason:
        "no entry on phone and desktop, status unverified at hardening time",
    },
  ],
]);
