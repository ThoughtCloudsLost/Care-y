/**
 * Client-side add-a-password pipeline.
 *
 * Six-step derivation and re-seal flow mirroring the 8c account upgrade
 * re-encryption shape in account-crypto.ts. The passphrase, seed, and
 * private keys never cross the wire; only the new public key, the key
 * check triple, and re-sealed ciphertexts are sent to the server.
 *
 * ADR-091 derivation tree with passphrase factor:
 *   seed || Argon2id(passphrase, argonSalt) -> OPRF -> keypair
 *
 * All intermediate key material is zeroed via zeroAll.
 */

import {
  PORTAL_KEY_CHECK,
  eciesEncrypt,
  encode,
  zeroAll,
  type PortalKeypair,
  type EciesOutput,
} from "@care-y/crypto";
import { performChannelOprf } from "$lib/portal/portal-crypto.js";
import type { ChannelOprfOptions } from "$lib/portal/portal-crypto.js";
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
 * Run the full add-a-password pipeline:
 *
 *   1. portalOprfInput(seed, passphrase) to fold the passphrase factor
 *   2. Channel OPRF round (blind, evaluate with PoW retry, finalize)
 *   3. derivePortalKeypairFromOprf(oprfOutput) for the new keypair
 *   4. Re-seal PORTAL_KEY_CHECK to the new public key
 *   5. Re-seal every portal message from the session's decrypted thread
 *   6. Zero old key material and intermediates
 *
 * The returned payload carries only public values and ciphertexts.
 * The caller sends it to the server and zeros nothing further.
 *
 * @param seed - Portal seed from the URL fragment (>= 18 bytes)
 * @param channelId - Hex channel identifier derived from the seed
 * @param passphrase - The passphrase the client chose
 * @param oprfOpts - OPRF evaluate callback and PoW handler
 * @param serverMessages - All portal messages from the session
 * @param session - Decrypt handle for opening existing ciphertexts
 * @returns Wire-ready addPassphrase payload
 */
export async function buildAddPassphrasePayload(
  seed: Uint8Array,
  channelId: string,
  passphrase: string,
  oprfOpts: Pick<ChannelOprfOptions, "evaluate" | "auth" | "onPowRequired">,
  serverMessages: readonly PortalMessageWire[],
  session: DecryptHandle,
): Promise<AddPassphrasePayload> {
  let newKeypair: PortalKeypair | null = null;

  try {
    // Steps 1-3: OPRF round with passphrase factor, derive new keypair.
    // performChannelOprf internally calls portalOprfInput(seed, passphrase),
    // blinds, evaluates, finalizes, and derives via derivePortalKeypairFromOprf.
    // It zeroes its own intermediates in its finally block.
    newKeypair = await performChannelOprf(seed, channelId, {
      passphrase,
      ...oprfOpts,
    });

    // Step 4: Re-seal key check to the new public key
    const keyCheckPlain = textEncoder.encode(PORTAL_KEY_CHECK);
    const keyCheckTriple: EciesOutput = eciesEncrypt(
      keyCheckPlain,
      newKeypair.clientPublic,
    );

    // Step 5: Collect decrypted messages and re-seal to new key.
    // All portal_messages rows for the channel are sealed to client_public,
    // regardless of direction. Re-seal all of them.
    const decrypted = await collectDecryptedMessages(serverMessages, session);
    const resealedMessages = rewrapMessages(decrypted, newKeypair.clientPublic);

    const payload: AddPassphrasePayload = {
      clientPublic: encode(newKeypair.clientPublic),
      keyCheck: {
        ephemeralPoint: encode(keyCheckTriple.ephemeralPoint),
        nonce: encode(keyCheckTriple.nonce),
        ciphertext: encode(keyCheckTriple.ciphertext),
      },
      resealedMessages,
    };

    return payload;
  } finally {
    // Step 6: Zero the new private key. The public key is safe to keep
    // (it is the payload). performChannelOprf already zeroed OPRF intermediates.
    if (newKeypair !== null) {
      zeroAll(newKeypair.clientPrivate);
    }
  }
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
