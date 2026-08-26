/**
 * Zod schemas for notifications, search, and audit log input validation.
 *
 * SSE events, push subscriptions, metadata/content search, and audit log
 * queries are validated against these schemas.
 *
 * No encrypted fields here. Notification payloads are metadata-only
 * (queue IDs, ticket IDs, timestamps). Content search returns
 * encrypted blobs from the tickets table, but the search input itself
 * is plaintext filter criteria.
 */

import { z } from "zod";
import { ticketIdSchema, queueIdSchema, userIdSchema } from "../ids.js";

// --- Notification event types (extensible by future phases) ---

export const notificationEventTypeSchema = z.enum([
  "ticket_created",
  "ticket_assigned",
  "ticket_closed",
  "ticket_reopened",
  "ticket_escalated",
  "followup_added",
  "mention",
  "merge_completed",
  "voicemail_quarantined",
]);
export type NotificationEventType = z.infer<typeof notificationEventTypeSchema>;

// --- SSE event schema (what the server sends over the SSE stream) ---

export const sseEventSchema = z.object({
  type: notificationEventTypeSchema,
  ticketId: ticketIdSchema,
  queueId: queueIdSchema,
  timestamp: z.iso.datetime(),
});
export type SseEvent = z.infer<typeof sseEventSchema>;

// --- System SSE event (ticketless notifications, e.g., voicemail quarantine) ---

export const systemSseEventSchema = z.object({
  type: z.literal("voicemail_quarantined"),
  timestamp: z.iso.datetime(),
});
export type SystemSseEvent = z.infer<typeof systemSseEventSchema>;

/** Union of ticket-scoped and system (ticketless) SSE events. */
export type AnySseEvent = SseEvent | SystemSseEvent;

// --- Push subscription (from browser PushSubscription API) ---

export const pushSubscriptionInputSchema = z.object({
  endpoint: z.url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionInputSchema>;

export const unsubscribePushInputSchema = z.object({
  endpoint: z.url(),
});
export type UnsubscribePushInput = z.infer<typeof unsubscribePushInputSchema>;

// --- Metadata search ---

export const metadataSearchInputSchema = z.object({
  status: z.enum(["open", "closed"]).optional(),
  queueId: queueIdSchema.optional(),
  assignedTo: userIdSchema.optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
});
export type MetadataSearchInput = z.infer<typeof metadataSearchInputSchema>;

// --- Content search (paginated encrypted tickets for client-side search) ---

export const contentSearchInputSchema = z.object({
  queueId: queueIdSchema.optional(),
  status: z.enum(["open", "closed"]).optional(),
  ticketIds: z.array(ticketIdSchema).max(500).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(50),
});
export type ContentSearchInput = z.infer<typeof contentSearchInputSchema>;

// --- Audit log ---

export const auditEventTypeSchema = z.enum([
  "ticket_created",
  "ticket_closed",
  "ticket_reopened",
  "ticket_assigned",
  "ticket_escalated",
  "ticket_merged",
  "followup_added",
  "media_soft_deleted",
  "media_hard_deleted",
  "queue_created",
  "queue_updated",
  "queue_deleted",
  "preset_created",
  "preset_updated",
  "note_type_created",
  "note_type_updated",
  "merge_undone",
  "merge_lock_changed",
  "voicemail_quarantined",
  "voicemail_quarantine_routed",
  "voicemail_quarantine_dismissed",
  "client_alias_changed",
  "client_phone_changed",
  "ticket_content_updated",
  "escalation_rule_created",
  "escalation_rule_updated",
  "escalation_rule_deleted",
  "role_permission_changed",
  "role_permissions_reset",
  "intake_form_saved",
  "intake_form_deleted",
  "intake_form_bound",
  "web_intake_toggled",
  "client_tier_changed",
  "portal_channel_regenerated",
  "portal_channel_revoked",
  "client_account_created",
  "client_account_password_changed",
  "client_account_reset",
  "account_offer_changed",
  "intake_responses_viewed",
  "intake_responses_exported",
]);
export type AuditEventType = z.infer<typeof auditEventTypeSchema>;

export const auditLogQueryInputSchema = z.object({
  eventType: auditEventTypeSchema.optional(),
  actorId: userIdSchema.optional(),
  ticketId: ticketIdSchema.optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
});
export type AuditLogQueryInput = z.infer<typeof auditLogQueryInputSchema>;

// --- Notification preference schemas ---

/** Deliverable channels. SSE is excluded: always delivered, never toggleable. */
export const notificationChannelSchema = z.enum(["push", "email", "sms"]);
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;

export const preferenceScopeTypeSchema = z.enum(["global", "queue", "ticket"]);
export type PreferenceScopeType = z.infer<typeof preferenceScopeTypeSchema>;

export const setPreferenceInputSchema = z
  .object({
    scopeType: preferenceScopeTypeSchema,
    scopeId: z.union([queueIdSchema, ticketIdSchema]).nullable(),
    eventType: notificationEventTypeSchema,
    channel: notificationChannelSchema,
    enabled: z.boolean(),
  })
  .refine((v) => (v.scopeType === "global") === (v.scopeId === null), {
    message: "scopeId must be null exactly when scopeType is global",
  });
export type SetPreferenceInput = z.infer<typeof setPreferenceInputSchema>;

export const resetPreferencesInputSchema = z
  .object({
    scopeType: preferenceScopeTypeSchema.optional(),
    scopeId: z.union([queueIdSchema, ticketIdSchema]).nullable().optional(),
  })
  .refine(
    (v) => {
      if (v.scopeType === undefined) return true;
      return (v.scopeType === "global") === (v.scopeId === null);
    },
    { message: "scopeId must be null exactly when scopeType is global" },
  );
export type ResetPreferencesInput = z.infer<typeof resetPreferencesInputSchema>;

export const preferenceRowSchema = z.object({
  scopeType: preferenceScopeTypeSchema,
  scopeId: z.union([queueIdSchema, ticketIdSchema]).nullable(),
  eventType: notificationEventTypeSchema,
  channel: notificationChannelSchema,
  enabled: z.boolean(),
});
export type PreferenceRow = z.infer<typeof preferenceRowSchema>;
