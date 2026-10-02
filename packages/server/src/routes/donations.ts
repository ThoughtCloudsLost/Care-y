/**
 * Donation provider tRPC router.
 *
 * Connecting and removing a provider account takes MANAGE_FUNDS. Reading
 * the provider's fund totals takes VIEW_FUNDS, the same as reading the
 * funds themselves. Totals are relayed from the provider on demand and
 * never stored.
 */

import {
  Permission,
  removeDonationConnectionInputSchema,
  saveGivebutterConnectionInputSchema,
  type DonationConnectionWire,
  type ProviderFundListWire,
} from "@care-y/shared";
import {
  router,
  permissionProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import type { DonationConnectionService } from "../donations/config-service.js";

const viewFundsProcedure = permissionProcedure(Permission.VIEW_FUNDS);

const manageFundsProcedure = permissionProcedure(Permission.MANAGE_FUNDS);

export interface DonationsRouterDeps {
  readonly connectionService: DonationConnectionService;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createDonationsRouter(deps: DonationsRouterDeps) {
  const svc = deps.connectionService;

  return router({
    listConnections: manageFundsProcedure.query(
      withErrorWrapping(
        async ({ ctx }): Promise<{ connections: DonationConnectionWire[] }> => {
          return { connections: await svc.list(ctx.org.orgId) };
        },
      ),
    ),

    saveGivebutterConnection: manageFundsProcedure
      .input(saveGivebutterConnectionInputSchema)
      .mutation(
        withErrorWrapping(
          async ({ ctx, input }): Promise<DonationConnectionWire> => {
            return svc.saveGivebutter(ctx.org.orgId, input, {
              orgSchema: ctx.org.orgSchema,
              actorId: ctx.user.id,
            });
          },
        ),
      ),

    removeConnection: manageFundsProcedure
      .input(removeDonationConnectionInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          await svc.remove(ctx.org.orgId, input.connectionId, {
            orgSchema: ctx.org.orgSchema,
            actorId: ctx.user.id,
          });
          return { success: true as const };
        }),
      ),

    listProviderFunds: viewFundsProcedure.query(
      withErrorWrapping(async ({ ctx }): Promise<ProviderFundListWire> => {
        return svc.listProviderFunds(ctx.org.orgId);
      }),
    ),
  });
}
