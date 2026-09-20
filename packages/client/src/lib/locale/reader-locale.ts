/**
 * Helpers for minting branded locale types.
 *
 * getReaderLocale() wraps paraglide's getLocale() and returns a
 * ReaderLocale. Display paths that resolve localized content for the
 * reader should accept ReaderLocale, making a bare "en" literal a
 * compile error.
 *
 * asFixedLocale() wraps a known-good locale string (typically
 * BASE_LOCALE) into a FixedLocale for legitimate fixed-locale sites
 * like the form editor or pre-login terminology defaults.
 */

import { getLocale } from "$lib/paraglide/runtime.js";
import {
  mintReaderLocale,
  mintFixedLocale,
  type ReaderLocale,
  type FixedLocale,
} from "@care-y/shared";

/**
 * Return the current reader's locale as a ReaderLocale.
 * Wraps paraglide's getLocale() with the brand.
 */
export function getReaderLocale(): ReaderLocale {
  return mintReaderLocale(getLocale());
}

/**
 * Brand an explicit locale string as FixedLocale.
 * Use for deliberate fixed-locale sites (BASE_LOCALE in the form
 * editor, TERMINOLOGY_DEFAULTS_EN pre-login pinning).
 */
export function asFixedLocale(locale: string): FixedLocale {
  return mintFixedLocale(locale);
}
