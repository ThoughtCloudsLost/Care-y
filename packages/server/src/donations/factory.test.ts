/**
 * DB integration tests for the inflow provider factory: rows sealed with
 * the real secrets encryptor, opened and handed to a stub constructor.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import {
  ErrorCode,
  donationConnectionIdSchema,
  orgIdSchema,
  type DonationConnectionId,
  type OrgId,
  type OrgSchema,
  type OrgSlug,
  type InflowProviderId,
} from "@care-y/shared";
import { createTestDb, TEST_OPS_KEY, type TestDb } from "../test-utils.js";
import {
  createSecretsEncryptor,
  deriveSecretsKey,
  type SecretsEncryptor,
} from "../config/secrets.js";
import { InternalError, NotFoundError } from "../errors.js";
import { createInflowProviderFactory } from "./factory.js";
import type { InflowProvider, InflowProviderConstructor } from "./provider.js";

function stubProvider(): InflowProvider {
  return {
    listFunds: vi.fn(async () => []),
    registerWebhook: vi.fn(async () => ({ id: "wh", secret: "s" })),
    deleteWebhook: vi.fn(async () => undefined),
  };
}

describe.skipIf(!process.env.DATABASE_URL)(
  "createInflowProviderFactory (DB integration)",
  () => {
    let testDb: TestDb;
    let encryptor: SecretsEncryptor;
    const orgId: OrgId = orgIdSchema.parse(randomUUID());

    beforeAll(async () => {
      testDb = await createTestDb();
      encryptor = createSecretsEncryptor(deriveSecretsKey(TEST_OPS_KEY));
      await testDb.platformDb
        .insertInto("orgs")
        .values({
          id: orgId,
          slug: `donfac-${orgId.slice(0, 8)}` as OrgSlug,
          schema_name: testDb.schemaName as OrgSchema,
        })
        .execute();
    });

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

    async function insertConnection(
      config: Buffer,
    ): Promise<DonationConnectionId> {
      const row = await testDb.platformDb
        .insertInto("donation_connections")
        .values({ org_id: orgId, provider: "givebutter", config })
        .returning("id")
        .executeTakeFirstOrThrow();
      return row.id;
    }

    function seal(value: unknown): Buffer {
      return encryptor.encrypt(Buffer.from(JSON.stringify(value), "utf-8"));
    }

    function build(
      construct: InflowProviderConstructor,
    ): ReturnType<typeof createInflowProviderFactory> {
      return createInflowProviderFactory({
        db: testDb.platformDb,
        secretsEncryptor: encryptor,
        providerConstructors: new Map<
          InflowProviderId,
          InflowProviderConstructor
        >([["givebutter", construct]]),
      });
    }

    it("opens the sealed config and returns the owning org", async () => {
      const config = {
        apiKey: "gb-factory-key-0001",
        webhookId: "wh_1",
        webhookSecret: "secret-1",
      };
      const id = await insertConnection(seal(config));
      const provider = stubProvider();
      const construct = vi.fn<InflowProviderConstructor>(() => provider);

      const resolved = await build(construct).getProvider(id);

      expect(resolved).toEqual({ orgId, provider });
      expect(construct).toHaveBeenCalledWith(config);
    });

    it("caches per connection until invalidated", async () => {
      const id = await insertConnection(
        seal({ apiKey: "gb-factory-key-0002" }),
      );
      const construct = vi.fn<InflowProviderConstructor>(() => stubProvider());
      const factory = build(construct);

      const first = await factory.getProvider(id);
      expect(await factory.getProvider(id)).toBe(first);
      expect(construct).toHaveBeenCalledTimes(1);

      factory.invalidate(id);
      await factory.getProvider(id);
      expect(construct).toHaveBeenCalledTimes(2);

      factory.invalidateAll();
      await factory.getProvider(id);
      expect(construct).toHaveBeenCalledTimes(3);
    });

    it("reports a missing connection as not found", async () => {
      const factory = build(() => stubProvider());

      await expect(
        factory.getProvider(donationConnectionIdSchema.parse(randomUUID())),
      ).rejects.toThrow(
        new NotFoundError(ErrorCode.DONATION_CONNECTION_NOT_FOUND),
      );
    });

    it("refuses a blob that is not JSON", async () => {
      const id = await insertConnection(
        encryptor.encrypt(Buffer.from("not json", "utf-8")),
      );

      await expect(
        build(() => stubProvider()).getProvider(id),
      ).rejects.toBeInstanceOf(InternalError);
    });

    it("refuses a blob without an API key", async () => {
      const id = await insertConnection(seal({ webhookId: "wh" }));

      await expect(
        build(() => stubProvider()).getProvider(id),
      ).rejects.toBeInstanceOf(InternalError);
    });

    it("refuses a provider with no registered constructor", async () => {
      const id = await insertConnection(
        seal({ apiKey: "gb-factory-key-0003" }),
      );
      const factory = createInflowProviderFactory({
        db: testDb.platformDb,
        secretsEncryptor: encryptor,
        providerConstructors: new Map<
          InflowProviderId,
          InflowProviderConstructor
        >(),
      });

      await expect(factory.getProvider(id)).rejects.toBeInstanceOf(
        InternalError,
      );
    });
  },
);
