/**
 * Reports router: aggregate statistics for managers and admins.
 *
 * All queries use plaintext metadata only (status, queue_id, priority, created_at).
 * No decryption, no PII in results. Queue names returned as encrypted buffers
 * for client-side decrypt.
 */

import {
  router,
  authed2faProcedure,
  requireRole,
  withErrorWrapping,
} from "../trpc/trpc.js";
import { Permission } from "@care-y/shared";
import { createReportsService } from "../tickets/reports-service.js";

const reportsProcedure = authed2faProcedure.use(
  requireRole(Permission.VIEW_REPORTS),
);

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createReportsRouter() {
  return router({
    queueStats: reportsProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createReportsService(ctx.org.tenantDb);
        const stats = await svc.queueStats();
        return stats.map((s) => ({
          queueId: s.queueId,
          encryptedQueueName: s.encryptedQueueName.toString("base64url"),
          open: s.open,
          closed: s.closed,
        }));
      }),
    ),

    volumeTrends: reportsProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createReportsService(ctx.org.tenantDb);
        return svc.volumeTrends();
      }),
    ),

    resolutionTrends: reportsProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createReportsService(ctx.org.tenantDb);
        return svc.resolutionTrends();
      }),
    ),

    priorityBreakdown: reportsProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createReportsService(ctx.org.tenantDb);
        return svc.priorityBreakdown();
      }),
    ),

    activeCount: reportsProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createReportsService(ctx.org.tenantDb);
        return svc.activeCount();
      }),
    ),
  });
}
