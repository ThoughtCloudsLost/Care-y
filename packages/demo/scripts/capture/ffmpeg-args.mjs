/**
 * ffmpeg argument builders for the capture pipeline.
 *
 * Each function returns an array of CLI arguments (no binary name).
 * Functions are pure; they never invoke ffmpeg or touch the filesystem.
 *
 * @module
 */

// -----------------------------------------------------------------------
// geq rounded-rect mask
// -----------------------------------------------------------------------

/**
 * Build the geq filter expression for a 1-bit rounded-rect alpha mask.
 *
 * The expression evaluates to 255 (opaque) inside the rounded rectangle
 * and 0 (transparent) outside. Corner regions use Euclidean distance to
 * the corner center; straight edges are simple range checks.
 *
 * @param {number} w - Mask width in pixels.
 * @param {number} h - Mask height in pixels.
 * @param {number} r - Corner radius in pixels.
 * @returns {string} The geq expression string for the alpha channel.
 */
export function buildRoundedRectMask(w, h, r) {
  // Clamp radius so it never exceeds half the smaller dimension.
  const cr = Math.min(r, Math.floor(w / 2), Math.floor(h / 2));

  // Corner centers (top-left, top-right, bottom-left, bottom-right)
  const tlX = cr;
  const tlY = cr;
  const trX = w - 1 - cr;
  const trY = cr;
  const blX = cr;
  const blY = h - 1 - cr;
  const brX = w - 1 - cr;
  const brY = h - 1 - cr;

  // Each corner: if the pixel is in the corner quadrant AND outside the
  // arc, alpha is 0. Otherwise 255.
  //
  // For the top-left corner:
  //   if X < tlX AND Y < tlY: check distance from (tlX, tlY)
  //     if hypot(X - tlX, Y - tlY) > cr: 0 else 255
  //
  // Combine all four corners with nested ternaries. ffmpeg geq does not
  // have sqrt, so compare squared distances against cr*cr.
  const cr2 = cr * cr;

  const expr = [
    // Top-left corner
    `if(lt(X,${tlX})*lt(Y,${tlY}),` +
      `if(lte((X-${tlX})*(X-${tlX})+(Y-${tlY})*(Y-${tlY}),${cr2}),255,0),`,
    // Top-right corner
    `if(gt(X,${trX})*lt(Y,${trY}),` +
      `if(lte((X-${trX})*(X-${trX})+(Y-${trY})*(Y-${trY}),${cr2}),255,0),`,
    // Bottom-left corner
    `if(lt(X,${blX})*gt(Y,${blY}),` +
      `if(lte((X-${blX})*(X-${blX})+(Y-${blY})*(Y-${blY}),${cr2}),255,0),`,
    // Bottom-right corner
    `if(gt(X,${brX})*gt(Y,${brY}),` +
      `if(lte((X-${brX})*(X-${brX})+(Y-${brY})*(Y-${brY}),${cr2}),255,0),`,
    // Everything else is inside the rect body
    `255))))`,
  ].join("");

  return expr;
}

// -----------------------------------------------------------------------
// VP9 / WebM region clip
// -----------------------------------------------------------------------

/**
 * @typedef {Object} CropRect
 * @property {number} x - Left offset within the source frame.
 * @property {number} y - Top offset within the source frame.
 * @property {number} w - Crop width.
 * @property {number} h - Crop height.
 */

/**
 * Build ffmpeg arguments for encoding a VP9/WebM region clip from a
 * concat demuxer input.
 *
 * Uses default keyframe spacing (the spec deliberately avoids dense
 * keyframes for looping clips that have no scrubbing).
 *
 * @param {string} demuxerPath - Path to the concat demuxer text file.
 * @param {CropRect} crop - Region to crop from each source frame.
 * @param {string} outputPath - Output .webm file path.
 * @returns {string[]} ffmpeg CLI arguments (excluding the binary name).
 */
export function buildVP9ClipArgs(demuxerPath, crop, outputPath) {
  return [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    demuxerPath,
    "-vf",
    `crop=${crop.w}:${crop.h}:${crop.x}:${crop.y}`,
    "-c:v",
    "libvpx-vp9",
    "-crf",
    "35",
    "-b:v",
    "0",
    "-an",
    outputPath,
  ];
}

