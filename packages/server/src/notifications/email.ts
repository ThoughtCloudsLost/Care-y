// Higher-level email notification sender.
// Wraps the low-level EmailSender (from auth/2FA) with per-org branding.

import type { EmailSender } from "../email/email-sender.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

export interface OrgEmailBranding {
  readonly fromName: string;
  readonly fromAddress: string;
}

/** Reads email branding columns from org_config. */
export async function loadOrgEmailBranding(
  tDb: Kysely<TenantDatabase>,
): Promise<OrgEmailBranding> {
  const row = await tDb
    .selectFrom("org_config")
    .select(["email_from_name", "email_from_address"])
    .executeTakeFirst();

  return {
    fromName: row?.email_from_name ?? "CARE-Y Hotline",
    fromAddress: row?.email_from_address ?? "notify@care-y.app",
  };
}

export interface NotificationEmailSender {
  sendTicketNotification(params: {
    readonly to: string;
    readonly subject: string;
    readonly body: string;
    readonly branding: OrgEmailBranding;
  }): Promise<void>;
}

/**
 * Creates a notification-level email sender that injects per-org branding
 * into the low-level EmailSender's from field.
 */
export function createNotificationEmailSender(
  transport: EmailSender,
): NotificationEmailSender {
  return {
    async sendTicketNotification({
      to,
      subject,
      body,
      branding,
    }): Promise<void> {
      const fromHeader = `"${branding.fromName}" <${branding.fromAddress}>`;
      await transport.send({
        to,
        subject,
        text: body,
        from: fromHeader,
      });
    },
  };
}
