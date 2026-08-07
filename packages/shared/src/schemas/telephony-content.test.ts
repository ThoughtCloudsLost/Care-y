import { describe, expect, it } from "vitest";
import {
  registerConsultantInputSchema,
  consultantOutputSchema,
} from "./telephony-content.js";

describe("registerConsultantInputSchema", () => {
  it("accepts valid input with explicit smsPingsOptIn", () => {
    const result = registerConsultantInputSchema.safeParse({
      preferredCallMethod: "phone_callback",
      smsPingsOptIn: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferredCallMethod).toBe("phone_callback");
      expect(result.data.smsPingsOptIn).toBe(true);
    }
  });

  it("defaults smsPingsOptIn to false when omitted", () => {
    const result = registerConsultantInputSchema.safeParse({
      preferredCallMethod: "webrtc",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.smsPingsOptIn).toBe(false);
    }
  });

  it("rejects encryptedPhone as an unknown key (strict object)", () => {
    const result = registerConsultantInputSchema.safeParse({
      preferredCallMethod: "phone_callback",
      encryptedPhone: "deadbeef",
    });
    expect(result.success).toBe(false);
  });

  it("rejects phoneHash as an unknown key (strict object)", () => {
    const result = registerConsultantInputSchema.safeParse({
      preferredCallMethod: "phone_callback",
      phoneHash: "abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects both legacy phone fields together", () => {
    const result = registerConsultantInputSchema.safeParse({
      preferredCallMethod: "phone_callback",
      encryptedPhone: "deadbeef",
      phoneHash: "abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid preferredCallMethod", () => {
    const result = registerConsultantInputSchema.safeParse({
      preferredCallMethod: "carrier_pigeon",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing preferredCallMethod", () => {
    const result = registerConsultantInputSchema.safeParse({
      smsPingsOptIn: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("consultantOutputSchema", () => {
  it("accepts a complete consultant output", () => {
    const result = consultantOutputSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      isVerified: true,
      preferredCallMethod: "phone_callback",
      encryptedPhone: "base64encodeddata",
      smsPingsEnabled: true,
      hasOpsPhone: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null encryptedPhone", () => {
    const result = consultantOutputSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      isVerified: false,
      preferredCallMethod: "webrtc",
      encryptedPhone: null,
      smsPingsEnabled: false,
      hasOpsPhone: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.encryptedPhone).toBeNull();
    }
  });

  it("requires smsPingsEnabled field", () => {
    const result = consultantOutputSchema.safeParse({
      id: "some-id",
      isVerified: true,
      preferredCallMethod: "phone_callback",
      encryptedPhone: "data",
      hasOpsPhone: true,
    });
    expect(result.success).toBe(false);
  });

  it("requires hasOpsPhone field", () => {
    const result = consultantOutputSchema.safeParse({
      id: "some-id",
      isVerified: true,
      preferredCallMethod: "phone_callback",
      encryptedPhone: "data",
      smsPingsEnabled: true,
    });
    expect(result.success).toBe(false);
  });
});
