/**
 * Registry of the demo's scripted seams.
 *
 * A seam is a place where the demo substitutes choreography for
 * something the browser cannot run for real (a time-based authenticator,
 * a second OPRF jurisdiction, an email transport). Events carrying a
 * seam key are badged so the band never implies the demo did the real
 * thing. Narration copy lives on the outer page; nothing here is
 * localized.
 */

import type { DemoSeamKey } from "./bridge.js";

/** All seam keys, in the order the demo reaches them. */
export const SEAM_KEYS: readonly DemoSeamKey[] = [
  "login-pacing",
  "twofa-choreography",
  "webauthn-authenticator",
  "oprf-evaluator",
  "outbox-delivery",
] as const;

const SEAM_KEY_SET: ReadonlySet<string> = new Set<string>(SEAM_KEYS);

/** Narrow an arbitrary string to a seam key. */
export function isSeamKey(value: string): value is DemoSeamKey {
  return SEAM_KEY_SET.has(value);
}
