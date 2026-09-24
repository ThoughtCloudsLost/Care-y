/**
 * Handbook corpus: one entry per markup line of every section/sub body
 * across SECTIONS and ENTRY_SECTION.
 *
 * The corpus serves aggregation pages, which collect labelled seam
 * stretches (bold-prefixed paragraphs like "**Encryption.**") from
 * across the handbook into focused reference views.
 *
 * Pure functions only. No DOM, no Svelte runes.
 */

import { SECTIONS, ENTRY_SECTION, type Section } from "./scroll-sections.js";
import { resolveStoryMessage } from "./story-messages.js";
import {
  hasFlowMarkup,
  parseFlowMarkup,
  extractTags,
  unitText,
  type MarkupUnit,
} from "./flow-markup.js";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface CorpusEntry {
  readonly sectionId: string;
  readonly subSlug: string | null;
  readonly key: string;
  readonly lineIdx: number;
  readonly label: string | null;
  readonly plainText: string;
  readonly units: readonly MarkupUnit[];
  /** Invisible search tags extracted from `[[#tag]]` blocks. */
  readonly tags: readonly string[];
  /** True when this entry comes from ENTRY_SECTION (shares "login" id). */
  readonly isEntry: boolean;
}

// -----------------------------------------------------------------------
// Label extraction
//
// A label is the text of the first run of a unit when that run is bold
// and its text ends with ".". The plainText is the unit text without
// the label run's contribution.
// -----------------------------------------------------------------------

function extractLabel(unit: MarkupUnit): {
  label: string | null;
  plainText: string;
} {
  const firstRun = unit.runs[0];
  if (firstRun !== undefined && firstRun.bold && firstRun.text.endsWith(".")) {
    const rest = unit.runs
      .slice(1)
      .map((r) => r.text)
      .join("");
    return { label: firstRun.text, plainText: rest.trimStart() };
  }
  return { label: null, plainText: unitText(unit) };
}

// -----------------------------------------------------------------------
// Corpus builder
// -----------------------------------------------------------------------

/** Per-locale cache. Keyed by locale string. */
const corpusCache = new Map<string, readonly CorpusEntry[]>();

function buildSectionCorpus(
  section: Section,
  locale: string,
  isEntry: boolean,
): CorpusEntry[] {
  const entries: CorpusEntry[] = [];

  // Section-level desc
  const descResolved = resolveStoryMessage(section.descKey, locale);
  if (descResolved !== section.descKey) {
    addKeyEntries(
      entries,
      section.id,
      null,
      section.descKey,
      descResolved,
      isEntry,
    );
  }

  // Sub-section bodies
  for (const sub of section.subs) {
    const bodyResolved = resolveStoryMessage(sub.bodyKey, locale);
    if (bodyResolved !== sub.bodyKey) {
      addKeyEntries(
        entries,
        section.id,
        sub.slug,
        sub.bodyKey,
        bodyResolved,
        isEntry,
      );
    }
  }

  return entries;
}

function addKeyEntries(
  out: CorpusEntry[],
  sectionId: string,
  subSlug: string | null,
  key: string,
  resolved: string,
  isEntry: boolean,
): void {
  // Strip search tags before parsing markup. Tags accumulate across
  // all units of a key into one array per CorpusEntry.
  const { cleaned, tags: keyTags } = extractTags(resolved);

  if (hasFlowMarkup(cleaned)) {
    const units = parseFlowMarkup(cleaned);
    for (let i = 0; i < units.length; i++) {
      const unit = units.at(i);
      if (unit === undefined) continue;
      const { label, plainText } = extractLabel(unit);
      out.push({
        sectionId,
        subSlug,
        key,
        lineIdx: i,
        label,
        plainText,
        units: [unit],
        tags: keyTags,
        isEntry,
      });
    }
  } else {
    // Single plain paragraph
    const singleUnit: MarkupUnit = {
      kind: "paragraph",
      marker: null,
      runs: [{ text: cleaned, bold: false }],
    };
    out.push({
      sectionId,
      subSlug,
      key,
      lineIdx: 0,
      label: null,
      plainText: cleaned,
      units: [singleUnit],
      tags: keyTags,
      isEntry,
    });
  }
}

/**
 * Build (or return cached) the full corpus for a locale.
 *
 * The locale parameter drives reactive dependency tracking in Svelte
 * callers. The cache self-invalidates on locale change.
 */
export function buildCorpus(locale: string): readonly CorpusEntry[] {
  const cached = corpusCache.get(locale);
  if (cached !== undefined) return cached;

  const entries: CorpusEntry[] = [];

  // ENTRY_SECTION first (shares "login" id, flagged isEntry=true)
  entries.push(...buildSectionCorpus(ENTRY_SECTION, locale, true));

  // Main sections
  for (const section of SECTIONS) {
    entries.push(...buildSectionCorpus(section, locale, false));
  }

  corpusCache.set(locale, entries);
  return entries;
}

// -----------------------------------------------------------------------
// Lookup index (lazily built per locale, invalidated with the corpus)
// -----------------------------------------------------------------------

const indexCache = new Map<string, Map<string, CorpusEntry>>();

function ensureIndex(locale: string): Map<string, CorpusEntry> {
  const cached = indexCache.get(locale);
  if (cached !== undefined) return cached;

  const corpus = buildCorpus(locale);
  const index = new Map<string, CorpusEntry>();
  for (const entry of corpus) {
    const ref = `${entry.key}#${String(entry.lineIdx)}`;
    // First entry wins (ENTRY_SECTION comes first and may share keys,
    // but the ref includes lineIdx so collisions are not expected).
    if (!index.has(ref)) {
      index.set(ref, entry);
    }
  }
  indexCache.set(locale, index);
  return index;
}

/**
 * Look up a single corpus entry by message key and line index.
 * Returns null when the key/line combination is absent.
 */
export function getCorpusEntry(
  locale: string,
  key: string,
  lineIdx: number,
): CorpusEntry | null {
  const ref = `${key}#${String(lineIdx)}`;
  return ensureIndex(locale).get(ref) ?? null;
}

/** Invalidate all cached corpora and their lookup indexes. */
export function invalidateCorpusCache(): void {
  corpusCache.clear();
  indexCache.clear();
}
