import { createHash, randomBytes } from "node:crypto";
import { createCleanupInterval } from "../utils/intervals.js";
import { findTier, type Tier } from "../utils/tiers.js";

export interface PowConfig {
  /** Number of leading zero bits required (difficulty) */
  readonly baseDifficulty: number;
  /** Challenge expiry in milliseconds (default: 5 minutes) */
  readonly challengeTtlMs: number;
}

export const DEFAULT_POW_CONFIG: PowConfig = {
  baseDifficulty: 16,
  challengeTtlMs: 5 * 60 * 1000,
};

interface StoredChallenge {
  readonly userId: string;
  readonly difficulty: number;
  readonly expiresAt: number;
  used: boolean;
}

/**
 * Difficulty tiers: more failures require harder proof-of-work.
 * Values are leading zero bits in the SHA-256 hash.
 */
const DIFFICULTY_TIERS: readonly Tier<number>[] = [
  { minFailures: 8, value: 22 },
  { minFailures: 5, value: 20 },
];

/** Difficulty scaling based on failure count within the PoW window. */
export function getDifficulty(failureCount: number): number {
  return findTier(
    DIFFICULTY_TIERS,
    failureCount,
    DEFAULT_POW_CONFIG.baseDifficulty,
  );
}

export interface PowVerifier {
  /** Creates a new challenge for a userId. Returns nonce + difficulty + expiresAt. */
  createChallenge(
    userId: string,
    failureCount: number,
  ): {
    challenge: string;
    difficulty: number;
    expiresAt: string;
  };
  /** Verifies a PoW solution. Returns true if valid and unused. */
  verify(userId: string, challenge: string, solution: string): boolean;
  /** Stop the cleanup interval (for tests). */
  dispose(): void;
}

export function createPowVerifier(
  config: PowConfig = DEFAULT_POW_CONFIG,
  now: () => number = Date.now,
): PowVerifier {
  const challenges = new Map<string, StoredChallenge>();

  const dispose = createCleanupInterval(60_000, () => {
    const current = now();
    for (const [key, stored] of challenges) {
      if (stored.expiresAt <= current) {
        challenges.delete(key);
      }
    }
  });

  return {
    createChallenge(userId: string, failureCount: number) {
      const nonce = randomBytes(32).toString("hex");
      const difficulty = findTier(
        DIFFICULTY_TIERS,
        failureCount,
        config.baseDifficulty,
      );
      const expiresAt = now() + config.challengeTtlMs;

      challenges.set(nonce, {
        userId,
        difficulty,
        expiresAt,
        used: false,
      });

      return {
        challenge: nonce,
        difficulty,
        expiresAt: new Date(expiresAt).toISOString(),
      };
    },

    verify(userId: string, challenge: string, solution: string): boolean {
      const stored = challenges.get(challenge);

      if (stored == null) return false;
      if (stored.expiresAt <= now()) {
        challenges.delete(challenge);
        return false;
      }
      if (stored.used) return false;
      if (stored.userId !== userId) return false;

      const hash = createHash("sha256")
        .update(challenge)
        .update(solution)
        .digest();

      if (!hasLeadingZeroBits(hash, stored.difficulty)) {
        return false;
      }

      stored.used = true;
      return true;
    },

    dispose,
  };
}

/** Check if a hash has at least N leading zero bits. */
export function hasLeadingZeroBits(hash: Buffer, bits: number): boolean {
  const fullBytes = Math.floor(bits / 8);
  const remainingBits = bits % 8;

  for (let i = 0; i < fullBytes; i++) {
    // eslint-disable-next-line security/detect-object-injection -- Buffer indexed by loop counter bounded by hash length
    if (hash[i] !== 0) return false;
  }

  if (remainingBits > 0) {
    const mask = 0xff << (8 - remainingBits);
    // eslint-disable-next-line security/detect-object-injection -- Buffer indexed by Math.floor(bits/8), bounded by hash length
    if (((hash[fullBytes] ?? 0xff) & mask) !== 0) return false;
  }

  return true;
}
