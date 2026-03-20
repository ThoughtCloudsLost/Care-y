import { describe, it, expect, vi, beforeEach } from "vitest";

import { handleInboundSms } from "./inbound-sms.js";
import type { InboundSmsDeps } from "./inbound-sms.js";
import type { TelephonyProvider, IncomingSmsData } from "./provider.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import type { BlobStore } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import type { ClientRepository } from "./models/client-repo.js";
import type { SmsResponseRepository } from "./models/sms-response-repo.js";
import { TelephonyError } from "../errors.js";

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

function createMockProvider(): TelephonyProvider {
  return {
    providerId: "twilio",
    sendSms: vi.fn().mockResolvedValue({ messageId: "SM123" }),
    deleteMessageLog: vi.fn().mockResolvedValue(undefined),
    initiateOutboundCall: vi.fn(),
    initiateWebRtcCall: vi.fn(),
    validateWebhook: vi.fn(),
    parseIncomingCall: vi.fn(),
    parseIncomingSms: vi.fn(),
    generateVoiceResponse: vi.fn(),
    getRecording: vi.fn(),
    deleteRecording: vi.fn(),
    deleteCallLog: vi.fn(),
    maskConfig: vi.fn().mockReturnValue({
      provider: "twilio",
      mode: "byot",
      maskedAccountId: "AC****1234",
      maskedAuthToken: "********",
      phoneNumbers: [],
    }),
  };
}

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

function createMockBlobStore(): BlobStore {
  return {
    put: vi.fn().mockResolvedValue("org_test/attachment/uuid-1"),
    get: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
  };
}

