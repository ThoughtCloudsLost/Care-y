import { describe, expect, it } from "vitest";
import {
  buildGifFrameExtractionArgs,
  buildGifskiArgs,
  buildProgressBarFilter,
  buildRoundedRectMask,
  buildVP9ClipArgs,
} from "./ffmpeg-args.mjs";

describe("buildRoundedRectMask", () => {
  it("produces a non-empty expression string", () => {
    const expr = buildRoundedRectMask(414, 868, 48);
    expect(typeof expr).toBe("string");
    expect(expr.length).toBeGreaterThan(0);
  });

  it("contains corner distance checks for all four corners", () => {
    const expr = buildRoundedRectMask(400, 800, 40);
    // Top-left corner center at (40, 40)
    expect(expr).toContain("(X-40)*(X-40)+(Y-40)*(Y-40)");
    // Top-right corner center at (359, 40)
    expect(expr).toContain("(X-359)*(X-359)+(Y-40)*(Y-40)");
    // Bottom-left corner center at (40, 759)
    expect(expr).toContain("(X-40)*(X-40)+(Y-759)*(Y-759)");
    // Bottom-right corner center at (359, 759)
    expect(expr).toContain("(X-359)*(X-359)+(Y-759)*(Y-759)");
  });

  it("clamps radius to half the smaller dimension", () => {
    // 100x50 with radius 60 should clamp to 25
    const expr = buildRoundedRectMask(100, 50, 60);
    // Clamped radius: min(60, 50, 25) = 25
    // Top-left center at (25, 25), squared radius 625
    expect(expr).toContain(",625)");
  });

  it("evaluates to 255 in the middle of a zero-radius rect", () => {
    // Zero radius means no corner rounding, pure rect
    const expr = buildRoundedRectMask(100, 100, 0);
    // With r=0, all corners have cr=0, so the corner quadrants have
    // zero area and the body branch returns 255 everywhere.
    expect(expr).toContain("255");
  });
});

describe("buildVP9ClipArgs", () => {
  it("produces valid ffmpeg arguments", () => {
    const args = buildVP9ClipArgs(
      "/tmp/demuxer.txt",
      { x: 10, y: 20, w: 390, h: 220 },
      "/out/clip.webm",
    );

    expect(args).toContain("-f");
    expect(args).toContain("concat");
    expect(args).toContain("-c:v");
    expect(args).toContain("libvpx-vp9");
    expect(args).toContain("-an");
    expect(args[args.length - 1]).toBe("/out/clip.webm");
  });

  it("includes the crop filter with correct geometry", () => {
    const args = buildVP9ClipArgs(
      "/tmp/d.txt",
      { x: 5, y: 10, w: 300, h: 200 },
      "/out.webm",
    );
    const vfIdx = args.indexOf("-vf");
    expect(vfIdx).toBeGreaterThan(-1);
    expect(args[vfIdx + 1]).toBe("crop=300:200:5:10");
  });

  it("uses CRF mode with no bitrate target", () => {
    const args = buildVP9ClipArgs(
      "/tmp/d.txt",
      { x: 0, y: 0, w: 100, h: 100 },
      "/o.webm",
    );
    expect(args).toContain("-crf");
    expect(args).toContain("-b:v");
    expect(args[args.indexOf("-b:v") + 1]).toBe("0");
  });
});

describe("buildProgressBarFilter", () => {
  it("produces a drawbox filter with time-based width", () => {
    const filter = buildProgressBarFilter(414, 868, 12, 3.5, 28);
    expect(filter).toContain("drawbox=");
    expect(filter).toContain("t/3.5000");
    // Max bar width: 414 - 28*2 = 358
    expect(filter).toContain("*358");
  });

  it("positions the bar on the bezel chin", () => {
    const filter = buildProgressBarFilter(414, 868, 12, 4, 28);
    // barY = 868 - 12 + floor((12 - 3) / 2) = 856 + 4 = 860
    expect(filter).toContain("y=860");
  });

  it("uses fill mode with semi-transparent white", () => {
    const filter = buildProgressBarFilter(100, 200, 12, 2, 28);
    expect(filter).toContain("color=white@0.6");
    expect(filter).toContain("t=fill");
  });
});

describe("buildGifFrameExtractionArgs", () => {
  it("includes filter_complex with alphamerge and fps=25", () => {
    const args = buildGifFrameExtractionArgs(
      "/tmp/d.txt",
      414,
      868,
      48,
      12,
      3.5,
      "/tmp/gif/frame%04d.png",
    );

    expect(args).toContain("-filter_complex");
    const fcIdx = args.indexOf("-filter_complex");
    const fc = args[fcIdx + 1];
    expect(fc).toContain("alphamerge");
    expect(fc).toContain("fps=25");
    expect(fc).toContain("drawbox=");
    expect(fc).toContain("geq=");
  });

  it("uses concat demuxer as input", () => {
    const args = buildGifFrameExtractionArgs(
      "/my/demuxer.txt",
      414,
      868,
      48,
      12,
      3.0,
      "/tmp/out%04d.png",
    );
    expect(args[args.indexOf("-f") + 1]).toBe("concat");
    expect(args[args.indexOf("-i") + 1]).toBe("/my/demuxer.txt");
  });
});

describe("buildGifskiArgs", () => {
  it("produces correct CLI arguments", () => {
    const args = buildGifskiArgs(
      "/tmp/gif/frame*.png",
      "/out/demo.gif",
      25,
      414,
    );
    expect(args).toContain("--fps");
    expect(args[args.indexOf("--fps") + 1]).toBe("25");
    expect(args).toContain("--width");
    expect(args[args.indexOf("--width") + 1]).toBe("414");
    expect(args).toContain("-o");
    expect(args[args.indexOf("-o") + 1]).toBe("/out/demo.gif");
    expect(args[args.length - 1]).toBe("/tmp/gif/frame*.png");
  });
});
