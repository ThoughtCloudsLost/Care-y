/**
 * Client-side CSV assembly for intake form responses.
 *
 * Builds a UTF-8 CSV string from decrypted responses. The CSV never
 * touches the server; assembly is purely in-browser from data already
 * held by the viewer component.
 *
 * CSV injection mitigation follows OWASP guidance: cells whose first
 * character is one of = + - @ | TAB CR are prefixed with a single
 * quote so spreadsheet applications treat them as text, not formulas.
 * Source: https://owasp.org/www-community/attacks/CSV_Injection
 *
 * Quoting follows RFC 4180: fields containing commas, double-quotes,
 * or newlines are wrapped in double-quotes, with internal double-quotes
 * escaped by doubling.
 */

import {
  resolveLocalized,
  FORM_LOCALES,
  BASE_LOCALE,
  type FormLocale,
  type LocalizedText,
} from "@care-y/shared";

/** Narrow an app locale string to a supported form locale, base fallback. */
function toFormLocale(locale: string): FormLocale {
  const match = FORM_LOCALES.find((l) => l === locale);
  return match ?? BASE_LOCALE;
}
import type { DecryptedIntakeAnswer } from "$lib/workers/crypto-protocol.js";

// ── Types ────────────────────────────────────────────────────────────

export interface CsvFieldDef {
  readonly fieldKey: string;
  readonly label: LocalizedText;
  readonly fieldType: string;
}

export interface CsvRow {
  readonly submittedAt: string;
  readonly answers: readonly DecryptedIntakeAnswer[];
}

export interface CsvAssemblyResult {
  readonly csv: string;
  readonly exportedCount: number;
}

// Characters that trigger formula interpretation in Excel, Sheets,
// Calc, and Numbers. A leading single-quote neutralizes them.
const FORMULA_CHARS = new Set(["=", "+", "-", "@", "|", "\t", "\r"]);

// ── Public API ───────────────────────────────────────────────────────

/**
 * Assemble a CSV string from decrypted intake response rows.
 *
 * Columns: "Submitted" timestamp, then one column per field definition
 * in definition order. The timestamp header and field labels are
 * localized to the provided locale via `resolveLocalized`.
 *
 * Only rows that were successfully decrypted should be passed here.
 * The caller (viewer) filters out key-not-held and failed rows before
 * calling this function.
 */
export function assembleIntakeCsv(
  fields: ReadonlyMap<string, CsvFieldDef>,
  rows: readonly CsvRow[],
  locale: string,
  timestampHeader: string,
): CsvAssemblyResult {
  // Build ordered field key list from the Map iteration order
  // (which matches definition insertion order in the viewer)
  const orderedKeys: string[] = [];
  for (const [key] of fields) {
    orderedKeys.push(key);
  }

  // Header row
  const headers = [timestampHeader];
  for (const key of orderedKeys) {
    const def = fields.get(key);
    const label =
      def !== undefined
        ? (resolveLocalized(def.label, toFormLocale(locale)) ?? key)
        : key;
    headers.push(label);
  }

  const csvLines: string[] = [headers.map(escapeCell).join(",")];

  // Data rows
  for (const row of rows) {
    const answerMap = new Map<string, unknown>();
    for (const answer of row.answers) {
      answerMap.set(answer.fieldKey, answer.value);
    }

    const cells = [formatTimestamp(row.submittedAt)];
    for (const key of orderedKeys) {
      const value = answerMap.get(key);
      cells.push(formatCellValue(value));
    }

    csvLines.push(cells.map(escapeCell).join(","));
  }

  // BOM + newline-terminated CSV
  const csv = "﻿" + csvLines.join("\r\n") + "\r\n";

  return { csv, exportedCount: rows.length };
}

// ── Formatting ───────────────────────────────────────────────────────

/** Format a cell value to a display string, consistent with the viewer. */
function formatCellValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return (value as unknown[])
      .map((v) => (typeof v === "string" ? v : JSON.stringify(v)))
      .join("; ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  if (typeof value === "bigint") return value.toString();
  return "";
}

/** Format an ISO timestamp to a locale-neutral sortable string. */
function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toISOString();
  } catch {
    return iso;
  }
}

// ── CSV escaping ─────────────────────────────────────────────────────

/**
 * Escape a single CSV cell per RFC 4180 + OWASP CSV injection
 * mitigation.
 *
 * 1. If the cell starts with a formula-triggering character, prefix
 *    with a single-quote (neutralizes formula interpretation).
 * 2. If the cell contains a comma, double-quote, or newline, wrap in
 *    double-quotes with internal double-quotes doubled.
 */
function escapeCell(raw: string): string {
  let cell = raw;

  // CSV injection prefix
  if (cell.length > 0 && FORMULA_CHARS.has(cell.charAt(0))) {
    cell = "'" + cell;
  }

  // RFC 4180 quoting
  if (
    cell.includes(",") ||
    cell.includes('"') ||
    cell.includes("\n") ||
    cell.includes("\r")
  ) {
    return '"' + cell.replace(/"/g, '""') + '"';
  }

  return cell;
}
