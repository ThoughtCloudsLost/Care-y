import { describe, it, expect, vi, beforeEach } from "vitest";

import { handleRecordingComplete } from "./recording-handler.js";
import type { RecordingHandlerDeps } from "./recording-handler.js";
import type { TelephonyProvider } from "./provider.js";
import type { BlobStore } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import { TelephonyError } from "../errors.js";
import { createCallTracker, type CallTracker } from "./call-tracker.js";

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
  callTracker?: CallTracker,
  overrides?: Partial<RecordingHandlerDeps>,
): RecordingHandlerDeps {
  return {
    provider: createMockProvider(),
    blobStore: createMockBlobStore(),
    jobQueue: createMockJobQueue(),
    callTracker: callTracker ?? createCallTracker(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test mock
    getTenantDb: vi.fn().mockReturnValue({}) as any,
    intakeQueueId: null,
    orgSchema: "org_test",
    orgId: "org-1",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests (validation and cleanup; ECIES roundtrip tests in server-ticket-create.test.ts)
// ---------------------------------------------------------------------------

describe("handleRecordingComplete", () => {
  let deps: RecordingHandlerDeps;
  let body: Record<string, string>;

  beforeEach(() => {
    deps = makeDeps();
    body = makeBody();
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

  // --- No tracked call ---

  it("returns null ticketId/followUpId when CallSid is not tracked", async () => {
    const result = await handleRecordingComplete(body, deps);

    expect(result.ticketId).toBeNull();
    expect(result.followUpId).toBeNull();
  });

  it("still cleans up provider logs when CallSid is not tracked", async () => {
    await handleRecordingComplete(body, deps);

    expect(deps.provider.deleteRecording).toHaveBeenCalledOnce();
    expect(deps.provider.deleteCallLog).toHaveBeenCalledOnce();
  });

  // --- Deletion failure -> retry enqueue ---

  it("enqueues retry job when recording deletion fails", async () => {
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

  it("enqueues retry job when call log deletion fails", async () => {
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
});
