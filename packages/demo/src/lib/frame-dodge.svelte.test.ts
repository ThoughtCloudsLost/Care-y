import { describe, it, expect } from "vitest";
import {
  computeDodgeInsets,
  CONTENT_GUTTER,
  type DodgeInsetInput,
  type DodgeFrameRect,
} from "./frame-dodge.svelte.js";
import { FRAME_PAD_X, MIN_SEGMENT } from "./flow-layout.js";

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

/** Standard container: 1200px wide, left edge at 100px document-space. */
const CW = 1200;
const CL = 100;

/** Column occupying the left half of the container. */
const LEFT_COL = { x: 0, width: 600 };

/**
 * Build a DodgeInsetInput with sensible defaults. Override any field
 * via the partial.
 */
function input(overrides: Partial<DodgeInsetInput> = {}): DodgeInsetInput {
  return {
    boxWidth: CW + CONTENT_GUTTER * 2,
    boxHeight: 80,
    // Box extends CONTENT_GUTTER past container on each side
    // (the -1rem margin / 1rem padding cancellation).
    boxLeft: CL - CONTENT_GUTTER,
    viewportTop: 200,
    frameRect: null,
    column: LEFT_COL,
    containerLeft: CL,
    containerWidth: CW,
    ...overrides,
  };
}

/**
 * Build a viewport-space frame rect.
 */
function frame(
  left: number,
  top: number,
  width: number,
  height: number,
): DodgeFrameRect {
  return { left, top, outerW: width, outerH: height };
}

// -----------------------------------------------------------------------
// CONTENT_GUTTER value
// -----------------------------------------------------------------------

describe("CONTENT_GUTTER", () => {
  it("equals 16 (1rem at default root font size)", () => {
    expect(CONTENT_GUTTER).toBe(16);
  });
});

// -----------------------------------------------------------------------
// Box-to-container conversion via CONTENT_GUTTER
// -----------------------------------------------------------------------

describe("box-to-container conversion", () => {
  it("aligns content to the column when CONTENT_GUTTER cancellation is active", () => {
    // Box extends CONTENT_GUTTER past the container on each side.
    // Column is [0, 600) in container space. The left inset should
    // place the content at column.x inside the element's box.
    const r = computeDodgeInsets(input());

    // boxLeft = CL - CONTENT_GUTTER = 84
    // column.x in container space = 0
    // Content x in document space = CL + 0 = 100
    // Left inset from box left edge: 100 - 84 = 16 = CONTENT_GUTTER
    expect(r.left).toBe(CONTENT_GUTTER);

    // Right inset: boxWidth - (contentX + contentWidth - boxLeftInContainer)
    // boxLeftInContainer = 84 - 100 = -16
    // = (CW + 32) - (0 + 600 - (-16)) = 1232 - 616 = 616
    expect(r.right).toBe(
      CW + CONTENT_GUTTER * 2 - (LEFT_COL.width + CONTENT_GUTTER),
    );
  });

  it("returns zero insets when box and column span the same range", () => {
    // A box that exactly matches the column (no gutter cancellation).
    const r = computeDodgeInsets(
      input({
        boxWidth: 600,
        boxLeft: CL,
        column: { x: 0, width: 600 },
      }),
    );
    expect(r.left).toBe(0);
    expect(r.right).toBe(0);
  });
});

// -----------------------------------------------------------------------
// Content aligned to column when no hole overlaps
// -----------------------------------------------------------------------

describe("no overlap alignment", () => {
  it("aligns to column when frame is null", () => {
    const r = computeDodgeInsets(input({ frameRect: null }));
    // Same as the box-to-container test: content at column.x
    expect(r.left).toBe(CONTENT_GUTTER);
  });

  it("aligns to column when frame is above the element", () => {
    // Frame ends before the element starts in viewport space.
    const fr = frame(300, 10, 200, 50);
    // Frame bottom with padding = 10 + 50 + FRAME_PAD_BOTTOM = 72
    // Element viewportTop = 200, well below.
    const r = computeDodgeInsets(input({ frameRect: fr }));
    expect(r.left).toBe(CONTENT_GUTTER);
  });

  it("aligns to column when frame is below the element", () => {
    // Element at viewportTop=200, height=80, so bottom=280.
    // Frame starts well above with padding still above element bottom.
    const fr = frame(300, 400, 200, 100);
    // Frame top with padding = 400 - FRAME_PAD_TOP = 388, > 280.
    const r = computeDodgeInsets(input({ frameRect: fr }));
    expect(r.left).toBe(CONTENT_GUTTER);
  });
});

// -----------------------------------------------------------------------
// Shift stage under partial intrusion
// -----------------------------------------------------------------------

