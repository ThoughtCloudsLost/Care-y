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
import { intakeFieldRoleSchema, fieldKeySchema } from "./intake-forms.js";
import {
  ticketIdSchema,
  followupIdSchema,
  clientAccountIdSchema,
  shareIdSchema,
  keyGenerationSchema,
  queueIdSchema,
  intakeFormIdSchema,
  intakeFormFieldIdSchema,
  portalMessageIdSchema,
  userIdSchema,
} from "../ids.js";

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
export const intakeSubmissionInputSchema = z
  .object({
    ticketId: ticketIdSchema,
    followUpId: followupIdSchema.nullable(),
    formId: intakeFormIdSchema.nullable(),
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
    resolvedQueueId: queueIdSchema.nullable().optional(),
    resolvedPriority: z.enum(["low", "normal", "high", "urgent"]).optional(),
    resolvedEscalationLevel: z.string().min(1).max(50).optional(),
    /** Optional account registration branch (client opts into Encrypted Account at intake). */
    account: z
      .object({
        accountId: clientAccountIdSchema,
        username: z.string().min(3).max(64),
        salt: base64Bytes(16, "argon2Salt"),
        publicKey: base64Bytes(32, "accountPublicKey"),
        authHash: base64Bytes(32, "authHash"),
        keyCheck: z.object({
          ephemeralPoint: base64Bytes(32, "ephemeralPoint"),
          nonce: base64Bytes(24, "nonce"),
          ciphertext: base64String("ciphertext").refine(
            (s) => s.length <= 28_000,
            "ciphertext too large",
          ),
        }),
        selfCopy: z
          .object({
            ephemeralPoint: base64Bytes(32, "ephemeralPoint"),
            nonce: base64Bytes(24, "nonce"),
            ciphertext: base64String("ciphertext").refine(
              (s) => s.length <= 28_000,
              "ciphertext too large",
            ),
          })
          .optional(),
      })
      .optional(),
    /** Optional continuation link branch (client opts into a portal channel for resubmission). */
    continuation: z
      .object({
        channelId: z
          .string()
          .regex(/^[0-9a-f]{48}$/)
          .brand<"ChannelSecret">(),
        authHash: base64Bytes(32, "authHash"),
        clientPublic: base64Bytes(32, "clientPublic"),
        keyCheck: z.object({
          ephemeralPoint: base64Bytes(32, "ephemeralPoint"),
          nonce: base64Bytes(24, "nonce"),
          ciphertext: base64String("ciphertext").refine(
            (s) => s.length <= 28_000,
            "ciphertext too large",
          ),
        }),
        selfCopy: z
          .object({
            ephemeralPoint: base64Bytes(32, "ephemeralPoint"),
            nonce: base64Bytes(24, "nonce"),
            ciphertext: base64String("ciphertext").refine(
              (s) => s.length <= 28_000,
              "ciphertext too large",
            ),
          })
          .optional(),
      })
      .optional(),
  })
  // Account strictly dominates continuation: when both are present the
  // continuation branch is nullified (no error). The UI prevents co-selection,
  // but the schema enforces it server-side as a defense-in-depth measure.
  .transform((val) =>
    val.account != null && val.continuation != null
      ? { ...val, continuation: undefined }
      : val,
  );
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
  id: intakeFormFieldIdSchema,
  fieldKey: fieldKeySchema,
  fieldType: z.string(),
  role: intakeFieldRoleSchema.nullable(),
  encryptedLabel: z.string(),
  encryptedConfig: z.string(),
  isRequired: z.boolean(),
});
export type PublicIntakeField = z.infer<typeof publicIntakeFieldSchema>;

/** Wire shape for the public form as seen by the anonymous submitter. */
export const publicIntakeFormSchema = z.object({
  id: intakeFormIdSchema,
  slug: z.string().nullable(),
  encryptedFormMeta: z.string().nullable().optional(),
  fields: z.array(publicIntakeFieldSchema),
});
export type PublicIntakeForm = z.infer<typeof publicIntakeFormSchema>;

