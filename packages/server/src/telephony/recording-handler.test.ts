import * as crypto from "node:crypto";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { handleRecordingComplete } from "./recording-handler.js";
import type { RecordingHandlerDeps } from "./recording-handler.js";
import type { TelephonyProvider } from "./provider.js";
import {
  BlobStoreError,
  type BlobCategory,
  type BlobStore,
} from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import { TelephonyError } from "../errors.js";
import { createCallTracker, type CallTracker } from "./call-tracker.js";
import {
  createTestDb,
  createTestQueue,
  createTestTicketFixture,
  createTestClientFixture,
  TestSetupError,
  type TestDb,
} from "../test-utils.js";

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
    // Unit tests never execute queries; an empty object is enough for the
    // paths that only resolve (or never touch) the tenant DB.
    getTenantDb: vi
      .fn<(schema: string) => Kysely<TenantDatabase>>()
      .mockReturnValue({} as unknown as Kysely<TenantDatabase>),
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

  // --- Tracked call, unresolvable ticket ---

  it("returns null and cleans up when the tracked call has no ticket and no client", async () => {
    const tracker = createCallTracker();
    tracker.track("CA456", {
      ticketId: "",
      userId: null,
      direction: "inbound",
      orgSchema: "org_test",
      clientId: null,
      createdAt: Date.now(),
    });
    deps = makeDeps(tracker);

    const result = await handleRecordingComplete(body, deps);

    expect(result.ticketId).toBeNull();
    expect(result.followUpId).toBeNull();
    expect(deps.provider.deleteRecording).toHaveBeenCalledWith("RE123");
    expect(deps.provider.deleteCallLog).toHaveBeenCalledWith("CA456");
  });

  it("returns null and cleans up when ticket resolution needs an intake queue but none is configured", async () => {
    const tracker = createCallTracker();
    tracker.track("CA456", {
      ticketId: "",
      userId: null,
      direction: "inbound",
      orgSchema: "org_test",
      clientId: "client-1",
      createdAt: Date.now(),
    });
    // makeDeps default: intakeQueueId is null
    deps = makeDeps(tracker);

    const result = await handleRecordingComplete(body, deps);

    expect(result.ticketId).toBeNull();
    expect(result.followUpId).toBeNull();
    expect(deps.provider.deleteRecording).toHaveBeenCalledWith("RE123");
    expect(deps.provider.deleteCallLog).toHaveBeenCalledWith("CA456");
  });

  // --- Provider fetch failure ---

  it("propagates provider fetch errors and leaves the provider-side recording intact", async () => {
    const tracker = createCallTracker();
    tracker.track("CA456", {
      ticketId: "ticket-1",
      userId: null,
      direction: "inbound",
      orgSchema: "org_test",
      clientId: null,
      createdAt: Date.now(),
    });
    deps = makeDeps(tracker);
    // provider-http classifies HTTP 4xx/5xx responses into TelephonyError;
    // the handler must let it surface so routes/webhooks.ts answers 500 and
    // the provider retries the callback.
    vi.mocked(deps.provider.getRecording).mockRejectedValueOnce(
      new TelephonyError("Resource not found: recording", 404),
    );

    await expect(handleRecordingComplete(body, deps)).rejects.toThrow(
      TelephonyError,
    );

    // The provider copy is the only copy until ciphertext is stored.
    // Deleting it on a failed fetch would destroy the recording forever.
    expect(deps.provider.deleteRecording).not.toHaveBeenCalled();
    expect(deps.provider.deleteCallLog).not.toHaveBeenCalled();
    expect(deps.jobQueue.enqueue).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// DB integration: fetch + encrypt + store pipeline (Docker only)
// ---------------------------------------------------------------------------

interface MemoryBlobStore extends BlobStore {
  readonly blobs: ReadonlyMap<string, Buffer>;
}

/** Map-backed BlobStore (testing-reference: in-memory stores for integration tests). */
function createMemoryBlobStore(): MemoryBlobStore {
  const blobs = new Map<string, Buffer>();
  let counter = 0;
  return {
    get blobs() {
      return blobs;
    },
    async put(
      orgSchema: string,
      category: BlobCategory,
      blob: Buffer,
    ): Promise<string> {
      counter += 1;
      const key = `${orgSchema}/${category}/blob-${String(counter)}`;
      blobs.set(key, Buffer.from(blob));
      return key;
    },
    async get(key: string): Promise<Buffer | null> {
      return blobs.get(key) ?? null;
    },
    async delete(key: string): Promise<void> {
      blobs.delete(key);
    },
    async exists(key: string): Promise<boolean> {
      return blobs.has(key);
    },
  };
}

describe.skipIf(!process.env.DATABASE_URL)(
  "handleRecordingComplete (DB integration)",
  () => {
    const ORG_ID = crypto.randomUUID();

    let testDb: TestDb;
    let intakeQueueId: string;

    beforeAll(async () => {
      // @care-y/crypto needs WASM init before encryptContent runs inside
      // createEncryptedFollowUp (same pattern as webhook-integration.test.ts).
      const { getSodium } = await import("@care-y/crypto");
      await getSodium();

      testDb = await createTestDb();
      const q = await createTestQueue(testDb.db, { label: "Intake" });
      intakeQueueId = q.id;
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    /** Tenant DB factory that only serves the test schema; any other schema
     *  name is a wiring bug and fails the test loudly. */
    function strictGetTenantDb(schema: string): Kysely<TenantDatabase> {
      if (schema !== testDb.schemaName) {
        throw new TestSetupError(`unexpected tenant schema: ${schema}`);
      }
      return testDb.db;
    }

    function makeDbDeps(setup: {
      callTracker: CallTracker;
      blobStore?: BlobStore;
    }): RecordingHandlerDeps {
      return {
        provider: createMockProvider(),
        blobStore: setup.blobStore ?? createMemoryBlobStore(),
        jobQueue: createMockJobQueue(),
        callTracker: setup.callTracker,
        getTenantDb: strictGetTenantDb,
        intakeQueueId,
        orgSchema: testDb.schemaName,
        orgId: ORG_ID,
      };
    }

    it("fetches, encrypts, and stores the recording for a tracked ticket", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      const tracker = createCallTracker();
      tracker.track("CA_DB_HAPPY", {
        ticketId: fixture.ticketId,
        userId: null,
        direction: "inbound",
        orgSchema: testDb.schemaName,
        clientId: fixture.clientId,
        createdAt: Date.now(),
      });

      const rawAudio = Buffer.from("RIFF-fake-wav-audio-bytes-for-testing");
      const providerAudio = Buffer.from(rawAudio);
      const blobStore = createMemoryBlobStore();
      const dbDeps = makeDbDeps({ callTracker: tracker, blobStore });
      vi.mocked(dbDeps.provider.getRecording).mockResolvedValueOnce(
        providerAudio,
      );

      const result = await handleRecordingComplete(
        {
          RecordingSid: "RE_DB_HAPPY",
          CallSid: "CA_DB_HAPPY",
          RecordingDuration: "42",
        },
        dbDeps,
      );

      expect(result.ticketId).toBe(fixture.ticketId);
      expect(result.followUpId).not.toBeNull();

      // Follow-up row: voicemail from the client, content encrypted at rest.
      const followup = await testDb.db
        .selectFrom("followups")
        .selectAll()
        .where("id", "=", result.followUpId!)
        .executeTakeFirstOrThrow();
      expect(followup.ticket_id).toBe(fixture.ticketId);
      expect(followup.type).toBe("voicemail");
      expect(followup.source).toBe("client");
      expect(followup.encrypted_content.toString("utf-8")).not.toContain(
        "Voicemail recording",
      );

      // Recording row points at the stored blob with the reported duration.
      const recording = await testDb.db
        .selectFrom("recordings")
        .selectAll()
        .where("followup_id", "=", followup.id)
        .executeTakeFirstOrThrow();
      expect(recording.ticket_id).toBe(fixture.ticketId);
      expect(recording.duration_seconds).toBe(42);

      // The blob at rest is AEAD ciphertext, never the raw audio. Size
      // check: the stored format carries nonce + auth tag overhead on top
      // of the plaintext (storage format contract).
      const stored = blobStore.blobs.get(recording.blob_key);
      expect(stored).toBeDefined();
      expect(stored!.equals(rawAudio)).toBe(false);
      expect(stored!.length).toBeGreaterThan(rawAudio.length);

      // Module contract (see recording-handler.ts header): raw audio is
      // zeroed once encrypted, so plaintext audio does not outlive the
      // handler. Observable on the Buffer the provider handed over.
      expect(providerAudio.equals(Buffer.alloc(providerAudio.length))).toBe(
        true,
      );

      // Provider-side copies removed after successful storage (GAP-16 M3/M1).
      expect(dbDeps.provider.deleteRecording).toHaveBeenCalledWith(
        "RE_DB_HAPPY",
      );
      expect(dbDeps.provider.deleteCallLog).toHaveBeenCalledWith("CA_DB_HAPPY");
      expect(dbDeps.jobQueue.enqueue).not.toHaveBeenCalled();
    });

    it("creates a new intake ticket when the tracked call has a client but no ticket", async () => {
      const clientFixture = await createTestClientFixture(testDb.db);
      const tracker = createCallTracker();
      tracker.track("CA_DB_RESOLVE", {
        ticketId: "",
        userId: null,
        direction: "inbound",
        orgSchema: testDb.schemaName,
        clientId: clientFixture.clientId,
        createdAt: Date.now(),
      });
      const dbDeps = makeDbDeps({ callTracker: tracker });

      const result = await handleRecordingComplete(
        {
          RecordingSid: "RE_DB_RESOLVE",
          CallSid: "CA_DB_RESOLVE",
          RecordingDuration: "5",
        },
        dbDeps,
      );

      expect(result.ticketId).not.toBeNull();
      expect(result.followUpId).not.toBeNull();

      const ticket = await testDb.db
        .selectFrom("tickets")
        .selectAll()
        .where("id", "=", result.ticketId!)
        .executeTakeFirstOrThrow();
      expect(ticket.client_id).toBe(clientFixture.clientId);
      expect(ticket.queue_id).toBe(intakeQueueId);
      expect(ticket.status).toBe("open");

      const followup = await testDb.db
        .selectFrom("followups")
        .select(["type", "ticket_id"])
        .where("id", "=", result.followUpId!)
        .executeTakeFirstOrThrow();
      expect(followup.type).toBe("voicemail");
      expect(followup.ticket_id).toBe(result.ticketId);
    });

    it("attaches the voicemail to the client's existing open ticket instead of creating a duplicate", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      const tracker = createCallTracker();
      tracker.track("CA_DB_REUSE", {
        ticketId: "",
        userId: null,
        direction: "inbound",
        orgSchema: testDb.schemaName,
        clientId: fixture.clientId,
        createdAt: Date.now(),
      });
      const dbDeps = makeDbDeps({ callTracker: tracker });

      const result = await handleRecordingComplete(
        { RecordingSid: "RE_DB_REUSE", CallSid: "CA_DB_REUSE" },
        dbDeps,
      );

      // One ticket per client (ADR-018): the open ticket is reused.
      expect(result.ticketId).toBe(fixture.ticketId);
      const tickets = await testDb.db
        .selectFrom("tickets")
        .select("id")
        .where("client_id", "=", fixture.clientId)
        .execute();
      expect(tickets).toHaveLength(1);
    });

    it("falls back to the deps orgSchema when the tracked call carries none", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      const tracker = createCallTracker();
      tracker.track("CA_DB_SCHEMA_FALLBACK", {
        ticketId: fixture.ticketId,
        userId: null,
        direction: "inbound",
        orgSchema: "",
        clientId: fixture.clientId,
        createdAt: Date.now(),
      });
      // strictGetTenantDb throws for any schema other than the test schema,
      // so a created follow-up proves the fallback picked deps.orgSchema.
      const dbDeps = makeDbDeps({ callTracker: tracker });

      const result = await handleRecordingComplete(
        { RecordingSid: "RE_DB_FALLBACK", CallSid: "CA_DB_SCHEMA_FALLBACK" },
        dbDeps,
      );

      expect(result.followUpId).not.toBeNull();
    });

    it("leaves the provider recording untouched when blob storage fails", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      const tracker = createCallTracker();
      tracker.track("CA_DB_BLOB_FAIL", {
        ticketId: fixture.ticketId,
        userId: null,
        direction: "inbound",
        orgSchema: testDb.schemaName,
        clientId: fixture.clientId,
        createdAt: Date.now(),
      });

      const failingBlobStore: BlobStore = {
        ...createMemoryBlobStore(),
        put: () =>
          Promise.reject(new BlobStoreError("blob backend unavailable")),
      };
      const dbDeps = makeDbDeps({
        callTracker: tracker,
        blobStore: failingBlobStore,
      });

      await expect(
        handleRecordingComplete(
          { RecordingSid: "RE_DB_BLOB_FAIL", CallSid: "CA_DB_BLOB_FAIL" },
          dbDeps,
        ),
      ).rejects.toThrow(BlobStoreError);

      // Nothing persisted for the ticket and the provider copy survives,
      // so the provider's retried callback can attempt the store again.
      const followups = await testDb.db
        .selectFrom("followups")
        .select("id")
        .where("ticket_id", "=", fixture.ticketId)
        .execute();
      expect(followups).toHaveLength(0);
      expect(dbDeps.provider.deleteRecording).not.toHaveBeenCalled();
      expect(dbDeps.jobQueue.enqueue).not.toHaveBeenCalled();
    });
  },
);
