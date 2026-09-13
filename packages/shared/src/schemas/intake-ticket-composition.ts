/**
 * Title, description, and structured response shaping for queue-facing
 * intake tickets.
 *
 * These functions define what a volunteer sees when reading an intake
 * ticket. They depend only on the answer list and field configs, with
 * no crypto, no DOM, and no browser APIs. Both the client-side
 * encryptIntake and server-side seed producers import from here so
 * the format has one definition.
 *
 * Output strings are hardcoded English ("Web intake", "Yes", "No").
 * Localization of ticket composition output is a separate decision
 * and is not addressed here.
 */

import {
  resolveLocalized,
  BASE_LOCALE,
  type IntakeFieldType,
  type IntakeFieldConfig,
  type IntakeOption,
  type AvailabilityData,
  type IntakeFormResponse,
} from "./intake-forms.js";

// ---------------------------------------------------------------------------
// IntakeAnswer: the input type for all composition functions
// ---------------------------------------------------------------------------

/**
 * A single answered field, ready for composition or encryption.
 * Labels are included for human-readable description composition only;
 * they are NOT stored in the structured response blob.
 * Config is included optionally for resolving option keys to display
 * labels in the description (options are key+label pairs; labels resolve at display time).
 */
export interface IntakeAnswer {
  readonly fieldKey: string;
  readonly fieldType: IntakeFieldType;
  readonly label: string;
  readonly value: string | readonly string[] | AvailabilityData | boolean;
  readonly config?: IntakeFieldConfig;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/**
 * Format an availability value as human-readable text lines for the
 * description composition. The IANA timezone name is included.
 */
export function formatAvailability(data: AvailabilityData): string {
  const parts: string[] = [];
  for (const r of data.recurring) {
    parts.push(`${r.day} ${r.start}-${r.end}`);
  }
  for (const s of data.specific) {
    parts.push(`${s.date} ${s.start}-${s.end}`);
  }
  if (parts.length === 0) return `(${data.timezone})`;
  return `${parts.join(", ")} (${data.timezone})`;
}

/**
 * Check whether a value is an AvailabilityData object (has the timezone +
 * recurring + specific shape). Used to narrow the answer value union without
 * an unsafe type assertion.
 */
export function isAvailabilityData(
  v: string | readonly string[] | AvailabilityData | boolean,
): v is AvailabilityData {
  return typeof v === "object" && !Array.isArray(v) && "timezone" in v;
}

/**
 * Resolve an option key to its base-locale display label using the field
 * config's options array. Returns the key unchanged when no match is found
 * (graceful fallback for stale or default-form answers).
 */
export function resolveOptionKey(
  key: string,
  options: readonly IntakeOption[],
): string {
  for (const opt of options) {
    if (opt.key === key) {
      return resolveLocalized(opt.label, BASE_LOCALE) ?? key;
    }
  }
  return key;
}

/**
 * Format a single answer value as a string for the description.
 * When config is provided and the field is select/multiselect, option keys
 * are resolved to base-locale labels (option keys are immutable; labels resolve at display time).
 * Date values pass through as-is (YYYY-MM-DD).
 */
export function formatValue(
  value: string | readonly string[] | AvailabilityData | boolean,
  config?: IntakeFieldConfig,
): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") {
    // For select fields, resolve the option key to a label
    if (config?.type === "select") {
      return resolveOptionKey(value, config.options);
    }
    // Date and plain text values pass through unchanged
    return value;
  }
  if (isAvailabilityData(value)) return formatAvailability(value);
  // For multiselect fields, resolve each option key to a label
  if (config?.type === "multiselect") {
    return value.map((key) => resolveOptionKey(key, config.options)).join(", ");
  }
  return value.join(", ");
}

/**
 * Strip the label from the value for the structured response blob.
 * Availability is stored as-is; arrays and strings pass through.
 */
export function toResponseValue(
  value: string | readonly string[] | AvailabilityData | boolean,
): string | string[] | AvailabilityData | boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value;
  if (isAvailabilityData(value)) return value;
  return [...value];
}

// ---------------------------------------------------------------------------
// Ticket title and description composition
// ---------------------------------------------------------------------------

/** Composed ticket content for queue display. */
export interface IntakeTicketContent {
  readonly title: string;
  readonly description: string;
}

/**
 * Compose the title and description for a queue-facing intake ticket.
 *
 * Title: "Web intake - <name>" when a "default:name" answer is present
 * and non-empty; "Web intake" otherwise. The code looks for a
 * "default:name" answer regardless of formId.
 *
 * Description: one line per answered field, "<label>: <value>".
 * Option keys are resolved to base-locale labels for queue-facing text.
 * Lines with empty formatted values are omitted.
 */
export function composeIntakeTicketContent(
  answers: readonly IntakeAnswer[],
): IntakeTicketContent {
  // Title
  const nameAnswer = answers.find(
    (a) =>
      a.fieldKey === "default:name" &&
      typeof a.value === "string" &&
      a.value !== "",
  );
  const nameValue =
    nameAnswer !== undefined && typeof nameAnswer.value === "string"
      ? nameAnswer.value
      : null;
  const title = nameValue !== null ? `Web intake - ${nameValue}` : "Web intake";

  // Description: one line per answered field, "<label>: <value>".
  // Option keys are resolved to base-locale labels for queue-facing text.
  const descriptionLines: string[] = [];
  for (const answer of answers) {
    const formatted = formatValue(answer.value, answer.config);
    if (formatted !== "") {
      descriptionLines.push(`${answer.label}: ${formatted}`);
    }
  }
  const description = descriptionLines.join("\n");

  return { title, description };
}

// ---------------------------------------------------------------------------
// Message text extraction
// ---------------------------------------------------------------------------

/**
 * Extract the follow-up message text from the answer list.
 * The first textarea answer becomes the follow-up content. Returns null
 * when no textarea answer exists (custom forms without a textarea skip
 * the follow-up entirely).
 */
export function extractMessageText(
  answers: readonly IntakeAnswer[],
): string | null {
  const textareaAnswer = answers.find((a) => a.fieldType === "textarea");
  if (textareaAnswer === undefined) return null;
  return typeof textareaAnswer.value === "string" ? textareaAnswer.value : "";
}

// ---------------------------------------------------------------------------
// Structured response payload assembly
// ---------------------------------------------------------------------------

/**
 * Build the structured IntakeFormResponse payload from the answer list.
 * Uses fieldKey (client-minted, stable across saves) for response identity.
 */
export function buildIntakeFormResponse(
  formId: string | null,
  answers: readonly IntakeAnswer[],
): IntakeFormResponse {
  return {
    formId,
    answers: answers.map((a) => ({
      fieldKey: a.fieldKey,
      fieldType: a.fieldType,
      value: toResponseValue(a.value),
    })),
  };
}
