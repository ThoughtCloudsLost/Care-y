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
  PORTAL_KEY_CHECK,
  type SymmetricKey,
  type Ciphertext,
  type EciesOutput,
} from "@care-y/crypto";
import {
  performChannelOprf,
  type ChannelEvaluateCallback,
} from "$lib/portal/portal-crypto.js";
import {
  composeIntakeTicketContent,
  extractMessageText,
  buildIntakeFormResponse,
  type IntakeAnswer,
  type AvailabilityData,
  type IntakeFieldRole,
  type IntakeFieldConfig,
  type TicketPriority,
} from "@care-y/shared";
import { buildAccountRegistration } from "$lib/portal/account-crypto.js";
import type { LoginCryptoCallbacks } from "$lib/auth/login-crypto.js";

// Re-export IntakeAnswer so existing consumer imports from this module
// continue to resolve without changes.
export type { IntakeAnswer } from "@care-y/shared";

const textEncoder = new TextEncoder();

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
    const { title, description } = composeIntakeTicketContent(answers);
    const messageText = extractMessageText(answers);
    const responsePayload = buildIntakeFormResponse(formId, answers);

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
      // Single-pick only: a multiselect answer is an array, so it never
      // reaches here, and the builder refuses to save that pairing.
      if (cfg.type === "select" && cfg.queueRoutingMapping != null) {
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
 * Generates a fresh seed, derives all channel material through the
 * OPRF pipeline (ADR-091), and builds the wire payload. The raw seed
 * and private key are zeroed in the finally block after the
 * base64url-encoded seed string is captured. The encoded seed and
 * channel id are returned so the caller can assemble the one-time
 * URL on successful submission.
 *
 * @param message - Optional message text for the self-copy
 * @param evaluate - Channel OPRF evaluate callback (tRPC wiring)
 * @param onPowRequired - PoW solver callback
 */
export async function buildContinuationPayload(
  message: string | null,
  evaluate: ChannelEvaluateCallback,
  onPowRequired: (challenge: string, difficulty: number) => Promise<string>,
): Promise<{
  payload: IntakeContinuationPayload;
  channelId: string;
  encodedSeed: string;
}> {
  const sodium = requireSodium();
  const seed = generatePortalSeed();
  const channelId = deriveChannelId(seed);
  const auth = deriveChannelAuth(seed);
  const encodedSeed = encode(seed);

  // ADR-091: derive through OPRF round (no auth for mint path)
  const keypair = await performChannelOprf(seed, channelId, {
    evaluate,
    onPowRequired,
  });

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
