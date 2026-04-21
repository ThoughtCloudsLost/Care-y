import { describe, expect, it } from "vitest";
import {
  updateDisplayNameSchema,
  adminUpdateDisplayNameSchema,
  updateUsernameSchema,
  adminUpdateUsernameSchema,
  updatePasswordHashSchema,
} from "./profile.js";

describe("updateDisplayNameSchema", () => {
  it("accepts a non-empty ciphertext string", () => {
    const result = updateDisplayNameSchema.safeParse({
      encryptedDisplayName: "dGVzdA==",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty encryptedDisplayName", () => {
    const result = updateDisplayNameSchema.safeParse({
      encryptedDisplayName: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing encryptedDisplayName", () => {
    const result = updateDisplayNameSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("adminUpdateDisplayNameSchema", () => {
  it("accepts valid userId and ciphertext", () => {
    const result = adminUpdateDisplayNameSchema.safeParse({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      encryptedDisplayName: "dGVzdA==",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-uuid userId", () => {
    const result = adminUpdateDisplayNameSchema.safeParse({
      userId: "not-a-uuid",
      encryptedDisplayName: "dGVzdA==",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing userId", () => {
    const result = adminUpdateDisplayNameSchema.safeParse({
      encryptedDisplayName: "dGVzdA==",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateUsernameSchema", () => {
  it("accepts valid password and identifier", () => {
    const result = updateUsernameSchema.safeParse({
      currentPassword: "a-secure-password-16chars",
      newIdentifier: "alice",
    });
    expect(result.success).toBe(true);
  });

  it("normalizes identifier to lowercase", () => {
    const result = updateUsernameSchema.safeParse({
      currentPassword: "a-secure-password-16chars",
      newIdentifier: "Alice",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.newIdentifier).toBe("alice");
    }
  });

  it("rejects password under 16 characters", () => {
    const result = updateUsernameSchema.safeParse({
      currentPassword: "short",
      newIdentifier: "alice",
    });
    expect(result.success).toBe(false);
  });

  it("rejects identifier under 3 characters", () => {
    const result = updateUsernameSchema.safeParse({
      currentPassword: "a-secure-password-16chars",
      newIdentifier: "ab",
    });
    expect(result.success).toBe(false);
  });

  it("rejects identifier with invalid characters", () => {
    const result = updateUsernameSchema.safeParse({
      currentPassword: "a-secure-password-16chars",
      newIdentifier: "alice@bob",
    });
    expect(result.success).toBe(false);
  });
});

describe("adminUpdateUsernameSchema", () => {
  it("accepts valid userId and identifier", () => {
    const result = adminUpdateUsernameSchema.safeParse({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      newIdentifier: "bob",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-uuid userId", () => {
    const result = adminUpdateUsernameSchema.safeParse({
      userId: "not-a-uuid",
      newIdentifier: "bob",
    });
    expect(result.success).toBe(false);
  });
});

describe("updatePasswordHashSchema", () => {
  it("accepts valid current and new passwords", () => {
    const result = updatePasswordHashSchema.safeParse({
      currentPassword: "old-password-16chars!",
      newPassword: "new-password-16chars!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects currentPassword under 16 characters", () => {
    const result = updatePasswordHashSchema.safeParse({
      currentPassword: "short",
      newPassword: "new-password-16chars!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects newPassword under 16 characters", () => {
    const result = updatePasswordHashSchema.safeParse({
      currentPassword: "old-password-16chars!",
      newPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(updatePasswordHashSchema.safeParse({}).success).toBe(false);
    expect(
      updatePasswordHashSchema.safeParse({
        currentPassword: "old-password-16chars!",
      }).success,
    ).toBe(false);
  });
});
