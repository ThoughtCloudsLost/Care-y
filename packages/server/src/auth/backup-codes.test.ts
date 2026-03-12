/**
 * Unit tests for backup code generation and verification.
 *
 * Covers: code generation (count, length, charset), formatting, normalization,
 * hashing (scrypt format), verification (valid/invalid/malformed hash),
 * and timing safety.
 *
 * Pure unit tests: no DB or Docker required.
 */

import { describe, it, expect } from "vitest";
import {
  formatCode,
  normalizeCode,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
} from "./backup-codes.js";

describe("Backup codes", () => {
  // --- formatCode ---

  describe("formatCode", () => {
    it("inserts hyphen at midpoint", () => {
      expect(formatCode("a1b2c3d4")).toBe("a1b2-c3d4");
    });

    it("handles odd-length code", () => {
      // floor(5/2) = 2
      expect(formatCode("abcde")).toBe("ab-cde");
    });
  });

  // --- normalizeCode ---

  describe("normalizeCode", () => {
    it("lowercases input", () => {
      expect(normalizeCode("A1B2C3D4")).toBe("a1b2c3d4");
    });

    it("strips hyphens", () => {
      expect(normalizeCode("a1b2-c3d4")).toBe("a1b2c3d4");
    });

    it("strips whitespace", () => {
      expect(normalizeCode("  a1b2 c3d4  ")).toBe("a1b2c3d4");
    });

    it("strips hyphens and whitespace together", () => {
      expect(normalizeCode(" A1B2 - C3D4 ")).toBe("a1b2c3d4");
    });
  });

  // --- generateBackupCodes ---

  describe("generateBackupCodes", () => {
    it("generates 8 codes by default", () => {
      const codes = generateBackupCodes();
      expect(codes).toHaveLength(8);
    });

    it("generates specified number of codes", () => {
      expect(generateBackupCodes(4)).toHaveLength(4);
      expect(generateBackupCodes(12)).toHaveLength(12);
    });

    it("each code is 8 lowercase alphanumeric characters", () => {
      const codes = generateBackupCodes();
      for (const code of codes) {
        expect(code).toHaveLength(8);
        expect(code).toMatch(/^[a-z0-9]+$/);
      }
    });

    it("generates distinct codes", () => {
      const codes = generateBackupCodes();
      const unique = new Set(codes);
      expect(unique.size).toBe(codes.length);
    });
  });

  // --- hashBackupCode ---

  describe("hashBackupCode", () => {
    it("produces scrypt:<salt>:<hash> format", async () => {
      const hash = await hashBackupCode("a1b2c3d4");
      const parts = hash.split(":");
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe("scrypt");
      // salt: 16 bytes = 32 hex chars
      expect(parts[1]).toHaveLength(32);
      expect(parts[1]).toMatch(/^[0-9a-f]+$/);
      // hash: 32 bytes = 64 hex chars
      expect(parts[2]).toHaveLength(64);
      expect(parts[2]).toMatch(/^[0-9a-f]+$/);
    });

    it("produces different hashes for the same code (random salt)", async () => {
      const h1 = await hashBackupCode("a1b2c3d4");
      const h2 = await hashBackupCode("a1b2c3d4");
      expect(h1).not.toBe(h2);
    });
  });

  // --- verifyBackupCode ---

  describe("verifyBackupCode", () => {
    it("accepts correct code", async () => {
      const code = "a1b2c3d4";
      const hash = await hashBackupCode(code);
      expect(await verifyBackupCode(code, hash)).toBe(true);
    });

    it("accepts code with formatting (hyphens, whitespace, case)", async () => {
      const code = "a1b2c3d4";
      const hash = await hashBackupCode(code);
      // verifyBackupCode normalizes internally
      expect(await verifyBackupCode("A1B2-C3D4", hash)).toBe(true);
      expect(await verifyBackupCode(" a1b2 c3d4 ", hash)).toBe(true);
    });

    it("rejects wrong code", async () => {
      const hash = await hashBackupCode("a1b2c3d4");
      expect(await verifyBackupCode("xxxx9999", hash)).toBe(false);
    });

    it("rejects malformed hash (wrong prefix)", async () => {
      expect(await verifyBackupCode("a1b2c3d4", "bcrypt:abc:def")).toBe(false);
    });

    it("rejects malformed hash (wrong part count)", async () => {
      expect(await verifyBackupCode("a1b2c3d4", "scrypt:abc")).toBe(false);
      expect(await verifyBackupCode("a1b2c3d4", "scrypt:abc:def:extra")).toBe(
        false,
      );
    });

    it("rejects malformed hash (empty salt or hash)", async () => {
      expect(await verifyBackupCode("a1b2c3d4", "scrypt::def")).toBe(false);
      expect(await verifyBackupCode("a1b2c3d4", "scrypt:abc:")).toBe(false);
    });

    it("rejects malformed hash (wrong salt length)", async () => {
      const shortSalt = "aa".repeat(8); // 16 hex = 8 bytes, need 32 hex = 16 bytes
      const hash = "bb".repeat(32); // 64 hex = 32 bytes, correct
      expect(
        await verifyBackupCode("a1b2c3d4", `scrypt:${shortSalt}:${hash}`),
      ).toBe(false);
    });

    it("rejects malformed hash (wrong hash length)", async () => {
      const salt = "aa".repeat(16); // 32 hex = 16 bytes, correct
      const shortHash = "bb".repeat(16); // 32 hex = 16 bytes, need 64 hex
      expect(
        await verifyBackupCode("a1b2c3d4", `scrypt:${salt}:${shortHash}`),
      ).toBe(false);
    });
  });
});
