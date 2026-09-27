/**
 * Builds the tickets filter bar. Pills, the store updates behind them and
 * the date pill's props all come from here. The tickets page and every dashboard lane build
 * their filter bar here, each over its own filter store.
 *
 * "Unread" rides the Status pill and "Needs attention" rides Priority: to
 * a volunteer they are a status and a priority concern. Both toggle the
 * store's client-side membership flags.
 */

import { ticketPrioritySchema } from "@care-y/shared";
import type { FilterFieldDef } from "$lib/composables/create-filter-dispatch.svelte.js";
import type {
  FilterOption,
  NamedOptionSource,
  PillDefinition,
} from "$lib/components/filters/filter-types.js";
import type { FilterPillsConfig } from "$lib/shell/types.js";
import type { FilterStore } from "$lib/stores/filters.svelte.js";
import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import type { LaneHiddenPill } from "./dashboard-lanes.js";
import type { TicketFacets } from "./facet-filters.js";
import { formatCount } from "./format-count.js";
import { PRIORITY_OPTIONS } from "./priority-labels.js";
import {
  STATUS_FILTER_LABELS,
  buildAssigneeOptions,
  buildDateRangeLabel,
  isFilterStatus,
} from "./ticket-list-utils.js";

/** The assignee pill's value for "no assignee". */
const UNASSIGNED_VALUE = "__unassigned__";

/** The filter state the pills read. A filter store satisfies it. */
export interface TicketPillFilters {
  readonly statuses: ReadonlySet<string>;
  readonly queueIds: ReadonlySet<string>;
  readonly priorities: ReadonlySet<string>;
  /** undefined = no filter, null = unassigned, string = that user */
  readonly assigneeId: string | null | undefined;
  readonly dateFrom: Date | null;
  readonly dateTo: Date | null;
  readonly unreadOnly: boolean;
  readonly needsAttentionOnly: boolean;
}

export interface TicketFilterPillsInput {
  readonly filters: TicketPillFilters;
  /** Option counts; undefined leaves every label bare. */
  readonly facets: TicketFacets | undefined;
  /** False marks counts as floors ("N+"). */
  readonly facetsComplete: boolean;
  /**
   * Unread counts depend on read state and stay bare until the read-state
   * sweep settles, or they would undercount.
   */
  readonly unreadCountReady: boolean;
  readonly queues: readonly NamedOptionSource[];
  readonly queuesLoading: boolean;
  readonly currentUserId: string | undefined;
  /** Pills, or the needs-attention option, to leave out. */
  readonly hidden?: readonly LaneHiddenPill[];
}

/**
 * The tickets filter pills, in bar order: status, queue, priority,
 * assignee, date. Each option label carries its facet count once counts
 * are known.
 */
