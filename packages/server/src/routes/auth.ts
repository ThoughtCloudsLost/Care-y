/**
 * Auth router: login, register, logout, me.
 *
 * Login and register create per-request AuthService instances from the
 * resolved org's tenant DB. The rate limiter and hasher are singletons
 * injected at startup via the factory.
 *
 * Login is rate-limited per IP. Register requires an authenticated caller
 * (invite-only). Logout clears the session cookie. me returns the current
 * user's non-sensitive profile.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { getEnv } from "../env.js";
import {
  loginInputSchema,
  registerInputSchema,
  getSaltInputSchema,
  assignRoleInputSchema,
  setPiiRetentionInputSchema,
  setUserActiveInputSchema,
  setRolePermissionInputSchema,
  RoleId,
  Permission,
  ErrorCode,
  ROLE_ID_VALUES,
} from "@care-y/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  router,
  orgProcedure,
  authedProcedure,
  adminProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import {
  getDefaultRoleId,
  isValidRoleId,
  hasPermissionForOrg,
  getEffectivePermissions,
  LOCKED_PERMISSIONS,
  invalidateRolePermissionCache,
  listAllOverrides,
  computeOverridden,
  isDefaultEnabled,
  upsertOverride,
  deleteOverride,
  deleteAllOverrides,
} from "../auth/roles.js";
import type { AuditService } from "../tickets/audit.js";
import { ForbiddenError, NotFoundError, RateLimitError } from "../errors.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type { UserRecord, AuthService } from "../auth/service.js";
import { SESSION_MAX_AGE_MS } from "../auth/service.js";
import {
  buildSessionCookie,
  buildClearSessionCookie,
} from "../auth/cookies.js";
import { extractClientIp } from "../http/request-utils.js";
import {
  createScopedAuthService,
  createTenantSessions,
  type AuthServiceDeps,
} from "../trpc/context.js";
import { createUserService } from "../users/user-service.js";
import { createSaltDefense } from "../auth/salt-defense.js";
import { encode } from "@care-y/crypto";
import type { OrgContext } from "../trpc/context.js";
import type { EmailSender } from "../email/email-sender.js";
import { createScopedTwoFactorServices } from "./two-factor.js";
import type { ProviderFactory } from "../telephony/factory.js";
import type { CallerIdResolver } from "../auth/sms-code.js";
import { getReachabilityForUsers } from "../telephony/reachability.js";
import type { TotpReplayCache } from "../auth/totp-replay-cache.js";

export interface AuthRouterDeps extends AuthServiceDeps {
  readonly loginLimiter: RateLimiter;
  readonly saltLimiter: RateLimiter;
  readonly fakeSaltKey: Buffer;
  readonly isSecureCookie: boolean;
  readonly emailSender: EmailSender;
  readonly providerFactory: ProviderFactory;
  readonly resolveCallerId: CallerIdResolver;
  /**
   * Process-wide accepted-code cache. Must be the same instance the
   * two-factor router receives, or a code accepted on one path could
   * replay on the other.
   */
  readonly totpReplayCache: TotpReplayCache;
  /** Factory for audit logging. Optional to avoid breaking existing callers. */
  readonly createAuditSvc?: (tDb: OrgContext["tenantDb"]) => AuditService;
}

/** Safe response shape: no password_hash, no internal fields. */
export interface UserResponse {
  readonly id: string;
  readonly encryptedIdentifier: string; // base64 sealed ciphertext, client decrypts (ADR-052)
  readonly encryptedDisplayName: string; // base64 ciphertext, client decrypts
  readonly encryptedPreferredLocale: string | null; // base64 ciphertext, client decrypts
  readonly roleId: string;
  readonly hasSeenBriefing: boolean;
}

/** Projects a UserRecord to a safe response shape (no password_hash, no internal fields). */
function toUserResponse(user: UserRecord): UserResponse {
  return {
    id: user.id,
    encryptedIdentifier: user.encryptedIdentifier,
    encryptedDisplayName: user.encryptedDisplayName,
    encryptedPreferredLocale: user.encryptedPreferredLocale,
    roleId: user.roleId,
    hasSeenBriefing: user.hasSeenBriefing,
  };
}

function getAuthService(org: OrgContext, deps: AuthRouterDeps): AuthService {
  const sessions = createTenantSessions(org, deps.tokenizer);
  return createScopedAuthService(org, sessions, deps);
}

/**
 * Enforces per-IP rate limiting. Throws TOO_MANY_REQUESTS if the limit is
 * exceeded. The key parameter allows separate rate limit buckets (e.g.
 * raw IP for login, "salt:<ip>" for the salt endpoint). Never reveals
 * whether the limit was hit due to IP saturation or a specific username.
 */
function enforceRateLimit(
  limiter: RateLimiter,
  key: string,
  errorCode: string,
): void {
  const result = limiter.check(key);
  if (!result.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: errorCode,
      cause: new RateLimitError(
        errorCode,
        Math.ceil(result.retryAfterMs / 1000),
      ),
    });
  }
}

