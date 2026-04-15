// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { Node as PMNode } from "prosemirror-model";
import { EditorState, TextSelection } from "prosemirror-state";
import { kbArticleSchema, kbEditorPlugins } from "./prosemirror-schema.js";
import {
  markActive,
  blockTypeActive,
  deriveToolbarState,
} from "./toolbar-state.js";

// ---------------------------------------------------------------------------
// Schema type references (non-null: these all exist in kbArticleSchema)
// ---------------------------------------------------------------------------

// Non-null assertions: these mark/node types are defined in kbArticleSchema.
const STRONG = kbArticleSchema.marks.strong!;
const EM = kbArticleSchema.marks.em!;
const CODE_MARK = kbArticleSchema.marks.code!;
const STRIKETHROUGH = kbArticleSchema.marks.strikethrough!;
const LINK = kbArticleSchema.marks.link!;
const BLOCKQUOTE = kbArticleSchema.nodes.blockquote!;
const BULLET_LIST = kbArticleSchema.nodes.bullet_list!;
const HEADING = kbArticleSchema.nodes.heading!;

// ---------------------------------------------------------------------------
// Test builders (same JSON format as prosemirror-schema.test.ts)
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
  type: "paragraph" as const,
  content: texts.map((s) => (typeof s === "string" ? t(s) : s)),
});

const heading = (level: number, text: string) => ({
  type: "heading",
  attrs: { level },
  content: [t(text)],
});

const bq = (content: unknown[]) => ({
  type: "blockquote",
  content,
});

const li = (text: string) => ({
  type: "list_item",
  content: [p(text)],
});

/** Create EditorState from JSON doc content. Cursor at position `pos`. */
function stateAt(content: unknown[], pos: number): EditorState {
  const pmDoc = doc(content);
  const state = EditorState.create({
    doc: pmDoc,
    plugins: [...kbEditorPlugins],
  });
  const $pos = state.doc.resolve(pos);
  return state.apply(state.tr.setSelection(TextSelection.near($pos)));
}

/** Create EditorState with a text range selection. */
function stateRange(content: unknown[], from: number, to: number): EditorState {
  const pmDoc = doc(content);
  const state = EditorState.create({
    doc: pmDoc,
    plugins: [...kbEditorPlugins],
  });
  return state.apply(
    state.tr.setSelection(TextSelection.create(state.doc, from, to)),
  );
}

// ---------------------------------------------------------------------------
// markActive
// ---------------------------------------------------------------------------

