import { describe, it, expect, beforeEach } from "vitest";
import {
  buildSearchResultsSection,
  buildAggregationSection,
  distinctHitLabels,
} from "./excursion-sections.js";
import { searchEntries, invalidateSearchIndex } from "./handbook-search.js";
import { invalidateCorpusCache } from "./handbook-corpus.js";
import { getSub } from "./scroll-sections.js";

const LOCALE = "en";

beforeEach(() => {
  invalidateSearchIndex();
  invalidateCorpusCache();
});

describe("buildSearchResultsSection", () => {
  it("carries prefixed unique slugs whose map round-trips to real subs", () => {
    const hits = searchEntries("encryption", LOCALE, { limit: 100 });
    const { section, slugMap } = buildSearchResultsSection(hits);

    const slugs = section.subs.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const sub of section.subs) {
      const real = slugMap.get(sub.slug);
      expect(real, `no mapping for ${sub.slug}`).toBeDefined();
      const found = getSub(real!.sectionId, real!.subSlug);
      expect(found, `${sub.slug} does not round-trip`).toBeDefined();
      // The synthetic sub renders with the REAL keys, so the story
      // shows the entry exactly as its home section does.
      expect(sub.headingKey).toBe(found!.sub.headingKey);
      expect(sub.bodyKey).toBe(found!.sub.bodyKey);
    }
  });

  it("uses the search-results synthetic id and chrome keys", () => {
    const { section } = buildSearchResultsSection([]);
    expect(section.id).toBe("search-results");
    expect(section.titleKey).toBe("demo_search_results_title");
    expect(section.subs).toEqual([]);
  });
});

describe("buildAggregationSection", () => {
  it("encryption page is non-empty, deduped, taxonomy order", () => {
    const { section, slugMap } = buildAggregationSection("encryption", LOCALE);
    expect(section.id).toBe("aggregation-view");
    expect(section.subs.length).toBeGreaterThan(0);
    const slugs = section.subs.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    // Stable across rebuilds (taxonomy order, not score order).
    const again = buildAggregationSection("encryption", LOCALE);
    expect(again.section.subs.map((s) => s.slug)).toEqual(slugs);
    for (const slug of slugs) {
      expect(slugMap.get(slug)).toBeDefined();
    }
  });

  it("prose subs follow the DEV/prod tolerance for unwritten keys", () => {
    const { section, slugMap } = buildAggregationSection(
      "cannot-prove",
      LOCALE,
    );
    // Vitest runs in DEV, where resolveOptionalStoryMessage returns raw
    // keys so gaps stay visible; the subs therefore render here. In
    // prod the same keys resolve to null and the page ships empty.
    // Either way, prose subs are inert: they never enter the slug map.
    for (const sub of section.subs) {
      expect(sub.slug.startsWith("prose--")).toBe(true);
      expect(slugMap.get(sub.slug)).toBeUndefined();
    }
  });
});

describe("distinctHitLabels", () => {
  it("returns first-seen distinct labels across hits", () => {
    const hits = searchEntries("", LOCALE, {
      labels: ["Encryption.", "Privacy."],
      limit: 100,
    });
    const labels = distinctHitLabels(hits);
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels.includes("Encryption.") || labels.includes("Privacy.")).toBe(
      true,
    );
  });
});
