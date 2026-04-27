/**
 * Client-side proof-of-work solver for OPRF rate limiting.
 *
 * The server issues a SHA-256 hashcash challenge: find a solution string
 * such that SHA-256(challenge || solution) has at least `difficulty`
 * leading zero bits. The solver brute-forces incrementing nonces in
 * batches, yielding to the event loop between batches to avoid
 * blocking the UI.
 *
 * Used by both login and password change flows via evaluateWithPowRetry.
 */

const BATCH_SIZE = 4096;
const encoder = new TextEncoder();

export function hasLeadingZeroBits(hash: Uint8Array, bits: number): boolean {
  const fullBytes = Math.floor(bits / 8);
  const remainingBits = bits % 8;

  for (let i = 0; i < fullBytes; i++) {
    // eslint-disable-next-line security/detect-object-injection -- loop counter bounded by hash length
    if (hash[i] !== 0) return false;
  }

  if (remainingBits > 0) {
    const mask = 0xff << (8 - remainingBits);
    // eslint-disable-next-line security/detect-object-injection -- Math.floor(bits/8), bounded by hash length
    if (((hash[fullBytes] ?? 0xff) & mask) !== 0) return false;
  }

  return true;
}

/**
 * Solve a proof-of-work challenge by brute-forcing SHA-256.
 *
 * @returns Hex-encoded solution string that satisfies the difficulty.
 */
export async function solveProofOfWork(
  challenge: string,
  difficulty: number,
): Promise<string> {
  const challengeBytes = encoder.encode(challenge);
  let nonce = 0;

  for (;;) {
    for (let i = 0; i < BATCH_SIZE; i++) {
      const solution = nonce.toString(16);
      const solutionBytes = encoder.encode(solution);

      const combined = new Uint8Array(
        challengeBytes.length + solutionBytes.length,
      );
      combined.set(challengeBytes);
      combined.set(solutionBytes, challengeBytes.length);

      const hashBuf = await crypto.subtle.digest("SHA-256", combined);
      const hash = new Uint8Array(hashBuf);

      if (hasLeadingZeroBits(hash, difficulty)) {
        return solution;
      }

      nonce++;
    }

    // Yield to event loop between batches so the UI stays responsive
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
  }
}
