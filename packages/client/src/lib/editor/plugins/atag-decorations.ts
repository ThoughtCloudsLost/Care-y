/**
 * ProseMirror plugin that adds visual inline decorations for ATAG
 * accessibility issues (heading hierarchy violations, missing alt
 * text, empty headings).
 *
 * Two responsibilities:
 * 1. Always maintains a warnings array (for the toolbar badge count)
 * 2. Only renders decorations when toggled active (via transaction meta)
 *
 * Generic link text decorations are handled by the separate
 * linkTextLintPlugin. This plugin still includes those warnings in
 * the count so the badge reflects all issue types.
 *
 * Follows the same pattern as link-text-lint.ts.
 */

import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import type { Node as PMNode } from "prosemirror-model";
import { checkDocument, type AtagWarning } from "../atag-checks.js";

export interface AtagDecorationsState {
  /** All warnings (always populated, powers the badge count). */
  readonly warnings: readonly AtagWarning[];
  /** Decorations for non-link warnings (only populated when active). */
  readonly decorations: DecorationSet;
  /** Whether decorations are currently shown. */
  readonly active: boolean;
}

export const atagDecorationsKey = new PluginKey<AtagDecorationsState>(
  "atagDecorations",
);

/** Transaction meta key to toggle decoration visibility. */
export const setAtagActive = "setAtagActive";

/**
 * Create a widget DOM element for an issue annotation.
 * Block-level div rendered below the problem node.
 */
function createAnnotationWidget(message: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "atag-annotation";
  el.contentEditable = "false";
  el.textContent = message;
  return el;
}

/**
 * Build decorations from all warning types.
 *
 * Block-level issues (headings, images) get:
 * 1. A node decoration (dashed outline)
 * 2. A widget decoration (annotation label after the node)
 *
 * Inline issues (generic link text) get:
 * 1. An inline decoration (wavy underline on the text)
 * 2. A widget decoration (annotation label after the text)
 */
function buildDecorations(
  doc: PMNode,
  warnings: readonly AtagWarning[],
): DecorationSet {
  const decorations: Decoration[] = [];

  for (const w of warnings) {
    const clampedPos = Math.min(w.pos, doc.content.size);
    const node = clampedPos < doc.content.size ? doc.nodeAt(clampedPos) : null;
    if (node === null) continue;

    if (w.type === "generic-link-text") {
      // Inline decoration (wavy underline on the link text)
      decorations.push(
        Decoration.inline(w.pos, w.pos + node.nodeSize, {
          class: "atag-issue-link",
        }),
      );

      // Block annotation widget after the parent paragraph
      const resolved = doc.resolve(clampedPos);
      const parentEnd = resolved.end(resolved.depth) + 1;
      decorations.push(
        Decoration.widget(parentEnd, () => createAnnotationWidget(w.message), {
          side: -1,
          ignoreSelection: true,
        }),
      );
      continue;
    }

    const cssClass =
      w.type === "missing-alt" ? "atag-issue-image" : "atag-issue-heading";

    // Outline decoration on the node itself
    decorations.push(
      Decoration.node(w.pos, w.pos + node.nodeSize, {
        class: cssClass,
      }),
    );

    // Block annotation widget placed after the node
    decorations.push(
      Decoration.widget(
        w.pos + node.nodeSize,
        () => createAnnotationWidget(w.message),
        { side: -1, ignoreSelection: true },
      ),
    );
  }

  return DecorationSet.create(doc, decorations);
}

function computeState(doc: PMNode, active: boolean): AtagDecorationsState {
  const warnings = checkDocument(doc);
  return {
    warnings,
    decorations: active ? buildDecorations(doc, warnings) : DecorationSet.empty,
    active,
  };
}

export function atagDecorationsPlugin(): Plugin<AtagDecorationsState> {
  return new Plugin<AtagDecorationsState>({
    key: atagDecorationsKey,
    state: {
      init(_, state): AtagDecorationsState {
        return computeState(state.doc, false);
      },
      apply(tr, value, _oldState, newState): AtagDecorationsState {
        // Check for toggle meta
        const toggleMeta: unknown = tr.getMeta(setAtagActive);
        if (typeof toggleMeta === "boolean") {
          return computeState(newState.doc, toggleMeta);
        }

        // Always recompute warnings on doc change (for live badge count).
        // Only rebuild decorations when active.
        if (tr.docChanged) {
          return computeState(newState.doc, value.active);
        }

        return value;
      },
    },
    props: {
      decorations(state): DecorationSet {
        const pluginState = atagDecorationsKey.getState(state);
        return pluginState?.decorations ?? DecorationSet.empty;
      },
    },
  });
}
