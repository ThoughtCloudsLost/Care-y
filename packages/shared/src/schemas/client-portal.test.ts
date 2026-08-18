import { describe, expect, it } from "vitest";
import {
  intakeWrappedTkSchema,
  intakeSubmissionInputSchema,
  intakeChallengeResponseSchema,
  intakeSubmitResponseSchema,
  intakeConfigResponseSchema,
} from "./client-portal.js";

/**
 * Helper: generate a base64 string that decodes to exactly `n` bytes.
 * Uses standard base64 with proper padding.
 */
function base64OfBytes(n: number): string {
  const bytes = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    bytes[i] = (i + 65) % 256;
  }
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

/** Generate a valid base64 string of the given character length. */
function base64Chars(len: number): string {
  return "A".repeat(len);
}

function validSubmission(): Record<string, unknown> {
  return {
    ticketId: crypto.randomUUID(),
    followUpId: crypto.randomUUID(),
    formId: crypto.randomUUID(),
    encryptedTitle: base64OfBytes(64),
    encryptedDescription: base64OfBytes(128),
    encryptedMessage: base64OfBytes(64),
    encryptedFormResponse: base64OfBytes(256),
    wrappedTk: base64OfBytes(80),
  };
}

describe("intakeWrappedTkSchema", () => {
  it("accepts exactly 80-byte sealed box", () => {
    const result = intakeWrappedTkSchema.safeParse(base64OfBytes(80));
    expect(result.success).toBe(true);
  });

  it("rejects 79-byte value", () => {
    const result = intakeWrappedTkSchema.safeParse(base64OfBytes(79));
    expect(result.success).toBe(false);
  });

  it("rejects 81-byte value", () => {
    const result = intakeWrappedTkSchema.safeParse(base64OfBytes(81));
    expect(result.success).toBe(false);
  });

  it("rejects non-base64 characters", () => {
    const result = intakeWrappedTkSchema.safeParse("not!valid@base64#");
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = intakeWrappedTkSchema.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("intakeSubmissionInputSchema", () => {
  it("accepts a valid full payload", () => {
    const result = intakeSubmissionInputSchema.safeParse(validSubmission());
    expect(result.success).toBe(true);
  });

  it("accepts missing pow (optional)", () => {
    const input = validSubmission();
    // pow is not set, should pass
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts pow when provided with valid strings", () => {
    const input = {
      ...validSubmission(),
      pow: { challenge: "abc", solution: "def" },
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects pow with oversized challenge", () => {
    const input = {
      ...validSubmission(),
      pow: { challenge: "x".repeat(129), solution: "ok" },
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects pow with oversized solution", () => {
    const input = {
      ...validSubmission(),
      pow: { challenge: "ok", solution: "x".repeat(129) },
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts missing encryptedMessage (optional for custom forms)", () => {
    const input = validSubmission();
    delete input.encryptedMessage;
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts nullable followUpId", () => {
    const input = { ...validSubmission(), followUpId: null };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts nullable formId (default form)", () => {
    const input = { ...validSubmission(), formId: null };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects invalid ticketId UUID", () => {
    const input = { ...validSubmission(), ticketId: "not-a-uuid" };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects invalid followUpId UUID (non-null, non-uuid)", () => {
    const input = { ...validSubmission(), followUpId: "not-a-uuid" };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects oversized encryptedTitle", () => {
    const input = { ...validSubmission(), encryptedTitle: base64Chars(1_401) };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts encryptedTitle at the cap boundary", () => {
    const input = { ...validSubmission(), encryptedTitle: base64Chars(1_400) };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects oversized encryptedDescription", () => {
    const input = {
      ...validSubmission(),
      encryptedDescription: base64Chars(88_001),
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects oversized encryptedMessage", () => {
    const input = {
      ...validSubmission(),
      encryptedMessage: base64Chars(28_001),
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects oversized encryptedFormResponse", () => {
    const input = {
      ...validSubmission(),
      encryptedFormResponse: base64Chars(88_001),
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects wrong-length wrappedTk", () => {
    const input = { ...validSubmission(), wrappedTk: base64OfBytes(32) };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-base64 encryptedTitle", () => {
    const input = { ...validSubmission(), encryptedTitle: "not!valid@base64" };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = intakeSubmissionInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("intakeChallengeResponseSchema", () => {
  it("accepts valid challenge response", () => {
    const result = intakeChallengeResponseSchema.safeParse({
      challenge: "abc123",
      difficulty: 16,
      expiresAt: "2026-08-18T12:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative difficulty", () => {
    const result = intakeChallengeResponseSchema.safeParse({
      challenge: "abc",
      difficulty: -1,
      expiresAt: "2026-08-18T12:00:00Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer difficulty", () => {
    const result = intakeChallengeResponseSchema.safeParse({
      challenge: "abc",
      difficulty: 1.5,
      expiresAt: "2026-08-18T12:00:00Z",
    });
    expect(result.success).toBe(false);
  });
});

describe("intakeSubmitResponseSchema", () => {
  it("accepts valid reference", () => {
    const result = intakeSubmitResponseSchema.safeParse({
      reference: "calm-pebble-7",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing reference", () => {
    const result = intakeSubmitResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("intakeConfigResponseSchema", () => {
  it("accepts powRequired true", () => {
    const result = intakeConfigResponseSchema.safeParse({ powRequired: true });
    expect(result.success).toBe(true);
  });

  it("accepts powRequired false", () => {
    const result = intakeConfigResponseSchema.safeParse({ powRequired: false });
    expect(result.success).toBe(true);
  });

  it("rejects non-boolean powRequired", () => {
    const result = intakeConfigResponseSchema.safeParse({
      powRequired: "yes",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing powRequired", () => {
    const result = intakeConfigResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
