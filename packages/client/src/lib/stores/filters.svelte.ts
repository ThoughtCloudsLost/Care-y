/**
 * Ticket list filter store. GitHub Mobile-style dropdown pill model.
 *
 * Multi-select dimensions (status, queue, priority) use SvelteSet for
 * granular reactivity on .add()/.delete() without immutable reassignment.
 *
 * Volunteers see four statuses: New, Active, On Hold, Closed. Those four
 * partition every ticket: `close` clears the hold server-side, which
 * keeps every held ticket open, and a held ticket counts as neither New
 * nor Active. The server stores "open"/"closed" plus an onHold boolean,
 * and "New" vs "Active" comes from followUpCount (see display-status.ts).
 *
 * Status is multi-select, and the server input cannot express every
 * selection: ("open" | "closed")[] plus one onHold boolean describes an
 * intersection, so a selection spanning the held boundary (New + Hold,
 * Closed + Hold) has no faithful params. serverParams therefore sends the
 * narrowest safe SUPERSET, and the route narrows exactly via
 * filterByDisplayStatus. Read serverParams as a fetch hint, never as the
 * filter itself.
 *
 * The superset rule: constrain onHold only when every selected status
 * implies the same value (new, active and closed imply false; hold
 * implies true). A mixed selection sends no onHold at all. Relying on
 * "closed implies not held" is sound because close clears the flag.
 *
 * 6c.2 adds a "stages" dimension for kanban filtering. The store structure
 * supports appending new SvelteSet dimensions without restructuring.
 */

import { SvelteDate, SvelteSet } from "svelte/reactivity";
import type { TicketPriority, TicketSortField } from "@care-y/shared";
import type { DisplayStatus } from "$lib/tickets/display-status.js";
import type { SavedFilterState } from "./saved-filters.svelte.js";

export type FilterStatus = DisplayStatus;

export type SortField = TicketSortField;
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  readonly field: SortField;
  readonly direction: SortDirection;
}

/**
 * The `tickets.list` input a filter state translates to. A fetch hint:
 * status is a superset (see the file header), narrowed on the client.
 */
export interface TicketListServerParams {
  statuses?: ("open" | "closed")[];
  onHold?: boolean;
  queueIds?: string[];
  priorities?: TicketPriority[];
  assignedTo?: string | null;
  createdAfter?: string;
  createdBefore?: string;
  sortBy: SortField;
  sortDirection: SortDirection;
  limit: number;
}

/**
 * Narrowest safe superset of the selected display statuses, as the
 * server's statuses and onHold inputs. The exact narrowing is
 * filterByDisplayStatus in the route; see the file header for why the
 * server input cannot carry it. Undefined in either field means that
 * input is not constrained.
 */
export function displayStatusServerParams(
  selected: ReadonlySet<FilterStatus>,
): Pick<TicketListServerParams, "statuses" | "onHold"> {
  const hasNew = selected.has("new");
  const hasActive = selected.has("active");
  const hasClosed = selected.has("closed");
  const hasHold = selected.has("hold");

  const serverStatuses: ("open" | "closed")[] = [];
  if (hasNew || hasActive || hasHold) serverStatuses.push("open");
  if (hasClosed) serverStatuses.push("closed");

  // Every selected status has to agree before onHold can narrow the
  // fetch. Constraining it on a mixed selection would drop rows rather
  // than over-fetch them: Closed + Hold with onHold: true returns no
  // closed ticket at all.
  const wantsHeld = hasHold;
  const wantsUnheld = hasNew || hasActive || hasClosed;
  const onHold =
    wantsHeld === wantsUnheld ? undefined : wantsHeld ? true : false;

  return {
    statuses: serverStatuses.length > 0 ? serverStatuses : undefined,
    onHold,
  };
}

/**
 * Creates one independent filter state. The tickets page uses the
 * `filterStore` singleton below; a surface that filters several lists
 * separately (the dashboard's lanes) creates one store per list.
 */
