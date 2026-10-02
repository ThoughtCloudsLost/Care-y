/**
 * DB integration tests for DonationConnectionService. Connection rows are
 * sealed and opened with the real secrets encryptor; the provider itself
 * is a stub chosen by API key, so no request leaves the test.
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
  donationConnectionIdSchema,
  orgIdSchema,
  type DonationConnectionId,
  type InflowProviderId,
  type OrgId,
  type OrgSchema,
  type OrgSlug,
} from "@care-y/shared";
import {
  createTestDb,
  createTestUser,
  TEST_OPS_KEY,
  type TestDb,
} from "../test-utils.js";
import type { UsersTable } from "../db/types.js";
import {
  createSecretsEncryptor,
  deriveSecretsKey,
  type SecretsEncryptor,
} from "../config/secrets.js";
import {
  DonationProviderError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "../errors.js";
import { createInflowProviderFactory } from "./factory.js";
import { createProviderFundCache } from "./fund-cache.js";
import {
  createDonationConnectionService,
  type DonationAuditContext,
  type DonationConnectionService,
} from "./config-service.js";
import type {
  InflowProvider,
  InflowProviderConstructor,
  ProviderFund,
} from "./provider.js";
import { givebutterConfigSchema } from "./schemas.js";

const WEBHOOK_BASE = "https://care-y.example";

interface FakeProvider extends InflowProvider {
  readonly listFunds: Mock<InflowProvider["listFunds"]>;
  readonly registerWebhook: Mock<InflowProvider["registerWebhook"]>;
  readonly deleteWebhook: Mock<InflowProvider["deleteWebhook"]>;
}

function fakeProvider(funds: readonly ProviderFund[] = []): FakeProvider {
  return {
    listFunds: vi.fn<InflowProvider["listFunds"]>().mockResolvedValue(funds),
    registerWebhook: vi
      .fn<InflowProvider["registerWebhook"]>()
      .mockResolvedValue({ id: `wh_${randomUUID()}`, secret: "wh-secret" }),
    deleteWebhook: vi
      .fn<InflowProvider["deleteWebhook"]>()
      .mockResolvedValue(undefined),
  };
}

describe.skipIf(!process.env.DATABASE_URL)(
  "DonationConnectionService (DB integration)",
  () => {
    let testDb: TestDb;
    let encryptor: SecretsEncryptor;
    let actor: Selectable<UsersTable>;
    const orgId: OrgId = orgIdSchema.parse(randomUUID());
    const otherOrgId: OrgId = orgIdSchema.parse(randomUUID());

    // Each test registers the fake for the key it saves.
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

    beforeAll(async () => {
      testDb = await createTestDb();
      encryptor = createSecretsEncryptor(deriveSecretsKey(TEST_OPS_KEY));
      actor = await createTestUser(testDb.db);
      for (const [id, label] of [
        [orgId, "a"],
        [otherOrgId, "b"],
      ] as const) {
        await testDb.platformDb
          .insertInto("orgs")
          .values({
            id,
            slug: `donsvc-${label}-${id.slice(0, 8)}` as OrgSlug,
            schema_name: `${testDb.schemaName}_${label}` as OrgSchema,
          })
          .execute();
      }
    });

    afterAll(async () => {
      for (const id of [orgId, otherOrgId]) {
        await testDb.platformDb
          .deleteFrom("donation_connections")
          .where("org_id", "=", id)
          .execute();
        await testDb.platformDb
          .deleteFrom("orgs")
          .where("id", "=", id)
          .execute();
      }
      await testDb.cleanup();
    });

    function setup(): {
      service: DonationConnectionService;
      factory: ReturnType<typeof createInflowProviderFactory>;
      cache: ReturnType<typeof createProviderFundCache>;
    } {
      const factory = createInflowProviderFactory({
        db: testDb.platformDb,
        secretsEncryptor: encryptor,
        providerConstructors: constructors,
      });
      const cache = createProviderFundCache({ ttlMs: 45_000 });
      const service = createDonationConnectionService({
        db: testDb.platformDb,
        secretsEncryptor: encryptor,
        factory,
        providerConstructors: constructors,
        fundCache: cache,
        webhookBaseUrl: `${WEBHOOK_BASE}/`,
      });
      return { service, factory, cache };
    }

    function audit(): DonationAuditContext {
      return { tenantDb: testDb.db, actorId: actor.id };
    }

    /** A fresh API key with a fake provider behind it. */
    function newKey(provider: FakeProvider = fakeProvider()): string {
      const key = `gb-key-${randomUUID()}`;
      providersByKey.set(key, provider);
      return key;
    }

    async function storedConfig(id: DonationConnectionId): Promise<unknown> {
      const row = await testDb.platformDb
        .selectFrom("donation_connections")
        .select("config")
        .where("id", "=", id)
        .executeTakeFirstOrThrow();
      // care-y-ignore-next-line server-no-decrypt -- test reads back the sealed operational config it just wrote
      const plaintext = encryptor.decrypt(row.config);
      return JSON.parse(plaintext.toString("utf-8"));
    }

    async function auditRowsFor(
      eventType: string,
      connectionId: string,
    ): Promise<number> {
      const rows = await testDb.db
        .selectFrom("audit_log")
        .select("metadata")
        .where("event_type", "=", eventType)
        .execute();
      return rows.filter((r) => r.metadata.connectionId === connectionId)
        .length;
    }

    async function connectionCount(org: OrgId): Promise<number> {
      const rows = await testDb.platformDb
        .selectFrom("donation_connections")
        .select("id")
        .where("org_id", "=", org)
        .execute();
      return rows.length;
    }

    describe("saveGivebutter", () => {
      it("checks the key, seals it with the webhook, and audits", async () => {
        const { service } = setup();
        const provider = fakeProvider();
        provider.registerWebhook.mockResolvedValueOnce({
          id: "wh_saved",
          secret: "secret-saved",
        });
        const apiKey = newKey(provider);

        const wire = await service.saveGivebutter(orgId, { apiKey }, audit());

        expect(provider.listFunds).toHaveBeenCalledTimes(1);
        expect(provider.registerWebhook).toHaveBeenCalledWith(
          `${WEBHOOK_BASE}/webhooks/givebutter/${orgId}/${wire.id}`,
        );
        expect(wire).toMatchObject({
          provider: "givebutter",
          keyHint: apiKey.slice(-4),
          webhookRegistered: true,
        });
        expect(await storedConfig(wire.id)).toEqual({
          apiKey,
          webhookId: "wh_saved",
          webhookSecret: "secret-saved",
        });
        expect(await auditRowsFor("donation_connection_saved", wire.id)).toBe(
          1,
        );
      });

      it("stores nothing when the provider refuses the key", async () => {
        const { service } = setup();
        const provider = fakeProvider();
        provider.listFunds.mockRejectedValueOnce(
          new ForbiddenError(ErrorCode.DONATION_PROVIDER_REJECTED),
        );
        const before = await connectionCount(orgId);

        await expect(
          service.saveGivebutter(orgId, { apiKey: newKey(provider) }, audit()),
        ).rejects.toThrow(ErrorCode.DONATION_PROVIDER_REJECTED);

        expect(await connectionCount(orgId)).toBe(before);
        expect(provider.registerWebhook).not.toHaveBeenCalled();
      });

      it("keeps the connection without a webhook when registration fails", async () => {
        const { service } = setup();
        const provider = fakeProvider();
        provider.registerWebhook.mockRejectedValueOnce(
          new DonationProviderError(ErrorCode.DONATION_PROVIDER_UNAVAILABLE),
        );
        const apiKey = newKey(provider);

        await expect(
          service.saveGivebutter(orgId, { apiKey }, audit()),
        ).rejects.toBeInstanceOf(DonationProviderError);

        const saved = (await service.list(orgId)).find(
          (c) => c.keyHint === apiKey.slice(-4),
        );
        expect(saved?.webhookRegistered).toBe(false);
        if (saved !== undefined) {
          expect(
            await auditRowsFor("donation_connection_saved", saved.id),
          ).toBe(1);
        }
      });

      it("removes a webhook that came back without a secret", async () => {
        const { service } = setup();
        const provider = fakeProvider();
        provider.registerWebhook.mockResolvedValueOnce({
          id: "wh_nosecret",
          secret: null,
        });
        const apiKey = newKey(provider);

        await expect(
          service.saveGivebutter(orgId, { apiKey }, audit()),
        ).rejects.toThrow(ErrorCode.DONATION_PROVIDER_UNAVAILABLE);

        expect(provider.deleteWebhook).toHaveBeenCalledWith("wh_nosecret");
        const saved = (await service.list(orgId)).find(
          (c) => c.keyHint === apiKey.slice(-4),
        );
        expect(saved?.webhookRegistered).toBe(false);
      });
    });

    describe("list", () => {
      it("lists only the org's own connections", async () => {
        const { service } = setup();
        const mine = await service.saveGivebutter(
          orgId,
          { apiKey: newKey() },
          audit(),
        );
        const theirs = await service.saveGivebutter(
          otherOrgId,
          { apiKey: newKey() },
          audit(),
        );

        const ids = (await service.list(orgId)).map((c) => c.id);
        expect(ids).toContain(mine.id);
        expect(ids).not.toContain(theirs.id);
      });
    });

    describe("remove", () => {
      it("deletes the webhook and the row, audits, and invalidates", async () => {
        const { service, factory, cache } = setup();
        const provider = fakeProvider();
        provider.registerWebhook.mockResolvedValueOnce({
          id: "wh_remove",
          secret: "s",
        });
        const saved = await service.saveGivebutter(
          orgId,
          { apiKey: newKey(provider) },
          audit(),
        );
        const invalidateFactory = vi.spyOn(factory, "invalidate");
        const invalidateCache = vi.spyOn(cache, "invalidate");

        await service.remove(orgId, saved.id, audit());

        expect(provider.deleteWebhook).toHaveBeenCalledWith("wh_remove");
        expect((await service.list(orgId)).map((c) => c.id)).not.toContain(
          saved.id,
        );
        expect(invalidateFactory).toHaveBeenCalledWith(saved.id);
        expect(invalidateCache).toHaveBeenCalledWith(saved.id);
        expect(
          await auditRowsFor("donation_connection_removed", saved.id),
        ).toBe(1);
      });

      it("still removes the row when the provider cannot delete the webhook", async () => {
        const { service } = setup();
        const provider = fakeProvider();
        provider.deleteWebhook.mockRejectedValueOnce(
          new DonationProviderError(ErrorCode.DONATION_PROVIDER_UNAVAILABLE),
        );
        const saved = await service.saveGivebutter(
          orgId,
          { apiKey: newKey(provider) },
          audit(),
        );
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {
          /* silenced */
        });

        try {
          await service.remove(orgId, saved.id, audit());
        } finally {
          warn.mockRestore();
        }

        expect((await service.list(orgId)).map((c) => c.id)).not.toContain(
          saved.id,
        );
      });

      it("treats another org's connection as not found", async () => {
        const { service } = setup();
        const theirs = await service.saveGivebutter(
          otherOrgId,
          { apiKey: newKey() },
          audit(),
        );

        await expect(service.remove(orgId, theirs.id, audit())).rejects.toThrow(
          new NotFoundError(ErrorCode.DONATION_CONNECTION_NOT_FOUND),
        );
        expect((await service.list(otherOrgId)).map((c) => c.id)).toContain(
          theirs.id,
        );
      });
    });

    describe("lookupWebhookSecret", () => {
      it("returns the secret for the org's own connection only", async () => {
        const { service } = setup();
        const provider = fakeProvider();
        provider.registerWebhook.mockResolvedValueOnce({
          id: "wh_lookup",
          secret: "secret-lookup",
        });
        const saved = await service.saveGivebutter(
          orgId,
          { apiKey: newKey(provider) },
          audit(),
        );

        expect(await service.lookupWebhookSecret(orgId, saved.id)).toBe(
          "secret-lookup",
        );
        expect(await service.lookupWebhookSecret(otherOrgId, saved.id)).toBe(
          null,
        );
        expect(
          await service.lookupWebhookSecret(
            orgId,
            donationConnectionIdSchema.parse(randomUUID()),
          ),
        ).toBe(null);
      });
    });

    describe("listProviderFunds", () => {
      it("marks a failing connection unavailable and returns the rest", async () => {
        const freshOrg = orgIdSchema.parse(randomUUID());
        await testDb.platformDb
          .insertInto("orgs")
          .values({
            id: freshOrg,
            slug: `donsvc-c-${freshOrg.slice(0, 8)}` as OrgSlug,
            schema_name: `${testDb.schemaName}_c` as OrgSchema,
          })
          .execute();

        try {
          const { service } = setup();
          const healthy = fakeProvider();
          const failing = fakeProvider();
          const good = await service.saveGivebutter(
            freshOrg,
            { apiKey: newKey(healthy) },
            audit(),
          );
          const bad = await service.saveGivebutter(
            freshOrg,
            { apiKey: newKey(failing) },
            audit(),
          );
          healthy.listFunds.mockResolvedValue([
            {
              externalId: "fund-gas",
              code: "GAS",
              name: "Gas Cards",
              raisedMinor: 1500,
              supporters: 2,
            },
          ]);
          failing.listFunds.mockRejectedValue(
            new DonationProviderError(ErrorCode.DONATION_PROVIDER_UNAVAILABLE),
          );

          const result = await service.listProviderFunds(freshOrg);

          expect(result).toEqual({
            funds: [
              {
                connectionId: good.id,
                externalId: "fund-gas",
                code: "GAS",
                name: "Gas Cards",
                raisedMinor: 1500,
                supporters: 2,
                currency: "USD",
              },
            ],
            unavailableConnectionIds: [bad.id],
          });
        } finally {
          await testDb.platformDb
            .deleteFrom("donation_connections")
            .where("org_id", "=", freshOrg)
            .execute();
          await testDb.platformDb
            .deleteFrom("orgs")
            .where("id", "=", freshOrg)
            .execute();
        }
      });
    });
  },
);
