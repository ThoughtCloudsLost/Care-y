/**
 * Reactive cache for ticket-tier (PII) ECIES decryption.
 *
 * Extends AsyncDecryptCache to inherit the SvelteMap + pending Set +
 * CryptoBridge pattern and auto-register with CacheRegistry. The only
 * domain-specific logic is decryptTitle(), which handles the null-keyWrap
 * edge case and serialized-buffer-to-base64 conversion before delegating
 * to the base class decrypt().
 */

import { cursorSlot, followupSlot } from "@care-y/crypto";
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
      ticketId,
      "title",
      keyWrap.ephemeralPoint,
      keyWrap.nonce,
      keyWrap.wrappedKey,
      ciphertext,
    );
  }

  /**
   * Request decryption of a ticket description. Same trigger-and-cache
   * pattern as decryptTitle; the "description" slot is a direct ticket
   * field slot like "title". Cached under desc:<ticketId> so it never
   * collides with the title entry.
   */
  decryptDescription(
    ticketId: string,
    keyWrap: TicketKeyWrap | null,
    encryptedDescription: SerializedBuffer | string,
  ): string | undefined {
    const cacheKey = `desc:${ticketId}`;
    if (keyWrap === null) {
      if (!this.has(cacheKey)) {
        queueMicrotask(() => {
          if (!this.has(cacheKey)) {
            this.setError(cacheKey);
          }
        });
      }
      return DECRYPT_ERROR_SENTINEL;
    }

    const ciphertext = serializedBufferToBase64(encryptedDescription);

    return this.decrypt(
      cacheKey,
      ticketId,
      "description",
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
      ticketId,
      followupSlot(followupId),
      keyWrap.ephemeralPoint,
      keyWrap.nonce,
      keyWrap.wrappedKey,
      ciphertext,
    );
  }

  clearFollowUps(): void {
    this.deleteByPrefix("fu:");
  }

  /**
   * Request decryption of a per-user read cursor blob for the tickets
   * list. Returns the decrypted JSON payload string ({"readUpTo": ...}),
   * undefined while pending, or the error sentinel when the blob is a
   * first-open dummy row or otherwise fails AEAD (both read as "no real
   * cursor" and therefore not unread).
   *
   * The cache key carries a ciphertext prefix so a cursor update (new
   * random ciphertext) re-decrypts instead of serving a stale readUpTo.
   * The bridge call mirrors the detail composable's exactly: per-user
   * AAD slot, the row's own key wrap, and the ticket id as the Worker
   * key-cache id so cursor versions share one unwrapped ticket key.
   *
   * Lifecycle: a successful read-cursor flush evicts the ticket's
   * cursor: prefix (detail orchestrator) so versions do not pile up as
   * the user reads. Residual growth from sweep refetches of other-device
   * updates remains, bounded by the user's open-ticket count; accepted.
   */
  decryptReadCursor(
    ticketId: string,
    userId: string,
    keyWrap: TicketKeyWrap | null,
    encryptedReadCursor: SerializedBuffer | string,
  ): string | undefined {
    const ciphertext = serializedBufferToBase64(encryptedReadCursor);
    const cacheKey = `cursor:${ticketId}:${ciphertext.slice(0, 24)}`;
    if (keyWrap === null) {
      if (!this.has(cacheKey)) {
        queueMicrotask(() => {
          if (!this.has(cacheKey)) {
            this.setError(cacheKey);
          }
        });
      }
      return DECRYPT_ERROR_SENTINEL;
    }

    return this.decrypt(
      cacheKey,
      ticketId,
      cursorSlot(userId),
      keyWrap.ephemeralPoint,
      keyWrap.nonce,
      keyWrap.wrappedKey,
      ciphertext,
      ticketId,
    );
  }
}
