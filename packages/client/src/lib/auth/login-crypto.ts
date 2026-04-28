/**
 * Client-side login crypto flow.
 *
 * Orchestrates the full key derivation pipeline:
 *   getSalt (tRPC) -> Argon2id (Worker) -> OPRF blind (Worker)
 *   -> OPRF evaluate (tRPC) -> deriveKeys (Worker) -> unwrapOrgKey (Worker)
 *
 * The main thread handles network I/O and progress callbacks.
 * The Worker handles all key derivation. masterKey, volPrivate, and
 * stretched never exist on the main thread.
 *
 * References:
 *   SEC-206, SEC-207  ProtonMail crypto worker pattern
 *   SEC-210           W3C postMessage interception risk
 */

import { decode } from "@care-y/crypto";
import { trpc } from "$lib/trpc/index.js";
import { decodeStandardBase64, toArrayBuffer } from "$lib/base64.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import {
  evaluateWithPowRetry,
  fetchAndUnwrapOrgKey,
} from "./crypto-helpers.js";

export interface LoginCryptoResult {
  /** Base64-encoded volunteer public key (for display or upload). */
  volPublic: string;
  /** Org public key (base64). Worker retains the secret. Null if org not onboarded. */
  orgPublicKey: string | null;
}

/** Shared progress callbacks for the Argon2id -> OPRF -> derive pipeline. */
export interface CryptoPhaseCallbacks {
  onArgon2idStart: () => void;
  onArgon2idDone: () => void;
  onOprfStart: () => void;
  onOprfDone: () => void;
  onDeriveStart: () => void;
  onDone: () => void;
}

export interface LoginCryptoCallbacks extends CryptoPhaseCallbacks {
  /**
   * Called when the OPRF server requires proof-of-work.
   * The UI should show a "Verifying..." spinner while PoW is solved.
   * Returns the hex-encoded solution string.
   */
  onPowRequired: (challenge: string, difficulty: number) => Promise<string>;
}

/**
 * Full login crypto pipeline.
 *
 * @param identifier - Username (used for getSalt and OPRF userId lookup)
 * @param password - Raw password string (zeroed via Transferable after Argon2id)
 * @param bridge - Initialized CryptoBridge instance
 * @param callbacks - Progress callbacks for UI state management
 * @returns volPublic (base64) and orgPublicKey (base64 string or null)
 */
export async function loginCrypto(
  identifier: string,
  password: string,
  bridge: CryptoBridge,
  callbacks: LoginCryptoCallbacks,
): Promise<LoginCryptoResult> {
  // 1. Get salt + userId from server.
  const { salt: saltB64, userId } = await trpc.auth.getSalt.query({
    identifier,
  });
  const salt = decode(saltB64);

  // 2. Argon2id in the crypto Worker. Buffers are Transferable (neutered after send).
  callbacks.onArgon2idStart();
  const passwordBuf = new TextEncoder().encode(password);
  await bridge.argon2id(toArrayBuffer(passwordBuf), toArrayBuffer(salt));
  callbacks.onArgon2idDone();

  // 3. OPRF blind inside the Worker.
  callbacks.onOprfStart();
  const { blindedElement } = await bridge.oprfBlind();

  // 4. OPRF evaluate via tRPC (with automatic PoW retry).
  const evaluatedB64 = await evaluateWithPowRetry(
    userId,
    blindedElement,
    callbacks.onPowRequired,
  );
  callbacks.onOprfDone();

  // 5. OPRF finalize + key derivation in Worker.
  callbacks.onDeriveStart();
  const evaluatedBytes = decodeStandardBase64(evaluatedB64);
  const { volPublic } = await bridge.deriveKeys(toArrayBuffer(evaluatedBytes));

  // 6. Unwrap org key in Worker (retains secret, returns public key).
  const orgPublicKey = await fetchAndUnwrapOrgKey(bridge);

  callbacks.onDone();
  return { volPublic, orgPublicKey };
}
