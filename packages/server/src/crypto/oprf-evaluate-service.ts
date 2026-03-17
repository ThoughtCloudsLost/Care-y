/**
 * OPRF evaluation service.
 *
 * Orchestrates rate limiting, proof-of-work gating, escalating delays,
 * failure tracking, and audit logging around the threshold OPRF evaluator.
 * The tRPC route delegates to this service; it contains no business logic itself.
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
// Failure tracker (sliding window per userId)
// ---------------------------------------------------------------------------

export interface FailureTracker {
  check(userId: string): number;
  increment(userId: string): number;
  reset(userId: string): void;
  dispose(): void;
}

export function createFailureTracker(
  windowMs = 5 * 60 * 1000,
  now: () => number = Date.now,
): FailureTracker {
  const failures = new Map<string, number[]>();

  const dispose = createCleanupInterval(60_000, () => {
    const cutoff = now() - windowMs;
    for (const [key, timestamps] of failures) {
      const filtered = timestamps.filter((t) => t > cutoff);
      if (filtered.length === 0) {
        failures.delete(key);
      } else {
        failures.set(key, filtered);
      }
    }
  });

  return {
    check(userId: string): number {
      const cutoff = now() - windowMs;
      const timestamps = failures.get(userId);
      if (!timestamps) return 0;
      return timestamps.filter((t) => t > cutoff).length;
    },
    increment(userId: string): number {
      const timestamps = failures.get(userId) ?? [];
      timestamps.push(now());
      failures.set(userId, timestamps);
      return this.check(userId);
    },
    reset(userId: string): void {
      failures.delete(userId);
    },
    dispose,
  };
}

// ---------------------------------------------------------------------------
// Escalating delay
// ---------------------------------------------------------------------------

/**
 * Escalating delay tiers: as failure count rises, the delay before
 * OPRF evaluation grows. Prevents rapid brute-force without fully
 * blocking legitimate retries.
 */
const DELAY_TIERS: readonly Tier<number>[] = [
  { minFailures: 10, value: 10_000 },
  { minFailures: 7, value: 5_000 },
  { minFailures: 4, value: 2_000 },
];

/** Escalating delay in milliseconds based on failure count. */
export function getDelayMs(failureCount: number): number {
  return findTier(DELAY_TIERS, failureCount, 0);
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
}

const POW_FAILURE_THRESHOLD = 3;

export function createOprfEvaluateService(
  deps: OprfEvaluateServiceDeps,
): OprfEvaluateService {
  const failureTracker = createFailureTracker();

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
   * After 3+ failures, require proof-of-work before allowing evaluation.
   * If no PoW is provided, issue a challenge. If PoW is invalid, track failure.
   */
  async function enforcePowGate(
    userId: string,
    ip: string,
    failureCount: number,
    powChallenge: string | undefined,
    powSolution: string | undefined,
  ): Promise<void> {
    if (failureCount < POW_FAILURE_THRESHOLD) return;

    const noPowProvided =
      powChallenge === undefined || powSolution === undefined;
    if (noPowProvided) {
      const challenge = deps.powVerifier.createChallenge(userId, failureCount);
      await deps.auditLogger.logFailure(userId, ip, "pow_required");
      throw new PowRequiredError(challenge.challenge, challenge.difficulty);
    }

    const powIsValid = deps.powVerifier.verify(
      userId,
      powChallenge,
      powSolution,
    );
    if (!powIsValid) {
      failureTracker.increment(userId);
      await deps.auditLogger.logFailure(userId, ip, "pow_invalid");
      throw new ValidationError("Invalid proof-of-work solution");
    }
  }

  /** Perform threshold OPRF evaluation and track success/failure. */
  async function evaluateBlindedElement(
    userId: string,
    ip: string,
    blindedElement: string,
  ): Promise<OprfEvaluateResult> {
    const blindedBuf = Buffer.from(blindedElement, "base64");
    try {
      const evaluated = await deps.evaluator.evaluate(blindedBuf);

      // Only OPRF success proves identity (PoW is a gate, not proof).
      failureTracker.reset(userId);

      return { evaluated: Buffer.from(evaluated).toString("base64") };
    } catch (err: unknown) {
      failureTracker.increment(userId);
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

      const failureCount = failureTracker.check(userId);
      await enforcePowGate(
        userId,
        ip,
        failureCount,
        req.powChallenge,
        req.powSolution,
      );
      await delay(getDelayMs(failureCount));

      return evaluateBlindedElement(userId, ip, blindedElement);
    },
  };
}
