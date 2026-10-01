/**
 * Provisions a new org and prints its one-time setup link.
 *
 * Usage (dev):  pnpm org:create <slug>
 * Production:   docker compose -f docker-compose.prod.yml exec api \
 *                 pnpm --filter @care-y/server exec tsx src/cli/org-create.ts <slug>
 *
 * stdout carries the setup URL and nothing else, so the operator can hand
 * it to the org's first admin as is.
 */

// Must stay the first import: cli-utils boots the secrets loader before
// anything below reaches db.ts (ADR-129).
import { buildSetupUrl, singlePositional, withCli } from "./cli-utils.js";
import { getEnv } from "../env.js";
import { createOrgService } from "../org/service.js";

await withCli("org:create", async (ctx, args) => {
  const slug = singlePositional(args, "org:create <slug>");
  // The tenant migrator runs on the owner-role pool, and the runtime role
  // receives its grants on the new schema when DATABASE_APP_ROLE is set.
  const orgService = createOrgService(
    ctx.platformDb,
    ctx.tenantDbFactory,
    ctx.adminPool,
    getEnv().DATABASE_APP_ROLE,
  );
  const org = await orgService.createOrg({ slug });
  console.log(
    buildSetupUrl(getEnv().CAREY_APP_DOMAIN, org.slug, org.setupToken),
  );
});
