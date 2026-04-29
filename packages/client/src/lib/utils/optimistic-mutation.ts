import type { QueryClient, QueryKey } from "@tanstack/svelte-query";

export interface OptimisticMutationOpts<TData> {
  readonly queryClient: QueryClient;
  readonly queryKey: QueryKey;
  readonly update: (old: TData) => TData;
  readonly mutate: () => Promise<unknown>;
  readonly onSuccess?: () => void;
  readonly onError?: (err: unknown) => void;
}

/**
 * Snapshot-mutate-rollback helper for optimistic TanStack Query updates.
 *
 * Snapshots the current cache value, applies the optimistic update via
 * setQueryData, then awaits the mutation. On error, the cache is rolled
 * back to the snapshot.
 */
export async function optimisticMutation<TData>(
  opts: OptimisticMutationOpts<TData>,
): Promise<void> {
  const { queryClient, queryKey, update, mutate, onSuccess, onError } = opts;

  const previous = queryClient.getQueryData<TData>(queryKey);

  queryClient.setQueryData<TData>(queryKey, (old) => {
    if (!old) return old;
    return update(old);
  });

  let failed = false;
  let caughtError: unknown;
  try {
    await mutate();
  } catch (err: unknown) {
    failed = true;
    caughtError = err;
    queryClient.setQueryData(queryKey, previous);
  }

  if (failed) {
    onError?.(caughtError);
  } else {
    onSuccess?.();
  }
}
