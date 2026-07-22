import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
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
import { ConflictError } from "../../errors.js";

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

  describe("alias retry via fault injection", () => {
    /** Error shaped like a raw PG unique violation (code 23505 duck-typed by isUniqueViolation). */
    function uniqueViolationError(): Error & { code: string } {
      const err = new Error("duplicate key") as Error & { code: string };
      err.code = "23505";
      return err;
    }

    it("retries insert when unique violation (23505) occurs then succeeds", async () => {
      const raw = "+15550010020";
      let callCount = 0;
      const originalInsertInto = testDb.db.insertInto.bind(testDb.db);

      const insertSpy = vi
        .spyOn(testDb.db, "insertInto")
        .mockImplementation(
          (table: Parameters<typeof testDb.db.insertInto>[0]) => {
            if (table === "clients") {
              callCount++;
              if (callCount === 1) {
                // First client insert: simulate unique violation
                return {
                  values: () => ({
                    returningAll: () => ({
                      executeTakeFirstOrThrow: () =>
                        Promise.reject(uniqueViolationError()),
                    }),
                  }),
                } as unknown as ReturnType<typeof testDb.db.insertInto>;
              }
            }
            // All other inserts (phones table, subsequent client retries) use real DB
            return originalInsertInto(table);
          },
        );

      const result = await repo.findOrCreateByPhoneHash(
        phoneHash(raw),
        encryptedNumber(raw),
      );

      expect(result.isNew).toBe(true);
      expect(result.client.alias).toBeDefined();
      // First clients insert failed with 23505, so success requires a retry
      expect(callCount).toBeGreaterThanOrEqual(2);
      insertSpy.mockRestore();
    });

    it("throws ConflictError when all alias retries are exhausted", async () => {
      const raw = "+15550010021";
      const originalInsertInto = testDb.db.insertInto.bind(testDb.db);

      const insertSpy = vi
        .spyOn(testDb.db, "insertInto")
        .mockImplementation(
          (table: Parameters<typeof testDb.db.insertInto>[0]) => {
            if (table === "clients") {
              // Every client insert fails with unique violation
              return {
                values: () => ({
                  returningAll: () => ({
                    executeTakeFirstOrThrow: () =>
                      Promise.reject(uniqueViolationError()),
                  }),
                }),
              } as unknown as ReturnType<typeof testDb.db.insertInto>;
            }
            // Widen back: the early return above narrows `table` to exclude
            // "clients", but insertInto's builder type is invariant over the
            // full table union.
            return originalInsertInto(
              table as Parameters<typeof testDb.db.insertInto>[0],
            );
          },
        );

      await expect(
        repo.findOrCreateByPhoneHash(phoneHash(raw), encryptedNumber(raw)),
      ).rejects.toThrow(ConflictError);

      insertSpy.mockRestore();
    });
  });

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
      expect(found!.alias).toBe(created.client.alias);
      expect(found!.phoneId).toBe(created.phone.id);
    });

    it("returns null for unknown phone ID", async () => {
      const found = await repo.findByPhoneId(
        "00000000-0000-0000-0000-ffffffffffff",
      );
      expect(found).toBeNull();
    });

    it("excludes clients that have been merged into another client", async () => {
      // Create a client, then mark it as merged
      const raw = "+15550010031";
      const created = await repo.findOrCreateByPhoneHash(
        phoneHash(raw),
        encryptedNumber(raw),
      );

      // Create a second client to serve as the merge target
      const rawTarget = "+15550010032";
      const target = await repo.findOrCreateByPhoneHash(
        phoneHash(rawTarget),
        encryptedNumber(rawTarget),
      );

      // Set merged_into on the first client (UUID FK, not PII)
      await testDb.db
        .updateTable("clients")
        // care-y-ignore-next-line no-plaintext-db-write -- merged_into is a UUID FK referencing another client row, not PII
        .set({ merged_into: target.client.id })
        .where("id", "=", created.client.id)
        .execute();

      // findByPhoneId should exclude the merged client
      const found = await repo.findByPhoneId(created.phone.id);
      expect(found).toBeNull();

      // The merge target should still be findable
      const foundTarget = await repo.findByPhoneId(target.phone.id);
      expect(foundTarget).not.toBeNull();
      expect(foundTarget!.id).toBe(target.client.id);
    });
  });
});
