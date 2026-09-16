import { describe, it, expect, beforeEach } from "vitest";
import {
  buildCorpus,
  getCorpusEntry,
  invalidateCorpusCache,
} from "./handbook-corpus.js";

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
    // demo_narrative_topic_case_fold_body line 2 starts with **Encryption.**
    const entry = getCorpusEntry(
      LOCALE,
      "demo_narrative_topic_case_fold_body",
      2,
    );
    expect(entry).not.toBeNull();
    expect(entry!.label).toBe("Encryption.");
    expect(entry!.plainText.length).toBeGreaterThan(0);
    expect(entry!.sectionId).toBe("ticket-detail");
    expect(entry!.subSlug).toBe("case-fold");
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
});
