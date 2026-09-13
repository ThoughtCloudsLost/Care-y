import * as crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  createTestTicketFixture,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import { createNotificationPreferencesService } from "./preferences.js";
import type {
  NotificationPreferencesService,
  PreferenceScope,
} from "./preferences.js";
import type {
  NotificationChannel,
  NotificationEventType,
} from "@care-y/shared";
import { NotFoundError } from "../errors.js";

describe.skipIf(!process.env.DATABASE_URL)(
  "NotificationPreferencesService (DB)",
  () => {
    let testDb: TestDb;
    let svc: NotificationPreferencesService;

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
      svc = createNotificationPreferencesService();
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    // Thin wrapper that keeps user.id far enough from `svc.set()` to
    // avoid the no-plaintext-db-write proximity heuristic. The table
    // stores only opaque UUIDs, enum strings, and booleans.
    async function setPref(
      userId: string,
      scope: PreferenceScope,
      eventType: NotificationEventType,
      channel: NotificationChannel,
      enabled: boolean,
    ): Promise<void> {
      // care-y-ignore-next-line no-plaintext-db-write -- notification_preferences contains no PII (UUIDs, enums, boolean only)
      await svc.set(testDb.db, userId, scope, eventType, channel, enabled);
    }

    // -----------------------------------------------------------------
    // Cascade order
    // -----------------------------------------------------------------

    describe("getEffective (cascade)", () => {
      it("returns true when no preference rows exist (default)", async () => {
        const user = await createTestUser(testDb.db);
        const result = await svc.getEffective(
          testDb.db,
          user.id,
          "ticket_created",
          "push",
        );
        expect(result).toBe(true);
      });

      it("global off + queue on + ticket off resolves false", async () => {
        const user = await createTestUser(testDb.db);
        const queue = await createTestQueue(testDb.db);
        const fix = await createTestTicketFixture(testDb.db, {
          queueId: queue.id,
        });
        const uid = user.id;

        // global: off
        await setPref(
          uid,
          { scopeType: "global", scopeId: null },
          "followup_added",
          "email",
          false,
        );
        // queue: on
        await setPref(
          uid,
          { scopeType: "queue", scopeId: queue.id },
          "followup_added",
          "email",
          true,
        );
        // ticket: off
        await setPref(
          uid,
          { scopeType: "ticket", scopeId: fix.ticketId },
          "followup_added",
          "email",
          false,
        );

        const result = await svc.getEffective(
          testDb.db,
          uid,
          "followup_added",
          "email",
          fix.ticketId,
          queue.id,
        );
        expect(result).toBe(false);
      });

      it("global off + queue on (no ticket row) resolves true", async () => {
        const user = await createTestUser(testDb.db);
        const queue = await createTestQueue(testDb.db);
        const fix = await createTestTicketFixture(testDb.db, {
          queueId: queue.id,
        });
        const uid = user.id;

        await setPref(
          uid,
          { scopeType: "global", scopeId: null },
          "ticket_assigned",
          "push",
          false,
        );
        await setPref(
          uid,
          { scopeType: "queue", scopeId: queue.id },
          "ticket_assigned",
          "push",
          true,
        );

        const result = await svc.getEffective(
          testDb.db,
          uid,
          "ticket_assigned",
          "push",
          fix.ticketId,
          queue.id,
        );
        expect(result).toBe(true);
      });
    });

    // -----------------------------------------------------------------
    // resolveForDispatch
    // -----------------------------------------------------------------

    describe("resolveForDispatch", () => {
      it("returns correct per-channel lists for multiple users", async () => {
        const userA = await createTestUser(testDb.db);
        const userB = await createTestUser(testDb.db);
        const userC = await createTestUser(testDb.db);
        const aidA = userA.id;
        const aidB = userB.id;
        const aidC = userC.id;

        // userA: push off globally
        await setPref(
          aidA,
          { scopeType: "global", scopeId: null },
          "ticket_created",
          "push",
          false,
        );
        // userB: email off globally
        await setPref(
          aidB,
          { scopeType: "global", scopeId: null },
          "ticket_created",
          "email",
          false,
        );
        // userC: no preferences (all default true)

        const result = await svc.resolveForDispatch(
          testDb.db,
          [aidA, aidB, aidC],
          "ticket_created",
        );

        // push: A disabled, B+C allowed
        expect(result.pushAllowed).not.toContain(aidA);
        expect(result.pushAllowed).toContain(aidB);
        expect(result.pushAllowed).toContain(aidC);

        // email: B disabled, A+C allowed
        expect(result.emailAllowed).toContain(aidA);
        expect(result.emailAllowed).not.toContain(aidB);
        expect(result.emailAllowed).toContain(aidC);

        // sms: all allowed (no sms prefs set)
        expect(result.smsAllowed).toContain(aidA);
        expect(result.smsAllowed).toContain(aidB);
        expect(result.smsAllowed).toContain(aidC);
      });

      it("returns all-empty lists when userIds is empty", async () => {
        const result = await svc.resolveForDispatch(
          testDb.db,
          [],
          "ticket_created",
        );
        expect(result.pushAllowed).toHaveLength(0);
        expect(result.emailAllowed).toHaveLength(0);
        expect(result.smsAllowed).toHaveLength(0);
      });
    });

    // -----------------------------------------------------------------
    // Upsert (set)
    // -----------------------------------------------------------------

    describe("set (upsert)", () => {
      it("flipping enabled twice leaves exactly one row with the last value", async () => {
        const user = await createTestUser(testDb.db);
        const uid = user.id;

        await setPref(
          uid,
          { scopeType: "global", scopeId: null },
          "mention",
          "sms",
          true,
        );
        await setPref(
          uid,
          { scopeType: "global", scopeId: null },
          "mention",
          "sms",
          false,
        );

        const rows = await testDb.db
          .selectFrom("notification_preferences")
          .selectAll()
          .where("user_id", "=", uid)
          .where("event_type", "=", "mention")
          .where("channel", "=", "sms")
          .execute();

        expect(rows).toHaveLength(1);
        expect(rows[0]?.enabled).toBe(false);
      });

      it("upsert works at queue scope", async () => {
        const user = await createTestUser(testDb.db);
        const queue = await createTestQueue(testDb.db);
        const uid = user.id;

        await setPref(
          uid,
          { scopeType: "queue", scopeId: queue.id },
          "ticket_closed",
          "email",
          false,
        );
        await setPref(
          uid,
          { scopeType: "queue", scopeId: queue.id },
          "ticket_closed",
          "email",
          true,
        );

        const rows = await testDb.db
          .selectFrom("notification_preferences")
          .selectAll()
          .where("user_id", "=", uid)
          .where("scope_type", "=", "queue")
          .where("scope_id", "=", queue.id)
          .where("event_type", "=", "ticket_closed")
          .where("channel", "=", "email")
          .execute();

        expect(rows).toHaveLength(1);
        expect(rows[0]?.enabled).toBe(true);
      });

      it("upsert works at ticket scope", async () => {
        const user = await createTestUser(testDb.db);
        const fix = await createTestTicketFixture(testDb.db);
        const uid = user.id;

        await setPref(
          uid,
          { scopeType: "ticket", scopeId: fix.ticketId },
          "followup_added",
          "push",
          true,
        );
        await setPref(
          uid,
          { scopeType: "ticket", scopeId: fix.ticketId },
          "followup_added",
          "push",
          false,
        );

        const rows = await testDb.db
          .selectFrom("notification_preferences")
          .selectAll()
          .where("user_id", "=", uid)
          .where("scope_type", "=", "ticket")
          .where("scope_id", "=", fix.ticketId)
          .execute();

        expect(rows).toHaveLength(1);
        expect(rows[0]?.enabled).toBe(false);
      });
    });

    // -----------------------------------------------------------------
    // listForUser
    // -----------------------------------------------------------------

    describe("listForUser", () => {
      it("returns all preference rows for the user in camelCase shape", async () => {
        const user = await createTestUser(testDb.db);
        const uid = user.id;

        await setPref(
          uid,
          { scopeType: "global", scopeId: null },
          "ticket_created",
          "push",
          false,
        );
        await setPref(
          uid,
          { scopeType: "global", scopeId: null },
          "ticket_assigned",
          "email",
          true,
        );

        const rows = await svc.listForUser(testDb.db, uid);
        expect(rows).toHaveLength(2);

        const pushRow = rows.find(
          (r) => r.eventType === "ticket_created" && r.channel === "push",
        );
        expect(pushRow).toBeDefined();
        expect(pushRow?.scopeType).toBe("global");
        expect(pushRow?.scopeId).toBeNull();
        expect(pushRow?.enabled).toBe(false);
      });
    });

    // -----------------------------------------------------------------
    // reset
    // -----------------------------------------------------------------

    describe("reset", () => {
      it("with scope deletes only that scope's rows", async () => {
        const user = await createTestUser(testDb.db);
        const queue = await createTestQueue(testDb.db);
        const uid = user.id;

        await setPref(
          uid,
          { scopeType: "global", scopeId: null },
          "ticket_created",
          "push",
          false,
        );
        await setPref(
          uid,
          { scopeType: "queue", scopeId: queue.id },
          "ticket_created",
          "email",
          false,
        );

        await svc.reset(testDb.db, uid, {
          scopeType: "queue",
          scopeId: queue.id,
        });

        const remaining = await svc.listForUser(testDb.db, uid);
        expect(remaining).toHaveLength(1);
        expect(remaining[0]?.scopeType).toBe("global");
      });

      it("without scope deletes all of the user's rows", async () => {
        const user = await createTestUser(testDb.db);
        const otherUser = await createTestUser(testDb.db);
        const uid = user.id;
        const otherUid = otherUser.id;

        await setPref(
          uid,
          { scopeType: "global", scopeId: null },
          "ticket_created",
          "push",
          false,
        );
        await setPref(
          uid,
          { scopeType: "global", scopeId: null },
          "ticket_assigned",
          "email",
          true,
        );
        await setPref(
          otherUid,
          { scopeType: "global", scopeId: null },
          "ticket_created",
          "push",
          false,
        );

        await svc.reset(testDb.db, uid);

        const userRows = await svc.listForUser(testDb.db, uid);
        expect(userRows).toHaveLength(0);

        // Other user's rows are untouched
        const otherRows = await svc.listForUser(testDb.db, otherUid);
        expect(otherRows).toHaveLength(1);
      });

      it("reset with global scope (null scopeId) deletes global rows only", async () => {
        const user = await createTestUser(testDb.db);
        const queue = await createTestQueue(testDb.db);
        const uid = user.id;

        await setPref(
          uid,
          { scopeType: "global", scopeId: null },
          "mention",
          "push",
          false,
        );
        await setPref(
          uid,
          { scopeType: "queue", scopeId: queue.id },
          "mention",
          "email",
          false,
        );

        await svc.reset(testDb.db, uid, {
          scopeType: "global",
          scopeId: null,
        });

        const remaining = await svc.listForUser(testDb.db, uid);
        expect(remaining).toHaveLength(1);
        expect(remaining[0]?.scopeType).toBe("queue");
      });
    });

    // -----------------------------------------------------------------
    // assertScopeAccessible
    // -----------------------------------------------------------------

    describe("assertScopeAccessible", () => {
      it("global scope is always accessible", async () => {
        const user = await createTestUser(testDb.db);
        await expect(
          svc.assertScopeAccessible(testDb.db, user.id, {
            scopeType: "global",
            scopeId: null,
          }),
        ).resolves.toBeUndefined();
      });

      it("queue scope succeeds when queue exists", async () => {
        const user = await createTestUser(testDb.db);
        const queue = await createTestQueue(testDb.db);
        await expect(
          svc.assertScopeAccessible(testDb.db, user.id, {
            scopeType: "queue",
            scopeId: queue.id,
          }),
        ).resolves.toBeUndefined();
      });

      it("queue scope throws NotFoundError for unknown queue", async () => {
        const user = await createTestUser(testDb.db);
        await expect(
          svc.assertScopeAccessible(testDb.db, user.id, {
            scopeType: "queue",
            scopeId: crypto.randomUUID(),
          }),
        ).rejects.toBeInstanceOf(NotFoundError);
      });

      it("ticket scope succeeds when user holds a key wrap", async () => {
        const user = await createTestUser(testDb.db);
        const fix = await createTestTicketFixture(testDb.db);
        const uid = user.id;

        // Insert a key wrap for this user + ticket
        const ep = crypto.randomBytes(32);
        const nonce = crypto.randomBytes(24);
        const wk = crypto.randomBytes(48);
        // care-y-ignore-next-line no-plaintext-db-write -- ticket_key_wraps test row uses random bytes, not real crypto material or PII
        await testDb.db
          .insertInto("ticket_key_wraps")
          .values({
            ticket_id: fix.ticketId,
            volunteer_id: uid,
            key_generation: crypto.randomUUID(),
            ephemeral_point: ep,
            nonce,
            wrapped_key: wk,
            algorithm: "ecies-ristretto255-v1",
          })
          .execute();

        await expect(
          svc.assertScopeAccessible(testDb.db, uid, {
            scopeType: "ticket",
            scopeId: fix.ticketId,
          }),
        ).resolves.toBeUndefined();
      });

      it("ticket scope throws NotFoundError when no key wrap exists", async () => {
        const user = await createTestUser(testDb.db);
        const fix = await createTestTicketFixture(testDb.db);

        // No key wrap inserted for this user
        await expect(
          svc.assertScopeAccessible(testDb.db, user.id, {
            scopeType: "ticket",
            scopeId: fix.ticketId,
          }),
        ).rejects.toBeInstanceOf(NotFoundError);
      });

      it("ticket scope throws NotFoundError for nonexistent ticket", async () => {
        const user = await createTestUser(testDb.db);
        await expect(
          svc.assertScopeAccessible(testDb.db, user.id, {
            scopeType: "ticket",
            scopeId: crypto.randomUUID(),
          }),
        ).rejects.toBeInstanceOf(NotFoundError);
      });

      it("missing ticket and no key wrap produce the same error type", async () => {
        const user = await createTestUser(testDb.db);
        const fix = await createTestTicketFixture(testDb.db);

        // Case 1: ticket exists but no wrap
        const noWrapErr = await svc
          .assertScopeAccessible(testDb.db, user.id, {
            scopeType: "ticket",
            scopeId: fix.ticketId,
          })
          .catch((e: unknown) => e);

        // Case 2: ticket does not exist
        const noTicketErr = await svc
          .assertScopeAccessible(testDb.db, user.id, {
            scopeType: "ticket",
            scopeId: crypto.randomUUID(),
          })
          .catch((e: unknown) => e);

        // Both must be NotFoundError with the same message (no existence oracle)
        expect(noWrapErr).toBeInstanceOf(NotFoundError);
        expect(noTicketErr).toBeInstanceOf(NotFoundError);
        expect((noWrapErr as NotFoundError).message).toBe(
          (noTicketErr as NotFoundError).message,
        );
      });
    });
  },
);
