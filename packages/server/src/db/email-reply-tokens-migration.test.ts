import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { up, down } from "./migrations/tenant/110_email_reply_tokens.js";
import {
  createTestDb,
  createTestTicketFixture,
  type TestTicketFixture,
} from "../test-utils.js";
import type { ReplyTokenHash } from "@care-y/shared";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "./types.js";

describe.skipIf(!process.env.DATABASE_URL)(
  "migration 110: email_reply_tokens",
  () => {
    let db: Kysely<TenantDatabase>;
    let cleanup: () => Promise<void>;
    let fixture: TestTicketFixture;

    beforeAll(async () => {
      const t = await createTestDb();
      db = t.db;
      cleanup = t.cleanup;
      fixture = await createTestTicketFixture(db);
    });

    afterAll(async () => {
      await cleanup();
    });

    it("inserts a reply token row referencing a ticket", async () => {
      await db
        .insertInto("email_reply_tokens")
        .values({
          ticket_id: fixture.ticketId,
          token_hash: "hash-aaa" as ReplyTokenHash,
        })
        .execute();

      const row = await db
        .selectFrom("email_reply_tokens")
        .selectAll()
        .where("token_hash", "=", "hash-aaa" as ReplyTokenHash)
        .executeTakeFirstOrThrow();

      expect(row.ticket_id).toBe(fixture.ticketId);
      expect(row.revoked_at).toBeNull();
      expect(row.created_at).toBeInstanceOf(Date);
    });

    it("rejects duplicate token_hash", async () => {
      await expect(
        db
          .insertInto("email_reply_tokens")
          .values({
            ticket_id: fixture.ticketId,
            token_hash: "hash-aaa" as ReplyTokenHash,
          })
          .execute(),
      ).rejects.toThrow();
    });

    it("allows multiple tokens per ticket with different hashes", async () => {
      await db
        .insertInto("email_reply_tokens")
        .values({
          ticket_id: fixture.ticketId,
          token_hash: "hash-bbb" as ReplyTokenHash,
        })
        .execute();

      const rows = await db
        .selectFrom("email_reply_tokens")
        .selectAll()
        .where("ticket_id", "=", fixture.ticketId)
        .execute();

      expect(rows.length).toBeGreaterThanOrEqual(2);
    });

    it("email_reply_footer column exists on org_config and defaults to null", async () => {
      // A fresh test schema has no org_config row; seed one so the
      // column default is observable.
      await db
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();

      const row = await db
        .selectFrom("org_config")
        .select("email_reply_footer")
        .executeTakeFirst();

      expect(row).toBeDefined();
      expect(row?.email_reply_footer).toBeNull();
    });

    it("down removes the table and column, up re-applies cleanly", async () => {
      // Migration signatures take Kysely<unknown> (the Migrator's view);
      // Kysely's type parameter is invariant, so the tenant-typed test
      // instance needs an explicit widening for the direct call.
      const migrationDb = db as unknown as Kysely<unknown>;
      await down(migrationDb);

      // email_reply_tokens table is gone
      await expect(
        db
          .insertInto("email_reply_tokens" as never)
          .values({ ticket_id: "x", token_hash: "x" } as never)
          .execute(),
      ).rejects.toThrow();

      // Re-apply so afterAll cleanup succeeds
      await up(migrationDb);
    });
  },
);
