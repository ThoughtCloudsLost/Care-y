/**
 * Full-text handbook search: normalization, index construction, and
 * ranked search across the demo handbook corpus.
 *
 * Pure module. No DOM, no Svelte runes, no side effects beyond
 * the per-locale index cache.
 */

import { buildCorpus, type CorpusEntry } from "./handbook-corpus.js";
import { resolveStoryMessage } from "./story-messages.js";
import { getSection, getSub } from "./scroll-sections.js";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface SearchSnippet {
  readonly before: string;
  readonly match: string;
  readonly after: string;
}

export interface SearchHit {
  readonly sectionId: string;
  readonly subSlug: string | null;
  readonly key: string;
  readonly lineIdx: number;
  readonly label: string | null;
  readonly snippet: SearchSnippet;
}

// -----------------------------------------------------------------------
// Normalization
//
// Lowercase + NFD decomposition + strip combining marks. "Atención"
// becomes "atencion", so a query typed without diacritics still matches
// accented corpus text and vice versa.
// -----------------------------------------------------------------------

/** Matches Unicode combining diacritical marks (U+0300..U+036F). */
const COMBINING_RE = /[̀-ͯ]/g;

export function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(COMBINING_RE, "");
}

// -----------------------------------------------------------------------
// Offset map
//
// Normalization can change string length (NFD decomposes accented
// chars into base + combining mark, then the combining mark is stripped).
// To map a match position in the normalized string back to the original,
// we build an array where offsetMap[normalizedIdx] = originalIdx.
// -----------------------------------------------------------------------

interface NormalizedWithMap {
  readonly normalized: string;
  readonly offsetMap: readonly number[];
}

function normalizeWithMap(original: string): NormalizedWithMap {
  // Walk char-by-char through the original. For each character, compute
  // its normalized form and record the mapping.
  const normChars: string[] = [];
  const map: number[] = [];

  for (let i = 0; i < original.length; i++) {
    const ch = original[i]!;
    const normCh = ch.toLowerCase().normalize("NFD").replace(COMBINING_RE, "");
    for (let j = 0; j < normCh.length; j++) {
      normChars.push(normCh[j]!);
      map.push(i);
    }
  }

  return { normalized: normChars.join(""), offsetMap: map };
}

// -----------------------------------------------------------------------
// Index entry
// -----------------------------------------------------------------------

interface IndexEntry {
  readonly corpus: CorpusEntry;
  /** Section heading resolved text (original, not normalized). */
  readonly heading: string;
  readonly headingNorm: string;
  /** Seam label (original), or empty string. */
  readonly labelOrig: string;
  readonly labelNorm: string;
  /** Body plain text (original). */
  readonly bodyOrig: string;
  readonly bodyNorm: string;
  /** Combined original text for snippet extraction. */
  readonly combinedOrig: string;
  readonly combinedMap: NormalizedWithMap;
  /** Taxonomy order: lower = earlier in the handbook. */
  readonly order: number;
}

// -----------------------------------------------------------------------
// Index construction
// -----------------------------------------------------------------------

const indexCache = new Map<string, readonly IndexEntry[]>();

export function buildSearchIndex(locale: string): readonly IndexEntry[] {
  const cached = indexCache.get(locale);
  if (cached !== undefined) return cached;

  const corpus = buildCorpus(locale);
  const entries: IndexEntry[] = [];

  // Cache resolved headings per sectionId+subSlug to avoid repeated lookups
  const headingCache = new Map<string, string>();

  for (let order = 0; order < corpus.length; order++) {
    const c = corpus[order]!;

    const headingKey = `${c.sectionId}/${c.subSlug ?? ""}`;
    let heading = headingCache.get(headingKey);
    if (heading === undefined) {
      // Resolve the sub-section heading or the section title
      if (c.subSlug !== null) {
        const subLookup = getSub(c.sectionId, c.subSlug);
        heading =
          subLookup !== undefined
            ? resolveStoryMessage(subLookup.sub.headingKey, locale)
            : c.subSlug;
      } else {
        const section = getSection(c.sectionId);
        heading =
          section !== undefined
            ? resolveStoryMessage(section.titleKey, locale)
            : c.sectionId;
      }
      headingCache.set(headingKey, heading);
    }

    const labelOrig = c.label ?? "";
    const bodyOrig = c.plainText;

    // Combine all searchable text for snippet extraction.
    // Heading, label, body separated by spaces for context.
    const combinedOrig = [heading, labelOrig, bodyOrig]
      .filter((s) => s.length > 0)
      .join(" ");

    entries.push({
      corpus: c,
      heading,
      headingNorm: normalize(heading),
      labelOrig,
      labelNorm: normalize(labelOrig),
      bodyOrig,
      bodyNorm: normalize(bodyOrig),
      combinedOrig,
      combinedMap: normalizeWithMap(combinedOrig),
      order,
    });
  }

  indexCache.set(locale, entries);
  return entries;
}

