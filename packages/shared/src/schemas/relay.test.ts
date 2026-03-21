import { describe, it, expect } from "vitest";
import {
  relaySmsInputSchema,
  relayCallInputSchema,
  relaySmsOutputSchema,
  relayCallOutputSchema,
  relayWebrtcTokenOutputSchema,
} from "./relay.js";

describe("relaySmsInputSchema", () => {
  it("accepts valid SMS input", () => {
    const result = relaySmsInputSchema.safeParse({
      to: "+15551234567",
      body: "Hello from CARE-Y",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty to field", () => {
    const result = relaySmsInputSchema.safeParse({
      to: "",
      body: "Hello",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty body field", () => {
    const result = relaySmsInputSchema.safeParse({
      to: "+15551234567",
      body: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects body over 1600 chars", () => {
    const result = relaySmsInputSchema.safeParse({
      to: "+15551234567",
      body: "x".repeat(1601),
    });
    expect(result.success).toBe(false);
  });

  it("accepts body at exactly 1600 chars", () => {
    const result = relaySmsInputSchema.safeParse({
      to: "+15551234567",
      body: "x".repeat(1600),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing to field", () => {
    const result = relaySmsInputSchema.safeParse({
      body: "Hello",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing body field", () => {
    const result = relaySmsInputSchema.safeParse({
      to: "+15551234567",
    });
    expect(result.success).toBe(false);
  });
});

describe("relayCallInputSchema", () => {
  it("accepts valid call input with clientPhone only", () => {
    const result = relayCallInputSchema.safeParse({
      clientPhone: "+15551234567",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid call input with both phones", () => {
    const result = relayCallInputSchema.safeParse({
      clientPhone: "+15551234567",
      consultantPhone: "+15559876543",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty clientPhone", () => {
    const result = relayCallInputSchema.safeParse({
      clientPhone: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing clientPhone", () => {
    const result = relayCallInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty consultantPhone when provided", () => {
    const result = relayCallInputSchema.safeParse({
      clientPhone: "+15551234567",
      consultantPhone: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("relaySmsOutputSchema", () => {
  it("accepts valid output", () => {
    const result = relaySmsOutputSchema.safeParse({
      messageId: "SM_abc123",
    });
    expect(result.success).toBe(true);
  });
});

describe("relayCallOutputSchema", () => {
  it("accepts phone_callback method", () => {
    const result = relayCallOutputSchema.safeParse({
      callSid: "CA_abc123",
      method: "phone_callback",
    });
    expect(result.success).toBe(true);
  });

  it("accepts webrtc method", () => {
    const result = relayCallOutputSchema.safeParse({
      callSid: "",
      method: "webrtc",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown method", () => {
    const result = relayCallOutputSchema.safeParse({
      callSid: "CA_abc123",
      method: "sip",
    });
    expect(result.success).toBe(false);
  });
});

describe("relayWebrtcTokenOutputSchema", () => {
  it("accepts valid token output", () => {
    const result = relayWebrtcTokenOutputSchema.safeParse({
      token: "test-jwt-header.test-payload.test-signature",
      ttl: 300,
    });
    expect(result.success).toBe(true);
  });
});
