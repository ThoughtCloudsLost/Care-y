import { describe, expect, it } from "vitest";
import {
  createNotificationEmailSender,
  type OrgEmailBranding,
} from "./email.js";
import type { EmailSender } from "../email/email-sender.js";

function mockEmailSender(): EmailSender & { calls: unknown[] } {
  const calls: unknown[] = [];
  return {
    calls,
    async send(message): Promise<void> {
      calls.push(message);
      await Promise.resolve();
    },
  };
}

const DEFAULT_BRANDING: OrgEmailBranding = {
  fromName: "Test Hotline",
  fromAddress: "notify@test.org",
};

describe("createNotificationEmailSender", () => {
  it("calls transport.send with correct from header", async () => {
    const transport = mockEmailSender();
    const sender = createNotificationEmailSender(transport);

    await sender.sendTicketNotification({
      to: "volunteer@example.com",
      subject: "CARE-Y: New ticket",
      body: "A new ticket has arrived.",
      branding: DEFAULT_BRANDING,
    });

    expect(transport.calls).toHaveLength(1);
    const msg = transport.calls[0] as Record<string, unknown>;
    expect(msg.from).toBe('"Test Hotline" <notify@test.org>');
    expect(msg.to).toBe("volunteer@example.com");
    expect(msg.subject).toBe("CARE-Y: New ticket");
    expect(msg.text).toBe("A new ticket has arrived.");
  });

  it("propagates transport errors", async () => {
    const transport: EmailSender = {
      async send(): Promise<void> {
        throw new Error("SMTP connection refused");
      },
    };
    const sender = createNotificationEmailSender(transport);

    await expect(
      sender.sendTicketNotification({
        to: "volunteer@example.com",
        subject: "Test",
        body: "Test",
        branding: DEFAULT_BRANDING,
      }),
    ).rejects.toThrow("SMTP connection refused");
  });
});
