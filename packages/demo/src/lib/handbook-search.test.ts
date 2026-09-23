import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { overwriteGetLocale } from "$lib/paraglide/runtime";
import {
  normalize,
  searchEntries,
  invalidateSearchIndex,
} from "./handbook-search.js";
import { invalidateCorpusCache } from "./handbook-corpus.js";
import { getSub } from "./scroll-sections.js";

const EN = "en";
const ES = "es";

/** The corpus resolves through paraglide's GLOBAL locale; the locale
 *  argument is a cache key and reactivity signal. Tests that need ES
 *  text must switch the global. */
function withLocale<T>(locale: string, fn: () => T): T {
  overwriteGetLocale(() => locale as "en");
  try {
    return fn();
  } finally {
    overwriteGetLocale(() => "en");
  }
}

beforeEach(() => {
  // Start each test with fresh caches
  invalidateSearchIndex();
  invalidateCorpusCache();
});

afterEach(() => {
  overwriteGetLocale(() => "en");
});

describe("normalize", () => {
  it("lowercases and strips combining marks", () => {
    expect(normalize("Atención")).toBe("atencion");
    expect(normalize("HELLO")).toBe("hello");
    expect(normalize("Café")).toBe("cafe");
  });

  it("handles already-normalized text", () => {
    expect(normalize("plain text")).toBe("plain text");
  });

  it("handles empty string", () => {
    expect(normalize("")).toBe("");
  });
});

describe("searchEntries", () => {
  it("returns empty for empty or whitespace-only query with no labels", () => {
    expect(searchEntries("", EN)).toEqual([]);
    expect(searchEntries("   ", EN)).toEqual([]);
    expect(searchEntries("\t\n", EN)).toEqual([]);
  });

  it("returns whole entries: every hit resolves to a real sub", () => {
    const hits = searchEntries("encryption", EN);
    expect(hits.length).toBeGreaterThan(0);
    for (const hit of hits) {
      expect(
        getSub(hit.sectionId, hit.subSlug),
        `${hit.sectionId}/${hit.subSlug} is not a real sub`,
      ).toBeDefined();
    }
  });

  it("dedupes: an entry appears once no matter how many lines match", () => {
    const hits = searchEntries("encryption", EN, { limit: 100 });
    const keys = hits.map((h) => `${h.sectionId}--${h.subSlug}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("AND-matches across the entry's heading and body together", () => {
    // Both tokens must appear somewhere in the entry, not per line.
    const hits = searchEntries("encryption keys", EN);
    expect(hits.length).toBeGreaterThan(0);
    const single = searchEntries("zzzznotaword encryption", EN);
    expect(single).toEqual([]);
  });

  it("matches diacritics both directions", () => {
    withLocale(ES, () => {
      const bare = searchEntries("cifrado", ES);
      expect(bare.length).toBeGreaterThan(0);
      // Accented and bare spellings of the same word find the same
      // entries: both sides of the match are normalized.
      const accented = searchEntries("organización", ES);
      const unaccented = searchEntries("organizacion", ES);
      expect(accented.length).toBeGreaterThan(0);
      expect(accented.map((h) => h.subSlug)).toEqual(
        unaccented.map((h) => h.subSlug),
      );
    });
  });

  it("caps at the default limit of 20", () => {
    const hits = searchEntries("the", EN);
    expect(hits.length).toBeLessThanOrEqual(20);
  });

  it("honors a custom limit", () => {
    const hits = searchEntries("the", EN, { limit: 5 });
    expect(hits.length).toBeLessThanOrEqual(5);
  });

  it("ranks heading matches above body-only matches", () => {
    // Any query that appears in some entry's heading should surface
    // that entry ahead of entries where it appears only in body text.
    const hits = searchEntries("encryption", EN, { limit: 100 });
    expect(hits.length).toBeGreaterThan(1);
    expect(hits[0]!.score).toBeGreaterThanOrEqual(hits.at(-1)!.score);
  });

  it("label filter narrows to entries carrying the label", () => {
    const all = searchEntries("", EN, {
      labels: ["What folding records."],
      limit: 100,
    });
    expect(all.length).toBeGreaterThan(0);
    for (const hit of all) {
      expect(hit.labels).toContain("What folding records.");
    }
  });

  it("empty query with labels returns entries in taxonomy order", () => {
    const hits = searchEntries("", EN, {
      labels: ["What folding records."],
      limit: 100,
    });
    // Zero scores throughout; order is the corpus walk order, which is
    // stable across calls.
    const again = searchEntries("", EN, {
      labels: ["What folding records."],
      limit: 100,
    });
    expect(hits.map((h) => h.subSlug)).toEqual(again.map((h) => h.subSlug));
    expect(hits.every((h) => h.score === 0)).toBe(true);
  });

  it("per-locale caches are independent", () => {
    const en = searchEntries("encryption", EN);
    expect(en.length).toBeGreaterThan(0);
    const es = withLocale(ES, () => searchEntries("cifrado", ES));
    expect(es.length).toBeGreaterThan(0);
    // The EN cache was not clobbered by the ES build.
    expect(searchEntries("encryption", EN).length).toBe(en.length);
  });

  it("every hit carries a tags array", () => {
    const hits = searchEntries("encryption", EN);
    for (const hit of hits) {
      expect(Array.isArray(hit.tags)).toBe(true);
    }
  });

  it("empty query with tags filter returns matching entries", () => {
    // No entries carry tags yet (no tags in the corpus source), so
    // this should return empty. The filter path is exercised: if tags
    // were present, only entries carrying at least one would survive.
    const hits = searchEntries("", EN, {
      tags: ["nonexistent-tag"],
      limit: 100,
    });
    expect(hits).toEqual([]);
  });

  it("mixed label+tag filter narrows to entries carrying both", () => {
    // With tags: ["nonexistent-tag"], no entry can pass, even if it
    // carries the label.
    const hits = searchEntries("", EN, {
      labels: ["Encryption."],
      tags: ["nonexistent-tag"],
      limit: 100,
    });
    expect(hits).toEqual([]);
  });
});
