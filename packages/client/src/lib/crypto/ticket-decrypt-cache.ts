/**
 * Reactive cache for ticket-tier (PII) ECIES decryption.
 *
 * Extends AsyncDecryptCache to inherit the SvelteMap + pending Set +
 * CryptoBridge pattern and auto-register with CacheRegistry. The only
 * domain-specific logic is decryptTitle(), which handles the null-keyWrap
 * edge case and serialized-buffer-to-base64 conversion before delegating
 * to the base class decrypt().
 */

import {
  AsyncDecryptCache,
  DECRYPT_ERROR_SENTINEL,
} from "./async-decrypt-cache.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import {
  serializedBufferToBase64,
  type SerializedBuffer,
} from "$lib/utils/buffer-encoding.js";

export interface TicketKeyWrap {
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly wrappedKey: string;
}

export class TicketDecryptCache extends AsyncDecryptCache {
  constructor(bridge: CryptoBridge) {
    super(bridge, "TicketDecryptCache");
  }

  /**
   * Request decryption of a ticket title. Returns the cached plaintext
   * if already decrypted, or undefined if decryption is in-flight or
   * hasn't started yet.
   *
   * Calling this method triggers an async decrypt if the ticket hasn't
   * been seen before. The SvelteMap update will reactively re-render
   * any components reading the return value.
   */
  decryptTitle(
    ticketId: string,
    keyWrap: TicketKeyWrap | null,
    encryptedTitle: SerializedBuffer | string,
  ): string | undefined {
    if (keyWrap === null) {
      // No key wrap means the ticket cannot be decrypted (missing key
      // material). Defer the cache write to avoid state_unsafe_mutation
      // when called from a render expression.
      if (!this.has(ticketId)) {
        queueMicrotask(() => {
          if (!this.has(ticketId)) {
            this.setError(ticketId);
          }
        });
      }
      return DECRYPT_ERROR_SENTINEL;
    }

    const ciphertext = serializedBufferToBase64(encryptedTitle);

    return this.decrypt(
      ticketId,
      keyWrap.ephemeralPoint,
      keyWrap.nonce,
      keyWrap.wrappedKey,
      ciphertext,
    );
  }

  /**
   * Request decryption of a follow-up's encrypted content using the
   * ticket's key wrap. Same trigger-and-cache pattern as decryptTitle.
   * The Worker reuses the ticket key cached from title decryption.
   */
  decryptFollowUp(
    ticketId: string,
    followupId: string,
    keyWrap: TicketKeyWrap,
    ciphertext: string,
  ): string | undefined {
    return this.decrypt(
      `fu:${ticketId}:${followupId}`,
      keyWrap.ephemeralPoint,
      keyWrap.nonce,
      keyWrap.wrappedKey,
      ciphertext,
    );
  }

  clearFollowUps(): void {
    this.deleteByPrefix("fu:");
  }
}
