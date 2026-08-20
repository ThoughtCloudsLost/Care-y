/**
 * Pure flow-layout engine for the demo story text.
 *
 * No Svelte, no DOM, no pretext imports. All text measurement is
 * injected via the LineFiller interface so the module is unit-testable
 * with fake measurers.
 */

import type { SectionId } from "./scroll-sections.js";
import type { MarkupRun } from "./flow-markup.js";

// -----------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------

export type FlowTextKind =
  "section-title" | "section-desc" | "sub-heading" | "sub-body";

export type FlowBlockKind = FlowTextKind | "figure";

/** A text block (title, description, heading, or body). */
export interface FlowTextBlock {
  readonly id: string;
  readonly sectionId: SectionId;
  readonly subSlug: string | null;
  readonly kind: FlowTextKind;
  readonly text: string;
  /**
   * Styled runs when the block's text carries bold markup. The layout
   * engine never reads these; the LineFiller (which owns measurement)
   * uses them to prepare rich-inline items. Absent for plain blocks.
   */
  readonly runs?: readonly MarkupRun[];
  /**
   * Horizontal inset in px applied to every segment of every line
   * (hanging indent for list items). Absent means 0.
   */
  readonly indent?: number;
  /**
   * Gutter prefix rendered left of the first line ("•" or "3.").
   * Layout ignores it; the renderer positions it at firstLine.x - indent.
   */
  readonly marker?: string;
  /**
   * Extra vertical space in px above this block, on top of the kind's
   * marginTop. Carries paragraph and list-item spacing for the units a
   * single marked-up body block was split into.
   */
  readonly spaceBefore?: number;
}

/** An inline figure block (region clip). Has no text; sized by aspect ratio. */
export interface FlowFigureBlock {
  readonly id: string;
  readonly sectionId: SectionId;
  readonly subSlug: string | null;
  readonly kind: "figure";
  /** Intrinsic width / height ratio of the clip region. */
  readonly aspectRatio: number;
  /**
   * Paraglide key of the sub's heading, carried from the taxonomy so
   * the figure's accessible label resolves through the same key as the
   * prose (slug-derived key names break on hyphenated slugs).
   */
  readonly headingKey: string;
}

/**
 * Discriminated union: the layout engine places text and figure blocks
 * through the same pipeline; the `kind` field separates them.
 */
export type FlowBlock = FlowTextBlock | FlowFigureBlock;

