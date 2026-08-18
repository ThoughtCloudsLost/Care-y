import { describe, it, expect } from "vitest";
import {
  computeFlowLayout,
  scrollTargetForBlock,
  locationAtY,
  hitTestBlock,
  computeLineSegments,
  DEFAULT_METRICS,
  HOLE_GAP,
  BOTH_SIDES_MIN,
  BALANCE_RATIO,
  MAX_MEASURE,
  MAX_FIGURE_WIDTH,
} from "./flow-layout.js";
import type {
  FlowBlock,
  FlowTextBlock,
  FlowFigureBlock,
  FlowHole,
  LineFiller,
  LineCursor,
  LineFillerResult,
} from "./flow-layout.js";

// -----------------------------------------------------------------------
// Fake fixed-width LineFiller for deterministic tests
// -----------------------------------------------------------------------

/**
 * A LineFiller that measures text with a fixed character width.
 * The cursor is the character offset into the block's text.
 * Fills greedily: as many whole characters as fit in maxWidth.
 */
function createFixedFiller(
  blocks: readonly FlowBlock[],
  charWidth: number,
): LineFiller {
  return {
    startCursor(_blockIndex: number): LineCursor {
      return 0;
    },
    fillLine(
      blockIndex: number,
      cursor: LineCursor,
      maxWidth: number,
    ): LineFillerResult | null {
      const offset = cursor as number;
      const block = blocks[blockIndex];
      if (block === undefined) return null;
      // Figure blocks have no text; the layout engine never calls the
      // filler for them, but the type system requires the guard.
      if (block.kind === "figure") return null;
      const text = block.text;
      if (offset >= text.length) return null;

      const maxChars = Math.floor(maxWidth / charWidth);
      if (maxChars <= 0) return null;

      const end = Math.min(offset + maxChars, text.length);
      const slice = text.slice(offset, end);
      return {
        text: slice,
        width: slice.length * charWidth,
        nextCursor: end,
      };
    },
  };
}

/**
 * A LineFiller that always returns empty text (for zero-progress guard).
 */
function createEmptyFiller(): LineFiller {
  return {
    startCursor(): LineCursor {
      return 0;
    },
    fillLine(
      _blockIndex: number,
      cursor: LineCursor,
      _maxWidth: number,
    ): LineFillerResult | null {
      if ((cursor as number) > 0) return null;
      return { text: "", width: 0, nextCursor: 0 };
    },
  };
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

const BODY_METRICS = DEFAULT_METRICS["sub-body"];

/** Safe indexed access that throws on a miss, for test readability. */
function at<T>(arr: readonly T[], i: number): T {
  const val = arr[i];
  if (val === undefined) throw new Error(`expected element at index ${i}`);
  return val;
}

function makeBlock(
  text: string,
  kind: "sub-heading" | "sub-body" = "sub-body",
  sectionId = "login" as FlowBlock["sectionId"],
  subSlug: string | null = "overview",
): FlowTextBlock {
  return { id: `b-${text.slice(0, 8)}`, sectionId, subSlug, kind, text };
}

function makeFigure(
  aspectRatio: number = 390 / 220,
  sectionId = "login" as FlowBlock["sectionId"],
  subSlug: string | null = "overview",
): FlowFigureBlock {
  return {
    id: `fig-${sectionId}-${subSlug ?? "none"}`,
    sectionId,
    subSlug,
    kind: "figure",
    aspectRatio,
    headingKey: "demo_narrative_topic_credentials_heading",
  };
}

// -----------------------------------------------------------------------
// computeFlowLayout: no hole
// -----------------------------------------------------------------------

describe("computeFlowLayout without a hole", () => {
  it("wraps text into lines at the container width", () => {
    // 10 chars, 10px per char = 100px per char-line, container 50px
    const blocks = [makeBlock("ABCDEFGHIJ")];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 50, null);

    expect(result.lines).toHaveLength(2);
    expect(at(result.lines, 0).text).toBe("ABCDE");
    expect(at(result.lines, 1).text).toBe("FGHIJ");
    expect(at(result.lines, 0).y).toBe(0);
    expect(at(result.lines, 1).y).toBe(BODY_METRICS.lineHeight);
  });

  it("places a second block after the first with correct margin", () => {
    const blocks = [makeBlock("AB"), makeBlock("CD")];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 200, null);

    expect(result.blocks).toHaveLength(2);
    // First block: starts at 0, one line
    expect(at(result.blocks, 0).topY).toBe(0);
    // Second block: topY = first bottomY + marginTop
    // first bottomY = lineHeight (24) + marginBottom (0) = 24
    // second marginTop = 0 for sub-body
    expect(at(result.blocks, 1).topY).toBe(24);
  });
});

