// SMS notification ping sender.
// Wraps TelephonyProvider.sendSms() with notification-specific error handling.
// SMS pings are metadata-only (login URL). Never contain ticket content.

import type { TelephonyProvider } from "../telephony/provider.js";
import { NotificationError } from "../errors.js";

export interface NotificationSmsSender {
  sendPing(params: {
    readonly toPhoneNumber: string;
    readonly fromPhoneNumber: string;
    readonly body: string;
  }): Promise<void>;
}

export function createNotificationSmsSender(
  getProvider: (orgId: string) => Promise<TelephonyProvider>,
  orgId: string,
): NotificationSmsSender {
  return {
    async sendPing({ toPhoneNumber, fromPhoneNumber, body }): Promise<void> {
      const provider = await getProvider(orgId);
      try {
        await provider.sendSms(toPhoneNumber, body, fromPhoneNumber);
      } catch (err: unknown) {
        throw new NotificationError(
          `SMS ping delivery failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
  };
}
