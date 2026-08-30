/**
 * SPA-safe locale store.
 *
 * Tracks the active Paraglide locale in a reactive $state so that
 * components can re-render translated strings without a full page
 * reload. The portal page relies on this: a reload there destroys
 * the session because the fragment has already been stripped.
 *
 * Initialization is lazy: getLocale() reads cookies through the
 * Paraglide runtime, and calling it at module-import time would run
 * during the import graph's evaluation, before consumers (or test
 * mocks) have finished setting up. The first read resolves it instead.
 */

import { getLocale, baseLocale, type Locale } from "$lib/paraglide/runtime.js";

export interface UiLocaleStore {
  /** Current locale. Reactive (backed by $state). */
  readonly locale: Locale;
  /** Update the locale after setLocale() has been called. */
  set(locale: Locale): void;
}

function createUiLocaleStore(): UiLocaleStore {
  let current = $state<Locale | null>(null);

  function resolveInitial(): Locale {
    return typeof window !== "undefined" ? getLocale() : baseLocale;
  }

  return {
    get locale(): Locale {
      return current ?? resolveInitial();
    },
    set(locale: Locale): void {
      current = locale;
    },
  };
}

export const uiLocaleStore = createUiLocaleStore();
