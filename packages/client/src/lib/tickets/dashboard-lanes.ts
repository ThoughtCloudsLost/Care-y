/**
 * The dashboard's four ticket lanes, each a fixed membership rule that the
 * user's own filters narrow further.
 *
 * A lane's rule never enters the user's filter state. It travels two ways:
 * as server params, a superset the lane fetches with, and as a client
 * predicate (`base`) that facet counts and the list both apply. Keeping it
 * out of the filter state keeps an empty user selection meaning "no
 * filter", so option counts and "Apply to all" work on the user's filters
 * alone.
 */

import {
  dashboardLaneIdSchema,
  type DashboardLaneId,
  type LaneFilterState,
  type SavedFilterState,
} from "@care-y/shared";
import { isNeedsAttention } from "$lib/components/dashboard/filters.js";
import type {
  SortConfig,
  TicketListServerParams,
} from "$lib/stores/filters.svelte.js";
import type { DisplayStatus } from "./display-status.js";
import type { FacetContext } from "./facet-filters.js";
import type { TicketForServerFilter } from "./ticket-list-utils.js";

/** Lane order is work priority, as the schema declares it. */
export const DASHBOARD_LANE_IDS: readonly DashboardLaneId[] =
  dashboardLaneIdSchema.options;

/**
 * Rows a lane shows before "See all" when the page scrolls. A starting
 * value, to be tuned once real lanes are in use.
 */
export const DASHBOARD_LANE_CAP = 8;

/**
 * How often the dashboard's Activity and knowledge base sections refetch.
 * Organization and knowledge base changes have no live event, so these
 * context sections poll. TanStack Query pauses the interval while the
 * tab is hidden (`refetchIntervalInBackground` defaults to false, per
 * query-core's option docs). Ticket lanes do not poll.
 */
export const DASHBOARD_CONTEXT_REFRESH_MS = 60_000;

/**
 * A capped lane's row count for a list laid out `columns` cards across.
 * The cap rounds up to whole rows: the grid view then ends on a full
 * row. One column (every other view) keeps the cap as is.
 */
export function dashboardLaneCap(columns: number): number {
  const across = Math.max(1, Math.floor(columns));
  return across * Math.ceil(DASHBOARD_LANE_CAP / across);
}

/**
 * Filter controls a lane can hide because its rule already fixes them.
 * All but the last are the tickets filter bar's pill ids. The last is the
 * needs-attention toggle, which rides the priority pill as its
 * "needs-attention" option rather than being a pill of its own.
 */
export type LaneHiddenPill =
  "status" | "queue" | "priority" | "assignee" | "date" | "needs-attention";

/** The `tickets.list` dimensions a lane can constrain. */
export type LaneServerParams = Pick<
  TicketListServerParams,
  "statuses" | "onHold" | "queueIds" | "priorities" | "assignedTo"
>;

export interface DashboardLaneDefinition {
  readonly id: DashboardLaneId;
  /** Superset the lane fetches with; merge user filters via mergeLaneParams. */
  readonly serverParams: LaneServerParams;
  /** The lane's rule over facet and list rows. */
  readonly base: (
    row: TicketForServerFilter,
    ctx: Pick<FacetContext, "isUnread">,
  ) => boolean;
  readonly hiddenPills: readonly LaneHiddenPill[];
  /** The lane's rule in tickets-page filter terms, for "See all". */
  readonly ticketsPage: LaneTicketsPageRule;
}

/**
 * A lane's rule as tickets-page filters. The tickets page has no lane
 * predicate, so "See all" lands on the filter state that selects the
 * same tickets.
 */
export interface LaneTicketsPageRule {
  /** The display statuses the lane admits. */
  readonly statuses: readonly DisplayStatus[];
  /** The assignee the lane fixes; absent when the lane leaves it open. */
  readonly assignee?: { readonly id: string | null };
  readonly needsAttentionOnly: boolean;
}

/**
 * The definition of one lane for the signed-in user. `currentUserId` is
 * required: "My tickets" without it would fetch every open ticket.
 */
