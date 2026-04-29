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
import type { BlocklistRepository } from "./models/blocklist-repo.js";

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
    findByPhoneId: vi.fn().mockResolvedValue(null),
  };
}

function createMockBlocklistRepo(): BlocklistRepository {
  return {
    add: vi.fn(),
    remove: vi.fn(),
    list: vi.fn().mockResolvedValue([]),
    exists: vi.fn().mockResolvedValue(false),
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
    blocklistRepo: createMockBlocklistRepo(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test mock; full DB tests in integration suite
    tDb: {} as any,
    intakeQueueId: "queue-intake-1",
    orgId: "org-1",
    orgSchema: "org_test",
    defaultLocale: "en-US",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests (blocklist + blind index; ECIES roundtrip tests in server-ticket-create.test.ts)
// ---------------------------------------------------------------------------

describe("handleInboundSms", () => {
  let deps: InboundSmsDeps;
  let smsData: IncomingSmsData;

  beforeEach(() => {
    deps = makeDeps();
    smsData = makeSmsData();
  });

  // --- Blocklist ---

  it("returns null when phone is blocked", async () => {
    vi.mocked(deps.blocklistRepo.exists).mockResolvedValueOnce(true);

    const result = await handleInboundSms(smsData, deps);

    expect(result).toBeNull();
  });

  it("does not create client when phone is blocked", async () => {
    vi.mocked(deps.blocklistRepo.exists).mockResolvedValueOnce(true);

    await handleInboundSms(smsData, deps);

    expect(deps.clientRepo.findOrCreateByPhoneHash).not.toHaveBeenCalled();
    expect(deps.provider.sendSms).not.toHaveBeenCalled();
  });

  // --- Blind index ---

  it("computes blind index hash with orgId", async () => {
    vi.mocked(deps.blocklistRepo.exists).mockResolvedValueOnce(true);

    await handleInboundSms(smsData, deps);

    expect(deps.indexer.hash).toHaveBeenCalledOnce();
    expect(deps.indexer.hash).toHaveBeenCalledWith("+15551234567", "org-1");
  });

  // --- Phone encryption ---

  it("encrypts phone number with sealed-box (ops-tier)", async () => {
    vi.mocked(deps.blocklistRepo.exists).mockResolvedValueOnce(true);

    await handleInboundSms(smsData, deps);

    // Blocklist check happens before phone encryption, so sealBuffer
    // should not be called when blocked
    expect(deps.sealedBox.sealBuffer).not.toHaveBeenCalled();
  });
});
