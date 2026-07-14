/**
 * OPRF evaluation service.
 *
 * Orchestrates rate limiting, proof-of-work gating, escalating delays,
 * attempt tracking, and audit logging around the threshold OPRF evaluator.
 * The tRPC route delegates to this service; it contains no business logic itself.
 *
 * The proof-of-work gate and escalating delay key off an ATTEMPT counter, not a
 * failure counter. An OPRF is oblivious, so the server cannot tell a correct
 * password guess from a wrong one: every well-formed blinded element evaluates
 * successfully (SEC-012, RFC 9497). Keying the friction off failures would let a
 * password-guessing attacker, who only ever submits well-formed elements, avoid
 * it entirely. Counting every attempt in a sliding window applies the friction
 * to the actual brute-force path. A legitimate login makes one evaluation, so it
 * stays far below the threshold, and the window decays on its own, so no
 * explicit reset is needed.
 */

import {
  ForbiddenError,
  RateLimitError,
  PowRequiredError,
  ValidationError,
} from "../errors.js";
import { createCleanupInterval } from "../utils/intervals.js";
import { findTier, type Tier } from "../utils/tiers.js";
import type { OprfEvaluator } from "./oprf-ipc.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type { PowVerifier } from "./pow.js";
import type { OprfAuditLogger } from "./oprf-audit.js";

// ---------------------------------------------------------------------------
// Attempt tracker (sliding window per userId)
// ---------------------------------------------------------------------------

export interface AttemptTracker {
  check(userId: string): number;
  increment(userId: string): number;
  reset(userId: string): void;
  dispose(): void;
}

export function createAttemptTracker(
  windowMs = 15 * 60 * 1000,
  now: () => number = Date.now,
): AttemptTracker {
  const attempts = new Map<string, number[]>();

  const dispose = createCleanupInterval(60_000, () => {
    const cutoff = now() - windowMs;
    for (const [key, timestamps] of attempts) {
      const filtered = timestamps.filter((t) => t > cutoff);
      if (filtered.length === 0) {
        attempts.delete(key);
      } else {
        attempts.set(key, filtered);
      }
    }
  });

  return {
    check(userId: string): number {
      const cutoff = now() - windowMs;
      const timestamps = attempts.get(userId);
      if (!timestamps) return 0;
      return timestamps.filter((t) => t > cutoff).length;
    },
    increment(userId: string): number {
      const timestamps = attempts.get(userId) ?? [];
      timestamps.push(now());
      attempts.set(userId, timestamps);
      return this.check(userId);
    },
    reset(userId: string): void {
      attempts.delete(userId);
    },
    dispose,
  };
}

// ---------------------------------------------------------------------------
// Escalating delay
// ---------------------------------------------------------------------------

/**
 * Escalating delay tiers, indexed by the attempt count in the window. The Tier
 * field is named minFailures by the shared tier helper, but the value fed here
 * is the attempt count. Delays start above the proof-of-work threshold, so a
 * legitimate login (one evaluation) sees no delay.
 */
const DELAY_TIERS: readonly Tier<number>[] =
  process.env.NODE_ENV === "production"
    ? [
        { minFailures: 10, value: 10_000 },
        { minFailures: 8, value: 5_000 },
        { minFailures: 6, value: 2_000 },
      ]
    : [];

/** Escalating delay in milliseconds based on the attempt count in the window. */
export function getDelayMs(attemptCount: number): number {
  return findTier(DELAY_TIERS, attemptCount, 0);
}

