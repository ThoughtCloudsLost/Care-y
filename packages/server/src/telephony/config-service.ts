/**
 * TelephonyConfigService: owns DB queries and encryption for telephony_config.
 *
 * Routes (telephony-admin.ts, webhooks.ts) delegate to this service.
 * The service handles config encryption, decryption, upsert, and lookup.
 */

import { getEnv } from "../env.js";
import type { Kysely } from "kysely";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import type { SecretsEncryptor } from "../config/secrets.js";
import type { ProviderFactory } from "./factory.js";
import type {
  TelephonyProviderStatic,
  MaskedTelephonyConfig,
} from "./provider.js";
import { NotFoundError, TelephonyConfigError } from "../errors.js";
import { providerConfigSchemas } from "./schemas.js";
import { z } from "zod";
import { ErrorCode } from "@care-y/shared";

/** Type guard for objects with a phoneNumbers array. */
function hasPhoneNumbers(
  config: unknown,
): config is { phoneNumbers: readonly unknown[] } {
  return (
    typeof config === "object" &&
    config !== null &&
    "phoneNumbers" in config &&
    Array.isArray(config.phoneNumbers)
  );
}

/**
 * Extracts the phone number count from a validated provider config.
 * Safe on already-validated configs (providerStatic.validateConfig ran first).
 * Returns 0 if the shape doesn't include a phoneNumbers array.
 */
function countPhoneNumbers(config: unknown): number {
  return hasPhoneNumbers(config) ? config.phoneNumbers.length : 0;
}

export interface TelephonyConfigServiceDeps {
  readonly db: Kysely<PlatformDatabase>;
  readonly secretsEncryptor: SecretsEncryptor;
  readonly providerFactory: ProviderFactory;
  readonly providerStatics: ReadonlyMap<string, TelephonyProviderStatic>;
}

export interface SaveConfigInput {
  readonly orgId: string;
  readonly provider: string;
  readonly accountId: string;
  readonly authToken: string;
}

export interface ProvisionResult {
  readonly success: true;
  readonly phoneNumberCount: number;
}

/** Decrypted config fields needed for webhook validation. */
export interface WebhookConfigLookup {
  readonly provider: string;
  readonly accountSid: string;
  readonly authToken: string;
}

export interface TelephonyConfigService {
  /** Save BYOT telephony credentials. Validates, encrypts, upserts. */
  saveConfig(input: SaveConfigInput): Promise<{ success: true }>;

  /** Retrieve masked config for admin UI. Returns null if not configured. */
  getMaskedConfig(orgId: string): Promise<MaskedTelephonyConfig | null>;

  /** Provision webhook URLs on the provider's phone numbers. */
  provisionWebhooks(
    orgId: string,
    webhookBaseUrl: string,
  ): Promise<ProvisionResult>;

  /**
   * Look up and decrypt an org's telephony config for webhook validation.
   * Returns null if no config exists for the org.
   */
  lookupWebhookConfig(orgId: string): Promise<WebhookConfigLookup | null>;

  /**
   * Look up provisioned phone numbers with their provider SIDs.
   * Used by the phone purpose resolver to match org_config.phone_outbound_sid
   * against actual provisioned numbers. Returns empty array if not configured.
   */
  lookupProvisionedPhones(
    orgId: string,
  ): Promise<readonly { number: string; sid: string }[]>;

  /** Delete BYOT config for an org. Used when switching away from BYOT mode. */
  clearConfig(orgId: string): Promise<void>;

  /** Read phone purpose assignments from tenant org_config. */
  getPhonePurpose(
    tenantDb: Kysely<TenantDatabase>,
  ): Promise<{ outboundSid: string | null; systemSid: string | null }>;

  /** Update phone purpose assignments in tenant org_config. */
  setPhonePurpose(
    tenantDb: Kysely<TenantDatabase>,
    input: { outboundSid: string | null; systemSid: string | null },
  ): Promise<void>;

  /**
   * Dev-only: seed a config blob that includes fake phone numbers.
   * Skips provider validation since no real Twilio account exists.
   */
  devSeedConfigWithPhones?(
    orgId: string,
    phones: readonly { number: string; sid: string; label?: string }[],
  ): Promise<void>;
}

