/**
 * View mode store for the ticket list.
 * Persists list/grid preference to localStorage.
 * 6c.2 widens the ViewMode union to include "kanban".
 */

export type ViewMode = "list" | "grid";
// 6c.2 widens: export type ViewMode = "list" | "grid" | "kanban";

const STORAGE_KEY = "care-y-view-mode";

const VALID_MODES: ReadonlySet<string> = new Set<ViewMode>(["list", "grid"]);

function isViewMode(value: string): value is ViewMode {
  return VALID_MODES.has(value);
}

function loadFromStorage(): ViewMode {
  if (typeof window === "undefined") return "list";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null && isViewMode(stored)) return stored;
  } catch {
    // Safari private browsing, storage quota, or restricted context
  }
  return "list";
}

function createViewModeStore(): {
  readonly mode: ViewMode;
  set(value: ViewMode): void;
} {
  let mode = $state<ViewMode>(loadFromStorage());

  return {
    get mode(): ViewMode {
      return mode;
    },
    set(value: ViewMode): void {
      mode = value;
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch {
        // Storage full or restricted
      }
    },
  };
}

export const viewModeStore = createViewModeStore();
