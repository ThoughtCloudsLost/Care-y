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

describe.skipIf(!process.env.DATABASE_URL)("PhoneRepository", () => {
  let testDb: TestDb;
  let repo: PhoneRepository;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    repo = createPhoneRepository(testDb.db);
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

  it("create inserts a phone and findByHash retrieves it", async () => {
    const raw = "+15551234567";
    const phone = await repo.create({
      phoneHash: phoneHash(raw),
      encryptedNumber: encryptedNumber(raw),
    });

    expect(phone.id).toBeDefined();
    expect(phone.phoneHash).toBe(phoneHash(raw));

    const found = await repo.findByHash(phoneHash(raw));
    expect(found).not.toBeNull();
    expect(found!.id).toBe(phone.id);
    expect(found!.phoneHash).toBe(phone.phoneHash);
  });

  it("findByHash returns null for unknown hash", async () => {
    const found = await repo.findByHash(phoneHash("+19999999999"));
    expect(found).toBeNull();
  });

  it("findByHash excludes inactive phones", async () => {
    const raw = "+15559990001";
    const phone = await repo.create({
      phoneHash: phoneHash(raw),
      encryptedNumber: encryptedNumber(raw),
    });

    // Verify it exists while active
    const beforeDeactivate = await repo.findByHash(phoneHash(raw));
    expect(beforeDeactivate).not.toBeNull();

    await repo.deactivate(phone.id);

    const afterDeactivate = await repo.findByHash(phoneHash(raw));
    expect(afterDeactivate).toBeNull();
  });

  it("updateLocale changes the locale", async () => {
    const raw = "+15559990002";
    const phone = await repo.create({
      phoneHash: phoneHash(raw),
      encryptedNumber: encryptedNumber(raw),
    });

    expect(phone.locale).toBe("en-US");

    await repo.updateLocale(phone.id, "es-MX");

    const updated = await repo.findByHash(phoneHash(raw));
    expect(updated).not.toBeNull();
    expect(updated!.locale).toBe("es-MX");
  });

  it("duplicate phone_hash insert throws unique violation", async () => {
    const raw = "+15559990003";
    const hash = phoneHash(raw);

    await repo.create({
      phoneHash: hash,
      encryptedNumber: encryptedNumber(raw),
    });

    await expect(
      repo.create({
        phoneHash: hash,
        encryptedNumber: encryptedNumber(raw),
      }),
    ).rejects.toThrow();
  });

  it("created phone has default locale en-US", async () => {
    const raw = "+15559990004";
    const phone = await repo.create({
      phoneHash: phoneHash(raw),
      encryptedNumber: encryptedNumber(raw),
    });

    expect(phone.locale).toBe("en-US");
  });

  it("returned PhoneRecord has all camelCase fields populated", async () => {
    const raw = "+15559990005";
    const phone = await repo.create({
      phoneHash: phoneHash(raw),
      encryptedNumber: encryptedNumber(raw),
      locale: "fr-FR",
      locationCity: "Paris",
      locationRegion: "IDF",
    });

    // Verify all PhoneRecord fields are present and correct
    expect(typeof phone.id).toBe("string");
    expect(phone.id.length).toBeGreaterThan(0);
    expect(phone.phoneHash).toBe(phoneHash(raw));
    expect(Buffer.isBuffer(phone.encryptedNumber)).toBe(true);
    expect(phone.locale).toBe("fr-FR");
    expect(phone.locationCity).toBe("Paris");
    expect(phone.locationRegion).toBe("IDF");
    expect(phone.isActive).toBe(true);
  });
});
