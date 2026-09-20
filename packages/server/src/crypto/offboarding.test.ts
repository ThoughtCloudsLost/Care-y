import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as crypto from "node:crypto";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  type TestDb,
} from "../test-utils.js";
import {
  createOffboardingService,
  SoleWrapHolderError,
} from "./offboarding.js";
import { OffboardingError } from "../errors.js";
import type { OffboardingService } from "./offboarding.js";
import type { UserId, ClientId, QueueId } from "@care-y/shared";
import { newTicketId, newKeyGeneration } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("OffboardingService", () => {
  let testDb: TestDb;
  let service: OffboardingService;

  beforeAll(async () => {
    testDb = await createTestDb();
    service = createOffboardingService(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  /** Seeds user_keys and optionally wrapped_org_keys for a user. */
  async function seedKeyMaterial(
    userId: UserId,
    opts?: { withWrappedOrgKey?: boolean },
  ): Promise<void> {
    await testDb.db
      .insertInto("user_keys")
      .values({
        user_id: userId,
        salt: crypto.randomBytes(32),
        vol_public: crypto.randomBytes(32),
      })
      .execute();

    if (opts?.withWrappedOrgKey) {
      await testDb.db
        .insertInto("wrapped_org_keys")
        .values({
          user_id: userId,
          ephemeral_point: crypto.randomBytes(32),
          wrapped_key: crypto.randomBytes(64),
          nonce: crypto.randomBytes(24),
        })
        .execute();
    }
  }

  describe("revokeVolunteerKeys", () => {
    it("deletes user_keys row", async () => {
      const user = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id);

      await service.revokeVolunteerKeys(user.id);

      const row = await testDb.db
        .selectFrom("user_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();

      expect(row).toBeUndefined();
    });

    it("deletes wrapped_org_keys row", async () => {
      const user = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id, { withWrappedOrgKey: true });

      await service.revokeVolunteerKeys(user.id);

      const row = await testDb.db
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();

      expect(row).toBeUndefined();
    });

    it("deletes both user_keys and wrapped_org_keys in one call", async () => {
      const user = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id, { withWrappedOrgKey: true });

      await service.revokeVolunteerKeys(user.id);

      const keysRow = await testDb.db
        .selectFrom("user_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();
      const orgKeyRow = await testDb.db
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();

      expect(keysRow).toBeUndefined();
      expect(orgKeyRow).toBeUndefined();
    });

    it("succeeds when user has no wrapped_org_keys row", async () => {
      const user = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id, { withWrappedOrgKey: false });

      await expect(
        service.revokeVolunteerKeys(user.id),
      ).resolves.toBeUndefined();

      const row = await testDb.db
        .selectFrom("user_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();
      expect(row).toBeUndefined();
    });

    it("throws OffboardingError for nonexistent user_keys row", async () => {
      const user = await createTestUser(testDb.db);
      // No seedKeyMaterial call, so user_keys row is missing

      await expect(service.revokeVolunteerKeys(user.id)).rejects.toThrow(
        OffboardingError,
      );
    });

    it("handles missing ticket_key_wraps table gracefully", async () => {
      const user = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id, { withWrappedOrgKey: true });

      // ticket_key_wraps table doesn't exist yet. The SAVEPOINT guard
      // should handle this without aborting the outer transaction.
      await expect(
        service.revokeVolunteerKeys(user.id),
      ).resolves.toBeUndefined();

      // Verify that wrapped_org_keys and user_keys were still deleted
      const keysRow = await testDb.db
        .selectFrom("user_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();
      expect(keysRow).toBeUndefined();
    });
  });

  /** Seeds a ticket and wraps for the given users. */
  async function seedTicketWithWraps(
    queueId: QueueId,
    wrapHolders: UserId[],
  ): Promise<string> {
    const ticketId = newTicketId();
    const keyGen = newKeyGeneration();

    // Insert a minimal client for the ticket's FK
    const clientId = crypto.randomUUID() as ClientId;
    await testDb.db
      .insertInto("clients")
      .values({
        id: clientId,
        encrypted_alias: Buffer.from("test-alias"),
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

  describe("getSoleHeldTicketIds", () => {
    it("returns empty when user holds no wraps", async () => {
      const user = await createTestUser(testDb.db);
      const ids = await service.getSoleHeldTicketIds(user.id);
      expect(ids).toEqual([]);
    });

    it("returns ticket IDs where user is the only holder", async () => {
      const user = await createTestUser(testDb.db);
      const other = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id);
      await seedKeyMaterial(other.id);
      const queue = await createTestQueue(testDb.db);

      // Ticket with only user's wrap
      const soleId = await seedTicketWithWraps(queue.id, [user.id]);
      // Ticket with both users' wraps
      await seedTicketWithWraps(queue.id, [user.id, other.id]);

      const ids = await service.getSoleHeldTicketIds(user.id);
      expect(ids).toEqual([soleId]);
    });
  });

  describe("last-holder guard", () => {
    it("throws SoleWrapHolderError when user is sole holder", async () => {
      const user = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id, { withWrappedOrgKey: true });
      const queue = await createTestQueue(testDb.db);
      await seedTicketWithWraps(queue.id, [user.id]);

      await expect(service.revokeVolunteerKeys(user.id)).rejects.toThrow(
        SoleWrapHolderError,
      );
    });

    it("SoleWrapHolderError carries the affected ticket count", async () => {
      const user = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id, { withWrappedOrgKey: true });
      const queue = await createTestQueue(testDb.db);
      await seedTicketWithWraps(queue.id, [user.id]);
      await seedTicketWithWraps(queue.id, [user.id]);

      try {
        await service.revokeVolunteerKeys(user.id);
        expect.fail("Should have thrown");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(SoleWrapHolderError);
        const soleErr = err as SoleWrapHolderError;
        expect(soleErr.soleHeldTicketCount).toBe(2);
        expect(soleErr.soleHeldTicketIds).toHaveLength(2);
      }
    });

    it("proceeds when force = true despite sole-held tickets", async () => {
      const user = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id, { withWrappedOrgKey: true });
      const queue = await createTestQueue(testDb.db);
      await seedTicketWithWraps(queue.id, [user.id]);

      await expect(
        service.revokeVolunteerKeys(user.id, true),
      ).resolves.toBeUndefined();

      // Verify key material is deleted
      const keysRow = await testDb.db
        .selectFrom("user_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();
      expect(keysRow).toBeUndefined();
    });

    it("proceeds normally when user is not a sole holder", async () => {
      const user = await createTestUser(testDb.db);
      const other = await createTestUser(testDb.db);
      await seedKeyMaterial(user.id, { withWrappedOrgKey: true });
      await seedKeyMaterial(other.id);
      const queue = await createTestQueue(testDb.db);
      // Both users hold wraps for this ticket
      await seedTicketWithWraps(queue.id, [user.id, other.id]);

      await expect(
        service.revokeVolunteerKeys(user.id),
      ).resolves.toBeUndefined();
    });
  });
});