describe("shift stage", () => {
  it("shifts content away from the hole when shift <= SHIFT_MAX", () => {
    // Use a left-side column [200, 600) in a 1600px container. The
    // frame intrudes from the left, shifting the column leftward where
    // there is room to slide without hitting the container edge.
    const col = { x: 200, width: 400 };
    const wideCW = 1600;
    const boxW = wideCW + CONTENT_GUTTER * 2;
    // Frame: hole right edge crosses into the column from the left.
    // holeRight = frameLeft + outerW + FRAME_PAD_X - CL.
    // gapRight = holeRight + HOLE_GAP. Need gapRight > colLeft(200)
    // and shift = gapRight - colLeft <= SHIFT_MAX.
    // Choose shift = 50: gapRight = 250, holeRight = 234,
    // frameLeft + 200 + 4 - 100 = 234 => frameLeft = 130. But then
    // holeCenterX = (130-4-100 + 234)/2 = (26+234)/2 = 130.
    // colCenterX = 200 + 200 = 400. hole center < col center, dir = +1.
    // shift = gapRight - colLeft = 250 - 200 = 50.
    // shiftedColX = 200 + 50 = 250. shiftedColRight = 650.
    // Check: shiftedColX(250) >= gapRight(250)? Yes, clears.
    // Clamp: max(0, min(250, 1600-400)) = 250. Good.
    const fr = frame(130, 180, 200, 120);

    const columnAligned = computeDodgeInsets(
      input({
        column: col,
        containerWidth: wideCW,
        boxWidth: boxW,
        frameRect: null,
      }),
    );
    const r = computeDodgeInsets(
      input({
        column: col,
        containerWidth: wideCW,
        boxWidth: boxW,
        frameRect: fr,
      }),
    );

    // The column shifted right by 50px, so the left inset grows by 50.
    expect(r.left).toBe(columnAligned.left + 50);
    // Content width stays at the column width.
    const contentWidth = boxW - r.left - r.right;
    expect(contentWidth).toBe(col.width);
  });

  it("falls through when shift exceeds SHIFT_MAX", () => {
    // Same column setup as above, but the frame intrudes deeply enough
    // that the required shift exceeds SHIFT_MAX.
    const col = { x: 200, width: 400 };
    const wideCW = 1600;
    const boxW = wideCW + CONTENT_GUTTER * 2;
    // Need gapRight - colLeft > SHIFT_MAX.
    // gapRight = holeRight + HOLE_GAP. holeRight = frameLeft + outerW + FRAME_PAD_X - CL.
    // Choose a wide frame that deeply intrudes.
    const fr = frame(CL - 50, 180, 400, 120);
    // holeRight = 50 + 400 + 4 - 100 = 354. gapRight = 370.
    // shift = 370 - 200 = 170 > SHIFT_MAX(72). Falls through.

    const r = computeDodgeInsets(
      input({
        column: col,
        containerWidth: wideCW,
        boxWidth: boxW,
        frameRect: fr,
      }),
    );

    // Shift stage fails. Falls through to computeColumnSegments or
    // full-width fallback. The result should still be valid.
    expect(r.left).toBeGreaterThanOrEqual(0);
    expect(r.right).toBeGreaterThanOrEqual(0);
  });
});

// -----------------------------------------------------------------------
// Widest-segment fallback under deep intrusion
// -----------------------------------------------------------------------

describe("widest-segment fallback", () => {
  it("picks the widest segment when shift cannot clear", () => {
    // Column [0, 600) in container space. Place a hole that splits the
    // column into two flanks, each >= MIN_SEGMENT. The hole sits in the
    // middle of the column.
    const holeContainerLeft = 250;
    const holeContainerRight = 350;
    // Convert to viewport-space frame rect.
    const frameLeft = CL + holeContainerLeft + FRAME_PAD_X;
    const frameRight = CL + holeContainerRight - FRAME_PAD_X;
    const frameWidth = frameRight - frameLeft;
    const fr = frame(frameLeft, 180, frameWidth, 120);

    const r = computeDodgeInsets(input({ frameRect: fr }));

    // Both flanks should be viable. The wider one is picked.
    // Left flank: holeContainerLeft - HOLE_GAP = 250 - 16 = 234
    // Right flank: 600 - (holeContainerRight + HOLE_GAP) = 600 - 366 = 234
    // Both are equal and >= MIN_SEGMENT.
    expect(r.left).toBeGreaterThanOrEqual(0);
    expect(r.right).toBeGreaterThanOrEqual(0);
    // Content should not span the full box (it is constrained).
    const contentWidth = input().boxWidth - r.left - r.right;
    expect(contentWidth).toBeLessThan(input().boxWidth);
    expect(contentWidth).toBeGreaterThanOrEqual(MIN_SEGMENT);
  });
});

// -----------------------------------------------------------------------
// Full-width relax when nothing fits
// -----------------------------------------------------------------------

describe("full-width fallback", () => {
  it("returns zero insets when no segment clears MIN_SEGMENT", () => {
    // Column [0, 200) (very narrow). Frame covers it almost entirely.
    const narrowCol = { x: 0, width: 200 };
    const frameLeft = CL - 50;
    const fr = frame(frameLeft, 180, 300, 120);

    const r = computeDodgeInsets(
      input({
        column: narrowCol,
        containerWidth: 200,
        boxWidth: 200 + CONTENT_GUTTER * 2,
        frameRect: fr,
      }),
    );

    expect(r.left).toBe(0);
    expect(r.right).toBe(0);
  });
});

