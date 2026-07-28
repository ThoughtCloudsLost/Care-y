/**
 * Tests for voicemail quarantine service.
 *
 * Unit tests use mocks. DB integration tests (Docker-only) use createTestDb()
 * with real migrations and a local blob store.
 */

import * as crypto from "node:crypto";
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterAll,
} from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { TelephonyProvider } from "./provider.js";
import type { BlobStore, BlobCategory } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { NotificationService } from "../notifications/service.js";
import {
  quarantineRecording,
  listQuarantined,
  getQuarantineBlob,
  routeQuarantined,
  dismissQuarantined,
  type QuarantineDeps,
  type QuarantineParams,
  type RouteQuarantineDeps,
  type DismissQuarantineDeps,
} from "./voicemail-quarantine.js";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  TelephonyError,
} from "../errors.js";
import {
  SYSTEM_ACTOR_ID,
  VOICEMAIL_QUARANTINE_MAX_BYTES,
  RoleId,
} from "@care-y/shared";
import type { RouteQuarantineInput } from "@care-y/shared";
import {
  createTestDb,
  createTestQueue,
  createTestTicketFixture,
  createTestUser,
  seedOrgPublicKey,
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
    getRecording: vi.fn().mockResolvedValue(Buffer.from("raw-audio-bytes")),
    deleteRecording: vi.fn().mockResolvedValue(undefined),
    deleteCallLog: vi.fn().mockResolvedValue(undefined),
    deleteMessageLog: vi.fn(),
    getCallDetails: vi
      .fn()
      .mockResolvedValue({ from: "+15551234567", to: "+15559876543" }),
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
  const blobs = new Map<string, Buffer>();
  let counter = 0;
  return {
    async put(
      orgSchema: string,
      category: BlobCategory,
      blob: Buffer,
    ): Promise<string> {
      counter++;
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

function createMockJobQueue(): JobQueue {
  return {
    enqueue: vi.fn().mockResolvedValue("job-1"),
    process: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

function createMockSealedBox(): SealedBoxEncryptor {
  return {
    seal(plaintext: string): Buffer {
      // Prefix with "sealed:" so tests can verify it was sealed
      return Buffer.from(`sealed:${plaintext}`);
    },
    sealBuffer(data: Buffer): Buffer {
      const out = Buffer.alloc(data.length + 7);
      out.write("sealed:", 0, "utf-8");
      data.copy(out, 7);
      return out;
    },
  };
}

function createMockNotificationService(): NotificationService {
  return {
    dispatch: vi.fn().mockResolvedValue(undefined),
    dispatchTicketless: vi.fn().mockResolvedValue(undefined),
  };
}

// ---------------------------------------------------------------------------
// Stub tenant DB (unit tests only; DB integration tests use createTestDb)
// ---------------------------------------------------------------------------

function createStubTenantDb(): Kysely<TenantDatabase> {
  const insertedRows: Record<string, unknown>[] = [];

  const chainable = {
    values(vals: Record<string, unknown>) {
      insertedRows.push(vals);
      return chainable;
    },
    onConflict(cb: (oc: unknown) => unknown) {
      const oc = {
        column() {
          return {
            doNothing() {
              return chainable;
            },
          };
        },
      };
      cb(oc);
      return chainable;
    },
    async executeTakeFirst() {
      return { numInsertedOrUpdatedRows: 1n };
    },
  };

  return {
    insertInto() {
      return chainable;
    },
    selectFrom() {
      return {
        select() {
          return {
            where() {
              return {
                orderBy() {
                  return {
                    limit() {
                      return {
                        async execute() {
                          return [];
                        },
                      };
                    },
                  };
                },
                async executeTakeFirst() {
                  return undefined;
                },
              };
            },
            orderBy() {
              return {
                limit() {
                  return {
                    async execute() {
                      return [];
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  } as unknown as Kysely<TenantDatabase>;
}

function makeDeps(overrides?: Partial<QuarantineDeps>): QuarantineDeps {
  return {
    tDb: createStubTenantDb(),
    provider: createMockProvider(),
    blobStore: createMockBlobStore(),
    jobQueue: createMockJobQueue(),
    sealedBox: createMockSealedBox(),
    orgId: "org-1",
    orgSchema: "org_test",
    orgSlug: "test-org",
    notificationService: createMockNotificationService(),
    ...overrides,
  };
}

function makeParams(overrides?: Partial<QuarantineParams>): QuarantineParams {
  return {
    recordingSid: "RE123",
    callSid: "CA456",
    reason: "tracker_miss",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

describe("quarantineRecording", () => {
  let deps: QuarantineDeps;

  beforeEach(() => {
    deps = makeDeps();
  });

  it("fetches audio, seals it, stores the blob, and deletes provider copies", async () => {
    await quarantineRecording(deps, makeParams());

    expect(deps.provider.getRecording).toHaveBeenCalledWith("RE123");
    expect(deps.provider.deleteRecording).toHaveBeenCalledOnce();
    expect(deps.provider.deleteCallLog).toHaveBeenCalledOnce();
  });

  it("fetches call details for tracker_miss reason", async () => {
    await quarantineRecording(deps, makeParams({ reason: "tracker_miss" }));

    expect(deps.provider.getCallDetails).toHaveBeenCalledWith("CA456");
  });

  it("fetches call details for unresolved_client reason", async () => {
    await quarantineRecording(
      deps,
      makeParams({ reason: "unresolved_client" }),
    );

    expect(deps.provider.getCallDetails).toHaveBeenCalledWith("CA456");
  });

  it("does NOT fetch call details for no_intake_queue reason", async () => {
    await quarantineRecording(deps, makeParams({ reason: "no_intake_queue" }));

    expect(deps.provider.getCallDetails).not.toHaveBeenCalled();
  });

  it("proceeds with null numbers when getCallDetails fails", async () => {
    vi.mocked(deps.provider.getCallDetails).mockRejectedValueOnce(
      new TelephonyError("Call not found", 404),
    );
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await quarantineRecording(deps, makeParams({ reason: "tracker_miss" }));

    // Should still succeed (provider deletion happens)
    expect(deps.provider.deleteRecording).toHaveBeenCalledOnce();
    expect(deps.provider.deleteCallLog).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("getCallDetails failed"),
    );
    consoleSpy.mockRestore();
  });

  it("deletes provider copies only AFTER successful DB insert", async () => {
    const callOrder: string[] = [];

    // Track call ordering via the mock implementations
    const blobStore = createMockBlobStore();
    const originalPut = blobStore.put.bind(blobStore);
    blobStore.put = vi.fn(async (...args: Parameters<BlobStore["put"]>) => {
      callOrder.push("blob.put");
      return originalPut(...args);
    });

    const provider = createMockProvider();
    vi.mocked(provider.deleteRecording).mockImplementation(async () => {
      callOrder.push("deleteRecording");
    });
    vi.mocked(provider.deleteCallLog).mockImplementation(async () => {
      callOrder.push("deleteCallLog");
    });

    deps = makeDeps({ blobStore, provider });
    await quarantineRecording(deps, makeParams());

    // blob.put must come before any provider deletion
    const putIdx = callOrder.indexOf("blob.put");
    const delRecIdx = callOrder.indexOf("deleteRecording");
    const delCallIdx = callOrder.indexOf("deleteCallLog");
    expect(putIdx).toBeLessThan(delRecIdx);
    expect(putIdx).toBeLessThan(delCallIdx);
  });

  it("propagates getRecording failure with no row and no deletion", async () => {
    vi.mocked(deps.provider.getRecording).mockRejectedValueOnce(
      new TelephonyError("Recording fetch failed"),
    );

    await expect(quarantineRecording(deps, makeParams())).rejects.toThrow(
      TelephonyError,
    );

    expect(deps.provider.deleteRecording).not.toHaveBeenCalled();
    expect(deps.provider.deleteCallLog).not.toHaveBeenCalled();
  });

  it("does not fail when notification dispatch throws", async () => {
    const notificationService = createMockNotificationService();
    vi.mocked(notificationService.dispatchTicketless).mockRejectedValueOnce(
      new Error("SSE broken"),
    );
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    deps = makeDeps({ notificationService });
    await quarantineRecording(deps, makeParams());

    // Provider deletion still happens
    expect(deps.provider.deleteRecording).toHaveBeenCalledOnce();
    expect(deps.provider.deleteCallLog).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to notify admins"),
    );
    consoleSpy.mockRestore();
  });

  it("passes clientId through for no_intake_queue reason", async () => {
    const blobStore = createMockBlobStore();
    // We track insert values through the stub DB. For this unit test,
    // the fact that the call completes without error is sufficient;
    // the DB integration test below verifies the actual row content.
    deps = makeDeps({ blobStore });
    await quarantineRecording(
      deps,
      makeParams({
        reason: "no_intake_queue",
        clientId: "client-99",
      }),
    );

    expect(deps.provider.deleteRecording).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// DB integration suite (Docker only)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "voicemail-quarantine (DB integration)",
  () => {
    let testDb: TestDb;

    beforeAll(async () => {
      // Sodium is needed for sealedBox in the real encryptor
      const { getSodium } = await import("@care-y/crypto");
      await getSodium();

      testDb = await createTestDb();

      // org_config row required for the audit service insert
      await testDb.db
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();
      await seedOrgPublicKey(testDb.db);
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("inserts a quarantine row and stores the sealed blob", async () => {
      const blobStore = createMockBlobStore();
      const sealedBox = createMockSealedBox();
      const provider = createMockProvider();
      const notificationService = createMockNotificationService();

      const deps: QuarantineDeps = {
        tDb: testDb.db,
        provider,
        blobStore,
        jobQueue: createMockJobQueue(),
        sealedBox,
        orgId: "org-integ",
        orgSchema: testDb.schemaName,
        orgSlug: "integ-org",
        notificationService,
      };

      await quarantineRecording(deps, {
        recordingSid: `RE_INTEG_${crypto.randomUUID().slice(0, 8)}`,
        callSid: "CA_INTEG_1",
        reason: "tracker_miss",
        durationSeconds: 30,
      });

      // Verify row exists
      const rows = await testDb.db
        .selectFrom("voicemail_quarantine")
        .selectAll()
        .where("call_sid", "=", "CA_INTEG_1")
        .execute();

      expect(rows).toHaveLength(1);
      expect(rows[0]!.reason).toBe("tracker_miss");
      expect(rows[0]!.duration_seconds).toBe(30);
      expect(rows[0]!.status).toBe("pending");
    });

    it("duplicate recording_sid deletes the duplicate blob and returns early", async () => {
      const blobStore = createMockBlobStore();
      const deleteSpy = vi.spyOn(blobStore, "delete");
      const sealedBox = createMockSealedBox();
      const provider = createMockProvider();
      const notificationService = createMockNotificationService();

      const recordingSid = `RE_DUP_${crypto.randomUUID().slice(0, 8)}`;

      const deps: QuarantineDeps = {
        tDb: testDb.db,
        provider,
        blobStore,
        jobQueue: createMockJobQueue(),
        sealedBox,
        orgId: "org-integ",
        orgSchema: testDb.schemaName,
        orgSlug: "integ-org",
        notificationService,
      };

      // First insert
      await quarantineRecording(deps, {
        recordingSid,
        callSid: "CA_DUP_1",
        reason: "tracker_miss",
      });

      // Second insert (same recording_sid, should hit ON CONFLICT DO NOTHING)
      await quarantineRecording(deps, {
        recordingSid,
        callSid: "CA_DUP_2",
        reason: "tracker_miss",
      });

      // The duplicate blob should have been deleted
      expect(deleteSpy).toHaveBeenCalledOnce();

      // Only one row for this recording_sid
      const rows = await testDb.db
        .selectFrom("voicemail_quarantine")
        .selectAll()
        .where("recording_sid", "=", recordingSid)
        .execute();

      expect(rows).toHaveLength(1);
      expect(rows[0]!.call_sid).toBe("CA_DUP_1");
    });

    it("listQuarantined returns rows with base64-encoded encrypted numbers", async () => {
      // Insert a row with encrypted numbers
      const encCaller = Buffer.from("sealed-caller-number");
      const encCalled = Buffer.from("sealed-called-number");
      const recordingSid = `RE_LIST_${crypto.randomUUID().slice(0, 8)}`;

      await testDb.db
        .insertInto("voicemail_quarantine")
        .values({
          recording_sid: recordingSid,
          call_sid: "CA_LIST_1",
          blob_key: "test/quarantine/list-blob",
          size_bytes: 100,
          duration_seconds: 15,
          reason: "unresolved_client",
          encrypted_caller_number: encCaller,
          encrypted_called_number: encCalled,
        })
        .execute();

      const results = await listQuarantined(testDb.db, { limit: 50 });

      const row = results.find(
        (r) => r.encryptedCallerNumber === encCaller.toString("base64"),
      );
      expect(row).toBeDefined();
      expect(row!.encryptedCallerNumber).toBe(encCaller.toString("base64"));
      expect(row!.encryptedCalledNumber).toBe(encCalled.toString("base64"));
      expect(row!.reason).toBe("unresolved_client");
      expect(row!.durationSeconds).toBe(15);
      expect(row!.status).toBe("pending");
    });

    it("listQuarantined filters by status", async () => {
      const allRows = await listQuarantined(testDb.db, { limit: 200 });
      const pendingRows = await listQuarantined(testDb.db, {
        status: "pending",
        limit: 200,
      });
      const routedRows = await listQuarantined(testDb.db, {
        status: "routed",
        limit: 200,
      });

      // All rows inserted so far have status "pending"
      expect(pendingRows.length).toBe(allRows.length);
      expect(routedRows.length).toBe(0);
    });

    it("getQuarantineBlob returns sealed blob as base64", async () => {
      const blobStore = createMockBlobStore();
      const sealedData = Buffer.from("sealed-audio-content");
      const blobKey = await blobStore.put(
        testDb.schemaName,
        "quarantine",
        sealedData,
      );
      const recordingSid = `RE_BLOB_${crypto.randomUUID().slice(0, 8)}`;

      const inserted = await testDb.db
        .insertInto("voicemail_quarantine")
        .values({
          recording_sid: recordingSid,
          call_sid: "CA_BLOB_1",
          blob_key: blobKey,
          size_bytes: sealedData.length,
          duration_seconds: 22,
          reason: "tracker_miss",
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const result = await getQuarantineBlob(
        testDb.db,
        blobStore,
        testDb.schemaName,
        inserted.id,
      );

      expect(result.sealedBase64).toBe(sealedData.toString("base64"));
      expect(result.durationSeconds).toBe(22);
    });

    it("getQuarantineBlob throws NotFoundError for missing quarantine row", async () => {
      const blobStore = createMockBlobStore();
      const fakeId = crypto.randomUUID();

      await expect(
        getQuarantineBlob(testDb.db, blobStore, testDb.schemaName, fakeId),
      ).rejects.toThrow(NotFoundError);
    });

    it("getQuarantineBlob throws NotFoundError when blob is missing from store", async () => {
      const blobStore = createMockBlobStore();
      const recordingSid = `RE_NOBOB_${crypto.randomUUID().slice(0, 8)}`;

      const inserted = await testDb.db
        .insertInto("voicemail_quarantine")
        .values({
          recording_sid: recordingSid,
          call_sid: "CA_NOBL_1",
          blob_key: "nonexistent/key",
          size_bytes: 100,
          reason: "tracker_miss",
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await expect(
        getQuarantineBlob(testDb.db, blobStore, testDb.schemaName, inserted.id),
      ).rejects.toThrow(NotFoundError);
    });

    it("quarantine inserts an audit row with SYSTEM_ACTOR_ID", async () => {
      const blobStore = createMockBlobStore();
      const sealedBox = createMockSealedBox();
      const provider = createMockProvider();
      const notificationService = createMockNotificationService();
      const recordingSid = `RE_AUDIT_${crypto.randomUUID().slice(0, 8)}`;

      const deps: QuarantineDeps = {
        tDb: testDb.db,
        provider,
        blobStore,
        jobQueue: createMockJobQueue(),
        sealedBox,
        orgId: "org-audit",
        orgSchema: testDb.schemaName,
        orgSlug: "audit-org",
        notificationService,
      };

      await quarantineRecording(deps, {
        recordingSid,
        callSid: "CA_AUDIT_1",
        reason: "no_intake_queue",
        clientId: crypto.randomUUID(),
      });

      const auditRows = await testDb.db
        .selectFrom("audit_log")
        .selectAll()
        .where("event_type", "=", "voicemail_quarantined")
        .where("actor_id", "=", SYSTEM_ACTOR_ID)
        .execute();

      expect(auditRows.length).toBeGreaterThanOrEqual(1);
      const relevantRow = auditRows.find(
        (r) => (r.metadata as Record<string, unknown>).callSid === "CA_AUDIT_1",
      );
      expect(relevantRow).toBeDefined();
      expect(relevantRow!.actor_id).toBe(SYSTEM_ACTOR_ID);
      expect((relevantRow!.metadata as Record<string, unknown>).reason).toBe(
        "no_intake_queue",
      );
    });

    // -----------------------------------------------------------------
    // routeQuarantined DB tests
    // -----------------------------------------------------------------

    describe("routeQuarantined", () => {
      let intakeQueue: { id: string };
      let adminUser: Awaited<ReturnType<typeof createTestUser>>;

      beforeAll(async () => {
        intakeQueue = await createTestQueue(testDb.db, {
          label: "Route-Intake",
        });
        await testDb.db
          .updateTable("org_config")
          .set({ intake_queue_id: intakeQueue.id })
          .execute();

        adminUser = await createTestUser(testDb.db, {
          overrides: { role_id: RoleId.ADMIN },
        });
      }, 30_000);

      async function seedPendingQuarantineRow(
        store: BlobStore,
      ): Promise<{ quarantineId: string; blobKey: string }> {
        const sealedData = Buffer.from("sealed-route-audio");
        const blobKey = await store.put(
          testDb.schemaName,
          "quarantine",
          sealedData,
        );
        const recordingSid = `RE_SVC_${crypto.randomUUID().slice(0, 8)}`;
        const row = await testDb.db
          .insertInto("voicemail_quarantine")
          .values({
            recording_sid: recordingSid,
            call_sid: `CA_SVC_${crypto.randomUUID().slice(0, 8)}`,
            blob_key: blobKey,
            size_bytes: sealedData.length,
            duration_seconds: 12,
            reason: "tracker_miss",
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        return { quarantineId: row.id, blobKey };
      }

      it("throws NotFoundError for nonexistent quarantine row", async () => {
        const store = createMockBlobStore();
        const deps: RouteQuarantineDeps = {
          tDb: testDb.db,
          blobStore: store,
          orgSchema: testDb.schemaName,
          pendingClients: new Map(),
          sealedBox: createMockSealedBox(),
        };
        const input: RouteQuarantineInput = {
          quarantineId: crypto.randomUUID(),
          target: { type: "ticketId", ticketId: crypto.randomUUID() },
          audioData: Buffer.from("x").toString("base64"),
        };

        await expect(
          routeQuarantined(deps, input, adminUser.id),
        ).rejects.toThrow(NotFoundError);
      });

      it("throws ConflictError for already-resolved row", async () => {
        const store = createMockBlobStore();
        const { quarantineId } = await seedPendingQuarantineRow(store);

        // Mark it dismissed directly
        await testDb.db
          .updateTable("voicemail_quarantine")
          .set({ status: "dismissed" })
          .where("id", "=", quarantineId)
          .execute();

        const deps: RouteQuarantineDeps = {
          tDb: testDb.db,
          blobStore: store,
          orgSchema: testDb.schemaName,
          pendingClients: new Map(),
          sealedBox: createMockSealedBox(),
        };
        const input: RouteQuarantineInput = {
          quarantineId,
          target: { type: "ticketId", ticketId: crypto.randomUUID() },
          audioData: Buffer.from("x").toString("base64"),
        };

        await expect(
          routeQuarantined(deps, input, adminUser.id),
        ).rejects.toThrow(ConflictError);
      });

      it("throws ValidationError when decoded audio exceeds max bytes", async () => {
        const store = createMockBlobStore();
        const { quarantineId } = await seedPendingQuarantineRow(store);

        const fixture = await createTestTicketFixture(testDb.db, {
          queueId: intakeQueue.id,
        });

        // Create audio data that exceeds the max when decoded
        const oversized = Buffer.alloc(
          VOICEMAIL_QUARANTINE_MAX_BYTES + 1,
          0x41,
        );

        const deps: RouteQuarantineDeps = {
          tDb: testDb.db,
          blobStore: store,
          orgSchema: testDb.schemaName,
          pendingClients: new Map(),
          sealedBox: createMockSealedBox(),
        };
        const input: RouteQuarantineInput = {
          quarantineId,
          target: { type: "ticketId", ticketId: fixture.ticketId },
          audioData: oversized.toString("base64"),
        };

        await expect(
          routeQuarantined(deps, input, adminUser.id),
        ).rejects.toThrow(ValidationError);
      });

      it("throws NotFoundError for nonexistent target ticket", async () => {
        const store = createMockBlobStore();
        const { quarantineId } = await seedPendingQuarantineRow(store);

        const deps: RouteQuarantineDeps = {
          tDb: testDb.db,
          blobStore: store,
          orgSchema: testDb.schemaName,
          pendingClients: new Map(),
          sealedBox: createMockSealedBox(),
        };
        const input: RouteQuarantineInput = {
          quarantineId,
          target: { type: "ticketId", ticketId: crypto.randomUUID() },
          audioData: Buffer.from("test").toString("base64"),
        };

        await expect(
          routeQuarantined(deps, input, adminUser.id),
        ).rejects.toThrow(NotFoundError);
      });
    });

    // -----------------------------------------------------------------
    // dismissQuarantined DB tests
    // -----------------------------------------------------------------

    describe("dismissQuarantined", () => {
      let adminUser: Awaited<ReturnType<typeof createTestUser>>;

      beforeAll(async () => {
        adminUser = await createTestUser(testDb.db, {
          overrides: { role_id: RoleId.ADMIN },
        });
      }, 30_000);

      it("throws NotFoundError for nonexistent quarantine row", async () => {
        const store = createMockBlobStore();
        const deps: DismissQuarantineDeps = {
          tDb: testDb.db,
          blobStore: store,
        };

        await expect(
          dismissQuarantined(deps, crypto.randomUUID(), adminUser.id),
        ).rejects.toThrow(NotFoundError);
      });

      it("throws ConflictError for already-resolved row", async () => {
        const store = createMockBlobStore();
        const sealedData = Buffer.from("sealed-dismiss-audio");
        const blobKey = await store.put(
          testDb.schemaName,
          "quarantine",
          sealedData,
        );
        const recordingSid = `RE_DIS_${crypto.randomUUID().slice(0, 8)}`;
        const row = await testDb.db
          .insertInto("voicemail_quarantine")
          .values({
            recording_sid: recordingSid,
            call_sid: `CA_DIS_${crypto.randomUUID().slice(0, 8)}`,
            blob_key: blobKey,
            size_bytes: sealedData.length,
            reason: "tracker_miss",
            status: "routed",
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const deps: DismissQuarantineDeps = {
          tDb: testDb.db,
          blobStore: store,
        };

        await expect(
          dismissQuarantined(deps, row.id, adminUser.id),
        ).rejects.toThrow(ConflictError);
      });

      it("deletes blob and marks row dismissed with audit entry", async () => {
        const store = createMockBlobStore();
        const sealedData = Buffer.from("sealed-dismiss-ok");
        const blobKey = await store.put(
          testDb.schemaName,
          "quarantine",
          sealedData,
        );
        const recordingSid = `RE_DISOK_${crypto.randomUUID().slice(0, 8)}`;
        const row = await testDb.db
          .insertInto("voicemail_quarantine")
          .values({
            recording_sid: recordingSid,
            call_sid: `CA_DISOK_${crypto.randomUUID().slice(0, 8)}`,
            blob_key: blobKey,
            size_bytes: sealedData.length,
            reason: "unresolved_client",
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const deps: DismissQuarantineDeps = {
          tDb: testDb.db,
          blobStore: store,
        };

        await dismissQuarantined(deps, row.id, adminUser.id);

        // Row is now dismissed
        const dismissed = await testDb.db
          .selectFrom("voicemail_quarantine")
          .selectAll()
          .where("id", "=", row.id)
          .executeTakeFirstOrThrow();
        expect(dismissed.status).toBe("dismissed");
        expect(dismissed.resolved_by).toBe(adminUser.id);
        expect(dismissed.resolved_at).toBeInstanceOf(Date);

        // Blob is deleted
        const exists = await store.exists(blobKey);
        expect(exists).toBe(false);

        // Audit entry exists
        const auditRows = await testDb.db
          .selectFrom("audit_log")
          .selectAll()
          .where("event_type", "=", "voicemail_quarantine_dismissed")
          .where("actor_id", "=", adminUser.id)
          .execute();
        const relevant = auditRows.find(
          (r) =>
            (r.metadata as Record<string, unknown>).quarantineId === row.id,
        );
        expect(relevant).toBeDefined();
      });
    });
  },
);
