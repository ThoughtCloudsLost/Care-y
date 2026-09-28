import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as crypto from "node:crypto";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";
import {
  applyRotationInTransaction,
  createKeyRotationService,
  StaleKeyWrapsError,
  type KeyRotationInput,
  type ReWrappedKey,
} from "./key-rotation.js";
import { KeyRotationError } from "../errors.js";
import type { KeyRotationService } from "./key-rotation.js";
import type {
  UserId,
  TicketId,
  KeyGeneration,
  FollowupId,
  AliasHash,
} from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("KeyRotationService", () => {
  let testDb: TestDb;
  let service: KeyRotationService;

  beforeAll(async () => {
    testDb = await createTestDb();
    service = createKeyRotationService(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  /** Inserts a user_keys row for the given user with a random salt. */
  async function seedUserKeys(
    userId: UserId,
    overrides?: { vol_public?: Buffer | null; rotation_lock?: boolean },
  ): Promise<void> {
    const salt = crypto.randomBytes(32);
    await testDb.db
      .insertInto("user_keys")
      .values({
        user_id: userId,
        salt,
        vol_public: overrides?.vol_public ?? null,
        rotation_lock: overrides?.rotation_lock ?? false,
      })
      .execute();
  }

  /** Inserts a wrapped_org_keys row for the given user. */
  async function seedWrappedOrgKey(userId: UserId): Promise<{
    ephemeral_point: Buffer;
    nonce: Buffer;
    wrapped_key: Buffer;
  }> {
    const row = {
      user_id: userId,
      ephemeral_point: crypto.randomBytes(32),
      nonce: crypto.randomBytes(24),
      wrapped_key: crypto.randomBytes(64),
    };
    await testDb.db.insertInto("wrapped_org_keys").values(row).execute();
    return row;
  }

  /** Inserts a ticket_key_wraps row for the given volunteer. */
  async function insertWrap(
    ticketId: TicketId,
    volunteerId: UserId,
    keyGeneration: KeyGeneration,
  ): Promise<{ wrappedKey: Buffer }> {
    const wrappedKey = crypto.randomBytes(64);
    // care-y-ignore-next-line no-plaintext-db-write -- test key wrap data, not real cryptographic material
    await testDb.db
      .insertInto("ticket_key_wraps")
      .values({
        ticket_id: ticketId,
        volunteer_id: volunteerId,
        key_generation: keyGeneration,
        ephemeral_point: crypto.randomBytes(32),
        nonce: crypto.randomBytes(24),
        wrapped_key: wrappedKey,
        algorithm: "ecies-ristretto255-v1",
      })
      .execute();
    return { wrappedKey };
  }

  /** A fresh re-wrapped entry for one (ticket, key generation). */
  function newReWrap(
    ticketId: TicketId,
    keyGeneration: KeyGeneration,
  ): ReWrappedKey {
    return {
      ticketId,
      keyGeneration,
      ephemeralPoint: crypto.randomBytes(32),
      nonce: crypto.randomBytes(24),
      wrappedKey: crypto.randomBytes(64),
    };
  }

  /** Runs a rotation in its own transaction. */
  async function applyRotation(input: KeyRotationInput): Promise<void> {
    await testDb.db.transaction().execute(async (tx) => {
      await applyRotationInTransaction(tx, input);
    });
  }

  /** The volunteer's current wrap rows. */
  async function wrapsFor(volunteerId: UserId): Promise<
    {
      ticket_id: TicketId;
      key_generation: KeyGeneration;
      wrapped_key: Buffer;
    }[]
  > {
    return testDb.db
      .selectFrom("ticket_key_wraps")
      .select(["ticket_id", "key_generation", "wrapped_key"])
      .where("volunteer_id", "=", volunteerId)
      .execute();
  }

  describe("getRotationStatus", () => {
    it("returns inProgress: false when rotation_lock is false", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id);

      const status = await service.getRotationStatus(user.id);
      expect(status.inProgress).toBe(false);
    });

    it("returns inProgress: true when rotation_lock is true", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { rotation_lock: true });

      const status = await service.getRotationStatus(user.id);
      expect(status.inProgress).toBe(true);
    });

    it("returns inProgress: false for nonexistent user", async () => {
      const status = await service.getRotationStatus(
        "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee" as UserId,
      );
      expect(status.inProgress).toBe(false);
    });
  });

  describe("acquireLock", () => {
    it("sets rotation_lock to true", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id);

      await service.acquireLock(user.id);

      const row = await testDb.db
        .selectFrom("user_keys")
        .select("rotation_lock")
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(row.rotation_lock).toBe(true);
    });

    it("throws KeyRotationError when lock is already held", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id);

      await service.acquireLock(user.id);
      await expect(service.acquireLock(user.id)).rejects.toThrow(
        KeyRotationError,
      );
    });

    it("throws KeyRotationError for nonexistent user (0 rows updated)", async () => {
      await expect(
        service.acquireLock("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee" as UserId),
      ).rejects.toThrow(KeyRotationError);
    });
  });

  describe("releaseLock", () => {
    it("clears rotation_lock after it was acquired", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id);
      await service.acquireLock(user.id);

      await service.releaseLock(user.id);

      const row = await testDb.db
        .selectFrom("user_keys")
        .select("rotation_lock")
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(row.rotation_lock).toBe(false);
    });

    it("allows acquireLock to succeed after release", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id);
      await service.acquireLock(user.id);
      await service.releaseLock(user.id);

      // Should not throw
      await service.acquireLock(user.id);

      const row = await testDb.db
        .selectFrom("user_keys")
        .select("rotation_lock")
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(row.rotation_lock).toBe(true);
    });

    it("is idempotent (no error for already-unlocked user)", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id);

      // Lock is already false, release should not throw
      await expect(service.releaseLock(user.id)).resolves.toBeUndefined();
    });
  });

  describe("applyRotationInTransaction", () => {
    it("updates salt, vol_public, bumps key_version, sets rotated_at, and clears lock", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });
      await service.acquireLock(user.id);

      const saltNew = crypto.randomBytes(32);
      const volPublicNew = crypto.randomBytes(32);

      await applyRotation({
        userId: user.id,
        saltNew,
        volPublicNew,
        reWrappedKeys: [],
      });

      const row = await testDb.db
        .selectFrom("user_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(Buffer.compare(row.salt, saltNew)).toBe(0);
      expect(Buffer.compare(row.vol_public as Buffer, volPublicNew)).toBe(0);
      expect(row.key_version).toBe(2);
      expect(row.rotated_at).toBeInstanceOf(Date);
      expect(row.rotation_lock).toBe(false);
    });

    it("increments key_version on each rotation", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });

      // First rotation
      await service.acquireLock(user.id);
      await applyRotation({
        userId: user.id,
        saltNew: crypto.randomBytes(32),
        volPublicNew: crypto.randomBytes(32),
        reWrappedKeys: [],
      });

      // Second rotation
      await service.acquireLock(user.id);
      await applyRotation({
        userId: user.id,
        saltNew: crypto.randomBytes(32),
        volPublicNew: crypto.randomBytes(32),
        reWrappedKeys: [],
      });

      const row = await testDb.db
        .selectFrom("user_keys")
        .select("key_version")
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(row.key_version).toBe(3);
    });

    it("succeeds with empty reWrappedKeys when the volunteer holds no wraps", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });
      await service.acquireLock(user.id);

      await expect(
        applyRotation({
          userId: user.id,
          saltNew: crypto.randomBytes(32),
          volPublicNew: crypto.randomBytes(32),
          reWrappedKeys: [],
        }),
      ).resolves.toBeUndefined();
    });

    it("replaces the volunteer's wraps with the re-wrapped set", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });
      const fixture = await createTestTicketFixture(testDb.db);
      const keyGeneration = crypto.randomUUID() as KeyGeneration;
      await insertWrap(fixture.ticketId, user.id, keyGeneration);
      await service.acquireLock(user.id);

      const reWrap = newReWrap(fixture.ticketId, keyGeneration);
      await applyRotation({
        userId: user.id,
        saltNew: crypto.randomBytes(32),
        volPublicNew: crypto.randomBytes(32),
        reWrappedKeys: [reWrap],
      });

      const rows = await wrapsFor(user.id);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.ticket_id).toBe(fixture.ticketId);
      expect(rows[0]?.key_generation).toBe(keyGeneration);
      expect(
        Buffer.compare(
          rows[0]?.wrapped_key ?? Buffer.alloc(0),
          reWrap.wrappedKey,
        ),
      ).toBe(0);
    });

    it("drops a re-wrap for a deleted ticket and commits the rest", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });
      const kept = await createTestTicketFixture(testDb.db);
      const deleted = await createTestTicketFixture(testDb.db);
      const keptGen = crypto.randomUUID() as KeyGeneration;
      const deletedGen = crypto.randomUUID() as KeyGeneration;
      await insertWrap(kept.ticketId, user.id, keptGen);
      await insertWrap(deleted.ticketId, user.id, deletedGen);

      // The client fetched both wraps; the second ticket is deleted
      // (cascading its wrap) before the rotation lands.
      await testDb.db
        .deleteFrom("tickets")
        .where("id", "=", deleted.ticketId)
        .execute();
      await service.acquireLock(user.id);

      await applyRotation({
        userId: user.id,
        saltNew: crypto.randomBytes(32),
        volPublicNew: crypto.randomBytes(32),
        reWrappedKeys: [
          newReWrap(kept.ticketId, keptGen),
          newReWrap(deleted.ticketId, deletedGen),
        ],
      });

      const rows = await wrapsFor(user.id);
      expect(rows.map((r) => r.ticket_id)).toEqual([kept.ticketId]);

      const keys = await testDb.db
        .selectFrom("user_keys")
        .select(["key_version", "rotation_lock"])
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();
      expect(keys.key_version).toBe(2);
      expect(keys.rotation_lock).toBe(false);
    });

    it("refuses with StaleKeyWrapsError when a held wrap is missing and changes nothing", async () => {
      const user = await createTestUser(testDb.db);
      const oldPublic = crypto.randomBytes(32);
      await seedUserKeys(user.id, { vol_public: oldPublic });
      const originalOrgWrap = await seedWrappedOrgKey(user.id);
      const known = await createTestTicketFixture(testDb.db);
      const granted = await createTestTicketFixture(testDb.db);
      const knownGen = crypto.randomUUID() as KeyGeneration;
      const grantedGen = crypto.randomUUID() as KeyGeneration;
      const knownWrap = await insertWrap(known.ticketId, user.id, knownGen);
      // Granted after the client fetched its list: not in the re-wrap set.
      await insertWrap(granted.ticketId, user.id, grantedGen);

      const before = await testDb.db
        .selectFrom("user_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      await expect(
        applyRotation({
          userId: user.id,
          saltNew: crypto.randomBytes(32),
          volPublicNew: crypto.randomBytes(32),
          reWrappedKeys: [newReWrap(known.ticketId, knownGen)],
          reWrappedOrgKey: {
            ephemeralPoint: crypto.randomBytes(32),
            nonce: crypto.randomBytes(24),
            wrappedKey: crypto.randomBytes(64),
          },
        }),
      ).rejects.toThrow(StaleKeyWrapsError);

      const after = await testDb.db
        .selectFrom("user_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();
      expect(Buffer.compare(after.salt, before.salt)).toBe(0);
      expect(Buffer.compare(after.vol_public as Buffer, oldPublic)).toBe(0);
      expect(after.key_version).toBe(before.key_version);

      const rows = await wrapsFor(user.id);
      expect(rows).toHaveLength(2);
      const knownRow = rows.find((r) => r.ticket_id === known.ticketId);
      expect(
        Buffer.compare(
          knownRow?.wrapped_key ?? Buffer.alloc(0),
          knownWrap.wrappedKey,
        ),
      ).toBe(0);

      const orgWrap = await testDb.db
        .selectFrom("wrapped_org_keys")
        .select("wrapped_key")
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();
      expect(
        Buffer.compare(orgWrap.wrapped_key, originalOrgWrap.wrapped_key),
      ).toBe(0);
    });

    it("releases the lock inside the transaction (lock is false after applyRotation)", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });
      await service.acquireLock(user.id);

      await applyRotation({
        userId: user.id,
        saltNew: crypto.randomBytes(32),
        volPublicNew: crypto.randomBytes(32),
        reWrappedKeys: [],
      });

      // Lock should be false without needing a separate releaseLock call
      const status = await service.getRotationStatus(user.id);
      expect(status.inProgress).toBe(false);

      // And acquireLock should succeed again (proves lock was fully released)
      await expect(service.acquireLock(user.id)).resolves.toBeUndefined();
    });

    it("updates wrapped_org_keys when reWrappedOrgKey is provided", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });
      await seedWrappedOrgKey(user.id);
      await service.acquireLock(user.id);

      const newOrgWrap = {
        ephemeralPoint: crypto.randomBytes(32),
        nonce: crypto.randomBytes(24),
        wrappedKey: crypto.randomBytes(64),
      };

      await applyRotation({
        userId: user.id,
        saltNew: crypto.randomBytes(32),
        volPublicNew: crypto.randomBytes(32),
        reWrappedKeys: [],
        reWrappedOrgKey: newOrgWrap,
      });

      const row = await testDb.db
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(
        Buffer.compare(row.ephemeral_point, newOrgWrap.ephemeralPoint),
      ).toBe(0);
      expect(Buffer.compare(row.nonce, newOrgWrap.nonce)).toBe(0);
      expect(Buffer.compare(row.wrapped_key, newOrgWrap.wrappedKey)).toBe(0);
    });

    it("skips wrapped_org_keys update when reWrappedOrgKey is undefined", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });
      const originalOrgWrap = await seedWrappedOrgKey(user.id);
      await service.acquireLock(user.id);

      await applyRotation({
        userId: user.id,
        saltNew: crypto.randomBytes(32),
        volPublicNew: crypto.randomBytes(32),
        reWrappedKeys: [],
      });

      const row = await testDb.db
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirstOrThrow();

      expect(
        Buffer.compare(row.ephemeral_point, originalOrgWrap.ephemeral_point),
      ).toBe(0);
      expect(Buffer.compare(row.nonce, originalOrgWrap.nonce)).toBe(0);
      expect(Buffer.compare(row.wrapped_key, originalOrgWrap.wrapped_key)).toBe(
        0,
      );
    });
  });

  describe("pending org-key wraps", () => {
    /** Inserts a ticket with its own client; returns the ticket id. */
    async function seedTicket(label: string): Promise<TicketId> {
      const q = await createTestQueue(testDb.db, { label });
      const clientAlias = `${label}-${crypto.randomUUID().slice(0, 8)}`;
      const client = await testDb.db
        .insertInto("clients")
        .values({
          encrypted_alias: Buffer.from(clientAlias),
          alias_hash: clientAlias as AliasHash,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      const ticketId = crypto.randomUUID() as TicketId;
      await testDb.db
        .insertInto("tickets")
        .values({
          id: ticketId,
          client_id: client.id,
          queue_id: q.id,
          status: "open",
          priority: "normal",
          encrypted_title: Buffer.from("ct-title"),
          encrypted_description: Buffer.from("ct-desc"),
          key_generation: crypto.randomUUID() as KeyGeneration,
        })
        .execute();
      return ticketId;
    }

    it("a pending intake_key_wraps row does not block rotation", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });
      await seedWrappedOrgKey(user.id);

      const ticketId = await seedTicket("intake-pending");
      await testDb.db
        .insertInto("intake_key_wraps")
        .values({
          ticket_id: ticketId,
          wrapped_tk: Buffer.alloc(80, 0xab),
        })
        .execute();

      await service.acquireLock(user.id);
      await expect(
        applyRotation({
          userId: user.id,
          saltNew: crypto.randomBytes(32),
          volPublicNew: crypto.randomBytes(32),
          reWrappedKeys: [],
        }),
      ).resolves.toBeUndefined();

      // The org-key wrap is untouched by a volunteer rotation.
      const intake = await testDb.db
        .selectFrom("intake_key_wraps")
        .select("ticket_id")
        .where("ticket_id", "=", ticketId)
        .executeTakeFirst();
      expect(intake?.ticket_id).toBe(ticketId);

      await testDb.db
        .deleteFrom("intake_key_wraps")
        .where("ticket_id", "=", ticketId)
        .execute();
    });

    it("a pending portal_reply_key_wraps row does not block rotation", async () => {
      const user = await createTestUser(testDb.db);
      await seedUserKeys(user.id, { vol_public: crypto.randomBytes(32) });
      await seedWrappedOrgKey(user.id);

      const ticketId = await seedTicket("portal-pending");
      const followupId = crypto.randomUUID() as FollowupId;
      await testDb.db
        .insertInto("followups")
        .values({
          id: followupId,
          ticket_id: ticketId,
          source: "client",
          type: "message",
          encrypted_content: Buffer.from("ct-content"),
          created_by: null,
          key_generation: crypto.randomUUID() as KeyGeneration,
        })
        .execute();
      await testDb.db
        .insertInto("portal_reply_key_wraps")
        .values({
          followup_id: followupId,
          wrapped_tk: Buffer.alloc(80, 0xcd),
        })
        .execute();

      await service.acquireLock(user.id);
      await expect(
        applyRotation({
          userId: user.id,
          saltNew: crypto.randomBytes(32),
          volPublicNew: crypto.randomBytes(32),
          reWrappedKeys: [],
        }),
      ).resolves.toBeUndefined();

      await testDb.db
        .deleteFrom("portal_reply_key_wraps")
        .where("followup_id", "=", followupId)
        .execute();
    });
  });
});
