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

const FORM_ASSET_SCHEME = "form-asset://";

/**
 * Rewrite `form-asset://{blobId}` image src attributes in sanitized HTML
 * to the public serving endpoint `/api/forms/{orgSlug}/{blobId}`.
 *
 * Operates on already-sanitized HTML. Only touches img src attributes
 * whose value starts with the `form-asset://` scheme. All other src
 * values (https, data, blob, etc.) pass through unchanged.
 *
 * This is a pure function: no DOM access, no side effects.
 */
export function rewriteFormAssetUrls(html: string, orgSlug: string): string {
  if (html.length === 0 || !html.includes(FORM_ASSET_SCHEME)) return html;

  // The sanitized HTML contains img tags with src="form-asset://blobId".
  // Blob ids are UUIDs; anything outside that charset stays unrewritten so
  // a malformed reference can never become a path-traversing URL.
  return html.replace(
    /(<img\b[^>]*\bsrc=")form-asset:\/\/([A-Za-z0-9-]+)(")/g,
    (_match: string, prefix: string, blobId: string, suffix: string) =>
      `${prefix}/api/forms/${orgSlug}/${blobId}${suffix}`,
  );
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
