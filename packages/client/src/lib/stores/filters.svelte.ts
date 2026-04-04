/**
 * Ticket list filter store. GitHub Mobile-style dropdown pill model.
 *
 * Multi-select dimensions (status, queue, priority) use SvelteSet for
 * granular reactivity on .add()/.delete() without immutable reassignment.
 *
 * "hold" is a UI pseudo-status. Volunteers see "Open", "Closed", "On Hold"
 * as peers, but the server models on_hold as a separate boolean column.
 * The serverParams derived value handles this split transparently.
 *
 * 6c.2 adds a "stages" dimension for kanban filtering. The store structure
 * supports appending new SvelteSet dimensions without restructuring.
 */

import { SvelteSet } from "svelte/reactivity";
import type { TicketStatus, TicketPriority } from "@care-y/shared";

/** UI status values: server statuses + the "hold" pseudo-status. */
export type FilterStatus = TicketStatus | "hold";

export type SortField = "date" | "priority" | "status";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  readonly field: SortField;
  readonly direction: SortDirection;
}

function createFilterStore(): {
  readonly statuses: SvelteSet<FilterStatus>;
  toggleStatus(v: FilterStatus): void;
  readonly queueIds: SvelteSet<string>;
  toggleQueue(v: string): void;
  readonly priorities: SvelteSet<TicketPriority>;
  togglePriority(v: TicketPriority): void;
  readonly assigneeId: string | null;
  setAssignee(v: string | null): void;
  readonly dateFrom: Date | null;
  readonly dateTo: Date | null;
  setDateRange(from: Date | null, to: Date | null): void;
  readonly sort: SortConfig;
  setSort(field: SortField, direction: SortDirection): void;
  readonly activeCount: number;
  readonly serverParams: {
    statuses?: TicketStatus[];
    onHold?: true;
    queueIds?: string[];
    priorities?: TicketPriority[];
    assignedTo?: string;
    limit: number;
  };
  clearAll(): void;
} {
  // Multi-select dimensions: empty set = "show all" (no filter applied)
  const statuses = new SvelteSet<FilterStatus>();
  const queueIds = new SvelteSet<string>();
  const priorities = new SvelteSet<TicketPriority>();

  // Single-select dimensions
  let assigneeId = $state<string | null>(null);

  // Date range
  let dateFrom = $state<Date | null>(null);
  let dateTo = $state<Date | null>(null);

  // Sort (client-side reorder of already-fetched tickets)
  let sort = $state<SortConfig>({ field: "date", direction: "desc" });

  // Count of active *dimensions* (for the badge, e.g. "2 filters applied")
  const activeCount = $derived(
    (statuses.size > 0 ? 1 : 0) +
      (queueIds.size > 0 ? 1 : 0) +
      (priorities.size > 0 ? 1 : 0) +
      (assigneeId !== null ? 1 : 0) +
      (dateFrom !== null || dateTo !== null ? 1 : 0),
  );

  // Convert UI filter state to server query params.
  // "hold" is a pseudo-status that maps to onHold=true on the server.
  // Real statuses ("open", "closed") go in the statuses array.
  const serverParams = $derived.by(() => {
    const realStatuses = [...statuses].filter(
      (s): s is TicketStatus => s !== "hold",
    );
    const hasHold = statuses.has("hold");
    return {
      statuses: realStatuses.length > 0 ? realStatuses : undefined,
      onHold: hasHold ? (true as const) : undefined,
      queueIds: queueIds.size > 0 ? [...queueIds] : undefined,
      priorities:
        priorities.size > 0 ? ([...priorities] as TicketPriority[]) : undefined,
      assignedTo: assigneeId ?? undefined,
      limit: 50,
    };
  });

  return {
    get statuses(): SvelteSet<FilterStatus> {
      return statuses;
    },
    toggleStatus(v: FilterStatus): void {
      if (statuses.has(v)) statuses.delete(v);
      else statuses.add(v);
    },

    get queueIds(): SvelteSet<string> {
      return queueIds;
    },
    toggleQueue(v: string): void {
      if (queueIds.has(v)) queueIds.delete(v);
      else queueIds.add(v);
    },

    get priorities(): SvelteSet<TicketPriority> {
      return priorities;
    },
    togglePriority(v: TicketPriority): void {
      if (priorities.has(v)) priorities.delete(v);
      else priorities.add(v);
    },

    get assigneeId(): string | null {
      return assigneeId;
    },
    setAssignee(v: string | null): void {
      assigneeId = v;
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

    get sort(): SortConfig {
      return sort;
    },
    setSort(field: SortField, direction: SortDirection): void {
      sort = { field, direction };
    },

    get activeCount(): number {
      return activeCount;
    },
    get serverParams() {
      return serverParams;
    },

    clearAll(): void {
      statuses.clear();
      queueIds.clear();
      priorities.clear();
      assigneeId = null;
      dateFrom = null;
      dateTo = null;
    },
  };
}

export const filterStore = createFilterStore();