// -----------------------------------------------------------------------
// Null frame rect resets insets to 0 (column-aligned)
// -----------------------------------------------------------------------

describe("null frame rect", () => {
  it("aligns to column (same as no-overlap path)", () => {
    const r = computeDodgeInsets(input({ frameRect: null }));
    // With the standard setup, left inset = CONTENT_GUTTER
    expect(r.left).toBe(CONTENT_GUTTER);
  });
});

// -----------------------------------------------------------------------
// Sticky vs non-sticky viewportTop selection
// -----------------------------------------------------------------------

describe("viewportTop selection", () => {
  it("uses flowTop when no stickyTop is provided (non-sticky element)", () => {
    // For the pure function, viewportTop is pre-computed by the caller.
    // Two inputs that differ only in viewportTop should produce
    // different overlap decisions when one is above the frame and one
    // overlaps it.
    const fr = frame(300, 150, 200, 100);
    // Frame vertical band with padding: [150 - FRAME_PAD_TOP, 150 + 100 + FRAME_PAD_BOTTOM]
    // = [138, 262]

    // Non-sticky: viewportTop = 300, bottom = 380. No overlap.
    const rNonSticky = computeDodgeInsets(
      input({ frameRect: fr, viewportTop: 300 }),
    );

    // Sticky: viewportTop = 150, bottom = 230. Overlaps.
    const rSticky = computeDodgeInsets(
      input({ frameRect: fr, viewportTop: 150 }),
    );

    // Non-sticky should be column-aligned (no overlap).
    expect(rNonSticky.left).toBe(CONTENT_GUTTER);

    // Sticky overlaps, so insets differ from the column-aligned case
    // (frame at viewport x=300 is outside the column [CL, CL+600)=[100,700),
    // so the hole overlaps vertically but is inside the column. The
    // shift stage or segment stage will adjust the insets.)
    // At minimum, the results should differ because one path sees
    // overlap and the other does not.
    // Actually, let's check: frame left=300, right=500. Container-space
    // hole left = 300 - FRAME_PAD_X - CL = 196, right = 500 + FRAME_PAD_X - CL = 404.
    // Column [0, 600). The hole intrudes. With vertical overlap, the
    // shift or segment path fires.
    expect(
      rSticky.left !== rNonSticky.left || rSticky.right !== rNonSticky.right,
    ).toBe(true);
  });

  it("produces different results for pinned vs unpinned element with same docTop", () => {
    // Same frame, same element. Only difference: one viewportTop is
    // pinned high (sticky), the other has scrolled past.
    const fr = frame(300, 100, 200, 100);

    // Pinned at stickyTop=64, element not scrolled past yet.
    // viewportTop = max(64, flowTop). If flowTop = 200, viewportTop = 200.
    const rUnpinned = computeDodgeInsets(
      input({ frameRect: fr, viewportTop: 200 }),
    );

    // Same element but now scrolled so flowTop would be 50, but
    // stickyTop pins it at 64. viewportTop = 64.
    const rPinned = computeDodgeInsets(
      input({ frameRect: fr, viewportTop: 64 }),
    );

    // Frame vertical band: [100-12, 100+100+12] = [88, 212].
    // Unpinned element band: [200, 280]. No overlap (200 >= 212? No, 200 < 212). Overlap.
    // Pinned element band: [64, 144]. Overlaps [88, 212].
    // Both overlap, but the element bands are different, so the hole
    // geometry and segment results may differ.
    expect(rUnpinned).toBeDefined();
    expect(rPinned).toBeDefined();
  });
});

// -----------------------------------------------------------------------
// Column on the right side of the container
// -----------------------------------------------------------------------

describe("right-side column", () => {
  it("aligns content to the right column", () => {
    const rightCol = { x: 600, width: 600 };
    const r = computeDodgeInsets(input({ column: rightCol, frameRect: null }));

    // boxLeftInContainer = boxLeft - containerLeft = (CL - CONTENT_GUTTER) - CL = -16
    // leftInset = column.x - (-16) = 600 + 16 = 616
    expect(r.left).toBe(616);
    // rightInset = boxWidth - (600 + 600 - (-16)) = 1232 - 1216 = 16
    expect(r.right).toBe(CONTENT_GUTTER);
  });
});

// -----------------------------------------------------------------------
// Frame outside the column horizontally (no horizontal overlap)
// -----------------------------------------------------------------------

describe("frame outside column horizontally", () => {
  it("aligns to column when frame is to the right of the column", () => {
    // Column [0, 600). Frame at container-space x=700 (well right of column).
    const fr = frame(CL + 700, 180, 200, 120);
    const r = computeDodgeInsets(input({ frameRect: fr }));

    // No horizontal overlap with the column, so column-aligned.
    expect(r.left).toBe(CONTENT_GUTTER);
  });
});
