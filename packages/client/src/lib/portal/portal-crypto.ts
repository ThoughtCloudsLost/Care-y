/**
 * Client-side portal cryptography. Runs on the main thread.
 *
 * The portal page has no session, no Worker, no CryptoBridge.
 * All key material lives in module-scope closures, zeroed on
 * quick exit and pagehide. The fragment never reaches any server
 * (RFC 3986). Same main-thread justification as intake-crypto.ts:
 * no session secrets to protect, plaintext is already in the DOM.
 */

import {
  deriveChannelId,
  deriveChannelAuth,
  PORTAL_KEY_CHECK,
  eciesEncrypt,
  eciesDecrypt,
  generateContentKey,
  encryptContent,
  sealForOrgKey,
  buildContentAad,
  followupSlot,
  encode,
  decode,
  requireSodium,
  DecryptionError,
  type PortalKeypair,
  type EciesOutput,
  type SymmetricKey,
  toNonce,
  toRistrettoPoint,
  type Scalar,
  type RistrettoPoint,
} from "@care-y/crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Decoded ECIES triple (binary form, ready for eciesDecrypt). */
export interface EciesTripleDecoded {
  readonly ephemeralPoint: RistrettoPoint;
  readonly nonce: Uint8Array;
  readonly ciphertext: Uint8Array;
}

/** Payload produced by encryptReply, ready for the portalReply mutation. */
export interface PortalReplyPayload {
  readonly encryptedContent: string;
  readonly wrappedTkTemp: string;
  readonly selfCopy: {
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly ciphertext: string;
  };
}

/** Mutable session state. The page holds one of these in module scope. */
export interface PortalSession {
  readonly channelId: string;
  readonly auth: Uint8Array;
  readonly keypair: PortalKeypair;
  /** Zero auth, clientPrivate, and any retained seed. */
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Fragment parsing
// ---------------------------------------------------------------------------

/**
 * Parse location.hash: strip "#", decode base64url, length-check.
 * Derive auth eagerly. Keypair derivation is deferred until
 * hasPassphrase is known (bootstrap runs on auth alone).
 *
 * Returns null on missing or malformed fragment.
 */
export function parseFragment(
  hash: string,
): { seed: Uint8Array; auth: Uint8Array; channelId: string } | null {
  if (!hash || hash === "#") return null;
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (raw.length === 0) return null;

  let seed: Uint8Array;
  try {
    seed = decode(raw);
  } catch {
    return null;
  }

  // Minimum 18 bytes enforced by the crypto module; guard early so the
  // derive calls never throw for a truncated fragment.
  if (seed.length < 18) return null;

  try {
    const channelId = deriveChannelId(seed);
    const auth = deriveChannelAuth(seed);
    return { seed, auth, channelId };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Key check verification
// ---------------------------------------------------------------------------

const textDecoder = new TextDecoder();

/**
 * Verify a derived keypair against the server-stored key check.
 * Returns true iff the decrypted plaintext matches PORTAL_KEY_CHECK.
 * A DecryptionError (wrong passphrase, corrupt triple) returns false.
 */
export function verifyKeyCheck(
  keypair: PortalKeypair,
  keyCheck: EciesTripleDecoded,
): boolean {
  try {
    const plaintext = eciesDecrypt(
      keyCheck.ephemeralPoint,
      toNonce(keyCheck.nonce),
      keyCheck.ciphertext,
      keypair.clientPrivate,
    );
    const text = textDecoder.decode(plaintext);
    return text === PORTAL_KEY_CHECK;
  } catch (err: unknown) {
    if (err instanceof DecryptionError) return false;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Message decryption
// ---------------------------------------------------------------------------

/**
 * Decrypt a single portal message (ECIES triple encrypted to clientPublic).
 *
 * @throws DecryptionError on tampered or wrong-key ciphertext
 */
export function decryptPortalMessage(
  msg: EciesTripleDecoded,
  clientPrivate: Scalar,
): string {
  const plaintext = eciesDecrypt(
    msg.ephemeralPoint,
    toNonce(msg.nonce),
    msg.ciphertext,
    clientPrivate,
  );
  return textDecoder.decode(plaintext);
}

// ---------------------------------------------------------------------------
// Reply encryption
// ---------------------------------------------------------------------------

const textEncoder = new TextEncoder();

/**
 * Encrypt a client reply:
 *   1. Generate tk_temp, encrypt content with AAD binding
 *   2. Seal tk_temp to org public key
 *   3. ECIES self-copy to clientPublic
 *   4. Zero tk_temp in finally
 *
 * @returns Base64url-encoded payload ready for the portalReply mutation
 */
export function encryptReply(
  text: string,
  orgPublicKey: Uint8Array,
  clientPublic: RistrettoPoint,
  ids: { ticketId: string; followUpId: string; keyGeneration: string },
): PortalReplyPayload {
  const tkTemp: SymmetricKey = generateContentKey();
  try {
    const aad = buildContentAad(ids.ticketId, followupSlot(ids.followUpId));
    const encrypted = encryptContent(textEncoder.encode(text), tkTemp, aad);
    const wrapped = sealForOrgKey(tkTemp, orgPublicKey);
    const selfCopy: EciesOutput = eciesEncrypt(
      textEncoder.encode(text),
      clientPublic,
    );

    return {
      encryptedContent: encode(encrypted),
      wrappedTkTemp: encode(wrapped),
      selfCopy: {
        ephemeralPoint: encode(selfCopy.ephemeralPoint),
        nonce: encode(selfCopy.nonce),
        ciphertext: encode(selfCopy.ciphertext),
      },
    };
  } finally {
    requireSodium().memzero(tkTemp);
  }
}

// ---------------------------------------------------------------------------
// Session lifecycle helpers
// ---------------------------------------------------------------------------

/**
 * Build a PortalSession from already-derived material.
 * The caller provides seed ownership; destroy() zeroes what it holds.
 */
export function createPortalSession(
  channelId: string,
  auth: Uint8Array,
  keypair: PortalKeypair,
  seed: Uint8Array | null,
): PortalSession {
  let destroyed = false;
  return {
    channelId,
    auth,
    keypair,
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      const sodium = requireSodium();
      sodium.memzero(auth);
      sodium.memzero(keypair.clientPrivate);
      if (seed) sodium.memzero(seed);
    },
  };
}

/**
 * Decode a base64url ECIES triple from the wire into binary form.
 */
export function decodeEciesTriple(wire: {
  ephemeralPoint: string;
  nonce: string;
  ciphertext: string;
}): EciesTripleDecoded {
  return {
    ephemeralPoint: toRistrettoPoint(decode(wire.ephemeralPoint)),
    nonce: decode(wire.nonce),
    ciphertext: decode(wire.ciphertext),
  };
}
