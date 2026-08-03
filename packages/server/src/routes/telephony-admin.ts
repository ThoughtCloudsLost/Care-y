/**
 * Telephony admin router: config management for org telephony providers,
 * phone blocklist, and phone purpose assignment.
 *
 * All endpoints require admin-level permissions (MANAGE_ROLES).
 * Business logic is delegated to TelephonyConfigService and BlocklistRepository.
 */

import { getEnv } from "../env.js";
import { router, adminProcedure, withErrorWrapping } from "../trpc/trpc.js";
import type { TelephonyConfigService } from "../telephony/config-service.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import { createBlocklistRepository } from "../telephony/models/blocklist-repo.js";
import {
  saveTelephonyConfigInputSchema,
  addToBlocklistInputSchema,
  removeFromBlocklistInputSchema,
  setPhonePurposeInputSchema,
  changeTelephonyModeInputSchema,
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

    changeMode: adminProcedure.input(changeTelephonyModeInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        if (input.mode === "byot") {
          await configService.saveConfig({
            orgId: ctx.org.orgId,
            provider: input.provider,
            accountId: input.accountId,
            authToken: input.authToken,
          });
        } else {
          await configService.clearConfig(ctx.org.orgId);
        }
        return { success: true as const, mode: input.mode };
      }),
    ),

    addToBlocklist: adminProcedure.input(addToBlocklistInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const repo = createBlocklistRepository(ctx.org.tenantDb);
        const phoneHash = indexer.hash(input.phoneNumber, ctx.org.orgId);

        if (await repo.exists(phoneHash)) {
          throw new ConflictError("This number is already blocked");
        }

        const encryptedNumber = ctx.org.sealedBox.seal(input.phoneNumber);
        const entry = await repo.add(phoneHash, encryptedNumber, ctx.user.id);
        return {
          ...entry,
          encryptedNumber: entry.encryptedNumber.toString("base64url"),
        };
      }),
    ),

    removeFromBlocklist: adminProcedure
      .input(removeFromBlocklistInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const repo = createBlocklistRepository(ctx.org.tenantDb);
          await repo.remove(input.id);
        }),
      ),

    listBlocklist: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const repo = createBlocklistRepository(ctx.org.tenantDb);
        const entries = await repo.list();
        return entries.map((e) => ({
          ...e,
          encryptedNumber: e.encryptedNumber.toString("base64url"),
        }));
      }),
    ),

    getProvisionedPhones: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        return configService.lookupProvisionedPhones(ctx.org.orgId);
      }),
    ),

    getPhonePurpose: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        return configService.getPhonePurpose(ctx.org.tenantDb);
      }),
    ),

    setPhonePurpose: adminProcedure.input(setPhonePurposeInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        await configService.setPhonePurpose(ctx.org.tenantDb, input);
      }),
    ),

    ...(getEnv().NODE_ENV === "development"
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

                await configService.setPhonePurpose(ctx.org.tenantDb, {
                  outboundSid: devPhones[0].sid,
                  systemSid: devPhones[1].sid,
                });
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
