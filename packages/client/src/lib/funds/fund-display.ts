/**
 * Display helpers shared by every surface that shows money or a
 * disbursement note: amounts in the active UI locale, and readable text
 * in place of a note envelope.
 */

import {
  hasNoteEnvelopeMarker,
  type DisbursementNoteEnvelope,
} from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";
import { getLocale } from "$lib/paraglide/runtime.js";
import { ERROR, type DecryptResult } from "$lib/crypto/decrypt-result.js";
import { formatMinorAmount } from "./balances.js";
import { openDisbursementNote } from "./fund-payloads.js";

/** A minor-unit amount in the given currency and the active UI locale. */
export function formatAmount(amountMinor: number, currency: string): string {
  return formatMinorAmount(amountMinor, currency, getLocale());
}

/** One line for timeline labels: "Disbursement: $50.00". */
export function disbursementSummary(
  envelope: DisbursementNoteEnvelope,
): string {
  return m.fund_note_summary({
    amount: formatAmount(envelope.amountMinor, envelope.currency),
  });
}

/**
 * The text a disbursement note shows in the case thread: amount and fund
 * on the first line, the volunteer's note below it.
 */
export function disbursementNoteText(
  envelope: DisbursementNoteEnvelope,
  fundName: string | undefined,
): string {
  const amount = formatAmount(envelope.amountMinor, envelope.currency);
  const headline =
    fundName === undefined
      ? m.fund_note_headline({ amount })
      : m.fund_note_headline_fund({ amount, fund: fundName });
  return envelope.note === "" ? headline : `${headline}\n${envelope.note}`;
}

/** Whether a decrypted note carries an envelope (so plain-note edit is off). */
export function isEnvelopeResult(result: DecryptResult): boolean {
  return result.status === "ready" && hasNoteEnvelopeMarker(result.value);
}

/** Looks up a fund's name, or undefined when the session cannot read it. */
export type FundNameResolver = (fundId: string) => string | undefined;

/**
 * Decrypted note content as a person should read it: typed notes as
 * they are, a disbursement envelope as its readable text. Null for
 * content that carries the envelope marker but no valid envelope, which
 * callers show as unreadable rather than as raw JSON. Surfaces with no
 * fund cache at hand omit the resolver and get the text without the
 * fund's name.
 */
export function readableNoteText(
  content: string,
  resolveFundName?: FundNameResolver,
): string | null {
  if (!hasNoteEnvelopeMarker(content)) return content;
  const envelope = openDisbursementNote(content);
  if (envelope === null) return null;
  return disbursementNoteText(envelope, resolveFundName?.(envelope.fundId));
}

/**
 * Swap a decrypted envelope for readable text. Plain notes and results
 * that are not ready pass through unchanged. An envelope that fails
 * validation reads as a decrypt error rather than as raw JSON.
 */
export function readableNoteResult(
  result: DecryptResult,
  resolveFundName?: FundNameResolver,
): DecryptResult {
  if (result.status !== "ready" || !hasNoteEnvelopeMarker(result.value)) {
    return result;
  }
  const text = readableNoteText(result.value, resolveFundName);
  if (text === null) return ERROR;
  return Object.freeze({ status: "ready", value: text });
}
