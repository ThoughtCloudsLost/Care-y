/**
 * Activity-driven renewal of the client account session.
 *
 * The server keeps an account session only a few minutes longer than the
 * page's idle timeout, and extends it only when the page asks. The page
 * asks from the idle timer's onActivity hook, throttled here, so a device
 * left open but unattended lets the session lapse on the server too.
 */

import { isUnauthorizedTrpcError } from "$lib/errors.js";

/**
 * Minimum spacing between renewals. Human input arrives many times a
 * second; one renewal every two minutes keeps a well-used session alive
 * with a wide margin against the server's 20 minute window.
 */
export const ACCOUNT_SESSION_RENEW_INTERVAL_MS = 2 * 60 * 1000;

export interface AccountSessionRenewerConfig {
  /** Calls the server renewal. */
  readonly renew: () => Promise<unknown>;
  /** Called when the server reports the session no longer exists. */
  readonly onUnauthorized: () => void;
  /** Injectable clock for testing. Defaults to Date.now. */
  readonly now?: () => number;
}

export interface AccountSessionRenewer {
  /** Records a fresh server window that did not come from renew (sign-in). */
  markRenewed(): void;
  /**
   * Renews when the interval has passed since the last renewal; does
   * nothing otherwise. Never throws: an UNAUTHORIZED answer goes to
   * onUnauthorized, any other failure is logged and the next activity
   * after the interval tries again.
   */
  onActivity(): void;
}

export function createAccountSessionRenewer(
  config: AccountSessionRenewerConfig,
): AccountSessionRenewer {
  const now = config.now ?? Date.now;
  let lastRenewAt = Number.NEGATIVE_INFINITY;

  return {
    markRenewed(): void {
      lastRenewAt = now();
    },
    onActivity(): void {
      const at = now();
      if (at - lastRenewAt < ACCOUNT_SESSION_RENEW_INTERVAL_MS) return;
      lastRenewAt = at;

      void config.renew().catch((err: unknown) => {
        if (isUnauthorizedTrpcError(err)) {
          config.onUnauthorized();
          return;
        }
        // The error name only: messages can echo request details
        console.warn("[account-session] renewal failed", {
          error: err instanceof Error ? err.name : typeof err,
        });
      });
    },
  };
}
