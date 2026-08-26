/**
 * Zod schemas for ticket system input validation.
 *
 * Encrypted fields use base64String() because:
 * 1. The shared package is isomorphic (browser + Node). Buffer is Node-only.
 * 2. tRPC transports binary as base64 strings over the wire.
 * 3. The route handler converts to Buffer via Buffer.from(input.field, "base64").
 */

import { z } from "zod";
import { base64Bytes, base64String } from "./validators.js";
import { ROLE_ID_VALUES_TUPLE } from "../roles.js";
import {
  portalChannelIdSchema,
  portalChannelKindSchema,
  eciesTripleSchema,
} from "./client-portal.js";
import {
  ticketIdSchema,
  userIdSchema,
  queueIdSchema,
  clientIdSchema,
  followupIdSchema,
  noteTypeIdSchema,
  attachmentIdSchema,
  recordingIdSchema,
  keyGenerationSchema,
  presetReplyIdSchema,
  clientMergeEventIdSchema,
} from "../ids.js";

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
  "share_link",
  "contact_correction",
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
    id: ticketIdSchema,
    queueId: queueIdSchema,
    clientId: clientIdSchema.optional(),
    clientToken: z.uuid().optional(), // not-an-id: correlation token for a client row that does not exist yet
    encryptedTitle: base64String("encryptedTitle"),
    encryptedDescription: base64String("encryptedDescription"),
    priority: ticketPrioritySchema.default("normal"),
    keyGeneration: keyGenerationSchema,
    keyWrap: keyWrapSchema,
  })
  .refine((data) => Boolean(data.clientId) !== Boolean(data.clientToken), {
    message: "Provide either clientId or clientToken, not both",
  });
export type CreateTicketInput = z.infer<typeof createTicketInputSchema>;

export const createFollowUpInputSchema = z.object({
  /** Client-minted follow-up id the content AAD was bound to (ADR-053). */
  id: followupIdSchema,
  ticketId: ticketIdSchema,
  encryptedContent: base64String("encryptedContent"),
  source: followUpSourceSchema,
  type: followUpTypeSchema,
  isPrivate: z.boolean().default(false),
  mentionedPseudonyms: z.array(z.string()).default([]),
  noteTypeId: noteTypeIdSchema.optional(),
  /** ECIES copy for the client's portal channel (present when client is Secure Link tier). */
  portalCopy: eciesTripleSchema.optional(),
});
export type CreateFollowUpInput = z.infer<typeof createFollowUpInputSchema>;

export const resolveCreateTargetInputSchema = z.object({
  clientId: clientIdSchema,
});
export type ResolveCreateTargetInput = z.infer<
  typeof resolveCreateTargetInputSchema
>;

export const updateReadCursorInputSchema = z.object({
  ticketId: ticketIdSchema,
  encryptedReadCursor: base64String("encryptedReadCursor"),
});
export type UpdateReadCursorInput = z.infer<typeof updateReadCursorInputSchema>;

export const updateTicketInputSchema = z.object({
  ticketId: ticketIdSchema,
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  queueId: queueIdSchema.optional(),
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
  queueId: queueIdSchema,
  encryptedName: base64String("encryptedName").optional(),
  encryptedColor: base64String("encryptedColor").optional(),
  encryptedIcon: base64String("encryptedIcon").optional(),
  escalateDays: z.number().int().min(0).max(MAX_ESCALATION_DAYS).optional(),
});
export type UpdateQueueInput = z.infer<typeof updateQueueInputSchema>;

export const reorderQueuesInputSchema = z.array(
  z.object({
    queueId: queueIdSchema,
    sortOrder: z.number().int().min(0),
  }),
);
export type ReorderQueuesInput = z.infer<typeof reorderQueuesInputSchema>;

export const deleteQueueInputSchema = z
  .object({
    queueId: queueIdSchema,
    reassignTo: queueIdSchema.optional(),
  })
  .refine((d) => d.reassignTo === undefined || d.reassignTo !== d.queueId, {
    message: "Cannot reassign tickets to the queue being deleted",
    path: ["reassignTo"],
  });
