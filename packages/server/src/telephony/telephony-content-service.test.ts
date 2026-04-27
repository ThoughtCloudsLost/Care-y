import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { createTestDb, type TestDb, seedOrgPublicKey } from "../test-utils.js";
import { createTelephonyContentService } from "./telephony-content-service.js";
import type { TelephonyContentService } from "./telephony-content-service.js";

describe.skipIf(!process.env.DATABASE_URL)("TelephonyContentService", () => {
  let testDb: TestDb;
  let service: TelephonyContentService;
  const PHONE_NUMBER = "+15550040001";

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    service = createTelephonyContentService(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  // --- Greetings ---

  it("listGreetings returns empty array initially", async () => {
    const greetings = await service.listGreetings(PHONE_NUMBER);
    expect(greetings).toEqual([]);
  });

  it("createGreeting creates and listGreetings returns it", async () => {
    const created = await service.createGreeting({
      phoneNumber: PHONE_NUMBER,
      greetingType: "new_client",
      locale: "en-US",
      text: "Welcome to the helpline.",
    });

    expect(created.id).toBeDefined();
    expect(created.phoneNumber).toBe(PHONE_NUMBER);
    expect(created.greetingType).toBe("new_client");
    expect(created.locale).toBe("en-US");
    expect(created.text).toBe("Welcome to the helpline.");
    expect(created.isAudio).toBe(false);
    expect(created.audioBlobKey).toBeNull();

    const list = await service.listGreetings(PHONE_NUMBER);
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.some((g) => g.id === created.id)).toBe(true);
  });

  it("listGreetings without phone number returns all", async () => {
    const all = await service.listGreetings();
    expect(all.length).toBeGreaterThanOrEqual(1);
  });

  it("createGreeting with isAudio true sets the flag", async () => {
    const created = await service.createGreeting({
      phoneNumber: PHONE_NUMBER,
      greetingType: "after_hours",
      locale: "en-US",
      text: "audio placeholder",
      isAudio: true,
    });

    expect(created.isAudio).toBe(true);
  });

  it("updateGreeting changes text", async () => {
    const created = await service.createGreeting({
      phoneNumber: PHONE_NUMBER,
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
      phoneNumber: PHONE_NUMBER,
      greetingType: "transfer_notice",
      locale: "en-US",
      text: "Transferring.",
    });

    const updated = await service.updateGreeting(created.id, {
      isAudio: true,
    });

    expect(updated.isAudio).toBe(true);
    expect(updated.text).toBe("Transferring.");
  });

  it("deleteGreeting removes it from list", async () => {
    const created = await service.createGreeting({
      phoneNumber: PHONE_NUMBER,
      greetingType: "goodbye_msg",
      locale: "en-US",
      text: "Goodbye.",
    });

    await service.deleteGreeting(created.id);

    const list = await service.listGreetings(PHONE_NUMBER);
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

    expect(enOnly.some((r) => r.responseType === "locale_filter_en")).toBe(
      true,
    );
    expect(enOnly.some((r) => r.responseType === "locale_filter_es")).toBe(
      false,
    );

    expect(esOnly.some((r) => r.responseType === "locale_filter_es")).toBe(
      true,
    );
    expect(esOnly.some((r) => r.responseType === "locale_filter_en")).toBe(
      false,
    );
  });

  it("listSmsResponses without locale returns all", async () => {
    const all = await service.listSmsResponses();

    const locales = new Set(all.map((r) => r.locale));
    expect(locales.has("en-US")).toBe(true);
    expect(locales.has("es-MX")).toBe(true);
  });

  // --- Audio Greetings ---

  it("uploadGreetingAudio stores blob and updates greeting", async () => {
    const greeting = await service.createGreeting({
      phoneNumber: PHONE_NUMBER,
      greetingType: "answer",
      locale: "de",
      text: "placeholder for audio",
    });

    // WAV magic bytes (RIFF header)
    const wavData = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
    ]);
    const audioBase64 = wavData.toString("base64");

    const mockBlobStore = {
      put: vi.fn().mockResolvedValue("blob-key-wav-123"),
      get: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };

    const updated = await service.uploadGreetingAudio(
      mockBlobStore,
      "org_test",
      greeting.id,
      audioBase64,
      "audio/wav",
    );

    expect(updated.isAudio).toBe(true);
    expect(updated.audioBlobKey).toBe("blob-key-wav-123");
    expect(updated.audioContentType).toBe("audio/wav");
    expect(mockBlobStore.put).toHaveBeenCalledWith(
      "org_test",
      "greeting",
      expect.any(Buffer),
    );
  });

  it("uploadGreetingAudio rejects files exceeding size limit", async () => {
    const greeting = await service.createGreeting({
      phoneNumber: PHONE_NUMBER,
      greetingType: "answer",
      locale: "fr",
      text: "placeholder",
    });

    // Create base64 string representing > 5MB
    const oversized = Buffer.alloc(6 * 1024 * 1024, 0);
    // Add WAV header so magic bytes pass
    oversized[0] = 0x52;
    oversized[1] = 0x49;
    oversized[2] = 0x46;
    oversized[3] = 0x46;
    const audioBase64 = oversized.toString("base64");

    const mockBlobStore = {
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };

    await expect(
      service.uploadGreetingAudio(
        mockBlobStore,
        "org_test",
        greeting.id,
        audioBase64,
        "audio/wav",
      ),
    ).rejects.toThrow(/5 MB/);
  });

  it("uploadGreetingAudio rejects mismatched magic bytes", async () => {
    const greeting = await service.createGreeting({
      phoneNumber: PHONE_NUMBER,
      greetingType: "answer",
      locale: "it",
      text: "placeholder",
    });

    // Random bytes that don't match MP3 signature
    const badData = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);
    const audioBase64 = badData.toString("base64");

    const mockBlobStore = {
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    };

    await expect(
      service.uploadGreetingAudio(
        mockBlobStore,
        "org_test",
        greeting.id,
        audioBase64,
        "audio/mpeg",
      ),
    ).rejects.toThrow(/magic bytes/);
  });
});
