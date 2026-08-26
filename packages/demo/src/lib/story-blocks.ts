/**
 * Shared typesetting primitives for the demo story text.
 *
 * Extracted from FlowStory.svelte so both FlowStory and the handbook
 * drawer can share one source of measurement fonts, CSS custom
 * properties, block-list derivation, and pretext locale management.
 *
 * Pure module: no Svelte runes, no DOM beyond pretext's Canvas usage.
 */

import { setLocale } from "@chenglou/pretext";
import type { Section } from "./scroll-sections.js";
import { resolveStoryMessage } from "./story-messages.js";
import {
  hasFlowMarkup,
  parseFlowMarkup,
  unitHasBold,
  unitText,
} from "./flow-markup.js";
import { hasClip, getClip } from "./clip-registry.js";
import type {
  FlowBlock,
  FlowTextBlock,
  FlowFigureBlock,
  FlowTextKind,
} from "./flow-layout.js";
import { LIST_INDENT, PARA_SPACE, LIST_ITEM_SPACE } from "./flow-layout.js";

// -----------------------------------------------------------------------
// Font strings for canvas measurement and CSS rendering.
// These MUST match exactly between prepare() calls and rendered spans.
// -----------------------------------------------------------------------

const FONT_FAMILY = '"Atkinson Hyperlegible Next"';

/**
 * The one authoritative record of font shorthands. Canvas text measurement
 * (prepare() calls) uses these strings directly, and the per-kind CSS
 * classes consume them via custom properties on the flow container.
 * Keeping one record prevents pretext and the rendered spans from
 * drifting apart.
 */
export const FONT_STRINGS: Record<FlowTextKind, string> = {
  "section-title": `700 24px ${FONT_FAMILY}`,
  "section-desc": `400 15px ${FONT_FAMILY}`,
  "story-tip": `400 15px ${FONT_FAMILY}`,
  "sub-heading": `700 18px ${FONT_FAMILY}`,
  "sub-body": `400 15px ${FONT_FAMILY}`,
};

/**
 * Bold variant of the sub-body font, for **bold** markup runs. Same
 * size and family as sub-body so bold and plain fragments share a
 * baseline; only the weight differs. Used for rich-inline measurement
 * and published as a CSS custom property like the kind fonts.
 */
export const FONT_SUB_BODY_BOLD = `700 15px ${FONT_FAMILY}`;

/**
 * Line-height values per kind. Must agree with flow-layout.ts metrics
 * (section-title=32, others=24). Published as CSS custom properties
 * alongside FONT_STRINGS so the CSS classes stay single-sourced.
 */
export const LINE_HEIGHTS: Record<FlowTextKind, string> = {
  "section-title": "32px",
  "section-desc": "24px",
  "story-tip": "24px",
  "sub-heading": "24px",
  "sub-body": "24px",
};

/** CSS custom property inline style for the flow container. */
export const fontVarsStyle: string = [
  `--flow-font-title: ${FONT_STRINGS["section-title"]}`,
  `--flow-font-desc: ${FONT_STRINGS["section-desc"]}`,
  `--flow-font-tip: ${FONT_STRINGS["story-tip"]}`,
  `--flow-font-sub-heading: ${FONT_STRINGS["sub-heading"]}`,
  `--flow-font-sub-body: ${FONT_STRINGS["sub-body"]}`,
  `--flow-font-sub-body-bold: ${FONT_SUB_BODY_BOLD}`,
  `--flow-lh-title: ${LINE_HEIGHTS["section-title"]}`,
  `--flow-lh-desc: ${LINE_HEIGHTS["section-desc"]}`,
  `--flow-lh-tip: ${LINE_HEIGHTS["story-tip"]}`,
  `--flow-lh-sub-heading: ${LINE_HEIGHTS["sub-heading"]}`,
  `--flow-lh-sub-body: ${LINE_HEIGHTS["sub-body"]}`,
].join("; ");

// -----------------------------------------------------------------------
// Pretext locale guard
// -----------------------------------------------------------------------

// pretext's locale is global, so we track what we last set it to here
// to avoid redundant setLocale() calls that flush its measurement cache.
let lastAppliedLocale: string | null = null;

/**
 * Apply a pretext locale only when it differs from the last applied
 * value. setLocale flushes pretext's global two-level measurement cache,
 * forcing a full Canvas re-measure of every segment, so skipping
 * redundant calls avoids that cost. The guard is module-level because
 * FlowStory remounts on every section change but pretext's locale is
 * process-global.
 */
