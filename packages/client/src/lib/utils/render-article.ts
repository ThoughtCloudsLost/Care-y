import DOMPurify, { type Config } from "dompurify";

/**
 * Sanitization config for rendered article HTML.
 * Allowlist-based: only safe elements and attributes pass through.
 * No script, style, form, or event handler attributes.
 *
 * This allowlist is speculative for the plain-text renderer. The editor
 * phase will rewrite it to match the actual ProseMirror schema output.
 */
const PURIFY_CONFIG: Config = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "del",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
    "pre",
    "code",
    "img",
    "figure",
    "figcaption",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "hr",
    "sup",
    "sub",
  ],
  ALLOWED_ATTR: [
    "href",
    "title",
    "alt",
    "src",
    "width",
    "height",
    "target",
    "rel",
    "class",
    "colspan",
    "rowspan",
    "scope",
  ],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ["target"],
  FORCE_BODY: true,
};

// Force all sanitized links to open in a new tab with noopener.
// Registered once at module load (ES modules are singletons).
DOMPurify.addHook("afterSanitizeAttributes", (currentNode) => {
  if (currentNode.tagName === "A" && currentNode.hasAttribute("href")) {
    currentNode.setAttribute("target", "_blank");
    currentNode.setAttribute("rel", "noopener noreferrer");
  }
});

/**
 * Render article body bytes to sanitized HTML string.
 *
 * Current implementation: treats decrypted bytes as UTF-8 plain text,
 * converts double-newline-separated blocks to paragraph tags, and sanitizes.
 *
 * The editor phase replaces this with a ProseMirror JSON renderer that
 * uses DOMSerializer.fromSchema() + DOMPurify. The PURIFY_CONFIG allowlist
 * will be rewritten to match the actual schema output.
 */
export function renderArticleBody(decryptedBytes: Uint8Array): string {
  const text = new TextDecoder().decode(decryptedBytes);

  const paragraphs = text
    .split(/\n{2,}/)
    .filter((p) => p.trim().length > 0)
    .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
    .join("");

  return DOMPurify.sanitize(paragraphs, PURIFY_CONFIG);
}

/**
 * Sanitize arbitrary HTML through DOMPurify.
 * Used by the future format-aware renderer (06f.2) after converting
 * editor JSON to HTML.
 */
export function sanitizeArticleHtml(html: string): string {
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

/** Escape HTML special characters in plain text. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
