import { describe, expect, it } from "vitest";
import { createScryptHasher } from "./password.js";

describe("createScryptHasher", () => {
  const hasher = createScryptHasher();

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

  // Format test guards backward compatibility with hashes already persisted
  // in the DB. Changing the serialization format (e.g., to PHC "$scrypt$..."
  // style) would silently break verification of all existing passwords.
  it("hash output follows scrypt:<salt-hex>:<hash-hex> format", async () => {
    const hash = await hasher.hash("test");
    const parts = hash.split(":");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe("scrypt");
    // 16-byte salt = 32 hex chars
    expect(parts[1]).toHaveLength(32);
    // 64-byte key = 128 hex chars
    expect(parts[2]).toHaveLength(128);
  });

  describe("verify rejects malformed hashes", () => {
    it("returns false for empty string", async () => {
      expect(await hasher.verify("pw", "")).toBe(false);
    });

    it("returns false for wrong prefix", async () => {
      expect(await hasher.verify("pw", "bcrypt:abc:def")).toBe(false);
    });

    it("returns false for too few parts", async () => {
      expect(await hasher.verify("pw", "scrypt:onlyonepart")).toBe(false);
    });

    it("returns false for too many parts", async () => {
      expect(await hasher.verify("pw", "scrypt:a:b:c")).toBe(false);
    });

    it("returns false for wrong salt length", async () => {
      const shortSalt = "aa".repeat(8); // 8 bytes, need 16
      const fakeHash = "bb".repeat(64);
      expect(await hasher.verify("pw", `scrypt:${shortSalt}:${fakeHash}`)).toBe(
        false,
      );
    });

    it("returns false for wrong hash length", async () => {
      const salt = "aa".repeat(16);
      const shortHash = "bb".repeat(32); // 32 bytes, need 64
      expect(await hasher.verify("pw", `scrypt:${salt}:${shortHash}`)).toBe(
        false,
      );
    });

    it("returns false for non-hex characters in salt", async () => {
      const badSalt = "zz".repeat(16);
      const fakeHash = "bb".repeat(64);
      // Buffer.from with 'hex' silently drops invalid pairs, producing
      // a shorter buffer that fails the length check.
      expect(await hasher.verify("pw", `scrypt:${badSalt}:${fakeHash}`)).toBe(
        false,
      );
    });
  });

  it("handles empty password string", async () => {
    const hash = await hasher.hash("");
    expect(await hasher.verify("", hash)).toBe(true);
    expect(await hasher.verify("notempty", hash)).toBe(false);
  });

  it("handles unicode passwords", async () => {
    const hash = await hasher.hash("p\u00e4ssw\u00f6rd\u{1F512}");
    expect(await hasher.verify("p\u00e4ssw\u00f6rd\u{1F512}", hash)).toBe(true);
    expect(await hasher.verify("password", hash)).toBe(false);
  });
});
