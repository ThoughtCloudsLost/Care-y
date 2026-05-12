import { Permission } from "@care-y/shared";
import { router, authedProcedure, withErrorWrapping } from "../trpc/trpc.js";
import { hasPermission } from "../auth/roles.js";
import { ForbiddenError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import { createDashboardService } from "../dashboard/dashboard-service.js";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- tRPC router() returns a deeply generic type
export function createDashboardRouter() {
  return router({
    getSetupChecklist: authedProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        if (!hasPermission(ctx.user.roleId, Permission.MANAGE_ROLES)) {
          throw new ForbiddenError(ErrorCode.INSUFFICIENT_PERMISSIONS);
        }

        const service = createDashboardService(ctx.org.tenantDb);
        return service.getSetupChecklist();
      }),
    ),

    dismissSetupChecklist: authedProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        if (!hasPermission(ctx.user.roleId, Permission.MANAGE_ROLES)) {
          throw new ForbiddenError(ErrorCode.INSUFFICIENT_PERMISSIONS);
        }

        const service = createDashboardService(ctx.org.tenantDb);
        await service.dismissSetupChecklist();
        return { success: true as const };
      }),
    ),
  });
}