export interface FlowHole {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/**
 * One styled piece of a line, offset dx px from the line's x. Present
 * only on lines of blocks with bold runs; plain lines render from
 * FlowLine.text alone.
 */
export interface FlowLineFragment {
  readonly text: string;
  readonly bold: boolean;
  readonly dx: number;
  readonly width: number;
}

export interface FlowLine {
  readonly blockIndex: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly text: string;
  readonly fragments?: readonly FlowLineFragment[];
}

export interface FlowBlockGeometry {
  readonly topY: number;
  readonly bottomY: number;
  readonly firstLineIndex: number;
  readonly lineCount: number;
}

export interface FlowLayoutResult {
  readonly lines: FlowLine[];
  readonly blocks: FlowBlockGeometry[];
  readonly figures: FlowFigureGeometry[];
  readonly totalHeight: number;
}

/** Per-kind typography metrics. */
export interface FlowKindMetrics {
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly marginTop: number;
  readonly marginBottom: number;
}

/** Full set of metrics keyed by block kind. */
export type FlowMetrics = Record<FlowBlockKind, FlowKindMetrics>;

/** Geometry for a positioned figure in the layout output. */
export interface FlowFigureGeometry {
  readonly blockIndex: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

// -----------------------------------------------------------------------
// Defaults tuned to the old StorySection look (Atkinson Hyperlegible Next)
// -----------------------------------------------------------------------

/** Section title: 24px, weight 700, generous top margin for section gaps. */
const SECTION_TITLE_METRICS: FlowKindMetrics = {
  fontSize: 24,
  lineHeight: 32,
  marginTop: 32,
  marginBottom: 8,
};

/** Section description: 15px, body weight. */
const SECTION_DESC_METRICS: FlowKindMetrics = {
  fontSize: 15,
  lineHeight: 24,
  marginTop: 0,
  marginBottom: 16,
};

/**
 * Sub heading: 18px, weight 700. The bottom margin carries the hairline
 * rule FlowStory draws under each heading, so it is wider than the gap
 * the type alone would need.
 */
const SUB_HEADING_METRICS: FlowKindMetrics = {
  fontSize: 18,
  lineHeight: 24,
  marginTop: 40,
  marginBottom: 18,
};

/** Sub body: 15px, 1.6 line height ratio. */
const SUB_BODY_METRICS: FlowKindMetrics = {
  fontSize: 15,
  lineHeight: 24,
  marginTop: 0,
  marginBottom: 0,
};

/**
 * Figure block: no font rendering. fontSize and lineHeight are unused
 * but required by FlowKindMetrics. The margins separate the clip from
 * surrounding prose.
 */
const FIGURE_METRICS: FlowKindMetrics = {
  fontSize: 0,
  lineHeight: 0,
  marginTop: 16,
  marginBottom: 16,
};

/**
 * Maximum width for a figure in px. Region crops are roughly 390x220
 * (aspect ~1.77). At 200px width the figure is about a quarter of a
 * typical narrow viewport (390px), leaving room for prose above and
 * below. On wider viewports the reading measure (MAX_MEASURE = 620)
 * already constrains the band, so 200px keeps figures compact there too.
 */
export const MAX_FIGURE_WIDTH = 200;

// -----------------------------------------------------------------------
// Markup unit spacing (used by the block builder when a body block is
// split into paragraph / list-item units)
// -----------------------------------------------------------------------

/** Hanging indent for list items; also the marker gutter width. */
export const LIST_INDENT = 22;

/** Vertical gap above a paragraph unit (and above a list's first item). */
export const PARA_SPACE = 12;

/** Vertical gap between consecutive items of the same list. */
export const LIST_ITEM_SPACE = 4;

export const DEFAULT_METRICS: FlowMetrics = {
  "section-title": SECTION_TITLE_METRICS,
  "section-desc": SECTION_DESC_METRICS,
  "sub-heading": SUB_HEADING_METRICS,
  "sub-body": SUB_BODY_METRICS,
  figure: FIGURE_METRICS,
};

// -----------------------------------------------------------------------
// LineFiller: injectable text measurement
// -----------------------------------------------------------------------

/**
 * Opaque cursor type for line filling. The caller (FlowStory) wraps
 * pretext's LayoutCursor; the layout engine treats it as opaque.
 */
export type LineCursor = unknown;

export interface LineFillerResult {
  readonly text: string;
  readonly width: number;
  readonly nextCursor: LineCursor;
  /** Styled fragments for rich lines; copied verbatim onto the FlowLine. */
  readonly fragments?: readonly FlowLineFragment[];
}

/**
 * Fills one line of text for a given block, starting at cursor, with a
 * maximum width. Returns null when the block's text is exhausted.
 */
export interface LineFiller {
  startCursor(blockIndex: number): LineCursor;
  fillLine(
    blockIndex: number,
    cursor: LineCursor,
    maxWidth: number,
  ): LineFillerResult | null;
}

// -----------------------------------------------------------------------
// Segment / hole computation
// -----------------------------------------------------------------------

/** Minimum segment width in px. Lines narrower than this are dropped. */
export const MIN_SEGMENT = 180;

/** Gap between text and the hole edge in px. */
export const HOLE_GAP = 16;

// -----------------------------------------------------------------------
// Frame clearance
//
// The floating toolbar (FrameToolbar.svelte) sits above the frame via
// `position: absolute; bottom: calc(100% + 8px)`. It measures 56px tall
// (2px border x2 + 4px padding x2 + 44px button row) and floats 8px
// above the frame's top edge. Resize handles protrude about 4px on
// every edge. Every consumer that keeps text clear of the frame uses
// these, so the flow layout and the sticky section header cannot drift
// apart.
// -----------------------------------------------------------------------

/**
 * Toolbar clearance above the BARE frame top: 56px bar + 8px gap, plus
 * breathing room. Used by frame-geometry to spawn/park the frame low
 * enough that its absolutely-positioned toolbar stays on screen. NOT
 * part of the hole padding: the rect the flow wraps already includes
 * the toolbar when it is shown (App.svelte's chromeFrameRect).
 */
export const TOOLBAR_CLEARANCE = 72;

/**
 * Breathing room between the hole's edge and the box the flow wraps.
 * The incoming rect already covers the toolbar when visible, so these
 * pad the visible chrome only.
 */
export const FRAME_PAD_TOP = 12;
export const FRAME_PAD_BOTTOM = 12;
/** Horizontal clearance: just enough for the ~4px resize handle
 *  protrusion. The flow adds HOLE_GAP on top of this. */
export const FRAME_PAD_X = 4;

/**
 * Maximum measure for a single band of text, in px. Roughly 62
 * characters at the 15px body size, which is the comfortable reading
 * range for continuous prose. Used by the slot-state module to size
 * the column and by the spawn band calculation.
 */
export const MAX_MEASURE = 620;

// -----------------------------------------------------------------------
// Column-slot types and pressure constants
// -----------------------------------------------------------------------

/**
 * A stable reading column that the frame intrudes into. Provided by the
 * slot-state module (flow-column.svelte.ts). All layout calls require a
 * column; the slot module supplies one even for narrow viewports (a
 * single centered measure).
 */
export interface FlowColumn {
  readonly x: number;
  readonly width: number;
}

/**
 * Hole-overlap fraction of the column width that triggers a slot flip.
 * When the hole's horizontal overlap with the resting column exceeds
 * `column.width * SLOT_FLIP_RATIO`, pressure flips the slot.
 */
export const SLOT_FLIP_RATIO = 1 / 3;

/**
 * Deadband in px for the slot flip. When the difference between the
 * overlap on the current slot and the would-be overlap on the other
 * slot is within this threshold, the flip is suppressed (straddling
 * frames: lesser overlap wins).
 */
export const SLOT_FLIP_DEADBAND = 40;

/**
 * Maximum per-line horizontal shift in px. Lines may poke past the
 * column edge to dodge the hole, but never by more than this amount.
 * Clamped to [0, containerWidth - lineWidth] so content stays visible.
 */
export const SHIFT_MAX = 72;

// -----------------------------------------------------------------------
// Full-bleed frame: scroll-invariant hole
// -----------------------------------------------------------------------

/**
 * Visible-gap threshold in px for full-bleed detection. Three sub-body
 * lines (3 x 24px): a gap under this shows at most two full text
 * lines, and a two-line sliver above or below the frame is not worth
 * the per-scroll reflow it costs. Three or more visible lines is real
 * reading room, so the normal moving hole takes over.
 */
export const FULL_BLEED_SLIVER = 72;

/**
 * Vertical extent the hole is stretched to in full-bleed mode. Far
 * beyond any real flow height, small enough that rounding and
 * arithmetic on the edges stay exact integers.
 */
export const FULL_BLEED_EXTENT = 1e7;

/**
 * When the frame covers (nearly) the full usable viewport height,
 * stretch the hole to a vast vertical span so it stops depending on
 * scrollY. The frame is viewport-fixed, so only the hole's top and
 * bottom edges move during scroll; with both pushed out of reach the
 * layout becomes scroll-invariant and the flanking text columns hold
 * still instead of re-wrapping around the sweeping hole edges.
 *
 * `gapAbove` / `gapBelow` are the visible viewport gaps between the
 * padded hole and the usable viewport edges (below the top chrome,
 * above the window bottom). Both must be under FULL_BLEED_SLIVER.
 *
 * Only engages when at least one flanking column clears MIN_SEGMENT:
 * with no viable side, the layout's "jump below the hole" fallback
 * would push all text below the stretched bottom edge.
 *
 * The flank viability check measures against the column bounds, not
 * the full container width. The `containerWidth` parameter is retained
 * for call-site compatibility but unused; flanks are column-relative.
 */
export function extendHoleForFullBleed(
  hole: FlowHole,
  gapAbove: number,
  gapBelow: number,
  _containerWidth: number,
  column: FlowColumn,
): FlowHole {
  if (gapAbove >= FULL_BLEED_SLIVER || gapBelow >= FULL_BLEED_SLIVER) {
    return hole;
  }

  // Measure flanks against the column.
  const bandLeft = column.x;
  const bandRight = column.x + column.width;
  const leftWidth = hole.left - HOLE_GAP - bandLeft;
  const rightWidth = bandRight - (hole.right + HOLE_GAP);
  if (Math.max(leftWidth, rightWidth) < MIN_SEGMENT) return hole;

  return {
    left: hole.left,
    right: hole.right,
    top: -FULL_BLEED_EXTENT,
    bottom: FULL_BLEED_EXTENT,
  };
}

export interface Segment {
  readonly x: number;
  readonly width: number;
}

// -----------------------------------------------------------------------
// Column-aware segment computation
// -----------------------------------------------------------------------

/**
 * Compute constrained segments for a single line band within a column,
 * implementing the dodge ladder stages for lines that vertically overlap
 * the hole:
 *
 * 1. No vertical overlap: the plain column segment.
 * 2. Overlap: column minus hole intersection, plus shift slack
 *    (SHIFT_MAX) on the open side, clamped so lines stay in
 *    [0, containerWidth].
 * 3. Hole interior to the column with >= MIN_SEGMENT on each
 *    in-column flank: two flank segments bounded by the column.
 * 4. Any segment under MIN_SEGMENT is dropped. An empty return
 *    means the caller should jump below the hole.
 */
export function computeColumnSegments(
  lineY: number,
  lineHeight: number,
  containerWidth: number,
  column: FlowColumn,
  hole: FlowHole | null,
): Segment[] {
  const colLeft = column.x;
  const colRight = column.x + column.width;

  // No hole, or line band does not overlap the hole vertically:
  // the plain column segment.
  if (hole === null || lineY + lineHeight <= hole.top || lineY >= hole.bottom) {
    return [{ x: colLeft, width: column.width }];
  }

  // Hole fully outside the column horizontally: column is unobstructed.
  if (hole.right + HOLE_GAP <= colLeft || hole.left - HOLE_GAP >= colRight) {
    return [{ x: colLeft, width: column.width }];
  }

  // Measure the in-column flanks on each side of the hole.
  const gapLeft = hole.left - HOLE_GAP;
  const gapRight = hole.right + HOLE_GAP;
  const leftFlank = Math.max(0, gapLeft - colLeft);
  const rightFlank = Math.max(0, colRight - gapRight);

  // Both flanks viable (hole interior to column): return two segments
  // bounded by the column, no shift slack needed.
  if (leftFlank >= MIN_SEGMENT && rightFlank >= MIN_SEGMENT) {
    return [
      { x: colLeft, width: leftFlank },
      { x: gapRight, width: rightFlank },
    ];
  }

  // Single viable flank: constrained segment = flank + SHIFT_MAX slack
  // on the open side (away from the hole), clamped to [0, containerWidth].
  if (leftFlank >= MIN_SEGMENT) {
    // Open side is to the left of the column.
    const slackLeft = Math.min(SHIFT_MAX, colLeft);
    const x = colLeft - slackLeft;
    const width = Math.min(leftFlank + slackLeft, containerWidth - x);
    if (width >= MIN_SEGMENT) return [{ x, width }];
    return [];
  }

  if (rightFlank >= MIN_SEGMENT) {
    // Open side is to the right of the column.
    const slackRight = Math.min(SHIFT_MAX, containerWidth - colRight);
    const x = gapRight;
    const width = Math.min(rightFlank + slackRight, containerWidth - x);
    if (width >= MIN_SEGMENT) return [{ x, width }];
    return [];
  }

  // Neither flank clears MIN_SEGMENT: no viable segment.
  return [];
}

// -----------------------------------------------------------------------
// Main layout
// -----------------------------------------------------------------------

/**
 * Compute a full flow layout for the given blocks.
 *
 * Walks blocks in order. For each block, fills lines using the injected
 * LineFiller. Per line, computes available segments (accounting for the
 * hole) and places text within the column. A three-stage dodge ladder
 * handles hole overlap: (a) shift lines away from the hole, capped at
 * SHIFT_MAX; (b) refill against computeColumnSegments per line; (c)
 * jump below the hole.
 *
 * The first block's marginTop is omitted (the flow starts at y = 0).
 */
export function computeFlowLayout(
  blocks: readonly FlowBlock[],
  filler: LineFiller,
  containerWidth: number,
  hole: FlowHole | null,
  metrics: FlowMetrics = DEFAULT_METRICS,
  column: FlowColumn = { x: 0, width: containerWidth },
): FlowLayoutResult {
  const lines: FlowLine[] = [];
  const blockGeometries: FlowBlockGeometry[] = [];
  const figures: FlowFigureGeometry[] = [];

  let y = 0;

  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks.at(bi);
    if (block === undefined) continue;
    const km = metrics[block.kind];

    // Add top margin (skip for the very first block)
    if (bi > 0) {
      y += km.marginTop;
    }

    // Figure blocks occupy a rect instead of text lines.
    if (block.kind === "figure") {
      const figTopY = y;
      const placed = placeFigureColumn(
        bi,
        block,
        y,
        containerWidth,
        hole,
        column,
        figures,
      );
      if (placed.y > y) y = placed.y;

      const bottomY = y + km.marginBottom;
      blockGeometries.push({
        topY: figTopY,
        bottomY,
        firstLineIndex: lines.length,
        lineCount: 0,
      });
      y = bottomY;
      continue;
    }

    // Unit spacing for split body blocks (paragraph / list-item gaps).
    y += block.spaceBefore ?? 0;

    const blockTopY = y;
    const firstLineIndex = lines.length;
    const indent = block.indent ?? 0;

    y = fillBlockColumn(
      bi,
      y,
      containerWidth,
      hole,
      column,
      indent,
      km.lineHeight,
      filler,
      lines,
    );

    const lineCount = lines.length - firstLineIndex;
    const bottomY = lineCount > 0 ? y : blockTopY;

    blockGeometries.push({
      topY: blockTopY,
      bottomY: bottomY + km.marginBottom,
      firstLineIndex,
      lineCount,
    });

    y = bottomY + km.marginBottom;
  }

