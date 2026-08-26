/**
 * Pretext measurement for the demo story text.
 *
 * Extracted from FlowStory.svelte and HandbookDrawer.svelte, which held
 * identical copies of this pipeline. Both now measure through one
 * implementation, so a change to how a block is prepared or a line is
 * filled reaches the page and the handbook drawer together.
 *
 * Pure module: no Svelte runes. The only DOM contact is pretext's
 * Canvas measurement and the document.fonts wait.
 */

import {
  prepareWithSegments,
  layoutNextLineRange,
  materializeLineRange,
  type PreparedTextWithSegments,
  type LayoutCursor,
} from "@chenglou/pretext";
import {
  prepareRichInline,
  layoutNextRichInlineLineRange,
  materializeRichInlineLineRange,
  type PreparedRichInline,
  type RichInlineCursor,
} from "@chenglou/pretext/rich-inline";
import {
  type FlowBlock,
  type FlowLineFragment,
  type LineFiller,
  type LineFillerResult,
  type LineCursor,
} from "./flow-layout.js";
import {
  FONT_STRINGS,
  FONT_SUB_BODY_BOLD,
  applyPretextLocale,
} from "./story-blocks.js";
import { plainMap } from "./non-reactive.js";

// -----------------------------------------------------------------------
// Handles
// -----------------------------------------------------------------------

/** Plain block: measured as one segment run with the kind's font. */
export interface PlainHandle {
  readonly type: "plain";
  readonly handle: PreparedTextWithSegments;
}

/** Block with bold runs: measured via rich-inline, one item per run. */
export interface RichHandle {
  readonly type: "rich";
  readonly handle: PreparedRichInline;
  /** Bold flag per rich-inline item, indexed by fragment itemIndex. */
  readonly bold: readonly boolean[];
}

export type BlockHandle = PlainHandle | RichHandle;

export interface PreparedState {
  /**
   * The exact array the handles were built from. Callers compare this by
   * identity before laying out, so handles can never be paired with a
   * different blocks array.
   */
  readonly forBlocks: readonly FlowBlock[];
  readonly handles: Map<number, BlockHandle>;
}

// -----------------------------------------------------------------------
// Font loading
// -----------------------------------------------------------------------

/**
 * Wait for every measurement face to be available, so prepare() measures
 * the faces the spans will actually render with.
 *
 * allSettled because the font set includes the client app's absolute-URL
 * @font-face declarations, which do not resolve under the demo's serving
 * root. load() rejects when ANY matched face fails, even though the
 * hashed faces we actually render with load fine. allSettled lets those
 * settle as rejected without blocking.
 */
export async function loadFlowFonts(): Promise<void> {
  const fontLoadPromises = [
    ...Object.values(FONT_STRINGS),
    FONT_SUB_BODY_BOLD,
  ].map(async (f) => document.fonts.load(f));
  await Promise.allSettled(fontLoadPromises);
}

// -----------------------------------------------------------------------
// Preparation
// -----------------------------------------------------------------------

/**
 * Measure every text block with the faces available right now. Figure
 * blocks have no text and get no handle, so their indices are absent
 * from the map.
 */
export function prepareBlockHandles(
  blocks: readonly FlowBlock[],
  locale: string,
): PreparedState {
  applyPretextLocale(locale);

  const handles = plainMap<number, BlockHandle>();
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks.at(i);
    if (block === undefined) continue;
    if (block.kind === "figure") continue;
    const fontStr = FONT_STRINGS[block.kind];
    if (block.runs !== undefined) {
      // Bold markup: one rich-inline item per run, each measured with
      // its own weight so line breaks account for the wider bold glyphs.
      handles.set(i, {
        type: "rich",
        handle: prepareRichInline(
          block.runs.map((r) => ({
            text: r.text,
            font: r.bold ? FONT_SUB_BODY_BOLD : fontStr,
          })),
        ),
        bold: block.runs.map((r) => r.bold),
      });
    } else {
      handles.set(i, {
        type: "plain",
        handle: prepareWithSegments(block.text, fontStr),
      });
    }
  }
  return { forBlocks: blocks, handles };
}

// -----------------------------------------------------------------------
// LineFiller backed by pretext
// -----------------------------------------------------------------------

/** Runtime check that a LineCursor has the LayoutCursor shape. */
export function isLayoutCursor(c: LineCursor): c is LayoutCursor {
  if (typeof c !== "object" || c === null) return false;
  return (
    "segmentIndex" in c &&
    typeof c.segmentIndex === "number" &&
    "graphemeIndex" in c &&
    typeof c.graphemeIndex === "number"
  );
}

/** Runtime check for the rich-inline cursor shape (adds itemIndex). */
export function isRichCursor(c: LineCursor): c is RichInlineCursor {
  return (
    isLayoutCursor(c) && "itemIndex" in c && typeof c.itemIndex === "number"
  );
}

/** Fill one rich-inline line and flatten it into a filler result. */
export function fillRichLine(
  entry: RichHandle,
  cursor: RichInlineCursor,
  maxWidth: number,
): LineFillerResult | null {
  const range = layoutNextRichInlineLineRange(entry.handle, maxWidth, cursor);
  if (range === null) return null;

  const line = materializeRichInlineLineRange(entry.handle, range);
  // Fragment offsets are relative to the line start: each fragment
  // advances by its gapBefore (inter-item spacing pretext collapsed)
  // plus its occupied width.
  const fragments: FlowLineFragment[] = [];
  let dx = 0;
  let text = "";
  for (const frag of line.fragments) {
    dx += frag.gapBefore;
    fragments.push({
      text: frag.text,
      bold: entry.bold.at(frag.itemIndex) ?? false,
      dx,
      width: frag.occupiedWidth,
    });
    dx += frag.occupiedWidth;
    text += frag.text;
  }
  return { text, width: line.width, nextCursor: range.end, fragments };
}

/** A LineFiller that reads from an already-prepared handle map. */
export function createFiller(
  handles: ReadonlyMap<number, BlockHandle>,
): LineFiller {
  return {
    startCursor(blockIndex: number): LineCursor {
      if (handles.get(blockIndex)?.type === "rich") {
        return {
          itemIndex: 0,
          segmentIndex: 0,
          graphemeIndex: 0,
        } satisfies RichInlineCursor;
      }
      return { segmentIndex: 0, graphemeIndex: 0 } satisfies LayoutCursor;
    },
    fillLine(
      blockIndex: number,
      cursor: LineCursor,
      maxWidth: number,
    ): LineFillerResult | null {
      const entry = handles.get(blockIndex);
      if (entry === undefined) return null;

      if (entry.type === "rich") {
        if (!isRichCursor(cursor)) return null;
        return fillRichLine(entry, cursor, maxWidth);
      }

      if (!isLayoutCursor(cursor)) return null;
      const range = layoutNextLineRange(entry.handle, cursor, maxWidth);
      if (range === null) return null;

      const materialized = materializeLineRange(entry.handle, range);
      return {
        text: materialized.text,
        width: materialized.width,
        nextCursor: range.end,
      };
    },
  };
}
