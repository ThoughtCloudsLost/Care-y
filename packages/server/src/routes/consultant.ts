/**
 * Volunteer self-service routes for personal phone registration.
 *
 * Volunteers register metadata (preferred call method, SMS pings opt-in)
 * via tRPC. Phone numbers are submitted exclusively through the relay
 * verification endpoint (ADR-065: single write path). The server never
 * sees plaintext phone numbers in tRPC inputs.
 *
 * All endpoints require org + auth + completed 2FA (authed2faProcedure).
 */

import { router, authed2faProcedure, withErrorWrapping } from "../trpc/trpc.js";
import {
  createConsultantService,
  type ConsultantService,
} from "../telephony/consultant-service.js";
import type { OrgContext } from "../trpc/context.js";
import {
  registerConsultantInputSchema,
  updateConsultantInputSchema,
  verifyConsultantInputSchema,
} from "@care-y/shared";
import { z } from "zod";

export interface ConsultantRouterDeps {
  readonly createService: (
    tenantDb: OrgContext["tenantDb"],
  ) => ConsultantService;
}

const defaultDeps: ConsultantRouterDeps = {
  createService: createConsultantService,
};

const setSmsPingsInputSchema = z.object({
  enabled: z.boolean(),
});

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createConsultantRouter(
  deps: ConsultantRouterDeps = defaultDeps,
) {
  const { createService } = deps;

  return router({
    get: authed2faProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createService(ctx.org.tenantDb);
        return svc.getByUserId(ctx.user.id);
      }),
    ),

    register: authed2faProcedure.input(registerConsultantInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createService(ctx.org.tenantDb);
        return svc.register(
          ctx.user.id,
          input.preferredCallMethod,
          input.smsPingsOptIn,
        );
      }),
    ),

    verify: authed2faProcedure.input(verifyConsultantInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createService(ctx.org.tenantDb);
        await svc.verify(ctx.user.id, input.code);
        return { success: true as const };
      }),
    ),

    updatePreference: authed2faProcedure
      .input(updateConsultantInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createService(ctx.org.tenantDb);
          if (input.preferredCallMethod !== undefined) {
            await svc.updatePreference(ctx.user.id, input.preferredCallMethod);
          }
          return { success: true as const };
        }),
      ),

    setSmsPings: authed2faProcedure.input(setSmsPingsInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createService(ctx.org.tenantDb);
        await svc.setSmsPings(ctx.user.id, input.enabled);
        return { success: true as const };
      }),
    ),

    delete: authed2faProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createService(ctx.org.tenantDb);
        await svc.deleteByUserId(ctx.user.id);
        return { success: true as const };
      }),
    ),
  });
}
