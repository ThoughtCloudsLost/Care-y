import {
  updateDisplayNameSchema,
  adminUpdateDisplayNameSchema,
} from "@care-y/shared";
import {
  router,
  authedProcedure,
  adminProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import {
  createScopedAuthService,
  createTenantSessions,
  type AuthServiceDeps,
} from "../trpc/context.js";
import type { OrgContext } from "../trpc/context.js";
import type { AuthService } from "../auth/service.js";

export type ProfileRouterDeps = AuthServiceDeps;

function getAuthService(org: OrgContext, deps: ProfileRouterDeps): AuthService {
  const sessions = createTenantSessions(org, deps.tokenizer);
  return createScopedAuthService(org, sessions, deps);
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createProfileRouter(deps: ProfileRouterDeps) {
  return router({
    updateDisplayName: authedProcedure.input(updateDisplayNameSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const authService = getAuthService(ctx.org, deps);
        await authService.updateDisplayName(
          ctx.session.userId,
          Buffer.from(input.encryptedDisplayName, "base64"),
        );
        return { success: true as const };
      }),
    ),

    adminUpdateDisplayName: adminProcedure
      .input(adminUpdateDisplayNameSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const authService = getAuthService(ctx.org, deps);
          await authService.updateDisplayName(
            input.userId,
            Buffer.from(input.encryptedDisplayName, "base64"),
          );
          return { success: true as const };
        }),
      ),
  });
}
