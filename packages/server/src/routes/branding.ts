/**
 * Branding router: public branding query + admin CRUD + PWA icon upload.
 *
 * getPublicBranding: org-scoped, no auth. Returns plaintext branding fields
 * plus the org public key (still needed by intake form crypto, ADR-026).
 * getBranding: every authenticated org member. Each volunteer's session
 * hydrates branding and terminology from it, and nothing in the payload is
 * admin-only (the public fields are served unauthenticated anyway, and the
 * terminology ciphertext is org-key tier every volunteer holds the key for).
 * Write endpoints require admin-level permissions (MANAGE_ROLES).
 * Business logic is delegated to BrandingService.
 *
 * Branding is stored and served as plaintext (ADR-094). XSS defense for
 * admin-authored text is per-context escaping at the injection/render point.
 */

import {
  router,
  orgProcedure,
  volunteerProcedure,
  adminProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import {
  saveBrandingFieldInputSchema,
  uploadIconsInputSchema,
} from "@care-y/shared";
import { createBrandingService } from "../branding/branding-service.js";
import type { BlobStore } from "../storage/store.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import { TRPCError } from "@trpc/server";

export interface BrandingRouterDeps {
  readonly blobStore: BlobStore;
  readonly uploadLimiter?: RateLimiter;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createBrandingRouter(deps: BrandingRouterDeps) {
  const { blobStore, uploadLimiter } = deps;

  return router({
    getPublicBranding: orgProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createBrandingService(ctx.org.tenantDb);
        const data = await svc.getPublicBranding();
        return { ...data, orgSlug: ctx.org.orgSlug };
      }),
    ),

    getBranding: volunteerProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createBrandingService(ctx.org.tenantDb);
        return svc.getBranding();
      }),
    ),

    saveBrandingField: adminProcedure
      .input(saveBrandingFieldInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createBrandingService(ctx.org.tenantDb);
          await svc.saveBrandingField(input);
        }),
      ),

    uploadIcons: adminProcedure.input(uploadIconsInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        if (uploadLimiter) {
          const rateResult = uploadLimiter.check(ctx.user.id);
          if (!rateResult.allowed) {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: `Upload rate limited. Retry after ${String(Math.ceil(rateResult.retryAfterMs / 1000))}s`,
            });
          }
        }
        const svc = createBrandingService(ctx.org.tenantDb);
        await svc.uploadIcons(blobStore, ctx.org.orgSchema, input);
      }),
    ),
  });
}
