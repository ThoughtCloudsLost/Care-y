/**
 * Persisted view mode stores for ledger surfaces (tickets list, dashboard).
 *
 * The ledger design language offers three presentations everywhere tickets
 * appear: "list" (compact ledger rows), "cards" (full-width cards with
 * conversation previews), and "grid" (multi-column). Each surface persists
 * its own preference under its own localStorage key.
 *
 * Migration note: the union used to be "list" | "grid". Both legacy values
 * remain valid members, so previously persisted preferences load unchanged;
 * anything unrecognized falls back to "list". A future kanban board is
 * separate work and is NOT the grid mode; it would widen this union again.
 */

export type ViewMode = "list" | "cards" | "grid";

const VALID_MODES: ReadonlySet<string> = new Set<ViewMode>([
  "list",
  "cards",
  "grid",
]);

function isViewMode(value: string): value is ViewMode {
  return VALID_MODES.has(value);
}

export interface ViewModeStore {
  readonly mode: ViewMode;
  set(value: ViewMode): void;
}

function loadFromStorage(storageKey: string): ViewMode {
  if (typeof window === "undefined") return "list";
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null && isViewMode(stored)) return stored;
  } catch {
    // Safari private browsing, storage quota, or restricted context:
    // recover by treating it as no stored preference.
    return "list";
  }
  return "list";
}

function createViewModeStore(storageKey: string): ViewModeStore {
  let mode = $state<ViewMode>(loadFromStorage(storageKey));

  return {
    get mode(): ViewMode {
      return mode;
    },
    set(value: ViewMode): void {
      mode = value;
      try {
        localStorage.setItem(storageKey, value);
      } catch {
        // Storage full or restricted
      }
    },
  };
}

/** Tickets list view mode (key predates the three-way union). */
export const viewModeStore = createViewModeStore("care-y-view-mode");

/** Dashboard ("Now") view mode, scoped separately from the tickets list. */
export const dashboardViewModeStore = createViewModeStore(
  "care-y-dashboard-view-mode",
);
