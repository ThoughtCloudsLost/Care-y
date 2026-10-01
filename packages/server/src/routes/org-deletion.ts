/**
 * Org deletion request router.
 *
 * All three procedures require REQUEST_ORG_DELETION. The org is taken from
 * the authenticated context and never from input, so a caller can only
 * submit, cancel or read its own org's request. Business logic lives in
 * org/deletion-request-service.ts; this file contains none.
 */

import { Permission, requestOrgDeletionInputSchema } from "@care-y/shared";
import {
  router,
  permissionProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import type { OrgContext } from "../trpc/context.js";
import type { DeletionRequestService } from "../org/deletion-request-service.js";

const requestOrgDeletionProcedure = permissionProcedure(
  Permission.REQUEST_ORG_DELETION,
);

export interface OrgDeletionRouterDeps {
  /** Builds the service for the caller's org, resolved from the context. */
  readonly createDeletionRequestSvc: (
    org: OrgContext,
  ) => DeletionRequestService;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createOrgDeletionRouter(deps: OrgDeletionRouterDeps) {
  return router({
    request: requestOrgDeletionProcedure
      .input(requestOrgDeletionInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          return deps.createDeletionRequestSvc(ctx.org).request({
            orgId: ctx.org.orgId,
            requestedBy: ctx.user.id,
            confirmSlug: input.confirmSlug,
          });
        }),
      ),

    cancel: requestOrgDeletionProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        return deps.createDeletionRequestSvc(ctx.org).cancel({
          orgId: ctx.org.orgId,
          cancelledBy: ctx.user.id,
        });
      }),
    ),

    status: requestOrgDeletionProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        return deps.createDeletionRequestSvc(ctx.org).status(ctx.org.orgId);
      }),
    ),
  });
}
