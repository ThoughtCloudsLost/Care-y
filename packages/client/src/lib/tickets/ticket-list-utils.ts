import type { DisplayStatus } from "./display-status.js";
import type { ReactionSummary } from "@care-y/shared";
import type { FuzzyMatch } from "$lib/search/fuzzy.js";

export type FilterStatus = DisplayStatus;
export type SortField = "date" | "priority" | "last_activity" | "queue";

export const VALID_STATUSES: ReadonlySet<FilterStatus> = new Set<FilterStatus>([
  "new",
  "active",
  "hold",
  "closed",
]);

export const SORT_FIELDS: readonly SortField[] = [
  "date",
  "priority",
  "last_activity",
  "queue",
];

export function isFilterStatus(v: string): v is FilterStatus {
  return (VALID_STATUSES as ReadonlySet<string>).has(v);
}

export function isSortField(v: string): v is SortField {
  return (SORT_FIELDS as readonly string[]).includes(v);
}

export interface TicketForFilter {
  readonly id: string;
  readonly status: string;
  readonly onHold: boolean;
  readonly followUpCount: number;
}

export function filterByDisplayStatus<T extends TicketForFilter>(
  tickets: readonly T[],
  needsFilter: boolean,
  wantNew: boolean,
): readonly T[] {
  if (!needsFilter) return tickets;

  return tickets.filter((t) => {
    if (t.status !== "open") return true;
    if (t.onHold) return true;
    return wantNew ? t.followUpCount === 0 : t.followUpCount > 0;
  });
}

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
  readonly clientAlias: string;
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
    haystack.push(`${entry.title} ${entry.clientAlias}`);
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
): string {
  const parts: string[] = [];
  if (statuses.size > 0) parts.push([...statuses].join(", "));
  if (priorities.size > 0) parts.push([...priorities].join(", "));
  if (queueCount > 0) {
    parts.push(`${String(queueCount)} queue${queueCount > 1 ? "s" : ""}`);
  }
  if (assigneeId !== null && assigneeId !== undefined) parts.push("assigned");
  if (hasDateRange) parts.push("date range");
  return parts.length > 0 ? parts.join(", ") : "No filters";
}

export interface AssigneeOptionLabels {
  readonly me: (count: string) => string;
  readonly unassigned: (count: string) => string;
}

export function buildAssigneeOptions(
  currentUserId: string | undefined,
  counts: { readonly mine?: number; readonly unassigned?: number } | undefined,
  labels: AssigneeOptionLabels,
): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = [];
  if (currentUserId !== undefined) {
    opts.push({
      value: currentUserId,
      label: labels.me(String(counts?.mine ?? 0)),
    });
  }
  opts.push({
    value: "__unassigned__",
    label: labels.unassigned(String(counts?.unassigned ?? 0)),
  });
  return opts;
}
