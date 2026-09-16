import { describe, it, expect } from "vitest";
import { GUIDES, getGuide, type GuideSlug } from "./guide-checklists.js";
import { getSub, getSection } from "./scroll-sections.js";

describe("guide-checklists", () => {
  // -------------------------------------------------------------------
  // Structure validation
  // -------------------------------------------------------------------

  it("all guide slugs are unique", () => {
    const slugs = GUIDES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every guide has 3-6 steps", () => {
    for (const guide of GUIDES) {
      expect(
        guide.steps.length,
        `${guide.slug} has ${guide.steps.length} steps`,
      ).toBeGreaterThanOrEqual(3);
      expect(
        guide.steps.length,
        `${guide.slug} has ${guide.steps.length} steps`,
      ).toBeLessThanOrEqual(6);
    }
  });

  it("every guide titleKey follows demo_guide_<slug>_title convention", () => {
    for (const guide of GUIDES) {
      const expected = `demo_guide_${guide.slug.replace(/-/g, "_")}_title`;
      expect(guide.titleKey, `${guide.slug} titleKey`).toBe(expected);
    }
  });

  it("every step bodyKey follows demo_guide_<slug>_step<N> convention", () => {
    for (const guide of GUIDES) {
      for (let i = 0; i < guide.steps.length; i++) {
        const expected = `demo_guide_${guide.slug.replace(/-/g, "_")}_step${i + 1}`;
        expect(guide.steps[i]!.bodyKey, `${guide.slug} step ${i + 1}`).toBe(
          expected,
        );
      }
    }
  });

  // -------------------------------------------------------------------
  // Target validation against SECTIONS taxonomy
  // -------------------------------------------------------------------

  it("every non-null step target resolves in scroll-sections", () => {
    for (const guide of GUIDES) {
      for (const step of guide.steps) {
        if (step.target === null) continue;
        const { sectionId, subSlug } = step.target;

        // Section must exist
        const section = getSection(sectionId);
        expect(
          section,
          `${guide.slug}: section "${sectionId}" not found in SECTIONS`,
        ).toBeDefined();

        // Sub must exist within the section
        const sub = getSub(sectionId, subSlug);
        expect(
          sub,
          `${guide.slug}: sub "${sectionId}/${subSlug}" not found in SECTIONS`,
        ).toBeDefined();
      }
    }
  });

  // -------------------------------------------------------------------
  // Lookup
  // -------------------------------------------------------------------

  it("getGuide returns the definition for a known slug", () => {
    const guide = getGuide("take-a-call");
    expect(guide).toBeDefined();
    expect(guide!.slug).toBe("take-a-call");
  });

  it("getGuide returns undefined for an unknown slug", () => {
    const guide = getGuide("nonexistent" as GuideSlug);
    expect(guide).toBeUndefined();
  });

  it("defines all 12 guides", () => {
    expect(GUIDES.length).toBe(12);
  });
});
