import { describe, it, expect, vi, beforeEach } from "vitest";

import { handleInboundCall } from "./inbound-call.js";
import type { InboundCallDeps } from "./inbound-call.js";
import type { IncomingCallData, VoiceInstruction } from "./provider.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import type { PhoneRepository } from "./models/phone-repo.js";
import type { ClientRepository } from "./models/client-repo.js";
import type { GreetingRepository } from "./models/greeting-repo.js";

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

function createMockSealedBox(): SealedBoxEncryptor {
  return {
    seal: vi.fn((s: string) => Buffer.from(`sealed:${s}`)),
    sealBuffer: vi.fn((b: Buffer) => Buffer.from(`sealed:${b.toString()}`)),
  };
}

function createMockIndexer(): BlindIndexer {
  return {
    hash: vi.fn((_input: string, _orgId: string) => "hashed-phone"),
  };
}

function createMockPhoneRepo(): PhoneRepository {
  return {
    findByHash: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    updateLocale: vi.fn(),
    deactivate: vi.fn(),
  };
}

function createMockClientRepo(): ClientRepository {
  return {
    findOrCreateByPhoneHash: vi.fn().mockResolvedValue({
      client: { id: "client-1", alias: "calm-pebble-7", phoneId: "phone-1" },
      phone: {
        id: "phone-1",
        phoneHash: "hashed-phone",
        encryptedNumber: Buffer.from("enc"),
        locale: "en-US",
        locationCity: null,
        locationRegion: null,
        isActive: true,
      },
      isNew: true,
    }),
    findById: vi.fn(),
  };
}