export function applyPretextLocale(locale: string): void {
  if (locale !== lastAppliedLocale) {
    setLocale(locale);
    lastAppliedLocale = locale;
  }
}

// -----------------------------------------------------------------------
// Block list derivation
// -----------------------------------------------------------------------

export function buildBlocks(sects: Section[], loc: string): FlowBlock[] {
  const result: FlowBlock[] = [];
  for (let sx = 0; sx < sects.length; sx++) {
    const section = sects.at(sx);
    if (section === undefined) continue;

    // The page's title, description and tip are blocks like any other,
    // so they wrap around the frame through the same layout pass the
    // prose does. They used to be ordinary DOM above the flow, which
    // meant a second, approximate dodge that never quite matched.
    result.push({
      id: `${section.id}--title`,
      sectionId: section.id,
      subSlug: null,
      kind: "section-title",
      text: resolveStoryMessage(section.titleKey, loc),
    } satisfies FlowTextBlock);
    result.push({
      id: `${section.id}--desc`,
      sectionId: section.id,
      subSlug: null,
      kind: "section-desc",
      text: resolveStoryMessage(section.descKey, loc),
    } satisfies FlowTextBlock);
    // One tip per page, under the first section's description. The
    // indent reserves the gutter its icon is drawn in.
    if (sx === 0) {
      result.push({
        id: `${section.id}--tip`,
        sectionId: section.id,
        subSlug: null,
        kind: "story-tip",
        text: resolveStoryMessage("demo_narrative_tip", loc),
        indent: LIST_INDENT,
      } satisfies FlowTextBlock);
    }

    // Handbook-style numbering. Single-sub sections (the entry page,
    // the coming-soon placeholder) read as a lone statement, not as
    // step one of one, so they stay unnumbered.
    const numbered = section.subs.length > 1;
    for (let si = 0; si < section.subs.length; si++) {
      const sub = section.subs.at(si);
      if (sub === undefined) continue;
      const headingText = resolveStoryMessage(sub.headingKey, loc);
      result.push({
        id: `${section.id}--${sub.slug}--heading`,
        sectionId: section.id,
        subSlug: sub.slug,
        kind: "sub-heading",
        text: numbered ? `${String(si + 1)}. ${headingText}` : headingText,
      } satisfies FlowTextBlock);
      const bodyText = resolveStoryMessage(sub.bodyKey, loc);
      const bodyId = `${section.id}--${sub.slug}--body`;
      if (!hasFlowMarkup(bodyText)) {
        // Plain copy keeps its historical single block, byte-for-byte.
        result.push({
          id: bodyId,
          sectionId: section.id,
          subSlug: sub.slug,
          kind: "sub-body",
          text: bodyText,
        } satisfies FlowTextBlock);
      } else {
        // Marked-up copy splits into one block per unit (paragraph or
        // list item) so the layout engine spaces and indents them.
        const units = parseFlowMarkup(bodyText);
        for (let ui = 0; ui < units.length; ui++) {
          const unit = units.at(ui);
          if (unit === undefined) continue;
          const prev = ui > 0 ? units.at(ui - 1) : undefined;
          const isListItem = unit.kind !== "paragraph";
          const continuesList = isListItem && prev?.kind === unit.kind;
          result.push({
            id: `${bodyId}--u${String(ui)}`,
            sectionId: section.id,
            subSlug: sub.slug,
            kind: "sub-body",
            text: unitText(unit),
            runs: unitHasBold(unit) ? unit.runs : undefined,
            indent: isListItem ? LIST_INDENT : undefined,
            marker: unit.marker ?? undefined,
            spaceBefore:
              ui === 0
                ? undefined
                : continuesList
                  ? LIST_ITEM_SPACE
                  : PARA_SPACE,
          } satisfies FlowTextBlock);
        }
      }

      // Append a figure block when a clip exists for this sub.
      if (hasClip(section.id, sub.slug)) {
        const clip = getClip(section.id, sub.slug);
        result.push({
          id: `${section.id}--${sub.slug}--figure`,
          sectionId: section.id,
          subSlug: sub.slug,
          kind: "figure",
          aspectRatio: clip.aspectRatio,
          headingKey: sub.headingKey,
        } satisfies FlowFigureBlock);
      }
    }
  }
  return result;
}
