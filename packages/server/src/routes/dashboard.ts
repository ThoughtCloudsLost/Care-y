import {
  router,
  permissionProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import { Permission } from "@care-y/shared";

/**
 * The checklist reports which parts of org setup are still incomplete, so
 * it carries administrative status rather than being neutral furniture.
 */
const setupChecklistProcedure = permissionProcedure(
  Permission.MANAGE_ORG_IDENTITY,
);
import { createDashboardService } from "../dashboard/dashboard-service.js";

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- tRPC router() returns a deeply generic type
export function createDashboardRouter() {
  return router({
    getSetupChecklist: setupChecklistProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const service = createDashboardService(ctx.org.tenantDb);
        return service.getSetupChecklist();
      }),
    ),

    dismissSetupChecklist: setupChecklistProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        const service = createDashboardService(ctx.org.tenantDb);
        await service.dismissSetupChecklist();
        return { success: true as const };
      }),
    ),
  });
}
