/**
 * Pure logic extracted from IntakeFormBody.svelte.
 *
 * Validation (per-field type checks, format checks), page-break slicing,
 * and visibility-aware page indexing are stateless functions that operate
 * on form state passed in. The component consumes them; no render timing
 * or validation message text changes.
 */

import {
  evaluateVisibility,
  isDataFieldType,
  type IntakeFieldConfig,
  type IntakeFieldType,
  type IntakeFieldRole,
  type LocalizedText,
  type VisibleWhen,
  type AvailabilityData,
} from "@care-y/shared";

// ---------------------------------------------------------------------------
// Types (mirrored from IntakeFormBody; kept minimal to avoid coupling)
// ---------------------------------------------------------------------------

/** A decrypted intake field definition. */
export interface PlaintextField {
  readonly fieldKey: string;
  readonly fieldType: IntakeFieldType;
  readonly role: IntakeFieldRole | null;
  readonly label: LocalizedText;
  readonly config: IntakeFieldConfig;
  readonly isRequired: boolean;
  readonly visibleWhen?: VisibleWhen;
}

/** Field value union matching IntakeFormBody's fieldValues record. */
export type FieldValue =
  string | string[] | AvailabilityData | boolean | undefined;

/** A single page within a multi-page form. */
export interface FormPage {
  readonly title?: LocalizedText;
  readonly fields: readonly PlaintextField[];
}

/** Localized error messages the validator needs. */
export interface ValidationMessages {
  readonly fieldRequired: string;
  readonly messageRequired: string;
  readonly emailFormat: string;
  readonly phoneFormat: string;
  readonly numberFormat: string;
  readonly numberMin: (min: string) => string;
  readonly numberMax: (max: string) => string;
  readonly dateFormat: string;
}

type ContactMethod = "phone" | "email" | "none";

// ---------------------------------------------------------------------------
// Visibility
// ---------------------------------------------------------------------------

/** Whether a field is visible given current field values. */
export function isFieldVisible(
  field: PlaintextField,
  fieldValues: Readonly<Record<string, FieldValue>>,
): boolean {
  return evaluateVisibility(field.visibleWhen, fieldValues);
}

// ---------------------------------------------------------------------------
// Page-break slicing
// ---------------------------------------------------------------------------

/**
 * Split form fields into pages at page-break boundaries. The first page
 * starts implicitly; each page-break field begins a new page and carries
 * an optional localized title.
 */
export function splitIntoPages(
  fields: readonly PlaintextField[],
): readonly FormPage[] {
  const pages: FormPage[] = [];
  let currentFields: PlaintextField[] = [];
  let currentTitle: LocalizedText | undefined = undefined;

  for (const field of fields) {
    if (field.fieldType === "pageBreak") {
      pages.push({ title: currentTitle, fields: currentFields });
      currentFields = [];
      currentTitle = field.label;
    } else {
      currentFields.push(field);
    }
  }
  pages.push({ title: currentTitle, fields: currentFields });
  return pages;
}

/**
 * Compute visible page indices: pages where at least one field is visible,
 * plus always the first page (which holds intro content).
 */
export function visiblePageIndices(
  pages: readonly FormPage[],
  fieldValues: Readonly<Record<string, FieldValue>>,
): readonly number[] {
  const indices: number[] = [];
  for (let i = 0; i < pages.length; i++) {
    const page = pages.at(i);
    if (page === undefined) continue;
    const hasVisibleField = page.fields.some((f) =>
      isFieldVisible(f, fieldValues),
    );
    if (i === 0 || hasVisibleField) {
      indices.push(i);
    }
  }
  return indices;
}

// ---------------------------------------------------------------------------
// Format validators (loose client-side checks)
// ---------------------------------------------------------------------------

