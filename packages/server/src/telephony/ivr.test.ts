import { describe, it, expect } from "vitest";

import {
  buildLanguageSelectionIvr,
  buildReturningCallerIvr,
  buildVoicemailIvr,
  resolveLocaleFromDtmf,
} from "./ivr.js";
import type { GreetingRecord } from "./models/greeting-repo.js";
import type { VoiceInstruction } from "./provider.js";
import { e164Schema, type PhoneGreetingId, type BlobKey } from "@care-y/shared";

function makeGreeting(overrides: Partial<GreetingRecord> = {}): GreetingRecord {
  return {
    id: "greeting-1" as PhoneGreetingId,
    phoneNumber: e164Schema.parse("+15551234567"),
    greetingType: "main",
    locale: "en-US",
    text: "Hello, please leave a message.",
    isAudio: false,
    audioBlobKey: null,
    audioContentType: null,
    ...overrides,
  };
}

describe("buildLanguageSelectionIvr", () => {
  it("uses default prompt text when greeting is null", () => {
    const instructions = buildLanguageSelectionIvr(null, "/callback");

    expect(instructions).toHaveLength(1);
    const gather = instructions[0]!;
    expect(gather.type).toBe("gather");

    const say = gather.children?.[0];
    expect(say).toBeDefined();
    expect(say!.type).toBe("say");
    const text = say!.attributes?.text as string;
    expect(text).toContain("English");
    expect(text).toContain("español");
  });

  it("uses custom greeting text when provided", () => {
    const custom = makeGreeting({
      greetingType: "language_prompt",
      text: "Press 1 for English. Appuyez sur 3 pour le français.",
    });
    const instructions = buildLanguageSelectionIvr(custom, "/callback");

    const say = instructions[0]!.children?.[0];
    expect(say!.attributes?.text).toBe(
      "Press 1 for English. Appuyez sur 3 pour le français.",
    );
  });

  it("produces a Gather with numDigits=1, timeout=2, method=POST", () => {
    const instructions = buildLanguageSelectionIvr(null, "/callback");
    const gather = instructions[0]!;

    expect(gather.type).toBe("gather");
    expect(gather.attributes?.numDigits).toBe("1");
    expect(gather.attributes?.timeout).toBe("2");
    expect(gather.attributes?.method).toBe("POST");
  });

  it("sets the action URL from the statusCallbackUrl argument", () => {
    const instructions = buildLanguageSelectionIvr(
      null,
      "/webhooks/twilio/org-1/dtmf",
    );
    expect(instructions[0]!.attributes?.action).toBe(
      "/webhooks/twilio/org-1/dtmf",
    );
  });
});

describe("buildReturningCallerIvr", () => {
  const textGreeting = makeGreeting({ text: "Welcome back." });
  const audioGreeting = makeGreeting({
    isAudio: true,
    audioBlobKey: "blob://greetings/abc123" as BlobKey,
  });
  const reselection = makeGreeting({
    greetingType: "reselection",
    text: "Press a number to change language.",
  });

  it("includes Gather when reselection greeting is provided", () => {
    const instructions = buildReturningCallerIvr(
      textGreeting,
      reselection,
      "/record",
      "/status",
    );

    const gathers = instructions.filter(
      (i: VoiceInstruction) => i.type === "gather",
    );
    expect(gathers).toHaveLength(1);
    expect(gathers[0]!.children?.[0]!.attributes?.text).toBe(
      "Press a number to change language.",
    );
  });

  it("omits Gather when reselection greeting is null", () => {
    const instructions = buildReturningCallerIvr(
      textGreeting,
      null,
      "/record",
      "/status",
    );

    const gathers = instructions.filter(
      (i: VoiceInstruction) => i.type === "gather",
    );
    expect(gathers).toHaveLength(0);
  });

  it("produces a 'say' instruction for a text greeting", () => {
    const instructions = buildReturningCallerIvr(
      textGreeting,
      null,
      "/record",
      "/status",
    );

    const says = instructions.filter((i: VoiceInstruction) => i.type === "say");
    expect(says).toHaveLength(1);
    expect(says[0]!.attributes?.text).toBe("Welcome back.");
  });

  it("produces a 'play' instruction for an audio greeting", () => {
    const instructions = buildReturningCallerIvr(
      audioGreeting,
      null,
      "/record",
      "/status",
    );

    const plays = instructions.filter(
      (i: VoiceInstruction) => i.type === "play",
    );
    expect(plays).toHaveLength(1);
    expect(plays[0]!.attributes?.text).toBe("blob://greetings/abc123");
  });

  it("always ends with a Record instruction", () => {
    const instructions = buildReturningCallerIvr(
      textGreeting,
      reselection,
      "/record",
      "/status",
    );

    const last = instructions[instructions.length - 1]!;
    expect(last.type).toBe("record");
  });

  // Privacy wire format: transcribe=false prevents Twilio server-side transcription of voicemail audio
  it("sets transcribe=false and playBeep=true on the Record instruction", () => {
    const instructions = buildReturningCallerIvr(
      textGreeting,
      null,
      "/record",
      "/status",
    );

    const record = instructions.find(
      (i: VoiceInstruction) => i.type === "record",
    );
    expect(record).toBeDefined();
    expect(record!.attributes?.transcribe).toBe("false");
    expect(record!.attributes?.playBeep).toBe("true");
  });
});

