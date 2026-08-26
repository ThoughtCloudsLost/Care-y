/**
 * Decoration geometry for the demo story prose.
 *
 * Everything drawn around the text rather than as text: the wash behind
 * the active sub, the hairline under each sub heading, the tint behind
 * the page header, the tip icon, and the seen-topic check marks. Each is
 * a pure function of a completed layout pass, so the page and the
 * handbook drawer place them the same way from the same inputs.
 *
 * Extracted from FlowStory.svelte, where these lived as $derived.by
 * blocks reachable only by mounting the component.
 *
 * No Svelte, no DOM. Positions are container-space px, matching the
 * coordinates computeFlowLayout returns.
 */

import type { SectionId } from "./scroll-sections.js";
import type { DemoTopic } from "./bridge.js";
import {
  type FlowBlock,
  type FlowColumn,
  type FlowHole,
  type FlowLayoutResult,
  type FlowMetrics,
  computeColumnSegments,
} from "./flow-layout.js";

// -----------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------

export interface HighlightRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface RuleRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** Stable across relayout: block index plus position within the row. */
  readonly key: string;
  readonly active: boolean;
}

export interface PanelRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface MarkPoint {
  readonly x: number;
  readonly y: number;
}

export interface SeenMark {
  readonly x: number;
  readonly y: number;
  readonly blockIndex: number;
}

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

export const HIGHLIGHT_PAD_X = 8;

/** Gap between a heading's baseline row and its rule, in px. */
export const RULE_OFFSET = 7;
export const RULE_THICKNESS = 1;

export const PANEL_PAD_X = 16;
export const PANEL_PAD_TOP = 16;
export const PANEL_PAD_BOTTOM = 16;

/** Horizontal inset of a seen-topic check from its heading's first line. */
const SEEN_MARK_INSET = 20;
/** Optical nudge so the check sits centred against the heading's cap height. */
const SEEN_MARK_DROP = 2;
/** Same idea for the tip icon, which is a taller glyph. */
const TIP_MARK_DROP = 3;

// -----------------------------------------------------------------------
// Shared guard
// -----------------------------------------------------------------------

/**
 * Layout geometry pairs with blocks by index, so a length mismatch means
 * this layout belongs to a different blocks array and cannot be read
 * safely. Every function below bails on it rather than indexing across
 * two different arrays: these feed rendering, and a throw there aborts
 * the flush and freezes the DOM while the layout loop keeps computing.
 */
function pairs(
  result: FlowLayoutResult | null,
  blocks: readonly FlowBlock[],
): result is FlowLayoutResult {
  return result !== null && result.blocks.length === blocks.length;
}

// -----------------------------------------------------------------------
// Highlight: the wash behind every line of the active sub
// -----------------------------------------------------------------------

export function computeHighlightRects(
  blocks: readonly FlowBlock[],
  result: FlowLayoutResult | null,
  activeSection: SectionId | null,
  activeSub: string | null,
  metrics: FlowMetrics,
): HighlightRect[] {
  if (activeSub === null || activeSection === null) return [];
  if (!pairs(result, blocks)) return [];

  const rects: HighlightRect[] = [];
  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks.at(bi);
    if (block === undefined) continue;
    if (block.sectionId !== activeSection || block.subSlug !== activeSub) {
      continue;
    }

    const geo = result.blocks.at(bi);
    if (geo === undefined || geo.lineCount === 0) continue;

    const km = metrics[block.kind];

    for (
      let li = geo.firstLineIndex;
      li < geo.firstLineIndex + geo.lineCount;
      li++
    ) {
      const line = result.lines.at(li);
      if (line === undefined) continue;
      // Exactly the line box, no vertical padding: consecutive lines sit
      // one lineHeight apart, so anything taller makes neighbours overlap
      // and the translucent wash doubles up into a band along every seam.
      // Horizontal padding is safe, lines do not abut.
      rects.push({
        x: line.x - HIGHLIGHT_PAD_X,
        y: line.y,
        width: line.width + HIGHLIGHT_PAD_X * 2,
        height: km.lineHeight,
      });
    }
  }
  return rects;
}

// -----------------------------------------------------------------------
// Heading rules
//
// A hairline under each sub heading, drawn through the same segment
// function the text uses. When the frame overlaps the rule's row the
// segments come back split, so the rule renders as two short strokes
// flanking the frame rather than one line running behind it.
// -----------------------------------------------------------------------

