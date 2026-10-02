/**
 * Short-lived in-memory cache of provider fund lists, keyed by connection.
 *
 * The provider is the system of record for donation totals; this only
 * spares it (and its rate limit) when several people open the funds page
 * at once. Nothing here is ever persisted. A webhook delivery invalidates
 * the connection's entry so the next read fetches fresh totals.
 */

import type { DonationConnectionId } from "@care-y/shared";
import type { ProviderFund } from "./provider.js";

export interface ProviderFundCacheOptions {
  readonly ttlMs: number;
  /** Clock in milliseconds; tests pass a fake. */
  readonly now?: () => number;
}

export interface ProviderFundCache {
  /**
   * The connection's funds: from the cache while younger than the TTL,
   * otherwise from `loader`. Concurrent callers on a cold entry share one
   * loader call. A failed load is not cached.
   */
  get(
    connectionId: DonationConnectionId,
    loader: () => Promise<readonly ProviderFund[]>,
  ): Promise<readonly ProviderFund[]>;
  /** Drop the connection's entry and any load still in flight. */
  invalidate(connectionId: DonationConnectionId): void;
}

interface CacheEntry {
  readonly fetchedAt: number;
  readonly funds: readonly ProviderFund[];
}

export function createProviderFundCache(
  options: ProviderFundCacheOptions,
): ProviderFundCache {
  const now = options.now ?? Date.now;
  const entries = new Map<DonationConnectionId, CacheEntry>();
  const inFlight = new Map<
    DonationConnectionId,
    Promise<readonly ProviderFund[]>
  >();
  // Bumped on every invalidation. A load started before the bump finishes
  // with data that predates whatever caused it, so it may answer its own
  // callers but must not be stored.
  const generations = new Map<DonationConnectionId, number>();

  function generationOf(connectionId: DonationConnectionId): number {
    return generations.get(connectionId) ?? 0;
  }

  return {
    async get(connectionId, loader): Promise<readonly ProviderFund[]> {
      const entry = entries.get(connectionId);
      if (entry !== undefined && now() - entry.fetchedAt < options.ttlMs) {
        return entry.funds;
      }

      const pending = inFlight.get(connectionId);
      if (pending !== undefined) return pending;

      const generation = generationOf(connectionId);
      const load = loader()
        .then((funds) => {
          if (generationOf(connectionId) === generation) {
            entries.set(connectionId, { fetchedAt: now(), funds });
          }
          return funds;
        })
        .finally(() => {
          if (generationOf(connectionId) === generation) {
            inFlight.delete(connectionId);
          }
        });
      inFlight.set(connectionId, load);
      return load;
    },

    invalidate(connectionId): void {
      generations.set(connectionId, generationOf(connectionId) + 1);
      entries.delete(connectionId);
      inFlight.delete(connectionId);
    },
  };
}
