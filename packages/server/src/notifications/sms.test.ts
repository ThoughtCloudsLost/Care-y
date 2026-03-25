import { describe, expect, it } from "vitest";
import { createNotificationSmsSender } from "./sms.js";
import type {
  TelephonyProvider,
  SendSmsResult,
} from "../telephony/provider.js";
import { NotificationError, TelephonyError } from "../errors.js";

function mockProvider(
  behavior: "success" | "fail" = "success",
): TelephonyProvider & { calls: unknown[] } {
  const calls: unknown[] = [];
  return {
    calls,
    providerId: "mock",
    async sendSms(
      to: string,
      body: string,
      callerId: string,
    ): Promise<SendSmsResult> {
      calls.push({ to, body, callerId });
      if (behavior === "fail") {
        throw new TelephonyError("Carrier rejected");
      }
      return { messageId: "SM_test_123" };
    },
    // Stubs for unused methods
    async initiateOutboundCall() {
      return "";
    },
    async initiateWebRtcCall() {
      return "";
    },
    validateWebhook() {
      return true;
    },
    parseIncomingCall() {
      return {} as ReturnType<TelephonyProvider["parseIncomingCall"]>;
    },
    parseIncomingSms() {
      return {} as ReturnType<TelephonyProvider["parseIncomingSms"]>;
    },
    generateVoiceResponse() {
      return "";
    },
    async getRecording() {
      return Buffer.alloc(0);
    },
    async deleteRecording() {
      // mock stub
    },
    async deleteCallLog() {
      // mock stub
    },
    async deleteMessageLog() {
      // mock stub
    },
    maskConfig() {
      return {} as ReturnType<TelephonyProvider["maskConfig"]>;
    },
  };
}

describe("createNotificationSmsSender", () => {
  it("calls provider.sendSms with correct arguments", async () => {
    const provider = mockProvider();
    const sender = createNotificationSmsSender(async () => provider, "org-123");

    await sender.sendPing({
      toPhoneNumber: "+15551234567",
      fromPhoneNumber: "+15559876543",
      body: "You have a new notification. Visit https://org.care-y.app/login",
    });

    expect(provider.calls).toHaveLength(1);
    const call = provider.calls[0] as Record<string, string>;
    expect(call.to).toBe("+15551234567");
    expect(call.callerId).toBe("+15559876543");
    expect(call.body).toContain("notification");
  });

  it("wraps provider errors in NotificationError", async () => {
    const provider = mockProvider("fail");
    const sender = createNotificationSmsSender(async () => provider, "org-123");

    await expect(
      sender.sendPing({
        toPhoneNumber: "+15551234567",
        fromPhoneNumber: "+15559876543",
        body: "ping",
      }),
    ).rejects.toThrow(NotificationError);
  });

  it("uses generic message without leaking provider error details", async () => {
    const provider = mockProvider("fail");
    const sender = createNotificationSmsSender(async () => provider, "org-123");

    await expect(
      sender.sendPing({
        toPhoneNumber: "+15551234567",
        fromPhoneNumber: "+15559876543",
        body: "ping",
      }),
    ).rejects.toThrow("SMS ping delivery failed");
  });
});
