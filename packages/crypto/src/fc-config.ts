/**
 * fast-check run count configuration for property-based tests.
 *
 * Reads the FC_NUM_RUNS environment variable to scale property test iterations.
 * Default runs are tuned for fast local development. CI nightly jobs can set
 * FC_NUM_RUNS=high to increase coverage without changing test code.
 *
 * Tiers:
 *   light  - cheap operations (HKDF, serialize): 100 default, 500 high
 *   medium - crypto operations (ECIES, OPRF, content): 20 default, 200 high
 *   heavy  - Argon2id-bound (escrow, derive+pwhash): 3 default, 10 high
 */

const isHigh = process.env.FC_NUM_RUNS === "high";

/** Cheap ops (HKDF, base64): 100 default, 500 high */
export const FC_LIGHT: number = isHigh ? 500 : 100;

/** Crypto ops (ECIES, OPRF, content, keywrap): 20 default, 200 high */
export const FC_MEDIUM: number = isHigh ? 200 : 20;

/** Argon2id-bound ops (escrow): 3 default, 10 high */
export const FC_HEAVY: number = isHigh ? 10 : 3;
