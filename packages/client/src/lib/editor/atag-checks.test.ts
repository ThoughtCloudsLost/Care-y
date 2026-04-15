// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { Node as PMNode } from "prosemirror-model";
import { kbArticleSchema } from "./prosemirror-schema.js";
import { checkDocument, isGenericLinkText } from "./atag-checks.js";

// ---------------------------------------------------------------------------
// Test builders
// ---------------------------------------------------------------------------

function doc(content: unknown[]): PMNode {
  return PMNode.fromJSON(kbArticleSchema, { type: "doc", content });
}

const t = (text: string, marks?: unknown[]) =>
  marks
    ? { type: "text" as const, marks, text }
    : { type: "text" as const, text };

const p = (
  ...texts: Array<string | { type: "text"; marks?: unknown[]; text: string }>
) => ({
  type: "paragraph",
  content: texts.map((s) => (typeof s === "string" ? t(s) : s)),
});

const heading = (level: number, text: string) => ({
  type: "heading",
  attrs: { level },
  content: [t(text)],
});

const emptyHeading = (level: number) => ({
  type: "heading",
  attrs: { level },
  content: [],
});

const image = (src: string, alt: string) => ({
  type: "image",
  attrs: { src, alt, title: null },
});

const imageNoAlt = (src: string) => ({
  type: "image",
  attrs: { src, alt: "", title: null },
});

const figure = (src: string, alt: string, caption: string) => ({
  type: "figure",
  content: [
    { type: "figure_image", attrs: { src, alt, title: null } },
    { type: "figcaption", content: [t(caption)] },
  ],
});

const figureNoAlt = (src: string, caption: string) => ({
  type: "figure",
  content: [
    { type: "figure_image", attrs: { src, alt: "", title: null } },
    { type: "figcaption", content: [t(caption)] },
  ],
});

const linkedText = (text: string, href: string) =>
  t(text, [{ type: "link", attrs: { href, title: null } }]);

// ---------------------------------------------------------------------------
// isGenericLinkText
// ---------------------------------------------------------------------------

