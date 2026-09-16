import { describe, it, expect } from "vitest";
import { PAGES, getAggPage } from "./aggregation-pages.js";
import { getCorpusEntry } from "./handbook-corpus.js";

const LOCALE = "en";

describe("aggregation-pages", () => {
  it("page ids are unique", () => {
    const ids = PAGES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every stretches ref resolves via getCorpusEntry to an entry with a non-null label", () => {
    for (const page of PAGES) {
      for (const section of page.sections) {
        if (section.kind !== "stretches") continue;
        for (const ref of section.refs) {
          const hashIdx = ref.indexOf("#");
          expect(hashIdx, `ref "${ref}" missing # separator`).toBeGreaterThan(
            0,
          );

          const key = ref.slice(0, hashIdx);
          const lineIdx = Number(ref.slice(hashIdx + 1));
          expect(
            Number.isNaN(lineIdx),
            `ref "${ref}" has non-numeric lineIdx`,
          ).toBe(false);

          const entry = getCorpusEntry(LOCALE, key, lineIdx);
          expect(entry, `ref "${ref}" did not resolve`).not.toBeNull();
          expect(
            entry!.label,
            `ref "${ref}" resolved but has null label`,
          ).not.toBeNull();
        }
      }
    }
  });

  it("who-sees contains exactly one matrix section", () => {
    const whoSees = getAggPage("who-sees");
    expect(whoSees).toBeDefined();
    const matrixSections = whoSees!.sections.filter((s) => s.kind === "matrix");
    expect(matrixSections.length).toBe(1);
  });

  it("every page titleKey and introKey follow naming convention", () => {
    for (const page of PAGES) {
      expect(page.titleKey).toBe(
        `demo_agg_${page.id.replace(/-/g, "_")}_title`,
      );
      expect(page.introKey).toBe(
        `demo_agg_${page.id.replace(/-/g, "_")}_intro`,
      );
    }
  });

  it("getAggPage returns the correct page for each id", () => {
    for (const page of PAGES) {
      const found = getAggPage(page.id);
      expect(found).toBe(page);
    }
  });
});
