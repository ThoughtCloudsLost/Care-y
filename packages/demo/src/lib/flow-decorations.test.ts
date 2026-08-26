import { describe, it, expect } from "vitest";
import {
  computeFlowLayout,
  DEFAULT_METRICS,
  LIST_INDENT,
  HOLE_GAP,
} from "./flow-layout.js";
import type {
  FlowBlock,
  FlowTextBlock,
  FlowColumn,
  FlowHole,
  FlowLayoutResult,
  LineFiller,
  LineCursor,
  LineFillerResult,
} from "./flow-layout.js";
import {
  computeHighlightRects,
  computeHeadingRules,
  computeHeaderPanel,
  computeTipMark,
  computeSeenMarks,
  HIGHLIGHT_PAD_X,
  RULE_OFFSET,
  PANEL_PAD_X,
  PANEL_PAD_TOP,
  PANEL_PAD_BOTTOM,
} from "./flow-decorations.js";
import type { DemoTopic } from "./bridge.js";

// -----------------------------------------------------------------------
// Fixed-width filler, same approach as flow-layout.test.ts: measurement
// is injected so the geometry is deterministic without a Canvas.
// -----------------------------------------------------------------------

const CHAR_W = 10;

function createFixedFiller(blocks: readonly FlowBlock[]): LineFiller {
  return {
    startCursor(): LineCursor {
      return 0;
    },
    fillLine(
      blockIndex: number,
      cursor: LineCursor,
      maxWidth: number,
    ): LineFillerResult | null {
      const offset = cursor as number;
      const target = blocks[blockIndex];
      if (target === undefined || target.kind === "figure") return null;
      if (offset >= target.text.length) return null;

      const maxChars = Math.floor(maxWidth / CHAR_W);
      if (maxChars <= 0) return null;

      const end = Math.min(offset + maxChars, target.text.length);
      const slice = target.text.slice(offset, end);
      return { text: slice, width: slice.length * CHAR_W, nextCursor: end };
    },
  };
}

/** Safe indexed access that throws on a miss, for test readability. */
function at<T>(arr: readonly T[], i: number): T {
  const val = arr[i];
  if (val === undefined) throw new Error(`expected element at index ${i}`);
  return val;
}

function block(
  kind: FlowTextBlock["kind"],
  text: string,
  subSlug: string | null = "overview",
): FlowTextBlock {
  return {
    id: `${kind}-${subSlug ?? "none"}-${text.slice(0, 6)}`,
    sectionId: "login",
    subSlug,
    kind,
    text,
  };
}

const WIDTH = 400;
const FULL_COLUMN: FlowColumn = { x: 0, width: WIDTH };

function layout(
  blocks: readonly FlowBlock[],
  column: FlowColumn = FULL_COLUMN,
  hole: FlowHole | null = null,
  containerWidth = WIDTH,
): FlowLayoutResult {
  return computeFlowLayout(
    blocks,
    createFixedFiller(blocks),
    containerWidth,
    hole,
    DEFAULT_METRICS,
    column,
  );
}

// -----------------------------------------------------------------------

