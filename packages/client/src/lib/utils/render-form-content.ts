/**
 * Render a single LocalizedRichText locale value (string or ProseMirror
 * doc JSON) to sanitized HTML suitable for {@html} injection.
 *
 * - Plain strings: HTML-escaped and wrapped in <p> tags.
 * - ProseMirror doc JSON: deserialized, serialized through DOMSerializer,
 *   then sanitized through DOMPurify with the shared PURIFY_CONFIG.
 *
 * All {@html} usage in form previews MUST go through this function.
 * The sanitizer allowlist matches the schema's toDOM output exactly.
 */

import { Node as PMNode } from "prosemirror-model";
import { editorSchema } from "$lib/editor/prosemirror-schema.js";
import {
  renderProseMirrorDoc,
  sanitizeArticleHtml,
} from "$lib/utils/render-article.js";
import type { ProseMirrorDocJSON } from "@care-y/shared";

/**
 * Render a rich-text value (string or ProseMirror doc JSON) to sanitized HTML.
 *
 * - String input: HTML-escaped, line breaks converted to paragraphs,
 *   sanitized through DOMPurify.
 * - Doc JSON input: deserialized through editorSchema, rendered via
 *   DOMSerializer, sanitized through DOMPurify.
 *
 * Returns empty string for undefined/null input.
 */
export function renderFormRichText(
  value: string | ProseMirrorDocJSON | undefined,
): string {
  if (value === undefined) return "";

  if (typeof value === "string") {
    if (value.trim().length === 0) return "";
    return sanitizeLegacyPlainText(value);
  }

  // ProseMirror doc JSON
  try {
    const doc = PMNode.fromJSON(editorSchema, value);
    return renderProseMirrorDoc(doc, editorSchema);
  } catch {
    // Invalid doc JSON: treat as empty
    return "";
  }
}

/** Escape HTML special characters in plain text. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Wrap legacy plain text in paragraphs, escaping HTML. */
function sanitizeLegacyPlainText(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .filter((p) => p.trim().length > 0)
    .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
    .join("");
  return sanitizeArticleHtml(paragraphs);
}
