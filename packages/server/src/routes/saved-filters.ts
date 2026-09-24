/**
 * Shared saved filters tRPC router.
 *
 * List is gated on VIEW_CASES (any volunteer who can see the ticket list
 * can see org-shared filters). Share and unshare are gated on VIEW_CASES
 * plus ownership enforcement in the service layer.
 *
 * All encrypted fields arrive as base64 strings from the client
 * (org-key encryption). The router converts to Buffer before passing to
 * the service layer, and converts back to base64url on the way out.
 */

import {
  shareSavedFilterInputSchema,
  unshareSavedFilterInputSchema,
} from "@care-y/shared";
import { router, viewCasesProcedure, withErrorWrapping } from "../trpc/trpc.js";
import { createSavedFilterService } from "../tickets/saved-filter-service.js";
import { b64 } from "../utils/ciphertext-wire.js";

export interface SharedFilterWire {
  readonly id: string;
  readonly ownerId: string;
  readonly encryptedName: string;
  readonly encryptedState: string;
  readonly color: string;
  readonly icon: string;
  readonly createdAt: string;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createSavedFiltersRouter() {
  return router({
    list: viewCasesProcedure.query(
      withErrorWrapping(
        async ({ ctx }): Promise<{ filters: SharedFilterWire[] }> => {
          const svc = createSavedFilterService(ctx.org.tenantDb);
          const records = await svc.list();
          return {
            filters: records.map((r) => ({
              id: r.id,
              ownerId: r.ownerId,
              encryptedName: b64(r.encryptedName),
              encryptedState: b64(r.encryptedState),
              color: r.color,
              icon: r.icon,
              createdAt: r.createdAt.toISOString(),
            })),
          };
        },
      ),
    ),

    share: viewCasesProcedure.input(shareSavedFilterInputSchema).mutation(
      withErrorWrapping(
        async ({ ctx, input }): Promise<{ filter: SharedFilterWire }> => {
          const svc = createSavedFilterService(ctx.org.tenantDb);
          const record = await svc.share({
            ownerId: ctx.session.userId,
            encryptedName: Buffer.from(input.encryptedName, "base64"),
            encryptedState: Buffer.from(input.encryptedState, "base64"),
            color: input.color,
            icon: input.icon,
            orgKeyGeneration: ctx.org.sealedBox.generation,
          });
          return {
            filter: {
              id: record.id,
              ownerId: record.ownerId,
              encryptedName: b64(record.encryptedName),
              encryptedState: b64(record.encryptedState),
              color: record.color,
              icon: record.icon,
              createdAt: record.createdAt.toISOString(),
            },
          };
        },
      ),
    ),

    unshare: viewCasesProcedure.input(unshareSavedFilterInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }): Promise<{ success: true }> => {
        const svc = createSavedFilterService(ctx.org.tenantDb);
        await svc.unshare(input.filterId, ctx.session.userId);
        return { success: true as const };
      }),
    ),
  });
}
