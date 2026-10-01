/**
 * Issues a new setup token for an org that has not been set up yet and
 * prints the new setup link. The previous token stops working.
 *
 * Usage (dev):  pnpm org:reset-token <slug>
 * Production:   docker compose -f docker-compose.prod.yml exec api \
 *                 pnpm --filter @care-y/server exec tsx src/cli/org-reset-token.ts <slug>
 *
 * Refuses (exit 1, ORG_ALREADY_SETUP) once the org has any user. There is
 * no override. stdout carries the setup URL and nothing else.
 */

// Must stay the first import: cli-utils boots the secrets loader before
// anything below reaches db.ts (ADR-131).
import { buildSetupUrl, singlePositional, withCli } from "./cli-utils.js";
import { getEnv } from "../env.js";
import { createOrgService } from "../org/service.js";

await withCli("org:reset-token", async (ctx, args) => {
  const slug = singlePositional(args, "org:reset-token <slug>");
  const orgService = createOrgService(ctx.platformDb, ctx.tenantDbFactory);
  const reset = await orgService.resetSetupToken(slug);
  console.log(
    buildSetupUrl(getEnv().CAREY_APP_DOMAIN, reset.slug, reset.setupToken),
  );
});
