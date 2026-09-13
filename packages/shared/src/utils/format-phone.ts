/**
 * Formats an E.164 phone string into a human-readable display format.
 *
 * US numbers (+1AAABBBCCCC) become "+1 (AAA) BBB-CCCC". All other
 * country codes pass through unchanged. This mirrors the server-side
 * formatPhone in packages/server/src/utils/sql.ts but operates on a
 * plain string rather than a Buffer (the client decrypts to a string,
 * not a Buffer).
 */
export function formatPhoneDisplay(raw: string): string {
  if (raw.startsWith("+1") && raw.length === 12) {
    const area = raw.slice(2, 5);
    const prefix = raw.slice(5, 8);
    const line = raw.slice(8, 12);
    return `+1 (${area}) ${prefix}-${line}`;
  }
  return raw;
}
