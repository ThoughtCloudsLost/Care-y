import { createTransport, type Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import { EmailDeliveryError, extractErrorMessage } from "../errors.js";

export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html?: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

/**
 * SMTP reply codes that indicate a permanent recipient rejection.
 * 550 = mailbox unavailable, 551 = user not local, 553 = mailbox name not allowed.
 * RFC 5321 section 4.2.3 classifies these as permanent negative completion replies.
 */
const RECIPIENT_REJECTION_CODES = ["550", "551", "553"] as const;

function isRecipientRejection(errorMessage: string): boolean {
  return RECIPIENT_REJECTION_CODES.some((code) => errorMessage.includes(code));
}

/** SMTP-based sender. Works with Mailpit in dev and real SMTP in production. */
export function createSmtpEmailSender(
  host: string,
  port: number,
  from: string,
): EmailSender {
  const transport: Transporter<SMTPTransport.SentMessageInfo> = createTransport(
    {
      host,
      port,
      secure: false,
    },
  );

  return {
    async send(message: EmailMessage): Promise<void> {
      try {
        await transport.sendMail({
          from,
          to: message.to,
          subject: message.subject,
          text: message.text,
          html: message.html,
        });
      } catch (err: unknown) {
        const msg = extractErrorMessage(err);

        if (isRecipientRejection(msg)) {
          throw new EmailDeliveryError(
            "Could not deliver to that email address.",
            400,
          );
        }

        // Connection refused, timeout, transient 4xx
        throw new EmailDeliveryError(
          "Could not send verification code. Please try again.",
          503,
        );
      }
    },
  };
}

/** Logs emails to stdout. Fallback when no SMTP is configured. */
export function createConsoleEmailSender(): EmailSender {
  return {
    async send(message: EmailMessage): Promise<void> {
      // eslint-disable-next-line no-console
      console.log(
        `[email] to=<redacted> subject="${message.subject}" length=${String(message.text.length)}`,
      );
    },
  };
}

/** Creates the appropriate sender based on environment config. */
export function createEmailSender(
  smtpHost: string | undefined,
  smtpPort: number | undefined,
  from: string,
): EmailSender {
  if (smtpHost && smtpPort) {
    return createSmtpEmailSender(smtpHost, smtpPort, from);
  }
  return createConsoleEmailSender();
}