/** Loose email check (not a full RFC 5322 check). */
export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/** Loose phone check: 7-15 digits, optional leading +, spaces/dashes OK. */
export function isValidPhone(s: string): boolean {
  const digits = s.replace(/[\s\-().+]/g, "");
  return /^\d{7,15}$/.test(digits);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface ValidationResult {
  readonly errors: Readonly<Record<string, string | undefined>>;
  readonly contactDetailError: string | undefined;
  readonly valid: boolean;
}

/**
 * Validate intake form fields. When `fieldsToValidate` is provided, only
 * those fields are checked; otherwise all visible fields are checked.
 *
 * Pure function: reads field definitions, current values, and messages,
 * returns a validation result without side effects.
 */
export function validateFields(opts: {
  fields: readonly PlaintextField[];
  fieldValues: Readonly<Record<string, FieldValue>>;
  messages: ValidationMessages;
  isDefaultForm: boolean;
  contactMethod: ContactMethod;
  contactDetail: string;
  accountExpanded: boolean;
  accountPassword: string;
  accountConfirmPassword: string;
  fieldsToValidate?: readonly PlaintextField[];
}): ValidationResult {
  const errors: Record<string, string | undefined> = {};
  let valid = true;
  const msgs = opts.messages;

  const fieldsToCheck = opts.fieldsToValidate ?? opts.fields;

  for (const field of fieldsToCheck) {
    if (!isDataFieldType(field.fieldType)) continue;
    if (!isFieldVisible(field, opts.fieldValues)) continue;

    const val = opts.fieldValues[field.fieldKey];

    // Required check per field type
    if (field.isRequired) {
      if (field.fieldType === "text" || field.fieldType === "textarea") {
        if (typeof val !== "string" || val.trim() === "") {
          errors[field.fieldKey] =
            field.fieldType === "textarea"
              ? msgs.messageRequired
              : msgs.fieldRequired;
          valid = false;
          continue;
        }
      } else if (field.fieldType === "select") {
        if (typeof val !== "string" || val === "") {
          errors[field.fieldKey] = msgs.fieldRequired;
          valid = false;
          continue;
        }
      } else if (field.fieldType === "multiselect") {
        if (!Array.isArray(val) || val.length === 0) {
          errors[field.fieldKey] = msgs.fieldRequired;
          valid = false;
          continue;
        }
      } else if (field.fieldType === "checkbox") {
        if (
          field.config.type === "checkbox" &&
          field.config.requiredTrue === true &&
          val !== true
        ) {
          errors[field.fieldKey] = msgs.fieldRequired;
          valid = false;
          continue;
        }
      } else if (field.fieldType === "date") {
        if (typeof val !== "string" || val === "") {
          errors[field.fieldKey] = msgs.fieldRequired;
          valid = false;
          continue;
        }
      } else {
        // availability
        if (
          val === undefined ||
          typeof val !== "object" ||
          Array.isArray(val) ||
          typeof val === "boolean"
        ) {
          errors[field.fieldKey] = msgs.fieldRequired;
          valid = false;
          continue;
        } else if (val.recurring.length === 0 && val.specific.length === 0) {
          errors[field.fieldKey] = msgs.fieldRequired;
          valid = false;
          continue;
        }
      }
    }

    // Subtype format validation for text fields
    if (
      field.fieldType === "text" &&
      field.config.type === "text" &&
      typeof val === "string" &&
      val.trim() !== ""
    ) {
      const sub = field.config.subtype;
      if (sub === "email" && !isValidEmail(val)) {
        errors[field.fieldKey] = msgs.emailFormat;
        valid = false;
        continue;
      }
      if (sub === "phone" && !isValidPhone(val)) {
        errors[field.fieldKey] = msgs.phoneFormat;
        valid = false;
        continue;
      }
      if (sub === "number") {
        const num = Number(val);
        if (Number.isNaN(num)) {
          errors[field.fieldKey] = msgs.numberFormat;
          valid = false;
          continue;
        }
        const range = field.config.numberRange;
        if (range?.min !== undefined && num < range.min) {
          errors[field.fieldKey] = msgs.numberMin(String(range.min));
          valid = false;
          continue;
        }
        if (range?.max !== undefined && num > range.max) {
          errors[field.fieldKey] = msgs.numberMax(String(range.max));
          valid = false;
          continue;
        }
      }
    }

    // Date format validation (YYYY-MM-DD)
    if (
      field.fieldType === "date" &&
      typeof val === "string" &&
      val !== "" &&
      !/^\d{4}-\d{2}-\d{2}$/.test(val)
    ) {
      errors[field.fieldKey] = msgs.dateFormat;
      valid = false;
    }
  }

  // Default form contact detail
  let contactDetailError: string | undefined;
  if (opts.isDefaultForm) {
    if (opts.contactMethod === "phone" && opts.contactDetail.trim() === "") {
      contactDetailError = msgs.fieldRequired;
      valid = false;
    } else if (
      opts.contactMethod === "email" &&
      opts.contactDetail.trim() === ""
    ) {
      contactDetailError = msgs.fieldRequired;
      valid = false;
    }
  }

  // Account opt-in password match
  if (opts.accountExpanded) {
    if (
      opts.accountPassword.length > 0 &&
      opts.accountPassword !== opts.accountConfirmPassword
    ) {
      valid = false;
    }
  }

  return { errors, contactDetailError, valid };
}

// ---------------------------------------------------------------------------
// Issue collection (for validation summaries)
// ---------------------------------------------------------------------------

/** A single validation issue tied to a specific field. */
export interface ValidationIssue {
  readonly fieldKey: string;
  readonly fieldLabel: string;
  readonly error: string;
  /** 1-based page number (present only in cross-page summaries). */
  readonly pageNumber?: number;
}

/**
 * Message functions for issue summary rows. The caller injects the
 * localized templates so this module stays locale-agnostic, mirroring
 * the ValidationMessages pattern above.
 */
export interface IssueRowMessages {
  readonly issueRow: (params: { field: string; error: string }) => string;
  readonly issueRowWithPage: (params: {
    page: string;
    field: string;
    error: string;
  }) => string;
}

/** Format a single-page issue row. */
export function formatIssueRow(
  issue: ValidationIssue,
  messages: IssueRowMessages,
): string {
  return messages.issueRow({ field: issue.fieldLabel, error: issue.error });
}

/** Format a cross-page issue row (includes the page number). */
export function formatCrossPageIssueRow(
  issue: ValidationIssue,
  messages: IssueRowMessages,
): string {
  return messages.issueRowWithPage({
    page: String(issue.pageNumber ?? 1),
    field: issue.fieldLabel,
    error: issue.error,
  });
}

/**
 * Index of the next page in `visibleIndices` after `currentIndex`, or
 * null when already on the last visible page (or off the list).
 */
export function nextVisibleIndex(
  visibleIndices: readonly number[],
  currentIndex: number,
): number | null {
  const pos = visibleIndices.indexOf(currentIndex);
  if (pos < 0 || pos >= visibleIndices.length - 1) return null;
  return visibleIndices.at(pos + 1) ?? null;
}

/**
 * Index of the previous page in `visibleIndices` before `currentIndex`,
 * or null when already on the first visible page (or off the list).
 */
export function prevVisibleIndex(
  visibleIndices: readonly number[],
  currentIndex: number,
): number | null {
  const pos = visibleIndices.indexOf(currentIndex);
  if (pos <= 0) return null;
  return visibleIndices.at(pos - 1) ?? null;
}

/**
 * Collect validation issues for a single page's visible fields.
 * Returns an array of issues (empty when everything validates).
 *
 * `resolveLabel` turns a PlaintextField into a display string for the
 * summary row. The caller provides it so this function stays locale-agnostic.
 */
export function collectPageIssues(
  page: FormPage,
  fieldValues: Readonly<Record<string, FieldValue>>,
  messages: ValidationMessages,
  resolveLabel: (field: PlaintextField) => string,
): readonly ValidationIssue[] {
  const result = validateFields({
    fields: page.fields,
    fieldValues,
    messages,
    isDefaultForm: false,
    contactMethod: "none",
    contactDetail: "",
    accountExpanded: false,
    accountPassword: "",
    accountConfirmPassword: "",
    fieldsToValidate: page.fields,
  });

  const issues: ValidationIssue[] = [];
  for (const field of page.fields) {
    const err = result.errors[field.fieldKey];
    if (err !== undefined && err !== "") {
      issues.push({
        fieldKey: field.fieldKey,
        fieldLabel: resolveLabel(field),
        error: err,
      });
    }
  }
  return issues;
}

/**
 * Collect validation issues across all visible pages. Each issue carries a
 * 1-based page number so the summary can direct the visitor to the right page.
 */
export function collectAllIssues(
  pages: readonly FormPage[],
  visibleIndices: readonly number[],
  fieldValues: Readonly<Record<string, FieldValue>>,
  messages: ValidationMessages,
  resolveLabel: (field: PlaintextField) => string,
): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (let vi = 0; vi < visibleIndices.length; vi++) {
    const pageIdx = visibleIndices.at(vi);
    if (pageIdx === undefined) continue;
    const page = pages.at(pageIdx);
    if (page === undefined) continue;
    const pageIssues = collectPageIssues(
      page,
      fieldValues,
      messages,
      resolveLabel,
    );
    for (const issue of pageIssues) {
      issues.push({ ...issue, pageNumber: vi + 1 });
    }
  }
  return issues;
}
