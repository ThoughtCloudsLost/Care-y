/**
 * Rate-limit detection for portal tRPC errors.
 *
 * The portal read procedures throw the server's RateLimitError, which the
 * error formatter surfaces as data.code "RATE_LIMITED" with a structured
 * retryAfterSeconds. Procedures that still throw raw TRPCError report
 * "TOO_MANY_REQUESTS" without the hint, so both codes count as rate limits
 * here and the hint stays optional.
 */

/** Structured view of a rate-limited tRPC error. */
export interface RateLimitInfo {
  /** Server retry hint in seconds, when the procedure forwards one. */
  readonly retryAfterSeconds: number | null;
}

/**
 * Reads rate-limit info out of an unknown error, or returns null when the
 * error is not a rate limit. Follows the shape-probing pattern of the PoW
 * guards rather than importing TRPCClientError, so it works on anything
 * that crosses a query boundary.
 */
export function readRateLimitError(err: unknown): RateLimitInfo | null {
  if (typeof err !== "object" || err === null || !("data" in err)) {
    return null;
  }
  const { data } = err;
  if (typeof data !== "object" || data === null || !("code" in data)) {
    return null;
  }
  if (data.code !== "RATE_LIMITED" && data.code !== "TOO_MANY_REQUESTS") {
    return null;
  }
  const retryAfterSeconds =
    "retryAfterSeconds" in data &&
    typeof data.retryAfterSeconds === "number" &&
    Number.isFinite(data.retryAfterSeconds) &&
    data.retryAfterSeconds > 0
      ? data.retryAfterSeconds
      : null;
  return { retryAfterSeconds };
}
