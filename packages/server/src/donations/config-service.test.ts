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
      return { orgSchema: testDb.schemaName as OrgSchema, actorId: actor.id };
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

    /**
     * Run a test against an org of its own, so row counts see only what
     * the test saved. The org and its connections are deleted after.
     */
    async function withFreshOrg(
      label: string,
      run: (org: OrgId) => Promise<void>,
    ): Promise<void> {
      const org = orgIdSchema.parse(randomUUID());
      await testDb.platformDb
        .insertInto("orgs")
        .values({
          id: org,
          slug: `donsvc-${label}-${org.slice(0, 8)}` as OrgSlug,
          schema_name: `${testDb.schemaName}_${label}` as OrgSchema,
        })
        .execute();

      try {
        await run(org);
      } finally {
        await testDb.platformDb
          .deleteFrom("donation_connections")
          .where("org_id", "=", org)
          .execute();
        await testDb.platformDb
          .deleteFrom("orgs")
          .where("id", "=", org)
          .execute();
      }
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

      it("saving the same key twice yields one row and one connection id", async () => {
        await withFreshOrg("d", async (org) => {
          const { service } = setup();
          const apiKey = newKey();

          const first = await service.saveGivebutter(org, { apiKey }, audit());
          const second = await service.saveGivebutter(org, { apiKey }, audit());

          expect(second.id).toBe(first.id);
          expect(await connectionCount(org)).toBe(1);
          expect((await service.list(org)).map((c) => c.id)).toEqual([
            first.id,
          ]);
        });
      });

      it("a different key yields a second row", async () => {
        await withFreshOrg("e", async (org) => {
          const { service } = setup();

          const first = await service.saveGivebutter(
            org,
            { apiKey: newKey() },
            audit(),
          );
          const second = await service.saveGivebutter(
            org,
            { apiKey: newKey() },
            audit(),
          );

          expect(second.id).not.toBe(first.id);
          expect(await connectionCount(org)).toBe(2);
        });
      });

      it("a matching key retries webhook registration when the connection has none", async () => {
        await withFreshOrg("f", async (org) => {
          const { service, factory } = setup();
          const provider = fakeProvider();
          provider.registerWebhook.mockRejectedValueOnce(
            new DonationProviderError(ErrorCode.DONATION_PROVIDER_UNAVAILABLE),
          );
          const apiKey = newKey(provider);

          await expect(
            service.saveGivebutter(org, { apiKey }, audit()),
          ).rejects.toBeInstanceOf(DonationProviderError);
          const [stored] = await service.list(org);
          expect(stored?.webhookRegistered).toBe(false);
          const invalidate = vi.spyOn(factory, "invalidate");

          const retried = await service.saveGivebutter(
            org,
            { apiKey },
            audit(),
          );

          expect(retried.id).toBe(stored?.id);
          expect(retried.webhookRegistered).toBe(true);
          expect(provider.registerWebhook).toHaveBeenCalledTimes(2);
          expect(invalidate).toHaveBeenCalledWith(retried.id);
          expect(await connectionCount(org)).toBe(1);
          expect(await service.list(org)).toEqual([
            expect.objectContaining({
              id: retried.id,
              webhookRegistered: true,
            }),
          ]);
        });
      });

      it("a matching key with a registered webhook does not register again", async () => {
        await withFreshOrg("g", async (org) => {
          const { service, factory } = setup();
          const provider = fakeProvider();
          provider.registerWebhook.mockResolvedValueOnce({
            id: "wh_once",
            secret: "secret-once",
          });
          const apiKey = newKey(provider);

          const first = await service.saveGivebutter(org, { apiKey }, audit());
          const invalidate = vi.spyOn(factory, "invalidate");
          const second = await service.saveGivebutter(org, { apiKey }, audit());

          expect(second.id).toBe(first.id);
          expect(second.webhookRegistered).toBe(true);
          expect(provider.registerWebhook).toHaveBeenCalledTimes(1);
          expect(invalidate).toHaveBeenCalledWith(first.id);
          expect(await storedConfig(first.id)).toEqual({
            apiKey,
            webhookId: "wh_once",
            webhookSecret: "secret-once",
          });
          expect(await connectionCount(org)).toBe(1);
        });
      });

      it("a matching key writes an audit row with the existing connection id", async () => {
        const { service } = setup();
        const apiKey = newKey();

        const first = await service.saveGivebutter(orgId, { apiKey }, audit());
        const second = await service.saveGivebutter(orgId, { apiKey }, audit());

        expect(second.id).toBe(first.id);
        expect(await auditRowsFor("donation_connection_saved", first.id)).toBe(
          2,
        );
      });

      it("rolls back the connection when the audit row cannot be written", async () => {
        await withFreshOrg("h", async (org) => {
          const { service } = setup();
          const provider = fakeProvider();

          await expect(
            service.saveGivebutter(
              org,
              { apiKey: newKey(provider) },
              brokenAudit(),
            ),
          ).rejects.toThrow();

          expect(await connectionCount(org)).toBe(0);
          expect(provider.registerWebhook).not.toHaveBeenCalled();
        });
      });

      it("writes exactly one audit row per save", async () => {
        const { service } = setup();

        const first = await service.saveGivebutter(
          orgId,
          { apiKey: newKey() },
          audit(),
        );
        const second = await service.saveGivebutter(
          orgId,
          { apiKey: newKey() },
          audit(),
        );

        expect(await auditRowsFor("donation_connection_saved", first.id)).toBe(
          1,
        );
        expect(await auditRowsFor("donation_connection_saved", second.id)).toBe(
          1,
        );
      });
    });

    /** An audit context whose schema does not exist, so its insert fails. */
    function brokenAudit(): DonationAuditContext {
      return {
        orgSchema: `${testDb.schemaName}_missing` as OrgSchema,
        actorId: actor.id,
      };
    }

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

        expect(provider.deleteWebhook).toHaveBeenCalledTimes(1);
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

      it("keeps the row when the audit row cannot be written", async () => {
        const { service } = setup();
        const provider = fakeProvider();
        const saved = await service.saveGivebutter(
          orgId,
          { apiKey: newKey(provider) },
          audit(),
        );

        await expect(
          service.remove(orgId, saved.id, brokenAudit()),
        ).rejects.toThrow();

        expect((await service.list(orgId)).map((c) => c.id)).toContain(
          saved.id,
        );
        expect(
          await auditRowsFor("donation_connection_removed", saved.id),
        ).toBe(0);
        expect(provider.deleteWebhook).not.toHaveBeenCalled();
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
        await withFreshOrg("c", async (freshOrg) => {
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
        });
      });
    });
  },
);
