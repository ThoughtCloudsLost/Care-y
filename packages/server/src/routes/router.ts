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
import type { AuthRouterDeps } from "./auth.js";
import type { OrgService } from "../org/service.js";

function healthCheck(): { status: "ok" } {
  return { status: "ok" };
}

export interface RouterDeps {
  readonly authDeps: AuthRouterDeps;
  readonly twoFactorDeps: TwoFactorRouterDeps;
  readonly orgService: OrgService;
}

export function createAppRouter(deps: RouterDeps) {
  const authRouter = createAuthRouter(deps.authDeps);
  const orgRouter = createOrgRouter(deps.orgService);
  const twoFactorRouter = createTwoFactorRouter(deps.twoFactorDeps);

  return router({
    health: publicProcedure.query(healthCheck),
    auth: authRouter,
    org: orgRouter,
    twoFactor: twoFactorRouter,
  });
}
