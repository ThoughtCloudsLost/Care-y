/**
 * The needs-attention rule, shared by the dashboard's Needs attention
 * lane and the tickets-page needs-attention filter.
 */

/** The structural subset of a ticket the needs-attention rule reads. */
export interface NeedsAttentionInput {
  readonly id: string;
  readonly status: string;
  readonly priority: string;
  readonly onHold: boolean;
  readonly assignedTo: string | null;
}

/**
 * One rule for the needs-attention overlay: urgent/high tickets that
 * are unassigned, or assigned to the viewer and carrying unread
 * replies. Shared by the dashboard lane and the tickets-page
 * membership filter so the "See all" landing shows the same set.
 *
 * The "mine + high" arm keys off real read state, not the raw
 * follow-up count, so membership settles as cursor decrypts land.
 */
export function isNeedsAttention(
  t: NeedsAttentionInput,
  currentUserId: string | undefined,
  isUnread: (ticketId: string) => boolean,
): boolean {
  if (t.onHold || t.status !== "open") return false;
  if (t.priority !== "urgent" && t.priority !== "high") return false;
  if (t.assignedTo === null) return true;
  return t.assignedTo === currentUserId && isUnread(t.id);
}
