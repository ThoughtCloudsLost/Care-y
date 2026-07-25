/**
 * Org router: org lifecycle + admin org config endpoints.
 *
 * org.create uses publicProcedure (no org context, no auth required).
 * This is intentional: the first org is created when no orgs exist yet.
 * A future phase gates this behind proper authorization (platform admin).
 *
 * getOrgGeneral / updateOrgGeneral: admin endpoints for org name, language,
 * and country code. The server stores the name as encrypted ciphertext
 * and never decrypts it.
 */

import {
  createOrgInputSchema,
  updateOrgGeneralAdminInputSchema,
  setIntakeQueueInputSchema,
} from "@care-y/shared";
import {
  router,
  publicProcedure,
  adminProcedure,
  throwAsTrpc,
  withErrorWrapping,
} from "../trpc/trpc.js";
import type { OrgService } from "../org/service.js";
import { createOrgConfigService } from "../org/org-config-service.js";

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createOrgRouter(orgService: OrgService) {
  return router({
    create: publicProcedure
      .input(createOrgInputSchema)
      .mutation(async ({ input }) => {
        try {
          const org = await orgService.createOrg({ slug: input.slug });
          return {
            org: {
              id: org.id,
              slug: org.slug,
            },
            setupToken: org.setupToken,
          };
        } catch (err: unknown) {
          throwAsTrpc(err);
        }
      }),

    getOrgGeneral: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createOrgConfigService(ctx.org.tenantDb);
        return svc.getOrgGeneral();
      }),
    ),

    updateOrgGeneral: adminProcedure
      .input(updateOrgGeneralAdminInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createOrgConfigService(ctx.org.tenantDb);
          await svc.updateOrgGeneral(input);
          return { success: true as const };
        }),
      ),

    getIntakeQueue: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createOrgConfigService(ctx.org.tenantDb);
        const queueId = await svc.getIntakeQueue();
        return { queueId };
      }),
    ),

    setIntakeQueue: adminProcedure.input(setIntakeQueueInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createOrgConfigService(ctx.org.tenantDb);
        await svc.setIntakeQueue(input.queueId);
        return { success: true as const };
      }),
    ),
  });
}
