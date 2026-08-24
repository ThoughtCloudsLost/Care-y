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
 * 5. Escalation recipients (from note type targets)
 *
 * Each user appears at most once. First source wins.
 * The acting user (who triggered the event) is excluded.
 */

import type {
  EscalationTarget,
  UserId,
  TicketId,
  QueueId,
} from "@care-y/shared";

export type RecipientSource =
  | "owner"
  | "cc"
  | "queue_watcher"
  | "mention"
  | "note_escalation"
  | "escalation_recipient";

export interface NotificationRecipient {
  readonly userId: UserId;
  readonly source: RecipientSource;
}

export interface NotificationRecipientList {
  /** Deduplicated, priority-ordered. First occurrence wins. */
  readonly recipients: readonly NotificationRecipient[];
}

export interface RecipientBuilderDeps {
  readonly getTicketWatchers: (ticketId: TicketId) => Promise<UserId[]>;
  readonly getQueueWatchers: (queueId: QueueId) => Promise<UserId[]>;
  readonly resolveValidMentions: (userIds: string[]) => Promise<UserId[]>;
}

export interface EscalationResolverDeps {
  readonly getUsersByRole: (role: "admin" | "manager") => Promise<UserId[]>;
  readonly getUsersByPermission: (permission: string) => Promise<UserId[]>;
  readonly getQueueMembers: (queueId: QueueId) => Promise<UserId[]>;
  readonly getTicketKeyWrapHolders: (ticketId: TicketId) => Promise<UserId[]>;
}

export async function resolveEscalationTargets(
  targets: EscalationTarget[],
  deps: EscalationResolverDeps,
  ticketId?: TicketId,
): Promise<UserId[]> {
  const userIds = new Set<UserId>();
  for (const target of targets) {
    switch (target.type) {
      case "role":
        for (const uid of await deps.getUsersByRole(target.value))
          userIds.add(uid);
        break;
      case "permission":
        for (const uid of await deps.getUsersByPermission(target.value))
          userIds.add(uid);
        break;
      case "queue":
        for (const uid of await deps.getQueueMembers(target.value))
          userIds.add(uid);
        break;
      case "ticket_access":
        if (ticketId !== undefined) {
          for (const uid of await deps.getTicketKeyWrapHolders(ticketId))
            userIds.add(uid);
        }
        break;
    }
  }
  return [...userIds];
}

/**
 * Build the deduplicated notification recipient list for a ticket event.
 */
export async function buildRecipientList(
  deps: RecipientBuilderDeps,
  ticket: { assignedTo: UserId | null; queueId: QueueId; id: TicketId },
  mentionedPseudonyms: string[],
  actingUserId: UserId,
  escalationUserIds?: UserId[],
): Promise<NotificationRecipientList> {
  const seen = new Set<UserId>();
  const recipients: NotificationRecipient[] = [];

  function add(userId: UserId, source: RecipientSource): void {
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

  // 5. Escalation recipients (from note type targets)
  if (escalationUserIds !== undefined) {
    for (const uid of escalationUserIds) add(uid, "note_escalation");
  }

  return { recipients };
}
