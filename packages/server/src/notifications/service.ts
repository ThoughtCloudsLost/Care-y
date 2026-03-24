// Notification service orchestrator.
// Dispatches notification events across all channels:
// SSE (real-time in-app), email (metadata-only), SMS ping (optional), Web Push.
// Consumes NotificationRecipientList from notification-recipients.ts.

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { SseService } from "./sse.js";
import type { NotificationEmailSender } from "./email.js";
import type { PushNotificationSender } from "./push.js";
import type { JobQueue } from "../jobs/queue.js";
import type { NotificationEventType, SseEvent } from "@care-y/shared";
import { notificationEventTypeSchema } from "@care-y/shared";
import { z } from "zod";
import { getStrings, buildLoginUrl } from "./i18n.js";
import type { NotificationRecipientList } from "../tickets/notification-recipients.js";

export interface NotificationServiceDeps {
  readonly sse: SseService;
  readonly emailSender: NotificationEmailSender;
  readonly pushSender: PushNotificationSender;
  readonly jobQueue: JobQueue;
}

export interface NotificationService {
  dispatch(
    tDb: Kysely<TenantDatabase>,
    orgId: string,
    orgSlug: string,
    eventType: NotificationEventType,
    ticketId: string,
    queueName: string,
    recipients: NotificationRecipientList,
  ): Promise<void>;
}

export function createNotificationService(
  deps: NotificationServiceDeps,
): NotificationService {
  return {
    async dispatch(
      tDb,
      orgId,
      orgSlug,
      eventType,
      ticketId,
      queueName,
      recipients,
    ) {
      const userIds = recipients.recipients.map((r) => r.userId);
      if (userIds.length === 0) return;

      const timestamp = new Date().toISOString();

      // 1. SSE (immediate, fire-and-forget)
      const sseEvent: SseEvent = {
        type: eventType,
        ticketId,
        queueName,
        timestamp,
      };
      deps.sse.broadcast(orgId, userIds, sseEvent);

      // 2. Web Push (immediate, fire-and-forget)
      void deps.pushSender.sendToUsers(tDb, userIds).catch(() => {
        // Push failures are non-critical. Expired subscriptions
        // are cleaned up inside sendToUsers.
      });

      // 3. Email + SMS (via JobQueue for retry)
      await deps.jobQueue.enqueue("notification-email", {
        orgId,
        orgSlug,
        recipientUserIds: userIds,
        eventType,
        ticketId,
        queueName,
      });
    },
  };
}

/**
 * Job handler for notification-email queue.
 * Processes email delivery with retry. SMS is best-effort.
 *
 * Full implementation requires decrypting notification addresses from
 * the user table (field encryptor). Stubbed until that wiring is available.
 */
export function createNotificationJobHandler(
  emailSender: NotificationEmailSender,
): (payload: Record<string, unknown>) => Promise<void> {
  const jobPayloadSchema = z.object({
    orgId: z.uuid(),
    orgSlug: z.string().min(1),
    recipientUserIds: z.array(z.uuid()),
    eventType: notificationEventTypeSchema,
    queueName: z.string(),
  });

  return async (payload) => {
    const parsed = jobPayloadSchema.parse(payload);
    const { orgSlug, eventType, queueName } = parsed;
    const loginUrl = buildLoginUrl(orgSlug);

    // Build the notification message (validates all event types are handled)
    const strings = getStrings("en");
    const body = getNotificationBody(strings, eventType, queueName, loginUrl);
    const subject = `${strings.emailSubjectPrefix}: ${getSubjectLine(eventType)}`;

    // Stubbed: when field encryptor is wired, iterate recipientUserIds,
    // decrypt each user's notification_addr, and call emailSender.sendTicketNotification().
    // Using await here to satisfy require-await until the real send is wired.
    await Promise.resolve();
    void emailSender;
    void body;
    void subject;
  };
}

function getNotificationBody(
  strings: ReturnType<typeof getStrings>,
  eventType: NotificationEventType,
  queueName: string,
  loginUrl: string,
): string {
  switch (eventType) {
    case "ticket_assigned":
      return strings.ticketAssigned(queueName, loginUrl);
    case "ticket_created":
      return strings.ticketCreated(queueName, loginUrl);
    case "ticket_escalated":
      return strings.ticketEscalated(queueName, loginUrl);
    case "followup_added":
      return strings.followupAdded(queueName, loginUrl);
    case "mention":
      return strings.mentionNotification(queueName, loginUrl);
    case "ticket_closed":
    case "ticket_reopened":
    case "merge_completed":
      return strings.followupAdded(queueName, loginUrl);
  }
}

function getSubjectLine(eventType: NotificationEventType): string {
  switch (eventType) {
    case "ticket_assigned":
      return "Ticket assigned to you";
    case "ticket_created":
      return "New ticket";
    case "ticket_escalated":
      return "Ticket escalated";
    case "followup_added":
      return "Ticket updated";
    case "mention":
      return "You were mentioned";
    case "ticket_closed":
      return "Ticket closed";
    case "ticket_reopened":
      return "Ticket reopened";
    case "merge_completed":
      return "Client merge completed";
  }
}
