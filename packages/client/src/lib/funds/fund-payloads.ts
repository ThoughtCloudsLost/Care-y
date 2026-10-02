/**
 * Org Key payloads for funds, their sealed balances and ledger entries,
 * and the case note envelope that records a disbursement on a case.
 *
 * Sealing goes through OrgKeyManager.encryptText, the same call queues
 * and note types use. Opening takes plaintext the shared OrgDecryptCache
 * already produced and validates it against the shared schemas, so a row
 * that decrypts to something unexpected reads as unreadable rather than
 * as a wrong amount. Nothing here holds keys or talks to the server.
 */

import {
  decodeNoteEnvelope,
  encodeNoteEnvelope,
  fundBalancePayloadSchema,
  fundLedgerPayloadSchema,
  followupIdSchema,
  fundPayloadSchema,
  hasNoteEnvelopeMarker,
  ticketIdSchema,
  userIdSchema,
  type DisbursementNoteEnvelope,
  type FundBalancePayload,
  type FundId,
  type FundLedgerId,
  type FundLedgerPayload,
  type FundPayload,
  type FollowupId,
  type TicketId,
  type UserId,
} from "@care-y/shared";
import { ClientError } from "$lib/errors.js";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";

/** The one OrgKeyManager call sealing needs. */
export type FundSealer = Pick<OrgKeyManager, "encryptText">;

/** A payload failed its schema before sealing. Carries no field values. */
export class FundPayloadError extends ClientError {
  constructor(kind: "fund" | "ledger" | "balance") {
    super(`Invalid ${kind} payload`);
    this.name = "FundPayloadError";
  }
}

/**
 * The fund's sealed balance could not be read: the fund is gone from
 * the list, or its balance failed to decrypt or validate. Nothing is
 * written without a balance to build on.
 */
export class FundUnavailableError extends ClientError {
  constructor() {
    super("Fund not available");
    this.name = "FundUnavailableError";
  }
}

/** Parse JSON without throwing. Anything malformed reads as absent. */
function parseJson(plaintext: string): unknown {
  try {
    return JSON.parse(plaintext);
  } catch {
    return undefined;
  }
}

// ── Fund payload ────────────────────────────────────────────────────

export interface FundPayloadInput {
  readonly name: string;
  readonly currency: string;
  readonly providerLink?: FundPayload["providerLink"];
}

/** Build a fund payload. The name is trimmed and the currency upper-cased. */
export function buildFundPayload(input: FundPayloadInput): FundPayload {
  const parsed = fundPayloadSchema.safeParse({
    v: 1,
    name: input.name.trim(),
    currency: input.currency.trim().toUpperCase(),
    providerLink: input.providerLink ?? null,
  });
  if (!parsed.success) throw new FundPayloadError("fund");
  return parsed.data;
}

/** Seal a fund payload with the org public key. Returns base64 ciphertext. */
export async function sealFundPayload(
  sealer: FundSealer,
  input: FundPayloadInput,
): Promise<string> {
  return sealer.encryptText(JSON.stringify(buildFundPayload(input)));
}

/** Validate decrypted fund plaintext. Null for absent or malformed input. */
export function openFundPayload(plaintext: string | null): FundPayload | null {
  if (plaintext === null) return null;
  const parsed = fundPayloadSchema.safeParse(parseJson(plaintext));
  return parsed.success ? parsed.data : null;
}

// ── Balance payload ─────────────────────────────────────────────────

/** Build a sealed-balance payload. Rejects anything but a safe integer. */
export function buildBalancePayload(balanceMinor: number): FundBalancePayload {
  const parsed = fundBalancePayloadSchema.safeParse({ v: 1, balanceMinor });
  if (!parsed.success) throw new FundPayloadError("balance");
  return parsed.data;
}

/**
 * Seal a fund's running balance with the org public key. Written on
 * create (zero) and with every ledger entry. Returns base64 ciphertext.
 */
