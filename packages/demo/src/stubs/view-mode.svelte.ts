/**
 * Stub for $lib/stores/view-mode.svelte.
 *
 * The real store persists to localStorage at module scope, which would
 * permanently change a visitor's view preference. This stub holds state
 * in memory and resets on page reload.
 */

export type ViewMode = "list" | "cards" | "table" | "grid" | "kanban";

export interface ViewModeStore {
  readonly mode: ViewMode;
  set(value: ViewMode): void;
}

let currentMode = $state<ViewMode>("list");

export const viewModeStore: ViewModeStore = {
  get mode(): ViewMode {
    return currentMode;
  },
  set(value: ViewMode): void {
    currentMode = value;
  },
};

let dashboardMode = $state<ViewMode>("cards");

export const dashboardViewModeStore: ViewModeStore = {
  get mode(): ViewMode {
    return dashboardMode;
  },
  set(value: ViewMode): void {
    dashboardMode = value;
  },
};
