import { describe, expect, it } from "vitest";
import {
  emailSchema,
  passwordSchema,
  displayNameSchema,
  loginInputSchema,
  registerInputSchema,
} from "./auth.js";

describe("emailSchema", () => {
  it("accepts a valid email", () => {
    const result = emailSchema.safeParse("Carey@Example.COM");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("carey@example.com");
    }
  });

  it("trims whitespace before validating", () => {
    const result = emailSchema.safeParse("  carey@example.com  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("carey@example.com");
    }
  });

  it("rejects invalid email format", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    expect(emailSchema.safeParse("@missing-local.com").success).toBe(false);
    expect(emailSchema.safeParse("missing-domain@").success).toBe(false);
  });

  it("rejects email exceeding 254 characters", () => {
    const long = "a".repeat(243) + "@example.com"; // 255 chars
    expect(emailSchema.safeParse(long).success).toBe(false);
  });

  it("accepts email at exactly 254 characters", () => {
    const exact = "a".repeat(242) + "@example.com"; // 254 chars
    expect(emailSchema.safeParse(exact).success).toBe(true);
  });

  it("rejects empty string", () => {
    expect(emailSchema.safeParse("").success).toBe(false);
  });

  it("rejects email with internal spaces", () => {
    expect(emailSchema.safeParse("carey @example.com").success).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(emailSchema.safeParse(123).success).toBe(false);
    expect(emailSchema.safeParse(null).success).toBe(false);
    expect(emailSchema.safeParse(undefined).success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts a 16-character password", () => {
    expect(passwordSchema.safeParse("a".repeat(16)).success).toBe(true);
  });

  it("accepts a 256-character password", () => {
    expect(passwordSchema.safeParse("a".repeat(256)).success).toBe(true);
  });

  it("rejects passwords shorter than 16 characters", () => {
    const result = passwordSchema.safeParse("a".repeat(15));
    expect(result.success).toBe(false);
  });

  it("rejects passwords longer than 256 characters", () => {
    const result = passwordSchema.safeParse("a".repeat(257));
    expect(result.success).toBe(false);
  });

  it("accepts unicode characters (emoji password)", () => {
    // 16 emoji = 16 chars (JS string length), valid
    const emoji = "\u{1F600}".repeat(16);
    expect(passwordSchema.safeParse(emoji).success).toBe(true);
  });

  it("rejects empty string", () => {
    expect(passwordSchema.safeParse("").success).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(passwordSchema.safeParse(12345678901234567).success).toBe(false);
    expect(passwordSchema.safeParse(null).success).toBe(false);
  });

  it("provides a clear error message for too-short passwords", () => {
    const result = passwordSchema.safeParse("short");
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("16"))).toBe(true);
    }
  });
});

describe("displayNameSchema", () => {
  it("accepts a valid name", () => {
    expect(displayNameSchema.safeParse("Alice").success).toBe(true);
  });

  it("trims whitespace", () => {
    const result = displayNameSchema.safeParse("  Bob  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("Bob");
    }
  });

  it("rejects empty string", () => {
    expect(displayNameSchema.safeParse("").success).toBe(false);
  });

  it("rejects whitespace-only string", () => {
    expect(displayNameSchema.safeParse("   ").success).toBe(false);
  });

  it("rejects names longer than 100 characters", () => {
    expect(displayNameSchema.safeParse("a".repeat(101)).success).toBe(false);
  });

  it("accepts name at exactly 100 characters", () => {
    expect(displayNameSchema.safeParse("a".repeat(100)).success).toBe(true);
  });

  it("accepts single character after trim", () => {
    expect(displayNameSchema.safeParse("X").success).toBe(true);
  });

  it("accepts unicode names", () => {
    expect(displayNameSchema.safeParse("Ren\u00e9e").success).toBe(true);
    expect(displayNameSchema.safeParse("\u5c0f\u660e").success).toBe(true); // CJK
  });

  it("rejects non-string input", () => {
    expect(displayNameSchema.safeParse(42).success).toBe(false);
    expect(displayNameSchema.safeParse(null).success).toBe(false);
  });
});

describe("loginInputSchema", () => {
  it("validates a complete login input", () => {
    const result = loginInputSchema.safeParse({
      email: "carey@example.com",
      password: "securepassword16",
    });
    expect(result.success).toBe(true);
  });

  it("normalizes email in login input", () => {
    const result = loginInputSchema.safeParse({
      email: "CAREY@EXAMPLE.COM",
      password: "securepassword16",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("carey@example.com");
    }
  });

  it("rejects missing email", () => {
    const result = loginInputSchema.safeParse({
      password: "securepassword16",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing password", () => {
    const result = loginInputSchema.safeParse({ email: "carey@example.com" });
    expect(result.success).toBe(false);
  });
});

describe("registerInputSchema", () => {
  it("validates a complete registration input", () => {
    const result = registerInputSchema.safeParse({
      email: "carey@example.com",
      password: "strongpassword16",
      displayName: "New User",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing displayName", () => {
    const result = registerInputSchema.safeParse({
      email: "carey@example.com",
      password: "strongpassword16",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password in registration", () => {
    const result = registerInputSchema.safeParse({
      email: "carey@example.com",
      password: "short",
      displayName: "New User",
    });
    expect(result.success).toBe(false);
  });

  it("strips extra fields from output", () => {
    const result = registerInputSchema.safeParse({
      email: "carey@example.com",
      password: "strongpassword16",
      displayName: "Carey",
      isAdmin: true,
      role: "superuser",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("isAdmin");
      expect(result.data).not.toHaveProperty("role");
    }
  });
});
