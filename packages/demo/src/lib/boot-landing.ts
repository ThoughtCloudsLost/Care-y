/**
 * Pure decision logic for the phone's boot splash.
 *
 * Resting state: the phone boots behind the production splash while
 * background keying runs. Once keying settles (keyedDone flips true,
 * success or failure), the splash lifts and the real login form is
 * the demo's ready state. No navigation or sign-in happens at rest;
 * the first real interaction (section click, deep link) drives the
 * phone through the fast-forward path.
 *
 * First navigation: the splash may briefly re-cover while the
 * fast-forward commits the target screen. It lifts again once
 * keying has settled AND the router shows a non-login screen, so
 * login screens are never visible outside the login section. The
 * login section is the one exception: its screens ARE the
 * section's narration, so the splash lifts for it immediately.
 *
 * Extracted so the rule can be tested without DOM or runes.
 */

import type { SectionId, LocationOrigin, DemoFeature } from "./bridge.js";

/**
 * Whether the splash should still cover the phone.
 *
 * - At rest (origin "init"): covered only until keying settles,
 *   then lifts to reveal the login form as the ready state.
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
  if (origin === "init") return !keyedDone;
  if (sectionId === "login") return false;
  return !(keyedDone && routerFeature !== "login");
}