describe("computeHighlightRects", () => {
  it("covers every line of the active sub and nothing else", () => {
    const blocks = [
      block("sub-heading", "First", "one"),
      // Long enough to wrap into several lines at 10px per char.
      block("sub-body", "a".repeat(90), "one"),
      block("sub-heading", "Second", "two"),
      block("sub-body", "b".repeat(50), "two"),
    ];
    const result = layout(blocks);

    const rects = computeHighlightRects(
      blocks,
      result,
      "login",
      "one",
      DEFAULT_METRICS,
    );

    const headingGeo = at(result.blocks, 0);
    const bodyGeo = at(result.blocks, 1);
    expect(rects).toHaveLength(headingGeo.lineCount + bodyGeo.lineCount);

    // Every rect's y matches a line belonging to sub "one".
    const subOneLineYs = new Set<number>();
    for (const bi of [0, 1]) {
      const geo = at(result.blocks, bi);
      for (
        let li = geo.firstLineIndex;
        li < geo.firstLineIndex + geo.lineCount;
        li++
      ) {
        subOneLineYs.add(at(result.lines, li).y);
      }
    }
    for (const rect of rects) expect(subOneLineYs.has(rect.y)).toBe(true);
  });

  it("sizes each rect to exactly one line height", () => {
    // Taller rects would overlap the next line and double the
    // translucent wash into a band along every seam.
    const blocks = [block("sub-body", "c".repeat(90), "one")];
    const result = layout(blocks);

    const rects = computeHighlightRects(
      blocks,
      result,
      "login",
      "one",
      DEFAULT_METRICS,
    );

    expect(rects.length).toBeGreaterThan(1);
    for (const rect of rects) {
      expect(rect.height).toBe(DEFAULT_METRICS["sub-body"].lineHeight);
    }
    // Consecutive rects sit exactly one height apart, so they abut
    // without overlapping.
    expect(at(rects, 1).y - at(rects, 0).y).toBe(rects[0]?.height);
  });

  it("pads horizontally on both sides of the line", () => {
    const blocks = [block("sub-body", "short", "one")];
    const result = layout(blocks);
    const line = at(result.lines, 0);

    const rect = at(
      computeHighlightRects(blocks, result, "login", "one", DEFAULT_METRICS),
      0,
    );

    expect(rect.x).toBe(line.x - HIGHLIGHT_PAD_X);
    expect(rect.width).toBe(line.width + HIGHLIGHT_PAD_X * 2);
  });

  it("returns nothing when no sub is active", () => {
    const blocks = [block("sub-body", "text", "one")];
    const result = layout(blocks);

    expect(
      computeHighlightRects(blocks, result, "login", null, DEFAULT_METRICS),
    ).toEqual([]);
    expect(
      computeHighlightRects(blocks, result, null, "one", DEFAULT_METRICS),
    ).toEqual([]);
  });
});

describe("computeHeadingRules", () => {
  it("puts one rule below each sub heading's last line", () => {
    const blocks = [
      block("sub-heading", "Heading", "one"),
      block("sub-body", "body text", "one"),
    ];
    const result = layout(blocks);

    const rules = computeHeadingRules(
      blocks,
      result,
      FULL_COLUMN,
      null,
      WIDTH,
      "login",
      "one",
      DEFAULT_METRICS,
    );

    expect(rules).toHaveLength(1);
    const headingGeo = at(result.blocks, 0);
    const lastLine = at(
      result.lines,
      headingGeo.firstLineIndex + headingGeo.lineCount - 1,
    );
    expect(at(rules, 0).y).toBe(
      lastLine.y + DEFAULT_METRICS["sub-heading"].lineHeight + RULE_OFFSET,
    );
  });

  it("marks only the active sub's rule active", () => {
    const blocks = [
      block("sub-heading", "First", "one"),
      block("sub-heading", "Second", "two"),
    ];
    const result = layout(blocks);

    const rules = computeHeadingRules(
      blocks,
      result,
      FULL_COLUMN,
      null,
      WIDTH,
      "login",
      "two",
      DEFAULT_METRICS,
    );

    expect(rules.map((r) => r.active)).toEqual([false, true]);
  });

  it("splits into two strokes when a hole crosses the rule's row", () => {
    // Wide enough that both flanks clear MIN_SEGMENT once HOLE_GAP is
    // taken off each side. Narrower and flow-layout collapses the row to
    // the single viable flank, which the next case covers.
    const wide: FlowColumn = { x: 0, width: 600 };
    const blocks = [block("sub-heading", "Heading", "one")];
    const result = layout(blocks, wide, null, 600);

    const ruleY =
      at(result.lines, 0).y +
      DEFAULT_METRICS["sub-heading"].lineHeight +
      RULE_OFFSET;
    const hole: FlowHole = {
      left: 250,
      top: ruleY - 20,
      right: 310,
      bottom: ruleY + 20,
    };

    const rules = computeHeadingRules(
      blocks,
      result,
      wide,
      hole,
      600,
      "login",
      "one",
      DEFAULT_METRICS,
    );

    expect(rules).toHaveLength(2);
    // The strokes flank the hole rather than running behind it.
    expect(at(rules, 0).x + at(rules, 0).width).toBe(hole.left - HOLE_GAP);
    expect(at(rules, 1).x).toBe(hole.right + HOLE_GAP);
    // Both keys are distinct so a relayout can key them stably.
    expect(at(rules, 0).key).not.toBe(at(rules, 1).key);
  });

  it("stays one stroke when the hole misses the rule's row", () => {
    const blocks = [block("sub-heading", "Heading", "one")];
    const result = layout(blocks);

    // Far below every line in this layout.
    const hole: FlowHole = { left: 200, top: 5000, right: 260, bottom: 6000 };

    const rules = computeHeadingRules(
      blocks,
      result,
      FULL_COLUMN,
      hole,
      WIDTH,
      "login",
      "one",
      DEFAULT_METRICS,
    );

    expect(rules).toHaveLength(1);
    expect(at(rules, 0).width).toBe(WIDTH);
  });

  it("spans the container when no column is given", () => {
    const blocks = [block("sub-heading", "Heading", "one")];
    const result = layout(blocks);

    const rules = computeHeadingRules(
      blocks,
      result,
      null,
      null,
      WIDTH,
      "login",
      "one",
      DEFAULT_METRICS,
    );

    expect(at(rules, 0).x).toBe(0);
    expect(at(rules, 0).width).toBe(WIDTH);
  });
});