export type DeleteQueueInput = z.infer<typeof deleteQueueInputSchema>;

export const createPresetReplyInputSchema = z.object({
  encryptedTitle: base64String("encryptedTitle"),
  encryptedBody: base64String("encryptedBody"),
  queueId: queueIdSchema.nullable().default(null),
});
export type CreatePresetReplyInput = z.infer<
  typeof createPresetReplyInputSchema
>;

export const updatePresetReplyInputSchema = z.object({
  presetId: presetReplyIdSchema,
  encryptedTitle: base64String("encryptedTitle").optional(),
  encryptedBody: base64String("encryptedBody").optional(),
  queueId: queueIdSchema.nullable().optional(),
});
export type UpdatePresetReplyInput = z.infer<
  typeof updatePresetReplyInputSchema
>;

export const addDependencyInputSchema = z.object({
  ticketId: ticketIdSchema,
  dependsOnTicketId: ticketIdSchema,
});
export type AddDependencyInput = z.infer<typeof addDependencyInputSchema>;

export const mergeClientsInputSchema = z.object({
  primaryClientId: clientIdSchema,
  secondaryClientId: clientIdSchema,
  encryptedSnapshot: base64String("encryptedSnapshot"),
  keepChannelOf: z.enum(["primary", "secondary"]).optional(),
});
export type MergeClientsInput = z.infer<typeof mergeClientsInputSchema>;

export const undoMergeInputSchema = z.object({
  mergeEventId: clientMergeEventIdSchema,
  encryptedSnapshot: base64String("encryptedSnapshot"),
});
export type UndoMergeInput = z.infer<typeof undoMergeInputSchema>;

export const uploadAttachmentInputSchema = z.object({
  ticketId: ticketIdSchema,
  followUpId: followupIdSchema,
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
  queueIds: z.array(queueIdSchema).optional(),
  priorities: z.array(ticketPrioritySchema).optional(),
  onHold: z.boolean().optional(),
  assignedTo: userIdSchema.nullable().optional(),
  createdAfter: z.iso.datetime().optional(),
  createdBefore: z.iso.datetime().optional(),
  sortBy: ticketSortFieldSchema.default("date"),
  sortDirection: sortDirectionSchema.default("desc"),
  limit: z.number().int().min(1).max(100).default(50),
  cursor: ticketIdSchema.optional(),
});
export type TicketListInput = z.infer<typeof ticketListInputSchema>;

export const recentFollowUpsInputSchema = z.object({
  ticketIds: z.array(ticketIdSchema).min(1).max(50),
  perTicket: z.number().int().min(1).max(5).default(3),
  types: z.array(followUpTypeSchema).optional(),
});
export type RecentFollowUpsInput = z.infer<typeof recentFollowUpsInputSchema>;

/** Batched read-state lookup for the tickets list (cursor + reply times). */
export const listReadStateInputSchema = z.object({
  ticketIds: z.array(ticketIdSchema).min(1).max(50),
});
export type ListReadStateInput = z.infer<typeof listReadStateInputSchema>;

/**
 * Paginated sweep over all of the user's read-cursor rows (open tickets
 * in accessible queues). The cursor is a ticket id, never a read-state
 * derivative; the client pages this to build its global unread set.
 */
export const sweepReadStateInputSchema = z.object({
  cursor: ticketIdSchema.optional(),
  limit: z.number().int().min(1).max(200).default(200),
});
export type SweepReadStateInput = z.infer<typeof sweepReadStateInputSchema>;

export const followUpListDirectionSchema = z.enum(["newer", "older"]);

export const mediaFlagSchema = z.enum(["recording", "image", "file"]);
export type MediaFlag = z.infer<typeof mediaFlagSchema>;

export const followUpListInputSchema = z.object({
  ticketId: ticketIdSchema,
  limit: z.number().int().min(1).max(500).default(50),
  cursor: followupIdSchema.optional(),
  direction: followUpListDirectionSchema.default("newer"),
  types: z.array(followUpTypeSchema).optional(),
  mediaFlags: z.array(mediaFlagSchema).optional(),
  createdBy: z.array(userIdSchema).optional(),
  includeClientSource: z.boolean().optional(),
  dateFrom: z.iso.datetime({ offset: true }).optional(),
  dateTo: z.iso.datetime({ offset: true }).optional(),
});
export type FollowUpListInput = z.infer<typeof followUpListInputSchema>;

