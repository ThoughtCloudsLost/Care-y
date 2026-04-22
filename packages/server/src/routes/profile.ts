import {
  updateDisplayNameSchema,
  adminUpdateDisplayNameSchema,
  updateUsernameSchema,
  adminUpdateUsernameSchema,
} from "@care-y/shared";
import { ConflictError, ForbiddenError, ValidationError } from "../errors.js";
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

    updateUsername: authedProcedure.input(updateUsernameSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const authService = getAuthService(ctx.org, deps);
        try {
          await authService.updateUsername(
            ctx.session.userId,
            input.newIdentifier,
            input.currentPassword,
          );
        } catch (err: unknown) {
          // Suppress USERNAME_ALREADY_TAKEN to prevent enumeration.
          // Self-service callers learn only that the change failed.
          if (err instanceof ConflictError) {
            throw new ValidationError("Could not update username");
          }
          throw err;
        }
        return { success: true as const };
      }),
    ),

    adminUpdateUsername: adminProcedure
      .input(adminUpdateUsernameSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          if (input.userId === ctx.session.userId) {
            throw new ForbiddenError(
              "Use self-service endpoint to change your own username",
            );
          }
          const authService = getAuthService(ctx.org, deps);
          await authService.updateUsername(input.userId, input.newIdentifier);
          return { success: true as const };
        }),
      ),
  });
}
