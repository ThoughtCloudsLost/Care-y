/**
 * Tests for the voicemail quarantine admin router.
 *
 * Caller-factory tests (auth enforcement) run without a DB.
 * DB integration tests (Docker-only) verify the full route-to-service chain.
 */

import * as crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { createVoicemailQuarantineRouter } from "./voicemail-quarantine.js";
import { router, createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import { RoleId, ErrorCode } from "@care-y/shared";
import type { BlobStore, BlobCategory } from "../storage/store.js";
import type { PendingClient } from "../tickets/ticket-service.js";
import {
  mockReq,
  mockRes,
  expectTrpcError,
  createTestDb,
  createTestQueue,
  createTestUser,
  createTestTicketFixture,
  createTestClientFixture,
  seedOrgPublicKey,
  testSealedBox,
  type TestDb,
  stubTenantDbDefaultRoles,
} from "../test-utils.js";

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

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

function createMockOrgContext(): OrgContext {
  return {
    orgId: "org-quarantine-test",
    orgSlug: "quarantine-org",
    orgSchema: "org_quarantine",
    tenantDb: stubTenantDbDefaultRoles(),
    sealedBox: {} as OrgContext["sealedBox"],
  };
}

function createAdminContext(): Context {
  return {
    req: mockReq(),
    res: mockRes(),
    org: createMockOrgContext(),
    session: {
      id: "sess-q-1",
      token: "tok-q-1",
      userId: "user-q-admin",
      ipToken: "ip-tok",
      uaToken: "ua-tok",
      expiresAt: new Date(Date.now() + 3_600_000),
      twofaVerified: true,
      webauthnChallenge: null,
    },
    user: {
      id: "user-q-admin",
      encryptedIdentifier: "admin-id",
      encryptedDisplayName: "encrypted-admin",
      encryptedPreferredLocale: null,
      roleId: RoleId.ADMIN,
      isActive: true,
      hasSeenBriefing: true,
    },
  };
}

function createVolunteerContext(): Context {
  return {
    ...createAdminContext(),
    user: {
      id: "user-q-vol",
      encryptedIdentifier: "vol-id",
      encryptedDisplayName: "encrypted-vol",
      encryptedPreferredLocale: null,
      roleId: RoleId.VOLUNTEER,
      isActive: true,
      hasSeenBriefing: true,
    },
  };
}

function buildCaller(ctx: Context) {
  const deps = {
    blobStore: createMockBlobStore(),
    pendingClients: new Map<string, PendingClient>(),
  };
  const quarantineRouter = createVoicemailQuarantineRouter(deps);
  const appRouter = router({ voicemailQuarantine: quarantineRouter });
  return createCallerFactory(appRouter)(ctx);
}

// ---------------------------------------------------------------------------
// Auth enforcement tests (no DB)
// ---------------------------------------------------------------------------

describe("createVoicemailQuarantineRouter (auth)", () => {
  const volCtx = createVolunteerContext();

  describe("list", () => {
    it("rejects volunteer caller with FORBIDDEN", async () => {
      const caller = buildCaller(volCtx);
      await expectTrpcError(
        caller.voicemailQuarantine.list({}),
        "FORBIDDEN",
        ErrorCode.INSUFFICIENT_PERMISSIONS,
      );
    });
  });

  describe("download", () => {
    it("rejects volunteer caller with FORBIDDEN", async () => {
      const caller = buildCaller(volCtx);
      await expectTrpcError(
        caller.voicemailQuarantine.download({
          quarantineId: crypto.randomUUID(),
        }),
        "FORBIDDEN",
        ErrorCode.INSUFFICIENT_PERMISSIONS,
      );
    });
  });

  describe("route", () => {
    it("rejects volunteer caller with FORBIDDEN", async () => {
      const caller = buildCaller(volCtx);
      await expectTrpcError(
        caller.voicemailQuarantine.route({
          quarantineId: crypto.randomUUID(),
          target: {
            type: "ticketId",
            ticketId: crypto.randomUUID(),
          },
          audioData: Buffer.from("test").toString("base64"),
        }),
        "FORBIDDEN",
        ErrorCode.INSUFFICIENT_PERMISSIONS,
      );
    });
  });

  describe("dismiss", () => {
    it("rejects volunteer caller with FORBIDDEN", async () => {
      const caller = buildCaller(volCtx);
      await expectTrpcError(
        caller.voicemailQuarantine.dismiss({
          quarantineId: crypto.randomUUID(),
        }),
        "FORBIDDEN",
        ErrorCode.INSUFFICIENT_PERMISSIONS,
      );
    });
  });
});

// ---------------------------------------------------------------------------
// DB integration suite (Docker only)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "createVoicemailQuarantineRouter (DB)",
  () => {
    let testDb: TestDb;
    let tDb: Kysely<TenantDatabase>;
    let blobStore: BlobStore;
    let intakeQueue: { id: string };
    let adminUser: Awaited<ReturnType<typeof createTestUser>>;

    beforeAll(async () => {
      const { getSodium } = await import("@care-y/crypto");
      await getSodium();

      testDb = await createTestDb();
      tDb = testDb.db;

      // Seed org_config (fresh schema has none)
      await tDb
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();
      await seedOrgPublicKey(tDb);

      // Create an intake queue and set it in org_config
      intakeQueue = await createTestQueue(tDb, { label: "Intake" });
      await tDb
        .updateTable("org_config")
        .set({ intake_queue_id: intakeQueue.id })
        .execute();

      // Create an admin user for actorId
      adminUser = await createTestUser(tDb, {
        overrides: { role_id: RoleId.ADMIN },
      });

      blobStore = createMockBlobStore();
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    function buildDbCaller(overrideBlobStore?: BlobStore) {
      const orgContext: OrgContext = {
        orgId: "org-q-db",
        orgSlug: "q-db-org",
        orgSchema: testDb.schemaName,
        tenantDb: tDb,
        sealedBox: testSealedBox,
      };

      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: {
          id: "sess-qdb-1",
          token: "tok-qdb-1",
          userId: adminUser.id,
          ipToken: "ip-tok",
          uaToken: "ua-tok",
          expiresAt: new Date(Date.now() + 3_600_000),
          twofaVerified: true,
          webauthnChallenge: null,
        },
        user: {
          id: adminUser.id,
          encryptedIdentifier: "admin-q",
          encryptedDisplayName: "encrypted-admin-q",
          encryptedPreferredLocale: null,
          roleId: RoleId.ADMIN,
          isActive: true,
          hasSeenBriefing: true,
        },
      };

      const deps = {
        blobStore: overrideBlobStore ?? blobStore,
        pendingClients: new Map<string, PendingClient>(),
      };
      const quarantineRouter = createVoicemailQuarantineRouter(deps);
      const appRouter = router({ voicemailQuarantine: quarantineRouter });
      return createCallerFactory(appRouter)(ctx);
    }

    /** Seeds a quarantine row with a blob and returns the row's id. */
    async function seedQuarantineRow(
      store: BlobStore,
      overrides?: { status?: string },
    ): Promise<string> {
      const sealedData = Buffer.from("sealed-test-audio");
      const blobKey = await store.put(
        testDb.schemaName,
        "quarantine",
        sealedData,
      );
      const recordingSid = `RE_ROUTE_${crypto.randomUUID().slice(0, 8)}`;
      const row = await tDb
        .insertInto("voicemail_quarantine")
        .values({
          recording_sid: recordingSid,
          call_sid: `CA_ROUTE_${crypto.randomUUID().slice(0, 8)}`,
          blob_key: blobKey,
          size_bytes: sealedData.length,
          duration_seconds: 10,
          reason: "tracker_miss",
          ...(overrides?.status ? { status: overrides.status } : {}),
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      return row.id;
    }

    /**
     * Creates a phone + client pair using createTestClientFixture.
     * Returns just the phoneId and clientId that quarantine tests need.
     */
    async function seedPhoneAndClient(
      db: Kysely<TenantDatabase>,
    ): Promise<{ phoneId: string; clientId: string }> {
      const fixture = await createTestClientFixture(db);
      return { phoneId: fixture.phoneId, clientId: fixture.clientId };
    }

    it("route-to-existing-ticket creates follow-up with voicemail recording", async () => {
      const localBlobStore = createMockBlobStore();
      const caller = buildDbCaller(localBlobStore);

      // Create a ticket to route to
      const fixture = await createTestTicketFixture(tDb, {
        queueId: intakeQueue.id,
        createUser: true,
      });

      // Seed user_keys so createEncryptedFollowUp can find vol_public
      await tDb
        .insertInto("user_keys")
        .values({
          user_id: fixture.userId as string,
          salt: Buffer.alloc(16),
          vol_public: null,
        })
        .onConflict((oc) => oc.column("user_id").doNothing())
        .execute();

      const quarantineId = await seedQuarantineRow(localBlobStore);

      // Small audio payload for test
      const audioB64 = Buffer.from("test-audio-payload").toString("base64");

      const result = await caller.voicemailQuarantine.route({
        quarantineId,
        target: { type: "ticketId", ticketId: fixture.ticketId },
        audioData: audioB64,
        durationSeconds: 10,
      });

      expect(result.ticketId).toBe(fixture.ticketId);
      expect(result.followUpId).toBeDefined();

      // Verify quarantine row is now routed
      const qRow = await tDb
        .selectFrom("voicemail_quarantine")
        .selectAll()
        .where("id", "=", quarantineId)
        .executeTakeFirstOrThrow();

      expect(qRow.status).toBe("routed");
      expect(qRow.routed_ticket_id).toBe(fixture.ticketId);
      expect(qRow.routed_followup_id).toBe(result.followUpId);
      expect(qRow.resolved_by).toBe(adminUser.id);
      expect(qRow.resolved_at).toBeInstanceOf(Date);

      // Verify followup row exists
      const followup = await tDb
        .selectFrom("followups")
        .selectAll()
        .where("id", "=", result.followUpId)
        .executeTakeFirstOrThrow();

      expect(followup.ticket_id).toBe(fixture.ticketId);
      expect(followup.type).toBe("voicemail");
      expect(followup.source).toBe("client");

      // Verify recording row exists
      const recording = await tDb
        .selectFrom("recordings")
        .selectAll()
        .where("followup_id", "=", result.followUpId)
        .executeTakeFirst();

      expect(recording).toBeDefined();
      expect(recording!.duration_seconds).toBe(10);

      // Verify audit row
      const auditRow = await tDb
        .selectFrom("audit_log")
        .selectAll()
        .where("event_type", "=", "voicemail_quarantine_routed")
        .where("actor_id", "=", adminUser.id)
        .execute();

      const relevant = auditRow.find(
        (r) =>
          (r.metadata as Record<string, unknown>).quarantineId === quarantineId,
      );
      expect(relevant).toBeDefined();
    }, 30_000);

    it("route-to-client creates intake ticket and follow-up", async () => {
      const localBlobStore = createMockBlobStore();
      const caller = buildDbCaller(localBlobStore);

      // Create a client (phone + client row, no ticket yet)
      const { clientId: routeClientId } = await seedPhoneAndClient(tDb);

      const quarantineId = await seedQuarantineRow(localBlobStore);
      const audioB64 = Buffer.from("route-client-audio").toString("base64");

      const result = await caller.voicemailQuarantine.route({
        quarantineId,
        target: { type: "clientId", clientId: routeClientId },
        audioData: audioB64,
        durationSeconds: 5,
      });

      expect(result.ticketId).toBeDefined();
      expect(result.followUpId).toBeDefined();

      // Verify a ticket was created for this client
      const ticket = await tDb
        .selectFrom("tickets")
        .selectAll()
        .where("id", "=", result.ticketId)
        .executeTakeFirstOrThrow();

      expect(ticket.client_id).toBe(routeClientId);
      expect(ticket.queue_id).toBe(intakeQueue.id);
    }, 30_000);

    it("route with no intake queue configured throws ValidationError", async () => {
      // Use a separate test DB to avoid affecting other tests
      const separateDb = await createTestDb();
      try {
        await separateDb.db
          .insertInto("org_config")
          .values({ pii_retention_days: null })
          .onConflict((oc) => oc.doNothing())
          .execute();
        await seedOrgPublicKey(separateDb.db);

        // Do NOT set intake_queue_id (null by default)

        const localBlobStore = createMockBlobStore();

        // Create a client in the separate schema
        const clientFixture = await createTestClientFixture(separateDb.db);

        // Insert quarantine row in separate schema
        const sealedData = Buffer.from("sealed-niq-audio");
        const blobKey = await localBlobStore.put(
          separateDb.schemaName,
          "quarantine",
          sealedData,
        );
        const qRow = await separateDb.db
          .insertInto("voicemail_quarantine")
          .values({
            recording_sid: `RE_NIQ_${crypto.randomUUID().slice(0, 8)}`,
            call_sid: `CA_NIQ_${crypto.randomUUID().slice(0, 8)}`,
            blob_key: blobKey,
            size_bytes: sealedData.length,
            reason: "no_intake_queue",
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const orgContext: OrgContext = {
          orgId: "org-niq",
          orgSlug: "niq-org",
          orgSchema: separateDb.schemaName,
          tenantDb: separateDb.db,
          sealedBox: testSealedBox,
        };

        const ctx: Context = {
          req: mockReq(),
          res: mockRes(),
          org: orgContext,
          session: {
            id: "sess-niq",
            token: "tok-niq",
            userId: crypto.randomUUID(),
            ipToken: "ip-tok",
            uaToken: "ua-tok",
            expiresAt: new Date(Date.now() + 3_600_000),
            twofaVerified: true,
            webauthnChallenge: null,
          },
          user: {
            id: crypto.randomUUID(),
            encryptedIdentifier: "admin-niq",
            encryptedDisplayName: "encrypted-niq",
            encryptedPreferredLocale: null,
            roleId: RoleId.ADMIN,
            isActive: true,
            hasSeenBriefing: true,
          },
        };

        const deps = {
          blobStore: localBlobStore,
          pendingClients: new Map<string, PendingClient>(),
        };
        const quarantineRouter = createVoicemailQuarantineRouter(deps);
        const appRouter = router({ voicemailQuarantine: quarantineRouter });
        const caller = createCallerFactory(appRouter)(ctx);

        const audioB64 = Buffer.from("niq-audio").toString("base64");

        await expectTrpcError(
          caller.voicemailQuarantine.route({
            quarantineId: qRow.id,
            target: { type: "clientId", clientId: clientFixture.clientId },
            audioData: audioB64,
          }),
          "BAD_REQUEST",
          "No intake queue configured",
        );
      } finally {
        await separateDb.cleanup();
      }
    }, 30_000);

    it("double-route returns ConflictError on second attempt", async () => {
      const localBlobStore = createMockBlobStore();
      const caller = buildDbCaller(localBlobStore);

      const fixture = await createTestTicketFixture(tDb, {
        queueId: intakeQueue.id,
      });
      const quarantineId = await seedQuarantineRow(localBlobStore);
      const audioB64 = Buffer.from("double-route-audio").toString("base64");

      // First route succeeds
      await caller.voicemailQuarantine.route({
        quarantineId,
        target: { type: "ticketId", ticketId: fixture.ticketId },
        audioData: audioB64,
      });

      // Second route gets ConflictError
      await expectTrpcError(
        caller.voicemailQuarantine.route({
          quarantineId,
          target: { type: "ticketId", ticketId: fixture.ticketId },
          audioData: audioB64,
        }),
        "CONFLICT",
      );
    }, 30_000);

    it("dismiss deletes blob, marks row dismissed, and creates audit entry", async () => {
      const localBlobStore = createMockBlobStore();
      const caller = buildDbCaller(localBlobStore);

      const quarantineId = await seedQuarantineRow(localBlobStore);

      // Get blob key before dismiss
      const qRow = await tDb
        .selectFrom("voicemail_quarantine")
        .select("blob_key")
        .where("id", "=", quarantineId)
        .executeTakeFirstOrThrow();

      await caller.voicemailQuarantine.dismiss({ quarantineId });

      // Verify row is dismissed
      const dismissed = await tDb
        .selectFrom("voicemail_quarantine")
        .selectAll()
        .where("id", "=", quarantineId)
        .executeTakeFirstOrThrow();

      expect(dismissed.status).toBe("dismissed");
      expect(dismissed.resolved_by).toBe(adminUser.id);
      expect(dismissed.resolved_at).toBeInstanceOf(Date);

      // Verify blob was deleted
      const blobExists = await localBlobStore.exists(qRow.blob_key);
      expect(blobExists).toBe(false);

      // Verify audit entry
      const auditRows = await tDb
        .selectFrom("audit_log")
        .selectAll()
        .where("event_type", "=", "voicemail_quarantine_dismissed")
        .where("actor_id", "=", adminUser.id)
        .execute();

      const relevant = auditRows.find(
        (r) =>
          (r.metadata as Record<string, unknown>).quarantineId === quarantineId,
      );
      expect(relevant).toBeDefined();
    }, 30_000);

    it("list returns quarantined rows with pagination", async () => {
      const caller = buildDbCaller();
      const result = await caller.voicemailQuarantine.list({ limit: 10 });
      expect(Array.isArray(result)).toBe(true);
    }, 30_000);

    it("download returns sealed blob as base64", async () => {
      const localBlobStore = createMockBlobStore();
      const caller = buildDbCaller(localBlobStore);

      const quarantineId = await seedQuarantineRow(localBlobStore);

      const result = await caller.voicemailQuarantine.download({
        quarantineId,
      });

      expect(result.sealedBase64).toBeDefined();
      expect(typeof result.sealedBase64).toBe("string");
      expect(result.durationSeconds).toBe(10);
    }, 30_000);
  },
);
