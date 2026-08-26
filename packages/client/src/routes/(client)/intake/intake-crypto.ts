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
  eciesEncrypt,
  generatePortalSeed,
  deriveChannelId,
  deriveChannelAuth,
  hashChannelAuth,
  derivePortalKeypair,
  PORTAL_KEY_CHECK,
  type SymmetricKey,
  type Ciphertext,
  type EciesOutput,
} from "@care-y/crypto";
import {
  resolveLocalized,
  BASE_LOCALE,
  type IntakeFieldType,
  type IntakeFieldRole,
  type IntakeFieldConfig,
  type IntakeOption,
  type AvailabilityData,
  type IntakeFormResponse,
  type TicketPriority,
} from "@care-y/shared";
import { buildAccountRegistration } from "$lib/portal/account-crypto.js";
import type { LoginCryptoCallbacks } from "$lib/auth/login-crypto.js";

const textEncoder = new TextEncoder();

/**
 * A single answered field, ready for encryption.
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
  v: string | readonly string[] | AvailabilityData | boolean,
): v is AvailabilityData {
  return typeof v === "object" && !Array.isArray(v) && "timezone" in v;
}

/**
 * Resolve an option key to its base-locale display label using the field
 * config's options array. Returns the key unchanged when no match is found
 * (graceful fallback for stale or default-form answers).
 */
