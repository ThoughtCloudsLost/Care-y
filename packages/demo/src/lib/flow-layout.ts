/**
 * Pure flow-layout engine for the demo story text.
 *
 * No Svelte, no DOM, no pretext imports. All text measurement is
 * injected via the LineFiller interface so the module is unit-testable
 * with fake measurers.
 */

import type { SectionId } from "./scroll-sections.js";

// -----------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------

export type FlowBlockKind =
  "section-title" | "section-desc" | "sub-heading" | "sub-body";

export interface FlowBlock {
  readonly id: string;
  readonly sectionId: SectionId;
  readonly subSlug: string | null;
  readonly kind: FlowBlockKind;
  readonly text: string;
}

export interface FlowHole {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export interface FlowLine {
  readonly blockIndex: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly text: string;
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

/** Sub heading: 18px, weight 700. */
const SUB_HEADING_METRICS: FlowKindMetrics = {
  fontSize: 18,
  lineHeight: 24,
  marginTop: 32,
  marginBottom: 8,
};

/** Sub body: 15px, 1.6 line height ratio. */
const SUB_BODY_METRICS: FlowKindMetrics = {
  fontSize: 15,
  lineHeight: 24,
  marginTop: 0,
  marginBottom: 0,
};

export const DEFAULT_METRICS: FlowMetrics = {
  "section-title": SECTION_TITLE_METRICS,
  "section-desc": SECTION_DESC_METRICS,
  "sub-heading": SUB_HEADING_METRICS,
  "sub-body": SUB_BODY_METRICS,
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
// The frame's toolbar is `.frame-toolbar` in App.svelte: it is
// `position: absolute; bottom: 100%`, so it sits entirely ABOVE
// frameRect.top and outside outerH. It measures 44px of buttons plus 8px
// of padding plus a 2px border, so 54px. Resize handles protrude about
// 4px on every edge. Every consumer that keeps text clear of the frame
// uses these, so the flow layout and the sticky section header cannot
// drift apart.
// -----------------------------------------------------------------------

/** 54px toolbar above the frame, plus breathing room. */
export const FRAME_PAD_TOP = 66;
export const FRAME_PAD_BOTTOM = 12;
/** Horizontal clearance. The flow adds HOLE_GAP on top of this. */
export const FRAME_PAD_X = 8;

/**
 * Minimum width for EACH side before both-side wrap engages.
 * Wider than MIN_SEGMENT so narrow flanking columns do not appear
 * when the frame is near a viewport edge.
 */
export const BOTH_SIDES_MIN = 240;

/**
 * Minimum ratio of min(leftWidth, rightWidth) / max(...) for
 * both-side wrap. Expresses "frame is near horizontal center"
 * purely in segment widths, with no extra coordinate parameters.
 */
export const BALANCE_RATIO = 0.6;

interface Segment {
  readonly x: number;
  readonly width: number;
}

/**
 * Compute available text segments for a horizontal line band given the
 * hole (frame) rectangle. The line band is [lineY, lineY + lineHeight).
 * All coordinates are in document space.
 *
 * Both-side wrap only engages when both sides clear BOTH_SIDES_MIN and
 * the narrow/wide ratio meets BALANCE_RATIO. Otherwise, a single
 * segment on the wider side is used when it clears MIN_SEGMENT.
 */
function computeSegments(
  lineY: number,
  lineHeight: number,
  containerWidth: number,
  hole: FlowHole | null,
): Segment[] {
  // No hole or line band does not overlap the hole vertically
  if (hole === null || lineY + lineHeight <= hole.top || lineY >= hole.bottom) {
    return [{ x: 0, width: containerWidth }];
  }

  // Hole fully outside the container horizontally
  if (hole.right <= 0 || hole.left >= containerWidth) {
    return [{ x: 0, width: containerWidth }];
  }

  const leftWidth = Math.max(0, hole.left - HOLE_GAP);
  const rightStart = Math.min(containerWidth, hole.right + HOLE_GAP);
  const rightWidth = Math.max(0, containerWidth - rightStart);

  // Both-side wrap: both sides must clear BOTH_SIDES_MIN and be
  // balanced (narrow/wide >= BALANCE_RATIO).
  const minSide = Math.min(leftWidth, rightWidth);
  const maxSide = Math.max(leftWidth, rightWidth);
  if (
    minSide >= BOTH_SIDES_MIN &&
    maxSide > 0 &&
    minSide / maxSide >= BALANCE_RATIO
  ) {
    return [
      { x: 0, width: leftWidth },
      { x: rightStart, width: rightWidth },
    ];
  }

  // Single-side wrap on the wider side when it clears MIN_SEGMENT.
  if (maxSide >= MIN_SEGMENT) {
    if (leftWidth >= rightWidth) {
      return [{ x: 0, width: leftWidth }];
    }
    return [{ x: rightStart, width: rightWidth }];
  }

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
 * hole) and places text in one or both segments.
 *
 * The first block's marginTop is omitted (the flow starts at y = 0).
 */
export function computeFlowLayout(
  blocks: readonly FlowBlock[],
  filler: LineFiller,
  containerWidth: number,
  hole: FlowHole | null,
  metrics: FlowMetrics = DEFAULT_METRICS,
): FlowLayoutResult {
  const lines: FlowLine[] = [];
  const blockGeometries: FlowBlockGeometry[] = [];

  let y = 0;

  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks.at(bi);
    if (block === undefined) continue;
    const km = metrics[block.kind];

    // Add top margin (skip for the very first block)
    if (bi > 0) {
      y += km.marginTop;
    }

    const blockTopY = y;
    const firstLineIndex = lines.length;
    let cursor = filler.startCursor(bi);

    // Fill lines for this block
    for (;;) {
      const segments = computeSegments(y, km.lineHeight, containerWidth, hole);

      if (segments.length === 0) {
        // Both segments dropped by MIN_SEGMENT floor. Jump below the hole.
        if (hole !== null) {
          y = hole.bottom + HOLE_GAP;
          continue;
        }
        // No hole and no segments means containerWidth < MIN_SEGMENT.
        // Force a single full-width segment to avoid an infinite loop.
        const result = filler.fillLine(bi, cursor, containerWidth);
        if (result === null) break;
        // Zero-progress guard: empty text with no cursor advance means
        // the filler cannot fit any content in this width.
        if (result.text === "") break;
        lines.push({
          blockIndex: bi,
          x: 0,
          y,
          width: result.width,
          text: result.text,
        });
        cursor = result.nextCursor;
        y += km.lineHeight;
        continue;
      }

      // Fill segments left to right. For two segments, the cursor
      // continues from left into right (both-side wrap).
      let filled = false;
      for (const seg of segments) {
        const result = filler.fillLine(bi, cursor, seg.width);
        if (result === null) break;
        // Zero-progress guard: a filler that returns empty text has
        // made no progress; treat as exhaustion to prevent looping.
        if (result.text === "") break;
        lines.push({
          blockIndex: bi,
          x: seg.x,
          y,
          width: result.width,
          text: result.text,
        });
        cursor = result.nextCursor;
        filled = true;
      }

      if (!filled) break;
      y += km.lineHeight;
    }

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
    totalHeight: y,
  };
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

    // Check if x falls within any of this block's lines at this y
    const srcBlock = blocks.at(bi);
    if (srcBlock === undefined) continue;
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
