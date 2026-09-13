import DOMPurify, { type Config } from "dompurify";
import {
  DOMSerializer,
  Fragment,
  Node as PMNode,
  type Schema,
} from "prosemirror-model";
import { editorSchema } from "$lib/editor/prosemirror-schema.js";

export interface RenderArticleOptions {
  /** If provided, a first heading whose text matches (case-insensitive)
   *  is stripped from the output. Prevents duplication when the title
   *  is displayed separately above the body. */
  title?: string;
}

// ---------------------------------------------------------------------------
// Shared sanitizer configuration (exported for reuse by form renderers)
// ---------------------------------------------------------------------------

/**
 * Sanitization config for rendered ProseMirror HTML.
 * Allowlist derived from the schema's toDOM output.
 * Every tag and attribute here corresponds to a schema-defined
 * node or mark. No speculative extras.
 *
 * `target` and `rel` are produced by the link mark's toDOM (render-layer
 * security attrs, not stored in the document JSON). They're in ALLOWED_ATTR
 * so DOMPurify doesn't strip them from serialized output.
 */

/**
 * DOMPurify strips src/href attributes with unrecognized URI schemes
 * by default. `kb-attachment://` is the custom scheme for encrypted
 * blob references. `form-asset://` is the custom scheme for encrypted
 * form content images. Allow both alongside standard web protocols.
 * The detail page resolves these URIs post-render via fetch+decrypt.
 */
export const ALLOWED_URI_REGEXP =
  /^(?:(?:https?|blob|data|ftp|mailto|tel|kb-attachment|form-asset):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;

export const PURIFY_CONFIG: Config = {
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
  ALLOWED_URI_REGEXP,
  ALLOW_DATA_ATTR: false,
  FORCE_BODY: true,
};

// ---------------------------------------------------------------------------
// Generic ProseMirror doc renderer
// ---------------------------------------------------------------------------

/**
 * Serialize a ProseMirror document fragment through DOMSerializer and
 * sanitize the result with DOMPurify using the shared allowlist config.
 *
 * Callers provide the schema so the correct serializer is used for the
 * document's node/mark set.
 */
export function renderProseMirrorDoc(doc: PMNode, schema: Schema): string {
  const serializer = DOMSerializer.fromSchema(schema);
  const fragment = serializer.serializeFragment(doc.content);
  const div = document.createElement("div");
  div.appendChild(fragment);
  return DOMPurify.sanitize(div.innerHTML, PURIFY_CONFIG);
}

// ---------------------------------------------------------------------------
// Article-specific render pipeline
// ---------------------------------------------------------------------------

const decoder = new TextDecoder();

/**
 * Render article body bytes to sanitized HTML.
 * Expects ProseMirror JSON (UTF-8 encoded). Falls back to
 * plain-text paragraph wrapping for legacy pre-editor articles.
 */
export function renderArticleBody(
  decryptedBytes: Uint8Array,
  options?: RenderArticleOptions,
): string {
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
    doc = PMNode.fromJSON(editorSchema, json);
  } catch {
    // Invalid ProseMirror JSON: treat as plain text
    return sanitizeLegacyPlainText(text);
  }

  // Strip first heading if it duplicates the title shown above the body.
  let content = doc.content;
  if (options?.title !== undefined && content.childCount > 0) {
    const first = content.child(0);
    if (
      first.type.name === "heading" &&
      first.textContent.trim().toLowerCase() ===
        options.title.trim().toLowerCase()
    ) {
      const remaining: PMNode[] = [];
      for (let i = 1; i < content.childCount; i++) {
        remaining.push(content.child(i));
      }
      content = Fragment.from(remaining);
    }
  }

  // Use the generic renderer for the (possibly stripped) content.
  // Reconstruct a doc node wrapping the modified content so
  // renderProseMirrorDoc receives a full PMNode.
  const renderDoc = doc.copy(content);
  return renderProseMirrorDoc(renderDoc, editorSchema);
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
