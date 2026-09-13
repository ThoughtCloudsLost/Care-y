/**
 * Integration tests for the portal recording service.
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
import {
  insertClientRecordingWrap,
  listChannelRecordings,
  resolveChannelRecordingBlobKey,
  purgeChannelRecordings,
} from "./portal-recording-service.js";
import {
  channelSecretSchema,
  newFollowupId,
  newRecordingId,
} from "@care-y/shared";
import type { ClientId, BlobKey } from "@care-y/shared";

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

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "portal-recording-service (DB integration)",
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
    // insertClientRecordingWrap + listChannelRecordings roundtrip
    // -----------------------------------------------------------------------

    describe("insert and list roundtrip", () => {
      it("inserts a wrap and lists it back with duration from the recording", async () => {
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
            blob_key: "test/recording/key-1" as BlobKey,
            size_bytes: 1024,
            duration_seconds: 42,
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

        const list = await listChannelRecordings(testDb.db, channel.id);
        expect(list.length).toBe(1);
        expect(list[0]!.recordingId).toBe(recId);
        expect(list[0]!.followupId).toBe(fuId);
        expect(list[0]!.direction).toBe("to_client");
        expect(list[0]!.durationSeconds).toBe(42);
        // base64url encoded strings
        expect(typeof list[0]!.ephemeralPoint).toBe("string");
        expect(typeof list[0]!.nonce).toBe("string");
        expect(typeof list[0]!.ciphertext).toBe("string");
        expect(typeof list[0]!.createdAt).toBe("string");
      });

      it("excludes soft-deleted recordings from the listing", async () => {
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
            blob_key: "test/recording/deleted-1" as BlobKey,
            size_bytes: 512,
            duration_seconds: 10,
            deleted_at: new Date(),
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

        const list = await listChannelRecordings(testDb.db, channel.id);
        expect(list.length).toBe(0);
      });

      it("orders results by created_at asc then id asc", async () => {
        const fixture = await createTestTicketFixture(testDb.db);
        const channel = await insertChannel(testDb.db, fixture.clientId);

        const fuId1 = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId1,
            ticket_id: fixture.ticketId,
            source: "system",
            type: "phone_call",
            encrypted_content: Buffer.from("ct-1"),
          })
          .execute();

        const recId1 = newRecordingId();
        await testDb.db
          .insertInto("recordings")
          .values({
            id: recId1,
            ticket_id: fixture.ticketId,
            followup_id: fuId1,
            blob_key: "test/recording/ord-1" as BlobKey,
            size_bytes: 100,
            duration_seconds: 5,
            file_key_wrap: Buffer.alloc(72, 0xab),
          })
          .execute();

        await insertClientRecordingWrap(testDb.db, {
          recordingId: recId1,
          channelRowId: channel.id,
          followupId: fuId1,
          direction: "to_client",
          copy: fakeTriple(),
        });

        const fuId2 = newFollowupId();
        await testDb.db
          .insertInto("followups")
          .values({
            id: fuId2,
            ticket_id: fixture.ticketId,
            source: "system",
            type: "phone_call",
            encrypted_content: Buffer.from("ct-2"),
          })
          .execute();

        const recId2 = newRecordingId();
        await testDb.db
          .insertInto("recordings")
          .values({
            id: recId2,
            ticket_id: fixture.ticketId,
            followup_id: fuId2,
            blob_key: "test/recording/ord-2" as BlobKey,
            size_bytes: 200,
            duration_seconds: 15,
            file_key_wrap: Buffer.alloc(72, 0xab),
          })
          .execute();

        await insertClientRecordingWrap(testDb.db, {
          recordingId: recId2,
          channelRowId: channel.id,
          followupId: fuId2,
          direction: "to_client",
          copy: fakeTriple(),
        });

        const list = await listChannelRecordings(testDb.db, channel.id);
        expect(list.length).toBe(2);
        expect(list[0]!.recordingId).toBe(recId1);
        expect(list[1]!.recordingId).toBe(recId2);
      });
    });

    // -----------------------------------------------------------------------
    // resolveChannelRecordingBlobKey
    // -----------------------------------------------------------------------

    describe("resolveChannelRecordingBlobKey", () => {
      it("returns the blob key when a wrap ties the recording to the channel", async () => {
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
            encrypted_content: Buffer.from("ct"),
          })
          .execute();

        const recId = newRecordingId();
        const expectedKey = "test/recording/resolve-1" as BlobKey;
        await testDb.db
          .insertInto("recordings")
          .values({
            id: recId,
            ticket_id: fixture.ticketId,
            followup_id: fuId,
            blob_key: expectedKey,
            size_bytes: 256,
            duration_seconds: 30,
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

        const result = await resolveChannelRecordingBlobKey(
          testDb.db,
          channel.id,
          recId,
        );
        expect(result).toBe(expectedKey);
      });

      it("returns null when no wrap exists for the channel", async () => {
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
            blob_key: "test/recording/no-wrap" as BlobKey,
            size_bytes: 256,
            duration_seconds: 30,
            file_key_wrap: Buffer.alloc(72, 0xab),
          })
          .execute();

        // No wrap inserted for this channel
        const result = await resolveChannelRecordingBlobKey(
          testDb.db,
          channel.id,
          recId,
        );
        expect(result).toBeNull();
      });

      it("returns null when the recording is soft-deleted", async () => {
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
            blob_key: "test/recording/soft-del" as BlobKey,
            size_bytes: 256,
            duration_seconds: 30,
            deleted_at: new Date(),
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

        const result = await resolveChannelRecordingBlobKey(
          testDb.db,
          channel.id,
          recId,
        );
        expect(result).toBeNull();
      });

      it("returns null when a different channel holds the wrap", async () => {
        // Two clients, one channel each: a client can hold only one active
        // channel (uq_portal_channels_active_client), and channels belong
        // to clients, so "a different channel" means a different client.
        const fixture = await createTestTicketFixture(testDb.db);
        const otherFixture = await createTestTicketFixture(testDb.db);
        const channel1 = await insertChannel(testDb.db, fixture.clientId);
        const channel2 = await insertChannel(testDb.db, otherFixture.clientId);

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
            blob_key: "test/recording/wrong-chan" as BlobKey,
            size_bytes: 256,
            duration_seconds: 30,
            file_key_wrap: Buffer.alloc(72, 0xab),
          })
          .execute();

        // Wrap belongs to channel1
        await insertClientRecordingWrap(testDb.db, {
          recordingId: recId,
          channelRowId: channel1.id,
          followupId: fuId,
          direction: "to_client",
          copy: fakeTriple(),
        });

        // channel2 should not see it
        const result = await resolveChannelRecordingBlobKey(
          testDb.db,
          channel2.id,
          recId,
        );
        expect(result).toBeNull();
      });
    });

    // -----------------------------------------------------------------------
    // purgeChannelRecordings
    // -----------------------------------------------------------------------

    describe("purgeChannelRecordings", () => {
      it("removes all wraps for the channel, leaving recordings intact", async () => {
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
            blob_key: "test/recording/purge-1" as BlobKey,
            size_bytes: 256,
            duration_seconds: 30,
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

        await purgeChannelRecordings(testDb.db, channel.id);

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
  },
);
