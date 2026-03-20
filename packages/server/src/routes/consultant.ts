/**
 * Volunteer self-service routes for personal phone registration.
 *
 * Volunteers register their personal phone number (client-side sealed-box
 * encrypted) for callback flows. Business logic (code generation, hashing,
 * verification, lookup) is delegated to ConsultantService.
 *
 * All endpoints require org + auth + completed 2FA (authed2faProcedure).
 * The server never sees or returns the plaintext phone number.
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

export interface ConsultantRouterDeps {
  readonly createService: (
    tenantDb: OrgContext["tenantDb"],
  ) => ConsultantService;
}

const defaultDeps: ConsultantRouterDeps = {
  createService: createConsultantService,
};

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
        const encryptedPhone = Buffer.from(input.encryptedPhone, "base64");
        return svc.register(
          ctx.user.id,
          encryptedPhone,
          input.phoneHash,
          input.preferredCallMethod,
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

    delete: authed2faProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createService(ctx.org.tenantDb);
        await svc.deleteByUserId(ctx.user.id);
        return { success: true as const };
      }),
    ),
  });
}