// ---------------------------------------------------------------------------
// Secure Link portal schemas (8b)
// ---------------------------------------------------------------------------

/** Communication tier for a client. */
export const communicationTierSchema = z.enum([
  "sms_email",
  "secure_link",
  "account",
]);
export type CommunicationTier = z.infer<typeof communicationTierSchema>;

/** Portal channel kind discriminator. */
export const portalChannelKindSchema = z.enum([
  "secure_link",
  "account",
  "intake_continuation",
]);
export type PortalChannelKind = z.infer<typeof portalChannelKindSchema>;

/** 48 lowercase hex chars: hex(sha512(seed)[0:24]). */
// The brand makes this the bearer secret rather than a row key. The codebase
// already knew the difference and encoded it as this regex; branding moves that
// knowledge somewhere the compiler can enforce it, so a `ChannelRowId` can no
// longer be passed where the URL-visible secret belongs.
export const portalChannelIdSchema = z
  .string()
  .regex(/^[0-9a-f]{48}$/)
  .brand<"ChannelSecret">();

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
  ticketId: ticketIdSchema,
  followUpId: followupIdSchema,
  keyGeneration: keyGenerationSchema,
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
  shareId: shareIdSchema,
  ticketId: ticketIdSchema,
  ciphertext: shareCiphertextSchema,
  followUpId: followupIdSchema,
  encryptedFollowUp: shareCiphertextSchema,
});
export type CreateShareInput = z.infer<typeof createShareInputSchema>;

export const openShareInputSchema = z.object({ shareId: shareIdSchema });
export type OpenShareInput = z.infer<typeof openShareInputSchema>;

export const openShareResponseSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("ready"), ciphertext: z.string() }),
  z.object({ status: z.literal("opened") }),
  z.object({ status: z.literal("expired") }),
  z.object({ status: z.literal("not_found") }),
]);
export type OpenShareResponse = z.infer<typeof openShareResponseSchema>;

export const shareStatusSchema = z.object({
  id: shareIdSchema,
  createdAt: z.string(),
  expiresAt: z.string(),
  readAt: z.string().nullable(),
});
export type ShareStatus = z.infer<typeof shareStatusSchema>;

// ---------------------------------------------------------------------------
// Encrypted Account schemas (8c)
// ---------------------------------------------------------------------------

/** Normalized client-side before hashing server-side; length limits on the RAW input. */
export const accountUsernameSchema = z.string().min(3).max(64);

/** Payload registering a new account (intake branch, in-portal upgrade, password change). */
export const accountRegistrationSchema = z.object({
  accountId: clientAccountIdSchema,
  username: accountUsernameSchema,
  salt: base64Bytes(16, "argon2Salt"),
  publicKey: base64Bytes(32, "accountPublicKey"),
  authHash: base64Bytes(32, "authHash"),
  keyCheck: eciesTripleSchema,
});
export type AccountRegistration = z.infer<typeof accountRegistrationSchema>;

export const getAccountSaltInputSchema = z.object({
  username: accountUsernameSchema,
});
export type GetAccountSaltInput = z.infer<typeof getAccountSaltInputSchema>;

export const accountLoginInputSchema = z.object({
  accountId: clientAccountIdSchema,
  authToken: base64Bytes(32, "authToken"),
});
export type AccountLoginInput = z.infer<typeof accountLoginInputSchema>;

/** Re-encrypted copy swap rows for upgrade and password change. */
export const rewrappedMessageSchema = z.object({
  id: portalMessageIdSchema,
  copy: eciesTripleSchema,
});
export type RewrappedMessage = z.infer<typeof rewrappedMessageSchema>;

export const rewrappedMessagesSchema = z.array(rewrappedMessageSchema).max(500);
export type RewrappedMessages = z.infer<typeof rewrappedMessagesSchema>;

