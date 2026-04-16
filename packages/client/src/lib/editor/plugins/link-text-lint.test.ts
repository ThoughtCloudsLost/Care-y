// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { Node as PMNode } from "prosemirror-model";
import { EditorState, TextSelection } from "prosemirror-state";
import { kbArticleSchema } from "../prosemirror-schema.js";
import {
  buildLinkDecorations,
  linkTextLintPlugin,
  linkTextLintKey,
} from "./link-text-lint.js";

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

const linkedText = (text: string, href: string) =>
  t(text, [{ type: "link", attrs: { href, title: null } }]);

// ---------------------------------------------------------------------------
// buildLinkDecorations (unit)
// ---------------------------------------------------------------------------

describe("buildLinkDecorations", () => {
  it("returns no decorations for a doc without links", () => {
    const d = doc([p("Just regular text, nothing special.")]);
    const result = buildLinkDecorations(d);
    expect(result.count).toBe(0);
  });

  it("returns no decorations for descriptive link text", () => {
    const d = doc([
      p(linkedText("download the intake form", "https://example.com")),
    ]);
    const result = buildLinkDecorations(d);
    expect(result.count).toBe(0);
  });

  it('decorates "click here" link text', () => {
    const d = doc([p(linkedText("click here", "https://example.com"))]);
    const result = buildLinkDecorations(d);
    expect(result.count).toBe(1);
  });

  it('decorates "read more" link text (case insensitive)', () => {
    const d = doc([p(linkedText("Read More", "https://example.com"))]);
    const result = buildLinkDecorations(d);
    expect(result.count).toBe(1);
  });

  it("decorates multiple generic links in the same document", () => {
    const d = doc([
      p(linkedText("click here", "https://a.com")),
      p(linkedText("here", "https://b.com")),
      p(linkedText("good link text", "https://c.com")),
    ]);
    const result = buildLinkDecorations(d);
    expect(result.count).toBe(2);
  });

  it("handles mixed content (generic + descriptive) in the same paragraph", () => {
    const d = doc([
      p(
        "Check ",
        linkedText("here", "https://a.com"),
        " and ",
        linkedText("the safety protocol", "https://b.com"),
      ),
    ]);
    const result = buildLinkDecorations(d);
    expect(result.count).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// linkTextLintPlugin (integration)
// ---------------------------------------------------------------------------

describe("linkTextLintPlugin", () => {
  it("initializes plugin state with decorations", () => {
    const d = doc([p(linkedText("click here", "https://example.com"))]);
    const state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [linkTextLintPlugin()],
    });

    const pluginState = linkTextLintKey.getState(state);
    expect(pluginState).toBeDefined();
    expect(pluginState!.count).toBe(1);
  });

  it("updates decorations after document change", () => {
    const d = doc([p("Regular text")]);
    let state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [linkTextLintPlugin()],
    });

    expect(linkTextLintKey.getState(state)!.count).toBe(0);

    // Insert a text node with a link mark
    const linkType = kbArticleSchema.marks.link;
    if (linkType === undefined) throw new Error("link mark not in schema");
    const linkMark = linkType.create({
      href: "https://example.com",
    });
    const linkedNode = kbArticleSchema.text("click here", [linkMark]);
    const tr = state.tr.insert(state.doc.content.size - 1, linkedNode);
    state = state.apply(tr);

    expect(linkTextLintKey.getState(state)!.count).toBe(1);
  });

  it("does not recompute on selection-only changes", () => {
    const d = doc([
      p(linkedText("here", "https://example.com")),
      p("Second paragraph"),
    ]);
    const state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [linkTextLintPlugin()],
    });

    const initialState = linkTextLintKey.getState(state);

    // Selection-only transaction
    const newState = state.apply(
      state.tr.setSelection(TextSelection.create(state.doc, 1)),
    );
    const afterState = linkTextLintKey.getState(newState);

    // Same object reference (no recompute)
    expect(afterState).toBe(initialState);
  });
});
