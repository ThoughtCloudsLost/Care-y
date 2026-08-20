import { describe, it, expect } from "vitest";
import {
  computeFlowLayout,
  scrollTargetForBlock,
  locationAtY,
  hitTestBlock,
  computeColumnSegments,
  DEFAULT_METRICS,
  HOLE_GAP,
  MAX_FIGURE_WIDTH,
  MIN_SEGMENT,
  SHIFT_MAX,
  FULL_BLEED_SLIVER,
  FULL_BLEED_EXTENT,
  extendHoleForFullBleed,
} from "./flow-layout.js";
import type {
  FlowBlock,
  FlowTextBlock,
  FlowFigureBlock,
  FlowColumn,
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
// Markup unit fields
// -----------------------------------------------------------------------

describe("computeFlowLayout markup unit fields", () => {
  it("adds spaceBefore above a block on top of its marginTop", () => {
    const plain = makeBlock("aaaa");
    const spaced: FlowTextBlock = { ...makeBlock("bbbb"), spaceBefore: 12 };
    const blocks = [plain, spaced];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 200, null);

    const first = at(result.blocks, 0);
    const second = at(result.blocks, 1);
    // sub-body marginTop is 0, so the whole gap is the spaceBefore.
    expect(second.topY).toBe(first.bottomY + 12);
  });

  it("insets every line of an indented block and narrows its measure", () => {
    // 20 chars at 10px in a 200px container: unindented fits one line.
    const blocks: FlowTextBlock[] = [
      { ...makeBlock("aaaaaaaaaaaaaaaaaaaa"), indent: 40 },
    ];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(blocks, filler, 200, null);

    // 160px of room fits 16 chars, so the text wraps to two lines,
    // both starting at the indent.
    expect(result.lines).toHaveLength(2);
    expect(at(result.lines, 0).x).toBe(40);
    expect(at(result.lines, 1).x).toBe(40);
    expect(at(result.lines, 0).text).toHaveLength(16);
  });

  it("keeps zero indent behavior identical to an absent indent", () => {
    const bare = [makeBlock("aaaaaaaaaa")];
    const zero: FlowTextBlock[] = [{ ...makeBlock("aaaaaaaaaa"), indent: 0 }];
    const bareResult = computeFlowLayout(
      bare,
      createFixedFiller(bare, 10),
      200,
      null,
    );
    const zeroResult = computeFlowLayout(
      zero,
      createFixedFiller(zero, 10),
      200,
      null,
    );
    expect(zeroResult.lines).toEqual(bareResult.lines);
    expect(zeroResult.totalHeight).toBe(bareResult.totalHeight);
  });

  it("passes filler fragments through onto the emitted lines", () => {
    const blocks = [makeBlock("abcd")];
    const fragments = [
      { text: "ab", bold: false, dx: 0, width: 20 },
      { text: "cd", bold: true, dx: 20, width: 20 },
    ];
    const filler: LineFiller = {
      startCursor(): LineCursor {
        return 0;
      },
      fillLine(
        _blockIndex: number,
        cursor: LineCursor,
        _maxWidth: number,
      ): LineFillerResult | null {
        if ((cursor as number) > 0) return null;
        return { text: "abcd", width: 40, nextCursor: 1, fragments };
      },
    };
    const result = computeFlowLayout(blocks, filler, 200, null);
    expect(result.lines).toHaveLength(1);
    expect(at(result.lines, 0).fragments).toEqual(fragments);
  });

  it("leaves fragments undefined for plain fillers", () => {
    const blocks = [makeBlock("aaaa")];
    const result = computeFlowLayout(
      blocks,
      createFixedFiller(blocks, 10),
      200,
      null,
    );
    expect(at(result.lines, 0).fragments).toBeUndefined();
  });
});

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
    // Default column spans the full container (500px). The figure is
    // centred within the column.
    const bandWidth = 500;
    const expectedX = (bandWidth - fig.width) / 2;
    expect(fig.x).toBeCloseTo(expectedX, 5);
  });

  it("uses the band width when it is narrower than MAX_FIGURE_WIDTH", () => {
    // Default column is 150px (full container width).
    // 150 < MAX_FIGURE_WIDTH, so figure width = 150.
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

// -----------------------------------------------------------------------
// Full-bleed frame: scroll-invariant hole
// -----------------------------------------------------------------------

describe("extendHoleForFullBleed", () => {
  // Column [0, 800]. Hole in the middle: column-relative flanks are
  // 284px each, both clearing MIN_SEGMENT (180).
  const col: FlowColumn = { x: 0, width: 800 };
  const baseHole: FlowHole = { left: 300, top: 100, right: 500, bottom: 600 };
  const SLIVER = FULL_BLEED_SLIVER - 1;

  it("stretches the hole vertically when both gaps are slivers", () => {
    const out = extendHoleForFullBleed(baseHole, SLIVER, SLIVER, 800, col);
    expect(out.top).toBe(-FULL_BLEED_EXTENT);
    expect(out.bottom).toBe(FULL_BLEED_EXTENT);
  });

  it("keeps the horizontal edges untouched in full-bleed mode", () => {
    const out = extendHoleForFullBleed(baseHole, SLIVER, SLIVER, 800, col);
    expect(out.left).toBe(baseHole.left);
    expect(out.right).toBe(baseHole.right);
  });

  it("returns the hole unchanged when the gap above fits three lines", () => {
    const out = extendHoleForFullBleed(
      baseHole,
      FULL_BLEED_SLIVER,
      SLIVER,
      800,
      col,
    );
    expect(out).toEqual(baseHole);
  });

  it("returns the hole unchanged when the gap below fits three lines", () => {
    const out = extendHoleForFullBleed(
      baseHole,
      SLIVER,
      FULL_BLEED_SLIVER,
      800,
      col,
    );
    expect(out).toEqual(baseHole);
  });

  it("returns the hole unchanged when neither column flank clears MIN_SEGMENT", () => {
    // Column [0, 400], centred hole: flanks are 134px and 34px, both
    // under MIN_SEGMENT. Stretching would push all text below the hole.
    const narrowCol: FlowColumn = { x: 0, width: 400 };
    const narrow: FlowHole = { left: 150, top: 100, right: 350, bottom: 600 };
    expect(150 - HOLE_GAP).toBeLessThan(MIN_SEGMENT);
    const out = extendHoleForFullBleed(narrow, SLIVER, SLIVER, 400, narrowCol);
    expect(out).toEqual(narrow);
  });

  it("engages when only one column flank is viable", () => {
    // Hole hugs the right edge of the column: right flank is 0, left is 484.
    const offset: FlowHole = { left: 500, top: 100, right: 800, bottom: 600 };
    const out = extendHoleForFullBleed(offset, SLIVER, SLIVER, 800, col);
    expect(out.top).toBe(-FULL_BLEED_EXTENT);
    expect(out.bottom).toBe(FULL_BLEED_EXTENT);
  });

  it("keeps every layout line within the column flanks of a stretched hole", () => {
    const blocks: FlowBlock[] = [makeBlock("x".repeat(400), "sub-body")];
    const filler = createFixedFiller(blocks, 10);
    const stretched = extendHoleForFullBleed(
      baseHole,
      SLIVER,
      SLIVER,
      800,
      col,
    );
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      stretched,
      DEFAULT_METRICS,
      col,
    );

    expect(result.lines.length).toBeGreaterThan(0);
    for (const line of result.lines) {
      // Lines stay within the column or shifted by at most SHIFT_MAX.
      const inLeftFlank = line.x + line.width <= baseHole.left - HOLE_GAP;
      const inRightFlank = line.x >= baseHole.right + HOLE_GAP;
      expect(inLeftFlank || inRightFlank).toBe(true);
    }
  });
});

// -----------------------------------------------------------------------
// Column-aware layout: computeColumnSegments
// -----------------------------------------------------------------------

describe("computeColumnSegments", () => {
  const LINE_H = 24;
  const col: FlowColumn = { x: 0, width: 400 };

  it("returns the plain column segment when no hole exists", () => {
    const segs = computeColumnSegments(0, LINE_H, 800, col, null);
    expect(segs).toHaveLength(1);
    expect(at(segs, 0)).toEqual({ x: 0, width: 400 });
  });

  it("returns the plain column segment when the line does not overlap the hole", () => {
    const hole: FlowHole = { left: 100, top: 200, right: 300, bottom: 400 };
    const segs = computeColumnSegments(0, LINE_H, 800, col, hole);
    expect(segs).toHaveLength(1);
    expect(at(segs, 0)).toEqual({ x: 0, width: 400 });
  });

  it("returns the plain column when the hole is horizontally outside the column", () => {
    const rightCol: FlowColumn = { x: 400, width: 400 };
    const hole: FlowHole = { left: 100, top: 0, right: 300, bottom: 200 };
    const segs = computeColumnSegments(0, LINE_H, 800, rightCol, hole);
    expect(segs).toHaveLength(1);
    expect(at(segs, 0)).toEqual({ x: 400, width: 400 });
  });

  it("returns two in-column flanks when the hole is interior and both sides clear MIN_SEGMENT", () => {
    // Column [0, 500], hole in the middle: flanks 184 and 184.
    const wideCol: FlowColumn = { x: 0, width: 500 };
    // left flank = 200 - 16 = 184, right flank = 500 - (300 + 16) = 184
    const hole: FlowHole = { left: 200, top: 0, right: 300, bottom: 200 };
    const segs = computeColumnSegments(0, LINE_H, 800, wideCol, hole);
    expect(segs).toHaveLength(2);
    expect(at(segs, 0)).toEqual({ x: 0, width: 184 });
    expect(at(segs, 1)).toEqual({ x: 316, width: 184 });
  });

  it("returns a single constrained segment with shift slack when one flank is viable", () => {
    // Column [0, 400], hole left edge near column left.
    // left flank = 50 - 16 = 34 (under MIN_SEGMENT)
    // right flank = 400 - (200 + 16) = 184 (viable)
    const hole: FlowHole = { left: 50, top: 0, right: 200, bottom: 200 };
    // With col at [0,400]: right slack = min(72, containerWidth - 400)
    // x = 216, width = min(184 + slack, containerWidth - 216)
    const segs = computeColumnSegments(0, LINE_H, 800, col, hole);
    expect(segs.length).toBeGreaterThanOrEqual(1);
    // The right flank starts at 216; SHIFT_MAX slack extends it to 256 max.
    const seg = at(segs, 0);
    expect(seg.x).toBe(216);
    expect(seg.width).toBe(184 + Math.min(SHIFT_MAX, 800 - 400));
  });

  it("returns empty when neither flank clears MIN_SEGMENT", () => {
    // Column [0, 250], hole covers most of it.
    const narrowCol: FlowColumn = { x: 0, width: 250 };
    // left flank = 50 - 16 = 34, right flank = 250 - (200 + 16) = 34
    const hole: FlowHole = { left: 50, top: 0, right: 200, bottom: 200 };
    const segs = computeColumnSegments(0, LINE_H, 800, narrowCol, hole);
    expect(segs).toHaveLength(0);
  });
});

// -----------------------------------------------------------------------
// Column-aware layout: base wrap in column
// -----------------------------------------------------------------------

describe("computeFlowLayout with column (base wrap)", () => {
  it("wraps text within the column bounds, not the full container", () => {
    const col: FlowColumn = { x: 100, width: 200 };
    const blocks = [makeBlock("A".repeat(30))];
    const filler = createFixedFiller(blocks, 10);
    // Container 800px, but column is only 200px wide.
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      null,
      DEFAULT_METRICS,
      col,
    );

    // 200px / 10px = 20 chars per line, 30 chars total -> 2 lines.
    expect(result.lines).toHaveLength(2);
    // Lines start at column.x, not at 0.
    expect(at(result.lines, 0).x).toBe(100);
    expect(at(result.lines, 1).x).toBe(100);
    expect(at(result.lines, 0).text).toHaveLength(20);
    expect(at(result.lines, 1).text).toHaveLength(10);
  });

  it("uses full container width when no explicit column is given", () => {
    // The default column spans the full container, so omitting it
    // and passing an explicit full-width column produce the same layout.
    const blocks = [makeBlock("A".repeat(60))];
    const filler = createFixedFiller(blocks, 10);
    const fullCol: FlowColumn = { x: 0, width: 600 };

    const implicit = computeFlowLayout(blocks, filler, 600, null);
    const explicit = computeFlowLayout(
      blocks,
      filler,
      600,
      null,
      DEFAULT_METRICS,
      fullCol,
    );

    expect(explicit.lines).toEqual(implicit.lines);
    expect(explicit.blocks).toEqual(implicit.blocks);
    expect(explicit.totalHeight).toBe(implicit.totalHeight);
  });
});

