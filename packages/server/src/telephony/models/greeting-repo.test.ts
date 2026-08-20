import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  type TestDb,
  seedOrgPublicKey,
} from "../../test-utils.js";
import {
  createGreetingRepository,
  type GreetingRepository,
} from "./greeting-repo.js";

describe.skipIf(!process.env.DATABASE_URL)("GreetingRepository", () => {
  let testDb: TestDb;
  let greetingRepo: GreetingRepository;
  const PHONE_NUMBER = "+15550020001";

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    greetingRepo = createGreetingRepository(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("create inserts a greeting and findByNumberAndLocaleAndType retrieves it", async () => {
    const greeting = await greetingRepo.create({
      phoneNumber: PHONE_NUMBER,
      greetingType: "welcome",
      locale: "en-US",
      text: "Welcome to our service.",
    });

    expect(greeting.id).toBeDefined();
    expect(greeting.phoneNumber).toBe(PHONE_NUMBER);
    expect(greeting.greetingType).toBe("welcome");
    expect(greeting.locale).toBe("en-US");
    expect(greeting.text).toBe("Welcome to our service.");

    const found = await greetingRepo.findByNumberAndLocaleAndType(
      PHONE_NUMBER,
      "en-US",
      "welcome",
    );
    expect(found).not.toBeNull();
    expect(found!.id).toBe(greeting.id);
    expect(found!.text).toBe("Welcome to our service.");
  });

  it("findById returns a greeting by ID", async () => {
    const greeting = await greetingRepo.create({
      phoneNumber: PHONE_NUMBER,
      greetingType: "findbyid_test",
      locale: "en-US",
      text: "Find me by ID.",
    });

    const found = await greetingRepo.findById(greeting.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(greeting.id);
    expect(found!.text).toBe("Find me by ID.");
  });

  it("findById returns null for missing ID", async () => {
    const found = await greetingRepo.findById(
      "00000000-0000-4000-8000-000000000099",
    );
    expect(found).toBeNull();
  });

  it("listByNumber returns all greetings for that phone number", async () => {
    const phone2 = "+15550020002";

    await greetingRepo.create({
      phoneNumber: phone2,
      greetingType: "voicemail",
      locale: "en-US",
      text: "Leave a message.",
    });
    await greetingRepo.create({
      phoneNumber: phone2,
      greetingType: "after_hours",
      locale: "en-US",
      text: "We are closed.",
    });

    const list = await greetingRepo.listByNumber(phone2);
    expect(list).toHaveLength(2);

    const types = list.map((g) => g.greetingType).sort();
    expect(types).toEqual(["after_hours", "voicemail"]);
  });

  it("listAll returns greetings across all phone numbers", async () => {
    const all = await greetingRepo.listAll();
    expect(all.length).toBeGreaterThanOrEqual(3);
  });

  it("update changes text", async () => {
    const greeting = await greetingRepo.create({
      phoneNumber: PHONE_NUMBER,
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

  it("update changes phoneNumber (reassignment)", async () => {
    const greeting = await greetingRepo.create({
      phoneNumber: "+15550090001",
      greetingType: "reassign_test",
      locale: "en-US",
      text: "Reassignment test.",
    });

    const updated = await greetingRepo.update(greeting.id, {
      phoneNumber: "+15550090002",
    });

    expect(updated.phoneNumber).toBe("+15550090002");
    expect(updated.id).toBe(greeting.id);
  });

  it("delete removes the greeting", async () => {
    const greeting = await greetingRepo.create({
      phoneNumber: PHONE_NUMBER,
      greetingType: "goodbye",
      locale: "en-US",
      text: "Goodbye.",
    });

    await greetingRepo.delete(greeting.id);

    const found = await greetingRepo.findByNumberAndLocaleAndType(
      PHONE_NUMBER,
      "en-US",
      "goodbye",
    );
    expect(found).toBeNull();
  });

  it("findByNumberAndLocaleAndType returns null for no match", async () => {
    const found = await greetingRepo.findByNumberAndLocaleAndType(
      PHONE_NUMBER,
      "ja-JP",
      "nonexistent",
    );
    expect(found).toBeNull();
  });

  it("duplicate (phone_number, locale, greeting_type) throws", async () => {
    const phone3 = "+15550020003";

    await greetingRepo.create({
      phoneNumber: phone3,
      greetingType: "intro",
      locale: "en-US",
      text: "First.",
    });

    await expect(
      greetingRepo.create({
        phoneNumber: phone3,
        greetingType: "intro",
        locale: "en-US",
        text: "Second.",
      }),
    ).rejects.toThrow();
  });

  it("created greeting has default isAudio=false", async () => {
    const greeting = await greetingRepo.create({
      phoneNumber: PHONE_NUMBER,
      greetingType: "transfer",
      locale: "en-US",
      text: "Transferring your call.",
    });

    expect(greeting.isAudio).toBe(false);
    expect(greeting.audioBlobKey).toBeNull();
    expect(greeting.audioContentType).toBeNull();
  });
});
