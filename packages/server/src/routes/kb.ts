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
import type { KBMediaService } from "../kb/kb-media-service.js";
import type { BlobStore } from "../storage/store.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import {
  NotFoundError,
  ValidationError,
  AttachmentValidationError,
} from "../errors.js";
import { TRPCError } from "@trpc/server";
import { validateMagicBytes } from "../telephony/attachment-validator.js";

const KB_ALLOWED_CONTENT_TYPES: ReadonlySet<string> = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);
import {
  createKbCategoryInputSchema,
  updateKbCategoryInputSchema,
  createKbItemInputSchema,
  updateKbItemInputSchema,
  kbItemListInputSchema,
  castVoteInputSchema,
  removeVoteInputSchema,
  uploadKbAttachmentInputSchema,
  downloadKbAttachmentInputSchema,
  listKbAttachmentsInputSchema,
  listKbBodiesInputSchema,
  KB_ATTACHMENT_MAX_BYTES,
  ErrorCode,
} from "@care-y/shared";

export interface KBRouterDeps {
  readonly createCategorySvc: (
    tDb: OrgContext["tenantDb"],
  ) => KBCategoryService;
  readonly createItemSvc: (tDb: OrgContext["tenantDb"]) => KBItemService;
  readonly createVoteSvc: (tDb: OrgContext["tenantDb"]) => KBVoteService;
  readonly createMediaSvc: (tDb: OrgContext["tenantDb"]) => KBMediaService;
  readonly blobStore: BlobStore;
  readonly uploadLimiter: RateLimiter;
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
          sortBy: input.sortBy,
          sortDirection: input.sortDirection,
          minRating: input.minRating,
          createdBy: input.createdBy,
          createdAfter: input.createdAfter,
          createdBefore: input.createdBefore,
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
        const mediaSvc = deps.createMediaSvc(ctx.org.tenantDb);
        const attachments = await mediaSvc.listAttachments(input.itemId, {
          includeSoftDeleted: true,
        });
        for (const att of attachments) {
          await deps.blobStore.delete(att.blobKey);
        }

        const svc = deps.createItemSvc(ctx.org.tenantDb);
        await svc.delete(input.itemId);
      }),
    ),

    // --- Authors (for client-side filter dropdown) ---
    listAuthors: volunteerProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = deps.createItemSvc(ctx.org.tenantDb);
        return svc.listAuthors();
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

    // --- Bulk body fetch (for full search) ---
    listBodies: volunteerProcedure.input(listKbBodiesInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createItemSvc(ctx.org.tenantDb);
        return svc.listBodies(input.itemIds);
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

    // --- Attachments ---
    uploadAttachment: volunteerProcedure
      .input(uploadKbAttachmentInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          // Rate limit: 5 uploads per minute per user
          const rateResult = deps.uploadLimiter.check(ctx.user.id);
          if (!rateResult.allowed) {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: `Upload rate limited. Retry after ${String(Math.ceil(rateResult.retryAfterMs / 1000))}s`,
            });
          }

          const mediaSvc = deps.createMediaSvc(ctx.org.tenantDb);

          // Server-side size validation (client limit is easily bypassed)
          const blobBuffer = Buffer.from(input.blob, "base64");
          if (blobBuffer.byteLength > KB_ATTACHMENT_MAX_BYTES) {
            throw new ValidationError(
              `Attachment exceeds ${String(KB_ATTACHMENT_MAX_BYTES)} byte limit`,
            );
          }

          // Declared size must match actual blob size (catches client bugs and tampering)
          if (input.sizeBytes !== blobBuffer.byteLength) {
            throw new ValidationError(
              `Declared size ${String(input.sizeBytes)} does not match actual blob size ${String(blobBuffer.byteLength)}`,
            );
          }

          // Content type allowlist
          const normalizedType = (input.contentType.split(";")[0] ?? "")
            .trim()
            .toLowerCase();
          if (
            normalizedType.length > 0 &&
            !KB_ALLOWED_CONTENT_TYPES.has(normalizedType)
          ) {
            throw new AttachmentValidationError(
              `Content type "${normalizedType}" is not allowed. Accepted: ${[...KB_ALLOWED_CONTENT_TYPES].join(", ")}`,
              "content_type",
            );
          }

          // Magic byte verification (prevents content-type spoofing)
          if (normalizedType.length > 0) {
            validateMagicBytes(blobBuffer, normalizedType);
          }

          // care-y-ignore-next-line route-delegates-to-service -- blobStore.put is infrastructure (wire format), not business logic
          const blobKey = await deps.blobStore.put(
            ctx.org.orgSchema,
            "kb-attachment",
            blobBuffer,
          );

          try {
            return await mediaSvc.createAttachment({
              itemId: input.itemId,
              blobKey,
              sizeBytes: blobBuffer.byteLength,
              encryptedFilename:
                input.encryptedFilename !== undefined
                  ? Buffer.from(input.encryptedFilename, "base64")
                  : undefined,
              contentType: input.contentType,
            });
          } catch (err: unknown) {
            // Best-effort cleanup: remove the orphaned blob if the DB insert fails.
            // Failure here is harmless (orphaned blob on disk, no DB reference).
            await deps.blobStore.delete(blobKey).catch((_: unknown) => {
              // Intentional: blob orphan is harmless, swallow delete failure
            });
            throw err;
          }
        }),
      ),

    downloadAttachmentBlob: volunteerProcedure
      .input(downloadKbAttachmentInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const mediaSvc = deps.createMediaSvc(ctx.org.tenantDb);
          const record = await mediaSvc.getAttachment(input.attachmentId);
          const blob = await deps.blobStore.get(record.blobKey);
          if (!blob) {
            throw new NotFoundError(ErrorCode.KB_ATTACHMENT_NOT_FOUND);
          }
          return { data: blob.toString("base64") };
        }),
      ),

    listAttachments: volunteerProcedure
      .input(listKbAttachmentsInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const mediaSvc = deps.createMediaSvc(ctx.org.tenantDb);
          return mediaSvc.listAttachments(input.itemId);
        }),
      ),
  });
}
