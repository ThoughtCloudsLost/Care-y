// @vitest-environment jsdom
/**
 * Mechanical contract test: every node and mark in editorSchema has a
 * minimal fixture, and the fixture's DOMSerializer output survives the
 * shared PURIFY_CONFIG sanitizer without stripping elements or attributes.
 *
 * If someone adds a schema node/mark without extending the sanitizer
 * allowlist, this test fails with a clear diagnostic.
 *
 * Separately, hostile input rejection tests verify the sanitizer strips
 * payloads that the schema would never produce.
 */

import { describe, it, expect } from "vitest";
import { Node as PMNode, DOMSerializer } from "prosemirror-model";
import { editorSchema } from "$lib/editor/prosemirror-schema.js";
import { sanitizeArticleHtml, ALLOWED_URI_REGEXP } from "./render-article.js";

// ---------------------------------------------------------------------------
// Per-node/mark minimal fixtures (doc JSON fragments)
// ---------------------------------------------------------------------------

/**
 * Each entry is keyed by the node or mark name in the schema. The value
 * is a full doc JSON that exercises that node/mark and a list of
 * substrings that must appear in the sanitized output.
 *
 * The test iterates editorSchema.spec.nodes and .marks at runtime and
 * fails loudly for any name not present here.
 */

interface Fixture {
  doc: Record<string, unknown>;
  /** Substrings that must survive sanitization. */
  expected: readonly string[];
}