// -----------------------------------------------------------------------
// Reading measure: cap and centre
// -----------------------------------------------------------------------

describe("reading measure", () => {
  const LINE_H = 24;

  it("centres a single band in the container when it exceeds the measure", () => {
    const containerWidth = MAX_MEASURE + 400;
    const segments = computeLineSegments(0, LINE_H, containerWidth, null);

    expect(segments).toHaveLength(1);
    expect(at(segments, 0).width).toBe(MAX_MEASURE);
    // Equal slack on both sides
    const seg = at(segments, 0);
    expect(seg.x).toBe(200);
    expect(containerWidth - (seg.x + seg.width)).toBe(200);
  });

  it("leaves a container narrower than the measure untouched", () => {
    const containerWidth = MAX_MEASURE - 100;
    const segments = computeLineSegments(0, LINE_H, containerWidth, null);

    expect(segments).toHaveLength(1);
    expect(at(segments, 0).x).toBe(0);
    expect(at(segments, 0).width).toBe(containerWidth);
  });

  it("centres within the band left behind when the frame takes the right", () => {
    // Frame on the right: the left band is the only usable side and is
    // wider than the measure, so text centres inside that band rather
    // than hugging the container's left edge.
    const containerWidth = 2000;
    const hole: FlowHole = {
      left: MAX_MEASURE + 400,
      top: -10,
      right: containerWidth,
      bottom: 100,
    };
    const segments = computeLineSegments(0, LINE_H, containerWidth, hole);

    expect(segments).toHaveLength(1);
    const seg = at(segments, 0);
    const bandWidth = hole.left - HOLE_GAP;
    expect(seg.width).toBe(MAX_MEASURE);
    expect(seg.x).toBe((bandWidth - MAX_MEASURE) / 2);
  });

  it("centres within the band left behind when the frame takes the left", () => {
    const containerWidth = 2000;
    const hole: FlowHole = {
      left: 0,
      top: -10,
      right: 900,
      bottom: 100,
    };
    const segments = computeLineSegments(0, LINE_H, containerWidth, hole);

    expect(segments).toHaveLength(1);
    const seg = at(segments, 0);
    const bandStart = hole.right + HOLE_GAP;
    const bandWidth = containerWidth - bandStart;
    expect(seg.width).toBe(MAX_MEASURE);
    expect(seg.x).toBe(bandStart + (bandWidth - MAX_MEASURE) / 2);
  });

  it("centres both flanks on the frame when it splits the column", () => {
    // Lopsided but still balanced enough for both-side wrap: 384px of
    // room on the left, 484px on the right. Both flanks take the
    // narrower width and hug the frame, so the text block is symmetric
    // about the frame's centre.
    const containerWidth = 1400;
    const hole: FlowHole = {
      left: 400,
      top: -10,
      right: 900,
      bottom: 100,
    };
    const segments = computeLineSegments(0, LINE_H, containerWidth, hole);

    expect(segments).toHaveLength(2);
    const left = at(segments, 0);
    const right = at(segments, 1);

    // Equal flanks, each hugging its side of the frame
    expect(left.width).toBe(right.width);
    expect(left.x + left.width).toBe(hole.left - HOLE_GAP);
    expect(right.x).toBe(hole.right + HOLE_GAP);

    // Symmetric about the frame's centre
    const holeCentre = (hole.left + hole.right) / 2;
    expect(holeCentre - left.x).toBe(right.x + right.width - holeCentre);

    // The flank is the narrower side's width, so that side fills its
    // space and the WIDER side is the one left with slack. That slack is
    // the whole point: without it the text would stretch to the far
    // container edge and stop looking centred on the frame.
    expect(right.x + right.width).toBeLessThan(containerWidth);
  });

  it("bounds each flank at the measure when both sides are enormous", () => {
    const containerWidth = 4000;
    const hole: FlowHole = {
      left: 1800,
      top: -10,
      right: 2200,
      bottom: 100,
    };
    const segments = computeLineSegments(0, LINE_H, containerWidth, hole);

    expect(segments).toHaveLength(2);
    expect(at(segments, 0).width).toBe(MAX_MEASURE);
    expect(at(segments, 1).width).toBe(MAX_MEASURE);
  });

  it("keeps wrapping through the layout at the capped width", () => {
    // 200 chars at 10px each cannot fit the measure on one line, so the
    // layout must break it even though the container is far wider.
    const blocks = [makeBlock("A".repeat(200))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 3000, null);

    expect(result.lines.length).toBeGreaterThan(1);
    for (const line of result.lines) {
      expect(line.width).toBeLessThanOrEqual(MAX_MEASURE);
    }
  });
});

