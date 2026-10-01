/**
 * Fund balance math and money formatting. Pure: no Svelte, no crypto,
 * no network.
 *
 * Every amount is an integer number of minor units (cents). Ledger
 * signs follow the payload convention: disbursements negative,
 * adjustments either sign, reversals the negation of the entry they
 * cancel.
 *
 * What every surface displays is the fund's sealed running balance:
 * each write carries the previous balance plus the entry's amount
 * (balanceAfter). The ledger is the audit trail. Summed, it must equal
 * the sealed balance:
 *
 *   raised (provider, zero until linked) + adjusted - disbursed
 *
 * which is raised plus the plain sum of every entry. The split into
 * adjusted and disbursed attributes each reversal to the kind of entry
 * it cancels, so a corrected disbursement stays under disbursed.
 */

import type { FundLedgerPayload } from "@care-y/shared";

/** A decrypted ledger entry, as the balance math sees it. */
export interface BalanceEntry {
  readonly id: string;
  readonly payload: FundLedgerPayload;
}

/** One fund's ledger, summed. Only the audit page reads the ledger. */
export interface LedgerTotals {
  /** Provider inflow. Zero until the fund is linked to a provider. */
  readonly raised: number;
  /** Net manual adjustments. Reversals of adjustments count here. */
  readonly adjusted: number;
  /** Net money out, as a positive number when money left the fund. */
  readonly disbursed: number;
  /** What the sealed balance should equal. */
  readonly available: number;
}

export const EMPTY_TOTALS: LedgerTotals = Object.freeze({
  raised: 0,
  adjusted: 0,
  disbursed: 0,
  available: 0,
});

/** Longest reversal chain followed before giving up on attribution. */
const MAX_REVERSAL_DEPTH = 16;

type Bucket = "adjusted" | "disbursed";

/**
 * Which bucket an entry counts toward. A reversal counts toward the
 * bucket of the entry it cancels, following chains of reversals. When
 * the cancelled entry is not in the list, the sign decides: a positive
 * reversal puts money back, which is what cancelling a disbursement does.
 */
function bucketOf(
  entry: BalanceEntry,
  byId: ReadonlyMap<string, BalanceEntry>,
): Bucket {
  let current = entry;
  for (let depth = 0; depth < MAX_REVERSAL_DEPTH; depth++) {
    const { entryType, reversesId } = current.payload;
    if (entryType === "disbursement") return "disbursed";
    if (entryType === "adjustment") return "adjusted";
    const target = reversesId === undefined ? undefined : byId.get(reversesId);
    if (target === undefined) break;
    current = target;
  }
  return entry.payload.amountMinor > 0 ? "disbursed" : "adjusted";
}

/** One fund's ledger totals from its entries. */
export function computeLedgerTotals(
  entries: readonly BalanceEntry[],
  raised = 0,
): LedgerTotals {
  const byId = new Map(entries.map((e) => [e.id, e] as const));
  let adjusted = 0;
  let disbursed = 0;
  for (const entry of entries) {
    if (bucketOf(entry, byId) === "disbursed") {
      disbursed -= entry.payload.amountMinor;
    } else {
      adjusted += entry.payload.amountMinor;
    }
  }
  return {
    raised,
    adjusted,
    disbursed,
    available: raised + adjusted - disbursed,
  };
}

/**
 * Whether the sealed balance agrees with the ledger. A mismatch is what
 * the audit page offers to recompute.
 */
export function ledgerMatchesBalance(
  totals: LedgerTotals,
  balanceMinor: number,
): boolean {
  return totals.available === balanceMinor;
}

/** Entries grouped by the fund id inside each payload. */
export function groupByFund<T extends BalanceEntry>(
  entries: readonly T[],
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const entry of entries) {
    const list = grouped.get(entry.payload.fundId);
    if (list === undefined) {
      grouped.set(entry.payload.fundId, [entry]);
    } else {
      list.push(entry);
    }
  }
  return grouped;
}

/** Look up rows by id. */
export function indexById<T extends { readonly id: string }>(
  rows: readonly T[],
): Map<string, T> {
  return new Map(rows.map((row) => [row.id, row] as const));
}

/** Ledger totals for every fund that has at least one entry. */
export function computeLedgerTotalsByFund(
  entries: readonly BalanceEntry[],
): Map<string, LedgerTotals> {
  const totals = new Map<string, LedgerTotals>();
  for (const [fundId, list] of groupByFund(entries)) {
    totals.set(fundId, computeLedgerTotals(list));
  }
  return totals;
}