describe("computeHeaderPanel", () => {
  it("spans the header blocks and excludes the last one's bottom margin", () => {
    const blocks = [
      block("section-title", "Title", null),
      block("section-desc", "Description", null),
      block("story-tip", "A tip", null),
      block("sub-heading", "Not part of the header", "one"),
    ];
    const result = layout(blocks);

    const panel = computeHeaderPanel(
      blocks,
      result,
      FULL_COLUMN,
      DEFAULT_METRICS,
    );
    if (panel === null) throw new Error("expected a panel");

    const titleGeo = at(result.blocks, 0);
    const tipGeo = at(result.blocks, 2);
    const top = titleGeo.topY;
    // The tip's bottom margin is the gap below the panel, not panel area.
    const bottom = tipGeo.bottomY - DEFAULT_METRICS["story-tip"].marginBottom;

    expect(panel.y).toBe(top - PANEL_PAD_TOP);
    expect(panel.height).toBe(bottom - top + PANEL_PAD_TOP + PANEL_PAD_BOTTOM);
  });

  it("sizes from the column, not from the lines", () => {
    // Short text: a lines-derived panel would be much narrower.
    const blocks = [block("section-title", "Hi", null)];
    const result = layout(blocks);

    const panel = computeHeaderPanel(
      blocks,
      result,
      FULL_COLUMN,
      DEFAULT_METRICS,
    );

    expect(panel?.x).toBe(FULL_COLUMN.x - PANEL_PAD_X);
    expect(panel?.width).toBe(FULL_COLUMN.width + PANEL_PAD_X * 2);
  });

  it("returns null when the blocks carry no header", () => {
    const blocks = [block("sub-body", "just body copy", "one")];
    const result = layout(blocks);

    expect(
      computeHeaderPanel(blocks, result, FULL_COLUMN, DEFAULT_METRICS),
    ).toBe(null);
  });

  it("returns null without a column", () => {
    const blocks = [block("section-title", "Title", null)];
    const result = layout(blocks);

    expect(computeHeaderPanel(blocks, result, null, DEFAULT_METRICS)).toBe(
      null,
    );
  });
});

describe("computeTipMark", () => {
  it("sits in the gutter the tip's indent reserves", () => {
    const blocks = [
      block("section-title", "Title", null),
      block("story-tip", "A tip", null),
    ];
    const result = layout(blocks);

    const tipGeo = at(result.blocks, 1);
    const firstLine = at(result.lines, tipGeo.firstLineIndex);

    const mark = computeTipMark(blocks, result, LIST_INDENT);

    expect(mark?.x).toBe(firstLine.x - LIST_INDENT);
  });

  it("returns null when there is no tip", () => {
    const blocks = [block("sub-body", "body", "one")];
    expect(computeTipMark(blocks, layout(blocks), LIST_INDENT)).toBe(null);
  });
});

describe("computeSeenMarks", () => {
  const lookup = new Map<string, DemoTopic>([
    ["login--one", "credentials"],
    ["login--two", "twofa-totp"],
  ]);

  it("marks only headings whose topic has been seen", () => {
    const blocks = [
      block("sub-heading", "First", "one"),
      block("sub-heading", "Second", "two"),
    ];
    const result = layout(blocks);

    const marks = computeSeenMarks(
      blocks,
      result,
      lookup,
      new Set<DemoTopic>(["twofa-totp"]),
    );

    expect(marks).toHaveLength(1);
    expect(at(marks, 0).blockIndex).toBe(1);
  });

  it("ignores headings with no topic in the lookup", () => {
    const blocks = [block("sub-heading", "Untracked", "three")];
    const result = layout(blocks);

    expect(
      computeSeenMarks(
        blocks,
        result,
        lookup,
        new Set<DemoTopic>(["twofa-totp"]),
      ),
    ).toEqual([]);
  });

  it("positions the mark left of the heading's first line", () => {
    const blocks = [block("sub-heading", "First", "one")];
    const result = layout(blocks);
    const firstLine = at(result.lines, 0);

    const mark = at(
      computeSeenMarks(
        blocks,
        result,
        lookup,
        new Set<DemoTopic>(["credentials"]),
      ),
      0,
    );

    expect(mark.x).toBeLessThan(firstLine.x);
    expect(mark.y).toBeGreaterThanOrEqual(firstLine.y);
  });
});

