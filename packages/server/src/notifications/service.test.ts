import { describe, expect, it, vi } from "vitest";
import { createNotificationService } from "./service.js";
import type { SseService } from "./sse.js";
import type { NotificationEmailSender } from "./email.js";
import type { PushNotificationSender } from "./push.js";
import type { JobQueue } from "../jobs/queue.js";
import type { NotificationRecipientList } from "../tickets/notification-recipients.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

function mockSse(): SseService & { calls: unknown[] } {
  const calls: unknown[] = [];
  return {
    calls,
    connect: vi.fn(() => vi.fn()),
    broadcast: vi.fn((...args: unknown[]) => {
      calls.push(args);
    }),
    connectionCount: vi.fn(() => 0),
    closeAll: vi.fn(),
  };
}

function mockEmailSender(): NotificationEmailSender {
  return {
    sendTicketNotification: vi.fn(async () => {
      // mock stub
    }),
  };
}

function mockPushSender(): PushNotificationSender {
  return {
    sendToUsers: vi.fn(async () => {
      // mock stub
    }),
    removeSubscription: vi.fn(async () => {
      // mock stub
    }),
  };
}

function mockJobQueue(): JobQueue & { enqueuedJobs: unknown[] } {
  const enqueuedJobs: unknown[] = [];
  return {
    enqueuedJobs,
    enqueue: vi.fn(async (queue: string, payload: unknown) => {
      enqueuedJobs.push({ queue, payload });
      return "job-id-123";
    }),
    process: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(async () => {
      // mock stub
    }),
  };
}

const TEST_RECIPIENTS: NotificationRecipientList = {
  recipients: [
    { userId: "user-1", source: "owner" },
    { userId: "user-2", source: "cc" },
  ],
};

const EMPTY_RECIPIENTS: NotificationRecipientList = {
  recipients: [],
};

describe("NotificationService.dispatch", () => {
  it("broadcasts SSE event to all recipients", async () => {
    const sse = mockSse();
    const svc = createNotificationService({
      sse,
      emailSender: mockEmailSender(),
      pushSender: mockPushSender(),
      jobQueue: mockJobQueue(),
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org-1",
      "myorg",
      "ticket_assigned",
      "ticket-uuid",
      "Intake",
      TEST_RECIPIENTS,
    );

    expect(sse.broadcast).toHaveBeenCalledTimes(1);
    const broadcastArgs = (sse.broadcast as ReturnType<typeof vi.fn>).mock
      .calls[0] as unknown[];
    expect(broadcastArgs[0]).toBe("org-1");
    expect(broadcastArgs[1]).toEqual(["user-1", "user-2"]);

    const event = broadcastArgs[2] as Record<string, unknown>;
    expect(event.type).toBe("ticket_assigned");
    expect(event.ticketId).toBe("ticket-uuid");
    expect(event.queueName).toBe("Intake");
  });

  it("enqueues email job via JobQueue", async () => {
    const jobQueue = mockJobQueue();
    const svc = createNotificationService({
      sse: mockSse(),
      emailSender: mockEmailSender(),
      pushSender: mockPushSender(),
      jobQueue,
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org-1",
      "myorg",
      "ticket_created",
      "ticket-uuid",
      "Intake",
      TEST_RECIPIENTS,
    );

    expect(jobQueue.enqueuedJobs).toHaveLength(1);
    const job = jobQueue.enqueuedJobs[0] as {
      queue: string;
      payload: Record<string, unknown>;
    };
    expect(job.queue).toBe("notification-email");
    expect(job.payload.recipientUserIds).toEqual(["user-1", "user-2"]);
    expect(job.payload.eventType).toBe("ticket_created");
  });

  it("fires push notifications", async () => {
    const pushSender = mockPushSender();
    const svc = createNotificationService({
      sse: mockSse(),
      emailSender: mockEmailSender(),
      pushSender,
      jobQueue: mockJobQueue(),
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org-1",
      "myorg",
      "ticket_assigned",
      "ticket-uuid",
      "Intake",
      TEST_RECIPIENTS,
    );

    expect(pushSender.sendToUsers).toHaveBeenCalledTimes(1);
  });

  it("skips everything for empty recipient list", async () => {
    const sse = mockSse();
    const jobQueue = mockJobQueue();
    const pushSender = mockPushSender();
    const svc = createNotificationService({
      sse,
      emailSender: mockEmailSender(),
      pushSender,
      jobQueue,
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org-1",
      "myorg",
      "ticket_assigned",
      "ticket-uuid",
      "Intake",
      EMPTY_RECIPIENTS,
    );

    expect(sse.broadcast).not.toHaveBeenCalled();
    expect(pushSender.sendToUsers).not.toHaveBeenCalled();
    expect(jobQueue.enqueuedJobs).toHaveLength(0);
  });
});
