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

    getProvisionedPhones: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        return configService.lookupProvisionedPhones(ctx.org.orgId);
      }),
    ),

    getPhonePurpose: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const row = await ctx.org.tenantDb
          .selectFrom("org_config")
          .select(["phone_outbound_sid", "phone_system_sid"])
          .executeTakeFirstOrThrow();
        return {
          outboundSid: row.phone_outbound_sid,
          systemSid: row.phone_system_sid,
        };
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

    ...(process.env.NODE_ENV === "development"
      ? {
          devSeedTelephony: adminProcedure.mutation(
            withErrorWrapping(async ({ ctx }) => {
              const existing = await configService.getMaskedConfig(
                ctx.org.orgId,
              );
              if (existing) return { skipped: true as const };

              const devPhones = [
                { number: "+15550001111", sid: "PNdev001", label: "Main" },
                { number: "+15550002222", sid: "PNdev002", label: "Support" },
              ] as const;

              if (configService.devSeedConfigWithPhones) {
                await configService.devSeedConfigWithPhones(
                  ctx.org.orgId,
                  devPhones,
                );

                await ctx.org.tenantDb
                  .updateTable("org_config")
                  .set({
                    phone_outbound_sid: devPhones[0].sid,
                    phone_system_sid: devPhones[1].sid,
                  })
                  .execute();
              } else {
                await configService.saveConfig({
                  orgId: ctx.org.orgId,
                  provider: "twilio",
                  accountId: "ACdev00000000000000000000000mock",
                  authToken: "dev_mock_auth_token_000000000000",
                });
              }

              return { skipped: false as const };
            }),
          ),
        }
      : {}),
  });
}
