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
import type { GreetingRepository } from "./models/greeting-repo.js";
import type { BlocklistRepository } from "./models/blocklist-repo.js";
import {
  buildLanguageSelectionIvr,
  buildReturningCallerIvr,
  buildVoicemailIvr,
  resolveLocaleFromDtmf,
} from "./ivr.js";
import type { PlayableGreeting } from "./ivr.js";
import { sealString } from "./crypto-helpers.js";
import type { CallTracker } from "./call-tracker.js";
import { blobKeySchema } from "@care-y/shared";
import type { OrgId, OrgSchema } from "@care-y/shared";

export interface InboundCallDeps {
  readonly sealedBox: SealedBoxEncryptor;
  readonly indexer: BlindIndexer;
  readonly phoneRepo: PhoneRepository;
  readonly clientRepo: ClientRepository;
  readonly greetingRepo: GreetingRepository;
  readonly blocklistRepo: BlocklistRepository;
  readonly orgId: OrgId;
  readonly orgSchema: OrgSchema;
  readonly webhookBaseUrl: string;
  readonly defaultLocale: string;
  readonly callTracker: CallTracker;
  /** Provider identifier for constructing webhook URLs (e.g. "twilio", "mock"). */
  readonly providerId: string;
}

const FALLBACK_GREETING: PlayableGreeting = {
  text: "Please leave a message after the beep.",
  isAudio: false,
  audioBlobKey: null,
};

/** Resolves a greeting's audioBlobKey to a full serving URL for Twilio <Play>. */
function resolveAudioUrl(
  greeting: PlayableGreeting,
  webhookBaseUrl: string,
): PlayableGreeting {
  if (!greeting.isAudio || greeting.audioBlobKey === null) return greeting;
  return {
    ...greeting,
    audioBlobKey: blobKeySchema.parse(
      `${webhookBaseUrl}/api/greetings/${greeting.audioBlobKey}`,
    ),
  };
}

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
    blocklistRepo,
    orgId,
    webhookBaseUrl,
    defaultLocale,
  } = deps;

  // eslint-disable-next-line @typescript-eslint/dot-notation
  const digits = body["Digits"];
  const phoneHash = indexer.hashPhone(callData.from, orgId);

  const isBlocked = await blocklistRepo.exists(phoneHash);
  if (isBlocked) return [{ type: "reject", attributes: { reason: "busy" } }];

  // Single voice webhook URL handles DTMF, recording, and status callbacks
  const voiceWebhookUrl = `${webhookBaseUrl}/webhooks/${deps.providerId}/${orgId}/voice`;

  // Path 1: DTMF response from language selection
  if (digits !== undefined) {
    const locale = resolveLocaleFromDtmf(digits) ?? defaultLocale;

    const encryptedNumber = sealString(sealedBox, callData.from);
    const { client, phone } = await clientRepo.findOrCreateByPhoneHash(
      phoneHash,
      encryptedNumber,
    );

    await deps.callTracker.track(deps.orgSchema, callData.callId, {
      ticketId: "",
      userId: null,
      direction: "inbound",
      orgSchema: deps.orgSchema,
      clientId: client.id,
      createdAt: Date.now(),
    });

    // Update locale if the caller picked something different
    if (phone.locale !== locale) {
      await phoneRepo.updateLocale(phone.id, locale);
    }

    const greeting = await greetingRepo.findByNumberAndLocaleAndType(
      callData.to,
      locale,
      "new_client",
    );

    const resolved = resolveAudioUrl(
      greeting ?? FALLBACK_GREETING,
      webhookBaseUrl,
    );
    return buildVoicemailIvr(resolved, voiceWebhookUrl);
  }

  // Path 2: Returning caller (phone hash already exists)
  const existingPhone = await phoneRepo.findByHash(phoneHash);
  if (existingPhone) {
    const existingClient = await clientRepo.findByPhoneId(existingPhone.id);
    if (existingClient) {
      await deps.callTracker.track(deps.orgSchema, callData.callId, {
        ticketId: "",
        userId: null,
        direction: "inbound",
        orgSchema: deps.orgSchema,
        clientId: existingClient.id,
        createdAt: Date.now(),
      });
    }

    const greeting = await greetingRepo.findByNumberAndLocaleAndType(
      callData.to,
      existingPhone.locale,
      "existing_client",
    );

    const reselectionGreeting = await greetingRepo.findByNumberAndLocaleAndType(
      callData.to,
      existingPhone.locale,
      "language_prompt",
    );

    if (greeting) {
      const resolvedGreeting = resolveAudioUrl(greeting, webhookBaseUrl);
      const resolvedReselection = reselectionGreeting
        ? resolveAudioUrl(reselectionGreeting, webhookBaseUrl)
        : null;
      return buildReturningCallerIvr(
        resolvedGreeting,
        resolvedReselection,
        voiceWebhookUrl,
        voiceWebhookUrl,
      );
    }
  }

  // Path 3: New caller or no greeting configured for returning caller
  return buildLanguageSelectionIvr(null, voiceWebhookUrl);
}
