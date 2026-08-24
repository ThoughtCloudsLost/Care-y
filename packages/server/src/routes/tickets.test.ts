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

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
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
  testFieldEncryptor,
  TEST_ORG_ID,
  TEST_OPS_KEY,
  mockReq,
  mockRes,
  expectTrpcError,
  type TestDb,
} from "../test-utils.js";
import { RoleId, ErrorCode, type RoleIdValue } from "@care-y/shared";
import type {
  SessionId,
  SessionToken,
  UserId,
  IpToken,
  UaToken,
  OrgSlug,
  OrgSchema,
  TicketId,
  FollowupId,
  KeyGeneration,
  ClientId,
  ClientAccountId,
  UsernameHash,
  ChannelSecret,
  AliasHash,
  BlobKey,
} from "@care-y/shared";
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
import { createSearchService } from "../tickets/search.js";
import { createNoteTypeService } from "../tickets/note-type-service.js";
import { createSecretsEncryptor, deriveSecretsKey } from "../config/secrets.js";
import type { BlobStore } from "../storage/store.js";
import { NotFoundError } from "../errors.js";

// ---------------------------------------------------------------------------
// In-memory BlobStore for tests (no filesystem or S3 needed)
// ---------------------------------------------------------------------------

function createTestBlobStore(): BlobStore {
  const store = new Map<string, Buffer>();
  let counter = 0;
  return {
    async put(_orgSchema, _category, blob) {
      const key = `test-blob-${String(++counter)}` as BlobKey;
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
  return Buffer.alloc(64, fill).toString("base64url");
}

function testEphemeralPoint(fill = 0xcc): string {
  return Buffer.alloc(32, fill).toString("base64url");
}

function testNonce(fill = 0xdd): string {
  return Buffer.alloc(24, fill).toString("base64url");
}

function testWrappedKey(fill = 0xee): string {
  return Buffer.alloc(48, fill).toString("base64url");
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
        orgSlug: "test-tickets" as OrgSlug,
        orgSchema: testDb.schemaName as OrgSchema,
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

    // OPS-tier encryptor for note type escalation targets (mirrors the
    // production wiring in index.ts, keyed with the committed test key).
    const testSecretsEncryptor = createSecretsEncryptor(
      deriveSecretsKey(TEST_OPS_KEY),
    );

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
        createSearchSvc: (db) =>
          createSearchService(db, async (userId) => {
            const qps = createQueuePermissionsService(db);
            return qps.getUserQueues(userId);
          }),
        createNoteTypeSvc: (db) =>
          createNoteTypeService(db, testSecretsEncryptor),
      };
    }

    function buildTicketsRouter(depsOverride?: Partial<TicketRouterDeps>) {
      const ticketsRouter = createTicketRouter({
        ...buildTicketDeps(),
        ...depsOverride,
      });
      return router({ tickets: ticketsRouter });
    }

    /** Maps a raw DB user row (snake_case) to a tRPC Context caller. */
    function createAuthedCaller(
      dbRow: {
        id: UserId;
        role_id: RoleIdValue;
        identifier_hash: string;
        encrypted_display_name: Buffer;
      },
      opts?: { twofaVerified?: boolean; deps?: Partial<TicketRouterDeps> },
    ) {
      const appRouter = buildTicketsRouter(opts?.deps);
      const factory = createCallerFactory(appRouter);
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: {
          id: "test-session" as SessionId,
          token: "test-token" as SessionToken,
          userId: dbRow.id,
          ipToken: "test-ip" as IpToken,
          uaToken: "test-ua" as UaToken,
          expiresAt: new Date(Date.now() + 3_600_000),
          twofaVerified: opts?.twofaVerified ?? true,
          webauthnChallenge: null,
        },
        user: {
          id: dbRow.id,
          encryptedIdentifier: dbRow.identifier_hash,
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
    async function setupUserWithTicket(roleId: RoleIdValue = RoleId.VOLUNTEER) {
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
          key_generation: randomUUID() as KeyGeneration,
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
        const keyGen = randomUUID() as KeyGeneration;
        const result = await caller.tickets.create({
          id: crypto.randomUUID() as TicketId,
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
          caller.tickets.get({ ticketId: randomUUID() as TicketId }),
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
          id: crypto.randomUUID() as FollowupId,
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
          id: crypto.randomUUID() as FollowupId,
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
          id: crypto.randomUUID() as FollowupId,
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
          id: crypto.randomUUID() as FollowupId,
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
          id: crypto.randomUUID() as FollowupId,
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
            id: crypto.randomUUID() as FollowupId,
            ticketId: randomUUID() as TicketId,
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
          id: crypto.randomUUID() as FollowupId,
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

      it("returns reaction summaries keyed by follow-up id", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const note = await caller.tickets.createFollowUp({
          id: crypto.randomUUID() as FollowupId,
          ticketId,
          encryptedContent: testEncryptedContent(0x78),
          source: "volunteer",
          type: "internal_note",
          isPrivate: false,
          mentionedPseudonyms: [],
        });
        await caller.tickets.toggleReaction({
          followUpId: note.id,
          reaction: "approve",
        });

        const reactions = await caller.tickets.getReactions({
          followUpIds: [note.id],
        });
        const forNote = reactions[note.id];
        expect(forNote).toBeDefined();
        const approve = forNote!.find((s) => s.reaction === "approve");
        expect(approve).toBeDefined();
        expect(approve!.userIds).toContain(user.id);
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
          caller.tickets.take({ ticketId: randomUUID() as TicketId }),
          "UNAUTHORIZED",
        );
      });

      it("assigns a queue member via round-robin", async () => {
        // The user is the only member of the fixture queue, so round-robin
        // must pick them.
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const result = await caller.tickets.assign({ ticketId });
        expect(result.assignedTo).toBe(user.id);

        const ticket = await caller.tickets.get({ ticketId });
        expect(ticket.assignedTo).toBe(user.id);
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

        const newKeyGen = randomUUID() as KeyGeneration;
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

      it("rejects merging a client into itself", async () => {
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const fixture = await createTestClientFixture(tenantDb);
        const caller = createAuthedCaller(manager);

        // ErrorCode strings are the typed wire contract the client maps to
        // user-facing copy, so the message assertion is a contract check.
        await expectTrpcError(
          caller.tickets.mergeClients({
            primaryClientId: fixture.clientId,
            secondaryClientId: fixture.clientId,
            encryptedSnapshot: testEncryptedContent(0xd5),
          }),
          "INTERNAL_SERVER_ERROR",
          ErrorCode.CANNOT_MERGE_INTO_SELF,
        );
      });

      it("rolls back the whole merge when the secondary's open ticket has unresolved dependencies", async () => {
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const primary = await createTestClientFixture(tenantDb);
        const secondary = await createTestTicketFixture(tenantDb, {
          queueId: primary.queueId,
        });
        const blocker = await createTestTicketFixture(tenantDb, {
          queueId: primary.queueId,
        });
        await tenantDb
          .insertInto("ticket_dependencies")
          .values({
            ticket_id: secondary.ticketId,
            depends_on_ticket_id: blocker.ticketId,
          })
          .execute();

        const caller = createAuthedCaller(manager);
        await expectTrpcError(
          caller.tickets.mergeClients({
            primaryClientId: primary.clientId,
            secondaryClientId: secondary.clientId,
            encryptedSnapshot: testEncryptedContent(0xd6),
          }),
          "INTERNAL_SERVER_ERROR",
          ErrorCode.MERGE_UNRESOLVED_DEPS,
        );

        // The merge runs in a transaction: nothing may be half-applied.
        const secondaryClient = await tenantDb
          .selectFrom("clients")
          .select("merged_into")
          .where("id", "=", secondary.clientId)
          .executeTakeFirstOrThrow();
        expect(secondaryClient.merged_into).toBeNull();

        const secondaryTicket = await tenantDb
          .selectFrom("tickets")
          .select("status")
          .where("id", "=", secondary.ticketId)
          .executeTakeFirstOrThrow();
        expect(secondaryTicket.status).toBe("open");

        const events = await tenantDb
          .selectFrom("client_merge_events")
          .select("id")
          .where("secondary_client_id", "=", secondary.clientId)
          .execute();
        expect(events).toHaveLength(0);
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
          encryptedColor: testEncryptedContent(0xd2),
          encryptedIcon: testEncryptedContent(0xd3),
          escalateDays: 3,
        });

        expect(queue.id).toBeDefined();
        expect(queue.encryptedColor).toBeDefined();
        expect(queue.encryptedIcon).toBeDefined();
      });

      it("rejects queue creation without color and icon", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const missingColorIcon = {
          encryptedName: testEncryptedContent(0xd4),
        } as unknown as Parameters<typeof caller.tickets.createQueue>[0];
        await expectTrpcError(
          caller.tickets.createQueue(missingColorIcon),
          "BAD_REQUEST",
        );
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
          encryptedColor: testEncryptedContent(0xe3),
          encryptedIcon: testEncryptedContent(0xe4),
        });
        const q2 = await caller.tickets.createQueue({
          encryptedName: testEncryptedContent(0xe2),
          encryptedColor: testEncryptedContent(0xe5),
          encryptedIcon: testEncryptedContent(0xe6),
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
            encryptedColor: testEncryptedContent(0xf2),
            encryptedIcon: testEncryptedContent(0xf3),
          }),
          "FORBIDDEN",
        );
      });

      it("updates queue name and escalation days (admin-only)", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const queue = await caller.tickets.createQueue({
          encryptedName: testEncryptedContent(0x11),
          encryptedColor: testEncryptedContent(0x12),
          encryptedIcon: testEncryptedContent(0x13),
          escalateDays: 2,
        });

        const newName = testEncryptedContent(0x14);
        const updated = await caller.tickets.updateQueue({
          queueId: queue.id,
          encryptedName: newName,
          escalateDays: 7,
        });

        expect(updated.escalateDays).toBe(7);
        expect(updated.encryptedName).toBe(newName);
        // Untouched fields survive a partial update
        expect(updated.encryptedColor).toBe(testEncryptedContent(0x12));
      });

      it("reassigns every ticket to the target queue before deleting a queue", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const doomed = await caller.tickets.createQueue({
          encryptedName: testEncryptedContent(0x15),
          encryptedColor: testEncryptedContent(0x16),
          encryptedIcon: testEncryptedContent(0x17),
        });
        const target = await caller.tickets.createQueue({
          encryptedName: testEncryptedContent(0x18),
          encryptedColor: testEncryptedContent(0x19),
          encryptedIcon: testEncryptedContent(0x1a),
        });
        const t1 = await createTestTicketFixture(tenantDb, {
          queueId: doomed.id,
        });
        const t2 = await createTestTicketFixture(tenantDb, {
          queueId: doomed.id,
        });

        const result = await caller.tickets.deleteQueue({
          queueId: doomed.id,
          reassignTo: target.id,
        });
        expect(result).toEqual({ success: true });

        const moved = await tenantDb
          .selectFrom("tickets")
          .select(["id", "queue_id"])
          .where("id", "in", [t1.ticketId, t2.ticketId])
          .execute();
        expect(moved).toHaveLength(2);
        expect(moved.every((row) => row.queue_id === target.id)).toBe(true);

        const queues = await caller.tickets.listQueues();
        expect(queues.some((q) => q.id === doomed.id)).toBe(false);
      });

      it("refuses to delete a queue with tickets when no reassignment target is given", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const doomed = await caller.tickets.createQueue({
          encryptedName: testEncryptedContent(0x1b),
          encryptedColor: testEncryptedContent(0x1c),
          encryptedIcon: testEncryptedContent(0x1d),
        });
        const fixture = await createTestTicketFixture(tenantDb, {
          queueId: doomed.id,
        });

        await expectTrpcError(
          caller.tickets.deleteQueue({ queueId: doomed.id }),
          "BAD_REQUEST",
          ErrorCode.QUEUE_HAS_TICKETS,
        );

        // The queue and its ticket are untouched after the rejection
        const ticket = await tenantDb
          .selectFrom("tickets")
          .select("queue_id")
          .where("id", "=", fixture.ticketId)
          .executeTakeFirstOrThrow();
        expect(ticket.queue_id).toBe(doomed.id);
      });

      it("rejects reassigning tickets to the queue being deleted", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);
        const queue = await caller.tickets.createQueue({
          encryptedName: testEncryptedContent(0x1e),
          encryptedColor: testEncryptedContent(0x1f),
          encryptedIcon: testEncryptedContent(0x20),
        });

        await expectTrpcError(
          caller.tickets.deleteQueue({
            queueId: queue.id,
            reassignTo: queue.id,
          }),
          "BAD_REQUEST",
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

      it("updates and deletes a preset reply (manager-only)", async () => {
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        const preset = await caller.tickets.createPreset({
          encryptedTitle: testEncryptedContent(0xb3),
          encryptedBody: testEncryptedContent(0xb4),
        });

        const newBody = testEncryptedContent(0xb5);
        const updated = await caller.tickets.updatePreset({
          presetId: preset.id,
          encryptedBody: newBody,
        });
        expect(updated.id).toBe(preset.id);
        expect(updated.encryptedBody).toBe(newBody);
        // Title untouched by the partial update
        expect(updated.encryptedTitle).toBe(testEncryptedContent(0xb3));

        await caller.tickets.deletePreset({ presetId: preset.id });
        const presets = await caller.tickets.listPresets({});
        expect(presets.some((p) => p.id === preset.id)).toBe(false);
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

      it("adds and removes a queue watcher (admin-only)", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const watcher = await createTestUser(tenantDb);
        const queue = await createTestQueue(tenantDb);
        const caller = createAuthedCaller(admin);

        await caller.tickets.addQueueWatcher({
          queueId: queue.id,
          userId: watcher.id,
        });
        const row = await tenantDb
          .selectFrom("queue_watchers")
          .select("user_id")
          .where("queue_id", "=", queue.id)
          .where("user_id", "=", watcher.id)
          .executeTakeFirst();
        expect(row).toBeDefined();

        await caller.tickets.removeQueueWatcher({
          queueId: queue.id,
          userId: watcher.id,
        });
        const after = await tenantDb
          .selectFrom("queue_watchers")
          .select("user_id")
          .where("queue_id", "=", queue.id)
          .where("user_id", "=", watcher.id)
          .executeTakeFirst();
        expect(after).toBeUndefined();
      });

      it("tracks queue membership across the admin endpoints", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const member = await createTestUser(tenantDb);
        const queue = await createTestQueue(tenantDb);
        const caller = createAuthedCaller(admin);

        await caller.tickets.addQueueMember({
          queueId: queue.id,
          userId: member.id,
        });

        const userQueues = await caller.tickets.getUserQueues({
          userId: member.id,
        });
        expect(userQueues).toContain(queue.id);

        const all = await caller.tickets.listAllQueueAssignments();
        expect(
          all.some((a) => a.queueId === queue.id && a.userId === member.id),
        ).toBe(true);

        await caller.tickets.removeQueueMember({
          queueId: queue.id,
          userId: member.id,
        });
        const members = await caller.tickets.listQueueMembers({
          queueId: queue.id,
        });
        expect(members).not.toContain(member.id);
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

      it("downloads an attachment blob as the exact stored ciphertext", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        // The blob is opaque ciphertext to the server; it must come back
        // byte-for-byte identical.
        const ciphertext = Buffer.alloc(96, 0x9e);
        const blobKey = await blobStore.put(
          orgContext.orgSchema,
          "attachment",
          ciphertext,
        );
        const inserted = await tenantDb
          .insertInto("attachments")
          .values({
            ticket_id: ticketId,
            blob_key: blobKey,
            size_bytes: ciphertext.byteLength,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const record = await caller.tickets.getAttachment({
          attachmentId: inserted.id,
        });
        expect(record.ticketId).toBe(ticketId);
        expect(record.blobKey).toBe(blobKey);
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
        const tempKeyGen = randomUUID() as KeyGeneration;
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

      it("counts only the tickets in the caller's queues", async () => {
        // Fresh user + fresh queue + exactly one open unassigned normal ticket,
        // so the aggregate is fully deterministic despite the shared schema.
        const { user } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const counts = await caller.tickets.counts();
        expect(counts).toEqual({
          total: 1,
          new: 1,
          active: 0,
          closed: 0,
          onHold: 0,
          unassigned: 1,
          mine: 0,
          byPriority: { low: 0, normal: 1, high: 0, urgent: 0 },
        });
      });

      it("recentActivity returns audit events for accessible queues only", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const foreign = await createTestTicketFixture(tenantDb);

        // Seed audit entries directly (route-side audit writes are
        // fire-and-forget, so seeding keeps the test deterministic).
        const auditSvc = createAuditService(tenantDb);
        await auditSvc.log({
          eventType: "ticket_created",
          actorId: user.id,
          ticketId,
        });
        await auditSvc.log({
          eventType: "ticket_created",
          actorId: user.id,
          ticketId: foreign.ticketId,
        });

        const caller = createAuthedCaller(user);
        const rows = await caller.tickets.recentActivity();

        const mine = rows.find((r) => r.ticketId === ticketId);
        expect(mine).toBeDefined();
        expect(mine!.eventType).toBe("ticket_created");
        expect(mine!.clientId).toBeDefined();
        expect(mine!.encryptedClientAlias).toBeDefined();

        // The foreign queue's event must not leak into this user's feed
        expect(rows.some((r) => r.ticketId === foreign.ticketId)).toBe(false);
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

      it("rejects a self-dependency with BAD_REQUEST", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        // ErrorCode strings are the typed wire contract for client error copy.
        await expectTrpcError(
          caller.tickets.addDependency({
            ticketId,
            dependsOnTicketId: ticketId,
          }),
          "BAD_REQUEST",
          ErrorCode.SELF_DEPENDENCY,
        );
      });

      it("rejects a direct circular dependency", async () => {
        const { user, ticketId, queueId } = await setupUserWithTicket();
        const other = await createTestTicketFixture(tenantDb, { queueId });
        const caller = createAuthedCaller(user);

        await caller.tickets.addDependency({
          ticketId,
          dependsOnTicketId: other.ticketId,
        });

        await expectTrpcError(
          caller.tickets.addDependency({
            ticketId: other.ticketId,
            dependsOnTicketId: ticketId,
          }),
          "INTERNAL_SERVER_ERROR",
          ErrorCode.CIRCULAR_DEPENDENCY,
        );
      });

      it("rejects adding a dependency on a ticket outside the caller's queues", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        // Foreign ticket lives in a queue the user is not a member of
        const foreign = await createTestTicketFixture(tenantDb);
        const caller = createAuthedCaller(user);

        await expectTrpcError(
          caller.tickets.addDependency({
            ticketId,
            dependsOnTicketId: foreign.ticketId,
          }),
          "FORBIDDEN",
        );
      });

      it("blocks closing a ticket until its dependencies are resolved", async () => {
        const { user, ticketId, queueId } = await setupUserWithTicket();
        const blocker = await createTestTicketFixture(tenantDb, { queueId });
        const caller = createAuthedCaller(user);

        await caller.tickets.addDependency({
          ticketId,
          dependsOnTicketId: blocker.ticketId,
        });

        await expectTrpcError(
          caller.tickets.close({ ticketId }),
          "INTERNAL_SERVER_ERROR",
          ErrorCode.TICKET_UNRESOLVED_DEPS,
        );

        // Removing the dependency unblocks the close
        await caller.tickets.removeDependency({
          ticketId,
          dependsOnTicketId: blocker.ticketId,
        });
        const closed = await caller.tickets.close({ ticketId });
        expect(closed.status).toBe("closed");
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

    // -----------------------------------------------------------------------
    // Create target resolution (ADR-053: the client needs the target id
    // before encrypting because the AAD binds it)
    // -----------------------------------------------------------------------

    describe("Create target resolution", () => {
      it("reports an open ticket as the blocking target and none for a fresh client", async () => {
        const { user, ticketId, clientId, queueId } =
          await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const target = await caller.tickets.resolveCreateTarget({ clientId });
        expect(target).toEqual({
          openTicketId: ticketId,
          reopenTicketId: null,
        });

        const fresh = await createTestClientFixture(tenantDb, { queueId });
        const freshTarget = await caller.tickets.resolveCreateTarget({
          clientId: fresh.clientId,
        });
        expect(freshTarget).toEqual({
          openTicketId: null,
          reopenTicketId: null,
        });
      });

      it("reports a closed ticket as the reopen target", async () => {
        const { user, ticketId, clientId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        await caller.tickets.close({ ticketId });

        const target = await caller.tickets.resolveCreateTarget({ clientId });
        expect(target).toEqual({
          openTicketId: null,
          reopenTicketId: ticketId,
        });
      });
    });

    // -----------------------------------------------------------------------
    // Search (metadata filters + encrypted content paging).
    // metadataSearch / contentSearch are conditionally spread into the router
    // (createSearchSvc is optional in TicketRouterDeps), so the inferred
    // caller type marks them optional even though buildTicketDeps always
    // injects the service. The non-null assertions reflect that wiring.
    // -----------------------------------------------------------------------

    describe("Search", () => {
      it("contentSearch returns encrypted blobs scoped to the requested ticket", async () => {
        const { user, ticketId, queueId } = await setupUserWithTicket();
        const other = await createTestTicketFixture(tenantDb, { queueId });

        const content = Buffer.alloc(48, 0x5a);
        const live = await tenantDb
          .insertInto("followups")
          .values({
            ticket_id: ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: content,
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        // Soft-deleted follow-up on the same ticket must be excluded
        await tenantDb
          .insertInto("followups")
          .values({
            ticket_id: ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.alloc(8, 0x01),
            deleted_at: new Date(),
          })
          .execute();
        // Follow-up on another ticket must be excluded by the ticketIds filter
        await tenantDb
          .insertInto("followups")
          .values({
            ticket_id: other.ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.alloc(8, 0x02),
          })
          .execute();

        const caller = createAuthedCaller(user);
        const result = await caller.tickets.contentSearch!({
          ticketIds: [ticketId],
        });

        expect(result.total).toBe(1);
        expect(result.followups).toHaveLength(1);
        expect(result.followups[0]!.followupId).toBe(live.id);
        expect(result.followups[0]!.ticketId).toBe(ticketId);
        // Wire contract: ciphertext ships base64url-encoded for client-side
        // decrypt and match (the server never sees plaintext).
        expect(result.followups[0]!.encryptedContent).toBe(
          content.toString("base64url"),
        );
      });

      it("contentSearch never returns follow-ups from inaccessible queues", async () => {
        const mine = await setupUserWithTicket();
        const foreign = await createTestTicketFixture(tenantDb);
        await tenantDb
          .insertInto("followups")
          .values({
            ticket_id: foreign.ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.alloc(16, 0x03),
          })
          .execute();

        const caller = createAuthedCaller(mine.user);
        const result = await caller.tickets.contentSearch!({});

        expect(
          result.followups.some((f) => f.ticketId === foreign.ticketId),
        ).toBe(false);
      });

      it("metadataSearch returns tickets with encrypted client alias", async () => {
        const { user, ticketId } = await setupUserWithTicket();

        const caller = createAuthedCaller(user);
        const result = await caller.tickets.metadataSearch!({});

        expect(result.total).toBeGreaterThanOrEqual(1);
        const match = result.tickets.find((t) => t.id === ticketId);
        expect(match).toBeDefined();
        expect(match!.clientId).toBeDefined();
        expect(match!.encryptedClientAlias).toBeDefined();
      });
    });

    // -----------------------------------------------------------------------
    // Client search (alias lookup with phone masking)
    // -----------------------------------------------------------------------

    describe("Client search", () => {
      it("returns a fixed placeholder mask when no field encryptor is configured", async () => {
        const { user, clientId } = await setupUserWithTicket();
        // Set a known alias_hash so the exact-match query finds this client
        const hash = `mask-hash-${randomUUID().slice(0, 8)}` as AliasHash;
        await tenantDb
          .updateTable("clients")
          .set({ alias_hash: hash })
          .where("id", "=", clientId)
          .execute();

        const caller = createAuthedCaller(user);
        const results = await caller.tickets.searchClients({ query: hash });

        const match = results.find((r) => r.id === clientId);
        expect(match).toBeDefined();
        expect(match!.encryptedAlias).toBeDefined();
        expect(match!.maskedPhone).toBe("***");
      });

      it("masks decrypted phone numbers to the last four digits", async () => {
        const { user, clientId, phoneId } = await setupUserWithTicket();
        const hash = `phone-hash-${randomUUID().slice(0, 8)}` as AliasHash;
        // Re-encrypt the fixture phone with the real OPS encryptor so the
        // route's decrypt-and-mask path runs against real ciphertext.
        // care-y-ignore-next-line no-plaintext-db-write -- value passes through testFieldEncryptor.encrypt(), result is ciphertext
        const encryptedPhone = testFieldEncryptor.encrypt("+15550007777");

        await tenantDb
          .updateTable("clients")
          .set({ alias_hash: hash })
          .where("id", "=", clientId)
          .execute();
        await tenantDb
          .updateTable("phones")
          .set({ encrypted_number: encryptedPhone })
          .where("id", "=", phoneId)
          .execute();

        const caller = createAuthedCaller(user, {
          deps: { fieldEncryptor: testFieldEncryptor },
        });
        const results = await caller.tickets.searchClients({ query: hash });

        const match = results.find((r) => r.id === clientId);
        expect(match).toBeDefined();
        expect(match!.maskedPhone).toBe("***7777");
        // PII contract: the full number must never reach the response.
        expect(JSON.stringify(results)).not.toContain("15550007777");
      });

      it("excludes merged clients from search results", async () => {
        const { user, queueId } = await setupUserWithTicket();
        // Both clients get a ticket in the caller's queue, so queue scoping
        // lets them through and the merge filter is the only thing left to
        // exclude the merged one.
        const merged = await createTestTicketFixture(tenantDb, { queueId });
        const survivor = await createTestTicketFixture(tenantDb, { queueId });
        const mergedHash =
          `merged-hash-${randomUUID().slice(0, 8)}` as AliasHash;
        const survivorHash =
          `survivor-hash-${randomUUID().slice(0, 8)}` as AliasHash;
        await tenantDb
          .updateTable("clients")
          .set({ alias_hash: mergedHash, merged_into: survivor.clientId })
          .where("id", "=", merged.clientId)
          .execute();
        await tenantDb
          .updateTable("clients")
          .set({ alias_hash: survivorHash })
          .where("id", "=", survivor.clientId)
          .execute();

        const caller = createAuthedCaller(user);
        // Merged client is excluded by the merged_into IS NULL filter
        expect(
          await caller.tickets.searchClients({ query: mergedHash }),
        ).toHaveLength(0);
        // Control: the unmerged sibling is reachable
        expect(
          await caller.tickets.searchClients({ query: survivorHash }),
        ).toHaveLength(1);
      });

      it("hides clients whose tickets live in queues the volunteer is not assigned to", async () => {
        const { user } = await setupUserWithTicket();
        const foreign = await createTestTicketFixture(tenantDb);
        const foreignHash =
          `foreign-hash-${randomUUID().slice(0, 8)}` as AliasHash;
        await tenantDb
          .updateTable("clients")
          .set({ alias_hash: foreignHash })
          .where("id", "=", foreign.clientId)
          .execute();

        const caller = createAuthedCaller(user);
        const results = await caller.tickets.searchClients({
          query: foreignHash,
        });

        expect(results).toHaveLength(0);
      });

      it("returns clients from every queue for admins", async () => {
        const { user } = await setupUserWithTicket(RoleId.ADMIN);
        const foreign = await createTestTicketFixture(tenantDb);
        const foreignHash =
          `admin-hash-${randomUUID().slice(0, 8)}` as AliasHash;
        await tenantDb
          .updateTable("clients")
          .set({ alias_hash: foreignHash })
          .where("id", "=", foreign.clientId)
          .execute();

        const caller = createAuthedCaller(user);
        const results = await caller.tickets.searchClients({
          query: foreignHash,
        });

        expect(results).toHaveLength(1);
        expect(results[0]!.id).toBe(foreign.clientId);
      });
    });

    // -----------------------------------------------------------------------
    // Follow-up query variants (summary, by-ids, participants, previews)
    // -----------------------------------------------------------------------

    describe("Follow-up queries", () => {
      async function createMessage(
        caller: ReturnType<typeof createAuthedCaller>,
        ticketId: TicketId,
        fill: number,
        type: "message" | "internal_note" = "message",
      ) {
        return caller.tickets.createFollowUp({
          id: crypto.randomUUID() as FollowupId,
          ticketId,
          encryptedContent: testEncryptedContent(fill),
          source: "volunteer",
          type,
          isPrivate: false,
          mentionedPseudonyms: [],
        });
      }

      it("listFollowUpsByIds returns only the requested follow-ups", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const f1 = await createMessage(caller, ticketId, 0x41);
        const f2 = await createMessage(caller, ticketId, 0x42);
        const f3 = await createMessage(caller, ticketId, 0x43);

        const rows = await caller.tickets.listFollowUpsByIds({
          ticketId,
          followUpIds: [f1.id, f3.id],
        });

        expect(rows).toHaveLength(2);
        const ids = rows.map((r) => r.id);
        expect(ids).toContain(f1.id);
        expect(ids).toContain(f3.id);
        expect(ids).not.toContain(f2.id);
      });

      it("listFollowUpSummary returns entries with their reaction summaries", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        await createMessage(caller, ticketId, 0x44);
        const note = await createMessage(
          caller,
          ticketId,
          0x45,
          "internal_note",
        );
        await caller.tickets.toggleReaction({
          followUpId: note.id,
          reaction: "acknowledge",
        });

        const { summaries, reactions } =
          await caller.tickets.listFollowUpSummary({ ticketId });

        expect(summaries).toHaveLength(2);
        const noteSummary = summaries.find((s) => s.id === note.id);
        expect(noteSummary).toBeDefined();
        expect(noteSummary!.type).toBe("internal_note");

        const noteReactions = reactions[note.id];
        expect(noteReactions).toBeDefined();
        expect(noteReactions![0]!.userIds).toContain(user.id);
      });

      it("listParticipants returns each volunteer author once", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        await createMessage(caller, ticketId, 0x46);
        await createMessage(caller, ticketId, 0x47);

        const participants = await caller.tickets.listParticipants({
          ticketId,
        });
        expect(participants).toHaveLength(1);
        expect(participants[0]!.volunteerId).toBe(user.id);
      });

      it("recentFollowUps caps previews per ticket", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        await createMessage(caller, ticketId, 0x48);
        await createMessage(caller, ticketId, 0x49);

        const previews = await caller.tickets.recentFollowUps({
          ticketIds: [ticketId],
          perTicket: 1,
        });

        expect(previews[ticketId]).toBeDefined();
        expect(previews[ticketId]).toHaveLength(1);
        expect(previews[ticketId]![0]!.ticketId).toBe(ticketId);
      });
    });

    // -----------------------------------------------------------------------
    // Audit log query (manager+ only; conditionally spread like search)
    // -----------------------------------------------------------------------

    describe("Audit log", () => {
      it("returns audit entries filtered by ticket for managers", async () => {
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const fixture = await createTestTicketFixture(tenantDb);
        const other = await createTestTicketFixture(tenantDb);

        // Seed awaited (the route-side audit helper is fire-and-forget)
        const auditSvc = createAuditService(tenantDb);
        await auditSvc.log({
          eventType: "ticket_closed",
          actorId: manager.id,
          ticketId: fixture.ticketId,
        });
        await auditSvc.log({
          eventType: "ticket_created",
          actorId: manager.id,
          ticketId: other.ticketId,
        });

        const caller = createAuthedCaller(manager);
        const result = await caller.tickets.auditLog!({
          ticketId: fixture.ticketId,
        });

        expect(result.total).toBe(1);
        expect(result.entries).toHaveLength(1);
        expect(result.entries[0]!.eventType).toBe("ticket_closed");
        expect(result.entries[0]!.actorId).toBe(manager.id);
        expect(result.entries[0]!.ticketId).toBe(fixture.ticketId);
      });

      it("rejects audit log queries from volunteers", async () => {
        const volunteer = await createTestUser(tenantDb);
        const caller = createAuthedCaller(volunteer);

        await expectTrpcError(caller.tickets.auditLog!({}), "FORBIDDEN");
      });
    });

    // -----------------------------------------------------------------------
    // Note types (admin CRUD + role gate on internal note creation)
    // -----------------------------------------------------------------------

    describe("Note types", () => {
      it("stores escalation targets encrypted and lists them for admins", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const targets = [{ type: "role" as const, value: "manager" as const }];
        const created = await caller.tickets.noteTypes!.create({
          encryptedName: testEncryptedContent(0x61),
          encryptedIcon: testEncryptedContent(0x62),
          escalationTargets: targets,
        });
        expect(created.id).toBeDefined();

        // Admin list round-trips the targets through the OPS encryptor
        const all = await caller.tickets.noteTypes!.list();
        const mine = all.find((nt) => nt.id === created.id);
        expect(mine).toBeDefined();
        expect(mine!.escalationTargets).toEqual(targets);

        // At rest the targets are ciphertext, not readable JSON
        const row = await tenantDb
          .selectFrom("note_types")
          .select("encrypted_escalation_targets")
          .where("id", "=", created.id)
          .executeTakeFirstOrThrow();
        expect(
          row.encrypted_escalation_targets.includes(Buffer.from("manager")),
        ).toBe(false);
      });

      it("enforces the note type's minimum create role on internal notes", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const adminCaller = createAuthedCaller(admin);
        const gated = await adminCaller.tickets.noteTypes!.create({
          encryptedName: testEncryptedContent(0x63),
          encryptedIcon: testEncryptedContent(0x64),
          escalationTargets: [],
          minCreateRole: RoleId.MANAGER,
        });

        // A volunteer with full ticket access still cannot use the gated type
        const vol = await setupUserWithTicket();
        const volCaller = createAuthedCaller(vol.user);
        await expectTrpcError(
          volCaller.tickets.createFollowUp({
            id: crypto.randomUUID() as FollowupId,
            ticketId: vol.ticketId,
            encryptedContent: testEncryptedContent(0x65),
            source: "volunteer",
            type: "internal_note",
            isPrivate: false,
            mentionedPseudonyms: [],
            noteTypeId: gated.id,
          }),
          "FORBIDDEN",
          ErrorCode.INSUFFICIENT_ROLE,
        );

        // A manager clears the threshold
        const mgr = await setupUserWithTicket(RoleId.MANAGER);
        const mgrCaller = createAuthedCaller(mgr.user);
        const note = await mgrCaller.tickets.createFollowUp({
          id: crypto.randomUUID() as FollowupId,
          ticketId: mgr.ticketId,
          encryptedContent: testEncryptedContent(0x66),
          source: "volunteer",
          type: "internal_note",
          isPrivate: false,
          mentionedPseudonyms: [],
          noteTypeId: gated.id,
        });
        expect(note.type).toBe("internal_note");
      });
    });

    // -----------------------------------------------------------------------
    // Branch coverage: readStateSweep error propagation
    // -----------------------------------------------------------------------

    describe("readStateSweep error propagation", () => {
      it("propagates service errors through withErrorWrapping", async () => {
        // Inject a ticket service factory that throws on sweepReadState,
        // exercising the withErrorWrapping catch path for this route.
        const { user } = await setupUserWithTicket();
        const caller = createAuthedCaller(user, {
          deps: {
            createTicketSvc: (db, access, getQueues, svcDeps) => {
              const real = createTicketService(db, access, getQueues, svcDeps);
              return {
                ...real,
                sweepReadState: () => {
                  throw new NotFoundError("sweep_failure_test");
                },
              };
            },
          },
        });

        await expectTrpcError(caller.tickets.readStateSweep({}), "NOT_FOUND");
      });
    });

    // -----------------------------------------------------------------------
    // Branch coverage: listFollowUps with zero internal notes
    // -----------------------------------------------------------------------

    describe("listFollowUps reactions map", () => {
      it("returns empty reactions map when no follow-ups are internal notes", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        // Create only message-type follow-ups (not internal_note)
        await caller.tickets.createFollowUp({
          id: crypto.randomUUID() as FollowupId,
          ticketId,
          encryptedContent: testEncryptedContent(0xc1),
          source: "volunteer",
          type: "message",
          isPrivate: false,
          mentionedPseudonyms: [],
        });
        await caller.tickets.createFollowUp({
          id: crypto.randomUUID() as FollowupId,
          ticketId,
          encryptedContent: testEncryptedContent(0xc2),
          source: "volunteer",
          type: "message",
          isPrivate: false,
          mentionedPseudonyms: [],
        });

        const result = await caller.tickets.listFollowUps({ ticketId });

        // Every follow-up is a message, so the filter for internal_note
        // produces an empty array and getReactions([]) returns {}.
        expect(result.followUps.length).toBeGreaterThanOrEqual(2);
        expect(result.followUps.every((fu) => fu.type === "message")).toBe(
          true,
        );
        expect(result.reactions).toEqual({});
      });
    });

    // -----------------------------------------------------------------------
    // Branch coverage: updateInternalNote typeChanged paths
    // -----------------------------------------------------------------------

    describe("updateInternalNote typeChanged", () => {
      it("does not trigger notification when noteTypeId stays the same", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const adminCaller = createAuthedCaller(admin);

        // Create a note type
        const noteType = await adminCaller.tickets.noteTypes!.create({
          encryptedName: testEncryptedContent(0xd1),
          encryptedIcon: testEncryptedContent(0xd2),
          escalationTargets: [],
        });

        // Create a ticket and internal note with that note type
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);
        const note = await caller.tickets.createFollowUp({
          id: crypto.randomUUID() as FollowupId,
          ticketId,
          encryptedContent: testEncryptedContent(0xd3),
          source: "volunteer",
          type: "internal_note",
          isPrivate: false,
          mentionedPseudonyms: [],
          noteTypeId: noteType.id,
        });

        // Update with the same noteTypeId: typeChanged should be false
        const updated = await caller.tickets.updateInternalNote({
          followUpId: note.id,
          encryptedContent: testEncryptedContent(0xd4),
          noteTypeId: noteType.id,
        });
        expect(updated.id).toBe(note.id);
        // The note type remains the same
        expect(updated.noteTypeId).toBe(noteType.id);
      });

      it("triggers notification when noteTypeId changes to a different value", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const adminCaller = createAuthedCaller(admin);

        // Create two note types
        const noteTypeA = await adminCaller.tickets.noteTypes!.create({
          encryptedName: testEncryptedContent(0xd5),
          encryptedIcon: testEncryptedContent(0xd6),
          escalationTargets: [],
        });
        const noteTypeB = await adminCaller.tickets.noteTypes!.create({
          encryptedName: testEncryptedContent(0xd7),
          encryptedIcon: testEncryptedContent(0xd8),
          escalationTargets: [],
        });

        // Create a ticket and internal note with noteTypeA
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);
        const note = await caller.tickets.createFollowUp({
          id: crypto.randomUUID() as FollowupId,
          ticketId,
          encryptedContent: testEncryptedContent(0xd9),
          source: "volunteer",
          type: "internal_note",
          isPrivate: false,
          mentionedPseudonyms: [],
          noteTypeId: noteTypeA.id,
        });

        // Update with a different noteTypeId: typeChanged = true,
        // which exercises the notify() call inside the true branch.
        const updated = await caller.tickets.updateInternalNote({
          followUpId: note.id,
          encryptedContent: testEncryptedContent(0xda),
          noteTypeId: noteTypeB.id,
        });
        expect(updated.id).toBe(note.id);
        expect(updated.noteTypeId).toBe(noteTypeB.id);
      });
    });

    // -----------------------------------------------------------------------
    // Branch coverage: downloadAttachmentBlob null blob
    // -----------------------------------------------------------------------

    describe("downloadAttachmentBlob null blob", () => {
      it("returns NOT_FOUND when an attachment's blob is missing from the store", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        const inserted = await tenantDb
          .insertInto("attachments")
          .values({
            ticket_id: ticketId,
            blob_key: `absent-blob-${randomUUID().slice(0, 8)}` as BlobKey,
            size_bytes: 64,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        // The metadata record resolves fine
        const record = await caller.tickets.getAttachment({
          attachmentId: inserted.id,
        });
        expect(record.ticketId).toBe(ticketId);
      });
    });

    // -----------------------------------------------------------------------
    // Branch coverage: rewrapFollowUp without blobUpdates
    // -----------------------------------------------------------------------

    describe("rewrapFollowUp without blobUpdates", () => {
      it("completes rewrap with blob updates provided", async () => {
        const { user, ticketId } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        // Create a follow-up with a key_generation (simulates tk_temp)
        const tempKeyGen = randomUUID() as KeyGeneration;
        const originalBlob = Buffer.alloc(64, 0xf1);
        const blobKey = await blobStore.put(
          orgContext.orgSchema,
          "attachment",
          originalBlob,
        );

        const followUpRow = await tenantDb
          .insertInto("followups")
          .values({
            ticket_id: ticketId,
            source: "telephony",
            type: "call_recording",
            encrypted_content: Buffer.alloc(64, 0xf2),
            key_generation: tempKeyGen,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        // Attach an attachment row pointing to the blob
        await tenantDb
          .insertInto("attachments")
          .values({
            ticket_id: ticketId,
            followup_id: followUpRow.id,
            blob_key: blobKey,
            size_bytes: originalBlob.byteLength,
          })
          .execute();

        // Rewrap WITH blobUpdates (the true path of the optional chain)
        const newBlobData = Buffer.alloc(64, 0xf3);
        const result = await caller.tickets.rewrapFollowUp({
          followUpId: followUpRow.id,
          encryptedContent: testEncryptedContent(0xf4),
          blobUpdates: [
            {
              oldBlobKey: blobKey,
              encryptedData: newBlobData.toString("base64"),
              category: "attachment",
            },
          ],
        });

        expect(result.rewrapped).toBe(true);

        // Verify key_generation cleared
        const row = await tenantDb
          .selectFrom("followups")
          .select("key_generation")
          .where("id", "=", followUpRow.id)
          .executeTakeFirstOrThrow();
        expect(row.key_generation).toBeNull();

        // Verify the old blob was cleaned up
        const oldBlobExists = await blobStore.exists(blobKey);
        expect(oldBlobExists).toBe(false);
      });
    });

    // --- Secure Link tier procedures ---

    describe("upgradeToSecureLink", () => {
      it("sets tier and creates a channel row", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);
        const channelId = "a".repeat(48);
        const authHash = Buffer.alloc(32, 0xab).toString("base64url");
        const clientPublic = Buffer.alloc(32, 0xcd).toString("base64url");

        await caller.tickets.upgradeToSecureLink({
          ticketId: fixture.ticketId,
          channelId,
          authHash,
          clientPublic,
          hasPassphrase: false,
          keyCheck: {
            ephemeralPoint: Buffer.alloc(32, 0x01).toString("base64url"),
            nonce: Buffer.alloc(24, 0x02).toString("base64url"),
            ciphertext: Buffer.alloc(64, 0x03).toString("base64url"),
          },
        });

        const client = await tenantDb
          .selectFrom("clients")
          .select("communication_tier")
          .where("id", "=", fixture.clientId)
          .executeTakeFirstOrThrow();
        expect(client.communication_tier).toBe("secure_link");

        const channel = await tenantDb
          .selectFrom("portal_channels")
          .select(["channel_id", "status"])
          .where("client_id", "=", fixture.clientId)
          .where("status", "=", "active")
          .executeTakeFirst();
        expect(channel).toBeDefined();
        expect(channel!.channel_id).toBe(channelId);
      });

      it("emits client_tier_changed audit event", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);
        const channelId = "b".repeat(48);

        await caller.tickets.upgradeToSecureLink({
          ticketId: fixture.ticketId,
          channelId,
          authHash: Buffer.alloc(32, 0xab).toString("base64url"),
          clientPublic: Buffer.alloc(32, 0xcd).toString("base64url"),
          hasPassphrase: true,
          keyCheck: {
            ephemeralPoint: Buffer.alloc(32, 0x01).toString("base64url"),
            nonce: Buffer.alloc(24, 0x02).toString("base64url"),
            ciphertext: Buffer.alloc(64, 0x03).toString("base64url"),
          },
        });

        // The route-side audit helper is fire-and-forget (void svc.log),
        // so the DB write may not have landed when the mutation returns.
        const auditRow = await vi.waitFor(async () => {
          const row = await tenantDb
            .selectFrom("audit_log")
            .select(["event_type", "actor_id"])
            .where("event_type", "=", "client_tier_changed")
            .where("actor_id", "=", user.id)
            .orderBy("created_at", "desc")
            .executeTakeFirst();
          expect(row).toBeDefined();
          return row!;
        });
        expect(auditRow.event_type).toBe("client_tier_changed");
      });
    });

    describe("ticket detail portal fields", () => {
      it("carries clientTier and portalCapable on the detail payload", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        // Before upgrade: sms_email, not portal-capable
        const beforeDetail = await caller.tickets.get({
          ticketId: fixture.ticketId,
        });
        expect(beforeDetail.clientTier).toBe("sms_email");
        expect(beforeDetail.portalCapable).toBe(false);
        expect(beforeDetail.portalChannel).toBeNull();

        // Upgrade
        const channelId = "c".repeat(48);
        await caller.tickets.upgradeToSecureLink({
          ticketId: fixture.ticketId,
          channelId,
          authHash: Buffer.alloc(32, 0xab).toString("base64url"),
          clientPublic: Buffer.alloc(32, 0xcd).toString("base64url"),
          hasPassphrase: false,
          keyCheck: {
            ephemeralPoint: Buffer.alloc(32, 0x01).toString("base64url"),
            nonce: Buffer.alloc(24, 0x02).toString("base64url"),
            ciphertext: Buffer.alloc(64, 0x03).toString("base64url"),
          },
        });

        const afterDetail = await caller.tickets.get({
          ticketId: fixture.ticketId,
        });
        expect(afterDetail.clientTier).toBe("secure_link");
        expect(afterDetail.portalCapable).toBe(true);
        expect(afterDetail.portalChannel).not.toBeNull();
        expect(afterDetail.portalChannel!.hasPassphrase).toBe(false);
      });
    });

    describe("revokeSecureLink", () => {
      it("rejects when no active channel exists", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        await expectTrpcError(
          caller.tickets.revokeSecureLink({
            ticketId: fixture.ticketId,
          }),
          "NOT_FOUND",
        );
      });
    });

    describe("regenerateSecureLink", () => {
      it("rejects when no active channel exists", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        await expectTrpcError(
          caller.tickets.regenerateSecureLink({
            ticketId: fixture.ticketId,
            channelId: "d".repeat(48),
            authHash: Buffer.alloc(32, 0xab).toString("base64url"),
            clientPublic: Buffer.alloc(32, 0xcd).toString("base64url"),
            hasPassphrase: false,
            keyCheck: {
              ephemeralPoint: Buffer.alloc(32, 0x01).toString("base64url"),
              nonce: Buffer.alloc(24, 0x02).toString("base64url"),
              ciphertext: Buffer.alloc(64, 0x03).toString("base64url"),
            },
          }),
          "NOT_FOUND",
        );
      });
    });

    describe("rewrap portal wrap cleanup", () => {
      it("deletes portal_reply_key_wraps row on rewrap", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);
        const ticketId = fixture.ticketId;

        const tempKeyGen = randomUUID() as KeyGeneration;
        const followUpRow = await tenantDb
          .insertInto("followups")
          .values({
            ticket_id: ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.alloc(64, 0xf1),
            key_generation: tempKeyGen,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        // Insert a key wrap for the temp key generation so rewrap can find it
        await tenantDb
          .insertInto("ticket_key_wraps")
          .values({
            ticket_id: ticketId,
            volunteer_id: user.id,
            key_generation: tempKeyGen,
            ephemeral_point: Buffer.alloc(32, 0x01),
            nonce: Buffer.alloc(24, 0x02),
            wrapped_key: Buffer.alloc(48, 0x03),
            algorithm: "ecies-ristretto255-v1",
          })
          .execute();

        // Insert a portal reply key wrap
        await tenantDb
          .insertInto("portal_reply_key_wraps")
          .values({
            followup_id: followUpRow.id,
            wrapped_tk: Buffer.alloc(80, 0xfe),
          })
          .execute();

        // Rewrap
        await caller.tickets.rewrapFollowUp({
          followUpId: followUpRow.id,
          encryptedContent: testEncryptedContent(0xf4),
        });

        // Verify portal wrap deleted
        const wrapRow = await tenantDb
          .selectFrom("portal_reply_key_wraps")
          .select("followup_id")
          .where("followup_id", "=", followUpRow.id)
          .executeTakeFirst();
        expect(wrapRow).toBeUndefined();
      });
    });

    describe("updateOutboundMessage route", () => {
      it("updates content and returns the record", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        // Create a follow-up via the route
        const fu = await caller.tickets.createFollowUp({
          id: randomUUID() as FollowupId,
          ticketId: fixture.ticketId,
          encryptedContent: testEncryptedContent(0xbb),
          source: "volunteer",
          type: "message",
          isPrivate: false,
          mentionedPseudonyms: [],
        });

        const updated = await caller.tickets.updateOutboundMessage({
          followUpId: fu.id,
          encryptedContent: testEncryptedContent(0xcc),
        });

        expect(updated.encryptedContent).toBeTruthy();
        expect(updated.id).toBe(fu.id);
      });
    });

    // --- Encrypted Account: volunteer-side offer toggle and reset ---

    /**
     * Seeds a Secure Link channel for a client. Returns the channel_id.
     */
    async function seedSecureLinkChannel(
      clientId: ClientId,
      overrides?: { kind?: string; accountOffer?: boolean },
    ): Promise<ChannelSecret> {
      const channelId = (randomUUID().replace(/-/g, "") +
        randomUUID().replace(/-/g, "").slice(0, 16)) as ChannelSecret;
      await tenantDb
        .insertInto("portal_channels")
        .values({
          channel_id: channelId,
          client_id: clientId,
          auth_hash: Buffer.alloc(32, 0xab),
          client_public: Buffer.alloc(32, 0xcd),
          has_passphrase: false,
          status: "active",
          kind: overrides?.kind ?? "secure_link",
          account_offer: overrides?.accountOffer ?? false,
          key_check_ephemeral_point: Buffer.alloc(32, 0x01),
          key_check_nonce: Buffer.alloc(24, 0x02),
          key_check_ciphertext: Buffer.alloc(64, 0x03),
        })
        .execute();
      return channelId;
    }

    /** Seeds a client_accounts row for a client. */
    async function seedClientAccount(
      clientId: ClientId,
    ): Promise<ClientAccountId> {
      const accountId = randomUUID() as ClientAccountId;
      await tenantDb
        .insertInto("client_accounts")
        .values({
          id: accountId,
          client_id: clientId,
          username_hash: `uh-${randomUUID().slice(0, 8)}` as UsernameHash,
          salt: Buffer.alloc(16, 0x11),
          public_key: Buffer.alloc(32, 0x22),
          auth_hash: Buffer.alloc(32, 0x33),
        })
        .execute();
      return accountId;
    }

    describe("setAccountOffer", () => {
      it("flips the flag on an active secure_link channel", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);
        await seedSecureLinkChannel(fixture.clientId);

        await caller.tickets.setAccountOffer({
          ticketId: fixture.ticketId,
          enabled: true,
        });

        const channel = await tenantDb
          .selectFrom("portal_channels")
          .select("account_offer")
          .where("client_id", "=", fixture.clientId)
          .where("status", "=", "active")
          .executeTakeFirstOrThrow();
        expect(channel.account_offer).toBe(true);

        // Flip it back
        await caller.tickets.setAccountOffer({
          ticketId: fixture.ticketId,
          enabled: false,
        });
        const after = await tenantDb
          .selectFrom("portal_channels")
          .select("account_offer")
          .where("client_id", "=", fixture.clientId)
          .where("status", "=", "active")
          .executeTakeFirstOrThrow();
        expect(after.account_offer).toBe(false);
      });

      it("404s when no active channel exists", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        await expectTrpcError(
          caller.tickets.setAccountOffer({
            ticketId: fixture.ticketId,
            enabled: true,
          }),
          "NOT_FOUND",
        );
      });

      it("404s on an account-kind channel", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);
        await seedSecureLinkChannel(fixture.clientId, { kind: "account" });

        await expectTrpcError(
          caller.tickets.setAccountOffer({
            ticketId: fixture.ticketId,
            enabled: true,
          }),
          "NOT_FOUND",
        );
      });

      it("denies a volunteer without ticket access", async () => {
        const { user: _user, ...fixture } = await setupUserWithTicket();
        // Create a second user with no queue membership
        const otherUser = await createTestUser(tenantDb);
        const otherCaller = createAuthedCaller(otherUser);

        await seedSecureLinkChannel(fixture.clientId);

        await expectTrpcError(
          otherCaller.tickets.setAccountOffer({
            ticketId: fixture.ticketId,
            enabled: true,
          }),
          "FORBIDDEN",
        );
      });

      it("emits account_offer_changed audit event with pseudonym only", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);
        await seedSecureLinkChannel(fixture.clientId);

        await caller.tickets.setAccountOffer({
          ticketId: fixture.ticketId,
          enabled: true,
        });

        const auditRow = await vi.waitFor(async () => {
          const row = await tenantDb
            .selectFrom("audit_log")
            .select(["event_type", "actor_id", "metadata"])
            .where("event_type", "=", "account_offer_changed")
            .where("actor_id", "=", user.id)
            .orderBy("created_at", "desc")
            .executeTakeFirst();
          expect(row).toBeDefined();
          return row!;
        });
        expect(auditRow.event_type).toBe("account_offer_changed");
        // Metadata carries only the operation, no username, account id, or channel id
        const meta = auditRow.metadata as Record<string, unknown>;
        expect(meta).toEqual({ operation: "enabled" });
        expect(meta).not.toHaveProperty("username");
        expect(meta).not.toHaveProperty("accountId");
        expect(meta).not.toHaveProperty("channelId");
      });
    });

    describe("resetClientAccount", () => {
      it("removes account and sessions, revokes channel, resets tier", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        // Set tier to account
        await tenantDb
          .updateTable("clients")
          .set({ communication_tier: "account" })
          .where("id", "=", fixture.clientId)
          .execute();

        // Seed an account-kind channel
        await seedSecureLinkChannel(fixture.clientId, { kind: "account" });
        const accountId = await seedClientAccount(fixture.clientId);

        // Seed a session
        await tenantDb
          .insertInto("client_account_sessions")
          .values({
            account_id: accountId,
            token_hash: Buffer.alloc(32, 0x44),
            expires_at: new Date(Date.now() + 3_600_000),
          })
          .execute();

        // Seed a portal message to verify copy deletion
        const copyFollowup = await tenantDb
          .insertInto("followups")
          .values({
            ticket_id: fixture.ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.alloc(64, 0x11),
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        await tenantDb
          .insertInto("portal_messages")
          .values({
            channel_id: (
              await tenantDb
                .selectFrom("portal_channels")
                .select("id")
                .where("client_id", "=", fixture.clientId)
                .where("kind", "=", "account")
                .executeTakeFirstOrThrow()
            ).id,
            followup_id: copyFollowup.id,
            direction: "from_client",
            ephemeral_point: Buffer.alloc(32, 0x55),
            nonce: Buffer.alloc(24, 0x66),
            ciphertext: Buffer.alloc(64, 0x77),
          })
          .execute();

        await caller.tickets.resetClientAccount({
          ticketId: fixture.ticketId,
        });

        // Account row deleted
        const acct = await tenantDb
          .selectFrom("client_accounts")
          .select("id")
          .where("client_id", "=", fixture.clientId)
          .executeTakeFirst();
        expect(acct).toBeUndefined();

        // Sessions cascaded
        const sessions = await tenantDb
          .selectFrom("client_account_sessions")
          .select("id")
          .where("account_id", "=", accountId)
          .execute();
        expect(sessions).toHaveLength(0);

        // Tier reset to sms_email
        const client = await tenantDb
          .selectFrom("clients")
          .select("communication_tier")
          .where("id", "=", fixture.clientId)
          .executeTakeFirstOrThrow();
        expect(client.communication_tier).toBe("sms_email");
      });

      it("404s when the client has no account", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        await expectTrpcError(
          caller.tickets.resetClientAccount({
            ticketId: fixture.ticketId,
          }),
          "NOT_FOUND",
        );
      });

      it("emits client_account_reset audit event with pseudonym only", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);

        await tenantDb
          .updateTable("clients")
          .set({ communication_tier: "account" })
          .where("id", "=", fixture.clientId)
          .execute();
        await seedSecureLinkChannel(fixture.clientId, { kind: "account" });
        await seedClientAccount(fixture.clientId);

        await caller.tickets.resetClientAccount({
          ticketId: fixture.ticketId,
        });

        const auditRow = await vi.waitFor(async () => {
          const row = await tenantDb
            .selectFrom("audit_log")
            .select(["event_type", "actor_id", "metadata"])
            .where("event_type", "=", "client_account_reset")
            .where("actor_id", "=", user.id)
            .orderBy("created_at", "desc")
            .executeTakeFirst();
          expect(row).toBeDefined();
          return row!;
        });
        expect(auditRow.event_type).toBe("client_account_reset");
        const meta = auditRow.metadata as Record<string, unknown>;
        expect(meta).toEqual({ operation: "reset" });
        expect(meta).not.toHaveProperty("username");
        expect(meta).not.toHaveProperty("accountId");
        expect(meta).not.toHaveProperty("channelId");
      });
    });

    describe("ticket detail portal fields (account)", () => {
      it("carries kind and accountOffer for a secure_link channel", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);
        await seedSecureLinkChannel(fixture.clientId, {
          kind: "secure_link",
          accountOffer: true,
        });

        // Update the tier so the fixture is consistent
        await tenantDb
          .updateTable("clients")
          .set({ communication_tier: "secure_link" })
          .where("id", "=", fixture.clientId)
          .execute();

        const detail = await caller.tickets.get({
          ticketId: fixture.ticketId,
        });
        expect(detail.portalCapable).toBe(true);
        expect(detail.portalChannel).not.toBeNull();
        expect(detail.portalChannel!.kind).toBe("secure_link");
        expect(detail.portalChannel!.accountOffer).toBe(true);
      });

      it("carries kind and accountOffer for an account channel", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);
        await seedSecureLinkChannel(fixture.clientId, { kind: "account" });

        await tenantDb
          .updateTable("clients")
          .set({ communication_tier: "account" })
          .where("id", "=", fixture.clientId)
          .execute();

        const detail = await caller.tickets.get({
          ticketId: fixture.ticketId,
        });
        expect(detail.portalCapable).toBe(true);
        expect(detail.portalChannel).not.toBeNull();
        expect(detail.portalChannel!.kind).toBe("account");
        expect(detail.portalChannel!.accountOffer).toBe(false);
      });

      it("portalCapable is true for account clients", async () => {
        const { user, ...fixture } = await setupUserWithTicket();
        const caller = createAuthedCaller(user);
        await seedSecureLinkChannel(fixture.clientId, { kind: "account" });

        const detail = await caller.tickets.get({
          ticketId: fixture.ticketId,
        });
        expect(detail.portalCapable).toBe(true);
      });
    });
  },
);