describe("markActive", () => {
  it("returns false when cursor is in unmarked text", () => {
    const state = stateAt([p("hello")], 3);
    expect(markActive(state, STRONG)).toBe(false);
  });

  it("returns true when cursor is inside bold text", () => {
    const state = stateAt([p(t("he", [{ type: "strong" }]), t("llo"))], 2);
    expect(markActive(state, STRONG)).toBe(true);
  });

  it("returns true when range selection covers bold text", () => {
    // "hello" with "ell" bold: positions 1..6 total, bold from 2..5
    const state = stateRange(
      [p(t("h"), t("ell", [{ type: "strong" }]), t("o"))],
      2,
      5,
    );
    expect(markActive(state, STRONG)).toBe(true);
  });

  it("returns false for a different mark type", () => {
    const state = stateAt([p(t("bold", [{ type: "strong" }]))], 2);
    expect(markActive(state, EM)).toBe(false);
  });

  it("detects inline code mark", () => {
    const state = stateAt([p(t("let x", [{ type: "code" }]))], 3);
    expect(markActive(state, CODE_MARK)).toBe(true);
  });

  it("detects strikethrough mark", () => {
    const state = stateAt([p(t("old", [{ type: "strikethrough" }]))], 2);
    expect(markActive(state, STRIKETHROUGH)).toBe(true);
  });

  it("detects link mark", () => {
    const state = stateAt(
      [
        p(
          t("click", [
            { type: "link", attrs: { href: "https://example.com" } },
          ]),
        ),
      ],
      3,
    );
    expect(markActive(state, LINK)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// blockTypeActive
// ---------------------------------------------------------------------------

describe("blockTypeActive", () => {
  it("returns false when cursor is in a paragraph", () => {
    const state = stateAt([p("hello")], 3);
    expect(blockTypeActive(state, BLOCKQUOTE)).toBe(false);
  });

  it("returns true when cursor is inside a blockquote", () => {
    const state = stateAt([bq([p("quoted")])], 3);
    expect(blockTypeActive(state, BLOCKQUOTE)).toBe(true);
  });

  it("returns true when cursor is inside a bullet list", () => {
    const state = stateAt([{ type: "bullet_list", content: [li("item")] }], 3);
    expect(blockTypeActive(state, BULLET_LIST)).toBe(true);
  });

  it("matches heading with specific level attrs", () => {
    const state = stateAt([heading(2, "Title")], 3);
    expect(blockTypeActive(state, HEADING, { level: 2 })).toBe(true);
    expect(blockTypeActive(state, HEADING, { level: 3 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deriveToolbarState
// ---------------------------------------------------------------------------

describe("deriveToolbarState", () => {
  it("returns all-false state for empty paragraph", () => {
    const state = stateAt([p("hello")], 3);
    const ts = deriveToolbarState(state);

    expect(ts.boldActive).toBe(false);
    expect(ts.italicActive).toBe(false);
    expect(ts.strikethroughActive).toBe(false);
    expect(ts.codeActive).toBe(false);
    expect(ts.linkActive).toBe(false);
    expect(ts.blockquoteActive).toBe(false);
    expect(ts.codeBlockActive).toBe(false);
    expect(ts.bulletListActive).toBe(false);
    expect(ts.orderedListActive).toBe(false);
    expect(ts.headingLevel).toBeNull();
    expect(ts.insideTable).toBe(false);
  });

  it("detects bold active when cursor is in bold text", () => {
    const state = stateAt([p(t("bold text", [{ type: "strong" }]))], 3);
    const ts = deriveToolbarState(state);
    expect(ts.boldActive).toBe(true);
    expect(ts.italicActive).toBe(false);
  });

  it("detects heading level 2", () => {
    const state = stateAt([heading(2, "Section")], 3);
    const ts = deriveToolbarState(state);
    expect(ts.headingLevel).toBe(2);
  });

  it("detects heading level 1", () => {
    const state = stateAt([heading(1, "Title")], 3);
    const ts = deriveToolbarState(state);
    expect(ts.headingLevel).toBe(1);
  });

  it("heading level is null for paragraphs", () => {
    const state = stateAt([p("text")], 2);
    const ts = deriveToolbarState(state);
    expect(ts.headingLevel).toBeNull();
  });

  it("detects blockquote active", () => {
    const state = stateAt([bq([p("inside")])], 3);
    const ts = deriveToolbarState(state);
    expect(ts.blockquoteActive).toBe(true);
  });

  it("detects bullet list active", () => {
    const state = stateAt([{ type: "bullet_list", content: [li("item")] }], 3);
    const ts = deriveToolbarState(state);
    expect(ts.bulletListActive).toBe(true);
  });

  it("detects ordered list active", () => {
    const state = stateAt(
      [{ type: "ordered_list", attrs: { order: 1 }, content: [li("item")] }],
      3,
    );
    const ts = deriveToolbarState(state);
    expect(ts.orderedListActive).toBe(true);
  });

  it("detects code block active", () => {
    const state = stateAt(
      [{ type: "code_block", content: [t("const x = 1")] }],
      5,
    );
    const ts = deriveToolbarState(state);
    expect(ts.codeBlockActive).toBe(true);
  });

  it("detects table context", () => {
    const state = stateAt(
      [
        {
          type: "table",
          content: [
            {
              type: "table_row",
              content: [
                {
                  type: "table_cell",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [p("cell")],
                },
              ],
            },
          ],
        },
      ],
      4,
    );
    const ts = deriveToolbarState(state);
    expect(ts.insideTable).toBe(true);
  });

  it("reports canUndo as false for fresh state", () => {
    const state = stateAt([p("hello")], 3);
    const ts = deriveToolbarState(state);
    expect(ts.canUndo).toBe(false);
    expect(ts.canRedo).toBe(false);
  });

  it("reports canBold as true for text in paragraph", () => {
    const state = stateAt([p("text")], 2);
    const ts = deriveToolbarState(state);
    expect(ts.canBold).toBe(true);
    expect(ts.canItalic).toBe(true);
  });

  it("reports canBold as false inside code block (marks disallowed)", () => {
    const state = stateAt([{ type: "code_block", content: [t("code")] }], 3);
    const ts = deriveToolbarState(state);
    expect(ts.canBold).toBe(false);
    expect(ts.canItalic).toBe(false);
  });

  it("detects multiple active marks simultaneously", () => {
    const state = stateAt(
      [p(t("styled", [{ type: "strong" }, { type: "em" }]))],
      3,
    );
    const ts = deriveToolbarState(state);
    expect(ts.boldActive).toBe(true);
    expect(ts.italicActive).toBe(true);
    expect(ts.strikethroughActive).toBe(false);
  });
});
