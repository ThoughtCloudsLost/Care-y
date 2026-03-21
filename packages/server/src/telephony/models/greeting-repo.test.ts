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
  createGreetingRepository,
  type GreetingRepository,
} from "./greeting-repo.js";

describe.skipIf(!process.env.DATABASE_URL)("GreetingRepository", () => {
  let testDb: TestDb;
  let phoneRepo: PhoneRepository;
  let greetingRepo: GreetingRepository;
  let phoneId: string;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    phoneRepo = createPhoneRepository(testDb.db);
    greetingRepo = createGreetingRepository(testDb.db);

    // Create a phone record that greetings will reference
    const phone = await phoneRepo.create({
      phoneHash: testBlindIndexer.hash("+15550020001", TEST_ORG_ID),
      encryptedNumber: testSealedBox.sealBuffer(Buffer.from("+15550020001")),
    });
    phoneId = phone.id;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("create inserts a greeting and findByPhoneAndLocaleAndType retrieves it", async () => {
    const greeting = await greetingRepo.create({
      phoneId,
      greetingType: "welcome",
      locale: "en-US",
      text: "Welcome to our service.",
    });

    expect(greeting.id).toBeDefined();
    expect(greeting.phoneId).toBe(phoneId);
    expect(greeting.greetingType).toBe("welcome");
    expect(greeting.locale).toBe("en-US");
    expect(greeting.text).toBe("Welcome to our service.");

    const found = await greetingRepo.findByPhoneAndLocaleAndType(
      phoneId,
      "en-US",
      "welcome",
    );
    expect(found).not.toBeNull();
    expect(found!.id).toBe(greeting.id);
    expect(found!.text).toBe("Welcome to our service.");
  });

  it("listByPhone returns all greetings for that phone", async () => {
    // Create a second phone so its greetings don't interfere
    const phone2 = await phoneRepo.create({
      phoneHash: testBlindIndexer.hash("+15550020002", TEST_ORG_ID),
      encryptedNumber: testSealedBox.sealBuffer(Buffer.from("+15550020002")),
    });

    await greetingRepo.create({
      phoneId: phone2.id,
      greetingType: "voicemail",
      locale: "en-US",
      text: "Leave a message.",
    });
    await greetingRepo.create({
      phoneId: phone2.id,
      greetingType: "after_hours",
      locale: "en-US",
      text: "We are closed.",
    });

    const list = await greetingRepo.listByPhone(phone2.id);
    expect(list).toHaveLength(2);

    const types = list.map((g) => g.greetingType).sort();
    expect(types).toEqual(["after_hours", "voicemail"]);
  });

  it("update changes text", async () => {
    const greeting = await greetingRepo.create({
      phoneId,
      greetingType: "hold",
      locale: "en-US",
      text: "Please hold.",
    });

    const updated = await greetingRepo.update(greeting.id, {
      text: "Please wait a moment.",
    });

    expect(updated.text).toBe("Please wait a moment.");
    expect(updated.id).toBe(greeting.id);
  });

  it("delete removes the greeting", async () => {
    const greeting = await greetingRepo.create({
      phoneId,
      greetingType: "goodbye",
      locale: "en-US",
      text: "Goodbye.",
    });

    await greetingRepo.delete(greeting.id);

    const found = await greetingRepo.findByPhoneAndLocaleAndType(
      phoneId,
      "en-US",
      "goodbye",
    );
    expect(found).toBeNull();
  });

  it("findByPhoneAndLocaleAndType returns null for no match", async () => {
    const found = await greetingRepo.findByPhoneAndLocaleAndType(
      phoneId,
      "ja-JP",
      "nonexistent",
    );
    expect(found).toBeNull();
  });

  it("duplicate (phone_id, locale, greeting_type) throws", async () => {
    // Create a fresh phone to avoid collision with earlier tests
    const phone3 = await phoneRepo.create({
      phoneHash: testBlindIndexer.hash("+15550020003", TEST_ORG_ID),
      encryptedNumber: testSealedBox.sealBuffer(Buffer.from("+15550020003")),
    });

    await greetingRepo.create({
      phoneId: phone3.id,
      greetingType: "intro",
      locale: "en-US",
      text: "First.",
    });

    await expect(
      greetingRepo.create({
        phoneId: phone3.id,
        greetingType: "intro",
        locale: "en-US",
        text: "Second.",
      }),
    ).rejects.toThrow();
  });

  it("created greeting has default isAudio=false", async () => {
    const greeting = await greetingRepo.create({
      phoneId,
      greetingType: "transfer",
      locale: "en-US",
      text: "Transferring your call.",
    });

    expect(greeting.isAudio).toBe(false);
    expect(greeting.audioBlobKey).toBeNull();
  });
});
