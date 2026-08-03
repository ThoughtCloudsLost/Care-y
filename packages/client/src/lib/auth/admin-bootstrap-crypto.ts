/**
 * Admin-initiated crypto bootstrap for manually created users.
 *
 * The admin knows the new user's password (they entered it in the UI).
 * This function derives the new user's keys (Argon2id + OPRF + HKDF),
 * wraps the org secret key for the new user's volPublic, and uploads
 * everything in a single adminBootstrapUserKeys call.
 *
 * Key derivation runs on the main thread (one-shot, same as registerCrypto).
 * The org secret key is exported from the Worker, used for ECIES wrapping,
 * and zeroed immediately.
 */

import {
  generateSalt,
  deriveAccountKey,
  oprfBlind,
  oprfFinalize,
  deriveMasterKey,
  deriveVolunteerPrivateKey,
  deriveVolunteerPublicKey,
  wrapKey,
  decode,
  encode,
  getSodium,
  zeroAll,
  toRistrettoPoint,
} from "@care-y/crypto";
import type { BlindResult, Salt, Scalar, SymmetricKey } from "@care-y/crypto";
import { trpc } from "$lib/trpc/index.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

export interface AdminBootstrapCallbacks {
  onDeriveStart: () => void;
  onDeriveComplete: () => void;
  onWrapStart: () => void;
  onComplete: () => void;
}

export async function adminBootstrapUserCrypto(
  userId: string,
  password: string,
  bridge: CryptoBridge,
  callbacks: AdminBootstrapCallbacks,
): Promise<void> {
  await getSodium();

  let stretched: Uint8Array | null = null;
  let oprfOutput: Uint8Array | null = null;
  let masterKey: SymmetricKey | null = null;
  let volPrivate: Scalar | null = null;
  let orgSecretKey: Uint8Array | null = null;

  try {
    callbacks.onDeriveStart();

    const salt: Salt = generateSalt();
    const passwordBuf = new TextEncoder().encode(password);
    stretched = deriveAccountKey(passwordBuf, salt);

    const blind: BlindResult = oprfBlind(stretched);

    const { evaluated: evaluatedB64 } = await trpc.oprf.adminEvaluate.mutate({
      userId,
      blindedElement: encode(blind.blindedElement),
    });
    const evaluatedBytes = decode(evaluatedB64);

    oprfOutput = oprfFinalize(
      blind.blindState,
      toRistrettoPoint(evaluatedBytes),
      stretched,
    );
    masterKey = deriveMasterKey(oprfOutput);
    volPrivate = deriveVolunteerPrivateKey(masterKey);
    const volPublic = deriveVolunteerPublicKey(volPrivate);

    callbacks.onDeriveComplete();

    callbacks.onWrapStart();

    const orgSecretKeyBuf = await bridge.exportOrgSecretKey();
    orgSecretKey = new Uint8Array(orgSecretKeyBuf);

    const recipientPublic = toRistrettoPoint(volPublic);
    const wrapped = wrapKey(orgSecretKey, recipientPublic);

    await trpc.keys.adminBootstrapUserKeys.mutate({
      userId,
      salt: encode(salt),
      volPublic: encode(volPublic),
      wrappedOrgKey: {
        ephemeralPoint: encode(wrapped.ephemeralPoint),
        nonce: encode(wrapped.nonce),
        wrappedKey: encode(wrapped.ciphertext),
      },
    });

    callbacks.onComplete();
  } finally {
    zeroAll(stretched, oprfOutput, masterKey, volPrivate);
    if (orgSecretKey !== null) {
      orgSecretKey.fill(0);
    }
  }
}
