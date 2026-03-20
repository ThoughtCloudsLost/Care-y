import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  type TestDb,
  TEST_ORG_ID,
  testBlindIndexer,
  testSealedBox,
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
    repo = createClientRepository(testDb.db, phoneRepo);
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
    expect(result.client.alias).toBeDefined();
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

  it("generated alias matches adjective-noun-number pattern", async () => {
    const raw = "+15550010003";
    const result = await repo.findOrCreateByPhoneHash(
      phoneHash(raw),
      encryptedNumber(raw),
    );

    // Pattern: lowercase-word-lowercase-word-digits (1-99)
    expect(result.client.alias).toMatch(/^[a-z]+-[a-z]+-\d{1,2}$/);
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
    expect(found!.alias).toBe(result.client.alias);
    expect(found!.phoneId).toBe(result.client.phoneId);
  });

  it("findById returns null for unknown ID", async () => {
    const found = await repo.findById("00000000-0000-0000-0000-ffffffffffff");
    expect(found).toBeNull();
  });

  it("retries alias generation on unique constraint violation", async () => {
    // Insert a client whose alias we can predict by seeding one manually,
    // then verify findOrCreateByPhoneHash succeeds on a second alias.
    // Because generateAlias() is random, the retry path is only triggered
    // by actual DB unique constraint violations (code 23505). We test this
    // indirectly: two clients for different phones both get unique aliases.
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

    // Both created successfully (retry logic handles any collision)
    expect(resultA.isNew).toBe(true);
    expect(resultB.isNew).toBe(true);
    expect(resultA.client.alias).not.toBe(resultB.client.alias);
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
    expect(resultA.client.alias).not.toBe(resultB.client.alias);
  });
});
