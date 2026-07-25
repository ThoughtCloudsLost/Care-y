/**
 * Tests for webhook dispatch callbacks (org resolution + event fanout).
 *
 * Scope: what webhook-dispatch.ts owns. Signature validation, replay
 * protection, rate limiting, and SID dedup are owned by routes/webhooks.ts
 * (tested in webhooks.test.ts and webhook-integration.test.ts). The inbound
 * SMS happy path through this dispatch is covered end to end in
 * webhook-integration.test.ts and is not duplicated here.
 *
 * Unit tests cover the guard branches that return before any tenant DB is
 * opened. Everything after org resolution reads a real org_config row, so
 * those paths run as DB integration tests (describe.skipIf, Docker only).
 */

import * as crypto from "node:crypto";
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createWebhookDispatch,
  resolveOrgForWebhook,
  type WebhookDispatchDeps,
} from "./webhook-dispatch.js";
import type { WebhookDispatch } from "../routes/webhooks.js";
import { createCallTracker, type CallTracker } from "./call-tracker.js";
import type { TelephonyProvider } from "./provider.js";
import type { ProviderFactory } from "./factory.js";
import type { OrgRecord, OrgService } from "../org/service.js";
import type { BlobCategory, BlobStore } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import { TelephonyError } from "../errors.js";
import {
  createMockTelephonyProvider,
  createTestDb,
  createTestQueue,
  createTestTicketFixture,
  seedOrgPublicKey,
  testBlindIndexer,
  testUnseal,
  TestSetupError,
  type TestDb,
} from "../test-utils.js";

// ---------------------------------------------------------------------------
// Local helpers
// ---------------------------------------------------------------------------

const WEBHOOK_BASE_URL = "https://api.example.test";

function stubOrgService(orgs: ReadonlyMap<string, OrgRecord>): OrgService {
  return {
    async createOrg(): Promise<never> {
      throw new TestSetupError("createOrg is not expected in webhook dispatch");
    },
    async findBySlug(): Promise<OrgRecord | null> {
      return null;
    },
    async findById(id: string): Promise<OrgRecord | null> {
      return orgs.get(id) ?? null;
    },
    async validateSetupToken(): Promise<boolean> {
      return false;
    },
    async consumeSetupToken(): Promise<void> {
      // no-op in tests
    },
  };
}

/**
 * Provider factory that throws when no provider was expected. A passing
 * test with the strict variant proves the dispatch never consulted the
 * telephony provider for that input.
 */
function stubProviderFactory(provider?: TelephonyProvider): ProviderFactory {
  return {
    async getProvider(): Promise<TelephonyProvider> {
      if (!provider) {
        throw new TestSetupError(
          "provider factory must not be consulted for this input",
        );
      }
      return provider;
    },
    invalidate(): void {
      // no-op
    },
    invalidateAll(): void {
      // no-op
    },
  };
}

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

