/**
 * Generic base class for PII-tier (ECIES) decrypt caches.
 *
 * Creates its internal SvelteMap through the cache registry
 * (auto-registered on construction). Subclasses provide domain-specific
 * methods that delegate to the protected decrypt() method.
 *
 * The decrypt flow: first call returns undefined and triggers an async
 * Worker decrypt. When the Worker responds, the SvelteMap update
 * reactively re-renders any component reading the cached value.
 * Subsequent calls return the cached plaintext immediately.
 */

import { cacheRegistry } from "./cache-registry.js";
import type { SvelteMap } from "svelte/reactivity";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

/**
 * Sentinel value stored in the cache when decryption permanently fails.
 * The null byte prefix prevents collision with any real plaintext.
 */
export const DECRYPT_ERROR_SENTINEL = "\0DECRYPT_FAILED";

/** Returns true if the cached value is a decrypt failure sentinel. */
export function isDecryptError(value: string | undefined): boolean {
  return value === DECRYPT_ERROR_SENTINEL;
}

export class AsyncDecryptCache {
  private readonly cache: SvelteMap<string, string>;
  private readonly pending = new Set<string>();
  protected readonly bridge: CryptoBridge;
  private readonly label: string;

  constructor(bridge: CryptoBridge, label: string) {
    this.bridge = bridge;
    this.label = label;
    this.cache = cacheRegistry.createMap<string, string>(label);
  }

  /**
   * Returns cached plaintext if available, undefined if a decrypt is
   * already pending, or triggers an async Worker decrypt on first call.
   * The SvelteMap update re-renders any component reading the value.
   */
  protected decrypt(
    cacheKey: string,
    ephemeralPoint: string,
    nonce: string,
    wrappedKey: string,
    ciphertext: string,
  ): string | undefined {
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) return cached;
    if (this.pending.has(cacheKey)) return undefined;

    this.pending.add(cacheKey);

    void this.bridge
      .decrypt(cacheKey, ephemeralPoint, nonce, wrappedKey, ciphertext)
      .then((plaintext) => {
        this.cache.set(cacheKey, plaintext);
      })
      .catch((err: unknown) => {
        this.cache.set(cacheKey, DECRYPT_ERROR_SENTINEL);
        if (import.meta.env.DEV) {
          console.warn(`[${this.label}] decrypt failed for ${cacheKey}:`, err);
        }
      })
      .finally(() => {
        this.pending.delete(cacheKey);
      });

    return undefined;
  }

  /**
   * Store the error sentinel for a cache key. Used by subclasses when
   * decryption is known to be impossible (e.g., missing key material)
   * without going through the async bridge path.
   */
  protected setError(key: string): void {
    this.cache.set(key, DECRYPT_ERROR_SENTINEL);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  clear(): void {
    this.cache.clear();
    this.pending.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
