/**
 * Root router: merges all sub-routers into a single appRouter.
 *
 * AppRouter type is exported for client-side tRPC type inference.
 * The health endpoint remains a top-level publicProcedure (no org/auth needed).
 */

import { router, publicProcedure } from "../trpc/trpc.js";
import { createAuthRouter } from "./auth.js";
import { createOrgRouter } from "./org.js";
import {
  createTwoFactorRouter,
  type TwoFactorRouterDeps,
} from "./two-factor.js";
import { createOprfRouter, type OprfRouterDeps } from "./oprf.js";
import { createKeysRouter } from "./keys.js";
import {
  createTelephonyAdminRouter,
  type TelephonyAdminRouterDeps,
} from "./telephony-admin.js";
import {
  createTelephonyContentRouter,
  type TelephonyContentRouterDeps,
} from "./telephony-content.js";
import { createConsultantRouter } from "./consultant.js";
import { createTicketRouter, type TicketRouterDeps } from "./tickets.js";
import { createKbRouter, type KBRouterDeps } from "./kb.js";
import {
  createNotificationRouter,
  type NotificationRouterDeps,
} from "./notifications.js";
import { createBrandingRouter, type BrandingRouterDeps } from "./branding.js";
import { createReportsRouter } from "./reports.js";
import { createProfileRouter, type ProfileRouterDeps } from "./profile.js";
import type { AuthRouterDeps } from "./auth.js";
import {
  createOnboardingRouter,
  type OnboardingRouterDeps,
} from "./onboarding.js";
import { createDashboardRouter } from "./dashboard.js";
import { createRecentViewsRouter } from "./recent-views.js";
import { createDevRouter, type DevRouterDeps } from "./dev.js";
import {
  createVoicemailQuarantineRouter,
  type VoicemailQuarantineRouterDeps,
} from "./voicemail-quarantine.js";
import type { OrgService } from "../org/service.js";
import type { ProviderFactory } from "../telephony/factory.js";

function healthCheck(): { status: "ok" } {
  return { status: "ok" };
}

export interface RouterDeps {
  readonly authDeps: AuthRouterDeps;
  readonly profileDeps: ProfileRouterDeps;
  readonly twoFactorDeps: TwoFactorRouterDeps;
  readonly oprfDeps: OprfRouterDeps;
  readonly orgService: OrgService;
  readonly providerFactory: ProviderFactory;
  readonly telephonyAdminDeps?: TelephonyAdminRouterDeps;
  readonly telephonyContentDeps?: TelephonyContentRouterDeps;
  readonly includeTelephonyContent?: boolean;
  readonly includeConsultant?: boolean;
  readonly includeReports?: boolean;
  readonly ticketDeps?: TicketRouterDeps;
  readonly kbDeps?: KBRouterDeps;
  readonly notificationDeps?: NotificationRouterDeps;
  readonly brandingDeps?: BrandingRouterDeps;
  readonly onboardingDeps?: OnboardingRouterDeps;
  readonly voicemailQuarantineDeps?: VoicemailQuarantineRouterDeps;
  readonly devDeps?: DevRouterDeps;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createAppRouter(deps: RouterDeps) {
  const authRouter = createAuthRouter(deps.authDeps);
  const orgRouter = createOrgRouter(deps.orgService);
  const twoFactorRouter = createTwoFactorRouter(deps.twoFactorDeps);
  const oprfRouter = createOprfRouter(deps.oprfDeps);
  const keysRouter = createKeysRouter();
  const profileRouter = createProfileRouter(deps.profileDeps);

  return router({
    health: publicProcedure.query(healthCheck),
    auth: authRouter,
    org: orgRouter,
    profile: profileRouter,
    twoFactor: twoFactorRouter,
    oprf: oprfRouter,
    keys: keysRouter,
    dashboard: createDashboardRouter(),
    recentViews: createRecentViewsRouter(),
    ...(deps.telephonyAdminDeps
      ? {
          telephonyAdmin: createTelephonyAdminRouter(deps.telephonyAdminDeps),
        }
      : {}),
    ...(deps.includeTelephonyContent !== false
      ? {
          telephonyContent: createTelephonyContentRouter(
            deps.telephonyContentDeps,
          ),
        }
      : {}),
    ...(deps.includeConsultant !== false
      ? { consultant: createConsultantRouter() }
      : {}),
    ...(deps.ticketDeps
      ? { tickets: createTicketRouter(deps.ticketDeps) }
      : {}),
    ...(deps.kbDeps ? { kb: createKbRouter(deps.kbDeps) } : {}),
    ...(deps.notificationDeps
      ? { notifications: createNotificationRouter(deps.notificationDeps) }
      : {}),
    ...(deps.brandingDeps
      ? { branding: createBrandingRouter(deps.brandingDeps) }
      : {}),
    ...(deps.includeReports !== false
      ? { reports: createReportsRouter() }
      : {}),
    ...(deps.onboardingDeps
      ? { onboarding: createOnboardingRouter(deps.onboardingDeps) }
      : {}),
    ...(deps.voicemailQuarantineDeps
      ? {
          voicemailQuarantine: createVoicemailQuarantineRouter(
            deps.voicemailQuarantineDeps,
          ),
        }
      : {}),
    ...(deps.devDeps ? { dev: createDevRouter(deps.devDeps) } : {}),
  });
}
