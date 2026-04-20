import { describe, expect, it } from "vitest";
import {
  saveBrandingFieldInputSchema,
  uploadIconsInputSchema,
} from "./branding.js";

describe("saveBrandingFieldInputSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      field: "name",
      encryptedValue: "dGVzdA==",
      clientEncryptedBranding: "Y2xpZW50",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input without clientEncryptedBranding", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      field: "logo",
      encryptedValue: "dGVzdA==",
    });
    expect(result.success).toBe(true);
  });

  it.each(["name", "logo", "primary_color", "client_text"] as const)(
    "accepts field value: %s",
    (field) => {
      const result = saveBrandingFieldInputSchema.safeParse({
        field,
        encryptedValue: "dGVzdA==",
      });
      expect(result.success).toBe(true);
    },
  );

  it("rejects invalid field value", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      field: "invalid_field",
      encryptedValue: "dGVzdA==",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty encryptedValue", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      field: "name",
      encryptedValue: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing field", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      encryptedValue: "dGVzdA==",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing encryptedValue", () => {
    const result = saveBrandingFieldInputSchema.safeParse({
      field: "name",
    });
    expect(result.success).toBe(false);
  });
});

describe("uploadIconsInputSchema", () => {
  it("accepts valid input with all three icons", () => {
    const result = uploadIconsInputSchema.safeParse({
      icon192: "aWNvbjE5Mg==",
      icon512: "aWNvbjUxMg==",
      iconMaskable: "bWFza2FibGU=",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty icon192", () => {
    const result = uploadIconsInputSchema.safeParse({
      icon192: "",
      icon512: "aWNvbjUxMg==",
      iconMaskable: "bWFza2FibGU=",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing icon512", () => {
    const result = uploadIconsInputSchema.safeParse({
      icon192: "aWNvbjE5Mg==",
      iconMaskable: "bWFza2FibGU=",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing iconMaskable", () => {
    const result = uploadIconsInputSchema.safeParse({
      icon192: "aWNvbjE5Mg==",
      icon512: "aWNvbjUxMg==",
    });
    expect(result.success).toBe(false);
  });
});
