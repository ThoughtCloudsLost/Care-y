/**
 * Reactive cache for ticket-tier (PII) ECIES decryption.
 *
 * Wraps CryptoBridge.decrypt() with a SvelteMap so each ticket's
 * encrypted title is decrypted at most once per session. The Worker
 * caches the per-ticket key (tk) internally, so subsequent decrypts
 * of the same ticket's other fields are fast.
 *
 * Decryption is async (postMessage round-trip to the crypto Worker).
 * The cache stores the resolved plaintext; in-flight decryptions are
 * tracked by a pending Set to avoid duplicate Worker calls.
 *
 * The SvelteMap is natively reactive in Svelte 5 without $state wrapping.
 */

import { SvelteMap } from "svelte/reactivity";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { serializedBufferToBase64 } from "$lib/utils/buffer-encoding.js";

/** Serialized Node.js Buffer as it arrives over tRPC JSON (no superjson). */
interface SerializedBuffer {
  type: "Buffer";
  data: number[];
}

export interface TicketKeyWrap {
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly wrappedKey: string;
}

export class TicketDecryptCache {
  private readonly cache = new SvelteMap<string, string>();
  private readonly pending = new Set<string>();
  private readonly bridge: CryptoBridge;

  constructor(bridge: CryptoBridge) {
    this.bridge = bridge;
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
    const cached = this.cache.get(ticketId);
    if (cached !== undefined) return cached;

    if (keyWrap === null) return undefined;
    if (this.pending.has(ticketId)) return undefined;

    this.pending.add(ticketId);

    const ciphertext = serializedBufferToBase64(encryptedTitle);

    void this.bridge
      .decrypt(
        ticketId,
        keyWrap.ephemeralPoint,
        keyWrap.nonce,
        keyWrap.wrappedKey,
        ciphertext,
      )
      .then((plaintext) => {
        this.cache.set(ticketId, plaintext);
      })
      .catch(() => {
        // Decryption failure: title stays undefined (shows placeholder).
      })
      .finally(() => {
        this.pending.delete(ticketId);
      });

    return undefined;
  }

  /** Check whether a decrypted title exists in cache. */
  has(ticketId: string): boolean {
    return this.cache.has(ticketId);
  }

  /** Get a cached title without triggering decrypt. */
  get(ticketId: string): string | undefined {
    return this.cache.get(ticketId);
  }

  /** Clear all cached decryptions (e.g., on logout). */
  clear(): void {
    this.cache.clear();
    this.pending.clear();
  }

  /** Number of cached entries (useful for tests). */
  get size(): number {
    return this.cache.size;
  }
}
