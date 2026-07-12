/**
 * Search-term highlighting primitives shared by DecryptPlaceholder,
 * HighlightText, and any surface that marks matches in rendered text.
 */

/** A run of text, flagged when it matches the highlight term. */
export interface TextSegment {
  text: string;
  highlight: boolean;
}

/**
 * True when a term is present and long enough to highlight.
 * Two characters is the floor: single characters mark too much to read.
 */
export function isHighlightable(
  term: string | null | undefined,
): term is string {
  return term != null && term.length >= 2;
}

/**
 * Split text into segments by case-insensitive occurrences of term,
 * preserving the original casing. Matching is literal (no accent
 * folding), so a fuzzy-matched result can legitimately render zero
 * marks when its match relied on folding.
 */
export function splitByTerm(text: string, term: string): TextSegment[] {
  if (term.length === 0) {
    return [{ text, highlight: false }];
  }

  const segments: TextSegment[] = [];
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  let cursor = 0;

  while (cursor < text.length) {
    const matchIdx = lowerText.indexOf(lowerTerm, cursor);
    if (matchIdx === -1) {
      segments.push({ text: text.slice(cursor), highlight: false });
      break;
    }
    if (matchIdx > cursor) {
      segments.push({ text: text.slice(cursor, matchIdx), highlight: false });
    }
    segments.push({
      text: text.slice(matchIdx, matchIdx + term.length),
      highlight: true,
    });
    cursor = matchIdx + term.length;
  }

  return segments;
}
