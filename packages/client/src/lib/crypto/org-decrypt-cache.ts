/**
 * Reactive cache for org-key (non-PII tier) decryption.
 *
 * Wraps OrgKeyManager.decrypt() with a SvelteMap so each ciphertext
 * is decrypted at most once per session. Used for KB titles, KB
 * descriptions, volunteer display names, and future org-key-tier
 * content (branding, org config).
 *
 * Decryption is synchronous (main-thread crypto_box_seal_open via
 * OrgKeyManager), so no async/await is needed. The cache is keyed by
 * a caller-provided string ID (e.g., kb item ID, user ID) to avoid
 * re-decrypting the same content across re-renders.
 *
 * The SvelteMap is natively reactive in Svelte 5 without $state wrapping.
 */

import { untrack } from "svelte";
import { cacheRegistry } from "./cache-registry.js";
import type { OrgKeyManager } from "./org-key.js";

/** Serialized Node.js Buffer as it arrives over tRPC JSON (no superjson). */
interface SerializedBuffer {
  type: "Buffer";
  data: number[];
}

export class OrgDecryptCache {
  private readonly cache = cacheRegistry.createMap<string, string>(
    "OrgDecryptCache",
  );
  private readonly manager: OrgKeyManager;

  constructor(manager: OrgKeyManager) {
    this.manager = manager;
  }

  /**
   * Decrypt a sealed-box ciphertext, returning cached plaintext on hit.
   *
   * Returns the decrypted UTF-8 string, or null if the org key is not
   * loaded or decryption fails (e.g., wrong key, corrupted ciphertext).
   *
   * @param id   Unique key for caching (e.g., kb item ID, user ID)
   * @param data Encrypted ciphertext as serialized Buffer or raw Uint8Array
   */
  decrypt(
    id: string,
    data: SerializedBuffer | Uint8Array | null,
  ): string | null {
    if (data === null) return null;

    const cached = this.cache.get(id);
    if (cached !== undefined) return cached;

    if (!this.manager.isLoaded) return null;

    try {
      const ciphertext =
        data instanceof Uint8Array ? data : new Uint8Array(data.data);

      const plainBytes = this.manager.decrypt(ciphertext);
      const plaintext = new TextDecoder().decode(plainBytes);
      // untrack: cache population is a side effect, not a reactive signal.
      // Without this, calling decrypt() from a template expression or
      // $derived triggers Svelte 5's state_unsafe_mutation error.
      untrack(() => this.cache.set(id, plaintext));
      return plaintext;
    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        console.warn(`[OrgDecryptCache] decrypt failed for ${id}:`, err);
      }
      return null;
    }
  }

  /** Check whether a decrypted value exists in cache. */
  has(id: string): boolean {
    return this.cache.has(id);
  }

  /** Get a cached value without triggering decrypt. */
  get(id: string): string | undefined {
    return this.cache.get(id);
  }

  /** Clear all cached decryptions (e.g., on logout or key rotation). */
  clear(): void {
    this.cache.clear();
  }

  /** Number of cached entries (useful for tests). */
  get size(): number {
    return this.cache.size;
  }
}
