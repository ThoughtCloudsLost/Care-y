import { SvelteSet } from "svelte/reactivity";
import type { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";
import type { PillDefinition } from "$lib/components/filters/filter-types.js";
import type { FilterPillsConfig } from "$lib/shell/types.js";
import type { SerializedBuffer } from "$lib/utils/buffer-encoding.js";

// ── Shared shapes ──

export interface ParticipantRecord {
  readonly volunteerId: string;
  readonly encryptedDisplayName: SerializedBuffer | Uint8Array | null;
}

export interface NoteTypeRecord {
  readonly id: string;
  readonly encryptedName: SerializedBuffer | Uint8Array | null;
}

// ── Config ──

export interface DetailFiltersConfig {
  readonly getNoteTypes: () => readonly NoteTypeRecord[] | undefined;
  readonly getParticipants: () => readonly ParticipantRecord[] | undefined;
  readonly getParticipantsLoading: () => boolean;
  readonly orgCache: OrgDecryptCache;
  readonly getClientAlias: () => string;
  readonly getCurrentUserId: () => string | undefined;
  readonly labels: {
    readonly filterType: string;
    readonly filterAuthor: string;
    readonly filterDate: string;
    readonly authorYou: (name: string) => string;
    readonly typeRecordings: string;
    readonly typeImages: string;
    readonly typeFiles: string;
    readonly typeMessages: string;
    readonly typeAssignment: string;
    readonly typeStatus: string;
    readonly typePriority: string;
    readonly typeHold: string;
    readonly typeMerge: string;
    readonly typeCalls: string;
  };
}

// ── Return type ──

export interface DetailFiltersState {
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

const MEDIA_IMAGES = "__images__";
const MEDIA_RECORDINGS = "__recordings__";
const MEDIA_FILES = "__files__";

export function createDetailFilters(
  config: DetailFiltersConfig,
): DetailFiltersState {
  const filterTypes = new SvelteSet<string>();
  let filterDateFrom = $state<Date | null>(null);
  let filterDateTo = $state<Date | null>(null);
  const filterAuthors = new SvelteSet<string>();

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
    // No single-select pills on the detail view currently.
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

  // ── Derived pill option arrays ──

  const noteTypeFilterEntries = $derived(
    (config.getNoteTypes() ?? []).map((nt) => ({
      value: `note_type:${nt.id}`,
      label:
        config.orgCache.decrypt(nt.id + ":name", nt.encryptedName) ?? "...",
    })),
  );

  const typeFilterOptions = $derived([
    ...noteTypeFilterEntries,
    { value: MEDIA_RECORDINGS, label: config.labels.typeRecordings },
    { value: MEDIA_IMAGES, label: config.labels.typeImages },
    { value: MEDIA_FILES, label: config.labels.typeFiles },
    { value: "message", label: config.labels.typeMessages },
    { value: "assignment_change", label: config.labels.typeAssignment },
    { value: "status_change", label: config.labels.typeStatus },
    { value: "priority_change", label: config.labels.typePriority },
    { value: "hold_change", label: config.labels.typeHold },
    { value: "merge_note", label: config.labels.typeMerge },
    { value: "phone_call", label: config.labels.typeCalls },
  ]);

  const authorFilterOptions = $derived.by(() => {
    const options: { value: string; label: string }[] = [
      { value: "__client__", label: config.getClientAlias() },
    ];
    for (const participant of config.getParticipants() ?? []) {
      const name = config.orgCache.decrypt(
        `volunteer:${participant.volunteerId}`,
        participant.encryptedDisplayName,
      );
      const currentUserId = config.getCurrentUserId();
      const label =
        participant.volunteerId === currentUserId
          ? config.labels.authorYou(name ?? "...")
          : (name ?? "...");
      options.push({ value: participant.volunteerId, label });
    }
    return options;
  });

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
      loading: config.getParticipantsLoading(),
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
