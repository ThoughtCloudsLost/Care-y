/**
 * Client-side add-a-password pipeline (key-check seal and message re-seal).
 *
 * The OPRF derivation that produces the new keypair runs inside the portal
 * Worker via the channelPassphraseDerive/channelPassphraseFinish op pair.
 * The Worker returns only the new public key; the private key never leaves
 * the Worker boundary.
 *
 * This module receives the new public key (base64url) from the caller and
 * handles steps that remain on the main thread:
 *   1. Re-seal PORTAL_KEY_CHECK to the new public key
 *   2. Re-seal every portal message from the session's decrypted thread
 *
 * No seed, passphrase, or private key touches this module.
 */

import {
  PORTAL_KEY_CHECK,
  eciesEncrypt,
  decode,
  encode,
  toRistrettoPoint,
  type EciesOutput,
} from "@care-y/crypto";
import { rewrapMessages, type RewrappedMessageWire } from "./account-crypto.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Wire-ready payload for the addPassphrase procedure. */
export interface AddPassphrasePayload {
  readonly clientPublic: string;
  readonly keyCheck: {
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly ciphertext: string;
  };
  readonly resealedMessages: readonly RewrappedMessageWire[];
}

/** Wire shape of a portal message from the bootstrap/messages query. */
export interface PortalMessageWire {
  readonly id: string;
  readonly direction: string;
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly ciphertext: string;
}

/** Session handle for decrypting existing portal messages. */
export interface DecryptHandle {
  decryptMessage(
    ephemeralPoint: string,
    nonce: string,
    ciphertext: string,
  ): Promise<string>;
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

const textEncoder = new TextEncoder();

/**
 * Build the add-a-password payload from a Worker-derived public key.
 *
 * The caller has already run the two-phase Worker ops
 * (channelPassphraseDerive, evaluate, channelPassphraseFinish) and holds
 * only the new public key. This function seals the key check and re-seals
 * all existing portal messages to the new key.
 *
 * @param clientPublicB64 - New client public key, base64url (from Worker)
 * @param serverMessages - All portal messages from the session
 * @param session - Decrypt handle for opening existing ciphertexts
 * @returns Wire-ready addPassphrase payload
 */
export async function buildAddPassphrasePayload(
  clientPublicB64: string,
  serverMessages: readonly PortalMessageWire[],
  session: DecryptHandle,
): Promise<AddPassphrasePayload> {
  const clientPubBytes = toRistrettoPoint(decode(clientPublicB64));

  // Step 1: Re-seal key check to the new public key
  const keyCheckPlain = textEncoder.encode(PORTAL_KEY_CHECK);
  const keyCheckTriple: EciesOutput = eciesEncrypt(
    keyCheckPlain,
    clientPubBytes,
  );

  // Step 2: Collect decrypted messages and re-seal to new key.
  // All portal_messages rows for the channel are sealed to client_public,
  // regardless of direction. Re-seal all of them.
  const decrypted = await collectDecryptedMessages(serverMessages, session);
  const resealedMessages = rewrapMessages(decrypted, clientPubBytes);

  const payload: AddPassphrasePayload = {
    clientPublic: clientPublicB64,
    keyCheck: {
      ephemeralPoint: encode(keyCheckTriple.ephemeralPoint),
      nonce: encode(keyCheckTriple.nonce),
      ciphertext: encode(keyCheckTriple.ciphertext),
    },
    resealedMessages,
  };

  return payload;
}

/**
 * Decrypt all portal messages from the session. Messages that fail
 * to decrypt are skipped (they may be corrupt or from a prior key).
 */
async function collectDecryptedMessages(
  serverMessages: readonly PortalMessageWire[],
  session: DecryptHandle,
): Promise<readonly { id: string; text: string }[]> {
  const result: { id: string; text: string }[] = [];
  for (const msg of serverMessages) {
    try {
      const text = await session.decryptMessage(
        msg.ephemeralPoint,
        msg.nonce,
        msg.ciphertext,
      );
      result.push({ id: msg.id, text });
    } catch {
      // Skip messages that fail to decrypt (same pattern as account upgrade)
    }
  }
  return result;
}
