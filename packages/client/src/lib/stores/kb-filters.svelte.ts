/**
 * KB article list filter store. Parallels the ticket filter store
 * (filters.svelte.ts) but with KB-specific dimensions.
 *
 * Dimensions:
 * - categoryIds (multi-select): filter by one or more categories
 * - minRating (single-select): minimum Wilson score threshold
 * - createdBy (single-select): filter by author pseudonym
 * - dateFrom / dateTo: creation date range
 * - sort: field + direction
 *
 * The serverParams derivation maps these to the kbItemListInputSchema
 * fields consumed by the tRPC listItems endpoint.
 */

import { SvelteSet } from "svelte/reactivity";
import type { KbSortField, SortDirection } from "@care-y/shared";
import type { KbSavedFilterState } from "./kb-saved-filters.svelte.js";

export interface KbSortConfig {
  readonly field: KbSortField;
  readonly direction: SortDirection;
}

function createKbFilterStore(): {
  readonly categoryIds: SvelteSet<string>;
  toggleCategory(v: string): void;
  readonly minRating: number | undefined;
  setMinRating(v: number | undefined): void;
  readonly createdBy: string | undefined;
  setCreatedBy(v: string | undefined): void;
  readonly dateFrom: Date | null;
  readonly dateTo: Date | null;
  setDateRange(from: Date | null, to: Date | null): void;
  readonly sort: KbSortConfig;
  setSort(field: KbSortField, direction: SortDirection): void;
  readonly activeCount: number;
  readonly serverParams: {
    categoryId?: string;
    sortBy: KbSortField;
    sortDirection: SortDirection;
    minRating?: number;
    createdBy?: string;
    createdAfter?: string;
    createdBefore?: string;
    limit: number;
  };
  captureState(): KbSavedFilterState;
  applyState(state: KbSavedFilterState): void;
  clearAll(): void;
} {
  const categoryIds = new SvelteSet<string>();

  let minRating = $state<number | undefined>(undefined);
  let createdBy = $state<string | undefined>(undefined);

  let dateFrom = $state<Date | null>(null);
  let dateTo = $state<Date | null>(null);

  let sort = $state<KbSortConfig>({
    field: "created_at",
    direction: "desc",
  });

  const activeCount = $derived(
    (categoryIds.size > 0 ? 1 : 0) +
      (minRating !== undefined ? 1 : 0) +
      (createdBy !== undefined ? 1 : 0) +
      (dateFrom !== null || dateTo !== null ? 1 : 0),
  );

  // The listItems endpoint accepts a single categoryId, not an array.
  // When multiple categories are selected, we omit the filter and
  // post-filter client-side (same tradeoff tickets make for statuses).
  // When exactly one is selected, we pass it for server-side filtering.
  const serverParams = $derived.by(() => {
    const singleCategoryId =
      categoryIds.size === 1 ? [...categoryIds][0] : undefined;

    return {
      categoryId: singleCategoryId,
      sortBy: sort.field,
      sortDirection: sort.direction,
      minRating,
      createdBy,
      createdAfter: dateFrom?.toISOString(),
      createdBefore: dateTo?.toISOString(),
      limit: 50,
    };
  });

  return {
    get categoryIds(): SvelteSet<string> {
      return categoryIds;
    },
    toggleCategory(v: string): void {
      if (categoryIds.has(v)) categoryIds.delete(v);
      else categoryIds.add(v);
    },

    get minRating(): number | undefined {
      return minRating;
    },
    setMinRating(v: number | undefined): void {
      minRating = v;
    },

    get createdBy(): string | undefined {
      return createdBy;
    },
    setCreatedBy(v: string | undefined): void {
      createdBy = v;
    },

    get dateFrom(): Date | null {
      return dateFrom;
    },
    get dateTo(): Date | null {
      return dateTo;
    },
    setDateRange(from: Date | null, to: Date | null): void {
      dateFrom = from;
      dateTo = to;
    },

    get sort(): KbSortConfig {
      return sort;
    },
    setSort(field: KbSortField, direction: SortDirection): void {
      sort = { field, direction };
    },

    get activeCount(): number {
      return activeCount;
    },
    get serverParams() {
      return serverParams;
    },

    captureState(): KbSavedFilterState {
      return {
        categoryIds: [...categoryIds],
        minRating: minRating ?? null,
        createdBy: createdBy ?? null,
        dateFrom: dateFrom?.toISOString() ?? null,
        dateTo: dateTo?.toISOString() ?? null,
        sortField: sort.field,
        sortDirection: sort.direction,
      };
    },

    applyState(state: KbSavedFilterState): void {
      categoryIds.clear();
      for (const id of state.categoryIds) categoryIds.add(id);
      minRating = state.minRating ?? undefined;
      createdBy = state.createdBy ?? undefined;
      dateFrom = state.dateFrom !== null ? new Date(state.dateFrom) : null;
      dateTo = state.dateTo !== null ? new Date(state.dateTo) : null;
      sort = { field: state.sortField, direction: state.sortDirection };
    },

    clearAll(): void {
      categoryIds.clear();
      minRating = undefined;
      createdBy = undefined;
      dateFrom = null;
      dateTo = null;
    },
  };
}

export const kbFilterStore = createKbFilterStore();
