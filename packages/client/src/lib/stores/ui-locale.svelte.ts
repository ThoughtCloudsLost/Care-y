/**
 * SPA-safe locale store.
 *
 * Tracks the active Paraglide locale in a reactive $state so that
 * components can re-render translated strings without a full page
 * reload. The portal page relies on this: a reload there destroys
 * the session because the fragment has already been stripped.
 *
 * During SSR the store falls back to baseLocale. On the client the
 * initial value is resolved eagerly from the Paraglide cookie
 * strategy so that the picker label matches the active locale on
 * hydration without waiting for an explicit set() call.
 */

import { getLocale, baseLocale, type Locale } from "$lib/paraglide/runtime.js";

export interface UiLocaleStore {
  /** Current locale. Reactive (backed by $state). */
  readonly locale: Locale;
  /** Update the locale after setLocale() has been called. */
  set(locale: Locale): void;
}

function resolveInitial(): Locale {
  return typeof window !== "undefined" ? getLocale() : baseLocale;
}

function createUiLocaleStore(): UiLocaleStore {
  let current = $state<Locale>(resolveInitial());

  return {
    get locale(): Locale {
      return current;
    },
    set(locale: Locale): void {
      current = locale;
    },
  };
}

export const uiLocaleStore = createUiLocaleStore();
