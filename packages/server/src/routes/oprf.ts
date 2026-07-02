/**
 * OPRF tRPC endpoint.
 *
 * Thin route that delegates to the OprfEvaluateService. The service owns all
 * business logic (rate limiting, PoW gating, failure tracking, delay, audit).
 *
 * This is a publicProcedure (no auth required) because OPRF evaluation
 * happens during login before any session exists. The OPRF key is
 * platform-wide (one key for all orgs), so no org context is needed.
 */

import {
  router,
  publicProcedure,
  adminProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import { oprfEvaluateInputSchema } from "@care-y/shared";
import { extractClientIp } from "../http/request-utils.js";
import type { OprfEvaluateService } from "../crypto/oprf-evaluate-service.js";

export interface OprfRouterDeps {
  readonly oprfService: OprfEvaluateService;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createOprfRouter(deps: OprfRouterDeps) {
  return router({
    evaluate: publicProcedure.input(oprfEvaluateInputSchema).mutation(
      withErrorWrapping(async ({ input, ctx }) => {
        const ip = extractClientIp(ctx.req);
        const sessionUserId =
          ctx.session !== null && ctx.user !== null ? ctx.user.id : null;

        return deps.oprfService.evaluate({
          userId: input.userId,
          blindedElement: input.blindedElement,
          ip,
          sessionUserId,
          powChallenge: input.powChallenge,
          powSolution: input.powSolution,
        });
      }),
    ),

    /**
     * Admin OPRF evaluate: bypasses session-binding check so an admin
     * can derive keys on behalf of a manually created user. Requires
     * MANAGE_KEYS permission. Rate limits still apply.
     */
    adminEvaluate: adminProcedure.input(oprfEvaluateInputSchema).mutation(
      withErrorWrapping(async ({ input, ctx }) => {
        const ip = extractClientIp(ctx.req);

        return deps.oprfService.adminEvaluate({
          userId: input.userId,
          blindedElement: input.blindedElement,
          ip,
          sessionUserId: null,
          powChallenge: undefined,
          powSolution: undefined,
        });
      }),
    ),
  });
}
