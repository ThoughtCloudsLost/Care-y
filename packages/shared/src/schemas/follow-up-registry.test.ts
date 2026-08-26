import { describe, expect, it } from "vitest";
import { CONTENT_TYPE_REGISTRY } from "./follow-up-registry.js";
import type { RenderVariant } from "./follow-up-registry.js";

describe("CONTENT_TYPE_REGISTRY", () => {
  it("has an entry for contact_correction", () => {
    const entry = CONTENT_TYPE_REGISTRY.contact_correction;
    expect(entry).toBeDefined();
  });

  it("contact_correction entry has category 'message'", () => {
    expect(CONTENT_TYPE_REGISTRY.contact_correction.category).toBe("message");
  });

  it("contact_correction allows only client source", () => {
    expect(CONTENT_TYPE_REGISTRY.contact_correction.allowedSources).toEqual([
      "client",
    ]);
  });

  it("contact_correction uses ticket-key encryption", () => {
    expect(CONTENT_TYPE_REGISTRY.contact_correction.encryption).toBe(
      "ticket-key",
    );
  });

  it("contact_correction has encrypted content and no event params", () => {
    expect(CONTENT_TYPE_REGISTRY.contact_correction.hasEncryptedContent).toBe(
      true,
    );
    expect(CONTENT_TYPE_REGISTRY.contact_correction.hasEventParams).toBe(false);
  });

  it("contact_correction is not groupable", () => {
    expect(CONTENT_TYPE_REGISTRY.contact_correction.groupable).toBe(false);
  });

  describe("renderVariant", () => {
    it.each<[string, RenderVariant]>([
      ["phone_call", "call"],
      ["share_link", "share"],
      ["contact_correction", "correction"],
    ])("type %s has renderVariant '%s'", (type, expected) => {
      const entry =
        CONTENT_TYPE_REGISTRY[type as keyof typeof CONTENT_TYPE_REGISTRY];
      expect(entry.renderVariant).toBe(expected);
    });

    it("most types have no renderVariant", () => {
      const typesWithVariant = new Set([
        "phone_call",
        "share_link",
        "contact_correction",
      ]);
      for (const [type, meta] of Object.entries(CONTENT_TYPE_REGISTRY)) {
        if (!typesWithVariant.has(type)) {
          expect(meta.renderVariant).toBeUndefined();
        }
      }
    });
  });
});
