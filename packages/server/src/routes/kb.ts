/**
 * Knowledge Base tRPC router.
 *
 * Permission mapping:
 * - managerProcedure: category CRUD (create, update, delete) + article deletion
 * - volunteerProcedure: category listing, article CRUD (create, get, list, update), voting
 *
 * All encrypted fields arrive as base64 strings from the client (org key encryption).
 * The router converts to Buffer before passing to the service layer.
 */

import { z } from "zod";
import {
  router,
  volunteerProcedure,
  managerProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import type { OrgContext } from "../trpc/context.js";
import type {
  KBCategoryService,
  KBItemService,
  KBVoteService,
} from "../kb/service.js";
import {
  createKbCategoryInputSchema,
  updateKbCategoryInputSchema,
  createKbItemInputSchema,
  updateKbItemInputSchema,
  kbItemListInputSchema,
  castVoteInputSchema,
  removeVoteInputSchema,
} from "@care-y/shared";

export interface KBRouterDeps {
  readonly createCategorySvc: (
    tDb: OrgContext["tenantDb"],
  ) => KBCategoryService;
  readonly createItemSvc: (tDb: OrgContext["tenantDb"]) => KBItemService;
  readonly createVoteSvc: (tDb: OrgContext["tenantDb"]) => KBVoteService;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createKbRouter(deps: KBRouterDeps) {
  return router({
    // --- Categories ---
    createCategory: managerProcedure
      .input(createKbCategoryInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createCategorySvc(ctx.org.tenantDb);
          return svc.create({
            encryptedName: Buffer.from(input.encryptedName, "base64"),
            encryptedDescription:
              input.encryptedDescription !== undefined
                ? Buffer.from(input.encryptedDescription, "base64")
                : undefined,
          });
        }),
      ),

    listCategories: volunteerProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = deps.createCategorySvc(ctx.org.tenantDb);
        return svc.list();
      }),
    ),

    updateCategory: managerProcedure
      .input(updateKbCategoryInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createCategorySvc(ctx.org.tenantDb);
          // care-y-ignore-next-line route-delegates-to-service -- delegates to svc.update; Buffer.from is wire-format (base64 to Buffer) conversion, not business logic
          return svc.update(input.categoryId, {
            encryptedName:
              input.encryptedName !== undefined
                ? Buffer.from(input.encryptedName, "base64")
                : undefined,
            encryptedDescription:
              input.encryptedDescription !== undefined
                ? Buffer.from(input.encryptedDescription, "base64")
                : undefined,
          });
        }),
      ),

    deleteCategory: managerProcedure
      .input(z.object({ categoryId: z.uuid() }))
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createCategorySvc(ctx.org.tenantDb);
          // care-y-ignore-next-line route-delegates-to-service -- single service call, no business logic
          await svc.delete(input.categoryId);
        }),
      ),

    // --- Articles ---
    createItem: volunteerProcedure.input(createKbItemInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createItemSvc(ctx.org.tenantDb);
        return svc.create(ctx.user.id, {
          categoryId: input.categoryId,
          encryptedTitle: Buffer.from(input.encryptedTitle, "base64"),
          encryptedBody: Buffer.from(input.encryptedBody, "base64"),
          encryptedExcerpt:
            input.encryptedExcerpt !== undefined
              ? Buffer.from(input.encryptedExcerpt, "base64")
              : undefined,
        });
      }),
    ),

    getItem: volunteerProcedure.input(z.object({ itemId: z.uuid() })).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createItemSvc(ctx.org.tenantDb);
        return svc.findById(input.itemId);
      }),
    ),

    listItems: volunteerProcedure.input(kbItemListInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createItemSvc(ctx.org.tenantDb);
        return svc.list({
          categoryId: input.categoryId,
          limit: input.limit,
          cursor: input.cursor,
        });
      }),
    ),

    updateItem: volunteerProcedure.input(updateKbItemInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createItemSvc(ctx.org.tenantDb);
        // care-y-ignore-next-line route-delegates-to-service -- delegates to svc.update; Buffer.from is wire-format (base64 to Buffer) conversion, not business logic
        return svc.update(input.itemId, {
          categoryId: input.categoryId,
          encryptedTitle:
            input.encryptedTitle !== undefined
              ? Buffer.from(input.encryptedTitle, "base64")
              : undefined,
          encryptedBody:
            input.encryptedBody !== undefined
              ? Buffer.from(input.encryptedBody, "base64")
              : undefined,
          encryptedExcerpt:
            input.encryptedExcerpt !== undefined
              ? Buffer.from(input.encryptedExcerpt, "base64")
              : undefined,
        });
      }),
    ),

    deleteItem: managerProcedure.input(z.object({ itemId: z.uuid() })).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createItemSvc(ctx.org.tenantDb);
        // care-y-ignore-next-line route-delegates-to-service -- single service call, no business logic
        await svc.delete(input.itemId);
      }),
    ),

    // --- Dashboard: recently updated ---
    recentItems: volunteerProcedure
      .input(z.object({ limit: z.number().int().min(1).max(5).default(2) }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createItemSvc(ctx.org.tenantDb);
          return svc.listRecentlyUpdated(input.limit);
        }),
      ),

    // --- Voting ---
    castVote: volunteerProcedure.input(castVoteInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createVoteSvc(ctx.org.tenantDb);
        await svc.castVote(ctx.user.id, {
          itemId: input.itemId,
          direction: input.direction,
        });
      }),
    ),

    removeVote: volunteerProcedure.input(removeVoteInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createVoteSvc(ctx.org.tenantDb);
        await svc.removeVote(ctx.user.id, input.itemId);
      }),
    ),

    getUserVote: volunteerProcedure.input(z.object({ itemId: z.uuid() })).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createVoteSvc(ctx.org.tenantDb);
        return svc.getUserVote(ctx.user.id, input.itemId);
      }),
    ),
  });
}
