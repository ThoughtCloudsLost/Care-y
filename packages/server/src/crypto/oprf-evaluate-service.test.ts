/**
 * Unit tests for the environment-resolved OPRF limits and
 * channel evaluation gating logic.
 *
 * resolveDelayTiers and resolvePowThreshold are pure functions of the
 * validated NODE_ENV; the service test pins that construction under
 * production applies the strict proof-of-work threshold. The rest of the
 * service pipeline (rate limiting, PoW verification, audit, delegation)
 * is covered by routes/oprf.test.ts.
 *
 * The channel evaluation tests use a mock evaluator and a mock DB to
 * verify every gating branch without a live database.
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import {
  createOprfEvaluateService,
  resolveDelayTiers,
  resolvePowThreshold,
  type OprfEvaluateRequest,
  type OprfEvaluateServiceDeps,
  type ChannelEvaluateRequest,
} from "./oprf-evaluate-service.js";
import { _resetEnvCache } from "../env.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { createPowVerifier } from "./pow.js";
import { ForbiddenError, PowRequiredError, RateLimitError } from "../errors.js";
import type { OprfEvaluator } from "./oprf-ipc.js";
import type { OprfAuditLogger } from "./oprf-audit.js";
import type { UserId, OrgId, ChannelSecret } from "@care-y/shared";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

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

const TEST_ENV = {
  NODE_ENV: "test",
  SESSION_SECRET: "a".repeat(64),
  DATABASE_URL: "postgresql://localhost:5432/test",
  OPS_SECRETS_KEY: "ab".repeat(32),
};

function makeDeps(): OprfEvaluateServiceDeps {
  const evaluator: OprfEvaluator = {
    async evaluate(
      blindedElement: Uint8Array,
      _tag: string,
    ): Promise<Uint8Array> {
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
    const blindedInput = Buffer.alloc(32, 0xab);
    const blinded = blindedInput.toString("base64");
    const blindedExpected = blindedInput.toString("base64url");
    const request: OprfEvaluateRequest = {
      kind: "volunteer",
      userId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d" as UserId,
      blindedElement: blinded,
      ip: "203.0.113.42",
      sessionUserId: null,
      powChallenge: undefined,
      powSolution: undefined,
    };

    for (let i = 0; i < 4; i++) {
      await expect(service.evaluate(request)).resolves.toEqual({
        evaluated: blindedExpected,
      });
    }

    await expect(service.evaluate(request)).rejects.toThrow(PowRequiredError);
  });
});

// ---------------------------------------------------------------------------
// Session binding tests
// ---------------------------------------------------------------------------

describe("evaluate session binding", () => {
  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    savedEnv = { ...process.env };
    Object.assign(process.env, TEST_ENV);
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

  const VOLUNTEER_ID = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d" as UserId;
  const OTHER_SESSION_ID = "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e" as UserId;
  const BLINDED32 = Buffer.alloc(32, 0xab).toString("base64");

  function baseRequest(
    kind: OprfEvaluateRequest["kind"],
    sessionUserId: UserId | null,
  ): OprfEvaluateRequest {
    return {
      kind,
      userId: VOLUNTEER_ID,
      blindedElement: BLINDED32,
      ip: "203.0.113.7",
      sessionUserId,
      powChallenge: undefined,
      powSolution: undefined,
    };
  }

  it("rejects a volunteer evaluation when the session belongs to another user", async () => {
    const service = createOprfEvaluateService(makeDeps());
    await expect(
      service.evaluate(baseRequest("volunteer", OTHER_SESSION_ID)),
    ).rejects.toThrow(ForbiddenError);
  });

  it("allows a volunteer evaluation when the session matches the userId", async () => {
    const service = createOprfEvaluateService(makeDeps());
    await expect(
      service.evaluate(baseRequest("volunteer", VOLUNTEER_ID)),
    ).resolves.toEqual({
      evaluated: Buffer.alloc(32, 0xab).toString("base64url"),
    });
  });

  it("allows an account evaluation despite an unrelated volunteer session (shared-device client)", async () => {
    // The account id namespace is disjoint from volunteer user ids, so a
    // volunteer session on the shared origin must not block a client
    // creating or logging into an account (ADR-091 gates account
    // evaluations through the per-account tag key instead).
    const service = createOprfEvaluateService(makeDeps());
    await expect(
      service.evaluate(baseRequest("account", OTHER_SESSION_ID)),
    ).resolves.toEqual({
      evaluated: Buffer.alloc(32, 0xab).toString("base64url"),
    });
  });
});

// ---------------------------------------------------------------------------
// Channel evaluation gating tests
// ---------------------------------------------------------------------------

describe("evaluateChannel gating", () => {
  let savedEnv: NodeJS.ProcessEnv;

  // hashChannelAuth (fixtures here, timing-safe compare in the service)
  // requires the sodium backend to be initialized once.
  beforeAll(async () => {
    const { getSodium } = await import("@care-y/crypto");
    await getSodium();
  });

  beforeEach(() => {
    savedEnv = { ...process.env };
    Object.assign(process.env, TEST_ENV);
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

  const ORG_UUID = "eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee" as OrgId;
  const CHANNEL_ID = "test-channel-secret" as ChannelSecret;
  const BLINDED = Buffer.alloc(32, 0xcc).toString("base64");
  const IP = "203.0.113.1";

  // Compute the auth hash that matches a known auth token
  // hashChannelAuth returns BLAKE2b-256 of the input
  const AUTH_TOKEN = Buffer.alloc(32, 0xaa);
  const AUTH_B64 = AUTH_TOKEN.toString("base64");

  function makeRequest(
    overrides?: Partial<ChannelEvaluateRequest>,
  ): ChannelEvaluateRequest {
    return {
      channelId: CHANNEL_ID,
      blindedElement: BLINDED,
      ip: IP,
      orgUuid: ORG_UUID,
      ...overrides,
    };
  }

  /**
   * Create a mock DB that returns a predefined row from
   * lookupChannelForOprf's underlying db.selectFrom chain.
   */
  function makeMockDb(
    row: { status: string; auth_hash: Buffer } | null,
  ): Kysely<TenantDatabase> {
    const mockExecuteTakeFirst = vi.fn().mockResolvedValue(row);
    const mockWhere = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        executeTakeFirst: mockExecuteTakeFirst,
      }),
      executeTakeFirst: mockExecuteTakeFirst,
    });
    const mockSelect = vi.fn().mockReturnValue({
      where: mockWhere,
    });
    const mockSelectFrom = vi.fn().mockReturnValue({
      select: mockSelect,
    });

    return { selectFrom: mockSelectFrom } as unknown as Kysely<TenantDatabase>;
  }

  it("allows evaluation when no channel row exists (mint path)", async () => {
    const deps = makeDeps();
    const service = createOprfEvaluateService(deps);
    const db = makeMockDb(null);

    const result = await service.evaluateChannel(db, makeRequest());
    expect(result.evaluated).toBeDefined();
    expect(typeof result.evaluated).toBe("string");
  });

  it("allows evaluation for active channel with valid auth", async () => {
    // We need to compute the expected auth_hash
    const { hashChannelAuth } = await import("@care-y/crypto");
    const expectedHash = Buffer.from(hashChannelAuth(AUTH_TOKEN));

    const deps = makeDeps();
    const service = createOprfEvaluateService(deps);
    const db = makeMockDb({ status: "active", auth_hash: expectedHash });

    const result = await service.evaluateChannel(
      db,
      makeRequest({ auth: AUTH_B64 }),
    );
    expect(result.evaluated).toBeDefined();
  });

  it("refuses evaluation for active channel with missing auth", async () => {
    const { hashChannelAuth } = await import("@care-y/crypto");
    const expectedHash = Buffer.from(hashChannelAuth(AUTH_TOKEN));

    const deps = makeDeps();
    const service = createOprfEvaluateService(deps);
    const db = makeMockDb({ status: "active", auth_hash: expectedHash });

    await expect(service.evaluateChannel(db, makeRequest())).rejects.toThrow(
      ForbiddenError,
    );
  });

  it("refuses evaluation for active channel with bad auth", async () => {
    const { hashChannelAuth } = await import("@care-y/crypto");
    const expectedHash = Buffer.from(hashChannelAuth(AUTH_TOKEN));

    const deps = makeDeps();
    const service = createOprfEvaluateService(deps);
    const db = makeMockDb({ status: "active", auth_hash: expectedHash });

    const wrongAuth = Buffer.alloc(32, 0xbb).toString("base64");
    await expect(
      service.evaluateChannel(db, makeRequest({ auth: wrongAuth })),
    ).rejects.toThrow(ForbiddenError);
  });

  it("refuses evaluation for revoked channel", async () => {
    const deps = makeDeps();
    const service = createOprfEvaluateService(deps);
    const db = makeMockDb({
      status: "revoked",
      auth_hash: Buffer.alloc(32),
    });

    await expect(
      service.evaluateChannel(db, makeRequest({ auth: AUTH_B64 })),
    ).rejects.toThrow(ForbiddenError);
  });

  it("refuses evaluation for expired channel", async () => {
    const deps = makeDeps();
    const service = createOprfEvaluateService(deps);
    const db = makeMockDb({
      status: "expired",
      auth_hash: Buffer.alloc(32),
    });

    await expect(
      service.evaluateChannel(db, makeRequest({ auth: AUTH_B64 })),
    ).rejects.toThrow(ForbiddenError);
  });

  it("rate limits by channelId", async () => {
    const deps = {
      ...makeDeps(),
      userRateLimiter: createInMemoryRateLimiter({
        windowMs: 900_000,
        maxRequests: 2,
      }),
    };
    const service = createOprfEvaluateService(deps);
    const db = makeMockDb(null);

    // First two should succeed
    await service.evaluateChannel(db, makeRequest());
    await service.evaluateChannel(db, makeRequest());

    // Third should be rate limited
    await expect(service.evaluateChannel(db, makeRequest())).rejects.toThrow(
      RateLimitError,
    );
  });

  it("requires PoW past the threshold and succeeds when solved", async () => {
    // Use production env so the threshold is 5 (not 100)
    const prodSavedEnv = { ...process.env };
    Object.assign(process.env, PROD_ENV);
    _resetEnvCache();

    try {
      // Fake verifier so the test never computes a real hash chain. The
      // service contract under test is the threading of the two fields
      // into the gate, not the hash arithmetic (pow.test.ts owns that).
      const FAKE_CHALLENGE = "fake-challenge";
      const FAKE_SOLUTION = "fake-solution";
      const deps = {
        ...makeDeps(),
        powVerifier: {
          createChallenge: (): {
            challenge: string;
            difficulty: number;
            expiresAt: string;
          } => ({
            challenge: FAKE_CHALLENGE,
            difficulty: 16,
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
          }),
          verify: (
            _subject: string,
            challenge: string,
            solution: string,
          ): boolean =>
            challenge === FAKE_CHALLENGE && solution === FAKE_SOLUTION,
          dispose: (): void => {
            /* noop */
          },
        },
      };
      const auditSpy = vi
        .spyOn(deps.auditLogger, "logFailure")
        .mockResolvedValue(undefined);
      const service = createOprfEvaluateService(deps);
      const db = makeMockDb(null);

      // First 4 evaluations succeed without PoW
      for (let i = 0; i < 4; i++) {
        await service.evaluateChannel(db, makeRequest());
      }

      // 5th triggers PowRequiredError carrying the challenge
      let challenge: string | undefined;
      try {
        await service.evaluateChannel(db, makeRequest());
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(PowRequiredError);
        challenge = (err as PowRequiredError).challenge;
      }
      expect(challenge).toBe(FAKE_CHALLENGE);

      const result = await service.evaluateChannel(
        db,
        makeRequest({
          powChallenge: challenge,
          powSolution: FAKE_SOLUTION,
        }),
      );
      expect(result.evaluated).toBeDefined();

      // Verify that audit was called for pow_required
      expect(auditSpy).toHaveBeenCalledWith(
        expect.stringContaining("channel:"),
        IP,
        "pow_required",
      );
    } finally {
      for (const key of Object.keys(process.env)) {
        if (!(key in prodSavedEnv)) {
          delete process.env[key];
        }
      }
      Object.assign(process.env, prodSavedEnv);
      _resetEnvCache();
    }
  });

  it("logs oprf_failed audit on evaluator failure in channel path", async () => {
    const deps = makeDeps();
    const evalError = new Error("evaluator down");
    deps.evaluator.evaluate = vi.fn().mockRejectedValue(evalError);
    const auditSpy = vi
      .spyOn(deps.auditLogger, "logFailure")
      .mockResolvedValue(undefined);

    const service = createOprfEvaluateService(deps);
    const db = makeMockDb(null);

    await expect(service.evaluateChannel(db, makeRequest())).rejects.toThrow(
      evalError,
    );

    expect(auditSpy).toHaveBeenCalledWith(
      expect.stringContaining("channel:"),
      IP,
      "oprf_failed",
    );
  });

  it("rate limits by IP", async () => {
    const deps = {
      ...makeDeps(),
      ipRateLimiter: createInMemoryRateLimiter({
        windowMs: 900_000,
        maxRequests: 2,
      }),
    };
    const service = createOprfEvaluateService(deps);
    const db = makeMockDb(null);

    await service.evaluateChannel(db, makeRequest());
    await service.evaluateChannel(db, makeRequest());

    await expect(service.evaluateChannel(db, makeRequest())).rejects.toThrow(
      RateLimitError,
    );
  });
});