  return {
    lines,
    blocks: blockGeometries,
    figures,
    totalHeight: y,
  };
}

// -----------------------------------------------------------------------
// Fill helpers (column path, dodge ladder)
// -----------------------------------------------------------------------

/**
 * Test whether a line band [lineY, lineY + lineHeight) vertically
 * overlaps the hole.
 */
function lineOverlapsHole(
  lineY: number,
  lineHeight: number,
  hole: FlowHole,
): boolean {
  return lineY + lineHeight > hole.top && lineY < hole.bottom;
}

/**
 * Compute the shift direction: away from the hole center, toward the
 * side of the column with more room. Returns -1 (shift left) or +1
 * (shift right).
 */
function shiftDirection(column: FlowColumn, hole: FlowHole): number {
  const holeCenterX = (hole.left + hole.right) / 2;
  const colCenterX = column.x + column.width / 2;
  // Shift away from the hole: if hole center is to the right of the
  // column center, shift left; otherwise shift right.
  return holeCenterX > colCenterX ? -1 : 1;
}

/**
 * Fill a text block using the column dodge ladder:
 * 1. Fill against the plain column segment (ignoring the hole).
 * 2. For lines that overlap the hole, try per-line shift (capped at
 *    SHIFT_MAX, clamped to [0, containerWidth - lineWidth], direction
 *    away from hole). If every overlapping line clears, emit shifted.
 * 3. Otherwise discard and refill the whole block against
 *    computeColumnSegments per line.
 */
function fillBlockColumn(
  bi: number,
  startY: number,
  containerWidth: number,
  hole: FlowHole | null,
  column: FlowColumn,
  indent: number,
  lineHeight: number,
  filler: LineFiller,
  lines: FlowLine[],
): number {
  // Stage 1: fill against the plain column, ignoring the hole.
  const colSeg: Segment = { x: column.x, width: column.width };
  const plainLines: FlowLine[] = [];
  let y = startY;
  let cursor = filler.startCursor(bi);

  for (;;) {
    const segX = colSeg.x + indent;
    const segWidth = colSeg.width - indent;
    if (segWidth <= 0) break;
    const result = filler.fillLine(bi, cursor, segWidth);
    if (result === null) break;
    if (result.text === "") break;
    plainLines.push({
      blockIndex: bi,
      x: segX,
      y,
      width: result.width,
      text: result.text,
      fragments: result.fragments,
    });
    cursor = result.nextCursor;
    y += lineHeight;
  }

  // No hole, or no lines overlap: emit plain lines directly.
  if (hole === null || plainLines.length === 0) {
    for (const pl of plainLines) lines.push(pl);
    return y;
  }

  const hasOverlap = plainLines.some((pl) =>
    lineOverlapsHole(pl.y, lineHeight, hole),
  );
  if (!hasOverlap) {
    for (const pl of plainLines) lines.push(pl);
    return y;
  }

  // Stage 2: try per-line shift for overlapping lines.
  const dir = shiftDirection(column, hole);
  let allShiftable = true;
  const shiftedLines: FlowLine[] = [];

  for (const pl of plainLines) {
    if (!lineOverlapsHole(pl.y, lineHeight, hole)) {
      shiftedLines.push(pl);
      continue;
    }

    // Compute the minimum shift to clear the hole horizontally.
    // The line occupies [pl.x, pl.x + pl.width].
    // The hole gap region is [hole.left - HOLE_GAP, hole.right + HOLE_GAP].
    const lineLeft = pl.x;
    const lineRight = pl.x + pl.width;
    const gapLeft = hole.left - HOLE_GAP;
    const gapRight = hole.right + HOLE_GAP;

    // No horizontal overlap with hole: no shift needed.
    if (lineRight <= gapLeft || lineLeft >= gapRight) {
      shiftedLines.push(pl);
      continue;
    }

    // Compute shift needed in the chosen direction.
    let shift: number;
    if (dir < 0) {
      // Shift left: line right edge must move to gapLeft.
      shift = lineRight - gapLeft;
    } else {
      // Shift right: line left edge must move to gapRight.
      shift = gapRight - lineLeft;
    }

    if (shift > SHIFT_MAX) {
      allShiftable = false;
      break;
    }

    // Apply shift and clamp to [0, containerWidth - lineWidth].
    let newX = pl.x + dir * shift;
    newX = Math.max(0, Math.min(newX, containerWidth - pl.width));

    // Verify the shifted line actually clears the hole.
    const newRight = newX + pl.width;
    if (newRight > gapLeft && newX < gapRight) {
      allShiftable = false;
      break;
    }

    shiftedLines.push({ ...pl, x: newX });
  }

  if (allShiftable) {
    for (const sl of shiftedLines) lines.push(sl);
    return y;
  }

  // Stage 3: discard plain lines and refill against constrained
  // segments per line.
  y = startY;
  cursor = filler.startCursor(bi);

  for (;;) {
    const segments = computeColumnSegments(
      y,
      lineHeight,
      containerWidth,
      column,
      hole,
    );

    if (segments.length === 0) {
      // No viable segment: jump below the hole. The null case returned
      // before the shift stage, and a band below the hole always yields
      // plain column segment, so this cannot loop.
      y = hole.bottom + HOLE_GAP;
      continue;
    }

    let filled = false;
    for (const seg of segments) {
      const segX = seg.x + indent;
      const segWidth = seg.width - indent;
      if (segWidth <= 0) continue;
      const result = filler.fillLine(bi, cursor, segWidth);
      if (result === null) break;
      if (result.text === "") break;
      lines.push({
        blockIndex: bi,
        x: segX,
        y,
        width: result.width,
        text: result.text,
        fragments: result.fragments,
      });
      cursor = result.nextCursor;
      filled = true;
    }

    if (!filled) break;
    y += lineHeight;
  }

  return y;
}

// -----------------------------------------------------------------------
// Figure placement helpers
// -----------------------------------------------------------------------

interface FigurePlacementResult {
  readonly y: number;
}

/**
 * Pick the widest segment from a list, returning its index. Returns -1
 * when the list is empty.
 */
function widestSegmentIndex(segments: readonly Segment[]): number {
  let best = -1;
  let bestW = -1;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments.at(i);
    if (seg !== undefined && seg.width > bestW) {
      bestW = seg.width;
      best = i;
    }
  }
  return best;
}

