import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { sql } from "kysely";
import * as crypto from "node:crypto";
import {
  createTestDb,
  createTestClientFixture,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";
import type {
  ClientId,
  ChannelSecret,
  ChannelRowId,
  FollowupId,
  KeyGeneration,
} from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)(
  "090_portal_channels migration",
  () => {
    let testDb: TestDb;

    beforeAll(async () => {
      testDb = await createTestDb();
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    // -----------------------------------------------------------------
    // Table existence
    // -----------------------------------------------------------------

    it("creates all expected tables", async () => {
      const tables = [
        "portal_channels",
        "portal_messages",
        "portal_reply_key_wraps",
      ];

      for (const table of tables) {
        const result = await sql<{ exists: boolean }>`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = ${testDb.schemaName}
              AND table_name = ${table}
          ) AS exists
        `.execute(testDb.platformDb);

        expect(result.rows[0]?.exists, `table ${table} should exist`).toBe(
          true,
        );
      }
    });

    // -----------------------------------------------------------------
    // portal_channels
    // -----------------------------------------------------------------

    async function insertChannel(
      clientId: ClientId,
      overrides?: Partial<{
        channel_id: ChannelSecret;
        status: string;
        has_passphrase: boolean;
      }>,
    ): Promise<{ id: ChannelRowId; channel_id: ChannelSecret }> {
      const channelId: ChannelSecret =
        overrides?.channel_id ??
        (crypto.randomBytes(24).toString("hex") as ChannelSecret);
      const row = await testDb.db
        .insertInto("portal_channels")
        .values({
          client_id: clientId,
          channel_id: channelId,
          auth_hash: crypto.randomBytes(32),
          client_public: crypto.randomBytes(32),
          has_passphrase: overrides?.has_passphrase ?? false,
          key_check_ephemeral_point: crypto.randomBytes(32),
          key_check_nonce: crypto.randomBytes(24),
          key_check_ciphertext: crypto.randomBytes(64),
          status: overrides?.status ?? "active",
        })
        .returning(["id", "channel_id"])
        .executeTakeFirstOrThrow();
      return row;
    }

    it("inserts a portal channel with defaults", async () => {
      const fix = await createTestTicketFixture(testDb.db);

      const row = await testDb.db
        .insertInto("portal_channels")
        .values({
          client_id: fix.clientId,
          channel_id: crypto.randomBytes(24).toString("hex") as ChannelSecret,
          auth_hash: crypto.randomBytes(32),
          client_public: crypto.randomBytes(32),
          key_check_ephemeral_point: crypto.randomBytes(32),
          key_check_nonce: crypto.randomBytes(24),
          key_check_ciphertext: crypto.randomBytes(64),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.id).toBeTruthy();
      expect(row.status).toBe("active");
      expect(row.has_passphrase).toBe(false);
      expect(row.created_at).toBeInstanceOf(Date);
      expect(row.last_seen_at).toBeNull();
      expect(row.last_notified_at).toBeNull();
      expect(row.revoked_at).toBeNull();
      expect(Buffer.isBuffer(row.auth_hash)).toBe(true);
      expect(Buffer.isBuffer(row.client_public)).toBe(true);
    });

    it("enforces unique channel_id", async () => {
      const fixA = await createTestTicketFixture(testDb.db);
      const fixB = await createTestTicketFixture(testDb.db);
      const sharedChannelId = crypto
        .randomBytes(24)
        .toString("hex") as ChannelSecret;

      await insertChannel(fixA.clientId, { channel_id: sharedChannelId });

      await expect(
        insertChannel(fixB.clientId, { channel_id: sharedChannelId }),
      ).rejects.toThrow();
    });

    it("rejects a second active channel for the same client via partial unique index", async () => {
      const fix = await createTestTicketFixture(testDb.db);

      await insertChannel(fix.clientId, { status: "active" });

      await expect(
        insertChannel(fix.clientId, { status: "active" }),
      ).rejects.toThrow();
    });

    it("allows an active channel after a revoked one for the same client", async () => {
      const fix = await createTestTicketFixture(testDb.db);

      await insertChannel(fix.clientId, { status: "revoked" });

      // Second channel with active status should succeed
      const row = await insertChannel(fix.clientId, { status: "active" });
      expect(row.id).toBeTruthy();
    });

    it("cascades channel deletion when client is deleted", async () => {
      const fix = await createTestClientFixture(testDb.db);
      const channel = await insertChannel(fix.clientId);

      await testDb.db
        .deleteFrom("clients")
        .where("id", "=", fix.clientId)
        .execute();

      const orphan = await testDb.db
        .selectFrom("portal_channels")
        .selectAll()
        .where("id", "=", channel.id)
        .executeTakeFirst();

      expect(orphan).toBeUndefined();
    });

    // -----------------------------------------------------------------
    // portal_messages
    // -----------------------------------------------------------------

    it("inserts portal message rows and cascades on channel delete", async () => {
      const fix = await createTestTicketFixture(testDb.db);
      const channel = await insertChannel(fix.clientId);

      // Create a follow-up for the message link
      const followup = await testDb.db
        .insertInto("followups")
        .values({
          ticket_id: fix.ticketId,
          source: "volunteer",
          type: "message",
          encrypted_content: Buffer.from("ct-content"),
          created_by: null,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const msg = await testDb.db
        .insertInto("portal_messages")
        .values({
          channel_id: channel.id,
          followup_id: followup.id,
          direction: "to_client",
          ephemeral_point: crypto.randomBytes(32),
          nonce: crypto.randomBytes(24),
          ciphertext: crypto.randomBytes(128),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(msg.direction).toBe("to_client");
      expect(msg.edited_at).toBeNull();
      expect(msg.created_at).toBeInstanceOf(Date);
      expect(Buffer.isBuffer(msg.ephemeral_point)).toBe(true);
      expect(Buffer.isBuffer(msg.ciphertext)).toBe(true);

      // Deleting the channel cascades the messages
      await testDb.db
        .deleteFrom("portal_channels")
        .where("id", "=", channel.id)
        .execute();

      const orphanMsg = await testDb.db
        .selectFrom("portal_messages")
        .selectAll()
        .where("id", "=", msg.id)
        .executeTakeFirst();

      expect(orphanMsg).toBeUndefined();
    });

    it("cascades portal message deletion when followup is deleted", async () => {
      const fix = await createTestTicketFixture(testDb.db);
      const channel = await insertChannel(fix.clientId);

      const followup = await testDb.db
        .insertInto("followups")
        .values({
          ticket_id: fix.ticketId,
          source: "client",
          type: "message",
          encrypted_content: Buffer.from("ct-reply"),
          created_by: null,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .insertInto("portal_messages")
        .values({
          channel_id: channel.id,
          followup_id: followup.id,
          direction: "from_client",
          ephemeral_point: crypto.randomBytes(32),
          nonce: crypto.randomBytes(24),
          ciphertext: crypto.randomBytes(64),
        })
        .execute();

      // Deleting the followup cascades the portal message
      await testDb.db
        .deleteFrom("followups")
        .where("id", "=", followup.id)
        .execute();

      const orphan = await testDb.db
        .selectFrom("portal_messages")
        .selectAll()
        .where("followup_id", "=", followup.id)
        .executeTakeFirst();

      expect(orphan).toBeUndefined();
    });

    // -----------------------------------------------------------------
    // portal_reply_key_wraps
    // -----------------------------------------------------------------

    it("inserts a portal reply key wrap and cascades on followup delete", async () => {
      const fix = await createTestTicketFixture(testDb.db);

      const followup = await testDb.db
        .insertInto("followups")
        .values({
          ticket_id: fix.ticketId,
          source: "client",
          type: "message",
          encrypted_content: Buffer.from("ct-wrap-content"),
          created_by: null,
          key_generation: crypto.randomUUID() as KeyGeneration,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const wrap = await testDb.db
        .insertInto("portal_reply_key_wraps")
        .values({
          followup_id: followup.id,
          wrapped_tk: Buffer.alloc(80, 0xab),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(Buffer.isBuffer(wrap.wrapped_tk)).toBe(true);
      expect(wrap.wrapped_tk.length).toBe(80);
      expect(wrap.created_at).toBeInstanceOf(Date);

      // Deleting the followup cascades the wrap
      await testDb.db
        .deleteFrom("followups")
        .where("id", "=", followup.id)
        .execute();

      const orphanWrap = await testDb.db
        .selectFrom("portal_reply_key_wraps")
        .selectAll()
        .where("followup_id", "=", followup.id)
        .executeTakeFirst();

      expect(orphanWrap).toBeUndefined();
    });

    it("rejects portal reply key wrap for nonexistent followup", async () => {
      await expect(
        testDb.db
          .insertInto("portal_reply_key_wraps")
          .values({
            followup_id: crypto.randomUUID() as FollowupId,
            wrapped_tk: Buffer.alloc(80, 0xab),
          })
          .execute(),
      ).rejects.toThrow();
    });

    // -----------------------------------------------------------------
    // clients.communication_tier
    // -----------------------------------------------------------------

    it("inserts a client with default communication_tier sms_email", async () => {
      const fix = await createTestTicketFixture(testDb.db);

      const row = await testDb.db
        .selectFrom("clients")
        .select("communication_tier")
        .where("id", "=", fix.clientId)
        .executeTakeFirstOrThrow();

      expect(row.communication_tier).toBe("sms_email");
    });

    it("communication_tier column exists and defaults correctly", async () => {
      const result = await sql<{
        column_name: string;
        data_type: string;
        is_nullable: string;
        column_default: string;
      }>`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = ${testDb.schemaName}
          AND table_name = 'clients'
          AND column_name = 'communication_tier'
      `.execute(testDb.platformDb);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]?.data_type).toBe("text");
      expect(result.rows[0]?.is_nullable).toBe("NO");
      expect(result.rows[0]?.column_default).toContain("sms_email");
    });

    // -----------------------------------------------------------------
    // followups.edited_at
    // -----------------------------------------------------------------

    it("followups.edited_at column exists and is nullable", async () => {
      const result = await sql<{
        column_name: string;
        data_type: string;
        is_nullable: string;
      }>`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = ${testDb.schemaName}
          AND table_name = 'followups'
          AND column_name = 'edited_at'
      `.execute(testDb.platformDb);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]?.is_nullable).toBe("YES");
    });

    // -----------------------------------------------------------------
    // org_config.portal_safe_exit_url
    // -----------------------------------------------------------------

    it("org_config.portal_safe_exit_url column exists and is nullable", async () => {
      const result = await sql<{
        column_name: string;
        data_type: string;
        is_nullable: string;
      }>`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = ${testDb.schemaName}
          AND table_name = 'org_config'
          AND column_name = 'portal_safe_exit_url'
      `.execute(testDb.platformDb);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]?.data_type).toBe("text");
      expect(result.rows[0]?.is_nullable).toBe("YES");
    });

    it("org_config.portal_safe_exit_url defaults to null", async () => {
      await testDb.db
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();

      const row = await testDb.db
        .selectFrom("org_config")
        .select("portal_safe_exit_url")
        .executeTakeFirstOrThrow();

      expect(row.portal_safe_exit_url).toBeNull();
    });

    // -----------------------------------------------------------------
    // Cascade: deleting a client cascades channels and messages
    // -----------------------------------------------------------------

    it("deleting a client cascades channels and their messages", async () => {
      const fix = await createTestTicketFixture(testDb.db);
      const channel = await insertChannel(fix.clientId);

      const followup = await testDb.db
        .insertInto("followups")
        .values({
          ticket_id: fix.ticketId,
          source: "volunteer",
          type: "message",
          encrypted_content: Buffer.from("ct"),
          created_by: null,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .insertInto("portal_messages")
        .values({
          channel_id: channel.id,
          followup_id: followup.id,
          direction: "to_client",
          ephemeral_point: crypto.randomBytes(32),
          nonce: crypto.randomBytes(24),
          ciphertext: crypto.randomBytes(64),
        })
        .execute();

      // Delete the ticket first so that tickets_client_id_fkey (no
      // ON DELETE CASCADE) does not block the client deletion. The
      // portal_channels FK does cascade, which is what this test
      // verifies.
      await testDb.db
        .deleteFrom("tickets")
        .where("id", "=", fix.ticketId)
        .execute();

      await testDb.db
        .deleteFrom("clients")
        .where("id", "=", fix.clientId)
        .execute();

      const orphanChannel = await testDb.db
        .selectFrom("portal_channels")
        .selectAll()
        .where("id", "=", channel.id)
        .executeTakeFirst();
      expect(orphanChannel).toBeUndefined();
    });
  },
);
