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
import { ForbiddenError } from "../errors.js";
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
  ReseedRowNotFoundError,
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

      it("accepts email_inbound message copies", async () => {
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
            type: "email_inbound",
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
        expect(rows[0]!.direction).toBe("from_client");
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

    // -----------------------------------------------------------------------
    // reseedPortalHistory: channel and followup denial guards
    // -----------------------------------------------------------------------

    describe("reseedPortalHistory - channel and followup guards", () => {
      it("throws PortalChannelMismatchError when the client has no active channel", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        // No channel inserted for this client
        const access = createTicketAccessChecker(testDb.db);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.from("ct-noact"),
          })
          .execute();

        await expect(
          reseedPortalHistory(testDb.db, access, fixture.userId!, {
            clientId: fixture.clientId,
            channelId: crypto.randomBytes(24).toString("hex"),
            messages: [{ followupId: fuId, copy: fakeTriple() }],
            attachmentWraps: [],
            recordingWraps: [],
          }),
        ).rejects.toThrow(PortalChannelMismatchError);
      });

      it("throws ReseedValidationError when all arrays are empty (no followup IDs)", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

        await expect(
          reseedPortalHistory(testDb.db, access, fixture.userId!, {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [],
            attachmentWraps: [],
            recordingWraps: [],
          }),
        ).rejects.toThrow(ReseedValidationError);
      });

      it("throws ReseedValidationError when a referenced followup does not exist", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

        const bogusFollowupId = newFollowupId();

        await expect(
          reseedPortalHistory(testDb.db, access, fixture.userId!, {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [{ followupId: bogusFollowupId, copy: fakeTriple() }],
            attachmentWraps: [],
            recordingWraps: [],
          }),
        ).rejects.toThrow(ReseedValidationError);
      });
    });

    // -----------------------------------------------------------------------
    // reseedPortalHistory: internal_note guard on recording wraps
    // -----------------------------------------------------------------------

    describe("reseedPortalHistory - recording internal_note guard", () => {
      it("rejects internal_note recording wraps", async () => {
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
            encrypted_content: Buffer.from("ct-intnote"),
          })
          .execute();

        const recId = newRecordingId();
        await testDb.db
          .insertInto("recordings")
          .values({
            id: recId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/rec/intern-1" as BlobKey,
            size_bytes: 512,
            duration_seconds: 10,
            file_key_wrap: Buffer.alloc(72, 0xab),
          })
          .execute();

        await expect(
          reseedPortalHistory(testDb.db, access, fixture.userId!, {
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
          }),
        ).rejects.toThrow(ReseedValidationError);
      });
    });

    // -----------------------------------------------------------------------
    // reseedPortalHistory: attachment row validation guards
    // -----------------------------------------------------------------------

    describe("reseedPortalHistory - attachment row validation", () => {
      it("rejects when the attachment row does not exist", async () => {
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
            encrypted_content: Buffer.from("ct-att-nf"),
          })
          .execute();

        const bogusAttId = newAttachmentId();

        await expect(
          reseedPortalHistory(testDb.db, access, fixture.userId!, {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [],
            attachmentWraps: [
              {
                attachmentId: bogusAttId,
                followupId: fuId,
                copy: fakeTriple(),
              },
            ],
            recordingWraps: [],
          }),
        ).rejects.toThrow(ReseedValidationError);
      });

      it("rejects when the attachment is soft-deleted", async () => {
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
            encrypted_content: Buffer.from("ct-att-del"),
          })
          .execute();

        const attId = newAttachmentId();
        await testDb.db
          .insertInto("attachments")
          .values({
            id: attId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/att/del-1" as BlobKey,
            size_bytes: 100,
            content_type: "image/png",
            encrypted_filename: Buffer.from("ct-fn-del"),
            file_key_wrap: Buffer.alloc(72, 0xab),
            deleted_at: new Date(),
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

      it("rejects when attachment followup_id does not match", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

        const fuId1 = newFollowupId();
        const fuId2 = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values([
            {
              id: fuId1,
              ticket_id: fixture.ticketId,
              source: "volunteer",
              type: "message",
              encrypted_content: Buffer.from("ct-att-mm1"),
            },
            {
              id: fuId2,
              ticket_id: fixture.ticketId,
              source: "volunteer",
              type: "message",
              encrypted_content: Buffer.from("ct-att-mm2"),
            },
          ])
          .execute();

        const attId = newAttachmentId();
        await testDb.db
          .insertInto("attachments")
          .values({
            id: attId,
            ticket_id: fixture.ticketId,
            followup_id: fuId1,
            blob_key: "test/att/mm-1" as BlobKey,
            size_bytes: 100,
            content_type: "image/png",
            encrypted_filename: Buffer.from("ct-fn-mm"),
            file_key_wrap: Buffer.alloc(72, 0xab),
          })
          .execute();

        // Claim the attachment belongs to fuId2, but it actually belongs to fuId1
        await expect(
          reseedPortalHistory(testDb.db, access, fixture.userId!, {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [],
            attachmentWraps: [
              {
                attachmentId: attId,
                followupId: fuId2,
                copy: fakeTriple(),
              },
            ],
            recordingWraps: [],
          }),
        ).rejects.toThrow(ReseedValidationError);
      });
    });

    // -----------------------------------------------------------------------
    // reseedPortalHistory: recording row validation guards
    // -----------------------------------------------------------------------

    describe("reseedPortalHistory - recording row validation", () => {
      it("rejects when the recording row does not exist", async () => {
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
            encrypted_content: Buffer.from("ct-rec-nf"),
          })
          .execute();

        const bogusRecId = newRecordingId();

        await expect(
          reseedPortalHistory(testDb.db, access, fixture.userId!, {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [],
            attachmentWraps: [],
            recordingWraps: [
              {
                recordingId: bogusRecId,
                followupId: fuId,
                copy: fakeTriple(),
              },
            ],
          }),
        ).rejects.toThrow(ReseedValidationError);
      });

      it("rejects when the recording is soft-deleted", async () => {
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
            encrypted_content: Buffer.from("ct-rec-del"),
          })
          .execute();

        const recId = newRecordingId();
        await testDb.db
          .insertInto("recordings")
          .values({
            id: recId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/rec/del-1" as BlobKey,
            size_bytes: 512,
            duration_seconds: 5,
            file_key_wrap: Buffer.alloc(72, 0xab),
            deleted_at: new Date(),
          })
          .execute();

        await expect(
          reseedPortalHistory(testDb.db, access, fixture.userId!, {
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
          }),
        ).rejects.toThrow(ReseedValidationError);
      });

      it("rejects when recording followup_id does not match", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);

        const fuId1 = newFollowupId();
        const fuId2 = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values([
            {
              id: fuId1,
              ticket_id: fixture.ticketId,
              source: "system",
              type: "phone_call",
              encrypted_content: Buffer.from("ct-rec-mm1"),
            },
            {
              id: fuId2,
              ticket_id: fixture.ticketId,
              source: "system",
              type: "phone_call",
              encrypted_content: Buffer.from("ct-rec-mm2"),
            },
          ])
          .execute();

        const recId = newRecordingId();
        await testDb.db
          .insertInto("recordings")
          .values({
            id: recId,
            ticket_id: fixture.ticketId,
            followup_id: fuId1,
            blob_key: "test/rec/mm-1" as BlobKey,
            size_bytes: 512,
            duration_seconds: 5,
            file_key_wrap: Buffer.alloc(72, 0xab),
          })
          .execute();

        await expect(
          reseedPortalHistory(testDb.db, access, fixture.userId!, {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [],
            attachmentWraps: [],
            recordingWraps: [
              {
                recordingId: recId,
                followupId: fuId2,
                copy: fakeTriple(),
              },
            ],
          }),
        ).rejects.toThrow(ReseedValidationError);
      });
    });

    // -----------------------------------------------------------------------
    // reseedPortalHistory: ticket access denial
    // -----------------------------------------------------------------------

    describe("reseedPortalHistory - ticket access enforcement", () => {
      it("throws ForbiddenError when the caller lacks access to the followup's ticket", async () => {
        // Create a fixture without a user to ensure no access
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        // Create a second fixture with a user who has no queue membership for the first fixture's ticket
        const otherFixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });

        const access = createTicketAccessChecker(testDb.db);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: fixture.ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.from("ct-noacc"),
          })
          .execute();

        await expect(
          reseedPortalHistory(testDb.db, access, otherFixture.userId!, {
            clientId: fixture.clientId,
            channelId: channel.channel_id,
            messages: [{ followupId: fuId, copy: fakeTriple() }],
            attachmentWraps: [],
            recordingWraps: [],
          }),
        ).rejects.toThrow(ForbiddenError);
      });
    });

    // -----------------------------------------------------------------------
    // convertBlobForReseed: channel denial guards
    // -----------------------------------------------------------------------

    describe("convertBlobForReseed - channel guards", () => {
      it("throws PortalChannelMismatchError when no active channel exists", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
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
            encrypted_content: Buffer.from("ct-conv-noact"),
          })
          .execute();

        const attId = newAttachmentId();
        await testDb.db
          .insertInto("attachments")
          .values({
            id: attId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/att/conv-noact" as BlobKey,
            size_bytes: 100,
            content_type: "image/png",
            encrypted_filename: Buffer.from("ct-fn-conv-noact"),
            file_key_wrap: null,
          })
          .execute();

        await expect(
          convertBlobForReseed(
            testDb.db,
            access,
            fixture.userId!,
            {
              clientId: fixture.clientId,
              channelId: crypto.randomBytes(24).toString("hex"),
              kind: "attachment",
              rowId: attId,
              followupId: fuId,
              encryptedData: Buffer.from("ct-blob-noact"),
              fileKeyWrap: Buffer.alloc(72, 0xcc),
              copy: fakeTriple(),
            },
            blobStore,
            TEST_ORG_SCHEMA,
          ),
        ).rejects.toThrow(PortalChannelMismatchError);
      });

      it("throws PortalChannelMismatchError when channel ID does not match active channel", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        await insertChannel(testDb.db, fixture.clientId);
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
            encrypted_content: Buffer.from("ct-conv-wrongch"),
          })
          .execute();

        const attId = newAttachmentId();
        await testDb.db
          .insertInto("attachments")
          .values({
            id: attId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/att/conv-wrongch" as BlobKey,
            size_bytes: 100,
            content_type: "image/png",
            encrypted_filename: Buffer.from("ct-fn-conv-wrongch"),
            file_key_wrap: null,
          })
          .execute();

        const wrongChannelId = crypto.randomBytes(24).toString("hex");

        await expect(
          convertBlobForReseed(
            testDb.db,
            access,
            fixture.userId!,
            {
              clientId: fixture.clientId,
              channelId: wrongChannelId,
              kind: "attachment",
              rowId: attId,
              followupId: fuId,
              encryptedData: Buffer.from("ct-blob-wrongch"),
              fileKeyWrap: Buffer.alloc(72, 0xcc),
              copy: fakeTriple(),
            },
            blobStore,
            TEST_ORG_SCHEMA,
          ),
        ).rejects.toThrow(PortalChannelMismatchError);
      });
    });

    // -----------------------------------------------------------------------
    // convertBlobForReseed: attachment denial guards
    // -----------------------------------------------------------------------

    describe("convertBlobForReseed - attachment denial guards", () => {
      it("throws ReseedRowNotFoundError when the attachment does not exist", async () => {
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
            encrypted_content: Buffer.from("ct-attconv-nf"),
          })
          .execute();

        const bogusAttId = newAttachmentId();

        await expect(
          convertBlobForReseed(
            testDb.db,
            access,
            fixture.userId!,
            {
              clientId: fixture.clientId,
              channelId: channel.channel_id,
              kind: "attachment",
              rowId: bogusAttId,
              followupId: fuId,
              encryptedData: Buffer.from("ct-blob-att-nf"),
              fileKeyWrap: Buffer.alloc(72, 0xcc),
              copy: fakeTriple(),
            },
            blobStore,
            TEST_ORG_SCHEMA,
          ),
        ).rejects.toThrow(ReseedRowNotFoundError);
      });

      it("throws ReseedRowNotFoundError when the attachment is soft-deleted", async () => {
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
            encrypted_content: Buffer.from("ct-attconv-del"),
          })
          .execute();

        const attId = newAttachmentId();
        await testDb.db
          .insertInto("attachments")
          .values({
            id: attId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/att/conv-del" as BlobKey,
            size_bytes: 100,
            content_type: "image/png",
            encrypted_filename: Buffer.from("ct-fn-conv-del"),
            file_key_wrap: null,
            deleted_at: new Date(),
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
              encryptedData: Buffer.from("ct-blob-att-del"),
              fileKeyWrap: Buffer.alloc(72, 0xcc),
              copy: fakeTriple(),
            },
            blobStore,
            TEST_ORG_SCHEMA,
          ),
        ).rejects.toThrow(ReseedRowNotFoundError);
      });

      it("throws ReseedValidationError when attachment followup_id does not match", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);
        const blobStore = createMemoryBlobStore();

        const fuId1 = newFollowupId();
        const fuId2 = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values([
            {
              id: fuId1,
              ticket_id: fixture.ticketId,
              source: "volunteer",
              type: "message",
              encrypted_content: Buffer.from("ct-attconv-mm1"),
            },
            {
              id: fuId2,
              ticket_id: fixture.ticketId,
              source: "volunteer",
              type: "message",
              encrypted_content: Buffer.from("ct-attconv-mm2"),
            },
          ])
          .execute();

        const attId = newAttachmentId();
        await testDb.db
          .insertInto("attachments")
          .values({
            id: attId,
            ticket_id: fixture.ticketId,
            followup_id: fuId1,
            blob_key: "test/att/conv-mm" as BlobKey,
            size_bytes: 100,
            content_type: "image/png",
            encrypted_filename: Buffer.from("ct-fn-conv-mm"),
            file_key_wrap: null,
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
              followupId: fuId2,
              encryptedData: Buffer.from("ct-blob-att-mm"),
              fileKeyWrap: Buffer.alloc(72, 0xcc),
              copy: fakeTriple(),
            },
            blobStore,
            TEST_ORG_SCHEMA,
          ),
        ).rejects.toThrow(ReseedValidationError);
      });

      // The followup-not-found side of the guard (fu === undefined) is not
      // testable: reaching it requires the attachment's followup_id to equal
      // the input followupId while that followup row is absent, and the
      // attachments FK forbids that state. The wrong-client side of the same
      // throw site is covered below.

      it("throws ReseedValidationError when the parent followup belongs to a different client", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);
        const blobStore = createMemoryBlobStore();

        // Create a second client/ticket in a different queue
        const otherFixture = await createTestTicketFixture(testDb.db);

        const fuId = newFollowupId();
        // Followup on the OTHER client's ticket
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: otherFixture.ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.from("ct-attconv-wrcl"),
          })
          .execute();

        // Attachment must also reference this followup for the FK match
        const attId = newAttachmentId();
        await testDb.db
          .insertInto("attachments")
          .values({
            id: attId,
            ticket_id: otherFixture.ticketId,
            followup_id: fuId,
            blob_key: "test/att/conv-wrcl" as BlobKey,
            size_bytes: 100,
            content_type: "image/png",
            encrypted_filename: Buffer.from("ct-fn-conv-wrcl"),
            file_key_wrap: null,
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
              encryptedData: Buffer.from("ct-blob-att-wrcl"),
              fileKeyWrap: Buffer.alloc(72, 0xcc),
              copy: fakeTriple(),
            },
            blobStore,
            TEST_ORG_SCHEMA,
          ),
        ).rejects.toThrow(ReseedValidationError);
      });

      it("sets direction to from_client for client-sourced attachment conversions", async () => {
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
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct-attconv-dir"),
          })
          .execute();

        const oldBlobKey = await blobStore.put(
          TEST_ORG_SCHEMA,
          "attachment",
          Buffer.from("ct-old-att-blob-dir"),
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
            encrypted_filename: Buffer.from("ct-fn-dir"),
            file_key_wrap: null,
          })
          .execute();

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
            encryptedData: Buffer.from("ct-new-att-blob-dir"),
            fileKeyWrap: Buffer.alloc(72, 0xcc),
            copy: fakeTriple(),
          },
          blobStore,
          TEST_ORG_SCHEMA,
        );

        expect(result.inserted).toBe(true);

        // portal_attachments direction should be from_client
        // (serves the portal message rendering layer's direction filter)
        const portalRows = await testDb.db
          .selectFrom("portal_attachments")
          .selectAll()
          .where("channel_id", "=", channel.id)
          .where("attachment_id", "=", attId)
          .execute();
        expect(portalRows.length).toBe(1);
        expect(portalRows[0]!.direction).toBe("from_client");
      });
    });

    // -----------------------------------------------------------------------
    // convertBlobForReseed: recording denial guards
    // -----------------------------------------------------------------------

    describe("convertBlobForReseed - recording denial guards", () => {
      it("throws ReseedRowNotFoundError when the recording does not exist", async () => {
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
            encrypted_content: Buffer.from("ct-recconv-nf"),
          })
          .execute();

        const bogusRecId = newRecordingId();

        await expect(
          convertBlobForReseed(
            testDb.db,
            access,
            fixture.userId!,
            {
              clientId: fixture.clientId,
              channelId: channel.channel_id,
              kind: "recording",
              rowId: bogusRecId,
              followupId: fuId,
              encryptedData: Buffer.from("ct-blob-rec-nf"),
              fileKeyWrap: Buffer.alloc(72, 0xcc),
              copy: fakeTriple(),
            },
            blobStore,
            TEST_ORG_SCHEMA,
          ),
        ).rejects.toThrow(ReseedRowNotFoundError);
      });

      it("throws ReseedRowNotFoundError when the recording is soft-deleted", async () => {
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
            encrypted_content: Buffer.from("ct-recconv-del"),
          })
          .execute();

        const recId = newRecordingId();
        await testDb.db
          .insertInto("recordings")
          .values({
            id: recId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/rec/conv-del" as BlobKey,
            size_bytes: 512,
            duration_seconds: 5,
            file_key_wrap: null,
            deleted_at: new Date(),
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
              kind: "recording",
              rowId: recId,
              followupId: fuId,
              encryptedData: Buffer.from("ct-blob-rec-del"),
              fileKeyWrap: Buffer.alloc(72, 0xcc),
              copy: fakeTriple(),
            },
            blobStore,
            TEST_ORG_SCHEMA,
          ),
        ).rejects.toThrow(ReseedRowNotFoundError);
      });

      it("throws ReseedValidationError when recording followup_id does not match", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);
        const blobStore = createMemoryBlobStore();

        const fuId1 = newFollowupId();
        const fuId2 = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values([
            {
              id: fuId1,
              ticket_id: fixture.ticketId,
              source: "system",
              type: "phone_call",
              encrypted_content: Buffer.from("ct-recconv-mm1"),
            },
            {
              id: fuId2,
              ticket_id: fixture.ticketId,
              source: "system",
              type: "phone_call",
              encrypted_content: Buffer.from("ct-recconv-mm2"),
            },
          ])
          .execute();

        const recId = newRecordingId();
        await testDb.db
          .insertInto("recordings")
          .values({
            id: recId,
            ticket_id: fixture.ticketId,
            followup_id: fuId1,
            blob_key: "test/rec/conv-mm" as BlobKey,
            size_bytes: 512,
            duration_seconds: 5,
            file_key_wrap: null,
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
              kind: "recording",
              rowId: recId,
              followupId: fuId2,
              encryptedData: Buffer.from("ct-blob-rec-mm"),
              fileKeyWrap: Buffer.alloc(72, 0xcc),
              copy: fakeTriple(),
            },
            blobStore,
            TEST_ORG_SCHEMA,
          ),
        ).rejects.toThrow(ReseedValidationError);
      });

      it("throws ReseedAlreadyConvertedError when recording file_key_wrap is already set", async () => {
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
            encrypted_content: Buffer.from("ct-recconv-dup"),
          })
          .execute();

        const recId = newRecordingId();
        await testDb.db
          .insertInto("recordings")
          .values({
            id: recId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: "test/rec/conv-dup" as BlobKey,
            size_bytes: 512,
            duration_seconds: 5,
            file_key_wrap: Buffer.alloc(72, 0xab),
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
              kind: "recording",
              rowId: recId,
              followupId: fuId,
              encryptedData: Buffer.from("ct-blob-rec-dup"),
              fileKeyWrap: Buffer.alloc(72, 0xcc),
              copy: fakeTriple(),
            },
            blobStore,
            TEST_ORG_SCHEMA,
          ),
        ).rejects.toThrow(ReseedAlreadyConvertedError);
      });

      // The recording followup-not-found side is likewise untestable: the
      // recordings FK forbids a followup_id that matches the input while the
      // followup row is absent. The wrong-client side is covered below.

      it("throws ReseedValidationError when recording parent followup belongs to a different client", async () => {
        const fixture = await createTestTicketFixture(testDb.db, {
          createUser: true,
        });
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const access = createTicketAccessChecker(testDb.db);
        const blobStore = createMemoryBlobStore();

        const otherFixture = await createTestTicketFixture(testDb.db);

        const fuId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId,
            ticket_id: otherFixture.ticketId,
            source: "system",
            type: "phone_call",
            encrypted_content: Buffer.from("ct-recconv-wrcl"),
          })
          .execute();

        const recId = newRecordingId();
        await testDb.db
          .insertInto("recordings")
          .values({
            id: recId,
            ticket_id: otherFixture.ticketId,
            followup_id: fuId,
            blob_key: "test/rec/conv-wrcl" as BlobKey,
            size_bytes: 512,
            duration_seconds: 5,
            file_key_wrap: null,
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
              kind: "recording",
              rowId: recId,
              followupId: fuId,
              encryptedData: Buffer.from("ct-blob-rec-wrcl"),
              fileKeyWrap: Buffer.alloc(72, 0xcc),
              copy: fakeTriple(),
            },
            blobStore,
            TEST_ORG_SCHEMA,
          ),
        ).rejects.toThrow(ReseedValidationError);
      });

      it("sets direction to from_client for client-sourced recording conversions", async () => {
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
            source: "client",
            type: "sms_inbound",
            encrypted_content: Buffer.from("ct-recconv-dir"),
          })
          .execute();

        const oldBlobKey = await blobStore.put(
          TEST_ORG_SCHEMA,
          "recording",
          Buffer.from("ct-old-rec-blob-dir"),
        );

        const recId = newRecordingId();
        await testDb.db
          .insertInto("recordings")
          .values({
            id: recId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: oldBlobKey,
            size_bytes: 512,
            duration_seconds: 10,
            file_key_wrap: null,
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
            encryptedData: Buffer.from("ct-new-rec-blob-dir"),
            fileKeyWrap: Buffer.alloc(72, 0xcc),
            copy: fakeTriple(),
          },
          blobStore,
          TEST_ORG_SCHEMA,
        );

        expect(result.inserted).toBe(true);

        // portal_recordings direction should be from_client
        // (serves the portal message rendering layer's direction filter)
        const portalRows = await testDb.db
          .selectFrom("portal_recordings")
          .selectAll()
          .where("channel_id", "=", channel.id)
          .where("recording_id", "=", recId)
          .execute();
        expect(portalRows.length).toBe(1);
        expect(portalRows[0]!.direction).toBe("from_client");
      });
    });

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
