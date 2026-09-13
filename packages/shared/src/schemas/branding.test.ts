import { describe, expect, it } from "vitest";
import {
  saveBrandingFieldInputSchema,
  uploadIconsInputSchema,
  hexColorSchema,
  BRANDING_NAME_MAX,
  BRANDING_CLIENT_TEXT_MAX,
} from "./branding.js";

describe("hexColorSchema", () => {
  it.each(["#4A90D9", "#000000", "#ffffff", "#AbCdEf"])(
    "accepts 6-digit hex: %s",
    (value) => {
      expect(hexColorSchema.safeParse(value).success).toBe(true);
    },
  );

  it.each([
    "#fff",
    "4A90D9",
    "red",
    "#4A90D9;",
    "url(evil)",
    "expression(alert(1))",
    "#4A90D97",
    "",
  ])("rejects non-hex value: %s", (value) => {
    expect(hexColorSchema.safeParse(value).success).toBe(false);
  });
});

describe("saveBrandingFieldInputSchema", () => {
  it("accepts a plaintext name", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      field: "name",
      value: "Harbor Support",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a name over the length cap", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      field: "name",
      value: "a".repeat(BRANDING_NAME_MAX + 1),
    });
    expect(result.success).toBe(false);
  });

  it.each(["primary_color", "accent_color"] as const)(
    "accepts valid hex for %s",
    (field) => {
      const result = saveBrandingFieldInputSchema.safeParse({
        field,
        value: "#4A90D9",
      });
      expect(result.success).toBe(true);
    },
  );

  it.each(["primary_color", "accent_color"] as const)(
    "rejects a non-hex value for %s",
    (field) => {
      const result = saveBrandingFieldInputSchema.safeParse({
        field,
        value: "url(evil)",
      });
      expect(result.success).toBe(false);
    },
  );

  it("accepts client text under the cap", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      field: "client_text",
      value: "We reply within a day.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects client text over the cap", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      field: "client_text",
      value: "a".repeat(BRANDING_CLIENT_TEXT_MAX + 1),
    });
    expect(result.success).toBe(false);
  });

  it("accepts a support label", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      field: "support_label",
      value: "Your advocate team",
    });
    expect(result.success).toBe(true);
  });

  it("accepts base64 logo bytes", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      field: "logo",
      value: "iVBORw0KGgo=",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-base64 logo bytes", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      field: "logo",
      value: "not base64!!",
    });
    expect(result.success).toBe(false);
  });

  it("accepts base64 terminology ciphertext", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      field: "terminology",
      value: "dGVzdA==",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown field", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      field: "invalid_field",
      value: "x",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty value on every field", () => {
    for (const field of [
      "name",
      "logo",
      "primary_color",
      "accent_color",
      "client_text",
      "support_label",
      "terminology",
    ]) {
      const result = saveBrandingFieldInputSchema.safeParse({
        field,
        value: "",
      });
      expect(result.success).toBe(false);
    }
  });

  it("rejects a missing value", () => {
    const result = saveBrandingFieldInputSchema.safeParse({ field: "name" });
    expect(result.success).toBe(false);
  });
});

describe("uploadIconsInputSchema", () => {
  it("accepts all three icons", () => {
    const result = uploadIconsInputSchema.safeParse({
      icon192: "aWNvbjE5Mg==",
      icon512: "aWNvbjUxMg==",
      iconMaskable: "bWFza2FibGU=",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty icon192", () => {
    const result = uploadIconsInputSchema.safeParse({
      icon192: "",
      icon512: "aWNvbjUxMg==",
      iconMaskable: "bWFza2FibGU=",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing icon512", () => {
    const result = uploadIconsInputSchema.safeParse({
      icon192: "aWNvbjE5Mg==",
      iconMaskable: "bWFza2FibGU=",
    });
    expect(result.success).toBe(false);
  });
});
