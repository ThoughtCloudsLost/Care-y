/**
 * Telephony admin router: config management for org telephony providers,
 * phone blacklist, and phone purpose assignment.
 *
 * All endpoints require admin-level permissions (MANAGE_ROLES).
 * Business logic is delegated to TelephonyConfigService and BlacklistRepository.
 */

import { router, adminProcedure, withErrorWrapping } from "../trpc/trpc.js";
import type { TelephonyConfigService } from "../telephony/config-service.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import { createBlacklistRepository } from "../telephony/models/blacklist-repo.js";
import {
  saveTelephonyConfigInputSchema,
  addToBlacklistInputSchema,
  removeFromBlacklistInputSchema,
  setPhonePurposeInputSchema,
} from "@care-y/shared";
import { ConflictError } from "../errors.js";

export interface TelephonyAdminRouterDeps {
  readonly configService: TelephonyConfigService;
  readonly webhookBaseUrl: string;
  readonly indexer: BlindIndexer;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createTelephonyAdminRouter(deps: TelephonyAdminRouterDeps) {
  const { configService, webhookBaseUrl, indexer } = deps;

  return router({
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

    getConfig: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        return configService.getMaskedConfig(ctx.org.orgId);
      }),
    ),

    provisionWebhooks: adminProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        return configService.provisionWebhooks(ctx.org.orgId, webhookBaseUrl);
      }),
    ),

    addToBlacklist: adminProcedure.input(addToBlacklistInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const repo = createBlacklistRepository(ctx.org.tenantDb);
        const phoneHash = indexer.hash(input.phoneNumber, ctx.org.orgId);

        if (await repo.exists(phoneHash)) {
          throw new ConflictError("This number is already blocked");
        }

        const encryptedNumber = ctx.org.sealedBox.seal(input.phoneNumber);
        return repo.add(phoneHash, encryptedNumber, ctx.user.id);
      }),
    ),

    removeFromBlacklist: adminProcedure
      .input(removeFromBlacklistInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const repo = createBlacklistRepository(ctx.org.tenantDb);
          await repo.remove(input.id);
        }),
      ),

    listBlacklist: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const repo = createBlacklistRepository(ctx.org.tenantDb);
        return repo.list();
      }),
    ),

    setPhonePurpose: adminProcedure.input(setPhonePurposeInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        await ctx.org.tenantDb
          .updateTable("org_config")
          .set({
            phone_outbound_sid: input.outboundSid,
            phone_system_sid: input.systemSid,
          })
          .execute();
      }),
    ),
  });
}
