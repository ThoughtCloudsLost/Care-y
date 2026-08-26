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
  portalChannelKindSchema,
  portalAuthSchema,
  eciesTripleSchema,
  portalBootstrapInputSchema,
  portalReplyInputSchema,
  createShareInputSchema,
  openShareInputSchema,
  openShareResponseSchema,
  shareStatusSchema,
  accountUsernameSchema,
  accountRegistrationSchema,
  accountLoginInputSchema,
  rewrappedMessagesSchema,
  accountUpgradeInputSchema,
  accountChangePasswordInputSchema,
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
  it("accepts a valid public field with fieldKey", () => {
    const result = publicIntakeFieldSchema.safeParse({
      id: crypto.randomUUID(),
      fieldKey: crypto.randomUUID(),
      fieldType: "text",
      role: "phone-contact",
      encryptedLabel: "abc123",
      encryptedConfig: "def456",
      isRequired: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts sentinel pseudo-key as fieldKey", () => {
    const result = publicIntakeFieldSchema.safeParse({
      id: crypto.randomUUID(),
      fieldKey: "default:phone",
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
      fieldKey: crypto.randomUUID(),
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
      fieldKey: crypto.randomUUID(),
      fieldType: "text",
      role: "unknown-role",
      encryptedLabel: "abc",
      encryptedConfig: "def",
      isRequired: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fieldKey", () => {
    const result = publicIntakeFieldSchema.safeParse({
      id: crypto.randomUUID(),
      fieldType: "text",
      role: null,
      encryptedLabel: "abc",
      encryptedConfig: "def",
      isRequired: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("publicIntakeFormSchema", () => {
  it("accepts a valid public form with fields including fieldKey", () => {
    const result = publicIntakeFormSchema.safeParse({
      id: crypto.randomUUID(),
      slug: "general-help",
      fields: [
        {
          id: crypto.randomUUID(),
          fieldKey: crypto.randomUUID(),
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

  it("accepts 'account'", () => {
    expect(communicationTierSchema.safeParse("account").success).toBe(true);
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

// ---------------------------------------------------------------------------
// Share link schemas
// ---------------------------------------------------------------------------

describe("createShareInputSchema", () => {
  function validCreateShare(): Record<string, unknown> {
    return {
      shareId: crypto.randomUUID(),
      ticketId: crypto.randomUUID(),
      ciphertext: base64Chars(500),
      followUpId: crypto.randomUUID(),
      encryptedFollowUp: base64Chars(500),
    };
  }

  it("accepts a valid payload", () => {
    const result = createShareInputSchema.safeParse(validCreateShare());
    expect(result.success).toBe(true);
  });

  it("accepts ciphertext at exactly 88,000 chars", () => {
    const input = { ...validCreateShare(), ciphertext: base64Chars(88_000) };
    const result = createShareInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects ciphertext at 88,001 chars", () => {
    const input = { ...validCreateShare(), ciphertext: base64Chars(88_001) };
    const result = createShareInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts encryptedFollowUp at exactly 88,000 chars", () => {
    const input = {
      ...validCreateShare(),
      encryptedFollowUp: base64Chars(88_000),
    };
    const result = createShareInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects encryptedFollowUp at 88,001 chars", () => {
    const input = {
      ...validCreateShare(),
      encryptedFollowUp: base64Chars(88_001),
    };
    const result = createShareInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-UUID shareId", () => {
    const input = { ...validCreateShare(), shareId: "not-a-uuid" };
    const result = createShareInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-UUID ticketId", () => {
    const input = { ...validCreateShare(), ticketId: "not-a-uuid" };
    const result = createShareInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-UUID followUpId", () => {
    const input = { ...validCreateShare(), followUpId: "not-a-uuid" };
    const result = createShareInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-base64 ciphertext", () => {
    const input = { ...validCreateShare(), ciphertext: "not!valid@base64" };
    const result = createShareInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = createShareInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("openShareInputSchema", () => {
  it("accepts a valid UUID", () => {
    const result = openShareInputSchema.safeParse({
      shareId: crypto.randomUUID(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID shareId", () => {
    const result = openShareInputSchema.safeParse({ shareId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects empty object", () => {
    const result = openShareInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("openShareResponseSchema", () => {
  it("parses 'ready' with ciphertext", () => {
    const result = openShareResponseSchema.safeParse({
      status: "ready",
      ciphertext: base64Chars(100),
    });
    expect(result.success).toBe(true);
  });

  it("rejects 'ready' without ciphertext", () => {
    const result = openShareResponseSchema.safeParse({ status: "ready" });
    expect(result.success).toBe(false);
  });

  it("parses 'opened'", () => {
    const result = openShareResponseSchema.safeParse({ status: "opened" });
    expect(result.success).toBe(true);
  });

  it("parses 'expired'", () => {
    const result = openShareResponseSchema.safeParse({ status: "expired" });
    expect(result.success).toBe(true);
  });

  it("parses 'not_found'", () => {
    const result = openShareResponseSchema.safeParse({ status: "not_found" });
    expect(result.success).toBe(true);
  });

  it("rejects unknown status", () => {
    const result = openShareResponseSchema.safeParse({ status: "unknown" });
    expect(result.success).toBe(false);
  });
});

describe("shareStatusSchema", () => {
  it("accepts a valid share status", () => {
    const result = shareStatusSchema.safeParse({
      id: crypto.randomUUID(),
      createdAt: "2026-08-18T12:00:00Z",
      expiresAt: "2026-08-21T12:00:00Z",
      readAt: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts non-null readAt", () => {
    const result = shareStatusSchema.safeParse({
      id: crypto.randomUUID(),
      createdAt: "2026-08-18T12:00:00Z",
      expiresAt: "2026-08-21T12:00:00Z",
      readAt: "2026-08-19T08:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID id", () => {
    const result = shareStatusSchema.safeParse({
      id: "not-a-uuid",
      createdAt: "2026-08-18T12:00:00Z",
      expiresAt: "2026-08-21T12:00:00Z",
      readAt: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = shareStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Encrypted Account schemas
// ---------------------------------------------------------------------------

describe("portalChannelKindSchema", () => {
  it("accepts 'secure_link'", () => {
    expect(portalChannelKindSchema.safeParse("secure_link").success).toBe(true);
  });

  it("accepts 'account'", () => {
    expect(portalChannelKindSchema.safeParse("account").success).toBe(true);
  });

  it("rejects free strings", () => {
    expect(portalChannelKindSchema.safeParse("share_link").success).toBe(false);
    expect(portalChannelKindSchema.safeParse("").success).toBe(false);
  });
});

describe("accountUsernameSchema", () => {
  it("accepts a 3-char username", () => {
    expect(accountUsernameSchema.safeParse("abc").success).toBe(true);
  });

  it("accepts a 64-char username", () => {
    expect(accountUsernameSchema.safeParse("a".repeat(64)).success).toBe(true);
  });

  it("rejects a 2-char username (below min)", () => {
    expect(accountUsernameSchema.safeParse("ab").success).toBe(false);
  });

  it("rejects a 65-char username (above max)", () => {
    expect(accountUsernameSchema.safeParse("a".repeat(65)).success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(accountUsernameSchema.safeParse("").success).toBe(false);
  });
});

describe("accountRegistrationSchema", () => {
  function validRegistration(): Record<string, unknown> {
    return {
      accountId: crypto.randomUUID(),
      username: "testuser",
      salt: base64OfBytes(16),
      publicKey: base64OfBytes(32),
      authHash: base64OfBytes(32),
      keyCheck: {
        ephemeralPoint: base64OfBytes(32),
        nonce: base64OfBytes(24),
        ciphertext: base64Chars(100),
      },
    };
  }

  it("accepts a valid registration", () => {
    expect(
      accountRegistrationSchema.safeParse(validRegistration()).success,
    ).toBe(true);
  });

  it("rejects wrong-length salt (15 bytes)", () => {
    const input = { ...validRegistration(), salt: base64OfBytes(15) };
    expect(accountRegistrationSchema.safeParse(input).success).toBe(false);
  });

  it("rejects wrong-length salt (17 bytes)", () => {
    const input = { ...validRegistration(), salt: base64OfBytes(17) };
    expect(accountRegistrationSchema.safeParse(input).success).toBe(false);
  });

  it("rejects wrong-length publicKey (31 bytes)", () => {
    const input = { ...validRegistration(), publicKey: base64OfBytes(31) };
    expect(accountRegistrationSchema.safeParse(input).success).toBe(false);
  });

  it("rejects wrong-length publicKey (33 bytes)", () => {
    const input = { ...validRegistration(), publicKey: base64OfBytes(33) };
    expect(accountRegistrationSchema.safeParse(input).success).toBe(false);
  });

  it("rejects wrong-length authHash (31 bytes)", () => {
    const input = { ...validRegistration(), authHash: base64OfBytes(31) };
    expect(accountRegistrationSchema.safeParse(input).success).toBe(false);
  });

  it("rejects wrong-length authHash (33 bytes)", () => {
    const input = { ...validRegistration(), authHash: base64OfBytes(33) };
    expect(accountRegistrationSchema.safeParse(input).success).toBe(false);
  });
});

describe("accountLoginInputSchema", () => {
  it("accepts valid login input", () => {
    const result = accountLoginInputSchema.safeParse({
      accountId: crypto.randomUUID(),
      authToken: base64OfBytes(32),
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong-length authToken (31 bytes)", () => {
    const result = accountLoginInputSchema.safeParse({
      accountId: crypto.randomUUID(),
      authToken: base64OfBytes(31),
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong-length authToken (33 bytes)", () => {
    const result = accountLoginInputSchema.safeParse({
      accountId: crypto.randomUUID(),
      authToken: base64OfBytes(33),
    });
    expect(result.success).toBe(false);
  });
});

describe("rewrappedMessagesSchema", () => {
  function validRewrapped(): Record<string, unknown> {
    return {
      id: crypto.randomUUID(),
      copy: {
        ephemeralPoint: base64OfBytes(32),
        nonce: base64OfBytes(24),
        ciphertext: base64Chars(100),
      },
    };
  }

  it("accepts an array of 500 rows", () => {
    const arr = Array.from({ length: 500 }, () => validRewrapped());
    expect(rewrappedMessagesSchema.safeParse(arr).success).toBe(true);
  });

  it("rejects an array of 501 rows", () => {
    const arr = Array.from({ length: 501 }, () => validRewrapped());
    expect(rewrappedMessagesSchema.safeParse(arr).success).toBe(false);
  });

  it("accepts an empty array", () => {
    expect(rewrappedMessagesSchema.safeParse([]).success).toBe(true);
  });
});

describe("accountUpgradeInputSchema", () => {
  function validUpgrade(): Record<string, unknown> {
    return {
      channelId: "a".repeat(48),
      auth: base64OfBytes(32),
      account: {
        accountId: crypto.randomUUID(),
        username: "testuser",
        salt: base64OfBytes(16),
        publicKey: base64OfBytes(32),
        authHash: base64OfBytes(32),
        keyCheck: {
          ephemeralPoint: base64OfBytes(32),
          nonce: base64OfBytes(24),
          ciphertext: base64Chars(100),
        },
      },
      rewrappedMessages: [],
    };
  }

  it("accepts a valid upgrade input", () => {
    expect(accountUpgradeInputSchema.safeParse(validUpgrade()).success).toBe(
      true,
    );
  });

  it("requires channel auth (channelId + auth)", () => {
    const input = validUpgrade();
    delete input.channelId;
    expect(accountUpgradeInputSchema.safeParse(input).success).toBe(false);

    const input2 = validUpgrade();
    delete input2.auth;
    expect(accountUpgradeInputSchema.safeParse(input2).success).toBe(false);
  });
});

describe("accountChangePasswordInputSchema", () => {
  function validChangePassword(): Record<string, unknown> {
    return {
      currentAuthToken: base64OfBytes(32),
      account: {
        salt: base64OfBytes(16),
        publicKey: base64OfBytes(32),
        authHash: base64OfBytes(32),
        keyCheck: {
          ephemeralPoint: base64OfBytes(32),
          nonce: base64OfBytes(24),
          ciphertext: base64Chars(100),
        },
      },
      rewrappedMessages: [],
    };
  }

  it("accepts a valid change-password input", () => {
    expect(
      accountChangePasswordInputSchema.safeParse(validChangePassword()).success,
    ).toBe(true);
  });

  it("omits accountId and username from the account sub-object", () => {
    const input = validChangePassword();
    const acct = input.account as Record<string, unknown>;
    acct.accountId = crypto.randomUUID();
    acct.username = "shouldfail";
    const result = accountChangePasswordInputSchema.safeParse(input);
    // Zod's .omit() strips unrecognized keys in strict mode. With default
    // stripping, the extra keys are silently dropped and the parse succeeds.
    // Verify the parsed output does NOT contain accountId or username.
    expect(result.success).toBe(true);
    if (result.success) {
      const parsed = result.data.account as Record<string, unknown>;
      expect("accountId" in parsed).toBe(false);
      expect("username" in parsed).toBe(false);
    }
  });
});

describe("intakeSubmissionInputSchema account branch", () => {
  it("accepts intake without account (optional)", () => {
    const result = intakeSubmissionInputSchema.safeParse(validSubmission());
    expect(result.success).toBe(true);
  });

  it("accepts intake with account branch (no selfCopy)", () => {
    const input = {
      ...validSubmission(),
      account: {
        accountId: crypto.randomUUID(),
        username: "testuser",
        salt: base64OfBytes(16),
        publicKey: base64OfBytes(32),
        authHash: base64OfBytes(32),
        keyCheck: {
          ephemeralPoint: base64OfBytes(32),
          nonce: base64OfBytes(24),
          ciphertext: base64Chars(100),
        },
      },
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts intake with account branch including selfCopy", () => {
    const input = {
      ...validSubmission(),
      account: {
        accountId: crypto.randomUUID(),
        username: "testuser",
        salt: base64OfBytes(16),
        publicKey: base64OfBytes(32),
        authHash: base64OfBytes(32),
        keyCheck: {
          ephemeralPoint: base64OfBytes(32),
          nonce: base64OfBytes(24),
          ciphertext: base64Chars(100),
        },
        selfCopy: {
          ephemeralPoint: base64OfBytes(32),
          nonce: base64OfBytes(24),
          ciphertext: base64Chars(100),
        },
      },
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects intake account branch with invalid username", () => {
    const input = {
      ...validSubmission(),
      account: {
        accountId: crypto.randomUUID(),
        username: "ab", // too short
        salt: base64OfBytes(16),
        publicKey: base64OfBytes(32),
        authHash: base64OfBytes(32),
        keyCheck: {
          ephemeralPoint: base64OfBytes(32),
          nonce: base64OfBytes(24),
          ciphertext: base64Chars(100),
        },
      },
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Continuation branch schemas
// ---------------------------------------------------------------------------

function validContinuation(): Record<string, unknown> {
  return {
    channelId: "a".repeat(48),
    authHash: base64OfBytes(32),
    clientPublic: base64OfBytes(32),
    keyCheck: {
      ephemeralPoint: base64OfBytes(32),
      nonce: base64OfBytes(24),
      ciphertext: base64Chars(100),
    },
  };
}

describe("intakeSubmissionInputSchema continuation branch", () => {
  it("accepts intake without continuation (optional)", () => {
    const result = intakeSubmissionInputSchema.safeParse(validSubmission());
    expect(result.success).toBe(true);
  });

  it("accepts intake with continuation branch (no selfCopy)", () => {
    const input = {
      ...validSubmission(),
      continuation: validContinuation(),
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts intake with continuation branch including selfCopy", () => {
    const input = {
      ...validSubmission(),
      continuation: {
        ...validContinuation(),
        selfCopy: {
          ephemeralPoint: base64OfBytes(32),
          nonce: base64OfBytes(24),
          ciphertext: base64Chars(100),
        },
      },
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects continuation with invalid channelId (wrong length)", () => {
    const input = {
      ...validSubmission(),
      continuation: {
        ...validContinuation(),
        channelId: "a".repeat(47),
      },
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects continuation with uppercase hex channelId", () => {
    const input = {
      ...validSubmission(),
      continuation: {
        ...validContinuation(),
        channelId: "A".repeat(48),
      },
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects continuation with wrong-length authHash (31 bytes)", () => {
    const input = {
      ...validSubmission(),
      continuation: {
        ...validContinuation(),
        authHash: base64OfBytes(31),
      },
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects continuation with wrong-length clientPublic (33 bytes)", () => {
    const input = {
      ...validSubmission(),
      continuation: {
        ...validContinuation(),
        clientPublic: base64OfBytes(33),
      },
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects continuation with wrong-length keyCheck.ephemeralPoint (31 bytes)", () => {
    const input = {
      ...validSubmission(),
      continuation: {
        ...validContinuation(),
        keyCheck: {
          ephemeralPoint: base64OfBytes(31),
          nonce: base64OfBytes(24),
          ciphertext: base64Chars(100),
        },
      },
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects continuation with oversized keyCheck.ciphertext", () => {
    const input = {
      ...validSubmission(),
      continuation: {
        ...validContinuation(),
        keyCheck: {
          ephemeralPoint: base64OfBytes(32),
          nonce: base64OfBytes(24),
          ciphertext: base64Chars(28_001),
        },
      },
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("intakeSubmissionInputSchema account-wins precedence", () => {
  it("strips continuation when both account and continuation are present", () => {
    const input = {
      ...validSubmission(),
      account: {
        accountId: crypto.randomUUID(),
        username: "testuser",
        salt: base64OfBytes(16),
        publicKey: base64OfBytes(32),
        authHash: base64OfBytes(32),
        keyCheck: {
          ephemeralPoint: base64OfBytes(32),
          nonce: base64OfBytes(24),
          ciphertext: base64Chars(100),
        },
      },
      continuation: validContinuation(),
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.account).toBeDefined();
      expect(result.data.continuation).toBeUndefined();
    }
  });

  it("preserves continuation when account is absent", () => {
    const input = {
      ...validSubmission(),
      continuation: validContinuation(),
    };
    const result = intakeSubmissionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.continuation).toBeDefined();
    }
  });
});

describe("portalChannelKindSchema (intake_continuation)", () => {
  it("accepts 'intake_continuation'", () => {
    expect(
      portalChannelKindSchema.safeParse("intake_continuation").success,
    ).toBe(true);
  });
});
