/**
 * Pure utility functions and constants for the pinch-to-zoom timeline.
 * Extracted from ChatZoom.svelte so they can be tested without
 * component rendering.
 */

export const MIN_SCALE = 0.15;
export const MAX_SCALE = 1.0;
export const TEXT_FADE_THRESHOLD = 0.5;

/** Text opacity: fully visible at scale >= 0.5, fades to 0 approaching 0. */
export function computeTextOpacity(scale: number): number {
  return scale >= TEXT_FADE_THRESHOLD
    ? 1
    : Math.max(0, scale / TEXT_FADE_THRESHOLD);
}

/** Timestamp opacity: fully visible at scale <= 0.5, fades to 0 at scale 1.0. */
export function computeTimestampOpacity(scale: number): number {
  return scale <= TEXT_FADE_THRESHOLD
    ? 1
    : Math.max(0, (1 - scale) / (1 - TEXT_FADE_THRESHOLD));
}
