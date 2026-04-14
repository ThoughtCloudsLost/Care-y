// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderArticleBody, sanitizeArticleHtml } from "./render-article.js";

/** Helper: encode a string as UTF-8 bytes (simulates decrypted article body). */
function toBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

describe("renderArticleBody", () => {
  it("converts plain text with double newlines to <p> tags", () => {
    const html = renderArticleBody(
      toBytes("First paragraph.\n\nSecond paragraph."),
    );
    expect(html).toBe("<p>First paragraph.</p><p>Second paragraph.</p>");
  });

  it("escapes HTML special characters in plain text input", () => {
    const html = renderArticleBody(
      toBytes('Alert: <script>alert("xss")</script>'),
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("collapses multiple blank lines into paragraph breaks", () => {
    const html = renderArticleBody(toBytes("A\n\n\n\nB"));
    expect(html).toBe("<p>A</p><p>B</p>");
  });

  it("skips blank-only paragraphs", () => {
    const html = renderArticleBody(toBytes("A\n\n   \n\nB"));
    expect(html).toBe("<p>A</p><p>B</p>");
  });

  it("handles empty input", () => {
    const html = renderArticleBody(new Uint8Array(0));
    expect(html).toBe("");
  });
});

describe("sanitizeArticleHtml", () => {
  it("strips <script> tags", () => {
    const html = sanitizeArticleHtml(
      '<p>Hello</p><script>alert("xss")</script>',
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("<p>Hello</p>");
  });

  it("strips event handler attributes", () => {
    const html = sanitizeArticleHtml('<img src="x.png" onerror="alert(1)">');
    expect(html).not.toContain("onerror");
    expect(html).toContain("<img");
  });

  it("preserves allowed tags", () => {
    const input =
      '<p>Text</p><strong>bold</strong><a href="https://example.com">link</a><img src="photo.jpg" alt="photo">';
    const html = sanitizeArticleHtml(input);
    expect(html).toContain("<p>");
    expect(html).toContain("<strong>");
    expect(html).toContain("<a ");
    expect(html).toContain("<img");
  });

  it("forces target=_blank and rel=noopener noreferrer on links", () => {
    const html = sanitizeArticleHtml('<a href="https://example.com">link</a>');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("strips data-* attributes", () => {
    const html = sanitizeArticleHtml(
      '<p data-user-id="123" data-role="admin">text</p>',
    );
    expect(html).not.toContain("data-user-id");
    expect(html).not.toContain("data-role");
    expect(html).toContain("<p>text</p>");
  });

  it("strips <style> tags and style attributes", () => {
    const html = sanitizeArticleHtml(
      '<style>body{color:red}</style><p style="color:red">text</p>',
    );
    expect(html).not.toContain("<style>");
    expect(html).not.toContain("style=");
    expect(html).toContain("<p>text</p>");
  });

  it("strips <form> and <input> elements", () => {
    const html = sanitizeArticleHtml(
      '<form action="/steal"><input type="hidden" name="token" value="abc"></form>',
    );
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<input");
  });

  it("strips javascript: protocol from href", () => {
    const html = sanitizeArticleHtml('<a href="javascript:alert(1)">click</a>');
    expect(html).not.toContain("javascript:");
  });
});