// -----------------------------------------------------------------------
// computeFlowLayout: both-side wrap
// -----------------------------------------------------------------------

describe("computeFlowLayout both-side wrap", () => {
  it("emits two lines with the same y and continuous cursor (regression anchor)", () => {
    // Container 700px. Hole centered: left=250, right=450.
    // leftWidth = 250 - 16(gap) = 234, but that is < BOTH_SIDES_MIN (240).
    // So adjust: hole at left=260, right=440.
    // leftWidth = 260 - 16 = 244, rightStart = 440 + 16 = 456,
    // rightWidth = 700 - 456 = 244.
    // min = 244 >= 240, ratio = 244/244 = 1.0 >= 0.6. Both sides engage.
    const hole: FlowHole = { left: 260, top: 0, right: 440, bottom: 200 };
    // 24 chars, 10px each. left segment fits 24 chars (244/10 = 24),
    // but text is only 24 chars total. Use smaller charWidth to get wrap.
    // charWidth = 10, leftWidth = 244 -> 24 chars per left segment.
    // Use a 48-char text so it wraps across both segments on two rows.
    const text = "AAAAAAAAAAAAAAAAAAAAAAAA" + "BBBBBBBBBBBBBBBBBBBBBBBB"; // 48 chars
    const blocks = [makeBlock(text)];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 700, hole);

    // First line-row: left segment gets 24 chars, right segment gets 24 chars
    // Both at y=0
    const row0Lines = result.lines.filter((l) => l.y === 0);
    expect(row0Lines).toHaveLength(2);
    expect(at(row0Lines, 0).x).toBe(0); // left segment
    expect(at(row0Lines, 1).x).toBe(456); // right segment
    // Cursor continuity: combined text of row 0 covers all 48 chars
    expect(at(row0Lines, 0).text + at(row0Lines, 1).text).toBe(text);
  });

  it("wraps across multiple rows with both-side segments", () => {
    // Same geometry as above, but more text to fill two rows
    const text = "A".repeat(96); // 96 chars, 48 per row
    const hole: FlowHole = { left: 260, top: 0, right: 440, bottom: 200 };
    const blocks = [makeBlock(text)];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 700, hole);

    // Two rows, each with 2 segments
    expect(result.lines).toHaveLength(4);
    expect(at(result.lines, 0).y).toBe(0);
    expect(at(result.lines, 1).y).toBe(0);
    expect(at(result.lines, 2).y).toBe(BODY_METRICS.lineHeight);
    expect(at(result.lines, 3).y).toBe(BODY_METRICS.lineHeight);
  });
});

// -----------------------------------------------------------------------
// computeFlowLayout: single-side wrap
// -----------------------------------------------------------------------

