/**
 * Pure logic extracted from IntakeFormEditor.svelte for testability.
 * All functions are pure (no component state, no side effects).
 */

import {
  resolveLocalized,
  BASE_LOCALE,
  FORM_LOCALES,
  type LocalizedRichText,
  type LocalizedText,
  type FormLocale,
  type IntakeFieldConfig,
  type IntakeFieldType,
  type IntakeFieldRole,
  type VisibleWhen,
} from "@care-y/shared";
import {
  readLocale,
  hasRichValue,
  hasAnyRichContent,
  richValueJsonSize,
} from "$lib/utils/localized-text.js";

/** In-memory (decrypted) form field as edited in IntakeFormEditor. */
export interface PlaintextField {
  fieldKey: string;
  label: LocalizedText;
  helpText: LocalizedText;
  isRequired: boolean;
  config: IntakeFieldConfig;
  fieldType: IntakeFieldType;
  role: IntakeFieldRole | null;
  routingQueueIds: string[] | null;
  escalationRecipientIds: string[] | null;
  visibleWhen?: VisibleWhen;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ContentCapField = "description" | "submitMessage" | "closedMessage";

export interface ContentCapErrors {
  description?: string;
  submitMessage?: string;
  closedMessage?: string;
}

/** Per-locale byte cap for rich text fields. */
export const RICH_TEXT_LOCALE_CAP = 30_000;

// ---------------------------------------------------------------------------
// Locale completeness
// ---------------------------------------------------------------------------

export interface CompletenessCount {
  filled: number;
  total: number;
}

/**
 * Count how many localizable items have content in the given locale.
 * Items include form-level meta (description, submit, closed) and
 * per-field labels, help text, option labels, and rich text bodies.
 */
export function computeLocaleCompleteness(
  loc: FormLocale,
  formDescription: LocalizedRichText,
  formSubmitMessage: LocalizedRichText,
  formClosedMessage: LocalizedRichText,
  fields: readonly PlaintextField[],
): CompletenessCount {
  let total = 0;
  let filled = 0;

  // Form-level rich text meta (rich-aware emptiness check)
  const descVal = loc === "en" ? formDescription.en : formDescription.es;
  const submitVal = loc === "en" ? formSubmitMessage.en : formSubmitMessage.es;
  const closedVal = loc === "en" ? formClosedMessage.en : formClosedMessage.es;

  if (descVal !== undefined && hasRichValue(descVal)) filled++;
  if (submitVal !== undefined && hasRichValue(submitVal)) filled++;
  if (closedVal !== undefined && hasRichValue(closedVal)) filled++;

  // Only count meta fields that have content in at least one locale
  if (hasAnyRichContent(formDescription)) total++;
  if (hasAnyRichContent(formSubmitMessage)) total++;
  if (hasAnyRichContent(formClosedMessage)) total++;

  // Field labels, help text, and rich text bodies
  for (const field of fields) {
    // Rich text blocks have body content instead of a label
    if (field.fieldType === "richText") {
      const cfg = field.config;
      if (cfg.type === "richText" && hasAnyRichContent(cfg.body)) {
        total++;
        const bodyVal = loc === "en" ? cfg.body.en : cfg.body.es;
        if (bodyVal !== undefined && hasRichValue(bodyVal)) filled++;
      }
      continue;
    }

    total++; // label is always required
    const labelVal = readLocale(field.label, loc);
    if (labelVal.length > 0) filled++;

    // Help text: only count if it exists in any locale
    if (resolveLocalized(field.helpText, BASE_LOCALE) != null) {
      total++;
      const ht = readLocale(field.helpText, loc);
      if (ht.length > 0) filled++;
    }

    // Option labels
    const cfg = field.config;
    if (cfg.type === "select" || cfg.type === "multiselect") {
      for (const opt of cfg.options) {
        total++;
        const label = resolveLocalized(opt.label, loc);
        if (label != null && label.length > 0) filled++;
      }
    }
  }

  return { filled, total };
}

// ---------------------------------------------------------------------------
// Cap validation
// ---------------------------------------------------------------------------

/**
 * Set or clear a single cap-error field on a ContentCapErrors object.
 * Returns a new object (immutable).
 */
export function setCapError(
  prev: ContentCapErrors,
  field: ContentCapField,
  msg: string | undefined,
): ContentCapErrors {
  switch (field) {
    case "description":
      return { ...prev, description: msg };
    case "submitMessage":
      return { ...prev, submitMessage: msg };
    case "closedMessage":
      return { ...prev, closedMessage: msg };
  }
}

/**
 * Validate per-locale cap on a named rich text field.
 * Returns the updated errors object and a boolean indicating pass/fail.
 */
export function validateRichTextCap(
  field: ContentCapField,
  value: LocalizedRichText,
  capMsg: string,
  prevErrors: ContentCapErrors,
): { errors: ContentCapErrors; valid: boolean } {
  for (const loc of FORM_LOCALES) {
    const v = loc === "en" ? value.en : value.es;
    if (v !== undefined && richValueJsonSize(v) > RICH_TEXT_LOCALE_CAP) {
      return { errors: setCapError(prevErrors, field, capMsg), valid: false };
    }
  }
  return { errors: setCapError(prevErrors, field, undefined), valid: true };
}

/**
 * Validate per-locale cap on a richText field body.
 * Returns true if all locales pass, false with the error message otherwise.
 */
export function validateFieldBodyCap(
  field: PlaintextField,
  capMsg: string,
): { valid: boolean; error: string | undefined } {
  if (field.config.type !== "richText")
    return { valid: true, error: undefined };
  for (const loc of FORM_LOCALES) {
    const v = loc === "en" ? field.config.body.en : field.config.body.es;
    if (v !== undefined && richValueJsonSize(v) > RICH_TEXT_LOCALE_CAP) {
      return { valid: false, error: capMsg };
    }
  }
  return { valid: true, error: undefined };
}

// ---------------------------------------------------------------------------
// Preview helpers
// ---------------------------------------------------------------------------

/** Type guard for unknown arrays. Keeps eslint unsafe-argument quiet. */
export function isUnknownArray(
  candidate: unknown,
): candidate is readonly unknown[] {
  return Array.isArray(candidate);
}

/** Recursively extract text from ProseMirror doc content nodes. */
export function extractDocText(content: readonly unknown[]): string {
  const parts: string[] = [];
  for (const node of content) {
    if (typeof node !== "object" || node === null) continue;
    if ("text" in node && typeof node.text === "string") {
      parts.push(node.text);
    }
    if ("content" in node && isUnknownArray(node.content)) {
      parts.push(extractDocText(node.content));
    }
  }
  return parts.join(" ");
}

/**
 * Extract a short plain-text preview from a richText field body for the
 * field list row. Tries the base locale first. Returns up to 60 chars
 * with an ellipsis if truncated.
 *
 * @param field The field whose body to preview.
 * @param emptyLabel Fallback label when no content exists.
 */
export function richTextBodyPreview(
  field: PlaintextField,
  emptyLabel: string,
): string {
  if (field.config.type !== "richText") return "";
  const body = field.config.body;

  // Try base locale first, then any locale
  const value = body.en ?? body.es;
  if (value === undefined) return emptyLabel;

  let plain: string;
  if (typeof value === "string") {
    plain = value;
  } else if (
    typeof value === "object" &&
    "content" in value &&
    Array.isArray(value.content)
  ) {
    plain = extractDocText(value.content);
  } else {
    return emptyLabel;
  }

  const trimmed = plain.trim();
  if (trimmed.length === 0) return emptyLabel;
  if (trimmed.length > 60) return trimmed.slice(0, 60) + "...";
  return trimmed;
}

/**
 * Resolve the preview-locale value from a LocalizedRichText map.
 * Falls back to the base locale. Returns the raw value (string or doc JSON)
 * for renderFormRichText, or undefined if no content.
 */
export function resolveRichPreview(
  richText: LocalizedRichText,
  loc: FormLocale,
): string | { type: "doc"; content: unknown[] } | undefined {
  const direct = loc === "en" ? richText.en : richText.es;
  if (direct !== undefined && hasRichValue(direct)) return direct;
  if (loc !== BASE_LOCALE) {
    const fallback = richText.en;
    if (fallback !== undefined && hasRichValue(fallback)) return fallback;
  }
  return undefined;
}
