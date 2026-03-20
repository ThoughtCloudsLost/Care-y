import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  type TestDb,
  seedOrgPublicKey,
} from "../../test-utils.js";
import {
  createSmsResponseRepository,
  type SmsResponseRepository,
} from "./sms-response-repo.js";

describe.skipIf(!process.env.DATABASE_URL)("SmsResponseRepository", () => {
  let testDb: TestDb;
  let repo: SmsResponseRepository;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    repo = createSmsResponseRepository(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("create inserts and findByLocaleAndType retrieves", async () => {
    const response = await repo.create({
      responseType: "opt_out",
      locale: "en-US",
      text: "You have been unsubscribed.",
    });

    expect(response.id).toBeDefined();
    expect(response.responseType).toBe("opt_out");
    expect(response.locale).toBe("en-US");
    expect(response.text).toBe("You have been unsubscribed.");

    const found = await repo.findByLocaleAndType("en-US", "opt_out");
    expect(found).not.toBeNull();
    expect(found!.id).toBe(response.id);
    expect(found!.text).toBe("You have been unsubscribed.");
  });

  it("findWithFallback returns exact locale match when available", async () => {
    await repo.create({
      responseType: "help_exact",
      locale: "es-MX",
      text: "Ayuda en espanol.",
    });
    await repo.create({
      responseType: "help_exact",
      locale: "en-US",
      text: "Help in English.",
    });

    const found = await repo.findWithFallback("es-MX", "help_exact", "en-US");
    expect(found).not.toBeNull();
    expect(found!.locale).toBe("es-MX");
    expect(found!.text).toBe("Ayuda en espanol.");
  });

  it("findWithFallback returns default locale when exact match missing", async () => {
    await repo.create({
      responseType: "fallback_test",
      locale: "en-US",
      text: "Default English response.",
    });

    const found = await repo.findWithFallback(
      "fr-FR",
      "fallback_test",
      "en-US",
    );
    expect(found).not.toBeNull();
    expect(found!.locale).toBe("en-US");
    expect(found!.text).toBe("Default English response.");
  });

  it("findWithFallback returns null when neither locale exists", async () => {
    const found = await repo.findWithFallback(
      "zh-CN",
      "nonexistent_type",
      "ja-JP",
    );
    expect(found).toBeNull();
  });

  it("list returns all responses", async () => {
    // Create a fresh repo in an isolated schema to get a clean count
    const freshDb = await createTestDb();
    await seedOrgPublicKey(freshDb.db);
    const freshRepo = createSmsResponseRepository(freshDb.db);

    await freshRepo.create({
      responseType: "welcome",
      locale: "en-US",
      text: "Welcome.",
    });
    await freshRepo.create({
      responseType: "goodbye",
      locale: "en-US",
      text: "Goodbye.",
    });
    await freshRepo.create({
      responseType: "welcome",
      locale: "es-MX",
      text: "Bienvenido.",
    });

    const all = await freshRepo.list();
    expect(all).toHaveLength(3);

    await freshDb.cleanup();
  });

  it("list with locale filter returns only matching locale", async () => {
    const freshDb = await createTestDb();
    await seedOrgPublicKey(freshDb.db);
    const freshRepo = createSmsResponseRepository(freshDb.db);

    await freshRepo.create({
      responseType: "info",
      locale: "en-US",
      text: "Info in English.",
    });
    await freshRepo.create({
      responseType: "info",
      locale: "de-DE",
      text: "Info auf Deutsch.",
    });

    const enOnly = await freshRepo.list("en-US");
    expect(enOnly).toHaveLength(1);
    expect(enOnly[0]!.locale).toBe("en-US");

    const deOnly = await freshRepo.list("de-DE");
    expect(deOnly).toHaveLength(1);
    expect(deOnly[0]!.locale).toBe("de-DE");

    await freshDb.cleanup();
  });

  it("update changes text", async () => {
    const response = await repo.create({
      responseType: "update_test",
      locale: "en-US",
      text: "Original text.",
    });

    const updated = await repo.update(response.id, {
      text: "Updated text.",
    });

    expect(updated.id).toBe(response.id);
    expect(updated.text).toBe("Updated text.");
  });

  it("delete removes the response", async () => {
    const response = await repo.create({
      responseType: "delete_test",
      locale: "en-US",
      text: "Will be deleted.",
    });

    await repo.delete(response.id);

    const found = await repo.findByLocaleAndType("en-US", "delete_test");
    expect(found).toBeNull();
  });

  it("duplicate (locale, response_type) throws", async () => {
    await repo.create({
      responseType: "dup_test",
      locale: "en-US",
      text: "First.",
    });

    await expect(
      repo.create({
        responseType: "dup_test",
        locale: "en-US",
        text: "Second.",
      }),
    ).rejects.toThrow();
  });
});