describe("drawer-shaped column", () => {
  // The handbook drawer centres its prose by handing computeFlowLayout a
  // column with a non-zero x and no hole. Everything positioned from the
  // column has to follow it, or the rules and the tint land at the
  // drawer's left edge while the text sits centred.
  const OFFSET = 60;
  const NARROW: FlowColumn = { x: OFFSET, width: 280 };
  const CONTAINER = 400;

  it("puts the header panel at the column's x", () => {
    const blocks = [block("section-title", "Title", null)];
    const result = layout(blocks, NARROW, null, CONTAINER);

    const panel = computeHeaderPanel(blocks, result, NARROW, DEFAULT_METRICS);

    expect(panel?.x).toBe(OFFSET - PANEL_PAD_X);
    expect(panel?.width).toBe(NARROW.width + PANEL_PAD_X * 2);
  });

  it("starts heading rules at the column's x, not the container's", () => {
    const blocks = [block("sub-heading", "Heading", "one")];
    const result = layout(blocks, NARROW, null, CONTAINER);

    const rules = computeHeadingRules(
      blocks,
      result,
      NARROW,
      null,
      CONTAINER,
      "login",
      "one",
      DEFAULT_METRICS,
    );

    expect(at(rules, 0).x).toBe(OFFSET);
    expect(at(rules, 0).width).toBe(NARROW.width);
  });

  it("tracks the column with the highlight and the marks", () => {
    const blocks = [
      block("sub-heading", "Heading", "one"),
      block("sub-body", "body copy", "one"),
    ];
    const result = layout(blocks, NARROW, null, CONTAINER);

    const rects = computeHighlightRects(
      blocks,
      result,
      "login",
      "one",
      DEFAULT_METRICS,
    );
    for (const rect of rects) {
      expect(rect.x).toBe(OFFSET - HIGHLIGHT_PAD_X);
    }
  });
});

describe("blocks/layout mismatch", () => {
  // A layout computed for a different blocks array pairs by index with
  // nothing meaningful. These feed rendering, so they must return an
  // empty result rather than throw: a throw during render aborts the
  // flush and freezes the DOM while the layout loop keeps computing.
  const blocks = [
    block("section-title", "Title", null),
    block("sub-heading", "Heading", "one"),
    block("story-tip", "A tip", null),
  ];
  const staleResult = layout([block("sub-body", "different blocks", "one")]);
  const lookup = new Map<string, DemoTopic>([["login--one", "credentials"]]);
  const seen = new Set<DemoTopic>(["credentials"]);

  it("returns empty from every function", () => {
    expect(
      computeHighlightRects(
        blocks,
        staleResult,
        "login",
        "one",
        DEFAULT_METRICS,
      ),
    ).toEqual([]);
    expect(
      computeHeadingRules(
        blocks,
        staleResult,
        FULL_COLUMN,
        null,
        WIDTH,
        "login",
        "one",
        DEFAULT_METRICS,
      ),
    ).toEqual([]);
    expect(
      computeHeaderPanel(blocks, staleResult, FULL_COLUMN, DEFAULT_METRICS),
    ).toBe(null);
    expect(computeTipMark(blocks, staleResult, LIST_INDENT)).toBe(null);
    expect(computeSeenMarks(blocks, staleResult, lookup, seen)).toEqual([]);
  });

  it("returns empty for a null layout", () => {
    expect(
      computeHighlightRects(blocks, null, "login", "one", DEFAULT_METRICS),
    ).toEqual([]);
    expect(
      computeHeadingRules(
        blocks,
        null,
        FULL_COLUMN,
        null,
        WIDTH,
        "login",
        "one",
        DEFAULT_METRICS,
      ),
    ).toEqual([]);
    expect(computeHeaderPanel(blocks, null, FULL_COLUMN, DEFAULT_METRICS)).toBe(
      null,
    );
    expect(computeTipMark(blocks, null, LIST_INDENT)).toBe(null);
    expect(computeSeenMarks(blocks, null, lookup, seen)).toEqual([]);
  });
});