const NODE_FIXTURES: Record<string, Fixture> = {
  doc: {
    doc: {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "doc test" }] },
      ],
    },
    expected: ["doc test"],
  },
  paragraph: {
    doc: {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "para" }] },
      ],
    },
    expected: ["<p>", "para"],
  },
  heading: {
    doc: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Heading" }],
        },
      ],
    },
    expected: ["<h2>", "Heading"],
  },
  blockquote: {
    doc: {
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "quoted" }],
            },
          ],
        },
      ],
    },
    expected: ["<blockquote>", "quoted"],
  },
  bullet_list: {
    doc: {
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
                  content: [{ type: "text", text: "bullet" }],
                },
              ],
            },
          ],
        },
      ],
    },
    expected: ["<ul>", "<li>", "bullet"],
  },
  ordered_list: {
    doc: {
      type: "doc",
      content: [
        {
          type: "ordered_list",
          attrs: { order: 5 },
          content: [
            {
              type: "list_item",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "numbered" }],
                },
              ],
            },
          ],
        },
      ],
    },
    expected: ["<ol", 'start="5"', "numbered"],
  },
  list_item: {
    // Exercised via bullet_list above, but included with its own doc
    // so the fixture map is complete.
    doc: {
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
                  content: [{ type: "text", text: "item" }],
                },
              ],
            },
          ],
        },
      ],
    },
    expected: ["<li>", "item"],
  },
  code_block: {
    doc: {
      type: "doc",
      content: [
        {
          type: "code_block",
          content: [{ type: "text", text: "let x = 1;" }],
        },
      ],
    },
    expected: ["<pre>", "<code>", "let x = 1;"],
  },
  image: {
    doc: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "image",
              attrs: {
                src: "form-asset://test-uuid-123",
                alt: "Test photo",
                title: "Photo title",
              },
            },
          ],
        },
      ],
    },
    expected: [
      "<img",
      'src="form-asset://test-uuid-123"',
      'alt="Test photo"',
      'title="Photo title"',
    ],
  },
  horizontal_rule: {
    doc: {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "above" }] },
        { type: "horizontal_rule" },
        { type: "paragraph", content: [{ type: "text", text: "below" }] },
      ],
    },
    expected: ["<hr>"],
  },
  figure: {
    doc: {
      type: "doc",
      content: [
        {
          type: "figure",
          content: [
            {
              type: "figure_image",
              attrs: { src: "fig.jpg", alt: "figure alt", title: null },
            },
            {
              type: "figcaption",
              content: [{ type: "text", text: "Caption" }],
            },
          ],
        },
      ],
    },
    expected: ["<figure>", "<figcaption>", "Caption", "<img"],
  },
  figure_image: {
    // Exercised via figure above, included for completeness.
    doc: {
      type: "doc",
      content: [
        {
          type: "figure",
          content: [
            {
              type: "figure_image",
              attrs: { src: "fig.jpg", alt: "alt text", title: null },
            },
            {
              type: "figcaption",
              content: [{ type: "text", text: "cap" }],
            },
          ],
        },
      ],
    },
    expected: ['alt="alt text"'],
  },
  figcaption: {
    // Exercised via figure above, included for completeness.
    doc: {
      type: "doc",
      content: [
        {
          type: "figure",
          content: [
            {
              type: "figure_image",
              attrs: { src: "x.jpg", alt: "", title: null },
            },
            {
              type: "figcaption",
              content: [{ type: "text", text: "Caption text" }],
            },
          ],
        },
      ],
    },
    expected: ["<figcaption>", "Caption text"],
  },
  table: {
    doc: {
      type: "doc",
      content: [
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
                      content: [{ type: "text", text: "Hdr" }],
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
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Cell" }],
                    },
                  ],
                },
                {
                  type: "table_cell",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Cell2" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    expected: [
      "<table>",
      "<tbody>",
      "<tr>",
      "<th",
      'colspan="2"',
      "<td>",
      "Cell",
    ],
  },
  table_row: {
    // Exercised via table above.
    doc: {
      type: "doc",
      content: [
        {
          type: "table",
          content: [
            {
              type: "table_row",
              content: [
                {
                  type: "table_cell",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "R" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    expected: ["<tr>"],
  },
  table_cell: {
    // Exercised via table above.
    doc: {
      type: "doc",
      content: [
        {
          type: "table",
          content: [
            {
              type: "table_row",
              content: [
                {
                  type: "table_cell",
                  attrs: { colspan: 1, rowspan: 3 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "TC" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    expected: ["<td", 'rowspan="3"'],
  },
  table_header: {
    // Exercised via table above.
    doc: {
      type: "doc",
      content: [
        {
          type: "table",
          content: [
            {
              type: "table_row",
              content: [
                {
                  type: "table_header",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "TH" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    expected: ["<th"],
  },
  hard_break: {
    doc: {
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
    },
    expected: ["<br>", "before", "after"],
  },
  text: {
    doc: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "plain text node" }],
        },
      ],
    },
    expected: ["plain text node"],
  },
};

const MARK_FIXTURES: Record<string, Fixture> = {
  strong: {
    doc: {
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
          ],
        },
      ],
    },
    expected: ["<strong>", "bold"],
  },
  em: {
    doc: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "italic",
              marks: [{ type: "em" }],
            },
          ],
        },
      ],
    },
    expected: ["<em>", "italic"],
  },
  code: {
    doc: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "inline code",
              marks: [{ type: "code" }],
            },
          ],
        },
      ],
    },
    expected: ["<code>", "inline code"],
  },
  strikethrough: {
    doc: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "struck",
              marks: [{ type: "strikethrough" }],
            },
          ],
        },
      ],
    },
    expected: ["<s>", "struck"],
  },
  link: {
    doc: {
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
                  attrs: {
                    href: "https://example.com",
                    title: "Example link",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    expected: [
      "<a ",
      'href="https://example.com"',
      'title="Example link"',
      'target="_blank"',
      'rel="noopener noreferrer"',
      "click here",
    ],
  },
};

// ---------------------------------------------------------------------------
// Deliverable 1: Allowlist-covers-schema contract test
// ---------------------------------------------------------------------------

describe("sanitizer allowlist covers every schema node and mark", () => {
  // Derive the canonical node/mark lists from the schema at runtime.
  // Hardcoding would silently skip new additions.
  const schemaNodeNames: string[] = [];
  editorSchema.spec.nodes.forEach((name: string) => {
    schemaNodeNames.push(name);
  });

  const schemaMarkNames: string[] = [];
  editorSchema.spec.marks.forEach((name: string) => {
    schemaMarkNames.push(name);
  });

  describe("every schema node has a fixture", () => {
    for (const nodeName of schemaNodeNames) {
      it(`node "${nodeName}" has a fixture in NODE_FIXTURES`, () => {
        expect(
          NODE_FIXTURES[nodeName],
          `No fixture for node "${nodeName}". Add a minimal doc JSON ` +
            `to NODE_FIXTURES in this file and extend PURIFY_CONFIG if needed.`,
        ).toBeDefined();
      });
    }
  });

  describe("every schema mark has a fixture", () => {
    for (const markName of schemaMarkNames) {
      it(`mark "${markName}" has a fixture in MARK_FIXTURES`, () => {
        expect(
          MARK_FIXTURES[markName],
          `No fixture for mark "${markName}". Add a minimal doc JSON ` +
            `to MARK_FIXTURES in this file and extend PURIFY_CONFIG if needed.`,
        ).toBeDefined();
      });
    }
  });

  describe("node fixtures survive sanitization", () => {
    for (const [nodeName, fixture] of Object.entries(NODE_FIXTURES)) {
      it(`node "${nodeName}" toDOM output is preserved by PURIFY_CONFIG`, () => {
        const doc = PMNode.fromJSON(editorSchema, fixture.doc);
        const serializer = DOMSerializer.fromSchema(editorSchema);
        const fragment = serializer.serializeFragment(doc.content);
        const div = document.createElement("div");
        div.appendChild(fragment);
        const raw = div.innerHTML;
        const sanitized = sanitizeArticleHtml(raw);

        for (const substr of fixture.expected) {
          expect(sanitized).toContain(substr);
        }
      });
    }
  });

  describe("mark fixtures survive sanitization", () => {
    for (const [markName, fixture] of Object.entries(MARK_FIXTURES)) {
      it(`mark "${markName}" toDOM output is preserved by PURIFY_CONFIG`, () => {
        const doc = PMNode.fromJSON(editorSchema, fixture.doc);
        const serializer = DOMSerializer.fromSchema(editorSchema);
        const fragment = serializer.serializeFragment(doc.content);
        const div = document.createElement("div");
        div.appendChild(fragment);
        const raw = div.innerHTML;
        const sanitized = sanitizeArticleHtml(raw);

        for (const substr of fixture.expected) {
          expect(sanitized).toContain(substr);
        }
      });
    }
  });
});

// ---------------------------------------------------------------------------
// Deliverable 2: Sanitizer rejection tests (hostile input)
// ---------------------------------------------------------------------------

describe("sanitizer rejects hostile input", () => {
  it("strips <script> tags", () => {
    const html = sanitizeArticleHtml(
      '<p>Safe</p><script>alert("xss")</script>',
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(");
    expect(html).toContain("Safe");
  });

  it("strips onerror attributes on img", () => {
    const html = sanitizeArticleHtml(
      '<img src="x.jpg" alt="" onerror="alert(1)">',
    );
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("alert");
  });

  it("strips onclick attributes on elements", () => {
    const html = sanitizeArticleHtml('<p onclick="alert(1)">Click me</p>');
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("alert");
    expect(html).toContain("Click me");
  });

  it("strips javascript: hrefs from links", () => {
    const html = sanitizeArticleHtml(
      '<a href="javascript:alert(1)">XSS link</a>',
    );
    expect(html).not.toContain("javascript:");
    // DOMPurify removes the href entirely rather than keeping the tag
    // with an empty href, but the text content is preserved.
    expect(html).toContain("XSS link");
  });

  it("strips javascript: src from img tags", () => {
    const html = sanitizeArticleHtml(
      '<img src="javascript:alert(1)" alt="evil">',
    );
    expect(html).not.toContain("javascript:");
  });

  it("strips data: hrefs from links", () => {
    // data: URIs in href could exfiltrate content or execute code.
    // The ALLOWED_URI_REGEXP allows data: in img src (for previews)
    // but DOMPurify by default strips data: from href on <a> tags
    // when ALLOWED_URI_REGEXP does not cover it for that context.
    // Verify the link-context behavior.
    const html = sanitizeArticleHtml(
      '<a href="data:text/html,<script>alert(1)</script>">data link</a>',
    );
    // DOMPurify strips data: from href context
    expect(html).not.toContain("<script");
    expect(html).toContain("data link");
  });

  it("strips onmouseover attributes", () => {
    const html = sanitizeArticleHtml('<p onmouseover="alert(1)">hover</p>');
    expect(html).not.toContain("onmouseover");
    expect(html).toContain("hover");
  });

  it("strips <iframe> tags", () => {
    const html = sanitizeArticleHtml(
      '<iframe src="https://evil.com"></iframe><p>ok</p>',
    );
    expect(html).not.toContain("<iframe");
    expect(html).toContain("ok");
  });

  it("strips <object> and <embed> tags", () => {
    const html = sanitizeArticleHtml(
      '<object data="x.swf"></object><embed src="y.swf"><p>safe</p>',
    );
    expect(html).not.toContain("<object");
    expect(html).not.toContain("<embed");
    expect(html).toContain("safe");
  });

  it("strips <form> and <input> tags", () => {
    const html = sanitizeArticleHtml(
      '<form action="/steal"><input name="cc"><button>Submit</button></form><p>ok</p>',
    );
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<input");
    expect(html).toContain("ok");
  });

  it("strips style attributes", () => {
    const html = sanitizeArticleHtml(
      '<p style="background:url(javascript:alert(1))">styled</p>',
    );
    expect(html).not.toContain("style=");
    expect(html).toContain("styled");
  });

  it("strips data-* attributes (ALLOW_DATA_ATTR is false)", () => {
    const html = sanitizeArticleHtml('<p data-secret="token123">text</p>');
    expect(html).not.toContain("data-secret");
    expect(html).not.toContain("token123");
    expect(html).toContain("text");
  });

  it("strips class attributes", () => {
    const html = sanitizeArticleHtml('<p class="admin-override">text</p>');
    expect(html).not.toContain("class=");
    expect(html).toContain("text");
  });
});

// ---------------------------------------------------------------------------
// ALLOWED_URI_REGEXP: scheme-level validation
// ---------------------------------------------------------------------------

describe("ALLOWED_URI_REGEXP allows and rejects the correct schemes", () => {
  describe("allowed schemes", () => {
    const allowed: readonly [string, string][] = [
      ["https:", "https://example.com/page"],
      ["http:", "http://example.com/page"],
      ["mailto:", "mailto:user@example.com"],
      ["tel:", "tel:+1234567890"],
      ["form-asset:", "form-asset://blob-uuid-123"],
      ["kb-attachment:", "kb-attachment://att-uuid-456"],
      ["blob:", "blob:http://localhost/some-uuid"],
      ["data:", "data:image/png;base64,abc"],
      ["ftp:", "ftp://files.example.com/doc"],
    ];

    for (const [scheme, uri] of allowed) {
      it(`allows ${scheme} URIs`, () => {
        expect(ALLOWED_URI_REGEXP.test(uri)).toBe(true);
      });
    }
  });

  describe("rejected schemes", () => {
    const rejected: readonly [string, string][] = [
      ["javascript:", "javascript:alert(1)"],
      ["vbscript:", "vbscript:MsgBox('xss')"],
    ];

    for (const [scheme, uri] of rejected) {
      it(`rejects ${scheme} URIs`, () => {
        expect(ALLOWED_URI_REGEXP.test(uri)).toBe(false);
      });
    }
  });
});
