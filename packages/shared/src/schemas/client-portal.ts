/**
 * Zod schemas for the client-facing portal surface.
 *
 * Later portal features (secure link, client accounts, share links) append
 * to this file following the append-only convention.
 *
 * Encrypted fields use base64String() because the shared package is isomorphic
 * and tRPC transports binary as base64 strings over the wire. The route handler
 * converts to Buffer via Buffer.from(input.field, "base64").
 */

import { z } from "zod";
import { base64Bytes, base64String } from "./validators.js";
import { intakeFieldRoleSchema } from "./intake-forms.js";

/** crypto_box_seal(32-byte tk) = 32 + 48 = 80 bytes (variant-agnostic exact-byte check). */
export const intakeWrappedTkSchema = base64Bytes(80, "wrappedTk (sealed box)");

/**
 * Intake form submission from the anonymous client browser.
 *
 * Size caps are ciphertext caps (plaintext + 24-byte nonce + 16-byte MAC,
 * base64-inflated). Plaintext limits are enforced client-side for friendly
 * validation messages.
 *
 * ticketId and followUpId are client-minted (crypto.randomUUID()) because
 * every content ciphertext is AAD-bound to its ticket id and slot. A
 * server-minted id could never match the AAD the browser baked in, and
 * volunteer-side decrypt would fail with a context mismatch.
 */
export const intakeSubmissionInputSchema = z.object({
  ticketId: z.uuid(),
  followUpId: z.uuid().nullable(),
  formId: z.uuid().nullable(),
  encryptedTitle: base64String("encryptedTitle").refine(
    (s) => s.length <= 1_400,
    "encryptedTitle too large",
  ),
  encryptedDescription: base64String("encryptedDescription").refine(
    (s) => s.length <= 88_000,
    "encryptedDescription too large",
  ),
  encryptedMessage: base64String("encryptedMessage")
    .refine((s) => s.length <= 28_000, "encryptedMessage too large")
    .optional(),
  encryptedFormResponse: base64String("encryptedFormResponse").refine(
    (s) => s.length <= 88_000,
    "encryptedFormResponse too large",
  ),
  wrappedTk: intakeWrappedTkSchema,
  pow: z
    .object({ challenge: z.string().max(128), solution: z.string().max(128) })
    .optional(),
  // Submit-time plaintext metadata resolved from encrypted field config
  // by the submitter's browser (ADR-068 server-metadata roles).
  resolvedQueueId: z.uuid().nullable().optional(),
  resolvedPriority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  resolvedEscalationLevel: z.string().min(1).max(50).optional(),
});
export type IntakeSubmissionInput = z.infer<typeof intakeSubmissionInputSchema>;

export const intakeChallengeResponseSchema = z.object({
  challenge: z.string(),
  difficulty: z.number().int().min(0),
  expiresAt: z.string(),
});
export type IntakeChallengeResponse = z.infer<
  typeof intakeChallengeResponseSchema
>;

export const intakeSubmitResponseSchema = z.object({
  reference: z.string(),
});
export type IntakeSubmitResponse = z.infer<typeof intakeSubmitResponseSchema>;

export const intakeConfigResponseSchema = z.object({
  powRequired: z.boolean(),
});
export type IntakeConfigResponse = z.infer<typeof intakeConfigResponseSchema>;

// ---------------------------------------------------------------------------
// Public form read shape (returned by getIntakeForm)
// ---------------------------------------------------------------------------

/** Wire shape for a single field as seen by the public renderer. */
export const publicIntakeFieldSchema = z.object({
  id: z.uuid(),
  fieldType: z.string(),
  role: intakeFieldRoleSchema.nullable(),
  encryptedLabel: z.string(),
  encryptedConfig: z.string(),
  isRequired: z.boolean(),
});
export type PublicIntakeField = z.infer<typeof publicIntakeFieldSchema>;

/** Wire shape for the public form as seen by the anonymous submitter. */
export const publicIntakeFormSchema = z.object({
  id: z.uuid(),
  slug: z.string().nullable(),
  fields: z.array(publicIntakeFieldSchema),
});
export type PublicIntakeForm = z.infer<typeof publicIntakeFormSchema>;

// ---------------------------------------------------------------------------
// Secure Link portal schemas (8b)
// ---------------------------------------------------------------------------

/** Communication tier for a client. 8c appends "account". */
export const communicationTierSchema = z.enum(["sms_email", "secure_link"]);
export type CommunicationTier = z.infer<typeof communicationTierSchema>;

/** 48 lowercase hex chars: hex(sha512(seed)[0:24]). */
export const portalChannelIdSchema = z.string().regex(/^[0-9a-f]{48}$/);

/** 32-byte bearer auth token, base64-encoded. */
export const portalAuthSchema = base64Bytes(32, "channelAuth");

/** EciesOutput on the wire: 32-byte point, 24-byte nonce, capped ciphertext. */
export const eciesTripleSchema = z.object({
  ephemeralPoint: base64Bytes(32, "ephemeralPoint"),
  nonce: base64Bytes(24, "nonce"),
  ciphertext: base64String("ciphertext").refine(
    (s) => s.length <= 28_000,
    "ciphertext too large",
  ),
});
export type EciesTriple = z.infer<typeof eciesTripleSchema>;

/** Bootstrap request: resolve channel by id + auth, return key check and messages. */
export const portalBootstrapInputSchema = z.object({
  channelId: portalChannelIdSchema,
  auth: portalAuthSchema,
});
export type PortalBootstrapInput = z.infer<typeof portalBootstrapInputSchema>;

/** Client reply: encrypted content + sealed tk_temp wrap + self copy. */
export const portalReplyInputSchema = z.object({
  channelId: portalChannelIdSchema,
  auth: portalAuthSchema,
  ticketId: z.uuid(),
  followUpId: z.uuid(),
  keyGeneration: z.uuid(),
  encryptedContent: base64String("encryptedContent").refine(
    (s) => s.length <= 28_000,
    "too large",
  ),
  wrappedTkTemp: base64Bytes(80, "wrappedTkTemp (sealed box)"),
  selfCopy: eciesTripleSchema,
});
export type PortalReplyInput = z.infer<typeof portalReplyInputSchema>;

// ---------------------------------------------------------------------------
// Share link schemas (8d)
// ---------------------------------------------------------------------------

/** Share ciphertext cap matches the intake description cap. */
const shareCiphertextSchema = base64String("ciphertext").refine(
  (s) => s.length <= 88_000,
  "ciphertext too large",
);

export const createShareInputSchema = z.object({
  shareId: z.uuid(),
  ticketId: z.uuid(),
  ciphertext: shareCiphertextSchema,
  followUpId: z.uuid(),
  encryptedFollowUp: shareCiphertextSchema,
});
export type CreateShareInput = z.infer<typeof createShareInputSchema>;

export const openShareInputSchema = z.object({ shareId: z.uuid() });
export type OpenShareInput = z.infer<typeof openShareInputSchema>;

export const openShareResponseSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("ready"), ciphertext: z.string() }),
  z.object({ status: z.literal("opened") }),
  z.object({ status: z.literal("expired") }),
  z.object({ status: z.literal("not_found") }),
]);
export type OpenShareResponse = z.infer<typeof openShareResponseSchema>;

export const shareStatusSchema = z.object({
  id: z.uuid(),
  createdAt: z.string(),
  expiresAt: z.string(),
  readAt: z.string().nullable(),
});
export type ShareStatus = z.infer<typeof shareStatusSchema>;
