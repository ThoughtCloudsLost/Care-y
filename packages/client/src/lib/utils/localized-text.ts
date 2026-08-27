/**
 * Pure helpers for working with LocalizedText objects in the form builder.
 * Extracted from IntakeFormEditor and IntakeFieldConfigSheet to deduplicate.
 */

import {
  FORM_LOCALES,
  type LocalizedText,
  type LocalizedRichText,
  type FormLocale,
  type ProseMirrorDocJSON,
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
 * Read one locale's rich value with English fallback. Spanish falls back
 * to English when unset; English has no fallback.
 */
export function readRichLocale(
  value: LocalizedRichText | undefined,
  loc: FormLocale,
): string | ProseMirrorDocJSON | undefined {
  if (value == null) return undefined;
  if (loc === "en") return value.en;
  return value.es ?? value.en;
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

// ---------------------------------------------------------------------------
// Rich-text-aware helpers (LocalizedRichText)
// ---------------------------------------------------------------------------

/**
 * Check whether a single rich-text locale value has meaningful content.
 * Strings are checked via trim().length; ProseMirror doc objects are
 * non-empty when their content array has at least one node.
 *
 * Exported so both IntakeFormEditor (completeness checks) and
 * intake-form-crypto (encryptFormMeta emptiness check) can share it
 * without duplication.
 */
export function hasRichValue(v: string | ProseMirrorDocJSON): boolean {
  if (typeof v === "string") return v.trim().length > 0;
  return Array.isArray(v.content) && v.content.length > 0;
}

/**
 * Check whether a LocalizedRichText record has any non-empty locale value.
 * Returns false for undefined/null inputs.
 */
export function hasAnyRichContent(
  localized: LocalizedRichText | undefined,
): boolean {
  if (localized == null) return false;
  return Object.values(localized).some((v) => hasRichValue(v));
}

/**
 * Strip empty locale entries from a LocalizedRichText for storage.
 * Empty strings (after trim) and doc objects with no content nodes
 * are dropped. Non-empty strings are trimmed. Doc objects pass through
 * unchanged.
 */
export function trimLocalizedRichText(
  text: LocalizedRichText | undefined,
): LocalizedRichText {
  if (text == null) return {};
  const result: LocalizedRichText = {};
  for (const loc of FORM_LOCALES) {
    // eslint-disable-next-line security/detect-object-injection -- loc is from the FORM_LOCALES const tuple
    const v = text[loc];
    if (v === undefined) continue;
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (trimmed.length > 0) {
        // eslint-disable-next-line security/detect-object-injection -- loc is from the FORM_LOCALES const tuple
        result[loc] = trimmed;
      }
    } else if (Array.isArray(v.content) && v.content.length > 0) {
      // eslint-disable-next-line security/detect-object-injection -- loc is from the FORM_LOCALES const tuple
      result[loc] = v;
    }
  }
  return result;
}

/**
 * Compute the byte size of a single rich-text locale value when serialized
 * to JSON. Used for the per-locale 30K cap enforcement.
 */
export function richValueJsonSize(v: string | ProseMirrorDocJSON): number {
  if (typeof v === "string") return v.length;
  return JSON.stringify(v).length;
}
