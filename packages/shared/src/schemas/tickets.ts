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
import { ROLE_ID_VALUES_TUPLE } from "../roles.js";

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
  "internal_note",
  "sms_outbound",
  "sms_inbound",
  "phone_call",
  "voicemail",
  "hold_placed",
  "hold_removed",
  "volunteer_assigned",
  "volunteer_unassigned",
  "status_opened",
  "status_closed",
  "priority_changed",
  "merge_note",
]);
export type FollowUpType = z.infer<typeof followUpTypeSchema>;

// Call status: terminal states for phone calls
export const callStatusSchema = z.enum([
  "completed",
  "no_answer",
  "busy",
  "failed",
  "canceled",
]);
export type CallStatus = z.infer<typeof callStatusSchema>;

// --- Key wrap schema (ECIES-wrapped symmetric ticket key) ---

export const keyWrapSchema = z.object({
  ephemeralPoint: base64String("ephemeralPoint"),
  nonce: base64String("nonce"),
  wrappedKey: base64String("wrappedKey"),
});
export type KeyWrap = z.infer<typeof keyWrapSchema>;

// --- Input schemas ---

export const createTicketInputSchema = z
  .object({
    /** Client-minted ticket id the content AAD was bound to (ADR-053). */
    id: z.uuid(),
    queueId: z.uuid(),
    clientId: z.uuid().optional(),
    clientToken: z.uuid().optional(),
    encryptedTitle: base64String("encryptedTitle"),
    encryptedDescription: base64String("encryptedDescription"),
    priority: ticketPrioritySchema.default("normal"),
    keyGeneration: z.uuid(),
    keyWrap: keyWrapSchema,
  })
  .refine((data) => Boolean(data.clientId) !== Boolean(data.clientToken), {
    message: "Provide either clientId or clientToken, not both",
  });
export type CreateTicketInput = z.infer<typeof createTicketInputSchema>;

export const createFollowUpInputSchema = z.object({
  /** Client-minted follow-up id the content AAD was bound to (ADR-053). */
  id: z.uuid(),
  ticketId: z.uuid(),
  encryptedContent: base64String("encryptedContent"),
  source: followUpSourceSchema,
  type: followUpTypeSchema,
  isPrivate: z.boolean().default(false),
  mentionedPseudonyms: z.array(z.string()).default([]),
  noteTypeId: z.uuid().optional(),
});
export type CreateFollowUpInput = z.infer<typeof createFollowUpInputSchema>;

export const resolveCreateTargetInputSchema = z.object({
  clientId: z.uuid(),
});
export type ResolveCreateTargetInput = z.infer<
  typeof resolveCreateTargetInputSchema
>;

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

export const MAX_ESCALATION_DAYS = 365;

export const createQueueInputSchema = z.object({
  encryptedName: base64String("encryptedName"),
  // Color and icon are org-key encrypted picker tokens, required on
  // creation (the form always preselects defaults). The vocabulary is
  // enforced client-side; the server stores opaque ciphertext.
  encryptedColor: base64String("encryptedColor"),
  encryptedIcon: base64String("encryptedIcon"),
  escalateDays: z.number().int().min(0).max(MAX_ESCALATION_DAYS).default(0),
});
export type CreateQueueInput = z.infer<typeof createQueueInputSchema>;

export const updateQueueInputSchema = z.object({
  queueId: z.uuid(),
  encryptedName: base64String("encryptedName").optional(),
  encryptedColor: base64String("encryptedColor").optional(),
  encryptedIcon: base64String("encryptedIcon").optional(),
  escalateDays: z.number().int().min(0).max(MAX_ESCALATION_DAYS).optional(),
});
export type UpdateQueueInput = z.infer<typeof updateQueueInputSchema>;

export const reorderQueuesInputSchema = z.array(
  z.object({
    queueId: z.uuid(),
    sortOrder: z.number().int().min(0),
  }),
);
export type ReorderQueuesInput = z.infer<typeof reorderQueuesInputSchema>;

export const deleteQueueInputSchema = z
  .object({
    queueId: z.uuid(),
    reassignTo: z.uuid().optional(),
  })
  .refine((d) => d.reassignTo === undefined || d.reassignTo !== d.queueId, {
    message: "Cannot reassign tickets to the queue being deleted",
    path: ["reassignTo"],
  });
export type DeleteQueueInput = z.infer<typeof deleteQueueInputSchema>;

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
  "msgs",
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
  types: z.array(followUpTypeSchema).optional(),
});
export type RecentFollowUpsInput = z.infer<typeof recentFollowUpsInputSchema>;

/** Batched read-state lookup for the tickets list (cursor + reply times). */
export const listReadStateInputSchema = z.object({
  ticketIds: z.array(z.uuid()).min(1).max(50),
});
export type ListReadStateInput = z.infer<typeof listReadStateInputSchema>;

/**
 * Paginated sweep over all of the user's read-cursor rows (open tickets
 * in accessible queues). The cursor is a ticket id, never a read-state
 * derivative; the client pages this to build its global unread set.
 */
export const sweepReadStateInputSchema = z.object({
  cursor: z.uuid().optional(),
  limit: z.number().int().min(1).max(200).default(200),
});
export type SweepReadStateInput = z.infer<typeof sweepReadStateInputSchema>;

export const followUpListDirectionSchema = z.enum(["newer", "older"]);

export const mediaFlagSchema = z.enum(["recording", "image", "file"]);
export type MediaFlag = z.infer<typeof mediaFlagSchema>;

