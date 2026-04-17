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
]);
export type NotificationEventType = z.infer<typeof notificationEventTypeSchema>;

// --- SSE event schema (what the server sends over the SSE stream) ---

export const sseEventSchema = z.object({
  type: notificationEventTypeSchema,
  ticketId: z.uuid(),
  queueId: z.uuid(),
  timestamp: z.iso.datetime(),
});
export type SseEvent = z.infer<typeof sseEventSchema>;

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
  queueId: z.uuid().optional(),
  assignedTo: z.uuid().optional(),
  clientAlias: z.string().max(100).optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
});
export type MetadataSearchInput = z.infer<typeof metadataSearchInputSchema>;

// --- Content search (paginated encrypted tickets for client-side search) ---

export const contentSearchInputSchema = z.object({
  queueId: z.uuid().optional(),
  status: z.enum(["open", "closed"]).optional(),
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
]);
export type AuditEventType = z.infer<typeof auditEventTypeSchema>;

export const auditLogQueryInputSchema = z.object({
  eventType: auditEventTypeSchema.optional(),
  actorId: z.uuid().optional(),
  ticketId: z.uuid().optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
});
export type AuditLogQueryInput = z.infer<typeof auditLogQueryInputSchema>;
