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

export interface FollowUpRewrapContext {
  readonly followUpKeyWrap: TicketKeyWrap;
  readonly ticketId: string;
}

export class FollowUpDecryptCache extends AsyncDecryptCache {
  constructor(bridge: CryptoBridge) {
    super(bridge, "FollowUpDecryptCache");
  }

  /**
   * Decrypt content stored in a ticket slot under the canonical tk.
   *
   * Returns cached plaintext on hit, undefined if pending or first call
   * (triggers async Worker decrypt), or undefined if keyWrap is null
   * (ticket key not available).
   *
   * `cacheKey` identifies the entry in this cache (bare followUpId for
   * follow-up content, `filename:<attachmentId>` for filenames). `slot`
   * is the AEAD storage slot the ciphertext was read from (ADR-053).
   *
   * When `rewrapContext` is provided, `cacheKey` MUST be the follow-up
   * id: the Worker unwraps tk_temp with the follow-up's own key wrap,
   * then re-encrypts with the ticket's canonical tk as a background
   * side-effect, keeping the same followup slot AAD.
   */
  decryptContent(
    cacheKey: string,
    ticketId: string,
    slot: string,
    keyWrap: TicketKeyWrap | null,
    encryptedContent: string,
    rewrapContext?: FollowUpRewrapContext,
  ): string | undefined {
    if (rewrapContext) {
      return this.decryptAndRewrap(
        cacheKey,
        cacheKey,
        rewrapContext.ticketId,
        rewrapContext.followUpKeyWrap.ephemeralPoint,
        rewrapContext.followUpKeyWrap.nonce,
        rewrapContext.followUpKeyWrap.wrappedKey,
        encryptedContent,
      );
    }

    if (keyWrap === null) return undefined;
    return this.decrypt(
      cacheKey,
      ticketId,
      slot,
      keyWrap.ephemeralPoint,
      keyWrap.nonce,
      keyWrap.wrappedKey,
      encryptedContent,
    );
  }
}
