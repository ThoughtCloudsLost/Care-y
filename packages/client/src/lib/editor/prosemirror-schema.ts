import {
  Schema,
  type DOMOutputSpec,
  type NodeSpec,
  type MarkSpec,
} from "prosemirror-model";
import type { Plugin } from "prosemirror-state";
import { history, undo, redo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import {
  splitListItem,
  liftListItem,
  sinkListItem,
} from "prosemirror-schema-list";
import { headingHierarchyPlugin } from "./plugins/heading-hierarchy.js";
import { linkTextLintPlugin } from "./plugins/link-text-lint.js";
import { atagDecorationsPlugin } from "./plugins/atag-decorations.js";

// ---------------------------------------------------------------------------
// Shared helpers (used by image, figure_image, table_cell, table_header)
// ---------------------------------------------------------------------------

interface ImageAttrs {
  src: string;
  alt: string;
  title: string | null;
}

/** Type guard: ProseMirror getAttrs receives string | HTMLElement. */
function asElement(dom: unknown): HTMLElement {
  if (dom instanceof HTMLElement) return dom;
  throw new TypeError("Expected HTMLElement in parseDOM getAttrs");
}

/** Safely read a numeric attr, falling back to a default. */
function numAttr(value: unknown, fallback: number): number {
  return typeof value === "number" ? value : fallback;
}

function parseImageAttrs(dom: unknown): ImageAttrs {
  const el = asElement(dom);
  return {
    src: el.getAttribute("src") ?? "",
    alt: el.getAttribute("alt") ?? "",
    title: el.getAttribute("title"),
  };
}

function imageToDOM(attrs: Record<string, unknown>): DOMOutputSpec {
  const src = typeof attrs.src === "string" ? attrs.src : "";
  const alt = typeof attrs.alt === "string" ? attrs.alt : "";
  const title = typeof attrs.title === "string" ? attrs.title : null;
  const out: Record<string, string> = { src, alt };
  if (title !== null) out.title = title;
  return ["img", out];
}

/** Factory for table_cell and table_header (identical except tag and tableRole). */
function tableCellSpec(
  tag: "td" | "th",
  tableRole: "cell" | "header_cell",
): NodeSpec {
  return {
    content: "block+",
    attrs: {
      colspan: { default: 1, validate: "number" },
      rowspan: { default: 1, validate: "number" },
    },
    tableRole,
    isolating: true,
    parseDOM: [
      {
        tag,
        getAttrs: (dom) => {
          const el = asElement(dom);
          return {
            colspan: +(el.getAttribute("colspan") ?? 1) || 1,
            rowspan: +(el.getAttribute("rowspan") ?? 1) || 1,
          };
        },
      },
    ],
    toDOM(node): DOMOutputSpec {
      const colspan = numAttr(node.attrs.colspan, 1);
      const rowspan = numAttr(node.attrs.rowspan, 1);
      const attrs: Record<string, string> = {};
      if (colspan > 1) attrs.colspan = String(colspan);
      if (rowspan > 1) attrs.rowspan = String(rowspan);
      return [tag, attrs, 0];
    },
  };
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const nodes: Record<string, NodeSpec> = {
  doc: { content: "block+" },
  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "p" }],
    toDOM() {
      return ["p", 0];
    },
  },
  heading: {
    attrs: { level: { default: 1, validate: "number" } },
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [
      { tag: "h1", attrs: { level: 1 } },
      { tag: "h2", attrs: { level: 2 } },
      { tag: "h3", attrs: { level: 3 } },
      { tag: "h4", attrs: { level: 4 } },
    ],
    toDOM(node) {
      const level = numAttr(node.attrs.level, 1);
      return [`h${String(level)}`, 0];
    },
  },
  blockquote: {
    content: "block+",
    group: "block",
    defining: true,
    parseDOM: [{ tag: "blockquote" }],
    toDOM() {
      return ["blockquote", 0];
    },
  },
  bullet_list: {
    content: "list_item+",
    group: "block",
    parseDOM: [{ tag: "ul" }],
    toDOM() {
      return ["ul", 0];
    },
  },
  ordered_list: {
    attrs: { order: { default: 1, validate: "number" } },
    content: "list_item+",
    group: "block",
    parseDOM: [
      {
        tag: "ol",
        getAttrs: (dom) => {
          const el = asElement(dom);
          return {
            order: el.hasAttribute("start")
              ? +(el.getAttribute("start") ?? 1)
              : 1,
          };
        },
      },
    ],
    toDOM(node) {
      return node.attrs.order === 1
        ? ["ol", {}, 0]
        : ["ol", { start: String(node.attrs.order) }, 0];
    },
  },
  list_item: {
    content: "paragraph block*",
    parseDOM: [{ tag: "li" }],
    toDOM() {
      return ["li", 0];
    },
  },
  code_block: {
    content: "text*",
    marks: "",
    group: "block",
    code: true,
    defining: true,
    parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
    toDOM() {
      return ["pre", ["code", 0]];
    },
  },
  image: {
    inline: true,
    attrs: {
      src: { validate: "string" },
      alt: { default: "", validate: "string" },
      title: { default: null, validate: "string|null" },
    },
    group: "inline",
    draggable: true,
    parseDOM: [
      {
        tag: "img[src]",
        getAttrs: (dom) => parseImageAttrs(dom),
      },
    ],
    toDOM(node) {
      return imageToDOM(node.attrs);
    },
  },
  horizontal_rule: {
    group: "block",
    parseDOM: [{ tag: "hr" }],
    toDOM() {
      return ["hr"];
    },
  },
  // Block-level image node used only inside figure elements.
  // Separate from the inline `image` node so that figure content
  // doesn't mix inline and block content (which ProseMirror forbids).
  // parseDOM context restricts matching to figure parents only.
  figure_image: {
    attrs: {
      // default "" satisfies ProseMirror's generatable constraint;
      // in practice, figures are always created with a real src.
      src: { default: "", validate: "string" },
      alt: { default: "", validate: "string" },
      title: { default: null, validate: "string|null" },
    },
    draggable: true,
    parseDOM: [
      {
        tag: "img[src]",
        context: "figure/",
        getAttrs: (dom) => parseImageAttrs(dom),
      },
    ],
    toDOM(node) {
      return imageToDOM(node.attrs);
    },
  },
  figure: {
    content: "figure_image figcaption",
    group: "block",
    parseDOM: [{ tag: "figure" }],
    toDOM() {
      return ["figure", 0];
    },
  },
  figcaption: {
    content: "inline*",
    parseDOM: [{ tag: "figcaption" }],
    toDOM() {
      return ["figcaption", 0];
    },
  },
  table: {
    content: "table_row+",
    group: "block",
    tableRole: "table",
    isolating: true,
    parseDOM: [{ tag: "table" }],
    toDOM() {
      return ["table", ["tbody", 0]];
    },
  },
  table_row: {
    content: "(table_cell | table_header)*",
    tableRole: "row",
    parseDOM: [{ tag: "tr" }],
    toDOM() {
      return ["tr", 0];
    },
  },
  table_cell: tableCellSpec("td", "cell"),
  table_header: tableCellSpec("th", "header_cell"),
  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{ tag: "br" }],
    toDOM() {
      return ["br"];
    },
  },
  text: { group: "inline" },
};