/** Invalidate all search index caches. */
export function invalidateSearchIndex(): void {
  indexCache.clear();
}

// -----------------------------------------------------------------------
// Search
// -----------------------------------------------------------------------

/** Score weights per field where a token matches. */
const HEADING_WEIGHT = 3;
const LABEL_WEIGHT = 2;
const BODY_WEIGHT = 1;

const MAX_RESULTS = 20;
const SNIPPET_CONTEXT = 40;

/**
 * Search the handbook for a query string. Tokenizes on whitespace,
 * AND-matches across tokens (every token must appear somewhere in the
 * entry's heading, label, or body). Scores by field weight, ties broken
 * by taxonomy order. Returns at most 20 hits.
 */
export function searchHandbook(
  query: string,
  locale: string,
): readonly SearchHit[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const tokens = normalize(trimmed)
    .split(/\s+/)
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return [];

  const index = buildSearchIndex(locale);
  const scored: Array<{ entry: IndexEntry; score: number }> = [];

  for (const entry of index) {
    let allMatch = true;
    let score = 0;

    for (const token of tokens) {
      let tokenFound = false;
      if (entry.headingNorm.includes(token)) {
        score += HEADING_WEIGHT;
        tokenFound = true;
      }
      if (entry.labelNorm.includes(token)) {
        score += LABEL_WEIGHT;
        tokenFound = true;
      }
      if (entry.bodyNorm.includes(token)) {
        score += BODY_WEIGHT;
        tokenFound = true;
      }
      if (!tokenFound) {
        allMatch = false;
        break;
      }
    }

    if (allMatch) {
      scored.push({ entry, score });
    }
  }

  // Sort by score descending, then by taxonomy order ascending
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.entry.order - b.entry.order;
  });

  // Cap results and build SearchHit objects
  const results: SearchHit[] = [];
  const capped = scored.slice(0, MAX_RESULTS);

  for (const { entry } of capped) {
    const snippet = buildSnippet(entry, tokens);
    results.push({
      sectionId: entry.corpus.sectionId,
      subSlug: entry.corpus.subSlug,
      key: entry.corpus.key,
      lineIdx: entry.corpus.lineIdx,
      label: entry.corpus.label,
      snippet,
    });
  }

  return results;
}

// -----------------------------------------------------------------------
// Snippet construction
//
// Find the first token match in the normalized combined text, then use
// the offset map to extract the corresponding substring from the
// original text with surrounding context.
// -----------------------------------------------------------------------

function buildSnippet(
  entry: IndexEntry,
  tokens: readonly string[],
): SearchSnippet {
  const { normalized, offsetMap } = entry.combinedMap;
  const orig = entry.combinedOrig;

  // Find the earliest token match position in the normalized text
  let bestPos = normalized.length;
  let bestLen = 0;
  for (const token of tokens) {
    const pos = normalized.indexOf(token);
    if (pos !== -1 && pos < bestPos) {
      bestPos = pos;
      bestLen = token.length;
    }
  }

  // Fallback: if no match found in combined (should not happen), return
  // the start of the body.
  if (bestPos >= normalized.length || bestLen === 0) {
    const end = Math.min(orig.length, SNIPPET_CONTEXT * 2);
    return { before: "", match: orig.slice(0, end), after: "" };
  }

  // Map normalized match range back to original string positions
  const origStart = offsetMap[bestPos] ?? 0;

  // The end of the match in normalized space
  const normEnd = bestPos + bestLen;
  // The original end is one past the last character's original position
  const lastNormIdx = normEnd - 1;
  const lastOrigIdx = offsetMap[lastNormIdx] ?? origStart;
  // Move one character past the last mapped original character.
  // We need to find the next distinct original index after lastOrigIdx.
  let origEnd = lastOrigIdx + 1;
  // If the next normalized char maps to a further original char, that
  // confirms our boundary. Otherwise move to the end of the character
  // at lastOrigIdx (safe for BMP text).
  if (normEnd < offsetMap.length) {
    const nextOrig = offsetMap[normEnd]!;
    if (nextOrig > origEnd) origEnd = nextOrig;
  }
  // Clamp to string length
  if (origEnd > orig.length) origEnd = orig.length;

  // Context window around the match in the original string
  const ctxStart = Math.max(0, origStart - SNIPPET_CONTEXT);
  const ctxEnd = Math.min(orig.length, origEnd + SNIPPET_CONTEXT);

  return {
    before: orig.slice(ctxStart, origStart),
    match: orig.slice(origStart, origEnd),
    after: orig.slice(origEnd, ctxEnd),
  };
}
