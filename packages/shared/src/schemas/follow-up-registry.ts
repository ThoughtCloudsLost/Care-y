import { z } from "zod";

import type { FollowUpSource, FollowUpType } from "./tickets.js";
import { ticketPrioritySchema } from "./tickets.js";

export type ContentCategory = "message" | "system" | "note" | "article";

export interface ContentTypeMeta {
  readonly category: ContentCategory;
  readonly allowedSources: readonly FollowUpSource[];
  readonly encryption: "ticket-key" | "server-minted-key" | "none";
  readonly hasEncryptedContent: boolean;
  readonly hasEventParams: boolean;
  readonly groupable: boolean;
}

export const assignmentEventParamsSchema = z.object({
  userId: z.uuid(),
});
export type AssignmentEventParams = z.infer<typeof assignmentEventParamsSchema>;

export const priorityEventParamsSchema = z.object({
  to: ticketPrioritySchema,
  from: ticketPrioritySchema.optional(),
});
export type PriorityEventParams = z.infer<typeof priorityEventParamsSchema>;

export const CONTENT_TYPE_REGISTRY: Record<FollowUpType, ContentTypeMeta> = {
  message: {
    category: "message",
    allowedSources: ["client", "volunteer"],
    encryption: "ticket-key",
    hasEncryptedContent: true,
    hasEventParams: false,
    groupable: false,
  },
  internal_note: {
    category: "note",
    allowedSources: ["volunteer"],
    encryption: "ticket-key",
    hasEncryptedContent: true,
    hasEventParams: false,
    groupable: false,
  },
  sms_outbound: {
    category: "message",
    allowedSources: ["volunteer"],
    encryption: "ticket-key",
    hasEncryptedContent: true,
    hasEventParams: false,
    groupable: false,
  },
  sms_inbound: {
    category: "message",
    allowedSources: ["client"],
    encryption: "ticket-key",
    hasEncryptedContent: true,
    hasEventParams: false,
    groupable: false,
  },
  phone_call: {
    category: "message",
    allowedSources: ["client", "volunteer"],
    encryption: "none",
    hasEncryptedContent: false,
    hasEventParams: false,
    groupable: false,
  },
  voicemail: {
    category: "message",
    allowedSources: ["client"],
    encryption: "ticket-key",
    hasEncryptedContent: true,
    hasEventParams: false,
    groupable: false,
  },
  hold_placed: {
    category: "system",
    allowedSources: ["system"],
    encryption: "none",
    hasEncryptedContent: false,
    hasEventParams: false,
    groupable: true,
  },
  hold_removed: {
    category: "system",
    allowedSources: ["system"],
    encryption: "none",
    hasEncryptedContent: false,
    hasEventParams: false,
    groupable: true,
  },
  volunteer_assigned: {
    category: "system",
    allowedSources: ["system"],
    encryption: "none",
    hasEncryptedContent: false,
    hasEventParams: true,
    groupable: false,
  },
  volunteer_unassigned: {
    category: "system",
    allowedSources: ["system"],
    encryption: "none",
    hasEncryptedContent: false,
    hasEventParams: true,
    groupable: false,
  },
  status_opened: {
    category: "system",
    allowedSources: ["system"],
    encryption: "none",
    hasEncryptedContent: false,
    hasEventParams: false,
    groupable: true,
  },
  status_closed: {
    category: "system",
    allowedSources: ["system"],
    encryption: "none",
    hasEncryptedContent: false,
    hasEventParams: false,
    groupable: true,
  },
  priority_changed: {
    category: "system",
    allowedSources: ["system"],
    encryption: "none",
    hasEncryptedContent: false,
    hasEventParams: true,
    groupable: false,
  },
  merge_note: {
    category: "system",
    allowedSources: ["system"],
    encryption: "none",
    hasEncryptedContent: false,
    hasEventParams: false,
    groupable: false,
  },
  share_link: {
    category: "message",
    allowedSources: ["volunteer"],
    encryption: "ticket-key",
    hasEncryptedContent: true,
    hasEventParams: true,
    groupable: false,
  },
} as const;
