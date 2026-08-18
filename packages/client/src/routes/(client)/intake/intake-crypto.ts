/**
 * Client-side intake encryption. Pure, testable, runs on the main thread.
 *
 * The intake page has no session keys to protect and the plaintext is already
 * in the DOM (the user typed it). tk is zeroed in a finally block immediately
 * after sealing. No await between generate and zero.
 *
 * Uses @care-y/crypto directly. No Worker, no CryptoBridge, no OrgKeyManager.
 */

import {
  generateContentKey,
  encryptContent,
  sealForOrgKey,
  requireSodium,
  encode,
  buildContentAad,
  followupSlot,
  type SymmetricKey,
  type Ciphertext,
} from "@care-y/crypto";
import type {
  IntakeFieldType,
  AvailabilityData,
  IntakeFormResponse,
} from "@care-y/shared";

const textEncoder = new TextEncoder();

/**
 * A single answered field, ready for encryption.
 * Labels are included for human-readable description composition only;
 * they are NOT stored in the structured response blob.
 */
export interface IntakeAnswer {
  readonly fieldId: string;
  readonly fieldType: IntakeFieldType;
  readonly label: string;
  readonly value: string | readonly string[] | AvailabilityData;
}

export interface EncryptedIntake {
  readonly encryptedTitle: string;
  readonly encryptedDescription: string;
  readonly encryptedMessage: string | null;
  readonly encryptedFormResponse: string;
  readonly wrappedTk: string;
}

/**
 * AAD slot for the structured form response blob.
 * The Worker reconstructs the same slot string to verify the binding.
 */
const FORM_RESPONSE_SLOT = "intake-form-response";

/**
 * Format an availability value as human-readable text lines for the
 * description composition. The IANA timezone name is included.
 */
function formatAvailability(data: AvailabilityData): string {
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
function isAvailabilityData(
  v: string | readonly string[] | AvailabilityData,
): v is AvailabilityData {
  return typeof v === "object" && !Array.isArray(v) && "timezone" in v;
}

/**
 * Format a single answer value as a string for the description.
 */
function formatValue(
  value: string | readonly string[] | AvailabilityData,
): string {
  if (typeof value === "string") return value;
  if (isAvailabilityData(value)) return formatAvailability(value);
  return value.join(", ");
}

/**
 * Strip the label from the value for the structured response blob.
 * Availability is stored as-is; arrays and strings pass through.
 */
function toResponseValue(
  value: string | readonly string[] | AvailabilityData,
): string | string[] | AvailabilityData {
  if (typeof value === "string") return value;
  if (isAvailabilityData(value)) return value;
  return [...value];
}

/**
 * Encrypt an intake form submission. All four ciphertexts are AAD-bound
 * to the client-minted ticket id and their respective slot.
 *
 * The tk (ticket key) is generated, used, and zeroed in one synchronous
 * call. There is no await between generate and memzero.
 *
 * @param formId - The form definition id (null for the default form)
 * @param answers - Answered fields with decrypted labels
 * @param orgPublicKey - Org Curve25519 public key (32 bytes)
 * @param ids - Client-minted UUIDs for AAD binding
 * @returns Base64url-encoded ciphertexts and sealed wrap
 */
export function encryptIntake(
  formId: string | null,
  answers: readonly IntakeAnswer[],
  orgPublicKey: Uint8Array,
  ids: { readonly ticketId: string; readonly followUpId: string | null },
): EncryptedIntake {
  const tk: SymmetricKey = generateContentKey();
  try {
    // Title: "Web intake" for custom forms; "Web intake - <name>" for the
    // default form when a name answer is present and non-empty
    const nameAnswer = answers.find(
      (a) =>
        a.fieldId === "default:name" &&
        typeof a.value === "string" &&
        a.value !== "",
    );
    const nameValue =
      nameAnswer !== undefined && typeof nameAnswer.value === "string"
        ? nameAnswer.value
        : null;
    const title =
      nameValue !== null ? `Web intake - ${nameValue}` : "Web intake";

    // Description: one line per answered field, "<label>: <value>"
    const descriptionLines: string[] = [];
    for (const answer of answers) {
      const formatted = formatValue(answer.value);
      if (formatted !== "") {
        descriptionLines.push(`${answer.label}: ${formatted}`);
      }
    }
    const description = descriptionLines.join("\n");

    // Message: first textarea answer becomes the follow-up content.
    // Custom forms without a textarea skip the follow-up entirely.
    const textareaAnswer = answers.find((a) => a.fieldType === "textarea");
    const messageText = textareaAnswer
      ? typeof textareaAnswer.value === "string"
        ? textareaAnswer.value
        : ""
      : null;

    // Structured response blob (availability-matching Worker seam)
    const responsePayload: IntakeFormResponse = {
      formId,
      answers: answers.map((a) => ({
        fieldId: a.fieldId,
        fieldType: a.fieldType,
        value: toResponseValue(a.value),
      })),
    };

    // AAD bindings
    const titleAad = buildContentAad(ids.ticketId, "title");
    const descriptionAad = buildContentAad(ids.ticketId, "description");
    const formResponseAad = buildContentAad(ids.ticketId, FORM_RESPONSE_SLOT);

    // Encrypt title, description, form response (always present)
    const encTitle = encryptContent(textEncoder.encode(title), tk, titleAad);
    const encDescription = encryptContent(
      textEncoder.encode(description),
      tk,
      descriptionAad,
    );
    const encFormResponse = encryptContent(
      textEncoder.encode(JSON.stringify(responsePayload)),
      tk,
      formResponseAad,
    );

    // Encrypt message follow-up (only when a textarea answer exists)
    let encMessage: Ciphertext | null = null;
    if (messageText !== null && ids.followUpId !== null) {
      const messageAad = buildContentAad(
        ids.ticketId,
        followupSlot(ids.followUpId),
      );
      encMessage = encryptContent(
        textEncoder.encode(messageText),
        tk,
        messageAad,
      );
    }

    // Seal tk to the org public key (crypto_box_seal, 80 bytes)
    const sealedTk = sealForOrgKey(tk, orgPublicKey);

    return {
      encryptedTitle: encode(encTitle),
      encryptedDescription: encode(encDescription),
      encryptedMessage: encMessage !== null ? encode(encMessage) : null,
      encryptedFormResponse: encode(encFormResponse),
      wrappedTk: encode(sealedTk),
    };
  } finally {
    requireSodium().memzero(tk);
  }
}
