import { extractSubdomain } from "@care-y/shared";

/**
 * Dev-mode org slug. Must match the value sent by the tRPC httpBatchLink
 * in `$lib/trpc/index.ts`. Shared constant prevents drift.
 */
export const DEV_ORG_SLUG = "dev-org";

export function getOrgSlug(): string | null {
  if (import.meta.env.DEV) return DEV_ORG_SLUG;
  return extractSubdomain(window.location.host);
}
