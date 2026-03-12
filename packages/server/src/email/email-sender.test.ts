import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createConsoleEmailSender,
  createSmtpEmailSender,
  createEmailSender,
  type EmailMessage,
} from "./email-sender.js";
import { EmailDeliveryError } from "../errors.js";

// vi.mock is required here: createTransport is called inside createSmtpEmailSender's
// closure, so vi.spyOn can't intercept it without restructuring production code.
// Same justification as SvelteKit virtual modules in test-setup.ts.
const mockSendMail = vi.fn();
vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({ sendMail: mockSendMail })),
}));

const TEST_SMTP_HOST = "localhost";
const TEST_SMTP_PORT = 1025;
const TEST_FROM = "noreply@test.com";

function createTestSmtpSender(): ReturnType<typeof createSmtpEmailSender> {
  return createSmtpEmailSender(TEST_SMTP_HOST, TEST_SMTP_PORT, TEST_FROM);
}

const testMessage: EmailMessage = {
  to: "user@example.com",
  subject: "Your verification code",
  text: "123456",
  html: "<p>123456</p>",
};

describe("createConsoleEmailSender", () => {
  it("logs subject and text length but redacts recipient", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockReturnValue(undefined);
    const sender = createConsoleEmailSender();

    await sender.send(testMessage);

    expect(consoleSpy).toHaveBeenCalledOnce();
    const loggedLine = consoleSpy.mock.calls[0]?.[0] as string;
    expect(loggedLine).toContain("<redacted>");
    expect(loggedLine).not.toContain("user@example.com");
    expect(loggedLine).toContain("Your verification code");
    expect(loggedLine).toContain(`length=${String(testMessage.text.length)}`);

    consoleSpy.mockRestore();
  });

  it("resolves without throwing", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockReturnValue(undefined);
    const sender = createConsoleEmailSender();

    await expect(sender.send(testMessage)).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });
});

describe("createSmtpEmailSender", () => {
  beforeEach(() => {
    mockSendMail.mockReset();
  });

  it("calls transport.sendMail with correct envelope", async () => {
    mockSendMail.mockResolvedValueOnce({});
    const sender = createTestSmtpSender();

    await sender.send(testMessage);

    expect(mockSendMail).toHaveBeenCalledOnce();
    expect(mockSendMail).toHaveBeenCalledWith({
      from: TEST_FROM,
      to: "user@example.com",
      subject: "Your verification code",
      text: "123456",
      html: "<p>123456</p>",
    });
  });

  it("sends without html when not provided", async () => {
    mockSendMail.mockResolvedValueOnce({});
    const sender = createTestSmtpSender();
    const textOnly: EmailMessage = {
      to: "user@example.com",
      subject: "Code",
      text: "654321",
    };

    await sender.send(textOnly);

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ html: undefined }),
    );
  });

  describe("error classification", () => {
    it("throws EmailDeliveryError with 400 for 550 recipient rejection", async () => {
      mockSendMail.mockRejectedValueOnce(new Error("550 User not found"));
      const sender = createSmtpEmailSender(
        "localhost",
        1025,
        "noreply@test.com",
      );

      try {
        await sender.send(testMessage);
        expect.fail("Should have thrown");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(EmailDeliveryError);
        const ede = err as EmailDeliveryError;
        expect(ede.httpStatus).toBe(400);
        expect(ede.message).toContain("deliver");
      }
    });

    it("throws EmailDeliveryError with 400 for 553 mailbox syntax error", async () => {
      mockSendMail.mockRejectedValueOnce(
        new Error("553 Mailbox name not allowed"),
      );
      const sender = createSmtpEmailSender(
        "localhost",
        1025,
        "noreply@test.com",
      );

      try {
        await sender.send(testMessage);
        expect.fail("Should have thrown");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(EmailDeliveryError);
        expect((err as EmailDeliveryError).httpStatus).toBe(400);
      }
    });

    it("throws EmailDeliveryError with 400 for 551 relay denied", async () => {
      mockSendMail.mockRejectedValueOnce(
        new Error("551 User not local; please try <forward-path>"),
      );
      const sender = createSmtpEmailSender(
        "localhost",
        1025,
        "noreply@test.com",
      );

      try {
        await sender.send(testMessage);
        expect.fail("Should have thrown");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(EmailDeliveryError);
        expect((err as EmailDeliveryError).httpStatus).toBe(400);
      }
    });

    it("throws EmailDeliveryError with 503 for connection refused", async () => {
      mockSendMail.mockRejectedValueOnce(new Error("connect ECONNREFUSED"));
      const sender = createSmtpEmailSender(
        "localhost",
        1025,
        "noreply@test.com",
      );

      try {
        await sender.send(testMessage);
        expect.fail("Should have thrown");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(EmailDeliveryError);
        const ede = err as EmailDeliveryError;
        expect(ede.httpStatus).toBe(503);
        expect(ede.message).toContain("try again");
      }
    });

    it("throws EmailDeliveryError with 503 for timeout", async () => {
      mockSendMail.mockRejectedValueOnce(new Error("Connection timeout"));
      const sender = createSmtpEmailSender(
        "localhost",
        1025,
        "noreply@test.com",
      );

      try {
        await sender.send(testMessage);
        expect.fail("Should have thrown");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(EmailDeliveryError);
        expect((err as EmailDeliveryError).httpStatus).toBe(503);
      }
    });

    it("throws EmailDeliveryError with 503 for transient 421 error", async () => {
      mockSendMail.mockRejectedValueOnce(
        new Error("421 Service not available, closing transmission channel"),
      );
      const sender = createSmtpEmailSender(
        "localhost",
        1025,
        "noreply@test.com",
      );

      try {
        await sender.send(testMessage);
        expect.fail("Should have thrown");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(EmailDeliveryError);
        expect((err as EmailDeliveryError).httpStatus).toBe(503);
      }
    });

    it("handles non-Error throw from transport", async () => {
      mockSendMail.mockRejectedValueOnce("raw string error");
      const sender = createSmtpEmailSender(
        "localhost",
        1025,
        "noreply@test.com",
      );

      try {
        await sender.send(testMessage);
        expect.fail("Should have thrown");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(EmailDeliveryError);
        // Non-Error doesn't match any 5xx pattern, falls through to 503
        expect((err as EmailDeliveryError).httpStatus).toBe(503);
      }
    });
  });
});

describe("createEmailSender", () => {
  it("returns SMTP sender when host and port are provided", async () => {
    mockSendMail.mockReset();
    mockSendMail.mockResolvedValueOnce({});

    const sender = createEmailSender("smtp.test.com", 587, TEST_FROM);
    await sender.send(testMessage);

    expect(mockSendMail).toHaveBeenCalledOnce();
  });

  it("returns console sender when host is undefined", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockReturnValue(undefined);
    const sender = createEmailSender(undefined, undefined, TEST_FROM);

    await sender.send(testMessage);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("returns console sender when port is undefined", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockReturnValue(undefined);
    const sender = createEmailSender("smtp.test.com", undefined, TEST_FROM);

    await sender.send(testMessage);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
