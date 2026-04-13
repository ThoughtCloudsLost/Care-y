import uFuzzy from "@leeoniya/ufuzzy";
import { normalizeForSearch } from "./normalize.js";

// Single shared instance. intraMode: 1 allows character insertions
// within terms for typo tolerance. interSplit configures word splitting.
const uf = new uFuzzy({
  intraMode: 1,
  intraIns: 1, // Allow 1 inserted char per term (typo tolerance)
  intraSub: 1, // Allow 1 substituted char per term
  intraTrn: 1, // Allow 1 transposition per term
  intraDel: 1, // Allow 1 deleted char per term
});

export interface FuzzyMatch {
  /** Index into the original haystack array. */
  readonly index: number;
  /** Match quality score (lower is better). */
  readonly score: number;
}

/**
 * Fuzzy search a query against a list of strings.
 * Strings are accent-folded before matching.
 * Returns matched indices sorted by match quality (best first).
 */
export function fuzzySearch(
  haystack: readonly string[],
  query: string,
): readonly FuzzyMatch[] {
  // Pre-normalize the haystack and query for accent-insensitive matching.
  const normalizedHaystack = haystack.map(normalizeForSearch);
  const normalizedQuery = normalizeForSearch(query);

  // uFuzzy three-step pipeline: filter -> info -> sort.
  const idxs = uf.filter(normalizedHaystack, normalizedQuery);
  if (!idxs || idxs.length === 0) return [];

  const info = uf.info(idxs, normalizedHaystack, normalizedQuery);
  const order = uf.sort(info, normalizedHaystack, normalizedQuery);

  // order[i] is an index into idxs (the filtered haystack indices).
  // idxs[order[i]] is the original haystack index, sorted by match quality.
  const results: FuzzyMatch[] = [];
  for (let rank = 0; rank < order.length; rank++) {
    const filterIdx = order[rank]; // eslint-disable-line security/detect-object-injection -- rank is a bounded loop counter
    if (filterIdx === undefined) continue;
    const haystackIdx = idxs[filterIdx]; // eslint-disable-line security/detect-object-injection -- filterIdx validated by undefined check above
    if (haystackIdx === undefined) continue;
    results.push({ index: haystackIdx, score: rank });
  }
  return results;
}
