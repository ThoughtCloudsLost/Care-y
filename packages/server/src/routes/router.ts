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
import type { AuthRouterDeps } from "./auth.js";
import type { OrgService } from "../org/service.js";
import type { ProviderFactory } from "../telephony/factory.js";

function healthCheck(): { status: "ok" } {
  return { status: "ok" };
}

export interface RouterDeps {
  readonly authDeps: AuthRouterDeps;
  readonly twoFactorDeps: TwoFactorRouterDeps;
  readonly oprfDeps: OprfRouterDeps;
  readonly orgService: OrgService;
  readonly providerFactory: ProviderFactory;
  readonly telephonyAdminDeps?: TelephonyAdminRouterDeps;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createAppRouter(deps: RouterDeps) {
  const authRouter = createAuthRouter(deps.authDeps);
  const orgRouter = createOrgRouter(deps.orgService);
  const twoFactorRouter = createTwoFactorRouter(deps.twoFactorDeps);
  const oprfRouter = createOprfRouter(deps.oprfDeps);
  const keysRouter = createKeysRouter();

  return router({
    health: publicProcedure.query(healthCheck),
    auth: authRouter,
    org: orgRouter,
    twoFactor: twoFactorRouter,
    oprf: oprfRouter,
    keys: keysRouter,
    ...(deps.telephonyAdminDeps
      ? {
          telephonyAdmin: createTelephonyAdminRouter(deps.telephonyAdminDeps),
        }
      : {}),
  });
}
