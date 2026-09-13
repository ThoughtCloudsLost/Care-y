/**
 * One-time script: generates the two OPRF master shares as independent
 * random scalars, hex-encoded for the .env files of the two share processes.
 *
 * Under per-tag derivation (ADR-091) the shares ARE the long-term secret:
 * every working key derives per identity tag from them, and the combined
 * key never exists anywhere, this script included. With evaluation points
 * x=1 and x=2, the implicit combined key is 2*shareA - shareB; two uniform
 * random shares define a uniform random key, so nothing is lost by never
 * materializing it.
 *
 * Escrow stores both shares (serializeOprfShares in @care-y/crypto builds
 * the payload), not a reconstructed key.
 *
 * Uses @care-y/crypto (sumo WASM) for ristretto255 scalar operations.
 * sodium-native does not expose ristretto255 scalar arithmetic.
 *
 * Usage: pnpm --filter @care-y/server exec tsx src/scripts/generate-oprf-shares.ts
 */

import { getSodium, requireSodium } from "@care-y/crypto";

async function generateShares(): Promise<{
  shareA: string;
  shareB: string;
}> {
  await getSodium();
  const sodium = requireSodium();

  const shareA = sodium.crypto_core_ristretto255_scalar_random();
  const shareB = sodium.crypto_core_ristretto255_scalar_random();

  const result = {
    shareA: Buffer.from(shareA).toString("hex"),
    shareB: Buffer.from(shareB).toString("hex"),
  };

  sodium.memzero(shareA);
  sodium.memzero(shareB);

  return result;
}

const shares = await generateShares();
console.log("# OPRF master shares (add to .env)");
console.log(`OPRF_SHARE_A_HEX=${shares.shareA}`);
console.log(`OPRF_SHARE_B_HEX=${shares.shareB}`);
console.log(
  "# Escrow both shares offline (passphrase-encrypted; see ADR-019).",
);
console.log(
  "# No combined key exists to escrow under per-tag derivation (ADR-091).",
);
