/**
 * Integration tests for the portal reseed service.
 *
 * DB tests run inside Docker via `pnpm test:server:db`. Each suite
 * gets an isolated test schema created in beforeAll, dropped in afterAll.
 */

import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { TestDb } from "../test-utils.js";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestTicketFixture,
} from "../test-utils.js";
import type { PortalChannelRow } from "./channel-service.js";
import { createTicketAccessChecker } from "../tickets/access.js";
import {
  reseedPortalHistory,
  convertBlobForReseed,
  listTicketsForClient,
} from "./reseed-service.js";
import {
  PortalChannelMismatchError,
  ReseedValidationError,
  ReseedAlreadyConvertedError,
} from "./portal-errors.js";
import {
  channelSecretSchema,
  orgSchemaNameSchema,
  newFollowupId,
  newAttachmentId,
  newRecordingId,
} from "@care-y/shared";
import type { ClientId, BlobKey, OrgSchema } from "@care-y/shared";

const TEST_ORG_SCHEMA = orgSchemaNameSchema.parse(
  "org_00000000-0000-4000-8000-cccccccccccc",
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fakeTriple(): {
  ephemeralPoint: Buffer;
  nonce: Buffer;
  ciphertext: Buffer;
} {
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

/** In-memory blob store for testing. */
function createMemoryBlobStore(): {
  put(orgSchema: OrgSchema, category: string, blob: Buffer): Promise<BlobKey>;
  get(key: BlobKey): Promise<Buffer | null>;
  delete(key: BlobKey): Promise<void>;
  exists(key: BlobKey): Promise<boolean>;
} {
  const store = new Map<string, Buffer>();
  return {
    async put(
      _orgSchema: OrgSchema,
      _category: string,
      blob: Buffer,
    ): Promise<BlobKey> {
      const key = `blob/${crypto.randomUUID()}` as BlobKey;
      store.set(key, Buffer.from(blob));
      return key;
    },
    async get(key: BlobKey): Promise<Buffer | null> {
      return store.get(key) ?? null;
    },
    async delete(key: BlobKey): Promise<void> {
      store.delete(key);
    },
    async exists(key: BlobKey): Promise<boolean> {
      return store.has(key);
    },
  };
}

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "reseed-service (DB integration)",
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
    // reseedPortalHistory
    // -----------------------------------------------------------------------

    describe("reseedPortalHistory", () => {
      it("inserts message copies with created_at and direction from followups", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

        // Insert a followup from a volunteer
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

        const result = await reseedPortalHistory(
          testDb.db,
          access,
          fixture.userId!,
          {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [{ followupId: fuId, copy: fakeTriple() }],
            attachmentWraps: [],
            recordingWraps: [],
          },
        );

        expect(result.inserted).toBe(1);
        expect(result.skipped).toBe(0);

        // Verify the row
        const rows = await testDb.db
          .selectFrom("portal_messages")
          .selectAll()
          .where("channel_id", "=", channel.id)
          .execute();
        expect(rows.length).toBe(1);
        expect(rows[0]!.direction).toBe("to_client");
        expect(rows[0]!.followup_id).toBe(fuId);
      });

      it("sets direction to from_client for client-sourced followups", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "sms_inbound",
            encrypted_content: Buffer.from("ct"),
          })
          .execute();

        await reseedPortalHistory(testDb.db, access, fixture.userId!, {
          clientId: fixture.clientId,
          channelId: channel.channel_id,
          messages: [{ followupId: fuId, copy: fakeTriple() }],
          attachmentWraps: [],
          recordingWraps: [],
        });

        const rows = await testDb.db
          .selectFrom("portal_messages")
          .selectAll()
          .where("channel_id", "=", channel.id)
          .execute();
        expect(rows[0]!.direction).toBe("from_client");
      });

      it("accepts email_outbound message copies", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "volunteer",
            type: "email_outbound",
            encrypted_content: Buffer.from("ct"),
          })
          .execute();

        const result = await reseedPortalHistory(
          testDb.db,
          access,
          fixture.userId!,
          {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [{ followupId: fuId, copy: fakeTriple() }],
            attachmentWraps: [],
            recordingWraps: [],
          },
        );

        expect(result.inserted).toBe(1);
        const rows = await testDb.db
          .selectFrom("portal_messages")
          .selectAll()
          .where("channel_id", "=", channel.id)
          .execute();
        expect(rows[0]!.direction).toBe("to_client");
      });

      it("rejects voicemail text copies", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "system",
            type: "voicemail",
            encrypted_content: Buffer.from("ct"),
          })
          .execute();

        await expect(
          reseedPortalHistory(testDb.db, access, fixture.userId!, {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [{ followupId: fuId, copy: fakeTriple() }],
            attachmentWraps: [],
            recordingWraps: [],
          }),
        ).rejects.toThrow(ReseedValidationError);
      });

      it("rejects private followups", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "volunteer",
            type: "message",
            is_private: true,
            encrypted_content: Buffer.from("ct"),
          })
          .execute();

        await expect(
          reseedPortalHistory(testDb.db, access, fixture.userId!, {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [{ followupId: fuId, copy: fakeTriple() }],
            attachmentWraps: [],
            recordingWraps: [],
          }),
        ).rejects.toThrow(ReseedValidationError);
      });

      it("rejects deleted followups", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "volunteer",
            type: "message",
            deleted_at: new Date(),
            encrypted_content: Buffer.from("ct"),
          })
          .execute();

        await expect(
          reseedPortalHistory(testDb.db, access, fixture.userId!, {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [{ followupId: fuId, copy: fakeTriple() }],
            attachmentWraps: [],
            recordingWraps: [],
          }),
        ).rejects.toThrow(ReseedValidationError);
      });

      it("rejects internal_note attachment wraps", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "volunteer",
            type: "internal_note",
            is_private: false,
            encrypted_content: Buffer.from("ct"),
          })
          .execute();

        const attId = newAttachmentId();
        await testDb.db
          .insertInto("attachments")
          .values({
            id: attId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/att/intern-1" as BlobKey,
            size_bytes: 100,
            content_type: "image/png",
            encrypted_filename: Buffer.from("enc-fn"),
            file_key_wrap: Buffer.alloc(72, 0xab),
          })
          .execute();

        await expect(
          reseedPortalHistory(testDb.db, access, fixture.userId!, {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [],
            attachmentWraps: [
              {
                attachmentId: attId,
                followupId: fuId,
                copy: fakeTriple(),
              },
            ],
            recordingWraps: [],
          }),
        ).rejects.toThrow(ReseedValidationError);
      });

      it("rejects followups belonging to a different client", async () => {
        const fixture1 = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const fixture2 = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture1.clientId);
        const access = createTicketAccessChecker(testDb.db);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture2.ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.from("ct"),
          })
          .execute();

        await expect(
          reseedPortalHistory(testDb.db, access, fixture1.userId!, {
            clientId: fixture1.clientId,
            channelId: channel.channel_id,
            messages: [{ followupId: fuId, copy: fakeTriple() }],
            attachmentWraps: [],
            recordingWraps: [],
          }),
        ).rejects.toThrow(ReseedValidationError);
      });

      it("throws PortalChannelMismatchError for wrong channel id", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

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

        // Use a different channel_id than the active one
        const wrongChannelId = crypto.randomBytes(24).toString("hex");

        await expect(
          reseedPortalHistory(testDb.db, access, fixture.userId!, {
            clientId: fixture.clientId,
            channelId: wrongChannelId,
            messages: [{ followupId: fuId, copy: fakeTriple() }],
            attachmentWraps: [],
            recordingWraps: [],
          }),
        ).rejects.toThrow(PortalChannelMismatchError);
      });

      it("is idempotent: second identical chunk returns inserted 0, skipped N", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

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

        const payload = {
          clientId: fixture.clientId,
          channelId: channel.channel_id,
          messages: [{ followupId: fuId, copy: fakeTriple() }],
          attachmentWraps: [] as never[],
          recordingWraps: [] as never[],
        };

        const first = await reseedPortalHistory(
          testDb.db,
          access,
          fixture.userId!,
          payload,
        );
        expect(first.inserted).toBe(1);

        const second = await reseedPortalHistory(
          testDb.db,
          access,
          fixture.userId!,
          payload,
        );
        expect(second.inserted).toBe(0);
        expect(second.skipped).toBe(1);
      });

      it("inserts attachment wrap with direction and created_at from followup", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct"),
          })
          .execute();

        const attId = newAttachmentId();
        await testDb.db
          .insertInto("attachments")
          .values({
            id: attId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/att/reseed-1" as BlobKey,
            size_bytes: 100,
            content_type: "image/png",
            encrypted_filename: Buffer.from("enc-fn"),
            file_key_wrap: Buffer.alloc(72, 0xab),
          })
          .execute();

        const result = await reseedPortalHistory(
          testDb.db,
          access,
          fixture.userId!,
          {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [],
            attachmentWraps: [
              {
                attachmentId: attId,
                followupId: fuId,
                copy: fakeTriple(),
              },
            ],
            recordingWraps: [],
          },
        );

        expect(result.inserted).toBe(1);

        const rows = await testDb.db
          .selectFrom("portal_attachments")
          .selectAll()
          .where("channel_id", "=", channel.id)
          .execute();
        expect(rows.length).toBe(1);
        expect(rows[0]!.direction).toBe("from_client");
      });

      it("inserts recording wrap with direction and created_at from followup", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

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
            blob_key: "test/rec/reseed-1" as BlobKey,
            size_bytes: 1024,
            duration_seconds: 42,
            file_key_wrap: Buffer.alloc(72, 0xab),
          })
          .execute();

        const result = await reseedPortalHistory(
          testDb.db,
          access,
          fixture.userId!,
          {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [],
            attachmentWraps: [],
            recordingWraps: [
              {
                recordingId: recId,
                followupId: fuId,
                copy: fakeTriple(),
              },
            ],
          },
        );

        expect(result.inserted).toBe(1);

        const rows = await testDb.db
          .selectFrom("portal_recordings")
          .selectAll()
          .where("channel_id", "=", channel.id)
          .execute();
        expect(rows.length).toBe(1);
        expect(rows[0]!.direction).toBe("to_client");
      });
    });

    // -----------------------------------------------------------------------
    // convertBlobForReseed
    // -----------------------------------------------------------------------

    describe("convertBlobForReseed", () => {
      it("rejects when file_key_wrap is already set", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);
        const blobStore = createMemoryBlobStore();

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

        const attId = newAttachmentId();
        await testDb.db
          .insertInto("attachments")
          .values({
            id: attId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/att/already-1" as BlobKey,
            size_bytes: 100,
            content_type: "image/png",
            encrypted_filename: Buffer.from("enc-fn"),
            file_key_wrap: Buffer.alloc(72, 0xab), // already set
          })
          .execute();

        await expect(
          convertBlobForReseed(
            testDb.db,
            access,
            fixture.userId!,
            {
              clientId: fixture.clientId,
              channelId: channel.channel_id,
              kind: "attachment",
              rowId: attId,
              followupId: fuId,
              encryptedData: Buffer.from("new-blob-data"),
              fileKeyWrap: Buffer.alloc(72, 0xcc),
              copy: fakeTriple(),
            },
            blobStore,
            TEST_ORG_SCHEMA,
          ),
        ).rejects.toThrow(ReseedAlreadyConvertedError);
      });

      it("rotates blob_key and inserts the portal carrier for an attachment", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);
        const blobStore = createMemoryBlobStore();

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

        const oldBlobKey = await blobStore.put(
          TEST_ORG_SCHEMA,
          "attachment",
          Buffer.from("old-blob"),
        );

        const attId = newAttachmentId();
        await testDb.db
          .insertInto("attachments")
          .values({
            id: attId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: oldBlobKey,
            size_bytes: 100,
            content_type: "image/png",
            encrypted_filename: Buffer.from("enc-fn"),
            file_key_wrap: null, // not yet converted
          })
          .execute();

        const newFileKeyWrap = Buffer.alloc(72, 0xcc);

        const result = await convertBlobForReseed(
          testDb.db,
          access,
          fixture.userId!,
          {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            kind: "attachment",
            rowId: attId,
            followupId: fuId,
            encryptedData: Buffer.from("new-blob-data"),
            fileKeyWrap: newFileKeyWrap,
            copy: fakeTriple(),
          },
          blobStore,
          TEST_ORG_SCHEMA,
        );

        expect(result.inserted).toBe(true);

        // Verify blob_key was rotated
        const att = await testDb.db
          .selectFrom("attachments")
          .select(["blob_key", "file_key_wrap"])
          .where("id", "=", attId)
          .executeTakeFirstOrThrow();
        expect(att.blob_key).not.toBe(oldBlobKey);
        expect(att.file_key_wrap).not.toBeNull();

        // Verify portal_attachments carrier was inserted
        const portalRows = await testDb.db
          .selectFrom("portal_attachments")
          .selectAll()
          .where("channel_id", "=", channel.id)
          .where("attachment_id", "=", attId)
          .execute();
        expect(portalRows.length).toBe(1);
        expect(portalRows[0]!.direction).toBe("to_client");

        // Verify old blob was deleted
        const oldExists = await blobStore.exists(oldBlobKey);
        expect(oldExists).toBe(false);
      });

      it("rotates blob_key and inserts the portal carrier for a recording", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);
        const blobStore = createMemoryBlobStore();

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

        const oldBlobKey = await blobStore.put(
          TEST_ORG_SCHEMA,
          "recording",
          Buffer.from("old-recording-blob"),
        );

        const recId = newRecordingId();
        await testDb.db
          .insertInto("recordings")
          .values({
            id: recId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: oldBlobKey,
            size_bytes: 1024,
            duration_seconds: 42,
            file_key_wrap: null, // not yet converted
          })
          .execute();

        const result = await convertBlobForReseed(
          testDb.db,
          access,
          fixture.userId!,
          {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            kind: "recording",
            rowId: recId,
            followupId: fuId,
            encryptedData: Buffer.from("new-recording-blob"),
            fileKeyWrap: Buffer.alloc(72, 0xcc),
            copy: fakeTriple(),
          },
          blobStore,
          TEST_ORG_SCHEMA,
        );

        expect(result.inserted).toBe(true);

        // Verify blob_key was rotated
        const rec = await testDb.db
          .selectFrom("recordings")
          .select(["blob_key", "file_key_wrap"])
          .where("id", "=", recId)
          .executeTakeFirstOrThrow();
        expect(rec.blob_key).not.toBe(oldBlobKey);
        expect(rec.file_key_wrap).not.toBeNull();

        // Verify portal_recordings carrier was inserted
        const portalRows = await testDb.db
          .selectFrom("portal_recordings")
          .selectAll()
          .where("channel_id", "=", channel.id)
          .where("recording_id", "=", recId)
          .execute();
        expect(portalRows.length).toBe(1);
        expect(portalRows[0]!.direction).toBe("to_client");
      });
    });

    // -----------------------------------------------------------------------
    // listTicketsForClient
    // -----------------------------------------------------------------------

    describe("listTicketsForClient", () => {
      it("returns tickets accessible to the calling volunteer", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const access = createTicketAccessChecker(testDb.db);

        const result = await listTicketsForClient(
          testDb.db,
          access,
          fixture.userId!,
          fixture.clientId,
        );

        expect(result.length).toBe(1);
        expect(result[0]!.ticketId).toBe(fixture.ticketId);
      });

      it("excludes tickets in queues the volunteer cannot access", async () => {
        // Create a fixture without adding the user to the queue
        const fixture1 = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });

        // Create a second ticket for the same client in a different queue
        // that fixture1.userId is NOT assigned to.
        const fixture2 = await createTestTicketFixture(testDb.db);

        // Reassign fixture2's ticket to fixture1's client
        await testDb.db
          .updateTable("tickets")
          .set({ client_id: fixture1.clientId })
          .where("id", "=", fixture2.ticketId)
          .execute();

        const access = createTicketAccessChecker(testDb.db);

        const result = await listTicketsForClient(
          testDb.db,
          access,
          fixture1.userId!,
          fixture1.clientId,
        );

        // Only the one in the user's queue should appear
        expect(result.length).toBe(1);
        expect(result[0]!.ticketId).toBe(fixture1.ticketId);
      });

      it("returns null keyWrap when the caller holds no wrap for the current generation", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const access = createTicketAccessChecker(testDb.db);

        const result = await listTicketsForClient(
          testDb.db,
          access,
          fixture.userId!,
          fixture.clientId,
        );

        expect(result.length).toBe(1);
        expect(result[0]!.keyWrap).toBeNull();
      });

      it("returns the caller's ticket-level keyWrap base64url-encoded", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const access = createTicketAccessChecker(testDb.db);

        const ticketRow = await testDb.db
          .selectFrom("tickets")
          .select("key_generation")
          .where("id", "=", fixture.ticketId)
          .executeTakeFirstOrThrow();

        const ephemeralPoint = crypto.randomBytes(32);
        const nonce = crypto.randomBytes(24);
        const wrappedKey = crypto.randomBytes(48);
        await testDb.db
          .insertInto("ticket_key_wraps")
          .values({
            ticket_id: fixture.ticketId,
            volunteer_id: fixture.userId!,
            key_generation: ticketRow.key_generation,
            ephemeral_point: ephemeralPoint,
            nonce,
            wrapped_key: wrappedKey,
            algorithm: "ecies-ristretto255-v1",
          })
          .execute();

        const result = await listTicketsForClient(
          testDb.db,
          access,
          fixture.userId!,
          fixture.clientId,
        );

        expect(result.length).toBe(1);
        const wrap = result[0]!.keyWrap;
        expect(wrap).not.toBeNull();
        expect(wrap!.ephemeralPoint).toBe(ephemeralPoint.toString("base64url"));
        expect(wrap!.nonce).toBe(nonce.toString("base64url"));
        expect(wrap!.wrappedKey).toBe(wrappedKey.toString("base64url"));
      });
    });
  },
);
