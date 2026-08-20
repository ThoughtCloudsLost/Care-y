/**
 * Record-mode flag plumbing.
 *
 * Record mode (?record=1) is tooling for the capture pipeline: it
 * flattens the backdrop, freezes the status bar clock, and pins
 * relative timestamps so re-recordings produce identical frames.
 *
 * The flag is read from the current document's location.search and
 * cached at module evaluation. Both the outer page and the phone
 * iframe read their own URL, so the outer page must forward the
 * parameter when building the iframe src.
 */

/** Cached once per document at module load. */
const RECORD: boolean =
  typeof location !== "undefined" &&
  new URLSearchParams(location.search).get("record") === "1";

/** Whether the current document is in record mode. */
export function isRecordMode(): boolean {
  return RECORD;
}

/**
 * Append ?record=1 to a URL string when the caller is in record mode.
 * Preserves any existing query parameters on the base URL.
 */
export function forwardRecordParam(url: string): string {
  if (!RECORD) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}record=1`;
}

/**
 * Frozen reference timestamp for pinning relative times.
 *
 * Captured once at module evaluation so every formatRelativeTime call
 * in the same document computes its delta against the same instant.
 * Because the phone boots, seeds data, then renders, the seed
 * timestamps are always relative to boot time. Freezing the reference
 * at boot gives stable minute-granularity output across re-records.
 */
export const FROZEN_NOW: number = Date.now();
