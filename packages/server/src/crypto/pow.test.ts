import { describe, it, expect, afterEach } from "vitest";
import { createHash, randomBytes } from "node:crypto";
import {
  getDifficulty,
  hasLeadingZeroBits,
  createPowVerifier,
  type PowConfig,
} from "./pow.js";

/**
 * Brute-force a valid PoW solution for testing.
 * Only practical at low difficulty (8 bits = ~256 attempts).
 */
function solvePow(challenge: string, difficulty: number): string {
  for (let i = 0; i < 1_000_000; i++) {
    const solution = String(i);
    const hash = createHash("sha256")
      .update(challenge)
      .update(solution)
      .digest();
    if (hasLeadingZeroBits(hash, difficulty)) {
      return solution;
    }
  }
  throw new Error("Failed to solve PoW in 1M attempts");
}

describe("getDifficulty", () => {
  it("returns 16 for low failure counts (0-4)", () => {
    expect(getDifficulty(0)).toBe(16);
    expect(getDifficulty(3)).toBe(16);
    expect(getDifficulty(4)).toBe(16);
  });

  it("returns 20 for moderate failure counts (5-7)", () => {
    expect(getDifficulty(5)).toBe(20);
    expect(getDifficulty(7)).toBe(20);
  });

  it("returns 22 for high failure counts (8+)", () => {
    expect(getDifficulty(8)).toBe(22);
    expect(getDifficulty(100)).toBe(22);
  });
});

describe("hasLeadingZeroBits", () => {
  it("accepts all-zero buffer for any difficulty", () => {
    const zeros = Buffer.alloc(32, 0);
    expect(hasLeadingZeroBits(zeros, 8)).toBe(true);
    expect(hasLeadingZeroBits(zeros, 16)).toBe(true);
    expect(hasLeadingZeroBits(zeros, 32)).toBe(true);
  });

  it("rejects buffer starting with 0x01 for difficulty >= 8", () => {
    const buf = Buffer.alloc(32, 0);
    buf[0] = 0x01;
    expect(hasLeadingZeroBits(buf, 8)).toBe(false);
  });

  it("accepts buffer starting with 0x01 for difficulty 7", () => {
    const buf = Buffer.alloc(32, 0);
    buf[0] = 0x01;
    expect(hasLeadingZeroBits(buf, 7)).toBe(true);
  });

  it("handles non-byte-aligned difficulty correctly", () => {
    const buf = Buffer.alloc(32, 0);
    // 0x08 = 0b00001000 -> 4 leading zeros in first byte
    buf[0] = 0x08;
    expect(hasLeadingZeroBits(buf, 4)).toBe(true);
    expect(hasLeadingZeroBits(buf, 5)).toBe(false);
  });

  it("handles difficulty 0 (always passes)", () => {
    const buf = Buffer.from([0xff]);
    expect(hasLeadingZeroBits(buf, 0)).toBe(true);
  });
});

describe("PowVerifier", () => {
  const TEST_CONFIG: PowConfig = {
    baseDifficulty: 8,
    challengeTtlMs: 60_000,
  };

  let time = 1_000_000;
  const clock = (): number => time;

  afterEach(() => {
    time = 1_000_000;
  });

  describe("createChallenge", () => {
    it("returns unique nonces", () => {
      const verifier = createPowVerifier(TEST_CONFIG, clock);
      const c1 = verifier.createChallenge("user-1", 3);
      const c2 = verifier.createChallenge("user-1", 3);

      expect(c1.challenge).not.toBe(c2.challenge);
      // Challenge nonce is 32 bytes hex-encoded. Client PoW solver depends on this format.
      expect(c1.challenge.length).toBe(64); // 32 bytes hex
      verifier.dispose();
    });

    it("returns correct difficulty based on failure count", () => {
      const verifier = createPowVerifier(TEST_CONFIG, clock);

      expect(verifier.createChallenge("u", 3).difficulty).toBe(16);
      expect(verifier.createChallenge("u", 5).difficulty).toBe(20);
      expect(verifier.createChallenge("u", 8).difficulty).toBe(22);
      verifier.dispose();
    });

    it("returns valid ISO datetime for expiresAt", () => {
      const verifier = createPowVerifier(TEST_CONFIG, clock);
      const c = verifier.createChallenge("user-1", 3);

      expect(() => new Date(c.expiresAt)).not.toThrow();
      expect(new Date(c.expiresAt).getTime()).toBe(
        time + TEST_CONFIG.challengeTtlMs,
      );
      verifier.dispose();
    });
  });

  describe("verify", () => {
    it("accepts a valid solution", () => {
      const verifier = createPowVerifier(TEST_CONFIG, clock);
      const c = verifier.createChallenge("user-1", 0);
      const solution = solvePow(c.challenge, c.difficulty);

      expect(verifier.verify("user-1", c.challenge, solution)).toBe(true);
      verifier.dispose();
    });

    it("rejects a replayed (already-used) solution", () => {
      const verifier = createPowVerifier(TEST_CONFIG, clock);
      const c = verifier.createChallenge("user-1", 0);
      const solution = solvePow(c.challenge, c.difficulty);

      expect(verifier.verify("user-1", c.challenge, solution)).toBe(true);
      expect(verifier.verify("user-1", c.challenge, solution)).toBe(false);
      verifier.dispose();
    });

    it("rejects wrong userId", () => {
      const verifier = createPowVerifier(TEST_CONFIG, clock);
      const c = verifier.createChallenge("user-1", 0);
      const solution = solvePow(c.challenge, c.difficulty);

      expect(verifier.verify("user-2", c.challenge, solution)).toBe(false);
      verifier.dispose();
    });

    it("rejects expired challenge", () => {
      const verifier = createPowVerifier(TEST_CONFIG, clock);
      const c = verifier.createChallenge("user-1", 0);
      const solution = solvePow(c.challenge, c.difficulty);

      time += TEST_CONFIG.challengeTtlMs + 1;

      expect(verifier.verify("user-1", c.challenge, solution)).toBe(false);
      verifier.dispose();
    });

    it("rejects unknown challenge nonce", () => {
      const verifier = createPowVerifier(TEST_CONFIG, clock);
      const fakeNonce = randomBytes(32).toString("hex");

      expect(verifier.verify("user-1", fakeNonce, "0")).toBe(false);
      verifier.dispose();
    });

    it("rejects wrong solution (hash does not meet difficulty)", () => {
      const verifier = createPowVerifier(TEST_CONFIG, clock);
      const c = verifier.createChallenge("user-1", 0);

      expect(verifier.verify("user-1", c.challenge, "definitely-wrong")).toBe(
        false,
      );
      verifier.dispose();
    });
  });

  describe("cleanup", () => {
    it("expired challenges are rejected after TTL", () => {
      const verifier = createPowVerifier(TEST_CONFIG, clock);
      const c = verifier.createChallenge("user-1", 0);
      const solution = solvePow(c.challenge, c.difficulty);

      time += TEST_CONFIG.challengeTtlMs + 1;

      expect(verifier.verify("user-1", c.challenge, solution)).toBe(false);
      verifier.dispose();
    });
  });
});
