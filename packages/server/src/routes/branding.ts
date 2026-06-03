/**
 * Branding router: public branding query + admin CRUD + PWA icon upload.
 *
 * getPublicBranding: org-scoped, no auth. Returns encrypted blob + org public
 * key for client-side BLAKE2b derivation (B1 two-tier branding).
 * All other endpoints require admin-level permissions (MANAGE_ROLES).
 * Business logic is delegated to BrandingService.
 * Server never decrypts branding data; it stores and returns ciphertext only.
 */

import {
  router,
  orgProcedure,
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

    getBranding: adminProcedure.query(
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