/** Input for the timeline summary endpoint. */
export const followUpSummaryInputSchema = z.object({
  ticketId: ticketIdSchema,
  limit: z.number().int().min(1).max(2000).default(500),
  cursor: followupIdSchema.optional(),
  direction: followUpListDirectionSchema.default("newer"),
  types: z.array(followUpTypeSchema).optional(),
  mediaFlags: z.array(mediaFlagSchema).optional(),
  createdBy: z.array(userIdSchema).optional(),
  includeClientSource: z.boolean().optional(),
  dateFrom: z.iso.datetime({ offset: true }).optional(),
  dateTo: z.iso.datetime({ offset: true }).optional(),
});
export type FollowUpSummaryInput = z.infer<typeof followUpSummaryInputSchema>;

/** Fetch specific follow-ups by ID (for expanding timeline clusters). */
export const followUpsByIdsInputSchema = z.object({
  ticketId: ticketIdSchema,
  followUpIds: z.array(followupIdSchema).min(1).max(200),
  types: z.array(followUpTypeSchema).optional(),
});
export type FollowUpsByIdsInput = z.infer<typeof followUpsByIdsInputSchema>;

/** List distinct volunteer participants on a ticket. */
export const listParticipantsInputSchema = z.object({
  ticketId: ticketIdSchema,
});
export type ListParticipantsInput = z.infer<typeof listParticipantsInputSchema>;

// --- Media list schemas ---

export const recordingListInputSchema = z.object({
  ticketId: ticketIdSchema,
  followupId: followupIdSchema.optional(),
  limit: z.number().int().min(1).max(200).default(50),
  cursor: recordingIdSchema.optional(),
  direction: followUpListDirectionSchema.default("newer"),
});
export type RecordingListInput = z.infer<typeof recordingListInputSchema>;

export const attachmentListInputSchema = z.object({
  ticketId: ticketIdSchema,
  followupId: followupIdSchema.optional(),
  limit: z.number().int().min(1).max(200).default(50),
  cursor: attachmentIdSchema.optional(),
  direction: followUpListDirectionSchema.default("newer"),
});
export type AttachmentListInput = z.infer<typeof attachmentListInputSchema>;

// --- Workflow schemas ---

export const assignTicketInputSchema = z.object({
  ticketId: ticketIdSchema,
});
export type AssignTicketInput = z.infer<typeof assignTicketInputSchema>;

export const takeTicketInputSchema = z.object({
  ticketId: ticketIdSchema,
});
export type TakeTicketInput = z.infer<typeof takeTicketInputSchema>;

export const releaseTicketInputSchema = z.object({
  ticketId: ticketIdSchema,
});
export type ReleaseTicketInput = z.infer<typeof releaseTicketInputSchema>;

export const assignToInputSchema = z.object({
  ticketId: ticketIdSchema,
  targetUserId: userIdSchema.nullable(),
});
export type AssignToInput = z.infer<typeof assignToInputSchema>;

export const watchTicketInputSchema = z.object({
  ticketId: ticketIdSchema,
});
export type WatchTicketInput = z.infer<typeof watchTicketInputSchema>;

export const queueWatcherInputSchema = z.object({
  queueId: queueIdSchema,
  userId: userIdSchema,
});
export type QueueWatcherInput = z.infer<typeof queueWatcherInputSchema>;

// --- Internal note edit/delete ---

export const updateInternalNoteInputSchema = z.object({
  followUpId: followupIdSchema,
  encryptedContent: base64String("encryptedContent"),
  noteTypeId: noteTypeIdSchema.optional(),
});
export type UpdateInternalNoteInput = z.infer<
  typeof updateInternalNoteInputSchema
>;

export const deleteInternalNoteInputSchema = z.object({
  followUpId: followupIdSchema,
});
export type DeleteInternalNoteInput = z.infer<
  typeof deleteInternalNoteInputSchema
>;

