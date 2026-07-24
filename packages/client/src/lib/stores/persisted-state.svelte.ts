/**
 * Shared localStorage-persisted state primitive.
 *
 * Owns the load-guard-persist skeleton the persisted stores repeat: the
 * SSR window guard, the guarded read with validation, and the best-effort
 * write. Persistence failures (Safari private browsing, storage quota,
 * restricted contexts) never surface: the in-memory value is the source
 * of truth and storage is a cache of it.
 */

export interface PersistedStateOptions<T> {
  /**
   * Turns a raw stored string into a value, or undefined to reject it.
   * Rejected and missing values both resolve to the fallback, so T must
   * not itself include undefined.
   */
  readonly validate: (raw: string) => T | undefined;
  /** Serializes a value for storage. Defaults to String. */
  readonly serialize?: (value: T) => string;
}

export interface PersistedState<T> {
  readonly value: T;
  set(value: T): void;
}

export function createPersistedState<T>(
  storageKey: string,
  fallback: T,
  options: PersistedStateOptions<T>,
): PersistedState<T> {
  const serialize = options.serialize ?? String;

  function load(): T {
    if (typeof window === "undefined") return fallback;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        const validated = options.validate(stored);
        if (validated !== undefined) return validated;
      }
    } catch {
      // Safari private browsing, storage quota, or restricted context:
      // recover by treating it as no stored preference.
      return fallback;
    }
    return fallback;
  }

  let current = $state<T>(load());

  return {
    get value(): T {
      return current;
    },
    set(value: T): void {
      current = value;
      try {
        localStorage.setItem(storageKey, serialize(value));
        // care-y-ignore-next-line no-swallowed-errors -- best-effort persistence: the value already changed in memory and a full or restricted storage must stay silent
      } catch {
        // Storage full or restricted
      }
    },
  };
}
