import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestQueue,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";
import { createMergeService, type MergeService } from "./merge-service.js";
import { createDependencyService } from "./dependency-service.js";
import { MergeError, NotFoundError } from "../errors.js";
import * as crypto from "node:crypto";
import type {
  QueueId,
  ClientId,
  TicketId,
  UserId,
  ChannelRowId,
} from "@care-y/shared";
import { channelSecretSchema } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("MergeService (DB)", () => {
  let testDb: TestDb;
  let svc: MergeService;
  let queueId: QueueId;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    svc = createMergeService(testDb.db);

    const q = await createTestQueue(testDb.db);
    queueId = q.id;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  async function createClientWithTicket(): Promise<{
    clientId: ClientId;
    ticketId: TicketId;
  }> {
    const fix = await createTestTicketFixture(testDb.db, { queueId });
    return { clientId: fix.clientId, ticketId: fix.ticketId };
  }

  it("merge creates a merge event with encrypted snapshot", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    const event = await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snapshot-data"),
    });

    expect(event.primaryClientId).toBe(a.clientId);
    expect(event.secondaryClientId).toBe(b.clientId);
    expect(Buffer.isBuffer(event.snapshot)).toBe(true);
    expect(event.undoLocked).toBe(false);
    expect(event.isUndone).toBe(false);
  });

  it("merge sets secondary.merged_into to primary's ID", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    const secondary = await testDb.db
      .selectFrom("clients")
      .select("merged_into")
      .where("id", "=", b.clientId)
      .executeTakeFirstOrThrow();

    expect(secondary.merged_into).toBe(a.clientId);
  });

  it("merge closes secondary's open ticket", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("status")
      .where("id", "=", b.ticketId)
      .executeTakeFirstOrThrow();

    expect(ticket.status).toBe("closed");
  });

  it("merge rejects self-merge", async () => {
    const a = await createClientWithTicket();
    await expect(
      svc.merge({
        primaryClientId: a.clientId,
        secondaryClientId: a.clientId,
        encryptedSnapshot: Buffer.from("snap"),
      }),
    ).rejects.toBeInstanceOf(MergeError);
  });

  it("merge rejects if secondary is already merged", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();
    const c = await createClientWithTicket();

    await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    await expect(
      svc.merge({
        primaryClientId: c.clientId,
        secondaryClientId: b.clientId,
        encryptedSnapshot: Buffer.from("snap2"),
      }),
    ).rejects.toBeInstanceOf(MergeError);
  });

  it("merge rejects if secondary's ticket has unresolved dependencies", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();
    const blocker = await createClientWithTicket();

    // Add an unresolved dependency: b's ticket depends on blocker's (still open)
    const depService = createDependencyService(testDb.db);
    await depService.add({
      userId: crypto.randomUUID() as UserId,
      ticketId: b.ticketId,
      dependsOnTicketId: blocker.ticketId,
    });

    await expect(
      svc.merge({
        primaryClientId: a.clientId,
        secondaryClientId: b.clientId,
        encryptedSnapshot: Buffer.from("snap"),
      }),
    ).rejects.toBeInstanceOf(MergeError);

    // Verify secondary was NOT merged (transaction rolled back)
    const secondary = await testDb.db
      .selectFrom("clients")
      .select("merged_into")
      .where("id", "=", b.clientId)
      .executeTakeFirstOrThrow();
    expect(secondary.merged_into).toBeNull();
  });

  it("merge rejects if either client does not exist", async () => {
    const a = await createClientWithTicket();
    await expect(
      svc.merge({
        primaryClientId: a.clientId,
        secondaryClientId: crypto.randomUUID() as ClientId,
        encryptedSnapshot: Buffer.from("snap"),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("undoMerge clears merged_into and sets is_undone", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    const event = await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    const undone = await svc.undoMerge({
      mergeEventId: event.id,
      encryptedSnapshot: Buffer.from("undo-snap"),
    });

    expect(undone.isUndone).toBe(true);

    const secondary = await testDb.db
      .selectFrom("clients")
      .select("merged_into")
      .where("id", "=", b.clientId)
      .executeTakeFirstOrThrow();
    expect(secondary.merged_into).toBeNull();
  });

  it("undoMerge rejects if locked", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    const event = await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    await svc.setUndoLock(event.id, true);

    await expect(
      svc.undoMerge({
        mergeEventId: event.id,
        encryptedSnapshot: Buffer.from("undo"),
      }),
    ).rejects.toBeInstanceOf(MergeError);
  });

  it("undoMerge rejects if already undone", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    const event = await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    await svc.undoMerge({
      mergeEventId: event.id,
      encryptedSnapshot: Buffer.from("undo"),
    });

    await expect(
      svc.undoMerge({
        mergeEventId: event.id,
        encryptedSnapshot: Buffer.from("undo2"),
      }),
    ).rejects.toBeInstanceOf(MergeError);
  });

  it("setUndoLock toggles the flag", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    const event = await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    await svc.setUndoLock(event.id, true);

    const locked = await testDb.db
      .selectFrom("client_merge_events")
      .select("undo_locked")
      .where("id", "=", event.id)
      .executeTakeFirstOrThrow();
    expect(locked.undo_locked).toBe(true);

    await svc.setUndoLock(event.id, false);

    const unlocked = await testDb.db
      .selectFrom("client_merge_events")
      .select("undo_locked")
      .where("id", "=", event.id)
      .executeTakeFirstOrThrow();
    expect(unlocked.undo_locked).toBe(false);
  });

  it("listByClient returns events for both primary and secondary", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    const forPrimary = await svc.listByClient(a.clientId);
    const forSecondary = await svc.listByClient(b.clientId);
    expect(forPrimary.length).toBeGreaterThan(0);
    expect(forSecondary.length).toBeGreaterThan(0);
    expect(forPrimary[0]!.id).toBe(forSecondary[0]!.id);
  });

  // -----------------------------------------------------------------------
  // Channel collision during merge
  // -----------------------------------------------------------------------

  /** Insert an active portal channel for a client. Returns the channel row id. */
  async function insertActiveChannel(
    clientId: ClientId,
    overrides?: Partial<Record<string, unknown>>,
  ): Promise<ChannelRowId> {
    const channelId = channelSecretSchema.parse(
      crypto.randomBytes(24).toString("hex"),
    );
    const row = await testDb.db
      .insertInto("portal_channels")
      .values({
        client_id: clientId,
        channel_id: channelId,
        auth_hash: crypto.randomBytes(32),
        client_public: crypto.randomBytes(32),
        has_passphrase: false,
        key_check_ephemeral_point: crypto.randomBytes(32),
        key_check_nonce: crypto.randomBytes(24),
        key_check_ciphertext: crypto.randomBytes(48),
        status: "active",
        kind: "secure_link",
        ...overrides,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    return row.id;
  }

  /** Insert a portal_messages row for a channel (requires a followup FK). */
  async function insertPortalMessage(
    channelRowId: ChannelRowId,
    ticketId: TicketId,
  ): Promise<string> {
    const fu = await testDb.db
      .insertInto("followups")
      .values({
        ticket_id: ticketId,
        source: "volunteer",
        type: "message",
        encrypted_content: Buffer.from("test-content"),
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    const msg = await testDb.db
      .insertInto("portal_messages")
      .values({
        channel_id: channelRowId,
        followup_id: fu.id,
        direction: "to_client",
        ephemeral_point: crypto.randomBytes(32),
        nonce: crypto.randomBytes(24),
        ciphertext: crypto.randomBytes(48),
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    return msg.id;
  }

  it("merge with only secondary holding a channel re-points it to primary", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    // Set secondary's tier to secure_link before giving it a channel
    await testDb.db
      .updateTable("clients")
      .set({ communication_tier: "secure_link" })
      .where("id", "=", b.clientId)
      .execute();

    await insertActiveChannel(b.clientId);

    await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    // Channel now belongs to primary
    const channel = await testDb.db
      .selectFrom("portal_channels")
      .select(["client_id", "status"])
      .where("status", "=", "active")
      .where("client_id", "in", [a.clientId, b.clientId])
      .executeTakeFirst();
    expect(channel).toBeDefined();
    expect(channel!.client_id).toBe(a.clientId);

    // Primary's tier is updated to secure_link
    const primaryClient = await testDb.db
      .selectFrom("clients")
      .select("communication_tier")
      .where("id", "=", a.clientId)
      .executeTakeFirstOrThrow();
    expect(primaryClient.communication_tier).toBe("secure_link");

    // Secondary's tier is reset to sms_email
    const secondaryClient = await testDb.db
      .selectFrom("clients")
      .select("communication_tier")
      .where("id", "=", b.clientId)
      .executeTakeFirstOrThrow();
    expect(secondaryClient.communication_tier).toBe("sms_email");
  });

  it("merge with both channels and no keepChannelOf revokes the newer, keeps the older", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    // Primary gets the OLDER channel
    const olderDate = new Date(Date.now() - 86_400_000);
    const primaryChannelId = await insertActiveChannel(a.clientId, {
      created_at: olderDate,
    });

    // Secondary gets the NEWER channel
    const newerDate = new Date();
    const secondaryChannelId = await insertActiveChannel(b.clientId, {
      created_at: newerDate,
    });

    await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    // Older (primary) channel survives
    const survivingChannel = await testDb.db
      .selectFrom("portal_channels")
      .select(["id", "status"])
      .where("id", "=", primaryChannelId)
      .executeTakeFirstOrThrow();
    expect(survivingChannel.status).toBe("active");

    // Newer (secondary) channel is revoked
    const revokedChannel = await testDb.db
      .selectFrom("portal_channels")
      .select(["id", "status", "revoked_at"])
      .where("id", "=", secondaryChannelId)
      .executeTakeFirstOrThrow();
    expect(revokedChannel.status).toBe("revoked");
    expect(revokedChannel.revoked_at).not.toBeNull();
  });

  it("keepChannelOf 'secondary' keeps the secondary's channel and revokes primary's", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    const primaryChannelId = await insertActiveChannel(a.clientId, {
      created_at: new Date(Date.now() - 86_400_000),
    });
    const secondaryChannelId = await insertActiveChannel(b.clientId);

    await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
      keepChannelOf: "secondary",
    });

    // Primary's channel is revoked
    const primaryChannel = await testDb.db
      .selectFrom("portal_channels")
      .select("status")
      .where("id", "=", primaryChannelId)
      .executeTakeFirstOrThrow();
    expect(primaryChannel.status).toBe("revoked");

    // Secondary's channel survives and is re-pointed to primary
    const secondaryChannel = await testDb.db
      .selectFrom("portal_channels")
      .select(["status", "client_id"])
      .where("id", "=", secondaryChannelId)
      .executeTakeFirstOrThrow();
    expect(secondaryChannel.status).toBe("active");
    expect(secondaryChannel.client_id).toBe(a.clientId);
  });

  it("revoked loser's portal_messages are deleted during merge", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    const primaryChannelId = await insertActiveChannel(a.clientId, {
      created_at: new Date(Date.now() - 86_400_000),
    });
    const secondaryChannelId = await insertActiveChannel(b.clientId);

    // Insert portal messages for both channels
    await insertPortalMessage(primaryChannelId, a.ticketId);
    await insertPortalMessage(secondaryChannelId, b.ticketId);

    await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
      keepChannelOf: "primary",
    });

    // Winner's messages remain
    const winnerMsgs = await testDb.db
      .selectFrom("portal_messages")
      .select("id")
      .where("channel_id", "=", primaryChannelId)
      .execute();
    expect(winnerMsgs.length).toBe(1);

    // Loser's messages are deleted
    const loserMsgs = await testDb.db
      .selectFrom("portal_messages")
      .select("id")
      .where("channel_id", "=", secondaryChannelId)
      .execute();
    expect(loserMsgs.length).toBe(0);
  });

  it("account-kind channel surviving sets tier 'account'", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    // Give primary an account-kind channel
    await insertActiveChannel(a.clientId, {
      kind: "account",
      created_at: new Date(Date.now() - 86_400_000),
    });
    await insertActiveChannel(b.clientId);

    await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
      keepChannelOf: "primary",
    });

    // Primary's tier is "account" (matching the winning channel's kind)
    const client = await testDb.db
      .selectFrom("clients")
      .select("communication_tier")
      .where("id", "=", a.clientId)
      .executeTakeFirstOrThrow();
    expect(client.communication_tier).toBe("account");
  });
});
