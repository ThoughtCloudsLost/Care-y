/**
 * Tests for the donation webhook handler.
 *
 * The transport cases run against a stub dispatch. The last block wires
 * the real dispatch to a test database to check who the SSE ping reaches.
 */

import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import type * as NodeCrypto from "node:crypto";
import { timingSafeEqual } from "node:crypto";
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
  type Mock,
} from "vitest";
import type { Selectable } from "kysely";
import {
  Permission,
  RoleId,
  donationConnectionIdSchema,
  orgIdSchema,
  type DonationConnectionId,
  type OrgSchema,
  type OrgSlug,
} from "@care-y/shared";
import {
  createDonationWebhookHandler,
  drainBody,
  parseDonationWebhookPath,
  DONATION_WEBHOOK_MAX_BODY_BYTES,
} from "./donation-webhooks.js";
import type {
  DonationWebhookDispatch,
  DonationWebhookTarget,
} from "../donations/webhook-dispatch.js";
import { createDonationWebhookDispatch } from "../donations/webhook-dispatch.js";
import {
  createInMemoryRateLimiter,
  type RateLimiter,
} from "../ratelimit/rate-limiter.js";
import {
  createMockSseService,
  createTestDb,
  createTestUser,
  type TestDb,
} from "../test-utils.js";
import type { UsersTable } from "../db/types.js";
import { invalidateRolePermissionCache } from "../auth/roles.js";

// Wrap timingSafeEqual so the tests can see whether the compare ran.
vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof NodeCrypto>();
  return { ...actual, timingSafeEqual: vi.fn(actual.timingSafeEqual) };
});

const ORG_ID = orgIdSchema.parse("550e8400-e29b-41d4-a716-446655440000");
const CONN_ID = donationConnectionIdSchema.parse(
  "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
);
const SECRET = "givebutter-shared-secret-value";
const PATH = `/webhooks/givebutter/${ORG_ID}/${CONN_ID}`;
const DONATION_BODY = JSON.stringify({
  id: "evt",
  event: "transaction.succeeded",
  data: { fund_id: "fund-a", amount: 5 },
});

function mockReq(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string | Buffer;
}): IncomingMessage {
  const readable = new Readable({
    read() {
      // Data is pushed below.
    },
  }) as IncomingMessage;
  Object.defineProperty(readable, "method", {
    value: options.method ?? "POST",
  });
  Object.defineProperty(readable, "url", { value: options.url ?? PATH });
  Object.defineProperty(readable, "headers", {
    value: { "content-type": "application/json", ...options.headers },
  });
  process.nextTick(() => {
    if (options.body !== undefined) readable.push(options.body);
    readable.push(null);
  });
  return readable;
}

interface MockRes {
  statusCode: number;
  body: string;
}

function mockRes(): ServerResponse & MockRes {
  const res = {
    statusCode: 0,
    body: "",
    writeHead(status: number): ServerResponse {
      res.statusCode = status;
      return res as unknown as ServerResponse;
    },
    end(body?: string): ServerResponse {
      res.body = body ?? "";
      return res as unknown as ServerResponse;
    },
  } as unknown as ServerResponse & MockRes;
  return res;
}

function stubDispatch(
  target: DonationWebhookTarget | null = {
    orgSchema: "org_test" as OrgSchema,
    secret: SECRET,
  },
): DonationWebhookDispatch & {
  resolveTarget: Mock<DonationWebhookDispatch["resolveTarget"]>;
  onDonation: Mock<DonationWebhookDispatch["onDonation"]>;
} {
  return {
    resolveTarget: vi
      .fn<DonationWebhookDispatch["resolveTarget"]>()
      .mockResolvedValue(target),
    onDonation: vi
      .fn<DonationWebhookDispatch["onDonation"]>()
      .mockResolvedValue(undefined),
  };
}

function openLimiter(): RateLimiter {
  return createInMemoryRateLimiter({ windowMs: 60_000, maxRequests: 1000 });
}

async function run(
  dispatch: DonationWebhookDispatch,
  req: IncomingMessage,
  rateLimiter: RateLimiter = openLimiter(),
): Promise<MockRes> {
  const res = mockRes();
  await createDonationWebhookHandler({ dispatch, rateLimiter })(req, res);
  return res;
}

beforeEach(() => {
  vi.mocked(timingSafeEqual).mockClear();
});

describe("parseDonationWebhookPath", () => {
  it("parses org and connection ids", () => {
    expect(parseDonationWebhookPath(PATH)).toEqual({
      orgId: ORG_ID,
      connectionId: CONN_ID,
    });
  });

  it("ignores a query string", () => {
    expect(parseDonationWebhookPath(`${PATH}?x=1`)).not.toBeNull();
  });

  it.each([
    "/webhooks/givebutter/",
    `/webhooks/givebutter/${ORG_ID}`,
    `/webhooks/givebutter/not-a-uuid/${CONN_ID}`,
    `/webhooks/givebutter/${ORG_ID}/not-a-uuid`,
    `/webhooks/twilio/${ORG_ID}/${CONN_ID}`,
    `${PATH}/extra`,
  ])("rejects %s", (url) => {
    expect(parseDonationWebhookPath(url)).toBeNull();
  });
});

