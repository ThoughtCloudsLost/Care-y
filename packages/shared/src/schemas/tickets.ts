/**
 * Zod schemas for ticket system input validation.
 *
 * Encrypted fields use base64String() because:
 * 1. The shared package is isomorphic (browser + Node). Buffer is Node-only.
 * 2. tRPC transports binary as base64 strings over the wire.
 * 3. The route handler converts to Buffer via Buffer.from(input.field, "base64").
 */

import { z } from "zod";
import { base64String } from "./validators.js";

// --- Ticket enums ---

export const ticketStatusSchema = z.enum(["open", "closed"]);
export type TicketStatus = z.infer<typeof ticketStatusSchema>;

export const ticketPrioritySchema = z.enum(["low", "normal", "high", "urgent"]);
export type TicketPriority = z.infer<typeof ticketPrioritySchema>;

// Follow-up source: who created the follow-up (ADR-018 section 8)
export const followUpSourceSchema = z.enum(["client", "volunteer", "system"]);
export type FollowUpSource = z.infer<typeof followUpSourceSchema>;

// Follow-up type: what the follow-up represents
export const followUpTypeSchema = z.enum([
  "message",
  "status_change",
  "merge_note",
  "hold_change",
  "priority_change",
  "assignment_change",
  "internal_note",
]);
export type FollowUpType = z.infer<typeof followUpTypeSchema>;

// --- Input schemas ---

export const createTicketInputSchema = z.object({
  queueId: z.uuid(),
  clientId: z.uuid(),
  encryptedTitle: base64String("encryptedTitle"),
  encryptedDescription: base64String("encryptedDescription"),
  priority: ticketPrioritySchema.default("normal"),
  keyGeneration: z.uuid(),
});
export type CreateTicketInput = z.infer<typeof createTicketInputSchema>;

export const createFollowUpInputSchema = z.object({
  ticketId: z.uuid(),
  encryptedContent: base64String("encryptedContent"),
  encryptedReadState: base64String("encryptedReadState"),
  source: followUpSourceSchema,
  type: followUpTypeSchema,
  isPrivate: z.boolean().default(false),
  mentionedPseudonyms: z.array(z.string()).default([]),
});
export type CreateFollowUpInput = z.infer<typeof createFollowUpInputSchema>;

export const markReadInputSchema = z.object({
  followUpId: z.uuid(),
  encryptedReadState: base64String("encryptedReadState"),
});
export type MarkReadInput = z.infer<typeof markReadInputSchema>;

export const updateTicketInputSchema = z.object({
  ticketId: z.uuid(),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  queueId: z.uuid().optional(),
  onHold: z.boolean().optional(),
});
export type UpdateTicketInput = z.infer<typeof updateTicketInputSchema>;

export const createQueueInputSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  escalateDays: z.number().int().min(0).max(365).default(0),
});
export type CreateQueueInput = z.infer<typeof createQueueInputSchema>;

export const updateQueueInputSchema = z.object({
  queueId: z.uuid(),
  name: z.string().min(1).max(100).trim().optional(),
  escalateDays: z.number().int().min(0).max(365).optional(),
});
export type UpdateQueueInput = z.infer<typeof updateQueueInputSchema>;

export const createPresetReplyInputSchema = z.object({
  encryptedTitle: base64String("encryptedTitle"),
  encryptedBody: base64String("encryptedBody"),
  queueId: z.uuid().nullable().default(null),
});
export type CreatePresetReplyInput = z.infer<
  typeof createPresetReplyInputSchema
>;

export const updatePresetReplyInputSchema = z.object({
  presetId: z.uuid(),
  encryptedTitle: base64String("encryptedTitle").optional(),
  encryptedBody: base64String("encryptedBody").optional(),
  queueId: z.uuid().nullable().optional(),
});
export type UpdatePresetReplyInput = z.infer<
  typeof updatePresetReplyInputSchema
>;

export const addDependencyInputSchema = z.object({
  ticketId: z.uuid(),
  dependsOnTicketId: z.uuid(),
});
export type AddDependencyInput = z.infer<typeof addDependencyInputSchema>;

export const mergeClientsInputSchema = z.object({
  primaryClientId: z.uuid(),
  secondaryClientId: z.uuid(),
  encryptedSnapshot: base64String("encryptedSnapshot"),
});
export type MergeClientsInput = z.infer<typeof mergeClientsInputSchema>;

export const undoMergeInputSchema = z.object({
  mergeEventId: z.uuid(),
  encryptedSnapshot: base64String("encryptedSnapshot"),
});
export type UndoMergeInput = z.infer<typeof undoMergeInputSchema>;

export const uploadAttachmentInputSchema = z.object({
  ticketId: z.uuid(),
  followUpId: z.uuid(),
  encryptedBlob: base64String("encryptedBlob"),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(50 * 1024 * 1024), // 50MB max
});
export type UploadAttachmentInput = z.infer<typeof uploadAttachmentInputSchema>;

// --- Pagination ---

export const ticketListInputSchema = z.object({
  queueId: z.uuid().optional(),
  status: ticketStatusSchema.optional(),
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.uuid().optional(),
});
export type TicketListInput = z.infer<typeof ticketListInputSchema>;

export const followUpListInputSchema = z.object({
  ticketId: z.uuid(),
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.uuid().optional(),
});
export type FollowUpListInput = z.infer<typeof followUpListInputSchema>;