describe("computeFlowLayout single-side wrap", () => {
  it("uses only the wider side when the narrow side is below BOTH_SIDES_MIN", () => {
    // Container 600px, hole near the left edge.
    // hole left=50, right=300. leftWidth = 50-16 = 34 (too small).
    // rightStart = 300+16 = 316. rightWidth = 600-316 = 284 >= MIN_SEGMENT.
    // maxSide = 284 >= 180, so single right segment.
    const hole: FlowHole = { left: 50, top: 0, right: 300, bottom: 200 };
    const blocks = [makeBlock("A".repeat(20))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 600, hole);

    // All lines should be on the right side
    for (const line of result.lines) {
      expect(line.x).toBe(316);
    }
  });

  it("uses the left side when it is wider", () => {
    // Container 600px, hole near the right edge.
    // hole left=400, right=580. leftWidth = 400-16 = 384 >= MIN_SEGMENT.
    // rightStart = 580+16 = 596. rightWidth = 600-596 = 4 (too small).
    // maxSide = leftWidth = 384, single left segment.
    const hole: FlowHole = { left: 400, top: 0, right: 580, bottom: 200 };
    const blocks = [makeBlock("A".repeat(30))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 600, hole);

    for (const line of result.lines) {
      expect(line.x).toBe(0);
    }
  });
});

// -----------------------------------------------------------------------
// computeFlowLayout: hole spanning (jump below hole)
// -----------------------------------------------------------------------

describe("computeFlowLayout hole spanning", () => {
  it("jumps below the hole when both sides are too small", () => {
    // Container 300px, hole covers most of it.
    // hole left=10, right=290. leftWidth = 10-16 = max(0, -6) = 0.
    // rightStart = 290+16 = 306 > 300. rightWidth = max(0, 300-306) = 0.
    // Both < MIN_SEGMENT (180) and maxSide = 0 < MIN_SEGMENT. Segments empty.
    // Layout jumps below the hole (y = hole.bottom + HOLE_GAP).
    const hole: FlowHole = { left: 10, top: 0, right: 290, bottom: 100 };
    const blocks = [makeBlock("A".repeat(10))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 300, hole);

    expect(result.lines.length).toBeGreaterThan(0);
    expect(at(result.lines, 0).y).toBe(100 + HOLE_GAP);
  });
});

// -----------------------------------------------------------------------
// computeFlowLayout: hole entirely outside the container
// -----------------------------------------------------------------------

describe("computeFlowLayout hole outside container", () => {
  it("ignores a hole entirely to the right of the container", () => {
    const hole: FlowHole = { left: 1000, top: 0, right: 1400, bottom: 200 };
    const blocks = [makeBlock("A".repeat(10))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 500, hole);

    // Full-width lines, no wrapping artifact
    expect(at(result.lines, 0).x).toBe(0);
    expect(at(result.lines, 0).width).toBe(100);
  });

  it("ignores a hole entirely above the line band", () => {
    const hole: FlowHole = { left: 100, top: -200, right: 300, bottom: -50 };
    const blocks = [makeBlock("A".repeat(10))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 500, hole);

    expect(at(result.lines, 0).x).toBe(0);
    expect(at(result.lines, 0).width).toBe(100);
  });
});

// -----------------------------------------------------------------------
// computeFlowLayout: narrow container (< MIN_SEGMENT)
// -----------------------------------------------------------------------

describe("computeFlowLayout narrow container", () => {
  it("terminates when containerWidth is below MIN_SEGMENT with no hole", () => {
    const blocks = [makeBlock("AB")];
    const filler = createFixedFiller(blocks, 10);
    // containerWidth = 50 < MIN_SEGMENT (180). No hole.
    // Without a hole, full-width segment is used regardless of MIN_SEGMENT.
    const result = computeFlowLayout(blocks, filler, 50, null);

    expect(result.lines).toHaveLength(1);
    expect(at(result.lines, 0).text).toBe("AB");
  });

  it("forces full-width when container is narrow and hole covers everything", () => {
    // Hole makes both segments 0. Jump below hole, then full-width.
    const hole: FlowHole = { left: 0, top: 0, right: 100, bottom: 50 };
    const blocks = [makeBlock("AB")];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 100, hole);

    // Jumps below the hole, then uses containerWidth as full segment
    expect(at(result.lines, 0).y).toBe(50 + HOLE_GAP);
  });
});

// -----------------------------------------------------------------------
// Zero-progress guard
// -----------------------------------------------------------------------