// -----------------------------------------------------------------------
// Loop-progress bar drawbox expression
// -----------------------------------------------------------------------

/**
 * Build the drawbox filter string for a 3px loop-progress bar on the
 * bezel chin.
 *
 * The bar is inset horizontally to clear the corner curve. Width grows
 * linearly with time `t` over the clip duration.
 *
 * The spec requires `t` instead of `n` because drawbox does not define
 * `n` in this ffmpeg build.
 *
 * @param {number} frameW - Total frame width (full phone with bezel).
 * @param {number} frameH - Total frame height (full phone with bezel).
 * @param {number} bezel - Bezel width in pixels (12).
 * @param {number} duration - Clip duration in seconds.
 * @param {number} insetX - Horizontal inset from each edge (28px per spec).
 * @returns {string} The drawbox filter string (not the full -vf value).
 */
export function buildProgressBarFilter(
  frameW,
  frameH,
  bezel,
  duration,
  insetX,
) {
  const barH = 3;
  const barY = frameH - bezel + Math.floor((bezel - barH) / 2);
  const maxBarW = frameW - insetX * 2;

  // drawbox width expression using t (seconds elapsed).
  // t/duration gives progress 0..1; multiply by max width.
  const widthExpr = `(t/${duration.toFixed(4)})*${maxBarW}`;

  return (
    `drawbox=x=${insetX}:y=${barY}:w='${widthExpr}':h=${barH}:` +
    `color=white@0.6:t=fill`
  );
}

// -----------------------------------------------------------------------
// GIF pipeline (gifski path): frame extraction from master
// -----------------------------------------------------------------------

/**
 * Build ffmpeg arguments to extract PNG frames from a master recording
 * for gifski input. This applies the rounded-rect alpha mask and the
 * loop-progress bar, then outputs sequentially numbered PNGs at 25 fps.
 *
 * @param {string} demuxerPath - Path to the concat demuxer file.
 * @param {number} frameW - Full phone frame width including bezel.
 * @param {number} frameH - Full phone frame height including bezel.
 * @param {number} bezelRadius - Corner radius for the mask.
 * @param {number} bezel - Bezel width (12).
 * @param {number} duration - Clip duration in seconds.
 * @param {string} outputPattern - Output path pattern (e.g. "/tmp/gif/frame%04d.png").
 * @returns {string[]} ffmpeg CLI arguments.
 */
export function buildGifFrameExtractionArgs(
  demuxerPath,
  frameW,
  frameH,
  bezelRadius,
  bezel,
  duration,
  outputPattern,
) {
  const maskExpr = buildRoundedRectMask(frameW, frameH, bezelRadius);
  const progressBar = buildProgressBarFilter(
    frameW,
    frameH,
    bezel,
    duration,
    28,
  );

  // Build a complex filtergraph:
  // 1. Apply the progress bar to the source video.
  // 2. Generate an alpha mask via geq on a color source.
  // 3. Merge the alpha channel using alphamerge.
  const filterComplex = [
    `[0:v]${progressBar}[barred]`,
    `color=black:s=${frameW}x${frameH},format=gray,geq=lum='${maskExpr}'[mask]`,
    `[barred][mask]alphamerge,fps=25[out]`,
  ].join(";");

  return [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    demuxerPath,
    "-filter_complex",
    filterComplex,
    "-map",
    "[out]",
    outputPattern,
  ];
}

/**
 * Build gifski CLI arguments to assemble extracted PNGs into a
 * transparent GIF.
 *
 * @param {string} inputGlob - Glob or path pattern for input PNGs.
 * @param {string} outputPath - Output .gif file path.
 * @param {number} fps - Target frame rate (25 per spec).
 * @param {number} width - Output width (matches the full phone frame width).
 * @returns {string[]} gifski CLI arguments (excluding the binary name).
 */
export function buildGifskiArgs(inputGlob, outputPath, fps, width) {
  return [
    "--fps",
    String(fps),
    "--width",
    String(width),
    "--quality",
    "90",
    "-o",
    outputPath,
    inputGlob,
  ];
}