describe("drainBody", () => {
  it("accepts a body within the cap", async () => {
    expect(await drainBody(mockReq({ body: "x".repeat(10) }), 10)).toBe(true);
  });

  it("refuses a body over the cap", async () => {
    expect(await drainBody(mockReq({ body: "x".repeat(11) }), 10)).toBe(false);
  });
});

describe("createDonationWebhookHandler", () => {
  it("answers anything but POST with 405", async () => {
    const dispatch = stubDispatch();
    const res = await run(dispatch, mockReq({ method: "GET" }));

    expect(res.statusCode).toBe(405);
    expect(res.body).toBe("");
    expect(dispatch.resolveTarget).not.toHaveBeenCalled();
  });

  it("answers a malformed path with 404", async () => {
    const dispatch = stubDispatch();
    const res = await run(
      dispatch,
      mockReq({
        url: "/webhooks/givebutter/nope",
        headers: { signature: SECRET },
      }),
    );

    expect(res.statusCode).toBe(404);
    expect(dispatch.resolveTarget).not.toHaveBeenCalled();
  });

  it("answers an unknown org or connection with 404", async () => {
    const dispatch = stubDispatch(null);
    const res = await run(
      dispatch,
      mockReq({ body: DONATION_BODY, headers: { signature: SECRET } }),
    );

    expect(res.statusCode).toBe(404);
    expect(res.body).toBe("");
    expect(dispatch.resolveTarget).toHaveBeenCalledWith(ORG_ID, CONN_ID);
    expect(dispatch.onDonation).not.toHaveBeenCalled();
  });

  it("answers a missing signature with 403", async () => {
    const dispatch = stubDispatch();
    const res = await run(dispatch, mockReq({ body: DONATION_BODY }));

    expect(res.statusCode).toBe(403);
    expect(dispatch.onDonation).not.toHaveBeenCalled();
  });

  it("answers a wrong signature of the right length with 403 after comparing", async () => {
    const dispatch = stubDispatch();
    const wrong = "x".repeat(SECRET.length);
    const res = await run(
      dispatch,
      mockReq({ body: DONATION_BODY, headers: { signature: wrong } }),
    );

    expect(res.statusCode).toBe(403);
    expect(timingSafeEqual).toHaveBeenCalledTimes(1);
    expect(dispatch.onDonation).not.toHaveBeenCalled();
  });

  it("answers a signature of the wrong length with 403 without comparing", async () => {
    const dispatch = stubDispatch();
    const res = await run(
      dispatch,
      mockReq({ body: DONATION_BODY, headers: { signature: `${SECRET}x` } }),
    );

    expect(res.statusCode).toBe(403);
    expect(timingSafeEqual).not.toHaveBeenCalled();
  });

  it("answers a matching signature with 204 and dispatches", async () => {
    const dispatch = stubDispatch();
    const res = await run(
      dispatch,
      mockReq({ body: DONATION_BODY, headers: { signature: SECRET } }),
    );

    expect(res.statusCode).toBe(204);
    expect(res.body).toBe("");
    expect(timingSafeEqual).toHaveBeenCalledTimes(1);
    expect(dispatch.onDonation).toHaveBeenCalledWith("org_test", CONN_ID);
  });

  it("never parses the body, so malformed JSON still gets 204", async () => {
    const dispatch = stubDispatch();
    const res = await run(
      dispatch,
      mockReq({ body: "{not json", headers: { signature: SECRET } }),
    );

    expect(res.statusCode).toBe(204);
    expect(dispatch.onDonation).toHaveBeenCalledTimes(1);
  });

  it("refuses a body over 64 KiB with 413", async () => {
    const dispatch = stubDispatch();
    const res = await run(
      dispatch,
      mockReq({
        body: Buffer.alloc(DONATION_WEBHOOK_MAX_BODY_BYTES + 1),
        headers: { signature: SECRET },
      }),
    );

    expect(res.statusCode).toBe(413);
    expect(dispatch.resolveTarget).not.toHaveBeenCalled();
  });

  it("rate limits per connection with 429", async () => {
    const dispatch = stubDispatch();
    const limiter = createInMemoryRateLimiter({
      windowMs: 60_000,
      maxRequests: 1,
    });

    const first = await run(
      dispatch,
      mockReq({ body: DONATION_BODY, headers: { signature: SECRET } }),
      limiter,
    );
    const second = await run(
      dispatch,
      mockReq({ body: DONATION_BODY, headers: { signature: SECRET } }),
      limiter,
    );
    const otherConnection = await run(
      dispatch,
      mockReq({
        url: `/webhooks/givebutter/${ORG_ID}/7ba7b810-9dad-41d1-80b4-00c04fd430c8`,
        body: DONATION_BODY,
        headers: { signature: SECRET },
      }),
      limiter,
    );

    expect(first.statusCode).toBe(204);
    expect(second.statusCode).toBe(429);
    expect(second.body).toBe("");
    expect(otherConnection.statusCode).toBe(204);
  });

  it("answers 500 with an empty body when the lookup fails", async () => {
    const dispatch = stubDispatch();
    dispatch.resolveTarget.mockRejectedValueOnce(new Error("db down"));
    const res = await run(
      dispatch,
      mockReq({ body: DONATION_BODY, headers: { signature: SECRET } }),
    );

    expect(res.statusCode).toBe(500);
    expect(res.body).toBe("");
  });
});

