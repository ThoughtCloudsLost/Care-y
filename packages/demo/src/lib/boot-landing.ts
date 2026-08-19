/**
 * Pure decision logic for the phone's boot splash.
 *
 * The demo's boot contract is simple: the phone rests behind the
 * production splash while the background login (engine boot + real
 * key derivation) runs, and stays there until the visitor navigates
 * somewhere. The first navigation signs in and jumps through the
 * existing fast-forward path, and the splash lifts only once the
 * phone is actually showing the target (a non-login screen), so the
 * login screens are never visible outside the login section. The
 * login section is the one exception: its screens ARE the section's
 * narration, so the splash lifts for it immediately.
 *
 * Extracted so the rule can be tested without DOM or runes.
 */

import type { SectionId, LocationOrigin, DemoFeature } from "./bridge.js";

/**
 * Whether the splash should still cover the phone.
 *
 * - Story at the login section (by a real choice, not the "init"
 *   boot default): uncovered, the scripted login plays.
 * - Otherwise: covered until the background login settled AND the
 *   phone's router left the login resting state (the first
 *   navigation commits a real screen).
 *
 * `keyedDone` must flip on login FAILURE too, so a broken boot
 * degrades to a visible screen instead of an eternal splash.
 */
export function splashCovers(
  keyedDone: boolean,
  routerFeature: DemoFeature,
  sectionId: SectionId,
  origin: LocationOrigin,
): boolean {
  if (sectionId === "login" && origin !== "init") return false;
  return !(keyedDone && routerFeature !== "login");
}
