/**
 * Guess policy for the post-login second-factor routes. Every guess passes a
 * per-user rate limiter, and failed guesses count toward a per-session cap
 * that ends the session once reached.
 */

import type { OrgId, SessionToken, UserId } from "@care-y/shared";
import { ErrorCode } from "@care-y/shared";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type { SessionRepository } from "./session-repository.js";
import {
  AuthError,
  SecondFactorLimitError,
  ValidationError,
} from "../errors.js";

/** Failed 2FA guesses on one session before the session is ended. */
export const MAX_TWOFA_FAILURES_PER_SESSION = 5;

/**
 * ValidationError codes a verify route can throw that describe account or
 * session state rather than a wrong guess. They do not count as failures.
 */
const NON_GUESS_ERROR_CODES: ReadonlySet<string> = new Set([
  ErrorCode.NO_ACTIVE_CODE,
  ErrorCode.NO_BACKUP_CODES,
  ErrorCode.TOTP_NOT_ENROLLED,
  ErrorCode.WEBAUTHN_CHALLENGE_NOT_FOUND,
]);

/** True when a thrown verification error reports state, not a failed guess. */
function isNonGuessError(err: unknown): boolean {
  return (
    err instanceof ValidationError && NON_GUESS_ERROR_CODES.has(err.message)
  );
}

/** Who is guessing, and on which session the failures are counted. */
export interface GuessAttempt {
  readonly orgId: OrgId;
  readonly userId: UserId;
  readonly sessionToken: SessionToken;
}

export interface SecondFactorGuessGuard {
  /**
   * Checks the per-user limiter, then runs the verification. A guess fails
   * when it returns false or throws, except for errors that report state
   * rather than a wrong answer. Returns the verification result, or
   * rethrows the verification error.
   */
  guard(
    attempt: GuessAttempt,
    verify: () => Promise<boolean>,
  ): Promise<boolean>;
}

export interface SecondFactorGuessGuardDeps {
  readonly limiter: RateLimiter;
  readonly sessions: Pick<
    SessionRepository,
    "recordTwoFactorFailure" | "deleteByToken"
  >;
}

export function createSecondFactorGuessGuard(
  deps: SecondFactorGuessGuardDeps,
): SecondFactorGuessGuard {
  /**
   * Counts one failed guess on the session. At the cap the session is
   * deleted and the caller is signed out.
   */
  async function recordFailure(sessionToken: SessionToken): Promise<void> {
    const failures = await deps.sessions.recordTwoFactorFailure(sessionToken);
    if (failures >= MAX_TWOFA_FAILURES_PER_SESSION) {
      await deps.sessions.deleteByToken(sessionToken);
      throw new AuthError(ErrorCode.TWOFA_SESSION_ENDED);
    }
  }

  return {
    async guard(
      attempt: GuessAttempt,
      verify: () => Promise<boolean>,
    ): Promise<boolean> {
      const limit = deps.limiter.check(
        `2fa:${attempt.orgId}:${attempt.userId}`,
      );
      if (!limit.allowed) {
        throw new SecondFactorLimitError(ErrorCode.TWOFA_RATE_LIMITED);
      }

      let valid: boolean;
      try {
        valid = await verify();
      } catch (err: unknown) {
        if (!isNonGuessError(err)) {
          await recordFailure(attempt.sessionToken);
        }
        throw err;
      }

      if (!valid) {
        await recordFailure(attempt.sessionToken);
      }
      return valid;
    },
  };
}
