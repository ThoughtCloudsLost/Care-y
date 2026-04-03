import { describe, expect, it } from "vitest";
import {
  uploadVolPublicSchema,
  passwordChangeKeysSchema,
  uploadOrgPublicKeySchema,
} from "./keys.js";

/**
 * Helper: generate a base64 string that decodes to exactly `n` bytes.
 * Uses standard base64 (not URL-safe) with proper padding.
 */
function base64OfBytes(n: number): string {
  // Each group of 3 bytes encodes to 4 base64 chars.
  // For exact byte control, build a Uint8Array and encode manually.
  const bytes = new Uint8Array(n);
  // Fill with non-zero values so the base64 doesn't look degenerate
  for (let i = 0; i < n; i++) {
    bytes[i] = (i + 65) % 256;
  }
  // Use btoa with binary string (works in both Node 20+ and browser)
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

describe("uploadVolPublicSchema", () => {
  const valid32 = base64OfBytes(32);

  it("accepts valid 32-byte base64 volPublic", () => {
    const result = uploadVolPublicSchema.safeParse({ volPublic: valid32 });
    expect(result.success).toBe(true);
  });

  it("rejects 31-byte volPublic", () => {
    const result = uploadVolPublicSchema.safeParse({
      volPublic: base64OfBytes(31),
    });
    expect(result.success).toBe(false);
  });

  it("rejects 33-byte volPublic", () => {
    const result = uploadVolPublicSchema.safeParse({
      volPublic: base64OfBytes(33),
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-base64 characters", () => {
    const result = uploadVolPublicSchema.safeParse({
      volPublic: "not!valid@base64#",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = uploadVolPublicSchema.safeParse({ volPublic: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing volPublic field", () => {
    const result = uploadVolPublicSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("strips extra fields from output", () => {
    const result = uploadVolPublicSchema.safeParse({
      volPublic: valid32,
      extraField: "should be stripped",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("extraField");
    }
  });
});

describe("passwordChangeKeysSchema", () => {
  const validInput = {
    saltNew: base64OfBytes(16),
    volPublicNew: base64OfBytes(32),
    reWrappedKeys: [
      {
        ticketId: "550e8400-e29b-41d4-a716-446655440000",
        keyGeneration: "660e8400-e29b-41d4-a716-446655440000",
        ephemeralPoint: base64OfBytes(32),
        nonce: base64OfBytes(24),
        wrappedKey: base64OfBytes(48),
      },
    ],
  };

  it("accepts valid password change input", () => {
    const result = passwordChangeKeysSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts empty reWrappedKeys array", () => {
    const result = passwordChangeKeysSchema.safeParse({
      ...validInput,
      reWrappedKeys: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects salt with wrong byte length (15 bytes)", () => {
    const result = passwordChangeKeysSchema.safeParse({
      ...validInput,
      saltNew: base64OfBytes(15),
    });
    expect(result.success).toBe(false);
  });

  it("rejects volPublicNew with wrong byte length (31 bytes)", () => {
    const result = passwordChangeKeysSchema.safeParse({
      ...validInput,
      volPublicNew: base64OfBytes(31),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid ticketId UUID", () => {
    const result = passwordChangeKeysSchema.safeParse({
      ...validInput,
      reWrappedKeys: [
        {
          ...validInput.reWrappedKeys[0],
          ticketId: "not-a-uuid",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid keyGeneration UUID", () => {
    const result = passwordChangeKeysSchema.safeParse({
      ...validInput,
      reWrappedKeys: [
        {
          ...validInput.reWrappedKeys[0],
          keyGeneration: "not-a-uuid",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects ephemeralPoint with wrong byte length", () => {
    const result = passwordChangeKeysSchema.safeParse({
      ...validInput,
      reWrappedKeys: [
        {
          ...validInput.reWrappedKeys[0],
          ephemeralPoint: base64OfBytes(16),
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects nonce with wrong byte length", () => {
    const result = passwordChangeKeysSchema.safeParse({
      ...validInput,
      reWrappedKeys: [
        {
          ...validInput.reWrappedKeys[0],
          nonce: base64OfBytes(12),
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-base64 wrappedKey", () => {
    const result = passwordChangeKeysSchema.safeParse({
      ...validInput,
      reWrappedKeys: [
        {
          ...validInput.reWrappedKeys[0],
          wrappedKey: "not!valid@base64",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing saltNew", () => {
    const { saltNew: _, ...rest } = validInput;
    const result = passwordChangeKeysSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing volPublicNew", () => {
    const { volPublicNew: _, ...rest } = validInput;
    const result = passwordChangeKeysSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("accepts multiple re-wrapped keys", () => {
    const result = passwordChangeKeysSchema.safeParse({
      ...validInput,
      reWrappedKeys: [
        validInput.reWrappedKeys[0],
        {
          ticketId: "770e8400-e29b-41d4-a716-446655440000",
          keyGeneration: "880e8400-e29b-41d4-a716-446655440000",
          ephemeralPoint: base64OfBytes(32),
          nonce: base64OfBytes(24),
          wrappedKey: base64OfBytes(64),
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("uploadOrgPublicKeySchema", () => {
  const validInput = {
    orgPublicKey: base64OfBytes(32),
    ephemeralPoint: base64OfBytes(32),
    nonce: base64OfBytes(24),
    wrappedKey: base64OfBytes(56),
  };

  it("accepts valid org public key upload", () => {
    const result = uploadOrgPublicKeySchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects orgPublicKey with wrong byte length (31 bytes)", () => {
    const result = uploadOrgPublicKeySchema.safeParse({
      ...validInput,
      orgPublicKey: base64OfBytes(31),
    });
    expect(result.success).toBe(false);
  });

  it("rejects orgPublicKey with wrong byte length (33 bytes)", () => {
    const result = uploadOrgPublicKeySchema.safeParse({
      ...validInput,
      orgPublicKey: base64OfBytes(33),
    });
    expect(result.success).toBe(false);
  });

  it("rejects ephemeralPoint with wrong byte length", () => {
    const result = uploadOrgPublicKeySchema.safeParse({
      ...validInput,
      ephemeralPoint: base64OfBytes(31),
    });
    expect(result.success).toBe(false);
  });

  it("rejects nonce with wrong byte length", () => {
    const result = uploadOrgPublicKeySchema.safeParse({
      ...validInput,
      nonce: base64OfBytes(16),
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-base64 wrappedKey", () => {
    const result = uploadOrgPublicKeySchema.safeParse({
      ...validInput,
      wrappedKey: "not!valid@base64#chars",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing orgPublicKey", () => {
    const result = uploadOrgPublicKeySchema.safeParse({
      ephemeralPoint: validInput.ephemeralPoint,
      nonce: validInput.nonce,
      wrappedKey: validInput.wrappedKey,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing ephemeralPoint", () => {
    const result = uploadOrgPublicKeySchema.safeParse({
      orgPublicKey: validInput.orgPublicKey,
      nonce: validInput.nonce,
      wrappedKey: validInput.wrappedKey,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing nonce", () => {
    const result = uploadOrgPublicKeySchema.safeParse({
      orgPublicKey: validInput.orgPublicKey,
      ephemeralPoint: validInput.ephemeralPoint,
      wrappedKey: validInput.wrappedKey,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing wrappedKey", () => {
    const result = uploadOrgPublicKeySchema.safeParse({
      orgPublicKey: validInput.orgPublicKey,
      ephemeralPoint: validInput.ephemeralPoint,
      nonce: validInput.nonce,
    });
    expect(result.success).toBe(false);
  });

  it("strips extra fields from output", () => {
    const result = uploadOrgPublicKeySchema.safeParse({
      ...validInput,
      extraField: "should be stripped",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("extraField");
    }
  });
});
