/**
 * Client-side account creation crypto flow.
 *
 * Runs the full key derivation pipeline on the main thread (not the Worker).
 * Generates a fresh salt, derives volPublic via Argon2id + OPRF, and uploads
 * { salt, volPublic } to initialize the user_keys row. All intermediate key
 * material is zeroed in a finally block.
 *
 * The keys are derived once, uploaded, and discarded. The first login
 * after registration re-derives everything inside the crypto Worker for
 * session-duration isolation.
 *
 * Per crypto-architecture-v2.md Section 7 (Account Creation flow).
 *
 * References:
 *   SEC-206, SEC-207  ProtonMail crypto Worker pattern (login uses Worker,
 *                     registration is one-shot on main thread)
 *   SEC-012           RFC 9497 (OPRF protocol)
 */

import {
  generateSalt,
  deriveAccountKey,
  oprfBlind,
  oprfFinalize,
  deriveMasterKey,
  deriveVolunteerPrivateKey,
  deriveVolunteerPublicKey,
  encode,
  getSodium,
  zeroAll,
  toRistrettoPoint,
} from "@care-y/crypto";
import type { BlindResult, Salt, Scalar, SymmetricKey } from "@care-y/crypto";
import { trpc } from "$lib/trpc/index.js";
import { decodeStandardBase64 } from "$lib/base64.js";
import type { CryptoPhaseCallbacks } from "./login-crypto.js";

export interface RegisterCryptoResult {
  /** URL-safe base64 encoded salt (16 bytes). */
  salt: string;
  /** URL-safe base64 encoded volunteer public key (32 bytes, ristretto255 point). */
  volPublic: string;
}

export interface RegisterCryptoCallbacks extends CryptoPhaseCallbacks {
  onUploadStart: () => void;
}

/**
 * Full account creation crypto pipeline.
 *
 * @param userId - The user's UUID (from session, for OPRF rate-limiting)
 * @param password - Raw password string
 * @param callbacks - Progress callbacks for UI state management
 * @returns salt and volPublic as base64 strings
 */
export async function registerCrypto(
  userId: string,
  password: string,
  callbacks: RegisterCryptoCallbacks,
): Promise<RegisterCryptoResult> {
  await getSodium();

  // Declare intermediates upfront so the finally block can zero whatever
  // was allocated before an error, regardless of where it occurred.
  let stretched: Uint8Array | null = null;
  let oprfOutput: Uint8Array | null = null;
  let masterKey: SymmetricKey | null = null;
  let volPrivate: Scalar | null = null;

  try {
    // 1. Generate random 16-byte salt (Argon2id, RFC 9106 Section 3.1).
    const salt: Salt = generateSalt();

    // 2. Argon2id stretching (CPU-heavy, ~1-3s at 64MB/3/4).
    //    Registration runs on the main thread (one-shot, no session to protect).
    callbacks.onArgon2idStart();
    const passwordBuf = new TextEncoder().encode(password);
    stretched = deriveAccountKey(passwordBuf, salt);
    callbacks.onArgon2idDone();

    // 3. OPRF Blind (client-side): produce blinded element + retain blind state.
    callbacks.onOprfStart();
    const blind: BlindResult = oprfBlind(stretched);

    // 4. OPRF Evaluate (network call to OPRF server).
    //    The OPRF endpoint is a publicProcedure (no auth required).
    //    userId is used for rate-limiting, not DB lookup.
    const { evaluated: evaluatedB64 } = await trpc.oprf.evaluate.mutate({
      userId,
      blindedElement: encode(blind.blindedElement),
    });
    const evaluatedBytes = decodeStandardBase64(evaluatedB64);

    // 5. OPRF Finalize: unblind the server's response to produce oprf_output.
    oprfOutput = oprfFinalize(
      blind.blindState,
      toRistrettoPoint(evaluatedBytes),
      stretched,
    );
    callbacks.onOprfDone();

    // 6. Derive masterKey -> volPrivate -> volPublic.
    callbacks.onDeriveStart();
    masterKey = deriveMasterKey(oprfOutput);
    volPrivate = deriveVolunteerPrivateKey(masterKey);
    const volPublic = deriveVolunteerPublicKey(volPrivate);

    // 7. Capture result before upload (encode while buffers are live).
    const result: RegisterCryptoResult = {
      salt: encode(salt),
      volPublic: encode(volPublic),
    };

    // 8. Upload salt + volPublic to server. Server inserts user_keys row.
    //    Per crypto-architecture-v2.md Section 7 steps 9-10.
    callbacks.onUploadStart();
    await trpc.keys.initCryptoKeys.mutate({
      salt: result.salt,
      volPublic: result.volPublic,
    });

    callbacks.onDone();
    return result;
  } finally {
    // Zero ALL intermediate key material regardless of outcome.
    // salt and volPublic are public (stored on server), no zeroing needed.
    zeroAll(stretched, oprfOutput, masterKey, volPrivate);
  }
}
