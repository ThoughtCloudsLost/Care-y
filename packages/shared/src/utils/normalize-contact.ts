/**
 * Contact value normalization for merge-candidate detection.
 *
 * One shared normalizer per value type, following the normalize-alias.ts
 * single-normalizer precedent. Used by the browser-side Worker to
 * compare decrypted contact values across telephony and web-intake clients.
 *
 * Phone normalization produces a COMPARISON KEY, not a display value:
 * all non-digit characters are stripped and the key is the last 10
 * digits (the full digit string when shorter). Telephony numbers are
 * stored E.164 with a country code ("+12125551234"); web submitters
 * type national formats ("(212) 555-1234"). Suffix keying makes those
 * collide without hardcoding any country. Two numbers from different
 * countries sharing their last 10 digits would collide, which is
 * acceptable here: collisions only ever produce a merge SUGGESTION a
 * volunteer reviews, never an automatic merge.
 *
 * Email normalization trims whitespace and lowercases. No domain
 * canonicalization (gmail dot-stripping etc.) because false negatives
 * are acceptable and false positives are dangerous.
 */

/**
 * Normalizes a phone number to a comparison key: all non-digit
 * characters stripped, then the last 10 digits (or the full digit
 * string when shorter). Returns null if fewer than 7 digits remain
 * (too short to be meaningful). Never render this key; it is not a
 * valid phone number.
 */
export function normalizeContactPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7) return null;
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Normalizes an email address for comparison by trimming whitespace
 * and lowercasing. Returns null if the input is empty after trimming.
 */
export function normalizeContactEmail(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.length === 0) return null;
  return trimmed;
}

/**
 * Tests whether a string looks like a phone number (E.164 or common
 * national formats). Used as a fallback pattern matcher for untagged
 * free-text intake answers.
 */
export function looksLikePhone(value: string): boolean {
  // Matches: optional "+", then 7-15 digits with optional separators
  return /^\+?[\d\s()\-./]{7,20}$/.test(value.trim());
}

/**
 * Tests whether a string looks like an email address. Simple check
 * for the presence of "@" with text on both sides and a dot in the
 * domain part. Not a full RFC 5322 parser.
 */
export function looksLikeEmail(value: string): boolean {
  const trimmed = value.trim();
  // At least one char before @, at least one char and a dot after
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}