const marks: Record<string, MarkSpec> = {
  strong: {
    parseDOM: [
      { tag: "strong" },
      {
        tag: "b",
        getAttrs: (node) =>
          asElement(node).style.fontWeight !== "normal" && null,
      },
      { style: "font-weight=bold" },
      { style: "font-weight=700" },
    ],
    toDOM() {
      return ["strong", 0];
    },
  },
  em: {
    parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
    toDOM() {
      return ["em", 0];
    },
  },
  code: {
    parseDOM: [{ tag: "code" }],
    toDOM() {
      return ["code", 0];
    },
  },
  strikethrough: {
    parseDOM: [
      { tag: "s" },
      { tag: "del" },
      { style: "text-decoration=line-through" },
    ],
    toDOM() {
      return ["s", 0];
    },
  },
  // `rel` is applied at serialization time via toDOM, not stored in
  // the document JSON. Consumers that bypass DOMSerializer won't see
  // it, which is intentional: security attrs belong to the render
  // layer, not the data model.
  link: {
    attrs: {
      href: { validate: "string" },
      title: { default: null, validate: "string|null" },
    },
    inclusive: false,
    parseDOM: [
      {
        tag: "a[href]",
        getAttrs: (dom) => {
          const el = asElement(dom);
          return {
            href: el.getAttribute("href"),
            title: el.getAttribute("title"),
          };
        },
      },
    ],
    toDOM(node) {
      const href = typeof node.attrs.href === "string" ? node.attrs.href : "";
      const title =
        typeof node.attrs.title === "string" ? node.attrs.title : null;
      const attrs: Record<string, string> = {
        href,
        target: "_blank",
        rel: "noopener noreferrer",
      };
      if (title !== null) attrs.title = title;
      return ["a", attrs, 0];
    },
  },
};

export const editorSchema = new Schema({ nodes, marks });

/**
 * Base editor plugins: undo/redo keybindings, standard keymap, and history.
 * Custom keybindings precede baseKeymap (first-match-wins in ProseMirror).
 * History comes after keymaps (it records transactions, not keystrokes).
 */
export const baseEditorPlugins: readonly Plugin[] = [
  keymap({
    "Mod-z": undo,
    "Mod-Shift-z": redo,
    "Mod-y": redo,
  }),
  keymap(baseKeymap),
  history(),
];

// ---------------------------------------------------------------------------
// Full editor plugin composition (shared by ArticleEditor + FormContentEditor)
// ---------------------------------------------------------------------------

/**
 * Build the complete plugin array for a ProseMirror editor that uses
 * editorSchema. Combines base plugins (undo/redo, baseKeymap, history),
 * list keybindings (Enter splits, Tab/Shift-Tab indents/outdents), and
 * the ATAG accessibility plugins (heading hierarchy, link text lint,
 * decoration overlay).
 *
 * Both ArticleEditor and FormContentEditor call this so plugin
 * composition cannot drift between them.
 */
export function composeEditorPlugins(): readonly Plugin[] {
  const listItemType = editorSchema.nodes.list_item;

  const listKeybindings: Record<
    string,
    ReturnType<typeof splitListItem>
  > = listItemType !== undefined
    ? {
        Enter: splitListItem(listItemType),
        Tab: sinkListItem(listItemType),
        "Shift-Tab": liftListItem(listItemType),
      }
    : {};

  return [
    keymap(listKeybindings),
    ...baseEditorPlugins,
    headingHierarchyPlugin(),
    linkTextLintPlugin(),
    atagDecorationsPlugin(),
  ];
}

// ---------------------------------------------------------------------------
// Deprecated aliases (use editorSchema / baseEditorPlugins instead)
// ---------------------------------------------------------------------------

/** @deprecated Use `editorSchema` instead. */
export const kbArticleSchema = editorSchema;

/** @deprecated Use `baseEditorPlugins` instead. */
export const kbEditorPlugins = baseEditorPlugins;
