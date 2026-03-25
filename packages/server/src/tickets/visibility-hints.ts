/**
 * Visibility hint constants for the Exposure system.
 *
 * Hints are static strings selected by trigger type. They never contain
 * dynamic user data, org names, or PII (visibility-system.md section 9).
 *
 * The Exposure UI layer renders these as inline banners/toasts.
 */

export type HintAudience = "volunteer" | "admin";

export interface VisibilityHint {
  readonly key: string;
  readonly text: string;
  readonly audience: HintAudience;
}

// --- Ticket-scoped hints (visibility-system.md section 6) ---

export const HINT_TICKET_OPEN_WEB: VisibilityHint = {
  key: "ticket_open_web",
  text: "This ticket's content is encrypted. Only you and assigned volunteers can read it. Even if someone breaks into this server, they cannot read it.",
  audience: "volunteer",
};

export const HINT_TICKET_OPEN_SMS: VisibilityHint = {
  key: "ticket_open_sms",
  text: "This ticket's content is encrypted. Only you and assigned volunteers can read it. The original text message passed through the phone provider before it was encrypted. CARE-Y can not control how the provider stores it.",
  audience: "volunteer",
};

export const HINT_SMS_SEND: VisibilityHint = {
  key: "sms_send",
  text: "SMS is not encrypted. Carriers and the phone provider can read it, and CARE-Y can not control how they store it. CARE-Y uses SMS for notifications only.",
  audience: "volunteer",
};

export const HINT_TICKET_ASSIGN: VisibilityHint = {
  key: "ticket_assign",
  text: "This volunteer will be able to read the client's name, phone number, messages, and case notes. Access cannot be revoked for content they have already decrypted.",
  audience: "admin",
};

/**
 * Determine which visibility hint (if any) should be included
 * when opening/viewing a ticket, based on how the ticket was created.
 */
export function getTicketOpenHint(
  ticketSource: "web" | "sms" | "voicemail" | "system",
): VisibilityHint | null {
  switch (ticketSource) {
    case "web":
      return HINT_TICKET_OPEN_WEB;
    case "sms":
    case "voicemail":
      return HINT_TICKET_OPEN_SMS;
    case "system":
      return null;
  }
}
