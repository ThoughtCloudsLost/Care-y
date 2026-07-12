/**
 * Persisted view mode stores for Inkwell surfaces (tickets list, dashboard).
 *
 * The Inkwell design language offers three presentations everywhere tickets
 * appear: "list" (compact ruled rows), "cards" (full-width cards with
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

function loadFromStorage(storageKey: string, fallback: ViewMode): ViewMode {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null && isViewMode(stored)) return stored;
  } catch {
    // Safari private browsing, storage quota, or restricted context:
    // recover by treating it as no stored preference.
    return fallback;
  }
  return fallback;
}

function createViewModeStore(
  storageKey: string,
  fallback: ViewMode = "list",
): ViewModeStore {
  let mode = $state<ViewMode>(loadFromStorage(storageKey, fallback));

  return {
    get mode(): ViewMode {
      return mode;
    },
    set(value: ViewMode): void {
      mode = value;
      try {
        localStorage.setItem(storageKey, value);
        // care-y-ignore-next-line no-swallowed-errors -- best-effort persistence: the mode already changed in memory and a full or restricted storage must stay silent
      } catch {
        // Storage full or restricted
      }
    },
  };
}

/** Tickets list view mode (key predates the three-way union). */
export const viewModeStore = createViewModeStore("care-y-view-mode");

/**
 * Dashboard ("Overview") view mode, scoped separately from the tickets list.
 * Cards are the work-mode primitive, so a first visit opens on cards;
 * a persisted preference always wins over the fallback.
 */
export const dashboardViewModeStore = createViewModeStore(
  "care-y-dashboard-view-mode",
  "cards",
);
