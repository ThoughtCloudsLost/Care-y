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

/**
 * Maximum measure for a single band of text, in px. Roughly 62
 * characters at the 15px body size, which is the comfortable reading
 * range for continuous prose.
 *
 * Applied only when the text has ONE band to live in (no frame overlap,
 * or the frame pushed everything to one side). When the frame splits the
 * column into two flanking bands, each band is already narrower than
 * this, so capping would starve both sides instead of improving them.
 */
export const MAX_MEASURE = 620;

export interface Segment {
  readonly x: number;
  readonly width: number;
}

/**
 * Centre a band's text within the space available to it, capped at
 * `maxWidth`. Bands at or under the cap are returned untouched.
 */
function capAndCentre(seg: Segment, maxWidth: number): Segment {
  if (seg.width <= maxWidth) return seg;
  return { x: seg.x + (seg.width - maxWidth) / 2, width: maxWidth };
}

/**
 * Compute available text segments for a horizontal line band given the
 * hole (frame) rectangle. The line band is [lineY, lineY + lineHeight).
 * All coordinates are in document space.
 *
 * Both-side wrap only engages when both sides clear BOTH_SIDES_MIN and
 * the narrow/wide ratio meets BALANCE_RATIO. Otherwise, a single
 * segment on the wider side is used when it clears MIN_SEGMENT.
 *
 * Single-band results are capped to MAX_MEASURE and centred in whatever
 * space that band occupies, so the column tracks the frame: it centres
 * in the whole container when the frame is elsewhere, and in the
 * remaining band when the frame takes one side.
 */
export function computeLineSegments(
  lineY: number,
  lineHeight: number,
  containerWidth: number,
  hole: FlowHole | null,
): Segment[] {
  // No hole or line band does not overlap the hole vertically
  if (hole === null || lineY + lineHeight <= hole.top || lineY >= hole.bottom) {
    return [capAndCentre({ x: 0, width: containerWidth }, MAX_MEASURE)];
  }

  // Hole fully outside the container horizontally
  if (hole.right <= 0 || hole.left >= containerWidth) {
    return [capAndCentre({ x: 0, width: containerWidth }, MAX_MEASURE)];
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
    // Centre the text on the FRAME, not on each band. Both flanks take
    // the same width and hug the frame's edges, so the text block reads
    // as one column with the phone sitting in the middle of it rather
    // than as two ragged columns pinned to the container's edges.
    //
    // The width is the narrower of the two sides so the result stays
    // symmetric; MAX_MEASURE still bounds each flank, though the gating
    // above means the bands are rarely that wide.
    const flank = Math.min(leftWidth, rightWidth, MAX_MEASURE);
    const leftEnd = hole.left - HOLE_GAP;
    return [
      { x: leftEnd - flank, width: flank },
      { x: rightStart, width: flank },
    ];
  }

  // Single-side wrap on the wider side when it clears MIN_SEGMENT.
  // Capped and centred within that side, so the column visually centres
  // in the space the frame left behind rather than hugging its edge.
  if (maxSide >= MIN_SEGMENT) {
    if (leftWidth >= rightWidth) {
      return [capAndCentre({ x: 0, width: leftWidth }, MAX_MEASURE)];
    }
    return [capAndCentre({ x: rightStart, width: rightWidth }, MAX_MEASURE)];
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

      // Use the current band to size the figure. Probe segments at the
      // figure's top with a 1px tall band (the figure does not wrap text,
      // so we only need horizontal availability).
      let placed = false;
      // Safety bound: avoid an infinite loop if the hole spans the entire
      // container. After jumping below the hole once, segments must open.
      let jumpCount = 0;
      while (!placed && jumpCount < 2) {
        const segments = computeLineSegments(y, 1, containerWidth, hole);

        if (segments.length === 0) {
          if (hole !== null) {
            y = hole.bottom + HOLE_GAP;
            jumpCount++;
            continue;
          }
          // No hole and no segments: use full container width.
          break;
        }

        // Pick the widest segment band for the figure.
        let bestSeg = segments.at(0);
        if (bestSeg === undefined) break;
        for (let si = 1; si < segments.length; si++) {
          const seg = segments.at(si);
          if (seg !== undefined && seg.width > bestSeg.width) {
            bestSeg = seg;
          }
        }

        const figW = Math.min(bestSeg.width, MAX_FIGURE_WIDTH);
        const figH = Math.round(figW / block.aspectRatio);
        // Centre within the chosen band.
        const figX = bestSeg.x + (bestSeg.width - figW) / 2;

        figures.push({
          blockIndex: bi,
          x: figX,
          y,
          width: figW,
          height: figH,
        });

        y += figH;
        placed = true;
      }

      // When no segments opened even after jumping, use the container
      // width and cap to MAX_FIGURE_WIDTH.
      if (!placed) {
        const figW = Math.min(containerWidth, MAX_FIGURE_WIDTH);
        const figH = Math.round(figW / block.aspectRatio);
        const figX = (containerWidth - figW) / 2;
        figures.push({ blockIndex: bi, x: figX, y, width: figW, height: figH });
        y += figH;
      }

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

    const blockTopY = y;
    const firstLineIndex = lines.length;
    let cursor = filler.startCursor(bi);

    // Fill lines for this text block
    for (;;) {
      const segments = computeLineSegments(
        y,
        km.lineHeight,
        containerWidth,
        hole,
      );

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
    figures,
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