// -----------------------------------------------------------------------
// Column-aware layout: shift cap and direction
// -----------------------------------------------------------------------

describe("computeFlowLayout with column (shift dodge)", () => {
  it("shifts lines away from the hole (hole to the right, shift left)", () => {
    // Column [100, 400] (width 300). 24 chars at 10px = 240px line width.
    // Line at [100, 340]. Hole at [310, 500]: gapLeft = 294.
    // Hole center (405) > column center (250) -> shift left.
    // Shift: lineRight(340) - gapLeft(294) = 46 <= SHIFT_MAX(72).
    // newX = 100 - 46 = 54, lineRight = 294. 294 <= 294 -> clears.
    const col: FlowColumn = { x: 100, width: 300 };
    const hole: FlowHole = { left: 310, top: 0, right: 500, bottom: 200 };
    const blocks = [makeBlock("A".repeat(24))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      hole,
      DEFAULT_METRICS,
      col,
    );

    expect(result.lines).toHaveLength(1);
    const line = at(result.lines, 0);
    expect(line.x).toBe(54);
    expect(line.x + line.width).toBeLessThanOrEqual(hole.left - HOLE_GAP);
  });

  it("shifts lines away from the hole (hole to the left, shift right)", () => {
    // Column [200, 500] (width 300). 15 chars at 10px = 150px line width.
    // Line at [200, 350]. Hole at [100, 230]: gapRight = 246.
    // Hole center (165) < column center (350) -> shift right.
    // Shift: gapRight(246) - lineLeft(200) = 46 <= 72.
    // newX = 200 + 46 = 246. Check: 246 < 246 is false -> clears.
    const col: FlowColumn = { x: 200, width: 300 };
    const hole: FlowHole = { left: 100, top: 0, right: 230, bottom: 200 };
    const blocks = [makeBlock("A".repeat(15))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      hole,
      DEFAULT_METRICS,
      col,
    );

    expect(result.lines).toHaveLength(1);
    const line = at(result.lines, 0);
    expect(line.x).toBe(246);
    expect(line.x).toBeGreaterThanOrEqual(hole.right + HOLE_GAP);
  });

  it("caps shift at SHIFT_MAX and falls back to constrained refill", () => {
    // Column [0, 400], hole requiring a shift > SHIFT_MAX.
    const col: FlowColumn = { x: 0, width: 400 };
    // Hole at [200, 350]: gapLeft = 184, gapRight = 366.
    // 40-char text at 10px = 400px fills the column.
    // Shift left to clear: lineRight(400) - gapLeft(184) = 216 > 72.
    // Shift right to clear: gapRight(366) - lineLeft(0) = 366 > 72.
    // Shift fails -> constrained refill.
    // Left flank: 184, right flank: 400 - 366 = 34.
    // Left flank 184 >= 180 = MIN_SEGMENT, right 34 < 180.
    // Constrained: left flank + slack left = min(72, 0) = 0.
    // Segment: x = 0, width = 184.
    const hole: FlowHole = { left: 200, top: 0, right: 350, bottom: 200 };
    const blocks = [makeBlock("A".repeat(40))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      hole,
      DEFAULT_METRICS,
      col,
    );

    expect(result.lines.length).toBeGreaterThan(0);
    for (const line of result.lines) {
      // All lines from the constrained refill should respect the hole.
      if (line.y < hole.bottom && line.y + BODY_METRICS.lineHeight > hole.top) {
        // Overlapping lines must not cross into the hole gap.
        const gapLeft = hole.left - HOLE_GAP;
        expect(line.x + line.width).toBeLessThanOrEqual(gapLeft);
      }
    }
  });

  it("clamps shifted lines to the container edge (no negative x)", () => {
    // Column at x=30 (width 300). 22-char text at 10px = 220px line width.
    // Line at [30, 250]. Hole at [240, 500]: gapLeft = 224.
    // Hole center (370) > column center (180) -> shift left.
    // Shift: lineRight(250) - gapLeft(224) = 26. newX = 30 - 26 = 4.
    // Clamped to max(0, 4) = 4. lineRight = 224 <= 224 -> clears.
    // The clamp to 0 engages only when newX < 0, so use a wider shift
    // that would go negative without clamping:
    // Column at x=10, 23 chars at 10px = 230px. Line [10, 240].
    // Hole at [228, 500]: gapLeft = 212. Shift: 240 - 212 = 28.
    // newX = 10 - 28 = -18, clamped to 0. lineRight = 230. 230 > 212 -> fails.
    // Shift fails but that tests the clamp path. The layout falls to
    // constrained refill with left flank 202 (>= 180).
    const col: FlowColumn = { x: 10, width: 300 };
    const hole: FlowHole = { left: 228, top: 0, right: 500, bottom: 200 };
    const blocks = [makeBlock("A".repeat(23))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      hole,
      DEFAULT_METRICS,
      col,
    );

    expect(result.lines.length).toBeGreaterThan(0);
    for (const line of result.lines) {
      expect(line.x).toBeGreaterThanOrEqual(0);
      if (line.y < hole.bottom && line.y + BODY_METRICS.lineHeight > hole.top) {
        expect(line.x + line.width).toBeLessThanOrEqual(hole.left - HOLE_GAP);
      }
    }
  });

  it("clamps shifted lines to the container right edge", () => {
    // Column near the right edge of the container, hole to the left.
    const col: FlowColumn = { x: 450, width: 300 };
    // Container is 780px. 25-char text at 10px = 250px.
    // Hole at [400, 500]: gapRight = 516. Line [450, 700], overlaps.
    // Shift right: 516 - 450 = 66. newX = 450 + 66 = 516.
    // lineRight = 516 + 250 = 766, clamped to max containerWidth - width = 780 - 250 = 530.
    // But 516 <= 530, so no clamp needed.
    // Check: newX(516) < gapRight(516)? No (strict <). Clears.
    const hole: FlowHole = { left: 400, top: 0, right: 500, bottom: 200 };
    const blocks = [makeBlock("A".repeat(25))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(
      blocks,
      filler,
      780,
      hole,
      DEFAULT_METRICS,
      col,
    );

    expect(result.lines).toHaveLength(1);
    const line = at(result.lines, 0);
    expect(line.x + line.width).toBeLessThanOrEqual(780);
    expect(line.x).toBeGreaterThanOrEqual(hole.right + HOLE_GAP);
  });
});

// -----------------------------------------------------------------------
// Column-aware layout: constrained refill
// -----------------------------------------------------------------------

describe("computeFlowLayout with column (constrained refill)", () => {
  it("refills against constrained segments when shift is not sufficient", () => {
    // Column [0, 400], large hole covering the middle.
    const col: FlowColumn = { x: 0, width: 400 };
    const hole: FlowHole = { left: 150, top: 0, right: 350, bottom: 200 };
    // Left flank: 150 - 16 = 134 (< MIN_SEGMENT)
    // Right flank: 400 - 366 = 34 (< MIN_SEGMENT)
    // Neither flank viable -> empty segments -> jump below hole.
    const blocks = [makeBlock("A".repeat(40))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      hole,
      DEFAULT_METRICS,
      col,
    );

    expect(result.lines.length).toBeGreaterThan(0);
    // All lines should be below the hole.
    for (const line of result.lines) {
      expect(line.y).toBeGreaterThanOrEqual(hole.bottom + HOLE_GAP);
    }
  });

  it("uses two in-column flanks when hole is interior and both sides are viable", () => {
    // Column [0, 500], hole centered with viable flanks.
    const col: FlowColumn = { x: 0, width: 500 };
    // Left flank: 200 - 16 = 184 >= 180, right flank: 500 - 316 = 184 >= 180.
    const hole: FlowHole = { left: 200, top: 0, right: 300, bottom: 200 };
    // 36 chars at 10px = 360px total. Left flank fits 18 chars, right fits 18.
    const blocks = [makeBlock("A".repeat(36))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      hole,
      DEFAULT_METRICS,
      col,
    );

    // Shift fails (line width 360 > both flanks).
    // Constrained: two flanks of 184px each.
    // 184px / 10px = 18 chars per segment, 36 chars -> 2 segments on one row.
    const row0 = result.lines.filter((l) => l.y === 0);
    expect(row0).toHaveLength(2);
    // Left segment bounded by column: x = 0.
    expect(at(row0, 0).x).toBe(0);
    // Right segment at gapRight = 316.
    expect(at(row0, 1).x).toBe(316);
  });
});

// -----------------------------------------------------------------------
// Column-aware layout: jump-below fallback
// -----------------------------------------------------------------------

describe("computeFlowLayout with column (jump below)", () => {
  it("jumps below the hole when no constrained segment clears MIN_SEGMENT", () => {
    // Column [0, 250], hole covering most of the column.
    const col: FlowColumn = { x: 0, width: 250 };
    // Left flank: 50 - 16 = 34, right flank: 250 - 216 = 34. Both < 180.
    const hole: FlowHole = { left: 50, top: 0, right: 200, bottom: 100 };
    const blocks = [makeBlock("A".repeat(20))];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      hole,
      DEFAULT_METRICS,
      col,
    );

    expect(result.lines.length).toBeGreaterThan(0);
    expect(at(result.lines, 0).y).toBeGreaterThanOrEqual(
      hole.bottom + HOLE_GAP,
    );
  });
});

