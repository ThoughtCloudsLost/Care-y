import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type { PendingClient } from "../tickets/ticket-service.js";
import {
  createTestDb,
  createTestQueue,
  createTestTicketForClient,
  noopEncryptor,
  testBlindIndexer,
  testFieldEncryptor,
  testSealedBox,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";
import {
  createPhoneLookupService,
  type PhoneLookupService,
} from "./phone-lookup-service.js";
import * as crypto from "node:crypto";
import { orgSchemaNameSchema, phoneMatchHashSchema } from "@care-y/shared";
import type {
  ClientId,
  PhoneHash,
  PhoneId,
  QueueId,
  TicketStatus,
} from "@care-y/shared";

const TEST_ORG_SCHEMA = orgSchemaNameSchema.parse(`org_${TEST_ORG_ID}`);

function uniquePhone(): string {
  return `+1555${String(crypto.randomInt(0, 10_000_000)).padStart(7, "0")}`;
}

describe.skipIf(!process.env.DATABASE_URL)("PhoneLookupService (DB)", () => {
  let testDb: TestDb;
  let queueId: QueueId;
  let encryptedOutputs: Buffer[];
  let lookupSvc: PhoneLookupService;

  // Delegates to the real test encryptor and records every Buffer that
  // encrypt returns, so tests can check the service zeroed it.
  const capturingEncryptor: FieldEncryptor = {
    encrypt(plaintext: string): Buffer {
      const out = testFieldEncryptor.encrypt(plaintext);
      encryptedOutputs.push(out);
      return out;
    },
    encryptBuffer(plaintext: Buffer): Buffer {
      return testFieldEncryptor.encryptBuffer(plaintext);
    },
    decrypt(ciphertext: Buffer): string {
      return testFieldEncryptor.decrypt(ciphertext);
    },
    decryptToBuffer(ciphertext: Buffer): Buffer {
      return testFieldEncryptor.decryptToBuffer(ciphertext);
    },
  };

  beforeAll(async () => {
    testDb = await createTestDb();
    const q = await createTestQueue(testDb.db);
    queueId = q.id;
    lookupSvc = createPhoneLookupService({
      db: testDb.db,
      indexer: testBlindIndexer,
      encryptor: capturingEncryptor,
      orgId: TEST_ORG_ID,
      orgSchema: TEST_ORG_SCHEMA,
      pendingClients: new Map<string, PendingClient>(),
    });
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  beforeEach(() => {
    encryptedOutputs = [];
  });

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  async function insertPhone(phone: string): Promise<PhoneId> {
    // phone_hash is a one-way blind index and encrypted_number goes through
    // the test field encryptor, so neither is plaintext PII.
    const phoneRow = {
      phone_hash: testBlindIndexer.hashPhone(phone, TEST_ORG_ID),
      encrypted_number: testFieldEncryptor.encrypt(phone),
      locale: "en-US",
    };

    // care-y-ignore-next-line no-plaintext-db-write -- phone_hash is a blind index, encrypted_number passes through testFieldEncryptor.encrypt() above
    const row = await testDb.db
      .insertInto("phones")
      .values(phoneRow)
      .returning("id")
      .executeTakeFirstOrThrow();
    return row.id;
  }

  async function insertClient(
    phoneId: PhoneId | null,
  ): Promise<{ id: ClientId; encryptedAlias: Buffer }> {
    const encryptedAlias = testSealedBox.sealBuffer(
      Buffer.from(`cl-${crypto.randomUUID().slice(0, 8)}`),
    );

    // care-y-ignore-next-line no-plaintext-db-write -- encrypted_alias is test ciphertext via testSealedBox; phone_id is a UUID FK
    const row = await testDb.db
      .insertInto("clients")
      .values({
        encrypted_alias: encryptedAlias,
        alias_hash: null,
        phone_id: phoneId,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    return { id: row.id, encryptedAlias };
  }

  // -----------------------------------------------------------------------
  // lookupPhone
  // -----------------------------------------------------------------------

  describe("lookupPhone", () => {
    it("returns the client and its open ticket, and zeroes the encrypted phone", async () => {
      const phone = uniquePhone();
      const phoneId = await insertPhone(phone);
      const client = await insertClient(phoneId);
      const ticketId = await createTestTicketForClient(
        testDb.db,
        client.id,
        queueId,
      );
      const phoneBuf = Buffer.from(phone, "utf-8");

      const result = await lookupSvc.lookupPhone(phoneBuf);

      expect(result.found).toBe(true);
      if (!result.found) return;
      expect(result.clientId).toBe(client.id);
      expect(result.encryptedAlias.equals(client.encryptedAlias)).toBe(true);
      expect(result.openTicketId).toBe(ticketId);

      expect(encryptedOutputs).toHaveLength(1);
      const encrypted = encryptedOutputs[0];
      expect(encrypted).toBeDefined();
      expect(encrypted?.every((byte) => byte === 0)).toBe(true);

      phoneBuf.fill(0);
    });

    it("returns a null openTicketId when the client has no open ticket", async () => {
      const phone = uniquePhone();
      const phoneId = await insertPhone(phone);
      const client = await insertClient(phoneId);
      const ticketId = await createTestTicketForClient(
        testDb.db,
        client.id,
        queueId,
      );
      const closed: TicketStatus = "closed";
      await testDb.db
        .updateTable("tickets")
        .set({ status: closed })
        .where("id", "=", ticketId)
        .execute();
      const phoneBuf = Buffer.from(phone, "utf-8");

      const result = await lookupSvc.lookupPhone(phoneBuf);

      expect(result.found).toBe(true);
      if (!result.found) return;
      expect(result.clientId).toBe(client.id);
      expect(result.openTicketId).toBeNull();

      phoneBuf.fill(0);
    });

    it("returns not found when the phone's only client is merged", async () => {
      const phone = uniquePhone();
      const phoneId = await insertPhone(phone);
      const survivor = await insertClient(null);
      const merged = await insertClient(phoneId);
      await testDb.db
        .updateTable("clients")
        .set({ merged_into: survivor.id })
        .where("id", "=", merged.id)
        .execute();
      const phoneBuf = Buffer.from(phone, "utf-8");

      const result = await lookupSvc.lookupPhone(phoneBuf);

      expect(result.found).toBe(false);

      if (!result.found) result.pending.opsEncryptedPhone.fill(0);
      phoneBuf.fill(0);
    });

    it("returns pending artifacts when no phone row matches and leaves the input untouched", async () => {
      const phone = uniquePhone();
      const phoneBuf = Buffer.from(phone, "utf-8");
      const original = Buffer.from(phoneBuf);

      const result = await lookupSvc.lookupPhone(phoneBuf);

      expect(result.found).toBe(false);
      if (result.found) return;
      expect(result.pending.phoneHash).toBe(
        testBlindIndexer.hashPhone(phone, TEST_ORG_ID),
      );
      const decrypted = testFieldEncryptor.decrypt(
        result.pending.opsEncryptedPhone,
      );
      expect(decrypted).toBe(phone);
      expect(phoneBuf.equals(original)).toBe(true);

      result.pending.opsEncryptedPhone.fill(0);
      phoneBuf.fill(0);
      original.fill(0);
    });
  });
});

// ---------------------------------------------------------------------------
// storePendingClient (no DB required)
// ---------------------------------------------------------------------------

describe("PhoneLookupService.storePendingClient", () => {
  function makeService(
    pendingClients: Map<string, PendingClient>,
  ): PhoneLookupService {
    return createPhoneLookupService({
      db: {} as unknown as Kysely<TenantDatabase>,
      indexer: testBlindIndexer,
      encryptor: noopEncryptor,
      orgId: TEST_ORG_ID,
      orgSchema: TEST_ORG_SCHEMA,
      pendingClients,
    });
  }

  it("stores the artifacts and phone match hash under the returned token", () => {
    const pendingClients = new Map<string, PendingClient>();
    const svc = makeService(pendingClients);
    const phoneHash = "pending-phone-hash" as PhoneHash;
    const opsEncryptedPhone = Buffer.from("ops-encrypted-phone");
    const phoneMatchHash = phoneMatchHashSchema.parse("ab".repeat(64));

    const before = Date.now();
    const token = svc.storePendingClient(
      { phoneHash, opsEncryptedPhone },
      phoneMatchHash,
    );
    const after = Date.now();

    const entry = pendingClients.get(token);
    expect(entry).toBeDefined();
    if (!entry) return;
    expect(entry.phoneHash).toBe(phoneHash);
    expect(entry.opsEncryptedPhone).toBe(opsEncryptedPhone);
    expect(entry.phoneMatchHash).toBe(phoneMatchHash);
    expect(entry.orgSchema).toBe(TEST_ORG_SCHEMA);
    expect(entry.createdAt).toBeGreaterThanOrEqual(before);
    expect(entry.createdAt).toBeLessThanOrEqual(after);

    opsEncryptedPhone.fill(0);
  });

  it("stores a null phone match hash as null", () => {
    const pendingClients = new Map<string, PendingClient>();
    const svc = makeService(pendingClients);
    const opsEncryptedPhone = Buffer.from("ops-encrypted-phone");

    const token = svc.storePendingClient(
      { phoneHash: "pending-phone-hash" as PhoneHash, opsEncryptedPhone },
      null,
    );

    const entry = pendingClients.get(token);
    expect(entry).toBeDefined();
    expect(entry?.phoneMatchHash).toBeNull();
    expect(entry?.opsEncryptedPhone).toBe(opsEncryptedPhone);

    opsEncryptedPhone.fill(0);
  });

  it("returns a distinct token for each call", () => {
    const pendingClients = new Map<string, PendingClient>();
    const svc = makeService(pendingClients);
    const first = Buffer.from("first");
    const second = Buffer.from("second");

    const tokenA = svc.storePendingClient(
      { phoneHash: "hash-a" as PhoneHash, opsEncryptedPhone: first },
      null,
    );
    const tokenB = svc.storePendingClient(
      { phoneHash: "hash-b" as PhoneHash, opsEncryptedPhone: second },
      null,
    );

    expect(tokenA).not.toBe(tokenB);
    expect(pendingClients.size).toBe(2);

    first.fill(0);
    second.fill(0);
  });
});
