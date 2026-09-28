import type { QueryClient, QueryKey } from "@tanstack/svelte-query";

/** A cached ticket row, as far as a list-wide update needs to see it. */
export interface PagedRow {
  readonly id: string;
  readonly [field: string]: unknown;
}

/** The cache shape of a paged (infinite) list query. */
export interface PagedRows {
  readonly pages: readonly (readonly PagedRow[])[];
  readonly pageParams: readonly unknown[];
}

/**
 * True for a paged list query's data: pages of rows that each carry a
 * string id. The shell caches plain arrays under the same key prefix, and
 * those fail this check.
 */
export function isPagedRows(data: unknown): data is PagedRows {
  if (typeof data !== "object" || data === null) return false;
  if (!("pages" in data) || !("pageParams" in data)) return false;
  const { pages, pageParams } = data;
  return (
    Array.isArray(pageParams) &&
    Array.isArray(pages) &&
    pages.every(
      (page: unknown) =>
        Array.isArray(page) &&
        page.every(
          (row: unknown) =>
            typeof row === "object" &&
            row !== null &&
            "id" in row &&
            typeof row.id === "string",
        ),
    )
  );
}

/** A copy of `data` with `patch` applied to the row with id `rowId`. */
export function patchPagedRow(
  data: PagedRows,
  rowId: string,
  patch: Readonly<Record<string, unknown>>,
): PagedRows {
  return {
    ...data,
    pages: data.pages.map((page) =>
      page.map((row) =>
        row.id === rowId ? { ...row, ...patch, id: row.id } : row,
      ),
    ),
  };
}

export interface OptimisticListsMutationOpts<TData> {
  readonly queryClient: QueryClient;
  /** Partial key; every cached query under it is a candidate. */
  readonly queryKey: QueryKey;
  /**
   * Narrows a candidate's cached data to the shape `update` expects.
   * Queries under one prefix can hold different shapes (the shell caches
   * plain ticket arrays under the list namespace next to the paged
   * lists), so a query whose data fails this check is left untouched.
   */
  readonly isData: (data: unknown) => data is TData;
  readonly update: (old: TData) => TData;
  readonly mutate: () => Promise<unknown>;
  readonly onSuccess?: () => void;
  readonly onError?: (err: unknown) => void;
}

/**
 * Snapshot-mutate-rollback across every query under a partial key, so a
 * change shows at once in each list that holds the row (the dashboard
 * keeps one query per lane).
 *
 * Snapshots every matching query whose data passes `isData`, applies
 * `update` to each of them via setQueriesData, then awaits the mutation.
 * On error, every snapshot is restored.
 */
export async function optimisticListsMutation<TData>(
  opts: OptimisticListsMutationOpts<TData>,
): Promise<void> {
  const { queryClient, queryKey, isData, update, mutate, onSuccess, onError } =
    opts;

  const snapshots: [QueryKey, TData][] = [];
  for (const [key, data] of queryClient.getQueriesData({ queryKey })) {
    if (isData(data)) snapshots.push([key, data]);
  }

  // An updater returning undefined leaves that query as it was, so a
  // query holding some other shape is neither rewritten nor re-stamped.
  queryClient.setQueriesData<unknown>({ queryKey }, (old: unknown) =>
    isData(old) ? update(old) : undefined,
  );

  let failed = false;
  let caughtError: unknown;
  try {
    await mutate();
  } catch (err: unknown) {
    failed = true;
    caughtError = err;
    for (const [key, data] of snapshots) {
      queryClient.setQueryData(key, data);
    }
  }

  if (failed) {
    onError?.(caughtError);
  } else {
    onSuccess?.();
  }
}
