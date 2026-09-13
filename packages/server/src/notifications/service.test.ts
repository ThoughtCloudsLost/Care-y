import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import {
  createNotificationService,
  createNotificationJobHandler,
} from "./service.js";
import type { SseService } from "./sse.js";
import { createNotificationEmailSender } from "./email.js";
import type { NotificationEmailSender } from "./email.js";
import type { EmailSender } from "../email/email-sender.js";
import type { PushNotificationSender } from "./push.js";
import type { JobQueue } from "../jobs/queue.js";
import type { NotificationRecipientList } from "../tickets/notification-recipients.js";
import type {
  NotificationPreferencesService,
  DispatchAllowLists,
} from "./preferences.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { notificationEventTypeSchema, sseEventSchema } from "@care-y/shared";
import {
  type CapturedEmail,
  createCapturingTransport,
  type CapturingTransport,
  createTestDb,
  createTestUser,
  testFieldEncryptor,
  type TestDb,
} from "../test-utils.js";
import type { VolunteerReachability } from "../telephony/reachability.js";
import { NOTIFICATION_SMS_QUEUE } from "../jobs/notification-sms.js";

vi.mock("../telephony/reachability.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getReachabilityForUsers: vi.fn(
    async () => new Map<string, VolunteerReachability>(),
  ),
}));

// Imported after vi.mock so the mock is in place
const { getReachabilityForUsers } =
  await import("../telephony/reachability.js");

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

/**
 * Returns an all-allowed preferences stub by default. Pass `overrides` to
 * customize specific allow lists, or `throwOnResolve` to simulate a query
 * failure for the fail-open test.
 */
