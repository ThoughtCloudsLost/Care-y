import { describe, it, expect, beforeEach } from "vitest";
import { PAGES, getAggPage } from "./aggregation-pages.js";
import { searchEntries, invalidateSearchIndex } from "./handbook-search.js";
import { invalidateCorpusCache } from "./handbook-corpus.js";

const LOCALE = "en";

beforeEach(() => {
  invalidateSearchIndex();
  invalidateCorpusCache();
});

describe("aggregation-pages", () => {
  it("page ids are unique", () => {
    const ids = PAGES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every label on every page matches >= 1 EN entry", () => {
    for (const page of PAGES) {
      for (const label of page.labels) {
        const hits = searchEntries("", LOCALE, { labels: [label] });
        expect(
          hits.length,
          `page "${page.id}" label "${label}" matched no entries`,
        ).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("every tag on every page matches >= 1 EN entry", () => {
    for (const page of PAGES) {
      for (const tag of page.tags) {
        const hits = searchEntries("", LOCALE, { tags: [tag], limit: 100 });
        expect(
          hits.length,
          `page "${page.id}" tag "${tag}" matched no entries`,
        ).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("every page with labels returns non-empty entries in EN", () => {
    for (const page of PAGES) {
      if (page.labels.length === 0) continue;
      const hits = searchEntries("", LOCALE, {
        labels: page.labels,
        limit: 100,
      });
      expect(hits.length, `page "${page.id}" is empty`).toBeGreaterThan(0);
    }
  });

  it("every page with tags returns non-empty entries in EN", () => {
    for (const page of PAGES) {
      if (page.tags.length === 0) continue;
      const hits = searchEntries("", LOCALE, {
        tags: page.tags,
        limit: 100,
      });
      expect(hits.length, `page "${page.id}" is empty`).toBeGreaterThan(0);
    }
  });

  it("pages without labels or tags carry provisional prose keys", () => {
    for (const page of PAGES) {
      expect(
        page.labels.length + page.tags.length + page.proseKeys.length,
        `page "${page.id}" has neither labels, tags, nor prose keys`,
      ).toBeGreaterThan(0);
    }
  });

  it("key naming follows the demo_agg_<id> convention", () => {
    for (const page of PAGES) {
      const stem = `demo_agg_${page.id.replace(/-/g, "_")}`;
      expect(page.titleKey).toBe(`${stem}_title`);
      expect(page.introKey).toBe(`${stem}_intro`);
    }
  });

  it("getAggPage looks up by id", () => {
    expect(getAggPage("encryption")?.id).toBe("encryption");
    expect(getAggPage("cannot-prove")?.proseKeys.length).toBeGreaterThan(0);
  });
});
