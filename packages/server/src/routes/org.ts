/**
 * Org router: org lifecycle + admin org config endpoints.
 *
 * org.create uses publicProcedure (no org context, no auth required).
 * This is intentional: the first org is created when no orgs exist yet.
 * A future phase gates this behind proper authorization (platform admin).
 *
 * getOrgBasics / updateOrgBasics: admin endpoints for org name, language,
 * and country code. The server stores the name as encrypted ciphertext
 * and never decrypts it.
 */

import {
  createOrgInputSchema,
  updateOrgBasicsAdminInputSchema,
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

    getOrgBasics: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createOrgConfigService(ctx.org.tenantDb);
        return svc.getOrgBasics();
      }),
    ),

    updateOrgBasics: adminProcedure
      .input(updateOrgBasicsAdminInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createOrgConfigService(ctx.org.tenantDb);
          await svc.updateOrgBasics(input);
          return { success: true as const };
        }),
      ),
  });
}
