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
  type PortalMessageServiceDeps,
  type PortalReplyServiceInput,
  type EciesTripleBuffers,
} from "./portal-message-service.js";
import { NotFoundError } from "../errors.js";

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

const TEST_ORG_ID = "00000000-0000-4000-8000-bbbbbbbbbbbb";
const TEST_ORG_SCHEMA = "test_schema";

function makeDeps(
  overrides?: Partial<PortalMessageServiceDeps>,
): PortalMessageServiceDeps {
  const mockProvider = createMockProvider();
  return {
    getProvider: vi.fn().mockResolvedValue(mockProvider),
    resolveCallerIdByPurpose: vi.fn().mockResolvedValue("+15550001234"),
    fieldEncryptor: noopEncryptor,
    notificationService: createMockNotificationService(),
    orgId: TEST_ORG_ID,
    orgSchema: TEST_ORG_SCHEMA,
    orgSlug: "test-org",
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
  clientId: string,
  overrides?: Partial<Record<string, unknown>>,
): Promise<PortalChannelRow> {
  const channelId = crypto.randomBytes(24).toString("hex");
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
        const fuId1 = crypto.randomUUID();
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

        const fuId2 = crypto.randomUUID();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId2,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct-2"),
            key_generation: crypto.randomUUID(),
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
        const fuId = crypto.randomUUID();
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
    });

    // -----------------------------------------------------------------------
    // clientReply
    // -----------------------------------------------------------------------

    describe("clientReply", () => {
      it("creates follow-up + wrap + self copy atomically", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const deps = makeDeps();

        const followUpId = crypto.randomUUID();
        const keyGen = crypto.randomUUID();
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
          followUpId: crypto.randomUUID(),
          keyGeneration: crypto.randomUUID(),
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
          followUpId: crypto.randomUUID(),
          keyGeneration: crypto.randomUUID(),
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

      it("rolls back on wrap-insert failure (no orphan follow-up)", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const deps = makeDeps();

        const followUpId = crypto.randomUUID();

        // First reply succeeds
        const input1: PortalReplyServiceInput = {
          ticketId: fixture.ticketId,
          followUpId,
          keyGeneration: crypto.randomUUID(),
          encryptedContent: Buffer.from("first"),
          wrappedTkTemp: Buffer.alloc(80, 0xef),
          selfCopy: fakeTriple(),
        };
        await clientReply(testDb.db, deps, channel, input1);

        // Second reply with the same followUpId (PK collision on portal_reply_key_wraps)
        const input2: PortalReplyServiceInput = {
          ticketId: fixture.ticketId,
          followUpId, // same id causes unique violation
          keyGeneration: crypto.randomUUID(),
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

      it("passes orgId to notification dispatch for SMS payload correctness", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const notificationService = createMockNotificationService();
        const deps = makeDeps({ notificationService });

        const input: PortalReplyServiceInput = {
          ticketId: fixture.ticketId,
          followUpId: crypto.randomUUID(),
          keyGeneration: crypto.randomUUID(),
          encryptedContent: Buffer.from("encrypted-reply"),
          wrappedTkTemp: Buffer.alloc(80, 0xef),
          selfCopy: fakeTriple(),
        };

        await clientReply(testDb.db, deps, channel, input);

        // The notification block runs several awaited queries before it
        // dispatches, and nothing awaits it, so a single tick is not enough.
        await vi.waitFor(() => {
          expect(notificationService.dispatch).toHaveBeenCalledTimes(1);
        });

        // dispatch is called with orgId as the second positional argument
        // (after tDb). This is the only compile-time-invisible contract
        // that prevents a Zod rejection when the SMS job dequeues.
        const dispatchArgs = notificationService.dispatch.mock
          .calls[0] as unknown[];
        // arg[0] = tDb, arg[1] = orgId
        expect(dispatchArgs[1]).toBe(TEST_ORG_ID);
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
            key_generation: crypto.randomUUID(),
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
  },
);
