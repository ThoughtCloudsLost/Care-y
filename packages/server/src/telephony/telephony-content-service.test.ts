import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  type TestDb,
  TEST_ORG_ID,
  testBlindIndexer,
  testSealedBox,
  seedOrgPublicKey,
} from "../test-utils.js";
import { createPhoneRepository } from "./models/phone-repo.js";
import { createTelephonyContentService } from "./telephony-content-service.js";
import type { TelephonyContentService } from "./telephony-content-service.js";

describe.skipIf(!process.env.DATABASE_URL)("TelephonyContentService", () => {
  let testDb: TestDb;
  let service: TelephonyContentService;
  let phoneId: string;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    service = createTelephonyContentService(testDb.db);

    // Create a phone record for greeting FK references
    const phoneRepo = createPhoneRepository(testDb.db);
    const phone = await phoneRepo.create({
      phoneHash: testBlindIndexer.hash("+15550040001", TEST_ORG_ID),
      encryptedNumber: testSealedBox.sealBuffer(Buffer.from("+15550040001")),
    });
    phoneId = phone.id;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  // --- Greetings ---

  it("listGreetings returns empty array initially", async () => {
    const greetings = await service.listGreetings(phoneId);
    expect(greetings).toEqual([]);
  });

  it("createGreeting creates and listGreetings returns it", async () => {
    const created = await service.createGreeting({
      phoneId,
      greetingType: "new_client",
      locale: "en-US",
      text: "Welcome to the helpline.",
    });

    expect(created.id).toBeDefined();
    expect(created.phoneId).toBe(phoneId);
    expect(created.greetingType).toBe("new_client");
    expect(created.locale).toBe("en-US");
    expect(created.text).toBe("Welcome to the helpline.");
    expect(created.isAudio).toBe(false);
    expect(created.audioBlobKey).toBeNull();

    const list = await service.listGreetings(phoneId);
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.some((g) => g.id === created.id)).toBe(true);
  });

  it("createGreeting with isAudio true sets the flag", async () => {
    // Use a different greeting type to avoid unique constraint conflict
    const created = await service.createGreeting({
      phoneId,
      greetingType: "after_hours",
      locale: "en-US",
      text: "audio placeholder",
      isAudio: true,
    });

    expect(created.isAudio).toBe(true);
  });

  it("updateGreeting changes text", async () => {
    const created = await service.createGreeting({
      phoneId,
      greetingType: "hold_music",
      locale: "en-US",
      text: "Original text.",
    });

    const updated = await service.updateGreeting(created.id, {
      text: "Updated text.",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.text).toBe("Updated text.");
  });

  it("updateGreeting changes isAudio flag", async () => {
    const created = await service.createGreeting({
      phoneId,
      greetingType: "transfer_notice",
      locale: "en-US",
      text: "Transferring.",
    });

    const updated = await service.updateGreeting(created.id, {
      isAudio: true,
    });

    expect(updated.isAudio).toBe(true);
    // text should remain unchanged
    expect(updated.text).toBe("Transferring.");
  });

  it("deleteGreeting removes it from list", async () => {
    const created = await service.createGreeting({
      phoneId,
      greetingType: "goodbye_msg",
      locale: "en-US",
      text: "Goodbye.",
    });

    await service.deleteGreeting(created.id);

    const list = await service.listGreetings(phoneId);
    expect(list.some((g) => g.id === created.id)).toBe(false);
  });

  // --- SMS Responses ---

  it("listSmsResponses returns empty array initially", async () => {
    const responses = await service.listSmsResponses();
    expect(responses).toEqual([]);
  });

  it("createSmsResponse creates and listSmsResponses returns it", async () => {
    const created = await service.createSmsResponse({
      responseType: "auto_reply",
      locale: "en-US",
      text: "Thank you for reaching out.",
    });

    expect(created.id).toBeDefined();
    expect(created.responseType).toBe("auto_reply");
    expect(created.locale).toBe("en-US");
    expect(created.text).toBe("Thank you for reaching out.");

    const list = await service.listSmsResponses();
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.some((r) => r.id === created.id)).toBe(true);
  });

  it("updateSmsResponse changes text", async () => {
    const created = await service.createSmsResponse({
      responseType: "hours_info",
      locale: "en-US",
      text: "We are available 9-5.",
    });

    const updated = await service.updateSmsResponse(created.id, {
      text: "We are available 24/7.",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.text).toBe("We are available 24/7.");
  });

  it("deleteSmsResponse removes it from list", async () => {
    const created = await service.createSmsResponse({
      responseType: "temp_response",
      locale: "en-US",
      text: "Temporary.",
    });

    await service.deleteSmsResponse(created.id);

    const list = await service.listSmsResponses();
    expect(list.some((r) => r.id === created.id)).toBe(false);
  });

  it("listSmsResponses filters by locale", async () => {
    await service.createSmsResponse({
      responseType: "locale_filter_en",
      locale: "en-US",
      text: "English response.",
    });

    await service.createSmsResponse({
      responseType: "locale_filter_es",
      locale: "es-MX",
      text: "Respuesta en espanol.",
    });

    const enOnly = await service.listSmsResponses("en-US");
    const esOnly = await service.listSmsResponses("es-MX");

    // en-US should include locale_filter_en but not locale_filter_es
    expect(enOnly.some((r) => r.responseType === "locale_filter_en")).toBe(
      true,
    );
    expect(enOnly.some((r) => r.responseType === "locale_filter_es")).toBe(
      false,
    );

    // es-MX should include locale_filter_es but not locale_filter_en
    expect(esOnly.some((r) => r.responseType === "locale_filter_es")).toBe(
      true,
    );
    expect(esOnly.some((r) => r.responseType === "locale_filter_en")).toBe(
      false,
    );
  });

  it("listSmsResponses without locale returns all", async () => {
    const all = await service.listSmsResponses();

    // Should contain both en-US and es-MX responses created above
    const locales = new Set(all.map((r) => r.locale));
    expect(locales.has("en-US")).toBe(true);
    expect(locales.has("es-MX")).toBe(true);
  });
});
