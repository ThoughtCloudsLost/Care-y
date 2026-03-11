/**
 * Org router: org lifecycle endpoints.
 *
 * org.create uses publicProcedure (no org context, no auth required).
 * This is intentional: the first org is created when no orgs exist yet.
 * A future phase gates this behind proper authorization (platform admin).
 */

import { createOrgInputSchema } from "@care-y/shared";
import { router, publicProcedure, throwAsTrpc } from "../trpc/trpc.js";
import type { OrgService } from "../org/service.js";

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
          };
        } catch (err: unknown) {
          throwAsTrpc(err);
        }
      }),
  });
}
