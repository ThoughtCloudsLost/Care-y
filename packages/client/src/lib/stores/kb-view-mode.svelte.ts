/**
 * View mode store for the KB article list.
 * Persists list/grid preference to localStorage.
 * Same pattern as view-mode.svelte.ts (ticket list).
 */

export type KbViewMode = "list" | "grid";

const STORAGE_KEY = "care-y-kb-view-mode";

const VALID_MODES: ReadonlySet<string> = new Set<KbViewMode>(["list", "grid"]);

function isKbViewMode(value: string): value is KbViewMode {
  return VALID_MODES.has(value);
}

function loadFromStorage(): KbViewMode {
  if (typeof window === "undefined") return "list";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null && isKbViewMode(stored)) return stored;
  } catch {
    // Safari private browsing, storage quota, or restricted context:
    // recover by treating it as no stored preference.
    return "list";
  }
  return "list";
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