export const accountUpgradeInputSchema = z.object({
  channelId: portalChannelIdSchema,
  auth: portalAuthSchema,
  account: accountRegistrationSchema,
  rewrappedMessages: rewrappedMessagesSchema,
});
export type AccountUpgradeInput = z.infer<typeof accountUpgradeInputSchema>;

export const accountChangePasswordInputSchema = z.object({
  currentAuthToken: base64Bytes(32, "currentAuthToken"),
  account: accountRegistrationSchema.omit({ accountId: true, username: true }),
  rewrappedMessages: rewrappedMessagesSchema,
});
export type AccountChangePasswordInput = z.infer<
  typeof accountChangePasswordInputSchema
>;

// ---------------------------------------------------------------------------
// Intake response listing schemas (T3.0)
// ---------------------------------------------------------------------------

/** Input for paginated response listing. */
export const listIntakeResponsesInputSchema = z.object({
  formId: intakeFormIdSchema,
  cursor: ticketIdSchema.nullable().default(null),
  pageSize: z.number().int().min(1).max(100).default(25),
});
export type ListIntakeResponsesInput = z.infer<
  typeof listIntakeResponsesInputSchema
>;

/** ECIES key wrap triple on the wire (base64url strings). */
export const wireKeyWrapSchema = z.object({
  ephemeralPoint: z.string(),
  nonce: z.string(),
  wrappedKey: z.string(),
});
export type WireKeyWrap = z.infer<typeof wireKeyWrapSchema>;

/** Missing principal reported for lazy backfill. */
export const missingPrincipalSchema = z.object({
  volunteerId: userIdSchema,
  volPublic: z.string(),
});
export type MissingPrincipal = z.infer<typeof missingPrincipalSchema>;

/** A single response row in the listing. */
export const intakeResponseRowSchema = z.object({
  ticketId: ticketIdSchema,
  submittedAt: z.string(),
  encryptedResponse: z.string(),
  callerKeyWrap: wireKeyWrapSchema
    .extend({ volunteerId: userIdSchema })
    .nullable(),
  orgSealWrap: z.object({ wrappedTk: z.string() }).nullable(),
  missingPrincipals: z.array(missingPrincipalSchema),
});
export type IntakeResponseRowWire = z.infer<typeof intakeResponseRowSchema>;

/** Paginated response listing output. */
export const listIntakeResponsesOutputSchema = z.object({
  rows: z.array(intakeResponseRowSchema),
  nextCursor: ticketIdSchema.nullable(),
  total: z.number().int(),
});
export type ListIntakeResponsesOutput = z.infer<
  typeof listIntakeResponsesOutputSchema
>;

/** A single backfill wrap from the client. */
export const backfillWrapInputSchema = z.object({
  volunteerId: userIdSchema,
  ephemeralPoint: base64Bytes(32, "ephemeralPoint"),
  nonce: base64Bytes(24, "nonce"),
  wrappedKey: base64String("wrappedKey").refine(
    (s) => s.length <= 256,
    "wrappedKey too large",
  ),
});
export type BackfillWrapInput = z.infer<typeof backfillWrapInputSchema>;

/** Input for the lazy wrap backfill mutation. */
export const backfillWrapsInputSchema = z.object({
  ticketId: ticketIdSchema,
  wraps: z.array(backfillWrapInputSchema).min(1).max(200),
});
export type BackfillWrapsInput = z.infer<typeof backfillWrapsInputSchema>;

/** Output of the backfill mutation. */
export const backfillWrapsOutputSchema = z.object({
  inserted: z.number().int(),
});
export type BackfillWrapsOutput = z.infer<typeof backfillWrapsOutputSchema>;

/** Input for the CSV export audit log mutation. Carries counts only, never content. */
export const logExportInputSchema = z.object({
  formId: intakeFormIdSchema,
  exportedCount: z.number().int().min(0),
  skippedCount: z.number().int().min(0),
});
export type LogExportInput = z.infer<typeof logExportInputSchema>;
