/**
 * Zod schemas for voicemail quarantine input validation.
 *
 * Quarantined voicemails are recordings that could not be routed to a
 * ticket at webhook time. They are stored encrypted (sealed to the org
 * public key) and held for manual resolution by an admin.
 */

import { z } from "zod";

// --- Enum schemas ---

export const quarantineReasonSchema = z.enum([
  "tracker_miss",
  "no_intake_queue",
  "unresolved_client",
]);
export type QuarantineReason = z.infer<typeof quarantineReasonSchema>;

export const quarantineStatusSchema = z.enum([
  "pending",
  "routed",
  "dismissed",
]);
export type QuarantineStatus = z.infer<typeof quarantineStatusSchema>;

// --- Size constants ---

/** 10 MB in bytes. Matches KB_ATTACHMENT_MAX_BYTES cap. */
export const VOICEMAIL_QUARANTINE_MAX_BYTES = 10 * 1024 * 1024;

/**
 * Maximum base64-encoded string length for a 10 MB payload.
 * Base64 encoding expands 3 bytes into 4 characters, so the ceiling
 * is ceil(maxBytes / 3) * 4.
 */
export const VOICEMAIL_QUARANTINE_MAX_BASE64_LENGTH =
  Math.ceil(VOICEMAIL_QUARANTINE_MAX_BYTES / 3) * 4;

// --- System actor ---

/** Nil UUID used as actor_id for system-generated audit entries. */
export const SYSTEM_ACTOR_ID = "00000000-0000-0000-0000-000000000000";

// --- Input schemas ---

export const listQuarantineInputSchema = z.object({
  status: quarantineStatusSchema.optional(),
  limit: z.number().int().min(1).max(200).default(50),
});
export type ListQuarantineInput = z.infer<typeof listQuarantineInputSchema>;

export const downloadQuarantineInputSchema = z.object({
  quarantineId: z.uuid(),
});
export type DownloadQuarantineInput = z.infer<
  typeof downloadQuarantineInputSchema
>;

const routeTargetSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("clientId"), clientId: z.uuid() }),
  z.object({ type: z.literal("clientToken"), clientToken: z.string().min(1) }),
  z.object({ type: z.literal("ticketId"), ticketId: z.uuid() }),
]);

export const routeQuarantineInputSchema = z.object({
  quarantineId: z.uuid(),
  target: routeTargetSchema,
  audioData: z.string().min(1).max(VOICEMAIL_QUARANTINE_MAX_BASE64_LENGTH),
  durationSeconds: z.number().int().min(0).optional(),
});
export type RouteQuarantineInput = z.infer<typeof routeQuarantineInputSchema>;

export const dismissQuarantineInputSchema = z.object({
  quarantineId: z.uuid(),
});
export type DismissQuarantineInput = z.infer<
  typeof dismissQuarantineInputSchema
>;

export const setIntakeQueueInputSchema = z.object({
  queueId: z.uuid().nullable(),
});
export type SetIntakeQueueInput = z.infer<typeof setIntakeQueueInputSchema>;
