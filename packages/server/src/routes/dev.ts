/**
 * Dev-only tRPC router. Provides seed data management for local development.
 *
 * This router is conditionally spread into the app router ONLY when
 * NODE_ENV !== "production". The module is never imported in production
 * builds, so it is tree-shaken entirely.
 */

import { router, adminProcedure, withErrorWrapping } from "../trpc/trpc.js";
import { createDevService } from "../dev/dev-service.js";
import {
  applySeedTimelineInputSchema,
  backdateOrgSetupInputSchema,
  seedQuarantineInputSchema,
  reopenAsClientInputSchema,
  seedVoicemailInputSchema,
} from "@care-y/shared/dev/seed-stories.js";
import type { BlobStore } from "../storage/store.js";

export interface DevRouterDeps {
  readonly blobStore: BlobStore;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- tRPC router() generic
export function createDevRouter(deps: DevRouterDeps) {
  return router({
    resetSeedData: adminProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createDevService(ctx.org.tenantDb);
        return svc.resetSeedData();
      }),
    ),

    applySeedTimeline: adminProcedure
      .input(applySeedTimelineInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) =>
          createDevService(ctx.org.tenantDb).applySeedTimeline(input),
        ),
      ),

    backdateOrgSetup: adminProcedure
      .input(backdateOrgSetupInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) =>
          createDevService(ctx.org.tenantDb).backdateOrgSetup(input),
        ),
      ),

    seedVoicemail: adminProcedure.input(seedVoicemailInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) =>
        createDevService(ctx.org.tenantDb).seedVoicemail(input, {
          blobStore: deps.blobStore,
          orgSchema: ctx.org.orgSchema,
        }),
      ),
    ),

    reopenAsClient: adminProcedure
      .input(reopenAsClientInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) =>
          createDevService(ctx.org.tenantDb).reopenAsClient(input),
        ),
      ),

    seedQuarantine: adminProcedure.input(seedQuarantineInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const { seedQuarantineEntries } =
          await import("../dev/seed-quarantine.js");
        return seedQuarantineEntries(
          ctx.org.tenantDb,
          deps.blobStore,
          ctx.org.orgSchema,
          input,
        );
      }),
    ),
  });
}
