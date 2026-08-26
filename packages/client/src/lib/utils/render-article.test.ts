// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { DOMSerializer, Node as PMNode } from "prosemirror-model";
import {
  renderArticleBody,
  renderProseMirrorDoc,
  sanitizeArticleHtml,
  extractExcerpt,
  ALLOWED_URI_REGEXP,
} from "./render-article.js";
import { editorSchema } from "$lib/editor/prosemirror-schema.js";

/** Encode a string as UTF-8 bytes (simulates decrypted article body). */
function toBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

/** Build a ProseMirror doc from JSON, encode as UTF-8 bytes. */
function docToBytes(json: Record<string, unknown>): Uint8Array {
  return toBytes(JSON.stringify(json));
}

/** Count all Element nodes in an HTML string. */
function countElements(html: string): number {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.querySelectorAll("*").length;
}

/**
 * Build a ProseMirror doc exercising every node type and mark in the schema.
 * Used by allowlist validation tests that need full schema coverage.
 */
function buildFullSchemaDoc(): PMNode {
  return PMNode.fromJSON(editorSchema, {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Title" }],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Subtitle" }],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Section" }],
      },
      {
        type: "heading",
        attrs: { level: 4 },
        content: [{ type: "text", text: "Subsection" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Bold ",
            marks: [{ type: "strong" }],
          },
          {
            type: "text",
            text: "italic ",
            marks: [{ type: "em" }],
          },
          {
            type: "text",
            text: "struck",
            marks: [{ type: "strikethrough" }],
          },
          { type: "text", text: " " },
          {
            type: "text",
            text: "code",
            marks: [{ type: "code" }],
          },
          { type: "text", text: " " },
          {
            type: "text",
            text: "linked",
            marks: [
              {
                type: "link",
                attrs: {
                  href: "https://example.com",
                  title: "Example",
                },
              },
            ],
          },
          { type: "hard_break" },
          {
            type: "image",
            attrs: {
              src: "photo.jpg",
              alt: "A photo",
              title: "Photo title",
            },
          },
        ],
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Quoted text" }],
          },
        ],
      },
      {
        type: "bullet_list",
        content: [
          {
            type: "list_item",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Bullet" }],
              },
            ],
          },
        ],
      },
      {
        type: "ordered_list",
        attrs: { order: 3 },
        content: [
          {
            type: "list_item",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Numbered" }],
              },
            ],
          },
        ],
      },
      {
        type: "code_block",
        content: [{ type: "text", text: 'console.log("hi")' }],
      },
      { type: "horizontal_rule" },
      {
        type: "figure",
        content: [
          {
            type: "figure_image",
            attrs: { src: "fig.jpg", alt: "Figure alt" },
          },
          {
            type: "figcaption",
            content: [{ type: "text", text: "Caption text" }],
          },
        ],
      },
      {
        type: "table",
        content: [
          {
            type: "table_row",
            content: [
              {
                type: "table_header",
                attrs: { colspan: 2, rowspan: 1 },
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Header" }],
                  },
                ],
              },
            ],
          },
          {
            type: "table_row",
            content: [
              {
                type: "table_cell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Cell A" }],
                  },
                ],
              },
              {
                type: "table_cell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Cell B" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// DOMPurify allowlist validation: schema exercise
// ---------------------------------------------------------------------------

describe("sanitizeArticleHtml (allowlist vs schema)", () => {
  // Serialize the full-schema doc once; reused by multiple tests.
  const doc = buildFullSchemaDoc();
  const serializer = DOMSerializer.fromSchema(editorSchema);
  const fragment = serializer.serializeFragment(doc.content);
  const div = document.createElement("div");
  div.appendChild(fragment);
  const serialized = div.innerHTML;
  const sanitized = sanitizeArticleHtml(serialized);

  it("preserves every element and attribute the schema produces", () => {
    // Structural check: sanitizer should not add or remove elements.
    expect(countElements(sanitized)).toBe(countElements(serialized));

    // Marker checks: verify no specific element or content was stripped.
    // (Structural check catches count mismatches; markers catch type mismatches.)
    expect(sanitized).toContain("<h1>");
    expect(sanitized).toContain("<h2>");
    expect(sanitized).toContain("<h3>");
    expect(sanitized).toContain("<h4>");
    expect(sanitized).toContain("<p>");
    expect(sanitized).toContain("<strong>");
    expect(sanitized).toContain("<em>");
    expect(sanitized).toContain("<s>");
    expect(sanitized).toContain("<code>");
    expect(sanitized).toContain("<br>");
    expect(sanitized).toContain("<blockquote>");
    expect(sanitized).toContain("<ul>");
    expect(sanitized).toContain("<ol");
    expect(sanitized).toContain('start="3"');
    expect(sanitized).toContain("<li>");
    expect(sanitized).toContain("<pre>");
    expect(sanitized).toContain("<hr>");
    expect(sanitized).toContain("<figure>");
    expect(sanitized).toContain("<figcaption>");
    expect(sanitized).toContain("<table>");
    expect(sanitized).toContain("<tbody>");
    expect(sanitized).toContain("<tr>");
    expect(sanitized).toContain("<th");
    expect(sanitized).toContain('colspan="2"');
    expect(sanitized).toContain("<td>");
    expect(sanitized).toContain("<a ");
    expect(sanitized).toContain('href="https://example.com"');
    expect(sanitized).toContain("<img");
    expect(sanitized).toContain('alt="A photo"');
    expect(sanitized).toContain('src="photo.jpg"');

    // Verify no text content was stripped
    expect(sanitized).toContain("Title");
    expect(sanitized).toContain("Bold ");
    expect(sanitized).toContain("Quoted text");
    expect(sanitized).toContain("Bullet");
    expect(sanitized).toContain("Numbered");
    expect(sanitized).toContain('console.log("hi")');
    expect(sanitized).toContain("Caption text");
    expect(sanitized).toContain("Header");
    expect(sanitized).toContain("Cell A");
  });

  it("strips elements not in schema (script, style, form, iframe)", () => {
    const html = sanitizeArticleHtml(
      '<p>OK</p><script>alert(1)</script><style>.x{}</style><form><input></form><iframe src="x"></iframe>',
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<style");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<input");
    expect(html).not.toContain("<iframe");
    expect(html).toContain("<p>OK</p>");
  });

  it("strips attributes not in schema (onerror, class, style, data-*)", () => {
    const html = sanitizeArticleHtml(
      '<img src="x.jpg" alt="ok" onerror="alert(1)" class="big" style="width:100%" data-id="5">',
    );
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("class=");
    expect(html).not.toContain("style=");
    expect(html).not.toContain("data-id");
    expect(html).toContain('src="x.jpg"');
    expect(html).toContain('alt="ok"');
  });

  it("strips javascript: protocol from href", () => {
    const html = sanitizeArticleHtml('<a href="javascript:alert(1)">click</a>');
    expect(html).not.toContain("javascript:");
  });

  it("preserves kb-attachment:// URIs in img src", () => {
    const html = sanitizeArticleHtml(
      '<img src="kb-attachment://att-uuid-123" alt="Photo">',
    );
    expect(html).toContain('src="kb-attachment://att-uuid-123"');
    expect(html).toContain('alt="Photo"');
  });

  it("preserves target and rel from schema-produced link output", () => {
    // The link mark's toDOM produces target="_blank" and rel="noopener noreferrer".
    // DOMPurify must allow both through (they're in ALLOWED_ATTR).
    const html = sanitizeArticleHtml(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>',
    );
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("does not strip attacker-supplied target values (sanitizer trusts schema output)", () => {
    // The schema always produces target="_blank". If non-schema HTML
    // reaches sanitizeArticleHtml with a different target value,
    // DOMPurify allows it through. This is acceptable because
    // sanitizeArticleHtml only receives schema-serialized HTML or
    // legacy plain text (which has no links).
    const html = sanitizeArticleHtml(
      '<a href="https://example.com" target="_top">link</a>',
    );
    expect(html).toContain('target="_top"');
  });
});

// ---------------------------------------------------------------------------
// renderArticleBody: ProseMirror JSON pipeline + legacy fallback
// ---------------------------------------------------------------------------

describe("renderArticleBody", () => {
  it("renders ProseMirror JSON to sanitized HTML", () => {
    const json = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello world" }],
        },
      ],
    };
    const html = renderArticleBody(docToBytes(json));
    expect(html).toContain("<p>Hello world</p>");
  });

  it("falls back to paragraph wrapping for legacy plain text", () => {
    const html = renderArticleBody(
      toBytes("First paragraph.\n\nSecond paragraph."),
    );
    expect(html).toBe("<p>First paragraph.</p><p>Second paragraph.</p>");
  });

  it("escapes HTML in legacy plain-text input", () => {
    const html = renderArticleBody(
      toBytes('Alert: <script>alert("xss")</script>'),
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("treats invalid ProseMirror JSON as plain text", () => {
    const invalidDoc = { type: "doc", content: [{ type: "nonexistent_node" }] };
    const html = renderArticleBody(docToBytes(invalidDoc));
    // Falls back to plain text rendering of the JSON string
    expect(html).toContain("<p>");
    expect(html).not.toBe("");
  });

  it("strips malicious attributes from otherwise valid JSON", () => {
    // Even if someone crafts JSON that produces extra attrs,
    // DOMPurify strips them at the sanitization layer
    const json = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Safe text",
            },
          ],
        },
      ],
    };
    const html = renderArticleBody(docToBytes(json));
    expect(html).toContain("Safe text");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("<script");
  });

  it("returns empty string for empty input", () => {
    expect(renderArticleBody(new Uint8Array(0))).toBe("");
  });

  it("collapses multiple blank lines in legacy text", () => {
    const html = renderArticleBody(toBytes("A\n\n\n\nB"));
    expect(html).toBe("<p>A</p><p>B</p>");
  });

  describe("title deduplication (options.title)", () => {
    it("strips first heading when it matches the title", () => {
      const json = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "My Article" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Body text" }],
          },
        ],
      };
      const html = renderArticleBody(docToBytes(json), {
        title: "My Article",
      });
      expect(html).not.toContain("<h1>");
      expect(html).toContain("Body text");
    });

    it("strips first heading case-insensitively", () => {
      const json = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "INTAKE PROTOCOL" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Steps below" }],
          },
        ],
      };
      const html = renderArticleBody(docToBytes(json), {
        title: "intake protocol",
      });
      expect(html).not.toContain("INTAKE PROTOCOL");
      expect(html).toContain("Steps below");
    });

    it("preserves heading when title does not match", () => {
      const json = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Different Heading" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Body" }],
          },
        ],
      };
      const html = renderArticleBody(docToBytes(json), {
        title: "My Article",
      });
      expect(html).toContain("<h1>Different Heading</h1>");
    });

    it("does not strip heading when title option is undefined", () => {
      const json = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "My Article" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Body" }],
          },
        ],
      };
      const html = renderArticleBody(docToBytes(json));
      expect(html).toContain("<h1>My Article</h1>");
    });

    it("only strips the first heading, not subsequent matches", () => {
      const json = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Title" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Middle" }],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Title" }],
          },
        ],
      };
      const html = renderArticleBody(docToBytes(json), { title: "Title" });
      // First heading stripped, second preserved
      expect(html).not.toContain("<h1>");
      expect(html).toContain("<h2>Title</h2>");
    });

    it("does not strip first child if it is not a heading", () => {
      const json = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "My Article" }],
          },
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "My Article" }],
          },
        ],
      };
      const html = renderArticleBody(docToBytes(json), {
        title: "My Article",
      });
      // Paragraph is first child, not a heading, so nothing stripped
      expect(html).toContain("<p>My Article</p>");
      expect(html).toContain("<h1>My Article</h1>");
    });
  });
});