async function delay(ms: number): Promise<void> {
  if (ms <= 0) return;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface OprfEvaluateServiceDeps {
  readonly evaluator: OprfEvaluator;
  readonly userRateLimiter: RateLimiter;
  readonly ipRateLimiter: RateLimiter;
  readonly powVerifier: PowVerifier;
  readonly auditLogger: OprfAuditLogger;
}

export interface OprfEvaluateRequest {
  readonly userId: string;
  readonly blindedElement: string;
  readonly ip: string;
  readonly sessionUserId: string | null;
  readonly powChallenge: string | undefined;
  readonly powSolution: string | undefined;
}

export interface OprfEvaluateResult {
  readonly evaluated: string;
}

export interface OprfEvaluateService {
  evaluate(request: OprfEvaluateRequest): Promise<OprfEvaluateResult>;
  adminEvaluate(request: OprfEvaluateRequest): Promise<OprfEvaluateResult>;
}

/** Attempts in the window at which proof-of-work becomes required.
 *  In development, raise the threshold so e2e suites (which log in
 *  15+ times per run) don't trigger PoW mid-suite. Production keeps
 *  the strict threshold to deter brute-force OPRF abuse. */
const POW_ATTEMPT_THRESHOLD = process.env.NODE_ENV === "production" ? 5 : 100;

export function createOprfEvaluateService(
  deps: OprfEvaluateServiceDeps,
): OprfEvaluateService {
  const attemptTracker = createAttemptTracker();

  /** If authenticated, the session owner must match the requested userId. */
  async function assertSessionBinding(
    userId: string,
    ip: string,
    sessionUserId: string | null,
  ): Promise<void> {
    if (sessionUserId !== null && sessionUserId !== userId) {
      await deps.auditLogger.logFailure(userId, ip, "session_mismatch");
      throw new ForbiddenError("Session userId mismatch");
    }
  }

  /** Per-userId sliding window rate limit (10 requests / 15 min). */
  async function enforceUserRateLimit(
    userId: string,
    ip: string,
  ): Promise<void> {
    const result = deps.userRateLimiter.check(userId);
    if (!result.allowed) {
      await deps.auditLogger.logFailure(userId, ip, "rate_limited");
      throw new RateLimitError(
        "OPRF rate limit exceeded",
        Math.ceil(result.retryAfterMs / 1000),
      );
    }
  }

  /** Per-IP supplementary rate limit, independent of per-userId. */
  async function enforceIpRateLimit(userId: string, ip: string): Promise<void> {
    const result = deps.ipRateLimiter.check(ip);
    if (!result.allowed) {
      await deps.auditLogger.logFailure(userId, ip, "rate_limited");
      throw new RateLimitError(
        "Rate limit exceeded",
        Math.ceil(result.retryAfterMs / 1000),
      );
    }
  }

  /**
   * Once attempts in the window reach the threshold, require proof-of-work
   * before allowing evaluation. If no PoW is provided, issue a challenge. If
   * PoW is invalid, log and reject; the attempt is already counted, so there is
   * no separate failure counter to bump.
   */
  async function enforcePowGate(
    userId: string,
    ip: string,
    attemptCount: number,
    powChallenge: string | undefined,
    powSolution: string | undefined,
  ): Promise<void> {
    if (attemptCount < POW_ATTEMPT_THRESHOLD) return;

    const noPowProvided =
      powChallenge === undefined || powSolution === undefined;
    if (noPowProvided) {
      const challenge = deps.powVerifier.createChallenge(userId, attemptCount);
      await deps.auditLogger.logFailure(userId, ip, "pow_required");
      throw new PowRequiredError(challenge.challenge, challenge.difficulty);
    }

    const powIsValid = deps.powVerifier.verify(
      userId,
      powChallenge,
      powSolution,
    );
    if (!powIsValid) {
      await deps.auditLogger.logFailure(userId, ip, "pow_invalid");
      throw new ValidationError("Invalid proof-of-work solution");
    }
  }

  /** Perform threshold OPRF evaluation and log failures for audit. */
  async function evaluateBlindedElement(
    userId: string,
    ip: string,
    blindedElement: string,
  ): Promise<OprfEvaluateResult> {
    const blindedBuf = Buffer.from(blindedElement, "base64");
    try {
      const evaluated = await deps.evaluator.evaluate(blindedBuf);
      return { evaluated: Buffer.from(evaluated).toString("base64") };
    } catch (err: unknown) {
      await deps.auditLogger.logFailure(userId, ip, "oprf_failed");
      throw err;
    }
  }

  return {
    async evaluate(req: OprfEvaluateRequest): Promise<OprfEvaluateResult> {
      const { userId, ip, sessionUserId, blindedElement } = req;

      await assertSessionBinding(userId, ip, sessionUserId);
      await enforceUserRateLimit(userId, ip);
      await enforceIpRateLimit(userId, ip);

      const attemptCount = attemptTracker.increment(userId);
      await enforcePowGate(
        userId,
        ip,
        attemptCount,
        req.powChallenge,
        req.powSolution,
      );
      await delay(getDelayMs(attemptCount));

      return evaluateBlindedElement(userId, ip, blindedElement);
    },

    async adminEvaluate(req: OprfEvaluateRequest): Promise<OprfEvaluateResult> {
      const { userId, ip, blindedElement } = req;

      // The admin path skips the session-binding check so an admin can derive
      // keys on behalf of a manually created user, but it is still counted and
      // delayed so a stolen MANAGE_KEYS session cannot use it as an unthrottled
      // oracle. It has no proof-of-work gate: the admin client does not solve
      // challenges, and the caller is already authenticated with MANAGE_KEYS, so
      // the rate limit plus the attempt-scaled delay bound the request rate.
      await enforceUserRateLimit(userId, ip);
      await enforceIpRateLimit(userId, ip);

      const attemptCount = attemptTracker.increment(userId);
      await delay(getDelayMs(attemptCount));

      return evaluateBlindedElement(userId, ip, blindedElement);
    },
  };
}