function mockPreferences(
  opts: {
    overrides?: Partial<DispatchAllowLists>;
    throwOnResolve?: boolean;
  } = {},
): NotificationPreferencesService {
  return {
    getEffective: vi.fn(async () => true),
    resolveForDispatch: vi.fn(async (_tDb, userIds) => {
      if (opts.throwOnResolve) {
        throw new Error("preferences DB unreachable");
      }
      const all = [...userIds];
      return {
        pushAllowed: opts.overrides?.pushAllowed ?? all,
        emailAllowed: opts.overrides?.emailAllowed ?? all,
        smsAllowed: opts.overrides?.smsAllowed ?? all,
      };
    }),
    set: vi.fn(async () => undefined),
    listForUser: vi.fn(async () => []),
    reset: vi.fn(async () => undefined),
    assertScopeAccessible: vi.fn(async () => undefined),
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
  beforeEach(() => {
    vi.mocked(getReachabilityForUsers).mockReset();
    // Default: return empty map (all smsAllowed users fall back to email)
    vi.mocked(getReachabilityForUsers).mockResolvedValue(
      new Map<string, VolunteerReachability>(),
    );
  });

  it("broadcasts SSE event to all recipients", async () => {
    const sse = mockSse();
    const svc = createNotificationService({
      sse,
      emailSender: mockEmailSender(),
      pushSender: mockPushSender(),
      jobQueue: mockJobQueue(),
      preferences: mockPreferences(),
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "ticket_assigned",
      "ticket-uuid",
      "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      TEST_RECIPIENTS,
    );

    expect(sse.broadcast).toHaveBeenCalledTimes(1);
    const broadcastArgs = (sse.broadcast as ReturnType<typeof vi.fn>).mock
      .calls[0] as unknown[];
    expect(broadcastArgs[0]).toBe("org_test-1");
    expect(broadcastArgs[1]).toEqual(["user-1", "user-2"]);

    const event = broadcastArgs[2] as Record<string, unknown>;
    expect(event.type).toBe("ticket_assigned");
    expect(event.ticketId).toBe("ticket-uuid");
    expect(event.queueId).toBe("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
  });

  it("enqueues email job via JobQueue", async () => {
    const jobQueue = mockJobQueue();
    const svc = createNotificationService({
      sse: mockSse(),
      emailSender: mockEmailSender(),
      pushSender: mockPushSender(),
      jobQueue,
      preferences: mockPreferences(),
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "ticket_created",
      "ticket-uuid",
      "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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
      preferences: mockPreferences(),
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "ticket_assigned",
      "ticket-uuid",
      "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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
      preferences: mockPreferences(),
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "ticket_assigned",
      "ticket-uuid",
      "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      EMPTY_RECIPIENTS,
    );

    expect(sse.broadcast).not.toHaveBeenCalled();
    expect(pushSender.sendToUsers).not.toHaveBeenCalled();
    expect(jobQueue.enqueuedJobs).toHaveLength(0);
  });

  it("broadcasts an SSE event that parses against the shared sseEventSchema", async () => {
    const sse = mockSse();
    const svc = createNotificationService({
      sse,
      emailSender: mockEmailSender(),
      pushSender: mockPushSender(),
      jobQueue: mockJobQueue(),
      preferences: mockPreferences(),
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "followup_added",
      crypto.randomUUID(),
      crypto.randomUUID(),
      TEST_RECIPIENTS,
    );

    const broadcastArgs = (sse.broadcast as ReturnType<typeof vi.fn>).mock
      .calls[0] as unknown[];
    // SSE payloads are wire format: connected clients validate the stream
    // against sseEventSchema, so the dispatched event must parse (including
    // the ISO timestamp the service stamps on it).
    const parsed = sseEventSchema.safeParse(broadcastArgs[2]);
    expect(parsed.success).toBe(true);
  });

  it("still broadcasts and enqueues email when push delivery rejects", async () => {
    const sse = mockSse();
    const jobQueue = mockJobQueue();
    const pushSender: PushNotificationSender = {
      sendToUsers: vi.fn(async () => {
        throw new Error("push endpoint unreachable");
      }),
      removeSubscription: vi.fn(async () => {
        // mock stub
      }),
    };
    const svc = createNotificationService({
      sse,
      emailSender: mockEmailSender(),
      pushSender,
      jobQueue,
      preferences: mockPreferences(),
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "ticket_created",
      "ticket-uuid",
      "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      TEST_RECIPIENTS,
    );

    // Push is best-effort: its failure must not block the durable channels.
    expect(sse.broadcast).toHaveBeenCalledTimes(1);
    expect(jobQueue.enqueuedJobs).toHaveLength(1);

    // Flush the microtask queue so the swallowed push rejection settles inside
    // this test. If dispatch ever stops handling that rejection, Vitest fails
    // the run with an unhandled rejection instead of silently passing.
    await new Promise<void>((resolve) => {
      setImmediate(resolve);
    });
  });

  it("rejects when the email job cannot be enqueued (alert loss must be loud)", async () => {
    const failingQueue: JobQueue = {
      enqueue: vi.fn(async () => {
        throw new Error("job queue unavailable");
      }),
      process: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(async () => {
        // mock stub
      }),
    };
    const svc = createNotificationService({
      sse: mockSse(),
      emailSender: mockEmailSender(),
      pushSender: mockPushSender(),
      jobQueue: failingQueue,
      preferences: mockPreferences(),
    });

    // The ticket routes catch and log this rejection; dispatch itself must
    // propagate the failure rather than swallow it, or alert loss would leave
    // no trace anywhere.
    await expect(
      svc.dispatch(
        {} as Kysely<TenantDatabase>,
        "org_test-1",
        "myorg",
        "ticket_created",
        "ticket-uuid",
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        TEST_RECIPIENTS,
      ),
    ).rejects.toThrow("job queue unavailable");
  });

  it("excludes push-disabled recipients from pushSender but SSE still includes them", async () => {
    const sse = mockSse();
    const pushSender = mockPushSender();
    // user-1 has push disabled; user-2 still allowed
    const prefs = mockPreferences({
      overrides: {
        pushAllowed: ["user-2"],
        emailAllowed: ["user-1", "user-2"],
        smsAllowed: ["user-1", "user-2"],
      },
    });
    const svc = createNotificationService({
      sse,
      emailSender: mockEmailSender(),
      pushSender,
      jobQueue: mockJobQueue(),
      preferences: prefs,
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "ticket_assigned",
      "ticket-uuid",
      "queue-uuid",
      TEST_RECIPIENTS,
    );

    // SSE broadcasts to all recipients (never filtered by preferences)
    const broadcastArgs = (sse.broadcast as ReturnType<typeof vi.fn>).mock
      .calls[0] as unknown[];
    expect(broadcastArgs[1]).toEqual(["user-1", "user-2"]);

    // Push only to user-2
    expect(pushSender.sendToUsers).toHaveBeenCalledTimes(1);
    const pushArgs = (pushSender.sendToUsers as ReturnType<typeof vi.fn>).mock
      .calls[0] as unknown[];
    expect(pushArgs[1]).toEqual(["user-2"]);
  });

  it("skips email enqueue entirely when all recipients have email and sms disabled", async () => {
    const jobQueue = mockJobQueue();
    const prefs = mockPreferences({
      overrides: {
        pushAllowed: ["user-1", "user-2"],
        emailAllowed: [],
        smsAllowed: [],
      },
    });
    const svc = createNotificationService({
      sse: mockSse(),
      emailSender: mockEmailSender(),
      pushSender: mockPushSender(),
      jobQueue,
      preferences: prefs,
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "ticket_created",
      "ticket-uuid",
      "queue-uuid",
      TEST_RECIPIENTS,
    );

    // No jobs enqueued at all (smsAllowed empty skips reachability,
    // emailAllowed empty skips the email enqueue)
    expect(jobQueue.enqueuedJobs).toHaveLength(0);
  });

  it("falls back to all-allowed when preferences service throws", async () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      const sse = mockSse();
      const pushSender = mockPushSender();
      const jobQueue = mockJobQueue();
      const prefs = mockPreferences({ throwOnResolve: true });
      const svc = createNotificationService({
        sse,
        emailSender: mockEmailSender(),
        pushSender,
        jobQueue,
        preferences: prefs,
      });

      await svc.dispatch(
        {} as Kysely<TenantDatabase>,
        "org_test-1",
        "myorg",
        "ticket_assigned",
        "ticket-uuid",
        "queue-uuid",
        TEST_RECIPIENTS,
      );

      // Dispatch proceeds with all recipients on every channel
      expect(sse.broadcast).toHaveBeenCalledTimes(1);
      expect(pushSender.sendToUsers).toHaveBeenCalledTimes(1);
      expect(jobQueue.enqueuedJobs).toHaveLength(1);

      // The fallback logged the error (no PII in the log)
      expect(errorSpy).toHaveBeenCalled();
      const logged = errorSpy.mock.calls
        .map((call) => call.map(String).join(" "))
        .join("\n");
      expect(logged).toContain("falling back to all-allowed");
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("splits smsAllowed by reachability: deliverable to SMS queue, fallback merged into email", async () => {
    // user-1 is verified_sms (deliverable), user-2 is verified (no SMS, fallback)
    vi.mocked(getReachabilityForUsers).mockResolvedValue(
      new Map<string, VolunteerReachability>([
        ["user-1", "verified_sms"],
        ["user-2", "verified"],
      ]),
    );

    const jobQueue = mockJobQueue();
    const prefs = mockPreferences({
      overrides: {
        pushAllowed: ["user-1", "user-2"],
        emailAllowed: [],
        smsAllowed: ["user-1", "user-2"],
      },
    });
    const svc = createNotificationService({
      sse: mockSse(),
      emailSender: mockEmailSender(),
      pushSender: mockPushSender(),
      jobQueue,
      preferences: prefs,
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "ticket_escalated",
      "ticket-uuid",
      "queue-uuid",
      TEST_RECIPIENTS,
    );

    // Two enqueued jobs: one SMS, one email (for the fallback user)
    expect(jobQueue.enqueuedJobs).toHaveLength(2);
    const smsJob = jobQueue.enqueuedJobs.find(
      (j) => (j as { queue: string }).queue === NOTIFICATION_SMS_QUEUE,
    ) as { queue: string; payload: Record<string, unknown> };
    const emailJob = jobQueue.enqueuedJobs.find(
      (j) => (j as { queue: string }).queue === "notification-email",
    ) as { queue: string; payload: Record<string, unknown> };

    expect(smsJob).toBeDefined();
    expect(smsJob.payload.recipientUserIds).toEqual(["user-1"]);
    expect(smsJob.payload.eventType).toBe("ticket_escalated");

    expect(emailJob).toBeDefined();
    // user-2 falls back to email despite emailAllowed being empty,
    // because the fallback deliberately overrides a disabled email
    // preference: a silently dropped escalation ping is the worse failure.
    expect(emailJob.payload.recipientUserIds).toEqual(["user-2"]);
  });

  it("deduplicates the email list when a user appears in both emailAllowed and smsFallback", async () => {
    // user-1 has email enabled AND sms enabled but is not SMS-reachable
    vi.mocked(getReachabilityForUsers).mockResolvedValue(
      new Map<string, VolunteerReachability>([["user-1", "unverified"]]),
    );

    const jobQueue = mockJobQueue();
    const prefs = mockPreferences({
      overrides: {
        pushAllowed: [],
        emailAllowed: ["user-1"],
        smsAllowed: ["user-1"],
      },
    });
    const svc = createNotificationService({
      sse: mockSse(),
      emailSender: mockEmailSender(),
      pushSender: mockPushSender(),
      jobQueue,
      preferences: prefs,
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "ticket_created",
      "ticket-uuid",
      "queue-uuid",
      TEST_RECIPIENTS,
    );

    // One email job only (no SMS job since user-1 is not verified_sms)
    expect(jobQueue.enqueuedJobs).toHaveLength(1);
    const emailJob = jobQueue.enqueuedJobs[0] as {
      queue: string;
      payload: Record<string, unknown>;
    };
    expect(emailJob.queue).toBe("notification-email");
    // user-1 appears once, not twice (Set dedupe)
    expect(emailJob.payload.recipientUserIds).toEqual(["user-1"]);
  });

  it("skips the reachability query entirely when smsAllowed is empty", async () => {
    const jobQueue = mockJobQueue();
    const prefs = mockPreferences({
      overrides: {
        pushAllowed: ["user-1", "user-2"],
        emailAllowed: ["user-1", "user-2"],
        smsAllowed: [],
      },
    });
    const svc = createNotificationService({
      sse: mockSse(),
      emailSender: mockEmailSender(),
      pushSender: mockPushSender(),
      jobQueue,
      preferences: prefs,
    });

    await svc.dispatch(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "ticket_assigned",
      "ticket-uuid",
      "queue-uuid",
      TEST_RECIPIENTS,
    );

    // Reachability module never called
    expect(getReachabilityForUsers).not.toHaveBeenCalled();

    // Email still enqueued normally from emailAllowed
    expect(jobQueue.enqueuedJobs).toHaveLength(1);
    const emailJob = jobQueue.enqueuedJobs[0] as {
      queue: string;
      payload: Record<string, unknown>;
    };
    expect(emailJob.queue).toBe("notification-email");
    expect(emailJob.payload.recipientUserIds).toEqual(["user-1", "user-2"]);
  });
});

// ---------------------------------------------------------------------------
// dispatchTicketless preference filtering
// ---------------------------------------------------------------------------

describe("NotificationService.dispatchTicketless preference filtering", () => {
  beforeEach(() => {
    vi.mocked(getReachabilityForUsers).mockReset();
    vi.mocked(getReachabilityForUsers).mockResolvedValue(
      new Map<string, VolunteerReachability>(),
    );
  });

  it("consults global scope only (no ticket or queue forwarded to resolveForDispatch)", async () => {
    const prefs = mockPreferences();
    const svc = createNotificationService({
      sse: mockSse(),
      emailSender: mockEmailSender(),
      pushSender: mockPushSender(),
      jobQueue: mockJobQueue(),
      preferences: prefs,
    });

    await svc.dispatchTicketless(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "voicemail_quarantined",
      ["admin-1"],
    );

    expect(prefs.resolveForDispatch).toHaveBeenCalledTimes(1);
    const resolveArgs = (prefs.resolveForDispatch as ReturnType<typeof vi.fn>)
      .mock.calls[0] as unknown[];
    // ticketId (arg index 3) and queueId (arg index 4) must be undefined
    expect(resolveArgs[3]).toBeUndefined();
    expect(resolveArgs[4]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// dispatchTicketless
// ---------------------------------------------------------------------------

describe("NotificationService.dispatchTicketless", () => {
  beforeEach(() => {
    vi.mocked(getReachabilityForUsers).mockReset();
    vi.mocked(getReachabilityForUsers).mockResolvedValue(
      new Map<string, VolunteerReachability>(),
    );
  });

  it("broadcasts a system SSE event with type and timestamp only", async () => {
    const sse = mockSse();
    const svc = createNotificationService({
      sse,
      emailSender: mockEmailSender(),
      pushSender: mockPushSender(),
      jobQueue: mockJobQueue(),
      preferences: mockPreferences(),
    });

    await svc.dispatchTicketless(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "voicemail_quarantined",
      ["admin-1", "admin-2"],
    );

    expect(sse.broadcast).toHaveBeenCalledTimes(1);
    const broadcastArgs = (sse.broadcast as ReturnType<typeof vi.fn>).mock
      .calls[0] as unknown[];
    expect(broadcastArgs[0]).toBe("org_test-1");
    expect(broadcastArgs[1]).toEqual(["admin-1", "admin-2"]);

    const event = broadcastArgs[2] as Record<string, unknown>;
    expect(event.type).toBe("voicemail_quarantined");
    expect(typeof event.timestamp).toBe("string");
    // System SSE events carry no PII: only type and timestamp.
    const keys = Object.keys(event);
    expect(keys).toEqual(expect.arrayContaining(["type", "timestamp"]));
    expect(keys).toHaveLength(2);
  });

  it("sends push notifications to the given userIds", async () => {
    const pushSender = mockPushSender();
    const svc = createNotificationService({
      sse: mockSse(),
      emailSender: mockEmailSender(),
      pushSender,
      jobQueue: mockJobQueue(),
      preferences: mockPreferences(),
    });

    const tDb = {} as Kysely<TenantDatabase>;
    await svc.dispatchTicketless(
      tDb,
      "org_test-1",
      "myorg",
      "voicemail_quarantined",
      ["admin-1"],
    );

    expect(pushSender.sendToUsers).toHaveBeenCalledTimes(1);
    expect(pushSender.sendToUsers).toHaveBeenCalledWith(tDb, ["admin-1"]);
  });

  it("enqueues an email job with no PII in the payload", async () => {
    const jobQueue = mockJobQueue();
    const svc = createNotificationService({
      sse: mockSse(),
      emailSender: mockEmailSender(),
      pushSender: mockPushSender(),
      jobQueue,
      preferences: mockPreferences(),
    });

    await svc.dispatchTicketless(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "voicemail_quarantined",
      ["admin-1", "admin-2"],
    );

    expect(jobQueue.enqueuedJobs).toHaveLength(1);
    const job = jobQueue.enqueuedJobs[0] as {
      queue: string;
      payload: Record<string, unknown>;
    };
    expect(job.queue).toBe("notification-email");
    expect(job.payload).toEqual({
      orgSchema: "org_test-1",
      orgSlug: "myorg",
      recipientUserIds: ["admin-1", "admin-2"],
      eventType: "voicemail_quarantined",
    });
  });

  it("skips everything for empty userIds", async () => {
    const sse = mockSse();
    const jobQueue = mockJobQueue();
    const pushSender = mockPushSender();
    const svc = createNotificationService({
      sse,
      emailSender: mockEmailSender(),
      pushSender,
      jobQueue,
      preferences: mockPreferences(),
    });

    await svc.dispatchTicketless(
      {} as Kysely<TenantDatabase>,
      "org_test-1",
      "myorg",
      "voicemail_quarantined",
      [],
    );

    expect(sse.broadcast).not.toHaveBeenCalled();
    expect(pushSender.sendToUsers).not.toHaveBeenCalled();
    expect(jobQueue.enqueuedJobs).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Job handler (DB integration)
// ---------------------------------------------------------------------------

const TEST_ORG_SLUG = "test-org";
// The login link volunteers receive in every notification email. Hardcoded
// (not derived via buildLoginUrl) so the assertion is not a tautology.
const LOGIN_URL = "https://test-org.care-y.app/login";
const ADDR_A = "volunteer-a@example.test";
const ADDR_B = "volunteer-b@example.test";

describe.skipIf(!process.env.DATABASE_URL)(
  "createNotificationJobHandler (DB)",
  () => {
    let testDb: TestDb;
    let userAId: string;
    let userBId: string;
    let userNoAddrId: string;

    beforeAll(async () => {
      testDb = await createTestDb();

      // org_config starts empty in a fresh schema. The handler reads email
      // branding from it; the migration 040 column defaults apply on insert.
      await testDb.db
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .execute();

      const userA = await createTestUser(testDb.db, {
        overrides: {
          encrypted_notification_addr: testFieldEncryptor.encrypt(ADDR_A),
        },
      });
      const userB = await createTestUser(testDb.db, {
        overrides: {
          encrypted_notification_addr: testFieldEncryptor.encrypt(ADDR_B),
        },
      });
      // No notification address (encrypted_notification_addr stays null).
      const userNoAddr = await createTestUser(testDb.db);

      userAId = userA.id;
      userBId = userB.id;
      userNoAddrId = userNoAddr.id;
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    function buildJobHandler(
      transport: EmailSender,
    ): (payload: Record<string, unknown>) => Promise<void> {
      return createNotificationJobHandler({
        emailSender: createNotificationEmailSender(transport),
        encryptor: testFieldEncryptor,
        getTenantDb: () => testDb.db,
      });
    }

    function jobPayload(overrides: {
      recipientUserIds: readonly string[];
      eventType?: string;
    }): Record<string, unknown> {
      return {
        orgSchema: `org_${crypto.randomUUID()}`,
        orgSlug: TEST_ORG_SLUG,
        recipientUserIds: [...overrides.recipientUserIds],
        eventType: overrides.eventType ?? "ticket_created",
      };
    }

    function onlySent(transport: CapturingTransport): CapturedEmail {
      expect(transport.sent).toHaveLength(1);
      return transport.sent[0] as CapturedEmail;
    }

    it("sends one email per recipient with a notification address", async () => {
      const transport = createCapturingTransport();
      await buildJobHandler(transport)(
        jobPayload({ recipientUserIds: [userAId, userBId] }),
      );

      // Recipient addresses are the SMTP wire contract: one message per
      // opted-in recipient, addressed to their decrypted address.
      const recipients = transport.sent.map((m) => m.to).sort();
      expect(recipients).toEqual([ADDR_A, ADDR_B]);
      for (const mail of transport.sent) {
        // Subject prefix and login link are the wire content volunteers see.
        // Exact copy is deliberately not asserted.
        expect(mail.subject).toMatch(/^CARE-Y: .+/);
        expect(mail.text).toContain(LOGIN_URL);
      }
    });

    it("brands the From header from org_config defaults", async () => {
      const transport = createCapturingTransport();
      await buildJobHandler(transport)(
        jobPayload({ recipientUserIds: [userAId] }),
      );

      const mail = onlySent(transport);
      // From header is wire format. Values come from the org_config column
      // defaults (migration 040) on the seeded row.
      expect(mail.from).toContain("CARE-Y Hotline");
      expect(mail.from).toContain("notify@care-y.app");
    });

    it("brands the From header with org-configured name and address", async () => {
      await testDb.db
        .updateTable("org_config")
        // care-y-ignore-next-line no-plaintext-db-write -- email_from_name/email_from_address are org branding config, stored plaintext by design (migration 040), not client/volunteer PII
        .set({
          email_from_name: "Harbor Line",
          email_from_address: "desk@harbor.example",
        })
        .execute();
      try {
        const transport = createCapturingTransport();
        await buildJobHandler(transport)(
          jobPayload({ recipientUserIds: [userAId] }),
        );

        const mail = onlySent(transport);
        expect(mail.from).toContain("Harbor Line");
        expect(mail.from).toContain("desk@harbor.example");
      } finally {
        // Restore the migration defaults for the other tests in this schema.
        await testDb.db
          .updateTable("org_config")
          // care-y-ignore-next-line no-plaintext-db-write -- same org branding columns as above, plaintext by design
          .set({
            email_from_name: "CARE-Y Hotline",
            email_from_address: "notify@care-y.app",
          })
          .execute();
      }
    });

    it("skips recipients without a notification address and emails the rest", async () => {
      const transport = createCapturingTransport();
      await buildJobHandler(transport)(
        jobPayload({ recipientUserIds: [userNoAddrId, userAId] }),
      );

      expect(transport.sent.map((m) => m.to)).toEqual([ADDR_A]);
    });

    it("resolves without sending when no recipients exist in the DB", async () => {
      const transport = createCapturingTransport();
      await buildJobHandler(transport)(
        jobPayload({
          recipientUserIds: [crypto.randomUUID(), crypto.randomUUID()],
        }),
      );

      expect(transport.sent).toHaveLength(0);
    });

    it("sends a single email when the payload lists the same recipient twice", async () => {
      const transport = createCapturingTransport();
      await buildJobHandler(transport)(
        jobPayload({ recipientUserIds: [userAId, userAId] }),
      );

      expect(transport.sent.map((m) => m.to)).toEqual([ADDR_A]);
    });

    it("delivers to remaining recipients and resolves when one send fails", async () => {
      const errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      try {
        const transport = createCapturingTransport({ failFor: [ADDR_A] });
        await buildJobHandler(transport)(
          jobPayload({ recipientUserIds: [userAId, userBId] }),
        );

        expect(transport.sent.map((m) => m.to)).toEqual([ADDR_B]);

        // Console assertion justification: the per-recipient failure log is a
        // documented contract in service.ts ("failures are logged but do not
        // fail the job"), and "never log PII" is a project-wide NEVER. The
        // transport error message contains the address on purpose, so echoing
        // the caught error into the log would fail this test.
        expect(errorSpy).toHaveBeenCalled();
        const logged = errorSpy.mock.calls
          .map((call) => call.map(String).join(" "))
          .join("\n");
        expect(logged).not.toContain(ADDR_A);
      } finally {
        errorSpy.mockRestore();
      }
    });

    it("contains a corrupt-address decrypt failure and emails the rest", async () => {
      const corrupt = await createTestUser(testDb.db, {
        overrides: {
          // Too short to contain nonce + MAC: real decryption throws.
          encrypted_notification_addr: Buffer.from("not-real-ciphertext"),
        },
      });
      const errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      try {
        const transport = createCapturingTransport();
        await buildJobHandler(transport)(
          jobPayload({ recipientUserIds: [corrupt.id, userBId] }),
        );

        expect(transport.sent.map((m) => m.to)).toEqual([ADDR_B]);
        // A recipient silently vanishing without a log line would be a
        // dropped-alert bug; the containment must leave a trace.
        expect(errorSpy).toHaveBeenCalled();
      } finally {
        errorSpy.mockRestore();
      }
    });

    it("rejects a malformed payload without attempting any email", async () => {
      const transport = createCapturingTransport();
      const handler = buildJobHandler(transport);

      // Bad payloads must fail the job loudly (the queue retries, then
      // dead-letters); a silent success here would drop alerts with no trace.
      await expect(
        handler(
          jobPayload({
            recipientUserIds: [userAId],
            eventType: "bogus_event",
          }),
        ),
      ).rejects.toThrow();
      await expect(handler({})).rejects.toThrow();

      expect(transport.sent).toHaveLength(0);
    });

    it("produces a distinct subject and a login-link body for every event type", async () => {
      const subjects: string[] = [];
      for (const eventType of notificationEventTypeSchema.options) {
        const transport = createCapturingTransport();
        await buildJobHandler(transport)(
          jobPayload({ recipientUserIds: [userAId], eventType }),
        );

        const mail = onlySent(transport);
        expect(mail.subject).toMatch(/^CARE-Y: .+/);
        expect(mail.text).toContain(LOGIN_URL);
        subjects.push(mail.subject);
      }

      // Volunteers triage by subject: every event type must be
      // distinguishable in the inbox. Exact wording is not asserted.
      expect(new Set(subjects).size).toBe(
        notificationEventTypeSchema.options.length,
      );
    });
  },
);
