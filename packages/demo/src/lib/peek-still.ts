/**
 * Capture a low-resolution still from a video element.
 *
 * The still is CSS-upscaled onto the peek overlay, so a small bitmap is
 * the goal. A CSS blur on the small element gives most of the frosted
 * effect without forcing the compositor to re-blur a large layer each
 * frame, which is what iOS does when you blur a sizeable animating
 * subtree.
 */

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

/**
 * Longest edge of the captured still in pixels. Small enough that
 * upscaling introduces natural softness; large enough that coarse
 * detail (toolbar shapes, list rows) stays recognisable under the
 * blur. 120px on the long edge at phone aspect is roughly 120x67,
 * well under 10 KB as raw RGBA and trivial to blur.
 */
export const STILL_MAX_EDGE = 120;

// -----------------------------------------------------------------------
// Sizing helpers (pure, canvas-free, unit-testable)
// -----------------------------------------------------------------------

/**
 * A source's intrinsic dimensions, matching the subset of
 * HTMLVideoElement that captureStill reads.
 */
export interface StillSource {
  readonly videoWidth: number;
  readonly videoHeight: number;
}

/**
 * Compute the downscaled dimensions that fit inside STILL_MAX_EDGE
 * while preserving aspect ratio. Returns null when the source has no
 * intrinsic size (videoWidth or videoHeight is 0), which happens before
 * the video has loaded metadata.
 */
export function computeStillSize(
  source: StillSource,
): { w: number; h: number } | null {
  const { videoWidth: sw, videoHeight: sh } = source;
  if (sw <= 0 || sh <= 0) return null;

  const scale = STILL_MAX_EDGE / Math.max(sw, sh);
  // At least 1px on each axis
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  return { w, h };
}

// -----------------------------------------------------------------------
// Canvas capture
// -----------------------------------------------------------------------

/**
 * The result of a successful capture: a tiny canvas containing the
 * current video frame at reduced resolution.
 */
export type CapturedStill = HTMLCanvasElement;

/**
 * Drawable target accepted by CanvasRenderingContext2D.drawImage.
 * Covers HTMLVideoElement plus anything else with width/height and
 * a paintable surface (OffscreenCanvas in tests, for example).
 */
export type DrawableSource = StillSource & CanvasImageSource;

/**
 * Capture the current frame of a video (or any drawable with
 * videoWidth/videoHeight) into a small canvas.
 *
 * Returns null when:
 *  - The source has not loaded (videoWidth or videoHeight is 0).
 *  - The browser cannot provide a 2D context (should not happen in
 *    practice, but the spec allows it).
 */
export function captureStill(source: DrawableSource): CapturedStill | null {
  const size = computeStillSize(source);
  if (size === null) return null;

  const canvas = document.createElement("canvas");
  canvas.width = size.w;
  canvas.height = size.h;

  const ctx = canvas.getContext("2d");
  if (ctx === null) return null;

  ctx.drawImage(source, 0, 0, size.w, size.h);
  return canvas;
}
