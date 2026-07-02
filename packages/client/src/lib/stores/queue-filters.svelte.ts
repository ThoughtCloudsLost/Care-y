/**
 * Admin queue list sort store. Client-side only.
 *
 * Sort fields: order (manual), name (decrypted), members, open, closed, hold.
 * No filter dimensions (queues are few and always active).
 */

export type QueueSortField =
  "order" | "name" | "members" | "open" | "closed" | "hold";
export type SortDirection = "asc" | "desc";

export interface QueueSortConfig {
  readonly field: QueueSortField;
  readonly direction: SortDirection;
}

function createQueueFilterStore(): {
  readonly sort: QueueSortConfig;
  setSort(field: QueueSortField, direction: SortDirection): void;
} {
  let sort = $state<QueueSortConfig>({
    field: "order",
    direction: "asc",
  });

  return {
    get sort(): QueueSortConfig {
      return sort;
    },
    setSort(field: QueueSortField, direction: SortDirection): void {
      sort = { field, direction };
    },
  };
}

export const queueFilterStore = createQueueFilterStore();