// --- Volunteer list (for @mention autocomplete) ---
// Return type is inferred by tRPC from the resolver. The server returns
// { id: string, encryptedDisplayName: string }, base64 encoded at the
// router, which OrgDecryptCache consumes directly.

export const queueAssignmentInputSchema = z.object({
  queueId: queueIdSchema,
  userId: userIdSchema,
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
  id: z.uuid(), // not-an-id: client-side saved filter, no table behind it
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
  z.object({ type: z.literal("queue"), value: queueIdSchema }),
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
  id: noteTypeIdSchema,
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
  followUpId: followupIdSchema,
  reaction: reactionTypeSchema,
});
export type ToggleReactionInput = z.infer<typeof toggleReactionInputSchema>;

export interface ReactionSummary {
  readonly reaction: ReactionType;
  readonly userIds: readonly string[];
}

// --- Client search ---

export const searchClientsInputSchema = z.object({
  query: z.string().max(100).default(""),
  limit: z.number().int().min(1).max(50).default(20),
});
export type SearchClientsInput = z.infer<typeof searchClientsInputSchema>;

// --- Ticket content editing (7.5b) ---

export const updateTicketContentInputSchema = z
  .object({
    ticketId: ticketIdSchema,
    encryptedTitle: base64String("encryptedTitle")
      .refine((s) => s.length <= 4 * 1024, "encryptedTitle too large")
      .optional(),
    encryptedDescription: base64String("encryptedDescription")
      .refine((s) => s.length <= 128 * 1024, "encryptedDescription too large")
      .optional(),
    keyGeneration: keyGenerationSchema,
  })
  .refine(
    (d) =>
      d.encryptedTitle !== undefined || d.encryptedDescription !== undefined,
    {
      message: "Provide at least one of encryptedTitle or encryptedDescription",
    },
  );
export type UpdateTicketContentInput = z.infer<
  typeof updateTicketContentInputSchema
>;

// --- Secure Link tier upgrade + outbound message editing ---

/** Volunteer upgrades a client to Secure Link tier. Browser sends the auth HASH, never the raw token. */
export const upgradeToSecureLinkInputSchema = z.object({
  ticketId: ticketIdSchema,
  channelId: portalChannelIdSchema,
  authHash: base64Bytes(32, "authHash"),
  clientPublic: base64Bytes(32, "clientPublic"),
  hasPassphrase: z.boolean(),
  keyCheck: eciesTripleSchema,
});
export type UpgradeToSecureLinkInput = z.infer<
  typeof upgradeToSecureLinkInputSchema
>;

/** Volunteer edits an outbound in-app message (re-encryption of both copies). */
export const updateOutboundMessageInputSchema = z.object({
  followUpId: followupIdSchema,
  encryptedContent: base64String("encryptedContent").refine(
    (s) => s.length <= 28_000,
    "too large",
  ),
  /** Re-encrypted client copy (present when the client has an active portal channel). */
  portalCopy: eciesTripleSchema.optional(),
});
export type UpdateOutboundMessageInput = z.infer<
  typeof updateOutboundMessageInputSchema
>;

// --- Encrypted Account (volunteer side, 8c) ---

/** Volunteer enables or disables the account upgrade offer on a Secure Link channel. */
export const setAccountOfferInputSchema = z.object({
  ticketId: ticketIdSchema,
  enabled: z.boolean(),
});
export type SetAccountOfferInput = z.infer<typeof setAccountOfferInputSchema>;

/** Volunteer resets (deletes) a client's encrypted account. */
export const resetClientAccountInputSchema = z.object({
  ticketId: ticketIdSchema,
});
export type ResetClientAccountInput = z.infer<
  typeof resetClientAccountInputSchema
>;

/** Wire shape for the portal channel metadata on a ticket payload. */
export const portalChannelMetaSchema = z.object({
  clientPublic: z.string(),
  hasPassphrase: z.boolean(),
  createdAt: z.string(),
  lastSeenAt: z.string().nullable(),
  kind: portalChannelKindSchema,
  accountOffer: z.boolean(),
});
export type PortalChannelMetaWire = z.infer<typeof portalChannelMetaSchema>;
