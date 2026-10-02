/**
 * DonationConnectionService: owns the donation_connections rows, their
 * sealed config blobs, and the relay of provider fund totals.
 *
 * A connection's blob holds the provider API key and, once registered, the
 * provider's webhook id and signing secret, sealed under OPS_SECRETS_KEY.
 * The server needs the key in the clear to call the provider, so it
 * decrypts here; the plaintext buffer is zeroed after each parse.
 *
 * Routes (routes/donations.ts, routes/donation-webhooks.ts) delegate here.
 */

import { randomUUID } from "node:crypto";
import type { Kysely } from "kysely";
import {
  ErrorCode,
  donationConnectionIdSchema,
  inflowProviderIdSchema,
  type DonationConnectionId,
  type DonationConnectionWire,
  type InflowProviderId,
  type OrgId,
  type ProviderFundListWire,
  type ProviderFundWire,
  type SaveGivebutterConnectionInput,
  type UserId,
} from "@care-y/shared";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import type { SecretsEncryptor } from "../config/secrets.js";
import {
  DonationProviderError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "../errors.js";
import type { InflowProviderFactory } from "./factory.js";
import type { ProviderFundCache } from "./fund-cache.js";
import type { InflowProvider, InflowProviderConstructor } from "./provider.js";
import {
  connectionSecretsSchema,
  providerConfigSchemas,
  type ConnectionSecrets,
} from "./schemas.js";

export interface DonationConnectionServiceDeps {
  readonly db: Kysely<PlatformDatabase>;
  readonly secretsEncryptor: SecretsEncryptor;
  readonly factory: InflowProviderFactory;
  /** Used to check a key before any row exists for the factory to read. */
  readonly providerConstructors: ReadonlyMap<
    InflowProviderId,
    InflowProviderConstructor
  >;
  readonly fundCache: ProviderFundCache;
  /** Public origin the provider posts webhooks to, e.g. https://care-y.app */
  readonly webhookBaseUrl: string;
}

/** Who made a change, and the tenant database their audit row goes to. */
export interface DonationAuditContext {
  readonly tenantDb: Kysely<TenantDatabase>;
  readonly actorId: UserId;
}

export interface DonationConnectionService {
  /** The org's connections, oldest first, with a hint of each key. */
  list(orgId: OrgId): Promise<DonationConnectionWire[]>;

  /**
   * Check a Givebutter key against the provider, store it, then register
   * the donation webhook. A refused or unreachable key stores nothing. A
   * webhook registration failure leaves the connection saved without a
   * webhook and rethrows.
   */
  saveGivebutter(
    orgId: OrgId,
    input: SaveGivebutterConnectionInput,
    audit: DonationAuditContext,
  ): Promise<DonationConnectionWire>;

  /**
   * Remove a connection. Deleting its webhook at the provider is best
   * effort and never blocks the removal.
   */
  remove(
    orgId: OrgId,
    connectionId: DonationConnectionId,
    audit: DonationAuditContext,
  ): Promise<void>;

  /**
   * Funds across the org's connections, through the relay cache. A
   * connection whose provider refuses or cannot be reached is listed as
   * unavailable instead of failing the whole list.
   */
  listProviderFunds(orgId: OrgId): Promise<ProviderFundListWire>;

  /**
   * The webhook signing secret for a connection in the org, or null when
   * the connection does not exist, belongs to another org, or has none.
   */
  lookupWebhookSecret(
    orgId: OrgId,
    connectionId: DonationConnectionId,
  ): Promise<string | null>;

  /**
   * For org erasure: delete the provider-side webhook of every connection
   * the org holds and drop the cached providers and totals. Best effort
   * per connection; a failure is logged without detail and the next one
   * is tried. Never throws, and leaves the rows for the caller to delete.
   */
  removeWebhooksForOrg(orgId: OrgId): Promise<void>;
}

export function createDonationConnectionService(
  deps: DonationConnectionServiceDeps,
): DonationConnectionService {
  const { db, secretsEncryptor, factory, fundCache } = deps;
  const webhookBase = deps.webhookBaseUrl.endsWith("/")
    ? deps.webhookBaseUrl.slice(0, -1)
    : deps.webhookBaseUrl;

  /** Seal a config object, zeroing the plaintext buffer after. */
  function sealConfig(config: ConnectionSecrets): Buffer {
    const plaintext = Buffer.from(JSON.stringify(config), "utf-8");
    try {
      return secretsEncryptor.encrypt(plaintext);
    } finally {
      plaintext.fill(0);
    }
  }

  /**
   * Open a stored blob and check it against its provider's schema. The
   * provider column is unconstrained, so it is re-narrowed first.
   */
  function openConfig(provider: string, sealed: Buffer): ConnectionSecrets {
    const providerId = inflowProviderIdSchema.safeParse(provider);
    if (!providerId.success) {
      throw new InternalError("Donation connection has an unknown provider");
    }

    // care-y-ignore-next-line server-no-decrypt -- operational credentials (donation provider API key), not E2EE client data. Server must decrypt to make outbound API calls (OPS1 design).
    const plaintext = secretsEncryptor.decrypt(sealed);
    let raw: unknown;
    try {
      raw = JSON.parse(plaintext.toString("utf-8"));
    } catch {
      throw new InternalError("Donation connection config is not valid JSON");
    } finally {
      plaintext.fill(0);
    }

    if (!providerConfigSchemas[providerId.data].safeParse(raw).success) {
      throw new InternalError(
        `Invalid donation connection config for provider ${providerId.data}`,
      );
    }
    const secrets = connectionSecretsSchema.safeParse(raw);
    if (!secrets.success) {
      throw new InternalError("Donation connection config is missing its key");
    }
    return secrets.data;
  }

  function toWire(row: {
    id: DonationConnectionId;
    provider: InflowProviderId;
    created_at: Date;
    config: ConnectionSecrets;
  }): DonationConnectionWire {
    return {
      id: row.id,
      provider: row.provider,
      keyHint: row.config.apiKey.slice(-4),
      webhookRegistered: row.config.webhookId !== undefined,
      createdAt: row.created_at.toISOString(),
    };
  }

  function constructorFor(
    provider: InflowProviderId,
  ): InflowProviderConstructor {
    const construct = deps.providerConstructors.get(provider);
    if (!construct) {
      throw new InternalError(
        `No donation provider implementation registered for: ${provider}`,
      );
    }
    return construct;
  }

  /** The connection's provider, refusing a connection of another org. */
  async function providerFor(
    orgId: OrgId,
    connectionId: DonationConnectionId,
  ): Promise<InflowProvider> {
    const resolved = await factory.getProvider(connectionId);
    if (resolved.orgId !== orgId) {
      throw new NotFoundError(ErrorCode.DONATION_CONNECTION_NOT_FOUND);
    }
    return resolved.provider;
  }

  /** Remove a webhook at the provider without letting a failure escape. */
  async function deleteWebhookQuietly(
    provider: InflowProvider,
    webhookId: string,
  ): Promise<void> {
    try {
      await provider.deleteWebhook(webhookId);
    } catch (_deleteErr: unknown) {
      // The provider's answer can quote the request, so none of it is
      // logged. The webhook then stays at the provider and fails our
      // signature check on every delivery until removed there.
      console.warn("Could not remove a donation provider webhook");
    }
  }

  return {
    async list(orgId: OrgId): Promise<DonationConnectionWire[]> {
      const rows = await db
        .selectFrom("donation_connections")
        .select(["id", "provider", "config", "created_at"])
        .where("org_id", "=", orgId)
        .orderBy("created_at", "asc")
        .orderBy("id", "asc")
        .execute();

      return rows.map((row) =>
        toWire({
          id: row.id,
          provider: row.provider,
          created_at: row.created_at,
          config: openConfig(row.provider, row.config),
        }),
      );
    },

    async saveGivebutter(
      orgId: OrgId,
      input: SaveGivebutterConnectionInput,
      audit: DonationAuditContext,
    ): Promise<DonationConnectionWire> {
      const provider: InflowProviderId = "givebutter";
      let config: ConnectionSecrets = { apiKey: input.apiKey };

      // Credential check: one read before anything is stored. A refused
      // key surfaces as DONATION_PROVIDER_REJECTED.
      const candidate = constructorFor(provider)(config);
      await candidate.listFunds();

      const connectionId = donationConnectionIdSchema.parse(randomUUID());
      const inserted = await db
        .insertInto("donation_connections")
        .values({
          id: connectionId,
          org_id: orgId,
          provider,
          config: sealConfig(config),
        })
        .returning(["created_at"])
        .executeTakeFirstOrThrow();

      // The connection row lives in the platform database and the audit
      // log in the org's tenant schema, so the two cannot share one
      // transaction. The audit row is written as soon as the platform
      // write has succeeded; a failure between the two would leave the
      // connection without its audit row, and it is not retried here.
      await audit.tenantDb
        .insertInto("audit_log")
        .values({
          event_type: "donation_connection_saved",
          actor_id: audit.actorId,
          ticket_id: null,
          metadata: { connectionId, provider },
        })
        .execute();

      const registered = await candidate.registerWebhook(
        `${webhookBase}/webhooks/givebutter/${orgId}/${connectionId}`,
      );
      if (registered.secret === null) {
        // Without the secret no delivery can be checked, so a webhook
        // that reported none is removed rather than left half working.
        await deleteWebhookQuietly(candidate, registered.id);
        throw new DonationProviderError(
          ErrorCode.DONATION_PROVIDER_UNAVAILABLE,
        );
      }

      config = {
        ...config,
        webhookId: registered.id,
        webhookSecret: registered.secret,
      };
      try {
        await db
          .updateTable("donation_connections")
          .set({ config: sealConfig(config), updated_at: new Date() })
          .where("id", "=", connectionId)
          .execute();
      } catch (err: unknown) {
        // The stored blob does not know about this webhook, so nothing
        // would ever remove it. Take it down before reporting the failure.
        await deleteWebhookQuietly(candidate, registered.id);
        throw err;
      }
      factory.invalidate(connectionId);

      return toWire({
        id: connectionId,
        provider,
        created_at: inserted.created_at,
        config,
      });
    },

    async remove(
      orgId: OrgId,
      connectionId: DonationConnectionId,
      audit: DonationAuditContext,
    ): Promise<void> {
      const row = await db
        .selectFrom("donation_connections")
        .select(["provider", "config"])
        .where("id", "=", connectionId)
        .where("org_id", "=", orgId)
        .executeTakeFirst();
      if (!row) {
        throw new NotFoundError(ErrorCode.DONATION_CONNECTION_NOT_FOUND);
      }

      const config = openConfig(row.provider, row.config);
      if (config.webhookId !== undefined) {
        try {
          const provider = await providerFor(orgId, connectionId);
          await deleteWebhookQuietly(provider, config.webhookId);
        } catch (_buildErr: unknown) {
          console.warn(
            "Could not build a donation provider to remove its webhook",
          );
        }
      }

      await db
        .deleteFrom("donation_connections")
        .where("id", "=", connectionId)
        .where("org_id", "=", orgId)
        .execute();

      // Platform row and tenant audit log cannot share a transaction; the
      // audit row follows the delete as in saveGivebutter.
      await audit.tenantDb
        .insertInto("audit_log")
        .values({
          event_type: "donation_connection_removed",
          actor_id: audit.actorId,
          ticket_id: null,
          metadata: { connectionId, provider: row.provider },
        })
        .execute();

      factory.invalidate(connectionId);
      fundCache.invalidate(connectionId);
    },

    async listProviderFunds(orgId: OrgId): Promise<ProviderFundListWire> {
      const rows = await db
        .selectFrom("donation_connections")
        .select("id")
        .where("org_id", "=", orgId)
        .orderBy("created_at", "asc")
        .orderBy("id", "asc")
        .execute();

      const results = await Promise.all(
        rows.map(async ({ id }) => {
          try {
            const funds = await fundCache.get(id, async () =>
              (await providerFor(orgId, id)).listFunds(),
            );
            return { id, funds };
          } catch (err: unknown) {
            // A refused key or an unreachable provider affects only this
            // connection. Anything else is a fault here and is rethrown.
            if (
              err instanceof DonationProviderError ||
              err instanceof ForbiddenError
            ) {
              return { id, funds: null };
            }
            throw err;
          }
        }),
      );

      const funds: ProviderFundWire[] = [];
      const unavailableConnectionIds: DonationConnectionId[] = [];
      for (const result of results) {
        if (result.funds === null) {
          unavailableConnectionIds.push(result.id);
          continue;
        }
        for (const fund of result.funds) {
          funds.push({
            connectionId: result.id,
            externalId: fund.externalId,
            code: fund.code,
            name: fund.name,
            raisedMinor: fund.raisedMinor,
            supporters: fund.supporters,
            currency: "USD",
          });
        }
      }
      return { funds, unavailableConnectionIds };
    },

    async lookupWebhookSecret(
      orgId: OrgId,
      connectionId: DonationConnectionId,
    ): Promise<string | null> {
      const row = await db
        .selectFrom("donation_connections")
        .select(["provider", "config"])
        .where("id", "=", connectionId)
        .where("org_id", "=", orgId)
        .executeTakeFirst();
      if (!row) return null;
      return openConfig(row.provider, row.config).webhookSecret ?? null;
    },

    async removeWebhooksForOrg(orgId: OrgId): Promise<void> {
      let rows: {
        id: DonationConnectionId;
        provider: InflowProviderId;
        config: Buffer;
      }[];
      try {
        rows = await db
          .selectFrom("donation_connections")
          .select(["id", "provider", "config"])
          .where("org_id", "=", orgId)
          .execute();
      } catch (_listErr: unknown) {
        console.warn("Could not list donation connections to remove webhooks");
        return;
      }

      for (const row of rows) {
        try {
          const { webhookId } = openConfig(row.provider, row.config);
          if (webhookId !== undefined) {
            const provider = await providerFor(orgId, row.id);
            await deleteWebhookQuietly(provider, webhookId);
          }
        } catch (_buildErr: unknown) {
          console.warn(
            "Could not build a donation provider to remove its webhook",
          );
        }
        factory.invalidate(row.id);
        fundCache.invalidate(row.id);
      }
    },
  };
}
