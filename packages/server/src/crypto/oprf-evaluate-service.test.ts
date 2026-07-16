/**
 * Unit tests for the environment-resolved OPRF limits.
 *
 * resolveDelayTiers and resolvePowThreshold are pure functions of the
 * validated NODE_ENV; the service test pins that construction under
 * production applies the strict proof-of-work threshold. The rest of the
 * service pipeline (rate limiting, PoW verification, audit, delegation)
 * is covered by routes/oprf.test.ts.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createOprfEvaluateService,
  resolveDelayTiers,
  resolvePowThreshold,
  type OprfEvaluateRequest,
  type OprfEvaluateServiceDeps,
} from "./oprf-evaluate-service.js";
import { _resetEnvCache } from "../env.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { createPowVerifier } from "./pow.js";
import { PowRequiredError } from "../errors.js";
import type { OprfEvaluator } from "./oprf-ipc.js";
import type { OprfAuditLogger } from "./oprf-audit.js";

describe("resolvePowThreshold", () => {
  it("relaxes the threshold in development and test", () => {
    expect(resolvePowThreshold("development")).toBe(100);
    expect(resolvePowThreshold("test")).toBe(100);
  });

  it("keeps the strict threshold in production", () => {
    expect(resolvePowThreshold("production")).toBe(5);
  });
});

describe("resolveDelayTiers", () => {
  it("returns no tiers in development and test", () => {
    expect(resolveDelayTiers("development")).toEqual([]);
    expect(resolveDelayTiers("test")).toEqual([]);
  });

  it("returns the strict tiers in production", () => {
    expect(resolveDelayTiers("production")).toEqual([
      { minFailures: 10, value: 10_000 },
      { minFailures: 8, value: 5_000 },
      { minFailures: 6, value: 2_000 },
    ]);
  });
});

// Minimum valid env for getEnv() to succeed regardless of the ambient
// process env, with NODE_ENV pinned to production.
const PROD_ENV = {
  NODE_ENV: "production",
  SESSION_SECRET: "a".repeat(64),
  DATABASE_URL: "postgresql://localhost:5432/test",
  OPS_SECRETS_KEY: "ab".repeat(32),
};

function makeDeps(): OprfEvaluateServiceDeps {
  const evaluator: OprfEvaluator = {
    async evaluate(blindedElement: Uint8Array): Promise<Uint8Array> {
      return blindedElement;
    },
    close(): void {
      /* noop */
    },
  };
  const auditLogger: OprfAuditLogger = {
    async logFailure(): Promise<void> {
      /* noop: assertions in this file use thrown errors */
    },
    dispose(): void {
      /* noop */
    },
  };
  return {
    evaluator,
    userRateLimiter: createInMemoryRateLimiter({
      windowMs: 900_000,
      maxRequests: 20,
    }),
    ipRateLimiter: createInMemoryRateLimiter({
      windowMs: 900_000,
      maxRequests: 50,
    }),
    powVerifier: createPowVerifier(),
    auditLogger,
  };
}

describe("createOprfEvaluateService under production", () => {
  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    savedEnv = { ...process.env };
    Object.assign(process.env, PROD_ENV);
    _resetEnvCache();
  });

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in savedEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, savedEnv);
    _resetEnvCache();
  });

  it("applies the strict threshold resolved at construction: proof-of-work is required from the fifth attempt", async () => {
    const service = createOprfEvaluateService(makeDeps());
    const blinded = Buffer.alloc(32, 0xab).toString("base64");
    const request: OprfEvaluateRequest = {
      userId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      blindedElement: blinded,
      ip: "203.0.113.42",
      sessionUserId: null,
      powChallenge: undefined,
      powSolution: undefined,
    };

    for (let i = 0; i < 4; i++) {
      await expect(service.evaluate(request)).resolves.toEqual({
        evaluated: blinded,
      });
    }

    await expect(service.evaluate(request)).rejects.toThrow(PowRequiredError);
  });
});