export function createFilterStore(): {
  readonly statuses: SvelteSet<FilterStatus>;
  toggleStatus(v: FilterStatus): void;
  readonly queueIds: SvelteSet<string>;
  toggleQueue(v: string): void;
  readonly priorities: SvelteSet<TicketPriority>;
  togglePriority(v: TicketPriority): void;
  /** undefined = no filter, null = unassigned, string = specific user */
  readonly assigneeId: string | null | undefined;
  setAssignee(v: string | null | undefined): void;
  readonly dateFrom: Date | null;
  readonly dateTo: Date | null;
  setDateRange(from: Date | null, to: Date | null): void;
  readonly sort: SortConfig;
  setSort(field: SortField, direction: SortDirection): void;
  readonly unreadOnly: boolean;
  setUnreadOnly(v: boolean): void;
  readonly needsAttentionOnly: boolean;
  setNeedsAttentionOnly(v: boolean): void;
  readonly activeCount: number;
  readonly serverParams: TicketListServerParams;
  captureState(): SavedFilterState;
  applyState(state: SavedFilterState): void;
  clearAll(): void;
} {
  // Multi-select dimensions: empty set = "show all" (no filter applied)
  const statuses = new SvelteSet<FilterStatus>();
  const queueIds = new SvelteSet<string>();
  const priorities = new SvelteSet<TicketPriority>();

  // Single-select dimensions
  let assigneeId = $state<string | null | undefined>(undefined);

  // Date range
  let dateFrom = $state<Date | null>(null);
  let dateTo = $state<Date | null>(null);

  // Sort (server-side ORDER BY; also used as TanStack Query cache key)
  // Recent activity, not creation date: the ticket someone just replied
  // to belongs above an empty ticket that happens to be newer. The server
  // supports this as a keyset sort (NULLS LAST), so pagination stays
  // consistent beyond the first page.
  let sort = $state<SortConfig>({ field: "last_activity", direction: "desc" });

  // Client-side-only membership toggles (read state is per-viewer,
  // not a server-queryable field). Stored here so captureState/applyState
  // can persist them in saved filters.
  let unreadOnly = $state(false);
  let needsAttentionOnly = $state(false);

  // Count of active *dimensions* (for the badge, e.g. "2 filters applied")
  const activeCount = $derived(
    (statuses.size > 0 ? 1 : 0) +
      (queueIds.size > 0 ? 1 : 0) +
      (priorities.size > 0 ? 1 : 0) +
      (assigneeId !== undefined ? 1 : 0) +
      (dateFrom !== null || dateTo !== null ? 1 : 0) +
      (unreadOnly ? 1 : 0) +
      (needsAttentionOnly ? 1 : 0),
  );

  // Status translates through displayStatusServerParams, the one place
  // the display-status superset rule lives.
  const serverParams = $derived.by((): TicketListServerParams => {
    const status = displayStatusServerParams(statuses);
    return {
      statuses: status.statuses,
      onHold: status.onHold,
      queueIds: queueIds.size > 0 ? [...queueIds] : undefined,
      priorities:
        priorities.size > 0 ? ([...priorities] as TicketPriority[]) : undefined,
      assignedTo: assigneeId,
      createdAfter: dateFrom?.toISOString(),
      createdBefore: dateTo?.toISOString(),
      sortBy: sort.field,
      sortDirection: sort.direction,
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

    get assigneeId(): string | null | undefined {
      return assigneeId;
    },
    setAssignee(v: string | null | undefined): void {
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

    get unreadOnly(): boolean {
      return unreadOnly;
    },
    setUnreadOnly(v: boolean): void {
      unreadOnly = v;
    },

    get needsAttentionOnly(): boolean {
      return needsAttentionOnly;
    },
    setNeedsAttentionOnly(v: boolean): void {
      needsAttentionOnly = v;
    },

    get activeCount(): number {
      return activeCount;
    },
    get serverParams(): TicketListServerParams {
      return serverParams;
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
        unreadOnly,
        needsAttentionOnly,
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
      dateFrom =
        state.dateFrom !== null ? new SvelteDate(state.dateFrom) : null;
      dateTo = state.dateTo !== null ? new SvelteDate(state.dateTo) : null;
      sort = { field: state.sortField, direction: state.sortDirection };
      unreadOnly = state.unreadOnly;
      needsAttentionOnly = state.needsAttentionOnly;
    },

    clearAll(): void {
      statuses.clear();
      queueIds.clear();
      priorities.clear();
      assigneeId = undefined;
      dateFrom = null;
      dateTo = null;
      unreadOnly = false;
      needsAttentionOnly = false;
    },
  };
}

export type FilterStore = ReturnType<typeof createFilterStore>;

export const filterStore = createFilterStore();