describe("zero-progress guard", () => {
  it("breaks the fill loop when a filler returns empty text", () => {
    const blocks = [makeBlock("some text that wont matter")];
    const filler = createEmptyFiller();
    // Should not infinite loop; the guard breaks on empty text
    const result = computeFlowLayout(blocks, filler, 500, null);

    expect(result.lines).toHaveLength(0);
  });

  it("breaks the segment fill loop when filler returns empty on a segment", () => {
    // Hole positioned so there is a right segment, but filler returns empty
    const hole: FlowHole = { left: 0, top: 0, right: 100, bottom: 200 };
    const blocks = [makeBlock("text")];
    const filler = createEmptyFiller();
    const result = computeFlowLayout(blocks, filler, 500, hole);

    // The filler returns empty on the first segment call, guard breaks
    expect(result.lines).toHaveLength(0);
  });
});

// -----------------------------------------------------------------------
// Wrap-policy boundary tests
// -----------------------------------------------------------------------

describe("wrap policy boundaries", () => {
  it("engages both-side wrap at exactly BOTH_SIDES_MIN on each side", () => {
    // leftWidth = BOTH_SIDES_MIN, rightWidth = BOTH_SIDES_MIN
    const holeW = 100;
    const holeLeft = BOTH_SIDES_MIN + HOLE_GAP;
    const holeRight = holeLeft + holeW;
    const rightStart = holeRight + HOLE_GAP;
    const containerW = rightStart + BOTH_SIDES_MIN;
    const hole: FlowHole = {
      left: holeLeft,
      top: 0,
      right: holeRight,
      bottom: 200,
    };
    const blocks = [makeBlock("A".repeat(48))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, containerW, hole);

    const row0 = result.lines.filter((l) => l.y === 0);
    expect(row0).toHaveLength(2);
  });

  it("falls back to single-side just below BOTH_SIDES_MIN", () => {
    // leftWidth = BOTH_SIDES_MIN - 1 (just under threshold)
    const holeW = 100;
    const holeLeft = BOTH_SIDES_MIN - 1 + HOLE_GAP;
    const holeRight = holeLeft + holeW;
    const rightStart = holeRight + HOLE_GAP;
    // Right side well above BOTH_SIDES_MIN so it is the wider side
    const rightWidth = 300;
    const containerW = rightStart + rightWidth;
    const hole: FlowHole = {
      left: holeLeft,
      top: 0,
      right: holeRight,
      bottom: 200,
    };
    const blocks = [makeBlock("A".repeat(20))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, containerW, hole);

    // Only right-side lines
    for (const line of result.lines) {
      expect(line.x).toBe(rightStart);
    }
  });

  it("falls back to single-side when ratio is just below BALANCE_RATIO", () => {
    // leftWidth = BOTH_SIDES_MIN, rightWidth chosen so ratio is just under BALANCE_RATIO
    // BOTH_SIDES_MIN / rightWidth < BALANCE_RATIO
    // rightWidth = floor(BOTH_SIDES_MIN / BALANCE_RATIO) + 1
    const rightWidth = Math.floor(BOTH_SIDES_MIN / BALANCE_RATIO) + 1;
    const holeW = 100;
    const holeLeft = BOTH_SIDES_MIN + HOLE_GAP;
    const holeRight = holeLeft + holeW;
    const rightStart = holeRight + HOLE_GAP;
    const containerW = rightStart + rightWidth;
    const hole: FlowHole = {
      left: holeLeft,
      top: 0,
      right: holeRight,
      bottom: 200,
    };
    const blocks = [makeBlock("A".repeat(30))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, containerW, hole);

    // Single side: right is wider
    for (const line of result.lines) {
      expect(line.x).toBe(rightStart);
    }
  });

  it("engages both-side wrap at exactly BALANCE_RATIO", () => {
    // leftWidth = BOTH_SIDES_MIN, rightWidth = BOTH_SIDES_MIN / BALANCE_RATIO
    // ratio = BOTH_SIDES_MIN / rightWidth = BALANCE_RATIO exactly
    const rightWidth = BOTH_SIDES_MIN / BALANCE_RATIO;
    const holeW = 100;
    const holeLeft = BOTH_SIDES_MIN + HOLE_GAP;
    const holeRight = holeLeft + holeW;
    const rightStart = holeRight + HOLE_GAP;
    const containerW = rightStart + rightWidth;
    const hole: FlowHole = {
      left: holeLeft,
      top: 0,
      right: holeRight,
      bottom: 200,
    };
    const blocks = [makeBlock("A".repeat(60))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, containerW, hole);

    const row0 = result.lines.filter((l) => l.y === 0);
    expect(row0).toHaveLength(2);
  });
});

