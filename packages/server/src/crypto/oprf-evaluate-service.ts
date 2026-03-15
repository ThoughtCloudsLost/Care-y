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

  const cleanup = setInterval(() => {
    const cutoff = now() - windowMs;
    for (const [key, timestamps] of failures) {
      const filtered = timestamps.filter((t) => t > cutoff);
      if (filtered.length === 0) {
        failures.delete(key);
      } else {
        failures.set(key, filtered);
      }
    }
  }, 60_000);
  cleanup.unref();

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
    dispose(): void {
      clearInterval(cleanup);
    },
  };
}

// ---------------------------------------------------------------------------
// Escalating delay
// ---------------------------------------------------------------------------

/** Escalating delay in milliseconds based on failure count */
export function getDelayMs(failureCount: number): number {
  if (failureCount >= 10) return 10_000;
  if (failureCount >= 7) return 5_000;
  if (failureCount >= 4) return 2_000;
  return 0;
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

export function createOprfEvaluateService(
  deps: OprfEvaluateServiceDeps,
): OprfEvaluateService {
  const failureTracker = createFailureTracker();

  return {
    async evaluate(req: OprfEvaluateRequest): Promise<OprfEvaluateResult> {
      const {
        userId,
        blindedElement,
        ip,
        sessionUserId,
        powChallenge,
        powSolution,
      } = req;

      // 1. Session binding: if authenticated, assert session.userId matches request userId.
      if (sessionUserId !== null && sessionUserId !== userId) {
        await deps.auditLogger.logFailure(userId, ip, "session_mismatch");
        throw new ForbiddenError("Session userId mismatch");
      }

      // 2. Per-userId rate limit (10/15min)
      const userResult = deps.userRateLimiter.check(userId);
      if (!userResult.allowed) {
        await deps.auditLogger.logFailure(userId, ip, "rate_limited");
        throw new RateLimitError(
          "OPRF rate limit exceeded",
          Math.ceil(userResult.retryAfterMs / 1000),
        );
      }

      // 3. Per-IP rate limit (supplementary, independent of per-userId)
      const ipResult = deps.ipRateLimiter.check(ip);
      if (!ipResult.allowed) {
        await deps.auditLogger.logFailure(userId, ip, "rate_limited");
        throw new RateLimitError(
          "Rate limit exceeded",
          Math.ceil(ipResult.retryAfterMs / 1000),
        );
      }

      // 4. Proof-of-work gate (after 3 failures in 5min window)
      const failureCount = failureTracker.check(userId);
      if (failureCount >= 3) {
        if (powChallenge === undefined || powSolution === undefined) {
          const challenge = deps.powVerifier.createChallenge(
            userId,
            failureCount,
          );
          await deps.auditLogger.logFailure(userId, ip, "pow_required");
          throw new PowRequiredError(challenge.challenge, challenge.difficulty);
        }

        const valid = deps.powVerifier.verify(
          userId,
          powChallenge,
          powSolution,
        );
        if (!valid) {
          failureTracker.increment(userId);
          await deps.auditLogger.logFailure(userId, ip, "pow_invalid");
          throw new ValidationError("Invalid proof-of-work solution");
        }
      }

      // 5. Escalating delay (failures 4-6: 2s, 7-9: 5s, 10+: 10s)
      const delayMs = getDelayMs(failureCount);
      await delay(delayMs);

      // 6. OPRF evaluation via threshold IPC
      const blindedBuf = Buffer.from(blindedElement, "base64");
      try {
        const evaluated = await deps.evaluator.evaluate(blindedBuf);

        // Success: reset failure counter. Only OPRF success proves identity,
        // not PoW success (PoW is a gate, not proof of identity).
        failureTracker.reset(userId);

        return { evaluated: Buffer.from(evaluated).toString("base64") };
      } catch (err: unknown) {
        failureTracker.increment(userId);
        await deps.auditLogger.logFailure(userId, ip, "oprf_failed");
        throw err;
      }
    },
  };
}
