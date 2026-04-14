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

// --- Category schemas ---

export const createKbCategoryInputSchema = z.object({
  encryptedName: base64String("encryptedName"),
  encryptedDescription: base64String("encryptedDescription").optional(),
});
export type CreateKbCategoryInput = z.infer<typeof createKbCategoryInputSchema>;

export const updateKbCategoryInputSchema = z.object({
  categoryId: z.uuid(),
  encryptedName: base64String("encryptedName").optional(),
  encryptedDescription: base64String("encryptedDescription").optional(),
});
export type UpdateKbCategoryInput = z.infer<typeof updateKbCategoryInputSchema>;

// --- Article schemas ---

export const createKbItemInputSchema = z.object({
  categoryId: z.uuid(),
  encryptedTitle: base64String("encryptedTitle"),
  encryptedBody: base64String("encryptedBody"),
  encryptedExcerpt: base64String("encryptedExcerpt").optional(),
});
export type CreateKbItemInput = z.infer<typeof createKbItemInputSchema>;

export const updateKbItemInputSchema = z.object({
  itemId: z.uuid(),
  categoryId: z.uuid().optional(),
  encryptedTitle: base64String("encryptedTitle").optional(),
  encryptedBody: base64String("encryptedBody").optional(),
  encryptedExcerpt: base64String("encryptedExcerpt").optional(),
});
export type UpdateKbItemInput = z.infer<typeof updateKbItemInputSchema>;

// --- Article listing (paginated) ---

export const kbItemListInputSchema = z.object({
  categoryId: z.uuid().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(), // opaque cursor: "created_at|id"
});
export type KbItemListInput = z.infer<typeof kbItemListInputSchema>;

// --- Voting schemas ---

export const voteDirectionSchema = z.enum(["up", "down"]);
export type VoteDirection = z.infer<typeof voteDirectionSchema>;

export const castVoteInputSchema = z.object({
  itemId: z.uuid(),
  direction: voteDirectionSchema,
});
export type CastVoteInput = z.infer<typeof castVoteInputSchema>;

export const removeVoteInputSchema = z.object({
  itemId: z.uuid(),
});
export type RemoveVoteInput = z.infer<typeof removeVoteInputSchema>;