// -----------------------------------------------------------------------
// scrollTargetForBlock
// -----------------------------------------------------------------------

describe("scrollTargetForBlock", () => {
  it("returns the scrollY that places the target block at the reading line", () => {
    const blocks = [
      makeBlock(
        "Title",
        "sub-heading",
        "login" as FlowBlock["sectionId"],
        "overview",
      ),
      makeBlock(
        "Body text here",
        "sub-body",
        "login" as FlowBlock["sectionId"],
        "overview",
      ),
    ];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 500, null);
    const containerTop = 100;
    const readingLineViewportY = 300;

    const target = scrollTargetForBlock(
      "login" as FlowBlock["sectionId"],
      "overview",
      result,
      blocks,
      containerTop,
      readingLineViewportY,
    );
    // block 0 topY = 0. documentTop = 100 + 0 = 100.
    // scrollY = 100 - 300 = -200 -> clamped to 0.
    expect(target).toBe(0);
  });

  it("clamps the result to 0 when the target is above the reading line", () => {
    const blocks = [
      makeBlock(
        "Title",
        "sub-heading",
        "login" as FlowBlock["sectionId"],
        "overview",
      ),
    ];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 500, null);

    // containerTop = 50, readingLineY = 400. documentTop = 50 + 0 = 50.
    // scrollY = 50 - 400 = -350 -> 0
    const target = scrollTargetForBlock(
      "login" as FlowBlock["sectionId"],
      "overview",
      result,
      blocks,
      50,
      400,
    );
    expect(target).toBe(0);
  });

  it("returns null when the target sub is not found", () => {
    const blocks = [
      makeBlock(
        "Title",
        "sub-heading",
        "login" as FlowBlock["sectionId"],
        "overview",
      ),
    ];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 500, null);

    const target = scrollTargetForBlock(
      "login" as FlowBlock["sectionId"],
      "nonexistent",
      result,
      blocks,
      100,
      300,
    );
    expect(target).toBeNull();
  });

  it("returns a positive scrollY when the block is far down the page", () => {
    // Two long bodies so the third block clears the reading line.
    // At 10px per char in a 500px container, 50 chars per line and a
    // 24px line height: 1000 chars is 20 lines, so 480px per body.
    // The heading lands at 480 + 480 + its 32px top margin = 992, and
    // the target is containerTop 100 + 992 - readingLine 300 = 792.
    const blocks = [
      makeBlock(
        "A".repeat(1000),
        "sub-body",
        "login" as FlowBlock["sectionId"],
        "first",
      ),
      makeBlock(
        "B".repeat(1000),
        "sub-body",
        "login" as FlowBlock["sectionId"],
        "second",
      ),
      makeBlock(
        "Target",
        "sub-heading",
        "login" as FlowBlock["sectionId"],
        "target",
      ),
    ];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 500, null);

    const containerTop = 100;
    const readingLineY = 300;
    const target = scrollTargetForBlock(
      "login" as FlowBlock["sectionId"],
      "target",
      result,
      blocks,
      containerTop,
      readingLineY,
    );
    expect(target).not.toBeNull();
    if (target === null) throw new Error("expected non-null target");
    // Derived from the block's own geometry rather than hardcoded, so
    // typography changes move the target instead of failing the test.
    const targetTopY = at(result.blocks, 2).topY;
    expect(target).toBe(containerTop + targetTopY - readingLineY);
    expect(target).toBeGreaterThan(0);
  });
});

// -----------------------------------------------------------------------
// locationAtY
// -----------------------------------------------------------------------

