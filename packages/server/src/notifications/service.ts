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
import type {
  NotificationEventType,
  SseEvent,
  SystemSseEvent,
  OrgId,
  OrgSchema,
  OrgSlug,
  TicketId,
  QueueId,
  UserId,
} from "@care-y/shared";
import {
  notificationEventTypeSchema,
  orgSchemaNameSchema,
  orgSlugIdSchema,
  userIdSchema,
} from "@care-y/shared";
import { z } from "zod";
import { getStrings, buildLoginUrl } from "./i18n.js";
import type { NotificationRecipientList } from "../tickets/notification-recipients.js";
import type { NotificationPreferencesService } from "./preferences.js";
import type { DispatchAllowLists } from "./preferences.js";
import { getReachabilityForUsers } from "../telephony/reachability.js";
import { NOTIFICATION_SMS_QUEUE } from "../jobs/notification-sms.js";

export interface NotificationServiceDeps {
  readonly sse: SseService;
  readonly emailSender: NotificationEmailSender;
  readonly pushSender: PushNotificationSender;
  readonly jobQueue: JobQueue;
  readonly preferences: NotificationPreferencesService;
}

export interface NotificationService {
  dispatch(
    tDb: Kysely<TenantDatabase>,
    orgId: OrgId,
    orgSchema: OrgSchema,
    orgSlug: OrgSlug,
    eventType: NotificationEventType,
    ticketId: TicketId,
    queueId: QueueId,
    recipients: NotificationRecipientList,
  ): Promise<void>;

  /**
   * Dispatch a ticketless notification (no ticket or queue context).
   * Used for system events like voicemail quarantine that need to
   * reach specific users without a ticket association.
   */
  dispatchTicketless(
    tDb: Kysely<TenantDatabase>,
    orgId: OrgId,
    orgSchema: OrgSchema,
    orgSlug: OrgSlug,
    eventType: NotificationEventType,
    userIds: readonly UserId[],
  ): Promise<void>;
}

export function createNotificationService(
  deps: NotificationServiceDeps,
): NotificationService {
  return {
    async dispatch(
      tDb,
      orgId,
      orgSchema,
      orgSlug,
      eventType,
      ticketId,
      queueId,
      recipients,
    ) {
      const userIds = recipients.recipients.map((r) => r.userId);
      if (userIds.length === 0) return;

      // Resolve per-channel allow lists from the preference cascade.
      // Fail-open: if the preferences query throws, treat all channels as
      // allowed. For an at-risk-population support tool, a missed escalation
      // is worse than an unwanted email.
      const allow = await resolveAllowListsSafe(
        deps.preferences,
        tDb,
        userIds,
        eventType,
        ticketId,
        queueId,
      );

      const timestamp = new Date().toISOString();

      // 1. SSE (immediate, fire-and-forget)
      // SSE is the in-app feed and is always delivered to all recipients
      // regardless of preferences (design invariant).
      const sseEvent: SseEvent = {
        type: eventType,
        ticketId,
        queueId,
        timestamp,
      };
      deps.sse.broadcast(orgSchema, userIds, sseEvent);

      // 2. Web Push (filtered by preferences)
      if (allow.pushAllowed.length > 0) {
        void deps.pushSender
          .sendToUsers(tDb, [...allow.pushAllowed])
          .catch(() => {
            // Push failures are non-critical. Expired subscriptions
            // are cleaned up inside sendToUsers.
          });
      }

      // 3. SMS + email dispatch with reachability-based split.
      //
      // Users in smsAllowed who have verified_sms reachability get an SMS
      // ping. Everyone else in smsAllowed falls back to the email list.
      // The fallback deliberately overrides a disabled email preference
      // because a silently dropped escalation ping is the worse failure
      // mode for a support tool serving at-risk populations.
      //
      // Preference resolution happens at enqueue time, not at send time.
      // A retried job re-sends to the same recipient set even if the user
      // changed preferences between enqueue and retry. This is accepted:
      // enqueue-time semantics keep the job handler simple and the payload
      // PII-free (IDs only).

      let emailList: readonly UserId[];

      if (allow.smsAllowed.length > 0) {
        const reach = await getReachabilityForUsers(tDb, allow.smsAllowed);
        const smsDeliverable = allow.smsAllowed.filter(
          (id) => reach.get(id) === "verified_sms",
        );
        const smsFallback = allow.smsAllowed.filter(
          (id) => reach.get(id) !== "verified_sms",
        );
        emailList = [...new Set([...allow.emailAllowed, ...smsFallback])];

        if (smsDeliverable.length > 0) {
          await deps.jobQueue.enqueue(NOTIFICATION_SMS_QUEUE, {
            orgId,
            orgSchema,
            orgSlug,
            recipientUserIds: smsDeliverable,
            eventType,
          });
        }
      } else {
        emailList = allow.emailAllowed;
      }

      if (emailList.length > 0) {
        await deps.jobQueue.enqueue("notification-email", {
          orgSchema,
          orgSlug,
          recipientUserIds: [...emailList],
          eventType,
        });
      }
    },

    async dispatchTicketless(
      tDb,
      orgId,
      orgSchema,
      orgSlug,
      eventType,
      userIds,
    ) {
      if (userIds.length === 0) return;

      // Ticketless dispatch: no ticket or queue context, so preferences
      // resolve from global scope only.
      const allow = await resolveAllowListsSafe(
        deps.preferences,
        tDb,
        [...userIds],
        eventType,
        undefined,
        undefined,
      );

      const timestamp = new Date().toISOString();

      // 1. SSE (system event, no ticket/queue context)
      // Always delivered regardless of preferences.
      const sseEvent: SystemSseEvent = {
        type: "voicemail_quarantined",
        timestamp,
      };
      deps.sse.broadcast(orgSchema, userIds, sseEvent);

      // 2. Web Push (filtered by preferences)
      if (allow.pushAllowed.length > 0) {
        void deps.pushSender
          .sendToUsers(tDb, [...allow.pushAllowed])
          .catch(() => {
            // Push failures are non-critical. Expired subscriptions
            // are cleaned up inside sendToUsers.
          });
      }

      // 3. SMS + email dispatch with reachability-based split.
      // Same logic as dispatch(): verified_sms users get an SMS ping,
      // everyone else in smsAllowed falls back to the email list.
      // The fallback deliberately overrides a disabled email preference
      // because a silently dropped escalation ping is the worse failure
      // mode for a support tool serving at-risk populations.

      let emailList: readonly UserId[];

      if (allow.smsAllowed.length > 0) {
        const reach = await getReachabilityForUsers(tDb, allow.smsAllowed);
        const smsDeliverable = allow.smsAllowed.filter(
          (id) => reach.get(id) === "verified_sms",
        );
        const smsFallback = allow.smsAllowed.filter(
          (id) => reach.get(id) !== "verified_sms",
        );
        emailList = [...new Set([...allow.emailAllowed, ...smsFallback])];

        if (smsDeliverable.length > 0) {
          await deps.jobQueue.enqueue(NOTIFICATION_SMS_QUEUE, {
            orgId,
            orgSchema,
            orgSlug,
            recipientUserIds: smsDeliverable,
            eventType,
          });
        }
      } else {
        emailList = allow.emailAllowed;
      }

      if (emailList.length > 0) {
        await deps.jobQueue.enqueue("notification-email", {
          orgSchema,
          orgSlug,
          recipientUserIds: [...emailList],
          eventType,
        });
      }
    },
  };
}

