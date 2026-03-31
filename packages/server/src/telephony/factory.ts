import type { Kysely } from "kysely";
import type { PlatformDatabase } from "../db/types.js";
import type { SecretsEncryptor } from "../config/secrets.js";
import type { TelephonyProvider } from "./provider.js";
import { providerConfigSchemas } from "./schemas.js";
import { TelephonyConfigError, NotFoundError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";

/**
 * A function that constructs a TelephonyProvider from a validated config object.
 * Each provider module (twilio.ts, signalwire.ts) exports one of these.
 */
export type ProviderConstructor = (config: unknown) => TelephonyProvider;

export interface ProviderFactoryDeps {
  readonly db: Kysely<PlatformDatabase>;
  readonly secretsEncryptor: SecretsEncryptor;
  readonly providerConstructors: ReadonlyMap<string, ProviderConstructor>;
}

export interface ProviderFactory {
  /** Get or create a cached provider instance for an org. */
  getProvider(orgId: string): Promise<TelephonyProvider>;
  /** Invalidate the cached provider for an org (call after config update). */
  invalidate(orgId: string): void;
  /** Invalidate all cached providers (e.g., after OPS_SECRETS_KEY rotation). */
  invalidateAll(): void;
}

export function createProviderFactory(
  deps: ProviderFactoryDeps,
): ProviderFactory {
  const cache = new Map<string, TelephonyProvider>();

  async function buildProvider(orgId: string): Promise<TelephonyProvider> {
    const row = await deps.db
      .selectFrom("telephony_config")
      .selectAll()
      .where("org_id", "=", orgId)
      .executeTakeFirst();

    if (!row) {
      throw new NotFoundError(ErrorCode.TELEPHONY_NOT_CONFIGURED);
    }

    // Decrypt the config blob
    // care-y-ignore-next-line server-no-decrypt -- operational credentials (Twilio config), not E2EE client data. Server must decrypt to make outbound API calls (OPS1 design).
    const plaintext = deps.secretsEncryptor.decrypt(row.config);
    let rawConfig: unknown;
    try {
      rawConfig = JSON.parse(plaintext.toString("utf-8"));
    } catch {
      throw new TelephonyConfigError("Telephony config blob is not valid JSON");
    } finally {
      plaintext.fill(0);
    }

    // Validate against the provider's schema
    const schema = providerConfigSchemas[row.provider];
    if (!schema) {
      throw new TelephonyConfigError(
        `Unknown telephony provider: ${row.provider}`,
      );
    }

    const parseResult = schema.safeParse(rawConfig);
    if (!parseResult.success) {
      throw new TelephonyConfigError(
        `Invalid telephony config for provider ${row.provider}`,
      );
    }

    // Construct the provider instance
    const constructor = deps.providerConstructors.get(row.provider);
    if (!constructor) {
      throw new TelephonyConfigError(
        `No provider implementation registered for: ${row.provider}`,
      );
    }

    return constructor(parseResult.data);
  }

  return {
    async getProvider(orgId: string): Promise<TelephonyProvider> {
      const cached = cache.get(orgId);
      if (cached) return cached;

      const provider = await buildProvider(orgId);
      cache.set(orgId, provider);
      return provider;
    },

    invalidate(orgId: string): void {
      cache.delete(orgId);
    },

    invalidateAll(): void {
      cache.clear();
    },
  };
}
