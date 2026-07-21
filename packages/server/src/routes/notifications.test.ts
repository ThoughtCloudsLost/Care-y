/**
 * Tests for the notification tRPC router.
 *
 * The router covers push subscription CRUD and VAPID public key
 * retrieval; the SSE stream is a raw HTTP handler in index.ts and is
 * outside this router. Unit tests exercise auth enforcement, input
 * validation, output shape, and error mapping with a mock
 * PushSubscriptionService. The DB integration suite runs the real
 * service against an isolated schema (upsert-on-endpoint semantics,
 * per-user listing, unsubscribe deletion) via pnpm test:server:db.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import type { Selectable } from "kysely";
import {
  createNotificationRouter,
  type NotificationRouterDeps,
} from "./notifications.js";
import {
  createPushSubscriptionService,
  type PushSubscriptionRecord,
  type PushSubscriptionService,
} from "../notifications/push-subscriptions.js";
import { createPushNotificationSender } from "../notifications/push.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { UsersTable } from "../db/types.js";
import { RoleId, ErrorCode } from "@care-y/shared";
import {
  createTestDb,
  createTestUser,
  expectTrpcError,
  mockReq,
  mockRes,
  type TestDb,
} from "../test-utils.js";

// --- Unit-level stubs and context builders ---

const TEST_VAPID_PUBLIC_KEY = "BUnitTestVapidPublicKeyBase64url";

const VALID_SUBSCRIPTION_INPUT = {
  endpoint: "https://push.example.test/sub/unit-valid",
  keys: { p256dh: "p256dh-unit-valid", auth: "auth-unit-valid" },
};

function createMockPushSubSvc(
  overrides?: Partial<PushSubscriptionService>,
): PushSubscriptionService {
  return {
    subscribe: vi.fn().mockResolvedValue(undefined),
    unsubscribe: vi.fn().mockResolvedValue(undefined),
    listForUser: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

function createVolunteerContext(): Context {
  return {
    req: mockReq(),
    res: mockRes(),
    org: {
      orgId: "org-notifications-unit",
      orgSlug: "test-org",
      orgSchema: "org_test",
      tenantDb: {} as OrgContext["tenantDb"],
      sealedBox: {} as OrgContext["sealedBox"],
    },
    session: {
      id: "sess-1",
      token: "tok-1",
      userId: "user-1",
      ipToken: "ip-tok",
      uaToken: "ua-tok",
      expiresAt: new Date(Date.now() + 3_600_000),
      twofaVerified: true,
      webauthnChallenge: null,
    },
    user: {
      id: "user-1",
      encryptedIdentifier: "encrypted-identifier",
      encryptedDisplayName: "encrypted-name",
      encryptedPreferredLocale: null,
      roleId: RoleId.VOLUNTEER,
      isActive: true,
      hasSeenBriefing: true,
    },
  };
}

function createUnauthenticatedContext(): Context {
  return { ...createVolunteerContext(), session: null, user: null };
}

function createTwofaPendingContext(): Context {
  const base = createVolunteerContext();
  return {
    ...base,
    session:
      base.session === null ? null : { ...base.session, twofaVerified: false },
  };
}

function createNoOrgContext(): Context {
  return { ...createVolunteerContext(), org: null };
}

function buildCaller(
  ctx: Context,
  svc: PushSubscriptionService = createMockPushSubSvc(),
) {
  const seen: { tenantDb: unknown } = { tenantDb: undefined };
  const deps: NotificationRouterDeps = {
    createPushSubSvc: (tDb) => {
      seen.tenantDb = tDb;
      return svc;
    },
    vapidPublicKey: TEST_VAPID_PUBLIC_KEY,
  };
  const caller = createCallerFactory(createNotificationRouter(deps))(ctx);
  return { caller, seen };
}

// --- Tests ---

describe("createNotificationRouter", () => {
  describe("vapidPublicKey", () => {
    it("returns the configured VAPID public key", async () => {
      const { caller } = buildCaller(createVolunteerContext());

      await expect(caller.vapidPublicKey()).resolves.toEqual({
        publicKey: TEST_VAPID_PUBLIC_KEY,
      });
    });
  });

  describe("subscribePush", () => {
    it("records the subscription for the session user and reports subscribed", async () => {
      const subscribeSpy = vi.fn().mockResolvedValue(undefined);
      const ctx = createVolunteerContext();
      const { caller, seen } = buildCaller(
        ctx,
        createMockPushSubSvc({ subscribe: subscribeSpy }),
      );

      const result = await caller.subscribePush({
        endpoint: "https://push.example.test/sub/unit-1",
        keys: { p256dh: "p256dh-unit-1", auth: "auth-unit-1" },
      });

      expect(result).toEqual({ subscribed: true });
      // Identity binding contract: the subscription belongs to the session
      // user; the input carries no user id for the client to choose.
      expect(subscribeSpy).toHaveBeenCalledWith(
        ctx.user?.id,
        "https://push.example.test/sub/unit-1",
        "p256dh-unit-1",
        "auth-unit-1",
      );
      // Tenant scoping contract: the service is built against the caller
      // org's tenant DB from context.
      expect(seen.tenantDb).toBe(ctx.org?.tenantDb);
    });
  });

  describe("unsubscribePush", () => {
    it("reports unsubscribed for a valid endpoint", async () => {
      const { caller } = buildCaller(createVolunteerContext());

      await expect(
        caller.unsubscribePush({
          endpoint: "https://push.example.test/sub/unit-1",
        }),
      ).resolves.toEqual({ unsubscribed: true });
    });
  });

  describe("listPushSubscriptions", () => {
    it("returns the session user's subscription records", async () => {
      const records: readonly PushSubscriptionRecord[] = [
        {
          endpoint: "https://push.example.test/sub/unit-2",
          createdAt: new Date("2026-01-15T12:00:00Z"),
        },
      ];
      const listSpy = vi.fn().mockResolvedValue(records);
      const ctx = createVolunteerContext();
      const { caller } = buildCaller(
        ctx,
        createMockPushSubSvc({ listForUser: listSpy }),
      );

      const result = await caller.listPushSubscriptions();

      expect(result).toEqual({ subscriptions: records });
      // Per-user scoping: the listing is keyed by the session user.
      expect(listSpy).toHaveBeenCalledWith(ctx.user?.id);
    });
  });

  describe("auth enforcement", () => {
    // Every procedure is built on volunteerProcedure (verified in
    // notifications.ts): org -> session -> 2FA -> VIEW_TICKETS. Each
    // procedure is exercised against a missing session; the shared inner
    // guards (2FA pending, missing org) are exercised once each since the
    // identical middleware chain runs for every procedure.
    // The asserted messages are ErrorCode constants the client branches
    // on, part of the API contract rather than display copy.
    type NotificationCaller = ReturnType<typeof buildCaller>["caller"];
    const procedureInvocations: ReadonlyArray<{
      name: string;
      invoke: (caller: NotificationCaller) => Promise<unknown>;
    }> = [
      {
        name: "vapidPublicKey",
        invoke: (caller) => caller.vapidPublicKey(),
      },
      {
        name: "subscribePush",
        invoke: (caller) => caller.subscribePush(VALID_SUBSCRIPTION_INPUT),
      },
      {
        name: "unsubscribePush",
        invoke: (caller) =>
          caller.unsubscribePush({
            endpoint: VALID_SUBSCRIPTION_INPUT.endpoint,
          }),
      },
      {
        name: "listPushSubscriptions",
        invoke: (caller) => caller.listPushSubscriptions(),
      },
    ];

    for (const { name, invoke } of procedureInvocations) {
      it(`rejects unauthenticated callers on ${name}`, async () => {
        const { caller } = buildCaller(createUnauthenticatedContext());

        await expectTrpcError(
          invoke(caller),
          "UNAUTHORIZED",
          ErrorCode.NOT_AUTHENTICATED,
        );
      });
    }

    it("rejects sessions without completed 2FA", async () => {
      const { caller } = buildCaller(createTwofaPendingContext());

      await expectTrpcError(
        caller.vapidPublicKey(),
        "UNAUTHORIZED",
        ErrorCode.TWOFA_REQUIRED,
      );
    });

    it("rejects requests without a resolved org", async () => {
      const { caller } = buildCaller(createNoOrgContext());

      await expectTrpcError(caller.vapidPublicKey(), "NOT_FOUND");
    });
  });

  describe("input validation", () => {
    it("rejects a non-URL endpoint on subscribePush without touching the service", async () => {
      const subscribeSpy = vi.fn().mockResolvedValue(undefined);
      const { caller } = buildCaller(
        createVolunteerContext(),
        createMockPushSubSvc({ subscribe: subscribeSpy }),
      );

      await expectTrpcError(
        caller.subscribePush({
          endpoint: "not-a-url",
          keys: { p256dh: "p256dh-x", auth: "auth-x" },
        }),
        "BAD_REQUEST",
      );
      // Validation gates before side effects: no partial writes on
      // invalid input.
      expect(subscribeSpy).not.toHaveBeenCalled();
    });

    it("rejects empty subscription keys on subscribePush", async () => {
      const { caller } = buildCaller(createVolunteerContext());

      await expectTrpcError(
        caller.subscribePush({
          endpoint: "https://push.example.test/sub/unit-3",
          keys: { p256dh: "", auth: "auth-x" },
        }),
        "BAD_REQUEST",
      );
      await expectTrpcError(
        caller.subscribePush({
          endpoint: "https://push.example.test/sub/unit-3",
          keys: { p256dh: "p256dh-x", auth: "" },
        }),
        "BAD_REQUEST",
      );
    });

    it("rejects a subscription without a keys object", async () => {
      const { caller } = buildCaller(createVolunteerContext());

      await expectTrpcError(
        caller.subscribePush({
          endpoint: "https://push.example.test/sub/unit-4",
        } as unknown as typeof VALID_SUBSCRIPTION_INPUT),
        "BAD_REQUEST",
      );
    });

    it("rejects a non-URL endpoint on unsubscribePush", async () => {
      const { caller } = buildCaller(createVolunteerContext());

      await expectTrpcError(
        caller.unsubscribePush({ endpoint: "not-a-url" }),
        "BAD_REQUEST",
      );
    });
  });

  describe("error mapping", () => {
    it("surfaces unexpected service failures as INTERNAL_SERVER_ERROR", async () => {
      const svc = createMockPushSubSvc({
        subscribe: vi.fn().mockRejectedValue(new Error("connection reset")),
      });
      const { caller } = buildCaller(createVolunteerContext(), svc);

      await expectTrpcError(
        caller.subscribePush(VALID_SUBSCRIPTION_INPUT),
        "INTERNAL_SERVER_ERROR",
      );
    });
  });
});

// ---------------------------------------------------------------------------
// DB integration tests (real PostgreSQL + real PushSubscriptionService,
// run via pnpm test:server:db)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "notification routes (DB integration)",
  () => {
    let testDb: TestDb;
    let userA: Selectable<UsersTable>;
    let userB: Selectable<UsersTable>;

    const ENDPOINT_A1 = "https://push.example.test/sub/device-a1";
    const ENDPOINT_A2 = "https://push.example.test/sub/device-a2";
    const ENDPOINT_B1 = "https://push.example.test/sub/device-b1";

    // Real sender with placeholder key strings: the unsubscribe path only
    // deletes rows and never reads key material or performs network I/O
    // (VAPID signing runs only inside sendToUsers, which these tests
    // never call).
    const pushSender = createPushNotificationSender(
      { publicKey: "test-vapid-public", privateKeyPem: "test-not-a-real-pem" },
      "ops@example.test",
    );

    const dbFactory = createCallerFactory(
      createNotificationRouter({
        createPushSubSvc: (tDb) =>
          createPushSubscriptionService(tDb, pushSender),
        vapidPublicKey: "test-vapid-public",
      }),
    );

    function dbContext(user: Selectable<UsersTable>): Context {
      return {
        req: mockReq(),
        res: mockRes(),
        org: {
          orgId: "org-notifications-db-test",
          orgSlug: "test-org",
          orgSchema: testDb.schemaName,
          tenantDb: testDb.db,
          sealedBox: {} as OrgContext["sealedBox"],
        },
        session: {
          id: `sess-${user.id}`,
          token: `tok-${user.id}`,
          userId: user.id,
          ipToken: "ip-tok",
          uaToken: "ua-tok",
          expiresAt: new Date(Date.now() + 3_600_000),
          twofaVerified: true,
          webauthnChallenge: null,
        },
        user: {
          id: user.id,
          encryptedIdentifier: user.encrypted_identifier.toString("base64"),
          encryptedDisplayName: user.encrypted_display_name.toString("base64"),
          encryptedPreferredLocale: null,
          roleId: user.role_id,
          isActive: user.is_active,
          hasSeenBriefing: true,
        },
      };
    }

    function createDbCaller(user: Selectable<UsersTable>) {
      return dbFactory(dbContext(user));
    }

    beforeAll(async () => {
      testDb = await createTestDb();
      userA = await createTestUser(testDb.db);
      userB = await createTestUser(testDb.db);
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("subscribePush stores the subscription for the session user", async () => {
      const caller = createDbCaller(userA);

      const result = await caller.subscribePush({
        endpoint: ENDPOINT_A1,
        keys: { p256dh: "p256dh-key-a1-v1", auth: "auth-key-a1-v1" },
      });

      expect(result).toEqual({ subscribed: true });

      const row = await testDb.db
        .selectFrom("push_subscriptions")
        .selectAll()
        .where("endpoint", "=", ENDPOINT_A1)
        .executeTakeFirstOrThrow();
      expect(row.user_id).toBe(userA.id);
      // DB contract: endpoint and both browser keys are stored as text
      // for later web push delivery (migration 041).
      expect(row.key_p256dh).toBe("p256dh-key-a1-v1");
      expect(row.key_auth).toBe("auth-key-a1-v1");
    });

    it("re-subscribing the same endpoint updates keys in place (upsert on endpoint)", async () => {
      const caller = createDbCaller(userA);

      await caller.subscribePush({
        endpoint: ENDPOINT_A1,
        keys: { p256dh: "p256dh-key-a1-v2", auth: "auth-key-a1-v2" },
      });

      const rows = await testDb.db
        .selectFrom("push_subscriptions")
        .selectAll()
        .where("endpoint", "=", ENDPOINT_A1)
        .execute();
      expect(rows).toHaveLength(1);
      expect(rows[0]?.key_p256dh).toBe("p256dh-key-a1-v2");
      expect(rows[0]?.key_auth).toBe("auth-key-a1-v2");
    });

    it("listPushSubscriptions returns only the calling user's endpoints", async () => {
      await createDbCaller(userA).subscribePush({
        endpoint: ENDPOINT_A2,
        keys: { p256dh: "p256dh-key-a2", auth: "auth-key-a2" },
      });
      await createDbCaller(userB).subscribePush({
        endpoint: ENDPOINT_B1,
        keys: { p256dh: "p256dh-key-b1", auth: "auth-key-b1" },
      });

      const listA = await createDbCaller(userA).listPushSubscriptions();
      const endpointsA = listA.subscriptions.map((s) => s.endpoint).sort();
      expect(endpointsA).toEqual([ENDPOINT_A1, ENDPOINT_A2].sort());
      for (const sub of listA.subscriptions) {
        expect(sub.createdAt).toBeInstanceOf(Date);
        // Documented contract (notifications.ts): the settings listing
        // exposes endpoints only, never the browser push keys.
        expect(sub).not.toHaveProperty("keyP256dh");
        expect(sub).not.toHaveProperty("key_p256dh");
        expect(sub).not.toHaveProperty("keyAuth");
        expect(sub).not.toHaveProperty("key_auth");
      }

      const listB = await createDbCaller(userB).listPushSubscriptions();
      expect(listB.subscriptions.map((s) => s.endpoint)).toEqual([ENDPOINT_B1]);
    });

    it("unsubscribePush deletes the endpoint and is idempotent for unknown endpoints", async () => {
      const caller = createDbCaller(userA);

      await expect(
        caller.unsubscribePush({ endpoint: ENDPOINT_A2 }),
      ).resolves.toEqual({ unsubscribed: true });

      const remaining = await caller.listPushSubscriptions();
      expect(remaining.subscriptions.map((s) => s.endpoint)).toEqual([
        ENDPOINT_A1,
      ]);
      const row = await testDb.db
        .selectFrom("push_subscriptions")
        .selectAll()
        .where("endpoint", "=", ENDPOINT_A2)
        .executeTakeFirst();
      expect(row).toBeUndefined();

      await expect(
        caller.unsubscribePush({
          endpoint: "https://push.example.test/sub/never-registered",
        }),
      ).resolves.toEqual({ unsubscribed: true });
    });
  },
);
