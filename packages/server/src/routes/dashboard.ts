import { Permission } from "@care-y/shared";
import { router, authedProcedure, withErrorWrapping } from "../trpc/trpc.js";
import { requirePermission } from "../auth/roles.js";
import { createDashboardService } from "../dashboard/dashboard-service.js";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- tRPC router() returns a deeply generic type
export function createDashboardRouter() {
  return router({
    getSetupChecklist: authedProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        requirePermission(ctx.user.roleId, Permission.MANAGE_ROLES);

        const service = createDashboardService(ctx.org.tenantDb);
        return service.getSetupChecklist();
      }),
    ),

    dismissSetupChecklist: authedProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        requirePermission(ctx.user.roleId, Permission.MANAGE_ROLES);

        const service = createDashboardService(ctx.org.tenantDb);
        await service.dismissSetupChecklist();
        return { success: true as const };
      }),
    ),
  });
}
