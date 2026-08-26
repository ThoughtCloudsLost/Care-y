/**
 * Entry splash for the demo simulator.
 *
 * On a desktop load the app opens filling the window, holds for a beat,
 * then the device chrome fades in and the app shrinks into the frame at
 * its spawn position. The visitor watches the simulator assemble itself
 * instead of finding it already assembled.
 *
 * The motion reuses the fullscreen exit sequence (fade chrome in, drop
 * the override, spring the frame down to a saved rect) on a slower
 * spring. Only the decision and the tuning live here so both can be
 * tested without a DOM.
 */

import type { SpringOptions } from "svelte/motion";
import type { DemoMode } from "./demo-mode.svelte.js";
import { BOOT_TIP_SHOWN_MS } from "./boot-tip.js";

// -----------------------------------------------------------------------
// Timing
// -----------------------------------------------------------------------

/**
 * How long the tip stays up on its own before the frame starts forming.
 *
 * The shrink is the visitor's cue to start looking at the simulator
 * instead of at the app, so it should not begin while they are still
 * reading why the app is busy.
 */
export const SPLASH_TIP_BEAT_MS = 300;

/**
 * How long the app holds at window size before the frame forms.
 *
 * Paced against the phone's boot tip rather than picked: the hold ends
 * once the tip has finished fading in and been readable for a beat.
 * Retiming the tip in boot-tip.ts moves the splash with it.
 *
 * Measured from the phone announcing itself, NOT from this page
 * loading. The tip's reveal is delayed relative to the moment its
 * element mounts inside the iframe, which is well after the outer page
 * is up: the iframe has to fetch and evaluate the phone's whole module
 * graph first. Timing the hold from page load put the shrink in front
 * of a tip that had not appeared yet.
 */
export const SPLASH_HOLD_MS = BOOT_TIP_SHOWN_MS + SPLASH_TIP_BEAT_MS;

/**
 * Backstop for a phone that never reports in.
 *
 * The hold normally starts at the bridge handshake. If the iframe fails
 * to load or its bridge never appears, nothing would start it and the
 * demo would sit fullscreen forever, so the splash gives up and resolves
 * into the frame on its own. Long enough that a slow module graph on a
 * cold cache is not mistaken for a failure.
 */
export const SPLASH_CEILING_MS = 5000;

/**
 * The two spring parameters the frame tunes, both required.
 *
 * Svelte's own SpringOptions leaves every field optional (precision
 * included), so reading one back off a shared constant would be
 * possibly-undefined at every call site. Narrowing it here keeps the
 * link to the built-in type while making both values a promise.
 */
export type FrameSpringOptions = Required<
  Pick<SpringOptions, "stiffness" | "damping">
>;

/**
 * Options for the Svelte spring that drives the splash shrink.
 *
 * The preset spring (stiffness 0.12, damping 0.6) settles in roughly
 * 300ms. Spring frequency goes with the square root of stiffness, so
 * around a ninth of the stiffness runs about three times as long.
 * Damping is scaled by the same square root to hold the damping ratio,
 * then nudged past critical so the frame arrives without a bounce: an
 * overshoot at the end of a slow shrink reads as a mistake rather than
 * as spring.
 */
export const SPLASH_SPRING: FrameSpringOptions = {
  stiffness: 0.014,
  damping: 0.26,
};

// -----------------------------------------------------------------------
// Decision
// -----------------------------------------------------------------------

export interface IntroSplashConditions {
  /** Effective demo mode at load. */
  mode: DemoMode;
  /** True when the document is in capture mode (?record=1). */
  recordMode: boolean;
  /** Viewport width at load. */
  windowW: number;
  /** Width at and above which the story keeps a column beside the frame. */
  wideBreakpoint: number;
  /** True when the visitor asked for reduced motion. */
  reducedMotion: boolean;
  /**
   * True when the URL names a destination, which is the same condition
   * that skips the entry page.
   */
  deepLinked: boolean;
}

/**
 * Whether the entry splash should play.
 *
 * Every exclusion is a surface where a window-filling app that then
 * shrinks would be wrong rather than merely unnecessary:
 *
 *   read mode      The frame is hidden until a peek opens it, so there
 *                  is nothing for the splash to resolve into.
 *   record mode    Captures must be frame-identical across re-records;
 *                  a timed intro puts motion at the head of every clip.
 *   narrow         Narrow viewports enter fullscreen and stay there, so
 *                  the splash has no framed state to land in.
 *   reduced motion The splash is motion for its own sake, which is the
 *                  first thing the preference asks to drop.
 *   deep link      A link to a specific page is a request to arrive
 *                  there. The demo already honours that by skipping the
 *                  entry page, and an opening flourish in front of a
 *                  named destination contradicts the same intent.
 */
export function shouldPlayIntroSplash(c: IntroSplashConditions): boolean {
  if (c.mode !== "simulate") return false;
  if (c.recordMode) return false;
  if (c.reducedMotion) return false;
  if (c.deepLinked) return false;
  return c.windowW >= c.wideBreakpoint;
}
