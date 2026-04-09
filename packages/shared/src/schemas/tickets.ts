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
  source: followUpSourceSchema,
  type: followUpTypeSchema,
  isPrivate: z.boolean().default(false),
  mentionedPseudonyms: z.array(z.string()).default([]),
});
export type CreateFollowUpInput = z.infer<typeof createFollowUpInputSchema>;

export const updateReadCursorInputSchema = z.object({
  ticketId: z.uuid(),
  encryptedReadCursor: base64String("encryptedReadCursor"),
});
export type UpdateReadCursorInput = z.infer<typeof updateReadCursorInputSchema>;

export const updateTicketInputSchema = z.object({
  ticketId: z.uuid(),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  queueId: z.uuid().optional(),
  onHold: z.boolean().optional(),
});
export type UpdateTicketInput = z.infer<typeof updateTicketInputSchema>;

export const createQueueInputSchema = z.object({
  encryptedName: base64String("encryptedName"),
  escalateDays: z.number().int().min(0).max(365).default(0),
});
export type CreateQueueInput = z.infer<typeof createQueueInputSchema>;

export const updateQueueInputSchema = z.object({
  queueId: z.uuid(),
  encryptedName: base64String("encryptedName").optional(),
  escalateDays: z.number().int().min(0).max(365).optional(),
});
export type UpdateQueueInput = z.infer<typeof updateQueueInputSchema>;

export const reorderQueuesInputSchema = z.array(
  z.object({
    queueId: z.uuid(),
    sortOrder: z.number().int().min(0),
  }),
);
export type ReorderQueuesInput = z.infer<typeof reorderQueuesInputSchema>;

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

// --- Sort + Pagination ---

export const ticketSortFieldSchema = z.enum([
  "date",
  "priority",
  "last_activity",
  "queue",
]);
export type TicketSortField = z.infer<typeof ticketSortFieldSchema>;

export const sortDirectionSchema = z.enum(["asc", "desc"]);
export type SortDirection = z.infer<typeof sortDirectionSchema>;

export const ticketListInputSchema = z.object({
  statuses: z.array(ticketStatusSchema).optional(),
  queueIds: z.array(z.uuid()).optional(),
  priorities: z.array(ticketPrioritySchema).optional(),
  onHold: z.boolean().optional(),
  assignedTo: z.uuid().nullable().optional(),
  createdAfter: z.iso.datetime().optional(),
  createdBefore: z.iso.datetime().optional(),
  sortBy: ticketSortFieldSchema.default("date"),
  sortDirection: sortDirectionSchema.default("desc"),
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.uuid().optional(),
});
export type TicketListInput = z.infer<typeof ticketListInputSchema>;

export const recentFollowUpsInputSchema = z.object({
  ticketIds: z.array(z.uuid()).min(1).max(50),
  perTicket: z.number().int().min(1).max(5).default(3),
});
export type RecentFollowUpsInput = z.infer<typeof recentFollowUpsInputSchema>;

export const followUpListDirectionSchema = z.enum(["newer", "older"]);

export const followUpListInputSchema = z.object({
  ticketId: z.uuid(),
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.uuid().optional(),
  direction: followUpListDirectionSchema.default("newer"),
});
export type FollowUpListInput = z.infer<typeof followUpListInputSchema>;

/** Input for the timeline summary endpoint (no pagination, all follow-ups). */
export const followUpSummaryInputSchema = z.object({
  ticketId: z.uuid(),
});
export type FollowUpSummaryInput = z.infer<typeof followUpSummaryInputSchema>;

/** Fetch specific follow-ups by ID (for expanding timeline clusters). */
export const followUpsByIdsInputSchema = z.object({
  ticketId: z.uuid(),
  followUpIds: z.array(z.uuid()).min(1).max(200),
});
export type FollowUpsByIdsInput = z.infer<typeof followUpsByIdsInputSchema>;

// --- Workflow schemas ---

export const assignTicketInputSchema = z.object({
  ticketId: z.uuid(),
});
export type AssignTicketInput = z.infer<typeof assignTicketInputSchema>;

export const takeTicketInputSchema = z.object({
  ticketId: z.uuid(),
});
export type TakeTicketInput = z.infer<typeof takeTicketInputSchema>;

export const releaseTicketInputSchema = z.object({
  ticketId: z.uuid(),
});
export type ReleaseTicketInput = z.infer<typeof releaseTicketInputSchema>;

export const watchTicketInputSchema = z.object({
  ticketId: z.uuid(),
});
export type WatchTicketInput = z.infer<typeof watchTicketInputSchema>;

export const queueWatcherInputSchema = z.object({
  queueId: z.uuid(),
  userId: z.uuid(),
});
export type QueueWatcherInput = z.infer<typeof queueWatcherInputSchema>;

// --- Internal note edit/delete ---

export const updateInternalNoteInputSchema = z.object({
  followUpId: z.uuid(),
  encryptedContent: base64String("encryptedContent"),
});
export type UpdateInternalNoteInput = z.infer<
  typeof updateInternalNoteInputSchema
>;

export const deleteInternalNoteInputSchema = z.object({
  followUpId: z.uuid(),
});
export type DeleteInternalNoteInput = z.infer<
  typeof deleteInternalNoteInputSchema
>;

// --- Volunteer list (for @mention autocomplete) ---
// Return type is inferred by tRPC from the resolver. The server returns
// { id: string, encryptedDisplayName: Buffer } which tRPC serializes as
// { type: "Buffer", data: number[] } over the wire. OrgDecryptCache
// handles that shape via its SerializedBuffer type.

export const queueAssignmentInputSchema = z.object({
  queueId: z.uuid(),
  userId: z.uuid(),
});
export type QueueAssignmentInput = z.infer<typeof queueAssignmentInputSchema>;

// --- Saved filters ---

/** Display-level filter statuses (client derives "new"/"active" from server's "open"). */
export const displayStatusSchema = z.enum(["new", "active", "hold", "closed"]);
export type DisplayFilterStatus = z.infer<typeof displayStatusSchema>;

/** Serialized filter state stored inside a SavedFilterRecord's `state` JSON blob. */
export const savedFilterStateSchema = z.object({
  statuses: z.array(displayStatusSchema),
  queueIds: z.array(z.string()),
  priorities: z.array(ticketPrioritySchema),
  assigneeId: z.string().nullable().optional(),
  dateFrom: z.string().nullable(),
  dateTo: z.string().nullable(),
  sortField: ticketSortFieldSchema,
  sortDirection: sortDirectionSchema,
});
export type SavedFilterState = z.infer<typeof savedFilterStateSchema>;

export const savedFilterColorSchema = z.enum([
  "grey",
  "blue",
  "green",
  "orange",
  "red",
  "pink",
  "purple",
]);
export type SavedFilterColor = z.infer<typeof savedFilterColorSchema>;

export const savedFilterRecordSchema = z.object({
  id: z.uuid(),
  encryptedName: z.string().min(1),
  color: savedFilterColorSchema,
  icon: z.string().min(1).max(50),
  state: z.string().min(1),
  shared: z.boolean(),
  ownerId: z.string(),
  createdAt: z.iso.datetime(),
});
export type SavedFilterRecord = z.infer<typeof savedFilterRecordSchema>;
