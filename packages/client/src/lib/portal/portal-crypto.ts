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
  decryptContent,
  sealForOrgKey,
  buildContentAad,
  followupSlot,
  blobSlot,
  fileKeySlot,
  filenameSlot,
  encodeFileKeyPayload,
  decodeFileKeyPayload,
  encode,
  decode,
  requireSodium,
  DecryptionError,
  type PortalKeypair,
  type EciesOutput,
  type SymmetricKey,
  toCiphertext,
  type FileKeyPayload,
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

/** ECIES triple in the base64url form the wire uses. */
export interface EciesTripleWire {
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly ciphertext: string;
}

/** A file the client is sending, before encryption. */
export interface OutgoingAttachment {
  /** Browser-minted; the blob's AAD binds it (ADR-053). */
  readonly attachmentId: string;
  readonly filename: string;
  readonly contentType: string;
  readonly data: Uint8Array;
}

/** One encrypted attachment, ready to ride the portalReply mutation. */
export interface PortalAttachmentPayload {
  readonly attachmentId: string;
  readonly blob: string;
  readonly sizeBytes: number;
  readonly contentType: string;
  readonly fileKeyWrap: string;
  readonly encryptedFilename: string;
  readonly selfCopy: EciesTripleWire;
}

/** Payload produced by encryptReply, ready for the portalReply mutation. */
export interface PortalReplyPayload {
  readonly encryptedContent: string;
  readonly wrappedTkTemp: string;
  readonly selfCopy: EciesTripleWire;
  readonly attachments: readonly PortalAttachmentPayload[];
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
 * Encrypt a client reply, and any files it carries:
 *   1. Generate tk_temp, encrypt content with AAD binding
 *   2. Seal tk_temp to org public key
 *   3. ECIES self-copy to clientPublic
 *   4. Encrypt each attachment under a file key wrapped by that same tk_temp
 *   5. Zero tk_temp in finally
 *
 * Files ride the reply rather than a prior upload because tk_temp is what
 * wraps their keys and it does not exist until the message is composed. One
 * tk_temp covers the text and every file on the message, so the volunteer's
 * single convergence pass reaches all of it.
 *
 * @returns Base64url-encoded payload ready for the portalReply mutation
 */
export function encryptReply(
  text: string,
  orgPublicKey: Uint8Array,
  clientPublic: RistrettoPoint,
  ids: { ticketId: string; followUpId: string; keyGeneration: string },
  attachments: readonly OutgoingAttachment[] = [],
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
      selfCopy: toWire(selfCopy),
      attachments: attachments.map((att) =>
        encryptAttachment(att, tkTemp, clientPublic, ids.ticketId),
      ),
    };
  } finally {
    requireSodium().memzero(tkTemp);
  }
}

/** ECIES output to its base64url wire form. */
function toWire(out: EciesOutput): EciesTripleWire {
  return {
    ephemeralPoint: encode(out.ephemeralPoint),
    nonce: encode(out.nonce),
    ciphertext: encode(out.ciphertext),
  };
}

/**
 * Encrypt one file under a key of its own and wrap that key twice.
 *
 * The org's wrap is under the reply's tk_temp, which is already sealed to
 * the org key, so a volunteer opening the reply can reach the file with no
 * second mechanism. The self copy is sealed to the sender's own public key
 * because tk_temp is zeroed on send, and without it they could not reopen
 * what they just sent (ADR-089).
 *
 * The file key is zeroed before returning, whatever happens.
 */
function encryptAttachment(
  att: OutgoingAttachment,
  tkTemp: SymmetricKey,
  clientPublic: RistrettoPoint,
  ticketId: string,
): PortalAttachmentPayload {
  const fileKey: SymmetricKey = generateContentKey();
  try {
    const blob = encryptContent(
      att.data,
      fileKey,
      buildContentAad(ticketId, blobSlot(att.attachmentId)),
    );
    const fileKeyWrap = encryptContent(
      fileKey,
      tkTemp,
      buildContentAad(ticketId, fileKeySlot(att.attachmentId)),
    );
    const encryptedFilename = encryptContent(
      textEncoder.encode(att.filename),
      tkTemp,
      buildContentAad(ticketId, filenameSlot(att.attachmentId)),
    );
    const selfCopy = eciesEncrypt(
      encodeFileKeyPayload(fileKey, att.filename),
      clientPublic,
    );

    return {
      attachmentId: att.attachmentId,
      blob: encode(blob),
      sizeBytes: blob.length,
      contentType: att.contentType,
      fileKeyWrap: encode(fileKeyWrap),
      encryptedFilename: encode(encryptedFilename),
      selfCopy: toWire(selfCopy),
    };
  } finally {
    requireSodium().memzero(fileKey);
  }
}

// ---------------------------------------------------------------------------
// Attachment decryption
// ---------------------------------------------------------------------------

/**
 * Recover a file key and its filename from the client's wrap.
 *
 * @throws DecryptionError on a tampered or wrong-key triple
 * @throws InvalidInputError when the wrap holds something other than a payload
 */
export function decryptAttachmentKey(
  wrap: EciesTripleDecoded,
  clientPrivate: Scalar,
): FileKeyPayload {
  const plaintext = eciesDecrypt(
    wrap.ephemeralPoint,
    toNonce(wrap.nonce),
    wrap.ciphertext,
    clientPrivate,
  );
  return decodeFileKeyPayload(plaintext);
}

/**
 * Decrypt an attachment blob with a file key already recovered from a wrap.
 *
 * The key is zeroed here, so a caller gets one file per unwrap rather than
 * a key it has to remember to dispose of.
 *
 * @throws DecryptionError if the blob was tampered with, or if the id does
 *         not match the one the AAD was built from
 */
export function decryptAttachmentBlob(
  ciphertext: Uint8Array,
  fileKey: SymmetricKey,
  ticketId: string,
  attachmentId: string,
): Uint8Array {
  try {
    return decryptContent(
      toCiphertext(ciphertext),
      fileKey,
      buildContentAad(ticketId, blobSlot(attachmentId)),
    );
  } finally {
    requireSodium().memzero(fileKey);
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
