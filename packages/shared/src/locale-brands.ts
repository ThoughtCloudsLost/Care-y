/**
 * Branded locale types for display-path safety.
 *
 * ReaderLocale is the locale the current reader is using, obtainable only
 * through getReaderLocale() (which wraps paraglide's getLocale()). Display
 * paths that resolve localized content for the reader take ReaderLocale,
 * so passing a bare "en" literal stops compiling.
 *
 * Legitimate fixed-locale sites (form editor authoring locale, pre-login
 * terminology defaults) use FixedLocale, obtained through asFixedLocale(),
 * which accepts BASE_LOCALE or any explicit string. The two types are
 * distinct: a FixedLocale is not assignable to ReaderLocale and vice versa,
 * so deliberate pinning stays visible while accidental pinning fails.
 *
 * Both types are assignable to plain `string` (branded subtypes), so
 * existing call sites that accept `string` keep compiling without changes.
 */

/** The reader's active locale, obtained only from getReaderLocale(). */
export type ReaderLocale = string & { readonly __brand: "ReaderLocale" };

/**
 * An explicitly chosen fixed locale (e.g. BASE_LOCALE for form editing,
 * TERMINOLOGY_DEFAULTS_EN for pre-login). Obtained through asFixedLocale().
 */
export type FixedLocale = string & { readonly __brand: "FixedLocale" };

/** A locale parameter that accepts either brand for display functions. */
export type DisplayLocale = ReaderLocale | FixedLocale;

/**
 * Mint a ReaderLocale from a runtime locale value. Only the client's
 * getReaderLocale() wrapper (which reads paraglide's getLocale()) should
 * call this; display code receives the branded value.
 */
export function mintReaderLocale(locale: string): ReaderLocale {
  return locale as ReaderLocale;
}

/**
 * Brand an explicitly chosen locale as FixedLocale, keeping deliberate
 * pinning visible at the call site.
 */
export function mintFixedLocale(locale: string): FixedLocale {
  return locale as FixedLocale;
}
