/**
 * DB integration tests for the donations tRPC router: the permission gate
 * on each procedure, the audit rows that saving and removing a connection
 * leave, and provider fund listing when one connection fails. Providers
 * are stubs chosen by API key; no request leaves the test.
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  type Mock,
} from "vitest";
import { randomUUID } from "node:crypto";
import type { Selectable } from "kysely";
import {
  ErrorCode,
  Permission,
  RoleId,
  orgIdSchema,
  type InflowProviderId,
  type IpToken,
  type OrgId,
  type OrgSchema,
  type OrgSlug,
  type RoleIdValue,
  type SessionId,
  type SessionToken,
  type UaToken,
} from "@care-y/shared";
import { createDonationsRouter } from "./donations.js";
import { router, createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { UsersTable } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  expectTrpcError,
  mockReq,
  mockRes,
  seedOrgPublicKey,
  testSealedBox,
  TEST_OPS_KEY,
  type TestDb,
} from "../test-utils.js";
import { createSecretsEncryptor, deriveSecretsKey } from "../config/secrets.js";
import { invalidateRolePermissionCache } from "../auth/roles.js";
import {
  DonationProviderError,
  ForbiddenError,
  InternalError,
} from "../errors.js";
import { createInflowProviderFactory } from "../donations/factory.js";
import { createProviderFundCache } from "../donations/fund-cache.js";
import {
  createDonationConnectionService,
  type DonationConnectionService,
} from "../donations/config-service.js";
import type {
  InflowProvider,
  InflowProviderConstructor,
} from "../donations/provider.js";
import { givebutterConfigSchema } from "../donations/schemas.js";

interface FakeProvider extends InflowProvider {
  readonly listFunds: Mock<InflowProvider["listFunds"]>;
  readonly registerWebhook: Mock<InflowProvider["registerWebhook"]>;
  readonly deleteWebhook: Mock<InflowProvider["deleteWebhook"]>;
}

function fakeProvider(): FakeProvider {
  return {
    listFunds: vi.fn<InflowProvider["listFunds"]>().mockResolvedValue([]),
    registerWebhook: vi
      .fn<InflowProvider["registerWebhook"]>()
      .mockResolvedValue({ id: `wh_${randomUUID()}`, secret: "wh-secret" }),
    deleteWebhook: vi
      .fn<InflowProvider["deleteWebhook"]>()
      .mockResolvedValue(undefined),
  };
}

describe.skipIf(!process.env.DATABASE_URL)("donations router", () => {
  let testDb: TestDb;
  let volunteer: Selectable<UsersTable>;
  let admin: Selectable<UsersTable>;
  const orgId: OrgId = orgIdSchema.parse(randomUUID());

  const providersByKey = new Map<string, FakeProvider>();
  const construct = vi.fn<InflowProviderConstructor>((config) => {
    const { apiKey } = givebutterConfigSchema.parse(config);
    const provider = providersByKey.get(apiKey);
    if (provider === undefined) {
      throw new InternalError("no fake provider for this key");
    }
    return provider;
  });
  const constructors = new Map<InflowProviderId, InflowProviderConstructor>([
    ["givebutter", construct],
  ]);

  // The service needs the test database, which exists only after
  // beforeAll; the router is built once and reaches it through this.
  let service: DonationConnectionService;
  const connectionService: DonationConnectionService = {
    list: (...args) => service.list(...args),
    saveGivebutter: (...args) => service.saveGivebutter(...args),
    remove: (...args) => service.remove(...args),
    listProviderFunds: (...args) => service.listProviderFunds(...args),
    lookupWebhookSecret: (...args) => service.lookupWebhookSecret(...args),
    removeWebhooksForOrg: (...args) => service.removeWebhooksForOrg(...args),
  };
  const callerFactory = createCallerFactory(
    router({ donations: createDonationsRouter({ connectionService }) }),
  );

  function newKey(provider: FakeProvider = fakeProvider()): string {
    const key = `gb-key-${randomUUID()}`;
    providersByKey.set(key, provider);
    return key;
  }

  function orgContext(): OrgContext {
    return {
      orgId,
      orgSlug: "test-donations" as OrgSlug,
      orgSchema: testDb.schemaName as OrgSchema,
      tenantDb: testDb.db,
      sealedBox: testSealedBox,
    };
  }

  function callerFor(user: Selectable<UsersTable>) {
    const ctx: Context = {
      req: mockReq(),
      res: mockRes(),
      org: orgContext(),
      session: {
        id: `00000000-0000-0000-0000-${user.id.slice(-12)}` as SessionId,
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
        mustChangePassword: false,
      },
    };
    return callerFactory(ctx);
  }

  function unauthedCaller() {
    const ctx: Context = {
      req: mockReq(),
      res: mockRes(),
      org: orgContext(),
      session: null,
      user: null,
    };
    return callerFactory(ctx);
  }

  async function auditRows(
    eventType: string,
    connectionId: string,
  ): Promise<{ actor_id: string; metadata: Record<string, unknown> }[]> {
    const rows = await testDb.db
      .selectFrom("audit_log")
      .select(["actor_id", "metadata"])
      .where("event_type", "=", eventType)
      .execute();
    return rows.filter((r) => r.metadata.connectionId === connectionId);
  }

  /** Withhold one permission from a role for the length of `run`. */
  async function withholding(
    roleId: RoleIdValue,
    permission: Permission,
    run: () => Promise<void>,
  ): Promise<void> {
    const orgSchema = testDb.schemaName as OrgSchema;
    await testDb.db
      .insertInto("role_permission_overrides")
      .values({ role_id: roleId, permission, enabled: false })
      .execute();
    invalidateRolePermissionCache(orgSchema);
    try {
      await run();
    } finally {
      await testDb.db
        .deleteFrom("role_permission_overrides")
        .where("role_id", "=", roleId)
        .where("permission", "=", permission)
        .execute();
      invalidateRolePermissionCache(orgSchema);
    }
  }

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    await testDb.platformDb
      .insertInto("orgs")
      .values({
        id: orgId,
        slug: `donroute-${orgId.slice(0, 8)}` as OrgSlug,
        schema_name: testDb.schemaName as OrgSchema,
      })
      .execute();
    volunteer = await createTestUser(testDb.db);
    admin = await createTestUser(testDb.db, {
      overrides: { role_id: RoleId.ADMIN },
    });

    const encryptor = createSecretsEncryptor(deriveSecretsKey(TEST_OPS_KEY));
    const factory = createInflowProviderFactory({
      db: testDb.platformDb,
      secretsEncryptor: encryptor,
      providerConstructors: constructors,
    });
    service = createDonationConnectionService({
      db: testDb.platformDb,
      secretsEncryptor: encryptor,
      factory,
      providerConstructors: constructors,
      fundCache: createProviderFundCache({ ttlMs: 45_000 }),
      webhookBaseUrl: "https://care-y.example",
    });
  }, 30_000);

  afterAll(async () => {
    await testDb.platformDb
      .deleteFrom("donation_connections")
      .where("org_id", "=", orgId)
      .execute();
    await testDb.platformDb
      .deleteFrom("orgs")
      .where("id", "=", orgId)
      .execute();
    await testDb.cleanup();
  });

  describe("gates", () => {
    it("rejects an unauthenticated caller", async () => {
      await expectTrpcError(
        unauthedCaller().donations.listProviderFunds(),
        "UNAUTHORIZED",
      );
    });

    it("keeps connection management from a volunteer, who lacks MANAGE_FUNDS", async () => {
      const caller = callerFor(volunteer);
      await expectTrpcError(caller.donations.listConnections(), "FORBIDDEN");
      await expectTrpcError(
        caller.donations.saveGivebutterConnection({ apiKey: newKey() }),
        "FORBIDDEN",
      );
      await expectTrpcError(
        caller.donations.removeConnection({ connectionId: randomUUID() }),
        "FORBIDDEN",
      );
    });

    it("lets a volunteer read provider funds through VIEW_FUNDS", async () => {
      await expect(
        callerFor(volunteer).donations.listProviderFunds(),
      ).resolves.toHaveProperty("funds");
    });

    it("refuses provider funds once an org withholds VIEW_FUNDS", async () => {
      await withholding(RoleId.VOLUNTEER, Permission.VIEW_FUNDS, async () => {
        await expectTrpcError(
          callerFor(volunteer).donations.listProviderFunds(),
          "FORBIDDEN",
        );
      });
    });

    it("refuses connection management once an org withholds MANAGE_FUNDS", async () => {
      await withholding(RoleId.ADMIN, Permission.MANAGE_FUNDS, async () => {
        await expectTrpcError(
          callerFor(admin).donations.listConnections(),
          "FORBIDDEN",
        );
      });
    });

    it("refuses a key shorter than 16 characters", async () => {
      await expectTrpcError(
        callerFor(admin).donations.saveGivebutterConnection({
          apiKey: "short",
        }),
        "BAD_REQUEST",
      );
    });
  });

  describe("saveGivebutterConnection", () => {
    it("saves the connection and leaves an audit row", async () => {
      const apiKey = newKey();
      const saved = await callerFor(admin).donations.saveGivebutterConnection({
        apiKey,
      });

      expect(saved).toMatchObject({
        provider: "givebutter",
        keyHint: apiKey.slice(-4),
        webhookRegistered: true,
      });
      const rows = await auditRows("donation_connection_saved", saved.id);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        actor_id: admin.id,
        metadata: { connectionId: saved.id, provider: "givebutter" },
      });

      const { connections } =
        await callerFor(admin).donations.listConnections();
      expect(connections.map((c) => c.id)).toContain(saved.id);
    });

    it("reports a refused key with its shared error code", async () => {
      const provider = fakeProvider();
      provider.listFunds.mockRejectedValueOnce(
        new ForbiddenError(ErrorCode.DONATION_PROVIDER_REJECTED),
      );

      await expectTrpcError(
        callerFor(admin).donations.saveGivebutterConnection({
          apiKey: newKey(provider),
        }),
        "FORBIDDEN",
        ErrorCode.DONATION_PROVIDER_REJECTED,
      );
    });

    it("reports an unreachable provider with its shared error code", async () => {
      const provider = fakeProvider();
      provider.listFunds.mockRejectedValueOnce(
        new DonationProviderError(ErrorCode.DONATION_PROVIDER_UNAVAILABLE),
      );

      await expectTrpcError(
        callerFor(admin).donations.saveGivebutterConnection({
          apiKey: newKey(provider),
        }),
        "INTERNAL_SERVER_ERROR",
        ErrorCode.DONATION_PROVIDER_UNAVAILABLE,
      );
    });
  });

  describe("removeConnection", () => {
    it("removes the connection and leaves an audit row", async () => {
      const caller = callerFor(admin);
      const saved = await caller.donations.saveGivebutterConnection({
        apiKey: newKey(),
      });

      await expect(
        caller.donations.removeConnection({ connectionId: saved.id }),
      ).resolves.toEqual({ success: true });

      const rows = await auditRows("donation_connection_removed", saved.id);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.actor_id).toBe(admin.id);
      const { connections } = await caller.donations.listConnections();
      expect(connections.map((c) => c.id)).not.toContain(saved.id);
    });

    it("reports an unknown connection as not found", async () => {
      await expectTrpcError(
        callerFor(admin).donations.removeConnection({
          connectionId: randomUUID(),
        }),
        "NOT_FOUND",
        ErrorCode.DONATION_CONNECTION_NOT_FOUND,
      );
    });
  });

  describe("listProviderFunds", () => {
    it("marks an unavailable connection and still returns the others", async () => {
      const caller = callerFor(admin);
      const before = await caller.donations.listConnections();
      for (const c of before.connections) {
        await caller.donations.removeConnection({ connectionId: c.id });
      }

      const healthy = fakeProvider();
      const failing = fakeProvider();
      const good = await caller.donations.saveGivebutterConnection({
        apiKey: newKey(healthy),
      });
      const bad = await caller.donations.saveGivebutterConnection({
        apiKey: newKey(failing),
      });
      healthy.listFunds.mockResolvedValue([
        {
          externalId: "fund-housing",
          code: "HOUSING",
          name: "Emergency Housing",
          raisedMinor: 2500,
          supporters: 1,
        },
      ]);
      failing.listFunds.mockRejectedValue(
        new DonationProviderError(ErrorCode.DONATION_PROVIDER_UNAVAILABLE),
      );

      const result = await callerFor(volunteer).donations.listProviderFunds();

      expect(result.unavailableConnectionIds).toEqual([bad.id]);
      expect(result.funds).toEqual([
        {
          connectionId: good.id,
          externalId: "fund-housing",
          code: "HOUSING",
          name: "Emergency Housing",
          raisedMinor: 2500,
          supporters: 1,
          currency: "USD",
        },
      ]);
    });
  });
});