describe("locationAtY", () => {
  const blocks = [
    makeBlock(
      "Heading",
      "sub-heading",
      "login" as FlowBlock["sectionId"],
      "overview",
    ),
    makeBlock(
      "Body text for the section",
      "sub-body",
      "login" as FlowBlock["sectionId"],
      "overview",
    ),
    makeBlock(
      "Another heading",
      "sub-heading",
      "login" as FlowBlock["sectionId"],
      "details",
    ),
  ];

  function buildResult(): ReturnType<typeof computeFlowLayout> {
    const filler = createFixedFiller(blocks, 10);
    return computeFlowLayout(blocks, filler, 500, null);
  }

  it("returns the correct location when y falls inside a block", () => {
    const result = buildResult();
    // First block starts at y=0
    const loc = locationAtY(1, result, blocks);
    expect(loc).toEqual({ sectionId: "login", subSlug: "overview" });
  });

  it("returns the nearest block above when y is between blocks", () => {
    const result = buildResult();
    // Find a y between block 0's bottomY and block 1's topY
    const gap = at(result.blocks, 0).bottomY + 1;
    // If this falls between blocks, it should return block 0's location
    const loc = locationAtY(gap, result, blocks);
    expect(loc).not.toBeNull();
    if (loc === null) throw new Error("expected non-null location");
    expect(loc.sectionId).toBe("login");
  });

  it("returns the first block's location when y is above all blocks", () => {
    const result = buildResult();
    const loc = locationAtY(-100, result, blocks);
    expect(loc).toEqual({ sectionId: "login", subSlug: null });
  });

  it("returns null when no blocks exist", () => {
    const emptyResult = {
      lines: [],
      blocks: [],
      figures: [],
      totalHeight: 0,
    };
    const loc = locationAtY(50, emptyResult, []);
    expect(loc).toBeNull();
  });
});

// -----------------------------------------------------------------------
// hitTestBlock
// -----------------------------------------------------------------------

describe("hitTestBlock", () => {
  const blocks = [
    makeBlock(
      "A".repeat(50),
      "sub-body",
      "login" as FlowBlock["sectionId"],
      "overview",
    ),
    makeBlock(
      "B".repeat(50),
      "sub-body",
      "login" as FlowBlock["sectionId"],
      "details",
    ),
  ];

  function buildResult(): ReturnType<typeof computeFlowLayout> {
    const filler = createFixedFiller(blocks, 10);
    return computeFlowLayout(blocks, filler, 500, null);
  }

  it("returns the block index when the point falls on a line", () => {
    const result = buildResult();
    // First line of first block: x=0, y=0, width=500
    const bi = hitTestBlock(10, 5, result, DEFAULT_METRICS, blocks);
    expect(bi).toBe(0);
  });

  it("returns null when the point is outside all blocks", () => {
    const result = buildResult();
    const bi = hitTestBlock(10, 9999, result, DEFAULT_METRICS, blocks);
    expect(bi).toBeNull();
  });

  it("returns null when x is outside the line width", () => {
    const result = buildResult();
    // First line width = 500, so x=501 is outside
    const bi = hitTestBlock(501, 5, result, DEFAULT_METRICS, blocks);
    expect(bi).toBeNull();
  });

  it("distinguishes between adjacent blocks", () => {
    const result = buildResult();
    // Second block starts after the first
    const block1Bottom = at(result.blocks, 1).topY;
    const bi = hitTestBlock(
      10,
      block1Bottom + 1,
      result,
      DEFAULT_METRICS,
      blocks,
    );
    expect(bi).toBe(1);
  });

  it("does not claim figure block rects", () => {
    const figBlocks: FlowBlock[] = [makeBlock("A".repeat(20)), makeFigure()];
    const filler = createFixedFiller(figBlocks, 10);
    const result = computeFlowLayout(figBlocks, filler, 500, null);

    // The figure block has geometry (topY/bottomY) but hitTestBlock
    // must skip it: clicks on the video are the figure's own business.
    const figGeo = at(result.blocks, 1);
    const midY = (figGeo.topY + figGeo.bottomY) / 2;
    const bi = hitTestBlock(100, midY, result, DEFAULT_METRICS, figBlocks);
    expect(bi).toBeNull();
  });
});

// -----------------------------------------------------------------------
// Figure block placement
// -----------------------------------------------------------------------

