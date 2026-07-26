/**
 * Stub for $lib/stores/new-replies-first.svelte.
 *
 * The real store persists to localStorage at module scope. This stub
 * holds state in memory with a default of true (matching the real
 * module's default).
 */

export interface NewRepliesFirstStore {
  readonly enabled: boolean;
  set(value: boolean): void;
  toggle(): void;
}

let enabled = $state(true);

export const newRepliesFirstStore: NewRepliesFirstStore = {
  get enabled(): boolean {
    return enabled;
  },
  set(value: boolean): void {
    enabled = value;
  },
  toggle(): void {
    enabled = !enabled;
  },
};
