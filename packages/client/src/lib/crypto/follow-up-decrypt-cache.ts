/**
 * Reactive decrypt cache for follow-up content (PII-tier ECIES).
 *
 * Extends AsyncDecryptCache with a decryptContent() method tailored
 * to the follow-up preview use case. Each follow-up's encrypted content
 * is decrypted via the CryptoBridge Worker using the ticket's ECIES
 * key wrap (same key hierarchy as ticket titles).
 */

import { AsyncDecryptCache } from "./async-decrypt-cache.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { TicketKeyWrap } from "./ticket-decrypt-cache.js";
import {
  serializedBufferToBase64,
  type SerializedBuffer,
} from "$lib/utils/buffer-encoding.js";

export interface FollowUpRewrapContext {
  readonly followUpKeyWrap: TicketKeyWrap;
  readonly ticketId: string;
}

export class FollowUpDecryptCache extends AsyncDecryptCache {
  constructor(bridge: CryptoBridge) {
    super(bridge, "FollowUpDecryptCache");
  }

  /**
   * Decrypt a follow-up's encrypted content.
   *
   * Returns cached plaintext on hit, undefined if pending or first call
   * (triggers async Worker decrypt), or undefined if keyWrap is null
   * (ticket key not available).
   *
   * When `rewrapContext` is provided, uses the follow-up's own key wrap
   * for ECIES unwrapping of tk_temp. The Worker re-encrypts with the
   * ticket's canonical tk as a background side-effect.
   */
  decryptContent(
    followUpId: string,
    keyWrap: TicketKeyWrap | null,
    encryptedContent: SerializedBuffer | string,
    rewrapContext?: FollowUpRewrapContext,
  ): string | undefined {
    if (rewrapContext) {
      return this.decryptAndRewrap(
        followUpId,
        followUpId,
        rewrapContext.ticketId,
        rewrapContext.followUpKeyWrap.ephemeralPoint,
        rewrapContext.followUpKeyWrap.nonce,
        rewrapContext.followUpKeyWrap.wrappedKey,
        serializedBufferToBase64(encryptedContent),
      );
    }

    if (keyWrap === null) return undefined;
    return this.decrypt(
      followUpId,
      keyWrap.ephemeralPoint,
      keyWrap.nonce,
      keyWrap.wrappedKey,
      serializedBufferToBase64(encryptedContent),
    );
  }
}
