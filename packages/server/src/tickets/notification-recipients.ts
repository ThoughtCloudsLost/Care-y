/**
 * Notification recipient builder.
 *
 * Produces a deduplicated, priority-ordered list of notification targets
 * for a ticket event. The notification delivery layer consumes this list.
 *
 * Priority order (05-tickets.md 5.1):
 * 1. Assigned owner (from ticket.assigned_to)
 * 2. CC/ticket watchers
 * 3. Queue watchers
 * 4. Mentioned users (one-off, not subscribed)
 *
 * Each user appears at most once. First source wins.
 * The acting user (who triggered the event) is excluded.
 */

export type RecipientSource = "owner" | "cc" | "queue_watcher" | "mention";

export interface NotificationRecipient {
  readonly userId: string;
  readonly source: RecipientSource;
}

export interface NotificationRecipientList {
  /** Deduplicated, priority-ordered. First occurrence wins. */
  readonly recipients: readonly NotificationRecipient[];
}

export interface RecipientBuilderDeps {
  readonly getTicketWatchers: (ticketId: string) => Promise<string[]>;
  readonly getQueueWatchers: (queueId: string) => Promise<string[]>;
  readonly resolveValidMentions: (userIds: string[]) => Promise<string[]>;
}

/**
 * Build the deduplicated notification recipient list for a ticket event.
 */
export async function buildRecipientList(
  deps: RecipientBuilderDeps,
  ticket: { assignedTo: string | null; queueId: string; id: string },
  mentionedPseudonyms: string[],
  actingUserId: string,
): Promise<NotificationRecipientList> {
  const seen = new Set<string>();
  const recipients: NotificationRecipient[] = [];

  function add(userId: string, source: RecipientSource): void {
    if (userId === actingUserId) return;
    if (seen.has(userId)) return;
    seen.add(userId);
    recipients.push({ userId, source });
  }

  // 1. Owner
  if (ticket.assignedTo !== null) {
    add(ticket.assignedTo, "owner");
  }

  // 2. CC/ticket watchers
  const watchers = await deps.getTicketWatchers(ticket.id);
  for (const uid of watchers) add(uid, "cc");

  // 3. Queue watchers
  const queueWatchers = await deps.getQueueWatchers(ticket.queueId);
  for (const uid of queueWatchers) add(uid, "queue_watcher");

  // 4. Mentions
  const validMentions = await deps.resolveValidMentions(mentionedPseudonyms);
  for (const uid of validMentions) add(uid, "mention");

  return { recipients };
}
