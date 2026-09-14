import { describe, expect, it } from "vitest";
import {
  CONTENT_TYPE_REGISTRY,
  queueEventParamsSchema,
} from "./follow-up-registry.js";
import type { RenderVariant } from "./follow-up-registry.js";
import type { QueueId } from "../ids.js";

describe("CONTENT_TYPE_REGISTRY", () => {
  it("has an entry for contact_correction", () => {
    const entry = CONTENT_TYPE_REGISTRY.contact_correction;
    expect(entry).toBeDefined();
  });

  it("contact_correction entry has category 'correction'", () => {
    expect(CONTENT_TYPE_REGISTRY.contact_correction.category).toBe(
      "correction",
    );
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
      ["email_outbound", "email"],
      ["email_inbound", "email"],
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
        "email_outbound",
        "email_inbound",
      ]);
      for (const [type, meta] of Object.entries(CONTENT_TYPE_REGISTRY)) {
        if (!typesWithVariant.has(type)) {
          expect(meta.renderVariant).toBeUndefined();
        }
      }
    });
  });

  describe("email_inbound entry", () => {
    it("has an entry for email_inbound", () => {
      expect(CONTENT_TYPE_REGISTRY.email_inbound).toBeDefined();
    });

    it("has category 'message'", () => {
      expect(CONTENT_TYPE_REGISTRY.email_inbound.category).toBe("message");
    });

    it("allows only client source", () => {
      expect(CONTENT_TYPE_REGISTRY.email_inbound.allowedSources).toEqual([
        "client",
      ]);
    });

    it("uses ticket-key encryption", () => {
      expect(CONTENT_TYPE_REGISTRY.email_inbound.encryption).toBe("ticket-key");
    });

    it("has encrypted content and no event params", () => {
      expect(CONTENT_TYPE_REGISTRY.email_inbound.hasEncryptedContent).toBe(
        true,
      );
      expect(CONTENT_TYPE_REGISTRY.email_inbound.hasEventParams).toBe(false);
    });

    it("is not groupable", () => {
      expect(CONTENT_TYPE_REGISTRY.email_inbound.groupable).toBe(false);
    });

    it("has the email renderVariant (timeline landmark)", () => {
      expect(CONTENT_TYPE_REGISTRY.email_inbound.renderVariant).toBe("email");
    });
  });

  describe("queue_changed entry", () => {
    it("has an entry for queue_changed", () => {
      expect(CONTENT_TYPE_REGISTRY.queue_changed).toBeDefined();
    });

    it("has category 'system'", () => {
      expect(CONTENT_TYPE_REGISTRY.queue_changed.category).toBe("system");
    });

    it("allows only system source", () => {
      expect(CONTENT_TYPE_REGISTRY.queue_changed.allowedSources).toEqual([
        "system",
      ]);
    });

    it("uses no encryption", () => {
      expect(CONTENT_TYPE_REGISTRY.queue_changed.encryption).toBe("none");
    });

    it("has no encrypted content and has event params", () => {
      expect(CONTENT_TYPE_REGISTRY.queue_changed.hasEncryptedContent).toBe(
        false,
      );
      expect(CONTENT_TYPE_REGISTRY.queue_changed.hasEventParams).toBe(true);
    });

    it("is not groupable", () => {
      expect(CONTENT_TYPE_REGISTRY.queue_changed.groupable).toBe(false);
    });

    it("has no renderVariant", () => {
      expect(CONTENT_TYPE_REGISTRY.queue_changed.renderVariant).toBeUndefined();
    });
  });

  describe("queueEventParamsSchema", () => {
    const validTo = crypto.randomUUID() as QueueId;
    const validFrom = crypto.randomUUID() as QueueId;

    it("accepts params with both to and from", () => {
      const result = queueEventParamsSchema.safeParse({
        to: validTo,
        from: validFrom,
      });
      expect(result.success).toBe(true);
    });

    it("accepts params with only to (from is optional)", () => {
      const result = queueEventParamsSchema.safeParse({ to: validTo });
      expect(result.success).toBe(true);
    });

    it("rejects params without to", () => {
      const result = queueEventParamsSchema.safeParse({ from: validFrom });
      expect(result.success).toBe(false);
    });

    it("rejects non-uuid values", () => {
      const result = queueEventParamsSchema.safeParse({
        to: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });
  });
});
