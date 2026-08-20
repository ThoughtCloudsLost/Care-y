/**
 * Reactive locale holder for the demo's paraglide runtime stub.
 *
 * Wraps the current locale in a Svelte 5 $state rune so that
 * overwriteGetLocale (called from paraglide-runtime.ts at module init)
 * returns a getter whose read is tracked by the Svelte compiler.
 * Every paraglide message call (`m.foo()`) ultimately calls getLocale(),
 * so changing the state here re-renders every visible message without a
 * page reload or component remount.
 *
 * This file MUST be .svelte.ts because runes ($state) are only legal
 * in .svelte and .svelte.ts modules.
 *
 * The locale state is per-browsing-context: the outer page and the
 * phone iframe each get their own instance (separate module graphs
 * from separate HTML entry points).
 */

import {
  getLocale,
  overwriteGetLocale,
  isLocale,
} from "../../../client/src/lib/paraglide/runtime.js";

type Locale = ReturnType<typeof getLocale>;

// Capture the strategy-resolved locale BEFORE overwriting getLocale.
// The real getLocale runs cookie/preferredLanguage/baseLocale strategies
// on its first call, so this read initializes from the user's stored
// preference rather than always defaulting to the base locale.
let currentLocale: Locale = $state(getLocale());

/**
 * Overwrite paraglide's getLocale with the reactive getter.
 * Called once at module evaluation time by paraglide-runtime.ts.
 */
export function installReactiveLocale(): void {
  overwriteGetLocale(() => currentLocale);
}

/**
 * Read the current reactive locale value.
 * Tracked by Svelte's fine-grained reactivity.
 */
export function getReactiveLocale(): Locale {
  return currentLocale;
}

/**
 * Update the reactive locale. Validates the value against the
 * paraglide locale set before writing.
 */
export function setReactiveLocale(locale: string): void {
  if (isLocale(locale)) {
    currentLocale = locale;
  }
}