export function computeHeadingRules(
  blocks: readonly FlowBlock[],
  result: FlowLayoutResult | null,
  column: FlowColumn | null,
  hole: FlowHole | null,
  containerWidth: number,
  activeSection: SectionId | null,
  activeSub: string | null,
  metrics: FlowMetrics,
): RuleRect[] {
  if (!pairs(result, blocks)) return [];

  const rects: RuleRect[] = [];
  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks.at(bi);
    if (block?.kind !== "sub-heading") continue;

    const geo = result.blocks.at(bi);
    if (geo === undefined || geo.lineCount === 0) continue;

    const lastLine = result.lines.at(geo.firstLineIndex + geo.lineCount - 1);
    if (lastLine === undefined) continue;

    const km = metrics[block.kind];
    const ruleY = lastLine.y + km.lineHeight + RULE_OFFSET;
    const active =
      block.sectionId === activeSection && block.subSlug === activeSub;

    const segments =
      column !== null
        ? computeColumnSegments(
            ruleY,
            RULE_THICKNESS,
            containerWidth,
            column,
            hole,
          )
        : [{ x: 0, width: containerWidth }];
    for (let si = 0; si < segments.length; si++) {
      const seg = segments.at(si);
      if (seg === undefined) continue;
      rects.push({
        x: seg.x,
        y: ruleY,
        width: seg.width,
        key: `${String(bi)}:${String(si)}`,
        active,
      });
    }
  }
  return rects;
}

// -----------------------------------------------------------------------
// Header panel
//
// The tint that used to be the section header's card, drawn behind the
// title, description and tip. Sized from the pass's column rather than
// from the lines themselves, so it stays a panel instead of tracking
// every wrap the frame causes.
// -----------------------------------------------------------------------

export function computeHeaderPanel(
  blocks: readonly FlowBlock[],
  result: FlowLayoutResult | null,
  column: FlowColumn | null,
  metrics: FlowMetrics,
): PanelRect | null {
  if (column === null) return null;
  if (!pairs(result, blocks)) return null;

  let top = Infinity;
  let bottom = -Infinity;
  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks.at(bi);
    if (block === undefined) continue;
    if (
      block.kind !== "section-title" &&
      block.kind !== "section-desc" &&
      block.kind !== "story-tip"
    ) {
      continue;
    }
    const geo = result.blocks.at(bi);
    if (geo === undefined || geo.lineCount === 0) continue;
    top = Math.min(top, geo.topY);
    // bottomY carries the kind's bottom margin, which belongs to the gap
    // below the panel rather than to the panel itself.
    bottom = Math.max(bottom, geo.bottomY - metrics[block.kind].marginBottom);
  }
  if (top === Infinity) return null;

  return {
    x: column.x - PANEL_PAD_X,
    y: top - PANEL_PAD_TOP,
    width: column.width + PANEL_PAD_X * 2,
    height: bottom - top + PANEL_PAD_TOP + PANEL_PAD_BOTTOM,
  };
}

// -----------------------------------------------------------------------
// Tip icon: drawn in the gutter the tip block's indent reserves, beside
// its first line, the way the seen marks sit beside a heading.
// -----------------------------------------------------------------------

export function computeTipMark(
  blocks: readonly FlowBlock[],
  result: FlowLayoutResult | null,
  listIndent: number,
): MarkPoint | null {
  if (!pairs(result, blocks)) return null;

  for (let bi = 0; bi < blocks.length; bi++) {
    if (blocks.at(bi)?.kind !== "story-tip") continue;
    const geo = result.blocks.at(bi);
    if (geo === undefined || geo.lineCount === 0) continue;
    const firstLine = result.lines.at(geo.firstLineIndex);
    if (firstLine === undefined) continue;
    return { x: firstLine.x - listIndent, y: firstLine.y + TIP_MARK_DROP };
  }
  return null;
}

// -----------------------------------------------------------------------
// Seen-topic check marks, at the left of each seen sub's heading first
// line.
// -----------------------------------------------------------------------

export function computeSeenMarks(
  blocks: readonly FlowBlock[],
  result: FlowLayoutResult | null,
  subTopicLookup: ReadonlyMap<string, DemoTopic>,
  seenTopics: ReadonlySet<DemoTopic>,
): SeenMark[] {
  if (!pairs(result, blocks)) return [];

  const marks: SeenMark[] = [];
  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks.at(bi);
    if (block?.kind !== "sub-heading") continue;

    const topic = subTopicLookup.get(
      `${block.sectionId}--${block.subSlug ?? ""}`,
    );
    if (topic === undefined) continue;
    if (!seenTopics.has(topic)) continue;

    const geo = result.blocks.at(bi);
    if (geo === undefined || geo.lineCount === 0) continue;

    const firstLine = result.lines.at(geo.firstLineIndex);
    if (firstLine === undefined) continue;
    marks.push({
      x: firstLine.x - SEEN_MARK_INSET,
      y: firstLine.y + SEEN_MARK_DROP,
      blockIndex: bi,
    });
  }
  return marks;
}
