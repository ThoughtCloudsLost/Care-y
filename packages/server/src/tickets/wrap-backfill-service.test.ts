import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as crypto from "node:crypto";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  type TestDb,
} from "../test-utils.js";
import { createWrapBackfillService } from "./wrap-backfill-service.js";
import type { WrapBackfillService } from "./wrap-backfill-service.js";
import type { UserId, TicketId, ClientId, QueueId } from "@care-y/shared";
import { newTicketId, newKeyGeneration } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("WrapBackfillService", () => {
  let testDb: TestDb;
  let service: WrapBackfillService;

  beforeAll(async () => {
    testDb = await createTestDb();
    service = createWrapBackfillService(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  async function seedUserKeys(userId: UserId): Promise<Buffer> {
    const volPublic = crypto.randomBytes(32);
    await testDb.db
      .insertInto("user_keys")
      .values({
        user_id: userId,
        salt: crypto.randomBytes(32),
        vol_public: volPublic,
      })
      .execute();
    return volPublic;
  }

  async function seedTicket(
    queueId: QueueId,
    wrapHolders: UserId[],
  ): Promise<TicketId> {
    const ticketId = newTicketId();
    const keyGen = newKeyGeneration();

    const clientId = crypto.randomUUID() as ClientId;
    await testDb.db
      .insertInto("clients")
      .values({
        id: clientId,
        encrypted_alias: Buffer.from("alias"),
      })
      .execute();

    await testDb.db
      .insertInto("tickets")
      .values({
        id: ticketId,
        client_id: clientId,
        queue_id: queueId,
        encrypted_title: Buffer.from("t"),
        encrypted_description: Buffer.from("d"),
        key_generation: keyGen,
        priority: "normal",
      })
      .execute();

    for (const holderId of wrapHolders) {
      await testDb.db
        .insertInto("ticket_key_wraps")
        .values({
          ticket_id: ticketId,
          volunteer_id: holderId,
          key_generation: keyGen,
          ephemeral_point: crypto.randomBytes(32),
          nonce: crypto.randomBytes(24),
          wrapped_key: crypto.randomBytes(64),
          algorithm: "ecies-ristretto255-v1",
        })
        .execute();
    }

    return ticketId;
  }

  describe("listPendingBackfills", () => {
    it("returns empty when caller has no queues", async () => {
      const user = await createTestUser(testDb.db);
      const result = await service.listPendingBackfills(user.id, 50);
      expect(result.tickets).toEqual([]);
      expect(result.targets).toEqual([]);
    });

    it("returns tickets missing wraps for new queue members", async () => {
      const holder = await createTestUser(testDb.db);
      const newMember = await createTestUser(testDb.db);
      const queue = await createTestQueue(testDb.db);
      const queueId = queue.id;

      await seedUserKeys(holder.id);
      await seedUserKeys(newMember.id);

      // Add both to queue
      await testDb.db
        .insertInto("queue_assignments")
        .values([
          { queue_id: queueId, user_id: holder.id },
          { queue_id: queueId, user_id: newMember.id },
        ])
        .execute();

      // Create ticket with only the holder's wrap
      await seedTicket(queueId, [holder.id]);

      const result = await service.listPendingBackfills(holder.id, 50);
      expect(result.tickets).toHaveLength(1);
      expect(result.targets).toHaveLength(1);
      expect(result.targets[0]?.volunteerId).toBe(newMember.id);
    });

    it("returns empty when all queue members have wraps", async () => {
      const userA = await createTestUser(testDb.db);
      const userB = await createTestUser(testDb.db);
      const queue = await createTestQueue(testDb.db);
      const queueId = queue.id;

      await seedUserKeys(userA.id);
      await seedUserKeys(userB.id);

      await testDb.db
        .insertInto("queue_assignments")
        .values([
          { queue_id: queueId, user_id: userA.id },
          { queue_id: queueId, user_id: userB.id },
        ])
        .execute();

      // Both have wraps
      await seedTicket(queueId, [userA.id, userB.id]);

      const result = await service.listPendingBackfills(userA.id, 50);
      expect(result.tickets).toHaveLength(0);
    });
  });

  describe("submitBackfillWraps", () => {
    it("inserts new wraps for valid targets", async () => {
      const holder = await createTestUser(testDb.db);
      const newMember = await createTestUser(testDb.db);
      const queue = await createTestQueue(testDb.db);
      const queueId = queue.id;

      await seedUserKeys(holder.id);
      await seedUserKeys(newMember.id);

      await testDb.db
        .insertInto("queue_assignments")
        .values([
          { queue_id: queueId, user_id: holder.id },
          { queue_id: queueId, user_id: newMember.id },
        ])
        .execute();

      const ticketId = await seedTicket(queueId, [holder.id]);

      const result = await service.submitBackfillWraps(holder.id, [
        {
          ticketId,
          volunteerId: newMember.id,
          ephemeralPoint: crypto.randomBytes(32),
          nonce: crypto.randomBytes(24),
          wrappedKey: crypto.randomBytes(64),
        },
      ]);

      expect(result.inserted).toBe(1);

      // Verify the wrap was inserted
      const wrapRow = await testDb.db
        .selectFrom("ticket_key_wraps")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .where("volunteer_id", "=", newMember.id)
        .executeTakeFirst();
      expect(wrapRow).toBeDefined();
    });

    it("is idempotent (skips duplicate wraps)", async () => {
      const holder = await createTestUser(testDb.db);
      const newMember = await createTestUser(testDb.db);
      const queue = await createTestQueue(testDb.db);
      const queueId = queue.id;

      await seedUserKeys(holder.id);
      await seedUserKeys(newMember.id);

      await testDb.db
        .insertInto("queue_assignments")
        .values([
          { queue_id: queueId, user_id: holder.id },
          { queue_id: queueId, user_id: newMember.id },
        ])
        .execute();

      const ticketId = await seedTicket(queueId, [holder.id]);

      const wrap = {
        ticketId,
        volunteerId: newMember.id,
        ephemeralPoint: crypto.randomBytes(32),
        nonce: crypto.randomBytes(24),
        wrappedKey: crypto.randomBytes(64),
      };

      await service.submitBackfillWraps(holder.id, [wrap]);
      const second = await service.submitBackfillWraps(holder.id, [wrap]);
      expect(second.inserted).toBe(0);
    });

    it("rejects when caller does not hold a wrap for the ticket", async () => {
      const nonHolder = await createTestUser(testDb.db);
      const target = await createTestUser(testDb.db);
      const queue = await createTestQueue(testDb.db);
      const queueId = queue.id;

      await seedUserKeys(nonHolder.id);
      await seedUserKeys(target.id);

      // Ticket has no wraps for nonHolder
      const ticketId = await seedTicket(queueId, []);

      await expect(
        service.submitBackfillWraps(nonHolder.id, [
          {
            ticketId,
            volunteerId: target.id,
            ephemeralPoint: crypto.randomBytes(32),
            nonce: crypto.randomBytes(24),
            wrappedKey: crypto.randomBytes(64),
          },
        ]),
      ).rejects.toThrow();
    });
  });
});