function resolveOptionKey(
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
function formatValue(
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
function toResponseValue(
  value: string | readonly string[] | AvailabilityData | boolean,
): string | string[] | AvailabilityData | boolean {
  if (typeof value === "boolean") return value;
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
        a.fieldKey === "default:name" &&
        typeof a.value === "string" &&
        a.value !== "",
    );
    const nameValue =
      nameAnswer !== undefined && typeof nameAnswer.value === "string"
        ? nameAnswer.value
        : null;
    const title =
      nameValue !== null ? `Web intake - ${nameValue}` : "Web intake";

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

    // Message: first textarea answer becomes the follow-up content.
    // Custom forms without a textarea skip the follow-up entirely.
    const textareaAnswer = answers.find((a) => a.fieldType === "textarea");
    const messageText = textareaAnswer
      ? typeof textareaAnswer.value === "string"
        ? textareaAnswer.value
        : ""
      : null;

    // Structured response blob (availability-matching Worker seam).
    // Uses fieldKey (client-minted, stable across saves) for response identity.
    const responsePayload: IntakeFormResponse = {
      formId,
      answers: answers.map((a) => ({
        fieldKey: a.fieldKey,
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

// ---------------------------------------------------------------------------
// Submit-time metadata resolution (ADR-068)
// ---------------------------------------------------------------------------

export interface SubmitMetadata {
  readonly resolvedQueueId: string | null;
  readonly resolvedPriority: TicketPriority | null;
  readonly resolvedEscalationLevel: string | null;
}

interface FieldWithRole {
  readonly role: IntakeFieldRole | null;
  readonly config: IntakeFieldConfig;
  readonly fieldKey: string;
}

/**
 * Resolves server-metadata role mappings from decrypted field configs
 * and current field values. The browser resolves the mapping; only the
 * derived signal (queue id, priority, escalation level) is sent plaintext.
 * Answer text stays encrypted.
 */
export function resolveSubmitMetadata(
  fields: readonly FieldWithRole[],
  values: Readonly<
    Record<string, string | string[] | AvailabilityData | boolean | undefined>
  >,
): SubmitMetadata {
  let resolvedQueueId: string | null = null;
  let resolvedPriority: TicketPriority | null = null;
  let resolvedEscalationLevel: string | null = null;

  for (const field of fields) {
    if (field.role === null) continue;
    const val = values[field.fieldKey];

    if (field.role === "queue-routing" && typeof val === "string") {
      const cfg = field.config;
      if (
        (cfg.type === "select" || cfg.type === "multiselect") &&
        cfg.queueRoutingMapping != null
      ) {
        const mapping = cfg.queueRoutingMapping;
        const mapped = mapping[val]; // eslint-disable-line security/detect-object-injection -- val is the user-selected option from the form
        if (mapped !== undefined) {
          resolvedQueueId = mapped;
        }
      }
    }

    if (field.role === "urgency" && typeof val === "string") {
      const cfg = field.config;
      if (cfg.type === "select" && cfg.urgencyMapping != null) {
        const mapping = cfg.urgencyMapping;
        const mapped = mapping[val]; // eslint-disable-line security/detect-object-injection -- val from form
        if (mapped !== undefined) {
          resolvedPriority = mapped;
        }
      }
    }

    if (field.role === "escalation") {
      const cfg = field.config;
      if (cfg.type === "select" && typeof val === "string") {
        if (cfg.escalationMapping != null) {
          const mapping = cfg.escalationMapping;
          const mapped = mapping[val]; // eslint-disable-line security/detect-object-injection -- val from form
          if (mapped !== undefined) {
            resolvedEscalationLevel = mapped;
          }
        }
      } else if (cfg.type === "checkbox" && val === true) {
        // Checkbox escalation: checked triggers the escalation
        resolvedEscalationLevel = "triggered";
      }
    }
  }

  return { resolvedQueueId, resolvedPriority, resolvedEscalationLevel };
}

// ---------------------------------------------------------------------------
// Account payload assembly for intake opt-in
// ---------------------------------------------------------------------------

/** Wire-ready account branch for the intake submission payload. */
export interface IntakeAccountPayload {
  readonly accountId: string;
  readonly username: string;
  readonly salt: string;
  readonly publicKey: string;
  readonly authHash: string;
  readonly keyCheck: {
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly ciphertext: string;
  };
  readonly selfCopy?: {
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly ciphertext: string;
  };
}

/**
 * Build the account registration payload for the intake opt-in.
 *
 * Delegates the entire derivation pipeline (Argon2id, OPRF, key derivation)
 * to buildAccountRegistration from account-crypto.ts. Adds a selfCopy when
 * a message exists (eciesEncrypt of the message bytes to the new public key).
 * Zeroes keypair.clientPrivate in the finally block. The password string is
 * cleared by the form on submit (never stored in component state past the
 * submit call).
 */
export async function buildAccountPayload(
  username: string,
  password: string,
  message: string | null,
  callbacks: LoginCryptoCallbacks,
): Promise<IntakeAccountPayload> {
  const { payload, keypair } = await buildAccountRegistration(
    username,
    password,
    null,
    callbacks,
  );

  try {
    let selfCopy: IntakeAccountPayload["selfCopy"] | undefined;

    if (message !== null && message.length > 0) {
      const messageBytes = textEncoder.encode(message);
      const triple: EciesOutput = eciesEncrypt(
        messageBytes,
        keypair.clientPublic,
      );
      selfCopy = {
        ephemeralPoint: encode(triple.ephemeralPoint),
        nonce: encode(triple.nonce),
        ciphertext: encode(triple.ciphertext),
      };
    }

    return {
      accountId: payload.accountId,
      username: payload.username,
      salt: payload.salt,
      publicKey: payload.publicKey,
      authHash: payload.authHash,
      keyCheck: payload.keyCheck,
      ...(selfCopy != null ? { selfCopy } : {}),
    };
  } finally {
    const sodium = requireSodium();
    sodium.memzero(keypair.clientPrivate);
  }
}

// ---------------------------------------------------------------------------
// Continuation-link payload assembly for intake opt-in
// ---------------------------------------------------------------------------

/** Wire-ready continuation branch for the intake submission payload. */
export interface IntakeContinuationPayload {
  readonly channelId: string;
  readonly authHash: string;
  readonly clientPublic: string;
  readonly keyCheck: {
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly ciphertext: string;
  };
  readonly selfCopy?: {
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly ciphertext: string;
  };
}

/**
 * Mint a portal channel for the continuation-link flow.
 *
 * Generates a fresh seed, derives all channel material, and builds the
 * wire payload. The raw seed and private key are zeroed in the finally
 * block after the base64url-encoded seed string is captured. The
 * encoded seed and channel id are returned so the caller can assemble
 * the one-time URL on successful submission.
 */
export function buildContinuationPayload(message: string | null): {
  payload: IntakeContinuationPayload;
  channelId: string;
  encodedSeed: string;
} {
  const sodium = requireSodium();
  const seed = generatePortalSeed();
  const channelId = deriveChannelId(seed);
  const auth = deriveChannelAuth(seed);
  const keypair = derivePortalKeypair(seed);
  const encodedSeed = encode(seed);

  try {
    const authHash = encode(hashChannelAuth(auth));
    const clientPublicEncoded = encode(keypair.clientPublic);

    const checkPlaintext = textEncoder.encode(PORTAL_KEY_CHECK);
    const keyCheckTriple: EciesOutput = eciesEncrypt(
      checkPlaintext,
      keypair.clientPublic,
    );
    const keyCheck = {
      ephemeralPoint: encode(keyCheckTriple.ephemeralPoint),
      nonce: encode(keyCheckTriple.nonce),
      ciphertext: encode(keyCheckTriple.ciphertext),
    };

    let selfCopy: IntakeContinuationPayload["selfCopy"] | undefined;
    if (message !== null && message.length > 0) {
      const messageBytes = textEncoder.encode(message);
      const triple: EciesOutput = eciesEncrypt(
        messageBytes,
        keypair.clientPublic,
      );
      selfCopy = {
        ephemeralPoint: encode(triple.ephemeralPoint),
        nonce: encode(triple.nonce),
        ciphertext: encode(triple.ciphertext),
      };
    }

    const payload: IntakeContinuationPayload = {
      channelId,
      authHash,
      clientPublic: clientPublicEncoded,
      keyCheck,
      ...(selfCopy != null ? { selfCopy } : {}),
    };

    return { payload, channelId, encodedSeed };
  } finally {
    sodium.memzero(keypair.clientPrivate);
    sodium.memzero(auth);
    sodium.memzero(seed);
  }
}
