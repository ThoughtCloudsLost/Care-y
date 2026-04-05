/**
 * Ticket list filter store. GitHub Mobile-style dropdown pill model.
 *
 * Multi-select dimensions (status, queue, priority) use SvelteSet for
 * granular reactivity on .add()/.delete() without immutable reassignment.
 *
 * Volunteers see four statuses: New, Active, On Hold, Closed. The server
 * only stores "open"/"closed" + onHold boolean. "New" vs "Active" is
 * derived from followUpCount (see display-status.ts). The serverParams
 * derivation maps display statuses back to server query params:
 *   - "new" or "active" -> statuses: ["open"]
 *   - "closed" -> statuses: ["closed"]
 *   - "hold" -> onHold: true
 * When only "new" xor "active" is selected, the route must post-filter
 * client-side by followUpCount (the server can't distinguish them).
 *
 * 6c.2 adds a "stages" dimension for kanban filtering. The store structure
 * supports appending new SvelteSet dimensions without restructuring.
 */

import { SvelteSet } from "svelte/reactivity";
import type { TicketPriority } from "@care-y/shared";
import type { DisplayStatus } from "$lib/tickets/display-status.js";
import type { SavedFilterState } from "./saved-filters.svelte.js";

export type FilterStatus = DisplayStatus;

export type SortField = "date" | "priority" | "last_activity";
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
    statuses?: ("open" | "closed")[];
    onHold?: true;
    queueIds?: string[];
    priorities?: TicketPriority[];
    assignedTo?: string;
    sortBy: SortField;
    sortDirection: SortDirection;
    limit: number;
  };
  readonly needsDisplayStatusPostFilter: boolean;
  captureState(): SavedFilterState;
  applyState(state: SavedFilterState): void;
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

  // Sort (server-side ORDER BY; also used as TanStack Query cache key)
  let sort = $state<SortConfig>({ field: "date", direction: "desc" });

  // Count of active *dimensions* (for the badge, e.g. "2 filters applied")
  const activeCount = $derived(
    (statuses.size > 0 ? 1 : 0) +
      (queueIds.size > 0 ? 1 : 0) +
      (priorities.size > 0 ? 1 : 0) +
      (assigneeId !== null ? 1 : 0) +
      (dateFrom !== null || dateTo !== null ? 1 : 0),
  );

  // Convert display statuses to server query params.
  // "new" and "active" both map to server status "open".
  // "closed" maps to "closed". "hold" maps to onHold: true.
  // When only "new" xor "active" is selected (not both), the route
  // must post-filter client-side by followUpCount.
  const serverParams = $derived.by(() => {
    const hasNew = statuses.has("new");
    const hasActive = statuses.has("active");
    const hasClosed = statuses.has("closed");
    const hasHold = statuses.has("hold");

    const serverStatuses: ("open" | "closed")[] = [];
    if (hasNew || hasActive) serverStatuses.push("open");
    if (hasClosed) serverStatuses.push("closed");

    return {
      statuses: serverStatuses.length > 0 ? serverStatuses : undefined,
      onHold: hasHold ? (true as const) : undefined,
      queueIds: queueIds.size > 0 ? [...queueIds] : undefined,
      priorities:
        priorities.size > 0 ? ([...priorities] as TicketPriority[]) : undefined,
      assignedTo: assigneeId ?? undefined,
      sortBy: sort.field,
      sortDirection: sort.direction,
      limit: 50,
    };
  });

  // Whether the route needs to post-filter "new" vs "active" client-side.
  // True when exactly one of "new"/"active" is selected (not both, not neither).
  const needsDisplayStatusPostFilter = $derived(
    statuses.has("new") !== statuses.has("active"),
  );

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

    get needsDisplayStatusPostFilter(): boolean {
      return needsDisplayStatusPostFilter;
    },

    captureState(): SavedFilterState {
      return {
        statuses: [...statuses],
        queueIds: [...queueIds],
        priorities: [...priorities],
        assigneeId,
        dateFrom: dateFrom?.toISOString() ?? null,
        dateTo: dateTo?.toISOString() ?? null,
        sortField: sort.field,
        sortDirection: sort.direction,
      };
    },

    applyState(state: SavedFilterState): void {
      statuses.clear();
      for (const s of state.statuses) statuses.add(s);
      queueIds.clear();
      for (const q of state.queueIds) queueIds.add(q);
      priorities.clear();
      for (const p of state.priorities) priorities.add(p);
      assigneeId = state.assigneeId;
      dateFrom = state.dateFrom !== null ? new Date(state.dateFrom) : null;
      dateTo = state.dateTo !== null ? new Date(state.dateTo) : null;
      sort = { field: state.sortField, direction: state.sortDirection };
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
