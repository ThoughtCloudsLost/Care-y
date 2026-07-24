import { router, adminProcedure, withErrorWrapping } from "../trpc/trpc.js";
import { createDashboardService } from "../dashboard/dashboard-service.js";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- tRPC router() returns a deeply generic type
export function createDashboardRouter() {
  return router({
    getSetupChecklist: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const service = createDashboardService(ctx.org.tenantDb);
        return service.getSetupChecklist();
      }),
    ),

    dismissSetupChecklist: adminProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        const service = createDashboardService(ctx.org.tenantDb);
        await service.dismissSetupChecklist();
        return { success: true as const };
      }),
    ),
  });
}