// -----------------------------------------------------------------------
// Column-aware layout: indent + marker under shift
// -----------------------------------------------------------------------

describe("computeFlowLayout with column (indent under shift)", () => {
  it("applies indent before shift so segment width stays correct", () => {
    // Column [0, 300], indent of 22px. Text fills the indented width.
    // Effective segment = 300 - 22 = 278px. 27 chars at 10px = 270px.
    // No hole: lines start at indent (22), width 270.
    const col: FlowColumn = { x: 0, width: 300 };
    const blocks: FlowTextBlock[] = [
      { ...makeBlock("A".repeat(27)), indent: 22, marker: "1." },
    ];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      null,
      DEFAULT_METRICS,
      col,
    );

    expect(result.lines).toHaveLength(1);
    const line = at(result.lines, 0);
    // Line x = column.x + indent = 0 + 22 = 22.
    expect(line.x).toBe(22);
    expect(line.width).toBe(270);
  });

  it("preserves indent through a shifted line", () => {
    // Column [50, 350] (width 300), indent 22. 20-char text at 10px = 200px.
    // Effective segment = 278, fits 27 chars, but text is only 20 chars.
    // Line at [72, 272] (x = 50 + 22, width = 200).
    // Hole to the right requiring shift left.
    const col: FlowColumn = { x: 50, width: 300 };
    const hole: FlowHole = { left: 260, top: 0, right: 400, bottom: 200 };
    // gapLeft = 244. Line [72, 272]. Overlap: 272 > 244. Shift = 272 - 244 = 28.
    // newX = 72 - 28 = 44. Clamped to max(0, 44) = 44.
    // Check: 44 + 200 = 244 <= 244. Clears.
    const blocks: FlowTextBlock[] = [
      { ...makeBlock("A".repeat(20)), indent: 22, marker: "1." },
    ];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      hole,
      DEFAULT_METRICS,
      col,
    );

    expect(result.lines).toHaveLength(1);
    const line = at(result.lines, 0);
    // The marker renders at firstLine.x - indent in the renderer,
    // so the marker position is line.x - 22. The indent offset is
    // baked into the fill (segWidth = col.width - indent), so the
    // shift moves the whole line including its indent start.
    expect(line.x).toBe(44);
    expect(line.width).toBe(200);
    // Downstream marker position: line.x - indent = 44 - 22 = 22.
    // This is just a documentation assertion; layout does not emit markers.
    expect(line.x - 22).toBe(22);
  });
});

