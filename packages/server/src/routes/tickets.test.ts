/**
 * Integration tests for tickets tRPC router.
 *
 * Uses a real PostgreSQL database (via createTestDb) to test the full
 * tRPC procedure chain: middleware -> service -> repository -> DB.
 * Requires DATABASE_URL (runs inside Docker container).
 *
 * The tickets router requires ~16 factory functions via TicketRouterDeps.
 * buildTicketDeps() wires real service implementations against the test DB,
 * matching production wiring behavior.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  createTestTicketFixture,
  createTestClientFixture,
  seedOrgPublicKey,
  testSealedBox,
  TEST_ORG_ID,
  mockReq,
  mockRes,
  expectTrpcError,
  type TestDb,
} from "../test-utils.js";
import { RoleId } from "@care-y/shared";
import { createTicketRouter, type TicketRouterDeps } from "./tickets.js";
import { router, createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";

import { createTicketAccessChecker } from "../tickets/access.js";
import { createTicketService } from "../tickets/ticket-service.js";
import { createFollowUpService } from "../tickets/followup-service.js";
import { createMergeService } from "../tickets/merge-service.js";
import { createPresetService } from "../tickets/preset-service.js";
import { createDependencyService } from "../tickets/dependency-service.js";
import { createMediaService } from "../tickets/media-service.js";
import { createQueueService } from "../tickets/queue-service.js";
import { createAssignmentService } from "../tickets/assignment.js";
import { createWatchersService } from "../tickets/watchers.js";
import { createQueuePermissionsService } from "../tickets/queue-permissions.js";
import { createReadCursorService } from "../tickets/read-cursor-service.js";
import { createAuditService } from "../tickets/audit.js";
import type { BlobStore } from "../storage/store.js";

// ---------------------------------------------------------------------------
// In-memory BlobStore for tests (no filesystem or S3 needed)
// ---------------------------------------------------------------------------

function createTestBlobStore(): BlobStore {
  const store = new Map<string, Buffer>();
  let counter = 0;
  return {
    async put(_orgSchema, _category, blob) {
      const key = `test-blob-${String(++counter)}`;
      store.set(key, blob);
      return key;
    },
    async get(key) {
      return store.get(key) ?? null;
    },
    async delete(key) {
      store.delete(key);
    },
    async exists(key) {
      return store.has(key);
    },
  };
}

// ---------------------------------------------------------------------------
// Base64 test data helpers
// ---------------------------------------------------------------------------

function testEncryptedContent(fill = 0xaa): string {
  return Buffer.alloc(64, fill).toString("base64");
}

function testEphemeralPoint(fill = 0xcc): string {
  return Buffer.alloc(32, fill).toString("base64");
}

function testNonce(fill = 0xdd): string {
  return Buffer.alloc(24, fill).toString("base64");
}

function testWrappedKey(fill = 0xee): string {
  return Buffer.alloc(48, fill).toString("base64");
}

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "tickets router (DB integration)",
  () => {
    let testDb: TestDb;
    let tenantDb: Kysely<TenantDatabase>;
    let orgContext: OrgContext;
    let blobStore: BlobStore;

    beforeAll(async () => {
      testDb = await createTestDb();
      tenantDb = testDb.db;
      blobStore = createTestBlobStore();

      await tenantDb
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();
      await seedOrgPublicKey(tenantDb);

      orgContext = {
        orgId: TEST_ORG_ID,
        orgSlug: "test-tickets",
        orgSchema: testDb.schemaName,
        tenantDb,
        sealedBox: testSealedBox,
      };
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    // -----------------------------------------------------------------------
    // Dependency injection: wire real services against test DB
    // -----------------------------------------------------------------------

    function buildTicketDeps(): TicketRouterDeps {
      return {
        blobStore,
        createTicketAccess: (db) => createTicketAccessChecker(db),
        createTicketSvc: (db, access, getQueues, deps) =>
          createTicketService(db, access, getQueues, deps),
        createFollowUpSvc: (db, access) => createFollowUpService(db, access),
        createMergeSvc: (db) => createMergeService(db),
        createPresetSvc: (db) => createPresetService(db),
        createDependencySvc: (db, access) =>
          createDependencyService(db, access),
        createMediaSvc: (db, bs, access) => createMediaService(db, bs, access),
        createQueueSvc: (db) => createQueueService(db),
        createAssignmentSvc: (db, access, shift) =>
          createAssignmentService(db, access, shift),
        createWatchersSvc: (db, access) => createWatchersService(db, access),
        createQueuePermissionsSvc: (db) => createQueuePermissionsService(db),
        createReadCursorSvc: (db, access) =>
          createReadCursorService(db, access),
        createAuditSvc: (db) => createAuditService(db),
      };
    }

    function buildTicketsRouter() {
      const ticketsRouter = createTicketRouter(buildTicketDeps());
      return router({ tickets: ticketsRouter });
    }

    /** Maps a raw DB user row (snake_case) to a tRPC Context caller. */
    function createAuthedCaller(
      dbRow: {
        id: string;
        role_id: string;
        identifier_hash: string;
        encrypted_display_name: Buffer;
      },
      opts?: { twofaVerified?: boolean },
    ) {
      const appRouter = buildTicketsRouter();
      const factory = createCallerFactory(appRouter);
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: {
          id: "test-session",
          token: "test-token",
          userId: dbRow.id,
          ipToken: "test-ip",
          uaToken: "test-ua",
          expiresAt: new Date(Date.now() + 3_600_000),
          twofaVerified: opts?.twofaVerified ?? true,
          webauthnChallenge: null,
        },
        user: {
          id: dbRow.id,
          identifier: dbRow.identifier_hash,
          encryptedDisplayName: dbRow.encrypted_display_name.toString("base64"),
          encryptedPreferredLocale: null,
          roleId: dbRow.role_id,
          isActive: true,
          hasSeenBriefing: true,
        },
      };
      return factory(ctx);
    }

    function createUnauthCaller() {
      const appRouter = buildTicketsRouter();
      const factory = createCallerFactory(appRouter);
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: null,
        user: null,
      };
      return factory(ctx);
    }

    /**
     * Creates a user + queue + queue_assignment + ticket_key_wraps chain.
     * Returns everything needed to call ticket endpoints as that user.
     */
    async function setupUserWithTicket(roleId = RoleId.VOLUNTEER) {
      const user = await createTestUser(tenantDb, {
        overrides: { role_id: roleId },
      });
      const fixture = await createTestTicketFixture(tenantDb, {
        createUser: false,
      });

      // Add user to queue so access checker grants access
      await tenantDb
        .insertInto("queue_assignments")
        .values({ queue_id: fixture.queueId, user_id: user.id })
        .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
        .execute();

      // Insert a key wrap so the user has crypto access to the ticket
      await tenantDb
        .insertInto("ticket_key_wraps")
        .values({
          ticket_id: fixture.ticketId,
          volunteer_id: user.id,
          key_generation: randomUUID(),
          ephemeral_point: Buffer.alloc(32, 0xcc),
          nonce: Buffer.alloc(24, 0xdd),
          wrapped_key: Buffer.alloc(48, 0xee),
          algorithm: "ecies-ristretto255-v1",
        })
        .onConflict((oc) =>
          oc
            .columns(["ticket_id", "volunteer_id", "key_generation"])
            .doNothing(),
        )
        .execute();

      return { user, ...fixture };
    }

    // -----------------------------------------------------------------------
    // Ticket CRUD
    // -----------------------------------------------------------------------

    describe("Ticket CRUD", () => {
      it("creates a ticket with encrypted fields", async () => {
        const clientFixture = await createTestClientFixture(tenantDb);
        const user = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.VOLUNTEER },
        });

        // Add user to queue
        await tenantDb
          .insertInto("queue_assignments")
          .values({ queue_id: clientFixture.queueId, user_id: user.id })
          .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
          .execute();

        const caller = createAuthedCaller(user);
        const keyGen = randomUUID();
        const result = await caller.tickets.create({
          clientId: clientFixture.clientId,
          queueId: clientFixture.queueId,
          encryptedTitle: testEncryptedContent(0x01),
          encryptedDescription: testEncryptedContent(0x02),
          priority: "normal",
          keyGeneration: keyGen,
          keyWrap: {
            ephemeralPoint: testEphemeralPoint(),
            nonce: testNonce(),
            wrappedKey: testWrappedKey(),
          },
        });

        expect(result.id).toBeDefined();
        expect(result.queueId).toBe(clientFixture.queueId);
        expect(result.status).toBe("open");
      });

      it("gets a ticket by ID", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const ticket = await caller.tickets.get({ ticketId });
        expect(ticket.id).toBe(ticketId);
        expect(ticket.status).toBe("open");
      });

      it("lists tickets scoped to user queues", async () => {
        const { user, queueId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const result = await caller.tickets.list({});
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result.some((t) => t.queueId === queueId)).toBe(true);
      });

      it("updates ticket priority", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const updated = await caller.tickets.update({
          ticketId,
          priority: "high",
        });
        expect(updated.priority).toBe("high");
      });

      it("rejects unauthenticated access to get", async () => {
        const caller = createUnauthCaller();
        await expectTrpcError(
          caller.tickets.get({ ticketId: randomUUID() }),
          "UNAUTHORIZED",
        );
      });
    });

    // -----------------------------------------------------------------------
    // Follow-ups
    // -----------------------------------------------------------------------

    describe("Follow-ups", () => {
      it("creates a follow-up on an open ticket", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const followUp = await caller.tickets.createFollowUp({
          ticketId,
          encryptedContent: testEncryptedContent(),
          source: "volunteer",
          type: "message",
          isPrivate: false,
          mentionedPseudonyms: [],
        });

        expect(followUp.id).toBeDefined();
        expect(followUp.ticketId).toBe(ticketId);
      });

      it("lists follow-ups for a ticket", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        await caller.tickets.createFollowUp({
          ticketId,
          encryptedContent: testEncryptedContent(),
          source: "volunteer",
          type: "message",
          isPrivate: false,
          mentionedPseudonyms: [],
        });

        const result = await caller.tickets.listFollowUps({
          ticketId,
        });
        expect(result.followUps.length).toBeGreaterThanOrEqual(1);
      });

      it("creates an internal note", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const note = await caller.tickets.createFollowUp({
          ticketId,
          encryptedContent: testEncryptedContent(0x33),
          source: "volunteer",
          type: "internal_note",
          isPrivate: false,
          mentionedPseudonyms: [],
        });

        expect(note.type).toBe("internal_note");
      });

      it("updates an internal note", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const note = await caller.tickets.createFollowUp({
          ticketId,
          encryptedContent: testEncryptedContent(0x44),
          source: "volunteer",
          type: "internal_note",
          isPrivate: false,
          mentionedPseudonyms: [],
        });

        const updated = await caller.tickets.updateInternalNote({
          followUpId: note.id,
          encryptedContent: testEncryptedContent(0x55),
        });
        expect(updated.id).toBe(note.id);
      });

      it("soft-deletes own internal note", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const note = await caller.tickets.createFollowUp({
          ticketId,
          encryptedContent: testEncryptedContent(0x66),
          source: "volunteer",
          type: "internal_note",
          isPrivate: false,
          mentionedPseudonyms: [],
        });

        await caller.tickets.deleteInternalNote({ followUpId: note.id });

        // Verify the note is soft-deleted
        const row = await tenantDb
          .selectFrom("followups")
          .select("deleted_at")
          .where("id", "=", note.id)
          .executeTakeFirstOrThrow();
        expect(row.deleted_at).not.toBeNull();
      });

      it("rejects unauthenticated follow-up creation", async () => {
        const caller = createUnauthCaller();
        await expectTrpcError(
          caller.tickets.createFollowUp({
            ticketId: randomUUID(),
            encryptedContent: testEncryptedContent(),
            source: "volunteer",
            type: "message",
            isPrivate: false,
            mentionedPseudonyms: [],
          }),
          "UNAUTHORIZED",
        );
      });
    });

    // -----------------------------------------------------------------------
    // Reactions
    // -----------------------------------------------------------------------

    describe("Reactions", () => {
      it("toggles a reaction on an internal note", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const note = await caller.tickets.createFollowUp({
          ticketId,
          encryptedContent: testEncryptedContent(0x77),
          source: "volunteer",
          type: "internal_note",
          isPrivate: false,
          mentionedPseudonyms: [],
        });

        const summaries = await caller.tickets.toggleReaction({
          followUpId: note.id,
          reaction: "acknowledge",
        });
        expect(Array.isArray(summaries)).toBe(true);
        const ackSummary = summaries.find((s) => s.reaction === "acknowledge");
        expect(ackSummary).toBeDefined();
        expect(ackSummary!.userIds).toContain(user.id);

        // Toggle off
        const summaries2 = await caller.tickets.toggleReaction({
          followUpId: note.id,
          reaction: "acknowledge",
        });
        const ack2 = summaries2.find((s) => s.reaction === "acknowledge");
        expect(ack2).toBeUndefined();
      });
    });

    // -----------------------------------------------------------------------
    // Assignment
    // -----------------------------------------------------------------------

    describe("Assignment", () => {
      it("takes a ticket (self-assign)", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        await caller.tickets.take({ ticketId });

        const ticket = await caller.tickets.get({ ticketId });
        expect(ticket.assignedTo).toBe(user.id);
      });

      it("releases ticket assignment", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        await caller.tickets.take({ ticketId });
        await caller.tickets.release({ ticketId });

        const ticket = await caller.tickets.get({ ticketId });
        expect(ticket.assignedTo).toBeNull();
      });

      it("assigns ticket to another user", async () => {
        const { user, ticketId, queueId } = await setupUserWithTicket();
        const target = await createTestUser(tenantDb);

        // Add target to same queue
        await tenantDb
          .insertInto("queue_assignments")
          .values({ queue_id: queueId, user_id: target.id })
          .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
          .execute();

        const caller = createAuthedCaller(user);
        await caller.tickets.assignTo({
          ticketId,
          targetUserId: target.id,
        });

        const ticket = await caller.tickets.get({ ticketId });
        expect(ticket.assignedTo).toBe(target.id);
      });

      it("rejects unauthenticated assignment", async () => {
        const caller = createUnauthCaller();
        await expectTrpcError(
          caller.tickets.take({ ticketId: randomUUID() }),
          "UNAUTHORIZED",
        );
      });
    });

    // -----------------------------------------------------------------------
    // Lifecycle (close, reopen, hold)
    // -----------------------------------------------------------------------

    describe("Lifecycle", () => {
      it("closes an open ticket", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const closed = await caller.tickets.close({ ticketId });
        expect(closed.status).toBe("closed");
      });

      it("reopens a closed ticket with new key generation", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        await caller.tickets.close({ ticketId });

        const newKeyGen = randomUUID();
        const reopened = await caller.tickets.reopen({
          ticketId,
          newKeyGeneration: newKeyGen,
        });
        expect(reopened.status).toBe("open");
      });

      it("toggles hold status via update", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const updated = await caller.tickets.update({
          ticketId,
          onHold: true,
        });
        expect(updated.onHold).toBe(true);

        const released = await caller.tickets.update({
          ticketId,
          onHold: false,
        });
        expect(released.onHold).toBe(false);
      });
    });

    // -----------------------------------------------------------------------
    // Merge
    // -----------------------------------------------------------------------

    describe("Merge", () => {
      it("merges two clients (manager-only)", async () => {
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        // Create two clients with tickets
        const fixture1 = await createTestTicketFixture(tenantDb);
        const fixture2 = await createTestClientFixture(tenantDb, {
          queueId: fixture1.queueId,
        });

        // Add manager to queue
        await tenantDb
          .insertInto("queue_assignments")
          .values({ queue_id: fixture1.queueId, user_id: manager.id })
          .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
          .execute();

        const result = await caller.tickets.mergeClients({
          primaryClientId: fixture1.clientId,
          secondaryClientId: fixture2.clientId,
          encryptedSnapshot: testEncryptedContent(0x88),
        });

        expect(result.id).toBeDefined();
      });

      it("rejects merge from volunteer (requires manager)", async () => {
        const { user, clientId, queueId } = await setupUserWithTicket();
        const fixture2 = await createTestClientFixture(tenantDb, {
          queueId,
        });
        const caller = createAuthedCaller(user);

        await expectTrpcError(
          caller.tickets.mergeClients({
            primaryClientId: clientId,
            secondaryClientId: fixture2.clientId,
            encryptedSnapshot: testEncryptedContent(0x99),
          }),
          "FORBIDDEN",
        );
      });

      it("locks and unlocks a merge event", async () => {
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        const fixture1 = await createTestTicketFixture(tenantDb);
        const fixture2 = await createTestClientFixture(tenantDb, {
          queueId: fixture1.queueId,
        });

        await tenantDb
          .insertInto("queue_assignments")
          .values({ queue_id: fixture1.queueId, user_id: manager.id })
          .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
          .execute();

        const merge = await caller.tickets.mergeClients({
          primaryClientId: fixture1.clientId,
          secondaryClientId: fixture2.clientId,
          encryptedSnapshot: testEncryptedContent(0xab),
        });

        // Lock it
        await caller.tickets.lockMerge({
          mergeEventId: merge.id,
          locked: true,
        });

        // Undo should fail when locked (MergeError maps to INTERNAL_SERVER_ERROR)
        await expectTrpcError(
          caller.tickets.undoMerge({
            mergeEventId: merge.id,
            encryptedSnapshot: testEncryptedContent(0xbc),
          }),
          "INTERNAL_SERVER_ERROR",
        );

        // Unlock and undo should succeed
        await caller.tickets.lockMerge({
          mergeEventId: merge.id,
          locked: false,
        });
        const undo = await caller.tickets.undoMerge({
          mergeEventId: merge.id,
          encryptedSnapshot: testEncryptedContent(0xcd),
        });
        expect(undo.secondaryClientId).toBe(fixture2.clientId);
      });
    });

    // -----------------------------------------------------------------------
    // Queues (admin-only CRUD)
    // -----------------------------------------------------------------------

    describe("Queues", () => {
      it("creates a queue (admin-only)", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const queue = await caller.tickets.createQueue({
          encryptedName: testEncryptedContent(0xd1),
          escalateDays: 3,
        });

        expect(queue.id).toBeDefined();
      });

      it("lists queues (any volunteer)", async () => {
        const volunteer = await createTestUser(tenantDb);
        const caller = createAuthedCaller(volunteer);

        const queues = await caller.tickets.listQueues();
        expect(Array.isArray(queues)).toBe(true);
      });

      it("reorders queues (admin-only)", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const q1 = await caller.tickets.createQueue({
          encryptedName: testEncryptedContent(0xe1),
        });
        const q2 = await caller.tickets.createQueue({
          encryptedName: testEncryptedContent(0xe2),
        });

        // Use high sort_order values to avoid collisions with queues
        // created by other tests in the shared schema.
        await caller.tickets.reorderQueues([
          { queueId: q1.id, sortOrder: 9002 },
          { queueId: q2.id, sortOrder: 9001 },
        ]);

        const queues = await caller.tickets.listQueues();
        const q1After = queues.find((q) => q.id === q1.id);
        const q2After = queues.find((q) => q.id === q2.id);
        expect(q2After!.sortOrder).toBeLessThan(q1After!.sortOrder);
      });

      it("rejects queue creation from volunteer (requires admin)", async () => {
        const volunteer = await createTestUser(tenantDb);
        const caller = createAuthedCaller(volunteer);

        await expectTrpcError(
          caller.tickets.createQueue({
            encryptedName: testEncryptedContent(0xf1),
          }),
          "FORBIDDEN",
        );
      });
    });

    // -----------------------------------------------------------------------
    // Presets (manager-only)
    // -----------------------------------------------------------------------

    describe("Presets", () => {
      it("creates a preset reply (manager-only)", async () => {
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        const preset = await caller.tickets.createPreset({
          encryptedTitle: testEncryptedContent(0xa1),
          encryptedBody: testEncryptedContent(0xa2),
        });

        expect(preset.id).toBeDefined();
      });

      it("lists presets (any volunteer)", async () => {
        const volunteer = await createTestUser(tenantDb);
        const caller = createAuthedCaller(volunteer);

        const presets = await caller.tickets.listPresets({});
        expect(Array.isArray(presets)).toBe(true);
      });

      it("rejects preset creation from volunteer (requires manager)", async () => {
        const volunteer = await createTestUser(tenantDb);
        const caller = createAuthedCaller(volunteer);

        await expectTrpcError(
          caller.tickets.createPreset({
            encryptedTitle: testEncryptedContent(0xb1),
            encryptedBody: testEncryptedContent(0xb2),
          }),
          "FORBIDDEN",
        );
      });
    });

    // -----------------------------------------------------------------------
    // Watchers / Queue Members
    // -----------------------------------------------------------------------

    describe("Watchers and Queue Members", () => {
      it("subscribes to and unsubscribes from ticket watching", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        await caller.tickets.watchTicket({ ticketId });

        const watching = await caller.tickets.isWatching({ ticketId });
        expect(watching).toBe(true);

        await caller.tickets.unwatchTicket({ ticketId });

        const notWatching = await caller.tickets.isWatching({ ticketId });
        expect(notWatching).toBe(false);
      });

      it("adds a queue member (admin-only)", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const target = await createTestUser(tenantDb);
        const queue = await createTestQueue(tenantDb);

        const caller = createAuthedCaller(admin);
        await caller.tickets.addQueueMember({
          queueId: queue.id,
          userId: target.id,
        });

        const members = await caller.tickets.listQueueMembers({
          queueId: queue.id,
        });
        expect(members).toContain(target.id);
      });

      it("rejects addQueueMember from volunteer (requires admin)", async () => {
        const volunteer = await createTestUser(tenantDb);
        const queue = await createTestQueue(tenantDb);
        const caller = createAuthedCaller(volunteer);

        await expectTrpcError(
          caller.tickets.addQueueMember({
            queueId: queue.id,
            userId: volunteer.id,
          }),
          "FORBIDDEN",
        );
      });
    });

    // -----------------------------------------------------------------------
    // Media (recording + attachment listing)
    // -----------------------------------------------------------------------

    describe("Media", () => {
      it("lists recordings for a ticket (empty when none)", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const result = await caller.tickets.listRecordings({ ticketId });
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });

      it("lists attachments for a ticket (empty when none)", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const result = await caller.tickets.listAttachments({ ticketId });
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });
    });

    // -----------------------------------------------------------------------
    // Rewrap (re-encryption of follow-up content)
    // -----------------------------------------------------------------------

    describe("Rewrap", () => {
      it("rewraps a follow-up with a temp key generation", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        // Create a follow-up with a key_generation (simulates tk_temp)
        const tempKeyGen = randomUUID();
        const followUpRow = await tenantDb
          .insertInto("followups")
          .values({
            ticket_id: ticketId,
            source: "telephony",
            type: "call_recording",
            encrypted_content: Buffer.alloc(64, 0x11),
            key_generation: tempKeyGen,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const result = await caller.tickets.rewrapFollowUp({
          followUpId: followUpRow.id,
          encryptedContent: testEncryptedContent(0x22),
        });

        expect(result.rewrapped).toBe(true);

        // Verify key_generation is now null (content is in canonical tk)
        const row = await tenantDb
          .selectFrom("followups")
          .select("key_generation")
          .where("id", "=", followUpRow.id)
          .executeTakeFirstOrThrow();
        expect(row.key_generation).toBeNull();
      });

      it("returns rewrapped: false for already-rewrapped content", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        // Create a follow-up WITHOUT key_generation (already canonical)
        const followUpRow = await tenantDb
          .insertInto("followups")
          .values({
            ticket_id: ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.alloc(64, 0x33),
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const result = await caller.tickets.rewrapFollowUp({
          followUpId: followUpRow.id,
          encryptedContent: testEncryptedContent(0x44),
        });

        expect(result.rewrapped).toBe(false);
      });
    });

    // -----------------------------------------------------------------------
    // Read Cursors
    // -----------------------------------------------------------------------

    describe("Read Cursors", () => {
      it("gets or creates a read cursor for a ticket", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const cursor = await caller.tickets.getReadCursor({ ticketId });
        expect(cursor).toBeDefined();
        expect(cursor.ticketId).toBe(ticketId);
      });

      it("updates a read cursor", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        // Ensure cursor exists
        await caller.tickets.getReadCursor({ ticketId });

        await caller.tickets.updateReadCursor({
          ticketId,
          encryptedReadCursor: testEncryptedContent(0x55),
        });

        const cursor = await caller.tickets.getReadCursor({ ticketId });
        expect(cursor.encryptedReadCursor).not.toBeNull();
      });
    });

    // -----------------------------------------------------------------------
    // Dashboard endpoints
    // -----------------------------------------------------------------------

    describe("Dashboard", () => {
      it("returns myQueues scoped to user membership", async () => {
        const { user, queueId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const queues = await caller.tickets.myQueues();
        const ids = queues.map((q) => q.id);
        expect(ids).toContain(queueId);
      });

      it("returns dashboardInfo stub", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        const info = await caller.tickets.dashboardInfo();
        expect(info.shift).toBeDefined();
        expect(info.shift.volunteersOnShift).toBe(3);
      });
    });

    // -----------------------------------------------------------------------
    // Dependencies
    // -----------------------------------------------------------------------

    describe("Dependencies", () => {
      it("adds and removes a dependency between tickets", async () => {
        const { user, ticketId, queueId } = await setupUserWithTicket();
        // Second ticket in the same queue so user has access
        const fixture2 = await createTestTicketFixture(tenantDb, {
          queueId,
        });

        const caller = createAuthedCaller(user);

        const dep = await caller.tickets.addDependency({
          ticketId: ticketId,
          dependsOnTicketId: fixture2.ticketId,
        });
        expect(dep.ticketId).toBe(ticketId);
        expect(dep.dependsOnTicketId).toBe(fixture2.ticketId);

        const deps = await caller.tickets.listDependencies({
          ticketId,
        });
        expect(deps.length).toBeGreaterThanOrEqual(1);

        await caller.tickets.removeDependency({
          ticketId,
          dependsOnTicketId: fixture2.ticketId,
        });

        const depsAfter = await caller.tickets.listDependencies({
          ticketId,
        });
        expect(
          depsAfter.some((d) => d.dependsOnTicketId === fixture2.ticketId),
        ).toBe(false);
      });
    });

    // -----------------------------------------------------------------------
    // Volunteers list (for @mention autocomplete)
    // -----------------------------------------------------------------------

    describe("Volunteers", () => {
      it("lists active volunteers", async () => {
        const user = await createTestUser(tenantDb);
        const caller = createAuthedCaller(user);

        const volunteers = await caller.tickets.listVolunteers();
        expect(Array.isArray(volunteers)).toBe(true);
        expect(volunteers.some((v) => v.id === user.id)).toBe(true);
      });
    });
  },
);
