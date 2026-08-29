/**
 * Client-side account crypto utilities that remain on the main thread.
 *
 * ADR-091 posture: key custody lives in the portal Worker (portal-core.ts).
 * The main thread holds no account key material after session start. This
 * module retains only:
 *
 *   - buildAccountRegistration: mint-like path that assembles a registration
 *     payload from scratch. Stays main-thread because its output is the
 *     wire payload (salt, publicKey, authHash, keyCheck), so worker custody
 *     buys nothing; the keypair is zeroed in the caller's finally block.
 *   - rewrapMessages: re-encrypts already-decrypted messages to a new
 *     public key. Operates on plaintext strings the session already
 *     decrypted, never re-fetches ciphertext. Stays main-thread for the
 *     same reason.
 *   - Type exports consumed by callers.
 *
 * Functions that moved into the portal worker and are consumed via the
 * bridge: accountLogin pipeline (Argon2id, OPRF, derive), deriveAuthProof.
 * The login/registration mutations and Set-Cookie handling stay on the
 * main thread, consuming the returned authToken and clientPublic from
 * the bridge.
 */

import {
  deriveAccountKey,
  oprfBlind,
  oprfFinalize,
  deriveClientAccountKeys,
  hashChannelAuth,
  eciesEncrypt,
  PORTAL_KEY_CHECK,
  encode,
  decode,
  zeroAll,
  generateSalt,
  type RistrettoPoint,
  type EciesOutput,
  toRistrettoPoint,
} from "@care-y/crypto";
import { evaluateWithPowRetry } from "$lib/auth/crypto-helpers.js";
import type { LoginCryptoCallbacks } from "$lib/auth/login-crypto.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Wire-ready registration payload matching accountRegistrationSchema. */
export interface AccountRegistrationWire {
  readonly accountId: string;
  readonly username: string;
  readonly salt: string;
  readonly publicKey: string;
  readonly authHash: string;
  readonly keyCheck: {
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly ciphertext: string;
  };
}

/** Wire-ready rewrapped message matching rewrappedMessageSchema. */
export interface RewrappedMessageWire {
  readonly id: string;
  readonly copy: {
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly ciphertext: string;
  };
}

// ---------------------------------------------------------------------------
// buildAccountRegistration
// ---------------------------------------------------------------------------

const textEncoder = new TextEncoder();

/**
 * Registration assembly shared by the intake opt-in step, the in-portal
 * upgrade, and change-password.
 *
 * Mints accountId when accountId is null; keeps the given one for
 * change-password. Runs the full derivation pipeline against a FRESH
 * random salt. Returns the wire payload and the new keypair (for
 * re-encryption) without mutating any server state.
 *
 * When username is null (change-password), the returned payload still
 * includes the field set to an empty string. The caller must omit it
 * from the wire schema as appropriate.
 */
export async function buildAccountRegistration(
  username: string | null,
  password: string,
  accountId: string | null,
  callbacks: LoginCryptoCallbacks,
): Promise<{
  payload: AccountRegistrationWire;
  keypair: { clientPublic: RistrettoPoint; clientPrivate: Uint8Array };
}> {
  let stretched: Uint8Array | null = null;
  let oprfOutput: Uint8Array | null = null;
  let authToken: Uint8Array | null = null;

  const resolvedAccountId = accountId ?? crypto.randomUUID();
  const salt = generateSalt();

  try {
    // 1. Argon2id
    callbacks.onArgon2idStart();
    const passwordBytes = textEncoder.encode(password);
    stretched = deriveAccountKey(passwordBytes, salt);
    callbacks.onArgon2idDone();

    // 2. OPRF blind
    callbacks.onOprfStart();
    const { blindedElement, blindState } = oprfBlind(stretched);

    // 3. OPRF evaluate
    const evaluatedB64 = await evaluateWithPowRetry(
      "account",
      resolvedAccountId,
      encode(blindedElement),
      callbacks.onPowRequired,
    );
    callbacks.onOprfDone();

    // 4. OPRF finalize + key derivation
    callbacks.onDeriveStart();
    const evaluatedBytes = decode(evaluatedB64);
    oprfOutput = oprfFinalize(
      blindState,
      toRistrettoPoint(evaluatedBytes),
      stretched,
    );
    const keys = deriveClientAccountKeys(oprfOutput);
    authToken = keys.authToken;

    // 5. Hash the auth token (server stores the hash, not the raw token)
    const authHash = hashChannelAuth(authToken);

    // 6. Encrypt the key check constant to the new public key
    const keyCheckPlain = textEncoder.encode(PORTAL_KEY_CHECK);
    const keyCheckTriple: EciesOutput = eciesEncrypt(
      keyCheckPlain,
      keys.keypair.clientPublic,
    );

    callbacks.onDone();

    const payload: AccountRegistrationWire = {
      accountId: resolvedAccountId,
      username: username ?? "",
      salt: encode(new Uint8Array(salt)),
      publicKey: encode(keys.keypair.clientPublic),
      authHash: encode(authHash),
      keyCheck: {
        ephemeralPoint: encode(keyCheckTriple.ephemeralPoint),
        nonce: encode(keyCheckTriple.nonce),
        ciphertext: encode(keyCheckTriple.ciphertext),
      },
    };

    return { payload, keypair: keys.keypair };
  } finally {
    zeroAll(stretched, oprfOutput, authToken);
  }
}

// ---------------------------------------------------------------------------
// rewrapMessages
// ---------------------------------------------------------------------------

/**
 * Re-encrypt already-decrypted portal messages to a new public key.
 *
 * Operates on the plaintext strings the session already decrypted.
 * Never re-fetches ciphertext from the server (re-fetching would
 * invite a swapped-ciphertext injection at exactly the wrong moment).
 */
export function rewrapMessages(
  decrypted: readonly { id: string; text: string }[],
  newPublic: RistrettoPoint,
): RewrappedMessageWire[] {
  return decrypted.map((msg): RewrappedMessageWire => {
    const plain = textEncoder.encode(msg.text);
    const triple: EciesOutput = eciesEncrypt(plain, newPublic);
    return {
      id: msg.id,
      copy: {
        ephemeralPoint: encode(triple.ephemeralPoint),
        nonce: encode(triple.nonce),
        ciphertext: encode(triple.ciphertext),
      },
    };
  });
}
