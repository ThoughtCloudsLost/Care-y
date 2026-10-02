/**
 * Zod schemas for fund accounting (ADR-109).
 *
 * Two kinds of schema live here. Input schemas validate what crosses the
 * tRPC boundary: every encrypted field is an opaque base64 string that the
 * route converts to a Buffer. Payload schemas validate what the browser
 * decrypts: the fund record, its running balance and the ledger entry are
 * Org Key sealed JSON, and the case note envelope is the ticket-key
 * encrypted content of a disbursement follow-up.
 * The server never parses a payload; it cannot open one.
 *
 * Nothing about a fund or an entry sits in a plaintext column. The fund an
 * entry belongs to, its amount, its type, the case it was recorded from,
 * who recorded it and when (beyond the day) all live inside the ciphertext.
 */

import { z } from "zod";
import { base64String } from "./validators.js";
import {
  followupIdSchema,
  fundIdSchema,
  fundLedgerIdSchema,
  ticketIdSchema,
  userIdSchema,
} from "../ids.js";

// --- Input schemas ---

/** A new fund, with its balance sealed at zero by the client. */
export const createFundInputSchema = z.object({
  encryptedPayload: base64String("encryptedPayload"),
  encryptedBalance: base64String("encryptedBalance"),
});
export type CreateFundInput = z.infer<typeof createFundInputSchema>;

/** No delete exists for funds. Setting isActive false hides one from pickers. */
export const updateFundInputSchema = z.object({
  fundId: fundIdSchema,
  encryptedPayload: base64String("encryptedPayload").optional(),
  isActive: z.boolean().optional(),
});
export type UpdateFundInput = z.infer<typeof updateFundInputSchema>;

/**
 * The case half of a disbursement: a disbursement follow-up encrypted
 * under the case's ticket key, whose content is a note envelope.
 */
export const disbursementCaseNoteInputSchema = z.object({
  followUpId: followupIdSchema,
  ticketId: ticketIdSchema,
  encryptedContent: base64String("encryptedContent"),
});
export type DisbursementCaseNoteInput = z.infer<
  typeof disbursementCaseNoteInputSchema
>;

/**
 * A write of a fund's sealed running balance. `expectedVersion` is the
 * `balanceVersion` the caller read from `funds.list`; the server applies
 * the new balance only while the stored version still matches, and
 * answers FUND_BALANCE_STALE otherwise.
 *
 * `orgKeyGeneration` is the Org Key generation the balance was sealed
 * under, and the whole fund row moves to it. When the row the caller read
 * is behind that generation, `encryptedPayload` carries the fund payload
 * resealed under it; without one the server refuses the write rather than
 * leave the row's two columns sealed under different generations.
 */
export const fundBalanceInputSchema = z.object({
  fundId: fundIdSchema,
  encryptedBalance: base64String("encryptedBalance"),
  expectedVersion: z.number().int().min(0),
  orgKeyGeneration: z.number().int().min(1),
  encryptedPayload: base64String("encryptedPayload").optional(),
});
export type FundBalanceInput = z.infer<typeof fundBalanceInputSchema>;

/** One ledger row: its client-minted id and its sealed payload. */
export const fundLedgerEntryInputSchema = z.object({
  id: fundLedgerIdSchema,
  encryptedPayload: base64String("encryptedPayload"),
});
export type FundLedgerEntryInput = z.infer<typeof fundLedgerEntryInputSchema>;

/**
 * A disbursement ledger entry and the fund balance it leaves, optionally
 * with its case note. The case half is absent for fund-level spending that
 * belongs to no case.
 */
export const recordDisbursementInputSchema = z.object({
  id: fundLedgerIdSchema,
  encryptedPayload: base64String("encryptedPayload"),
  balance: fundBalanceInputSchema,
  caseNote: disbursementCaseNoteInputSchema.optional(),
});
export type RecordDisbursementInput = z.infer<
  typeof recordDisbursementInputSchema
>;

/**
 * An adjustment or reversal entry and the fund balance it leaves.
 * Fund-level only, never tied to a case.
 */
export const recordAdjustmentInputSchema = z.object({
  id: fundLedgerIdSchema,
  encryptedPayload: base64String("encryptedPayload"),
  balance: fundBalanceInputSchema,
});
export type RecordAdjustmentInput = z.infer<typeof recordAdjustmentInputSchema>;

/**
 * Correct a recorded disbursement: a reversal of the old entry, the
 * replacement entry, the rewritten case note and the balance both leave,
 * applied together or not at all. The note is the existing one, edited in
 * place.
 */
export const reviseDisbursementInputSchema = z
  .object({
    reversal: fundLedgerEntryInputSchema,
    replacement: fundLedgerEntryInputSchema,
    balance: fundBalanceInputSchema,
    caseNote: disbursementCaseNoteInputSchema,
  })
  .refine((d) => d.reversal.id !== d.replacement.id, {
    message: "The reversal and the replacement need different ids",
    path: ["replacement", "id"],
  });
export type ReviseDisbursementInput = z.infer<
  typeof reviseDisbursementInputSchema
>;

/**
 * Overwrite a fund's sealed balance with one recomputed from the ledger.
 * No ledger row is written.
 */
export const setFundBalanceInputSchema = z.object({
  balance: fundBalanceInputSchema,
});
export type SetFundBalanceInput = z.infer<typeof setFundBalanceInputSchema>;

export const updateFundSettingsInputSchema = z.object({
  notifyFundManagers: z.boolean(),
});
export type UpdateFundSettingsInput = z.infer<
  typeof updateFundSettingsInputSchema
