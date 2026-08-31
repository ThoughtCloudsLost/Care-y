import type { Kysely } from "kysely";
import type { QueueId } from "@care-y/shared";
import type { TenantDatabase } from "../db/types.js";
import { NotFoundError, ValidationError } from "../errors.js";

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
  };
}
