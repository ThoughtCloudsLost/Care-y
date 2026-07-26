import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestQueue,
  createTestTicketFixture,
  noopEncryptor,
  testBlindIndexer,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";
import { createAuditService, type AuditService } from "../tickets/audit.js";
import {
  createMergeService,
  type MergeService,
} from "../tickets/merge-service.js";
import { createClientService, type ClientService } from "./client-service.js";
import { ConflictError, NotFoundError } from "../errors.js";
import * as crypto from "node:crypto";

describe.skipIf(!process.env.DATABASE_URL)("ClientService (DB)", () => {
  let testDb: TestDb;
  let svc: ClientService;
  let auditSvc: AuditService;
  let mergeSvc: MergeService;
  let queueId: string;

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
  async function createClientWithTicket(aliasOverride?: string): Promise<{
    phoneId: string;
    clientId: string;
    ticketId: string;
    phoneHash: string;
  }> {
    const fix = await createTestTicketFixture(testDb.db, { queueId });

    // If alias override is requested, update it directly
    if (aliasOverride) {
      await testDb.db
        .updateTable("clients")
        .set({ alias: aliasOverride })
        .where("id", "=", fix.clientId)
        .execute();
    }

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

  // -----------------------------------------------------------------------
  // list
  // -----------------------------------------------------------------------

  describe("list", () => {
    it("returns only non-merged clients", async () => {
      const a = await createClientWithTicket();
      const b = await createClientWithTicket();

      // Merge b into a
      await mergeSvc.merge({
        primaryClientId: a.clientId,
        secondaryClientId: b.clientId,
        encryptedSnapshot: Buffer.from("snap"),
      });

      const results = await svc.list({
        query: "",
        sortBy: "alias",
        sortDirection: "asc",
        limit: 100,
      });

      const ids = results.map((r) => r.id);
      expect(ids).toContain(a.clientId);
      expect(ids).not.toContain(b.clientId);
    });

    it("filters by alias search query", async () => {
      const uniquePrefix = `srch-${crypto.randomUUID().slice(0, 6)}`;
      const a = await createClientWithTicket(`${uniquePrefix}-target`);
      await createClientWithTicket(`other-${crypto.randomUUID().slice(0, 6)}`);

      const results = await svc.list({
        query: uniquePrefix,
        sortBy: "alias",
        sortDirection: "asc",
        limit: 100,
      });

      expect(results.length).toBe(1);
      expect(results[0]!.id).toBe(a.clientId);
    });

    it("paginates with cursor", async () => {
      // Create 3 clients with known aliases for predictable sort order
      const prefix = `pg-${crypto.randomUUID().slice(0, 4)}`;
      const c1 = await createClientWithTicket(`${prefix}-aaa`);
      const c2 = await createClientWithTicket(`${prefix}-bbb`);
      const c3 = await createClientWithTicket(`${prefix}-ccc`);

      // First page: limit 2
      const page1 = await svc.list({
        query: prefix,
        sortBy: "alias",
        sortDirection: "asc",
        limit: 2,
      });

      expect(page1.length).toBe(2);
      expect(page1[0]!.id).toBe(c1.clientId);
      expect(page1[1]!.id).toBe(c2.clientId);

      // Second page: cursor = last item from page 1
      const page2 = await svc.list({
        query: prefix,
        sortBy: "alias",
        sortDirection: "asc",
        limit: 2,
        cursor: page1[1]!.id,
      });

      expect(page2.length).toBe(1);
      expect(page2[0]!.id).toBe(c3.clientId);
    });

    it("supports sort by created_at descending", async () => {
      const prefix = `srt-${crypto.randomUUID().slice(0, 4)}`;
      const c1 = await createClientWithTicket(`${prefix}-first`);
      // Slight delay so created_at differs
      const c2 = await createClientWithTicket(`${prefix}-second`);

      const results = await svc.list({
        query: prefix,
        sortBy: "created_at",
        sortDirection: "desc",
        limit: 10,
      });

      expect(results.length).toBe(2);
      // Most recent first
      expect(results[0]!.id).toBe(c2.clientId);
      expect(results[1]!.id).toBe(c1.clientId);
    });

    it("includes ticket count", async () => {
      const c = await createClientWithTicket();

      // Create a second ticket for the same client
      await testDb.db
        .insertInto("tickets")
        .values({
          client_id: c.clientId,
          queue_id: queueId,
          encrypted_title: noopEncryptor.encrypt("extra-ticket"),
          encrypted_description: noopEncryptor.encrypt("desc"),
          key_generation: crypto.randomUUID(),
        })
        .execute();

      const results = await svc.list({
        query: "",
        sortBy: "alias",
        sortDirection: "asc",
        limit: 100,
      });

      const found = results.find((r) => r.id === c.clientId);
      expect(found).toBeDefined();
      expect(found!.ticketCount).toBe(2);
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
      expect(detail.tickets.length).toBe(1);
      expect(detail.tickets[0]!.id).toBe(c.ticketId);
      expect(detail.mergeHistory).toEqual([]);
    });

    it("throws NotFoundError for non-existent client", async () => {
      await expect(svc.getById(crypto.randomUUID())).rejects.toBeInstanceOf(
        NotFoundError,
      );
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
    it("updates alias successfully with unique value", async () => {
      const c = await createClientWithTicket();
      const newAlias = `new-${crypto.randomUUID().slice(0, 8)}`;

      await svc.updateAlias(c.clientId, newAlias, crypto.randomUUID());

      const row = await testDb.db
        .selectFrom("clients")
        .select("alias")
        .where("id", "=", c.clientId)
        .executeTakeFirstOrThrow();

      expect(row.alias).toBe(newAlias);
    });

    it("logs audit event on alias change", async () => {
      const c = await createClientWithTicket();
      const actorId = crypto.randomUUID();
      const newAlias = `aud-${crypto.randomUUID().slice(0, 8)}`;

      await svc.updateAlias(c.clientId, newAlias, actorId);

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

    it("throws ConflictError on duplicate alias", async () => {
      const c1 = await createClientWithTicket();
      const c2 = await createClientWithTicket();

      // Use c1's alias for c2
      const c1Alias = (
        await testDb.db
          .selectFrom("clients")
          .select("alias")
          .where("id", "=", c1.clientId)
          .executeTakeFirstOrThrow()
      ).alias;

      await expect(
        svc.updateAlias(c2.clientId, c1Alias, crypto.randomUUID()),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("throws NotFoundError for non-existent client", async () => {
      await expect(
        svc.updateAlias(crypto.randomUUID(), "whatever", crypto.randomUUID()),
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

      await expect(
        svc.updateAlias(b.clientId, "new-alias", crypto.randomUUID()),
      ).rejects.toBeInstanceOf(NotFoundError);
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
        crypto.randomUUID(),
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

    it("logs audit event on phone change", async () => {
      const c = await createClientWithTicket();
      const actorId = crypto.randomUUID();
      const newNumber = `+1555888${crypto.randomUUID().slice(0, 4).replace(/-/g, "0")}`;

      await svc.updatePhone(c.clientId, newNumber, actorId);

      const audit = await testDb.db
        .selectFrom("audit_log")
        .selectAll()
        .where("event_type", "=", "client_phone_changed")
        .where("actor_id", "=", actorId)
        .executeTakeFirst();

      expect(audit).toBeDefined();
      expect((audit!.metadata as { clientId: string }).clientId).toBe(
        c.clientId,
      );
    });

    it("detects hash collision and returns conflict", async () => {
      const c1 = await createClientWithTicket();
      const c2 = await createClientWithTicket();

      // Read c1's phone number (via noop encryptor it's plaintext in the buffer)
      const c1Phone = await testDb.db
        .selectFrom("phones")
        .select("encrypted_number")
        .where("id", "=", c1.phoneId)
        .executeTakeFirstOrThrow();

      const c1PhonePlaintext = c1Phone.encrypted_number.toString("utf-8");

      // Try to set c2's phone to c1's number
      const result = await svc.updatePhone(
        c2.clientId,
        c1PhonePlaintext,
        crypto.randomUUID(),
      );

      expect(result.success).toBe(false);
      expect(result.conflict).not.toBeNull();
      expect(result.conflict!.conflictingClientId).toBe(c1.clientId);
    });

    it("throws NotFoundError for non-existent client", async () => {
      await expect(
        svc.updatePhone(
          crypto.randomUUID(),
          "+15550001234",
          crypto.randomUUID(),
        ),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  // -----------------------------------------------------------------------
  // suggestDuplicates
  // -----------------------------------------------------------------------

  describe("suggestDuplicates", () => {
    it("returns null when no match exists", async () => {
      const result = await svc.suggestDuplicates("nonexistent-hash");
      expect(result).toBeNull();
    });

    it("returns the conflicting client when a match exists", async () => {
      const c = await createClientWithTicket();

      const result = await svc.suggestDuplicates(c.phoneHash);

      expect(result).not.toBeNull();
      expect(result!.conflictingClientId).toBe(c.clientId);
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

      // b is merged, so its phone hash should not produce a conflict
      const result = await svc.suggestDuplicates(b.phoneHash);
      expect(result).toBeNull();
    });
  });
});
