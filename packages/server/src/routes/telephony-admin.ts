/**
 * Telephony admin router: config management for org telephony providers.
 *
 * All endpoints require admin-level permissions (MANAGE_ROLES).
 * Business logic is delegated to TelephonyConfigService.
 */

import { router, adminProcedure, withErrorWrapping } from "../trpc/trpc.js";
import type { TelephonyConfigService } from "../telephony/config-service.js";
import { saveTelephonyConfigInputSchema } from "@care-y/shared";

export interface TelephonyAdminRouterDeps {
  readonly configService: TelephonyConfigService;
  readonly webhookBaseUrl: string;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createTelephonyAdminRouter(deps: TelephonyAdminRouterDeps) {
  const { configService, webhookBaseUrl } = deps;

  return router({
    /**
     * Save BYOT telephony credentials for the current org.
     * Validates config via the provider's static validator, encrypts,
     * and upserts into telephony_config.
     */
    saveConfig: adminProcedure.input(saveTelephonyConfigInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        return configService.saveConfig({
          orgId: ctx.org.orgId,
          provider: input.provider,
          accountId: input.accountId,
          authToken: input.authToken,
        });
      }),
    ),

    /**
     * Retrieve the current org's telephony config with masked credentials.
     * Returns null if no config is stored.
     */
    getConfig: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        return configService.getMaskedConfig(ctx.org.orgId);
      }),
    ),

    /**
     * Provision webhook URLs on the telephony provider for the current org's
     * phone numbers. Re-encrypts the updated config.
     */
    provisionWebhooks: adminProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        return configService.provisionWebhooks(ctx.org.orgId, webhookBaseUrl);
      }),
    ),
  });
}
