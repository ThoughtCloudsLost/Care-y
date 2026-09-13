/**
 * Integration tests for the intake key wrap conversion service.
 *
 * DB tests run inside Docker via `pnpm test:server:db`. They create an
 * isolated test schema per suite and drop it in afterAll.
 */

import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { TestDb } from "../test-utils.js";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestQueue,
  createTestUser,
} from "../test-utils.js";
import { createTicketAccessChecker } from "../tickets/access.js";
import {
  getConversionTargets,
  convertIntakeKeyWrap,
  type ConversionWrap,
} from "./intake-conversion-service.js";
import { ForbiddenError } from "../errors.js";
import { newTicketId, newKeyGeneration } from "@care-y/shared";
import type {
  QueueId,
  UserId,
  ClientId,
  TicketId,
  KeyGeneration,
  AliasHash,
} from "@care-y/shared";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function seedTicketWithIntakeWrap(
  db: TestDb["db"],
  queueId: QueueId,
  clientId: ClientId,
): Promise<{ ticketId: TicketId; keyGeneration: KeyGeneration }> {
  const ticketId = newTicketId();
  const keyGeneration = newKeyGeneration();

  await db
    .insertInto("tickets")
    .values({
      id: ticketId,
      client_id: clientId,
      queue_id: queueId,
      status: "open",
      priority: "normal",
      encrypted_title: Buffer.from("ct-title"),
      encrypted_description: Buffer.from("ct-desc"),
      key_generation: keyGeneration,
    })
    .execute();

  await db
    .insertInto("intake_key_wraps")
    .values({
      ticket_id: ticketId,
      wrapped_tk: Buffer.alloc(80, 0xab),
    })
    .execute();

  return { ticketId, keyGeneration };
}

function makeWrap(volunteerId: UserId): ConversionWrap {
  return {
    volunteerId,
    ephemeralPoint: Buffer.alloc(32, 0x01),
    nonce: Buffer.alloc(24, 0x02),
    wrappedKey: Buffer.alloc(48, 0x03),
  };
}

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "intake conversion service (DB integration)",
  () => {
    let testDb: TestDb;
    let queueId: QueueId;
    let userId: UserId;
    let clientId: ClientId;

    beforeAll(async () => {
      testDb = await createTestDb();

      await testDb.db
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();
      await seedOrgPublicKey(testDb.db);

      const q = await createTestQueue(testDb.db, { label: "Intake" });
      queueId = q.id;

      const user = await createTestUser(testDb.db);
      userId = user.id;

      // Assign user to queue
      await testDb.db
        .insertInto("queue_assignments")
        .values({ queue_id: queueId, user_id: userId })
        .execute();

      // Seed user_keys with vol_public
      await testDb.db
        .insertInto("user_keys")
        .values({
          user_id: userId,
          salt: Buffer.alloc(16, 0xaa),
          vol_public: Buffer.alloc(32, 0xbb),
        })
        .onConflict((oc) =>
          oc
            .column("user_id")
            .doUpdateSet({ vol_public: Buffer.alloc(32, 0xbb) }),
        )
        .execute();

      // Create a client for test tickets
      const alias = `test-client-${crypto.randomUUID().slice(0, 8)}`;
      const inserted = await testDb.db
        .insertInto("clients")
        .values({
          encrypted_alias: Buffer.from(alias),
          alias_hash: alias as AliasHash,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      clientId = inserted.id;
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("getConversionTargets returns queue volunteers with vol_public", async () => {
      const { ticketId } = await seedTicketWithIntakeWrap(
        testDb.db,
        queueId,
        clientId,
      );
      const access = createTicketAccessChecker(testDb.db);

      const targets = await getConversionTargets(
        testDb.db,
        access,
        userId,
        ticketId,
      );

      expect(targets).toHaveLength(1);
      expect(targets[0]!.volunteerId).toBe(userId);
      expect(typeof targets[0]!.volPublic).toBe("string");
    });

    it("conversion inserts wraps and deletes the interim row atomically", async () => {
      const { ticketId, keyGeneration } = await seedTicketWithIntakeWrap(
        testDb.db,
        queueId,
        clientId,
      );
      const access = createTicketAccessChecker(testDb.db);

      const result = await convertIntakeKeyWrap(testDb.db, access, userId, {
        ticketId,
        wraps: [makeWrap(userId)],
      });

      expect(result.converted).toBe(true);

      // Verify interim wrap is gone
      const interimRow = await testDb.db
        .selectFrom("intake_key_wraps")
        .select("ticket_id")
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();
      expect(interimRow).toBeUndefined();

      // Verify ECIES wrap was inserted
      const wrapRow = await testDb.db
        .selectFrom("ticket_key_wraps")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .where("volunteer_id", "=", userId)
        .executeTakeFirst();
      expect(wrapRow).toBeDefined();
      expect(wrapRow!.key_generation).toBe(keyGeneration);
      expect(wrapRow!.algorithm).toBe("ecies-ristretto255-v1");
    });

    it("idempotent second call returns converted: false", async () => {
      const { ticketId } = await seedTicketWithIntakeWrap(
        testDb.db,
        queueId,
        clientId,
      );
      const access = createTicketAccessChecker(testDb.db);

      // First call converts
      await convertIntakeKeyWrap(testDb.db, access, userId, {
        ticketId,
        wraps: [makeWrap(userId)],
      });

      // Second call is a no-op
      const result = await convertIntakeKeyWrap(testDb.db, access, userId, {
        ticketId,
        wraps: [makeWrap(userId)],
      });

      expect(result.converted).toBe(false);
    });

    it("rejects non-queue volunteerId in wraps", async () => {
      const { ticketId } = await seedTicketWithIntakeWrap(
        testDb.db,
        queueId,
        clientId,
      );
      const access = createTicketAccessChecker(testDb.db);
      const nonMemberId = crypto.randomUUID() as UserId;

      await expect(
        convertIntakeKeyWrap(testDb.db, access, userId, {
          ticketId,
          wraps: [makeWrap(nonMemberId)],
        }),
      ).rejects.toThrow(ForbiddenError);

      // Verify the interim wrap is still there (transaction rolled back)
      const interimRow = await testDb.db
        .selectFrom("intake_key_wraps")
        .select("ticket_id")
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();
      expect(interimRow).toBeDefined();
    });

    it("caller without ticket access is rejected", async () => {
      const { ticketId } = await seedTicketWithIntakeWrap(
        testDb.db,
        queueId,
        clientId,
      );
      const access = createTicketAccessChecker(testDb.db);
      const unknownUserId = crypto.randomUUID() as UserId;

      await expect(
        convertIntakeKeyWrap(testDb.db, access, unknownUserId, {
          ticketId,
          wraps: [makeWrap(userId)],
        }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("empty wraps list leaves the interim row in place", async () => {
      const { ticketId } = await seedTicketWithIntakeWrap(
        testDb.db,
        queueId,
        clientId,
      );
      const access = createTicketAccessChecker(testDb.db);

      const result = await convertIntakeKeyWrap(testDb.db, access, userId, {
        ticketId,
        wraps: [],
      });

      expect(result.converted).toBe(false);

      // Verify interim wrap is still there
      const interimRow = await testDb.db
        .selectFrom("intake_key_wraps")
        .select("ticket_id")
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();
      expect(interimRow).toBeDefined();
    });
  },
);
