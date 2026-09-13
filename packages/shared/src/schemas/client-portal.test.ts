import { describe, expect, it } from "vitest";
import {
  intakeWrappedTkSchema,
  intakeSubmissionInputSchema,
  intakeChallengeResponseSchema,
  intakeSubmitResponseSchema,
  intakeConfigResponseSchema,
  publicIntakeFieldSchema,
  publicIntakeFormSchema,
  communicationTierSchema,
  portalChannelIdSchema,
  portalAuthSchema,
  eciesTripleSchema,
  portalBootstrapInputSchema,
  portalReplyInputSchema,
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

  // --- submit-time metadata fields ---

  it("accepts resolvedQueueId as UUID", () => {
    const input = {
      ...validSubmission(),
      resolvedQueueId: crypto.randomUUID(),
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts resolvedQueueId as null", () => {
    const input = { ...validSubmission(), resolvedQueueId: null };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects invalid resolvedQueueId", () => {
    const input = { ...validSubmission(), resolvedQueueId: "not-a-uuid" };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts valid resolvedPriority values", () => {
    for (const p of ["low", "normal", "high", "urgent"]) {
      const input = { ...validSubmission(), resolvedPriority: p };
      const result = intakeSubmissionInputSchema.safeParse(input);
      expect(result.success, `priority ${p} should be accepted`).toBe(true);
    }
  });

  it("rejects invalid resolvedPriority value", () => {
    const input = { ...validSubmission(), resolvedPriority: "critical" };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts valid resolvedEscalationLevel", () => {
    const input = {
      ...validSubmission(),
      resolvedEscalationLevel: "immediate",
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects empty resolvedEscalationLevel", () => {
    const input = { ...validSubmission(), resolvedEscalationLevel: "" };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects resolvedEscalationLevel exceeding 50 chars", () => {
    const input = {
      ...validSubmission(),
      resolvedEscalationLevel: "x".repeat(51),
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
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

describe("publicIntakeFieldSchema", () => {
  it("accepts a valid public field", () => {
    const result = publicIntakeFieldSchema.safeParse({
      id: crypto.randomUUID(),
      fieldType: "text",
      role: "phone-contact",
      encryptedLabel: "abc123",
      encryptedConfig: "def456",
      isRequired: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null role", () => {
    const result = publicIntakeFieldSchema.safeParse({
      id: crypto.randomUUID(),
      fieldType: "select",
      role: null,
      encryptedLabel: "abc",
      encryptedConfig: "def",
      isRequired: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown role", () => {
    const result = publicIntakeFieldSchema.safeParse({
      id: crypto.randomUUID(),
      fieldType: "text",
      role: "unknown-role",
      encryptedLabel: "abc",
      encryptedConfig: "def",
      isRequired: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("publicIntakeFormSchema", () => {
  it("accepts a valid public form with fields", () => {
    const result = publicIntakeFormSchema.safeParse({
      id: crypto.randomUUID(),
      slug: "general-help",
      fields: [
        {
          id: crypto.randomUUID(),
          fieldType: "text",
          role: null,
          encryptedLabel: "abc",
          encryptedConfig: "def",
          isRequired: true,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts null slug (default form)", () => {
    const result = publicIntakeFormSchema.safeParse({
      id: crypto.randomUUID(),
      slug: null,
      fields: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty fields array", () => {
    const result = publicIntakeFormSchema.safeParse({
      id: crypto.randomUUID(),
      slug: "test",
      fields: [],
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Secure Link portal schemas
// ---------------------------------------------------------------------------

describe("communicationTierSchema", () => {
  it("accepts 'sms_email'", () => {
    expect(communicationTierSchema.safeParse("sms_email").success).toBe(true);
  });

  it("accepts 'secure_link'", () => {
    expect(communicationTierSchema.safeParse("secure_link").success).toBe(true);
  });

  it("rejects 'account' (reserved for 8c)", () => {
    expect(communicationTierSchema.safeParse("account").success).toBe(false);
  });

  it("rejects free strings", () => {
    expect(communicationTierSchema.safeParse("premium").success).toBe(false);
    expect(communicationTierSchema.safeParse("").success).toBe(false);
  });
});

describe("portalChannelIdSchema", () => {
  const valid48 = "a".repeat(48);

  it("accepts 48 lowercase hex chars", () => {
    expect(portalChannelIdSchema.safeParse(valid48).success).toBe(true);
  });

  it("accepts mixed hex digits", () => {
    const mixed = "0123456789abcdef".repeat(3);
    expect(portalChannelIdSchema.safeParse(mixed).success).toBe(true);
  });

  it("rejects 47-char string", () => {
    expect(portalChannelIdSchema.safeParse("a".repeat(47)).success).toBe(false);
  });

  it("rejects 49-char string", () => {
    expect(portalChannelIdSchema.safeParse("a".repeat(49)).success).toBe(false);
  });

  it("rejects uppercase hex", () => {
    expect(portalChannelIdSchema.safeParse("A".repeat(48)).success).toBe(false);
  });

  it("rejects non-hex characters", () => {
    const withG = "g" + "a".repeat(47);
    expect(portalChannelIdSchema.safeParse(withG).success).toBe(false);
  });
});

describe("portalAuthSchema", () => {
  it("accepts exactly 32-byte base64", () => {
    expect(portalAuthSchema.safeParse(base64OfBytes(32)).success).toBe(true);
  });

  it("rejects 31-byte value", () => {
    expect(portalAuthSchema.safeParse(base64OfBytes(31)).success).toBe(false);
  });

  it("rejects 33-byte value", () => {
    expect(portalAuthSchema.safeParse(base64OfBytes(33)).success).toBe(false);
  });
});

describe("eciesTripleSchema", () => {
  function validTriple(): Record<string, unknown> {
    return {
      ephemeralPoint: base64OfBytes(32),
      nonce: base64OfBytes(24),
      ciphertext: base64Chars(100),
    };
  }

  it("accepts a valid triple", () => {
    expect(eciesTripleSchema.safeParse(validTriple()).success).toBe(true);
  });

  it("rejects wrong-length ephemeralPoint (31 bytes)", () => {
    const t = { ...validTriple(), ephemeralPoint: base64OfBytes(31) };
    expect(eciesTripleSchema.safeParse(t).success).toBe(false);
  });

  it("rejects wrong-length ephemeralPoint (33 bytes)", () => {
    const t = { ...validTriple(), ephemeralPoint: base64OfBytes(33) };
    expect(eciesTripleSchema.safeParse(t).success).toBe(false);
  });

  it("rejects wrong-length nonce (23 bytes)", () => {
    const t = { ...validTriple(), nonce: base64OfBytes(23) };
    expect(eciesTripleSchema.safeParse(t).success).toBe(false);
  });

  it("rejects wrong-length nonce (25 bytes)", () => {
    const t = { ...validTriple(), nonce: base64OfBytes(25) };
    expect(eciesTripleSchema.safeParse(t).success).toBe(false);
  });

  it("rejects oversized ciphertext (> 28_000 chars)", () => {
    const t = { ...validTriple(), ciphertext: base64Chars(28_001) };
    expect(eciesTripleSchema.safeParse(t).success).toBe(false);
  });

  it("accepts ciphertext at the 28_000 char boundary", () => {
    const t = { ...validTriple(), ciphertext: base64Chars(28_000) };
    expect(eciesTripleSchema.safeParse(t).success).toBe(true);
  });
});

describe("portalBootstrapInputSchema", () => {
  function validBootstrap(): Record<string, unknown> {
    return {
      channelId: "a".repeat(48),
      auth: base64OfBytes(32),
    };
  }

  it("accepts a valid bootstrap input", () => {
    expect(portalBootstrapInputSchema.safeParse(validBootstrap()).success).toBe(
      true,
    );
  });

  it("rejects invalid channelId length", () => {
    const input = { ...validBootstrap(), channelId: "a".repeat(47) };
    expect(portalBootstrapInputSchema.safeParse(input).success).toBe(false);
  });

  it("rejects wrong-length auth", () => {
    const input = { ...validBootstrap(), auth: base64OfBytes(16) };
    expect(portalBootstrapInputSchema.safeParse(input).success).toBe(false);
  });
});

describe("portalReplyInputSchema", () => {
  function validReply(): Record<string, unknown> {
    return {
      channelId: "a".repeat(48),
      auth: base64OfBytes(32),
      ticketId: crypto.randomUUID(),
      followUpId: crypto.randomUUID(),
      keyGeneration: crypto.randomUUID(),
      encryptedContent: base64Chars(500),
      wrappedTkTemp: base64OfBytes(80),
      selfCopy: {
        ephemeralPoint: base64OfBytes(32),
        nonce: base64OfBytes(24),
        ciphertext: base64Chars(100),
      },
    };
  }

  it("accepts a valid reply input", () => {
    expect(portalReplyInputSchema.safeParse(validReply()).success).toBe(true);
  });

  it("rejects oversized encryptedContent", () => {
    const input = { ...validReply(), encryptedContent: base64Chars(28_001) };
    expect(portalReplyInputSchema.safeParse(input).success).toBe(false);
  });

  it("rejects wrong-length wrappedTkTemp", () => {
    const input = { ...validReply(), wrappedTkTemp: base64OfBytes(32) };
    expect(portalReplyInputSchema.safeParse(input).success).toBe(false);
  });

  it("rejects non-UUID ticketId", () => {
    const input = { ...validReply(), ticketId: "not-a-uuid" };
    expect(portalReplyInputSchema.safeParse(input).success).toBe(false);
  });

  it("rejects missing selfCopy", () => {
    const input = validReply();
    delete input.selfCopy;
    expect(portalReplyInputSchema.safeParse(input).success).toBe(false);
  });
});