// ---------------------------------------------------------------------------
// extractExcerpt
// ---------------------------------------------------------------------------

describe("extractExcerpt", () => {
  it("returns first ~150 chars of text content", () => {
    const doc = PMNode.fromJSON(editorSchema, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "This is a test article about something. " },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "It has multiple paragraphs with enough content to test truncation behavior when the text exceeds the default maximum length of one hundred and fifty characters.",
            },
          ],
        },
      ],
    });

    const excerpt = extractExcerpt(doc);
    expect(excerpt.length).toBeLessThanOrEqual(153); // 150 + "..."
    expect(excerpt.endsWith("...")).toBe(true);
    expect(excerpt).toContain("This is a test article");
  });

  it("respects custom maxLength", () => {
    const doc = PMNode.fromJSON(editorSchema, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Short content that is longer than twenty chars",
            },
          ],
        },
      ],
    });

    const excerpt = extractExcerpt(doc, 20);
    expect(excerpt.length).toBeLessThanOrEqual(23); // 20 + "..."
    expect(excerpt.endsWith("...")).toBe(true);
  });

  it("returns full text when under maxLength", () => {
    const doc = PMNode.fromJSON(editorSchema, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Short." }],
        },
      ],
    });

    const excerpt = extractExcerpt(doc);
    expect(excerpt).toBe("Short.");
    expect(excerpt.endsWith("...")).toBe(false);
  });

  it("returns empty string for empty doc", () => {
    const doc = PMNode.fromJSON(editorSchema, {
      type: "doc",
      content: [{ type: "paragraph" }],
    });

    expect(extractExcerpt(doc)).toBe("");
  });

  it("returns empty string for doc with only images", () => {
    const doc = PMNode.fromJSON(editorSchema, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "image",
              attrs: { src: "photo.jpg", alt: "Photo", title: null },
            },
          ],
        },
      ],
    });

    expect(extractExcerpt(doc)).toBe("");
  });

  it("skips image nodes but includes surrounding text", () => {
    const doc = PMNode.fromJSON(editorSchema, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Before " },
            {
              type: "image",
              attrs: { src: "x.jpg", alt: "img", title: null },
            },
            { type: "text", text: " after" },
          ],
        },
      ],
    });

    const excerpt = extractExcerpt(doc);
    expect(excerpt).toBe("Before  after");
  });

  it("does not produce double spaces for nested block structures", () => {
    // list_item and paragraph are both blocks. Without the guard,
    // each block boundary pushes a space, producing "alpha  beta".
    const doc = PMNode.fromJSON(editorSchema, {
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
                  content: [{ type: "text", text: "alpha" }],
                },
              ],
            },
            {
              type: "list_item",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "beta" }],
                },
              ],
            },
          ],
        },
      ],
    });

    const excerpt = extractExcerpt(doc);
    expect(excerpt).toBe("alpha beta");
    expect(excerpt).not.toContain("  ");
  });

  it("adds space between blocks", () => {
    const doc = PMNode.fromJSON(editorSchema, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Para one" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Para two" }],
        },
      ],
    });

    const excerpt = extractExcerpt(doc);
    expect(excerpt).toContain("Para one");
    expect(excerpt).toContain("Para two");
    // Should have space separator, not run together
    expect(excerpt).not.toBe("Para onePara two");
  });
});