>;

// --- Payload schemas (browser-side, after decryption) ---

/** ISO 4217 alphabetic code: three uppercase letters. */
export const currencyCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/, "currency must be an ISO 4217 code");

/**
 * A fund's link to an external provider fund. Held inside the sealed
 * payload so the database does not reveal which fund maps to which public
 * campaign.
 */
export const fundProviderLinkSchema = z.object({
  connectionId: z.string().min(1),
  externalFundId: z.string().min(1),
});
export type FundProviderLink = z.infer<typeof fundProviderLinkSchema>;

/** `funds.encrypted_payload`, Org Key sealed. */
export const fundPayloadSchema = z.object({
  v: z.literal(1),
  name: z.string().min(1),
  currency: currencyCodeSchema,
  providerLink: fundProviderLinkSchema.nullable(),
});
export type FundPayload = z.infer<typeof fundPayloadSchema>;

/**
 * `funds.encrypted_balance`, Org Key sealed. Signed integer in the fund
 * currency's minor units: the previous balance plus each entry's
 * `amountMinor`. This is the figure every surface shows; the ledger sum is
 * the audit check against it.
 */
export const fundBalancePayloadSchema = z.object({
  v: z.literal(1),
  balanceMinor: z.number().int(),
});
export type FundBalancePayload = z.infer<typeof fundBalancePayloadSchema>;

export const fundEntryTypeSchema = z.enum([
  "disbursement",
  "adjustment",
  "reversal",
]);
export type FundEntryType = z.infer<typeof fundEntryTypeSchema>;

/**
 * `fund_ledger.encrypted_payload`, Org Key sealed.
 *
 * Amounts are signed integers in the currency's minor units. A
 * disbursement is negative, an adjustment takes either sign, and a
 * reversal carries the negation of the entry it names in `reversesId`.
 * Only a reversal names another entry.
 *
 * A disbursement recorded from a case names that case and its case record,
 * and so do the reversal and replacement a revision writes for it. The
 * pointer lives in here rather than in a column because a plaintext link
 * would pair the case with the entry from a database dump. Adjustments,
 * fund-level disbursements and rows written before the pointer existed
 * carry none, so both fields are optional, set together or not at all.
 */
export const fundLedgerPayloadSchema = z
  .object({
    v: z.literal(1),
    amountMinor: z.number().int(),
    entryType: fundEntryTypeSchema,
    fundId: fundIdSchema,
    recordedAt: z.iso.datetime(),
    recordedBy: userIdSchema,
    reversesId: fundLedgerIdSchema.optional(),
    /** The case this entry was recorded from, when it was. */
    ticketId: ticketIdSchema.optional(),
    /** The case record that holds the note and the pointer back here. */
    followUpId: followupIdSchema.optional(),
  })
  .refine((d) => d.entryType !== "disbursement" || d.amountMinor < 0, {
    message: "A disbursement amount must be negative",
    path: ["amountMinor"],
  })
  .refine(
    (d) => (d.entryType === "reversal") === (d.reversesId !== undefined),
    {
      message: "reversesId is required on a reversal and allowed nowhere else",
      path: ["reversesId"],
    },
  )
  .refine((d) => (d.ticketId === undefined) === (d.followUpId === undefined), {
    message: "ticketId and followUpId are set together",
    path: ["followUpId"],
  })
  .refine((d) => d.entryType !== "adjustment" || d.ticketId === undefined, {
    message: "An adjustment names no case",
    path: ["ticketId"],
  });
export type FundLedgerPayload = z.infer<typeof fundLedgerPayloadSchema>;

// --- Case note envelope (ticket-key encrypted follow-up content) ---

/**
 * First character of a note that carries a structured envelope. A control
 * character a textarea cannot produce, so no typed note collides with it.
 */
export const NOTE_ENVELOPE_MARKER = "\u0001";

export const disbursementNoteEnvelopeSchema = z.object({
  v: z.literal(1),
  kind: z.literal("disbursement"),
  ledgerEntryId: fundLedgerIdSchema,
  fundId: fundIdSchema,
  amountMinor: z.number().int(),
  currency: currencyCodeSchema,
  note: z.string(),
});
export type DisbursementNoteEnvelope = z.infer<
  typeof disbursementNoteEnvelopeSchema
>;

/** True when decrypted note content opens with the envelope marker. */
export function hasNoteEnvelopeMarker(content: string): boolean {
  return content.startsWith(NOTE_ENVELOPE_MARKER);
}

/** Serialize an envelope to the note content that gets encrypted. */
export function encodeNoteEnvelope(envelope: DisbursementNoteEnvelope): string {
  return NOTE_ENVELOPE_MARKER + JSON.stringify(envelope);
}

/**
 * Parse decrypted note content as an envelope. Returns null for a plain
 * note, and also for content that carries the marker but does not hold a
 * valid envelope; a caller that needs to tell those two apart checks
 * `hasNoteEnvelopeMarker` first and shows the undecryptable placeholder
 * for the second.
 */
export function decodeNoteEnvelope(
  content: string,
): DisbursementNoteEnvelope | null {
  if (!hasNoteEnvelopeMarker(content)) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(content.slice(NOTE_ENVELOPE_MARKER.length));
  } catch {
    // Marker present, body is not JSON: documented null result above.
    return null;
  }
  const result = disbursementNoteEnvelopeSchema.safeParse(parsed);
  return result.success ? result.data : null;
}
