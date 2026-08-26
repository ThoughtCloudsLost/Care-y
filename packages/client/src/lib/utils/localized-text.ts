/**
 * Pure helpers for working with LocalizedText objects in the form builder.
 * Extracted from IntakeFormEditor and IntakeFieldConfigSheet to deduplicate.
 */

import type { LocalizedText, FormLocale } from "@care-y/shared";

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

/** Strip empty-string locale entries from a LocalizedText for storage. */
export function trimLocalized(text: LocalizedText): LocalizedText {
  const result: LocalizedText = {};
  const en = text.en;
  const es = text.es;
  if (en != null && en.trim().length > 0) result.en = en.trim();
  if (es != null && es.trim().length > 0) result.es = es.trim();
  return result;
}
