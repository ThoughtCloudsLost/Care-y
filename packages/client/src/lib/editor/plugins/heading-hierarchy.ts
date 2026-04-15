/**
 * ProseMirror plugin for real-time heading hierarchy enforcement.
 *
 * Computes which heading levels are valid at the current cursor position
 * based on ATAG Part B rules: H2 requires an H1 above, H3 requires
 * an H2 above, and so on. The toolbar's heading dropdown reads this
 * plugin's state to gray out unavailable levels.
 *
 * This plugin is lightweight: it only recomputes the allowed-levels set
 * when the document changes or the selection moves. No DOM interaction.
 */

import { Plugin, PluginKey } from "prosemirror-state";
import type { Node as PMNode } from "prosemirror-model";

export interface HeadingHierarchyState {
  /** Set of heading levels that are valid at the current cursor position. */
  readonly allowedLevels: ReadonlySet<number>;
}

export const headingHierarchyKey = new PluginKey<HeadingHierarchyState>(
  "headingHierarchy",
);

/**
 * Compute which heading levels are valid at a given document position.
 *
 * Rules (ATAG Part B, design ref section 3):
 * - H1: always allowed
 * - H2: allowed if H1 exists anywhere before cursorPos
 * - H3: allowed if H2 exists before cursorPos
 * - H4: allowed if H3 exists before cursorPos
 *
 * "Before" means the heading's start position is < cursorPos.
 * We use doc.nodesBetween(0, cursorPos) to scan only the relevant range.
 */
export function computeAllowedLevels(
  doc: PMNode,
  cursorPos: number,
): ReadonlySet<number> {
  const allowed = new Set<number>([1]); // H1 always allowed

  // Track which levels exist above the cursor
  const seen = new Set<number>();

  // Clamp cursorPos to doc content size (avoids out-of-bounds on empty docs)
  const scanEnd = Math.min(cursorPos, doc.content.size);

  if (scanEnd > 0) {
    doc.nodesBetween(0, scanEnd, (node) => {
      if (node.type.name === "heading") {
        const rawLevel: unknown = node.attrs.level;
        if (typeof rawLevel === "number") seen.add(rawLevel);
      }
      return true; // continue traversal into child nodes
    });
  }

  // Level N+1 is allowed if level N was seen above the cursor
  for (let level = 1; level < 4; level++) {
    if (seen.has(level)) allowed.add(level + 1);
  }

  return allowed;
}

export function headingHierarchyPlugin(): Plugin<HeadingHierarchyState> {
  return new Plugin<HeadingHierarchyState>({
    key: headingHierarchyKey,
    state: {
      init(_, state): HeadingHierarchyState {
        return {
          allowedLevels: computeAllowedLevels(
            state.doc,
            state.selection.$from.pos,
          ),
        };
      },
      apply(tr, value, _oldState, newState): HeadingHierarchyState {
        // Only recompute when the doc or selection changed
        if (!tr.docChanged && !tr.selectionSet) return value;
        return {
          allowedLevels: computeAllowedLevels(
            newState.doc,
            newState.selection.$from.pos,
          ),
        };
      },
    },
  });
}
