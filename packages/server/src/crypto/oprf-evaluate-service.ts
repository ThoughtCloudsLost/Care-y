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
 *
 * Per ADR-091, every evaluation now happens under a per-identity tag. The tag
 * is constructed server-side from validated context (never from client input).
 */

import { timingSafeEqual } from "node:crypto";
import {
  ForbiddenError,
  RateLimitError,
  PowRequiredError,
  ValidationError,
} from "../errors.js";
import { createCleanupInterval } from "../utils/intervals.js";
import { getEnv, type EnvVars } from "../env.js";
import { findTier, type Tier } from "../utils/tiers.js";
import type { OprfEvaluator } from "./oprf-ipc.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type { PowVerifier } from "./pow.js";
import type { OprfAuditLogger } from "./oprf-audit.js";
import type { UserId, OrgId, ChannelSecret } from "@care-y/shared";
import { volunteerTag, accountTag, channelTag } from "./oprf-tags.js";
import { hashChannelAuth } from "@care-y/crypto";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { lookupChannelForOprf } from "../portal/channel-service.js";

// ---------------------------------------------------------------------------
// Attempt tracker (sliding window per userId)
// ---------------------------------------------------------------------------

export interface AttemptTracker {
  check(key: string): number;
  increment(key: string): number;
  reset(key: string): void;
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
    check(key: string): number {
      const cutoff = now() - windowMs;
      const timestamps = attempts.get(key);
      if (!timestamps) return 0;
      return timestamps.filter((t) => t > cutoff).length;
    },
    increment(key: string): number {
      const timestamps = attempts.get(key) ?? [];
      timestamps.push(now());
      attempts.set(key, timestamps);
      return this.check(key);
    },
    reset(key: string): void {
      attempts.delete(key);
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
 *
 * Resolved from the validated NODE_ENV at service construction, never at
 * module load: development and test relax the tiers (local flows and e2e
 * suites log in repeatedly), every other environment gets the strict values.
 */
export function resolveDelayTiers(
  nodeEnv: EnvVars["NODE_ENV"],
): readonly Tier<number>[] {
  if (nodeEnv === "development" || nodeEnv === "test") return [];
  return [
    { minFailures: 10, value: 10_000 },
    { minFailures: 8, value: 5_000 },
    { minFailures: 6, value: 2_000 },
  ];
}

/** Escalating delay in milliseconds based on the attempt count in the window. */
export function getDelayMs(
  tiers: readonly Tier<number>[],
  attemptCount: number,
): number {
  return findTier(tiers, attemptCount, 0);
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

export type OprfEvaluateKind = "volunteer" | "account";

export interface OprfEvaluateRequest {
  readonly kind: OprfEvaluateKind;
  readonly userId: UserId;
  readonly blindedElement: string;
  readonly ip: string;
  readonly sessionUserId: UserId | null;
  readonly powChallenge: string | undefined;
  readonly powSolution: string | undefined;
}

export interface OprfEvaluateResult {
  readonly evaluated: string;
}

export interface ChannelEvaluateRequest {
  readonly channelId: ChannelSecret;
  readonly blindedElement: string;
  readonly auth?: string;
  readonly powChallenge?: string;
  readonly powSolution?: string;
  readonly ip: string;
  readonly orgUuid: OrgId;
}

export interface OprfEvaluateService {
  evaluate(request: OprfEvaluateRequest): Promise<OprfEvaluateResult>;
  adminEvaluate(request: OprfEvaluateRequest): Promise<OprfEvaluateResult>;
  evaluateChannel(
    db: Kysely<TenantDatabase>,
    request: ChannelEvaluateRequest,
  ): Promise<OprfEvaluateResult>;
}

/** Attempts in the window at which proof-of-work becomes required.
 *  In development and test, raise the threshold so e2e suites (which log
 *  in 15+ times per run) don't trigger PoW mid-suite. Every other
 *  environment keeps the strict threshold to deter brute-force OPRF abuse. */
export function resolvePowThreshold(nodeEnv: EnvVars["NODE_ENV"]): number {
  return nodeEnv === "development" || nodeEnv === "test" ? 100 : 5;
}

/**
 * Build the OPRF tag for a volunteer or account evaluation from the
 * request's kind and userId.
 */
function tagForEvaluateRequest(req: OprfEvaluateRequest): string {
  switch (req.kind) {
    case "volunteer":
      return volunteerTag(req.userId);
    case "account":
      return accountTag(req.userId);
  }
}

export function createOprfEvaluateService(
  deps: OprfEvaluateServiceDeps,
): OprfEvaluateService {
  const attemptTracker = createAttemptTracker();
  // Resolved once here rather than at module load: construction happens after
  // validateEnv() in index.ts, so an unset NODE_ENV fails startup instead of
  // silently selecting the relaxed limits.
  const nodeEnv = getEnv().NODE_ENV;
  const delayTiers = resolveDelayTiers(nodeEnv);
  const powThreshold = resolvePowThreshold(nodeEnv);

  /**
   * If authenticated, the session owner must match the requested userId.
   *
   * Volunteer kind only. Session user ids and account ids are disjoint
   * namespaces, so for kind "account" the comparison can only false
   * positive; it blocked a client creating an account in a browser
   * holding a volunteer session on the shared origin. Skipping it there
   * removes no protection: the procedure accepts anonymous callers by
   * design (evaluation happens before login), and even same-origin
   * script can drop the cookie with fetch credentials "omit" (MDN,
   * Request.credentials). Account evaluations are gated by the
   * per-account tag key (ADR-091), rate limits, PoW, and delays.
   */
  async function assertSessionBinding(
    kind: OprfEvaluateKind,
    userId: UserId,
    ip: string,
    sessionUserId: UserId | null,
  ): Promise<void> {
    if (kind !== "volunteer") return;
    if (sessionUserId !== null && sessionUserId !== userId) {
      await deps.auditLogger.logFailure(userId, ip, "session_mismatch");
      throw new ForbiddenError("Session userId mismatch");
    }
  }

  /** Per-userId sliding window rate limit (10 requests / 15 min). */
  async function enforceUserRateLimit(
    userId: UserId,
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
  async function enforceIpRateLimit(userId: UserId, ip: string): Promise<void> {
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
    powKey: string,
    ip: string,
    attemptCount: number,
    powChallenge: string | undefined,
    powSolution: string | undefined,
  ): Promise<void> {
    if (attemptCount < powThreshold) return;

    const noPowProvided =
      powChallenge === undefined || powSolution === undefined;
    if (noPowProvided) {
      const challenge = deps.powVerifier.createChallenge(powKey, attemptCount);
      await deps.auditLogger.logFailure(powKey, ip, "pow_required");
      throw new PowRequiredError(challenge.challenge, challenge.difficulty);
    }

    const powIsValid = deps.powVerifier.verify(
      powKey,
      powChallenge,
      powSolution,
    );
    if (!powIsValid) {
      await deps.auditLogger.logFailure(powKey, ip, "pow_invalid");
      throw new ValidationError("Invalid proof-of-work solution");
    }
  }

  /** Perform threshold OPRF evaluation and log failures for audit. */
  async function evaluateBlindedElement(
    userId: UserId,
    ip: string,
    blindedElement: string,
    tag: string,
  ): Promise<OprfEvaluateResult> {
    const blindedBuf = Buffer.from(blindedElement, "base64");
    try {
      const evaluated = await deps.evaluator.evaluate(blindedBuf, tag);
      return { evaluated: Buffer.from(evaluated).toString("base64url") };
    } catch (err: unknown) {
      await deps.auditLogger.logFailure(userId, ip, "oprf_failed");
      throw err;
    }
  }

  return {
    async evaluate(req: OprfEvaluateRequest): Promise<OprfEvaluateResult> {
      const { userId, ip, sessionUserId, blindedElement } = req;

      await assertSessionBinding(req.kind, userId, ip, sessionUserId);
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
      await delay(getDelayMs(delayTiers, attemptCount));

      const tag = tagForEvaluateRequest(req);
      return evaluateBlindedElement(userId, ip, blindedElement, tag);
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
      await delay(getDelayMs(delayTiers, attemptCount));

      const tag = tagForEvaluateRequest(req);
      return evaluateBlindedElement(userId, ip, blindedElement, tag);
    },

    async evaluateChannel(
      db: Kysely<TenantDatabase>,
      req: ChannelEvaluateRequest,
    ): Promise<OprfEvaluateResult> {
      const { channelId, blindedElement, ip, orgUuid } = req;

      // Per-channelId rate limit (reuses the per-user limiter infra)
      const channelKey = `channel:${channelId}`;
      const channelLimit = deps.userRateLimiter.check(channelKey);
      if (!channelLimit.allowed) {
        throw new RateLimitError(
          "Channel OPRF rate limit exceeded",
          Math.ceil(channelLimit.retryAfterMs / 1000),
        );
      }

      // Per-IP rate limit
      const ipLimit = deps.ipRateLimiter.check(ip);
      if (!ipLimit.allowed) {
        throw new RateLimitError(
          "Rate limit exceeded",
          Math.ceil(ipLimit.retryAfterMs / 1000),
        );
      }

      // PoW gate keyed on channelId
      const attemptCount = attemptTracker.increment(channelKey);
      await enforcePowGate(
        channelKey,
        ip,
        attemptCount,
        req.powChallenge,
        req.powSolution,
      );

      // Channel gating rules (ADR-091):
      // - No row (unknown channelId): allow (mint path)
      // - Active row: require auth token, timing-safe compare against auth_hash
      // - Revoked or expired row: refuse
      const channelRow = await lookupChannelForOprf(db, channelId);

      if (channelRow !== null) {
        if (
          channelRow.status === "revoked" ||
          channelRow.status === "expired"
        ) {
          throw new ForbiddenError("Channel is no longer available");
        }

        if (channelRow.status === "active") {
          if (req.auth === undefined || req.auth === "") {
            throw new ForbiddenError("Channel authentication required");
          }

          const authBuf = Buffer.from(req.auth, "base64");
          const presentedHash = Buffer.from(hashChannelAuth(authBuf));
          const storedHash = channelRow.auth_hash;

          // Both are 32-byte BLAKE2b hashes. Timing-safe comparison.
          if (presentedHash.length !== 32 || storedHash.length !== 32) {
            throw new ForbiddenError("Channel authentication failed");
          }

          if (!timingSafeEqual(presentedHash, storedHash)) {
            throw new ForbiddenError("Channel authentication failed");
          }
        }
      }

      const tag = channelTag(orgUuid, channelId);
      const blindedBuf = Buffer.from(blindedElement, "base64");

      try {
        const evaluated = await deps.evaluator.evaluate(blindedBuf, tag);
        return { evaluated: Buffer.from(evaluated).toString("base64url") };
      } catch (err: unknown) {
        await deps.auditLogger.logFailure(channelKey, ip, "oprf_failed");
        throw err;
      }
    },
  };
}