export function buildTicketFilterPills(
  input: TicketFilterPillsInput,
): PillDefinition[] {
  const { filters, facets } = input;
  const hidden = input.hidden ?? [];

  function withCount(label: string, n: number): string {
    if (facets === undefined) return label;
    return `${label} (${formatCount(n, !input.facetsComplete)})`;
  }

  const statusCounts = new Map<string, number>(
    Object.entries(facets?.status ?? {}),
  );
  const priorityCounts = new Map<string, number>(
    Object.entries(facets?.priority ?? {}),
  );

  const statusOptions: FilterOption[] = [
    ...[...STATUS_FILTER_LABELS].map(([value, label]) => ({
      value,
      label: withCount(label(), statusCounts.get(value) ?? 0),
    })),
    {
      value: "unread",
      label: input.unreadCountReady
        ? withCount(m.tickets_filter_unread(), facets?.unread ?? 0)
        : m.tickets_filter_unread(),
    },
  ];

  const priorityOptions: FilterOption[] = PRIORITY_OPTIONS.map((option) => ({
    value: option.value,
    label: withCount(option.label(), priorityCounts.get(option.value) ?? 0),
  }));
  if (!hidden.includes("needs-attention")) {
    priorityOptions.push({
      value: "needs-attention",
      label: withCount(
        m.tickets_filter_needs_attention(),
        facets?.needsAttention ?? 0,
      ),
    });
  }

  const queueOptions: FilterOption[] = input.queues.map((q) => ({
    value: q.id,
    label: withCount(q.name ?? "...", facets?.queue.get(q.id) ?? 0),
  }));

  const assigneeOptions = buildAssigneeOptions(input.currentUserId, {
    me: withCount(m.tickets_filter_me(), facets?.assignee.mine ?? 0),
    unassigned: withCount(
      m.tickets_unassigned(),
      facets?.assignee.unassigned ?? 0,
    ),
  });

  const pills: PillDefinition[] = [
    {
      id: "status",
      label: m.tickets_filter_status(),
      mode: "multi",
      options: statusOptions,
      selected: filters.unreadOnly
        ? new Set<string>([...filters.statuses, "unread"])
        : filters.statuses,
    },
    {
      id: "queue",
      label: m.tickets_filter_queue(withTerms()),
      mode: "multi",
      options: queueOptions,
      selected: filters.queueIds,
      loading: input.queuesLoading,
    },
    {
      id: "priority",
      label: m.tickets_filter_priority(),
      mode: "multi",
      options: priorityOptions,
      selected: filters.needsAttentionOnly
        ? new Set<string>([...filters.priorities, "needs-attention"])
        : filters.priorities,
    },
    {
      id: "assignee",
      label: m.tickets_filter_assignee(),
      mode: "single",
      options: assigneeOptions,
      selected:
        filters.assigneeId === null
          ? UNASSIGNED_VALUE
          : (filters.assigneeId ?? null),
    },
    {
      id: "date",
      label: m.tickets_filter_date_range(),
      mode: "date",
      options: [],
      selected: null,
    },
  ];

  return pills.filter((pill) =>
    hidden.every((hiddenId) => hiddenId !== pill.id),
  );
}

/**
 * The store update behind each pill, for createFilterDispatch. Sort is
 * not a pill and is left to the caller.
 */
export function ticketFilterFields(
  store: FilterStore,
): Record<string, FilterFieldDef> {
  return {
    status: {
      type: "multi-toggle",
      toggle: (v: string) => {
        if (v === "unread") {
          store.setUnreadOnly(!store.unreadOnly);
        } else if (isFilterStatus(v)) {
          store.toggleStatus(v);
        }
      },
    },
    queue: {
      type: "multi-toggle",
      toggle: (v: string) => {
        store.toggleQueue(v);
      },
    },
    priority: {
      type: "multi-toggle",
      toggle: (v: string) => {
        if (v === "needs-attention") {
          store.setNeedsAttentionOnly(!store.needsAttentionOnly);
          return;
        }
        const parsed = ticketPrioritySchema.safeParse(v);
        if (parsed.success) store.togglePriority(parsed.data);
      },
    },
    assignee: {
      type: "single-select",
      set: (v: string | null) => {
        store.setAssignee(v === UNASSIGNED_VALUE ? null : v);
      },
    },
    date: {
      type: "date-range",
      set: (from: Date | null, to: Date | null) => {
        store.setDateRange(from, to);
      },
    },
  };
}

export type TicketDatePillProps = Required<
  Pick<FilterPillsConfig, "dateFrom" | "dateTo" | "dateActive" | "dateLabel">
>;

/** The date pill's inputs and label for the filter bar. */
export function ticketDatePillProps(
  filters: Pick<TicketPillFilters, "dateFrom" | "dateTo">,
): TicketDatePillProps {
  return {
    dateFrom: filters.dateFrom?.toISOString().slice(0, 10) ?? "",
    dateTo: filters.dateTo?.toISOString().slice(0, 10) ?? "",
    dateActive: filters.dateFrom !== null || filters.dateTo !== null,
    dateLabel: buildDateRangeLabel(filters.dateFrom, filters.dateTo, {
      from: m.tickets_filter_date_from(),
      to: m.tickets_filter_date_to(),
      range: m.tickets_filter_date_range(),
    }),
  };
}
