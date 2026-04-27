import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { solveProofOfWork, hasLeadingZeroBits } from "./pow-solver.js";

describe("hasLeadingZeroBits", () => {
  it("returns true for all-zero hash at any difficulty", () => {
    const hash = new Uint8Array(32);
    expect(hasLeadingZeroBits(hash, 8)).toBe(true);
    expect(hasLeadingZeroBits(hash, 16)).toBe(true);
    expect(hasLeadingZeroBits(hash, 256)).toBe(true);
  });

  it("returns true for 0 difficulty on any hash", () => {
    const hash = new Uint8Array([0xff, 0xff, 0xff]);
    expect(hasLeadingZeroBits(hash, 0)).toBe(true);
  });

  it("checks full bytes correctly", () => {
    const hash = new Uint8Array([0x00, 0x00, 0x01]);
    expect(hasLeadingZeroBits(hash, 16)).toBe(true);
    expect(hasLeadingZeroBits(hash, 24)).toBe(false);
  });

  it("checks partial bits correctly", () => {
    // 0x0f = 0000 1111 -> 4 leading zero bits
    const hash = new Uint8Array([0x0f]);
    expect(hasLeadingZeroBits(hash, 4)).toBe(true);
    expect(hasLeadingZeroBits(hash, 5)).toBe(false);
  });

  it("matches the server-side hasLeadingZeroBits for known inputs", () => {
    // 0x00 0x03 = 0000 0000 0000 0011 -> 14 leading zero bits
    const hash = new Uint8Array([0x00, 0x03, 0xff]);
    expect(hasLeadingZeroBits(hash, 14)).toBe(true);
    expect(hasLeadingZeroBits(hash, 15)).toBe(false);
  });
});

describe("solveProofOfWork", () => {
  it("returns a solution that satisfies the difficulty", async () => {
    const challenge = "test-challenge-hex-string-1234567890abcdef";
    const difficulty = 8;

    const solution = await solveProofOfWork(challenge, difficulty);

    expect(typeof solution).toBe("string");
    expect(solution.length).toBeGreaterThan(0);

    // Verify the solution using Node's createHash (same as the server)
    const hash = createHash("sha256")
      .update(challenge)
      .update(solution)
      .digest();
    const hashBytes = new Uint8Array(hash);
    expect(hasLeadingZeroBits(hashBytes, difficulty)).toBe(true);
  });

  it("produces solutions compatible with server verification", async () => {
    const challenge = "a]b]c]d]e]f]0]1]2]3]4]5]6]7]8]9";
    const difficulty = 12;

    const solution = await solveProofOfWork(challenge, difficulty);

    // Server verification: SHA-256(challenge || solution) has `difficulty` leading zero bits
    const serverHash = createHash("sha256")
      .update(challenge)
      .update(solution)
      .digest();

    expect(serverHash[0]).toBe(0);
    expect((serverHash[1]! & 0xf0) === 0).toBe(true);
  });

  it("solves difficulty 0 immediately (first nonce)", async () => {
    const solution = await solveProofOfWork("any-challenge", 0);
    expect(solution).toBe("0");
  });
});