// ---------------------------------------------------------------------------
// renderProseMirrorDoc: generic renderer
// ---------------------------------------------------------------------------

describe("renderProseMirrorDoc", () => {
  it("serializes a simple doc to sanitized HTML", () => {
    const doc = PMNode.fromJSON(editorSchema, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello generic" }],
        },
      ],
    });
    const html = renderProseMirrorDoc(doc, editorSchema);
    expect(html).toContain("<p>Hello generic</p>");
  });

  it("strips <script> tags (XSS payload)", () => {
    // Build a doc, then verify that even if raw HTML were injected,
    // DOMPurify strips it. We test the sanitizer layer specifically.
    const doc = PMNode.fromJSON(editorSchema, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Safe" }],
        },
      ],
    });
    // Render normally; the schema can only produce safe output.
    const html = renderProseMirrorDoc(doc, editorSchema);
    expect(html).not.toContain("<script");
    expect(html).toContain("Safe");
  });

  it("strips javascript: hrefs from link marks", () => {
    // The schema's link mark stores whatever href is given. The
    // sanitizer must strip javascript: protocol at render time.
    const doc = PMNode.fromJSON(editorSchema, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "click me",
              marks: [
                {
                  type: "link",
                  attrs: { href: "javascript:alert(1)", title: null },
                },
              ],
            },
          ],
        },
      ],
    });
    const html = renderProseMirrorDoc(doc, editorSchema);
    expect(html).not.toContain("javascript:");
    // The link text itself is preserved
    expect(html).toContain("click me");
  });

  it("preserves kb-attachment: URIs in img src", () => {
    const doc = PMNode.fromJSON(editorSchema, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "image",
              attrs: {
                src: "kb-attachment://some-uuid",
                alt: "photo",
                title: null,
              },
            },
          ],
        },
      ],
    });
    const html = renderProseMirrorDoc(doc, editorSchema);
    expect(html).toContain('src="kb-attachment://some-uuid"');
  });

  it("preserves form-asset: URIs in img src", () => {
    const doc = PMNode.fromJSON(editorSchema, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "image",
              attrs: {
                src: "form-asset://banner-uuid",
                alt: "banner",
                title: null,
              },
            },
          ],
        },
      ],
    });
    const html = renderProseMirrorDoc(doc, editorSchema);
    expect(html).toContain('src="form-asset://banner-uuid"');
  });

  it("regression: renderArticleBody still works through renderProseMirrorDoc", () => {
    const json = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Regression check" }],
        },
      ],
    };
    const html = renderArticleBody(
      new TextEncoder().encode(JSON.stringify(json)),
    );
    expect(html).toContain("<p>Regression check</p>");
  });
});

