import type { VoiceInstruction } from "./provider.js";
import type { GreetingRecord } from "./models/greeting-repo.js";

export const LOCALE_DTMF_MAP: Readonly<Record<string, string>> = {
  "1": "en-US",
  "2": "es-MX",
  "3": "fr-FR",
};

/**
 * Builds IVR instructions for a new caller (no stored locale).
 * Plays the language selection prompt, then waits for DTMF input.
 * On timeout (2 seconds), defaults to the org's default locale.
 */
export function buildLanguageSelectionIvr(
  languagePromptGreeting: GreetingRecord | null,
  statusCallbackUrl: string,
): readonly VoiceInstruction[] {
  const promptText =
    languagePromptGreeting?.text ??
    "For English, press 1. Para español, oprima 2.";

  return [
    {
      type: "gather",
      attributes: {
        numDigits: "1",
        timeout: "2",
        action: statusCallbackUrl,
        method: "POST",
      },
      children: [
        {
          type: "say",
          attributes: {
            text: promptText,
          },
        },
      ],
    },
  ];
}

/**
 * Builds IVR instructions for a returning caller.
 * Plays a brief re-selection prompt (2-second timeout), then
 * falls through to the stored-locale greeting + voicemail record.
 */
export function buildReturningCallerIvr(
  greeting: GreetingRecord,
  reselectionGreeting: GreetingRecord | null,
  recordingCallbackUrl: string,
  statusCallbackUrl: string,
): readonly VoiceInstruction[] {
  const instructions: VoiceInstruction[] = [];

  // Brief re-selection opportunity (2 seconds)
  if (reselectionGreeting) {
    instructions.push({
      type: "gather",
      attributes: {
        numDigits: "1",
        timeout: "2",
        action: statusCallbackUrl,
        method: "POST",
      },
      children: [
        {
          type: "say",
          attributes: { text: reselectionGreeting.text },
        },
      ],
    });
  }

  // Main greeting
  if (greeting.isAudio && greeting.audioBlobKey !== null) {
    instructions.push({
      type: "play",
      attributes: { text: greeting.audioBlobKey },
    });
  } else {
    instructions.push({
      type: "say",
      attributes: { text: greeting.text },
    });
  }

  // Record voicemail
  instructions.push({
    type: "record",
    attributes: {
      maxLength: "120",
      action: recordingCallbackUrl,
      method: "POST",
      playBeep: "true",
      transcribe: "false",
    },
  });

  return instructions;
}

/**
 * Resolves a DTMF digit to a locale code.
 * Returns null if the digit doesn't map to a known locale.
 */
export function resolveLocaleFromDtmf(digit: string): string | null {
  // eslint-disable-next-line security/detect-object-injection
  return LOCALE_DTMF_MAP[digit] ?? null;
}

/**
 * Builds voicemail-only instructions (no locale selection).
 * Used after locale is already resolved.
 */
export function buildVoicemailIvr(
  greeting: GreetingRecord,
  recordingCallbackUrl: string,
): readonly VoiceInstruction[] {
  const greetingInstruction: VoiceInstruction =
    greeting.isAudio && greeting.audioBlobKey !== null
      ? { type: "play", attributes: { text: greeting.audioBlobKey } }
      : { type: "say", attributes: { text: greeting.text } };

  return [
    greetingInstruction,
    {
      type: "record",
      attributes: {
        maxLength: "120",
        action: recordingCallbackUrl,
        method: "POST",
        playBeep: "true",
        transcribe: "false",
      },
    },
  ];
}
