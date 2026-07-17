/**
 * View mode store for the KB article list.
 *
 * Persists a list/cards/table/grid preference under its own key. The
 * KbViewMode alias shares the tickets ViewMode union, but "kanban" is
 * deliberately not a valid KB mode (the board view is a tickets-only
 * concept), so a stored "kanban" falls back to cards here.
 */

import type { ViewMode } from "$lib/stores/view-mode.svelte.js";
import { createPersistedState } from "./persisted-state.svelte.js";

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

const state = createPersistedState<KbViewMode>(STORAGE_KEY, "cards", {
  validate: (raw) => (isKbViewMode(raw) ? raw : undefined),
});

export const kbViewModeStore = {
  get mode(): KbViewMode {
    return state.value;
  },
  set(value: KbViewMode): void {
    state.set(value);
  },
};
