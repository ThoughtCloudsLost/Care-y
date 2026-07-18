import { CONTENT_TYPE_REGISTRY, type ContentCategory } from "@care-y/shared";
import type { ContentTypeMeta } from "@care-y/shared";

const registry: Readonly<Record<string, ContentTypeMeta | undefined>> =
  CONTENT_TYPE_REGISTRY;

/**
 * Classify a follow-up into a rendering category.
 *
 * Used by TicketDetail, TicketPreview, ReplySheet, and FollowUpBubble
 * to determine which component to render for a given follow-up record.
 */
export function followUpKind(fu: { type: string }): ContentCategory {
  return registry[fu.type]?.category ?? "message";
}