describe("figure block placement", () => {
  const ASPECT = 390 / 220;

  it("places a figure in the text band, capped to MAX_FIGURE_WIDTH", () => {
    const blocks: FlowBlock[] = [makeFigure(ASPECT)];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 500, null);

    expect(result.figures).toHaveLength(1);
    const fig = at(result.figures, 0);
    expect(fig.blockIndex).toBe(0);
    expect(fig.width).toBeLessThanOrEqual(MAX_FIGURE_WIDTH);
    expect(fig.height).toBe(Math.round(fig.width / ASPECT));
  });

  it("centres the figure in the band", () => {
    const blocks: FlowBlock[] = [makeFigure(ASPECT)];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 500, null);

    const fig = at(result.figures, 0);
    // The band width is capped by MAX_MEASURE when no hole present.
    // When containerWidth < MAX_MEASURE, band = containerWidth.
    // When containerWidth > MAX_MEASURE, band = MAX_MEASURE, x starts at centre offset.
    // For 500 < MAX_MEASURE (620), band is full width.
    const bandWidth = 500;
    const expectedX = (bandWidth - fig.width) / 2;
    expect(fig.x).toBeCloseTo(expectedX, 5);
  });

  it("uses the band width when it is narrower than MAX_FIGURE_WIDTH", () => {
    // Container 150px is below MIN_SEGMENT so no-hole path uses full width.
    // But 150 < MAX_FIGURE_WIDTH, so figure width = 150.
    const blocks: FlowBlock[] = [makeFigure(ASPECT)];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 150, null);

    expect(result.figures).toHaveLength(1);
    const fig = at(result.figures, 0);
    expect(fig.width).toBe(150);
  });

  it("drops below the hole when no band fits the figure", () => {
    // Hole covers the entire container width: no segments available.
    const hole: FlowHole = { left: 0, top: 0, right: 500, bottom: 100 };
    const blocks: FlowBlock[] = [makeFigure(ASPECT)];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 500, hole);

    expect(result.figures).toHaveLength(1);
    const fig = at(result.figures, 0);
    // Figure should be placed below the hole.
    expect(fig.y).toBeGreaterThanOrEqual(100 + HOLE_GAP);
  });

  it("records correct block geometry for a figure", () => {
    const blocks: FlowBlock[] = [makeFigure(ASPECT)];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 500, null);

    const geo = at(result.blocks, 0);
    const fig = at(result.figures, 0);
    // Block geometry must enclose the figure.
    expect(geo.topY).toBeLessThanOrEqual(fig.y);
    expect(geo.bottomY).toBeGreaterThanOrEqual(fig.y + fig.height);
    // Figure blocks have no lines.
    expect(geo.lineCount).toBe(0);
  });

  it("places a figure after text in a mixed flow", () => {
    const blocks: FlowBlock[] = [
      makeBlock("A".repeat(50)),
      makeFigure(ASPECT),
      makeBlock("B".repeat(50)),
    ];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 500, null);

    expect(result.figures).toHaveLength(1);
    const textGeo0 = at(result.blocks, 0);
    const figGeo = at(result.blocks, 1);
    const textGeo2 = at(result.blocks, 2);
    const fig = at(result.figures, 0);

    // The figure sits between the two text blocks.
    expect(fig.y).toBeGreaterThanOrEqual(textGeo0.bottomY);
    expect(figGeo.bottomY).toBeLessThanOrEqual(textGeo2.topY);
  });

  it("figure belongs to its sub-section for scrollspy", () => {
    const blocks: FlowBlock[] = [
      makeBlock(
        "Heading",
        "sub-heading",
        "login" as FlowBlock["sectionId"],
        "credentials",
      ),
      makeBlock(
        "Body text",
        "sub-body",
        "login" as FlowBlock["sectionId"],
        "credentials",
      ),
      makeFigure(ASPECT, "login" as FlowBlock["sectionId"], "credentials"),
    ];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 500, null);

    const figGeo = at(result.blocks, 2);
    const midY = (figGeo.topY + figGeo.bottomY) / 2;
    const loc = locationAtY(midY, result, blocks);
    expect(loc).toEqual({
      sectionId: "login",
      subSlug: "credentials",
    });
  });
});
