const CHARS = "abcdefghjkmnpqrstuvwxyz23456789";

/**
 * Generates a random login identifier in the format `vol-XXXXXX`.
 * Excludes ambiguous characters (i, l, o, 0, 1) for readability.
 */
export function generateRandomIdentifier(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const id = Array.from(bytes, (b) => CHARS[b % CHARS.length]).join("");
  return `vol-${id}`;
}
