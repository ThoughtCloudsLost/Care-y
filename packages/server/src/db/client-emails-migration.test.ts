import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { sql, type InsertQueryBuilder } from "kysely";
import * as crypto from "node:crypto";
import {
  createTestDb,
  createTestClientFixture,
  type TestDb,
} from "../test-utils.js";
import type { TenantDatabase } from "../db/types.js";
import { emailIdSchema } from "@care-y/shared";
import type { EmailHash, EmailMatchHash } from "@care-y/shared";

/** Random fixture row for the client-contact table (no real PII). */
function fakeCipherRow(overrides?: {
  hash?: EmailHash;
  matchHash?: EmailMatchHash;
}): {
  email_hash: EmailHash;
  encrypted_address: Buffer;
  email_match_hash?: EmailMatchHash;
} {
  return {
    email_hash:
      overrides?.hash ?? (crypto.randomBytes(32).toString("hex") as EmailHash),
    encrypted_address: crypto.randomBytes(64),
    ...(overrides?.matchHash !== undefined
      ? { email_match_hash: overrides.matchHash }
      : {}),
  };
}

/** Inserts a test row into the emails table. Returns the query builder for chaining. */
function insertTestRow(
  db: TestDb["db"],
  overrides?: Parameters<typeof fakeCipherRow>[0],
): InsertQueryBuilder<TenantDatabase, "emails", object> {
  const values = fakeCipherRow(overrides);
  // care-y-ignore-next-line no-plaintext-db-write -- encrypted_address is random test bytes, not real PII; email_hash is a random hex string
  return db.insertInto("emails").values({ ...values, locale: "en-US" });
}

describe.skipIf(!process.env.DATABASE_URL)(
  "108_client_emails migration",
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

    it("creates the emails table", async () => {
      const result = await sql<{ exists: boolean }>`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = ${testDb.schemaName}
            AND table_name = 'emails'
        ) AS exists
      `.execute(testDb.platformDb);

      expect(result.rows[0]?.exists).toBe(true);
    });

    // -----------------------------------------------------------------
    // Basic insert
    // -----------------------------------------------------------------

    it("inserts a row with required fields", async () => {
      const row = await insertTestRow(testDb.db)
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.id).toBeTruthy();
      expect(row.locale).toBe("en-US");
      expect(row.is_active).toBe(true);
      expect(row.email_match_hash).toBeNull();
      expect(row.created_at).toBeInstanceOf(Date);
      expect(row.updated_at).toBeInstanceOf(Date);
      expect(Buffer.isBuffer(row.encrypted_address)).toBe(true);
    });

    // -----------------------------------------------------------------
    // Unique hash index
    // -----------------------------------------------------------------

    it("rejects duplicate hash", async () => {
      const sharedHash = crypto.randomBytes(32).toString("hex") as EmailHash;

      await insertTestRow(testDb.db, { hash: sharedHash }).execute();

      await expect(
        insertTestRow(testDb.db, { hash: sharedHash }).execute(),
      ).rejects.toThrow();
    });

    // -----------------------------------------------------------------
    // Match hash nullable
    // -----------------------------------------------------------------

    it("accepts a non-null match hash", async () => {
      const matchHash = crypto
        .randomBytes(64)
        .toString("hex") as EmailMatchHash;

      const row = await insertTestRow(testDb.db, { matchHash })
        .returning("email_match_hash")
        .executeTakeFirstOrThrow();

      expect(row.email_match_hash).toBe(matchHash);
    });

    // -----------------------------------------------------------------
    // clients.email_id FK
    // -----------------------------------------------------------------

    it("clients.email_id accepts null", async () => {
      const fix = await createTestClientFixture(testDb.db);

      const row = await testDb.db
        .selectFrom("clients")
        .select("email_id")
        .where("id", "=", fix.clientId)
        .executeTakeFirstOrThrow();

      expect(row.email_id).toBeNull();
    });

    it("clients.email_id accepts a valid FK", async () => {
      const fix = await createTestClientFixture(testDb.db);

      const inserted = await insertTestRow(testDb.db)
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .updateTable("clients")
        .set({ email_id: inserted.id })
        .where("id", "=", fix.clientId)
        .execute();

      const row = await testDb.db
        .selectFrom("clients")
        .select("email_id")
        .where("id", "=", fix.clientId)
        .executeTakeFirstOrThrow();

      expect(row.email_id).toBe(inserted.id);
    });

    it("clients.email_id rejects an invalid FK", async () => {
      const fix = await createTestClientFixture(testDb.db);
      // A well-formed EmailId that matches no emails row, so only the FK
      // constraint can reject the update.
      const bogusId = emailIdSchema.parse(crypto.randomUUID());

      await expect(
        testDb.db
          .updateTable("clients")
          .set({ email_id: bogusId })
          .where("id", "=", fix.clientId)
          .execute(),
      ).rejects.toThrow();
    });

    // -----------------------------------------------------------------
    // Column metadata
    // -----------------------------------------------------------------

    it("email_hash is covered by a unique index", async () => {
      // A unique index on the column is the contract; its name is not.
      const result = await sql<{ indexdef: string }>`
        SELECT indexdef FROM pg_indexes
        WHERE schemaname = ${testDb.schemaName}
          AND tablename = 'emails'
      `.execute(testDb.platformDb);

      const uniqueOnHash = result.rows.filter(
        (r) =>
          r.indexdef.includes("UNIQUE") && r.indexdef.includes("(email_hash)"),
      );
      expect(uniqueOnHash.length).toBeGreaterThan(0);
    });
  },
);
