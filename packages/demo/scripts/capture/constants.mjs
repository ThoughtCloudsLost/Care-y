/**
 * Shared constants for capture scripts.
 *
 * These values mirror their TypeScript sources of truth. A drift test
 * in src/lib/capture-constants.test.ts asserts they stay in sync.
 *
 * Source mapping:
 *   PHONE_W, PHONE_H  -> PHONE_PRESET in frame-geometry.svelte.ts
 *   BEZEL             -> BEZEL in frame-geometry.svelte.ts
 *   DEFAULT_CROP_W    -> PHONE_PRESET.w (full phone width)
 *   DEFAULT_CROP_H    -> derived from DEFAULT_CLIP_ASPECT in clip-registry.ts
 *                        (390 / aspect = 220)
 *
 * @module
 */

/** Phone viewport width (px). TS source: PHONE_PRESET.w */
export const PHONE_W = 390;

/** Phone viewport height (px). TS source: PHONE_PRESET.h */
export const PHONE_H = 844;

/** Bezel ring width per side (px). TS source: BEZEL */
export const BEZEL = 12;

/** Default crop region width (px). Matches PHONE_W. */
export const DEFAULT_CROP_W = 390;

/** Default crop region height (px). TS source: PHONE_W / DEFAULT_CLIP_ASPECT */
export const DEFAULT_CROP_H = 220;
