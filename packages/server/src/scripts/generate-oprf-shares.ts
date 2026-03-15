/**
 * One-time script: generates an OPRF key, splits into 2-of-2 Shamir shares,
 * outputs hex-encoded shares for .env file.
 *
 * Uses @care-y/crypto (sumo WASM) for ristretto255 scalar operations.
 * sodium-native does not expose ristretto255 scalar arithmetic.
 *
 * Usage: pnpm --filter @care-y/server exec tsx src/scripts/generate-oprf-shares.ts
 */

import { getSodium, requireSodium } from "@care-y/crypto";

async function generateShares(): Promise<{
  fullKey: string;
  shareA: string;
  shareB: string;
}> {
  await getSodium();
  const sodium = requireSodium();

  // Generate random OPRF key k (ristretto255 scalar)
  const k = sodium.crypto_core_ristretto255_scalar_random();

  // Random polynomial coefficient r
  const r = sodium.crypto_core_ristretto255_scalar_random();

  // Evaluation points: x1=1, x2=2
  // shareA = k + r*1 = k + r
  // shareB = k + r*2 = k + 2r
  const shareA = sodium.crypto_core_ristretto255_scalar_add(k, r);
  const twoR = sodium.crypto_core_ristretto255_scalar_add(r, r);
  const shareB = sodium.crypto_core_ristretto255_scalar_add(k, twoR);

  const result = {
    fullKey: Buffer.from(k).toString("hex"),
    shareA: Buffer.from(shareA).toString("hex"),
    shareB: Buffer.from(shareB).toString("hex"),
  };

  // Zero sensitive material
  sodium.memzero(k);
  sodium.memzero(r);
  sodium.memzero(twoR);

  return result;
}

const shares = await generateShares();
console.log("# OPRF shares (add to .env)");
console.log(`OPRF_SHARE_A_HEX=${shares.shareA}`);
console.log(`OPRF_SHARE_B_HEX=${shares.shareB}`);
console.log("# Full key (ESCROW ONLY, do NOT store in .env):");
console.log(`# OPRF_FULL_KEY=${shares.fullKey}`);
