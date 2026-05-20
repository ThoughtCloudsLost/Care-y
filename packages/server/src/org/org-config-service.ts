import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

export interface OrgBasicsResult {
  readonly encryptedName: string | null;
  readonly defaultLanguage: string;
  readonly countryCode: string;
}

export interface UpdateOrgBasicsInput {
  readonly encryptedOrgName: string;
  readonly defaultLanguage: string;
  readonly countryCode: string;
}

export interface OrgConfigService {
  getOrgBasics(): Promise<OrgBasicsResult>;
  updateOrgBasics(input: UpdateOrgBasicsInput): Promise<void>;
}

export function createOrgConfigService(
  tenantDb: Kysely<TenantDatabase>,
): OrgConfigService {
  return {
    async getOrgBasics(): Promise<OrgBasicsResult> {
      const config = await tenantDb
        .selectFrom("org_config")
        .select(["encrypted_name", "default_language", "default_country_code"])
        .executeTakeFirstOrThrow();

      return {
        encryptedName:
          config.encrypted_name !== null
            ? config.encrypted_name.toString("base64")
            : null,
        defaultLanguage: config.default_language,
        countryCode: config.default_country_code,
      };
    },

    async updateOrgBasics(input: UpdateOrgBasicsInput): Promise<void> {
      await tenantDb
        .updateTable("org_config")
        .set({
          encrypted_name: Buffer.from(input.encryptedOrgName, "base64"),
          default_language: input.defaultLanguage,
          default_country_code: input.countryCode,
        })
        .execute();
    },
  };
}
