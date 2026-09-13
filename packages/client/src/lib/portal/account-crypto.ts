/**
 * Client-side account crypto. Runs on the main thread.
 *
 * The account page has no Worker and no CryptoBridge (the (client)
 * surface never imports volunteer session machinery). All key material
 * lives in module-scope closures, zeroed on quick exit, logout, idle
 * timeout, and pagehide. Same main-thread justification as
 * portal-crypto.ts: no session secrets to protect, plaintext is
 * already in the DOM.
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
  requireSodium,
  zeroAll,
  generateSalt,
  type PortalKeypair,
  type RistrettoPoint,
  type EciesOutput,
  type ClientAccountKeys,
  toSalt,
  toRistrettoPoint,
} from "@care-y/crypto";
import { trpc } from "$lib/trpc/index.js";
import { requireRouter } from "$lib/errors.js";
import { evaluateWithPowRetry } from "$lib/auth/crypto-helpers.js";
import type { LoginCryptoCallbacks } from "$lib/auth/login-crypto.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Live account session. The page holds one of these in module scope. */
export interface AccountSession {
  readonly keypair: PortalKeypair;
  /** Zero clientPrivate. Called by quick exit, logout, idle timeout, pagehide. */
  destroy(): void;
}

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
// accountLogin
// ---------------------------------------------------------------------------

const textEncoder = new TextEncoder();

/**
 * Login pipeline: getAccountSalt -> deriveAccountKey (Argon2id) ->
 * oprfBlind -> evaluateWithPowRetry -> oprfFinalize ->
 * deriveClientAccountKeys -> accountLogin mutation.
 *
 * Cookie lands via Set-Cookie; nothing token-shaped returns in the body.
 * Progress phases via LoginCryptoCallbacks. zeroAll in finally; keypair
 * ownership transfers to the returned AccountSession.
 *
 * A login failure (generic UNAUTHORIZED) zeroes everything and throws.
 */
export async function accountLogin(
  username: string,
  password: string,
  callbacks: LoginCryptoCallbacks,
): Promise<AccountSession> {
  const { accountId, keys } = await runDerivationPipeline(
    username,
    password,
    callbacks,
  );

  try {
    // Login mutation: send auth token, cookie arrives via Set-Cookie
    const portalRouter = requireRouter(trpc.clientPortal, "clientPortal");
    await portalRouter.accountLogin.mutate({
      accountId,
      authToken: encode(keys.authToken),
    });
  } catch (err) {
    requireSodium().memzero(keys.keypair.clientPrivate);
    throw err;
  } finally {
    zeroAll(keys.authToken);
  }

  callbacks.onDone();

  // Keypair ownership transfers to the session
  let destroyed = false;
  const session: AccountSession = {
    keypair: keys.keypair,
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      const sodium = requireSodium();
      sodium.memzero(keys.keypair.clientPrivate);
    },
  };

  return session;
}

/**
 * Proof of knowledge of the current password, used by change-password.
 * The caller encodes authToken for the wire and MUST call destroy()
 * when done (zeroes the token bytes and the derived private key).
 */
export interface AccountAuthProof {
  readonly accountId: string;
  readonly authToken: Uint8Array;
  readonly keypair: PortalKeypair;
  destroy(): void;
}

/**
 * Runs the login derivation pipeline without the login mutation.
 * Change-password uses this to produce currentAuthToken and to verify
 * the key check against the current keypair before any state changes.
 */
export async function deriveAuthProof(
  username: string,
  password: string,
  callbacks: LoginCryptoCallbacks,
): Promise<AccountAuthProof> {
  const { accountId, keys } = await runDerivationPipeline(
    username,
    password,
    callbacks,
  );

  let destroyed = false;
  return {
    accountId,
    authToken: keys.authToken,
    keypair: keys.keypair,
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      const sodium = requireSodium();
      sodium.memzero(keys.authToken);
      sodium.memzero(keys.keypair.clientPrivate);
    },
  };
}

/**
 * Shared salt -> Argon2id -> OPRF -> derive pipeline (steps 1-5 of the
 * login flow). Zeroes the stretched key and OPRF output before returning;
 * ownership of the derived keys transfers to the caller.
 */
async function runDerivationPipeline(
  username: string,
  password: string,
  callbacks: LoginCryptoCallbacks,
): Promise<{ accountId: string; keys: ClientAccountKeys }> {
  let stretched: Uint8Array | null = null;
  let oprfOutput: Uint8Array | null = null;

  try {
    // 1. Get salt + accountId from server (fake-salt defense for unknowns)
    const portalRouter = requireRouter(trpc.clientPortal, "clientPortal");
    const { salt: saltB64, accountId } =
      await portalRouter.getAccountSalt.query({ username });
    const saltBytes = decode(saltB64);

    // 2. Argon2id (floor-enforced params)
    callbacks.onArgon2idStart();
    const passwordBytes = textEncoder.encode(password);
    stretched = deriveAccountKey(passwordBytes, toSalt(saltBytes));
    callbacks.onArgon2idDone();

    // 3. OPRF blind
    callbacks.onOprfStart();
    const { blindedElement, blindState } = oprfBlind(stretched);

    // 4. OPRF evaluate via tRPC (with automatic PoW retry)
    const evaluatedB64 = await evaluateWithPowRetry(
      accountId,
      encode(blindedElement),
      callbacks.onPowRequired,
    );
    callbacks.onOprfDone();

    // 5. OPRF finalize + key derivation
    callbacks.onDeriveStart();
    const evaluatedBytes = decode(evaluatedB64);
    oprfOutput = oprfFinalize(
      blindState,
      toRistrettoPoint(evaluatedBytes),
      stretched,
    );
    const keys = deriveClientAccountKeys(oprfOutput);

    return { accountId, keys };
  } finally {
    zeroAll(stretched, oprfOutput);
  }
}

// ---------------------------------------------------------------------------
// buildAccountRegistration
// ---------------------------------------------------------------------------

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
): Promise<{ payload: AccountRegistrationWire; keypair: PortalKeypair }> {
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
