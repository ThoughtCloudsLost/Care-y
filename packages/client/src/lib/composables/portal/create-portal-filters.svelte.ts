/**
 * Filter composable for the portal thread.
 *
 * Mirrors the org thread's createDetailFilters but scoped to data
 * the portal legitimately shows: message type (messages, images,
 * files), author direction (client vs. support), and date range.
 * No volunteer identities, no internal note types, no org-only
 * event types (assignment, status, priority, hold, merge).
 */
import { SvelteSet } from "svelte/reactivity";
import type { PillDefinition } from "$lib/components/filters/filter-types.js";
import type { FilterPillsConfig } from "$lib/shell/types.js";

// ── Config ──

export interface PortalFiltersConfig {
  readonly labels: {
    readonly filterType: string;
    readonly filterAuthor: string;
    readonly filterDate: string;
    readonly typeMessages: string;
    readonly typeImages: string;
    readonly typeFiles: string;
    readonly authorYou: string;
    readonly authorSupport: string;
  };
}

// ── Return type ──

export interface PortalFiltersState {
  readonly filterTypesArr: readonly string[];
  readonly filterAuthorsArr: readonly string[];
  readonly filterDateFrom: Date | null;
  readonly filterDateTo: Date | null;
  readonly activeCount: number;
  readonly pills: FilterPillsConfig;
  handlePillToggle(pillId: string, value: string): void;
  handlePillSelect(pillId: string, value: string | null): void;
  handleDateChange(from: Date | null, to: Date | null): void;
  clearAll(): void;
}

export function createPortalFilters(
  config: PortalFiltersConfig,
): PortalFiltersState {
  const filterTypes = new SvelteSet<string>();
  const filterAuthors = new SvelteSet<string>();
  let filterDateFrom = $state<Date | null>(null);
  let filterDateTo = $state<Date | null>(null);

  const filterTypesArr = $derived([...filterTypes]);
  const filterAuthorsArr = $derived([...filterAuthors]);

  const filterActiveCount = $derived.by((): number => {
    let count = 0;
    if (filterTypes.size > 0) count++;
    if (filterAuthors.size > 0) count++;
    if (filterDateFrom !== null || filterDateTo !== null) count++;
    return count;
  });

  function toggleFilterType(value: string): void {
    if (filterTypes.has(value)) filterTypes.delete(value);
    else filterTypes.add(value);
  }

  function toggleFilterAuthor(value: string): void {
    if (filterAuthors.has(value)) filterAuthors.delete(value);
    else filterAuthors.add(value);
  }

  function handlePillToggle(pillId: string, value: string): void {
    if (pillId === "type") toggleFilterType(value);
    else if (pillId === "author") toggleFilterAuthor(value);
  }

  function handlePillSelect(_pillId: string, _value: string | null): void {
    // No single-select pills on the portal filter bar.
  }

  function handleDateChange(from: Date | null, to: Date | null): void {
    filterDateFrom = from;
    filterDateTo = to;
  }

  function clearAll(): void {
    filterTypes.clear();
    filterAuthors.clear();
    filterDateFrom = null;
    filterDateTo = null;
  }

  // ── Pill option arrays ──

  const typeFilterOptions = $derived([
    { value: "message", label: config.labels.typeMessages },
    { value: "__images__", label: config.labels.typeImages },
    { value: "__files__", label: config.labels.typeFiles },
  ]);

  const authorFilterOptions = $derived([
    { value: "__client__", label: config.labels.authorYou },
    { value: "__support__", label: config.labels.authorSupport },
  ]);

  const dateFromStr = $derived(
    filterDateFrom ? filterDateFrom.toISOString().slice(0, 10) : "",
  );
  const dateToStr = $derived(
    filterDateTo ? filterDateTo.toISOString().slice(0, 10) : "",
  );
  const dateFilterActive = $derived(
    filterDateFrom !== null || filterDateTo !== null,
  );
  const dateFilterLabel = $derived.by((): string | undefined => {
    if (!dateFilterActive) return undefined;
    const from = filterDateFrom
      ? filterDateFrom.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : "";
    const to = filterDateTo
      ? filterDateTo.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : "";
    if (from && to) return `${from} - ${to}`;
    if (from) return `${from} -`;
    return `- ${to}`;
  });

  const conversationPills = $derived<PillDefinition[]>([
    {
      id: "type",
      label: config.labels.filterType,
      mode: "multi",
      options: typeFilterOptions,
      selected: filterTypes as ReadonlySet<string>,
    },
    {
      id: "author",
      label: config.labels.filterAuthor,
      mode: "multi",
      options: authorFilterOptions,
      selected: filterAuthors as ReadonlySet<string>,
    },
    {
      id: "date",
      label: config.labels.filterDate,
      mode: "date",
      options: [],
      selected: null,
    },
  ]);

  const pillsConfig: FilterPillsConfig = $derived({
    pills: conversationPills,
    activeCount: filterActiveCount,
    dateFrom: dateFromStr,
    dateTo: dateToStr,
    dateActive: dateFilterActive,
    dateLabel: dateFilterLabel,
    ontoggle: handlePillToggle,
    onselect: handlePillSelect,
    ondatechange: handleDateChange,
    onclearall: clearAll,
  });

  return {
    get filterTypesArr(): readonly string[] {
      return filterTypesArr;
    },
    get filterAuthorsArr(): readonly string[] {
      return filterAuthorsArr;
    },
    get filterDateFrom(): Date | null {
      return filterDateFrom;
    },
    get filterDateTo(): Date | null {
      return filterDateTo;
    },
    get activeCount(): number {
      return filterActiveCount;
    },
    get pills(): FilterPillsConfig {
      return pillsConfig;
    },
    handlePillToggle,
    handlePillSelect,
    handleDateChange,
    clearAll,
  };
}