// -----------------------------------------------------------------------
// Column-aware figure placement (full vertical probe, mid-figure hole)
// -----------------------------------------------------------------------

describe("computeFlowLayout with column (figure ladder)", () => {
  const ASPECT = 390 / 220;

  it("places a figure in the column when no hole exists", () => {
    const col: FlowColumn = { x: 100, width: 400 };
    const blocks: FlowBlock[] = [makeFigure(ASPECT)];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      null,
      DEFAULT_METRICS,
      col,
    );

    expect(result.figures).toHaveLength(1);
    const fig = at(result.figures, 0);
    expect(fig.width).toBeLessThanOrEqual(MAX_FIGURE_WIDTH);
    // Centred within the column.
    const expectedX = 100 + (400 - fig.width) / 2;
    expect(fig.x).toBeCloseTo(expectedX, 5);
  });

  it("detects a hole starting mid-figure via full vertical probe", () => {
    const col: FlowColumn = { x: 0, width: 400 };
    // Figure at y=0. estFigW = min(400, 200) = 200, estFigH = round(200/1.77) = 113.
    // Hole starts at y=50 (mid-figure) and overlaps the column.
    const figW = Math.min(400, MAX_FIGURE_WIDTH);
    const figH = Math.round(figW / ASPECT);
    // Hole starting in the middle of the figure's estimated extent.
    const holeTop = Math.floor(figH / 2);
    const hole: FlowHole = { left: 100, top: holeTop, right: 300, bottom: 300 };
    const blocks: FlowBlock[] = [makeFigure(ASPECT)];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      hole,
      DEFAULT_METRICS,
      col,
    );

    expect(result.figures).toHaveLength(1);
    const fig = at(result.figures, 0);
    // The figure should NOT be placed at y=0 (where the 1px probe would
    // have missed the hole). It should either be shifted or placed below.
    // With full probe, the overlap is detected and the ladder engages.
    // The figure's bottom should not overlap the hole without clearance.
    const figBottom = fig.y + fig.height;
    const noOverlap =
      figBottom <= hole.top ||
      fig.y >= hole.bottom + HOLE_GAP ||
      fig.x + fig.width <= hole.left - HOLE_GAP ||
      fig.x >= hole.right + HOLE_GAP;
    expect(noOverlap).toBe(true);
  });

  it("shifts a figure within SHIFT_MAX when hole partially overlaps", () => {
    // Column [0, 300], hole touching the right edge.
    const col: FlowColumn = { x: 0, width: 300 };
    const hole: FlowHole = { left: 260, top: 0, right: 400, bottom: 200 };
    // Column [0, 300] vs hole gap [244, 416].
    // colRight(300) - gapLeft(244) = 56 <= 72. Shift should succeed.
    const blocks: FlowBlock[] = [makeFigure(ASPECT)];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      hole,
      DEFAULT_METRICS,
      col,
    );

    expect(result.figures).toHaveLength(1);
    const fig = at(result.figures, 0);
    // Figure should be placed at y=0 (shifted, not jumped).
    expect(fig.y).toBe(0);
    // And should not overlap the hole horizontally.
    expect(fig.x + fig.width).toBeLessThanOrEqual(hole.left - HOLE_GAP);
  });

  it("jumps below the hole when shift and constrained segments both fail", () => {
    // Column [0, 250], hole covering most of the column.
    const col: FlowColumn = { x: 0, width: 250 };
    const hole: FlowHole = { left: 20, top: 0, right: 230, bottom: 100 };
    const blocks: FlowBlock[] = [makeFigure(ASPECT)];
    const filler = createFixedFiller(blocks, 10);
    const result = computeFlowLayout(
      blocks,
      filler,
      800,
      hole,
      DEFAULT_METRICS,
      col,
    );

    expect(result.figures).toHaveLength(1);
    const fig = at(result.figures, 0);
    expect(fig.y).toBeGreaterThanOrEqual(hole.bottom + HOLE_GAP);
  });
});

