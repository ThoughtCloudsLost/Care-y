/**
 * Two-factor authentication router.
 *
 * Three sub-routers:
 *  - enroll: enrollment flows (authedProcedure, no 2FA required yet)
 *  - verify: post-login 2FA challenge (authedProcedure, session not yet verified)
 *  - methods: management of enrolled methods (authed2faProcedure, requires verified session)
 *
 * Per-request services (TwoFactorService, EmailCodeService, SessionRepository)
 * are created from the resolved org's tenant DB. The EmailSender is a singleton
 * injected at startup.
 *
 * Service construction is handled by middleware (injectServices). Error
 * wrapping uses a resolver-level wrapper (withErrorWrapping) because tRPC v11's
 * caller pipeline catches resolver errors before middleware catch blocks execute.
 */

import {
  router,
  middleware,
  authedProcedure,
  authed2faProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import { TRPCError } from "@trpc/server";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type { SessionTokenizer } from "../crypto/session-tokenizer.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { EmailSender } from "../email/email-sender.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { SessionData } from "../auth/session-repository.js";
import type { UserRecord } from "../auth/service.js";
import {
  createTwoFactorService,
  type TwoFactorService,
} from "../auth/two-factor-service.js";
import {
  createEmailCodeService,
  type EmailCodeService,
} from "../auth/email-code.js";
import { createDbSessionRepository } from "../auth/session-repository.js";
import {
  totpVerifySchema,
  emailCodeVerifySchema,
  backupCodeVerifySchema,
  webauthnRegistrationResponseSchema,
  webauthnAssertionResponseSchema,
  removeMethodSchema,
} from "@care-y/shared";

// --- Constants ---

/**
 * RP ID for WebAuthn. Set to the registrable domain so passkeys work
 * across all org subdomains (ADR-017 Decision 5).
 */
const WEBAUTHN_RP_ID = "care-y.app";
const WEBAUTHN_RP_NAME = "CARE-Y";

/**
 * The 2FA issuer name shown in authenticator apps (TOTP otpauth:// URI).
 * Volunteers see "CARE-Y" in their app, not the org name (timestamp
 * minimization: org name in the authenticator app would leak affiliation).
 */
const TOTP_ISSUER = "CARE-Y";

// --- Per-request service factory ---

export interface TwoFactorRouterDeps {
  readonly emailSender: EmailSender;
  readonly encryptor: FieldEncryptor;
  readonly tokenizer: SessionTokenizer;
  readonly sealedBox: SealedBoxEncryptor | null;
}

interface ScopedServices {
  readonly twoFactor: TwoFactorService;
  readonly emailCodes: EmailCodeService;
}

/**
 * Builds tenant-scoped 2FA services from the resolved org context.
 * Called once per request by the injection middleware.
 */
export function createScopedTwoFactorServices(
  org: OrgContext,
  deps: TwoFactorRouterDeps,
): ScopedServices {
  const sessions = createDbSessionRepository(
    org.tenantDb,
    deps.encryptor,
    deps.tokenizer,
    deps.sealedBox,
  );
  const emailCodes = createEmailCodeService(org.tenantDb, deps.emailSender);
  const twoFactor = createTwoFactorService(
    org.tenantDb,
    sessions,
    emailCodes,
    deps.encryptor,
    TOTP_ISSUER,
  );
  return { twoFactor, emailCodes };
}

/**
 * Derives the WebAuthn origin from the request.
 * In production: https://<subdomain>.care-y.app
 * In dev: http://localhost:<port>
 */
function deriveOrigin(org: OrgContext): string {
  // Dev mode uses localhost; prod uses the org's subdomain.
  // The context factory already resolved the org, so we know the slug.
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    return process.env.CORS_ORIGIN ?? "http://localhost:5173";
  }
  return `https://${org.orgSlug}.${WEBAUTHN_RP_ID}`;
}

// --- Router factory ---

/**
 * Narrows the tRPC context after requireOrg + requireSession have run.
 * tRPC re-widens ctx to the base Context type when chaining middleware,
 * so runtime guards re-narrow for TypeScript (same pattern as trpc.ts).
 */
