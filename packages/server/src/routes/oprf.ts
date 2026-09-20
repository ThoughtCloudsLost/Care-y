/**
 * OPRF tRPC endpoint.
 *
 * Thin route that delegates to the OprfEvaluateService. The service owns all
 * business logic (rate limiting, PoW gating, failure tracking, delay, audit).
 *
 * evaluate is a publicProcedure so it stays reachable by callers that do not
 * yet hold a session (pre-enrollment first login, portal account creation).
 * For volunteer accounts with enrolled 2FA, the login flow is reordered so
 * the 2FA challenge completes before the client calls evaluate; the route
 * enforces this by checking enrolled methods and twofaVerified on the session
 * before delegating to the service. The service applies a second gate: if a
 * session is present but twofaVerified is false, it rejects the request.
 *
 * Per ADR-091, every evaluation carries a kind ("volunteer" | "account")
 * used server-side to construct the per-identity tag.
 */

import {
  router,
  publicProcedure,
  keyCustodyProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import { oprfEvaluateInputSchema, ErrorCode } from "@care-y/shared";
import { TRPCError } from "@trpc/server";
import { extractClientIp } from "../http/request-utils.js";
import { getEnrolledMethodTypes } from "../auth/two-factor-service.js";
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
        let twofaVerified = false;

        // Volunteer evaluations: when the TARGET user has enrolled 2FA
        // methods, evaluation requires a session for that user with
        // twofaVerified set. The lookup keys off input.userId, not the
        // session user, because the oracle exposure is a caller naming
        // an arbitrary userId; and the absence of a session is a
        // rejection, not an exemption, or dropping the cookie would
        // bypass the gate. Pre-enrollment users (no enrolled methods)
        // are exempt: they have nothing to verify against. Account
        // (portal) evaluations skip the gate; they have no 2FA.
        if (input.kind === "volunteer") {
          if (ctx.org === null) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: ErrorCode.NOT_AUTHENTICATED,
            });
          }
          const enrolled = await getEnrolledMethodTypes(
            ctx.org.tenantDb,
            input.userId,
          );
          if (enrolled.length > 0) {
            if (
              ctx.session === null ||
              ctx.user === null ||
              !ctx.session.twofaVerified
            ) {
              throw new TRPCError({
                code: "UNAUTHORIZED",
                message: ErrorCode.TWOFA_REQUIRED,
              });
            }
          }
          // Enrolled and verified, or pre-enrollment: the requirement
          // is met either way; tell the service so its second gate
          // agrees.
          twofaVerified = true;
        }

        return deps.oprfService.evaluate({
          kind: input.kind,
          userId: input.userId,
          blindedElement: input.blindedElement,
          ip,
          sessionUserId,
          twofaVerified,
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
    adminEvaluate: keyCustodyProcedure.input(oprfEvaluateInputSchema).mutation(
      withErrorWrapping(async ({ input, ctx }) => {
        const ip = extractClientIp(ctx.req);

        return deps.oprfService.adminEvaluate({
          kind: input.kind,
          userId: input.userId,
          blindedElement: input.blindedElement,
          ip,
          sessionUserId: null,
          twofaVerified: true, // keyCustodyProcedure requires 2FA
          powChallenge: undefined,
          powSolution: undefined,
        });
      }),
    ),
  });
}
