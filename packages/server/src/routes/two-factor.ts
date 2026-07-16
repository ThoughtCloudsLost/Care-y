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
import { getEnv } from "../env.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import type { SessionTokenizer } from "../crypto/session-tokenizer.js";
import type { EmailSender } from "../email/email-sender.js";
import type { SessionRepository } from "../auth/session-repository.js";
import type { ProviderFactory } from "../telephony/factory.js";
import { createTenantSessions } from "../trpc/context.js";
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
import {
  createSmsCodeService,
  type SmsCodeService,
  type CallerIdResolver,
} from "../auth/sms-code.js";
import {
  createPushChallengeService,
  type PushChallengeService,
} from "../auth/push-challenge.js";
import type { PushNotificationSender } from "../notifications/push.js";
import {
  NotFoundError,
  TelephonyConfigError,
  SecretCryptoError,
} from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import {
  totpVerifySchema,
  emailEnrollSchema,
  emailCodeVerifySchema,
  smsEnrollSchema,
  smsCodeVerifySchema,
  backupCodeVerifySchema,
  webauthnRegistrationResponseSchema,
  webauthnAssertionResponseSchema,
  removeMethodSchema,
  pushChallengeIdSchema,
  pushApprovalSchema,
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
  readonly indexer: BlindIndexer;
  readonly tokenizer: SessionTokenizer;
  readonly providerFactory: ProviderFactory;
  readonly resolveCallerId: CallerIdResolver;
  readonly pushSender: PushNotificationSender | null;
  readonly pushHmacKey: Buffer | null;
}

interface ScopedServices {
  readonly twoFactor: TwoFactorService;
  readonly emailCodes: EmailCodeService;
  readonly smsCodes: SmsCodeService | null;
  readonly pushChallenges: PushChallengeService | null;
}

/**
 * Builds tenant-scoped 2FA services from the resolved org context.
 * Accepts a shared SessionRepository to avoid redundant construction
 * when both auth and 2FA services are needed in the same request.
 *
 * SMS service is created only when the org has telephony configured.
 * The provider factory throws NotFoundError for unconfigured orgs,
 * so we catch that and set smsCodes to null.
 */
export async function createScopedTwoFactorServices(
  org: OrgContext,
  sessions: SessionRepository,
  deps: TwoFactorRouterDeps,
): Promise<ScopedServices> {
  const emailCodes = createEmailCodeService(org.tenantDb, deps.emailSender);

  let smsCodes: SmsCodeService | null = null;
  try {
    const provider = await deps.providerFactory.getProvider(org.orgId);
    smsCodes = createSmsCodeService(
      org.tenantDb,
      provider,
      deps.resolveCallerId,
      org.orgSchema,
    );
  } catch (err: unknown) {
    // NotFoundError: telephony not configured for this org. SMS 2FA unavailable.
    // TelephonyConfigError: config exists but is invalid. Also treat as unavailable
    // rather than crashing the entire 2FA flow (other methods still work).
    // SecretCryptoError: config exists but decryption failed (key mismatch after
    // rotation or corrupt blob). Same graceful degradation.
    // Re-throw unexpected errors (DB connection failures, etc.).
    if (
      !(err instanceof NotFoundError) &&
      !(err instanceof TelephonyConfigError) &&
      !(err instanceof SecretCryptoError)
    ) {
      throw err;
    }
  }

  const smsDeps = smsCodes
    ? { smsCodes, indexer: deps.indexer, orgId: org.orgId }
    : undefined;

  let pushChallenges: PushChallengeService | null = null;
  if (deps.pushSender && deps.pushHmacKey) {
    pushChallenges = createPushChallengeService(
      org.tenantDb,
      deps.pushSender,
      deps.pushHmacKey,
    );
  }

  const pushServiceDeps = pushChallenges ? { pushChallenges } : undefined;

  const twoFactor = createTwoFactorService(
    org.tenantDb,
    sessions,
    emailCodes,
    deps.encryptor,
    TOTP_ISSUER,
    smsDeps,
    pushServiceDeps,
  );
  return { twoFactor, emailCodes, smsCodes, pushChallenges };
}

/**
 * Derives the WebAuthn RP ID.
 * In production: care-y.app (shared across org subdomains, ADR-017 Decision 5).
 * In dev: hostname from CORS_ORIGIN (supports Tailscale MagicDNS, localhost).
 */
function deriveRpId(): string {
  if (
    getEnv().NODE_ENV === "development" &&
    process.env.CORS_ORIGIN != null &&
    process.env.CORS_ORIGIN !== ""
  ) {
    try {
      return new URL(process.env.CORS_ORIGIN).hostname;
    } catch {
      return "localhost";
    }
  }
  return WEBAUTHN_RP_ID;
}

/**
 * Derives the WebAuthn origin from the request.
 * In production: https://<subdomain>.care-y.app
 * In dev: CORS_ORIGIN (e.g. https://host.ts.net:5173, http://localhost:5173)
 */