/**
 * Wraps `resolveForDispatch` with fail-open error handling. If the preferences
 * query throws for any reason, all users are treated as allowed on every
 * channel. This is the safe direction for a support tool serving at-risk
 * populations: a missed escalation is worse than an unwanted notification.
 * No PII is logged (user IDs are pseudonyms, event types are enum strings).
 */
async function resolveAllowListsSafe(
  preferences: NotificationPreferencesService,
  tDb: Kysely<TenantDatabase>,
  userIds: readonly UserId[],
  eventType: NotificationEventType,
  ticketId: TicketId | undefined,
  queueId: QueueId | undefined,
): Promise<DispatchAllowLists> {
  try {
    return await preferences.resolveForDispatch(
      tDb,
      userIds,
      eventType,
      ticketId,
      queueId,
    );
  } catch (err: unknown) {
    console.error(
      "Notification preference resolution failed, falling back to all-allowed:",
      JSON.stringify(err),
    );
    return {
      pushAllowed: [...userIds],
      emailAllowed: [...userIds],
      smsAllowed: [...userIds],
    };
  }
}

export interface NotificationJobHandlerDeps {
  readonly emailSender: NotificationEmailSender;
  readonly encryptor: FieldEncryptor;
  readonly getTenantDb: (orgSchema: OrgSchema) => Kysely<TenantDatabase>;
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
    orgSchema: orgSchemaNameSchema,
    orgSlug: orgSlugIdSchema,
    recipientUserIds: z.array(userIdSchema),
    eventType: notificationEventTypeSchema,
  });

  return async (payload) => {
    const parsed = jobPayloadSchema.parse(payload);
    const { orgSchema, orgSlug, recipientUserIds, eventType } = parsed;
    if (recipientUserIds.length === 0) return;
    const loginUrl = buildLoginUrl(orgSlug);

    const strings = getStrings("en");
    const body = getNotificationBody(strings, eventType, loginUrl);
    const subject = `${strings.emailSubjectPrefix}: ${getSubjectLine(eventType)}`;

    const tDb = deps.getTenantDb(orgSchema);
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
        // care-y-ignore-next-line server-no-decrypt -- notification email is operational server-side PII (OPS_SECRETS_KEY scope, not E2EE)
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
    case "voicemail_quarantined":
      return strings.voicemailQuarantined(loginUrl);
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
    case "voicemail_quarantined":
      return "Voicemail quarantined";
  }
}
