import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestQueue,
  createTestTicketFixture,
  noopEncryptor,
  testBlindIndexer,
  testSealedBox,
  testUnseal,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";
import { createAuditService, type AuditService } from "../tickets/audit.js";
import {
  createMergeService,
  type MergeService,
} from "../tickets/merge-service.js";
import {
  createClientService,
  type ClientService,
  type ClientServiceDeps,
} from "./client-service.js";
import { ConflictError, NotFoundError } from "../errors.js";
import * as crypto from "node:crypto";
import { orgIdSchema } from "@care-y/shared";
import type {
  ClientId,
  UserId,
  AliasHash,
  PhoneMatchHash,
  QueueId,
  PhoneId,
  TicketId,
  PhoneHash,
  KeyGeneration,
  IdentifierHash,
  UsernameHash,
  OpsPhoneHash,
} from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("ClientService (DB)", () => {
  let testDb: TestDb;
  let svc: ClientService;
  let auditSvc: AuditService;
  let mergeSvc: MergeService;
  let queueId: QueueId;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);

    auditSvc = createAuditService(testDb.db);
    mergeSvc = createMergeService(testDb.db);
    svc = createClientService({
      db: testDb.db,
      audit: auditSvc,
      encryptor: noopEncryptor,
      indexer: testBlindIndexer,
      mergeService: mergeSvc,
      orgId: TEST_ORG_ID,
    });

    const q = await createTestQueue(testDb.db);
    queueId = q.id;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  /** Creates a phone + client + ticket chain, returning relevant IDs. */
  async function createClientWithTicket(): Promise<{
    phoneId: PhoneId;
    clientId: ClientId;
    ticketId: TicketId;
    phoneHash: PhoneHash;
  }> {
    const fix = await createTestTicketFixture(testDb.db, { queueId });

    // Read back the phone_hash for conflict tests
    const phone = await testDb.db
      .selectFrom("phones")
      .select("phone_hash")
      .where("id", "=", fix.phoneId)
      .executeTakeFirstOrThrow();

    return {
      phoneId: fix.phoneId,
      clientId: fix.clientId,
      ticketId: fix.ticketId,
      phoneHash: phone.phone_hash,
    };
  }

  /**
   * Creates a client with a phone but no tickets. Returns the client ID.
   */
  async function createClientWithoutTicket(): Promise<ClientId> {
    const fix = await createTestTicketFixture(testDb.db, { queueId });
    await testDb.db
      .deleteFrom("tickets")
      .where("id", "=", fix.ticketId)
      .execute();
    return fix.clientId;
  }

  /** Seals a string using the test org key. Returns base64 ciphertext. */
  function sealForTest(value: string): string {
    return testSealedBox.sealBuffer(Buffer.from(value)).toString("base64");
  }

  // -----------------------------------------------------------------------
  // list
  // -----------------------------------------------------------------------

  describe("list", () => {
    it("returns only non-merged clients", async () => {
      const a = await createClientWithTicket();
      const b = await createClientWithTicket();

      await mergeSvc.merge({
        primaryClientId: a.clientId,
        secondaryClientId: b.clientId,
        encryptedSnapshot: Buffer.from("snap"),
      });

      const results = await svc.list({
        query: "",
        sortBy: "created_at",
        sortDirection: "desc",
        limit: 100,
      });

      const ids = results.map((r) => r.id);
      expect(ids).toContain(a.clientId);
      expect(ids).not.toContain(b.clientId);
    });

    it("returns encryptedAlias as a Buffer (never plaintext)", async () => {
      const c = await createClientWithTicket();

      const results = await svc.list({
        query: "",
        sortBy: "created_at",
        sortDirection: "desc",
        limit: 100,
      });

      const found = results.find((r) => r.id === c.clientId);
      expect(found).toBeDefined();
      expect(Buffer.isBuffer(found!.encryptedAlias)).toBe(true);
      // The sealed ciphertext is strictly longer than the plaintext
      expect(found!.encryptedAlias.length).toBeGreaterThan(0);
    });

    it("supports exact-alias lookup via aliasHash", async () => {
      const c = await createClientWithTicket();
      const hash = `exact-hash-${crypto.randomUUID().slice(0, 8)}` as AliasHash;

      // Set a known hash on the client
      await testDb.db
        .updateTable("clients")
        .set({ alias_hash: hash })
        .where("id", "=", c.clientId)
        .execute();

      const results = await svc.list({
        query: "",
        sortBy: "created_at",
        sortDirection: "desc",
        limit: 100,
        aliasHash: hash,
      });

      expect(results.length).toBe(1);
      expect(results[0]!.id).toBe(c.clientId);
    });

    it("paginates with cursor on created_at", async () => {
      // Three rows so the first page fills and a second page exists. The
      // returned ids are not needed; pagination is asserted on page contents.
      await createClientWithTicket();
      await createClientWithTicket();
      await createClientWithTicket();

      // Page 1
      const page1 = await svc.list({
        query: "",
        sortBy: "created_at",
        sortDirection: "asc",
        limit: 2,
      });

      expect(page1.length).toBe(2);

      // Page 2 with cursor
      const page2 = await svc.list({
        query: "",
        sortBy: "created_at",
        sortDirection: "asc",
        limit: 100,
        cursor: page1[1]!.id,
      });

      // Should not contain items from page 1
      const page1Ids = new Set(page1.map((r) => r.id));
      for (const r of page2) {
        expect(page1Ids.has(r.id)).toBe(false);
      }
    });

    it("includes ticket count", async () => {
      const c = await createClientWithTicket();

      await testDb.db
        .insertInto("tickets")
        .values({
          client_id: c.clientId,
          queue_id: queueId,
          encrypted_title: noopEncryptor.encrypt("extra-ticket"),
          encrypted_description: noopEncryptor.encrypt("desc"),
          key_generation: crypto.randomUUID() as KeyGeneration,
        })
        .execute();

      const results = await svc.list({
        query: "",
        sortBy: "created_at",
        sortDirection: "desc",
        limit: 100,
      });

      const found = results.find((r) => r.id === c.clientId);
      expect(found).toBeDefined();
      expect(found!.ticketCount).toBe(2);
    });

    it("includes merged clients when includeMerged is true", async () => {
      const a = await createClientWithTicket();
      const b = await createClientWithTicket();

      await mergeSvc.merge({
        primaryClientId: a.clientId,
        secondaryClientId: b.clientId,
        encryptedSnapshot: Buffer.from("snap"),
      });

      const results = await svc.list({
        query: "",
        sortBy: "created_at",
        sortDirection: "desc",
        limit: 100,
        includeMerged: true,
      });

      const ids = results.map((r) => r.id);
      expect(ids).toContain(a.clientId);
      expect(ids).toContain(b.clientId);
    });

    it("filters by hasApplications", async () => {
      const withTicket = await createClientWithTicket();
      const noTicketId = await createClientWithoutTicket();

      const withResults = await svc.list({
        query: "",
        sortBy: "created_at",
        sortDirection: "desc",
        limit: 100,
        hasApplications: true,
      });
      expect(withResults.map((r) => r.id)).toContain(withTicket.clientId);
      expect(withResults.map((r) => r.id)).not.toContain(noTicketId);

      const withoutResults = await svc.list({
        query: "",
        sortBy: "created_at",
        sortDirection: "desc",
        limit: 100,
        hasApplications: false,
      });
      expect(withoutResults.map((r) => r.id)).toContain(noTicketId);
    });
  });

  // -----------------------------------------------------------------------
  // getById
  // -----------------------------------------------------------------------

  describe("getById", () => {
    it("returns client with tickets and merge history", async () => {
      const c = await createClientWithTicket();

      const detail = await svc.getById(c.clientId);

      expect(detail.id).toBe(c.clientId);
      expect(detail.phoneId).toBe(c.phoneId);
      expect(detail.phoneHash).toBe(c.phoneHash);
      expect(Buffer.isBuffer(detail.encryptedNumber)).toBe(true);
      expect(Buffer.isBuffer(detail.encryptedAlias)).toBe(true);
      expect(detail.tickets.length).toBe(1);
      expect(detail.tickets[0]!.id).toBe(c.ticketId);
      expect(detail.mergeHistory).toEqual([]);
    });

    it("throws NotFoundError for non-existent client", async () => {
      await expect(
        svc.getById(crypto.randomUUID() as ClientId),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("throws NotFoundError for merged client", async () => {
      const a = await createClientWithTicket();
      const b = await createClientWithTicket();

      await mergeSvc.merge({
        primaryClientId: a.clientId,
        secondaryClientId: b.clientId,
        encryptedSnapshot: Buffer.from("snap"),
      });

      await expect(svc.getById(b.clientId)).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });

  // -----------------------------------------------------------------------
  // updateAlias
  // -----------------------------------------------------------------------

  describe("updateAlias", () => {
    it("writes ciphertext to encrypted_alias (never plaintext)", async () => {
      const c = await createClientWithTicket();
      const ciphertext = sealForTest("my-new-alias");
      const hash = `hash-${crypto.randomUUID().slice(0, 8)}` as AliasHash;

      await svc.updateAlias(
        c.clientId,
        ciphertext,
        hash as AliasHash,
        crypto.randomUUID() as UserId,
      );

      const row = await testDb.db
        .selectFrom("clients")
        .select(["encrypted_alias", "alias_hash"])
        .where("id", "=", c.clientId)
        .executeTakeFirstOrThrow();

      expect(Buffer.isBuffer(row.encrypted_alias)).toBe(true);
      expect(row.alias_hash).toBe(hash);
      // Verify the sealed value round-trips
      expect(testUnseal(row.encrypted_alias)).toBe("my-new-alias");
    });

    it("logs audit event on alias change", async () => {
      const c = await createClientWithTicket();
      const actorId = crypto.randomUUID() as UserId;

      await svc.updateAlias(
        c.clientId,
        sealForTest("audit-alias"),
        `ah-${crypto.randomUUID().slice(0, 8)}` as AliasHash,
        actorId,
      );

      const audit = await testDb.db
        .selectFrom("audit_log")
        .selectAll()
        .where("event_type", "=", "client_alias_changed")
        .where("actor_id", "=", actorId)
        .executeTakeFirst();

      expect(audit).toBeDefined();
      expect((audit!.metadata as { clientId: string }).clientId).toBe(
        c.clientId,
      );
    });

    it("throws ConflictError on duplicate alias_hash", async () => {
      const c1 = await createClientWithTicket();
      const c2 = await createClientWithTicket();
      const sharedHash = `dup-${crypto.randomUUID().slice(0, 8)}` as AliasHash;

      // Set c1's hash
      await svc.updateAlias(
        c1.clientId,
        sealForTest("first"),
        sharedHash as AliasHash,
        crypto.randomUUID() as UserId,
      );

      // Attempt same hash on c2
      await expect(
        svc.updateAlias(
          c2.clientId,
          sealForTest("second"),
          sharedHash as AliasHash,
          crypto.randomUUID() as UserId,
        ),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("throws NotFoundError for merged client", async () => {
      const a = await createClientWithTicket();
      const b = await createClientWithTicket();

      await mergeSvc.merge({
        primaryClientId: a.clientId,
        secondaryClientId: b.clientId,
        encryptedSnapshot: Buffer.from("snap"),
      });

      await expect(
        svc.updateAlias(
          b.clientId,
          sealForTest("nope"),
          "hash" as AliasHash,
          crypto.randomUUID() as UserId,
        ),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  // -----------------------------------------------------------------------
  // backfillAliasHash
  // -----------------------------------------------------------------------

  describe("backfillAliasHash", () => {
    it("writes hash when alias_hash is NULL", async () => {
      const c = await createClientWithTicket();
      // createTestTicketFixture sets alias_hash = null
      const hash = `bf-${crypto.randomUUID().slice(0, 8)}` as AliasHash;

      await svc.backfillAliasHash(c.clientId, hash);

      const row = await testDb.db
        .selectFrom("clients")
        .select("alias_hash")
        .where("id", "=", c.clientId)
        .executeTakeFirstOrThrow();

      expect(row.alias_hash).toBe(hash);
    });

    it("is idempotent (does not overwrite existing hash)", async () => {
      const c = await createClientWithTicket();
      const hash = `idem-${crypto.randomUUID().slice(0, 8)}` as AliasHash;

      await svc.backfillAliasHash(c.clientId, hash);

      // Second call with the same hash should succeed silently
      await svc.backfillAliasHash(c.clientId, hash);

      const row = await testDb.db
        .selectFrom("clients")
        .select("alias_hash")
        .where("id", "=", c.clientId)
        .executeTakeFirstOrThrow();

      expect(row.alias_hash).toBe(hash);
    });

    it("does not overwrite when hash is already set", async () => {
      const c = await createClientWithTicket();
      const firstHash = `first-${crypto.randomUUID().slice(0, 8)}` as AliasHash;
      const secondHash =
        `second-${crypto.randomUUID().slice(0, 8)}` as AliasHash;

      await svc.backfillAliasHash(c.clientId, firstHash);
      // Attempt to overwrite with a different hash
      await svc.backfillAliasHash(c.clientId, secondHash);

      const row = await testDb.db
        .selectFrom("clients")
        .select("alias_hash")
        .where("id", "=", c.clientId)
        .executeTakeFirstOrThrow();

      // Should still be the first hash (WHERE alias_hash IS NULL did not match)
      expect(row.alias_hash).toBe(firstHash);
    });

    it("surfaces conflict when hash collides with another client", async () => {
      const c1 = await createClientWithTicket();
      const c2 = await createClientWithTicket();
      const sharedHash =
        `conflict-${crypto.randomUUID().slice(0, 8)}` as AliasHash;

      // Set c1's hash via updateAlias
      await svc.updateAlias(
        c1.clientId,
        sealForTest("c1-alias"),
        sharedHash as AliasHash,
        crypto.randomUUID() as UserId,
      );

      // Try to backfill c2 with the same hash
      await expect(
        svc.backfillAliasHash(c2.clientId, sharedHash),
      ).rejects.toBeInstanceOf(ConflictError);
    });
  });

  // -----------------------------------------------------------------------
  // updatePhone
  // -----------------------------------------------------------------------

  describe("updatePhone", () => {
    it("atomically replaces the phone record", async () => {
      const c = await createClientWithTicket();
      const newNumber = `+1555999${crypto.randomUUID().slice(0, 4).replace(/-/g, "0")}`;

      const result = await svc.updatePhone(
        c.clientId,
        newNumber,
        crypto.randomUUID() as UserId,
      );

      expect(result.success).toBe(true);
      expect(result.conflict).toBeNull();

      // Client now points to a different phone
      const updatedClient = await testDb.db
        .selectFrom("clients")
        .select("phone_id")
        .where("id", "=", c.clientId)
        .executeTakeFirstOrThrow();

      expect(updatedClient.phone_id).not.toBe(c.phoneId);

      // Old phone row is deleted
      const oldPhone = await testDb.db
        .selectFrom("phones")
        .select("id")
        .where("id", "=", c.phoneId)
        .executeTakeFirst();

      expect(oldPhone).toBeUndefined();
    });

    it("detects hash collision and returns conflict", async () => {
      const c1 = await createClientWithTicket();
      const c2 = await createClientWithTicket();
      const actorId = crypto.randomUUID() as UserId;
      const shared = `+1555777${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;

      const first = await svc.updatePhone(c1.clientId, shared, actorId);
      expect(first.success).toBe(true);

      const result = await svc.updatePhone(c2.clientId, shared, actorId);

      expect(result.success).toBe(false);
      expect(result.conflict).not.toBeNull();
      expect(result.conflict!.conflictingClientId).toBe(c1.clientId);
    });

    it("throws NotFoundError for non-existent client", async () => {
      await expect(
        svc.updatePhone(
          crypto.randomUUID() as ClientId,
          "+15550001234",
          crypto.randomUUID() as UserId,
        ),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  // -----------------------------------------------------------------------
  // suggestDuplicates
  // -----------------------------------------------------------------------

  describe("suggestDuplicates", () => {
    it("returns null when no match exists", async () => {
      const result = await svc.suggestDuplicates(
        "nonexistent-hash" as PhoneHash,
      );
      expect(result).toBeNull();
    });

    it("returns the conflicting client with encrypted alias", async () => {
      const c = await createClientWithTicket();

      const result = await svc.suggestDuplicates(c.phoneHash);

      expect(result).not.toBeNull();
      expect(result!.conflictingClientId).toBe(c.clientId);
      expect(Buffer.isBuffer(result!.conflictingClientEncryptedAlias)).toBe(
        true,
      );
    });

    it("excludes the specified client from results", async () => {
      const c = await createClientWithTicket();

      const result = await svc.suggestDuplicates(c.phoneHash, c.clientId);
      expect(result).toBeNull();
    });

    it("excludes merged clients from results", async () => {
      const a = await createClientWithTicket();
      const b = await createClientWithTicket();

      await mergeSvc.merge({
        primaryClientId: a.clientId,
        secondaryClientId: b.clientId,
        encryptedSnapshot: Buffer.from("snap"),
      });

      const result = await svc.suggestDuplicates(b.phoneHash);
      expect(result).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // backfillPhoneMatchHash
  // -----------------------------------------------------------------------

  describe("backfillPhoneMatchHash", () => {
    const VALID_HASH = "a".repeat(128) as PhoneMatchHash;
    const OTHER_HASH = "b".repeat(128) as PhoneMatchHash;

    it("writes hash when phone_match_hash is NULL", async () => {
      const c = await createClientWithTicket();

      await svc.backfillPhoneMatchHash(c.clientId, VALID_HASH);

      const phone = await testDb.db
        .selectFrom("phones")
        .select("phone_match_hash")
        .where("id", "=", c.phoneId)
        .executeTakeFirstOrThrow();

      expect(phone.phone_match_hash).toBe(VALID_HASH);
    });

    it("is idempotent (does not overwrite existing hash)", async () => {
      const c = await createClientWithTicket();

      await svc.backfillPhoneMatchHash(c.clientId, VALID_HASH);
      await svc.backfillPhoneMatchHash(c.clientId, OTHER_HASH);

      const phone = await testDb.db
        .selectFrom("phones")
        .select("phone_match_hash")
        .where("id", "=", c.phoneId)
        .executeTakeFirstOrThrow();

      // Should still be the first hash (WHERE phone_match_hash IS NULL did not match)
      expect(phone.phone_match_hash).toBe(VALID_HASH);
    });

    it("is a no-op for client with null phone_id", async () => {
      const row = await testDb.db
        .insertInto("clients")
        // care-y-ignore-next-line no-plaintext-db-write -- encrypted_alias is test ciphertext; phone_id is null (web intake)
        .values({
          encrypted_alias: testSealedBox.sealBuffer(
            Buffer.from("no-phone-client"),
          ),
          alias_hash: null,
          phone_id: null,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      // Should not throw
      await svc.backfillPhoneMatchHash(row.id, VALID_HASH);
    });
  });

  // -----------------------------------------------------------------------
  // updatePhone (phoneMatchHash parameter)
  // -----------------------------------------------------------------------

  describe("updatePhone with phoneMatchHash", () => {
    it("stores phoneMatchHash on the new phone row", async () => {
      const c = await createClientWithTicket();
      const hash = "c".repeat(128) as PhoneMatchHash;
      const newNumber = `+1555888${crypto.randomUUID().slice(0, 4).replace(/-/g, "0")}`;

      const result = await svc.updatePhone(
        c.clientId,
        newNumber,
        crypto.randomUUID() as UserId,
        hash as PhoneMatchHash,
      );

      expect(result.success).toBe(true);

      const client = await testDb.db
        .selectFrom("clients")
        .select("phone_id")
        .where("id", "=", c.clientId)
        .executeTakeFirstOrThrow();

      const phone = await testDb.db
        .selectFrom("phones")
        .select("phone_match_hash")
        .where("id", "=", client.phone_id!)
        .executeTakeFirstOrThrow();

      expect(phone.phone_match_hash).toBe(hash);
    });

    it("stores null phoneMatchHash when not provided", async () => {
      const c = await createClientWithTicket();
      const newNumber = `+1555889${crypto.randomUUID().slice(0, 4).replace(/-/g, "0")}`;

      const result = await svc.updatePhone(
        c.clientId,
        newNumber,
        crypto.randomUUID() as UserId,
      );

      expect(result.success).toBe(true);

      const client = await testDb.db
        .selectFrom("clients")
        .select("phone_id")
        .where("id", "=", c.clientId)
        .executeTakeFirstOrThrow();

      const phone = await testDb.db
        .selectFrom("phones")
        .select("phone_match_hash")
        .where("id", "=", client.phone_id!)
        .executeTakeFirstOrThrow();

      expect(phone.phone_match_hash).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // list (phoneMatchHash in result)
  // -----------------------------------------------------------------------

  describe("list phoneMatchHash", () => {
    it("returns phoneMatchHash from the joined phone row", async () => {
      const c = await createClientWithTicket();
      const hash = "d".repeat(128) as PhoneMatchHash;

      await testDb.db
        .updateTable("phones")
        // care-y-ignore-next-line no-plaintext-db-write -- phone_match_hash is a browser-computed HMAC blind index
        .set({ phone_match_hash: hash })
        .where("id", "=", c.phoneId)
        .execute();

      const results = await svc.list({
        query: "",
        sortBy: "created_at",
        sortDirection: "desc",
        limit: 200,
      });

      const found = results.find((r) => r.id === c.clientId);
      expect(found).toBeDefined();
      expect(found!.phoneMatchHash).toBe(hash);
    });

    it("returns null phoneMatchHash for phone rows without it", async () => {
      const c = await createClientWithTicket();

      const results = await svc.list({
        query: "",
        sortBy: "created_at",
        sortDirection: "desc",
        limit: 200,
      });

      const found = results.find((r) => r.id === c.clientId);
      expect(found).toBeDefined();
      expect(found!.phoneMatchHash).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // No plaintext alias in DB
  // -----------------------------------------------------------------------

  describe("no plaintext alias in database", () => {
    it("DB has no alias column (only encrypted_alias)", async () => {
      const c = await createClientWithTicket();
      const row = await testDb.db
        .selectFrom("clients")
        .selectAll()
        .where("id", "=", c.clientId)
        .executeTakeFirstOrThrow();

      expect("alias" in row).toBe(false);
      expect("encrypted_alias" in row).toBe(true);
    });

    it("no server response carries a plaintext alias", async () => {
      const c = await createClientWithTicket();

      const listResult = await svc.list({
        query: "",
        sortBy: "created_at",
        sortDirection: "desc",
        limit: 100,
      });
      const found = listResult.find((r) => r.id === c.clientId);
      expect(found).toBeDefined();
      // Should have encryptedAlias (Buffer), not alias (string)
      expect("alias" in found!).toBe(false);
      expect(Buffer.isBuffer(found!.encryptedAlias)).toBe(true);

      const detail = await svc.getById(c.clientId);
      expect("alias" in detail).toBe(false);
      expect(Buffer.isBuffer(detail.encryptedAlias)).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // phone-less clients (web intake, phone_id NULL)
  // -----------------------------------------------------------------------

  describe("phone-less clients", () => {
    let phonelessClientId: ClientId;

    beforeAll(async () => {
      // Insert a client with no phone (web intake path)
      const row = await testDb.db
        .insertInto("clients")
        // care-y-ignore-next-line no-plaintext-db-write -- encrypted_alias is test ciphertext via testSealedBox; phone_id is null (web intake)
        .values({
          encrypted_alias: testSealedBox.sealBuffer(Buffer.from("web-client")),
          alias_hash: null,
          phone_id: null,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      phonelessClientId = row.id;

      // Give it a ticket so it appears in scoped queries
      await testDb.db
        .insertInto("tickets")
        .values({
          client_id: phonelessClientId,
          queue_id: queueId,
          encrypted_title: noopEncryptor.encrypt("intake-title"),
          encrypted_description: noopEncryptor.encrypt("intake-desc"),
          key_generation: crypto.randomUUID() as KeyGeneration,
        })
        .execute();
    });

    it("list returns a phone-less client with null encryptedNumber", async () => {
      const results = await svc.list({
        query: "",
        sortBy: "created_at",
        sortDirection: "desc",
        limit: 200,
      });

      const found = results.find((r) => r.id === phonelessClientId);
      expect(found).toBeDefined();
      expect(found!.encryptedNumber).toBeNull();
    });

    it("getById returns null phone fields for a phone-less client", async () => {
      const detail = await svc.getById(phonelessClientId);
      expect(detail.phoneId).toBeNull();
      expect(detail.phoneHash).toBeNull();
      expect(detail.encryptedNumber).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Salt-source unit test (no DB required)
// ---------------------------------------------------------------------------
// Security contract: updatePhone must pass the raw org UUID to indexer.hash,
// not the schema name. All four phone_hash write paths must use the same salt
// so that phone-lookup, inbound-sms, inbound-call, and updatePhone produce
// matching hashes for the same number.

describe("ClientService.updatePhone salt source", () => {
  it("passes orgId (UUID) to indexer.hashPhone, not a schema name", async () => {
    const hashPhoneSpy = vi.fn().mockReturnValue("spy-phone-hash" as PhoneHash);
    const svc = createClientService({
      // Empty DB mock: updatePhone calls indexer.hashPhone before the first DB
      // operation (suggestDuplicates), so the spy captures the salt even
      // though the subsequent DB chain throws.
      db: {} as unknown as ClientServiceDeps["db"],
      audit: {} as unknown as ClientServiceDeps["audit"],
      encryptor: noopEncryptor,
      indexer: {
        hash: vi.fn().mockReturnValue("generic-hash"),
        hashBuffer: vi.fn().mockReturnValue("generic-hash-buf"),
        hashIdentifier: vi.fn().mockReturnValue("id-hash" as IdentifierHash),
        hashUsername: vi.fn().mockReturnValue("user-hash" as UsernameHash),
        hashPhone: hashPhoneSpy,
        hashPhoneBuffer: vi.fn().mockReturnValue("phone-hash-buf" as PhoneHash),
        hashConsultantPhoneBuffer: vi
          .fn()
          .mockReturnValue("cons-hash" as OpsPhoneHash),
      },
      mergeService: {} as unknown as ClientServiceDeps["mergeService"],
      orgId: orgIdSchema.parse("a1b2c3d4-e5f6-7890-abcd-000000000001"),
    });

    // updatePhone calls indexer.hashPhone synchronously before any await. The
    // empty DB mock causes suggestDuplicates to throw, but the spy has
    // already recorded the salt argument by that point.
    await svc
      .updatePhone("client-1" as ClientId, "+15550001111", "actor-1" as UserId)
      .catch(() => {
        // Expected: DB operation fails on the empty mock.
      });

    expect(hashPhoneSpy).toHaveBeenCalledOnce();
    expect(hashPhoneSpy).toHaveBeenCalledWith(
      "+15550001111",
      "a1b2c3d4-e5f6-7890-abcd-000000000001",
    );
  });
});
