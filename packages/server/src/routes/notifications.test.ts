/**
 * Tests for the notification tRPC router.
 *
 * The router covers push subscription CRUD, VAPID public key retrieval,
 * and notification preference management (get/set/reset). The SSE stream
 * is a raw HTTP handler in index.ts and is outside this router. Unit
 * tests exercise auth enforcement, input validation, output shape, and
 * error mapping with mock services. The DB integration suite runs the
 * real services against an isolated schema via pnpm test:server:db.
 */

import * as crypto from "node:crypto";
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
import {
  createNotificationPreferencesService,
  type NotificationPreferencesService,
} from "../notifications/preferences.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { UsersTable } from "../db/types.js";
import { RoleId, ErrorCode, type PreferenceRow } from "@care-y/shared";
import type {
  SessionId,
  SessionToken,
  UserId,
  IpToken,
  UaToken,
  OrgId,
  OrgSlug,
  OrgSchema,
  KeyGeneration,
} from "@care-y/shared";
import { NotFoundError } from "../errors.js";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  createTestTicketFixture,
  expectTrpcError,
  mockReq,
  mockRes,
  type TestDb,
  stubTenantDbDefaultRoles,
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

function createMockPreferencesSvc(
  overrides?: Partial<NotificationPreferencesService>,
): NotificationPreferencesService {
  return {
    getEffective: vi.fn().mockResolvedValue(true),
    resolveForDispatch: vi
      .fn()
      .mockResolvedValue({ pushAllowed: [], emailAllowed: [], smsAllowed: [] }),
    set: vi.fn().mockResolvedValue(undefined),
    listForUser: vi.fn().mockResolvedValue([]),
    reset: vi.fn().mockResolvedValue(undefined),
    assertScopeAccessible: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createVolunteerContext(): Context {
  return {
    req: mockReq(),
    res: mockRes(),
    org: {
      orgId: "org-notifications-unit" as OrgId,
      orgSlug: "test-org" as OrgSlug,
      orgSchema: "org_test" as OrgSchema,
      tenantDb: stubTenantDbDefaultRoles(),
      sealedBox: {} as OrgContext["sealedBox"],
    },
    session: {
      id: "sess-1" as SessionId,
      token: "tok-1" as SessionToken,
      userId: "user-1" as UserId,
      ipToken: "ip-tok" as IpToken,
      uaToken: "ua-tok" as UaToken,
      expiresAt: new Date(Date.now() + 3_600_000),
      twofaVerified: true,
      webauthnChallenge: null,
    },
    user: {
      id: "user-1" as UserId,
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
  prefSvc: NotificationPreferencesService = createMockPreferencesSvc(),
) {
  const seen: { tenantDb: unknown } = { tenantDb: undefined };
  const deps: NotificationRouterDeps = {
    createPushSubSvc: (tDb) => {
      seen.tenantDb = tDb;
      return svc;
    },
    vapidPublicKey: TEST_VAPID_PUBLIC_KEY,
    preferencesService: prefSvc,
  };
  const caller = createCallerFactory(createNotificationRouter(deps))(ctx);
  return { caller, seen, prefSvc };
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
      {
        name: "getPreferences",
        invoke: (caller) => caller.getPreferences(),
      },
      {
        name: "setPreference",
        invoke: (caller) =>
          caller.setPreference({
            scopeType: "global",
            scopeId: null,
            eventType: "ticket_created",
            channel: "email",
            enabled: false,
          }),
      },
      {
        name: "resetPreferences",
        invoke: (caller) => caller.resetPreferences({}),
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

  // -----------------------------------------------------------------------
  // Notification preferences route contracts (unit-level, mock service)
  // -----------------------------------------------------------------------

  describe("getPreferences", () => {
    it("returns preference rows from the service for the session user", async () => {
      const rows: PreferenceRow[] = [
        {
          scopeType: "global",
          scopeId: null,
          eventType: "ticket_created",
          channel: "email",
          enabled: false,
        },
      ];
      const listSpy = vi.fn().mockResolvedValue(rows);
      const prefSvc = createMockPreferencesSvc({ listForUser: listSpy });
      const ctx = createVolunteerContext();
      const { caller } = buildCaller(ctx, createMockPushSubSvc(), prefSvc);

      const result = await caller.getPreferences();

      expect(result).toEqual({ preferences: rows });
      expect(listSpy).toHaveBeenCalledWith(ctx.org?.tenantDb, ctx.user?.id);
    });
  });

  describe("setPreference", () => {
    it("calls assertScopeAccessible then set with session user id", async () => {
      const assertSpy = vi.fn().mockResolvedValue(undefined);
      const setSpy = vi.fn().mockResolvedValue(undefined);
      const prefSvc = createMockPreferencesSvc({
        assertScopeAccessible: assertSpy,
        set: setSpy,
      });
      const ctx = createVolunteerContext();
      const { caller } = buildCaller(ctx, createMockPushSubSvc(), prefSvc);

      const result = await caller.setPreference({
        scopeType: "global",
        scopeId: null,
        eventType: "followup_added",
        channel: "push",
        enabled: false,
      });

      expect(result).toEqual({ saved: true });
      // The route must call assertScopeAccessible before set.
      expect(assertSpy).toHaveBeenCalledWith(ctx.org?.tenantDb, ctx.user?.id, {
        scopeType: "global",
        scopeId: null,
      });
      expect(setSpy).toHaveBeenCalledWith(
        ctx.org?.tenantDb,
        ctx.user?.id,
        { scopeType: "global", scopeId: null },
        "followup_added",
        "push",
        false,
      );
    });

    it("maps NotFoundError from assertScopeAccessible to NOT_FOUND", async () => {
      const prefSvc = createMockPreferencesSvc({
        assertScopeAccessible: vi
          .fn()
          .mockRejectedValue(new NotFoundError("Scope referent not found")),
      });
      const { caller } = buildCaller(
        createVolunteerContext(),
        createMockPushSubSvc(),
        prefSvc,
      );

      await expectTrpcError(
        caller.setPreference({
          scopeType: "ticket",
          scopeId: "00000000-0000-4000-8000-000000000099",
          eventType: "ticket_assigned",
          channel: "email",
          enabled: true,
        }),
        "NOT_FOUND",
      );
    });
  });

  describe("resetPreferences", () => {
    it("delegates to service reset with scoped input", async () => {
      const resetSpy = vi.fn().mockResolvedValue(undefined);
      const prefSvc = createMockPreferencesSvc({ reset: resetSpy });
      const ctx = createVolunteerContext();
      const { caller } = buildCaller(ctx, createMockPushSubSvc(), prefSvc);

      const result = await caller.resetPreferences({
        scopeType: "queue",
        scopeId: "00000000-0000-4000-8000-000000000042",
      });

      expect(result).toEqual({ reset: true });
      expect(resetSpy).toHaveBeenCalledWith(ctx.org?.tenantDb, ctx.user?.id, {
        scopeType: "queue",
        scopeId: "00000000-0000-4000-8000-000000000042",
      });
    });

    it("delegates to service reset without scope when input is empty", async () => {
      const resetSpy = vi.fn().mockResolvedValue(undefined);
      const prefSvc = createMockPreferencesSvc({ reset: resetSpy });
      const ctx = createVolunteerContext();
      const { caller } = buildCaller(ctx, createMockPushSubSvc(), prefSvc);

      await caller.resetPreferences({});

      expect(resetSpy).toHaveBeenCalledWith(
        ctx.org?.tenantDb,
        ctx.user?.id,
        undefined,
      );
    });
  });
});

// ---------------------------------------------------------------------------
// DB integration tests (real PostgreSQL + real services,
// run via pnpm test:server:db)
// ---------------------------------------------------------------------------

const preferencesServiceInstance = createNotificationPreferencesService();

describe.skipIf(!process.env.DATABASE_URL)(
  "notification routes (DB integration)",
  () => {
    let testDb: TestDb;
    let userA: Selectable<UsersTable>;
    let userB: Selectable<UsersTable>;

    const ENDPOINT_A1 = "https://push.example.test/sub/device-a1";
    const ENDPOINT_A2 = "https://push.example.test/sub/device-a2";
    const ENDPOINT_B1 = "https://push.example.test/sub/device-b1";

    const dbFactory = createCallerFactory(
      createNotificationRouter({
        createPushSubSvc: (tDb) => createPushSubscriptionService(tDb),
        vapidPublicKey: "test-vapid-public",
        preferencesService: preferencesServiceInstance,
      }),
    );

    function dbContext(user: Selectable<UsersTable>): Context {
      return {
        req: mockReq(),
        res: mockRes(),
        org: {
          orgId: "org-notifications-db-test" as OrgId,
          orgSlug: "test-org" as OrgSlug,
          orgSchema: testDb.schemaName as OrgSchema,
          tenantDb: testDb.db,
          sealedBox: {} as OrgContext["sealedBox"],
        },
        session: {
          id: `sess-${user.id}` as SessionId,
          token: `tok-${user.id}` as SessionToken,
          userId: user.id,
          ipToken: "ip-tok" as IpToken,
          uaToken: "ua-tok" as UaToken,
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

    // -----------------------------------------------------------------
    // Notification preferences DB integration
    // -----------------------------------------------------------------

    describe("notification preferences", () => {
      it("setPreference global scope roundtrips through getPreferences", async () => {
        const caller = createDbCaller(userA);

        await caller.setPreference({
          scopeType: "global",
          scopeId: null,
          eventType: "ticket_created",
          channel: "email",
          enabled: false,
        });

        const result = await caller.getPreferences();
        const match = result.preferences.find(
          (p) =>
            p.scopeType === "global" &&
            p.eventType === "ticket_created" &&
            p.channel === "email",
        );
        expect(match).toBeDefined();
        expect(match?.enabled).toBe(false);
        expect(match?.scopeId).toBeNull();
      });

      it("ticket scope without a key wrap returns NOT_FOUND", async () => {
        const caller = createDbCaller(userA);
        const fakeTicketId = "00000000-0000-4000-8000-000000000099";

        await expectTrpcError(
          caller.setPreference({
            scopeType: "ticket",
            scopeId: fakeTicketId,
            eventType: "followup_added",
            channel: "push",
            enabled: true,
          }),
          "NOT_FOUND",
        );
      });

      it("ticket scope with a key wrap saves successfully", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const ticketUser = await testDb.db
          .selectFrom("users")
          .selectAll()
          .where("id", "=", fixture.userId!)
          .executeTakeFirstOrThrow();

        // Insert a key wrap so the user has ticket access.
        await testDb.db
          .insertInto("ticket_key_wraps")
          .values({
            ticket_id: fixture.ticketId,
            volunteer_id: ticketUser.id,
            key_generation: crypto.randomUUID() as KeyGeneration,
            ephemeral_point: Buffer.alloc(32),
            nonce: Buffer.alloc(24),
            wrapped_key: Buffer.alloc(48),
            algorithm: "ecies-ristretto255-v1",
          })
          .execute();

        const ticketCaller = createDbCaller(ticketUser);
        const result = await ticketCaller.setPreference({
          scopeType: "ticket",
          scopeId: fixture.ticketId,
          eventType: "followup_added",
          channel: "push",
          enabled: false,
        });
        expect(result).toEqual({ saved: true });
      });

      it("produces identical NOT_FOUND for missing ticket and inaccessible ticket", async () => {
        const callerA = createDbCaller(userA);
        const nonexistentId = "00000000-0000-4000-8000-ffffffffffff";

        // Missing ticket: no ticket row exists at all.
        const errMissing = await expectTrpcError(
          callerA.setPreference({
            scopeType: "ticket",
            scopeId: nonexistentId,
            eventType: "ticket_assigned",
            channel: "email",
            enabled: true,
          }),
          "NOT_FOUND",
        );

        // Inaccessible ticket: ticket exists, but user holds no key wrap.
        const fixture = await createTestTicketFixture(testDb.db);
        const errInaccessible = await expectTrpcError(
          callerA.setPreference({
            scopeType: "ticket",
            scopeId: fixture.ticketId,
            eventType: "ticket_assigned",
            channel: "email",
            enabled: true,
          }),
          "NOT_FOUND",
        );

        // Both errors must be indistinguishable to the caller.
        expect(errMissing.code).toBe(errInaccessible.code);
        expect(errMissing.message).toBe(errInaccessible.message);
      });

      it("queue scope with unknown queue UUID returns NOT_FOUND", async () => {
        const caller = createDbCaller(userA);

        await expectTrpcError(
          caller.setPreference({
            scopeType: "queue",
            scopeId: "00000000-0000-4000-8000-000000000077",
            eventType: "ticket_created",
            channel: "sms",
            enabled: false,
          }),
          "NOT_FOUND",
        );
      });

      it("queue scope with a valid queue saves successfully", async () => {
        const queue = await createTestQueue(testDb.db);
        const caller = createDbCaller(userA);

        const result = await caller.setPreference({
          scopeType: "queue",
          scopeId: queue.id,
          eventType: "ticket_created",
          channel: "sms",
          enabled: false,
        });
        expect(result).toEqual({ saved: true });
      });

      it("resetPreferences clears scoped rows", async () => {
        const caller = createDbCaller(userA);

        // Set a global pref so there is something to reset.
        await caller.setPreference({
          scopeType: "global",
          scopeId: null,
          eventType: "mention",
          channel: "push",
          enabled: false,
        });
        const before = await caller.getPreferences();
        const mentionBefore = before.preferences.find(
          (p) => p.eventType === "mention" && p.channel === "push",
        );
        expect(mentionBefore).toBeDefined();

        await caller.resetPreferences({
          scopeType: "global",
          scopeId: null,
        });

        const after = await caller.getPreferences();
        const globalMention = after.preferences.find(
          (p) =>
            p.scopeType === "global" &&
            p.eventType === "mention" &&
            p.channel === "push",
        );
        expect(globalMention).toBeUndefined();
      });
    });
  },
);