export function getLaneDefinition(
  id: DashboardLaneId,
  currentUserId: string,
): DashboardLaneDefinition {
  switch (id) {
    case "needs-attention":
      return {
        id,
        serverParams: { statuses: ["open"], onHold: false },
        base: (row, ctx) => isNeedsAttention(row, currentUserId, ctx.isUnread),
        hiddenPills: ["needs-attention"],
        ticketsPage: {
          statuses: ["new", "active"],
          needsAttentionOnly: true,
        },
      };
    case "my-tickets":
      return {
        id,
        serverParams: {
          statuses: ["open"],
          onHold: false,
          assignedTo: currentUserId,
        },
        base: (row) =>
          row.status === "open" &&
          !row.onHold &&
          row.assignedTo === currentUserId,
        hiddenPills: ["assignee"],
        ticketsPage: {
          statuses: ["new", "active"],
          assignee: { id: currentUserId },
          needsAttentionOnly: false,
        },
      };
    case "unassigned":
      return {
        id,
        serverParams: { statuses: ["open"], onHold: false, assignedTo: null },
        base: (row) =>
          row.status === "open" && !row.onHold && row.assignedTo === null,
        hiddenPills: ["assignee"],
        ticketsPage: {
          statuses: ["new", "active"],
          assignee: { id: null },
          needsAttentionOnly: false,
        },
      };
    case "on-hold":
      return {
        id,
        serverParams: { statuses: ["open"], onHold: true },
        base: (row) => row.status === "open" && row.onHold,
        hiddenPills: ["status"],
        ticketsPage: { statuses: ["hold"], needsAttentionOnly: false },
      };
  }
}

export type LaneQuery<P> =
  { readonly kind: "query"; readonly params: P } | { readonly kind: "empty" };

/**
 * Intersects one array dimension. Undefined and [] both mean "no filter"
 * to the server, so a result of [] can only be an empty intersection.
 */
function intersect<V>(
  lane: readonly V[] | undefined,
  user: readonly V[] | undefined,
): V[] | undefined {
  const fromLane = lane !== undefined && lane.length > 0 ? lane : undefined;
  const fromUser = user !== undefined && user.length > 0 ? user : undefined;
  if (fromLane === undefined) {
    return fromUser === undefined ? undefined : [...fromUser];
  }
  if (fromUser === undefined) return [...fromLane];
  return fromUser.filter((v) => fromLane.includes(v));
}

/**
 * Pins a single-value dimension to the lane's value when the lane sets
 * one. A user value that disagrees makes the intersection empty.
 */
function pin<V>(
  lane: V | undefined,
  user: V | undefined,
): { readonly value: V | undefined } | undefined {
  if (lane === undefined) return { value: user };
  if (user !== undefined && user !== lane) return undefined;
  return { value: lane };
}

/**
 * Merges the user's filter params (a filter store's `serverParams`) into a
 * lane's superset by intersection. Returns `{ kind: "empty" }` when any
 * dimension's intersection is empty, so the caller renders an empty lane
 * without a request: sending the empty array would ask the server for no
 * filter at all and widen the lane instead.
 */
export function mergeLaneParams<P extends LaneServerParams>(
  lane: LaneServerParams,
  user: P,
): LaneQuery<P> {
  const statuses = intersect(lane.statuses, user.statuses);
  const queueIds = intersect(lane.queueIds, user.queueIds);
  const priorities = intersect(lane.priorities, user.priorities);
  const onHold = pin(lane.onHold, user.onHold);
  const assignedTo = pin(lane.assignedTo, user.assignedTo);

  if (
    statuses?.length === 0 ||
    queueIds?.length === 0 ||
    priorities?.length === 0 ||
    onHold === undefined ||
    assignedTo === undefined
  ) {
    return { kind: "empty" };
  }

  return {
    kind: "query",
    params: {
      ...user,
      statuses,
      queueIds,
      priorities,
      onHold: onHold.value,
      assignedTo: assignedTo.value,
    },
  };
}

/**
 * The tickets-page filter state "See all" applies for a lane: the lane's
 * rule combined with the user's lane filters, in the lane's sort. The
 * lane's statuses narrow to those the user also picked; a lane that
 * fixes the assignee or needs-attention overrides the user's value.
 *
 * An empty status intersection would read as "no filter" on the tickets
 * page, but such a lane is always empty, so "See all" is never offered
 * for it.
 */
