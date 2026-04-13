/**
 * Classify a follow-up into a rendering category.
 *
 * Used by TicketDetail, TicketPreview, ReplySheet, and FollowUpBubble
 * to determine which component to render for a given follow-up record.
 */
export function followUpKind(fu: {
  source: string;
  type: string;
}): "message" | "system" | "note" {
  if (fu.source === "system") return "system";
  if (fu.type === "internal_note") return "note";
  return "message";
}
