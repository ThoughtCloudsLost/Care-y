/**
 * Error-to-message resolution that prefers a concrete wait time.
 *
 * Rate-limited procedures forward the server's retry hint as
 * data.retryAfterSeconds. When it is present the user sees how long to
 * wait; otherwise the shared ErrorCode mapping applies.
 */

import * as m from "$lib/paraglide/messages.js";
import { readRateLimitError } from "$lib/portal/rate-limit-error.js";
import { getErrorMessage } from "./query-error-messages.js";

/**
 * Resolves an unknown error to a user-facing message, naming the number of
 * seconds to wait when the server sent a retry hint.
 */
export function getErrorMessageWithWait(err: unknown): string {
  const seconds = readRateLimitError(err)?.retryAfterSeconds ?? null;
  if (seconds !== null) {
    return m.error_retry_after_seconds({
      seconds: String(Math.ceil(seconds)),
    });
  }
  return getErrorMessage(err);
}
