/**
 * Dev-only tRPC router. Provides seed data management for local development.
 *
 * This router is conditionally spread into the app router ONLY when
 * NODE_ENV !== "production". The module is never imported in production
 * builds, so it is tree-shaken entirely.
 */

import { router, adminProcedure, withErrorWrapping } from "../trpc/trpc.js";
import { createDevService } from "../dev/dev-service.js";

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- tRPC router() generic
export function createDevRouter() {
  return router({
    resetSeedData: adminProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createDevService(ctx.org.tenantDb, ctx.org.orgSchema);
        return svc.resetSeedData();
      }),
    ),
  });
}
