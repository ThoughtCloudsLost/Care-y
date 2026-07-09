/**
 * View mode store for the admin user list.
 * Persists list/grid preference to localStorage.
 */

export type UserViewMode = "list" | "grid";

const STORAGE_KEY = "care-y-user-view-mode";

const VALID_MODES: ReadonlySet<string> = new Set<UserViewMode>([
  "list",
  "grid",
]);

function isUserViewMode(value: string): value is UserViewMode {
  return VALID_MODES.has(value);
}

function loadFromStorage(): UserViewMode {
  if (typeof window === "undefined") return "list";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null && isUserViewMode(stored)) return stored;
  } catch {
    // Safari private browsing, storage quota, or restricted context:
    // recover by treating it as no stored preference.
    return "list";
  }
  return "list";
}

function createUserViewModeStore(): {
  readonly mode: UserViewMode;
  set(value: UserViewMode): void;
} {
  let mode = $state<UserViewMode>(loadFromStorage());

  return {
    get mode(): UserViewMode {
      return mode;
    },
    set(value: UserViewMode): void {
      mode = value;
      try {
        localStorage.setItem(STORAGE_KEY, value);
        // care-y-ignore-next-line no-swallowed-errors -- best-effort persistence: the mode already changed in memory and a full or restricted storage must stay silent
      } catch {
        // Storage full or restricted
      }
    },
  };
}

export const userViewModeStore = createUserViewModeStore();
