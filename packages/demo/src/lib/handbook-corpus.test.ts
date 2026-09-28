import { describe, it, expect, beforeEach } from "vitest";
import {
  buildCorpus,
  getCorpusEntry,
  invalidateCorpusCache,
} from "./handbook-corpus.js";
import { SECTIONS } from "./scroll-sections.js";

// Tests run against the EN catalog (paraglide resolves EN by default
// in the test environment).
const LOCALE = "en";

describe("handbook-corpus", () => {
  beforeEach(() => {
    invalidateCorpusCache();
  });

  it("EN corpus has at least 100 labelled seam entries", () => {
    const corpus = buildCorpus(LOCALE);
    const labelled = corpus.filter((e) => e.label !== null);
    // The audit counted 319 labelled bodies across all keys. The
    // corpus indexes desc + body keys from SECTIONS + ENTRY_SECTION,
    // which covers all of them.
    expect(labelled.length).toBeGreaterThanOrEqual(100);
  });

  it("a known key/line resolves with the expected label", () => {
    // demo_narrative_topic_case_fold_body line 2 starts with
    // **The fold store and drag handling.**
    const entry = getCorpusEntry(
      LOCALE,
      "demo_narrative_topic_case_fold_body",
      2,
    );
    expect(entry).not.toBeNull();
    expect(entry!.label).toBe("The fold store and drag handling.");
    expect(entry!.plainText.length).toBeGreaterThan(0);
    expect(entry!.sectionId).toBe("ticket-detail");
    expect(entry!.subSlug).toBe("case-fold");
  });

  it("a bold opening ending in a question mark is a label with its body text", () => {
    // demo_narrative_topic_case_fold_body line 1 starts with
    // **Where does the fold live?**
    const entry = getCorpusEntry(
      LOCALE,
      "demo_narrative_topic_case_fold_body",
      1,
    );
    expect(entry).not.toBeNull();
    expect(entry!.label).toBe("Where does the fold live?");
    expect(entry!.plainText).toMatch(/^One entry in a reactive map/);
    expect(entry!.plainText).not.toContain("Where does the fold live?");
    expect(entry!.sectionId).toBe("ticket-detail");
    expect(entry!.subSlug).toBe("case-fold");
  });

  it("a question label on its own line carries an empty body", () => {
    // demo_narrative_deepdive_deployment_body line 1 is
    // **What differs between the two?** introducing a bullet list.
    const entry = getCorpusEntry(
      LOCALE,
      "demo_narrative_deepdive_deployment_body",
      1,
    );
    expect(entry).not.toBeNull();
    expect(entry!.label).toBe("What differs between the two?");
    expect(entry!.plainText).toBe("");
    expect(entry!.sectionId).toBe("deep-dive");
    expect(entry!.subSlug).toBe("deployment");
  });

  it("missing keys are skipped (no entry for a key that is not in the lookup)", () => {
    const entry = getCorpusEntry(LOCALE, "demo_nonexistent_body", 0);
    expect(entry).toBeNull();
  });

  it("cache: two builds with the same locale return the same reference", () => {
    const a = buildCorpus(LOCALE);
    const b = buildCorpus(LOCALE);
    expect(a).toBe(b);
  });

  it("invalidateCorpusCache busts the cache", () => {
    const a = buildCorpus(LOCALE);
    invalidateCorpusCache();
    const b = buildCorpus(LOCALE);
    expect(a).not.toBe(b);
    // Content should still be equivalent
    expect(a.length).toBe(b.length);
  });

  it("ENTRY_SECTION entries are flagged with isEntry=true", () => {
    const corpus = buildCorpus(LOCALE);
    const entryEntries = corpus.filter((e) => e.isEntry);
    // ENTRY_SECTION has 4 subs, each with a bodyKey
    expect(entryEntries.length).toBeGreaterThan(0);
    for (const e of entryEntries) {
      expect(e.isEntry).toBe(true);
    }
  });

  it("non-ENTRY_SECTION entries are flagged with isEntry=false", () => {
    const corpus = buildCorpus(LOCALE);
    const mainEntries = corpus.filter((e) => !e.isEntry);
    expect(mainEntries.length).toBeGreaterThan(0);
  });

  it("every CorpusEntry carries a tags array (empty when no tags in source)", () => {
    const corpus = buildCorpus(LOCALE);
    for (const entry of corpus) {
      expect(Array.isArray(entry.tags)).toBe(true);
    }
  });

  it("deep-dive entries appear in the corpus when catalog keys are present", () => {
    const corpus = buildCorpus(LOCALE);
    const deepDiveEntries = corpus.filter((e) => e.sectionId === "deep-dive");
    // A bold label on its own line (introducing a list) carries an
    // empty plainText by design, so each line must carry a label or
    // body text, not necessarily both.
    for (const entry of deepDiveEntries) {
      expect(
        (entry.label ?? "").length + entry.plainText.length,
      ).toBeGreaterThan(0);
    }
    // Section-level entries (the desc) carry a null subSlug by design;
    // every deep-dive body in SECTIONS must be indexed under its slug.
    const slugs = new Set(
      deepDiveEntries.map((e) => e.subSlug).filter((s) => s !== null),
    );
    const deepDive = SECTIONS.find((s) => s.id === "deep-dive");
    expect(deepDive).toBeDefined();
    expect(slugs).toEqual(new Set(deepDive!.subs.map((s) => s.slug)));
  });
});