/**
 * Place a figure using the column dodge ladder. Probes the full vertical
 * span [y, y + figH] instead of a 1px band, fixing a latent bug where a
 * hole starting mid-figure is invisible.
 *
 * Ladder: in-column band -> shift up to SHIFT_MAX -> widest constrained
 * segment (floor MIN_SEGMENT) -> existing jump-below fallback. The figure
 * is centred within the chosen band.
 */
function placeFigureColumn(
  bi: number,
  block: FlowFigureBlock,
  startY: number,
  containerWidth: number,
  hole: FlowHole | null,
  column: FlowColumn,
  figures: FlowFigureGeometry[],
): FigurePlacementResult {
  let y = startY;

  // Estimate figure height at column width (needed for the full-span probe).
  const estFigW = Math.min(column.width, MAX_FIGURE_WIDTH);
  const estFigH = Math.round(estFigW / block.aspectRatio);

  let jumpCount = 0;
  while (jumpCount < 2) {
    // Stage 1: in-column band, probe full [y, y + figH].
    if (hole === null || y + estFigH <= hole.top || y >= hole.bottom) {
      const figW = Math.min(column.width, MAX_FIGURE_WIDTH);
      const figH = Math.round(figW / block.aspectRatio);
      const figX = column.x + (column.width - figW) / 2;
      figures.push({ blockIndex: bi, x: figX, y, width: figW, height: figH });
      return { y: y + figH };
    }

    // The figure vertically overlaps the hole. Try shift.
    const dir = shiftDirection(column, hole);
    const gapLeft = hole.left - HOLE_GAP;
    const gapRight = hole.right + HOLE_GAP;

    // Check if the figure's horizontal band (column) overlaps the hole.
    const colLeft = column.x;
    const colRight = column.x + column.width;

    if (colRight <= gapLeft || colLeft >= gapRight) {
      // Column does not horizontally overlap the hole: place in column.
      const figW = Math.min(column.width, MAX_FIGURE_WIDTH);
      const figH = Math.round(figW / block.aspectRatio);
      const figX = column.x + (column.width - figW) / 2;
      figures.push({ blockIndex: bi, x: figX, y, width: figW, height: figH });
      return { y: y + figH };
    }

    // Stage 2: try shifting the figure band.
    let shift: number;
    if (dir < 0) {
      shift = colRight - gapLeft;
    } else {
      shift = gapRight - colLeft;
    }

    if (shift <= SHIFT_MAX) {
      const shiftedX = column.x + dir * shift;
      const figW = Math.min(column.width, MAX_FIGURE_WIDTH);
      // Centre within the shifted band.
      let figX = shiftedX + (column.width - figW) / 2;
      figX = Math.max(0, Math.min(figX, containerWidth - figW));
      // Verify clearance.
      const figRight = figX + figW;
      if (figRight <= gapLeft || figX >= gapRight) {
        const figH = Math.round(figW / block.aspectRatio);
        figures.push({ blockIndex: bi, x: figX, y, width: figW, height: figH });
        return { y: y + figH };
      }
    }

    // Stage 3: widest constrained segment (floor MIN_SEGMENT).
    // Probe at figure top with full height to find usable bands.
    const segments = computeColumnSegments(
      y,
      estFigH,
      containerWidth,
      column,
      hole,
    );
    const bestIdx = widestSegmentIndex(segments);
    if (bestIdx >= 0) {
      const bestSeg = segments.at(bestIdx);
      if (bestSeg !== undefined && bestSeg.width >= MIN_SEGMENT) {
        const figW = Math.min(bestSeg.width, MAX_FIGURE_WIDTH);
        const figH = Math.round(figW / block.aspectRatio);
        const figX = bestSeg.x + (bestSeg.width - figW) / 2;
        figures.push({ blockIndex: bi, x: figX, y, width: figW, height: figH });
        return { y: y + figH };
      }
    }

    // Stage 4: jump below the hole.
    y = hole.bottom + HOLE_GAP;
    jumpCount++;
  }

  // Fallback: container width, capped.
  const figW = Math.min(containerWidth, MAX_FIGURE_WIDTH);
  const figH = Math.round(figW / block.aspectRatio);
  const figX = (containerWidth - figW) / 2;
  figures.push({ blockIndex: bi, x: figX, y, width: figW, height: figH });
  return { y: y + figH };
}