describe("isGenericLinkText", () => {
  it.each([
    "click here",
    "Click Here",
    "here",
    "HERE",
    "read more",
    "more",
    "link",
    "this",
    "go",
    "learn more",
    "  click here  ",
  ])('returns true for "%s"', (text) => {
    expect(isGenericLinkText(text)).toBe(true);
  });

  it.each([
    "download the intake form",
    "view safety protocol",
    "OSHA guidelines",
    "crisis hotline numbers",
    "",
  ])('returns false for "%s"', (text) => {
    expect(isGenericLinkText(text)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkDocument
// ---------------------------------------------------------------------------

describe("checkDocument", () => {
  describe("heading hierarchy", () => {
    it("returns no warnings for sequential headings", () => {
      const d = doc([
        heading(1, "Title"),
        p("Intro"),
        heading(2, "Section"),
        p("Body"),
        heading(3, "Subsection"),
      ]);
      const warnings = checkDocument(d);
      expect(warnings.filter((w) => w.type === "heading-skip")).toHaveLength(0);
    });

    it("detects H1 -> H3 skip", () => {
      const d = doc([heading(1, "Title"), heading(3, "Skipped")]);
      const warnings = checkDocument(d);
      expect(warnings).toContainEqual(
        expect.objectContaining({
          type: "heading-skip",
          message: "Heading level skipped: H3 after H1",
        }),
      );
    });

    it("detects H2 -> H4 skip", () => {
      const d = doc([
        heading(1, "Title"),
        heading(2, "Section"),
        heading(4, "Skipped"),
      ]);
      const warnings = checkDocument(d);
      expect(warnings).toContainEqual(
        expect.objectContaining({
          type: "heading-skip",
          message: "Heading level skipped: H4 after H2",
        }),
      );
    });

    it("allows H1 as the first heading (no prior heading required)", () => {
      const d = doc([p("Preamble"), heading(1, "Title")]);
      expect(
        checkDocument(d).filter((w) => w.type === "heading-skip"),
      ).toHaveLength(0);
    });

    it("detects skip when first heading is H3 (no H1 or H2 above)", () => {
      const d = doc([heading(1, "Title"), heading(3, "Oops")]);
      const warnings = checkDocument(d);
      expect(warnings.some((w) => w.type === "heading-skip")).toBe(true);
    });

    it("allows going back to a lower level after a deeper level", () => {
      const d = doc([
        heading(1, "Title"),
        heading(2, "Section A"),
        heading(3, "Sub A"),
        heading(2, "Section B"),
      ]);
      expect(
        checkDocument(d).filter((w) => w.type === "heading-skip"),
      ).toHaveLength(0);
    });
  });

  describe("empty headings", () => {
    it("detects an empty heading", () => {
      const d = doc([emptyHeading(1)]);
      expect(checkDocument(d)).toContainEqual(
        expect.objectContaining({
          type: "empty-heading",
          message: "Empty heading",
        }),
      );
    });

    it("detects a heading with only whitespace", () => {
      const d = doc([
        {
          type: "heading",
          attrs: { level: 2 },
          content: [t("   ")],
        },
      ]);
      const warnings = checkDocument(d);
      expect(warnings.some((w) => w.type === "empty-heading")).toBe(true);
    });
  });

  describe("missing alt text", () => {
    it("detects image with empty alt", () => {
      const d = doc([p(imageNoAlt("test.png") as unknown as string)]);
      const warnings = checkDocument(d);
      expect(warnings).toContainEqual(
        expect.objectContaining({
          type: "missing-alt",
          message: "Image has no alt text",
        }),
      );
    });

    it("passes image with alt text", () => {
      const d = doc([
        p(
          image(
            "test.png",
            "A chart showing intake volume",
          ) as unknown as string,
        ),
      ]);
      const warnings = checkDocument(d);
      expect(warnings.filter((w) => w.type === "missing-alt")).toHaveLength(0);
    });

    it("detects figure_image with empty alt", () => {
      const d = doc([figureNoAlt("chart.png", "Caption text")]);
      const warnings = checkDocument(d);
      expect(warnings).toContainEqual(
        expect.objectContaining({
          type: "missing-alt",
          message: "Image has no alt text",
        }),
      );
    });

    it("passes figure_image with alt text", () => {
      const d = doc([figure("chart.png", "Intake volume chart", "Figure 1")]);
      const warnings = checkDocument(d);
      expect(warnings.filter((w) => w.type === "missing-alt")).toHaveLength(0);
    });
  });

  describe("generic link text", () => {
    it('detects "click here" as generic', () => {
      const d = doc([p(linkedText("click here", "https://example.com"))]);
      const warnings = checkDocument(d);
      expect(warnings).toContainEqual(
        expect.objectContaining({
          type: "generic-link-text",
          message: 'Generic link text: "click here"',
        }),
      );
    });

    it("passes descriptive link text", () => {
      const d = doc([
        p(linkedText("download the intake form", "https://example.com/form")),
      ]);
      const warnings = checkDocument(d);
      expect(
        warnings.filter((w) => w.type === "generic-link-text"),
      ).toHaveLength(0);
    });
  });

  describe("well-structured document", () => {
    it("returns empty array for a fully valid document", () => {
      const d = doc([
        heading(1, "Intake Protocol"),
        p("When a client calls in, follow these steps."),
        heading(2, "Step 1: Greeting"),
        p(
          "Greet the caller. See ",
          linkedText("the full greeting script", "https://example.com/greet"),
          ".",
        ),
        heading(2, "Step 2: Verification"),
        p(
          image(
            "flowchart.png",
            "Flowchart showing verification steps",
          ) as unknown as string,
        ),
        heading(3, "Edge Cases"),
        p("If the caller is in immediate danger, skip to crisis protocol."),
      ]);

      expect(checkDocument(d)).toEqual([]);
    });
  });
});
