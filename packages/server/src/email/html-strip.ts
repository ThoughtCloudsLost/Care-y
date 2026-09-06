/**
 * Minimal HTML tag strip for HTML-only inbound mail.
 *
 * Storage fallback only, never a renderer: real mailers send
 * multipart/alternative with a text part, so this path is rare. The
 * output is stored as the plain-text body of an encrypted follow-up
 * and rendered via text interpolation on the client. Fidelity loss is
 * accepted in v1 (inbound email design, section 8).
 *
 * All regexes are linear (no nested quantifiers) to stay clear of
 * ReDoS territory flagged by eslint-plugin-security.
 */

/** Named entities this fallback decodes. Anything else is left verbatim. */
const ENTITIES: Readonly<Record<string, string>> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

/**
 * Strips HTML tags from a string, preserving rough block structure as
 * newlines. Script and style element contents are removed entirely.
 */
export function htmlStrip(html: string): string {
  let out = html;

  // Drop script/style blocks including their contents. The [\s\S]*?
  // lazy match is linear over the input.
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
  out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "");

  // Convert structural breaks to newlines before stripping tags.
  out = out.replace(/<br\s*\/?>/gi, "\n");
  out = out.replace(/<\/(p|div|tr|li|h[1-6]|blockquote)\s*>/gi, "\n");

  // Strip all remaining tags.
  out = out.replace(/<[^>]*>/g, "");

  // Decode the small entity set.
  out = out.replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);

  // Collapse runs of blank lines and trim.
  out = out.replace(/[ \t]+\n/g, "\n");
  out = out.replace(/\n{3,}/g, "\n\n");

  return out.trim();
}
