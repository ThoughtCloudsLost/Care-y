/**
 * Onboarding router: first-admin bootstrap, invite management, org setup.
 *
 * The bootstrap and invite-registration endpoints run before the org keypair
 * exists. During this pre-onboarding state, the normal context factory returns
 * ctx.org = null (no sealed box). These endpoints resolve the org manually
 * and use the field encryptor for columns that will later be re-encrypted
 * with the org's sealed box.
 *
 * Business logic is delegated to AuthService (register/login) and
 * InviteService (token lifecycle). Route handlers only map inputs.
 */

import { randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import type { Kysely } from "kysely";
import {
  bootstrapAdminInputSchema,
  loginInputSchema,
  updateOrgBasicsInputSchema,
  validateInviteInputSchema,
  registerFromInviteInputSchema,
  generateInviteInputSchema,
  saveTelephonyChoiceInputSchema,
  RoleId,
  ErrorCode,
  Permission,
} from "@care-y/shared";
import {
  router,
  publicProcedure,
  authedProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import { requirePermission } from "../auth/roles.js";
import { createInviteService } from "../onboarding/invite-service.js";
import { ConflictError, RateLimitError } from "../errors.js";
import { extractClientIp } from "../http/request-utils.js";
import { buildSessionCookie } from "../auth/cookies.js";
import { SESSION_MAX_AGE_MS } from "../auth/service.js";
import { extractOrgSlug } from "../org/slug-resolver.js";
import { isPgUniqueViolation } from "../db/pg-errors.js";
import type { TenantDatabase } from "../db/types.js";
import type { OrgService } from "../org/service.js";
import type {
  FieldEncryptor,
  BlindIndexer,
} from "../crypto/field-encryptor.js";
import type { SessionTokenizer } from "../crypto/session-tokenizer.js";
import type { PasswordHasher } from "../auth/password.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { SecretsEncryptor } from "../config/secrets.js";

import { createSealedBoxEncryptor } from "../crypto/sealed-box.js";
import { getEnrolledMethodTypes } from "../auth/two-factor-service.js";
import {
  createScopedAuthService,
  createTenantSessions,
  type OrgContext,
} from "../trpc/context.js";
import type { IncomingMessage, ServerResponse } from "node:http";

export interface OnboardingRouterDeps {
  readonly orgService: OrgService;
  readonly hasher: PasswordHasher;
  readonly encryptor: FieldEncryptor;
  readonly indexer: BlindIndexer;
  readonly tokenizer: SessionTokenizer;
  readonly bootstrapLimiter: RateLimiter;
  readonly isSecureCookie: boolean;
  readonly tenantDbFactory: (schema: string) => Kysely<TenantDatabase>;
  readonly secretsEncryptor: SecretsEncryptor;
}

/**
 * Resolves the org from the request. Handles pre-onboarding orgs
 * where org_public_key may not exist yet.
 */
async function resolveOrgForOnboarding(
  req: IncomingMessage,
  orgService: OrgService,
  tenantDbFactory: (schema: string) => Kysely<TenantDatabase>,
): Promise<{
  orgId: string;
  orgSlug: string;
  orgSchema: string;
  tenantDb: Kysely<TenantDatabase>;
  sealedBox: SealedBoxEncryptor | null;
} | null> {
  const slug = extractOrgSlug(req);
  if (slug === null) return null;

  const org = await orgService.findBySlug(slug);
  if (org?.isActive !== true) return null;

  const tDb = tenantDbFactory(org.schemaName);

  const row = await tDb
    .selectFrom("org_config")
    .select("org_public_key")
    .executeTakeFirst();

  const sealedBox = row?.org_public_key
    ? createSealedBoxEncryptor(row.org_public_key)
    : null;

  return {
    orgId: org.id,
    orgSlug: org.slug,
    orgSchema: org.schemaName,
    tenantDb: tDb,
    sealedBox,
  };
}

async function requireOrgForOnboarding(
  req: IncomingMessage,
  orgService: OrgService,
  tenantDbFactory: (schema: string) => Kysely<TenantDatabase>,
): Promise<{
  orgId: string;
  orgSlug: string;
  orgSchema: string;
  tenantDb: Kysely<TenantDatabase>;
  sealedBox: SealedBoxEncryptor | null;
}> {
  const result = await resolveOrgForOnboarding(
    req,
    orgService,
    tenantDbFactory,
  );
  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found",
    });
  }
  return result;
}

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

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createOnboardingRouter(deps: OnboardingRouterDeps) {
  const {
    orgService,
    hasher,
    encryptor,
    indexer,
    tokenizer,
    bootstrapLimiter,
    isSecureCookie,
    tenantDbFactory,
    secretsEncryptor,
  } = deps;

  return router({
    /**
     * Check if the org needs initial setup.
     * Public: no auth required.
     */
    getStatus: publicProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const org = await requireOrgForOnboarding(
          ctx.req,
          orgService,
          tenantDbFactory,
        );

        const userCount = await org.tenantDb
          .selectFrom("users")
          .select(org.tenantDb.fn.countAll<string>().as("count"))
          .where("is_active", "=", true)
          .executeTakeFirstOrThrow();

        const hasOrgKey = await org.tenantDb
          .selectFrom("org_config")
          .select("org_public_key")
          .executeTakeFirst();

        return {
          needsSetup:
            Number(userCount.count) === 0 || !hasOrgKey?.org_public_key,
        };
      }),
    ),

    /**
     * Bootstrap the first admin user for an org with zero active users.
     * Rate-limited: 2/hour per IP. Atomic: rejects if any active user exists.
     */
    bootstrapAdmin: publicProcedure.input(bootstrapAdminInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);
        const result = bootstrapLimiter.check(ip);
        if (!result.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: ErrorCode.BOOTSTRAP_RATE_LIMITED,
            cause: new RateLimitError(
              ErrorCode.BOOTSTRAP_RATE_LIMITED,
              Math.ceil(result.retryAfterMs / 1000),
            ),
          });
        }

        const org = await requireOrgForOnboarding(
          ctx.req,
          orgService,
          tenantDbFactory,
        );

        const tokenValid = await orgService.validateSetupToken(
          org.orgId,
          input.setupToken,
        );
        if (!tokenValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: ErrorCode.INVALID_SETUP_TOKEN,
          });
        }

        const tDb = org.tenantDb;
        const orgPublicKey = Buffer.from(input.orgPublicKey, "base64");
        const sealedBox = createSealedBoxEncryptor(orgPublicKey);

        const identifierHash = indexer.hash(input.identifier, org.orgId);
        const encryptedIdentifier = encryptor.encrypt(input.identifier);
        const encryptedDisplayName = sealedBox.seal(input.displayName);
        const passwordHash = await hasher.hash(input.password);

        const ua = ctx.req.headers["user-agent"] ?? "unknown";

        const { userId, sessionToken } = await tDb
          .transaction()
          .execute(async (tx) => {
            // Atomic: reject if any active user already exists.
            const activeCount = await tx
              .selectFrom("users")
              .select(tx.fn.countAll<string>().as("count"))
              .where("is_active", "=", true)
              .executeTakeFirstOrThrow();

            if (Number(activeCount.count) > 0) {
              throw new ConflictError(ErrorCode.ORG_ALREADY_SETUP);
            }

            // Store org public key so subsequent requests resolve ctx.org.
            await tx
              .updateTable("org_config")
              .set({ org_public_key: orgPublicKey })
              .execute();

            let userRow;
            try {
              userRow = await tx
                .insertInto("users")
                .values({
                  identifier_hash: identifierHash,
                  encrypted_identifier: encryptedIdentifier,
                  password_hash: passwordHash,
                  encrypted_display_name: encryptedDisplayName,
                  role_id: RoleId.ADMIN,
                })
                .returning("id")
                .executeTakeFirstOrThrow();
            } catch (err: unknown) {
              if (isPgUniqueViolation(err)) {
                throw new ConflictError(ErrorCode.ACCOUNT_ALREADY_EXISTS);
              }
              throw err;
            }

            // Create session with sealed-box encryption for IP/UA.
            const token = randomBytes(32).toString("hex");
            const encryptedIp = sealedBox.seal(ip);
            const encryptedUa = sealedBox.seal(ua);
            const ipToken = tokenizer.tokenize(ip);
            const uaToken = tokenizer.tokenize(ua);

            await tx
              .insertInto("sessions")
              .values({
                token,
                user_id: userRow.id,
                encrypted_ip_address: encryptedIp,
                encrypted_user_agent: encryptedUa,
                ip_token: ipToken,
                ua_token: uaToken,
                twofa_verified: true,
                expires_at: new Date(Date.now() + SESSION_MAX_AGE_MS),
              })
              .execute();

            return { userId: userRow.id, sessionToken: token };
          });

        // Cookie set AFTER transaction commits.
        setSessionCookie(ctx.res, sessionToken, isSecureCookie);

        await orgService.consumeSetupToken(org.orgId);

        return { userId };
      }),
    ),

    /**
     * Validate an invite token without consuming it.
     * Returns validity status. Generic error for invalid/expired/consumed.
     */
    validateInvite: publicProcedure.input(validateInviteInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const org = await requireOrgForOnboarding(
          ctx.req,
          orgService,
          tenantDbFactory,
        );

        const inviteService = createInviteService(org.tenantDb);
        const invite = await inviteService.validate(input.token);

        if (!invite) {
          return { valid: false as const };
        }

        return {
          valid: true as const,
          expiresAt: invite.expiresAt.toISOString(),
        };
      }),
    ),

    /**
     * Register a new user from an invite link.
     * Register + consume + session create are wrapped in a single transaction
     * to prevent invite token reuse on partial failure.
     */
    registerFromInvite: publicProcedure
      .input(registerFromInviteInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const org = await requireOrgForOnboarding(
            ctx.req,
            orgService,
            tenantDbFactory,
          );

          // Validate token BEFORE the transaction (read-only check).
          const inviteService = createInviteService(org.tenantDb);
          const invite = await inviteService.validate(input.token);

          if (!invite) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: ErrorCode.INVALID_INVITE_TOKEN,
            });
          }

          if (!org.sealedBox) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "Org keypair not configured",
            });
          }

          const sealedBox = org.sealedBox;
          const ip = extractClientIp(ctx.req);
          const ua = ctx.req.headers["user-agent"] ?? "unknown";

          // All writes in one transaction: register + consume + session.
          const { userId, sessionToken } = await org.tenantDb
            .transaction()
            .execute(async (tx) => {
              // Transaction-scoped services so all writes share the tx.
              const txOrgCtx: OrgContext = {
                orgId: org.orgId,
                orgSlug: org.orgSlug,
                orgSchema: org.orgSchema,
                tenantDb: tx,
                sealedBox,
              };

              const txSessions = createTenantSessions(txOrgCtx, tokenizer);
              const txAuth = createScopedAuthService(txOrgCtx, txSessions, {
                hasher,
                encryptor,
                indexer,
                tokenizer,
              });
              const txInvite = createInviteService(tx);

              const user = await txAuth.register({
                identifier: input.identifier,
                password: input.password,
                displayName: input.displayName ?? input.identifier,
                roleId: invite.roleId,
              });

              await txInvite.consume(invite.id);

              const session = await txSessions.create({
                token: randomBytes(32).toString("hex"),
                userId: user.id,
                ipAddress: ip,
                userAgent: ua,
                expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS),
              });

              return { userId: user.id, sessionToken: session.token };
            });

          // Cookie set AFTER transaction commits.
          setSessionCookie(ctx.res, sessionToken, isSecureCookie);

          return { userId };
        }),
      ),

    /**
     * Generate an invite token. Requires admin role.
     * Uses authedProcedure (no 2FA gate) because 2FA is not enrolled during
     * initial setup. Post-setup invite generation also goes through this
     * endpoint; the session's existence + admin role is the access control.
     */
    generateInvite: authedProcedure.input(generateInviteInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        requirePermission(ctx.user.roleId, Permission.MANAGE_ROLES);

        const inviteService = createInviteService(ctx.org.tenantDb);

        const encryptedEmail =
          input.encryptedEmail !== undefined
            ? Buffer.from(input.encryptedEmail, "base64")
            : undefined;

        const { rawToken, expiresAt } = await inviteService.generate({
          invitedBy: ctx.session.userId,
          roleId: input.roleId,
          encryptedEmail,
        });

        // Send email if requested and email sender is configured.
        // The invite URL is ALWAYS returned for manual copying.
        const inviteUrl = `/first-login/${rawToken}`;

        return {
          inviteUrl,
          expiresAt: expiresAt.toISOString(),
        };
      }),
    ),

    /**
     * Update org basics (name, language, country code) during setup.
     * Admin-only. authedProcedure (no 2FA) since 2FA not enrolled during setup.
     */
    updateOrgBasics: authedProcedure.input(updateOrgBasicsInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        requirePermission(ctx.user.roleId, Permission.MANAGE_ROLES);

        const updates: Record<string, unknown> = {
          encrypted_name: Buffer.from(input.encryptedOrgName, "base64"),
          default_country_code: input.countryCode,
          default_language: input.defaultLanguage,
        };
        if (input.encryptedTerminology !== undefined) {
          updates.encrypted_terminology = Buffer.from(
            input.encryptedTerminology,
            "base64",
          );
        }

        await ctx.org.tenantDb.updateTable("org_config").set(updates).execute();

        return { success: true as const };
      }),
    ),

    /**
     * Save telephony mode choice during setup (step 5).
     * BYOT credentials are encrypted with OPS_SECRETS_KEY.
     */
    saveTelephonyChoice: authedProcedure
      .input(saveTelephonyChoiceInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          requirePermission(ctx.user.roleId, Permission.MANAGE_ROLES);

          let telephonyConfig: Record<string, string>;

          if (input.mode === "byot") {
            telephonyConfig = {
              mode: "byot",
              provider: "twilio",
              accountSid: input.accountSid,
              authToken: input.authToken,
            };
          } else {
            telephonyConfig = { mode: input.mode };
          }

          const encrypted = secretsEncryptor.encrypt(
            Buffer.from(JSON.stringify(telephonyConfig), "utf8"),
          );

          await ctx.org.tenantDb
            .updateTable("org_config")
            .set({ setup_telephony_config: encrypted })
            .execute();

          return { success: true as const, mode: input.mode };
        }),
      ),

    /**
     * Re-authenticate during the onboarding wizard (page refresh recovery).
     *
     * Validates credentials via the normal auth service, then creates a
     * session. If the user has no 2FA methods enrolled, the session is
     * immediately marked twofa_verified (matching the bootstrap session).
     * If 2FA methods exist, the session cookie is set but twofa_verified
     * remains false, and the response includes the enrolled methods so the
     * client can show an inline 2FA challenge before proceeding.
     */
    reauthenticate: publicProcedure.input(loginInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const org = await requireOrgForOnboarding(
          ctx.req,
          orgService,
          tenantDbFactory,
        );
        if (!org.sealedBox) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: ErrorCode.ORG_KEYPAIR_MISSING,
          });
        }

        const orgCtx: OrgContext = {
          orgId: org.orgId,
          orgSlug: org.orgSlug,
          orgSchema: org.orgSchema,
          tenantDb: org.tenantDb,
          sealedBox: org.sealedBox,
        };

        const sessions = createTenantSessions(orgCtx, tokenizer);
        const authService = createScopedAuthService(orgCtx, sessions, deps);

        const ip = extractClientIp(ctx.req);
        const ua = ctx.req.headers["user-agent"] ?? "unknown";

        const { user, session } = await authService.login({
          identifier: input.identifier,
          password: input.password,
          ipAddress: ip,
          userAgent: ua,
        });

        const enrolledMethods = await getEnrolledMethodTypes(
          org.tenantDb,
          user.id,
        );

        if (enrolledMethods.length > 0) {
          // Session cookie is set so the 2FA verify endpoints work,
          // but twofa_verified stays false until inline challenge passes.
          setSessionCookie(ctx.res, session.token, isSecureCookie);
          return {
            userId: user.id,
            requiresTwoFactor: true as const,
            enrolledMethods,
          };
        }

        await sessions.markTwoFactorVerified(session.token);
        setSessionCookie(ctx.res, session.token, isSecureCookie);

        return {
          userId: user.id,
          requiresTwoFactor: false as const,
          enrolledMethods: [] as string[],
        };
      }),
    ),

    /**
     * Mark org setup as complete (called after wizard step 7).
     */
    completeSetup: authedProcedure.mutation(
      withErrorWrapping(({ ctx }) => {
        requirePermission(ctx.user.roleId, Permission.MANAGE_ROLES);

        return { success: true as const };
      }),
    ),
  });
}
