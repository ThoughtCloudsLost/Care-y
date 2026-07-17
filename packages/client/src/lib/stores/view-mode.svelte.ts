/**
 * Persisted view mode stores for Inkwell surfaces (tickets list, dashboard).
 *
 * The Inkwell design language offers four presentations everywhere tickets
 * appear: "list" (compact ruled rows), "cards" (full-width cards with
 * conversation previews), "table" (columnar with headers), and "grid"
 * (multi-column). Each surface persists
 * its own preference under its own localStorage key.
 *
 * Migration note: the union used to be "list" | "grid". Both legacy values
 * remain valid members, so previously persisted preferences load unchanged;
 * anything unrecognized falls back to "list". The "kanban" mode is a
 * placeholder for a future board view; it is NOT the grid mode.
 */

import { createPersistedState } from "./persisted-state.svelte.js";

export type ViewMode = "list" | "cards" | "table" | "grid" | "kanban";

const VALID_MODES: ReadonlySet<string> = new Set<ViewMode>([
  "list",
  "cards",
  "table",
  "grid",
  "kanban",
]);

function isViewMode(value: string): value is ViewMode {
  return VALID_MODES.has(value);
}

export interface ViewModeStore {
  readonly mode: ViewMode;
  set(value: ViewMode): void;
}

function createViewModeStore(
  storageKey: string,
  fallback: ViewMode = "list",
): ViewModeStore {
  const state = createPersistedState<ViewMode>(storageKey, fallback, {
    validate: (raw) => (isViewMode(raw) ? raw : undefined),
  });

  return {
    get mode(): ViewMode {
      return state.value;
    },
    set(value: ViewMode): void {
      state.set(value);
    },
  };
}

/**
 * Tickets list view mode. The unsuffixed key predates the per-surface
 * keys (dashboard, kb, users) and the union's growth from the original
 * "list" | "grid" pair; values stored back then still load unchanged.
 */
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
