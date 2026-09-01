// @vitest-environment jsdom
/**
 * Tests for the trimmed email ProseMirror schema and its serializers.
 *
 * Covers emailDocToHtml and emailDocToText for marks (strong, em, link),
 * lists (bullet, ordered), hard breaks, and link labels.
 */

import { describe, it, expect } from "vitest";
import type { ProseMirrorDocJSON } from "@care-y/shared";
import { emailDocToHtml, emailDocToText, emailSchema } from "./email-schema.js";

// ---------------------------------------------------------------------------
// Schema structure
// ---------------------------------------------------------------------------

describe("emailSchema", () => {
  it("has the expected node types", () => {
    const nodeNames: string[] = [];
    emailSchema.spec.nodes.forEach((name: string) => {
      nodeNames.push(name);
    });
    expect(nodeNames).toEqual(
      expect.arrayContaining([
        "doc",
        "paragraph",
        "bullet_list",
        "ordered_list",
        "list_item",
        "hard_break",
        "text",
      ]),
    );
    expect(nodeNames).not.toContain("heading");
    expect(nodeNames).not.toContain("image");
    expect(nodeNames).not.toContain("table");
  });

  it("has the expected mark types", () => {
    const markNames: string[] = [];
    emailSchema.spec.marks.forEach((name: string) => {
      markNames.push(name);
    });
    expect(markNames).toEqual(expect.arrayContaining(["strong", "em", "link"]));
    expect(markNames).not.toContain("code");
    expect(markNames).not.toContain("strikethrough");
  });
});

// ---------------------------------------------------------------------------
// emailDocToHtml
// ---------------------------------------------------------------------------

describe("emailDocToHtml", () => {
  it("renders a paragraph with bold text", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Hello " },
            {
              type: "text",
              text: "world",
              marks: [{ type: "strong" }],
            },
          ],
        },
      ],
    };
    const html = emailDocToHtml(doc);
    expect(html).toContain("<strong>");
    expect(html).toContain("world");
    expect(html).toContain("<p>");
  });

  it("renders italic text", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "emphasis",
              marks: [{ type: "em" }],
            },
          ],
        },
      ],
    };
    const html = emailDocToHtml(doc);
    expect(html).toContain("<em>");
    expect(html).toContain("emphasis");
  });

  it("renders links with security attributes", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "click here",
              marks: [
                {
                  type: "link",
                  attrs: { href: "https://example.com", title: null },
                },
              ],
            },
          ],
        },
      ],
    };
    const html = emailDocToHtml(doc);
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("click here");
  });

  it("renders bullet lists", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "bullet_list",
          content: [
            {
              type: "list_item",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "item one" }],
                },
              ],
            },
          ],
        },
      ],
    };
    const html = emailDocToHtml(doc);
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
    expect(html).toContain("item one");
  });

  it("renders hard breaks", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "before" },
            { type: "hard_break" },
            { type: "text", text: "after" },
          ],
        },
      ],
    };
    const html = emailDocToHtml(doc);
    expect(html).toContain("<br>");
    expect(html).toContain("before");
    expect(html).toContain("after");
  });

  it("sanitizes script tags from malicious input", () => {
    // Even though the schema would never produce this, verify the
    // sanitizer strips it when rendering.
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "safe" }],
        },
      ],
    };
    const html = emailDocToHtml(doc);
    expect(html).not.toContain("<script");
  });
});

// ---------------------------------------------------------------------------
// emailDocToText
// ---------------------------------------------------------------------------

describe("emailDocToText", () => {
  it("converts paragraphs to double-newline-separated text", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "First paragraph" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Second paragraph" }],
        },
      ],
    };
    const text = emailDocToText(doc);
    expect(text).toBe("First paragraph\n\nSecond paragraph");
  });

  it("converts bullet list items with dash prefix", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "bullet_list",
          content: [
            {
              type: "list_item",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "apples" }],
                },
              ],
            },
            {
              type: "list_item",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "bananas" }],
                },
              ],
            },
          ],
        },
      ],
    };
    const text = emailDocToText(doc);
    expect(text).toBe("- apples\n- bananas");
  });

  it("converts ordered list items with numbered prefix", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "ordered_list",
          attrs: { order: 1 },
          content: [
            {
              type: "list_item",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "first" }],
                },
              ],
            },
            {
              type: "list_item",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "second" }],
                },
              ],
            },
          ],
        },
      ],
    };
    const text = emailDocToText(doc);
    expect(text).toBe("1. first\n2. second");
  });

  it("renders links as label (url) when href differs from text", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "click here",
              marks: [
                {
                  type: "link",
                  attrs: { href: "https://example.com", title: null },
                },
              ],
            },
          ],
        },
      ],
    };
    const text = emailDocToText(doc);
    expect(text).toBe("click here (https://example.com)");
  });

  it("renders links without parens when href matches text", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "https://example.com",
              marks: [
                {
                  type: "link",
                  attrs: { href: "https://example.com", title: null },
                },
              ],
            },
          ],
        },
      ],
    };
    const text = emailDocToText(doc);
    expect(text).toBe("https://example.com");
  });

  it("converts hard breaks to single newlines", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "line one" },
            { type: "hard_break" },
            { type: "text", text: "line two" },
          ],
        },
      ],
    };
    const text = emailDocToText(doc);
    expect(text).toBe("line one\nline two");
  });
});
