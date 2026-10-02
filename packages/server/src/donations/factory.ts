/**
 * Builds and caches one donation provider instance per connection row.
 *
 * Mirrors the telephony provider factory, keyed by connection id rather
 * than org id because an org may connect several providers.
 */

import type { Kysely } from "kysely";
import {
  ErrorCode,
  inflowProviderIdSchema,
  type DonationConnectionId,
  type InflowProviderId,
  type OrgId,
} from "@care-y/shared";
import type { PlatformDatabase } from "../db/types.js";
import type { SecretsEncryptor } from "../config/secrets.js";
import { InternalError, NotFoundError } from "../errors.js";
import type { InflowProvider, InflowProviderConstructor } from "./provider.js";
import { providerConfigSchemas } from "./schemas.js";

export interface InflowProviderFactoryDeps {
  readonly db: Kysely<PlatformDatabase>;
  readonly secretsEncryptor: SecretsEncryptor;
  readonly providerConstructors: ReadonlyMap<
    InflowProviderId,
    InflowProviderConstructor
  >;
}

/** A provider with the org that owns its connection, for the caller to check. */
export interface ResolvedInflowProvider {
  readonly orgId: OrgId;
  readonly provider: InflowProvider;
}

export interface InflowProviderFactory {
  /**
   * Get or build the provider for a connection. Throws
   * NotFoundError(DONATION_CONNECTION_NOT_FOUND) when no row exists.
   */
  getProvider(
    connectionId: DonationConnectionId,
  ): Promise<ResolvedInflowProvider>;
  /** Drop the cached instance (after the connection's config changes). */
  invalidate(connectionId: DonationConnectionId): void;
  /** Drop every cached instance (after OPS_SECRETS_KEY rotation). */
  invalidateAll(): void;
}

export function createInflowProviderFactory(
  deps: InflowProviderFactoryDeps,
): InflowProviderFactory {
  const cache = new Map<DonationConnectionId, ResolvedInflowProvider>();

  async function build(
    connectionId: DonationConnectionId,
  ): Promise<ResolvedInflowProvider> {
    const row = await deps.db
      .selectFrom("donation_connections")
      .select(["org_id", "provider", "config"])
      .where("id", "=", connectionId)
      .executeTakeFirst();

    if (!row) {
      throw new NotFoundError(ErrorCode.DONATION_CONNECTION_NOT_FOUND);
    }

    // The column is unconstrained, so re-narrow before indexing the
    // registries; an unknown provider fails closed.
    const provider = inflowProviderIdSchema.safeParse(row.provider);
    if (!provider.success) {
      throw new InternalError("Donation connection has an unknown provider");
    }

    // care-y-ignore-next-line server-no-decrypt -- operational credentials (donation provider API key), not E2EE client data. Server must decrypt to make outbound API calls (OPS1 design).
    const plaintext = deps.secretsEncryptor.decrypt(row.config);
    let rawConfig: unknown;
    try {
      rawConfig = JSON.parse(plaintext.toString("utf-8"));
    } catch {
      throw new InternalError("Donation connection config is not valid JSON");
    } finally {
      plaintext.fill(0);
    }

    const parsed = providerConfigSchemas[provider.data].safeParse(rawConfig);
    if (!parsed.success) {
      throw new InternalError(
        `Invalid donation connection config for provider ${provider.data}`,
      );
    }

    const construct = deps.providerConstructors.get(provider.data);
    if (!construct) {
      throw new InternalError(
        `No donation provider implementation registered for: ${provider.data}`,
      );
    }

    return { orgId: row.org_id, provider: construct(parsed.data) };
  }

  return {
    async getProvider(
      connectionId: DonationConnectionId,
    ): Promise<ResolvedInflowProvider> {
      const cached = cache.get(connectionId);
      if (cached) return cached;

      const resolved = await build(connectionId);
      cache.set(connectionId, resolved);
      return resolved;
    },

    invalidate(connectionId: DonationConnectionId): void {
      cache.delete(connectionId);
    },

    invalidateAll(): void {
      cache.clear();
    },
  };
}
