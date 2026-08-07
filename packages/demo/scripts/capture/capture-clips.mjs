#!/usr/bin/env node

/**
 * Capture pipeline for demo subsection clips.
 *
 * Records the demo app via CDP Page.startScreencast, then encodes two
 * derivatives per subsection:
 *   1. VP9/WebM region clip (cropped to the subsection's region)
 *   2. README GIF via gifski (full phone with bezel, transparent mask,
 *      loop-progress bar) - only when --gif is passed
 *
 * Prerequisites:
 *   brew install ffmpeg gifski
 *
 * Usage:
 *   node scripts/capture/capture-clips.mjs --url http://localhost:4173
 *   node scripts/capture/capture-clips.mjs --only login/credentials
 *   node scripts/capture/capture-clips.mjs --gif --keep-master
 *
 * The demo must already be running at the target URL. Build and preview:
 *   pnpm --filter @care-y/demo run build
 *   npx vite preview --port 4173
 *
 * Or start the dev server and pass --url.
 */

import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

import { CaptureError } from "./capture-errors.mjs";
import { buildConcatDemuxer } from "./concat-demuxer.mjs";
import { getCropEntry, registeredSubs } from "./crop-registry.mjs";
import { resolveCropRect } from "./crop-resolve.mjs";
import {
  buildGifFrameExtractionArgs,
  buildGifskiArgs,
  buildVP9ClipArgs,
} from "./ffmpeg-args.mjs";

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

const DEMO_PKG = resolve(import.meta.dirname, "../..");
const CLIPS_OUT = join(DEMO_PKG, "public", "clips");
const REPO_ROOT = resolve(DEMO_PKG, "../..");

import { BEZEL } from "./constants.mjs";

const DEFAULT_URL = "http://localhost:4173";
const CAPTURE_DURATION_MS = 3500;
const ENGINE_READY_TIMEOUT_MS = 30_000;
const SCREENCAST_FORMAT = "png";
const GIF_FPS = 25;

// -----------------------------------------------------------------------
// CLI parsing
// -----------------------------------------------------------------------

