import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  type TestDb,
  TEST_ORG_ID,
  testBlindIndexer,
  testSealedBox,
  testUnseal,
  seedOrgPublicKey,
} from "../../test-utils.js";
import { createPhoneRepository, type PhoneRepository } from "./phone-repo.js";
import {
  createClientRepository,
  type ClientRepository,
} from "./client-repo.js";

describe.skipIf(!process.env.DATABASE_URL)("ClientRepository", () => {
  let testDb: TestDb;
  let phoneRepo: PhoneRepository;
  let repo: ClientRepository;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    phoneRepo = createPhoneRepository(testDb.db);
    repo = createClientRepository(testDb.db, phoneRepo, testSealedBox);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  function encryptedNumber(raw: string): Buffer {
    return testSealedBox.sealBuffer(Buffer.from(raw));
  }

  function phoneHash(raw: string): string {
    return testBlindIndexer.hash(raw, TEST_ORG_ID);
  }

  it("findOrCreateByPhoneHash creates phone and client on first call with isNew=true", async () => {
    const raw = "+15550010001";
    const result = await repo.findOrCreateByPhoneHash(
      phoneHash(raw),
      encryptedNumber(raw),
    );

    expect(result.isNew).toBe(true);
    expect(result.client.id).toBeDefined();
    expect(Buffer.isBuffer(result.client.encryptedAlias)).toBe(true);
    expect(result.phone.id).toBeDefined();
    expect(result.phone.phoneHash).toBe(phoneHash(raw));
    expect(result.client.phoneId).toBe(result.phone.id);
  });

  it("second call with same hash returns existing client with isNew=false", async () => {
    const raw = "+15550010002";
    const first = await repo.findOrCreateByPhoneHash(
      phoneHash(raw),
      encryptedNumber(raw),
    );

    const second = await repo.findOrCreateByPhoneHash(
      phoneHash(raw),
      encryptedNumber(raw),
    );

    expect(second.isNew).toBe(false);
    expect(second.client.id).toBe(first.client.id);
    expect(second.phone.id).toBe(first.phone.id);
  });

  it("generated alias is sealed ciphertext (decrypts to adjective-noun-number)", async () => {
    const raw = "+15550010003";
    const result = await repo.findOrCreateByPhoneHash(
      phoneHash(raw),
      encryptedNumber(raw),
    );

    // The alias is sealed with the org public key
    const decrypted = testUnseal(result.client.encryptedAlias);
    expect(decrypted).toMatch(/^[a-z]+-[a-z]+-\d+$/);
  });

  it("alias_hash is NULL for generated aliases (no browser session)", async () => {
    const raw = "+15550010009";
    const result = await repo.findOrCreateByPhoneHash(
      phoneHash(raw),
      encryptedNumber(raw),
    );

    expect(result.client.aliasHash).toBeNull();
  });

  it("generated aliases have unique suffixes (from per-org sequence)", async () => {
    const rawA = "+15550010010";
    const rawB = "+15550010011";

    const resultA = await repo.findOrCreateByPhoneHash(
      phoneHash(rawA),
      encryptedNumber(rawA),
    );
    const resultB = await repo.findOrCreateByPhoneHash(
      phoneHash(rawB),
      encryptedNumber(rawB),
    );

    expect(resultA.isNew).toBe(true);
    expect(resultB.isNew).toBe(true);

    const aliasA = testUnseal(resultA.client.encryptedAlias);
    const aliasB = testUnseal(resultB.client.encryptedAlias);

    // The numeric suffixes must differ (drawn from a sequence)
    const suffixA = aliasA.split("-").pop();
    const suffixB = aliasB.split("-").pop();
    expect(suffixA).not.toBe(suffixB);
  });

  it("plaintext alias never written to the DB", async () => {
    const raw = "+15550010012";
    const result = await repo.findOrCreateByPhoneHash(
      phoneHash(raw),
      encryptedNumber(raw),
    );

    const row = await testDb.db
      .selectFrom("clients")
      .selectAll()
      .where("id", "=", result.client.id)
      .executeTakeFirstOrThrow();

    // No plaintext alias column
    expect("alias" in row).toBe(false);
    // encrypted_alias is a Buffer
    expect(Buffer.isBuffer(row.encrypted_alias)).toBe(true);
  });

  it("findById returns the created client", async () => {
    const raw = "+15550010004";
    const result = await repo.findOrCreateByPhoneHash(
      phoneHash(raw),
      encryptedNumber(raw),
    );

    const found = await repo.findById(result.client.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(result.client.id);
    expect(Buffer.isBuffer(found!.encryptedAlias)).toBe(true);
    expect(found!.phoneId).toBe(result.client.phoneId);
  });

  it("findById returns null for unknown ID", async () => {
    const found = await repo.findById("00000000-0000-0000-0000-ffffffffffff");
    expect(found).toBeNull();
  });

  it("two different phone hashes create two different clients", async () => {
    const rawA = "+15550010005";
    const rawB = "+15550010006";

    const resultA = await repo.findOrCreateByPhoneHash(
      phoneHash(rawA),
      encryptedNumber(rawA),
    );
    const resultB = await repo.findOrCreateByPhoneHash(
      phoneHash(rawB),
      encryptedNumber(rawB),
    );

    expect(resultA.client.id).not.toBe(resultB.client.id);
    expect(resultA.phone.id).not.toBe(resultB.phone.id);
  });

  /** Marks a client row as merged into another. UUID-only, no PII. */
  // care-y-ignore no-plaintext-db-write -- merged_into is a UUID FK, not PII; test helper only
  async function markMerged(sourceId: string, targetId: string): Promise<void> {
    await testDb.db
      .updateTable("clients")
      .set({ merged_into: targetId })
      .where("id", "=", sourceId)
      .execute();
  }

  describe("findByPhoneId", () => {
    it("returns the client for a given phone ID", async () => {
      const raw = "+15550010030";
      const created = await repo.findOrCreateByPhoneHash(
        phoneHash(raw),
        encryptedNumber(raw),
      );

      const found = await repo.findByPhoneId(created.phone.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.client.id);
      expect(found!.phoneId).toBe(created.phone.id);
    });

    it("returns null for unknown phone ID", async () => {
      const found = await repo.findByPhoneId(
        "00000000-0000-0000-0000-ffffffffffff",
      );
      expect(found).toBeNull();
    });

    it("excludes clients that have been merged into another client", async () => {
      const raw = "+15550010031";
      const created = await repo.findOrCreateByPhoneHash(
        phoneHash(raw),
        encryptedNumber(raw),
      );

      const rawTarget = "+15550010032";
      const target = await repo.findOrCreateByPhoneHash(
        phoneHash(rawTarget),
        encryptedNumber(rawTarget),
      );

      await markMerged(created.client.id, target.client.id);

      const found = await repo.findByPhoneId(created.phone.id);
      expect(found).toBeNull();

      const foundTarget = await repo.findByPhoneId(target.phone.id);
      expect(foundTarget).not.toBeNull();
      expect(foundTarget!.id).toBe(target.client.id);
    });
  });
});
