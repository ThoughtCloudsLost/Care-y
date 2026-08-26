/**
 * The demo's mount and unmount fade.
 *
 * Simulator chrome comes and goes constantly: the toolbar and flow band
 * leave for fullscreen, the next-section pill steps aside for a drag,
 * the peek close bar arrives on commit. Every one of those is a real
 * element entering or leaving the page, and an unfaded `{#if}` shows it
 * as a hard cut. Around a frame that is otherwise spring-driven the cut
 * is the thing the eye catches.
 *
 * One helper rather than a `transition:fade` at each site, so the
 * duration and the reduced-motion bypass are decided once. Reduced
 * motion collapses the duration to zero, which keeps the cut but only
 * for visitors who asked for exactly that.
 */

import { prefersReducedMotion } from "svelte/motion";
import { fade } from "svelte/transition";
import type { TransitionConfig } from "svelte/transition";

/**
 * Default fade length.
 *
 * Short enough to stay out of the way of a click that caused it, long
 * enough to register as a fade rather than a flicker. Sits just under
 * the 180ms device-chrome fade so chrome arriving alongside the bezel
 * never finishes after it.
 */
export const UI_FADE_MS = 160;

export interface ChromeFadeParams {
  /** Override the fade length in ms. */
  duration?: number;
  /** Hold before the fade starts, in ms. */
  delay?: number;
}

/**
 * Fade an element as it mounts or unmounts.
 *
 * Use as `transition:chromeFade` so an interrupted fade reverses from
 * where it is rather than restarting; `in:`/`out:` only where the two
 * directions genuinely need different timing.
 */
export function chromeFade(
  node: Element,
  params: ChromeFadeParams = {},
): TransitionConfig {
  return fade(node, {
    duration: prefersReducedMotion.current
      ? 0
      : (params.duration ?? UI_FADE_MS),
    delay: params.delay ?? 0,
  });
}