export function laneSeeAllState(
  definition: DashboardLaneDefinition,
  user: LaneFilterState,
  sort: SortConfig,
): SavedFilterState {
  const rule = definition.ticketsPage;
  const statuses =
    user.statuses.length === 0
      ? [...rule.statuses]
      : user.statuses.filter((s) => rule.statuses.includes(s));
  return {
    ...user,
    statuses,
    assigneeId:
      rule.assignee !== undefined ? rule.assignee.id : user.assigneeId,
    needsAttentionOnly: rule.needsAttentionOnly || user.needsAttentionOnly,
    sortField: sort.field,
    sortDirection: sort.direction,
  };
}

/**
 * A lane's user filter with every dimension the lane hides cleared. A
 * hidden pill's dimensions go with it: the status pill also carries the
 * unread toggle, and the priority pill the needs-attention toggle, so a
 * lane never holds a filter it has no control to show or clear.
 */
export function dropHiddenDimensions(
  state: LaneFilterState,
  hidden: readonly LaneHiddenPill[],
): LaneFilterState {
  const { assigneeId, ...rest } = state;
  const next: LaneFilterState = { ...rest };
  if (!hidden.includes("assignee") && assigneeId !== undefined) {
    next.assigneeId = assigneeId;
  }
  if (hidden.includes("status")) {
    next.statuses = [];
    next.unreadOnly = false;
  }
  if (hidden.includes("queue")) next.queueIds = [];
  if (hidden.includes("priority")) {
    next.priorities = [];
    next.needsAttentionOnly = false;
  }
  if (hidden.includes("needs-attention")) next.needsAttentionOnly = false;
  if (hidden.includes("date")) {
    next.dateFrom = null;
    next.dateTo = null;
  }
  return next;
}

/** True when the state filters nothing. */
export function isEmptyLaneFilterState(state: LaneFilterState): boolean {
  return (
    state.statuses.length === 0 &&
    state.queueIds.length === 0 &&
    state.priorities.length === 0 &&
    state.assigneeId === undefined &&
    state.dateFrom === null &&
    state.dateTo === null &&
    !state.unreadOnly &&
    !state.needsAttentionOnly
  );
}

function sameMembers<V>(a: readonly V[], b: readonly V[]): boolean {
  if (a.length !== b.length) return false;
  const inB = new Set(b);
  return a.every((v) => inB.has(v));
}

/** True when both states filter the same way; list order is ignored. */
export function laneFilterStatesEqual(
  a: LaneFilterState,
  b: LaneFilterState,
): boolean {
  return (
    sameMembers(a.statuses, b.statuses) &&
    sameMembers(a.queueIds, b.queueIds) &&
    sameMembers(a.priorities, b.priorities) &&
    a.assigneeId === b.assigneeId &&
    a.dateFrom === b.dateFrom &&
    a.dateTo === b.dateTo &&
    a.unreadOnly === b.unreadOnly &&
    a.needsAttentionOnly === b.needsAttentionOnly
  );
}

/** A lane "Apply to all" copies to. */
export interface ApplyToAllTarget {
  readonly id: DashboardLaneId;
  readonly hiddenPills: readonly LaneHiddenPill[];
  /** The lane's own user filter now. */
  readonly current: LaneFilterState;
}

export interface ApplyToAllPlan {
  /** The filter each target lane receives. */
  readonly updates: readonly {
    readonly id: DashboardLaneId;
    readonly state: LaneFilterState;
  }[];
  /**
   * Target lanes whose own active filters the copy replaces with
   * something different. Zero means applying needs no confirmation.
   */
  readonly overwriting: number;
}

/**
 * "Apply to all": the source lane's user filter, as each other lane
 * receives it. Only the user filter travels; the source lane's rule is
 * never part of it. Each target drops the dimensions it hides.
 */
export function planApplyToAll(
  source: LaneFilterState,
  targets: readonly ApplyToAllTarget[],
): ApplyToAllPlan {
  let overwriting = 0;
  const updates = targets.map((target) => {
    const state = dropHiddenDimensions(source, target.hiddenPills);
    if (
      !isEmptyLaneFilterState(target.current) &&
      !laneFilterStatesEqual(target.current, state)
    ) {
      overwriting++;
    }
    return { id: target.id, state };
  });
  return { updates, overwriting };
}
