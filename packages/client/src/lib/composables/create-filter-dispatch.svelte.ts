import type { SavedFilterColor, SavedFilterRecord } from "@care-y/shared";
import { ClientError } from "$lib/errors.js";

// ── Field definitions (discriminated union) ──

interface MultiToggleField {
  readonly type: "multi-toggle";
  readonly toggle: (value: string) => void;
}

interface SingleSelectField {
  readonly type: "single-select";
  readonly set: (value: string | null) => void;
}

interface DateRangeField {
  readonly type: "date-range";
  readonly set: (from: Date | null, to: Date | null) => void;
}

export type FilterFieldDef =
  MultiToggleField | SingleSelectField | DateRangeField;

// ── Sort config ──

interface SortDispatchConfig {
  readonly validate: (field: string) => boolean;
  readonly set: (field: string, dir: "asc" | "desc") => void;
}

// ── Saved filter config ──

interface SafeParseResult {
  readonly success: boolean;
  readonly data?: unknown;
}

interface SavedFilterDispatchConfig {
  readonly store: {
    readonly add: (record: SavedFilterRecord) => void;
    readonly remove: (id: string) => void;
    readonly toggleShare: (id: string) => void;
  };
  readonly captureState: () => unknown;
  readonly applyState: (state: unknown) => void;
  readonly stateSchema: { safeParse: (data: unknown) => SafeParseResult };
  readonly getCurrentUserId: () => string | null;
}

// ── Main config ──

export interface FilterDispatchConfig {
  readonly fields: Record<string, FilterFieldDef>;
  readonly sort?: SortDispatchConfig;
  readonly savedFilters?: SavedFilterDispatchConfig;
  readonly clearAll: () => void;
  readonly onchange?: () => void;
}

// ── Return type ──

export interface FilterDispatch {
  readonly handlePillToggle: (pillId: string, value: string) => void;
  readonly handlePillSelect: (pillId: string, value: string | null) => void;
  readonly handlePillDateChange: (from: Date | null, to: Date | null) => void;
  readonly handleSortChange: (field: string, dir: "asc" | "desc") => void;
  readonly clearAll: () => void;
  readonly handleSavedFilterApply: (record: SavedFilterRecord) => void;
  readonly handleSavedFilterDelete: (id: string) => void;
  readonly handleSavedFilterToggleShare: (id: string) => void;
  readonly handleCreateSavedFilter: (meta: {
    encryptedName: string;
    color: SavedFilterColor;
    icon: string;
  }) => SavedFilterRecord;
}

export function createFilterDispatch(
  config: FilterDispatchConfig,
): FilterDispatch {
  function getField(pillId: string): FilterFieldDef | undefined {
    if (!Object.hasOwn(config.fields, pillId)) return undefined;
    // eslint-disable-next-line security/detect-object-injection -- pillId validated by hasOwn, keys are from trusted UI config
    return config.fields[pillId];
  }

  function handlePillToggle(pillId: string, value: string): void {
    const field = getField(pillId);
    if (field?.type === "multi-toggle") {
      field.toggle(value);
      config.onchange?.();
    }
  }

  function handlePillSelect(pillId: string, value: string | null): void {
    const field = getField(pillId);
    if (field?.type === "single-select") {
      field.set(value);
      config.onchange?.();
    }
  }

  function handlePillDateChange(from: Date | null, to: Date | null): void {
    for (const field of Object.values(config.fields)) {
      if (field.type === "date-range") {
        field.set(from, to);
        config.onchange?.();
        return;
      }
    }
  }

  function handleSortChange(field: string, dir: "asc" | "desc"): void {
    if (config.sort?.validate(field) === true) {
      config.sort.set(field, dir);
      config.onchange?.();
    }
  }

  function clearAll(): void {
    config.clearAll();
    config.onchange?.();
  }

  function handleSavedFilterApply(record: SavedFilterRecord): void {
    const sf = config.savedFilters;
    if (sf == null) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(record.state);
    } catch {
      console.warn("[saved-filters] discarding unparseable record", record.id);
      return;
    }
    const result = sf.stateSchema.safeParse(parsed);
    if (result.success) {
      sf.applyState(result.data);
    } else {
      // A schema miss means a legacy or corrupt stored record; without
      // this warning the chip is an indistinguishable dead button.
      console.warn("[saved-filters] record failed validation", record.id);
    }
  }

  function handleSavedFilterDelete(id: string): void {
    config.savedFilters?.store.remove(id);
  }

  function handleSavedFilterToggleShare(id: string): void {
    config.savedFilters?.store.toggleShare(id);
  }

  function handleCreateSavedFilter(meta: {
    encryptedName: string;
    color: SavedFilterColor;
    icon: string;
  }): SavedFilterRecord {
    const sf = config.savedFilters;
    if (sf == null) {
      throw new ClientError(
        "savedFilters config required for createSavedFilter",
      );
    }
    const record: SavedFilterRecord = {
      id: crypto.randomUUID(),
      encryptedName: meta.encryptedName,
      color: meta.color,
      icon: meta.icon,
      state: JSON.stringify(sf.captureState()),
      shared: false,
      ownerId: sf.getCurrentUserId() ?? "",
      // eslint-disable-next-line svelte/prefer-svelte-reactivity -- one-shot timestamp, not reactive state
      createdAt: new Date().toISOString(),
    };
    sf.store.add(record);
    return record;
  }

  return {
    handlePillToggle,
    handlePillSelect,
    handlePillDateChange,
    handleSortChange,
    clearAll,
    handleSavedFilterApply,
    handleSavedFilterDelete,
    handleSavedFilterToggleShare,
    handleCreateSavedFilter,
  };
}
