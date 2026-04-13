// Notification service orchestrator.
// Dispatches notification events across all channels:
// SSE (real-time in-app), email (metadata-only), SMS ping (optional), Web Push.
// Consumes NotificationRecipientList from notification-recipients.ts.
//
// Queue names are encrypted (ADR-030). SSE events carry queueId only.
// The client resolves the human-readable name from its org-key decrypt cache.

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { SseService } from "./sse.js";
import type { NotificationEmailSender, OrgEmailBranding } from "./email.js";
import { loadOrgEmailBranding } from "./email.js";
import type { PushNotificationSender } from "./push.js";
import type { JobQueue } from "../jobs/queue.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
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
    queueId: string,
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
      queueId,
      recipients,
    ) {
      const userIds = recipients.recipients.map((r) => r.userId);
      if (userIds.length === 0) return;

      const timestamp = new Date().toISOString();

      // 1. SSE (immediate, fire-and-forget)
      const sseEvent: SseEvent = {
        type: eventType,
        ticketId,
        queueId,
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
      });
    },
  };
}

export interface NotificationJobHandlerDeps {
  readonly emailSender: NotificationEmailSender;
  readonly encryptor: FieldEncryptor;
  readonly getTenantDb: (orgSchema: string) => Kysely<TenantDatabase>;
}

/**
 * Job handler for notification-email queue.
 * Decrypts user notification addresses and sends branded email per recipient.
 * Failures for individual recipients are logged but do not fail the job.
 */
export function createNotificationJobHandler(
  deps: NotificationJobHandlerDeps,
): (payload: Record<string, unknown>) => Promise<void> {
  const jobPayloadSchema = z.object({
    orgId: z.uuid(),
    orgSlug: z.string().min(1),
    recipientUserIds: z.array(z.uuid()),
    eventType: notificationEventTypeSchema,
  });

  return async (payload) => {
    const parsed = jobPayloadSchema.parse(payload);
    const { orgId, orgSlug, recipientUserIds, eventType } = parsed;
    const loginUrl = buildLoginUrl(orgSlug);

    const strings = getStrings("en");
    const body = getNotificationBody(strings, eventType, loginUrl);
    const subject = `${strings.emailSubjectPrefix}: ${getSubjectLine(eventType)}`;

    const tDb = deps.getTenantDb(orgId);
    const branding: OrgEmailBranding = await loadOrgEmailBranding(tDb);

    // Fetch notification addresses for all recipients in one query
    const users = await tDb
      .selectFrom("users")
      .select(["id", "encrypted_notification_addr"])
      .where("id", "in", recipientUserIds)
      .execute();

    for (const user of users) {
      if (!user.encrypted_notification_addr) continue;

      try {
        // care-y-ignore-next-line server-no-decrypt -- notification email is operational server-side PII (Tier 2, not E2EE)
        const email = deps.encryptor.decrypt(user.encrypted_notification_addr);
        await deps.emailSender.sendTicketNotification({
          to: email,
          subject,
          body,
          branding,
        });
      } catch {
        // Per-recipient failures are non-critical. The job succeeds even if
        // some emails fail (transient SMTP errors are retried by the queue).
        // Logging the user ID (pseudonym) is safe; the email address is not logged.
        console.error(
          `Notification email failed for user ${user.id}, event ${eventType}`,
        );
      }
    }
  };
}

function getNotificationBody(
  strings: ReturnType<typeof getStrings>,
  eventType: NotificationEventType,
  loginUrl: string,
): string {
  switch (eventType) {
    case "ticket_assigned":
      return strings.ticketAssigned(loginUrl);
    case "ticket_created":
      return strings.ticketCreated(loginUrl);
    case "ticket_escalated":
      return strings.ticketEscalated(loginUrl);
    case "followup_added":
      return strings.followupAdded(loginUrl);
    case "mention":
      return strings.mentionNotification(loginUrl);
    case "ticket_closed":
    case "ticket_reopened":
    case "merge_completed":
      return strings.followupAdded(loginUrl);
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
