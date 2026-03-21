import type { SmsResponseRepository } from "./models/sms-response-repo.js";

export interface AutoReplyResult {
  readonly text: string;
  readonly locale: string;
}

/**
 * Selects the appropriate auto-reply text for a client's locale.
 *
 * Lookup order:
 * 1. Client's stored locale + response type
 * 2. Default locale (org config) + response type
 * 3. Hardcoded English fallback
 */
export async function selectAutoReply(
  smsResponseRepo: SmsResponseRepository,
  clientLocale: string,
  responseType: string,
  defaultLocale: string,
): Promise<AutoReplyResult> {
  const response = await smsResponseRepo.findWithFallback(
    clientLocale,
    responseType,
    defaultLocale,
  );

  if (response) {
    return { text: response.text, locale: response.locale };
  }

  // Hardcoded fallback (should never be reached if admin configured responses)
  return {
    text: "Thank you for reaching out. A volunteer will follow up with you.",
    locale: "en-US",
  };
}