const { values: args } = parseArgs({
  options: {
    url: { type: "string", default: DEFAULT_URL },
    only: { type: "string", default: "" },
    gif: { type: "boolean", default: false },
    "keep-master": { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
  strict: true,
});

if (args.help) {
  console.log(`Usage: node capture-clips.mjs [options]

Options:
  --url <url>       Demo app URL (default: ${DEFAULT_URL})
  --only <key>      Capture only this subsection (e.g. login/credentials)
  --gif             Also produce README GIF derivatives
  --keep-master     Retain master frame directories after encoding
  --help            Show this help
`);
  process.exit(0);
}

// -----------------------------------------------------------------------
// Tool probing
// -----------------------------------------------------------------------

/**
 * Verify an external CLI tool is available.
 * @param {string} bin - Binary name.
 * @param {string} installHint - Brew install command for the error message.
 */
function requireTool(bin, installHint) {
  try {
    execFileSync("which", [bin], { stdio: "pipe" });
  } catch {
    console.error(
      `Required tool "${bin}" not found on PATH.\n` +
        `Install it: ${installHint}\n`,
    );
    process.exit(1);
  }
}

requireTool("ffmpeg", "brew install ffmpeg");
if (args.gif) {
  requireTool("gifski", "brew install gifski");
}

// -----------------------------------------------------------------------
// Subsection selection
// -----------------------------------------------------------------------

/** @returns {string[]} */
function selectSubs() {
  const all = registeredSubs();
  if (args.only) {
    if (!all.includes(args.only)) {
      console.error(
        `Unknown subsection "${args.only}". ` +
          `Available: ${all.join(", ")}\n`,
      );
      process.exit(1);
    }
    return [args.only];
  }
  return all;
}

const subsToCapture = selectSubs();

// -----------------------------------------------------------------------
// Browser automation
// -----------------------------------------------------------------------

/**
 * Resolve the phone rect (.device bounding box) and bezel radius from
 * the outer page DOM. The rect describes the full device element
 * including the bezel.
 *
 * @param {import("@playwright/test").Page} page
 * @returns {Promise<{ x: number, y: number, w: number, h: number, bezelRadius: number }>}
 */
async function readDeviceRect(page) {
  // The evaluate callback runs in the browser, where Node-scope classes
  // do not exist, so the missing-element case comes back as null and the
  // typed error is thrown on this side.
  const rect = await page.evaluate(() => {
    const el = document.querySelector(".device");
    if (!el) return null;
    const box = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const radius = parseFloat(style.borderTopLeftRadius) || 0;
    return {
      x: Math.round(box.x),
      y: Math.round(box.y),
      w: Math.round(box.width),
      h: Math.round(box.height),
      bezelRadius: Math.round(radius),
    };
  });
  if (rect === null) {
    throw new CaptureError("Could not find .device element on the page");
  }
  return rect;
}

/**
 * Resolve a named element's bounding box inside the phone iframe,
 * mapped into phone-viewport coordinates.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} selector
 * @returns {Promise<{ x: number, y: number, w: number, h: number } | null>}
 */
async function resolveElementInIframe(page, selector) {
  const iframeHandle = await page.$("iframe.phone-iframe");
  if (!iframeHandle) return null;

  const frame = await iframeHandle.contentFrame();
  if (!frame) return null;

  const el = await frame.$(selector);
  if (!el) return null;

  const box = await el.boundingBox();
  if (!box) return null;

  // The bounding box from Playwright is in the iframe's coordinate
  // space, which is already phone-viewport space.
  return {
    x: Math.round(box.x),
    y: Math.round(box.y),
    w: Math.round(box.width),
    h: Math.round(box.height),
  };
}

/**
 * Wait for the demo engine to be ready by polling performance marks
 * inside the phone iframe.
 *
 * @param {import("@playwright/test").Page} page
 * @param {number} timeoutMs
 */
async function waitForEngineReady(page, timeoutMs) {
  const start = Date.now();
  const pollInterval = 250;

  while (Date.now() - start < timeoutMs) {
    const ready = await page.evaluate(() => {
      const iframe = document.querySelector("iframe.phone-iframe");
      if (!iframe) return false;
      try {
        const iframeWindow = /** @type {Window} */ (
          /** @type {HTMLIFrameElement} */ (iframe).contentWindow
        );
        if (!iframeWindow) return false;
        const entries =
          iframeWindow.performance.getEntriesByName("demo-engine-ready");
        return entries.length > 0;
      } catch {
        return false;
      }
    });
    if (ready) return;
    await new Promise((r) => setTimeout(r, pollInterval));
  }

  throw new CaptureError(
    `Engine did not become ready within ${timeoutMs}ms. ` +
      "Check that the demo is loaded and the phone iframe is accessible.",
  );
}

/**
 * Record a screencast of the current page state via CDP, collecting
 * PNG frames with timestamps.
 *
 * @param {import("@playwright/test").Page} page
 * @param {number} durationMs - How long to record.
 * @param {string} frameDir - Directory to write frame PNGs into.
 * @returns {Promise<Array<{ filename: string, timestamp: number }>>}
 */
async function recordScreencast(page, durationMs, frameDir) {
  const cdp = await page.context().newCDPSession(page);

  /** @type {Array<{ filename: string, timestamp: number }>} */
  const frames = [];
  let frameIndex = 0;

  cdp.on("Page.screencastFrame", async (params) => {
    const filename = `frame-${String(frameIndex).padStart(4, "0")}.png`;
    const buffer = Buffer.from(params.data, "base64");
    writeFileSync(join(frameDir, filename), buffer);
    frames.push({ filename, timestamp: params.metadata.timestamp });
    frameIndex++;
    await cdp.send("Page.screencastFrameAck", {
      sessionId: params.sessionId,
    });
  });

  await cdp.send("Page.startScreencast", {
    format: SCREENCAST_FORMAT,
    everyNthFrame: 1,
  });

  await new Promise((r) => setTimeout(r, durationMs));

  await cdp.send("Page.stopScreencast");
  // Give a brief settle for any final frames in flight.
  await new Promise((r) => setTimeout(r, 200));

  await cdp.detach();

  return frames;
}

// -----------------------------------------------------------------------
// Encoding
// -----------------------------------------------------------------------

/**
 * Run ffmpeg with the given arguments. Throws on non-zero exit.
 * @param {string[]} ffmpegArgs
 */
function runFfmpeg(ffmpegArgs) {
  execFileSync("ffmpeg", ffmpegArgs, {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 60_000,
  });
}

/**
 * Run gifski with the given arguments. Throws on non-zero exit.
 * @param {string[]} gifskiArgs
 */
function runGifski(gifskiArgs) {
  execFileSync("gifski", gifskiArgs, {
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 60_000,
  });
}

/**
 * Encode the VP9/WebM region clip for a subsection.
 *
 * @param {string} demuxerPath
 * @param {{ x: number, y: number, w: number, h: number }} cropRect
 *   Crop rect in phone-viewport space.
 * @param {{ x: number, y: number }} phoneOffset
 *   The phone viewport's offset within the full page (to translate
 *   phone-space coords into page-space coords for the screencast crop).
 * @param {string} sectionId
 * @param {string} subSlug
 */
function encodeWebmClip(
  demuxerPath,
  cropRect,
  phoneOffset,
  sectionId,
  subSlug,
) {
  const outDir = join(CLIPS_OUT, sectionId);
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `${subSlug}.webm`);

  // Translate phone-viewport crop into screencast frame coordinates.
  // Screencast frames are the full page at CSS pixel size.
  const pageCrop = {
    x: phoneOffset.x + cropRect.x,
    y: phoneOffset.y + cropRect.y,
    w: cropRect.w,
    h: cropRect.h,
  };

  const ffmpegArgs = buildVP9ClipArgs(demuxerPath, pageCrop, outPath);
  runFfmpeg(ffmpegArgs);

  console.log(`    webm: ${outPath}`);
}

/**
 * Encode the README GIF for a subsection via the gifski pipeline.
 *
 * @param {string} demuxerPath
 * @param {{ x: number, y: number, w: number, h: number, bezelRadius: number }} deviceRect
 * @param {number} duration - Clip duration in seconds.
 * @param {string} sectionId
 * @param {string} subSlug
 */
function encodeGif(demuxerPath, deviceRect, duration, sectionId, subSlug) {
  const gifOutDir = join(REPO_ROOT, "docs", "images", "demos");
  mkdirSync(gifOutDir, { recursive: true });
  const gifOutPath = join(gifOutDir, `${sectionId}-${subSlug}.gif`);

  // Extract frames with mask and progress bar applied
  const gifWorkDir = mkdtempSync(join(tmpdir(), "carey-gif-"));
  const framePattern = join(gifWorkDir, "frame%04d.png");

  const extractArgs = buildGifFrameExtractionArgs(
    demuxerPath,
    deviceRect.w,
    deviceRect.h,
    deviceRect.bezelRadius,
    BEZEL,
    duration,
    framePattern,
  );

  // The extraction needs to crop to the phone rect first (screencast
  // frames are the full page). Prepend a crop filter before the
  // filter_complex by rebuilding the filter_complex to include the crop.
  // Actually, since buildGifFrameExtractionArgs uses filter_complex,
  // we need to modify the input or add an initial crop. The simplest
  // approach: prepend a crop to the [0:v] input in the filter_complex.
  const fcIdx = extractArgs.indexOf("-filter_complex");
  if (fcIdx >= 0) {
    const originalFc = extractArgs[fcIdx + 1];
    // Replace [0:v] with a crop of the phone rect from the full page
    const phoneCrop = `crop=${deviceRect.w}:${deviceRect.h}:${deviceRect.x}:${deviceRect.y}`;
    extractArgs[fcIdx + 1] = originalFc.replace(
      "[0:v]",
      `[0:v]${phoneCrop}[cropped];[cropped]`,
    );
  }

  runFfmpeg(extractArgs);

  // Collect extracted frame files for gifski
  const extractedFrames = readdirSync(gifWorkDir)
    .filter((f) => f.endsWith(".png"))
    .sort()
    .map((f) => join(gifWorkDir, f));

  if (extractedFrames.length === 0) {
    rmSync(gifWorkDir, { recursive: true, force: true });
    throw new CaptureError(
      `No frames extracted for GIF (${sectionId}/${subSlug}). ` +
        "ffmpeg filter may have produced no output.",
    );
  }

  const gifskiArgs = buildGifskiArgs(
    join(gifWorkDir, "frame*.png"),
    gifOutPath,
    GIF_FPS,
    deviceRect.w,
  );
  runGifski(gifskiArgs);

  rmSync(gifWorkDir, { recursive: true, force: true });

  console.log(`    gif: ${gifOutPath}`);
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------

async function main() {
  // Dynamic import of playwright (installed as @playwright/test at root)
  const { chromium } = await import("@playwright/test");

  console.log(`Capture target: ${args.url}`);
  console.log(`Subsections: ${subsToCapture.length}`);
  console.log(`GIF output: ${args.gif ? "yes" : "no"}`);
  console.log("");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });

  const failures = [];
  let firstSub = true;

  for (const subKey of subsToCapture) {
    const [sectionId, subSlug] = subKey.split("/");
    const cropEntry = getCropEntry(sectionId, subSlug);

    if (!cropEntry) {
      console.error(`  No crop entry for ${subKey}, skipping.`);
      failures.push(subKey);
      continue;
    }

    console.log(`[${subKey}]`);

    try {
      const page = await context.newPage();
      const targetUrl = `${args.url}?record=1#${sectionId}/${subSlug}`;
      console.log(`  navigating: ${targetUrl}`);
      await page.goto(targetUrl, { waitUntil: "networkidle" });

      // On the first sub, wait for the engine to boot.
      if (firstSub) {
        console.log("  waiting for engine ready...");
        await waitForEngineReady(page, ENGINE_READY_TIMEOUT_MS);
        console.log("  engine ready.");
        firstSub = false;
      }

      // Settle: let animations and layout stabilize.
      await new Promise((r) => setTimeout(r, 1500));

      // Read phone geometry from the DOM
      const deviceRect = await readDeviceRect(page);
      console.log(
        `  device rect: ${deviceRect.w}x${deviceRect.h} at (${deviceRect.x},${deviceRect.y}), ` +
          `radius ${deviceRect.bezelRadius}`,
      );

      // Resolve the element rect from the iframe if a selector is set
      let elementRect = null;
      if (cropEntry.selector) {
        elementRect = await resolveElementInIframe(page, cropEntry.selector);
        if (elementRect) {
          console.log(
            `  element rect: ${elementRect.w}x${elementRect.h} ` +
              `at (${elementRect.x},${elementRect.y})`,
          );
        } else {
          console.log(
            `  selector "${cropEntry.selector}" not found, using fallback rect`,
          );
        }
      }

      // Phone viewport dimensions (inside the bezel)
      const phoneViewW = deviceRect.w - BEZEL * 2;
      const phoneViewH = deviceRect.h - BEZEL * 2;

      const cropRect = resolveCropRect(
        elementRect,
        cropEntry.fallbackRect,
        phoneViewW,
        phoneViewH,
      );
      console.log(
        `  crop rect: ${cropRect.w}x${cropRect.h} at (${cropRect.x},${cropRect.y})`,
      );

      // Record screencast
      const frameDir = mkdtempSync(
        join(tmpdir(), `carey-capture-${sectionId}-${subSlug}-`),
      );
      console.log("  recording...");
      const frames = await recordScreencast(
        page,
        CAPTURE_DURATION_MS,
        frameDir,
      );
      console.log(`  captured ${frames.length} frames`);

      if (frames.length < 2) {
        throw new CaptureError(
          `Only ${frames.length} frame(s) captured. ` +
            "CDP screencast may not be producing frames. " +
            "Check that the page has visible content.",
        );
      }

      // Build concat demuxer
      const demuxerContent = buildConcatDemuxer(frames);
      const demuxerPath = join(frameDir, "concat.txt");
      writeFileSync(demuxerPath, demuxerContent);

      // Compute duration from timestamps
      const duration =
        frames[frames.length - 1].timestamp - frames[0].timestamp;
      console.log(`  duration: ${duration.toFixed(2)}s`);

      // Phone viewport origin (content area inside bezel) in page coords
      const phoneOffset = {
        x: deviceRect.x + BEZEL,
        y: deviceRect.y + BEZEL,
      };

      // Encode VP9/WebM region clip
      encodeWebmClip(demuxerPath, cropRect, phoneOffset, sectionId, subSlug);

      // Encode GIF (optional)
      if (args.gif) {
        encodeGif(demuxerPath, deviceRect, duration, sectionId, subSlug);
      }

      // Clean up
      if (!args["keep-master"]) {
        rmSync(frameDir, { recursive: true, force: true });
      } else {
        console.log(`  master frames retained: ${frameDir}`);
      }

      await page.close();
      console.log(`  done.\n`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  FAILED: ${msg}\n`);
      failures.push(subKey);
    }
  }

  await browser.close();

  // Summary
  console.log("---");
  console.log(
    `Captured: ${subsToCapture.length - failures.length}/${subsToCapture.length}`,
  );

  if (failures.length > 0) {
    console.error(`Failed subsections: ${failures.join(", ")}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