// -----------------------------------------------------------------------
// Hit testing
// -----------------------------------------------------------------------

/**
 * Find the block index at a given document-space point.
 * Returns null when the point falls outside all blocks.
 */
export function hitTestBlock(
  x: number,
  y: number,
  result: FlowLayoutResult,
  metrics: FlowMetrics,
  blocks: readonly FlowBlock[],
): number | null {
  for (let bi = 0; bi < result.blocks.length; bi++) {
    const bg = result.blocks.at(bi);
    if (bg === undefined) continue;
    if (y < bg.topY || y >= bg.bottomY) continue;

    // Figure blocks are not claimed by hit testing; clicks on the
    // video are the figure's own concern (long-press, peek, etc.).
    const srcBlock = blocks.at(bi);
    if (srcBlock === undefined) continue;
    if (srcBlock.kind === "figure") continue;

    // Check if x falls within any of this block's lines at this y
    const km = metrics[srcBlock.kind];
    for (
      let li = bg.firstLineIndex;
      li < bg.firstLineIndex + bg.lineCount;
      li++
    ) {
      const line = result.lines.at(li);
      if (line === undefined) continue;
      if (
        y >= line.y &&
        y < line.y + km.lineHeight &&
        x >= line.x &&
        x < line.x + line.width
      ) {
        return bi;
      }
    }
  }
  return null;
}

