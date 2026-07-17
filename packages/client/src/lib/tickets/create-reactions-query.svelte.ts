import { createQuery } from "@tanstack/svelte-query";
import type { QueryClient } from "@tanstack/svelte-query";
import type { ReactionSummary } from "@care-y/shared";
import { SvelteMap } from "svelte/reactivity";
import { reactionKeys } from "$lib/query/keys.js";

/** Server input bound: tickets.getReactions accepts at most 100 ids. */
const CHUNK_SIZE = 100;

export interface ReactionsQueryConfig {
  /** Note ids to load reactions for; the query keys on the sorted set. */
  readonly getNoteIds: () => readonly string[];
  readonly fetchReactions: (
    followUpIds: string[],
    signal: AbortSignal,
  ) => Promise<Record<string, ReactionSummary[]>>;
}

export interface ReactionsQueryState {
  /** Reactions by follow-up id; ids with no reactions are absent. */
  readonly byId: ReadonlyMap<string, ReactionSummary[]>;
  reactionsFor(followUpId: string): ReactionSummary[];
}

/** Sorted copy so the query key is independent of collection order. */
export function sortedNoteIds(ids: readonly string[]): string[] {
  return [...ids].sort();
}

/**
 * Pages the ids under the server's 100-id input bound and merges the
 * per-chunk records. Ids with no reactions are dropped at merge time so
 * absence uniformly means "none". A failed chunk rejects the whole run
 * (TanStack retry and error state apply; no silent partial merges), and
 * an aborted signal stops between chunks (an aborted query's result is
 * discarded by TanStack, so the partial return is never observed).
 */
export async function fetchAllReactions(
  ids: readonly string[],
  fetchReactions: ReactionsQueryConfig["fetchReactions"],
  signal: AbortSignal,
): Promise<Record<string, ReactionSummary[]>> {
  const merged: Record<string, ReactionSummary[]> = {};
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    if (signal.aborted) break;
    const chunk = await fetchReactions(ids.slice(i, i + CHUNK_SIZE), signal);
    Object.assign(
      merged,
      Object.fromEntries(
        Object.entries(chunk).filter(([, summaries]) => summaries.length > 0),
      ),
    );
  }
  return merged;
}

/**
 * One query-cache home for note reaction summaries. Consumers hand in a
 * reactive id collection; the query keys on the sorted set, so surfaces
 * asking for the same notes share one cache entry, and an id-set change
 * cancels any stale multi-chunk run via the query's AbortSignal.
 */
export function createReactionsQuery(
  config: ReactionsQueryConfig,
): ReactionsQueryState {
  const sortedIds = $derived(sortedNoteIds(config.getNoteIds()));

  const query = createQuery(() => ({
    queryKey: reactionKeys.byIds(sortedIds),
    enabled: sortedIds.length > 0,
    queryFn: async ({ signal }): Promise<Record<string, ReactionSummary[]>> =>
      fetchAllReactions(sortedIds, config.fetchReactions, signal),
  }));

  const byId = $derived(new SvelteMap(Object.entries(query.data ?? {})));

  return {
    get byId(): ReadonlyMap<string, ReactionSummary[]> {
      return byId;
    },
    reactionsFor(followUpId: string): ReactionSummary[] {
      return byId.get(followUpId) ?? [];
    },
  };
}

/**
 * Toggle reconcile: writes the server-confirmed summaries for one
 * follow-up into every cached reactions record. Records whose id set
 * does not include this follow-up gain a never-read key; it renders
 * nowhere and the next refetch drops it. No extra server calls.
 */
export function writeReactionToCache(
  queryClient: QueryClient,
  followUpId: string,
  summaries: ReactionSummary[],
): void {
  queryClient.setQueriesData<Record<string, ReactionSummary[]>>(
    { queryKey: reactionKeys.all },
    (old) => (old ? { ...old, [followUpId]: summaries } : old),
  );
}
