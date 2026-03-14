import { describe, expect, it } from "vitest";
import {
  oprfEvaluateInputSchema,
  oprfEvaluateOutputSchema,
  powChallengeSchema,
} from "./oprf.js";

describe("oprfEvaluateInputSchema", () => {
  const validInput = {
    userId: "550e8400-e29b-41d4-a716-446655440000",
    blindedElement: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
  };

  it("accepts valid userId and blindedElement", () => {
    const result = oprfEvaluateInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts PoW fields when present", () => {
    const result = oprfEvaluateInputSchema.safeParse({
      ...validInput,
      powChallenge: "abc123",
      powSolution: "def456",
    });
    expect(result.success).toBe(true);
  });

  it("PoW fields are optional", () => {
    const result = oprfEvaluateInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.powChallenge).toBeUndefined();
      expect(result.data.powSolution).toBeUndefined();
    }
  });

  it("rejects missing userId", () => {
    const result = oprfEvaluateInputSchema.safeParse({
      blindedElement: validInput.blindedElement,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing blindedElement", () => {
    const result = oprfEvaluateInputSchema.safeParse({
      userId: validInput.userId,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-UUID userId", () => {
    const result = oprfEvaluateInputSchema.safeParse({
      ...validInput,
      userId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty blindedElement", () => {
    const result = oprfEvaluateInputSchema.safeParse({
      ...validInput,
      blindedElement: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects blindedElement exceeding 64 characters", () => {
    const result = oprfEvaluateInputSchema.safeParse({
      ...validInput,
      blindedElement: "A".repeat(65),
    });
    expect(result.success).toBe(false);
  });

  it("accepts blindedElement at exactly 64 characters", () => {
    const result = oprfEvaluateInputSchema.safeParse({
      ...validInput,
      blindedElement: "A".repeat(64),
    });
    expect(result.success).toBe(true);
  });

  it("strips extra fields from output", () => {
    const result = oprfEvaluateInputSchema.safeParse({
      ...validInput,
      extraField: "should be stripped",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("extraField");
    }
  });
});

describe("oprfEvaluateOutputSchema", () => {
  it("accepts valid evaluated point", () => {
    const result = oprfEvaluateOutputSchema.safeParse({
      evaluated: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing evaluated field", () => {
    const result = oprfEvaluateOutputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty evaluated string", () => {
    const result = oprfEvaluateOutputSchema.safeParse({ evaluated: "" });
    expect(result.success).toBe(false);
  });
});

describe("powChallengeSchema", () => {
  const validChallenge = {
    challenge: "abc123def456",
    difficulty: 16,
    expiresAt: "2026-03-14T12:00:00Z",
  };

  it("accepts valid challenge", () => {
    const result = powChallengeSchema.safeParse(validChallenge);
    expect(result.success).toBe(true);
  });

  it("rejects difficulty below 1", () => {
    const result = powChallengeSchema.safeParse({
      ...validChallenge,
      difficulty: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects difficulty above 32", () => {
    const result = powChallengeSchema.safeParse({
      ...validChallenge,
      difficulty: 33,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer difficulty", () => {
    const result = powChallengeSchema.safeParse({
      ...validChallenge,
      difficulty: 16.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid datetime format for expiresAt", () => {
    const result = powChallengeSchema.safeParse({
      ...validChallenge,
      expiresAt: "not-a-datetime",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing challenge field", () => {
    const { challenge: _, ...rest } = validChallenge;
    const result = powChallengeSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing difficulty field", () => {
    const { difficulty: _, ...rest } = validChallenge;
    const result = powChallengeSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing expiresAt field", () => {
    const { expiresAt: _, ...rest } = validChallenge;
    const result = powChallengeSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("accepts boundary difficulty values", () => {
    expect(
      powChallengeSchema.safeParse({ ...validChallenge, difficulty: 1 })
        .success,
    ).toBe(true);
    expect(
      powChallengeSchema.safeParse({ ...validChallenge, difficulty: 32 })
        .success,
    ).toBe(true);
  });
});
