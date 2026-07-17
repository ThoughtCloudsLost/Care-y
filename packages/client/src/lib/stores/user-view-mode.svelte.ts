/**
 * View mode store for the admin user list.
 * Persists a list/grid preference to localStorage.
 */

import { createPersistedState } from "./persisted-state.svelte.js";

export type UserViewMode = "list" | "grid";

const STORAGE_KEY = "care-y-user-view-mode";

const VALID_MODES: ReadonlySet<string> = new Set<UserViewMode>([
  "list",
  "grid",
]);

function isUserViewMode(value: string): value is UserViewMode {
  return VALID_MODES.has(value);
}

const state = createPersistedState<UserViewMode>(STORAGE_KEY, "list", {
  validate: (raw) => (isUserViewMode(raw) ? raw : undefined),
});

export const userViewModeStore = {
  get mode(): UserViewMode {
    return state.value;
  },
  set(value: UserViewMode): void {
    state.set(value);
  },
};
