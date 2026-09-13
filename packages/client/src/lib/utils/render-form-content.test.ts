// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  renderFormRichText,
  rewriteFormAssetUrls,
} from "./render-form-content.js";
import type { ProseMirrorDocJSON } from "@care-y/shared";

// ---------------------------------------------------------------------------
// rewriteFormAssetUrls
// ---------------------------------------------------------------------------

describe("rewriteFormAssetUrls", () => {
  const ORG = "safe-harbor";

  it("rewrites a single form-asset:// src to the public serving URL", () => {
    const html = '<p>Hello</p><img src="form-asset://abc-123" alt="photo">';
    const result = rewriteFormAssetUrls(html, ORG);
    expect(result).toBe(
      '<p>Hello</p><img src="/api/forms/safe-harbor/abc-123" alt="photo">',
    );
  });

  it("rewrites multiple form-asset:// images", () => {
    const html =
      '<img src="form-asset://id-1" alt="a">' +
      "<p>text</p>" +
      '<img src="form-asset://id-2" alt="b">';
    const result = rewriteFormAssetUrls(html, ORG);
    expect(result).toContain('src="/api/forms/safe-harbor/id-1"');
    expect(result).toContain('src="/api/forms/safe-harbor/id-2"');
  });

  it("leaves https:// src attributes untouched", () => {
    const html = '<img src="https://example.com/photo.jpg" alt="ext">';
    const result = rewriteFormAssetUrls(html, ORG);
    expect(result).toBe(html);
  });

  it("leaves data: src attributes untouched", () => {
    const html = '<img src="data:image/png;base64,abc" alt="">';
    const result = rewriteFormAssetUrls(html, ORG);
    expect(result).toBe(html);
  });

  it("leaves blob: src attributes untouched", () => {
    const html = '<img src="blob:http://localhost/uuid" alt="">';
    const result = rewriteFormAssetUrls(html, ORG);
    expect(result).toBe(html);
  });

  it("returns empty string unchanged", () => {
    expect(rewriteFormAssetUrls("", ORG)).toBe("");
  });

  it("returns HTML without form-asset unchanged", () => {
    const html = "<p>No images here</p>";
    expect(rewriteFormAssetUrls(html, ORG)).toBe(html);
  });

  it("handles form-asset:// in non-img-src context without rewriting", () => {
    // The text "form-asset://" inside a paragraph is not an img src
    const html = "<p>Reference: form-asset://some-id</p>";
    const result = rewriteFormAssetUrls(html, ORG);
    expect(result).toBe(html);
  });

  it("does not rewrite blob ids outside the UUID charset", () => {
    const html = '<img src="form-asset://../../etc/passwd" alt="">';
    const result = rewriteFormAssetUrls(html, ORG);
    expect(result).toBe(html);
  });

  it("preserves other img attributes alongside the rewritten src", () => {
    const html = '<img alt="banner" src="form-asset://x" title="Banner image">';
    const result = rewriteFormAssetUrls(html, ORG);
    expect(result).toContain('src="/api/forms/safe-harbor/x"');
    expect(result).toContain('alt="banner"');
    expect(result).toContain('title="Banner image"');
  });
});

// ---------------------------------------------------------------------------
// renderFormRichText - legacy plain strings
// ---------------------------------------------------------------------------

describe("renderFormRichText with legacy plain strings", () => {
  it("wraps a plain string in a paragraph", () => {
    const result = renderFormRichText("Hello world");
    expect(result).toContain("<p>");
    expect(result).toContain("Hello world");
  });

  it("escapes HTML special characters in plain strings", () => {
    const result = renderFormRichText('<script>alert("xss")</script>');
    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;");
  });

  it("splits double newlines into separate paragraphs", () => {
    const result = renderFormRichText("Para one\n\nPara two");
    // Should produce two <p> tags
    const matches = result.match(/<p>/g);
    expect(matches).toHaveLength(2);
  });

  it("returns empty string for undefined", () => {
    expect(renderFormRichText(undefined)).toBe("");
  });

  it("returns empty string for whitespace-only string", () => {
    expect(renderFormRichText("   ")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// renderFormRichText - ProseMirror doc JSON
// ---------------------------------------------------------------------------

describe("renderFormRichText with ProseMirror doc JSON", () => {
  it("renders a simple paragraph doc", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Rich content" }],
        },
      ],
    };
    const result = renderFormRichText(doc);
    expect(result).toContain("<p>");
    expect(result).toContain("Rich content");
  });

  it("renders bold and italic marks", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "bold",
              marks: [{ type: "strong" }],
            },
            { type: "text", text: " and " },
            {
              type: "text",
              text: "italic",
              marks: [{ type: "em" }],
            },
          ],
        },
      ],
    };
    const result = renderFormRichText(doc);
    expect(result).toContain("<strong>bold</strong>");
    expect(result).toContain("<em>italic</em>");
  });

  it("renders a doc with an image using form-asset scheme", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Before image" }],
        },
        {
          type: "image",
          attrs: {
            src: "form-asset://img-uuid",
            alt: "A photo",
            title: null,
          },
        },
      ],
    };
    const result = renderFormRichText(doc);
    expect(result).toContain("form-asset://img-uuid");
    expect(result).toContain("Before image");
  });

  it("returns empty string for invalid doc JSON", () => {
    const invalid = { type: "doc", content: [{ type: "nonexistent_node" }] };
    const result = renderFormRichText(invalid as unknown as ProseMirrorDocJSON);
    expect(result).toBe("");
  });
});
