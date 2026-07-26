/**
 * Admin client list filter/sort store. Server-side filtering via the
 * clients.list query (search, sort, and filter params are passed to the server).
 *
 * Rows sort by alias, creation date, or ticket count. Filtering narrows on
 * ticket presence, a creation date range, and whether merged records appear.
 * Search is debounced by the calling component, not this store.
 */

export type ClientSortField = "alias" | "created_at" | "ticket_count";
export type SortDirection = "asc" | "desc";

export interface ClientSortConfig {
  readonly field: ClientSortField;
  readonly direction: SortDirection;
}

/** Tri-state: true = only with tickets, false = only without, null = all. */
export type HasApplications = boolean | null;

function createClientFilterStore(): {
  readonly sort: ClientSortConfig;
  readonly search: string;
  readonly hasApplications: HasApplications;
  readonly createdAfter: Date | null;
  readonly createdBefore: Date | null;
  readonly includeMerged: boolean;
  readonly activeCount: number;
  setSort(field: ClientSortField, direction: SortDirection): void;
  setSearch(query: string): void;
  setHasApplications(value: HasApplications): void;
  setDateRange(from: Date | null, to: Date | null): void;
  setIncludeMerged(value: boolean): void;
  clearAll(): void;
} {
  let sort = $state<ClientSortConfig>({
    field: "alias",
    direction: "asc",
  });

  let search = $state("");
  let hasApplications = $state<HasApplications>(null);
  let createdAfter = $state<Date | null>(null);
  let createdBefore = $state<Date | null>(null);
  let includeMerged = $state(false);

  const activeCount = $derived(
    (hasApplications !== null ? 1 : 0) +
      (createdAfter !== null || createdBefore !== null ? 1 : 0) +
      (includeMerged ? 1 : 0),
  );

  return {
    get sort(): ClientSortConfig {
      return sort;
    },
    setSort(field: ClientSortField, direction: SortDirection): void {
      sort = { field, direction };
    },

    get search(): string {
      return search;
    },
    setSearch(query: string): void {
      search = query;
    },

    get hasApplications(): HasApplications {
      return hasApplications;
    },
    setHasApplications(value: HasApplications): void {
      hasApplications = value;
    },

    get createdAfter(): Date | null {
      return createdAfter;
    },
    get createdBefore(): Date | null {
      return createdBefore;
    },
    setDateRange(from: Date | null, to: Date | null): void {
      createdAfter = from;
      createdBefore = to;
    },

    get includeMerged(): boolean {
      return includeMerged;
    },
    setIncludeMerged(value: boolean): void {
      includeMerged = value;
    },

    get activeCount(): number {
      return activeCount;
    },

    clearAll(): void {
      hasApplications = null;
      createdAfter = null;
      createdBefore = null;
      includeMerged = false;
    },
  };
}

export const clientFilterStore = createClientFilterStore();