/** Ids of entries some reversal cancels. */
export function reversedEntryIds(
  entries: readonly BalanceEntry[],
): Set<string> {
  const ids = new Set<string>();
  for (const entry of entries) {
    const target = entry.payload.reversesId;
    if (entry.payload.entryType === "reversal" && target !== undefined) {
      ids.add(target);
    }
  }
  return ids;
}

/** The balance to seal after an entry of the given signed amount. */
export function balanceAfter(balanceMinor: number, deltaMinor: number): number {
  return balanceMinor + deltaMinor;
}

/** Negative balances get distinct, neutral styling (never an alarm). */
export function isBelowZero(amountMinor: number): boolean {
  return amountMinor < 0;
}

// ── Amount input ────────────────────────────────────────────────────

const MAX_WHOLE_DIGITS = 12;
const MAX_FRACTION_DIGITS = 2;

/** True for a non-empty run of ASCII digits and nothing else. */
function isDigitRun(text: string): boolean {
  if (text.length === 0) return false;
  for (const ch of text) {
    if (ch < "0" || ch > "9") return false;
  }
  return true;
}

/**
 * Split a typed amount into its whole and fraction digits, checked
 * character by character rather than with a regex. The whole part is 1
 * to 12 ASCII digits, optionally followed by one decimal separator and
 * then one or two digits. Both "." and "," are accepted as the separator
 * because the app ships in English and Spanish. Group separators are not
 * accepted, so a second separator of either kind rejects the input. The
 * fraction is empty when no separator is present. Null for any other
 * shape.
 */
function splitMajorAmount(
  text: string,
): { readonly whole: string; readonly fraction: string } | null {
  const dot = text.indexOf(".");
  const comma = text.indexOf(",");
  if (dot !== -1 && comma !== -1) return null;
  const separator = dot !== -1 ? dot : comma;
  if (separator === -1) {
    if (text.length > MAX_WHOLE_DIGITS || !isDigitRun(text)) return null;
    return { whole: text, fraction: "" };
  }
  const whole = text.slice(0, separator);
  const fraction = text.slice(separator + 1);
  if (whole.length > MAX_WHOLE_DIGITS || !isDigitRun(whole)) return null;
  if (fraction.length > MAX_FRACTION_DIGITS || !isDigitRun(fraction)) {
    return null;
  }
  return { whole, fraction };
}

/**
 * Convert a typed major-unit amount ("12.50", "12,5", "12") into a
 * positive integer of minor units. Null for empty, zero, negative,
 * malformed, or more than two decimals.
 */
export function parseMajorAmount(input: string): number | null {
  const parts = splitMajorAmount(input.trim());
  if (parts === null) return null;
  const whole = Number(parts.whole);
  const fraction = Number(parts.fraction.padEnd(MAX_FRACTION_DIGITS, "0"));
  const minor = whole * 100 + fraction;
  if (!Number.isSafeInteger(minor) || minor <= 0) return null;
  return minor;
}

/** A minor-unit amount as an editable major-unit string ("12.50"). */
export function minorToMajorInput(amountMinor: number): string {
  const abs = Math.abs(amountMinor);
  const whole = Math.floor(abs / 100);
  const fraction = String(abs % 100).padStart(2, "0");
  return `${String(whole)}.${fraction}`;
}

// ── Formatting ──────────────────────────────────────────────────────

const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(
  currency: string,
  locale: string | undefined,
): Intl.NumberFormat | null {
  const key = `${locale ?? ""}|${currency}`;
  const cached = formatters.get(key);
  if (cached !== undefined) return cached;
  try {
    const created = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    });
    formatters.set(key, created);
    return created;
  } catch {
    // Intl rejects a currency code it does not know with a RangeError.
    return null;
  }
}

/**
 * Format a minor-unit amount in the fund's currency. An unknown currency
 * code falls back to the plain number followed by the code.
 */
export function formatMinorAmount(
  amountMinor: number,
  currency: string,
  locale?: string,
): string {
  const major = amountMinor / 100;
  const formatter = formatterFor(currency, locale);
  if (formatter !== null) return formatter.format(major);
  return `${major.toFixed(2)} ${currency}`;
}
