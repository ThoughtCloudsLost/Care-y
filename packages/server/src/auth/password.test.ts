import { describe, expect, it } from "vitest";
import {
  AUTH_ARGON2ID_PARAMS,
  AUTH_ARGON2ID_TEST_PARAMS,
  createCodeHasher,
  createPasswordHasher,
} from "./password.js";
import { CryptoError } from "../errors.js";

describe("createPasswordHasher", () => {
  const hasher = createPasswordHasher(AUTH_ARGON2ID_TEST_PARAMS);

  it("hash then verify roundtrips successfully", async () => {
    const hash = await hasher.hash("correct-horse-battery-staple");
    const ok = await hasher.verify("correct-horse-battery-staple", hash);
    expect(ok).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hasher.hash("real-password");
    const ok = await hasher.verify("wrong-password", hash);
    expect(ok).toBe(false);
  });

  it("produces different hashes for the same password (random salt)", async () => {
    const h1 = await hasher.hash("same-password");
    const h2 = await hasher.hash("same-password");
    expect(h1).not.toBe(h2);
  });

  it("stores an Argon2id string with no trailing NUL padding", async () => {
    const hash = await hasher.hash("test-password");
    expect(hash.startsWith("$argon2id$")).toBe(true);
    expect(hash.includes("\0")).toBe(false);
  });

  it("hashPassword output verifies like hash output", async () => {
    const hash = await hasher.hashPassword("branded-password");
    expect(await hasher.verify("branded-password", hash)).toBe(true);
  });

  it("encodes the production cost parameters in the stored string", async () => {
    const production = createPasswordHasher(AUTH_ARGON2ID_PARAMS);
    const hash = await production.hash("production-cost");
    expect(hash).toContain("$m=65536,t=4,");
    expect(await production.verify("production-cost", hash)).toBe(true);
  });

  it("returns false for a scrypt-format stored hash", async () => {
    const legacy = await createCodeHasher().hash("legacy-password");
    expect(await hasher.verify("legacy-password", legacy)).toBe(false);
  });

  describe("verify rejects malformed hashes", () => {
    it("returns false for empty string", async () => {
      expect(await hasher.verify("pw", "")).toBe(false);
    });

    it("returns false for a non-Argon2id prefix", async () => {
      expect(await hasher.verify("pw", "$argon2i$v=19$m=8,t=1,p=1$a$b")).toBe(
        false,
      );
    });

    it("returns false for a truncated Argon2id string", async () => {
      const hash = await hasher.hash("pw-truncated");
      expect(await hasher.verify("pw-truncated", hash.slice(0, -4))).toBe(
        false,
      );
    });

    it("returns false for a string longer than the libsodium buffer", async () => {
      const oversized = "$argon2id$" + "A".repeat(200);
      expect(await hasher.verify("pw", oversized)).toBe(false);
    });
  });

  it("returns false when verifying an empty password", async () => {
    const hash = await hasher.hash("not-empty");
    expect(await hasher.verify("", hash)).toBe(false);
  });

  it("refuses to hash an empty password", async () => {
    await expect(hasher.hash("")).rejects.toBeInstanceOf(CryptoError);
  });

  it("handles unicode passwords", async () => {
    const hash = await hasher.hash("pässwörd\u{1F512}");
    expect(await hasher.verify("pässwörd\u{1F512}", hash)).toBe(true);
    expect(await hasher.verify("password", hash)).toBe(false);
  });
});

describe("createCodeHasher", () => {
  const hasher = createCodeHasher();

  it("hash then verify roundtrips successfully", async () => {
    const hash = await hasher.hashCode("123456");
    expect(await hasher.verify("123456", hash)).toBe(true);
    expect(await hasher.verify("654321", hash)).toBe(false);
  });

  it("keeps the scrypt:<salt-hex>:<hash-hex> format", async () => {
    const parts = (await hasher.hash("123456")).split(":");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe("scrypt");
    expect(parts[1]).toHaveLength(32);
    // 32-byte key = 64 hex chars
    expect(parts[2]).toHaveLength(64);
  });
});