// -----------------------------------------------------------------------
// extendHoleForFullBleed with column-relative viability
// -----------------------------------------------------------------------

describe("extendHoleForFullBleed with column", () => {
  const SLIVER = FULL_BLEED_SLIVER - 1;

  it("measures flanks against the column when provided", () => {
    // Column [200, 600] (width 400). Hole [350, 450].
    // Column-relative left flank: 350 - 16 - 200 = 134 (< MIN_SEGMENT).
    // Column-relative right flank: 600 - (450 + 16) = 134 (< MIN_SEGMENT).
    // Without column, container flanks would be much wider.
    const col: FlowColumn = { x: 200, width: 400 };
    const hole: FlowHole = { left: 350, top: 100, right: 450, bottom: 600 };
    const out = extendHoleForFullBleed(hole, SLIVER, SLIVER, 1000, col);
    // Neither flank clears MIN_SEGMENT relative to column, so no stretch.
    expect(out).toEqual(hole);
  });

  it("stretches when a column-relative flank clears MIN_SEGMENT", () => {
    // Column [0, 500]. Hole [300, 400].
    // Left flank: 300 - 16 - 0 = 284 >= 180. Viable.
    const col: FlowColumn = { x: 0, width: 500 };
    const hole: FlowHole = { left: 300, top: 100, right: 400, bottom: 600 };
    const out = extendHoleForFullBleed(hole, SLIVER, SLIVER, 1000, col);
    expect(out.top).toBe(-FULL_BLEED_EXTENT);
    expect(out.bottom).toBe(FULL_BLEED_EXTENT);
  });

  it("uses full-width column to replicate container-relative flanks", () => {
    // A full-width column produces the same flank measurements that the
    // former container-relative path did.
    const fullCol: FlowColumn = { x: 0, width: 800 };
    const hole: FlowHole = { left: 300, top: 100, right: 500, bottom: 600 };
    const out = extendHoleForFullBleed(hole, SLIVER, SLIVER, 800, fullCol);
    // Left flank: 300 - 16 - 0 = 284 >= 180. Engages.
    expect(out.top).toBe(-FULL_BLEED_EXTENT);
    expect(out.bottom).toBe(FULL_BLEED_EXTENT);
  });
});
