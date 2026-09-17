/**
 * Search-match highlighting over the rendered story, via the CSS
 * Custom Highlight API.
 *
 * The story's search results are ordinary flow-rendered prose; painting
 * matches by rewriting markup would mean touching the flow pipeline.
 * Registering Ranges with CSS.highlights instead paints through the
 * browser with zero DOM mutation, so measurement, virtualization, and
 * hit-testing never notice. Browsers without the API simply show no
 * match wash; the results themselves are unaffected.
 *
 * Matching mirrors handbook-search: lowercase + NFD + combining marks
 * stripped, with an offset map back to original indices so Ranges land
 * on the verbatim accented text.
 */

import { normalize } from "./handbook-search.js";

export const HIGHLIGHT_NAME = "handbook-search";

/** Matches Unicode combining diacritical marks (U+0300..U+036F). */
const COMBINING_RE = /[̀-ͯ]/g;

/** Per-character normalization with normalized->original index map. */
function normalizeWithMap(original: string): {
  normalized: string;
  offsetMap: number[];
} {
  const normChars: string[] = [];
  const map: number[] = [];
  for (let i = 0; i < original.length; i++) {
    const ch = original.at(i);
    if (ch === undefined) continue;
    const normCh = ch.toLowerCase().normalize("NFD").replace(COMBINING_RE, "");
    for (const normChar of normCh) {
      normChars.push(normChar);
      map.push(i);
    }
  }
  return { normalized: normChars.join(""), offsetMap: map };
}

function highlightRegistry(): Map<string, unknown> | null {
  if (typeof CSS === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CSS Custom Highlight API typing
  const holder = CSS as unknown as { highlights?: Map<string, unknown> };
  return holder.highlights ?? null;
}

/**
 * Register match ranges for every token occurrence in text nodes under
 * `root`. Replaces any previous registration wholesale, which is what
 * makes it safe to re-run after virtualization mounts or unmounts
 * result blocks.
 */
export function applySearchHighlights(root: Element, query: string): void {
  const registry = highlightRegistry();
  if (registry === null) return;

  const tokens = normalize(query.trim())
    .split(/\s+/)
    .filter((t) => t.length > 0);
  if (tokens.length === 0) {
    registry.delete(HIGHLIGHT_NAME);
    return;
  }

  const ranges: Range[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    const text = node.textContent ?? "";
    if (text.length === 0) continue;
    const { normalized, offsetMap } = normalizeWithMap(text);
    for (const token of tokens) {
      let from = 0;
      for (;;) {
        const pos = normalized.indexOf(token, from);
        if (pos === -1) break;
        const start = offsetMap.at(pos);
        const lastOrig = offsetMap.at(pos + token.length - 1);
        if (start !== undefined && lastOrig !== undefined) {
          const range = document.createRange();
          range.setStart(node, start);
          range.setEnd(node, Math.min(lastOrig + 1, text.length));
          ranges.push(range);
        }
        from = pos + token.length;
      }
    }
  }

  const HighlightCtor =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CSS Custom Highlight API constructor
    (globalThis as unknown as { Highlight?: new (...r: Range[]) => unknown })
      .Highlight;
  if (HighlightCtor === undefined) return;
  registry.set(HIGHLIGHT_NAME, new HighlightCtor(...ranges));
}

/** Drop the registration entirely (excursion closed, query cleared). */
export function clearSearchHighlights(): void {
  highlightRegistry()?.delete(HIGHLIGHT_NAME);
}
