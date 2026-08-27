/**
 * Zod schemas for knowledge base input validation.
 *
 * Encrypted fields use base64String() because:
 * 1. The shared package is isomorphic (browser + Node). Buffer is Node-only.
 * 2. tRPC transports binary as base64 strings over the wire.
 * 3. The route handler converts to Buffer via Buffer.from(input.field, "base64").
 */

import { z } from "zod";
import { base64String } from "./validators.js";
import { sortDirectionSchema } from "./tickets.js";
import { KB_ATTACHMENT_MAX_BYTES } from "./limits.js";

export { KB_ATTACHMENT_MAX_BYTES } from "./limits.js";
import {
  kbCategoryIdSchema,
  kbItemIdSchema,
  kbAttachmentIdSchema,
  userIdSchema,
} from "../ids.js";

// --- Category schemas ---

export const createKbCategoryInputSchema = z.object({
  encryptedName: base64String("encryptedName"),
  encryptedDescription: base64String("encryptedDescription").optional(),
});
export type CreateKbCategoryInput = z.infer<typeof createKbCategoryInputSchema>;

export const updateKbCategoryInputSchema = z.object({
  categoryId: kbCategoryIdSchema,
  encryptedName: base64String("encryptedName").optional(),
  encryptedDescription: base64String("encryptedDescription").optional(),
});
export type UpdateKbCategoryInput = z.infer<typeof updateKbCategoryInputSchema>;

// --- Article schemas ---

export const createKbItemInputSchema = z.object({
  categoryId: kbCategoryIdSchema,
  encryptedTitle: base64String("encryptedTitle"),
  encryptedBody: base64String("encryptedBody"),
  encryptedExcerpt: base64String("encryptedExcerpt").optional(),
});
export type CreateKbItemInput = z.infer<typeof createKbItemInputSchema>;

export const updateKbItemInputSchema = z.object({
  itemId: kbItemIdSchema,
  categoryId: kbCategoryIdSchema.optional(),
  encryptedTitle: base64String("encryptedTitle").optional(),
  encryptedBody: base64String("encryptedBody").optional(),
  encryptedExcerpt: base64String("encryptedExcerpt").optional(),
});
export type UpdateKbItemInput = z.infer<typeof updateKbItemInputSchema>;

// --- Sort + filter for article listing ---

export const kbSortFieldSchema = z.enum(["created_at", "updated_at", "rating"]);
export type KbSortField = z.infer<typeof kbSortFieldSchema>;

// Re-export sortDirectionSchema for convenience (already defined in tickets.ts)
export { sortDirectionSchema } from "./tickets.js";

// --- Article listing (paginated) ---

export const kbItemListInputSchema = z.object({
  categoryId: kbCategoryIdSchema.optional(),
  sortBy: kbSortFieldSchema.default("created_at"),
  sortDirection: sortDirectionSchema.default("desc"),
  minRating: z.number().min(0).max(1).optional(),
  createdBy: userIdSchema.optional(),
  createdAfter: z.iso.datetime().optional(),
  createdBefore: z.iso.datetime().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(), // opaque cursor: "sortValue|id"
});
export type KbItemListInput = z.infer<typeof kbItemListInputSchema>;

// --- Bulk body fetch (for full search) ---

export const listKbBodiesInputSchema = z.object({
  itemIds: z.array(kbItemIdSchema).min(1).max(200),
});
export type ListKbBodiesInput = z.infer<typeof listKbBodiesInputSchema>;

// --- Saved filter state (serialized inside SavedFilterRecord.state) ---

export const kbSavedFilterStateSchema = z.object({
  categoryIds: z.array(z.string()),
  minRating: z.number().nullable(),
  createdBy: z.string().nullable(),
  dateFrom: z.string().nullable(),
  dateTo: z.string().nullable(),
  sortField: kbSortFieldSchema,
  sortDirection: sortDirectionSchema,
});
export type KbSavedFilterState = z.infer<typeof kbSavedFilterStateSchema>;

// --- Attachment schemas ---

/** Hard cap on attachments per article. Prevents storage exhaustion. */
export const KB_MAX_ATTACHMENTS_PER_ARTICLE = 50;

export const KB_ALLOWED_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type KbAllowedContentType = (typeof KB_ALLOWED_CONTENT_TYPES)[number];

export const kbContentTypeSchema = z.enum(KB_ALLOWED_CONTENT_TYPES);

export const uploadKbAttachmentInputSchema = z.object({
  itemId: kbItemIdSchema,
  blob: base64String("blob"),
  sizeBytes: z.number().int().min(1).max(KB_ATTACHMENT_MAX_BYTES),
  encryptedFilename: base64String("encryptedFilename").optional(),
  contentType: kbContentTypeSchema,
});
export type UploadKbAttachmentInput = z.infer<
  typeof uploadKbAttachmentInputSchema
>;

export const downloadKbAttachmentInputSchema = z.object({
  attachmentId: kbAttachmentIdSchema,
});
export type DownloadKbAttachmentInput = z.infer<
  typeof downloadKbAttachmentInputSchema
>;

export const listKbAttachmentsInputSchema = z.object({
  itemId: kbItemIdSchema,
});
export type ListKbAttachmentsInput = z.infer<
  typeof listKbAttachmentsInputSchema
>;

// --- Voting schemas ---

export const voteDirectionSchema = z.enum(["up", "down"]);
export type VoteDirection = z.infer<typeof voteDirectionSchema>;

export const castVoteInputSchema = z.object({
  itemId: kbItemIdSchema,
  direction: voteDirectionSchema,
});
export type CastVoteInput = z.infer<typeof castVoteInputSchema>;

export const removeVoteInputSchema = z.object({
  itemId: kbItemIdSchema,
});
export type RemoveVoteInput = z.infer<typeof removeVoteInputSchema>;
