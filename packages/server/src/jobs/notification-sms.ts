// SMS notification ping job handler.
// Queue: "notification-sms". Payload carries org context, recipient user IDs,
// and event type only. Per-recipient: decrypt OPS-tier phone, send metadata-only
// ping, zero the Buffer. No phone numbers, decrypted content, or event details
// in payloads, logs, or errors.

import { z } from "zod";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type { TelephonyProvider } from "../telephony/provider.js";
import type {
  PhonePurpose,
  OrgIdentifiers,
} from "../telephony/phone-resolver.js";
import type { JobQueue } from "./queue.js";
import {
  notificationEventTypeSchema,
  orgIdSchema,
  orgSchemaNameSchema,
  orgSlugIdSchema,
  userIdSchema,
} from "@care-y/shared";
import type { OrgId, OrgSchema } from "@care-y/shared";
import { getStrings, buildLoginUrl } from "../notifications/i18n.js";
import { ValidationError } from "../errors.js";

export const NOTIFICATION_SMS_QUEUE = "notification-sms";

const notificationSmsPayloadSchema = z.object({
  orgId: orgIdSchema,
  orgSchema: orgSchemaNameSchema,
  orgSlug: orgSlugIdSchema,
  recipientUserIds: z.array(userIdSchema),
  eventType: notificationEventTypeSchema,
});

export type NotificationSmsPayload = z.infer<
  typeof notificationSmsPayloadSchema
>;

export interface NotificationSmsJobDeps {
  readonly encryptor: FieldEncryptor;
  readonly getTenantDb: (orgSchema: OrgSchema) => Kysely<TenantDatabase>;
  readonly getProvider: (orgId: OrgId) => Promise<TelephonyProvider>;
  readonly resolveCallerIdByPurpose: (
    org: OrgIdentifiers,
    purpose: PhonePurpose,
  ) => Promise<string | null>;
}

/**
 * Creates a job handler for the "notification-sms" queue.
 *
 * Per recipient: loads the consultant row where sms_pings_enabled is true
 * and ops_encrypted_phone is not null. Skips silently if absent (dispatch-time
 * reachability can go stale). Decrypts the OPS-tier phone to a Buffer, sends
 * a metadata-only ping via the org's telephony provider, and zeros the Buffer
 * in a finally block. Individual recipient failures are logged (user ID and
 * event type only) and do not fail the job.
 */
export function createNotificationSmsJobHandler(
  deps: NotificationSmsJobDeps,
): (payload: Record<string, unknown>) => Promise<void> {
  return async (rawPayload) => {
    const parseResult = notificationSmsPayloadSchema.safeParse(rawPayload);
    if (!parseResult.success) {
      throw new ValidationError(
        `Invalid notification-sms payload: ${parseResult.error.message}`,
      );
    }

    const { orgId, orgSchema, orgSlug, recipientUserIds, eventType } =
      parseResult.data;
    if (recipientUserIds.length === 0) return;

    const loginUrl = buildLoginUrl(orgSlug);
    const strings = getStrings("en");
    const body = strings.smsPing(loginUrl);

    const org: OrgIdentifiers = { orgId, orgSchema };
    const tDb = deps.getTenantDb(orgSchema);
    const from = await deps.resolveCallerIdByPurpose(org, "outbound");
    if (from === null) {
      console.error(
        `No caller ID for org ${orgSchema}, skipping SMS pings for event ${eventType}`,
      );
      return;
    }

    const provider = await deps.getProvider(orgId);

    // Load opted-in consultant rows in one query
    const rows = await tDb
      .selectFrom("consultants")
      .select(["user_id", "ops_encrypted_phone"])
      .where("user_id", "in", [...recipientUserIds])
      .where("sms_pings_enabled", "=", true)
      .execute();

    // Index by user_id for O(1) lookup
    const rowByUserId = new Map(rows.map((r) => [r.user_id, r]));

    for (const userId of recipientUserIds) {
      const row = rowByUserId.get(userId);
      // Skip silently if no consultant row, not opted in, or no OPS phone
      if (!row?.ops_encrypted_phone) continue;

      let phoneBuf: Buffer | null = null;
      try {
        // care-y-ignore-next-line server-no-decrypt -- OPS-tier phone for server-initiated SMS ping (same tier as notification email addresses)
        phoneBuf = deps.encryptor.decryptToBuffer(row.ops_encrypted_phone);
        await provider.sendSms(phoneBuf.toString("utf-8"), body, from);
      } catch {
        // Per-recipient failures are non-critical. Log only the user ID
        // (pseudonym) and event type. Never log the phone number.
        console.error(`SMS ping failed for user ${userId}, event ${eventType}`);
      } finally {
        phoneBuf?.fill(0);
      }
    }
  };
}

/**
 * Registers the notification-sms job handler on the given JobQueue.
 * Called once at server startup alongside the email handler registration.
 */
export function registerNotificationSmsHandler(
  jobQueue: JobQueue,
  deps: NotificationSmsJobDeps,
): void {
  jobQueue.process(
    NOTIFICATION_SMS_QUEUE,
    createNotificationSmsJobHandler(deps),
  );
}