function createMockJobQueue(): JobQueue {
  return {
    enqueue: vi.fn().mockResolvedValue("job-1"),
    process: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

/** Tenant DB factory that fails the test if any schema is opened. */
function rejectAllTenantDb(): (schema: string) => Kysely<TenantDatabase> {
  return () => {
    throw new TestSetupError("tenant DB must not be opened for this input");
  };
}

// ---------------------------------------------------------------------------
// Unit tests: guard branches that return before any tenant DB access
// ---------------------------------------------------------------------------

describe("webhook-dispatch (unit)", () => {
  const UNKNOWN_ORG_ID = crypto.randomUUID();
  const INACTIVE_ORG_ID = crypto.randomUUID();

  const inactiveOrg: OrgRecord = {
    id: INACTIVE_ORG_ID,
    slug: "inactive-org",
    schemaName: "org_inactive",
    isActive: false,
  };

  function makeUnitDeps(callTracker?: CallTracker): WebhookDispatchDeps {
    return {
      orgService: stubOrgService(new Map([[INACTIVE_ORG_ID, inactiveOrg]])),
      tenantDb: rejectAllTenantDb(),
      providerFactory: stubProviderFactory(),
      indexer: testBlindIndexer,
      blobStore: createMemoryBlobStore(),
      jobQueue: createMockJobQueue(),
      webhookBaseUrl: WEBHOOK_BASE_URL,
      callTracker: callTracker ?? createCallTracker(),
      notificationService: {
        dispatch: vi.fn().mockResolvedValue(undefined),
        dispatchTicketless: vi.fn().mockResolvedValue(undefined),
      },
    };
  }

  describe("resolveOrgForWebhook", () => {
    it("returns null for an unknown org without opening a tenant DB", async () => {
      const deps = makeUnitDeps();
      await expect(
        resolveOrgForWebhook(UNKNOWN_ORG_ID, deps.orgService, deps.tenantDb),
      ).resolves.toBeNull();
    });

    it("returns null for an inactive org without opening a tenant DB", async () => {
      const deps = makeUnitDeps();
      await expect(
        resolveOrgForWebhook(INACTIVE_ORG_ID, deps.orgService, deps.tenantDb),
      ).resolves.toBeNull();
    });
  });

  describe("dispatch shape", () => {
    it("always provides onStatusCallback", () => {
      const dispatch = createWebhookDispatch(makeUnitDeps());
      expect(dispatch.onInboundSms).toBeDefined();
      expect(dispatch.onInboundVoice).toBeDefined();
      expect(dispatch.onStatusCallback).toBeDefined();
    });
  });

  describe("unknown org guards", () => {
    // The strict deps throw TestSetupError on any provider or tenant DB
    // access, so a clean null/undefined result proves the callbacks bail
    // out before touching anything.

    it("onInboundSms returns null (no TwiML) for an unknown org", async () => {
      const dispatch = createWebhookDispatch(makeUnitDeps());
      await expect(
        dispatch.onInboundSms!(UNKNOWN_ORG_ID, { MessageSid: "SM_UNKNOWN" }),
      ).resolves.toBeNull();
    });

    it("onInboundVoice returns null for an unknown org", async () => {
      const dispatch = createWebhookDispatch(makeUnitDeps());
      await expect(
        dispatch.onInboundVoice!(UNKNOWN_ORG_ID, { CallSid: "CA_UNKNOWN" }),
      ).resolves.toBeNull();
    });

    it("onInboundVoice returns null for an inactive org", async () => {
      const dispatch = createWebhookDispatch(makeUnitDeps());
      await expect(
        dispatch.onInboundVoice!(INACTIVE_ORG_ID, { CallSid: "CA_INACTIVE" }),
      ).resolves.toBeNull();
    });

    it("onStatusCallback resolves without side effects for an unknown org", async () => {
      const dispatch = createWebhookDispatch(makeUnitDeps(createCallTracker()));
      await expect(
        dispatch.onStatusCallback!(UNKNOWN_ORG_ID, {
          CallSid: "CA_UNKNOWN",
          CallStatus: "completed",
        }),
      ).resolves.toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// DB integration: org resolution against real org_config rows plus the
// voice, recording, and status fanout downstream of it (Docker only)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "webhook-dispatch (DB integration)",
  () => {
    const ORG_FULL_ID = crypto.randomUUID();
    const ORG_NO_KEY_ID = crypto.randomUUID();
    const ORG_NO_INTAKE_ID = crypto.randomUUID();

    let dbFull: TestDb;
    let dbNoKey: TestDb;
    let dbNoIntake: TestDb;
    let intakeQueueId: string;
    let orgService: OrgService;
    let tenantDbFactory: (schema: string) => Kysely<TenantDatabase>;

    beforeAll(async () => {
      // @care-y/crypto needs WASM init before encryptContent runs in the
      // recording pipeline (same pattern as webhook-integration.test.ts).
      const { getSodium } = await import("@care-y/crypto");
      await getSodium();

      // Fully configured org: public key + intake queue.
      dbFull = await createTestDb();
      const intakeQueue = await createTestQueue(dbFull.db, { label: "Intake" });
      intakeQueueId = intakeQueue.id;
      await dbFull.db
        .insertInto("org_config")
        .values({ pii_retention_days: null, intake_queue_id: intakeQueueId })
        .execute();
      await seedOrgPublicKey(dbFull.db);

      // Org whose onboarding never uploaded a public key.
      dbNoKey = await createTestDb();
      await dbNoKey.db
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .execute();

      // Org with a key but no intake queue configured.
      dbNoIntake = await createTestDb();
      await seedOrgPublicKey(dbNoIntake.db);

      orgService = stubOrgService(
        new Map<string, OrgRecord>([
          [
            ORG_FULL_ID,
            {
              id: ORG_FULL_ID,
              slug: "dispatch-full",
              schemaName: dbFull.schemaName,
              isActive: true,
            },
          ],
          [
            ORG_NO_KEY_ID,
            {
              id: ORG_NO_KEY_ID,
              slug: "dispatch-no-key",
              schemaName: dbNoKey.schemaName,
              isActive: true,
            },
          ],
          [
            ORG_NO_INTAKE_ID,
            {
              id: ORG_NO_INTAKE_ID,
              slug: "dispatch-no-intake",
              schemaName: dbNoIntake.schemaName,
              isActive: true,
            },
          ],
        ]),
      );

      // All three schemas live in the same database, so one pool serves any
      // of them via withSchema (same pattern as webhook-integration.test.ts).
      tenantDbFactory = (schema: string): Kysely<TenantDatabase> =>
        dbFull.platformDb.withSchema(
          schema,
        ) as unknown as Kysely<TenantDatabase>;
    }, 30_000);

    afterAll(async () => {
      await dbNoKey.cleanup();
      await dbNoIntake.cleanup();
      await dbFull.cleanup();
    });

    interface DispatchSetup {
      readonly provider?: TelephonyProvider;
      readonly callTracker?: CallTracker;
      readonly blobStore?: BlobStore;
      readonly jobQueue?: JobQueue;
    }

    function makeDispatch(setup?: DispatchSetup): WebhookDispatch {
      return createWebhookDispatch({
        orgService,
        tenantDb: tenantDbFactory,
        providerFactory: stubProviderFactory(setup?.provider),
        indexer: testBlindIndexer,
        blobStore: setup?.blobStore ?? createMemoryBlobStore(),
        jobQueue: setup?.jobQueue ?? createMockJobQueue(),
        webhookBaseUrl: WEBHOOK_BASE_URL,
        callTracker: setup?.callTracker ?? createCallTracker(),
        notificationService: {
          dispatch: vi.fn().mockResolvedValue(undefined),
          dispatchTicketless: vi.fn().mockResolvedValue(undefined),
        },
      });
    }

    const VOICE_XML = "<Response><Gather/></Response>";

    /**
     * Provider stub for voice tests: parses Twilio-shaped bodies and renders
     * a canned document. Everything not overridden stays strict (throws), so
     * a passing test proves no other provider method was reached.
     */
    function voiceProvider(
      overrides?: Partial<TelephonyProvider>,
    ): TelephonyProvider {
      return {
        ...createMockTelephonyProvider(),
        parseIncomingCall: (body: Record<string, string>) => ({
          callId: body.CallSid ?? "CA_MISSING",
          from: body.From ?? "+15550000000",
          to: body.To ?? "+15550000001",
          direction: "inbound" as const,
        }),
        generateVoiceResponse: () => VOICE_XML,
        ...overrides,
      };
    }

    describe("resolveOrgForWebhook", () => {
      it("resolves an active org into a working sealed-box context", async () => {
        const ctx = await resolveOrgForWebhook(
          ORG_FULL_ID,
          orgService,
          tenantDbFactory,
        );

        expect(ctx).not.toBeNull();
        expect(ctx!.orgId).toBe(ORG_FULL_ID);
        expect(ctx!.orgSchema).toBe(dbFull.schemaName);
        expect(ctx!.intakeQueueId).toBe(intakeQueueId);
        // The encryptor must seal against the org's stored public key: the
        // test org keypair can open the result.
        expect(testUnseal(ctx!.sealedBox.seal("org-context-probe"))).toBe(
          "org-context-probe",
        );
      });

      it("returns null when the org has no public key uploaded", async () => {
        await expect(
          resolveOrgForWebhook(ORG_NO_KEY_ID, orgService, tenantDbFactory),
        ).resolves.toBeNull();
      });

      it("resolves a null intake queue when none is configured", async () => {
        const ctx = await resolveOrgForWebhook(
          ORG_NO_INTAKE_ID,
          orgService,
          tenantDbFactory,
        );

        expect(ctx).not.toBeNull();
        expect(ctx!.intakeQueueId).toBeNull();
      });
    });

    describe("onInboundSms", () => {
      it("returns null without consulting the provider when the org has no intake queue", async () => {
        // Strict factory: consulting the provider would throw TestSetupError.
        const dispatch = makeDispatch();
        await expect(
          dispatch.onInboundSms!(ORG_NO_INTAKE_ID, {
            MessageSid: "SM_NO_INTAKE",
            From: "+15550000031",
            To: "+15550000032",
            Body: "hello",
          }),
        ).resolves.toBeNull();
      });

      it("propagates provider parse failures instead of swallowing them", async () => {
        // Contract: a dispatch failure must reach routes/webhooks.ts, which
        // answers 500 WITHOUT marking the SID processed, so the provider
        // retries the webhook. Swallowing here would silently drop the
        // message.
        const provider: TelephonyProvider = {
          ...createMockTelephonyProvider(),
          parseIncomingSms: () => {
            throw new TelephonyError("Unparseable SMS webhook body", 400);
          },
        };
        const dispatch = makeDispatch({ provider });
        await expect(
          dispatch.onInboundSms!(ORG_FULL_ID, { MessageSid: "SM_MALFORMED" }),
        ).rejects.toThrow(TelephonyError);
      });
    });

    describe("onInboundVoice", () => {
      it("returns the provider-rendered voice response for a new caller", async () => {
        const dispatch = makeDispatch({ provider: voiceProvider() });

        const result = await dispatch.onInboundVoice!(ORG_FULL_ID, {
          CallSid: "CA_NEW_CALLER",
          From: "+15550000021",
          To: "+15550000020",
        });

        expect(result).toBe(VOICE_XML);

        // A caller who has not picked a language yet gets the selection IVR
        // and no phone record is created for them.
        const hash = testBlindIndexer.hash("+15550000021", ORG_FULL_ID);
        const phoneRow = await dbFull.db
          .selectFrom("phones")
          .select("id")
          .where("phone_hash", "=", hash)
          .executeTakeFirst();
        expect(phoneRow).toBeUndefined();
      });

      it("creates an encrypted client record and tracks the call after language selection", async () => {
        const tracker = createCallTracker();
        const dispatch = makeDispatch({
          provider: voiceProvider(),
          callTracker: tracker,
        });

        const result = await dispatch.onInboundVoice!(ORG_FULL_ID, {
          CallSid: "CA_DTMF_1",
          From: "+15550000022",
          To: "+15550000020",
          Digits: "1",
        });

        expect(result).toBe(VOICE_XML);

        const hash = testBlindIndexer.hash("+15550000022", ORG_FULL_ID);
        const phoneRow = await dbFull.db
          .selectFrom("phones")
          .selectAll()
          .where("phone_hash", "=", hash)
          .executeTakeFirstOrThrow();
        // Stored number is sealed for the org key holder, never plaintext.
        expect(phoneRow.encrypted_number.toString("utf-8")).not.toContain(
          "+15550000022",
        );

        const clientRow = await dbFull.db
          .selectFrom("clients")
          .selectAll()
          .where("phone_id", "=", phoneRow.id)
          .executeTakeFirstOrThrow();

        // The call is tracked so later status/recording callbacks can find
        // their ticket context.
        const tracked = await tracker.get(dbFull.schemaName, "CA_DTMF_1");
        expect(tracked).toBeDefined();
        expect(tracked!.clientId).toBe(clientRow.id);
        expect(tracked!.direction).toBe("inbound");
        expect(tracked!.orgSchema).toBe(dbFull.schemaName);
      });

      it("routes a recording-ready callback into the recording pipeline", async () => {
        const fixture = await createTestTicketFixture(dbFull.db);
        const tracker = createCallTracker();
        await tracker.track(dbFull.schemaName, "CA_REC_DISPATCH", {
          ticketId: fixture.ticketId,
          userId: null,
          direction: "inbound",
          orgSchema: dbFull.schemaName,
          clientId: fixture.clientId,
          createdAt: Date.now(),
        });

        const blobStore = createMemoryBlobStore();
        const deleteRecording = vi.fn().mockResolvedValue(undefined);
        const deleteCallLog = vi.fn().mockResolvedValue(undefined);
        const provider = voiceProvider({
          getRecording: vi
            .fn()
            .mockResolvedValue(Buffer.from("fake-wav-bytes")),
          deleteRecording,
          deleteCallLog,
        });
        const dispatch = makeDispatch({
          provider,
          callTracker: tracker,
          blobStore,
        });

        const result = await dispatch.onInboundVoice!(ORG_FULL_ID, {
          CallSid: "CA_REC_DISPATCH",
          RecordingSid: "RE_DISPATCH_1",
          RecordingDuration: "7",
        });

        // Recording callbacks answer with an empty 200, never TwiML.
        expect(result).toBeNull();

        const followup = await dbFull.db
          .selectFrom("followups")
          .selectAll()
          .where("ticket_id", "=", fixture.ticketId)
          .where("type", "=", "voicemail")
          .executeTakeFirstOrThrow();
        expect(followup.source).toBe("client");

        const recording = await dbFull.db
          .selectFrom("recordings")
          .selectAll()
          .where("followup_id", "=", followup.id)
          .executeTakeFirstOrThrow();
        expect(recording.duration_seconds).toBe(7);
        expect(blobStore.blobs.has(recording.blob_key)).toBe(true);

        // Provider-side copies are removed once the encrypted copy is
        // stored (GAP-16 M3/M1).
        expect(deleteRecording).toHaveBeenCalledWith("RE_DISPATCH_1");
        expect(deleteCallLog).toHaveBeenCalledWith("CA_REC_DISPATCH");
      });

      it("quarantines the recording when the call is not tracked", async () => {
        const deleteRecording = vi.fn().mockResolvedValue(undefined);
        const deleteCallLog = vi.fn().mockResolvedValue(undefined);
        const getRecording = vi
          .fn()
          .mockResolvedValue(Buffer.from("untracked-audio"));
        const getCallDetails = vi
          .fn()
          .mockResolvedValue({ from: "+15551112222", to: "+15553334444" });
        const provider: TelephonyProvider = {
          ...createMockTelephonyProvider(),
          deleteRecording,
          deleteCallLog,
          getRecording,
          getCallDetails,
        };
        const blobStore = createMemoryBlobStore();
        const dispatch = makeDispatch({
          provider,
          callTracker: createCallTracker(),
          blobStore,
        });

        await expect(
          dispatch.onInboundVoice!(ORG_FULL_ID, {
            CallSid: "CA_REC_UNTRACKED",
            RecordingSid: "RE_UNTRACKED",
          }),
        ).resolves.toBeNull();

        // Quarantine path: audio is fetched, sealed, stored, then deleted
        expect(getRecording).toHaveBeenCalledWith("RE_UNTRACKED");
        expect(deleteRecording).toHaveBeenCalledWith("RE_UNTRACKED");
        expect(deleteCallLog).toHaveBeenCalledWith("CA_REC_UNTRACKED");

        // Verify quarantine row was inserted
        const rows = await dbFull.db
          .selectFrom("voicemail_quarantine")
          .selectAll()
          .where("recording_sid", "=", "RE_UNTRACKED")
          .execute();
        expect(rows).toHaveLength(1);
        expect(rows[0]!.reason).toBe("tracker_miss");
      });
    });

    describe("onStatusCallback", () => {
      // The strict provider factory doubles as an assertion here: status
      // handling must never need the telephony provider.

      it("records a completed outbound call as a phone_call follow-up", async () => {
        const fixture = await createTestTicketFixture(dbFull.db, {
          createUser: true,
        });
        const tracker = createCallTracker();
        await tracker.track(dbFull.schemaName, "CA_STATUS_DONE", {
          ticketId: fixture.ticketId,
          userId: fixture.userId,
          direction: "outbound",
          orgSchema: dbFull.schemaName,
          clientId: null,
          createdAt: Date.now(),
        });
        const dispatch = makeDispatch({ callTracker: tracker });

        await dispatch.onStatusCallback!(ORG_FULL_ID, {
          CallSid: "CA_STATUS_DONE",
          CallStatus: "completed",
          Duration: "33",
        });

        const row = await dbFull.db
          .selectFrom("followups")
          .selectAll()
          .where("call_sid", "=", "CA_STATUS_DONE")
          .executeTakeFirstOrThrow();
        expect(row.ticket_id).toBe(fixture.ticketId);
        expect(row.type).toBe("phone_call");
        expect(row.source).toBe("volunteer");
        expect(row.call_status).toBe("completed");
        expect(row.call_duration_seconds).toBe(33);
        expect(row.created_by).toBe(fixture.userId);
      });

      it("records each remaining terminal status the provider can send", async () => {
        const fixture = await createTestTicketFixture(dbFull.db, {
          createUser: true,
        });
        const tracker = createCallTracker();
        const dispatch = makeDispatch({ callTracker: tracker });

        // Twilio terminal statuses and their normalized stored values
        // (hyphens become underscores at rest).
        const cases = [
          { raw: "failed", stored: "failed" },
          { raw: "canceled", stored: "canceled" },
          { raw: "busy", stored: "busy" },
          { raw: "no-answer", stored: "no_answer" },
        ];

        for (const { raw, stored } of cases) {
          const callSid = `CA_STATUS_${raw}`;
          await tracker.track(dbFull.schemaName, callSid, {
            ticketId: fixture.ticketId,
            userId: fixture.userId,
            direction: "outbound",
            orgSchema: dbFull.schemaName,
            clientId: null,
            createdAt: Date.now(),
          });

          await dispatch.onStatusCallback!(ORG_FULL_ID, {
            CallSid: callSid,
            CallStatus: raw,
          });

          const row = await dbFull.db
            .selectFrom("followups")
            .select(["call_status", "call_duration_seconds"])
            .where("call_sid", "=", callSid)
            .executeTakeFirstOrThrow();
          expect(row.call_status).toBe(stored);
          expect(row.call_duration_seconds).toBeNull();
        }
      });

      it("ignores non-terminal status updates", async () => {
        const fixture = await createTestTicketFixture(dbFull.db);
        const tracker = createCallTracker();
        await tracker.track(dbFull.schemaName, "CA_STATUS_RINGING", {
          ticketId: fixture.ticketId,
          userId: null,
          direction: "outbound",
          orgSchema: dbFull.schemaName,
          clientId: null,
          createdAt: Date.now(),
        });
        const dispatch = makeDispatch({ callTracker: tracker });

        await dispatch.onStatusCallback!(ORG_FULL_ID, {
          CallSid: "CA_STATUS_RINGING",
          CallStatus: "ringing",
        });

        const row = await dbFull.db
          .selectFrom("followups")
          .select("id")
          .where("call_sid", "=", "CA_STATUS_RINGING")
          .executeTakeFirst();
        expect(row).toBeUndefined();
      });

      it("ignores SMS delivery receipts posted to the status endpoint", async () => {
        // Current contract: message delivery receipts carry MessageSid and
        // MessageStatus but no CallSid, and the status pipeline records
        // nothing for them. This pins the "silently ignored" behavior.
        const dispatch = makeDispatch({ callTracker: createCallTracker() });

        const before = await dbFull.db
          .selectFrom("followups")
          .select("id")
          .execute();

        await expect(
          dispatch.onStatusCallback!(ORG_FULL_ID, {
            MessageSid: "SM_RECEIPT_1",
            MessageStatus: "delivered",
            SmsStatus: "delivered",
          }),
        ).resolves.toBeUndefined();

        const after = await dbFull.db
          .selectFrom("followups")
          .select("id")
          .execute();
        expect(after.length).toBe(before.length);
      });

      it("resolves without effect when the org has no public key", async () => {
        const dispatch = makeDispatch({ callTracker: createCallTracker() });
        await expect(
          dispatch.onStatusCallback!(ORG_NO_KEY_ID, {
            CallSid: "CA_STATUS_NO_KEY",
            CallStatus: "completed",
          }),
        ).resolves.toBeUndefined();
      });
    });
  },
);
