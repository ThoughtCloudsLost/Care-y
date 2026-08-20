/**
 * Alias normalization for blind index hashing.
 *
 * Used by every alias write path (generated and operator-set) so the
 * blind index cannot drift between them. Normalization rules:
 *
 *   1. NFKC unicode normalization
 *   2. Case folding (toLowerCase)
 *   3. Leading/trailing whitespace removal (trim)
 *   4. Internal whitespace collapse (runs of whitespace become a single space)
 */

/**
 * Normalizes an alias string for blind index hashing.
 * Both the generated-alias path and the operator-set path must call this
 * before hashing so they produce identical hashes for equivalent inputs.
 */
export function normalizeAlias(raw: string): string {
  return raw.normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Normalizes a client-chosen username for blind index hashing.
 * Same steps as normalizeAlias (NFKC, casefold, trim, collapse whitespace)
 * so the account service and client login paths produce identical hashes
 * for equivalent inputs.
 */
export function normalizeUsername(raw: string): string {
  return normalizeAlias(raw);
}
