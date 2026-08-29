/**
 * Integration tests for the portal attachment service.
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
import type { BlobStore } from "../storage/store.js";
import type { PortalChannelRow } from "./channel-service.js";
import {
  prepareAttachment,
  insertAttachmentRow,
  attachToFollowUp,
  insertClientWrap,
  listChannelAttachments,
  resolveChannelBlobKey,
  purgeChannelAttachments,
  purgeUnlinkedAttachments,
  type AttachmentInput,
} from "./portal-attachment-service.js";
import { ValidationError, AttachmentValidationError } from "../errors.js";
import {
  orgSchemaNameSchema,
  newFollowupId,
  newAttachmentId,
  newKeyGeneration,
  channelSecretSchema,
  PORTAL_ATTACHMENT_MAX_BYTES,
} from "@care-y/shared";
import type {
  ClientId,
  OrgSchema,
  AttachmentId,
  BlobKey,
} from "@care-y/shared";
import type { EciesTripleBuffers } from "./portal-message-service.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_ORG_SCHEMA = orgSchemaNameSchema.parse(
  "org_00000000-0000-4000-8000-bbbbbbbbbbbb",
);

function fakeTriple(): EciesTripleBuffers {
  return {
    ephemeralPoint: Buffer.alloc(32, 0x01),
    nonce: Buffer.alloc(24, 0x02),
    ciphertext: Buffer.from("wrap-ct"),
  };
}

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

function makeInput(overrides?: Partial<AttachmentInput>): AttachmentInput {
  const blob = Buffer.alloc(128, 0xff);
  return {
    attachmentId: newAttachmentId(),
    ticketId: "" as never, // caller overrides
    blob,
    declaredSize: blob.byteLength,
    contentType: "image/png",
    fileKeyWrap: Buffer.alloc(72, 0xab),
    encryptedFilename: Buffer.from("enc-filename"),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "portal-attachment-service (DB integration)",
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
    // prepareAttachment validation
    // -----------------------------------------------------------------------

    describe("prepareAttachment", () => {
      it("accepts a valid upload and stores its blob", async () => {
        const blobStore = createMapBlobStore();
        const fixture = await createTestTicketFixture(testDb.db);
        const input = makeInput({ ticketId: fixture.ticketId });

        const prepared = await prepareAttachment(
          blobStore,
          TEST_ORG_SCHEMA,
          input,
        );

        expect(prepared.attachmentId).toBe(input.attachmentId);
        expect(prepared.ticketId).toBe(fixture.ticketId);
        expect(prepared.sizeBytes).toBe(128);
        expect(prepared.contentType).toBe("image/png");
        expect(blobStore.blobs.size).toBe(1);
      });

      it("rejects ciphertext exceeding the size limit", async () => {
        const blobStore = createMapBlobStore();
        const fixture = await createTestTicketFixture(testDb.db);
        const oversized = Buffer.alloc(PORTAL_ATTACHMENT_MAX_BYTES + 1, 0x00);
        const input = makeInput({
          ticketId: fixture.ticketId,
          blob: oversized,
          declaredSize: oversized.byteLength,
        });

        await expect(
          prepareAttachment(blobStore, TEST_ORG_SCHEMA, input),
        ).rejects.toThrow(ValidationError);

        // Nothing stored
        expect(blobStore.blobs.size).toBe(0);
      });

      it("rejects a declared size that disagrees with the buffer", async () => {
        const blobStore = createMapBlobStore();
        const fixture = await createTestTicketFixture(testDb.db);
        const input = makeInput({
          ticketId: fixture.ticketId,
          declaredSize: 999,
        });

        await expect(
          prepareAttachment(blobStore, TEST_ORG_SCHEMA, input),
        ).rejects.toThrow(ValidationError);

        expect(blobStore.blobs.size).toBe(0);
      });

      it("rejects a content type outside the allowlist with AttachmentValidationError", async () => {
        const blobStore = createMapBlobStore();
        const fixture = await createTestTicketFixture(testDb.db);
        const input = makeInput({
          ticketId: fixture.ticketId,
          contentType: "application/x-executable",
        });

        await expect(
          prepareAttachment(blobStore, TEST_ORG_SCHEMA, input),
        ).rejects.toThrow(AttachmentValidationError);

        expect(blobStore.blobs.size).toBe(0);
      });

      it("accepts ciphertext with no file signature (encrypted bytes have none)", async () => {
        // A real upload is encrypted, so its bytes carry no recognizable
        // file header. The server must accept it, since magic byte checks
        // on ciphertext would reject every real upload.
        const blobStore = createMapBlobStore();
        const fixture = await createTestTicketFixture(testDb.db);
        const randomBytes = crypto.randomBytes(256);
        const input = makeInput({
          ticketId: fixture.ticketId,
          blob: randomBytes,
          declaredSize: randomBytes.byteLength,
        });

        const prepared = await prepareAttachment(
          blobStore,
          TEST_ORG_SCHEMA,
          input,
        );
        expect(prepared.sizeBytes).toBe(256);
        expect(blobStore.blobs.size).toBe(1);
      });

      it("normalizes content type by stripping charset and lowercasing", async () => {
        const blobStore = createMapBlobStore();
        const fixture = await createTestTicketFixture(testDb.db);
        const input = makeInput({
          ticketId: fixture.ticketId,
          contentType: "Image/PNG; charset=utf-8",
        });

        const prepared = await prepareAttachment(
          blobStore,
          TEST_ORG_SCHEMA,
          input,
        );
        expect(prepared.contentType).toBe("image/png");
      });
    });

    // -----------------------------------------------------------------------
    // insertAttachmentRow + attachToFollowUp
    // -----------------------------------------------------------------------

    describe("insertAttachmentRow and attachToFollowUp", () => {
      it("roundtrips: prepared upload becomes a row carrying its wrap", async () => {
        const blobStore = createMapBlobStore();
        const fixture = await createTestTicketFixture(testDb.db);
        const input = makeInput({ ticketId: fixture.ticketId });

        const prepared = await prepareAttachment(
          blobStore,
          TEST_ORG_SCHEMA,
          input,
        );

        const followupId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: followupId,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct"),
            key_generation: newKeyGeneration(),
          })
          .execute();

        await insertAttachmentRow(testDb.db, prepared, followupId);

        const row = await testDb.db
          .selectFrom("attachments")
          .selectAll()
          .where("id", "=", prepared.attachmentId)
          .executeTakeFirstOrThrow();

        expect(row.blob_key).toBe(prepared.blobKey);
        expect(row.size_bytes).toBe(128);
        expect(row.content_type).toBe("image/png");
        expect(row.file_key_wrap).not.toBeNull();
        expect(row.followup_id).toBe(followupId);
      });

      it("attachToFollowUp returns false for an id that is already linked", async () => {
        const blobStore = createMapBlobStore();
        const fixture = await createTestTicketFixture(testDb.db);
        const input = makeInput({ ticketId: fixture.ticketId });

        const prepared = await prepareAttachment(
          blobStore,
          TEST_ORG_SCHEMA,
          input,
        );

        const followupId1 = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: followupId1,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct1"),
            key_generation: newKeyGeneration(),
          })
          .execute();

        await insertAttachmentRow(testDb.db, prepared, followupId1);

        // Already linked, should return false
        const followupId2 = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: followupId2,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct2"),
            key_generation: newKeyGeneration(),
          })
          .execute();

        const linked = await attachToFollowUp(
          testDb.db,
          prepared.attachmentId,
          fixture.ticketId,
          followupId2,
        );
        expect(linked).toBe(false);
      });

      it("attachToFollowUp returns false for a non-existent id", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const followupId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: followupId,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct"),
            key_generation: newKeyGeneration(),
          })
          .execute();

        const linked = await attachToFollowUp(
          testDb.db,
          newAttachmentId(),
          fixture.ticketId,
          followupId,
        );
        expect(linked).toBe(false);
      });

      it("attachToFollowUp succeeds for a pending (null followup_id) row", async () => {
        const blobStore = createMapBlobStore();
        const fixture = await createTestTicketFixture(testDb.db);
        const input = makeInput({ ticketId: fixture.ticketId });

        const prepared = await prepareAttachment(
          blobStore,
          TEST_ORG_SCHEMA,
          input,
        );

        // Insert with null followup_id (pending)
        await insertAttachmentRow(testDb.db, prepared, null);

        const followupId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: followupId,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct"),
            key_generation: newKeyGeneration(),
          })
          .execute();

        const linked = await attachToFollowUp(
          testDb.db,
          prepared.attachmentId,
          fixture.ticketId,
          followupId,
        );
        expect(linked).toBe(true);

        const row = await testDb.db
          .selectFrom("attachments")
          .select("followup_id")
          .where("id", "=", prepared.attachmentId)
          .executeTakeFirstOrThrow();
        expect(row.followup_id).toBe(followupId);
      });
    });

    // -----------------------------------------------------------------------
    // resolveChannelBlobKey
    // -----------------------------------------------------------------------

    describe("resolveChannelBlobKey", () => {
      async function seedAttachmentWithWrap(
        fixture: Awaited<ReturnType<typeof createTestTicketFixture>>,
        channel: PortalChannelRow,
      ): Promise<{ attachmentId: AttachmentId; blobKey: BlobKey }> {
        const blobStore = createMapBlobStore();
        const input = makeInput({ ticketId: fixture.ticketId });
        const prepared = await prepareAttachment(
          blobStore,
          TEST_ORG_SCHEMA,
          input,
        );

        const followupId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: followupId,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct"),
            key_generation: newKeyGeneration(),
          })
          .execute();

        await insertAttachmentRow(testDb.db, prepared, followupId);
        await insertClientWrap(testDb.db, {
          attachmentId: prepared.attachmentId,
          channelRowId: channel.id,
          followupId,
          direction: "from_client",
          copy: fakeTriple(),
        });

        return {
          attachmentId: prepared.attachmentId,
          blobKey: prepared.blobKey,
        };
      }

      it("returns the blob key for a channel with a wrap", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const { attachmentId, blobKey } = await seedAttachmentWithWrap(
          fixture,
          channel,
        );

        const resolved = await resolveChannelBlobKey(
          testDb.db,
          channel.id,
          attachmentId,
        );
        expect(resolved).toBe(blobKey);
      });

      it("returns null for a channel that has no wrap, even when another channel does", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        // Old revoked channel holds the wrap; only one channel per client
        // may be active (uq_portal_channels_active_client).
        const channelWithWrap = await insertChannel(
          testDb.db,
          fixture.clientId,
          {
            status: "revoked",
            revoked_at: new Date(),
          },
        );
        const { attachmentId } = await seedAttachmentWithWrap(
          fixture,
          channelWithWrap,
        );

        // Active replacement channel for the same client, no wrap inserted
        const channelWithout = await insertChannel(testDb.db, fixture.clientId);

        const resolved = await resolveChannelBlobKey(
          testDb.db,
          channelWithout.id,
          attachmentId,
        );
        expect(resolved).toBeNull();
      });

      it("returns null once the attachment is soft-deleted", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);
        const { attachmentId } = await seedAttachmentWithWrap(fixture, channel);

        // Soft-delete the attachment
        await testDb.db
          .updateTable("attachments")
          .set({ deleted_at: new Date() })
          .where("id", "=", attachmentId)
          .execute();

        const resolved = await resolveChannelBlobKey(
          testDb.db,
          channel.id,
          attachmentId,
        );
        expect(resolved).toBeNull();
      });
    });

    // -----------------------------------------------------------------------
    // listChannelAttachments
    // -----------------------------------------------------------------------

    describe("listChannelAttachments", () => {
      it("returns only this channel's files, skips soft-deleted, and is ordered", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel1 = await insertChannel(testDb.db, fixture.clientId);
        // Revoked: only one active channel per client is allowed
        // (uq_portal_channels_active_client).
        const channel2 = await insertChannel(testDb.db, fixture.clientId, {
          status: "revoked",
          revoked_at: new Date(),
        });

        const blobStore = createMapBlobStore();

        const followupId1 = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: followupId1,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct1"),
            key_generation: newKeyGeneration(),
          })
          .execute();

        const followupId2 = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: followupId2,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct2"),
            key_generation: newKeyGeneration(),
          })
          .execute();

        // Two attachments for channel1
        const input1 = makeInput({ ticketId: fixture.ticketId });
        const prep1 = await prepareAttachment(
          blobStore,
          TEST_ORG_SCHEMA,
          input1,
        );
        await insertAttachmentRow(testDb.db, prep1, followupId1);
        await insertClientWrap(testDb.db, {
          attachmentId: prep1.attachmentId,
          channelRowId: channel1.id,
          followupId: followupId1,
          direction: "from_client",
          copy: fakeTriple(),
        });

        const input2 = makeInput({ ticketId: fixture.ticketId });
        const prep2 = await prepareAttachment(
          blobStore,
          TEST_ORG_SCHEMA,
          input2,
        );
        await insertAttachmentRow(testDb.db, prep2, followupId2);
        await insertClientWrap(testDb.db, {
          attachmentId: prep2.attachmentId,
          channelRowId: channel1.id,
          followupId: followupId2,
          direction: "to_client",
          copy: fakeTriple(),
        });

        // One attachment for channel2 (should not appear in channel1 list)
        const followupId3 = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: followupId3,
            ticket_id: fixture.ticketId,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.from("ct3"),
          })
          .execute();

        const input3 = makeInput({ ticketId: fixture.ticketId });
        const prep3 = await prepareAttachment(
          blobStore,
          TEST_ORG_SCHEMA,
          input3,
        );
        await insertAttachmentRow(testDb.db, prep3, followupId3);
        await insertClientWrap(testDb.db, {
          attachmentId: prep3.attachmentId,
          channelRowId: channel2.id,
          followupId: followupId3,
          direction: "to_client",
          copy: fakeTriple(),
        });

        // Soft-delete the second attachment (should be excluded)
        await testDb.db
          .updateTable("attachments")
          .set({ deleted_at: new Date() })
          .where("id", "=", prep2.attachmentId)
          .execute();

        const list = await listChannelAttachments(testDb.db, channel1.id);

        // Only the first (non-deleted) attachment for channel1
        expect(list.length).toBe(1);
        expect(list[0]!.attachmentId).toBe(prep1.attachmentId);
        expect(list[0]!.direction).toBe("from_client");
        expect(list[0]!.sizeBytes).toBe(128);
        expect(list[0]!.contentType).toBe("image/png");
        // Wire format: base64url-encoded
        expect(typeof list[0]!.ephemeralPoint).toBe("string");
        expect(typeof list[0]!.createdAt).toBe("string");
      });
    });

    // -----------------------------------------------------------------------
    // purgeChannelAttachments
    // -----------------------------------------------------------------------

    describe("purgeChannelAttachments", () => {
      it("removes the wraps and leaves the attachments row", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        const blobStore = createMapBlobStore();
        const followupId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: followupId,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct"),
            key_generation: newKeyGeneration(),
          })
          .execute();

        const input = makeInput({ ticketId: fixture.ticketId });
        const prepared = await prepareAttachment(
          blobStore,
          TEST_ORG_SCHEMA,
          input,
        );
        await insertAttachmentRow(testDb.db, prepared, followupId);
        await insertClientWrap(testDb.db, {
          attachmentId: prepared.attachmentId,
          channelRowId: channel.id,
          followupId,
          direction: "from_client",
          copy: fakeTriple(),
        });

        // Verify wrap exists
        const before = await testDb.db
          .selectFrom("portal_attachments")
          .select("id")
          .where("channel_id", "=", channel.id)
          .execute();
        expect(before.length).toBe(1);

        await purgeChannelAttachments(testDb.db, channel.id);

        // Wrap gone
        const after = await testDb.db
          .selectFrom("portal_attachments")
          .select("id")
          .where("channel_id", "=", channel.id)
          .execute();
        expect(after.length).toBe(0);

        // Attachment row still present
        const attRow = await testDb.db
          .selectFrom("attachments")
          .select("id")
          .where("id", "=", prepared.attachmentId)
          .executeTakeFirst();
        expect(attRow).toBeDefined();
      });
    });

    // -----------------------------------------------------------------------
    // purgeUnlinkedAttachments
    // -----------------------------------------------------------------------

    describe("purgeUnlinkedAttachments", () => {
      it("removes a pending upload past the cutoff and deletes its blob", async () => {
        const blobStore = createMapBlobStore();
        const fixture = await createTestTicketFixture(testDb.db);
        const input = makeInput({ ticketId: fixture.ticketId });

        const prepared = await prepareAttachment(
          blobStore,
          TEST_ORG_SCHEMA,
          input,
        );

        // Insert with null followup_id (pending)
        await insertAttachmentRow(testDb.db, prepared, null);

        // Backdate the row past the cutoff
        await testDb.db
          .updateTable("attachments")
          .set({ created_at: new Date("2020-01-01") })
          .where("id", "=", prepared.attachmentId)
          .execute();

        expect(blobStore.blobs.size).toBe(1);

        const cutoff = new Date("2025-01-01");
        const removed = await purgeUnlinkedAttachments(
          testDb.db,
          blobStore,
          cutoff,
        );

        expect(removed).toBe(1);
        expect(blobStore.blobs.size).toBe(0);

        // Row gone
        const row = await testDb.db
          .selectFrom("attachments")
          .select("id")
          .where("id", "=", prepared.attachmentId)
          .executeTakeFirst();
        expect(row).toBeUndefined();
      });

      it("leaves a linked attachment alone", async () => {
        const blobStore = createMapBlobStore();
        const fixture = await createTestTicketFixture(testDb.db);
        const input = makeInput({ ticketId: fixture.ticketId });

        const prepared = await prepareAttachment(
          blobStore,
          TEST_ORG_SCHEMA,
          input,
        );

        const followupId = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: followupId,
            ticket_id: fixture.ticketId,
            source: "client",
            type: "message",
            encrypted_content: Buffer.from("ct"),
            key_generation: newKeyGeneration(),
          })
          .execute();

        await insertAttachmentRow(testDb.db, prepared, followupId);

        // Backdate it
        await testDb.db
          .updateTable("attachments")
          .set({ created_at: new Date("2020-01-01") })
          .where("id", "=", prepared.attachmentId)
          .execute();

        const cutoff = new Date("2025-01-01");
        const removed = await purgeUnlinkedAttachments(
          testDb.db,
          blobStore,
          cutoff,
        );

        expect(removed).toBe(0);
        expect(blobStore.blobs.size).toBe(1);

        const row = await testDb.db
          .selectFrom("attachments")
          .select("id")
          .where("id", "=", prepared.attachmentId)
          .executeTakeFirst();
        expect(row).toBeDefined();
      });
    });
  },
);
