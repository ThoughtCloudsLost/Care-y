import {
  updateDisplayNameSchema,
  adminUpdateDisplayNameSchema,
  updateUsernameSchema,
  adminUpdateUsernameSchema,
  changePasswordSchema,
} from "@care-y/shared";
import { encode } from "@care-y/crypto";
import { createKeyRotationService } from "../crypto/key-rotation.js";
import {
  ConflictError,
  ForbiddenError,
  RateLimitError,
  ValidationError,
} from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import { extractClientIp } from "../http/request-utils.js";
import {
  router,
  authedProcedure,
  adminProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import { TRPCError } from "@trpc/server";
import {
  createScopedAuthService,
  createTenantSessions,
  type AuthServiceDeps,
} from "../trpc/context.js";
import type { OrgContext } from "../trpc/context.js";
import type { AuthService } from "../auth/service.js";

export interface ProfileRouterDeps extends AuthServiceDeps {
  readonly passwordChangeLimiter: RateLimiter;
}

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

    // Atomic password change: verifies old password, hashes new,
    // rotates crypto keys, and kills other sessions in a single request.
    // updatePasswordHash and applyRotation are separate DB transactions
    // within this handler. A server crash between them could leave
    // stale crypto keys (password changed, keys not rotated). This
    // window is milliseconds on controlled infrastructure vs. the
    // minutes-long client-side gap this replaces.
    changePassword: authedProcedure.input(changePasswordSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);
        const result = deps.passwordChangeLimiter.check(
          `pw:${ctx.session.userId}:${ip}`,
        );
        if (!result.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: ErrorCode.REQUEST_RATE_LIMITED,
            cause: new RateLimitError(
              ErrorCode.REQUEST_RATE_LIMITED,
              Math.ceil(result.retryAfterMs / 1000),
            ),
          });
        }

        const authService = getAuthService(ctx.org, deps);
        const keyRotation = createKeyRotationService(ctx.org.tenantDb);
        const userId = ctx.session.userId;

        await authService.updatePasswordHash(
          userId,
          ctx.session.token,
          input.currentPassword,
          input.newPassword,
        );

        await keyRotation.acquireLock(userId);
        let rotationSucceeded = false;
        try {
          await keyRotation.applyRotation({
            userId,
            saltNew: Buffer.from(input.saltNew, "base64"),
            volPublicNew: Buffer.from(input.volPublicNew, "base64"),
            reWrappedKeys: input.reWrappedKeys.map((k) => ({
              ticketId: k.ticketId,
              keyGeneration: k.keyGeneration,
              ephemeralPoint: Buffer.from(k.ephemeralPoint, "base64"),
              nonce: Buffer.from(k.nonce, "base64"),
              wrappedKey: Buffer.from(k.wrappedKey, "base64"),
            })),
            reWrappedOrgKey: input.reWrappedOrgKey
              ? {
                  ephemeralPoint: Buffer.from(
                    input.reWrappedOrgKey.ephemeralPoint,
                    "base64",
                  ),
                  nonce: Buffer.from(input.reWrappedOrgKey.nonce, "base64"),
                  wrappedKey: Buffer.from(
                    input.reWrappedOrgKey.wrappedKey,
                    "base64",
                  ),
                }
              : undefined,
          });
          rotationSucceeded = true;
        } finally {
          if (!rotationSucceeded) {
            // eslint-disable-next-line @typescript-eslint/no-empty-function -- intentional: don't mask the original rotation error
            await keyRotation.releaseLock(userId).catch(() => {});
          }
        }

        return { success: true as const };
      }),
    ),

    myTicketKeyWraps: authedProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const rows = await ctx.org.tenantDb
          .selectFrom("ticket_key_wraps")
          .select([
            "ticket_id",
            "key_generation",
            "ephemeral_point",
            "nonce",
            "wrapped_key",
          ])
          .where("volunteer_id", "=", ctx.session.userId)
          .execute();

        return rows.map((r) => ({
          ticketId: r.ticket_id,
          keyGeneration: r.key_generation,
          ephemeralPoint: encode(r.ephemeral_point),
          nonce: encode(r.nonce),
          wrappedKey: encode(r.wrapped_key),
        }));
      }),
    ),
  });
}
