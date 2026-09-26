import { deriveDisplayStatus, type DisplayStatus } from "./display-status.js";
import {
  ticketSortFieldSchema,
  type TicketSortField,
  type TicketStatus,
  type ReactionSummary,
} from "@care-y/shared";
import type { FuzzyMatch } from "$lib/search/fuzzy.js";

export type FilterStatus = DisplayStatus;
export type SortField = TicketSortField;

export const VALID_STATUSES: ReadonlySet<FilterStatus> = new Set<FilterStatus>([
  "new",
  "active",
  "hold",
  "closed",
]);

export const SORT_FIELDS: readonly SortField[] = ticketSortFieldSchema.options;

export function isFilterStatus(v: string): v is FilterStatus {
  return (VALID_STATUSES as ReadonlySet<string>).has(v);
}

export function isSortField(v: string): v is SortField {
  return (SORT_FIELDS as readonly string[]).includes(v);
}

export interface TicketForFilter {
  readonly id: string;
  readonly status: TicketStatus;
  readonly onHold: boolean;
  readonly followUpCount: number;
}

/**
 * Narrows a list to the selected display statuses. New, Active, Hold and
 * Closed partition every ticket, so membership is one equality test
 * against `deriveDisplayStatus`. An empty selection means no narrowing.
 *
 * This is where status filtering is decided, not in the query params. The
 * server list input takes ("open" | "closed")[] plus an onHold boolean,
 * which can only describe an intersection, so a selection spanning the
 * held boundary (New + Hold, Closed + Hold) has no faithful params.
 * `serverParams` sends the narrowest safe superset and this does the
 * exact narrowing, which keeps every selection expressible.
 */
export function filterByDisplayStatus<T extends TicketForFilter>(
  tickets: readonly T[],
  selected: ReadonlySet<DisplayStatus>,
): readonly T[] {
  if (selected.size === 0) return tickets;

  return tickets.filter((t) =>
    selected.has(deriveDisplayStatus(t.status, t.onHold, t.followUpCount)),
  );
}

export interface TicketForServerFilter extends TicketForFilter {
  readonly queueId: string;
  readonly priority: string;
  readonly assignedTo: string | null;
  readonly createdAt: string | Date;
}

// A second predicate mirroring the server's WHERE clauses used to live
// here, applied to pinned rows. It duplicated the queue, priority,
// assignee and date rules that `matchesFilters` in facet-filters.ts
// already carries, so the pinned path calls that instead: the rows a
// filter admits and the count beside it now come from one predicate.

export function reactionsForTicket(
  followUps: readonly { readonly id: string }[] | undefined,
  reactionsMap: ReadonlyMap<string, ReactionSummary[]>,
): Record<string, ReactionSummary[]> | undefined {
  if (!followUps) return undefined;
  let result: Record<string, ReactionSummary[]> | undefined;
  for (const fu of followUps) {
    const reactions = reactionsMap.get(fu.id);
    if (reactions) {
      result ??= {};
      result[fu.id] = reactions;
    }
  }
  return result;
}

export interface TitleEntry {
  readonly id: string;
  readonly title: string | null;
  readonly clientAlias: string | null;
  readonly queueName?: string | null;
  readonly assignedName?: string | null;
}

export function matchTitles(
  entries: readonly TitleEntry[],
  searchTerm: string,
  fuzzySearchFn: (
    haystack: readonly string[],
    query: string,
  ) => readonly FuzzyMatch[],
): string[] {
  const ids: string[] = [];
  const haystack: string[] = [];
  for (const entry of entries) {
    if (entry.title == null) continue;
    ids.push(entry.id);
    haystack.push(
      [
        entry.title,
        entry.clientAlias ?? "",
        entry.queueName ?? "",
        entry.assignedName ?? "",
      ]
        .join(" ")
        .trim(),
    );
  }
  const matches = fuzzySearchFn(haystack, searchTerm);
  return matches
    .map((fm) => ids[fm.index])
    .filter((id): id is string => id != null);
}

export function mergeSearchMatches(
  titleMatchIds: readonly string[],
  contentMatchIds: ReadonlySet<string> | null | undefined,
  validIds: ReadonlySet<string>,
): string[] {
  if (contentMatchIds == null || contentMatchIds.size === 0) {
    return [...titleMatchIds];
  }

  const seen = new Set(titleMatchIds);
  const merged = [...titleMatchIds];
  for (const id of contentMatchIds) {
    if (!seen.has(id) && validIds.has(id)) {
      merged.push(id);
    }
  }
  return merged;
}

