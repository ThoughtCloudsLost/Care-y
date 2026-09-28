/**
 * Unit tests for the second-factor guess guard.
 *
 * Pure unit tests with a fake limiter and fake session store: no DB or
 * Docker required.
 */

import { describe, it, expect, vi, type Mock } from "vitest";
import {
  createSecondFactorGuessGuard,
  MAX_TWOFA_FAILURES_PER_SESSION,
  type GuessAttempt,
} from "./second-factor-guess-guard.js";
import {
  AuthError,
  SecondFactorLimitError,
  ValidationError,
} from "../errors.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import {
  ErrorCode,
  type OrgId,
  type SessionToken,
  type UserId,
} from "@care-y/shared";

const ATTEMPT: GuessAttempt = {
  orgId: "org-1" as OrgId,
  userId: "user-1" as UserId,
  sessionToken: "session-1" as SessionToken,
};

/** Limiter that allows or refuses every check. */
function fakeLimiter(allowed: boolean): RateLimiter {
  return {
    check: vi.fn(() => ({
      allowed,
      remaining: allowed ? 1 : 0,
      retryAfterMs: allowed ? 0 : 30_000,
    })),
    reset: vi.fn(),
  };
}

/** Session store whose failure counter starts at `priorFailures`. */
function fakeSessions(priorFailures = 0): {
  recordTwoFactorFailure: Mock<(token: SessionToken) => Promise<number>>;
  deleteByToken: Mock<(token: SessionToken) => Promise<void>>;
} {
  let failures = priorFailures;
  return {
    recordTwoFactorFailure: vi.fn<(token: SessionToken) => Promise<number>>(
      async () => {
        failures += 1;
        return failures;
      },
    ),
    deleteByToken: vi.fn<(token: SessionToken) => Promise<void>>(
      async () => undefined,
    ),
  };
}

describe("createSecondFactorGuessGuard", () => {
  it("refuses without calling verify when the limiter refuses", async () => {
    const limiter = fakeLimiter(false);
    const sessions = fakeSessions();
    const guard = createSecondFactorGuessGuard({ limiter, sessions });
    const verify = vi.fn(async () => true);

    const err = await guard.guard(ATTEMPT, verify).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(SecondFactorLimitError);
    expect(err).toHaveProperty("message", ErrorCode.TWOFA_RATE_LIMITED);
    // The wait window is withheld from whoever is guessing.
    expect(err).not.toHaveProperty("retryAfterSeconds");
    expect(verify).not.toHaveBeenCalled();
    expect(sessions.recordTwoFactorFailure).not.toHaveBeenCalled();
  });

  it("keys the limiter on org and user", async () => {
    const limiter = fakeLimiter(true);
    const guard = createSecondFactorGuessGuard({
      limiter,
      sessions: fakeSessions(),
    });

    await guard.guard(ATTEMPT, async () => true);

    expect(limiter.check).toHaveBeenCalledWith("2fa:org-1:user-1");
  });

  it("records nothing for a correct guess", async () => {
    const sessions = fakeSessions();
    const guard = createSecondFactorGuessGuard({
      limiter: fakeLimiter(true),
      sessions,
    });

    await expect(guard.guard(ATTEMPT, async () => true)).resolves.toBe(true);
    expect(sessions.recordTwoFactorFailure).not.toHaveBeenCalled();
  });

  it("records one failure for a wrong guess", async () => {
    const sessions = fakeSessions();
    const guard = createSecondFactorGuessGuard({
      limiter: fakeLimiter(true),
      sessions,
    });

    await expect(guard.guard(ATTEMPT, async () => false)).resolves.toBe(false);
    expect(sessions.recordTwoFactorFailure).toHaveBeenCalledTimes(1);
    expect(sessions.recordTwoFactorFailure).toHaveBeenCalledWith(
      ATTEMPT.sessionToken,
    );
  });

  it("rethrows a state error (NO_ACTIVE_CODE) without recording a failure", async () => {
    const sessions = fakeSessions();
    const guard = createSecondFactorGuessGuard({
      limiter: fakeLimiter(true),
      sessions,
    });
    const stateError = new ValidationError(ErrorCode.NO_ACTIVE_CODE);

    await expect(
      guard.guard(ATTEMPT, async () => {
        throw stateError;
      }),
    ).rejects.toBe(stateError);
    expect(sessions.recordTwoFactorFailure).not.toHaveBeenCalled();
  });

  it("rethrows any other verification error after recording a failure", async () => {
    const sessions = fakeSessions();
    const guard = createSecondFactorGuessGuard({
      limiter: fakeLimiter(true),
      sessions,
    });
    const guessError = new ValidationError(ErrorCode.INVALID_VERIFICATION_CODE);

    await expect(
      guard.guard(ATTEMPT, async () => {
        throw guessError;
      }),
    ).rejects.toBe(guessError);
    expect(sessions.recordTwoFactorFailure).toHaveBeenCalledTimes(1);
  });

  it("ends the session when a failure reaches the cap", async () => {
    const sessions = fakeSessions(MAX_TWOFA_FAILURES_PER_SESSION - 1);
    const guard = createSecondFactorGuessGuard({
      limiter: fakeLimiter(true),
      sessions,
    });

    const err = await guard
      .guard(ATTEMPT, async () => false)
      .catch((e: unknown) => e);

    expect(err).toBeInstanceOf(AuthError);
    expect(err).toHaveProperty("message", ErrorCode.TWOFA_SESSION_ENDED);
    expect(sessions.deleteByToken).toHaveBeenCalledWith(ATTEMPT.sessionToken);
  });

  it("keeps the session while failures stay below the cap", async () => {
    const sessions = fakeSessions(MAX_TWOFA_FAILURES_PER_SESSION - 2);
    const guard = createSecondFactorGuessGuard({
      limiter: fakeLimiter(true),
      sessions,
    });

    await expect(guard.guard(ATTEMPT, async () => false)).resolves.toBe(false);
    expect(sessions.deleteByToken).not.toHaveBeenCalled();
  });
});
