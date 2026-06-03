import { describe, expect, it } from "vitest";
import {
  terminologyLabelsSchema,
  terminologyConfigSchema,
  TERMINOLOGY_DEFAULTS,
  TERMINOLOGY_DEFAULTS_EN,
  TERMINOLOGY_SUGGESTIONS,
} from "./terminology.js";

describe("terminologyLabelsSchema", () => {
  it("accepts valid labels with all fields", () => {
    const result = terminologyLabelsSchema.safeParse(TERMINOLOGY_DEFAULTS_EN);
    expect(result.success).toBe(true);
  });

  it("rejects missing field", () => {
    const { volunteer: _, ...partial } = TERMINOLOGY_DEFAULTS_EN;
    const result = terminologyLabelsSchema.safeParse(partial);
    expect(result.success).toBe(false);
  });

  it("rejects empty string field", () => {
    const result = terminologyLabelsSchema.safeParse({
      ...TERMINOLOGY_DEFAULTS_EN,
      volunteer: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects field exceeding 40 characters", () => {
    const result = terminologyLabelsSchema.safeParse({
      ...TERMINOLOGY_DEFAULTS_EN,
      volunteer: "a".repeat(41),
    });
    expect(result.success).toBe(false);
  });

  it("accepts field at exactly 40 characters", () => {
    const result = terminologyLabelsSchema.safeParse({
      ...TERMINOLOGY_DEFAULTS_EN,
      volunteer: "a".repeat(40),
    });
    expect(result.success).toBe(true);
  });
});

describe("terminologyConfigSchema", () => {
  it("accepts valid multi-language config", () => {
    const result = terminologyConfigSchema.safeParse(TERMINOLOGY_DEFAULTS);
    expect(result.success).toBe(true);
  });

  it("accepts single-language config", () => {
    const result = terminologyConfigSchema.safeParse({
      en: TERMINOLOGY_DEFAULTS_EN,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-two-letter language code", () => {
    const result = terminologyConfigSchema.safeParse({
      eng: TERMINOLOGY_DEFAULTS_EN,
    });
    expect(result.success).toBe(false);
  });

  it("rejects uppercase language code", () => {
    const result = terminologyConfigSchema.safeParse({
      EN: TERMINOLOGY_DEFAULTS_EN,
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty config", () => {
    const result = terminologyConfigSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("TERMINOLOGY_DEFAULTS", () => {
  it("provides English defaults", () => {
    expect(TERMINOLOGY_DEFAULTS.en).toBeDefined();
    expect(TERMINOLOGY_DEFAULTS.en!.volunteer).toBe("volunteer");
  });

  it("provides Spanish defaults", () => {
    expect(TERMINOLOGY_DEFAULTS.es).toBeDefined();
    expect(TERMINOLOGY_DEFAULTS.es!.volunteer).toBe("voluntario");
  });

  it("has all 11 fields in each language", () => {
    const expectedFields: (keyof typeof TERMINOLOGY_DEFAULTS_EN)[] = [
      "volunteer",
      "volunteers",
      "client",
      "clients",
      "ticket",
      "tickets",
      "manager",
      "managers",
      "queue",
      "queues",
      "knowledgeBase",
    ];
    for (const lang of Object.keys(TERMINOLOGY_DEFAULTS)) {
      const labels = TERMINOLOGY_DEFAULTS[lang]!;
      for (const field of expectedFields) {
        expect(labels[field]).toBeTruthy();
      }
    }
  });
});

describe("TERMINOLOGY_SUGGESTIONS", () => {
  it("provides suggestions for all 6 term groups", () => {
    const expectedKeys = [
      "volunteer",
      "client",
      "ticket",
      "manager",
      "queue",
      "knowledgeBase",
    ];
    for (const key of expectedKeys) {
      expect(TERMINOLOGY_SUGGESTIONS[key]).toBeDefined();
      expect(TERMINOLOGY_SUGGESTIONS[key]!.length).toBeGreaterThan(0);
    }
  });

  it("has no empty suggestion strings", () => {
    for (const [, suggestions] of Object.entries(TERMINOLOGY_SUGGESTIONS)) {
      for (const s of suggestions) {
        expect(s.length).toBeGreaterThan(0);
      }
    }
  });
});
