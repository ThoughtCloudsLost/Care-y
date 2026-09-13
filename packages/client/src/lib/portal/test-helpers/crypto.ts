/**
 * Real-crypto helpers shared by the portal test suites
 * (portal-crypto.test.ts, account-crypto.test.ts,
 * add-passphrase-crypto.test.ts, crypto/seal-portal-copy.test.ts).
 *
 * Every helper needs initialized libsodium: call `await getSodium()` in
 * the suite's beforeAll before using any of them.
 */

import {
  requireSodium,
  eciesDecrypt,
  encode,
  decode,
  toRistrettoPoint,
  toNonce,
  toScalar,
  type RistrettoPoint,
  type Scalar,
} from "@care-y/crypto";

/** Ristretto255 keypair for ECIES roundtrip assertions. */
export interface TestKeypair {
  readonly publicB64: string;
  readonly publicPoint: RistrettoPoint;
  readonly privateScalar: Scalar;
}

export function makeRistrettoKeypair(): TestKeypair {
  const sodium = requireSodium();
  const priv = toScalar(sodium.crypto_core_ristretto255_scalar_random());
  const pub = toRistrettoPoint(
    sodium.crypto_scalarmult_ristretto255_base(priv),
  );
  return { publicB64: encode(pub), publicPoint: pub, privateScalar: priv };
}

/**
 * Fixed "server key" scalar for local OPRF simulation. The OPRF output is
 * deterministic for a given (input, server key) pair, so a test can
 * reproduce a production derivation independently and compare results.
 */
export const TEST_OPRF_SERVER_KEY = new Uint8Array(32).fill(0xaa);

/** Simulate the server side of an OPRF round: evaluated = serverKey * blinded. */
export function localOprfEvaluate(blindedB64: string): string {
  const sodium = requireSodium();
  const evaluated = sodium.crypto_scalarmult_ristretto255(
    TEST_OPRF_SERVER_KEY,
    decode(blindedB64),
  );
  return encode(evaluated);
}

/** Base64url-encoded ECIES triple as it travels on the wire. */
export interface EciesTripleB64 {
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly ciphertext: string;
}

/** Decrypt a wire-format ECIES triple and decode the plaintext as UTF-8. */
export function decryptTripleB64(
  triple: EciesTripleB64,
  recipientPrivate: Scalar,
): string {
  const plain = eciesDecrypt(
    toRistrettoPoint(decode(triple.ephemeralPoint)),
    toNonce(decode(triple.nonce)),
    decode(triple.ciphertext),
    recipientPrivate,
  );
  return new TextDecoder().decode(plain);
}
