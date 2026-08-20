import { describe, expect, it } from "vitest";
import { buildConcatDemuxer } from "./concat-demuxer.mjs";

describe("buildConcatDemuxer", () => {
  it("throws when fewer than two frames are provided", () => {
    expect(() => buildConcatDemuxer([])).toThrow("At least two frames");
    expect(() =>
      buildConcatDemuxer([{ filename: "f.png", timestamp: 0 }]),
    ).toThrow("At least two frames");
  });

  it("generates correct demuxer content for two frames", () => {
    const frames = [
      { filename: "frame-0001.png", timestamp: 1.0 },
      { filename: "frame-0002.png", timestamp: 1.066 },
    ];
    const result = buildConcatDemuxer(frames);

    expect(result).toContain("ffconcat version 1.0");
    expect(result).toContain("file 'frame-0001.png'");
    expect(result).toContain("duration 0.066000");
    // Final frame repeats last duration
    expect(result).toContain("file 'frame-0002.png'");
    // Last file repeated without duration for concat demuxer compliance
    const lines = result.trim().split("\n");
    expect(lines[lines.length - 1]).toBe("file 'frame-0002.png'");
  });

  it("computes durations from timestamp deltas", () => {
    const frames = [
      { filename: "a.png", timestamp: 0.0 },
      { filename: "b.png", timestamp: 0.1 },
      { filename: "c.png", timestamp: 0.15 },
    ];
    const result = buildConcatDemuxer(frames);
    const lines = result.split("\n");

    // Frame a: duration = 0.1
    expect(lines[2]).toBe("duration 0.100000");
    // Frame b: duration = 0.05
    expect(lines[4]).toBe("duration 0.050000");
    // Frame c: repeats last duration = 0.05
    expect(lines[6]).toBe("duration 0.050000");
  });

  it("ends with the last file repeated (no trailing duration)", () => {
    const frames = [
      { filename: "x.png", timestamp: 2.0 },
      { filename: "y.png", timestamp: 2.5 },
      { filename: "z.png", timestamp: 3.0 },
    ];
    const result = buildConcatDemuxer(frames);
    const lines = result.trim().split("\n");

    // Last line is the final file repeated
    expect(lines[lines.length - 1]).toBe("file 'z.png'");
    // Second to last is a duration line
    expect(lines[lines.length - 2]).toMatch(/^duration /);
  });
});
