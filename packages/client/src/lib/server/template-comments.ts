/**
 * Remove the explanatory HTML comments in app.html from a rendered chunk.
 *
 * Only comments whose opener is followed by whitespace are removed. Svelte's
 * hydration markers (`<!--[-->`, `<!--]-->`, `<!---->`, `<!--[!-->`) have no
 * whitespace after the opener and are left intact; the client runtime
 * needs them to hydrate.
 */
const TEMPLATE_COMMENT_RE = /<!--\s[\s\S]*?-->/g;

export function stripTemplateComments(html: string): string {
  return html.replace(TEMPLATE_COMMENT_RE, "");
}
