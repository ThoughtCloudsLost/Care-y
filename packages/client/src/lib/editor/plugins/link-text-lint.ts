/**
 * ProseMirror plugin that visually highlights generic link text.
 *
 * Uses DecorationSet to add a CSS class to text nodes that have a link
 * mark and match common meaningless phrases ("click here", "here",
 * "read more", etc.). The decoration is purely visual (yellow underline
 * via --brand-accent), non-blocking, and updates on doc changes.
 *
 * Separate from checkDocument() which runs on-demand. This plugin
 * gives real-time visual feedback as the author types.
 */

import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import type { Node as PMNode } from "prosemirror-model";
import { isGenericLinkText } from "../atag-checks.js";

export interface LinkTextLintState {
  readonly decorations: DecorationSet;
  readonly count: number;
}

export const linkTextLintKey = new PluginKey<LinkTextLintState>("linkTextLint");

/**
 * Scan the document for link marks with generic text and build
 * a DecorationSet highlighting each one.
 */
export function buildLinkDecorations(doc: PMNode): LinkTextLintState {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (!node.isText || node.marks.length === 0) return;

    for (const mark of node.marks) {
      if (mark.type.name === "link" && isGenericLinkText(node.textContent)) {
        decorations.push(
          Decoration.inline(pos, pos + node.nodeSize, {
            class: "atag-generic-link",
            title: `"${node.textContent.trim()}" is not descriptive for screen reader users`,
          }),
        );
      }
    }
  });

  return {
    decorations: DecorationSet.create(doc, decorations),
    count: decorations.length,
  };
}

export function linkTextLintPlugin(): Plugin<LinkTextLintState> {
  return new Plugin<LinkTextLintState>({
    key: linkTextLintKey,
    state: {
      init(_, state): LinkTextLintState {
        return buildLinkDecorations(state.doc);
      },
      apply(tr, value, _oldState, newState): LinkTextLintState {
        // Only rebuild decorations when the document changed.
        // Selection-only changes don't affect link text.
        if (!tr.docChanged) return value;
        return buildLinkDecorations(newState.doc);
      },
    },
    props: {
      decorations(state): DecorationSet {
        const pluginState = linkTextLintKey.getState(state);
        return pluginState?.decorations ?? DecorationSet.empty;
      },
    },
  });
}
