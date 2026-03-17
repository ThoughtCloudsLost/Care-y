/**
 * Generic tier-based lookup for escalating thresholds.
 *
 * Used by PoW difficulty scaling and OPRF delay escalation.
 * Tiers are searched in descending order (highest minFailures first).
 */

export interface Tier<V> {
  readonly minFailures: number;
  readonly value: V;
}

/**
 * Find the first tier where the count meets the minimum threshold.
 * Tiers must be sorted descending by minFailures for correct behavior.
 *
 * @param tiers - Tier definitions sorted descending by minFailures
 * @param count - Current failure count to match against
 * @param defaultValue - Value to return if no tier matches
 * @returns The matched tier's value, or the default
 */
export function findTier<V>(
  tiers: readonly Tier<V>[],
  count: number,
  defaultValue: V,
): V {
  const matched = tiers.find((t) => count >= t.minFailures);
  return matched?.value ?? defaultValue;
}