/** Sets the session cookie on the response after a successful login. */
function setSessionCookie(
  res: ServerResponse,
  token: string,
  isSecure: boolean,
): void {
  const maxAgeSeconds = Math.floor(SESSION_MAX_AGE_MS / 1000);
  res.setHeader(
    "Set-Cookie",
    buildSessionCookie(token, maxAgeSeconds, isSecure),
  );
}

/**
 * Enforces rate limiting, then delegates salt lookup to the SaltDefense
 * module. Returns the salt as url-safe base64 (no padding) and the userId
 * (real or deterministic fake) for the OPRF endpoint.
 */
async function handleGetSalt(
  org: OrgContext,
  deps: AuthServiceDeps,
  fakeSaltKey: Buffer,
  saltLimiter: RateLimiter,
  req: IncomingMessage,
  identifier: string,
): Promise<{ salt: string; userId: string }> {
  enforceRateLimit(
    saltLimiter,
    `salt:${extractClientIp(req)}`,
    ErrorCode.REQUEST_RATE_LIMITED,
  );
  const saltDefense = createSaltDefense(
    org.tenantDb,
    { fakeSaltKey, orgUuid: org.orgId },
    deps.indexer,
  );
  const result = await saltDefense.getSalt(identifier);
  return { salt: encode(result.salt), userId: result.userId };
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createAuthRouter(deps: AuthRouterDeps) {
  const { loginLimiter, saltLimiter, fakeSaltKey, isSecureCookie } = deps;

  return router({
    getSalt: orgProcedure
      .input(getSaltInputSchema)
      .query(async ({ ctx, input }) =>
        handleGetSalt(
          ctx.org,
          deps,
          fakeSaltKey,
          saltLimiter,
          ctx.req,
          input.identifier,
        ),
      ),

    login: orgProcedure.input(loginInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);
        enforceRateLimit(loginLimiter, ip, ErrorCode.LOGIN_RATE_LIMITED);

        const sessions = createTenantSessions(ctx.org, deps.tokenizer);
        const authService = createScopedAuthService(ctx.org, sessions, deps);

        const { user, session } = await authService.login({
          identifier: input.identifier,
          password: input.password,
          ipAddress: ip,
          userAgent: ctx.req.headers["user-agent"] ?? "unknown",
        });

        setSessionCookie(ctx.res, session.token, isSecureCookie);

        const { twoFactor } = await createScopedTwoFactorServices(
          ctx.org,
          sessions,
          {
            emailSender: deps.emailSender,
            encryptor: deps.encryptor,
            indexer: deps.indexer,
            tokenizer: deps.tokenizer,
            providerFactory: deps.providerFactory,
            resolveCallerId: deps.resolveCallerId,
            pushSender: null,
            pushHmacKey: null,
            totpReplayCache: deps.totpReplayCache,
          },
        );
        const [enrolledMethods, hasKeys] = await Promise.all([
          twoFactor.getEnrolledMethodTypes(user.id),
          authService.hasUserKeys(user.id),
        ]);

        const needsEnrollment = enrolledMethods.length === 0;

        return {
          user: toUserResponse(user),
          requiresTwoFactor: enrolledMethods.length > 0,
          enrolledMethods,
          needsEnrollment,
          hasKeys,
        };
      }),
    ),

    register: authedProcedure
      .input(
        registerInputSchema.extend({
          roleId: assignRoleInputSchema.shape.roleId.optional(),
        }),
      )
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const effectiveRoleId = input.roleId ?? getDefaultRoleId();

          // Non-default roles require MANAGE_ROLES permission.
          if (effectiveRoleId !== getDefaultRoleId()) {
            const canAssign = await hasPermissionForOrg(
              ctx.org.tenantDb,
              ctx.org.orgSchema,
              ctx.user.roleId,
              Permission.MANAGE_ROLES,
            );
            if (!canAssign) {
              throw new ForbiddenError(ErrorCode.ONLY_ADMINS_CAN_ASSIGN_ROLES);
            }
          }

          const authService = getAuthService(ctx.org, deps);
          const user = await authService.register({
            identifier: input.identifier,
            password: input.password,
            displayName: input.displayName,
            ...(input.notificationEmail !== undefined && {
              notificationEmail: input.notificationEmail,
            }),
            roleId: effectiveRoleId,
          });

          return { user: toUserResponse(user) };
        }),
      ),

    logout: authedProcedure.mutation(async ({ ctx }) => {
      const authService = getAuthService(ctx.org, deps);
      await authService.logout(ctx.session.token);
      ctx.res.setHeader("Set-Cookie", buildClearSessionCookie());

      return { success: true as const };
    }),

    me: authedProcedure.query(async ({ ctx }) => {
      const { roleId } = ctx.user;
      let permissions: Permission[] = [];
      if (isValidRoleId(roleId)) {
        const effective = await getEffectivePermissions(
          ctx.org.tenantDb,
          ctx.org.orgSchema,
          roleId,
        );
        permissions = [...effective];
      }
      return {
        user: toUserResponse(ctx.user),
        permissions,
        twofaVerified: ctx.session.twofaVerified,
      };
    }),

    assignRole: adminProcedure.input(assignRoleInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        // Self-assignment protection: admins cannot change their own role.
        if (input.userId === ctx.user.id) {
          throw new ForbiddenError(ErrorCode.CANNOT_CHANGE_OWN_ROLE);
        }

        const authService = getAuthService(ctx.org, deps);
        const targetUser = await authService.findUserById(input.userId);
        if (!targetUser) {
          throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
        }

        // Last-admin protection: if demoting an admin, ensure at least one other remains.
        if (
          targetUser.roleId === RoleId.ADMIN &&
          input.roleId !== RoleId.ADMIN
        ) {
          const adminCount = await authService.countActiveAdmins();
          if (adminCount <= 1) {
            throw new ForbiddenError(ErrorCode.CANNOT_DEMOTE_LAST_ADMIN);
          }
        }

        const updated = await authService.updateUserRole(
          input.userId,
          input.roleId,
        );
        return { user: toUserResponse(updated) };
      }),
    ),

    setPiiRetention: adminProcedure.input(setPiiRetentionInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const authService = getAuthService(ctx.org, deps);
        await authService.setPiiRetentionDays(input.days);
        return { success: true as const };
      }),
    ),

    listUsers: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createUserService(ctx.org.tenantDb);
        const users = await svc.listAllForAdmin();
        const userIds = users.map((u) => u.id);
        const reachabilityMap = await getReachabilityForUsers(
          ctx.org.tenantDb,
          userIds,
        );
        return users.map((u) => ({
          id: u.id,
          encryptedIdentifier: u.encryptedIdentifier.toString("base64url"),
          encryptedDisplayName: u.encryptedDisplayName.toString("base64url"),
          roleId: u.roleId,
          isActive: u.isActive,
          hasKeys: u.hasKeys,
          hasOrgKeyWrap: u.hasOrgKeyWrap,
          volPublic: u.volPublic ? u.volPublic.toString("base64url") : null,
          reachability: reachabilityMap.get(u.id) ?? "none",
        }));
      }),
    ),

    setUserActive: adminProcedure.input(setUserActiveInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const authService = getAuthService(ctx.org, deps);
        const updated = await authService.setUserActive(
          ctx.user.id,
          input.userId,
          input.isActive,
        );
        return { user: toUserResponse(updated) };
      }),
    ),

    hubStatus: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const authService = getAuthService(ctx.org, deps);
        return await authService.getHubStatus();
      }),
    ),

    getRolePermissions: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const overrideRows = await listAllOverrides(ctx.org.tenantDb);
        const roles = [];
        for (const roleId of ROLE_ID_VALUES) {
          const effective = await getEffectivePermissions(
            ctx.org.tenantDb,
            ctx.org.orgSchema,
            roleId,
          );
          const overridden = computeOverridden(roleId, overrideRows);
          roles.push({
            roleId,
            permissions: [...effective],
            overridden,
          });
        }
        return {
          roles,
          locked: [...LOCKED_PERMISSIONS],
        };
      }),
    ),

    setRolePermission: adminProcedure
      .input(setRolePermissionInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          if (LOCKED_PERMISSIONS.has(input.permission)) {
            throw new ForbiddenError(ErrorCode.PERMISSION_LOCKED);
          }

          const matchesDefault =
            isDefaultEnabled(input.roleId, input.permission) === input.enabled;

          if (matchesDefault) {
            await deleteOverride(
              ctx.org.tenantDb,
              input.roleId,
              input.permission,
            );
          } else {
            await upsertOverride(
              ctx.org.tenantDb,
              input.roleId,
              input.permission,
              input.enabled,
            );
          }

          if (deps.createAuditSvc) {
            const audit = deps.createAuditSvc(ctx.org.tenantDb);
            void audit.log({
              eventType: "role_permission_changed",
              actorId: ctx.user.id,
              metadata: {
                roleId: input.roleId,
                permission: input.permission,
                enabled: input.enabled,
              },
            });
          }

          invalidateRolePermissionCache(ctx.org.orgSchema);
          return { saved: true as const };
        }),
      ),

    resetRolePermissions: adminProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        await deleteAllOverrides(ctx.org.tenantDb);

        if (deps.createAuditSvc) {
          const audit = deps.createAuditSvc(ctx.org.tenantDb);
          void audit.log({
            eventType: "role_permissions_reset",
            actorId: ctx.user.id,
          });
        }

        invalidateRolePermissionCache(ctx.org.orgSchema);
        return { reset: true as const };
      }),
    ),

    // Dev-only: mark the current session as 2FA-verified without completing
    // a real 2FA challenge. Route does not exist in production builds.
    ...(getEnv().NODE_ENV === "development"
      ? {
          devBypass2fa: authedProcedure.mutation(
            withErrorWrapping(async ({ ctx }) => {
              // authedProcedure guarantees session and org are non-null.
              const sessions = createTenantSessions(ctx.org, deps.tokenizer);
              await sessions.markTwoFactorVerified(ctx.session.token);
              return { success: true as const };
            }),
          ),

          devReEncryptDisplayName: adminProcedure
            .input(
              z.object({
                userId: z.uuid(),
                encryptedDisplayName: z.string().min(1),
              }),
            )
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
        }
      : {}),
  });
}
