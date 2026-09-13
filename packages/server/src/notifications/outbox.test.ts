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
      expect(row!.last_error).toBe("transient failure");
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
      expect(row!.last_error).toBe("permanent");

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

    it("drain truncates long error messages in last_error", async () => {
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

      const longError = "x".repeat(500);
      const dispatch = vi.fn().mockRejectedValue(new Error(longError));
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

      expect(row!.last_error).toBeDefined();
      // Should be truncated to MAX_ERROR_LENGTH (200)
      expect(row!.last_error!.length).toBeLessThanOrEqual(200);

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
  },
);
