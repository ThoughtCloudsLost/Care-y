/**
 * Full-text handbook search: normalization, index construction, and
 * ranked entry-level search across the demo handbook corpus.
 *
 * Results are whole sub-entries (heading + body), not line fragments:
 * the search surface renders matches exactly as the handbook renders
 * them, so the unit of retrieval is the unit of display.
 *
 * Pure module. No DOM, no Svelte runes, no side effects beyond
 * the per-locale index cache.
 */

import { buildCorpus, type CorpusEntry } from "./handbook-corpus.js";
import { resolveStoryMessage } from "./story-messages.js";
import { getSection, getSub } from "./scroll-sections.js";
import type { SectionId } from "./bridge.js";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

/** One matched sub-entry. The entry appears once no matter how many of
 *  its lines matched; `labels` lists the seam labels it carries. */
export interface EntryHit {
  readonly sectionId: SectionId;
  readonly subSlug: string;
  readonly score: number;
  readonly labels: readonly string[];
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
// Index entry (one per corpus line; search aggregates them per sub)
// -----------------------------------------------------------------------

interface IndexEntry {
  readonly corpus: CorpusEntry;
  readonly headingNorm: string;
  readonly labelNorm: string;
  readonly bodyNorm: string;
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
    const c = corpus.at(order);
    if (c === undefined) continue;

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

    entries.push({
      corpus: c,
      headingNorm: normalize(heading),
      labelNorm: normalize(c.label ?? ""),
      bodyNorm: normalize(c.plainText),
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
// Entry-level search
// -----------------------------------------------------------------------

/** Score weights per field where a token matches. */
const HEADING_WEIGHT = 3;
const LABEL_WEIGHT = 2;
const BODY_WEIGHT = 1;

const DEFAULT_LIMIT = 20;

export interface SearchOptions {
  /** Maximum number of entry hits. Default 20. */
  readonly limit?: number;
  /** When provided, only entries carrying one of these seam labels on
   *  at least one line are included. */
  readonly labels?: readonly string[];
}

/** Aggregation bucket for one sub-entry while scoring. */
interface EntryBucket {
  readonly sectionId: SectionId;
  readonly subSlug: string;
  readonly lines: IndexEntry[];
  readonly labels: string[];
  order: number;
}

/**
 * Search the handbook at entry granularity. Tokenizes on whitespace and
 * AND-matches across tokens: every token must appear somewhere in the
 * entry's heading or any of its body lines. Scores sum the field
 * weights over all lines where each token appears; ties break by
 * taxonomy order. Returns at most `limit` entries.
 *
 * With `labels` set, only entries carrying one of those labels are
 * eligible. With an empty query and `labels` set, all such entries
 * return in taxonomy order (no text scoring) — the aggregation pages'
 * query mode.
 *
 * Corpus lines without a sub (section titles and descriptions) are
 * intro material, not entries, and are not searched.
 */
export function searchEntries(
  query: string,
  locale: string,
  options?: SearchOptions,
): readonly EntryHit[] {
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const labelFilter = options?.labels ?? null;

  const trimmed = query.trim();
  const tokens =
    trimmed.length > 0
      ? normalize(trimmed)
          .split(/\s+/)
          .filter((t) => t.length > 0)
      : [];

  // No query and no label filter means no results.
  if (tokens.length === 0 && labelFilter === null) return [];

  // Group the line index into per-sub buckets, taxonomy order.
  const index = buildSearchIndex(locale);
  const buckets = new Map<string, EntryBucket>();
  for (const line of index) {
    if (line.corpus.subSlug === null) continue;
    const key = `${line.corpus.sectionId}--${line.corpus.subSlug}`;
    let bucket = buckets.get(key);
    if (bucket === undefined) {
      bucket = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- sectionId comes from SCROLL_SECTIONS corpus
        sectionId: line.corpus.sectionId as SectionId,
        subSlug: line.corpus.subSlug,
        lines: [],
        labels: [],
        order: line.order,
      };
      buckets.set(key, bucket);
    }
    bucket.lines.push(line);
    if (
      line.corpus.label !== null &&
      !bucket.labels.includes(line.corpus.label)
    ) {
      bucket.labels.push(line.corpus.label);
    }
  }

  const scored: { bucket: EntryBucket; score: number }[] = [];

  for (const bucket of buckets.values()) {
    if (labelFilter !== null) {
      const carries = bucket.labels.some((l) => labelFilter.includes(l));
      if (!carries) continue;
    }

    if (tokens.length === 0) {
      scored.push({ bucket, score: 0 });
      continue;
    }

    let allMatch = true;
    let score = 0;
    // The heading is shared by every line of the bucket, so it scores
    // once per token; labels and body lines score per occurrence line.
    const headingNorm = bucket.lines[0]?.headingNorm ?? "";
    for (const token of tokens) {
      let tokenFound = false;
      if (headingNorm.includes(token)) {
        score += HEADING_WEIGHT;
        tokenFound = true;
      }
      for (const line of bucket.lines) {
        if (line.labelNorm.includes(token)) {
          score += LABEL_WEIGHT;
          tokenFound = true;
        }
        if (line.bodyNorm.includes(token)) {
          score += BODY_WEIGHT;
          tokenFound = true;
        }
      }
      if (!tokenFound) {
        allMatch = false;
        break;
      }
    }
    if (allMatch) scored.push({ bucket, score });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.bucket.order - b.bucket.order;
  });

  return scored.slice(0, limit).map(({ bucket, score }) => ({
    sectionId: bucket.sectionId,
    subSlug: bucket.subSlug,
    score,
    labels: bucket.labels,
  }));
}
