/**
 * View mode store for the KB article list.
 * Persists list/cards/grid preference to localStorage.
 * Same three-way union as view-mode.svelte.ts (ticket list).
 */

import type { ViewMode } from "$lib/stores/view-mode.svelte.js";

export type KbViewMode = ViewMode;

const STORAGE_KEY = "care-y-kb-view-mode";

const VALID_MODES: ReadonlySet<string> = new Set<KbViewMode>([
  "list",
  "cards",
  "table",
  "grid",
]);

function isKbViewMode(value: string): value is KbViewMode {
  return VALID_MODES.has(value);
}

function loadFromStorage(): KbViewMode {
  if (typeof window === "undefined") return "cards";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null && isKbViewMode(stored)) return stored;
  } catch {
    // Safari private browsing, storage quota, or restricted context:
    // recover by treating it as no stored preference.
    return "cards";
  }
  return "cards";
}

function createKbViewModeStore(): {
  readonly mode: KbViewMode;
  set(value: KbViewMode): void;
} {
  let mode = $state<KbViewMode>(loadFromStorage());

  return {
    get mode(): KbViewMode {
      return mode;
    },
    set(value: KbViewMode): void {
      mode = value;
      try {
        localStorage.setItem(STORAGE_KEY, value);
        // care-y-ignore-next-line no-swallowed-errors -- best-effort persistence: the mode already changed in memory and a full or restricted storage must stay silent
      } catch {
        // Storage full or restricted
      }
    },
  };
}

export const kbViewModeStore = createKbViewModeStore();
