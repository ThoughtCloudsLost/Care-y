/**
 * In-memory replacement for $lib/stores/persisted-state.svelte.ts.
 *
 * This single alias kills the per-store stub treadmill: every persisted
 * store in the client imports createPersistedState from this module path,
 * so aliasing ONE file collapses ALL of them into working in-memory state.
 * No localStorage access, no cross-tab sync, no SSR guard needed.
 */

export interface PersistedStateOptions<T> {
  readonly validate: (raw: string) => T | undefined;
  readonly serialize?: (value: T) => string;
}

export interface PersistedState<T> {
  readonly value: T;
  set(value: T): void;
}

export function createPersistedState<T>(
  _storageKey: string,
  fallback: T,
  _options: PersistedStateOptions<T>,
): PersistedState<T> {
  let current = $state<T>(fallback);

  return {
    get value(): T {
      return current;
    },
    set(value: T): void {
      current = value;
    },
  };
}