export async function sealBalancePayload(
  sealer: FundSealer,
  balanceMinor: number,
): Promise<string> {
  return sealer.encryptText(JSON.stringify(buildBalancePayload(balanceMinor)));
}

/** Validate decrypted balance plaintext. Null for absent or malformed input. */
export function openBalancePayload(
  plaintext: string | null,
): FundBalancePayload | null {
  if (plaintext === null) return null;
  const parsed = fundBalancePayloadSchema.safeParse(parseJson(plaintext));
  return parsed.success ? parsed.data : null;
}

// ── Ledger payload ──────────────────────────────────────────────────

/**
 * The signed-in user as the recorder of an entry, or null when no valid
 * user id is available (the caller shows an error and records nothing).
 */
export function recorderId(userId: string | undefined): UserId | null {
  const parsed = userIdSchema.safeParse(userId);
  return parsed.success ? parsed.data : null;
}

interface EntryContext {
  readonly fundId: FundId;
  readonly recordedBy: UserId;
  /** Client clock. Defaults to now. */
  readonly recordedAt?: Date;
}

/**
 * The case a disbursement was recorded from and the follow-up that holds
 * its note. Sealed inside the ledger payload, never in a column.
 */
export interface CasePointer {
  readonly ticketId: TicketId;
  readonly followUpId: FollowupId;
}

/**
 * The case pointer for a ledger payload, or null when either id is not
 * valid (the caller records nothing).
 */
export function casePointer(
  ticketId: string,
  followUpId: string,
): CasePointer | null {
  const ticket = ticketIdSchema.safeParse(ticketId);
  const followUp = followupIdSchema.safeParse(followUpId);
  return ticket.success && followUp.success
    ? { ticketId: ticket.data, followUpId: followUp.data }
    : null;
}

function casePointerFields(
  caseRef: CasePointer | undefined,
): Partial<CasePointer> {
  return caseRef !== undefined
    ? { ticketId: caseRef.ticketId, followUpId: caseRef.followUpId }
    : {};
}

function validLedgerPayload(candidate: unknown): FundLedgerPayload {
  const parsed = fundLedgerPayloadSchema.safeParse(candidate);
  if (!parsed.success) throw new FundPayloadError("ledger");
  return parsed.data;
}

/**
 * A disbursement. Takes the amount as a positive number of minor units
 * and stores it negative, per the ledger sign convention. `caseRef`
 * names the case it was recorded from, when it was.
 */
export function disbursementPayload(
  ctx: EntryContext & {
    readonly amountMinor: number;
    readonly caseRef?: CasePointer;
  },
): FundLedgerPayload {
  return validLedgerPayload({
    v: 1,
    amountMinor: -Math.abs(ctx.amountMinor),
    entryType: "disbursement",
    fundId: ctx.fundId,
    recordedAt: (ctx.recordedAt ?? new Date()).toISOString(),
    recordedBy: ctx.recordedBy,
    ...casePointerFields(ctx.caseRef),
  });
}

/** An adjustment. The signed amount is stored as given. */
export function adjustmentPayload(
  ctx: EntryContext & { readonly amountMinor: number },
): FundLedgerPayload {
  return validLedgerPayload({
    v: 1,
    amountMinor: ctx.amountMinor,
    entryType: "adjustment",
    fundId: ctx.fundId,
    recordedAt: (ctx.recordedAt ?? new Date()).toISOString(),
    recordedBy: ctx.recordedBy,
  });
}

/**
 * The reversal of an existing entry. It carries the same fund, the negated
 * amount and a pointer to the entry it cancels. `caseRef` names the case
 * of the disbursement being reversed, when it has one.
 */
export function reversalPayload(ctx: {
  readonly reverses: {
    readonly id: FundLedgerId;
    readonly payload: Pick<FundLedgerPayload, "amountMinor" | "fundId">;
  };
  readonly recordedBy: UserId;
  readonly recordedAt?: Date;
  readonly caseRef?: CasePointer;
}): FundLedgerPayload {
  return validLedgerPayload({
    v: 1,
    amountMinor: -ctx.reverses.payload.amountMinor,
    entryType: "reversal",
    fundId: ctx.reverses.payload.fundId,
    recordedAt: (ctx.recordedAt ?? new Date()).toISOString(),
    recordedBy: ctx.recordedBy,
    reversesId: ctx.reverses.id,
    ...casePointerFields(ctx.caseRef),
  });
}