export function createTelephonyConfigService(
  deps: TelephonyConfigServiceDeps,
): TelephonyConfigService {
  const { db, secretsEncryptor, providerFactory, providerStatics } = deps;

  /** Encrypt a config object, zeroing the plaintext buffer after. */
  function encryptConfig(configObj: unknown): Buffer {
    const plaintext = Buffer.from(JSON.stringify(configObj), "utf-8");
    try {
      return secretsEncryptor.encrypt(plaintext);
    } finally {
      plaintext.fill(0);
    }
  }

  /** Decrypt a config blob, zeroing the plaintext buffer after parsing. */
  function decryptConfig(sealed: Buffer): unknown {
    // care-y-ignore-next-line server-no-decrypt -- operational credentials (Twilio config), not E2EE client data. Server must decrypt to make outbound API calls (OPS1 design).
    const plaintext = secretsEncryptor.decrypt(sealed);
    try {
      return JSON.parse(plaintext.toString("utf-8")) as unknown;
    } finally {
      plaintext.fill(0);
    }
  }

  return {
    async saveConfig(input: SaveConfigInput): Promise<{ success: true }> {
      const providerStatic = providerStatics.get(input.provider);
      if (!providerStatic) {
        throw new TelephonyConfigError(
          `Unsupported telephony provider: ${input.provider}`,
        );
      }

      const configObj = {
        mode: "byot" as const,
        accountSid: input.accountId,
        authToken: input.authToken,
        phoneNumbers: [],
      };

      providerStatic.validateConfig(configObj);

      const sealed = encryptConfig(configObj);

      await db
        .insertInto("telephony_config")
        .values({
          org_id: input.orgId,
          provider: input.provider,
          config: sealed,
        })
        .onConflict((oc) =>
          oc.column("org_id").doUpdateSet({
            provider: input.provider,
            config: sealed,
            updated_at: new Date(),
          }),
        )
        .execute();

      providerFactory.invalidate(input.orgId);

      return { success: true as const };
    },

    async clearConfig(orgId: string): Promise<void> {
      await db
        .deleteFrom("telephony_config")
        .where("org_id", "=", orgId)
        .execute();

      providerFactory.invalidate(orgId);
    },

    async getPhonePurpose(
      tenantDb: Kysely<TenantDatabase>,
    ): Promise<{ outboundSid: string | null; systemSid: string | null }> {
      const row = await tenantDb
        .selectFrom("org_config")
        .select(["phone_outbound_sid", "phone_system_sid"])
        .executeTakeFirstOrThrow();
      return {
        outboundSid: row.phone_outbound_sid,
        systemSid: row.phone_system_sid,
      };
    },

    async setPhonePurpose(
      tenantDb: Kysely<TenantDatabase>,
      input: { outboundSid: string | null; systemSid: string | null },
    ): Promise<void> {
      await tenantDb
        .updateTable("org_config")
        .set({
          phone_outbound_sid: input.outboundSid,
          phone_system_sid: input.systemSid,
        })
        .execute();
    },

    async getMaskedConfig(
      orgId: string,
    ): Promise<MaskedTelephonyConfig | null> {
      try {
        const provider = await providerFactory.getProvider(orgId);
        return provider.maskConfig();
      } catch (err: unknown) {
        if (err instanceof NotFoundError) {
          return null;
        }
        throw err;
      }
    },

    async provisionWebhooks(
      orgId: string,
      webhookBaseUrl: string,
    ): Promise<ProvisionResult> {
      const row = await db
        .selectFrom("telephony_config")
        .selectAll()
        .where("org_id", "=", orgId)
        .executeTakeFirst();

      if (!row) {
        throw new NotFoundError(ErrorCode.TELEPHONY_NOT_CONFIGURED);
      }

      const providerStatic = providerStatics.get(row.provider);
      if (!providerStatic) {
        throw new TelephonyConfigError(
          `No provider implementation registered for: ${row.provider}`,
        );
      }

      const configObj = decryptConfig(row.config);

      const updatedConfig = await providerStatic.provisionWebhooks(
        configObj,
        orgId,
        webhookBaseUrl,
      );

      providerStatic.validateConfig(updatedConfig);

      const updatedSealed = encryptConfig(updatedConfig);

      await db
        .updateTable("telephony_config")
        .set({
          config: updatedSealed,
          updated_at: new Date(),
        })
        .where("org_id", "=", orgId)
        .execute();

      providerFactory.invalidate(orgId);

      return {
        success: true as const,
        phoneNumberCount: countPhoneNumbers(updatedConfig),
      };
    },

    async lookupWebhookConfig(
      orgId: string,
    ): Promise<WebhookConfigLookup | null> {
      const row = await db
        .selectFrom("telephony_config")
        .select(["provider", "config"])
        .where("org_id", "=", orgId)
        .executeTakeFirst();

      if (!row) {
        return null;
      }

      const rawConfig = decryptConfig(row.config);

      // Validate the decrypted config has the fields needed for webhook validation.
      // Use the provider's registered Zod schema if available, fall back to a
      // minimal schema that extracts only what lookupWebhookConfig needs.
      const schema = providerConfigSchemas[row.provider];
      if (schema) {
        const result = schema.safeParse(rawConfig);
        if (!result.success) {
          throw new TelephonyConfigError(
            `Decrypted config failed validation for provider ${row.provider}`,
          );
        }
      }

      // Minimal extraction schema for the two fields we need.
      const webhookFields = z
        .object({ accountSid: z.string(), authToken: z.string() })
        .safeParse(rawConfig);

      if (!webhookFields.success) {
        throw new TelephonyConfigError(
          "Decrypted config missing accountSid or authToken",
        );
      }

      return {
        provider: row.provider,
        accountSid: webhookFields.data.accountSid,
        authToken: webhookFields.data.authToken,
      };
    },

    async lookupProvisionedPhones(
      orgId: string,
    ): Promise<readonly { number: string; sid: string }[]> {
      const row = await db
        .selectFrom("telephony_config")
        .select(["provider", "config"])
        .where("org_id", "=", orgId)
        .executeTakeFirst();

      if (!row) return [];

      const rawConfig = decryptConfig(row.config);

      // Extract phone numbers with SIDs from the decrypted config.
      // Each provider's Zod schema defines phoneNumbers with different
      // ID field names (sid for Twilio, id for SignalWire). Normalize
      // to a common { number, sid } shape.
      const phoneArraySchema = z
        .object({
          phoneNumbers: z.array(
            z.object({
              number: z.string(),
              sid: z.string().optional(),
              id: z.string().optional(),
            }),
          ),
        })
        .safeParse(rawConfig);

      if (!phoneArraySchema.success) return [];

      return phoneArraySchema.data.phoneNumbers.map((pn) => ({
        number: pn.number,
        sid: pn.sid ?? pn.id ?? pn.number,
      }));
    },

    ...(getEnv().NODE_ENV === "development"
      ? {
          async devSeedConfigWithPhones(
            orgId: string,
            phones: readonly {
              number: string;
              sid: string;
              label?: string;
            }[],
          ): Promise<void> {
            // Lazy import keeps mock-provider out of the production bundle.
            // The constants are dev-only shared secrets (not production
            // credentials); see the doc comments on each export.
            const { DEV_MOCK_ACCOUNT_SID, DEV_MOCK_AUTH_TOKEN } =
              await import("./mock-provider.js");

            const configObj = {
              accountSid: DEV_MOCK_ACCOUNT_SID,
              authToken: DEV_MOCK_AUTH_TOKEN,
              phoneNumbers: phones.map((p) => ({
                number: p.number,
                sid: p.sid,
                label: p.label,
              })),
            };

            const sealed = encryptConfig(configObj);

            await db
              .insertInto("telephony_config")
              .values({
                org_id: orgId,
                provider: "mock",
                config: sealed,
              })
              .onConflict((oc) =>
                oc.column("org_id").doUpdateSet({
                  provider: "mock",
                  config: sealed,
                  updated_at: new Date(),
                }),
              )
              .execute();

            providerFactory.invalidate(orgId);
          },
        }
      : {}),
  };
}
