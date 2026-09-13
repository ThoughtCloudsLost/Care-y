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
import { createClientRouter, type ClientRouterDeps } from "./clients.js";
import {
  createEscalationRouter,
  type EscalationRouterDeps,
} from "./escalation.js";
import type { OrgService } from "../org/service.js";
import type { ProviderFactory } from "../telephony/factory.js";
import {
  createIntakeFormRouter,
  type IntakeFormRouterDeps,
} from "./intake-forms.js";
import {
  createClientPortalRouter,
  type ClientPortalRouterDeps,
} from "./client-portal.js";

function healthCheck(): { status: "ok" } {
  return { status: "ok" };
}

/**
 * Every router that a caller may decline to mount.
 *
 * All keys are required. `null` declines a router; omitting a key is a type
 * error, never a silent absence. That distinction is the whole point of this
 * interface: a caller that forgets a group used to get a router which
 * type-checked, booted, and served every other surface, with the gap
 * appearing only as `No procedure found on path "..."` from whichever page
 * called first. Pages can render without their API, so nothing else catches
 * it.
 *
 * Adding a key here is meant to break every real call site. Let it. Each
 * site then states whether the new router belongs in that deployment.
 */
export interface OptionalRouterDeps {
  readonly telephonyAdminDeps: TelephonyAdminRouterDeps | null;
  readonly telephonyContentDeps: TelephonyContentRouterDeps | null;
  /** Takes no deps, so a boolean is the only thing there is to state. */
  readonly consultant: boolean;
  /** Takes no deps, so a boolean is the only thing there is to state. */
  readonly reports: boolean;
  readonly ticketDeps: TicketRouterDeps | null;
  readonly kbDeps: KBRouterDeps | null;
  readonly notificationDeps: NotificationRouterDeps | null;
  readonly brandingDeps: BrandingRouterDeps | null;
  readonly onboardingDeps: OnboardingRouterDeps | null;
  readonly voicemailQuarantineDeps: VoicemailQuarantineRouterDeps | null;
  readonly clientDeps: ClientRouterDeps | null;
  readonly escalationDeps: EscalationRouterDeps | null;
  readonly intakeFormDeps: IntakeFormRouterDeps | null;
  readonly clientPortalDeps: ClientPortalRouterDeps | null;
  readonly devDeps: DevRouterDeps | null;
}

export interface RouterDeps extends OptionalRouterDeps {
  readonly authDeps: AuthRouterDeps;
  readonly profileDeps: ProfileRouterDeps;
  readonly twoFactorDeps: TwoFactorRouterDeps;
  readonly oprfDeps: OprfRouterDeps;
  readonly orgService: OrgService;
  readonly providerFactory: ProviderFactory;
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
    ...(deps.telephonyAdminDeps !== null
      ? {
          telephonyAdmin: createTelephonyAdminRouter(deps.telephonyAdminDeps),
        }
      : {}),
    ...(deps.telephonyContentDeps !== null
      ? {
          telephonyContent: createTelephonyContentRouter(
            deps.telephonyContentDeps,
          ),
        }
      : {}),
    ...(deps.consultant ? { consultant: createConsultantRouter() } : {}),
    ...(deps.ticketDeps !== null
      ? { tickets: createTicketRouter(deps.ticketDeps) }
      : {}),
    ...(deps.kbDeps !== null ? { kb: createKbRouter(deps.kbDeps) } : {}),
    ...(deps.notificationDeps !== null
      ? { notifications: createNotificationRouter(deps.notificationDeps) }
      : {}),
    ...(deps.brandingDeps !== null
      ? { branding: createBrandingRouter(deps.brandingDeps) }
      : {}),
    ...(deps.reports ? { reports: createReportsRouter() } : {}),
    ...(deps.onboardingDeps !== null
      ? { onboarding: createOnboardingRouter(deps.onboardingDeps) }
      : {}),
    ...(deps.voicemailQuarantineDeps !== null
      ? {
          voicemailQuarantine: createVoicemailQuarantineRouter(
            deps.voicemailQuarantineDeps,
          ),
        }
      : {}),
    ...(deps.clientDeps !== null
      ? { clients: createClientRouter(deps.clientDeps) }
      : {}),
    ...(deps.escalationDeps !== null
      ? { escalation: createEscalationRouter(deps.escalationDeps) }
      : {}),
    ...(deps.intakeFormDeps !== null
      ? { intakeForms: createIntakeFormRouter(deps.intakeFormDeps) }
      : {}),
    ...(deps.clientPortalDeps !== null
      ? { clientPortal: createClientPortalRouter(deps.clientPortalDeps) }
      : {}),
    ...(deps.devDeps !== null ? { dev: createDevRouter(deps.devDeps) } : {}),
  });
}
