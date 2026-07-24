/**
 * Persisted "New replies first" toggle for the tickets list.
 *
 * Defaults to on (the mock leads with the sort pill active). This is
 * page-level presentation state, not a filterStore server param: the
 * server cannot sort by read state, so the toggle only drives the
 * client-side partition over the loaded window.
 */

import { createPersistedState } from "./persisted-state.svelte.js";

const STORAGE_KEY = "care-y-new-replies-first";

export interface NewRepliesFirstStore {
  readonly enabled: boolean;
  set(value: boolean): void;
  toggle(): void;
}

const state = createPersistedState<boolean>(STORAGE_KEY, true, {
  validate: (raw) => {
    if (raw === "true") return true;
    if (raw === "false") return false;
    return undefined;
  },
});

export const newRepliesFirstStore: NewRepliesFirstStore = {
  get enabled(): boolean {
    return state.value;
  },
  set(value: boolean): void {
    state.set(value);
  },
  toggle(): void {
    state.set(!state.value);
  },
};