export interface DisbursementRevision {
  /** Cancels the entry the case note currently names. */
  readonly reversal: FundLedgerPayload;
  /** The corrected disbursement. */
  readonly replacement: FundLedgerPayload;
  /** What the pair does to the fund's balance, in signed minor units. */
  readonly deltaMinor: number;
}

/**
 * The two entries that correct a recorded disbursement: a reversal of
 * the entry the envelope names and a new disbursement of the corrected
 * amount, both in the envelope's fund. The envelope duplicates the
 * entry's amount and fund, so no ledger read is needed. `amountMinor`
 * is the corrected amount as a positive number of minor units. The
 * envelope names no case, so the caller supplies `caseRef` and both
 * rows carry it.
 */
export function disbursementRevision(ctx: {
  readonly envelope: DisbursementNoteEnvelope;
  readonly amountMinor: number;
  readonly recordedBy: UserId;
  readonly recordedAt?: Date;
  readonly caseRef?: CasePointer;
}): DisbursementRevision {
  const original = Math.abs(ctx.envelope.amountMinor);
  const corrected = Math.abs(ctx.amountMinor);
  const recordedAt = ctx.recordedAt ?? new Date();
  return {
    reversal: reversalPayload({
      reverses: {
        id: ctx.envelope.ledgerEntryId,
        payload: { amountMinor: -original, fundId: ctx.envelope.fundId },
      },
      recordedBy: ctx.recordedBy,
      recordedAt,
      caseRef: ctx.caseRef,
    }),
    replacement: disbursementPayload({
      fundId: ctx.envelope.fundId,
      recordedBy: ctx.recordedBy,
      amountMinor: corrected,
      recordedAt,
      caseRef: ctx.caseRef,
    }),
    deltaMinor: original - corrected,
  };
}

/** Seal a ledger payload with the org public key. Returns base64 ciphertext. */
export async function sealLedgerPayload(
  sealer: FundSealer,
  payload: FundLedgerPayload,
): Promise<string> {
  return sealer.encryptText(JSON.stringify(validLedgerPayload(payload)));
}

/** Validate decrypted ledger plaintext. Null for absent or malformed input. */
export function openLedgerPayload(
  plaintext: string | null,
): FundLedgerPayload | null {
  if (plaintext === null) return null;
  const parsed = fundLedgerPayloadSchema.safeParse(parseJson(plaintext));
  return parsed.success ? parsed.data : null;
}

// ── Case note envelope ──────────────────────────────────────────────

export interface DisbursementNoteInput {
  readonly ledgerEntryId: FundLedgerId;
  readonly fundId: FundId;
  /** Positive number of minor units, as the volunteer entered it. */
  readonly amountMinor: number;
  readonly currency: string;
  readonly note: string;
}

/**
 * The internal note content for a disbursement: the envelope marker
 * followed by the encoded envelope. The caller encrypts it under the
 * ticket key exactly as any other internal note.
 */
export function disbursementNoteContent(input: DisbursementNoteInput): string {
  return encodeNoteEnvelope({
    v: 1,
    kind: "disbursement",
    ledgerEntryId: input.ledgerEntryId,
    fundId: input.fundId,
    amountMinor: Math.abs(input.amountMinor),
    currency: input.currency,
    note: input.note.trim(),
  });
}

/**
 * The disbursement envelope inside decrypted note content, or null for a
 * plain note or an envelope that fails validation. Callers that must
 * tell those two apart check hasNoteEnvelopeMarker first.
 */
export function openDisbursementNote(
  content: string,
): DisbursementNoteEnvelope | null {
  if (!hasNoteEnvelopeMarker(content)) return null;
  return decodeNoteEnvelope(content);
}