export const followUpListInputSchema = z.object({
  ticketId: z.uuid(),
  limit: z.number().int().min(1).max(500).default(50),
  cursor: z.uuid().optional(),
  direction: followUpListDirectionSchema.default("newer"),
  types: z.array(followUpTypeSchema).optional(),
  mediaFlags: z.array(mediaFlagSchema).optional(),
  createdBy: z.array(z.uuid()).optional(),
  includeClientSource: z.boolean().optional(),
  dateFrom: z.iso.datetime({ offset: true }).optional(),
  dateTo: z.iso.datetime({ offset: true }).optional(),
});
export type FollowUpListInput = z.infer<typeof followUpListInputSchema>;

/** Input for the timeline summary endpoint. */
export const followUpSummaryInputSchema = z.object({
  ticketId: z.uuid(),
  limit: z.number().int().min(1).max(2000).default(500),
  cursor: z.uuid().optional(),
  direction: followUpListDirectionSchema.default("newer"),
  types: z.array(followUpTypeSchema).optional(),
  mediaFlags: z.array(mediaFlagSchema).optional(),
  createdBy: z.array(z.uuid()).optional(),
  includeClientSource: z.boolean().optional(),
  dateFrom: z.iso.datetime({ offset: true }).optional(),
  dateTo: z.iso.datetime({ offset: true }).optional(),
});
export type FollowUpSummaryInput = z.infer<typeof followUpSummaryInputSchema>;

/** Fetch specific follow-ups by ID (for expanding timeline clusters). */
export const followUpsByIdsInputSchema = z.object({
  ticketId: z.uuid(),
  followUpIds: z.array(z.uuid()).min(1).max(200),
  types: z.array(followUpTypeSchema).optional(),
});
export type FollowUpsByIdsInput = z.infer<typeof followUpsByIdsInputSchema>;

/** List distinct volunteer participants on a ticket. */
export const listParticipantsInputSchema = z.object({
  ticketId: z.uuid(),
});
export type ListParticipantsInput = z.infer<typeof listParticipantsInputSchema>;

// --- Media list schemas ---

export const recordingListInputSchema = z.object({
  ticketId: z.uuid(),
  followupId: z.uuid().optional(),
  limit: z.number().int().min(1).max(200).default(50),
  cursor: z.uuid().optional(),
  direction: followUpListDirectionSchema.default("newer"),
});
export type RecordingListInput = z.infer<typeof recordingListInputSchema>;

export const attachmentListInputSchema = z.object({
  ticketId: z.uuid(),
  followupId: z.uuid().optional(),
  limit: z.number().int().min(1).max(200).default(50),
  cursor: z.uuid().optional(),
  direction: followUpListDirectionSchema.default("newer"),
});
export type AttachmentListInput = z.infer<typeof attachmentListInputSchema>;

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

export const assignToInputSchema = z.object({
  ticketId: z.uuid(),
  targetUserId: z.uuid().nullable(),
});
export type AssignToInput = z.infer<typeof assignToInputSchema>;

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
  noteTypeId: z.uuid().optional(),
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
// { id: string, encryptedDisplayName: string }, base64 encoded at the
// router, which OrgDecryptCache consumes directly.

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
  unreadOnly: z.boolean().default(false),
  needsAttentionOnly: z.boolean().default(false),
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

export const ticketActionSchema = z.enum([
  "call",
  "take",
  "release",
  "assign",
  "hold",
  "unhold",
  "close",
  "reopen",
  "watch",
  "unwatch",
  "cancel",
]);
export type TicketAction = z.infer<typeof ticketActionSchema>;

// --- Note type schemas (internal note categorization + escalation routing) ---

export const escalationTargetSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("role"), value: z.enum(["admin", "manager"]) }),
  z.object({ type: z.literal("permission"), value: z.string().min(1) }),
  z.object({ type: z.literal("queue"), value: z.uuid() }),
  z.object({ type: z.literal("ticket_access") }),
]);
export type EscalationTarget = z.infer<typeof escalationTargetSchema>;

export const roleIdSchema = z.enum(ROLE_ID_VALUES_TUPLE);

export const createNoteTypeInputSchema = z.object({
  encryptedName: base64String("encryptedName"),
  encryptedIcon: base64String("encryptedIcon"),
  encryptedDescription: base64String("encryptedDescription").optional(),
  escalationTargets: z.array(escalationTargetSchema),
  requiresOnClose: z.boolean().optional(),
  minViewRole: roleIdSchema.optional(),
  minCreateRole: roleIdSchema.optional(),
});
export type CreateNoteTypeInput = z.infer<typeof createNoteTypeInputSchema>;

export const updateNoteTypeInputSchema = z.object({
  id: z.uuid(),
  encryptedName: base64String("encryptedName").optional(),
  encryptedIcon: base64String("encryptedIcon").optional(),
  encryptedDescription: base64String("encryptedDescription")
    .nullable()
    .optional(),
  escalationTargets: z.array(escalationTargetSchema).optional(),
  isActive: z.boolean().optional(),
  requiresOnClose: z.boolean().optional(),
  minViewRole: roleIdSchema.optional(),
  minCreateRole: roleIdSchema.optional(),
});
export type UpdateNoteTypeInput = z.infer<typeof updateNoteTypeInputSchema>;

// --- Reactions (internal note feedback) ---

export const REACTION_TYPES = [
  "acknowledge",
  "approve",
  "disagree",
  "flag",
  "complete",
] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];
export const reactionTypeSchema = z.enum(REACTION_TYPES);

export const toggleReactionInputSchema = z.object({
  followUpId: z.uuid(),
  reaction: reactionTypeSchema,
});
export type ToggleReactionInput = z.infer<typeof toggleReactionInputSchema>;

export interface ReactionSummary {
  readonly reaction: ReactionType;
  readonly userIds: readonly string[];
}

// --- Client search ---

export const searchClientsInputSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().int().min(1).max(20).default(10),
});
export type SearchClientsInput = z.infer<typeof searchClientsInputSchema>;
