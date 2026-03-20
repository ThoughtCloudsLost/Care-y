import { describe, it, expect, vi, beforeEach } from "vitest";

import { handleRecordingComplete } from "./recording-handler.js";
import type { RecordingHandlerDeps } from "./recording-handler.js";
import type { TelephonyProvider } from "./provider.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { BlobStore } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import { TelephonyError } from "../errors.js";

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

function createMockProvider(): TelephonyProvider {
  return {
    providerId: "twilio",
    sendSms: vi.fn(),
    initiateOutboundCall: vi.fn(),
    initiateWebRtcCall: vi.fn(),
    validateWebhook: vi.fn(),
    parseIncomingCall: vi.fn(),
    parseIncomingSms: vi.fn(),
    generateVoiceResponse: vi.fn(),
    getRecording: vi.fn().mockResolvedValue(Buffer.from("raw-audio")),
    deleteRecording: vi.fn().mockResolvedValue(undefined),
    deleteCallLog: vi.fn().mockResolvedValue(undefined),
    deleteMessageLog: vi.fn(),
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

function createMockBlobStore(): BlobStore {
  return {
    put: vi.fn().mockResolvedValue("org_test/recording/uuid-1"),
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

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeBody(overrides?: Record<string, string>): Record<string, string> {
  return {
    RecordingSid: "RE123",
    CallSid: "CA456",
    RecordingDuration: "42",
    ...overrides,
  };
}

function makeDeps(
  overrides?: Partial<RecordingHandlerDeps>,
): RecordingHandlerDeps {
  return {
    provider: createMockProvider(),
    sealedBox: createMockSealedBox(),
    blobStore: createMockBlobStore(),
    jobQueue: createMockJobQueue(),
    orgSchema: "org_test",
    orgId: "org-1",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("handleRecordingComplete", () => {
  let deps: RecordingHandlerDeps;
  let body: Record<string, string>;

  beforeEach(() => {
    deps = makeDeps();
    body = makeBody();
  });

  // --- Fetch + encrypt + store ---

  it("fetches recording from provider using RecordingSid", async () => {
    await handleRecordingComplete(body, deps);

    expect(deps.provider.getRecording).toHaveBeenCalledOnce();
    expect(deps.provider.getRecording).toHaveBeenCalledWith("RE123");
  });

  it("encrypts raw audio via sealBuffer", async () => {
    // Capture content at call time before the handler zeros the buffer
    let capturedContent = "";
    vi.mocked(deps.sealedBox.sealBuffer).mockImplementation((b: Buffer) => {
      capturedContent = b.toString("utf-8");
      return Buffer.from("sealed");
    });

    await handleRecordingComplete(body, deps);

    expect(deps.sealedBox.sealBuffer).toHaveBeenCalledOnce();
    expect(capturedContent).toBe("raw-audio");
  });

  // Security contract: plaintext buffers must be zeroed after encryption (relay endpoint policy)
  it("zeros raw audio buffer after encryption", async () => {
    let capturedAudioBuf: Buffer | null = null;
    vi.mocked(deps.sealedBox.sealBuffer).mockImplementation((b: Buffer) => {
      capturedAudioBuf = b;
      return Buffer.from("sealed");
    });

    await handleRecordingComplete(body, deps);

    expect(capturedAudioBuf).not.toBeNull();
    expect(capturedAudioBuf!.every((byte) => byte === 0)).toBe(true);
  });

  it("stores encrypted audio in BlobStore with category 'recording'", async () => {
    await handleRecordingComplete(body, deps);

    expect(deps.blobStore.put).toHaveBeenCalledOnce();
    expect(deps.blobStore.put).toHaveBeenCalledWith(
      "org_test",
      "recording",
      expect.any(Buffer),
    );
  });

  // --- Provider cleanup ---

  it("deletes recording from provider after storage", async () => {
    await handleRecordingComplete(body, deps);

    expect(deps.provider.deleteRecording).toHaveBeenCalledOnce();
    expect(deps.provider.deleteRecording).toHaveBeenCalledWith("RE123");
  });

  it("deletes call log from provider after storage", async () => {
    await handleRecordingComplete(body, deps);

    expect(deps.provider.deleteCallLog).toHaveBeenCalledOnce();
    expect(deps.provider.deleteCallLog).toHaveBeenCalledWith("CA456");
  });

  // --- Deletion failure -> retry enqueue ---

  it("enqueues retry job with resourceType 'recording' when recording deletion fails", async () => {
    vi.mocked(deps.provider.deleteRecording).mockRejectedValueOnce(
      new Error("Twilio 500"),
    );

    await handleRecordingComplete(body, deps);

    expect(deps.jobQueue.enqueue).toHaveBeenCalledWith(
      "log-deletion",
      expect.objectContaining({
        orgId: "org-1",
        resourceType: "recording",
        resourceId: "RE123",
      }),
    );
  });

  it("enqueues retry job with resourceType 'call' when call log deletion fails", async () => {
    vi.mocked(deps.provider.deleteCallLog).mockRejectedValueOnce(
      new Error("Twilio 500"),
    );

    await handleRecordingComplete(body, deps);

    expect(deps.jobQueue.enqueue).toHaveBeenCalledWith(
      "log-deletion",
      expect.objectContaining({
        orgId: "org-1",
        resourceType: "call",
        resourceId: "CA456",
      }),
    );
  });

  it("enqueues both retry jobs when both deletions fail", async () => {
    vi.mocked(deps.provider.deleteRecording).mockRejectedValueOnce(
      new Error("recording fail"),
    );
    vi.mocked(deps.provider.deleteCallLog).mockRejectedValueOnce(
      new Error("call fail"),
    );

    await handleRecordingComplete(body, deps);

    expect(deps.jobQueue.enqueue).toHaveBeenCalledTimes(2);
  });

  // --- Validation ---

  it("throws TelephonyError when RecordingSid is missing", async () => {
    const noRecordingSid = { CallSid: "CA456", RecordingDuration: "42" };

    await expect(handleRecordingComplete(noRecordingSid, deps)).rejects.toThrow(
      TelephonyError,
    );
  });

  it("throws TelephonyError when RecordingSid is empty string", async () => {
    const emptyRecordingSid = makeBody({ RecordingSid: "" });

    await expect(
      handleRecordingComplete(emptyRecordingSid, deps),
    ).rejects.toThrow(TelephonyError);
  });

  it("throws TelephonyError when CallSid is missing", async () => {
    const noCallSid = { RecordingSid: "RE123", RecordingDuration: "42" };

    await expect(handleRecordingComplete(noCallSid, deps)).rejects.toThrow(
      TelephonyError,
    );
  });

  it("throws TelephonyError when CallSid is empty string", async () => {
    const emptyCallSid = makeBody({ CallSid: "" });

    await expect(handleRecordingComplete(emptyCallSid, deps)).rejects.toThrow(
      TelephonyError,
    );
  });

  // --- Return value ---

  it("returns blobKey and durationSeconds with correct values", async () => {
    const result = await handleRecordingComplete(body, deps);

    expect(result).toEqual({
      blobKey: "org_test/recording/uuid-1",
      durationSeconds: 42,
    });
  });

  it("returns durationSeconds 0 when RecordingDuration is absent", async () => {
    const noDuration = { RecordingSid: "RE123", CallSid: "CA456" };

    const result = await handleRecordingComplete(noDuration, deps);

    expect(result.durationSeconds).toBe(0);
  });

  it("returns NaN durationSeconds when RecordingDuration is non-numeric", async () => {
    const badDuration = makeBody({ RecordingDuration: "abc" });

    const result = await handleRecordingComplete(badDuration, deps);

    expect(result.durationSeconds).toBeNaN();
  });
});
