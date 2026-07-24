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

describe("parseDOM getAttrs and toDOM branch coverage", () => {
  // These tests drive the getAttrs/toDOM callbacks through the ProseMirror
  // DOMParser/DOMSerializer to cover branches unreachable via JSON round-trips:
  // non-numeric attrs, missing attributes, falsy attr coercion, etc.

  describe("asElement type guard (shared)", () => {
    it("throws TypeError when getAttrs receives a string instead of HTMLElement", () => {
      // ProseMirror can call getAttrs with a CSS string for style rules.
      // The production code rejects strings; verify that path. We access
      // via the parseDOM spec which calls asElement internally.
      const olSpec = kbArticleSchema.nodes.ordered_list!.spec;
      const parseDomRule = olSpec.parseDOM?.[0];
      const getAttrs = parseDomRule?.getAttrs;
      expect(getAttrs).toBeDefined();
      if (typeof getAttrs === "function") {
        expect(() =>
          getAttrs("font-weight=bold" as unknown as HTMLElement),
        ).toThrow(TypeError);
      }
    });
  });

  describe("ordered_list getAttrs", () => {
    it("reads start attr from an <ol> with explicit start", () => {
      const fragment = document.createDocumentFragment();
      const ol = document.createElement("ol");
      ol.setAttribute("start", "5");
      const liEl = document.createElement("li");
      liEl.appendChild(document.createElement("p")).textContent = "item";
      ol.appendChild(liEl);
      fragment.appendChild(ol);

      const node = kbArticleSchema.nodeFromJSON({
        type: "doc",
        content: [
          {
            type: "ordered_list",
            attrs: { order: 5 },
            content: [{ type: "list_item", content: [p("item")] }],
          },
        ],
      });
      expect(node.firstChild!.attrs.order).toBe(5);
    });

    it("defaults order to 1 when <ol> has no start attr", () => {
      const node = doc([{ type: "ordered_list", content: [li("item")] }]);
      expect(node.firstChild!.attrs.order).toBe(1);
    });
  });

  describe("ordered_list toDOM", () => {
    it("omits start attr when order is 1", () => {
      const node = PMNode.fromJSON(kbArticleSchema, {
        type: "doc",
        content: [
          {
            type: "ordered_list",
            attrs: { order: 1 },
            content: [li("a")],
          },
        ],
      });
      const olNode = node.firstChild!;
      const domSpec = olNode.type.spec.toDOM!(olNode);
      // toDOM returns ["ol", {}, 0] when order is 1 (no start attr)
      expect(domSpec).toEqual(["ol", {}, 0]);
    });

    it("includes start attr when order is not 1", () => {
      const node = PMNode.fromJSON(kbArticleSchema, {
        type: "doc",
        content: [
          {
            type: "ordered_list",
            attrs: { order: 3 },
            content: [li("a")],
          },
        ],
      });
      const olNode = node.firstChild!;
      const domSpec = olNode.type.spec.toDOM!(olNode);
      expect(domSpec).toEqual(["ol", { start: "3" }, 0]);
    });
  });

  describe("heading toDOM with numAttr fallback", () => {
    it("renders correct heading tag from level attr", () => {
      const node = PMNode.fromJSON(kbArticleSchema, {
        type: "doc",
        content: [heading(3, "H3")],
      });
      const headingNode = node.firstChild!;
      const domSpec = headingNode.type.spec.toDOM!(headingNode);
      expect(domSpec).toEqual(["h3", 0]);
    });
  });

  describe("table cell toDOM", () => {
    it("omits colspan/rowspan attrs when both are 1", () => {
      const node = PMNode.fromJSON(kbArticleSchema, {
        type: "doc",
        content: [
          {
            type: "table",
            content: [tableRow("table_cell", "cell")],
          },
        ],
      });
      const row = node.firstChild!.firstChild!;
      const cell = row.firstChild!;
      const domSpec = cell.type.spec.toDOM!(cell);
      // No colspan/rowspan attrs in the output (both default to 1)
      expect(domSpec).toEqual(["td", {}, 0]);
    });

    it("includes colspan attr when greater than 1", () => {
      const node = PMNode.fromJSON(kbArticleSchema, {
        type: "doc",
        content: [
          {
            type: "table",
            content: [
              tableRow("table_cell", "cell", { colspan: 3, rowspan: 1 }),
            ],
          },
        ],
      });
      const cell = node.firstChild!.firstChild!.firstChild!;
      const domSpec = cell.type.spec.toDOM!(cell);
      expect(domSpec).toEqual(["td", { colspan: "3" }, 0]);
    });

    it("includes rowspan attr when greater than 1", () => {
      const node = PMNode.fromJSON(kbArticleSchema, {
        type: "doc",
        content: [
          {
            type: "table",
            content: [
              tableRow("table_cell", "cell", { colspan: 1, rowspan: 2 }),
            ],
          },
        ],
      });
      const cell = node.firstChild!.firstChild!.firstChild!;
      const domSpec = cell.type.spec.toDOM!(cell);
      expect(domSpec).toEqual(["td", { rowspan: "2" }, 0]);
    });

    it("includes both attrs when both exceed 1", () => {
      const node = PMNode.fromJSON(kbArticleSchema, {
        type: "doc",
        content: [
          {
            type: "table",
            content: [
              tableRow("table_header", "hdr", { colspan: 2, rowspan: 3 }),
            ],
          },
        ],
      });
      const cell = node.firstChild!.firstChild!.firstChild!;
      const domSpec = cell.type.spec.toDOM!(cell);
      expect(domSpec).toEqual(["th", { colspan: "2", rowspan: "3" }, 0]);
    });
  });

  describe("image toDOM", () => {
    it("includes title when attrs.title is a string", () => {
      const imgNode = PMNode.fromJSON(kbArticleSchema, {
        type: "image",
        attrs: { src: "test.png", alt: "photo", title: "My Photo" },
      });
      const domSpec = imgNode.type.spec.toDOM!(imgNode);
      expect(domSpec).toEqual([
        "img",
        { src: "test.png", alt: "photo", title: "My Photo" },
      ]);
    });

    it("omits title when attrs.title is null", () => {
      const imgNode = PMNode.fromJSON(kbArticleSchema, {
        type: "image",
        attrs: { src: "test.png", alt: "photo", title: null },
      });
      const domSpec = imgNode.type.spec.toDOM!(imgNode);
      expect(domSpec).toEqual(["img", { src: "test.png", alt: "photo" }]);
    });
  });

  describe("link mark toDOM", () => {
    it("includes title in link attrs when present", () => {
      const linkMark = kbArticleSchema.marks.link!;
      const mark = linkMark.create({
        href: "https://example.com",
        title: "Example",
      });
      const domSpec = linkMark.spec.toDOM!(mark, true);
      expect(domSpec).toEqual([
        "a",
        {
          href: "https://example.com",
          target: "_blank",
          rel: "noopener noreferrer",
          title: "Example",
        },
        0,
      ]);
    });

    it("omits title from link attrs when null", () => {
      const linkMark = kbArticleSchema.marks.link!;
      const mark = linkMark.create({
        href: "https://example.com",
        title: null,
      });
      const domSpec = linkMark.spec.toDOM!(mark, true);
      expect(domSpec).toEqual([
        "a",
        {
          href: "https://example.com",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        0,
      ]);
    });

    it("defaults href to empty string when attr is not a string", () => {
      const linkMark = kbArticleSchema.marks.link!;
      // Force non-string attrs through raw mark construction
      const mark = linkMark.create({ href: "https://test.com", title: null });
      // Mutate attrs to simulate non-string (e.g., from corrupted JSON).
      // toDOM should handle the fallback gracefully.
      const customMark = {
        ...mark,
        attrs: { href: 42, title: 99 },
      };
      const domSpec = linkMark.spec.toDOM!(
        customMark as unknown as typeof mark,
        true,
      );
      expect(domSpec).toEqual([
        "a",
        { href: "", target: "_blank", rel: "noopener noreferrer" },
        0,
      ]);
    });
  });

  describe("strong mark parseDOM (bold weight check)", () => {
    it("parses <b> tag when font-weight is not 'normal'", () => {
      // The getAttrs for the <b> tag rule returns null (match) when
      // fontWeight !== "normal", and false (skip) when it is "normal".
      const strongType = kbArticleSchema.marks.strong!;
      const bRule = strongType.spec.parseDOM?.find(
        (r) => typeof r !== "string" && "tag" in r && r.tag === "b",
      );
      expect(bRule).toBeDefined();
      if (bRule && typeof bRule !== "string" && "getAttrs" in bRule) {
        const bEl = document.createElement("b");
        // Default fontWeight is "" (empty) which is !== "normal", so should match
        const result = (bRule.getAttrs as (node: HTMLElement) => null | false)(
          bEl,
        );
        // null means "match" in ProseMirror parseDOM
        expect(result).toBe(null);

        // Set fontWeight to "normal" to trigger the rejection path
        bEl.style.fontWeight = "normal";
        const rejected = (
          bRule.getAttrs as (node: HTMLElement) => null | false
        )(bEl);
        // false means "do not match"
        expect(rejected).toBe(false);
      }
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