export function applySearchOrder<T extends { readonly id: string }>(
  tickets: readonly T[],
  searchActive: boolean,
  searchTerm: string | null,
  searchMatches: readonly string[],
  useMatchOrder: boolean,
): T[] {
  if (!searchActive || searchTerm == null || searchTerm.length < 2) {
    return [...tickets];
  }
  const matchSet = new Set(searchMatches);
  if (!useMatchOrder) {
    return tickets.filter((t) => matchSet.has(t.id));
  }
  const idToTicket = new Map(tickets.map((t) => [t.id, t]));
  const sorted: T[] = [];
  for (const id of searchMatches) {
    const t = idToTicket.get(id);
    if (t != null) sorted.push(t);
  }
  return sorted;
}

export interface DateRangeLabels {
  readonly from: string;
  readonly to: string;
  readonly range: string;
}

export function buildDateRangeLabel(
  dateFrom: Date | null,
  dateTo: Date | null,
  labels: DateRangeLabels,
): string {
  if (dateFrom !== null && dateTo !== null) {
    return `${dateFrom.toLocaleDateString()} - ${dateTo.toLocaleDateString()}`;
  }
  if (dateFrom !== null) {
    return `${labels.from} ${dateFrom.toLocaleDateString()}`;
  }
  if (dateTo !== null) {
    return `${labels.to} ${dateTo.toLocaleDateString()}`;
  }
  return labels.range;
}

export function buildFilterSummary(
  statuses: ReadonlySet<string>,
  priorities: ReadonlySet<string>,
  queueCount: number,
  assigneeId: string | null | undefined,
  hasDateRange: boolean,
  unreadOnly: boolean,
  needsAttentionOnly: boolean,
): string {
  const parts: string[] = [];
  if (statuses.size > 0) parts.push([...statuses].join(", "));
  if (priorities.size > 0) parts.push([...priorities].join(", "));
  if (queueCount > 0) {
    parts.push(`${String(queueCount)} queue${queueCount > 1 ? "s" : ""}`);
  }
  if (assigneeId !== null && assigneeId !== undefined) parts.push("assigned");
  if (hasDateRange) parts.push("date range");
  if (unreadOnly) parts.push("Unread");
  if (needsAttentionOnly) parts.push("Needs attention");
  return parts.length > 0 ? parts.join(", ") : "No filters";
}

export type TicketListEmptyKind =
  "search" | "caught-up" | "truly-empty" | "filtered";

/**
 * Decide which empty treatment the tickets list shows when zero rows
 * render. The caught-up stamp reads the GLOBAL unread truth (the sweep),
 * so it never claims "caught up" from a merely empty window; the seal is
 * reserved for a genuinely empty room (no tickets, no filters, no
 * search, no unread filter).
 */
export function resolveEmptyKind(args: {
  readonly searchActive: boolean;
  readonly unreadFilterOn: boolean;
  readonly globalCaughtUp: boolean;
  readonly ticketCount: number;
  readonly activeFilterCount: number;
  /** Client-side needs-attention membership filter (empties are "filtered", never caught-up). */
  readonly needsAttentionOn?: boolean;
}): TicketListEmptyKind {
  if (args.searchActive) return "search";
  if (args.unreadFilterOn && args.globalCaughtUp) return "caught-up";
  if (
    args.ticketCount === 0 &&
    args.activeFilterCount === 0 &&
    !args.unreadFilterOn &&
    args.needsAttentionOn !== true
  ) {
    return "truly-empty";
  }
  return "filtered";
}

/**
 * The slim caught-up line above a non-empty list when the sort toggle is
 * on. Hidden while searching: the stamp marks the list's resting state,
 * and over match-ordered results it would read as "no matches".
 */
export function showCaughtUpLine(args: {
  readonly sortOn: boolean;
  readonly globalCaughtUp: boolean;
  readonly searchActive: boolean;
  readonly listCount: number;
}): boolean {
  return (
    args.sortOn &&
    args.globalCaughtUp &&
    !args.searchActive &&
    args.listCount > 0
  );
}

/** Preferred grid card width; the column count grows past 2 from here. */
export const GRID_CARD_MIN_WIDTH = 320;

/**
 * Columns for the grid view at a given container width. Never below 2:
 * a one-column grid is just a worse cards mode, so narrow screens get
 * two slim columns instead (the whole-bubble preview handles the width).
 */
export function resolveGridColumns(containerWidth: number): number {
  return Math.max(2, Math.floor(containerWidth / GRID_CARD_MIN_WIDTH));
}

export interface AssigneeOptionLabels {
  readonly me: string;
  readonly unassigned: string;
}

/**
 * The two assignee option values, with labels the caller has already
 * composed. Counts are not threaded through here: the caller formats them
 * alongside every other pill, so a count argument would only be
 * stringified and handed straight back.
 */
export function buildAssigneeOptions(
  currentUserId: string | undefined,
  labels: AssigneeOptionLabels,
): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = [];
  if (currentUserId !== undefined) {
    opts.push({ value: currentUserId, label: labels.me });
  }
  opts.push({ value: "__unassigned__", label: labels.unassigned });
  return opts;
}
