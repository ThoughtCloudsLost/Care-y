/**
 * Integration tests for the portal message service.
 *
 * DB tests run inside Docker via `pnpm test:server:db`. Each suite
 * gets an isolated test schema created in beforeAll, dropped in afterAll.
 */

import crypto from "node:crypto";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
  type Mock,
} from "vitest";
import type { TestDb } from "../test-utils.js";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestQueue,
  createTestTicketFixture,
  noopEncryptor,
  testSealedBox,
} from "../test-utils.js";
import type { NotificationService } from "../notifications/service.js";
import type { TelephonyProvider } from "../telephony/provider.js";
import type { PortalChannelRow } from "./channel-service.js";
import {
  bootstrap,
  clientReply,
  storeClientCopy,
  nudgeClient,
  listMessages,
  hasRecentOrgReply,
  type PortalMessageServiceDeps,
  type PortalReplyServiceInput,
  type EciesTripleBuffers,
} from "./portal-message-service.js";
import { NotFoundError } from "../errors.js";
import {
  orgIdSchema,
  orgSchemaNameSchema,
  orgSlugIdSchema,
  newFollowupId,
  newAttachmentId,
  newRecordingId,
  newKeyGeneration,
  channelSecretSchema,
} from "@care-y/shared";
import type {
  ClientId,
  PortalMessageId,
  OrgSchema,
  BlobKey,
  TicketId,
} from "@care-y/shared";
import type { BlobStore } from "../storage/store.js";
import { insertClientRecordingWrap } from "./portal-recording-service.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockNotificationService(): NotificationService & {
  dispatch: Mock;
  dispatchTicketless: Mock;
} {
  return {
    dispatch: vi.fn().mockResolvedValue(undefined),
    dispatchTicketless: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockProvider(): TelephonyProvider & { sendSms: Mock } {
  return {
    sendSms: vi.fn().mockResolvedValue({ messageId: "msg-1" }),
    initiateOutboundCall: vi.fn().mockResolvedValue("call-1"),
    validateWebhook: vi.fn().mockReturnValue(true),
    lookupCarrier: vi.fn().mockResolvedValue(null),
  } as unknown as TelephonyProvider & { sendSms: Mock };
}

const TEST_ORG_ID = orgIdSchema.parse("00000000-0000-4000-8000-bbbbbbbbbbbb");
const TEST_ORG_SCHEMA = orgSchemaNameSchema.parse(
  "org_00000000-0000-4000-8000-bbbbbbbbbbbb",
);
const TEST_ORG_SLUG = orgSlugIdSchema.parse("test-org");

/** Map-backed in-memory BlobStore for tests. */
function createMapBlobStore(): BlobStore & {
  readonly blobs: Map<string, Buffer>;
} {
  const blobs = new Map<string, Buffer>();
  return {
    blobs,
    async put(orgSchema: OrgSchema, category: string, blob: Buffer) {
      const key = `${orgSchema}/${category}/${crypto.randomUUID()}` as BlobKey;
      blobs.set(key, Buffer.from(blob));
      return key;
    },
    async get(key: string) {
      return blobs.get(key) ?? null;
    },
    async delete(key: string) {
      blobs.delete(key);
    },
    async exists(key: string) {
      return blobs.has(key);
    },
  };
}

function makeDeps(
  overrides?: Partial<PortalMessageServiceDeps>,
): PortalMessageServiceDeps {
  const mockProvider = createMockProvider();
  return {
    getProvider: vi.fn().mockResolvedValue(mockProvider),
    resolveCallerIdByPurpose: vi.fn().mockResolvedValue("+15550001234"),
    fieldEncryptor: noopEncryptor,
    notificationService: createMockNotificationService(),
    blobStore: createMapBlobStore(),
    orgId: TEST_ORG_ID,
    orgSchema: TEST_ORG_SCHEMA,
    orgSlug: TEST_ORG_SLUG,
    ...overrides,
  };
}

function fakeTriple(): EciesTripleBuffers {
  return {
    ephemeralPoint: Buffer.alloc(32, 0x01),
    nonce: Buffer.alloc(24, 0x02),
    ciphertext: Buffer.from("test-ciphertext"),
  };
}

async function insertChannel(
  db: TestDb["db"],
  clientId: ClientId,
  overrides?: Partial<Record<string, unknown>>,
): Promise<PortalChannelRow> {
  const channelId = channelSecretSchema.parse(
    crypto.randomBytes(24).toString("hex"),
  );
  const row = await db
    .insertInto("portal_channels")
    .values({
      client_id: clientId,
      channel_id: channelId,
      auth_hash: Buffer.alloc(32, 0xaa),
      client_public: Buffer.alloc(32, 0xbb),
      has_passphrase: false,
      key_check_ephemeral_point: Buffer.alloc(32, 0xcc),
      key_check_nonce: Buffer.alloc(24, 0xdd),
      key_check_ciphertext: Buffer.from("key-check-ct"),
      status: "active",
      ...overrides,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return row;
}

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "portal-message-service (DB integration)",
  () => {
    let testDb: TestDb;

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    // -----------------------------------------------------------------------
    // bootstrap
    // -----------------------------------------------------------------------

    describe("bootstrap", () => {
      it("stamps last_seen_at and returns ordered messages", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        // Create follow-ups that portal_messages can reference (FK constraint)
        const fuId1 = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId1,
            ticket_id: fixture.ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.from("ct-1"),
          })
          .execute();

        const triple1 = fakeTriple();
        await storeClientCopy(
          testDb.db,
          channel.id,
          fuId1,
          triple1,
          "to_client",
        );

        const fuId2 = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId2,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct-2"),
            key_generation: newKeyGeneration(),
          })
          .execute();

        const triple2 = fakeTriple();
        await storeClientCopy(
          testDb.db,
          channel.id,
          fuId2,
          triple2,
          "from_client",
        );

        const result = await bootstrap(testDb.db, channel);

        expect(result.hasPassphrase).toBe(false);
        expect(result.keyCheck).toBeDefined();
        expect(result.ticketId).toBe(fixture.ticketId);
        expect(result.messagesExpireDays).toBe(30);
        expect(result.messages.length).toBe(2);
        // Ordered by created_at (first inserted should come first)
        expect(result.messages[0]?.direction).toBe("to_client");
        expect(result.messages[1]?.direction).toBe("from_client");

        // Verify last_seen_at was stamped
        const updated = await testDb.db
          .selectFrom("portal_channels")
          .select("last_seen_at")
          .where("id", "=", channel.id)
          .executeTakeFirstOrThrow();
        expect(updated.last_seen_at).not.toBeNull();
      });

      it("lazily deletes expired copies", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        // Create channel with old last_seen_at (> 30 days ago)
        const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
        const channel = await insertChannel(testDb.db, fixture.clientId, {
          last_seen_at: oldDate,
        });

        // Create a follow-up to satisfy the FK constraint
        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.from("ct-exp"),
          })
          .execute();

        // Insert a message
        const triple = fakeTriple();
        await storeClientCopy(testDb.db, channel.id, fuId, triple, "to_client");

        // Verify message exists
        const before = await testDb.db
          .selectFrom("portal_messages")
          .select("id")
          .where("channel_id", "=", channel.id)
          .execute();
        expect(before.length).toBe(1);

        await bootstrap(testDb.db, channel);

        // Verify message was deleted by lazy expiry
        const after = await testDb.db
          .selectFrom("portal_messages")
          .select("id")
          .where("channel_id", "=", channel.id)
          .execute();
        expect(after.length).toBe(0);
      });

      it("returns null ticketId when client has no tickets", async () => {
        // Create a client with no ticket
        // care-y-ignore-next-line no-plaintext-db-write -- encrypted_alias is test ciphertext
        const client = await testDb.db
          .insertInto("clients")
          .values({
            encrypted_alias: testSealedBox.sealBuffer(Buffer.from("no-ticket")),
            alias_hash: null,
            phone_id: null,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const channel = await insertChannel(testDb.db, client.id);
        const result = await bootstrap(testDb.db, channel);

        expect(result.ticketId).toBeNull();
      });

      it("returns upgradeOptions ['passphrase','account'] for a bare secure_link channel", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId, {
          kind: "secure_link",
        });

        const result = await bootstrap(testDb.db, channel);
        expect(result.upgradeOptions).toEqual(["passphrase", "account"]);
      });

      it("returns upgradeOptions ['account'] for a passphrase channel", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId, {
          kind: "secure_link",
          has_passphrase: true,
        });

        const result = await bootstrap(testDb.db, channel);
        expect(result.upgradeOptions).toEqual(["account"]);
      });

      it("returns upgradeOptions [] for an account channel", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId, {
          kind: "account",
        });

        const result = await bootstrap(testDb.db, channel);
        expect(result.upgradeOptions).toEqual([]);
      });
    });

    // -----------------------------------------------------------------------
    // bootstrap message type field
    // -----------------------------------------------------------------------

    describe("bootstrap message type field", () => {
      it("carries the originating follow-up type on each message wire entry", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        // Insert a regular message follow-up
        const fuMsg = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuMsg,
            ticket_id: fixture.ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.from("ct-msg"),
          })
          .execute();
        await storeClientCopy(
          testDb.db,
          channel.id,
          fuMsg,
          fakeTriple(),
          "to_client",
        );

        // Insert an email_outbound follow-up
        const fuEmail = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuEmail,
            ticket_id: fixture.ticketId,
            source: "volunteer",
            type: "email_outbound",
            encrypted_content: Buffer.from("ct-email"),
          })
          .execute();
        await storeClientCopy(
          testDb.db,
          channel.id,
          fuEmail,
          fakeTriple(),
          "to_client",
        );

        const result = await bootstrap(testDb.db, channel);
        expect(result.messages.length).toBe(2);

        const msgEntry = result.messages.find((m) => m.followupId === fuMsg);
        expect(msgEntry).toBeDefined();
        expect(msgEntry!.type).toBe("message");

        const emailEntry = result.messages.find(
          (m) => m.followupId === fuEmail,
        );
        expect(emailEntry).toBeDefined();
        expect(emailEntry!.type).toBe("email_outbound");
      });
    });

    // -----------------------------------------------------------------------
    // hasRecentOrgReply
    // -----------------------------------------------------------------------

    describe("hasRecentOrgReply", () => {
      /** Inserts a followup + client copy so the FK constraint holds. */
      async function insertCopy(
        ticketId: TicketId,
        channelRowId: PortalChannelRow["id"],
        direction: "to_client" | "from_client",
      ): Promise<void> {
        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: ticketId,
            source: direction === "to_client" ? "volunteer" : "client",
            type: "message",
            encrypted_content: Buffer.from("ct-engage"),
            ...(direction === "from_client"
              ? { key_generation: newKeyGeneration() }
              : {}),
          })
          .execute();
        await storeClientCopy(
          testDb.db,
          channelRowId,
          fuId,
          fakeTriple(),
          direction,
        );
      }

      it("returns true when an org reply exists inside the window", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        await insertCopy(fixture.ticketId, channel.id, "to_client");

        expect(await hasRecentOrgReply(testDb.db, channel.id)).toBe(true);
      });

      it("returns false when only client messages exist", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        await insertCopy(fixture.ticketId, channel.id, "from_client");

        expect(await hasRecentOrgReply(testDb.db, channel.id)).toBe(false);
      });

      it("returns false when the org reply is older than the window", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        await insertCopy(fixture.ticketId, channel.id, "to_client");
        await testDb.db
          .updateTable("portal_messages")
          .set({ created_at: new Date(Date.now() - 2 * 60 * 60 * 1000) })
          .where("channel_id", "=", channel.id)
          .execute();

        expect(await hasRecentOrgReply(testDb.db, channel.id)).toBe(false);
      });

      it("does not see another channel's org replies", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const engaged = await insertChannel(testDb.db, fixture.clientId, {
          status: "revoked",
        });
        const quiet = await insertChannel(testDb.db, fixture.clientId);
        await insertCopy(fixture.ticketId, engaged.id, "to_client");

        expect(await hasRecentOrgReply(testDb.db, quiet.id)).toBe(false);
      });
    });

    // -----------------------------------------------------------------------
    // clientReply
    // -----------------------------------------------------------------------

    describe("clientReply", () => {
      it("creates follow-up + wrap + self copy atomically", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const deps = makeDeps();

        const followUpId = newFollowupId();
        const keyGen = newKeyGeneration();
        const input: PortalReplyServiceInput = {
          ticketId: fixture.ticketId,
          followUpId,
          keyGeneration: keyGen,
          encryptedContent: Buffer.from("encrypted-reply"),
          wrappedTkTemp: Buffer.alloc(80, 0xef),
          selfCopy: fakeTriple(),
        };

        await clientReply(testDb.db, deps, channel, input);

        // Verify follow-up was inserted
        const fu = await testDb.db
          .selectFrom("followups")
          .select(["id", "source", "type", "key_generation"])
          .where("id", "=", followUpId)
          .executeTakeFirstOrThrow();
        expect(fu.source).toBe("client");
        expect(fu.type).toBe("message");
        expect(fu.key_generation).toBe(keyGen);

        // Verify portal_reply_key_wraps row exists
        const wrap = await testDb.db
          .selectFrom("portal_reply_key_wraps")
          .select("followup_id")
          .where("followup_id", "=", followUpId)
          .executeTakeFirstOrThrow();
        expect(wrap.followup_id).toBe(followUpId);

        // Verify portal_messages self copy
        const msg = await testDb.db
          .selectFrom("portal_messages")
          .select(["direction", "followup_id"])
          .where("followup_id", "=", followUpId)
          .executeTakeFirstOrThrow();
        expect(msg.direction).toBe("from_client");
      });

      it("reopens a closed ticket with a status_opened event", async () => {
        const fixture = await createTestTicketFixture(testDb.db);

        // Close the ticket
        await testDb.db
          .updateTable("tickets")
          .set({ status: "closed" })
          .where("id", "=", fixture.ticketId)
          .execute();

        const channel = await insertChannel(testDb.db, fixture.clientId);
        const deps = makeDeps();

        const input: PortalReplyServiceInput = {
          ticketId: fixture.ticketId,
          followUpId: newFollowupId(),
          keyGeneration: newKeyGeneration(),
          encryptedContent: Buffer.from("re-reply"),
          wrappedTkTemp: Buffer.alloc(80, 0xef),
          selfCopy: fakeTriple(),
        };

        await clientReply(testDb.db, deps, channel, input);

        // Verify ticket is now open
        const ticket = await testDb.db
          .selectFrom("tickets")
          .select("status")
          .where("id", "=", fixture.ticketId)
          .executeTakeFirstOrThrow();
        expect(ticket.status).toBe("open");

        // Verify status_opened system follow-up was created
        const statusFu = await testDb.db
          .selectFrom("followups")
          .select(["source", "type"])
          .where("ticket_id", "=", fixture.ticketId)
          .where("type", "=", "status_opened")
          .executeTakeFirst();
        expect(statusFu).toBeDefined();
        expect(statusFu?.source).toBe("system");
      });

      it("rejects reply to a ticket of another client", async () => {
        const fixture1 = await createTestTicketFixture(testDb.db);
        const fixture2 = await createTestTicketFixture(testDb.db);

        // Channel belongs to client 1, but reply targets client 2's ticket
        const channel = await insertChannel(testDb.db, fixture1.clientId);
        const deps = makeDeps();

        const input: PortalReplyServiceInput = {
          ticketId: fixture2.ticketId,
          followUpId: newFollowupId(),
          keyGeneration: newKeyGeneration(),
          encryptedContent: Buffer.from("wrong-ticket"),
          wrappedTkTemp: Buffer.alloc(80, 0xef),
          selfCopy: fakeTriple(),
        };

        await expect(
          clientReply(testDb.db, deps, channel, input),
        ).rejects.toThrow(NotFoundError);

        // Verify nothing was written
        const fuCount = await testDb.db
          .selectFrom("followups")
          .select((eb) => eb.fn.countAll().as("cnt"))
          .where("id", "=", input.followUpId)
          .executeTakeFirstOrThrow();
        expect(Number(fuCount.cnt)).toBe(0);
      });

      it("inserts a contact_correction followup when kind is contact_correction", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const deps = makeDeps();

        const followUpId = newFollowupId();
        const input: PortalReplyServiceInput = {
          ticketId: fixture.ticketId,
          followUpId,
          keyGeneration: newKeyGeneration(),
          encryptedContent: Buffer.from("corrected-phone"),
          wrappedTkTemp: Buffer.alloc(80, 0xef),
          selfCopy: fakeTriple(),
          kind: "contact_correction",
        };

        await clientReply(testDb.db, deps, channel, input);

        const fu = await testDb.db
          .selectFrom("followups")
          .select(["type", "source"])
          .where("id", "=", followUpId)
          .executeTakeFirstOrThrow();
        expect(fu.type).toBe("contact_correction");
        expect(fu.source).toBe("client");
      });

      it("defaults followup type to message when kind is omitted", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const deps = makeDeps();

        const followUpId = newFollowupId();
        const input: PortalReplyServiceInput = {
          ticketId: fixture.ticketId,
          followUpId,
          keyGeneration: newKeyGeneration(),
          encryptedContent: Buffer.from("regular-reply"),
          wrappedTkTemp: Buffer.alloc(80, 0xef),
          selfCopy: fakeTriple(),
          // kind intentionally omitted
        };

        await clientReply(testDb.db, deps, channel, input);

        const fu = await testDb.db
          .selectFrom("followups")
          .select("type")
          .where("id", "=", followUpId)
          .executeTakeFirstOrThrow();
        expect(fu.type).toBe("message");
      });

      it("rolls back on wrap-insert failure (no orphan follow-up)", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const deps = makeDeps();

        const followUpId = newFollowupId();

        // First reply succeeds
        const input1: PortalReplyServiceInput = {
          ticketId: fixture.ticketId,
          followUpId,
          keyGeneration: newKeyGeneration(),
          encryptedContent: Buffer.from("first"),
          wrappedTkTemp: Buffer.alloc(80, 0xef),
          selfCopy: fakeTriple(),
        };
        await clientReply(testDb.db, deps, channel, input1);

        // Second reply with the same followUpId (PK collision on portal_reply_key_wraps)
        const input2: PortalReplyServiceInput = {
          ticketId: fixture.ticketId,
          followUpId, // same id causes unique violation
          keyGeneration: newKeyGeneration(),
          encryptedContent: Buffer.from("second"),
          wrappedTkTemp: Buffer.alloc(80, 0xab),
          selfCopy: fakeTriple(),
        };

        await expect(
          clientReply(testDb.db, deps, channel, input2),
        ).rejects.toThrow();

        // Verify only the first follow-up exists (rollback on second)
        const fuRows = await testDb.db
          .selectFrom("followups")
          .select("id")
          .where("id", "=", followUpId)
          .execute();
        expect(fuRows.length).toBe(1);
      });

      it("enqueues a followup_added notification into the outbox after client reply", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const deps = makeDeps();

        const input: PortalReplyServiceInput = {
          ticketId: fixture.ticketId,
          followUpId: newFollowupId(),
          keyGeneration: newKeyGeneration(),
          encryptedContent: Buffer.from("encrypted-reply"),
          wrappedTkTemp: Buffer.alloc(80, 0xef),
          selfCopy: fakeTriple(),
        };

        await clientReply(testDb.db, deps, channel, input);

        // The outbox enqueue is fire-and-forget (void promise with
        // catch), so wait for the microtask queue to flush.
        await vi.waitFor(async () => {
          const row = await testDb.db
            .selectFrom("notification_outbox")
            .selectAll()
            .where("ticket_id", "=", fixture.ticketId)
            .where("event_type", "=", "followup_added")
            .executeTakeFirst();
          expect(row).toBeDefined();
          expect(row!.queue_id).toBe(fixture.queueId);
          expect(row!.actor_user_id).toBeNull();
        });
      });
    });

    // -----------------------------------------------------------------------
    // nudgeClient
    // -----------------------------------------------------------------------

    describe("nudgeClient", () => {
      it("sends SMS once via the provider when due", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId, {
          last_seen_at: new Date(Date.now() - 60_000), // visited 1 min ago
          last_notified_at: null,
        });

        const mockProvider = createMockProvider();
        const deps = makeDeps({
          getProvider: vi.fn().mockResolvedValue(mockProvider),
        });

        await nudgeClient(testDb.db, deps, channel);

        expect(mockProvider.sendSms).toHaveBeenCalledOnce();

        // Verify last_notified_at was stamped
        const updated = await testDb.db
          .selectFrom("portal_channels")
          .select("last_notified_at")
          .where("id", "=", channel.id)
          .executeTakeFirstOrThrow();
        expect(updated.last_notified_at).not.toBeNull();
      });

      it("skips when already nudged since last visit", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const now = Date.now();
        const channel = await insertChannel(testDb.db, fixture.clientId, {
          last_seen_at: new Date(now - 60_000),
          last_notified_at: new Date(now - 30_000), // notified AFTER last visit
        });

        const mockProvider = createMockProvider();
        const deps = makeDeps({
          getProvider: vi.fn().mockResolvedValue(mockProvider),
        });

        await nudgeClient(testDb.db, deps, channel);
        expect(mockProvider.sendSms).not.toHaveBeenCalled();
      });

      it("skips phone-less clients", async () => {
        // Create a client without a phone
        // care-y-ignore-next-line no-plaintext-db-write -- encrypted_alias is test ciphertext
        const client = await testDb.db
          .insertInto("clients")
          .values({
            encrypted_alias: testSealedBox.sealBuffer(Buffer.from("no-phone")),
            alias_hash: null,
            phone_id: null,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const queue = await createTestQueue(testDb.db);
        await testDb.db
          .insertInto("tickets")
          .values({
            client_id: client.id,
            queue_id: queue.id,
            encrypted_title: noopEncryptor.encrypt("t"),
            encrypted_description: noopEncryptor.encrypt("d"),
            key_generation: newKeyGeneration(),
          })
          .execute();

        const channel = await insertChannel(testDb.db, client.id);
        const mockProvider = createMockProvider();
        const deps = makeDeps({
          getProvider: vi.fn().mockResolvedValue(mockProvider),
        });

        await nudgeClient(testDb.db, deps, channel);
        expect(mockProvider.sendSms).not.toHaveBeenCalled();
      });

      it("does not throw when provider fails", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId, {
          last_seen_at: new Date(Date.now() - 60_000),
          last_notified_at: null,
        });

        const mockProvider = createMockProvider();
        mockProvider.sendSms.mockRejectedValue(new Error("provider down"));
        const deps = makeDeps({
          getProvider: vi.fn().mockResolvedValue(mockProvider),
        });

        // Must not throw
        await expect(
          nudgeClient(testDb.db, deps, channel),
        ).resolves.toBeUndefined();
      });

      it("logs a static reason string with no phone digits on outer failure", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId, {
          last_seen_at: new Date(Date.now() - 60_000),
          last_notified_at: null,
        });

        // Make getProvider throw to trigger the outer catch
        const deps = makeDeps({
          getProvider: vi
            .fn()
            .mockRejectedValue(new Error("+15550009999 failure")),
        });

        const spy = vi
          .spyOn(console, "error")
          .mockImplementation(() => undefined);
        try {
          await nudgeClient(testDb.db, deps, channel);

          expect(spy).toHaveBeenCalledOnce();
          const args = spy.mock.calls[0]!;
          // The log must contain only the static reason string
          const fullLog = args.join(" ");
          expect(fullLog).toContain("nudge_setup_failed");
          // No phone digits should appear anywhere in the log output
          expect(fullLog).not.toMatch(/\+?\d{7,}/);
        } finally {
          spy.mockRestore();
        }
      });

      it("passes the org UUID to getProvider and OrgIdentifiers to the resolver", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId, {
          last_seen_at: new Date(Date.now() - 60_000),
          last_notified_at: null,
        });

        const mockProvider = createMockProvider();
        const getProvider = vi.fn().mockResolvedValue(mockProvider);
        const resolveCallerIdByPurpose = vi
          .fn()
          .mockResolvedValue("+15550001234");
        const deps = makeDeps({ getProvider, resolveCallerIdByPurpose });

        await nudgeClient(testDb.db, deps, channel);

        // getProvider receives the org UUID, not the schema name
        expect(getProvider).toHaveBeenCalledWith(TEST_ORG_ID);

        // resolveCallerIdByPurpose receives OrgIdentifiers, not a bare string
        expect(resolveCallerIdByPurpose).toHaveBeenCalledWith(
          { orgId: TEST_ORG_ID, orgSchema: TEST_ORG_SCHEMA },
          "system",
        );
      });
    });

    // -----------------------------------------------------------------------
    // listMessages
    // -----------------------------------------------------------------------

    describe("listMessages", () => {
      /** Insert a portal_messages row directly, returning its id. */
      async function insertMessage(
        db: TestDb["db"],
        channelRowId: string,
        followupId: string,
        direction: "to_client" | "from_client" = "to_client",
      ): Promise<PortalMessageId> {
        const triple = fakeTriple();
        const row = await db
          .insertInto("portal_messages")
          .values({
            channel_id: channelRowId as never,
            followup_id: followupId as never,
            direction,
            ephemeral_point: triple.ephemeralPoint,
            nonce: triple.nonce,
            ciphertext: triple.ciphertext,
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        return row.id;
      }

      /** Insert a follow-up for FK satisfaction. */
      async function insertFollowup(
        db: TestDb["db"],
        ticketId: string,
      ): Promise<string> {
        const fuId = newFollowupId();
        await db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: ticketId as never,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.from("ct"),
          })
          .execute();
        return fuId;
      }

      it("returns oldest-first for both directions", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        const fu1 = await insertFollowup(testDb.db, fixture.ticketId);
        const id1 = await insertMessage(testDb.db, channel.id, fu1);

        const fu2 = await insertFollowup(testDb.db, fixture.ticketId);
        const id2 = await insertMessage(testDb.db, channel.id, fu2);

        const newerResult = await listMessages(testDb.db, channel, {
          limit: 50,
          direction: "newer",
        });
        expect(newerResult.messages.length).toBe(2);
        expect(newerResult.messages[0]!.id).toBe(id1);
        expect(newerResult.messages[1]!.id).toBe(id2);

        const olderResult = await listMessages(testDb.db, channel, {
          limit: 50,
          direction: "older",
        });
        expect(olderResult.messages.length).toBe(2);
        // "older" walks backwards then reverses, so still oldest-first
        expect(olderResult.messages[0]!.id).toBe(id1);
        expect(olderResult.messages[1]!.id).toBe(id2);
      });

      it("cursor excludes the cursor row and returns the adjacent page", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        const fu1 = await insertFollowup(testDb.db, fixture.ticketId);
        const id1 = await insertMessage(testDb.db, channel.id, fu1);

        const fu2 = await insertFollowup(testDb.db, fixture.ticketId);
        const id2 = await insertMessage(testDb.db, channel.id, fu2);

        const fu3 = await insertFollowup(testDb.db, fixture.ticketId);
        const id3 = await insertMessage(testDb.db, channel.id, fu3);

        // Cursor at id2, direction "newer": should return only id3
        const newerPage = await listMessages(testDb.db, channel, {
          limit: 50,
          cursor: id2,
          direction: "newer",
        });
        expect(newerPage.messages.length).toBe(1);
        expect(newerPage.messages[0]!.id).toBe(id3);

        // Cursor at id2, direction "older": should return only id1
        const olderPage = await listMessages(testDb.db, channel, {
          limit: 50,
          cursor: id2,
          direction: "older",
        });
        expect(olderPage.messages.length).toBe(1);
        expect(olderPage.messages[0]!.id).toBe(id1);
      });

      it("handles two rows with identical created_at without duplication or loss", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        const fu1 = await insertFollowup(testDb.db, fixture.ticketId);
        const id1 = await insertMessage(testDb.db, channel.id, fu1);

        const fu2 = await insertFollowup(testDb.db, fixture.ticketId);
        const id2 = await insertMessage(testDb.db, channel.id, fu2);

        // Force both rows to share the exact same created_at, which is what
        // the id tiebreaker exists for. Through the query builder rather than
        // a raw template: withSchema does not rewrite raw SQL, so the update
        // would have resolved against public and left the rows untouched,
        // and the test would have passed without ever setting up its premise.
        await testDb.db
          .updateTable("portal_messages")
          .set({ created_at: new Date("2025-01-01T00:00:00.123Z") })
          .where("id", "in", [id1, id2])
          .execute();

        // Page through one at a time
        const page1 = await listMessages(testDb.db, channel, {
          limit: 1,
          direction: "newer",
        });
        expect(page1.messages.length).toBe(1);
        const firstId = page1.messages[0]!.id as PortalMessageId;

        const page2 = await listMessages(testDb.db, channel, {
          limit: 1,
          cursor: firstId,
          direction: "newer",
        });
        expect(page2.messages.length).toBe(1);
        const secondId = page2.messages[0]!.id;

        // Both rows appear, no duplicates
        expect(firstId).not.toBe(secondId);
        const allIds = new Set([firstId, secondId]);
        expect(allIds.has(id1)).toBe(true);
        expect(allIds.has(id2)).toBe(true);
      });

      it("totalCount reflects the whole channel regardless of limit or cursor", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        const fu1 = await insertFollowup(testDb.db, fixture.ticketId);
        await insertMessage(testDb.db, channel.id, fu1);
        const fu2 = await insertFollowup(testDb.db, fixture.ticketId);
        await insertMessage(testDb.db, channel.id, fu2);
        const fu3 = await insertFollowup(testDb.db, fixture.ticketId);
        const id3 = await insertMessage(testDb.db, channel.id, fu3);

        // limit=1 still reports totalCount=3
        const page = await listMessages(testDb.db, channel, {
          limit: 1,
          direction: "newer",
        });
        expect(page.messages.length).toBe(1);
        expect(page.totalCount).toBe(3);

        // With cursor, totalCount is still 3
        const pageCursor = await listMessages(testDb.db, channel, {
          limit: 50,
          cursor: id3,
          direction: "older",
        });
        expect(pageCursor.totalCount).toBe(3);
      });

      it("cursor from a different channel returns nothing from that channel", async () => {
        const fixture1 = await createTestTicketFixture(testDb.db);
        const channel1 = await insertChannel(testDb.db, fixture1.clientId);

        const fixture2 = await createTestTicketFixture(testDb.db);
        const channel2 = await insertChannel(testDb.db, fixture2.clientId);

        // Insert messages in both channels
        const fu1 = await insertFollowup(testDb.db, fixture1.ticketId);
        await insertMessage(testDb.db, channel1.id, fu1);

        const fu2 = await insertFollowup(testDb.db, fixture2.ticketId);
        const otherChannelMsgId = await insertMessage(
          testDb.db,
          channel2.id,
          fu2,
        );

        // Use channel2's message id as cursor when querying channel1
        const result = await listMessages(testDb.db, channel1, {
          limit: 50,
          cursor: otherChannelMsgId,
          direction: "newer",
        });
        // The cursor subquery scopes to channel1, so the cursor row is not found.
        // When the cursor row has no match, the subquery returns NULL, and the
        // comparison evaluates to UNKNOWN. Postgres WHERE treats UNKNOWN as false,
        // so all rows in channel1 are excluded. That is the correct safety
        // behavior: an unrecognized cursor yields an empty page rather than
        // leaking cross-channel rows.
        expect(result.messages.every((m) => m.id !== otherChannelMsgId)).toBe(
          true,
        );
      });

      it("respects the limit", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        // Insert 5 messages
        for (let i = 0; i < 5; i++) {
          const fu = await insertFollowup(testDb.db, fixture.ticketId);
          await insertMessage(testDb.db, channel.id, fu);
        }

        const page = await listMessages(testDb.db, channel, {
          limit: 3,
          direction: "newer",
        });
        expect(page.messages.length).toBe(3);
        expect(page.totalCount).toBe(5);
      });
    });

    // -----------------------------------------------------------------------
    // bootstrap attachments
    // -----------------------------------------------------------------------

    describe("bootstrap attachments", () => {
      it("includes attachments for the channel in the bootstrap result", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        // Create a follow-up and an attachment with a client wrap
        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct-att"),
            key_generation: newKeyGeneration(),
          })
          .execute();

        const attId = newAttachmentId();
        await testDb.db
          .insertInto("attachments")
          .values({
            id: attId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/attachment/fake-key" as never,
            size_bytes: 256,
            content_type: "image/png",
            encrypted_filename: Buffer.from("enc-fn"),
            file_key_wrap: Buffer.alloc(72, 0xab),
          })
          .execute();

        const triple = fakeTriple();
        await testDb.db
          .insertInto("portal_attachments")
          .values({
            attachment_id: attId,
            channel_id: channel.id,
            followup_id: fuId,
            direction: "from_client",
            ephemeral_point: triple.ephemeralPoint,
            nonce: triple.nonce,
            ciphertext: triple.ciphertext,
          })
          .execute();

        const result = await bootstrap(testDb.db, channel);

        expect(result.attachments.length).toBe(1);
        expect(result.attachments[0]!.attachmentId).toBe(attId);
        expect(result.attachments[0]!.sizeBytes).toBe(256);
        expect(result.attachments[0]!.direction).toBe("from_client");
      });
    });

    // -----------------------------------------------------------------------
    // bootstrap recordings
    // -----------------------------------------------------------------------

    describe("bootstrap recordings", () => {
      it("includes recordings for the channel in the bootstrap result", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "system",
            type: "phone_call",
            encrypted_content: Buffer.from("ct-rec"),
          })
          .execute();

        const recId = newRecordingId();
        await testDb.db
          .insertInto("recordings")
          .values({
            id: recId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/recording/boot-1" as BlobKey,
            size_bytes: 512,
            duration_seconds: 60,
            file_key_wrap: Buffer.alloc(72, 0xab),
          })
          .execute();

        const triple = fakeTriple();
        await insertClientRecordingWrap(testDb.db, {
          recordingId: recId,
          channelRowId: channel.id,
          followupId: fuId,
          direction: "to_client",
          copy: triple,
        });

        const result = await bootstrap(testDb.db, channel);

        expect(result.recordings.length).toBe(1);
        expect(result.recordings[0]!.recordingId).toBe(recId);
        expect(result.recordings[0]!.durationSeconds).toBe(60);
        expect(result.recordings[0]!.direction).toBe("to_client");
      });
    });

    // -----------------------------------------------------------------------
    // bootstrap callEntries
    // -----------------------------------------------------------------------

    describe("bootstrap callEntries", () => {
      it("returns phone_call follow-ups as callEntries", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "system",
            type: "phone_call",
            encrypted_content: Buffer.from("system"),
            call_status: "completed",
            call_duration_seconds: 120,
          })
          .execute();

        const result = await bootstrap(testDb.db, channel);

        expect(result.callEntries.length).toBeGreaterThanOrEqual(1);
        const entry = result.callEntries.find((e) => e.id === fuId);
        expect(entry).toBeDefined();
        expect(entry!.source).toBe("system");
        expect(entry!.callStatus).toBe("completed");
        expect(entry!.callDurationSeconds).toBe(120);
        expect(typeof entry!.createdAt).toBe("string");
      });

      it("excludes is_private=true follow-ups", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "system",
            type: "phone_call",
            is_private: true,
            encrypted_content: Buffer.from("system"),
            call_status: "completed",
            call_duration_seconds: 30,
          })
          .execute();

        const result = await bootstrap(testDb.db, channel);

        const entry = result.callEntries.find((e) => e.id === fuId);
        expect(entry).toBeUndefined();
      });

      it("excludes deleted follow-ups", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "system",
            type: "phone_call",
            encrypted_content: Buffer.from("system"),
            call_status: "completed",
            call_duration_seconds: 45,
            deleted_at: new Date(),
          })
          .execute();

        const result = await bootstrap(testDb.db, channel);

        const entry = result.callEntries.find((e) => e.id === fuId);
        expect(entry).toBeUndefined();
      });

      it("does not return calls from another client", async () => {
        const fixture1 = await createTestTicketFixture(testDb.db);
        const fixture2 = await createTestTicketFixture(testDb.db);
        const channel1 = await insertChannel(testDb.db, fixture1.clientId);

        // Insert a phone_call follow-up on fixture2's ticket
        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture2.ticketId,
            source: "system",
            type: "phone_call",
            encrypted_content: Buffer.from("system"),
            call_status: "completed",
            call_duration_seconds: 90,
          })
          .execute();

        const result = await bootstrap(testDb.db, channel1);

        const entry = result.callEntries.find((e) => e.id === fuId);
        expect(entry).toBeUndefined();
      });

      it("excludes non-phone_call follow-ups", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.from("ct"),
          })
          .execute();

        const result = await bootstrap(testDb.db, channel);

        const entry = result.callEntries.find((e) => e.id === fuId);
        expect(entry).toBeUndefined();
      });
    });

    // -----------------------------------------------------------------------
    // channel expiry drops recording wraps
    // -----------------------------------------------------------------------

    describe("channel expiry drops recording wraps", () => {
      it("lazily deletes recording wraps on an expired channel", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
        const channel = await insertChannel(testDb.db, fixture.clientId, {
          last_seen_at: oldDate,
        });

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "system",
            type: "phone_call",
            encrypted_content: Buffer.from("ct"),
          })
          .execute();

        const recId = newRecordingId();
        await testDb.db
          .insertInto("recordings")
          .values({
            id: recId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/recording/exp-key" as BlobKey,
            size_bytes: 100,
            duration_seconds: 10,
            file_key_wrap: Buffer.alloc(72, 0xab),
          })
          .execute();

        await insertClientRecordingWrap(testDb.db, {
          recordingId: recId,
          channelRowId: channel.id,
          followupId: fuId,
          direction: "to_client",
          copy: fakeTriple(),
        });

        // Verify wrap exists
        const before = await testDb.db
          .selectFrom("portal_recordings")
          .select("id")
          .where("channel_id", "=", channel.id)
          .execute();
        expect(before.length).toBe(1);

        // Bootstrap triggers touchChannel, which purges for expired channels
        await bootstrap(testDb.db, channel);

        // Wraps gone
        const after = await testDb.db
          .selectFrom("portal_recordings")
          .select("id")
          .where("channel_id", "=", channel.id)
          .execute();
        expect(after.length).toBe(0);

        // Recording row itself stays
        const recRow = await testDb.db
          .selectFrom("recordings")
          .select("id")
          .where("id", "=", recId)
          .executeTakeFirst();
        expect(recRow).toBeDefined();
      });
    });

    // -----------------------------------------------------------------------
    // clientReply with attachments
    // -----------------------------------------------------------------------

    describe("clientReply with attachments", () => {
      it("writes attachment rows and client wraps in one transaction", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const blobStore = createMapBlobStore();
        const deps = makeDeps({ blobStore });

        const followUpId = newFollowupId();
        const attId = newAttachmentId();
        const attBlob = Buffer.alloc(64, 0xcc);

        const input: PortalReplyServiceInput = {
          ticketId: fixture.ticketId,
          followUpId,
          keyGeneration: newKeyGeneration(),
          encryptedContent: Buffer.from("msg-with-file"),
          wrappedTkTemp: Buffer.alloc(80, 0xef),
          selfCopy: fakeTriple(),
          attachments: [
            {
              attachmentId: attId,
              ticketId: fixture.ticketId,
              blob: attBlob,
              declaredSize: attBlob.byteLength,
              contentType: "application/pdf",
              fileKeyWrap: Buffer.alloc(72, 0xab),
              encryptedFilename: Buffer.from("enc-fn"),
              selfCopy: fakeTriple(),
            },
          ],
        };

        await clientReply(testDb.db, deps, channel, input);

        // Verify attachment row
        const attRow = await testDb.db
          .selectFrom("attachments")
          .selectAll()
          .where("id", "=", attId)
          .executeTakeFirstOrThrow();
        expect(attRow.followup_id).toBe(followUpId);
        expect(attRow.file_key_wrap).not.toBeNull();

        // Verify portal_attachments wrap
        const wrapRow = await testDb.db
          .selectFrom("portal_attachments")
          .selectAll()
          .where("attachment_id", "=", attId)
          .where("channel_id", "=", channel.id)
          .executeTakeFirstOrThrow();
        expect(wrapRow.direction).toBe("from_client");
        expect(wrapRow.followup_id).toBe(followUpId);

        // Blob stored
        expect(blobStore.blobs.size).toBe(1);
      });

      it("cleans up blobs when the transaction fails", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const blobStore = createMapBlobStore();
        const deps = makeDeps({ blobStore });

        // First reply consumes the followUpId
        const followUpId = newFollowupId();
        const input1: PortalReplyServiceInput = {
          ticketId: fixture.ticketId,
          followUpId,
          keyGeneration: newKeyGeneration(),
          encryptedContent: Buffer.from("first"),
          wrappedTkTemp: Buffer.alloc(80, 0xef),
          selfCopy: fakeTriple(),
        };
        await clientReply(testDb.db, deps, channel, input1);

        // Second reply with the same followUpId forces a PK collision
        const attBlob = Buffer.alloc(64, 0xdd);
        const input2: PortalReplyServiceInput = {
          ticketId: fixture.ticketId,
          followUpId, // duplicate, causes unique violation
          keyGeneration: newKeyGeneration(),
          encryptedContent: Buffer.from("second"),
          wrappedTkTemp: Buffer.alloc(80, 0xab),
          selfCopy: fakeTriple(),
          attachments: [
            {
              attachmentId: newAttachmentId(),
              ticketId: fixture.ticketId,
              blob: attBlob,
              declaredSize: attBlob.byteLength,
              contentType: "image/png",
              fileKeyWrap: Buffer.alloc(72, 0xab),
              encryptedFilename: Buffer.from("enc-fn"),
              selfCopy: fakeTriple(),
            },
          ],
        };

        await expect(
          clientReply(testDb.db, deps, channel, input2),
        ).rejects.toThrow();

        // The blob from the second attempt was cleaned up
        // (only the first reply's blob, if any, should remain)
        expect(blobStore.blobs.size).toBe(0);
      });
    });

    // -----------------------------------------------------------------------
    // channel expiry drops wraps
    // -----------------------------------------------------------------------

    describe("channel expiry drops attachment wraps", () => {
      it("lazily deletes attachment wraps on an expired channel", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
        const channel = await insertChannel(testDb.db, fixture.clientId, {
          last_seen_at: oldDate,
        });

        // Seed an attachment with a wrap
        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct"),
            key_generation: newKeyGeneration(),
          })
          .execute();

        const attId = newAttachmentId();
        await testDb.db
          .insertInto("attachments")
          .values({
            id: attId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/attachment/exp-key" as never,
            size_bytes: 100,
            content_type: "image/png",
            encrypted_filename: Buffer.from("enc"),
            file_key_wrap: Buffer.alloc(72, 0xab),
          })
          .execute();

        await testDb.db
          .insertInto("portal_attachments")
          .values({
            attachment_id: attId,
            channel_id: channel.id,
            followup_id: fuId,
            direction: "from_client",
            ephemeral_point: Buffer.alloc(32, 0x01),
            nonce: Buffer.alloc(24, 0x02),
            ciphertext: Buffer.from("wrap-ct"),
          })
          .execute();

        // Verify wrap exists
        const before = await testDb.db
          .selectFrom("portal_attachments")
          .select("id")
          .where("channel_id", "=", channel.id)
          .execute();
        expect(before.length).toBe(1);

        // Bootstrap triggers touchChannel, which purges for expired channels
        await bootstrap(testDb.db, channel);

        // Wraps gone
        const after = await testDb.db
          .selectFrom("portal_attachments")
          .select("id")
          .where("channel_id", "=", channel.id)
          .execute();
        expect(after.length).toBe(0);

        // Attachment row itself stays
        const attRow = await testDb.db
          .selectFrom("attachments")
          .select("id")
          .where("id", "=", attId)
          .executeTakeFirst();
        expect(attRow).toBeDefined();
      });
    });
  },
);
