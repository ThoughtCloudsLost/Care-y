/**
 * Inbound voice call handler. Receives parsed webhook data, runs the IVR
 * flow (language selection, returning-caller shortcut, or voicemail), and
 * returns VoiceInstruction[] for the provider to render as TwiML.
 *
 * Phone numbers are hashed (blind index) for lookup and sealed-box encrypted
 * for storage. Plaintext is zeroed immediately after encryption (via crypto-helpers).
 */

import type { IncomingCallData, VoiceInstruction } from "./provider.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import type { PhoneRepository } from "./models/phone-repo.js";
import type { ClientRepository } from "./models/client-repo.js";
import type {
  GreetingRecord,
  GreetingRepository,
} from "./models/greeting-repo.js";
import {
  buildLanguageSelectionIvr,
  buildReturningCallerIvr,
  buildVoicemailIvr,
  resolveLocaleFromDtmf,
} from "./ivr.js";
import { sealString } from "./crypto-helpers.js";

export interface InboundCallDeps {
  readonly sealedBox: SealedBoxEncryptor;
  readonly indexer: BlindIndexer;
  readonly phoneRepo: PhoneRepository;
  readonly clientRepo: ClientRepository;
  readonly greetingRepo: GreetingRepository;
  readonly orgId: string;
  readonly webhookBaseUrl: string;
  readonly defaultLocale: string;
}

const FALLBACK_GREETING: GreetingRecord = {
  id: "fallback",
  phoneId: "fallback",
  greetingType: "new_client",
  locale: "en-US",
  text: "Please leave a message after the beep.",
  isAudio: false,
  audioBlobKey: null,
};

/**
 * Process an inbound voice call and return IVR instructions.
 *
 * Three paths:
 * 1. DTMF digits present (caller responded to language selection): resolve
 *    locale, find-or-create client, play voicemail greeting.
 * 2. No digits, returning caller (phone hash found): play stored-locale
 *    greeting with brief re-selection opportunity.
 * 3. New caller (no digits, no phone record): play language selection IVR.
 */
export async function handleInboundCall(
  callData: IncomingCallData,
  body: Record<string, string>,
  deps: InboundCallDeps,
): Promise<readonly VoiceInstruction[]> {
  const {
    sealedBox,
    indexer,
    phoneRepo,
    clientRepo,
    greetingRepo,
    orgId,
    webhookBaseUrl,
    defaultLocale,
  } = deps;

  // eslint-disable-next-line @typescript-eslint/dot-notation
  const digits = body["Digits"];
  const phoneHash = indexer.hash(callData.from, orgId);

  // Single voice webhook URL handles DTMF, recording, and status callbacks
  const voiceWebhookUrl = `${webhookBaseUrl}/webhooks/twilio/${orgId}/voice`;

  // Path 1: DTMF response from language selection
  if (digits !== undefined) {
    const locale = resolveLocaleFromDtmf(digits) ?? defaultLocale;

    const encryptedNumber = sealString(sealedBox, callData.from);
    const { phone } = await clientRepo.findOrCreateByPhoneHash(
      phoneHash,
      encryptedNumber,
    );

    // Update locale if the caller picked something different
    if (phone.locale !== locale) {
      await phoneRepo.updateLocale(phone.id, locale);
    }

    const greeting = await greetingRepo.findByPhoneAndLocaleAndType(
      phone.id,
      locale,
      "new_client",
    );

    return buildVoicemailIvr(greeting ?? FALLBACK_GREETING, voiceWebhookUrl);
  }

  // Path 2: Returning caller (phone hash already exists)
  const existingPhone = await phoneRepo.findByHash(phoneHash);
  if (existingPhone) {
    const greeting = await greetingRepo.findByPhoneAndLocaleAndType(
      existingPhone.id,
      existingPhone.locale,
      "existing_client",
    );

    const reselectionGreeting = await greetingRepo.findByPhoneAndLocaleAndType(
      existingPhone.id,
      existingPhone.locale,
      "language_prompt",
    );

    if (greeting) {
      return buildReturningCallerIvr(
        greeting,
        reselectionGreeting,
        voiceWebhookUrl,
        voiceWebhookUrl,
      );
    }
  }

  // Path 3: New caller or no greeting configured for returning caller
  return buildLanguageSelectionIvr(null, voiceWebhookUrl);
}
