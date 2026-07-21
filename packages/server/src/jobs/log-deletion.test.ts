import { describe, it, expect, vi } from "vitest";
import type { JobQueue } from "./queue.js";
import type { TelephonyProvider } from "../telephony/provider.js";
import { ValidationError } from "../errors.js";
import { createMockProviderFactory } from "../test-utils.js";
import {
  registerLogDeletionHandler,
  enqueueLogDeletion,
} from "./log-deletion.js";

function createMockProvider(): TelephonyProvider {
  return {
    providerId: "twilio",
    sendSms: vi.fn().mockResolvedValue({ messageId: "SM-test" }),
    initiateOutboundCall: vi.fn().mockResolvedValue("CA-test"),
    initiateWebRtcCall: vi.fn().mockResolvedValue("CA-webrtc"),
    validateWebhook: vi.fn().mockReturnValue(true),
    parseIncomingCall: vi.fn().mockReturnValue({
      callId: "CA-in",
      from: "+1",
      to: "+2",
      direction: "inbound" as const,
    }),
    parseIncomingSms: vi.fn().mockReturnValue({
      messageId: "SM-in",
      from: "+1",
      to: "+2",
      body: "",
      numMedia: 0,
      mediaUrls: [],
      mediaContentTypes: [],
    }),
    generateVoiceResponse: vi.fn().mockReturnValue("<Response/>"),
    getRecording: vi.fn().mockResolvedValue(Buffer.alloc(0)),
    deleteRecording: vi.fn().mockResolvedValue(undefined),
    deleteCallLog: vi.fn().mockResolvedValue(undefined),
    deleteMessageLog: vi.fn().mockResolvedValue(undefined),
    maskConfig: vi.fn().mockReturnValue({
      provider: "twilio",
      mode: "byot",
      maskedAccountId: "AC***",
      maskedAuthToken: "***",
      phoneNumbers: [],
    }),
  };
}

function createMockJobQueue(): {
  jobQueue: JobQueue;
  handlers: Map<string, (payload: Record<string, unknown>) => Promise<void>>;
} {
  const handlers = new Map<
    string,
    (payload: Record<string, unknown>) => Promise<void>
  >();

  const jobQueue: JobQueue = {
    enqueue: vi.fn().mockResolvedValue("job-123"),
    process: vi.fn(
      (
        queue: string,
        handler: (p: Record<string, unknown>) => Promise<void>,
      ) => {
        handlers.set(queue, handler);
      },
    ),
    start: vi.fn(),
    stop: vi.fn().mockResolvedValue(undefined),
  };

  return { jobQueue, handlers };
}

describe("registerLogDeletionHandler", () => {
  it("calls deleteCallLog for resourceType call", async () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const mockProvider = createMockProvider();
    const factory = createMockProviderFactory({
      getProvider: vi.fn().mockResolvedValue(mockProvider),
    });

    registerLogDeletionHandler(jobQueue, factory);
    const handler = handlers.get("log-deletion");
    expect(handler).toBeDefined();

    await handler!({
      orgId: "org-001",
      resourceType: "call",
      resourceId: "CA-abc123",
    });

    expect(factory.getProvider).toHaveBeenCalledWith("org-001");
    expect(mockProvider.deleteCallLog).toHaveBeenCalledWith("CA-abc123");
    expect(mockProvider.deleteMessageLog).not.toHaveBeenCalled();
    expect(mockProvider.deleteRecording).not.toHaveBeenCalled();
  });

  it("calls deleteMessageLog for resourceType message", async () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const mockProvider = createMockProvider();
    const factory = createMockProviderFactory({
      getProvider: vi.fn().mockResolvedValue(mockProvider),
    });

    registerLogDeletionHandler(jobQueue, factory);
    const handler = handlers.get("log-deletion")!;

    await handler({
      orgId: "org-002",
      resourceType: "message",
      resourceId: "SM-xyz789",
    });

    expect(mockProvider.deleteMessageLog).toHaveBeenCalledWith("SM-xyz789");
    expect(mockProvider.deleteCallLog).not.toHaveBeenCalled();
    expect(mockProvider.deleteRecording).not.toHaveBeenCalled();
  });

  it("calls deleteRecording for resourceType recording", async () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const mockProvider = createMockProvider();
    const factory = createMockProviderFactory({
      getProvider: vi.fn().mockResolvedValue(mockProvider),
    });

    registerLogDeletionHandler(jobQueue, factory);
    const handler = handlers.get("log-deletion")!;

    await handler({
      orgId: "org-003",
      resourceType: "recording",
      resourceId: "RE-rec456",
    });

    expect(mockProvider.deleteRecording).toHaveBeenCalledWith("RE-rec456");
    expect(mockProvider.deleteCallLog).not.toHaveBeenCalled();
    expect(mockProvider.deleteMessageLog).not.toHaveBeenCalled();
  });

  it("throws ValidationError when orgId is missing", async () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const factory = createMockProviderFactory();

    registerLogDeletionHandler(jobQueue, factory);
    const handler = handlers.get("log-deletion")!;

    await expect(
      handler({ resourceType: "call", resourceId: "CA-abc" }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError when resourceType is invalid", async () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const factory = createMockProviderFactory();

    registerLogDeletionHandler(jobQueue, factory);
    const handler = handlers.get("log-deletion")!;

    await expect(
      handler({ orgId: "org-001", resourceType: "fax", resourceId: "FX-123" }),
    ).rejects.toThrow(ValidationError);
  });
});

describe("enqueueLogDeletion", () => {
  it("enqueues with queue name log-deletion", async () => {
    const { jobQueue } = createMockJobQueue();

    const jobId = await enqueueLogDeletion(jobQueue, {
      orgId: "org-001",
      resourceType: "call",
      resourceId: "CA-abc123",
    });

    expect(jobId).toBe("job-123");
    // Retry options are configuration, not behavior: assert they are passed
    // without pinning their values.
    expect(jobQueue.enqueue).toHaveBeenCalledWith(
      "log-deletion",
      { orgId: "org-001", resourceType: "call", resourceId: "CA-abc123" },
      expect.anything(),
    );
  });
});