describe("resolveLocaleFromDtmf", () => {
  it("returns 'en-US' for digit '1'", () => {
    expect(resolveLocaleFromDtmf("1")).toBe("en-US");
  });

  it("returns 'es-MX' for digit '2'", () => {
    expect(resolveLocaleFromDtmf("2")).toBe("es-MX");
  });

  it("returns 'fr-FR' for digit '3'", () => {
    expect(resolveLocaleFromDtmf("3")).toBe("fr-FR");
  });

  it("returns null for unmapped digit '9'", () => {
    expect(resolveLocaleFromDtmf("9")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(resolveLocaleFromDtmf("")).toBeNull();
  });
});

describe("buildVoicemailIvr", () => {
  it("produces greeting + record for a text greeting", () => {
    const greeting = makeGreeting({ text: "Please leave a message." });
    const instructions = buildVoicemailIvr(greeting, "/record-callback");

    expect(instructions).toHaveLength(2);
    expect(instructions[0]!.type).toBe("say");
    expect(instructions[0]!.attributes?.text).toBe("Please leave a message.");
    expect(instructions[1]!.type).toBe("record");
  });

  it("produces play + record for an audio greeting", () => {
    const greeting = makeGreeting({
      isAudio: true,
      audioBlobKey: "blob://greetings/vm-001" as BlobKey,
    });
    const instructions = buildVoicemailIvr(greeting, "/record-callback");

    expect(instructions).toHaveLength(2);
    expect(instructions[0]!.type).toBe("play");
    expect(instructions[0]!.attributes?.text).toBe("blob://greetings/vm-001");
    expect(instructions[1]!.type).toBe("record");
  });

  // Privacy wire format: transcribe=false prevents Twilio server-side transcription of voicemail audio
  it("sets transcribe=false and playBeep=true on the Record", () => {
    const greeting = makeGreeting();
    const instructions = buildVoicemailIvr(greeting, "/record-callback");

    const record = instructions[1]!;
    expect(record.attributes?.transcribe).toBe("false");
    expect(record.attributes?.playBeep).toBe("true");
  });

  it("sets the recording callback URL on the Record action", () => {
    const greeting = makeGreeting();
    const instructions = buildVoicemailIvr(
      greeting,
      "/webhooks/twilio/org-1/recording",
    );

    const record = instructions[1]!;
    expect(record.attributes?.action).toBe("/webhooks/twilio/org-1/recording");
    expect(record.attributes?.method).toBe("POST");
  });

  it("falls back to 'say' when isAudio is true but audioBlobKey is null", () => {
    const greeting = makeGreeting({
      isAudio: true,
      audioBlobKey: null,
      text: "Fallback text greeting.",
    });
    const instructions = buildVoicemailIvr(greeting, "/record-callback");

    expect(instructions[0]!.type).toBe("say");
    expect(instructions[0]!.attributes?.text).toBe("Fallback text greeting.");
  });
});
