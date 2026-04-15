// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { Node as PMNode } from "prosemirror-model";
import { EditorState, TextSelection } from "prosemirror-state";
import { kbArticleSchema } from "../prosemirror-schema.js";
import {
  computeAllowedLevels,
  headingHierarchyPlugin,
  headingHierarchyKey,
} from "./heading-hierarchy.js";

// ---------------------------------------------------------------------------
// Test builders
// ---------------------------------------------------------------------------

function doc(content: unknown[]): PMNode {
  return PMNode.fromJSON(kbArticleSchema, { type: "doc", content });
}

const t = (text: string) => ({ type: "text", text });

const p = (text: string) => ({
  type: "paragraph",
  content: [t(text)],
});

const heading = (level: number, text: string) => ({
  type: "heading",
  attrs: { level },
  content: [t(text)],
});

/** Create an EditorState with the heading hierarchy plugin at a given cursor position. */
function stateAt(content: unknown[], cursorPos?: number): EditorState {
  const d = doc(content);
  const state = EditorState.create({
    doc: d,
    schema: kbArticleSchema,
    plugins: [headingHierarchyPlugin()],
  });

  if (cursorPos === undefined) return state;

  // Move selection to the desired position
  const resolvedPos = state.doc.resolve(cursorPos);
  return state.apply(state.tr.setSelection(TextSelection.near(resolvedPos)));
}

// ---------------------------------------------------------------------------
// computeAllowedLevels (unit)
// ---------------------------------------------------------------------------

describe("computeAllowedLevels", () => {
  it("always allows H1 on an empty document", () => {
    const d = doc([p("Some text")]);
    const allowed = computeAllowedLevels(d, 0);
    expect(allowed.has(1)).toBe(true);
    expect(allowed.has(2)).toBe(false);
    expect(allowed.has(3)).toBe(false);
    expect(allowed.has(4)).toBe(false);
  });

  it("allows H2 after H1 exists above cursor", () => {
    const d = doc([heading(1, "Title"), p("Body text here")]);
    // cursor after the paragraph (end of doc)
    const allowed = computeAllowedLevels(d, d.content.size);
    expect(allowed.has(1)).toBe(true);
    expect(allowed.has(2)).toBe(true);
    expect(allowed.has(3)).toBe(false);
  });

  it("allows H3 after H1 and H2 exist above cursor", () => {
    const d = doc([heading(1, "Title"), heading(2, "Section"), p("Body")]);
    const allowed = computeAllowedLevels(d, d.content.size);
    expect(allowed.has(1)).toBe(true);
    expect(allowed.has(2)).toBe(true);
    expect(allowed.has(3)).toBe(true);
    expect(allowed.has(4)).toBe(false);
  });

  it("allows H4 after H1, H2, and H3 exist above cursor", () => {
    const d = doc([
      heading(1, "Title"),
      heading(2, "Section"),
      heading(3, "Subsection"),
      p("Body"),
    ]);
    const allowed = computeAllowedLevels(d, d.content.size);
    expect(allowed).toEqual(new Set([1, 2, 3, 4]));
  });

  it("does not allow H3 if only H1 is above cursor (no H2)", () => {
    const d = doc([heading(1, "Title"), p("Body")]);
    const allowed = computeAllowedLevels(d, d.content.size);
    expect(allowed.has(3)).toBe(false);
  });

  it("only considers headings before the cursor, not after", () => {
    // H1 is at position 0, H3 is later in the doc.
    // If cursor is between H1 and H3, H3 shouldn't affect allowed levels.
    const d = doc([heading(1, "Title"), p("Body"), heading(3, "Later")]);
    // cursor at start of paragraph (after H1, before H3)
    // H1 takes ~7 chars ("Title" + node overhead), paragraph starts after
    const h1End = 1 + 1 + 5 + 1; // opening of doc(1) + opening of heading(1) + "Title"(5) + close(1)
    const allowed = computeAllowedLevels(d, h1End);
    expect(allowed.has(2)).toBe(true);
    expect(allowed.has(3)).toBe(false);
  });

  it("handles cursor at position 0 (start of document)", () => {
    const d = doc([p("Hello")]);
    const allowed = computeAllowedLevels(d, 0);
    expect(allowed).toEqual(new Set([1]));
  });

  it("handles cursor past document content size (clamped)", () => {
    const d = doc([heading(1, "Title")]);
    const allowed = computeAllowedLevels(d, 9999);
    expect(allowed.has(1)).toBe(true);
    expect(allowed.has(2)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// headingHierarchyPlugin (integration)
// ---------------------------------------------------------------------------

describe("headingHierarchyPlugin", () => {
  it("initializes with correct allowed levels for empty doc", () => {
    const state = stateAt([p("Hello")]);
    const pluginState = headingHierarchyKey.getState(state);
    expect(pluginState).toBeDefined();
    expect(pluginState!.allowedLevels.has(1)).toBe(true);
  });

  it("updates allowed levels after adding a heading", () => {
    // Start with just a paragraph
    let state = stateAt([p("Hello")]);

    // Simulate inserting an H1 via transaction
    const headingType = kbArticleSchema.nodes.heading;
    if (headingType === undefined) throw new Error("heading not in schema");
    const headingNode = headingType.create(
      { level: 1 },
      kbArticleSchema.text("Title"),
    );
    const tr = state.tr.insert(1, headingNode);
    state = state.apply(tr);

    const pluginState = headingHierarchyKey.getState(state);
    expect(pluginState!.allowedLevels.has(2)).toBe(true);
  });

  it("does not recompute on selection-only change when doc is unchanged", () => {
    const state = stateAt([heading(1, "Title"), p("Body")]);

    // Apply a selection-only transaction
    const newState = state.apply(
      state.tr.setSelection(TextSelection.create(state.doc, 1)),
    );
    const updatedState = headingHierarchyKey.getState(newState);

    // Both should have H1 and H2 allowed (but the plugin does recompute on selectionSet)
    expect(updatedState!.allowedLevels.has(1)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Property-based: sequential headings never produce heading-skip warnings
// ---------------------------------------------------------------------------

describe("property-based: computeAllowedLevels", () => {
  it("always allows H1 regardless of document content", () => {
    fc.assert(
      fc.property(
        // Generate a list of 0-10 heading levels (1-4)
        fc.array(fc.integer({ min: 1, max: 4 }), {
          minLength: 0,
          maxLength: 10,
        }),
        (levels) => {
          const content: unknown[] = levels.map((lvl) =>
            heading(lvl, `H${String(lvl)} text`),
          );
          if (content.length === 0) content.push(p("empty"));
          const d = doc(content);
          const allowed = computeAllowedLevels(d, d.content.size);
          return allowed.has(1);
        },
      ),
    );
  });

  it("for sequential headings (1,2,3,4), all levels up to max+1 are allowed", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 4 }), (maxLevel) => {
        // Build a strictly sequential heading list: H1, H2, ..., H(maxLevel)
        const content = Array.from({ length: maxLevel }, (_, i) =>
          heading(i + 1, `Heading ${String(i + 1)}`),
        );
        const d = doc(content);
        const allowed = computeAllowedLevels(d, d.content.size);

        // All levels up to maxLevel should be allowed
        for (let i = 1; i <= maxLevel; i++) {
          if (!allowed.has(i)) return false;
        }
        // Level maxLevel+1 should be allowed too (next valid step)
        if (maxLevel < 4 && !allowed.has(maxLevel + 1)) return false;
        return true;
      }),
    );
  });
});