/**
 * A location in the story flow: identifies the section and optional
 * sub-section that a point in the document maps to.
 */
export interface FlowLocation {
  readonly sectionId: SectionId;
  readonly subSlug: string | null;
}

/**
 * Resolve a document-space y coordinate to the FlowLocation whose
 * block's y-extent contains it. Section-title and section-desc blocks
 * map to subSlug null. Returns null when y is outside all blocks.
 */
export function locationAtY(
  y: number,
  result: FlowLayoutResult,
  blocks: readonly FlowBlock[],
): FlowLocation | null {
  for (let bi = 0; bi < result.blocks.length; bi++) {
    const bg = result.blocks.at(bi);
    if (bg === undefined) continue;
    if (y >= bg.topY && y < bg.bottomY) {
      const block = blocks.at(bi);
      if (block === undefined) continue;
      return {
        sectionId: block.sectionId,
        subSlug:
          block.kind === "section-title" || block.kind === "section-desc"
            ? null
            : block.subSlug,
      };
    }
  }

  // If y is between blocks, find the nearest block above
  let bestBi = -1;
  let bestBottom = -Infinity;
  for (let bi = 0; bi < result.blocks.length; bi++) {
    const bg = result.blocks.at(bi);
    if (bg === undefined) continue;
    if (bg.bottomY <= y && bg.bottomY > bestBottom) {
      bestBottom = bg.bottomY;
      bestBi = bi;
    }
  }

  if (bestBi >= 0) {
    const block = blocks.at(bestBi);
    if (block !== undefined) {
      return {
        sectionId: block.sectionId,
        subSlug:
          block.kind === "section-title" || block.kind === "section-desc"
            ? null
            : block.subSlug,
      };
    }
  }

  // y is above the first block: return the first block's location
  const firstBlock = blocks[0];
  if (firstBlock !== undefined) {
    return {
      sectionId: firstBlock.sectionId,
      subSlug: null,
    };
  }

  return null;
}

/**
 * Find the absolute scrollY that places a target block's first line at
 * the reading line position. Returns null when the target is not found.
 *
 * @param containerTop - The document-space top offset of the story container
 * @param readingLineViewportY - The viewport Y of the reading line
 */
export function scrollTargetForBlock(
  sectionId: SectionId,
  subSlug: string | null,
  result: FlowLayoutResult,
  blocks: readonly FlowBlock[],
  containerTop: number,
  readingLineViewportY: number,
): number | null {
  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks.at(bi);
    if (block === undefined) continue;
    const matches =
      subSlug === null
        ? block.sectionId === sectionId &&
          (block.kind === "section-title" || block.kind === "section-desc")
        : block.sectionId === sectionId &&
          block.subSlug === subSlug &&
          block.kind === "sub-heading";
    if (!matches) continue;

    const bg = result.blocks.at(bi);
    if (bg === undefined) continue;
    // The block's topY is relative to the container.
    // Document-space top of this block = containerTop + bg.topY.
    // We want: documentTop - scrollY = readingLineViewportY
    // So: scrollY = documentTop - readingLineViewportY
    const documentTop = containerTop + bg.topY;
    return Math.max(0, documentTop - readingLineViewportY);
  }
  return null;
}
