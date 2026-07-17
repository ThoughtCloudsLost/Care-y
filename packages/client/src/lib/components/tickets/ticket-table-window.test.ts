import { describe, it, expect } from "vitest";
import {
  computeTableWindow,
  type TableWindowParams,
  type TableWindowSegment,
} from "./ticket-table-window.js";

function base(overrides: Partial<TableWindowParams>): TableWindowSegment[] {
  return computeTableWindow({
    scrollTop: 0,
    offsetTop: 0,
    viewportHeight: 400,
    pitch: 40,
    rowCount: 100,
    overscan: 0,
    ...overrides,
  });
}

function rowRanges(segments: TableWindowSegment[]): [number, number][] {
  return segments
    .filter(
      (s): s is Extract<TableWindowSegment, { kind: "rows" }> =>
        s.kind === "rows",
    )
    .map((s) => [s.start, s.end]);
}

function gaps(segments: TableWindowSegment[]): { px: number; key: string }[] {
  return segments
    .filter(
      (s): s is Extract<TableWindowSegment, { kind: "gap" }> =>
        s.kind === "gap",
    )
    .map((s) => ({ px: s.px, key: s.key }));
}

describe("computeTableWindow", () => {
  it("returns no segments for zero rows", () => {
    expect(base({ rowCount: 0 })).toEqual([]);
  });

  it("renders from the first row with a bottom gap when unscrolled", () => {
    const segments = base({});
    // 400px viewport / 40px pitch = rows 0..9, then a gap for the other 90.
    expect(rowRanges(segments)).toEqual([[0, 10]]);
    expect(gaps(segments)).toEqual([{ px: 90 * 40, key: "gap-bottom" }]);
  });

  it("returns correct rows and both gaps for a mid-list scroll", () => {
    const segments = base({ scrollTop: 2000 });
    // startPx 2000 / 40 = row 50; viewport bottom 2400 / 40 = row 60.
    expect(rowRanges(segments)).toEqual([[50, 60]]);
    expect(gaps(segments)).toEqual([
      { px: 50 * 40, key: "gap-top" },
      { px: 40 * 40, key: "gap-bottom" },
    ]);
  });

  it("subtracts the tbody offset from scrollTop", () => {
    const segments = base({ scrollTop: 2400, offsetTop: 400 });
    expect(rowRanges(segments)).toEqual([[50, 60]]);
  });

  it("clamps to the first row while content above the table is on screen", () => {
    const segments = base({ scrollTop: 100, offsetTop: 400 });
    expect(rowRanges(segments)[0]?.[0]).toBe(0);
  });

  it("extends the range by overscan rows and clamps at the edges", () => {
    const segments = base({ scrollTop: 2000, overscan: 5 });
    expect(rowRanges(segments)).toEqual([[45, 65]]);

    const top = base({ overscan: 5 });
    expect(rowRanges(top)).toEqual([[0, 15]]);
  });

  it("gap heights always total the off-window rows times pitch", () => {
    const segments = base({ scrollTop: 2000, overscan: 3 });
    const rendered = rowRanges(segments).reduce(
      (sum, [s, e]) => sum + (e - s),
      0,
    );
    const gapPx = gaps(segments).reduce((sum, g) => sum + g.px, 0);
    expect(gapPx).toBe((100 - rendered) * 40);
  });

  it("renders at least one row when the viewport height is unknown", () => {
    const segments = base({ viewportHeight: 0 });
    expect(rowRanges(segments)).toEqual([[0, 1]]);
  });

  it("clamps a scroll position past the content to the last row", () => {
    const segments = base({ scrollTop: 999999 });
    const ranges = rowRanges(segments);
    expect(ranges[0]?.[0]).toBe(99);
    expect(ranges[0]?.[1]).toBe(100);
  });

  it("treats a non-positive pitch as one pixel instead of dividing by zero", () => {
    const segments = base({ pitch: 0, viewportHeight: 2 });
    expect(rowRanges(segments)[0]?.[0]).toBe(0);
    expect(
      segments.every((s) => Number.isFinite(s.kind === "gap" ? s.px : s.start)),
    ).toBe(true);
  });

  describe("pinned row", () => {
    it("keeps a pinned row above the window in its own segment", () => {
      const segments = base({ scrollTop: 2000, pinnedIndex: 3 });
      expect(rowRanges(segments)).toEqual([
        [3, 4],
        [50, 60],
      ]);
      expect(gaps(segments)).toEqual([
        { px: 3 * 40, key: "gap-top" },
        { px: 46 * 40, key: "gap-mid" },
        { px: 40 * 40, key: "gap-bottom" },
      ]);
    });

    it("keeps a pinned row below the window in its own segment", () => {
      const segments = base({ pinnedIndex: 80 });
      expect(rowRanges(segments)).toEqual([
        [0, 10],
        [80, 81],
      ]);
      expect(gaps(segments)).toEqual([
        { px: 70 * 40, key: "gap-mid" },
        { px: 19 * 40, key: "gap-bottom" },
      ]);
    });

    it("emits no extra segment when the pinned row is inside the window", () => {
      const segments = base({ pinnedIndex: 5 });
      expect(rowRanges(segments)).toEqual([[0, 10]]);
    });

    it("ignores a pinned index outside the row range", () => {
      const segments = base({ pinnedIndex: 500 });
      expect(rowRanges(segments)).toEqual([[0, 10]]);
    });

    it("emits no top gap when the pinned row is the first row", () => {
      const segments = base({ scrollTop: 2000, pinnedIndex: 0 });
      expect(gaps(segments).map((g) => g.key)).toEqual([
        "gap-mid",
        "gap-bottom",
      ]);
    });
  });
});
