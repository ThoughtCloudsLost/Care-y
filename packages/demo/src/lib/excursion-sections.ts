/**
 * Synthetic Section builders for handbook excursions.
 *
 * Search results and aggregation pages render through the same story
 * pipeline as every other page (the ENTRY_SECTION / comingSoonSection
 * precedent): a synthetic Section whose subs are the REAL matched subs,
 * so blocks, seam formatting, the frame hole, and the drawer re-render
 * come from the one engine instead of being imitated by a side surface.
 *
 * Sub slugs are prefixed with their source section id so two sections'
 * same-named subs cannot collide inside one synthetic section; the
 * returned slug map carries each prefixed slug back to its real
 * location for navigation.
 *
 * Pure module: no runes, no DOM.
 */

import type { Section, SubSection } from "./scroll-sections.js";
import { getSub } from "./scroll-sections.js";
import { searchEntries, type EntryHit } from "./handbook-search.js";
import { resolveOptionalStoryMessage } from "./story-messages.js";
import { getAggPage, type AggregationPageId } from "./aggregation-pages.js";

export interface SyntheticSection {
  readonly section: Section;
  /** Prefixed sub slug -> real location. */
  readonly slugMap: ReadonlyMap<
    string,
    { readonly sectionId: Section["id"]; readonly subSlug: string }
  >;
}

/** Real subs for a list of entry hits, slugs prefixed for uniqueness. */
function subsForHits(hits: readonly EntryHit[]): {
  subs: SubSection[];
  slugMap: Map<string, { sectionId: Section["id"]; subSlug: string }>;
} {
  const subs: SubSection[] = [];
  const slugMap = new Map<
    string,
    { sectionId: Section["id"]; subSlug: string }
  >();
  for (const hit of hits) {
    const found = getSub(hit.sectionId, hit.subSlug);
    if (found === undefined) continue;
    const slug = `${hit.sectionId}--${hit.subSlug}`;
    subs.push({ ...found.sub, slug });
    slugMap.set(slug, { sectionId: hit.sectionId, subSlug: hit.subSlug });
  }
  return { subs, slugMap };
}

/**
 * Search results as a synthetic section. Every sub is a real handbook
 * entry (its own heading/body keys, topic, highlight), so the story
 * renders it exactly as its home section does.
 */
export function buildSearchResultsSection(
  hits: readonly EntryHit[],
): SyntheticSection {
  const { subs, slugMap } = subsForHits(hits);
  return {
    section: {
      id: "search-results",
      titleKey: "demo_search_results_title",
      descKey: "demo_search_results_desc",
      routes: [],
      // Never rendered in the contents menu; group is nominal.
      group: "org",
      subs,
    },
    slugMap,
  };
}

/**
 * An aggregation page as a synthetic section: the whole entries that
 * carry the page's labels, in taxonomy order, plus any provisional
 * prose subs whose keys have resolved (unwritten Track P prose is
 * skipped, so pages ship sparse rather than broken).
 */
export function buildAggregationSection(
  pageId: AggregationPageId,
  locale: string,
): SyntheticSection {
  const page = getAggPage(pageId);
  const hasLabels = page !== undefined && page.labels.length > 0;
  const hasTags = page !== undefined && page.tags.length > 0;
  const hits =
    hasLabels || hasTags
      ? searchEntries("", locale, {
          labels: hasLabels ? page.labels : undefined,
          tags: hasTags ? page.tags : undefined,
          limit: 100,
        })
      : [];
  const { subs, slugMap } = subsForHits(hits);

  const proseSubs: SubSection[] = [];
  for (const key of page?.proseKeys ?? []) {
    if (resolveOptionalStoryMessage(key, locale) === null) continue;
    proseSubs.push({
      slug: `prose--${key}`,
      topic: null,
      headingKey: `${key}_heading`,
      bodyKey: key,
    });
  }

  return {
    section: {
      id: "aggregation-view",
      titleKey: page?.titleKey ?? "demo_agg_encryption_title",
      descKey: page?.introKey ?? "demo_agg_encryption_intro",
      routes: [],
      group: "org",
      subs: [...proseSubs, ...subs],
    },
    slugMap,
  };
}

/** Distinct seam labels and tags across a hit list, most frequent first
 *  (ties keep first-seen order). Tag facets display without the trailing
 *  period that labels carry. The merged list feeds the facet chip row. */
export function distinctHitFacets(
  hits: readonly EntryHit[],
): readonly string[] {
  const counts = new Map<string, number>();
  const order: string[] = [];

  function tally(facet: string): void {
    const prev = counts.get(facet);
    if (prev === undefined) {
      counts.set(facet, 1);
      order.push(facet);
    } else {
      counts.set(facet, prev + 1);
    }
  }

  for (const hit of hits) {
    for (const label of hit.labels) {
      tally(label);
    }
    for (const tag of hit.tags) {
      tally(tag);
    }
  }
  return order
    .map((facet, idx) => ({ facet, idx, count: counts.get(facet) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.idx - b.idx)
    .map((e) => e.facet);
}
