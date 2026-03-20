import { describe, it, expect, vi } from "vitest";

import { selectAutoReply } from "./sms-auto-reply.js";
import type { SmsResponseRepository } from "./models/sms-response-repo.js";
import type { SmsResponseRecord } from "./models/sms-response-repo.js";

function makeMockRepo(result: SmsResponseRecord | null): SmsResponseRepository {
  return {
    findByLocaleAndType: vi.fn(),
    findWithFallback: vi
      .fn<SmsResponseRepository["findWithFallback"]>()
      .mockResolvedValue(result),
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

describe("selectAutoReply", () => {
  it("returns matching response when repo finds a result", async () => {
    const record: SmsResponseRecord = {
      id: "resp-1",
      responseType: "intake_ack",
      locale: "es-MX",
      text: "Gracias por comunicarse.",
    };
    const repo = makeMockRepo(record);

    const result = await selectAutoReply(repo, "es-MX", "intake_ack", "en-US");

    expect(result.text).toBe("Gracias por comunicarse.");
    expect(result.locale).toBe("es-MX");
  });

  it("returns hardcoded English fallback when repo returns null", async () => {
    const repo = makeMockRepo(null);

    const result = await selectAutoReply(repo, "ja-JP", "intake_ack", "en-US");

    expect(result.text).toBe(
      "Thank you for reaching out. A volunteer will follow up with you.",
    );
    expect(result.locale).toBe("en-US");
  });

  it("passes clientLocale, responseType, and defaultLocale to findWithFallback", async () => {
    const repo = makeMockRepo(null);

    await selectAutoReply(repo, "fr-FR", "voicemail_ack", "en-US");

    expect(repo.findWithFallback).toHaveBeenCalledOnce();
    expect(repo.findWithFallback).toHaveBeenCalledWith(
      "fr-FR",
      "voicemail_ack",
      "en-US",
    );
  });

  it("works with voicemail_ack responseType (not just intake_ack)", async () => {
    const record: SmsResponseRecord = {
      id: "resp-vm",
      responseType: "voicemail_ack",
      locale: "en-US",
      text: "We received your voicemail.",
    };
    const repo = makeMockRepo(record);

    const result = await selectAutoReply(
      repo,
      "en-US",
      "voicemail_ack",
      "en-US",
    );

    expect(result.text).toBe("We received your voicemail.");
    expect(repo.findWithFallback).toHaveBeenCalledWith(
      "en-US",
      "voicemail_ack",
      "en-US",
    );
  });

  it("returns the locale from the repo record (not the requested locale)", async () => {
    // When findWithFallback returns the default-locale fallback row,
    // the returned locale should be the row's locale, not the client's.
    const fallbackRecord: SmsResponseRecord = {
      id: "resp-2",
      responseType: "intake_ack",
      locale: "en-US",
      text: "Thank you for contacting us.",
    };
    const repo = makeMockRepo(fallbackRecord);

    const result = await selectAutoReply(repo, "zh-CN", "intake_ack", "en-US");

    expect(result.locale).toBe("en-US");
    expect(result.text).toBe("Thank you for contacting us.");
  });
});
