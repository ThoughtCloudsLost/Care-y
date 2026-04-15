import DOMPurify, { type Config } from "dompurify";
import { DOMSerializer, Node as PMNode } from "prosemirror-model";
import { kbArticleSchema } from "$lib/editor/prosemirror-schema.js";

/**
 * Sanitization config for rendered article HTML.
 * Allowlist derived from the ProseMirror schema's toDOM output.
 * Every tag and attribute here corresponds to a schema-defined
 * node or mark. No speculative extras.
 *
 * `target` and `rel` are produced by the link mark's toDOM (render-layer
 * security attrs, not stored in the document JSON). They're in ALLOWED_ATTR
 * so DOMPurify doesn't strip them from serialized output.
 */
const PURIFY_CONFIG: Config = {
  ALLOWED_TAGS: [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "ul",
    "ol",
    "li",
    "pre",
    "code",
    "img",
    "hr",
    "figure",
    "figcaption",
    "table",
    "tbody",
    "tr",
    "td",
    "th",
    "br",
    "strong",
    "em",
    "s",
    "a",
  ],
  ALLOWED_ATTR: [
    "href",
    "title",
    "alt",
    "src",
    "target",
    "rel",
    "colspan",
    "rowspan",
    "start",
  ],
  ALLOW_DATA_ATTR: false,
  FORCE_BODY: true,
};

const serializer = DOMSerializer.fromSchema(kbArticleSchema);
const decoder = new TextDecoder();

/**
 * Render article body bytes to sanitized HTML.
 * Expects ProseMirror JSON (UTF-8 encoded). Falls back to
 * plain-text paragraph wrapping for legacy pre-editor articles.
 */
export function renderArticleBody(decryptedBytes: Uint8Array): string {
  const text = decoder.decode(decryptedBytes);
  if (text.length === 0) return "";

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    // Legacy plain-text article (pre-06f.2): wrap in paragraphs
    return sanitizeLegacyPlainText(text);
  }

  let doc: PMNode;
  try {
    doc = PMNode.fromJSON(kbArticleSchema, json);
  } catch {
    // Invalid ProseMirror JSON: treat as plain text
    return sanitizeLegacyPlainText(text);
  }

  const fragment = serializer.serializeFragment(doc.content);
  const div = document.createElement("div");
  div.appendChild(fragment);
  return sanitizeArticleHtml(div.innerHTML);
}

/**
 * Sanitize HTML through DOMPurify using the schema-derived allowlist.
 */
export function sanitizeArticleHtml(html: string): string {
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

/**
 * Extract a plain-text excerpt from a ProseMirror document.
 * Walks the doc tree, concatenates text content, skips images
 * and other non-text nodes. Truncates to maxLength with ellipsis.
 */
export function extractExcerpt(doc: PMNode, maxLength = 150): string {
  const parts: string[] = [];
  let length = 0;

  doc.descendants((node) => {
    if (length >= maxLength) return false;
    if (node.isText && node.text !== undefined) {
      parts.push(node.text);
      length += node.text.length;
    } else if (
      node.isBlock &&
      parts.length > 0 &&
      parts[parts.length - 1] !== " "
    ) {
      parts.push(" ");
      length += 1;
    }
  });

  const full = parts.join("").trim();
  if (full.length <= maxLength) return full;
  return full.slice(0, maxLength).trimEnd() + "...";
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

/** Escape HTML special characters in plain text. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