function createMockGreetingRepo(): GreetingRepository {
  return {
    findByNumberAndLocaleAndType: vi.fn().mockResolvedValue(null),
    listByNumber: vi.fn().mockResolvedValue([]),
    listAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeCallData(overrides?: Partial<IncomingCallData>): IncomingCallData {
  return {
    callId: "CA123",
    from: "+15551234567",
    to: "+15559876543",
    direction: "inbound" as const,
    ...overrides,
  };
}

function makeDeps(overrides?: Partial<InboundCallDeps>): InboundCallDeps {
  return {
    sealedBox: createMockSealedBox(),
    indexer: createMockIndexer(),
    phoneRepo: createMockPhoneRepo(),
    clientRepo: createMockClientRepo(),
    greetingRepo: createMockGreetingRepo(),
    orgId: "org-1",
    orgSchema: "org_test",
    webhookBaseUrl: "https://example.com",
    defaultLocale: "en-US",
    ...overrides,
  };
}

/** Recursively find all instructions of a given type in an instruction tree. */
function findInstructions(
  instructions: readonly VoiceInstruction[],
  type: string,
): VoiceInstruction[] {
  const found: VoiceInstruction[] = [];
  for (const instr of instructions) {
    if (instr.type === type) found.push(instr);
    if (instr.children) {
      found.push(...findInstructions(instr.children, type));
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("handleInboundCall", () => {
  let deps: InboundCallDeps;
  let callData: IncomingCallData;

  beforeEach(() => {
    deps = makeDeps();
    callData = makeCallData();
  });

  // --- Path 3: New caller, no Digits ---

  it("returns language selection IVR for new caller with no Digits", async () => {
    const body: Record<string, string> = {};

    const result = await handleInboundCall(callData, body, deps);

    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe("gather");
    expect(result[0]!.attributes).toMatchObject({
      numDigits: "1",
      timeout: "2",
    });

    const sayChildren = findInstructions(result, "say");
    expect(sayChildren).toHaveLength(1);
    expect(sayChildren[0]!.attributes?.text).toContain("press 1");
  });

  it("does not create client when no Digits for new caller", async () => {
    const body: Record<string, string> = {};

    await handleInboundCall(callData, body, deps);

    expect(deps.clientRepo.findOrCreateByPhoneHash).not.toHaveBeenCalled();
  });

  // --- Path 2: Returning caller, no Digits ---

  it("returns returning caller IVR when phone hash found and greeting exists", async () => {
    const existingPhone = {
      id: "phone-existing",
      phoneHash: "hashed-phone",
      encryptedNumber: Buffer.from("enc"),
      locale: "es-MX",
      locationCity: null,
      locationRegion: null,
      isActive: true,
    };
    vi.mocked(deps.phoneRepo.findByHash).mockResolvedValueOnce(existingPhone);

    const existingGreeting = {
      id: "greeting-1",
      phoneNumber: "+15559876543",
      greetingType: "existing_client",
      locale: "es-MX",
      text: "Bienvenido de nuevo.",
      isAudio: false,
      audioBlobKey: null,
      audioContentType: null,
    };
    // First call: existing_client greeting
    vi.mocked(deps.greetingRepo.findByNumberAndLocaleAndType)
      .mockResolvedValueOnce(existingGreeting)
      // Second call: language_prompt greeting (null for no reselection)
      .mockResolvedValueOnce(null);

    const body: Record<string, string> = {};
    const result = await handleInboundCall(callData, body, deps);

    // Should contain a say with greeting text and a record instruction
    const sayInstructions = findInstructions(result, "say");
    expect(
      sayInstructions.some(
        (s) => s.attributes?.text === "Bienvenido de nuevo.",
      ),
    ).toBe(true);

    const recordInstructions = findInstructions(result, "record");
    expect(recordInstructions).toHaveLength(1);
  });

  it("returns returning caller IVR with reselection gather when language_prompt exists", async () => {
    const existingPhone = {
      id: "phone-existing",
      phoneHash: "hashed-phone",
      encryptedNumber: Buffer.from("enc"),
      locale: "en-US",
      locationCity: null,
      locationRegion: null,
      isActive: true,
    };
    vi.mocked(deps.phoneRepo.findByHash).mockResolvedValueOnce(existingPhone);

    const existingGreeting = {
      id: "greeting-1",
      phoneNumber: "+15559876543",
      greetingType: "existing_client",
      locale: "en-US",
      text: "Welcome back.",
      isAudio: false,
      audioBlobKey: null,
      audioContentType: null,
    };
    const reselectionGreeting = {
      id: "greeting-2",
      phoneNumber: "+15559876543",
      greetingType: "language_prompt",
      locale: "en-US",
      text: "Press 1 for English.",
      isAudio: false,
      audioBlobKey: null,
      audioContentType: null,
    };
    vi.mocked(deps.greetingRepo.findByNumberAndLocaleAndType)
      .mockResolvedValueOnce(existingGreeting)
      .mockResolvedValueOnce(reselectionGreeting);

    const body: Record<string, string> = {};
    const result = await handleInboundCall(callData, body, deps);

    // First instruction should be a gather (reselection)
    const gatherInstructions = findInstructions(result, "gather");
    expect(gatherInstructions.length).toBeGreaterThanOrEqual(1);
    const reselectionGather = gatherInstructions[0]!;
    expect(reselectionGather.attributes?.numDigits).toBe("1");
    expect(reselectionGather.attributes?.timeout).toBe("2");

    // Gather child should have the reselection text
    const gatherSay = findInstructions(reselectionGather.children ?? [], "say");
    expect(gatherSay[0]!.attributes?.text).toBe("Press 1 for English.");
  });

  it("falls through to language selection IVR when returning caller has no greeting", async () => {
    const existingPhone = {
      id: "phone-existing",
      phoneHash: "hashed-phone",
      encryptedNumber: Buffer.from("enc"),
      locale: "en-US",
      locationCity: null,
      locationRegion: null,
      isActive: true,
    };
    vi.mocked(deps.phoneRepo.findByHash).mockResolvedValueOnce(existingPhone);

    // Both greeting lookups return null
    vi.mocked(deps.greetingRepo.findByNumberAndLocaleAndType)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const body: Record<string, string> = {};
    const result = await handleInboundCall(callData, body, deps);

    // Should get the language selection IVR (gather with say child)
    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe("gather");
    const sayChildren = findInstructions(result, "say");
    expect(sayChildren[0]!.attributes?.text).toContain("press 1");
  });

  // --- Path 1: DTMF digit "1" ---

  it("resolves DTMF digit 1 to en-US and returns voicemail IVR", async () => {
    const body: Record<string, string> = { Digits: "1" };

    const result = await handleInboundCall(callData, body, deps);

    // Should have called findOrCreateByPhoneHash
    expect(deps.clientRepo.findOrCreateByPhoneHash).toHaveBeenCalledOnce();
    expect(deps.clientRepo.findOrCreateByPhoneHash).toHaveBeenCalledWith(
      "hashed-phone",
      expect.any(Buffer),
    );

    // Result should be voicemail IVR (say/play + record)
    const recordInstructions = findInstructions(result, "record");
    expect(recordInstructions).toHaveLength(1);
  });

  it("updates locale when DTMF-selected locale differs from phone record", async () => {
    // findOrCreateByPhoneHash returns phone with locale "en-US"
    vi.mocked(deps.clientRepo.findOrCreateByPhoneHash).mockResolvedValueOnce({
      client: { id: "client-1", alias: "calm-pebble-7", phoneId: "phone-1" },
      phone: {
        id: "phone-1",
        phoneHash: "hashed-phone",
        encryptedNumber: Buffer.from("enc"),
        locale: "en-US",
        locationCity: null,
        locationRegion: null,
        isActive: true,
      },
      isNew: false,
    });

    // Digit "2" = es-MX (different from en-US)
    const body: Record<string, string> = { Digits: "2" };
    await handleInboundCall(callData, body, deps);

    expect(deps.phoneRepo.updateLocale).toHaveBeenCalledOnce();
    expect(deps.phoneRepo.updateLocale).toHaveBeenCalledWith(
      "phone-1",
      "es-MX",
    );
  });

  it("does not update locale when DTMF-selected locale matches phone record", async () => {
    vi.mocked(deps.clientRepo.findOrCreateByPhoneHash).mockResolvedValueOnce({
      client: { id: "client-1", alias: "calm-pebble-7", phoneId: "phone-1" },
      phone: {
        id: "phone-1",
        phoneHash: "hashed-phone",
        encryptedNumber: Buffer.from("enc"),
        locale: "en-US",
        locationCity: null,
        locationRegion: null,
        isActive: true,
      },
      isNew: false,
    });

    const body: Record<string, string> = { Digits: "1" }; // "1" = en-US, same as phone
    await handleInboundCall(callData, body, deps);

    expect(deps.phoneRepo.updateLocale).not.toHaveBeenCalled();
  });

  // --- DTMF unknown digit ---

  it("falls back to defaultLocale for unknown DTMF digit 9", async () => {
    const body: Record<string, string> = { Digits: "9" };
    await handleInboundCall(callData, body, deps);

    // Should still create client (resolveLocaleFromDtmf("9") is null, fallback to defaultLocale)
    expect(deps.clientRepo.findOrCreateByPhoneHash).toHaveBeenCalledOnce();
  });

  it("returns voicemail IVR even for unknown DTMF digit", async () => {
    const body: Record<string, string> = { Digits: "9" };
    const result = await handleInboundCall(callData, body, deps);

    const recordInstructions = findInstructions(result, "record");
    expect(recordInstructions).toHaveLength(1);
  });

  // --- Fallback greeting ---

  it("uses fallback greeting text when no greeting is configured", async () => {
    // greetingRepo.findByNumberAndLocaleAndType already returns null by default
    const body: Record<string, string> = { Digits: "1" };
    const result = await handleInboundCall(callData, body, deps);

    const sayInstructions = findInstructions(result, "say");
    expect(sayInstructions).toHaveLength(1);
    expect(sayInstructions[0]!.attributes?.text).toBe(
      "Please leave a message after the beep.",
    );
  });

  it("uses configured greeting text when greeting exists", async () => {
    vi.mocked(
      deps.greetingRepo.findByNumberAndLocaleAndType,
    ).mockResolvedValueOnce({
      id: "greeting-1",
      phoneNumber: "+15559876543",
      greetingType: "new_client",
      locale: "en-US",
      text: "You have reached our helpline.",
      isAudio: false,
      audioBlobKey: null,
      audioContentType: null,
    });

    const body: Record<string, string> = { Digits: "1" };
    const result = await handleInboundCall(callData, body, deps);

    const sayInstructions = findInstructions(result, "say");
    expect(sayInstructions).toHaveLength(1);
    expect(sayInstructions[0]!.attributes?.text).toBe(
      "You have reached our helpline.",
    );
  });

  // --- Buffer zeroing ---
  // Security contract: plaintext buffers must be zeroed after encryption (relay endpoint policy)

  it("zeros phone buffer after encryption in DTMF path", async () => {
    let capturedBuffer: Buffer | null = null;
    vi.mocked(deps.sealedBox.sealBuffer).mockImplementation((b: Buffer) => {
      // Capture the live reference so we can inspect it after the handler's
      // finally block has run. At this point the buffer still holds plaintext.
      capturedBuffer = b;
      expect(b.toString("utf-8")).toBe("+15551234567");
      return Buffer.from("sealed");
    });

    const body: Record<string, string> = { Digits: "1" };
    await handleInboundCall(callData, body, deps);

    // After the handler returns, the finally block should have zeroed the buffer.
    expect(capturedBuffer).not.toBeNull();
    expect(capturedBuffer!.every((byte) => byte === 0)).toBe(true);
  });

  // --- Record attributes ---
  // Privacy wire format: transcribe=false prevents Twilio server-side transcription of voicemail audio

  it("all Record instructions have transcribe false", async () => {
    // Test DTMF path (voicemail IVR)
    const body1: Record<string, string> = { Digits: "1" };
    const result1 = await handleInboundCall(callData, body1, deps);
    const records1 = findInstructions(result1, "record");
    for (const rec of records1) {
      expect(rec.attributes?.transcribe).toBe("false");
    }

    // Test returning caller path (returning caller IVR)
    const deps2 = makeDeps();
    const existingPhone = {
      id: "phone-existing",
      phoneHash: "hashed-phone",
      encryptedNumber: Buffer.from("enc"),
      locale: "en-US",
      locationCity: null,
      locationRegion: null,
      isActive: true,
    };
    vi.mocked(deps2.phoneRepo.findByHash).mockResolvedValueOnce(existingPhone);
    vi.mocked(deps2.greetingRepo.findByNumberAndLocaleAndType)
      .mockResolvedValueOnce({
        id: "g-1",
        phoneNumber: "+15559876543",
        greetingType: "existing_client",
        locale: "en-US",
        text: "Welcome back.",
        isAudio: false,
        audioBlobKey: null,
        audioContentType: null,
      })
      .mockResolvedValueOnce(null);

    const body2: Record<string, string> = {};
    const result2 = await handleInboundCall(callData, body2, deps2);
    const records2 = findInstructions(result2, "record");
    for (const rec of records2) {
      expect(rec.attributes?.transcribe).toBe("false");
    }
  });

  // --- Blind index ---
  // Security contract: blind index must include orgId to prevent cross-org phone correlation

  it("computes blind index with orgId", async () => {
    const body: Record<string, string> = {};
    await handleInboundCall(callData, body, deps);

    expect(deps.indexer.hash).toHaveBeenCalledOnce();
    expect(deps.indexer.hash).toHaveBeenCalledWith("+15551234567", "org-1");
  });

  // --- Webhook URL construction ---
  // Wire format contract: webhook URLs must follow /webhooks/<provider>/<org-uuid>/<endpoint> pattern

  it("constructs voice webhook URL from webhookBaseUrl and orgId", async () => {
    const existingPhone = {
      id: "phone-existing",
      phoneHash: "hashed-phone",
      encryptedNumber: Buffer.from("enc"),
      locale: "en-US",
      locationCity: null,
      locationRegion: null,
      isActive: true,
    };
    vi.mocked(deps.phoneRepo.findByHash).mockResolvedValueOnce(existingPhone);
    vi.mocked(deps.greetingRepo.findByNumberAndLocaleAndType)
      .mockResolvedValueOnce({
        id: "g-1",
        phoneNumber: "+15559876543",
        greetingType: "existing_client",
        locale: "en-US",
        text: "Hello.",
        isAudio: false,
        audioBlobKey: null,
        audioContentType: null,
      })
      .mockResolvedValueOnce(null);

    const body: Record<string, string> = {};
    const result = await handleInboundCall(callData, body, deps);

    // The record instruction's action URL should use the constructed voice URL
    const recordInstructions = findInstructions(result, "record");
    expect(recordInstructions).toHaveLength(1);
    expect(recordInstructions[0]!.attributes?.action).toBe(
      "https://example.com/webhooks/twilio/org-1/voice",
    );
  });

  // --- DTMF digit "2" (es-MX) ---

  it("resolves DTMF digit 2 to es-MX and produces voicemail IVR", async () => {
    vi.mocked(deps.clientRepo.findOrCreateByPhoneHash).mockResolvedValueOnce({
      client: { id: "client-1", alias: "calm-pebble-7", phoneId: "phone-1" },
      phone: {
        id: "phone-1",
        phoneHash: "hashed-phone",
        encryptedNumber: Buffer.from("enc"),
        locale: "en-US", // different from es-MX, triggers updateLocale
        locationCity: null,
        locationRegion: null,
        isActive: true,
      },
      isNew: true,
    });

    const body: Record<string, string> = { Digits: "2" };
    await handleInboundCall(callData, body, deps);

    // Locale update proves the handler resolved digit 2 to es-MX
    expect(deps.phoneRepo.updateLocale).toHaveBeenCalledWith(
      "phone-1",
      "es-MX",
    );
    // Still produces a voicemail IVR
    const result = await handleInboundCall(
      callData,
      { Digits: "2" },
      makeDeps(),
    );
    const records = findInstructions(result, "record");
    expect(records).toHaveLength(1);
  });

  // --- DTMF digit "3" (fr-FR) ---

  it("resolves DTMF digit 3 to fr-FR and produces voicemail IVR", async () => {
    vi.mocked(deps.clientRepo.findOrCreateByPhoneHash).mockResolvedValueOnce({
      client: { id: "client-1", alias: "calm-pebble-7", phoneId: "phone-1" },
      phone: {
        id: "phone-1",
        phoneHash: "hashed-phone",
        encryptedNumber: Buffer.from("enc"),
        locale: "en-US", // different from fr-FR, triggers updateLocale
        locationCity: null,
        locationRegion: null,
        isActive: true,
      },
      isNew: true,
    });

    const body: Record<string, string> = { Digits: "3" };
    await handleInboundCall(callData, body, deps);

    // Locale update proves the handler resolved digit 3 to fr-FR
    expect(deps.phoneRepo.updateLocale).toHaveBeenCalledWith(
      "phone-1",
      "fr-FR",
    );
  });
});