function deriveOrigin(org: OrgContext): string {
  if (getEnv().NODE_ENV === "development") {
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
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorCode.NOT_AUTHENTICATED,
    });
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
    const sessions = createTenantSessions(org, deps.tokenizer);
    const { twoFactor, emailCodes, smsCodes } =
      await createScopedTwoFactorServices(org, sessions, deps);
    return next({
      ctx: { ...ctx, org, session, user, twoFactor, emailCodes, smsCodes },
    });
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
          deriveRpId(),
          WEBAUTHN_RP_NAME,
          ctx.user.id,
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
            deriveRpId(),
            ctx.user.id,
          );
          return { success: true as const };
        }),
      ),

    /** Email: store the notification email and send a verification code. */
    emailSend: twoFactorProcedure.input(emailEnrollSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        await ctx.twoFactor.setNotificationEmail(ctx.user.id, input.email);
        await ctx.emailCodes.sendCode(ctx.user.id, input.email);
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

    /** SMS: register phone number and send a verification code. */
    smsSend: twoFactorProcedure.input(smsEnrollSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        if (!ctx.smsCodes) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: ErrorCode.SMS_NOT_CONFIGURED,
          });
        }
        // enrollSmsPhone normalizes to E.164 internally, returns the result
        const phone = await ctx.twoFactor.enrollSmsPhone(
          ctx.user.id,
          input.phone,
          ctx.org.orgId,
        );

        // Send the verification code (caller ID resolved from provider config)
        await ctx.smsCodes.sendCode(ctx.user.id, phone);
        return { sent: true as const };
      }),
    ),

    /** SMS: verify the 6-digit code to confirm SMS 2FA enrollment. */
    smsVerify: twoFactorProcedure.input(smsCodeVerifySchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => ({
        success: await ctx.twoFactor.verifySmsEnrollment(
          ctx.user.id,
          input.code,
        ),
      })),
    ),

    /** Push: send test push to verify device subscriptions work. Registers push method on success. */
    pushVerify: twoFactorProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => ({
        success: await ctx.twoFactor.enrollPushDevice(ctx.user.id),
      })),
    ),

    /** Backup codes: generate 8 codes. Can be called to regenerate (replaces old set). */
    backupCodes: twoFactorProcedure.mutation(
      withErrorWrapping(async ({ ctx }) =>
        ctx.twoFactor.generateBackupCodes(ctx.user.id),
      ),
    ),

    /**
     * Mark session as 2FA-verified after first enrollment during onboarding.
     *
     * Safe because enrollment already proves possession (TOTP code verified,
     * WebAuthn ceremony completed, etc.). Only succeeds if at least one
     * method is enrolled. Idempotent if session is already verified.
     */
    markVerifiedOnFirstEnrollment: twoFactorProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        const status = await ctx.twoFactor.getStatus(ctx.user.id);
        if (status.methods.length === 0) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: ErrorCode.NO_METHODS_ENROLLED,
          });
        }
        if (ctx.session.twofaVerified) {
          return { success: true as const };
        }
        await ctx.twoFactor.markSessionVerified(ctx.session.token);
        return { success: true as const };
      }),
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
          deriveRpId(),
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
            deriveRpId(),
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

    /** SMS: send a verification code to the enrolled phone for login 2FA. */
    smsSend: twoFactorProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        if (!ctx.smsCodes) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: ErrorCode.SMS_NOT_CONFIGURED,
          });
        }
        const phone = await ctx.twoFactor.resolveUserSmsPhone(ctx.user.id);
        await ctx.smsCodes.sendCode(ctx.user.id, phone);
        return { sent: true as const };
      }),
    ),

    /** SMS: verify the 6-digit code during login 2FA. */
    smsComplete: twoFactorProcedure.input(smsCodeVerifySchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const valid = await ctx.twoFactor.verifySms(ctx.user.id, input.code);
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

    /** Push: send a challenge push to all subscribed devices. */
    pushSend: twoFactorProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        const result = await ctx.twoFactor.sendPushChallenge(
          ctx.user.id,
          ctx.session.token,
        );
        return { challengeId: result.challengeId, sent: result.sent };
      }),
    ),

    /** Push: poll challenge status (called by the login page). */
    pushPoll: twoFactorProcedure.input(pushChallengeIdSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const result = await ctx.twoFactor.pollPushChallenge(
          input.challengeId,
          ctx.session.token,
        );
        if (result.status === "approved") {
          await ctx.twoFactor.markSessionVerified(ctx.session.token);
        }
        return { status: result.status };
      }),
    ),

    /** Push: approve a challenge (called from the device that received the push).
     *  Uses twoFactor2faProcedure: the approving device must have a fully verified session. */
    pushApprove: twoFactor2faProcedure.input(pushApprovalSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const approved = await ctx.twoFactor.approvePushChallenge(
          input.challengeId,
          ctx.user.id,
        );
        return { success: approved };
      }),
    ),

    /** Push: deny a challenge (called from the device that received the push).
     *  Uses twoFactor2faProcedure: the denying device must have a fully verified session. */
    pushDeny: twoFactor2faProcedure.input(pushApprovalSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const denied = await ctx.twoFactor.denyPushChallenge(
          input.challengeId,
          ctx.user.id,
        );
        return { success: denied };
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