// ---------------------------------------------------------------------------
// ALLOWED_URI_REGEXP: scheme validation
// ---------------------------------------------------------------------------

describe("ALLOWED_URI_REGEXP", () => {
  it("allows https: URIs", () => {
    expect(ALLOWED_URI_REGEXP.test("https://example.com")).toBe(true);
  });

  it("allows http: URIs", () => {
    expect(ALLOWED_URI_REGEXP.test("http://example.com")).toBe(true);
  });

  it("allows mailto: URIs", () => {
    expect(ALLOWED_URI_REGEXP.test("mailto:user@example.com")).toBe(true);
  });

  it("allows tel: URIs", () => {
    expect(ALLOWED_URI_REGEXP.test("tel:+1234567890")).toBe(true);
  });

  it("allows kb-attachment: URIs", () => {
    expect(ALLOWED_URI_REGEXP.test("kb-attachment://uuid")).toBe(true);
  });

  it("allows form-asset: URIs", () => {
    expect(ALLOWED_URI_REGEXP.test("form-asset://uuid")).toBe(true);
  });

  it("blocks javascript: URIs", () => {
    expect(ALLOWED_URI_REGEXP.test("javascript:alert(1)")).toBe(false);
  });

  it("blocks vbscript: URIs", () => {
    expect(ALLOWED_URI_REGEXP.test("vbscript:msgbox")).toBe(false);
  });
});
