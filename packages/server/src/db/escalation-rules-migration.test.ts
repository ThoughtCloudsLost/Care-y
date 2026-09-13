import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { sql } from "kysely";
import {
  createTestDb,
  createTestQueue,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";

describe.skipIf(!process.env.DATABASE_URL)(
  "085_create_escalation_rules migration",
  () => {
    let testDb: TestDb;

    beforeAll(async () => {
      testDb = await createTestDb();
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    // -----------------------------------------------------------------
    // escalation_rules table
    // -----------------------------------------------------------------

    it("inserts a valid escalation rule", async () => {
      const queue = await createTestQueue(testDb.db);

      const row = await testDb.db
        .insertInto("escalation_rules")
        .values({
          queue_id: queue.id,
          rule_type: "unassigned_duration",
          threshold_minutes: 30,
          action: "notify_managers",
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.queue_id).toBe(queue.id);
      expect(row.rule_type).toBe("unassigned_duration");
      expect(row.threshold_minutes).toBe(30);
      expect(row.action).toBe("notify_managers");
      expect(row.is_active).toBe(true);
      expect(row.created_at).toBeInstanceOf(Date);
    });

    it("accepts inactive_duration rule type", async () => {
      const queue = await createTestQueue(testDb.db);

      const row = await testDb.db
        .insertInto("escalation_rules")
        .values({
          queue_id: queue.id,
          rule_type: "inactive_duration",
          threshold_minutes: 60,
          action: "notify_queue_watchers",
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.rule_type).toBe("inactive_duration");
      expect(row.action).toBe("notify_queue_watchers");
    });

    it("rejects invalid rule_type via CHECK constraint", async () => {
      const queue = await createTestQueue(testDb.db);

      await expect(
        testDb.db
          .insertInto("escalation_rules")
          .values({
            queue_id: queue.id,
            rule_type: "unknown_type",
            threshold_minutes: 10,
            action: "notify_managers",
          })
          .execute(),
      ).rejects.toThrow();
    });

    it("rejects invalid action via CHECK constraint", async () => {
      const queue = await createTestQueue(testDb.db);

      await expect(
        testDb.db
          .insertInto("escalation_rules")
          .values({
            queue_id: queue.id,
            rule_type: "unassigned_duration",
            threshold_minutes: 10,
            action: "send_email",
          })
          .execute(),
      ).rejects.toThrow();
    });

    it("rejects threshold_minutes below 5 via CHECK constraint", async () => {
      const queue = await createTestQueue(testDb.db);

      await expect(
        testDb.db
          .insertInto("escalation_rules")
          .values({
            queue_id: queue.id,
            rule_type: "unassigned_duration",
            threshold_minutes: 4,
            action: "notify_managers",
          })
          .execute(),
      ).rejects.toThrow();
    });

    it("accepts threshold_minutes of exactly 5", async () => {
      const queue = await createTestQueue(testDb.db);

      const row = await testDb.db
        .insertInto("escalation_rules")
        .values({
          queue_id: queue.id,
          rule_type: "unassigned_duration",
          threshold_minutes: 5,
          action: "notify_managers",
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(row.threshold_minutes).toBe(5);
    });

    it("cascades delete from queues to escalation_rules", async () => {
      const queue = await createTestQueue(testDb.db);

      const rule = await testDb.db
        .insertInto("escalation_rules")
        .values({
          queue_id: queue.id,
          rule_type: "unassigned_duration",
          threshold_minutes: 15,
          action: "notify_managers",
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db.deleteFrom("queues").where("id", "=", queue.id).execute();

      const remaining = await testDb.db
        .selectFrom("escalation_rules")
        .selectAll()
        .where("id", "=", rule.id)
        .execute();

      expect(remaining).toHaveLength(0);
    });

    // -----------------------------------------------------------------
    // escalation_rule_firings table
    // -----------------------------------------------------------------

    it("inserts a valid firing record", async () => {
      const fixture = await createTestTicketFixture(testDb.db);

      const rule = await testDb.db
        .insertInto("escalation_rules")
        .values({
          queue_id: fixture.queueId,
          rule_type: "unassigned_duration",
          threshold_minutes: 10,
          action: "notify_managers",
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const firing = await testDb.db
        .insertInto("escalation_rule_firings")
        .values({
          rule_id: rule.id,
          ticket_id: fixture.ticketId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      expect(firing.rule_id).toBe(rule.id);
      expect(firing.ticket_id).toBe(fixture.ticketId);
      expect(firing.fired_at).toBeInstanceOf(Date);
    });

    it("rejects duplicate (rule_id, ticket_id) PK", async () => {
      const fixture = await createTestTicketFixture(testDb.db);

      const rule = await testDb.db
        .insertInto("escalation_rules")
        .values({
          queue_id: fixture.queueId,
          rule_type: "inactive_duration",
          threshold_minutes: 20,
          action: "notify_queue_watchers",
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .insertInto("escalation_rule_firings")
        .values({
          rule_id: rule.id,
          ticket_id: fixture.ticketId,
        })
        .execute();

      await expect(
        testDb.db
          .insertInto("escalation_rule_firings")
          .values({
            rule_id: rule.id,
            ticket_id: fixture.ticketId,
          })
          .execute(),
      ).rejects.toThrow();
    });

    it("cascades delete from escalation_rules to firings", async () => {
      const fixture = await createTestTicketFixture(testDb.db);

      const rule = await testDb.db
        .insertInto("escalation_rules")
        .values({
          queue_id: fixture.queueId,
          rule_type: "unassigned_duration",
          threshold_minutes: 30,
          action: "notify_managers",
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .insertInto("escalation_rule_firings")
        .values({
          rule_id: rule.id,
          ticket_id: fixture.ticketId,
        })
        .execute();

      await testDb.db
        .deleteFrom("escalation_rules")
        .where("id", "=", rule.id)
        .execute();

      const remaining = await testDb.db
        .selectFrom("escalation_rule_firings")
        .selectAll()
        .where("rule_id", "=", rule.id)
        .execute();

      expect(remaining).toHaveLength(0);
    });

    it("cascades delete from tickets to firings", async () => {
      const fixture = await createTestTicketFixture(testDb.db);

      const rule = await testDb.db
        .insertInto("escalation_rules")
        .values({
          queue_id: fixture.queueId,
          rule_type: "inactive_duration",
          threshold_minutes: 45,
          action: "notify_queue_watchers",
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .insertInto("escalation_rule_firings")
        .values({
          rule_id: rule.id,
          ticket_id: fixture.ticketId,
        })
        .execute();

      // Delete the ticket (cascading through ticket_key_wraps, watchers, etc.)
      await testDb.db
        .deleteFrom("tickets")
        .where("id", "=", fixture.ticketId)
        .execute();

      const remaining = await testDb.db
        .selectFrom("escalation_rule_firings")
        .selectAll()
        .where("rule_id", "=", rule.id)
        .execute();

      expect(remaining).toHaveLength(0);
    });

    // -----------------------------------------------------------------
    // Migration roundtrip
    // -----------------------------------------------------------------

    it("tables and index exist after migration", async () => {
      await testDb.db.selectFrom("escalation_rules").selectAll().execute();

      await testDb.db
        .selectFrom("escalation_rule_firings")
        .selectAll()
        .execute();

      const indexResult = await sql<{ indexname: string }>`
        SELECT indexname FROM pg_indexes
        WHERE schemaname = ${testDb.schemaName}
          AND indexname = 'escalation_rules_queue_active_idx'
      `.execute(testDb.db);
      expect(indexResult.rows).toHaveLength(1);
    });
  },
);
