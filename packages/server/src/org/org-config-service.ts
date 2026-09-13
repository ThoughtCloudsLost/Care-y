import type { Kysely } from "kysely";
import type {
  QueueId,
  ChannelPolicy,
  UpdateChannelPolicyInput,
} from "@care-y/shared";
import { ErrorCode } from "@care-y/shared";
import type { TenantDatabase } from "../db/types.js";
import {
  NotFoundError,
  ValidationError,
  ChannelDisabledError,
} from "../errors.js";

export interface OrgGeneralResult {
  readonly name: string | null;
  readonly defaultLanguage: string;
  readonly countryCode: string;
  readonly portalSafeExitUrl: string | null;
}

export interface UpdateOrgGeneralInput {
  readonly orgName: string;
  readonly defaultLanguage: string;
  readonly countryCode: string;
  readonly portalSafeExitUrl?: string | null;
}

export interface OrgConfigService {
  getOrgGeneral(): Promise<OrgGeneralResult>;
  updateOrgGeneral(input: UpdateOrgGeneralInput): Promise<void>;
  getIntakeQueue(): Promise<QueueId | null>;
  setIntakeQueue(queueId: QueueId | null): Promise<void>;
  getChannelPolicy(): Promise<ChannelPolicy>;
  updateChannelPolicy(input: UpdateChannelPolicyInput): Promise<void>;
}

export function createOrgConfigService(
  tenantDb: Kysely<TenantDatabase>,
): OrgConfigService {
  return {
    async getOrgGeneral(): Promise<OrgGeneralResult> {
      const config = await tenantDb
        .selectFrom("org_config")
        .select([
          "name",
          "default_language",
          "default_country_code",
          "portal_safe_exit_url",
        ])
        .executeTakeFirst();

      if (!config) {
        throw new NotFoundError("Org config not found");
      }

      return {
        name: config.name,
        defaultLanguage: config.default_language,
        countryCode: config.default_country_code,
        portalSafeExitUrl: config.portal_safe_exit_url,
      };
    },

    async updateOrgGeneral(input: UpdateOrgGeneralInput): Promise<void> {
      let query = tenantDb.updateTable("org_config").set({
        // care-y-ignore-next-line ast-pii-in-db-write -- org name is public branding, not PII (ADR-094)
        name: input.orgName,
        default_language: input.defaultLanguage,
        default_country_code: input.countryCode,
      });
      if (input.portalSafeExitUrl !== undefined) {
        query = query.set({
          portal_safe_exit_url: input.portalSafeExitUrl ?? null,
        });
      }
      const result = await query.executeTakeFirst();

      if (result.numUpdatedRows === 0n) {
        throw new NotFoundError("Org config not found");
      }
    },

    async getIntakeQueue(): Promise<QueueId | null> {
      const config = await tenantDb
        .selectFrom("org_config")
        .select("intake_queue_id")
        .executeTakeFirst();

      if (!config) {
        throw new NotFoundError("Org config not found");
      }

      return config.intake_queue_id;
    },

    async setIntakeQueue(queueId: QueueId | null): Promise<void> {
      if (queueId !== null) {
        const queue = await tenantDb
          .selectFrom("queues")
          .select("id")
          .where("id", "=", queueId)
          .where("is_active", "=", true)
          .executeTakeFirst();

        if (!queue) {
          throw new ValidationError("Queue not found or inactive");
        }
      }

      const result = await tenantDb
        .updateTable("org_config")
        .set({ intake_queue_id: queueId })
        .executeTakeFirst();

      if (result.numUpdatedRows === 0n) {
        throw new NotFoundError("Org config not found");
      }
    },

    async getChannelPolicy(): Promise<ChannelPolicy> {
      const config = await tenantDb
        .selectFrom("org_config")
        .select([
          "channel_sms_enabled",
          "channel_email_enabled",
          "channel_secure_link_enabled",
          "channel_voice_enabled",
          "channel_share_link_enabled",
        ])
        .executeTakeFirst();

      return {
        smsEnabled: config?.channel_sms_enabled !== false,
        emailEnabled: config?.channel_email_enabled !== false,
        secureLinkEnabled: config?.channel_secure_link_enabled !== false,
        voiceEnabled: config?.channel_voice_enabled !== false,
        shareLinkEnabled: config?.channel_share_link_enabled !== false,
      };
    },

    async updateChannelPolicy(input: UpdateChannelPolicyInput): Promise<void> {
      let query = tenantDb.updateTable("org_config");
      let hasUpdate = false;

      if (input.smsEnabled !== undefined) {
        query = query.set({ channel_sms_enabled: input.smsEnabled });
        hasUpdate = true;
      }
      if (input.emailEnabled !== undefined) {
        query = query.set({ channel_email_enabled: input.emailEnabled });
        hasUpdate = true;
      }
      if (input.secureLinkEnabled !== undefined) {
        query = query.set({
          channel_secure_link_enabled: input.secureLinkEnabled,
        });
        hasUpdate = true;
      }
      if (input.voiceEnabled !== undefined) {
        query = query.set({ channel_voice_enabled: input.voiceEnabled });
        hasUpdate = true;
      }
      if (input.shareLinkEnabled !== undefined) {
        query = query.set({
          channel_share_link_enabled: input.shareLinkEnabled,
        });
        hasUpdate = true;
      }

      if (!hasUpdate) return;

      const result = await query.executeTakeFirst();
      if (result.numUpdatedRows === 0n) {
        throw new NotFoundError("Org config not found");
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Standalone channel-policy assertions (service layer)
// ---------------------------------------------------------------------------

/** Throws ChannelDisabledError when secure link messaging is disabled. */
export async function assertSecureLinkEnabled(
  db: Kysely<TenantDatabase>,
): Promise<void> {
  const row = await db
    .selectFrom("org_config")
    .select("channel_secure_link_enabled")
    .executeTakeFirst();
  if (row?.channel_secure_link_enabled === false) {
    throw new ChannelDisabledError(ErrorCode.PORTAL_CHANNEL_DISABLED);
  }
}

/** Throws ChannelDisabledError when share links are disabled. */
export async function assertShareLinksEnabled(
  db: Kysely<TenantDatabase>,
): Promise<void> {
  const row = await db
    .selectFrom("org_config")
    .select("channel_share_link_enabled")
    .executeTakeFirst();
  if (row?.channel_share_link_enabled === false) {
    throw new ChannelDisabledError(ErrorCode.SHARE_LINKS_DISABLED);
  }
}

/**
 * Returns true when secure link messaging is enabled.
 * Used by portalBootstrap to expose the flag without throwing.
 */
export async function isSecureLinkEnabled(
  db: Kysely<TenantDatabase>,
): Promise<boolean> {
  const row = await db
    .selectFrom("org_config")
    .select("channel_secure_link_enabled")
    .executeTakeFirst();
  return row?.channel_secure_link_enabled !== false;
}