describe.skipIf(!process.env.DATABASE_URL)(
  "donation webhook with the real dispatch (DB integration)",
  () => {
    let testDb: TestDb;
    let volunteer: Selectable<UsersTable>;
    let manager: Selectable<UsersTable>;
    let admin: Selectable<UsersTable>;
    let inactive: Selectable<UsersTable>;

    beforeAll(async () => {
      testDb = await createTestDb();
      volunteer = await createTestUser(testDb.db);
      manager = await createTestUser(testDb.db, {
        overrides: { role_id: RoleId.MANAGER },
      });
      admin = await createTestUser(testDb.db, {
        overrides: { role_id: RoleId.ADMIN },
      });
      inactive = await createTestUser(testDb.db, {
        overrides: { role_id: RoleId.ADMIN, is_active: false },
      });
      // Volunteers hold VIEW_FUNDS by default; withhold it so the test
      // can tell holders from non-holders.
      await testDb.db
        .insertInto("role_permission_overrides")
        .values({
          role_id: RoleId.VOLUNTEER,
          permission: Permission.VIEW_FUNDS,
          enabled: false,
        })
        .execute();
      invalidateRolePermissionCache(testDb.schemaName as OrgSchema);
    }, 30_000);

    afterAll(async () => {
      invalidateRolePermissionCache(testDb.schemaName as OrgSchema);
      await testDb.cleanup();
    });

    it("drops the cached totals and pings only active VIEW_FUNDS holders", async () => {
      const orgSchema = testDb.schemaName as OrgSchema;
      const sse = createMockSseService();
      const invalidate = vi.fn<(id: DonationConnectionId) => void>();
      const dispatch = createDonationWebhookDispatch({
        orgService: {
          findById: vi.fn(async () => ({
            id: ORG_ID,
            slug: "hook-test" as OrgSlug,
            schemaName: orgSchema,
            isActive: true,
          })),
        },
        tenantDb: () => testDb.db,
        sseService: sse,
        connectionService: {
          lookupWebhookSecret: vi.fn(async () => SECRET),
        },
        fundCache: { invalidate },
        now: () => new Date("2026-10-02T12:00:00.000Z"),
      });

      const res = await run(
        dispatch,
        mockReq({ body: DONATION_BODY, headers: { signature: SECRET } }),
      );

      expect(res.statusCode).toBe(204);
      expect(invalidate).toHaveBeenCalledWith(CONN_ID);
      expect(sse.broadcast).toHaveBeenCalledTimes(1);
      const [schema, recipients, event] = sse.broadcast.mock.calls[0] ?? [];
      expect(schema).toBe(orgSchema);
      expect([...(recipients ?? [])].sort()).toEqual(
        [manager.id, admin.id].sort(),
      );
      expect(recipients).not.toContain(volunteer.id);
      expect(recipients).not.toContain(inactive.id);
      expect(event).toEqual({
        type: "funds_inflow_changed",
        timestamp: "2026-10-02T12:00:00.000Z",
      });
    });

    it("answers 404 for an inactive org", async () => {
      const sse = createMockSseService();
      const dispatch = createDonationWebhookDispatch({
        orgService: {
          findById: vi.fn(async () => ({
            id: ORG_ID,
            slug: "hook-test" as OrgSlug,
            schemaName: testDb.schemaName as OrgSchema,
            isActive: false,
          })),
        },
        tenantDb: () => testDb.db,
        sseService: sse,
        connectionService: {
          lookupWebhookSecret: vi.fn(async () => SECRET),
        },
        fundCache: { invalidate: vi.fn() },
      });

      const res = await run(
        dispatch,
        mockReq({ body: DONATION_BODY, headers: { signature: SECRET } }),
      );

      expect(res.statusCode).toBe(404);
      expect(sse.broadcast).not.toHaveBeenCalled();
    });

    it("answers 404 for an unknown org", async () => {
      const dispatch = createDonationWebhookDispatch({
        orgService: { findById: vi.fn(async () => null) },
        tenantDb: () => testDb.db,
        sseService: createMockSseService(),
        connectionService: {
          lookupWebhookSecret: vi.fn(async () => SECRET),
        },
        fundCache: { invalidate: vi.fn() },
      });

      const res = await run(
        dispatch,
        mockReq({ body: DONATION_BODY, headers: { signature: SECRET } }),
      );

      expect(res.statusCode).toBe(404);
    });
  },
);
