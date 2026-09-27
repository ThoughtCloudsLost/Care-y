/**
 * Filters for the dashboard's non-ticket sections: Activity (event kind
 * and queue), the knowledge base (category and author) and merge
 * candidates (match kind).
 *
 * Each section's filter lives in the encrypted dashboard filters
 * document, so the store updates here read the current value and write
 * a whole new one. Pill values are validated against the document's own
 * schemas before they reach it.
 */

import {
  dashboardActivityFilterSchema,
  dashboardActivityKindSchema,
  dashboardKbFilterSchema,
  dashboardMergeFilterSchema,
  kbCategoryIdSchema,
  mergeMatchKindSchema,
  queueIdSchema,
  userIdSchema,
  type DashboardActivityFilter,
  type DashboardKbFilter,
  type DashboardMergeFilter,
  type MergeMatchKind,
} from "@care-y/shared";
import type { FilterFieldDef } from "$lib/composables/create-filter-dispatch.svelte.js";
import type {
  FilterOption,
  NamedOptionSource,
  PillDefinition,
} from "$lib/components/filters/filter-types.js";
import {
  buildKbAuthorPill,
  buildKbCategoryPill,
} from "$lib/components/library/kb-filter-pills.js";
import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";

/** The list with `value` added, or removed if it was there. */
export function toggleListValue<V>(list: readonly V[], value: V): V[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

/** Reads and replaces one section's filter in the document. */
export interface SectionFilterAccess<F> {
  readonly get: () => F;
  readonly set: (filter: F) => void;
}

// ── Activity ──

export function activityActiveCount(filter: DashboardActivityFilter): number {
  return (
    (filter.kinds.length > 0 ? 1 : 0) + (filter.queueIds.length > 0 ? 1 : 0)
  );
}

/** The recentActivity input for a filter; empty lists are left out. */
export function activityQueryFilter(filter: DashboardActivityFilter): {
  kinds?: DashboardActivityFilter["kinds"];
  queueIds?: DashboardActivityFilter["queueIds"];
} {
  return {
    ...(filter.kinds.length > 0 ? { kinds: [...filter.kinds] } : {}),
    ...(filter.queueIds.length > 0 ? { queueIds: [...filter.queueIds] } : {}),
  };
}

export function buildActivityFilterPills(
  filter: DashboardActivityFilter,
  queues: readonly NamedOptionSource[],
  queuesLoading: boolean,
): PillDefinition[] {
  const kindOptions: FilterOption[] = dashboardActivityKindSchema.options.map(
    (kind) => ({
      value: kind,
      label:
        kind === "ticket"
          ? m.dashboard_activity_kind_ticket(withTerms())
          : m.dashboard_activity_kind_org(),
    }),
  );
  return [
    {
      id: "kind",
      label: m.ticket_filter_type(),
      mode: "multi",
      options: kindOptions,
      selected: new Set<string>(filter.kinds),
    },
    {
      id: "queue",
      label: m.tickets_filter_queue(withTerms()),
      mode: "multi",
      options: queues.map((q) => ({ value: q.id, label: q.name ?? "..." })),
      selected: new Set<string>(filter.queueIds),
      loading: queuesLoading,
    },
  ];
}

export function activityFilterFields(
  access: SectionFilterAccess<DashboardActivityFilter>,
): Record<string, FilterFieldDef> {
  return {
    kind: {
      type: "multi-toggle",
      toggle: (v: string) => {
        const parsed = dashboardActivityKindSchema.safeParse(v);
        if (!parsed.success) return;
        const current = access.get();
        access.set({
          ...current,
          kinds: toggleListValue(current.kinds, parsed.data),
        });
      },
    },
    queue: {
      type: "multi-toggle",
      toggle: (v: string) => {
        const parsed = queueIdSchema.safeParse(v);
        if (!parsed.success) return;
        const current = access.get();
        access.set({
          ...current,
          queueIds: toggleListValue(current.queueIds, parsed.data),
        });
      },
    },
  };
}

/** No activity filter; the defaults are the document schema's. */
export function emptyActivityFilter(): DashboardActivityFilter {
  return dashboardActivityFilterSchema.parse({});
}

// ── Knowledge base ──

export function kbActiveCount(filter: DashboardKbFilter): number {
  return (
    (filter.categoryIds.length > 0 ? 1 : 0) +
    (filter.createdBy !== null ? 1 : 0)
  );
}

/** The listItems filter input for a filter; empty values are left out. */
export function kbQueryFilter(filter: DashboardKbFilter): {
  categoryIds?: DashboardKbFilter["categoryIds"];
  createdBy?: string;
} {
  return {
    ...(filter.categoryIds.length > 0
      ? { categoryIds: [...filter.categoryIds] }
      : {}),
    ...(filter.createdBy !== null ? { createdBy: filter.createdBy } : {}),
  };
}

export function buildKbFilterPills(
  filter: DashboardKbFilter,
  categories: readonly NamedOptionSource[],
  categoriesLoading: boolean,
  authors: readonly NamedOptionSource[],
): PillDefinition[] {
  return [
    buildKbCategoryPill(
      categories,
      new Set<string>(filter.categoryIds),
      categoriesLoading,
    ),
    buildKbAuthorPill(authors, filter.createdBy),
  ];
}

export function kbFilterFields(
  access: SectionFilterAccess<DashboardKbFilter>,
): Record<string, FilterFieldDef> {
  return {
    category: {
      type: "multi-toggle",
      toggle: (v: string) => {
        const parsed = kbCategoryIdSchema.safeParse(v);
        if (!parsed.success) return;
        const current = access.get();
        access.set({
          ...current,
          categoryIds: toggleListValue(current.categoryIds, parsed.data),
        });
      },
    },
    author: {
      type: "single-select",
      set: (v: string | null) => {
        if (v === null) {
          access.set({ ...access.get(), createdBy: null });
          return;
        }
        const parsed = userIdSchema.safeParse(v);
        if (!parsed.success) return;
        access.set({ ...access.get(), createdBy: parsed.data });
      },
    },
  };
}

/** No KB filter; the defaults are the document schema's. */
export function emptyKbFilter(): DashboardKbFilter {
  return dashboardKbFilterSchema.parse({});
}

// ── Merge candidates ──

export function mergeActiveCount(filter: DashboardMergeFilter): number {
  return filter.matchKinds.length > 0 ? 1 : 0;
}

/** Candidates matched in one of the selected ways; all when none is. */
export function filterMergeCandidates<
  C extends { readonly matchKind: MergeMatchKind },
>(candidates: readonly C[], filter: DashboardMergeFilter): readonly C[] {
  if (filter.matchKinds.length === 0) return candidates;
  const kinds = new Set(filter.matchKinds);
  return candidates.filter((c) => kinds.has(c.matchKind));
}

/** How a pair was matched, as the candidate list and its filter name it. */
export function mergeMatchLabel(kind: MergeMatchKind): string {
  return kind === "phone"
    ? m.mergeCandidates_match_phone()
    : m.mergeCandidates_match_email();
}

export function buildMergeFilterPills(
  filter: DashboardMergeFilter,
): PillDefinition[] {
  const options: FilterOption[] = mergeMatchKindSchema.options.map((kind) => ({
    value: kind,
    label: mergeMatchLabel(kind),
  }));
  return [
    {
      id: "match",
      label: m.mergeCandidates_filter_match(),
      mode: "multi",
      options,
      selected: new Set<string>(filter.matchKinds),
    },
  ];
}

export function mergeFilterFields(
  access: SectionFilterAccess<DashboardMergeFilter>,
): Record<string, FilterFieldDef> {
  return {
    match: {
      type: "multi-toggle",
      toggle: (v: string) => {
        const parsed = mergeMatchKindSchema.safeParse(v);
        if (!parsed.success) return;
        const current = access.get();
        access.set({
          ...current,
          matchKinds: toggleListValue(current.matchKinds, parsed.data),
        });
      },
    },
  };
}

/** No merge filter; the defaults are the document schema's. */
export function emptyMergeFilter(): DashboardMergeFilter {
  return dashboardMergeFilterSchema.parse({});
}
