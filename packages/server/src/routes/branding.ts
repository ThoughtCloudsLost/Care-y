/**
 * Branding admin router: encrypted branding field CRUD and PWA icon upload.
 *
 * All endpoints require admin-level permissions (MANAGE_ROLES).
 * Business logic is delegated to BrandingService.
 * Server never decrypts branding data; it stores and returns ciphertext only.
 */

import { router, adminProcedure, withErrorWrapping } from "../trpc/trpc.js";
import {
  saveBrandingFieldInputSchema,
  uploadIconsInputSchema,
} from "@care-y/shared";
import { createBrandingService } from "../branding/branding-service.js";
import type { BlobStore } from "../storage/store.js";

export interface BrandingRouterDeps {
  readonly blobStore: BlobStore;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createBrandingRouter(deps: BrandingRouterDeps) {
  const { blobStore } = deps;

  return router({
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
        const svc = createBrandingService(ctx.org.tenantDb);
        await svc.uploadIcons(blobStore, ctx.org.orgSchema, input);
      }),
    ),
  });
}
