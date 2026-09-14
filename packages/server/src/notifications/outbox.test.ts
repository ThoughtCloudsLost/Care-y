/**
 * Integration tests for the notification outbox service.
 *
 * Covers: transactional enqueue (rolls back with the transaction),
 * drain with recipient re-resolution, retry and dead-lettering,
 * retention cleanup, and cascade delete when a ticket is purged.
 *
 * DB tests run inside Docker via `pnpm test:server:db`.
 */

import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { TestDb } from "../test-utils.js";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestQueue,
  createTestUser,
  noopEncryptor,
  TEST_ORG_ID,
} from "../test-utils.js";
import {
  enqueueNotification,
  enqueueNotificationDurable,
  encryptMentionedPseudonyms,
  decryptMentionedPseudonyms,
  drainOutbox,
  OUTBOX_RETENTION_DAYS,
  type OutboxDrainDeps,
} from "./outbox.js";
import type { NotificationService } from "./service.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import { createTicketAccessChecker } from "../tickets/access.js";
import { createWatchersService } from "../tickets/watchers.js";
import {
  newTicketId,
  newKeyGeneration,
  orgSlugIdSchema,
  userIdSchema,
  noteTypeIdSchema,
  escalationRuleIdSchema,
} from "@care-y/shared";
import type { QueueId, TicketId, UserId, OrgSchema } from "@care-y/shared";
import { RoleId } from "@care-y/shared";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDrainDeps(overrides?: {
  dispatch?: NotificationService["dispatch"];
  encryptor?: FieldEncryptor | null;
}): OutboxDrainDeps {
  return {
    notificationService: {
      dispatch: overrides?.dispatch ?? vi.fn().mockResolvedValue(undefined),
      dispatchTicketless: vi.fn().mockResolvedValue(undefined),
    },
    fieldEncryptor: overrides?.encryptor ?? null,
    orgId: TEST_ORG_ID,
    orgSchema: "" as OrgSchema, // set per-test from testDb.schemaName
    orgSlug: orgSlugIdSchema.parse("test-org"),
    createTicketAccess: (tDb) => createTicketAccessChecker(tDb),
    createWatchersSvc: (tDb, access) => createWatchersService(tDb, access),
  };
}

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "NotificationOutbox (DB integration)",
  () => {
    let testDb: TestDb;
    let queueId: QueueId;

    beforeAll(async () => {
      const { getSodium } = await import("@care-y/crypto");
      await getSodium();

      testDb = await createTestDb();

      await testDb.db
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();
      await seedOrgPublicKey(testDb.db);

      const q = await createTestQueue(testDb.db, { label: "Outbox Queue" });
      queueId = q.id;
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    /**
     * Creates a ticket row in the test schema to satisfy the FK constraint
     * on notification_outbox.ticket_id.
     */
    async function createTicketRow(ticketId?: TicketId): Promise<TicketId> {
      const id = ticketId ?? newTicketId();
      const client = await testDb.db
        .insertInto("clients")
        .values({
          encrypted_alias: Buffer.from("ct-alias"),
          alias_hash: null,
          phone_id: null,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .insertInto("tickets")
        .values({
          id,
          client_id: client.id,
          queue_id: queueId,
          encrypted_title: Buffer.from("ct-title"),
          encrypted_description: Buffer.from("ct-desc"),
          key_generation: newKeyGeneration(),
          priority: "normal",
        })
        .executeTakeFirstOrThrow();

      return id;
    }

    // --- Enqueue tests ---

    it("enqueue writes a pending row inside the transaction", async () => {
      const ticketId = await createTicketRow();

      await testDb.db.transaction().execute(async (trx) => {
        await enqueueNotification(trx, {
          eventType: "ticket_created",
          ticketId,
          queueId,
          formId: null,
          actorUserId: null,
        });
      });

      const row = await testDb.db
        .selectFrom("notification_outbox")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();

      expect(row).toBeDefined();
      expect(row!.event_type).toBe("ticket_created");
      expect(row!.status).toBe("pending");
      expect(row!.attempt_count).toBe(0);
      expect(row!.queue_id).toBe(queueId);
      expect(row!.form_id).toBeNull();
      expect(row!.actor_user_id).toBeNull();
    });

    it("enqueue rolls back with the transaction when the ticket insert fails", async () => {
      const ticketId = newTicketId();

      try {
        await testDb.db.transaction().execute(async (trx) => {
          // Insert a ticket to satisfy the FK
          const client = await trx
            .insertInto("clients")
            .values({
              encrypted_alias: Buffer.from("ct-alias-rollback"),
              alias_hash: null,
              phone_id: null,
            })
            .returning("id")
            .executeTakeFirstOrThrow();

          await trx
            .insertInto("tickets")
            .values({
              id: ticketId,
              client_id: client.id,
              queue_id: queueId,
              encrypted_title: Buffer.from("ct"),
              encrypted_description: Buffer.from("ct"),
              key_generation: newKeyGeneration(),
              priority: "normal",
            })
            .executeTakeFirstOrThrow();

          await enqueueNotification(trx, {
            eventType: "ticket_created",
            ticketId,
            queueId,
            formId: null,
            actorUserId: null,
          });

          // Force rollback
          throw new Error("simulated failure");
        });
      } catch {
        // expected
      }

      // Outbox row should not exist (rolled back)
      const row = await testDb.db
        .selectFrom("notification_outbox")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();

      expect(row).toBeUndefined();

      // Ticket should not exist either
      const ticket = await testDb.db
        .selectFrom("tickets")
        .selectAll()
        .where("id", "=", ticketId)
        .executeTakeFirst();

      expect(ticket).toBeUndefined();
    });

    // --- Drain tests ---

    it("drain dispatches notification for a pending row and marks it completed", async () => {
      const ticketId = await createTicketRow();
      const watcher = await createTestUser(testDb.db);

      await testDb.db
        .insertInto("queue_watchers")
        .values({ queue_id: queueId, user_id: watcher.id })
        .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
        .execute();

      // Enqueue
      await testDb.db.transaction().execute(async (trx) => {
        await enqueueNotification(trx, {
          eventType: "ticket_created",
          ticketId,
          queueId,
          formId: null,
          actorUserId: null,
        });
      });

      const dispatch = vi.fn().mockResolvedValue(undefined);
      const deps: OutboxDrainDeps = {
        ...makeDrainDeps({ dispatch }),
        orgSchema: testDb.schemaName as OrgSchema,
      };

      const processed = await drainOutbox(testDb.db, deps);
      expect(processed).toBeGreaterThanOrEqual(1);
      expect(dispatch).toHaveBeenCalled();

      // Verify the row is completed
      const row = await testDb.db
        .selectFrom("notification_outbox")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();

      expect(row).toBeDefined();
      expect(row!.status).toBe("completed");
      expect(row!.completed_at).not.toBeNull();
      expect(row!.attempt_count).toBe(1);

      // Cleanup
      await testDb.db
        .deleteFrom("queue_watchers")
        .where("queue_id", "=", queueId)
        .where("user_id", "=", watcher.id)
        .execute();
    });

    it("drain resolves escalation recipients from OPS-encrypted field, not from a stored list", async () => {
      const ticketId = await createTicketRow();
      const user = await createTestUser(testDb.db);

      // Create a form with escalation recipient
      const form = await testDb.db
        .insertInto("intake_forms")
        .values({
          // care-y-ignore-next-line ast-pii-in-db-write -- admin label, not PII
          name: "Esc Form",
          is_active: true,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .insertInto("intake_form_fields")
        .values({
          form_id: form.id,
          position: 0,
          field_key: crypto.randomUUID(),
          field_type: "checkbox",
          role: "escalation",
          encrypted_escalation_recipient_ids: noopEncryptor.encrypt(
            JSON.stringify([user.id]),
          ),
          encrypted_label: Buffer.from("l"),
          encrypted_config: Buffer.from("c"),
          is_required: false,
        })
        .execute();

      // Enqueue an escalation event
      await testDb.db.transaction().execute(async (trx) => {
        await enqueueNotification(trx, {
          eventType: "ticket_escalated",
          ticketId,
          queueId,
          formId: form.id,
          actorUserId: null,
        });
      });

      const dispatch = vi.fn().mockResolvedValue(undefined);
      const deps: OutboxDrainDeps = {
        ...makeDrainDeps({ dispatch, encryptor: noopEncryptor }),
        orgSchema: testDb.schemaName as OrgSchema,
      };

      await drainOutbox(testDb.db, deps);

      // Verify dispatch was called with escalation_recipient source
      expect(dispatch).toHaveBeenCalledWith(
        testDb.db,
        TEST_ORG_ID,
        testDb.schemaName,
        expect.anything(),
        "ticket_escalated",
        ticketId,
        queueId,
        expect.objectContaining({
          recipients: expect.arrayContaining([
            expect.objectContaining({
              userId: user.id,
              source: "escalation_recipient",
            }),
          ]),
        }),
      );
    });

    it("drain retries on dispatch failure with exponential backoff", async () => {
      const ticketId = await createTicketRow();
      const watcher = await createTestUser(testDb.db);

      await testDb.db
        .insertInto("queue_watchers")
        .values({ queue_id: queueId, user_id: watcher.id })
        .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
        .execute();

      await testDb.db.transaction().execute(async (trx) => {
        await enqueueNotification(trx, {
          eventType: "ticket_created",
          ticketId,
          queueId,
          formId: null,
          actorUserId: null,
        });
      });

      const dispatch = vi
        .fn()
        .mockRejectedValue(new Error("transient failure"));
      const deps: OutboxDrainDeps = {
        ...makeDrainDeps({ dispatch }),
        orgSchema: testDb.schemaName as OrgSchema,
      };

      await drainOutbox(testDb.db, deps);

      // Row should be pending again with attempt_count incremented
      const row = await testDb.db
        .selectFrom("notification_outbox")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();

      expect(row).toBeDefined();
      expect(row!.status).toBe("pending");
      expect(row!.attempt_count).toBe(1);
      // Only the classification persists, never the raw message
      expect(row!.last_error).toBe("Error");
      // next_attempt_at should be in the future
      expect(row!.next_attempt_at.getTime()).toBeGreaterThan(Date.now());

      // Cleanup
      await testDb.db
        .deleteFrom("queue_watchers")
        .where("queue_id", "=", queueId)
        .where("user_id", "=", watcher.id)
        .execute();
    });

    it("drain marks row dead after max_attempts exhausted", async () => {
      const ticketId = await createTicketRow();
      const watcher = await createTestUser(testDb.db);

      await testDb.db
        .insertInto("queue_watchers")
        .values({ queue_id: queueId, user_id: watcher.id })
        .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
        .execute();

      // Enqueue with max_attempts = 1 so next failure marks dead
      await testDb.db
        .insertInto("notification_outbox")
        .values({
          event_type: "ticket_created",
          ticket_id: ticketId,
          queue_id: queueId,
          max_attempts: 1,
        })
        .execute();

      const dispatch = vi.fn().mockRejectedValue(new Error("permanent"));
      const deps: OutboxDrainDeps = {
        ...makeDrainDeps({ dispatch }),
        orgSchema: testDb.schemaName as OrgSchema,
      };

      await drainOutbox(testDb.db, deps);

      const row = await testDb.db
        .selectFrom("notification_outbox")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();

      expect(row).toBeDefined();
      expect(row!.status).toBe("dead");
      expect(row!.failed_at).not.toBeNull();
      expect(row!.last_error).toBe("Error");

      // Cleanup
      await testDb.db
        .deleteFrom("queue_watchers")
        .where("queue_id", "=", queueId)
        .where("user_id", "=", watcher.id)
        .execute();
    });

    it("cascade delete removes outbox rows when ticket is deleted", async () => {
      const ticketId = await createTicketRow();

      await testDb.db.transaction().execute(async (trx) => {
        await enqueueNotification(trx, {
          eventType: "ticket_created",
          ticketId,
          queueId,
          formId: null,
          actorUserId: null,
        });
      });

      // Verify row exists
      const before = await testDb.db
        .selectFrom("notification_outbox")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();
      expect(before).toBeDefined();

      // Delete the ticket (cascade should remove outbox rows)
      await testDb.db
        .deleteFrom("tickets")
        .where("id", "=", ticketId)
        .execute();

      const after = await testDb.db
        .selectFrom("notification_outbox")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();
      expect(after).toBeUndefined();
    });

    it("retention cleanup removes terminal rows older than RETENTION_DAYS", async () => {
      const ticketId = await createTicketRow();

      // Insert a completed row with old completed_at timestamp
      const pastDate = new Date(
        Date.now() - (OUTBOX_RETENTION_DAYS + 1) * 24 * 60 * 60 * 1000,
      );
      await testDb.db
        .insertInto("notification_outbox")
        .values({
          event_type: "ticket_created",
          ticket_id: ticketId,
          queue_id: queueId,
          status: "completed",
          completed_at: pastDate,
          attempt_count: 1,
        })
        .execute();

      // Verify row exists
      const before = await testDb.db
        .selectFrom("notification_outbox")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .where("status", "=", "completed")
        .executeTakeFirst();
      expect(before).toBeDefined();

      // Drain triggers cleanup (even if no pending rows to process)
      const deps: OutboxDrainDeps = {
        ...makeDrainDeps(),
        orgSchema: testDb.schemaName as OrgSchema,
      };
      await drainOutbox(testDb.db, deps);

      const after = await testDb.db
        .selectFrom("notification_outbox")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .where("status", "=", "completed")
        .executeTakeFirst();
      expect(after).toBeUndefined();
    });

    it("drain skips dispatch when no recipients are resolved", async () => {
      const ticketId = await createTicketRow();

      // No queue watchers configured, so recipient list will be empty
      await testDb.db.transaction().execute(async (trx) => {
        await enqueueNotification(trx, {
          eventType: "ticket_created",
          ticketId,
          queueId,
          formId: null,
          actorUserId: null,
        });
      });

      const dispatch = vi.fn().mockResolvedValue(undefined);
      const deps: OutboxDrainDeps = {
        ...makeDrainDeps({ dispatch }),
        orgSchema: testDb.schemaName as OrgSchema,
      };

      await drainOutbox(testDb.db, deps);

      // Dispatch should not have been called (no recipients)
      expect(dispatch).not.toHaveBeenCalled();

      // Row should still be completed (empty recipients is not a failure)
      const row = await testDb.db
        .selectFrom("notification_outbox")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();
      expect(row!.status).toBe("completed");
    });

    it("drain never persists error message content in last_error", async () => {
      const ticketId = await createTicketRow();
      const watcher = await createTestUser(testDb.db);

      await testDb.db
        .insertInto("queue_watchers")
        .values({ queue_id: queueId, user_id: watcher.id })
        .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
        .execute();

      await testDb.db.transaction().execute(async (trx) => {
        await enqueueNotification(trx, {
          eventType: "ticket_created",
          ticketId,
          queueId,
          formId: null,
          actorUserId: null,
        });
      });

      // A provider-shaped message echoing a phone number must never
      // reach the row; only the error classification persists.
      const dispatch = vi
        .fn()
        .mockRejectedValue(new Error("delivery to +15550001234 failed"));
      const deps: OutboxDrainDeps = {
        ...makeDrainDeps({ dispatch }),
        orgSchema: testDb.schemaName as OrgSchema,
      };

      await drainOutbox(testDb.db, deps);

      const row = await testDb.db
        .selectFrom("notification_outbox")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();

      expect(row!.last_error).toBe("Error");
      expect(row!.last_error).not.toMatch(/\d/);

      // Cleanup
      await testDb.db
        .deleteFrom("queue_watchers")
        .where("queue_id", "=", queueId)
        .where("user_id", "=", watcher.id)
        .execute();
    });

    // --- Mention encryption tests ---

    it("mentioned pseudonyms round-trip through OPS encryption in the outbox row", async () => {
      const ticketId = await createTicketRow();
      const mentionedIds = [
        "aaaaaaaa-bbbb-4ccc-8ddd-000000000001",
        "aaaaaaaa-bbbb-4ccc-8ddd-000000000002",
      ];

      // Encrypt the mentions
      const encrypted = encryptMentionedPseudonyms(mentionedIds, noopEncryptor);
      expect(encrypted).toBeDefined();

      // Enqueue with encrypted mentions via the durable path
      await enqueueNotificationDurable(testDb.db, {
        eventType: "followup_added",
        ticketId,
        queueId,
        formId: null,
        actorUserId: userIdSchema.parse("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"),
        encryptedMentionedPseudonyms: encrypted,
      });

      // Read the raw row and verify the column is populated
      const row = await testDb.db
        .selectFrom("notification_outbox")
        .select(["encrypted_mentioned_pseudonyms"])
        .where("ticket_id", "=", ticketId)
        .where("event_type", "=", "followup_added")
        .executeTakeFirstOrThrow();

      expect(row.encrypted_mentioned_pseudonyms).not.toBeNull();
      const rawBytes = row.encrypted_mentioned_pseudonyms!;

      // Decrypt and verify the round-trip produces the original array.
      // In production the FieldEncryptor is backed by XSalsa20-Poly1305,
      // so the stored bytes are ciphertext, not the plaintext JSON.
      // The noop test encryptor stores plaintext verbatim, so this test
      // verifies the serialization path rather than confidentiality
      // (which is a property of the injected encryptor, tested below).
      const decrypted = decryptMentionedPseudonyms(rawBytes, noopEncryptor);
      expect(decrypted).toEqual(mentionedIds);
    });

    it("mentioned pseudonyms are opaque ciphertext with a real encryptor", async () => {
      // Use the real field encryptor to prove ciphertext differs from plaintext
      const { createFieldEncryptor } =
        await import("../crypto/field-encryptor.js");
      const keyBytes = Buffer.alloc(32, 0xab);
      const realEncryptor = createFieldEncryptor(keyBytes);
      const mentionedIds = [
        "aaaaaaaa-bbbb-4ccc-8ddd-000000000001",
        "aaaaaaaa-bbbb-4ccc-8ddd-000000000002",
      ];

      const encrypted = encryptMentionedPseudonyms(mentionedIds, realEncryptor);
      expect(encrypted).toBeDefined();

      // The raw bytes must not contain the plaintext user IDs
      const rawStr = encrypted!.toString("utf-8");
      for (const id of mentionedIds) {
        expect(rawStr).not.toContain(id);
      }

      // Round-trip decryption recovers the original
      const decrypted = decryptMentionedPseudonyms(encrypted!, realEncryptor);
      expect(decrypted).toEqual(mentionedIds);
    });

    it("encryptMentionedPseudonyms returns undefined for an empty array", () => {
      const result = encryptMentionedPseudonyms([], noopEncryptor);
      expect(result).toBeUndefined();
    });

    it("enqueue stores note_type_id and escalation_rule_id when provided", async () => {
      const ticketId = await createTicketRow();
      const noteTypeId = "aaaaaaaa-bbbb-4ccc-8ddd-ffffffffffff";
      const escalationRuleId = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";

      await testDb.db.transaction().execute(async (trx) => {
        await enqueueNotification(trx, {
          eventType: "followup_added",
          ticketId,
          queueId,
          formId: null,
          actorUserId: null,
          noteTypeId: noteTypeIdSchema.parse(noteTypeId),
          escalationRuleId: escalationRuleIdSchema.parse(escalationRuleId),
        });
      });

      const row = await testDb.db
        .selectFrom("notification_outbox")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .where("event_type", "=", "followup_added")
        .executeTakeFirstOrThrow();

      expect(row.note_type_id).toBe(noteTypeId);
      expect(row.escalation_rule_id).toBe(escalationRuleId);
    });

    // --- Lifecycle event drain tests ---

    it("drain resolves lifecycle event recipients via buildRecipientList", async () => {
      const ticketId = await createTicketRow();
      const watcher = await createTestUser(testDb.db);
      const actor = await createTestUser(testDb.db);

      // Add ticket watcher
      await testDb.db
        .insertInto("ticket_watchers")
        .values({ ticket_id: ticketId, user_id: watcher.id })
        .onConflict((oc) => oc.columns(["ticket_id", "user_id"]).doNothing())
        .execute();

      // Enqueue a lifecycle event (ticket_closed) with actor
      await enqueueNotificationDurable(testDb.db, {
        eventType: "ticket_closed",
        ticketId,
        queueId,
        formId: null,
        actorUserId: actor.id,
      });

      const dispatch = vi.fn().mockResolvedValue(undefined);
      const deps: OutboxDrainDeps = {
        ...makeDrainDeps({ dispatch }),
        orgSchema: testDb.schemaName as OrgSchema,
      };

      await drainOutbox(testDb.db, deps);

      // Dispatch should include the ticket watcher but not the actor
      expect(dispatch).toHaveBeenCalled();
      const [, , , , eventType, , , recipients] = dispatch.mock
        .calls[0] as unknown[];
      expect(eventType).toBe("ticket_closed");
      const recipientList = recipients as {
        recipients: readonly { userId: UserId; source: string }[];
      };
      const watcherRecipient = recipientList.recipients.find(
        (r) => r.userId === watcher.id,
      );
      expect(watcherRecipient).toBeDefined();
      // Actor should be excluded
      const actorRecipient = recipientList.recipients.find(
        (r) => r.userId === actor.id,
      );
      expect(actorRecipient).toBeUndefined();

      // Cleanup
      await testDb.db
        .deleteFrom("ticket_watchers")
        .where("ticket_id", "=", ticketId)
        .where("user_id", "=", watcher.id)
        .execute();
    });

    // -----------------------------------------------------------------
    // Rule-based escalation recipient resolution (L416, L576-607)
    // Exercises resolveRuleEscalationRecipients through drainOutbox.
    // Covers cold branches: L416 if[0], binary-expr[1]; L587 if both;
    // L590 binary-expr[0],[1]; L591-594 cond-exprs; L597 cond-expr both.
    // -----------------------------------------------------------------

    describe("resolveRuleEscalationRecipients", () => {
      it("returns empty recipients when the escalation rule does not exist", async () => {
        const ticketId = await createTicketRow();
        const nonexistentRuleId = escalationRuleIdSchema.parse(
          crypto.randomUUID(),
        );

        await testDb.db
          .insertInto("notification_outbox")
          .values({
            event_type: "ticket_escalated",
            ticket_id: ticketId,
            queue_id: queueId,
            escalation_rule_id: nonexistentRuleId,
            max_attempts: 5,
          })
          .execute();

        const dispatch = vi.fn().mockResolvedValue(undefined);
        const deps: OutboxDrainDeps = {
          ...makeDrainDeps({ dispatch }),
          orgSchema: testDb.schemaName as OrgSchema,
        };

        await drainOutbox(testDb.db, deps);

        // Empty recipients means dispatch is skipped, but the row is
        // marked completed (not an error).
        expect(dispatch).not.toHaveBeenCalled();

        const row = await testDb.db
          .selectFrom("notification_outbox")
          .selectAll()
          .where("ticket_id", "=", ticketId)
          .executeTakeFirst();

        expect(row?.status).toBe("completed");
      });

      it("resolves manager IDs with note_escalation source for notify_managers action", async () => {
        const ticketId = await createTicketRow();
        const manager1 = await createTestUser(testDb.db);
        const manager2 = await createTestUser(testDb.db);

        // Insert an escalation rule with notify_managers action
        const rule = await testDb.db
          .insertInto("escalation_rules")
          .values({
            queue_id: queueId,
            rule_type: "unassigned_duration",
            threshold_minutes: 10,
            action: "notify_managers",
            is_active: true,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const ruleId = escalationRuleIdSchema.parse(rule.id);

        await testDb.db
          .insertInto("notification_outbox")
          .values({
            event_type: "ticket_escalated",
            ticket_id: ticketId,
            queue_id: queueId,
            escalation_rule_id: ruleId,
            max_attempts: 5,
          })
          .execute();

        const dispatch = vi.fn().mockResolvedValue(undefined);
        const deps: OutboxDrainDeps = {
          ...makeDrainDeps({ dispatch }),
          orgSchema: testDb.schemaName as OrgSchema,
          getManagerIds: vi.fn().mockResolvedValue([manager1.id, manager2.id]),
        };

        await drainOutbox(testDb.db, deps);

        // Scoped to this test's ticket: drainOutbox processes every
        // eligible row, so a leftover from an earlier test would add a
        // call this test never enqueued.
        const callsForTicket = dispatch.mock.calls.filter(
          (call) => (call as unknown[])[5] === ticketId,
        );
        expect(callsForTicket).toHaveLength(1);
        const recipientList = (callsForTicket[0] as unknown[])[7] as {
          recipients: readonly { userId: UserId; source: string }[];
        };

        expect(recipientList.recipients).toHaveLength(2);
        expect(recipientList.recipients).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              userId: manager1.id,
              source: "note_escalation",
            }),
            expect.objectContaining({
              userId: manager2.id,
              source: "note_escalation",
            }),
          ]),
        );
      });

      it("resolves queue watcher IDs with queue_watcher source for notify_queue_watchers action", async () => {
        const ticketId = await createTicketRow();
        const watcher1 = await createTestUser(testDb.db);
        const watcher2 = await createTestUser(testDb.db);

        const rule = await testDb.db
          .insertInto("escalation_rules")
          .values({
            queue_id: queueId,
            rule_type: "inactive_duration",
            threshold_minutes: 15,
            action: "notify_queue_watchers",
            is_active: true,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const ruleId = escalationRuleIdSchema.parse(rule.id);

        await testDb.db
          .insertInto("notification_outbox")
          .values({
            event_type: "ticket_escalated",
            ticket_id: ticketId,
            queue_id: queueId,
            escalation_rule_id: ruleId,
            max_attempts: 5,
          })
          .execute();

        const dispatch = vi.fn().mockResolvedValue(undefined);
        const deps: OutboxDrainDeps = {
          ...makeDrainDeps({ dispatch }),
          orgSchema: testDb.schemaName as OrgSchema,
          getQueueWatcherIds: vi
            .fn()
            .mockResolvedValue([watcher1.id, watcher2.id]),
        };

        await drainOutbox(testDb.db, deps);

        // Scoped to this test's ticket: drainOutbox processes every
        // eligible row, so a leftover from an earlier test would add a
        // call this test never enqueued.
        const callsForTicket = dispatch.mock.calls.filter(
          (call) => (call as unknown[])[5] === ticketId,
        );
        expect(callsForTicket).toHaveLength(1);
        const recipientList = (callsForTicket[0] as unknown[])[7] as {
          recipients: readonly { userId: UserId; source: string }[];
        };

        expect(recipientList.recipients).toHaveLength(2);
        expect(recipientList.recipients).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              userId: watcher1.id,
              source: "queue_watcher",
            }),
            expect.objectContaining({
              userId: watcher2.id,
              source: "queue_watcher",
            }),
          ]),
        );
      });

      it("returns empty recipients when getManagerIds and getQueueWatcherIds deps are both absent", async () => {
        const ticketId = await createTicketRow();

        const rule = await testDb.db
          .insertInto("escalation_rules")
          .values({
            queue_id: queueId,
            rule_type: "unassigned_duration",
            threshold_minutes: 10,
            action: "notify_managers",
            is_active: true,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const ruleId = escalationRuleIdSchema.parse(rule.id);

        await testDb.db
          .insertInto("notification_outbox")
          .values({
            event_type: "ticket_escalated",
            ticket_id: ticketId,
            queue_id: queueId,
            escalation_rule_id: ruleId,
            max_attempts: 5,
          })
          .execute();

        const dispatch = vi.fn().mockResolvedValue(undefined);
        // No getManagerIds or getQueueWatcherIds in deps
        const deps: OutboxDrainDeps = {
          ...makeDrainDeps({ dispatch }),
          orgSchema: testDb.schemaName as OrgSchema,
        };

        await drainOutbox(testDb.db, deps);

        // Empty recipients, dispatch skipped, row still completed
        expect(dispatch).not.toHaveBeenCalled();
        const row = await testDb.db
          .selectFrom("notification_outbox")
          .selectAll()
          .where("ticket_id", "=", ticketId)
          .where("escalation_rule_id", "=", ruleId)
          .executeTakeFirst();
        // Asserted as an object so a failure reports attempt_count and
        // last_error alongside the status. A row left pending with
        // attempt_count 0 and no error was never claimed; one with
        // attempt_count 1 and an error was claimed and retried. The two
        // have different causes and the status alone cannot tell them
        // apart.
        expect({
          status: row?.status,
          attemptCount: row?.attempt_count,
          lastError: row?.last_error,
        }).toEqual({
          status: "completed",
          attemptCount: 1,
          lastError: null,
        });
      });

      it("falls back to getQueueWatcherIds when action is notify_managers but getManagerIds dep is absent", async () => {
        const ticketId = await createTicketRow();
        const watcherUser = await createTestUser(testDb.db);

        const rule = await testDb.db
          .insertInto("escalation_rules")
          .values({
            queue_id: queueId,
            rule_type: "unassigned_duration",
            threshold_minutes: 10,
            action: "notify_managers",
            is_active: true,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const ruleId = escalationRuleIdSchema.parse(rule.id);

        await testDb.db
          .insertInto("notification_outbox")
          .values({
            event_type: "ticket_escalated",
            ticket_id: ticketId,
            queue_id: queueId,
            escalation_rule_id: ruleId,
            max_attempts: 5,
          })
          .execute();

        const dispatch = vi.fn().mockResolvedValue(undefined);
        const deps: OutboxDrainDeps = {
          ...makeDrainDeps({ dispatch }),
          orgSchema: testDb.schemaName as OrgSchema,
          // No getManagerIds, but getQueueWatcherIds is present
          getQueueWatcherIds: vi.fn().mockResolvedValue([watcherUser.id]),
        };

        await drainOutbox(testDb.db, deps);

        // Scoped to this test's ticket rather than asserting a global
        // call count. drainOutbox processes every eligible row, so a row
        // left behind by an earlier test would dispatch here too and a
        // bare toHaveBeenCalledOnce would fail on work this test never
        // enqueued. The claim under test is that THIS ticket dispatched.
        const callsForTicket = dispatch.mock.calls.filter(
          (call) => (call as unknown[])[5] === ticketId,
        );
        expect(callsForTicket).toHaveLength(1);
        const recipientList = (callsForTicket[0] as unknown[])[7] as {
          recipients: readonly { userId: UserId; source: string }[];
        };

        // The recipient ternary at L590 falls to getQueueWatcherIds
        // because getManagerIds is absent. The source ternary at L596
        // checks only the action string (still "notify_managers"), so
        // the source is "note_escalation" even though the IDs came from
        // the queue watcher dep.
        expect(recipientList.recipients).toHaveLength(1);
        expect(recipientList.recipients[0]).toEqual(
          expect.objectContaining({
            userId: watcherUser.id,
            source: "note_escalation",
          }),
        );
      });
    });

    // -----------------------------------------------------------------
    // Queue watcher recipient resolution (L421-426, L612-631)
    // Exercises resolveQueueWatcherRecipients through drainOutbox via
    // two entry points: intake ticket_created (L426 passes null actor)
    // and intake escalation fallback (L683 passes actual actor).
    // Covers cold branches: L421 if[0]; L624-625 callbacks.
    // -----------------------------------------------------------------

    describe("resolveQueueWatcherRecipients", () => {
      it("includes all queue watchers for an intake-originated ticket_created", async () => {
        const ticketId = await createTicketRow();
        const w1 = await createTestUser(testDb.db);
        const w2 = await createTestUser(testDb.db);

        // Seed watchers on the queue
        for (const w of [w1, w2]) {
          await testDb.db
            .insertInto("queue_watchers")
            .values({ queue_id: queueId, user_id: w.id })
            .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
            .execute();
        }

        // Create a form so the intake ticket_created path (L421) is taken
        const form = await testDb.db
          .insertInto("intake_forms")
          .values({
            // care-y-ignore-next-line ast-pii-in-db-write -- admin label, not PII
            name: "QW Test Form",
            is_active: true,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        // Enqueue intake ticket_created: actor null, form_id set
        await testDb.db
          .insertInto("notification_outbox")
          .values({
            event_type: "ticket_created",
            ticket_id: ticketId,
            queue_id: queueId,
            form_id: form.id,
            actor_user_id: null,
            max_attempts: 5,
          })
          .execute();

        const dispatch = vi.fn().mockResolvedValue(undefined);
        const deps: OutboxDrainDeps = {
          ...makeDrainDeps({ dispatch }),
          orgSchema: testDb.schemaName as OrgSchema,
        };

        await drainOutbox(testDb.db, deps);

        expect(dispatch).toHaveBeenCalledOnce();
        const recipientList = (dispatch.mock.calls[0] as unknown[])[7] as {
          recipients: readonly { userId: UserId; source: string }[];
        };

        // Both watchers included; no actor exclusion (actor is null)
        const recipientIds = recipientList.recipients.map((r) => r.userId);
        expect(recipientIds).toEqual(expect.arrayContaining([w1.id, w2.id]));
        expect(recipientIds.length).toBeGreaterThanOrEqual(2);
        for (const r of recipientList.recipients) {
          if (r.userId === w1.id || r.userId === w2.id) {
            expect(r.source).toBe("queue_watcher");
          }
        }

        // Cleanup
        for (const w of [w1, w2]) {
          await testDb.db
            .deleteFrom("queue_watchers")
            .where("queue_id", "=", queueId)
            .where("user_id", "=", w.id)
            .execute();
        }
      });

      it("returns empty recipients when no watchers exist on the queue", async () => {
        // Use a fresh queue with no watchers
        const emptyQ = await createTestQueue(testDb.db, {
          label: "No Watchers Q",
        });
        const ticketId = await createTicketRow();

        const form = await testDb.db
          .insertInto("intake_forms")
          .values({
            // care-y-ignore-next-line ast-pii-in-db-write -- admin label, not PII
            name: "Empty QW Form",
            is_active: true,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        await testDb.db
          .insertInto("notification_outbox")
          .values({
            event_type: "ticket_created",
            ticket_id: ticketId,
            queue_id: emptyQ.id,
            form_id: form.id,
            actor_user_id: null,
            max_attempts: 5,
          })
          .execute();

        const dispatch = vi.fn().mockResolvedValue(undefined);
        const deps: OutboxDrainDeps = {
          ...makeDrainDeps({ dispatch }),
          orgSchema: testDb.schemaName as OrgSchema,
        };

        await drainOutbox(testDb.db, deps);

        expect(dispatch).not.toHaveBeenCalled();
        const row = await testDb.db
          .selectFrom("notification_outbox")
          .selectAll()
          .where("ticket_id", "=", ticketId)
          .executeTakeFirst();
        expect(row?.status).toBe("completed");
      });

      it("excludes the acting user from queue watcher results on intake escalation fallback", async () => {
        const ticketId = await createTicketRow();
        const actorUser = await createTestUser(testDb.db);
        const otherWatcher = await createTestUser(testDb.db);

        // Both users are queue watchers
        for (const u of [actorUser, otherWatcher]) {
          await testDb.db
            .insertInto("queue_watchers")
            .values({ queue_id: queueId, user_id: u.id })
            .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
            .execute();
        }

        // Create a form with NO escalation fields so the intake
        // escalation path falls back to resolveQueueWatcherRecipients
        // at L683, which passes the actorUserId for exclusion.
        const form = await testDb.db
          .insertInto("intake_forms")
          .values({
            // care-y-ignore-next-line ast-pii-in-db-write -- admin label, not PII
            name: "Fallback QW Form",
            is_active: true,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        await testDb.db
          .insertInto("notification_outbox")
          .values({
            event_type: "ticket_escalated",
            ticket_id: ticketId,
            queue_id: queueId,
            form_id: form.id,
            actor_user_id: actorUser.id,
            escalation_rule_id: null,
            max_attempts: 5,
          })
          .execute();

        const dispatch = vi.fn().mockResolvedValue(undefined);
        const deps: OutboxDrainDeps = {
          ...makeDrainDeps({ dispatch }),
          orgSchema: testDb.schemaName as OrgSchema,
        };

        await drainOutbox(testDb.db, deps);

        expect(dispatch).toHaveBeenCalledOnce();
        const recipientList = (dispatch.mock.calls[0] as unknown[])[7] as {
          recipients: readonly { userId: UserId; source: string }[];
        };

        // Actor is excluded from the watcher list
        const recipientIds = recipientList.recipients.map((r) => r.userId);
        expect(recipientIds).toContain(otherWatcher.id);
        expect(recipientIds).not.toContain(actorUser.id);

        // Cleanup
        for (const u of [actorUser, otherWatcher]) {
          await testDb.db
            .deleteFrom("queue_watchers")
            .where("queue_id", "=", queueId)
            .where("user_id", "=", u.id)
            .execute();
        }
      });
    });

    // -----------------------------------------------------------------
    // Note-type escalation resolution (L525-569)
    // Exercises resolveNoteTypeEscalationForDrain through drainOutbox
    // via lifecycle events (followup_added) with a note_type_id.
    // Covers cold branches: L536 if both; L538 if both, binary-expr
    // [0],[1]; L547 cond-expr both; L560 if both; L562 if both;
    // L569 cond-expr both.
    // Cold statements: 534-543, 547-548, 551-553, 560-564, 569.
    // -----------------------------------------------------------------

    describe("resolveNoteTypeEscalationForDrain", () => {
      it("skips escalation when createNoteTypeSvc returns no context for the note type", async () => {
        const ticketId = await createTicketRow();
        const watcher = await createTestUser(testDb.db);

        await testDb.db
          .insertInto("ticket_watchers")
          .values({ ticket_id: ticketId, user_id: watcher.id })
          .onConflict((oc) => oc.columns(["ticket_id", "user_id"]).doNothing())
          .execute();

        const noteTypeId = noteTypeIdSchema.parse(crypto.randomUUID());

        await enqueueNotificationDurable(testDb.db, {
          eventType: "followup_added",
          ticketId,
          queueId,
          formId: null,
          actorUserId: null,
          noteTypeId,
        });

        const dispatch = vi.fn().mockResolvedValue(undefined);
        const deps: OutboxDrainDeps = {
          ...makeDrainDeps({ dispatch }),
          orgSchema: testDb.schemaName as OrgSchema,
          createNoteTypeSvc: () => ({
            list: vi.fn(),
            listActive: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            getDefaultTypeId: vi.fn(),
            getEscalationTargets: vi.fn(),
            // No context for this note type
            getEscalationContext: vi.fn().mockResolvedValue(null),
            getMinCreateRole: vi.fn(),
          }),
        };

        await drainOutbox(testDb.db, deps);

        // Dispatch still called with ticket watcher (the escalation path
        // returned undefined, so buildRecipientList ran without escalation IDs)
        expect(dispatch).toHaveBeenCalled();

        // Cleanup
        await testDb.db
          .deleteFrom("ticket_watchers")
          .where("ticket_id", "=", ticketId)
          .where("user_id", "=", watcher.id)
          .execute();
      });

      it("skips escalation when queue permissions or user service deps are absent", async () => {
        const ticketId = await createTicketRow();
        const watcher = await createTestUser(testDb.db);

        await testDb.db
          .insertInto("ticket_watchers")
          .values({ ticket_id: ticketId, user_id: watcher.id })
          .onConflict((oc) => oc.columns(["ticket_id", "user_id"]).doNothing())
          .execute();

        const noteTypeId = noteTypeIdSchema.parse(crypto.randomUUID());

        await enqueueNotificationDurable(testDb.db, {
          eventType: "followup_added",
          ticketId,
          queueId,
          formId: null,
          actorUserId: null,
          noteTypeId,
        });

        const dispatch = vi.fn().mockResolvedValue(undefined);
        const deps: OutboxDrainDeps = {
          ...makeDrainDeps({ dispatch }),
          orgSchema: testDb.schemaName as OrgSchema,
          createNoteTypeSvc: () => ({
            list: vi.fn(),
            listActive: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            getDefaultTypeId: vi.fn(),
            getEscalationTargets: vi.fn(),
            getEscalationContext: vi.fn().mockResolvedValue({
              targets: [{ type: "role" as const, value: "admin" as const }],
              minViewRole: RoleId.VOLUNTEER,
            }),
            getMinCreateRole: vi.fn(),
          }),
          // createQueuePermissionsSvc and createUserSvc intentionally absent
        };

        await drainOutbox(testDb.db, deps);

        // Escalation path returns undefined at L538, buildRecipientList
        // still runs with ticket watcher
        expect(dispatch).toHaveBeenCalled();

        // Cleanup
        await testDb.db
          .deleteFrom("ticket_watchers")
          .where("ticket_id", "=", ticketId)
          .where("user_id", "=", watcher.id)
          .execute();
      });

      it("returns unfiltered escalation targets when minViewRole is VOLUNTEER", async () => {
        const ticketId = await createTicketRow();
        const escalationUser = await createTestUser(testDb.db);
        const noteTypeId = noteTypeIdSchema.parse(crypto.randomUUID());

        await enqueueNotificationDurable(testDb.db, {
          eventType: "followup_added",
          ticketId,
          queueId,
          formId: null,
          actorUserId: null,
          noteTypeId,
        });

        const dispatch = vi.fn().mockResolvedValue(undefined);
        const deps: OutboxDrainDeps = {
          ...makeDrainDeps({ dispatch }),
          orgSchema: testDb.schemaName as OrgSchema,
          createNoteTypeSvc: () => ({
            list: vi.fn(),
            listActive: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            getDefaultTypeId: vi.fn(),
            getEscalationTargets: vi.fn(),
            getEscalationContext: vi.fn().mockResolvedValue({
              targets: [{ type: "role" as const, value: "admin" as const }],
              minViewRole: RoleId.VOLUNTEER,
            }),
            getMinCreateRole: vi.fn(),
          }),
          createQueuePermissionsSvc: () => ({
            getQueueMembers: vi.fn().mockResolvedValue([]),
          }),
          createUserSvc: () => ({
            listActiveIdsByRoleId: vi
              .fn()
              .mockResolvedValue(new Set([escalationUser.id])),
            listActiveKeyWrapHolderIds: vi.fn().mockResolvedValue(new Set()),
            filterByRoleThreshold: vi.fn().mockResolvedValue([]),
          }),
        };

        await drainOutbox(testDb.db, deps);

        expect(dispatch).toHaveBeenCalled();
        const recipientList = (dispatch.mock.calls[0] as unknown[])[7] as {
          recipients: readonly { userId: UserId; source: string }[];
        };

        // The escalation user should appear as a recipient (minViewRole
        // is VOLUNTEER so targets returned unfiltered at L562)
        const escalationRecipient = recipientList.recipients.find(
          (r) => r.userId === escalationUser.id,
        );
        expect(escalationRecipient).toBeDefined();
      });

      it("filters escalation targets by role threshold when minViewRole is above VOLUNTEER", async () => {
        const ticketId = await createTicketRow();
        const adminUser = await createTestUser(testDb.db);
        const filteredOutUser = await createTestUser(testDb.db);
        const noteTypeId = noteTypeIdSchema.parse(crypto.randomUUID());

        await enqueueNotificationDurable(testDb.db, {
          eventType: "followup_added",
          ticketId,
          queueId,
          formId: null,
          actorUserId: null,
          noteTypeId,
        });

        const dispatch = vi.fn().mockResolvedValue(undefined);
        const deps: OutboxDrainDeps = {
          ...makeDrainDeps({ dispatch }),
          orgSchema: testDb.schemaName as OrgSchema,
          createNoteTypeSvc: () => ({
            list: vi.fn(),
            listActive: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            getDefaultTypeId: vi.fn(),
            getEscalationTargets: vi.fn(),
            getEscalationContext: vi.fn().mockResolvedValue({
              targets: [{ type: "role" as const, value: "admin" as const }],
              minViewRole: RoleId.MANAGER,
            }),
            getMinCreateRole: vi.fn(),
          }),
          createQueuePermissionsSvc: () => ({
            getQueueMembers: vi.fn().mockResolvedValue([]),
          }),
          createUserSvc: () => ({
            listActiveIdsByRoleId: vi
              .fn()
              .mockResolvedValue(new Set([adminUser.id, filteredOutUser.id])),
            listActiveKeyWrapHolderIds: vi.fn().mockResolvedValue(new Set()),
            // Only adminUser passes the role threshold filter
            filterByRoleThreshold: vi.fn().mockResolvedValue([adminUser.id]),
          }),
        };

        await drainOutbox(testDb.db, deps);

        expect(dispatch).toHaveBeenCalled();
        const recipientList = (dispatch.mock.calls[0] as unknown[])[7] as {
          recipients: readonly { userId: UserId; source: string }[];
        };

        const recipientIds = recipientList.recipients.map((r) => r.userId);
        expect(recipientIds).toContain(adminUser.id);
        // filteredOutUser was resolved by listActiveIdsByRoleId but
        // removed by filterByRoleThreshold
        expect(recipientIds).not.toContain(filteredOutUser.id);
      });

      it("returns undefined for escalation when all targets are filtered out by role threshold", async () => {
        const ticketId = await createTicketRow();
        const noteTypeId = noteTypeIdSchema.parse(crypto.randomUUID());

        await enqueueNotificationDurable(testDb.db, {
          eventType: "followup_added",
          ticketId,
          queueId,
          formId: null,
          actorUserId: null,
          noteTypeId,
        });

        const dispatch = vi.fn().mockResolvedValue(undefined);
        const deps: OutboxDrainDeps = {
          ...makeDrainDeps({ dispatch }),
          orgSchema: testDb.schemaName as OrgSchema,
          createNoteTypeSvc: () => ({
            list: vi.fn(),
            listActive: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            getDefaultTypeId: vi.fn(),
            getEscalationTargets: vi.fn(),
            getEscalationContext: vi.fn().mockResolvedValue({
              targets: [{ type: "role" as const, value: "admin" as const }],
              minViewRole: RoleId.ADMIN,
            }),
            getMinCreateRole: vi.fn(),
          }),
          createQueuePermissionsSvc: () => ({
            getQueueMembers: vi.fn().mockResolvedValue([]),
          }),
          createUserSvc: () => ({
            listActiveIdsByRoleId: vi
              .fn()
              .mockResolvedValue(
                new Set([userIdSchema.parse(crypto.randomUUID())]),
              ),
            listActiveKeyWrapHolderIds: vi.fn().mockResolvedValue(new Set()),
            // No users pass the filter
            filterByRoleThreshold: vi.fn().mockResolvedValue([]),
          }),
        };

        await drainOutbox(testDb.db, deps);

        // No escalation recipients (all filtered out, returns undefined
        // at L569). buildRecipientList runs without escalation IDs.
        // No ticket/queue watchers seeded, so recipients are empty.
        expect(dispatch).not.toHaveBeenCalled();
      });

      it("returns undefined for escalation when resolveEscalationTargets yields no user IDs", async () => {
        const ticketId = await createTicketRow();
        const noteTypeId = noteTypeIdSchema.parse(crypto.randomUUID());

        await enqueueNotificationDurable(testDb.db, {
          eventType: "followup_added",
          ticketId,
          queueId,
          formId: null,
          actorUserId: null,
          noteTypeId,
        });

        const dispatch = vi.fn().mockResolvedValue(undefined);
        const deps: OutboxDrainDeps = {
          ...makeDrainDeps({ dispatch }),
          orgSchema: testDb.schemaName as OrgSchema,
          createNoteTypeSvc: () => ({
            list: vi.fn(),
            listActive: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            getDefaultTypeId: vi.fn(),
            getEscalationTargets: vi.fn(),
            getEscalationContext: vi.fn().mockResolvedValue({
              targets: [{ type: "role" as const, value: "manager" as const }],
              minViewRole: RoleId.VOLUNTEER,
            }),
            getMinCreateRole: vi.fn(),
          }),
          createQueuePermissionsSvc: () => ({
            getQueueMembers: vi.fn().mockResolvedValue([]),
          }),
          createUserSvc: () => ({
            // No users with the target role
            listActiveIdsByRoleId: vi.fn().mockResolvedValue(new Set()),
            listActiveKeyWrapHolderIds: vi.fn().mockResolvedValue(new Set()),
            filterByRoleThreshold: vi.fn().mockResolvedValue([]),
          }),
        };

        await drainOutbox(testDb.db, deps);

        // Empty escalation targets -> undefined at L560, no escalation
        // recipients. No ticket/queue watchers seeded, so dispatch skipped.
        expect(dispatch).not.toHaveBeenCalled();
      });
    });

    // -----------------------------------------------------------------
    // Additional cold branch coverage
    // -----------------------------------------------------------------

    it("appends the driver code to the classification when present", async () => {
      const ticketId = await createTicketRow();
      const watcher = await createTestUser(testDb.db);

      await testDb.db
        .insertInto("queue_watchers")
        .values({ queue_id: queueId, user_id: watcher.id })
        .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
        .execute();

      await testDb.db
        .insertInto("notification_outbox")
        .values({
          event_type: "ticket_created",
          ticket_id: ticketId,
          queue_id: queueId,
          max_attempts: 5,
        })
        .execute();

      const codedError = Object.assign(new Error("duplicate key value"), {
        code: "23505",
      });
      const dispatch = vi.fn().mockRejectedValue(codedError);
      const deps: OutboxDrainDeps = {
        ...makeDrainDeps({ dispatch }),
        orgSchema: testDb.schemaName as OrgSchema,
      };

      await drainOutbox(testDb.db, deps);

      const row = await testDb.db
        .selectFrom("notification_outbox")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();

      expect(row?.last_error).toBe("Error:23505");
    });

    it("stores the unknown classification when dispatch throws a non-Error value", async () => {
      const ticketId = await createTicketRow();
      const watcher = await createTestUser(testDb.db);

      await testDb.db
        .insertInto("queue_watchers")
        .values({ queue_id: queueId, user_id: watcher.id })
        .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
        .execute();

      await testDb.db
        .insertInto("notification_outbox")
        .values({
          event_type: "ticket_created",
          ticket_id: ticketId,
          queue_id: queueId,
          max_attempts: 5,
        })
        .execute();

      // Dispatch throws a string, not an Error instance
      const dispatch = vi.fn().mockRejectedValue("dispatch-string-error");
      const deps: OutboxDrainDeps = {
        ...makeDrainDeps({ dispatch }),
        orgSchema: testDb.schemaName as OrgSchema,
      };

      await drainOutbox(testDb.db, deps);

      const row = await testDb.db
        .selectFrom("notification_outbox")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();

      // Non-Error throws carry no name; the static fallback persists
      expect(row?.last_error).toBe("unknown");
      expect(row?.status).toBe("pending");
      expect(row?.attempt_count).toBe(1);

      // Cleanup
      await testDb.db
        .deleteFrom("queue_watchers")
        .where("queue_id", "=", queueId)
        .where("user_id", "=", watcher.id)
        .execute();
    });

    it("resolves lifecycle recipients with decrypted mentioned pseudonyms", async () => {
      // Covers L459 if[0]: encrypted_mentioned_pseudonyms present with fieldEncryptor
      const ticketId = await createTicketRow();
      const mentionedUser = await createTestUser(testDb.db);
      const actor = await createTestUser(testDb.db);

      const encrypted = encryptMentionedPseudonyms(
        [mentionedUser.id],
        noopEncryptor,
      );

      await enqueueNotificationDurable(testDb.db, {
        eventType: "followup_added",
        ticketId,
        queueId,
        formId: null,
        actorUserId: actor.id,
        encryptedMentionedPseudonyms: encrypted,
      });

      const dispatch = vi.fn().mockResolvedValue(undefined);
      const deps: OutboxDrainDeps = {
        ...makeDrainDeps({ dispatch, encryptor: noopEncryptor }),
        orgSchema: testDb.schemaName as OrgSchema,
      };

      await drainOutbox(testDb.db, deps);

      expect(dispatch).toHaveBeenCalled();
      const recipientList = (dispatch.mock.calls[0] as unknown[])[7] as {
        recipients: readonly { userId: UserId; source: string }[];
      };

      // The mentioned user should appear as a "mention" recipient
      const mentionRecipient = recipientList.recipients.find(
        (r) => r.userId === mentionedUser.id && r.source === "mention",
      );
      expect(mentionRecipient).toBeDefined();

      // The actor should be excluded from recipients
      const actorRecipient = recipientList.recipients.find(
        (r) => r.userId === actor.id,
      );
      expect(actorRecipient).toBeUndefined();
    });

    it("concurrent drainOutbox calls never dispatch the same row", async () => {
      const dispatchedIds: string[][] = [[], []];

      // A watcher so recipient resolution is non-empty and dispatch fires
      const watcher = await createTestUser(testDb.db);
      await testDb.db
        .insertInto("queue_watchers")
        .values({ queue_id: queueId, user_id: watcher.id })
        .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
        .execute();

      // Insert 5 pending rows
      const ticketIds: TicketId[] = [];
      for (let i = 0; i < 5; i++) {
        const tid = await createTicketRow();
        ticketIds.push(tid);
        await enqueueNotificationDurable(testDb.db, {
          eventType: "ticket_created",
          ticketId: tid,
          queueId,
          formId: null,
          actorUserId: null,
        });
      }

      // Run two concurrent drain calls, each recording which ticket_ids they dispatch
      const dispatch0 = vi.fn(
        async (
          _db: unknown,
          _orgId: unknown,
          _orgSchema: unknown,
          _orgSlug: unknown,
          _eventType: unknown,
          ticketId: TicketId,
        ) => {
          dispatchedIds[0]!.push(ticketId);
        },
      );
      const dispatch1 = vi.fn(
        async (
          _db: unknown,
          _orgId: unknown,
          _orgSchema: unknown,
          _orgSlug: unknown,
          _eventType: unknown,
          ticketId: TicketId,
        ) => {
          dispatchedIds[1]!.push(ticketId);
        },
      );

      const deps0: OutboxDrainDeps = {
        ...makeDrainDeps({ dispatch: dispatch0 }),
        orgSchema: testDb.schemaName as OrgSchema,
      };
      const deps1: OutboxDrainDeps = {
        ...makeDrainDeps({ dispatch: dispatch1 }),
        orgSchema: testDb.schemaName as OrgSchema,
      };

      await Promise.all([
        drainOutbox(testDb.db, deps0),
        drainOutbox(testDb.db, deps1),
      ]);

      // Both sets combined should contain all 5 ticket IDs
      const all = [...dispatchedIds[0]!, ...dispatchedIds[1]!];
      expect(all.sort()).toEqual([...ticketIds].sort());

      // No ticket ID should appear in both sets (disjoint)
      const set0 = new Set(dispatchedIds[0]!);
      const set1 = new Set(dispatchedIds[1]!);
      for (const id of set0) {
        expect(set1.has(id)).toBe(false);
      }

      // Cleanup
      await testDb.db
        .deleteFrom("queue_watchers")
        .where("queue_id", "=", queueId)
        .where("user_id", "=", watcher.id)
        .execute();
    });

    it("created_at defaults to now() at insert time (not migration time)", async () => {
      const before = new Date();
      const ticketId = await createTicketRow();
      await enqueueNotificationDurable(testDb.db, {
        eventType: "ticket_created",
        ticketId,
        queueId,
        formId: null,
        actorUserId: null,
      });
      const after = new Date();

      const row = await testDb.db
        .selectFrom("notification_outbox")
        .select("created_at")
        .where("ticket_id", "=", ticketId)
        .executeTakeFirstOrThrow();

      // The timestamp should be between the before and after snapshots,
      // confirming the default is evaluated at insert time, not frozen.
      expect(row.created_at.getTime()).toBeGreaterThanOrEqual(
        before.getTime() - 1000,
      );
      expect(row.created_at.getTime()).toBeLessThanOrEqual(
        after.getTime() + 1000,
      );
    });
  },
);
