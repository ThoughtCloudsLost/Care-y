import { extractSubdomain } from "@care-y/shared";

/**
 * Dev-mode org slug. Must match the value sent by the tRPC httpBatchLink
 * in `$lib/trpc/index.ts`. Shared constant prevents drift.
 *
 * Configurable via VITE_ORG_SLUG env var for e2e test isolation
 * (Playwright sets this to "e2e-org" so tests use a separate tenant schema).
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Vite types custom env vars as `any`
const envSlug: unknown = import.meta.env.VITE_ORG_SLUG;
export const DEV_ORG_SLUG: string =
  typeof envSlug === "string" ? envSlug : "dev-org";

export function getOrgSlug(): string | null {
  if (import.meta.env.DEV) return DEV_ORG_SLUG;
  return extractSubdomain(window.location.host);
}