function createMockJobQueue(): JobQueue {
  return {
    enqueue: vi.fn().mockResolvedValue("job-1"),
    process: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
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

function createMockSmsResponseRepo(): SmsResponseRepository {
  return {
    findByLocaleAndType: vi.fn(),
    findWithFallback: vi.fn().mockResolvedValue({
      id: "resp-1",
      responseType: "new_client",
      locale: "en-US",
      text: "Thank you for reaching out.",
    }),
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeSmsData(overrides?: Partial<IncomingSmsData>): IncomingSmsData {
  return {
    messageId: "SM999",
    from: "+15551234567",
    to: "+15559876543",
    body: "I need help",
    numMedia: 0,
    mediaUrls: [],
    mediaContentTypes: [],
    ...overrides,
  };
}

function makeDeps(overrides?: Partial<InboundSmsDeps>): InboundSmsDeps {
  return {
    provider: createMockProvider(),
    sealedBox: createMockSealedBox(),
    indexer: createMockIndexer(),
    blobStore: createMockBlobStore(),
    jobQueue: createMockJobQueue(),
    clientRepo: createMockClientRepo(),
    smsResponseRepo: createMockSmsResponseRepo(),
    orgId: "org-1",
    orgSchema: "org_test",
    defaultLocale: "en-US",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("handleInboundSms", () => {
  let deps: InboundSmsDeps;
  let smsData: IncomingSmsData;

  beforeEach(() => {
    deps = makeDeps();
    smsData = makeSmsData();
  });

  // --- Encryption ---

  it("passes body as Buffer to sealBuffer (not the string directly)", async () => {
    // Capture content at call time before the handler zeros the buffer
    const capturedInputs: string[] = [];
    vi.mocked(deps.sealedBox.sealBuffer).mockImplementation((b: Buffer) => {
      capturedInputs.push(b.toString("utf-8"));
      return Buffer.from("sealed");
    });

    await handleInboundSms(smsData, deps);

    expect(capturedInputs[0]).toBe("I need help");
  });

  it("encrypts phone number via sealBuffer", async () => {
    // Capture buffer content at call time (before zeroing)
    const capturedInputs: string[] = [];
    vi.mocked(deps.sealedBox.sealBuffer).mockImplementation((b: Buffer) => {
      capturedInputs.push(b.toString("utf-8"));
      return Buffer.from("sealed");
    });

    await handleInboundSms(smsData, deps);

    // sealBuffer called twice: body then phone
    expect(capturedInputs).toHaveLength(2);
    expect(capturedInputs[1]).toBe("+15551234567");
  });

  // --- Buffer zeroing ---

  it("zeros body buffer after encryption", async () => {
    let capturedBodyBuf: Buffer | null = null;
    let callCount = 0;
    vi.mocked(deps.sealedBox.sealBuffer).mockImplementation((b: Buffer) => {
      callCount++;
      if (callCount === 1) capturedBodyBuf = b; // first call = body
      return Buffer.from("sealed");
    });

    await handleInboundSms(smsData, deps);

    expect(capturedBodyBuf).not.toBeNull();
    expect(capturedBodyBuf!.every((byte) => byte === 0)).toBe(true);
  });

  it("zeros phone buffer after encryption", async () => {
    let capturedPhoneBuf: Buffer | null = null;
    let callCount = 0;
    vi.mocked(deps.sealedBox.sealBuffer).mockImplementation((b: Buffer) => {
      callCount++;
      if (callCount === 2) capturedPhoneBuf = b; // second call = phone
      return Buffer.from("sealed");
    });

    await handleInboundSms(smsData, deps);

    expect(capturedPhoneBuf).not.toBeNull();
    expect(capturedPhoneBuf!.every((byte) => byte === 0)).toBe(true);
  });

  // --- BlobStore ---

  it("stores encrypted body in BlobStore with category 'attachment'", async () => {
    await handleInboundSms(smsData, deps);

    expect(deps.blobStore.put).toHaveBeenCalledOnce();
    expect(deps.blobStore.put).toHaveBeenCalledWith(
      "org_test",
      "attachment",
      expect.any(Buffer),
    );
  });

  // --- Blind index ---

  it("computes blind index hash with orgId", async () => {
    await handleInboundSms(smsData, deps);

    expect(deps.indexer.hash).toHaveBeenCalledOnce();
    expect(deps.indexer.hash).toHaveBeenCalledWith("+15551234567", "org-1");
  });

  // --- Client lookup ---

  it("finds or creates client via clientRepo.findOrCreateByPhoneHash with correct hash and encrypted phone", async () => {
    await handleInboundSms(smsData, deps);

    expect(deps.clientRepo.findOrCreateByPhoneHash).toHaveBeenCalledOnce();
    expect(deps.clientRepo.findOrCreateByPhoneHash).toHaveBeenCalledWith(
      "hashed-phone",
      expect.any(Buffer),
    );
  });

  // --- Auto-reply ---

  it("sends auto-reply via provider.sendSms with correct to, from, and text", async () => {
    await handleInboundSms(smsData, deps);

    expect(deps.provider.sendSms).toHaveBeenCalledOnce();
    expect(deps.provider.sendSms).toHaveBeenCalledWith(
      "+15551234567", // to (the original sender)
      "Thank you for reaching out.", // auto-reply text
      "+15559876543", // callerId (the hotline number)
    );
  });

  // --- Log deletion ---

  it("calls deleteMessageLog with the message SID", async () => {
    await handleInboundSms(smsData, deps);

    expect(deps.provider.deleteMessageLog).toHaveBeenCalledOnce();
    expect(deps.provider.deleteMessageLog).toHaveBeenCalledWith("SM999");
  });

  it("enqueues retry job via jobQueue when deleteMessageLog fails", async () => {
    vi.mocked(deps.provider.deleteMessageLog).mockRejectedValueOnce(
      new Error("Twilio 500"),
    );

    await handleInboundSms(smsData, deps);

    expect(deps.jobQueue.enqueue).toHaveBeenCalledOnce();
    // enqueueLogDeletion calls jobQueue.enqueue with queue name "log-deletion"
    expect(deps.jobQueue.enqueue).toHaveBeenCalledWith(
      "log-deletion",
      expect.objectContaining({
        orgId: "org-1",
        resourceType: "message",
        resourceId: "SM999",
      }),
      expect.objectContaining({
        maxRetries: 3,
        backoff: "exponential",
      }),
    );
  });

  it("throws TelephonyError when both deleteMessageLog and enqueue fail", async () => {
    vi.mocked(deps.provider.deleteMessageLog).mockRejectedValueOnce(
      new Error("Twilio 500"),
    );
    vi.mocked(deps.jobQueue.enqueue).mockRejectedValueOnce(
      new Error("Queue down"),
    );

    await expect(handleInboundSms(smsData, deps)).rejects.toThrow(
      TelephonyError,
    );
  });

  // --- sendSms failure ---

  it("propagates sendSms error (auto-reply failure is fatal)", async () => {
    vi.mocked(deps.provider.sendSms).mockRejectedValueOnce(
      new Error("Twilio rate limit"),
    );

    await expect(handleInboundSms(smsData, deps)).rejects.toThrow(
      "Twilio rate limit",
    );

    // deleteMessageLog should NOT have been called (sendSms failed first)
    expect(deps.provider.deleteMessageLog).not.toHaveBeenCalled();
  });

  // --- Return value ---

  it("returns correct InboundSmsResult shape", async () => {
    const result = await handleInboundSms(smsData, deps);

    expect(result).toEqual({
      clientId: "client-1",
      phoneId: "phone-1",
      isNewClient: true,
      bodyBlobKey: "org_test/attachment/uuid-1",
    });
  });

  it("returns isNewClient false when client already exists", async () => {
    vi.mocked(deps.clientRepo.findOrCreateByPhoneHash).mockResolvedValueOnce({
      client: { id: "client-2", alias: "swift-rain-3", phoneId: "phone-2" },
      phone: {
        id: "phone-2",
        phoneHash: "hashed-phone",
        encryptedNumber: Buffer.from("enc"),
        locale: "en-US",
        locationCity: null,
        locationRegion: null,
        isActive: true,
      },
      isNew: false,
    });

    const result = await handleInboundSms(smsData, deps);

    expect(result.isNewClient).toBe(false);
    expect(result.clientId).toBe("client-2");
  });
});
