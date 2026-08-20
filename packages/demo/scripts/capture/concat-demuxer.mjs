/**
 * Concat demuxer file generation for ffmpeg.
 *
 * CDP Page.startScreencast frames arrive only on change and carry
 * metadata.timestamp (seconds since page epoch). Duration for each
 * frame is the delta to the next frame's timestamp. The final frame
 * repeats the preceding duration since there is no subsequent frame
 * to derive it from.
 *
 * Output follows ffmpeg's concat demuxer format:
 *   ffconcat version 1.0
 *   file frame-0001.png
 *   duration 0.066
 *   file frame-0002.png
 *   duration 0.033
 *   ...
 *   file frame-NNNN.png
 *   duration <same as previous>
 *
 * @module
 */

import { CaptureError } from "./capture-errors.mjs";

/**
 * @typedef {Object} FrameEntry
 * @property {string} filename - Filename of the frame image (not a full path).
 * @property {number} timestamp - metadata.timestamp from CDP screencast, in seconds.
 */

/**
 * Build the content of an ffmpeg concat demuxer file from a list of
 * captured frames with their CDP timestamps.
 *
 * @param {ReadonlyArray<FrameEntry>} frames - Ordered frame entries.
 * @returns {string} Contents for the concat demuxer text file.
 * @throws {CaptureError} When fewer than two frames are provided.
 */
export function buildConcatDemuxer(frames) {
  if (frames.length < 2) {
    throw new CaptureError(
      `Cannot build concat demuxer with ${frames.length} frame(s). ` +
        "At least two frames are required to compute durations.",
    );
  }

  const lines = ["ffconcat version 1.0"];

  /** @type {number[]} */
  const durations = [];
  for (let i = 1; i < frames.length; i++) {
    durations.push(frames[i].timestamp - frames[i - 1].timestamp);
  }
  // Final frame repeats the last computed duration.
  durations.push(durations[durations.length - 1]);

  for (let i = 0; i < frames.length; i++) {
    lines.push(`file '${frames[i].filename}'`);
    lines.push(`duration ${durations[i].toFixed(6)}`);
  }

  // ffmpeg concat demuxer needs the last file repeated without a
  // duration entry to avoid the final frame being dropped.
  lines.push(`file '${frames[frames.length - 1].filename}'`);

  return lines.join("\n") + "\n";
}
