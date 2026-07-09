/**
 * Persisted "New replies first" toggle for the tickets list.
 *
 * Defaults to on (the mock leads with the sort pill active). This is
 * page-level presentation state, not a filterStore server param: the
 * server cannot sort by read state, so the toggle only drives the
 * client-side partition over the loaded window.
 */

const STORAGE_KEY = "care-y-new-replies-first";

export interface NewRepliesFirstStore {
  readonly enabled: boolean;
  set(value: boolean): void;
  toggle(): void;
}

function loadFromStorage(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
  } catch {
    // Safari private browsing, storage quota, or restricted context:
    // recover by treating it as no stored preference.
    return true;
  }
  return true;
}

function createNewRepliesFirstStore(): NewRepliesFirstStore {
  let enabled = $state<boolean>(loadFromStorage());

  function persist(value: boolean): void {
    enabled = value;
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
      // care-y-ignore-next-line no-swallowed-errors -- best-effort persistence: the toggle already changed in memory and a full or restricted storage must stay silent
    } catch {
      // Storage full or restricted
    }
  }

  return {
    get enabled(): boolean {
      return enabled;
    },
    set(value: boolean): void {
      persist(value);
    },
    toggle(): void {
      persist(!enabled);
    },
  };
}

export const newRepliesFirstStore = createNewRepliesFirstStore();
