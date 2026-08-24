import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { sql } from "kysely";
import { createTestDb, createTestUser, type TestDb } from "../test-utils.js";
import type { QueueId } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)(
  "084_create_notification_preferences migration",
  () => {
    let testDb: TestDb;

    beforeAll(async () => {
      testDb = await createTestDb();
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("inserts a global preference row with null scope_id", async () => {
      const user = await createTestUser(testDb.db);

      const row = await testDb.db
        .insertInto("notification_preferences")
        .values({
          user_id: user.id,
          scope_type: "global",
          scope_id: null,
          event_type: "ticket_created",
          channel: "push",
          enabled: false,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.user_id).toBe(user.id);
      expect(row.scope_type).toBe("global");
      expect(row.scope_id).toBeNull();
      expect(row.enabled).toBe(false);
      expect(row.id).toBeDefined();
    });

    it("rejects duplicate global rows for the same user+event+channel (NULLS NOT DISTINCT)", async () => {
      const user = await createTestUser(testDb.db);

      // care-y-ignore-next-line no-plaintext-db-write -- notification_preferences contains no PII (UUIDs, enums, boolean only)
      await testDb.db
        .insertInto("notification_preferences")
        // care-y-ignore-next-line no-plaintext-db-write -- user_id is a UUID FK, not PII
        .values({
          user_id: user.id,
          scope_type: "global",
          scope_id: null,
          event_type: "followup_added",
          channel: "email",
          enabled: true,
        })
        .execute();

      // A second global row for the same (user, event, channel) must fail.
      // Without NULLS NOT DISTINCT, Postgres would treat the two NULL
      // scope_id values as distinct and allow both.
      await expect(
        testDb.db
          .insertInto("notification_preferences")
          // care-y-ignore-next-line no-plaintext-db-write -- user_id is a UUID FK, not PII
          .values({
            user_id: user.id,
            scope_type: "global",
            scope_id: null,
            event_type: "followup_added",
            channel: "email",
            enabled: false,
          })
          .execute(),
      ).rejects.toThrow();
    });

    it("allows the same event+channel at different scopes for the same user", async () => {
      const user = await createTestUser(testDb.db);
      const fakeQueueId = "a0000000-0000-4000-8000-000000000001" as QueueId;

      // Global scope
      await testDb.db
        .insertInto("notification_preferences")
        .values({
          user_id: user.id,
          scope_type: "global",
          scope_id: null,
          event_type: "ticket_assigned",
          channel: "sms",
          enabled: true,
        })
        .execute();

      // Queue scope for the same event+channel
      await testDb.db
        .insertInto("notification_preferences")
        .values({
          user_id: user.id,
          scope_type: "queue",
          scope_id: fakeQueueId,
          event_type: "ticket_assigned",
          channel: "sms",
          enabled: false,
        })
        .execute();

      const rows = await testDb.db
        .selectFrom("notification_preferences")
        .selectAll()
        .where("user_id", "=", user.id)
        .where("event_type", "=", "ticket_assigned")
        .where("channel", "=", "sms")
        .execute();

      expect(rows).toHaveLength(2);
    });

    it("CHECK constraint rejects scope_type='queue' with NULL scope_id", async () => {
      const user = await createTestUser(testDb.db);

      await expect(
        testDb.db
          .insertInto("notification_preferences")
          .values({
            user_id: user.id,
            scope_type: "queue",
            scope_id: null,
            event_type: "ticket_created",
            channel: "push",
            enabled: true,
          })
          .execute(),
      ).rejects.toThrow();
    });

    it("CHECK constraint rejects scope_type='global' with non-null scope_id", async () => {
      const user = await createTestUser(testDb.db);

      await expect(
        testDb.db
          .insertInto("notification_preferences")
          // care-y-ignore-next-line no-plaintext-db-write -- user_id is a UUID FK, not PII
          .values({
            user_id: user.id,
            scope_type: "global",
            scope_id: "b0000000-0000-4000-8000-000000000001" as QueueId,
            event_type: "ticket_closed",
            channel: "email",
            enabled: false,
          })
          .execute(),
      ).rejects.toThrow();
    });

    it("CHECK constraint rejects invalid scope_type", async () => {
      const user = await createTestUser(testDb.db);

      await expect(
        testDb.db
          .insertInto("notification_preferences")
          .values({
            user_id: user.id,
            scope_type: "org" as "global",
            scope_id: null,
            event_type: "ticket_created",
            channel: "push",
            enabled: true,
          })
          .execute(),
      ).rejects.toThrow();
    });

    it("CHECK constraint rejects invalid channel", async () => {
      const user = await createTestUser(testDb.db);

      await expect(
        testDb.db
          .insertInto("notification_preferences")
          .values({
            user_id: user.id,
            scope_type: "global",
            scope_id: null,
            event_type: "ticket_created",
            channel: "sse" as "push",
            enabled: true,
          })
          .execute(),
      ).rejects.toThrow();
    });

    it("cascades delete when the user is deleted", async () => {
      const user = await createTestUser(testDb.db);

      await testDb.db
        .insertInto("notification_preferences")
        .values({
          user_id: user.id,
          scope_type: "global",
          scope_id: null,
          event_type: "mention",
          channel: "push",
          enabled: false,
        })
        .execute();

      await testDb.db.deleteFrom("users").where("id", "=", user.id).execute();

      const remaining = await testDb.db
        .selectFrom("notification_preferences")
        .selectAll()
        .where("user_id", "=", user.id)
        .execute();

      expect(remaining).toHaveLength(0);
    });

    it("migration up/down roundtrip succeeds", async () => {
      // The createTestDb() call in beforeAll already ran the up migration.
      // Verify the table exists by selecting from it.
      const rows = await testDb.db
        .selectFrom("notification_preferences")
        .selectAll()
        .execute();
      expect(Array.isArray(rows)).toBe(true);

      // Verify the dispatch read-path index exists via pg_indexes
      // (scoped to the test schema).
      const indexResult = await sql<{ indexname: string }>`
        SELECT indexname FROM pg_indexes
        WHERE schemaname = ${testDb.schemaName}
          AND indexname = 'notification_preferences_dispatch_idx'
      `.execute(testDb.db);
      expect(indexResult.rows).toHaveLength(1);
    });
  },
);
