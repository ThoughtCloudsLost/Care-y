/**
 * Validates a post-login redirect target from the `?next` query parameter.
 *
 * Only same-app relative paths are accepted. Rejects protocol-relative
 * URLs (`//host`, `/\host`) and paths containing C0 control characters
 * or DEL, which can cause header injection or log poisoning.
 */

const CONTROL_CHARS = /[\x00-\x1f\x7f]/;

export function isValidRedirectTarget(target: string): boolean {
  if (!target.startsWith("/")) return false;
  if (target.startsWith("//")) return false;
  if (target.startsWith("/\\")) return false;
  if (CONTROL_CHARS.test(target)) return false;
  return true;
}
