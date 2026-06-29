/**
 * Document-level ATAG Part B accessibility analysis.
 *
 * Walks the ProseMirror document tree (not DOM) and returns an array
 * of warnings for heading hierarchy violations, missing alt text,
 * generic link text, and empty headings.
 *
 * Called on explicit preview toggle or before publish, not every
 * keystroke. The heading hierarchy plugin handles per-transaction
 * enforcement separately.
 */

import type { Node as PMNode } from "prosemirror-model";

export interface AtagWarning {
  readonly type:
    "heading-skip" | "missing-alt" | "generic-link-text" | "empty-heading";
  readonly message: string;
  /** Document position for "Fix now" scroll-to. */
  readonly pos: number;
}

const GENERIC_LINK_PATTERNS =
  /^(click here|here|read more|more|link|this|go|learn more)$/i;

export function isGenericLinkText(text: string): boolean {
  return GENERIC_LINK_PATTERNS.test(text.trim());
}

/**
 * Walk a ProseMirror document and return accessibility warnings.
 *
 * Checks:
 * - Heading skip: H3 after H1 (skipped H2)
 * - Empty heading: heading with no visible text content
 * - Missing alt: image node with empty or undefined alt attribute
 * - Generic link text: link mark on text matching common meaningless phrases
 */
export function checkDocument(doc: PMNode): readonly AtagWarning[] {
  const warnings: AtagWarning[] = [];
  let lastHeadingLevel = 0;

  doc.descendants((node, pos) => {
    // Heading hierarchy: no skipped levels
    if (node.type.name === "heading") {
      const rawLevel: unknown = node.attrs.level;
      const level = typeof rawLevel === "number" ? rawLevel : 0;
      if (level > lastHeadingLevel + 1 && lastHeadingLevel > 0) {
        warnings.push({
          type: "heading-skip",
          message: `Heading level skipped: H${String(level)} after H${String(lastHeadingLevel)}`,
          pos,
        });
      }
      lastHeadingLevel = level;

      // Empty heading check
      if (node.textContent.trim() === "") {
        warnings.push({ type: "empty-heading", message: "Empty heading", pos });
      }
    }

    // Image alt text
    if (node.type.name === "image" || node.type.name === "figure_image") {
      const rawAlt: unknown = node.attrs.alt;
      const alt = typeof rawAlt === "string" ? rawAlt : "";
      if (alt === "") {
        warnings.push({
          type: "missing-alt",
          message: "Image has no alt text",
          pos,
        });
      }
    }

    // Link text quality (check inline text nodes with link marks)
    if (node.isText && node.marks.length > 0) {
      for (const mark of node.marks) {
        if (mark.type.name === "link" && isGenericLinkText(node.textContent)) {
          warnings.push({
            type: "generic-link-text",
            message: `Generic link text: "${node.textContent.trim()}"`,
            pos,
          });
        }
      }
    }
  });

  return warnings;
}
