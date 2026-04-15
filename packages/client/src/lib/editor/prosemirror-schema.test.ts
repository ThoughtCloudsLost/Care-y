// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { Node as PMNode } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { undo } from "prosemirror-history";
import { kbArticleSchema, kbEditorPlugins } from "./prosemirror-schema.js";

// ---------------------------------------------------------------------------
// Test builders: cut JSON nesting so test intent is visible at a glance.
// Each returns a plain object matching ProseMirror's JSON format.
// ---------------------------------------------------------------------------

function doc(content: unknown[]): PMNode {
  return PMNode.fromJSON(kbArticleSchema, { type: "doc", content });
}

/** Round-trip a JSON doc through fromJSON/toJSON and assert equality. */
function roundTrip(content: unknown[]): void {
  const json = { type: "doc", content };
  const node = PMNode.fromJSON(kbArticleSchema, json);
  expect(node.toJSON()).toEqual(json);
}

const t = (text: string, marks?: unknown[]) =>
  marks ? { type: "text", marks, text } : { type: "text", text };

const p = (...texts: string[]) => ({
  type: "paragraph",
  content: texts.map((s) => t(s)),
});

const heading = (level: number, text: string) => ({
  type: "heading",
  attrs: { level },
  content: [t(text)],
});

const li = (text: string) => ({
  type: "list_item",
  content: [p(text)],
});

const tableRow = (cellType: string, text: string, attrs?: object) => ({
  type: "table_row",
  content: [
    {
      type: cellType,
      attrs: { colspan: 1, rowspan: 1, ...attrs },
      content: [p(text)],
    },
  ],
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("kbArticleSchema", () => {
  describe("round-trip serialization", () => {
    it("round-trips a paragraph", () => {
      roundTrip([p("hello")]);
    });

    it("round-trips headings at all levels", () => {
      for (const level of [1, 2, 3, 4]) {
        roundTrip([heading(level, `Heading ${level}`)]);
      }
    });

    it("round-trips a blockquote", () => {
      roundTrip([{ type: "blockquote", content: [p("quoted")] }]);
    });

    it("round-trips bullet and ordered lists", () => {
      roundTrip([
        { type: "bullet_list", content: [li("item")] },
        {
          type: "ordered_list",
          attrs: { order: 3 },
          content: [li("numbered")],
        },
      ]);
    });

    it("round-trips a code block", () => {
      roundTrip([{ type: "code_block", content: [t("const x = 1;")] }]);
    });

    it("round-trips an image", () => {
      roundTrip([
        {
          type: "paragraph",
          content: [
            {
              type: "image",
              attrs: {
                src: "https://example.com/img.png",
                alt: "A photo",
                title: "Photo title",
              },
            },
          ],
        },
      ]);
    });

    it("round-trips a horizontal rule", () => {
      roundTrip([p("above"), { type: "horizontal_rule" }, p("below")]);
    });

    it("round-trips a figure with figure_image and caption", () => {
      roundTrip([
        {
          type: "figure",
          content: [
            {
              type: "figure_image",
              attrs: { src: "photo.jpg", alt: "Photo", title: null },
            },
            { type: "figcaption", content: [t("Caption text")] },
          ],
        },
      ]);
    });

    it("round-trips a table with headers and cells", () => {
      roundTrip([
        {
          type: "table",
          content: [
            tableRow("table_header", "Header"),
            tableRow("table_cell", "Cell"),
          ],
        },
      ]);
    });

    it("round-trips a table cell with colspan and rowspan", () => {
      roundTrip([
        {
          type: "table",
          content: [
            tableRow("table_cell", "Spanning", {
              colspan: 2,
              rowspan: 3,
            }),
          ],
        },
      ]);
    });

    it("round-trips a hard break", () => {
      roundTrip([
        {
          type: "paragraph",
          content: [t("line one"), { type: "hard_break" }, t("line two")],
        },
      ]);
    });
  });

  describe("marks round-trip", () => {
    it("round-trips strong text", () => {
      roundTrip([
        { type: "paragraph", content: [t("bold", [{ type: "strong" }])] },
      ]);
    });

    it("round-trips em, code, and strikethrough", () => {
      for (const markType of ["em", "code", "strikethrough"]) {
        roundTrip([
          { type: "paragraph", content: [t("marked", [{ type: markType }])] },
        ]);
      }
    });

    it("round-trips a link mark with href and title", () => {
      roundTrip([
        {
          type: "paragraph",
          content: [
            t("click", [
              {
                type: "link",
                attrs: { href: "https://example.com", title: "Example" },
              },
            ]),
          ],
        },
      ]);
    });

    it("round-trips multiple marks on the same text", () => {
      roundTrip([
        {
          type: "paragraph",
          content: [t("bold italic", [{ type: "strong" }, { type: "em" }])],
        },
      ]);
    });
  });

  describe("schema validation", () => {
    it("rejects an unknown node type", () => {
      const json = {
        type: "doc",
        content: [{ type: "video", attrs: { src: "movie.mp4" } }],
      };
      expect(() => PMNode.fromJSON(kbArticleSchema, json)).toThrow();
    });

    it("rejects an unknown mark type", () => {
      const json = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [t("underlined", [{ type: "underline" }])],
          },
        ],
      };
      expect(() => PMNode.fromJSON(kbArticleSchema, json)).toThrow();
    });

    it("validates heading level is a number", () => {
      doc([heading(2, "ok")]).check();

      // fromJSON validates attrs eagerly when `validate` is set,
      // so construction itself throws for invalid types.
      expect(() =>
        doc([
          {
            type: "heading",
            attrs: { level: "two" },
            content: [t("bad")],
          },
        ]),
      ).toThrow();
    });

    it("code_block spec declares empty marks allowlist", () => {
      // marks: "" means the editing layer prevents mark application.
      const codeBlockType = kbArticleSchema.nodes.code_block!;
      expect(codeBlockType.spec.marks).toBe("");
    });
  });

  describe("ordered_list start attribute", () => {
    it("defaults order to 1 when not specified", () => {
      const node = doc([{ type: "ordered_list", content: [li("first")] }]);
      expect(node.firstChild!.attrs.order).toBe(1);
    });
  });
});

describe("kbEditorPlugins", () => {
  it("creates a valid EditorState with the base plugins", () => {
    const state = EditorState.create({
      schema: kbArticleSchema,
      plugins: [...kbEditorPlugins],
    });
    expect(state.doc.type.name).toBe("doc");
    expect(state.plugins).toHaveLength(kbEditorPlugins.length);
  });

  it("undo reverts a transaction", () => {
    let state = EditorState.create({
      schema: kbArticleSchema,
      plugins: [...kbEditorPlugins],
    });

    const tr = state.tr.insertText("hello", 1);
    state = state.apply(tr);
    expect(state.doc.textContent).toBe("hello");

    const undid = undo(state, (undoTr) => {
      state = state.apply(undoTr);
    });
    expect(undid).toBe(true);
    expect(state.doc.textContent).toBe("");
  });
});
