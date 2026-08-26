/**
 * Pure helpers for working with LocalizedText objects in the form builder.
 * Extracted from IntakeFormEditor and IntakeFieldConfigSheet to deduplicate.
 */

import type {
  LocalizedText,
  LocalizedRichText,
  FormLocale,
} from "@care-y/shared";

/** Read a locale key from a LocalizedText object. Returns empty string for missing values. */
export function readLocale(text: LocalizedText, loc: FormLocale): string {
  if (loc === "en") return text.en ?? "";
  return text.es ?? "";
}

/** Return a new LocalizedText with one locale key set. */
export function setLocaleText(
  text: LocalizedText,
  loc: FormLocale,
  value: string,
): LocalizedText {
  if (loc === "en") return { ...text, en: value };
  return { ...text, es: value };
}

/** True if a LocalizedText has content in any locale. */
export function hasContent(text: LocalizedText): boolean {
  const en = text.en;
  const es = text.es;
  return (
    (en != null && en.trim().length > 0) || (es != null && es.trim().length > 0)
  );
}

/**
 * Narrow a LocalizedRichText value to LocalizedText by passing strings
 * through and converting ProseMirror doc objects to empty strings.
 *
 * The form editor currently authors plain strings only. Once the
 * rich content editor ships, this function should convert doc JSON
 * to a rendered plain-text extract instead of returning "".
 */
export function richTextToLocalizedText(
  value: LocalizedRichText | undefined,
): LocalizedText {
  if (value == null) return {};
  const result: LocalizedText = {};
  const en = value.en;
  if (typeof en === "string") result.en = en;
  const es = value.es;
  if (typeof es === "string") result.es = es;
  // Doc objects are dropped (empty string) until the rich editor ships
  return result;
}

/**
 * Resolve a single locale value from a LocalizedRichText. Returns the
 * string for that locale when present, or undefined. Doc objects resolve
 * to undefined until the rich render task ships.
 */
export function resolveRichTextLocale(
  value: LocalizedRichText | undefined,
  locale: FormLocale,
): string | undefined {
  if (value == null) return undefined;
  // eslint-disable-next-line security/detect-object-injection -- locale is from the FormLocale enum
  const v = value[locale];
  if (typeof v === "string" && v.length > 0) return v;
  return undefined;
}

/** Strip empty-string locale entries from a LocalizedText for storage. */
export function trimLocalized(text: LocalizedText): LocalizedText {
  const result: LocalizedText = {};
  const en = text.en;
  const es = text.es;
  if (en != null && en.trim().length > 0) result.en = en.trim();
  if (es != null && es.trim().length > 0) result.es = es.trim();
  return result;
}
