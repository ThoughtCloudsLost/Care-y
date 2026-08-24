import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { sql } from "kysely";
import * as crypto from "node:crypto";
import {
  createTestDb,
  createTestClientFixture,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";
import { newClientAccountId } from "@care-y/shared";
import type { UsernameHash, ChannelSecret } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)(
  "092_client_accounts migration",
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

    it("creates client_accounts and client_account_sessions tables", async () => {
      const tables = ["client_accounts", "client_account_sessions"];

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
    // client_accounts
    // -----------------------------------------------------------------

    it("inserts a client account with required fields", async () => {
      const fix = await createTestClientFixture(testDb.db);
      const accountId = newClientAccountId();

      const row = await testDb.db
        .insertInto("client_accounts")
        .values({
          id: accountId,
          client_id: fix.clientId,
          username_hash: crypto.randomBytes(32).toString("hex") as UsernameHash,
          salt: crypto.randomBytes(16),
          public_key: crypto.randomBytes(32),
          auth_hash: crypto.randomBytes(32),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.id).toBe(accountId);
      expect(row.client_id).toBe(fix.clientId);
      expect(row.created_at).toBeInstanceOf(Date);
      expect(Buffer.isBuffer(row.salt)).toBe(true);
      expect(row.salt.length).toBe(16);
      expect(Buffer.isBuffer(row.public_key)).toBe(true);
      expect(row.public_key.length).toBe(32);
      expect(Buffer.isBuffer(row.auth_hash)).toBe(true);
      expect(row.auth_hash.length).toBe(32);
    });

    it("enforces username_hash uniqueness", async () => {
      const fixA = await createTestClientFixture(testDb.db);
      const fixB = await createTestClientFixture(testDb.db);
      const sharedHash = crypto.randomBytes(32).toString("hex") as UsernameHash;

      await testDb.db
        .insertInto("client_accounts")
        .values({
          id: newClientAccountId(),
          client_id: fixA.clientId,
          username_hash: sharedHash,
          salt: crypto.randomBytes(16),
          public_key: crypto.randomBytes(32),
          auth_hash: crypto.randomBytes(32),
        })
        .execute();

      await expect(
        testDb.db
          .insertInto("client_accounts")
          .values({
            id: newClientAccountId(),
            client_id: fixB.clientId,
            username_hash: sharedHash,
            salt: crypto.randomBytes(16),
            public_key: crypto.randomBytes(32),
            auth_hash: crypto.randomBytes(32),
          })
          .execute(),
      ).rejects.toThrow();
    });

    it("enforces client_id uniqueness (one account per client)", async () => {
      const fix = await createTestClientFixture(testDb.db);

      await testDb.db
        .insertInto("client_accounts")
        .values({
          id: newClientAccountId(),
          client_id: fix.clientId,
          username_hash: crypto.randomBytes(32).toString("hex") as UsernameHash,
          salt: crypto.randomBytes(16),
          public_key: crypto.randomBytes(32),
          auth_hash: crypto.randomBytes(32),
        })
        .execute();

      await expect(
        testDb.db
          .insertInto("client_accounts")
          .values({
            id: newClientAccountId(),
            client_id: fix.clientId,
            username_hash: crypto
              .randomBytes(32)
              .toString("hex") as UsernameHash,
            salt: crypto.randomBytes(16),
            public_key: crypto.randomBytes(32),
            auth_hash: crypto.randomBytes(32),
          })
          .execute(),
      ).rejects.toThrow();
    });

    it("cascades account deletion when client is deleted", async () => {
      const fix = await createTestClientFixture(testDb.db);
      const accountId = newClientAccountId();

      await testDb.db
        .insertInto("client_accounts")
        .values({
          id: accountId,
          client_id: fix.clientId,
          username_hash: crypto.randomBytes(32).toString("hex") as UsernameHash,
          salt: crypto.randomBytes(16),
          public_key: crypto.randomBytes(32),
          auth_hash: crypto.randomBytes(32),
        })
        .execute();

      // Insert a session to verify cascade chain
      await testDb.db
        .insertInto("client_account_sessions")
        .values({
          account_id: accountId,
          token_hash: crypto.randomBytes(32),
          expires_at: new Date(Date.now() + 86_400_000),
        })
        .execute();

      // Delete client (need to remove any tickets first since tickets
      // reference clients without ON DELETE CASCADE)
      await testDb.db
        .deleteFrom("tickets")
        .where("client_id", "=", fix.clientId)
        .execute();

      await testDb.db
        .deleteFrom("clients")
        .where("id", "=", fix.clientId)
        .execute();

      const orphanAccount = await testDb.db
        .selectFrom("client_accounts")
        .selectAll()
        .where("id", "=", accountId)
        .executeTakeFirst();
      expect(orphanAccount).toBeUndefined();

      const orphanSession = await testDb.db
        .selectFrom("client_account_sessions")
        .selectAll()
        .where("account_id", "=", accountId)
        .executeTakeFirst();
      expect(orphanSession).toBeUndefined();
    });

    // -----------------------------------------------------------------
    // client_account_sessions
    // -----------------------------------------------------------------

    it("inserts a session with defaults and cascades on account delete", async () => {
      const fix = await createTestClientFixture(testDb.db);
      const accountId = newClientAccountId();

      await testDb.db
        .insertInto("client_accounts")
        .values({
          id: accountId,
          client_id: fix.clientId,
          username_hash: crypto.randomBytes(32).toString("hex") as UsernameHash,
          salt: crypto.randomBytes(16),
          public_key: crypto.randomBytes(32),
          auth_hash: crypto.randomBytes(32),
        })
        .execute();

      const session = await testDb.db
        .insertInto("client_account_sessions")
        .values({
          account_id: accountId,
          token_hash: crypto.randomBytes(32),
          expires_at: new Date(Date.now() + 86_400_000),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(session.id).toBeTruthy();
      expect(session.created_at).toBeInstanceOf(Date);
      expect(Buffer.isBuffer(session.token_hash)).toBe(true);
      expect(session.token_hash.length).toBe(32);

      // Cascade: delete the account, session must disappear
      await testDb.db
        .deleteFrom("client_accounts")
        .where("id", "=", accountId)
        .execute();

      const orphan = await testDb.db
        .selectFrom("client_account_sessions")
        .selectAll()
        .where("id", "=", session.id)
        .executeTakeFirst();
      expect(orphan).toBeUndefined();
    });

    it("enforces token_hash uniqueness", async () => {
      const fixA = await createTestClientFixture(testDb.db);
      const fixB = await createTestClientFixture(testDb.db);
      const accountIdA = newClientAccountId();
      const accountIdB = newClientAccountId();
      const sharedTokenHash = crypto.randomBytes(32);

      for (const [accountId, fix] of [
        [accountIdA, fixA],
        [accountIdB, fixB],
      ] as const) {
        await testDb.db
          .insertInto("client_accounts")
          .values({
            id: accountId,
            client_id: fix.clientId,
            username_hash: crypto
              .randomBytes(32)
              .toString("hex") as UsernameHash,
            salt: crypto.randomBytes(16),
            public_key: crypto.randomBytes(32),
            auth_hash: crypto.randomBytes(32),
          })
          .execute();
      }

      await testDb.db
        .insertInto("client_account_sessions")
        .values({
          account_id: accountIdA,
          token_hash: sharedTokenHash,
          expires_at: new Date(Date.now() + 86_400_000),
        })
        .execute();

      await expect(
        testDb.db
          .insertInto("client_account_sessions")
          .values({
            account_id: accountIdB,
            token_hash: sharedTokenHash,
            expires_at: new Date(Date.now() + 86_400_000),
          })
          .execute(),
      ).rejects.toThrow();
    });

    // -----------------------------------------------------------------
    // portal_channels: kind + account_offer columns
    // -----------------------------------------------------------------

    it("existing portal_channels rows read back kind='secure_link' and account_offer=false", async () => {
      const fix = await createTestTicketFixture(testDb.db);

      // Insert a channel without specifying kind/account_offer (defaults)
      await testDb.db
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
        .execute();

      const row = await testDb.db
        .selectFrom("portal_channels")
        .select(["kind", "account_offer"])
        .where("client_id", "=", fix.clientId)
        .executeTakeFirstOrThrow();

      expect(row.kind).toBe("secure_link");
      expect(row.account_offer).toBe(false);
    });

    it("portal_channels accepts kind='account'", async () => {
      const fix = await createTestClientFixture(testDb.db);

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
          kind: "account",
        })
        .returning(["kind", "account_offer"])
        .executeTakeFirstOrThrow();

      expect(row.kind).toBe("account");
      expect(row.account_offer).toBe(false);
    });

    it("portal_channels.account_offer can be set to true", async () => {
      const fix = await createTestClientFixture(testDb.db);

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
          account_offer: true,
        })
        .returning("account_offer")
        .executeTakeFirstOrThrow();

      expect(row.account_offer).toBe(true);
    });

    // -----------------------------------------------------------------
    // Column metadata verification
    // -----------------------------------------------------------------

    it("kind column has correct type and default", async () => {
      const result = await sql<{
        column_name: string;
        data_type: string;
        is_nullable: string;
        column_default: string;
      }>`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = ${testDb.schemaName}
          AND table_name = 'portal_channels'
          AND column_name = 'kind'
      `.execute(testDb.platformDb);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]?.data_type).toBe("text");
      expect(result.rows[0]?.is_nullable).toBe("NO");
      expect(result.rows[0]?.column_default).toContain("secure_link");
    });

    it("account_offer column has correct type and default", async () => {
      const result = await sql<{
        column_name: string;
        data_type: string;
        is_nullable: string;
        column_default: string;
      }>`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = ${testDb.schemaName}
          AND table_name = 'portal_channels'
          AND column_name = 'account_offer'
      `.execute(testDb.platformDb);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]?.data_type).toBe("boolean");
      expect(result.rows[0]?.is_nullable).toBe("NO");
      expect(result.rows[0]?.column_default).toContain("false");
    });
  },
);
