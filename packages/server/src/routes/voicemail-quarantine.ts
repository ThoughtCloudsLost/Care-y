/**
 * Voicemail quarantine admin router.
 *
 * All endpoints require admin-level permissions. Business logic is
 * delegated to the voicemail-quarantine service; this file contains
 * zero business logic.
 */

import { router, adminProcedure, withErrorWrapping } from "../trpc/trpc.js";
import {
  listQuarantineInputSchema,
  downloadQuarantineInputSchema,
  routeQuarantineInputSchema,
  dismissQuarantineInputSchema,
} from "@care-y/shared";
import {
  listQuarantined,
  getQuarantineBlob,
  routeQuarantined,
  dismissQuarantined,
  type RouteQuarantineDeps,
  type DismissQuarantineDeps,
} from "../telephony/voicemail-quarantine.js";
import type { BlobStore } from "../storage/store.js";
import type { PendingClient } from "../tickets/ticket-service.js";

export interface VoicemailQuarantineRouterDeps {
  readonly blobStore: BlobStore;
  readonly pendingClients: Map<string, PendingClient>;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createVoicemailQuarantineRouter(
  deps: VoicemailQuarantineRouterDeps,
) {
  const { blobStore, pendingClients } = deps;

  return router({
    list: adminProcedure.input(listQuarantineInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        return listQuarantined(ctx.org.tenantDb, input);
      }),
    ),

    download: adminProcedure.input(downloadQuarantineInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        return getQuarantineBlob(
          ctx.org.tenantDb,
          blobStore,
          ctx.org.orgSchema,
          input.quarantineId,
        );
      }),
    ),

    route: adminProcedure.input(routeQuarantineInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const routeDeps: RouteQuarantineDeps = {
          tDb: ctx.org.tenantDb,
          blobStore,
          orgSchema: ctx.org.orgSchema,
          pendingClients,
          sealedBox: ctx.org.sealedBox,
        };
        return routeQuarantined(routeDeps, input, ctx.user.id);
      }),
    ),

    dismiss: adminProcedure.input(dismissQuarantineInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const dismissDeps: DismissQuarantineDeps = {
          tDb: ctx.org.tenantDb,
          blobStore,
        };
        return dismissQuarantined(dismissDeps, input.quarantineId, ctx.user.id);
      }),
    ),
  });
}