function narrowAuthContext(ctx: Context): {
  org: OrgContext;
  session: SessionData;
  user: UserRecord;
} {
  if (!ctx.org || !ctx.session || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return { org: ctx.org, session: ctx.session, user: ctx.user };
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createTwoFactorRouter(deps: TwoFactorRouterDeps) {
  /**
   * Middleware: creates tenant-scoped 2FA services and injects them into ctx.
   * Chained after auth middleware, so ctx.org is guaranteed non-null.
   */
  const injectServices = middleware(async ({ ctx, next }) => {
    const { org, session, user } = narrowAuthContext(ctx);
    const { twoFactor, emailCodes } = createScopedTwoFactorServices(org, deps);
    return next({ ctx: { ...ctx, org, session, user, twoFactor, emailCodes } });
  });

  // Procedure types with service injection.
  // Error wrapping is applied per-resolver via withErrorWrapping().
  const twoFactorProcedure = authedProcedure.use(injectServices);
  const twoFactor2faProcedure = authed2faProcedure.use(injectServices);

  // === Enrollment sub-router ===
  // Uses twoFactorProcedure (session exists, but 2FA not yet verified).
  // The user must be able to enroll before they can verify.

  const enrollRouter = router({
    /** TOTP: generate secret + otpauth URI for QR code display. */
    totpSetup: twoFactorProcedure.mutation(
      withErrorWrapping(async ({ ctx }) =>
        ctx.twoFactor.setupTotp(ctx.user.id),
      ),
    ),

    /** TOTP: verify the 6-digit code to confirm enrollment. */
    totpVerify: twoFactorProcedure.input(totpVerifySchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => ({
        success: await ctx.twoFactor.verifyTotpEnrollment(
          ctx.user.id,
          input.code,
        ),
      })),
    ),

    /** WebAuthn: get registration options (challenge, RP config). */
    webauthnOptions: twoFactorProcedure.mutation(
      withErrorWrapping(async ({ ctx }) =>
        ctx.twoFactor.getWebauthnRegistrationOptions(
          ctx.session.token,
          WEBAUTHN_RP_ID,
          WEBAUTHN_RP_NAME,
        ),
      ),
    ),

    /** WebAuthn: verify registration response from the browser. */
    webauthnVerify: twoFactorProcedure
      .input(webauthnRegistrationResponseSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const origin = deriveOrigin(ctx.org);
          await ctx.twoFactor.verifyWebauthnRegistration(
            ctx.session.token,
            input,
            origin,
            WEBAUTHN_RP_ID,
            ctx.user.id,
          );
          return { success: true as const };
        }),
      ),

    /** Email: send a verification code to the user's notification email. */
    emailSend: twoFactorProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        const email = await ctx.twoFactor.resolveUserEmail(ctx.user.id);
        await ctx.emailCodes.sendCode(ctx.user.id, email);
        return { sent: true as const };
      }),
    ),

    /** Email: verify the 6-digit code to confirm email 2FA enrollment. */
    emailVerify: twoFactorProcedure.input(emailCodeVerifySchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => ({
        success: await ctx.twoFactor.verifyEmailEnrollment(
          ctx.user.id,
          input.code,
        ),
      })),
    ),

    /** Backup codes: generate 8 codes. Can be called to regenerate (replaces old set). */
    backupCodes: twoFactorProcedure.mutation(
      withErrorWrapping(async ({ ctx }) =>
        ctx.twoFactor.generateBackupCodes(ctx.user.id),
      ),
    ),
  });

  // === Verification sub-router ===
  // Post-login 2FA challenge. Uses twoFactorProcedure (session exists but
  // twofaVerified is false). On success, marks the session verified.

  const verifyRouter = router({
    /** TOTP: verify a 6-digit code from the user's authenticator app. */
    totp: twoFactorProcedure.input(totpVerifySchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const valid = await ctx.twoFactor.verifyTotp(ctx.user.id, input.code);
        if (valid) {
          await ctx.twoFactor.markSessionVerified(ctx.session.token);
        }
        return { success: valid };
      }),
    ),

    /** WebAuthn: get assertion options (challenge + allowed credentials). */
    webauthnOptions: twoFactorProcedure.mutation(
      withErrorWrapping(async ({ ctx }) =>
        ctx.twoFactor.getWebauthnAssertionOptions(
          ctx.session.token,
          ctx.user.id,
          WEBAUTHN_RP_ID,
        ),
      ),
    ),

    /** WebAuthn: verify the assertion response from the browser. */
    webauthnComplete: twoFactorProcedure
      .input(webauthnAssertionResponseSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const origin = deriveOrigin(ctx.org);
          await ctx.twoFactor.verifyWebauthnAssertion(
            ctx.session.token,
            input,
            origin,
            WEBAUTHN_RP_ID,
          );
          await ctx.twoFactor.markSessionVerified(ctx.session.token);
          return { success: true as const };
        }),
      ),

    /** Email: send a verification code for login 2FA. */
    emailSend: twoFactorProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        const email = await ctx.twoFactor.resolveUserEmail(ctx.user.id);
        await ctx.emailCodes.sendCode(ctx.user.id, email);
        return { sent: true as const };
      }),
    ),

    /** Email: verify the 6-digit code during login 2FA. */
    emailComplete: twoFactorProcedure.input(emailCodeVerifySchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const valid = await ctx.emailCodes.verifyCode(ctx.user.id, input.code);
        if (valid) {
          await ctx.twoFactor.markSessionVerified(ctx.session.token);
        }
        return { success: valid };
      }),
    ),

    /** Backup code: verify a one-time backup code during login 2FA. */
    backupCode: twoFactorProcedure.input(backupCodeVerifySchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const valid = await ctx.twoFactor.checkBackupCode(
          ctx.user.id,
          input.code,
        );
        if (valid) {
          await ctx.twoFactor.markSessionVerified(ctx.session.token);
        }
        return { success: valid };
      }),
    ),
  });

  // === Methods sub-router ===
  // Management of enrolled methods. Requires fully verified session.

  const methodsRouter = router({
    /** List all enrolled methods with display metadata. */
    list: twoFactor2faProcedure.query(
      withErrorWrapping(async ({ ctx }) =>
        ctx.twoFactor.getStatus(ctx.user.id),
      ),
    ),

    /** Remove an enrolled method. Must keep at least one active. */
    remove: twoFactor2faProcedure.input(removeMethodSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        await ctx.twoFactor.removeMethod(
          ctx.user.id,
          input.method,
          input.credentialId,
        );
        return { success: true as const };
      }),
    ),
  });

  // === Top-level 2FA router ===

  return router({
    /** 2FA enrollment status: enrolled methods + backup codes remaining. */
    status: twoFactorProcedure.query(
      withErrorWrapping(async ({ ctx }) =>
        ctx.twoFactor.getStatus(ctx.user.id),
      ),
    ),

    enroll: enrollRouter,
    verify: verifyRouter,
    methods: methodsRouter,
  });
}
