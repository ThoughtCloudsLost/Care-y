// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { Node as PMNode } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { kbArticleSchema } from "../prosemirror-schema.js";
import {
  atagDecorationsPlugin,
  atagDecorationsKey,
  setAtagActive,
} from "./atag-decorations.js";

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

const heading = (level: number, text: string) => ({
  type: "heading",
  attrs: { level },
  content: [t(text)],
});

const emptyHeading = (level: number) => ({
  type: "heading",
  attrs: { level },
});

const image = (alt: string) => ({
  type: "image",
  attrs: { src: "https://example.com/img.png", alt, title: null },
});

const imageNoAlt = () => ({
  type: "image",
  attrs: { src: "https://example.com/img.png", alt: "", title: null },
});

const linkedText = (text: string, href: string) =>
  t(text, [{ type: "link", attrs: { href, title: null } }]);

// ---------------------------------------------------------------------------
// Plugin state: always-on warning count
// ---------------------------------------------------------------------------

describe("atagDecorationsPlugin: warning count", () => {
  it("counts zero warnings for a clean document", () => {
    const d = doc([heading(1, "Title"), p("Clean content")]);
    const state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [atagDecorationsPlugin()],
    });

    const pluginState = atagDecorationsKey.getState(state);
    expect(pluginState).toBeDefined();
    expect(pluginState!.warnings).toHaveLength(0);
    expect(pluginState!.active).toBe(false);
  });

  it("counts heading skip warnings", () => {
    const d = doc([heading(1, "Title"), heading(3, "Skipped H2")]);
    const state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [atagDecorationsPlugin()],
    });

    const pluginState = atagDecorationsKey.getState(state);
    expect(pluginState!.warnings).toHaveLength(1);
    expect(pluginState!.warnings[0]!.type).toBe("heading-skip");
  });

  it("counts empty heading warnings", () => {
    const d = doc([heading(1, "Title"), emptyHeading(2)]);
    const state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [atagDecorationsPlugin()],
    });

    const pluginState = atagDecorationsKey.getState(state);
    expect(pluginState!.warnings).toHaveLength(1);
    expect(pluginState!.warnings[0]!.type).toBe("empty-heading");
  });

  it("counts missing alt text warnings", () => {
    const d = doc([heading(1, "Title"), p("Text"), imageNoAlt()]);
    const state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [atagDecorationsPlugin()],
    });

    const pluginState = atagDecorationsKey.getState(state);
    const altWarnings = pluginState!.warnings.filter(
      (w) => w.type === "missing-alt",
    );
    expect(altWarnings).toHaveLength(1);
  });

  it("counts generic link text warnings", () => {
    const d = doc([
      heading(1, "Title"),
      p(linkedText("click here", "https://example.com")),
    ]);
    const state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [atagDecorationsPlugin()],
    });

    const pluginState = atagDecorationsKey.getState(state);
    const linkWarnings = pluginState!.warnings.filter(
      (w) => w.type === "generic-link-text",
    );
    expect(linkWarnings).toHaveLength(1);
  });

  it("counts multiple issue types in one document", () => {
    const d = doc([
      heading(1, "Title"),
      heading(3, "Skip"),
      emptyHeading(2),
      imageNoAlt(),
      p(linkedText("here", "https://example.com")),
    ]);
    const state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [atagDecorationsPlugin()],
    });

    const pluginState = atagDecorationsKey.getState(state);
    // heading-skip + empty-heading + missing-alt + generic-link
    expect(pluginState!.warnings.length).toBeGreaterThanOrEqual(4);
  });

  it("does not count images with alt text", () => {
    const d = doc([heading(1, "Title"), image("A descriptive alt")]);
    const state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [atagDecorationsPlugin()],
    });

    const pluginState = atagDecorationsKey.getState(state);
    const altWarnings = pluginState!.warnings.filter(
      (w) => w.type === "missing-alt",
    );
    expect(altWarnings).toHaveLength(0);
  });

  it("updates warnings on document change", () => {
    const d = doc([heading(1, "Title"), p("Clean")]);
    let state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [atagDecorationsPlugin()],
    });

    expect(atagDecorationsKey.getState(state)!.warnings).toHaveLength(0);

    // Insert an empty heading
    const emptyH2 = kbArticleSchema.nodes.heading!.createAndFill(
      { level: 2 },
      [],
    );
    if (emptyH2 === null) throw new Error("Failed to create heading node");

    const tr = state.tr.insert(state.doc.content.size, emptyH2);
    state = state.apply(tr);

    expect(atagDecorationsKey.getState(state)!.warnings.length).toBeGreaterThan(
      0,
    );
  });
});

// ---------------------------------------------------------------------------
// Toggle: active vs inactive
// ---------------------------------------------------------------------------

describe("atagDecorationsPlugin: toggle", () => {
  it("starts inactive with empty decorations", () => {
    const d = doc([heading(1, "Title"), heading(3, "Skipped")]);
    const state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [atagDecorationsPlugin()],
    });

    const pluginState = atagDecorationsKey.getState(state);
    expect(pluginState!.active).toBe(false);
    // Warnings are counted even when inactive
    expect(pluginState!.warnings.length).toBeGreaterThan(0);
  });

  it("activates decorations via setAtagActive meta", () => {
    const d = doc([heading(1, "Title"), heading(3, "Skipped")]);
    let state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [atagDecorationsPlugin()],
    });

    const tr = state.tr.setMeta(setAtagActive, true);
    state = state.apply(tr);

    const pluginState = atagDecorationsKey.getState(state);
    expect(pluginState!.active).toBe(true);
    expect(pluginState!.warnings.length).toBeGreaterThan(0);
  });

  it("deactivates decorations via setAtagActive meta", () => {
    const d = doc([heading(1, "Title"), heading(3, "Skipped")]);
    let state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [atagDecorationsPlugin()],
    });

    // Activate
    state = state.apply(state.tr.setMeta(setAtagActive, true));
    expect(atagDecorationsKey.getState(state)!.active).toBe(true);

    // Deactivate
    state = state.apply(state.tr.setMeta(setAtagActive, false));
    const pluginState = atagDecorationsKey.getState(state);
    expect(pluginState!.active).toBe(false);
    // Warnings remain even when inactive
    expect(pluginState!.warnings.length).toBeGreaterThan(0);
  });

  it("preserves active state across doc changes", () => {
    const d = doc([heading(1, "Title"), p("Clean")]);
    let state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [atagDecorationsPlugin()],
    });

    // Activate
    state = state.apply(state.tr.setMeta(setAtagActive, true));
    expect(atagDecorationsKey.getState(state)!.active).toBe(true);

    // Doc change (insert text)
    const textNode = kbArticleSchema.text("more content");
    state = state.apply(state.tr.insert(state.doc.content.size - 1, textNode));

    // Still active after doc change
    expect(atagDecorationsKey.getState(state)!.active).toBe(true);
  });

  it("returns same state object when no doc change and no meta", () => {
    const d = doc([heading(1, "Title"), p("Text")]);
    const state = EditorState.create({
      doc: d,
      schema: kbArticleSchema,
      plugins: [atagDecorationsPlugin()],
    });

    const before = atagDecorationsKey.getState(state);
    // Empty transaction (no doc change, no meta)
    const newState = state.apply(state.tr);
    const after = atagDecorationsKey.getState(newState);

    expect(after).toBe(before);
  });
});
