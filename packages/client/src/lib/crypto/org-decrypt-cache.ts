/**
 * Reactive cache for org-key (non-PII tier) decryption via Worker.
 *
 * Wraps the crypto Worker's orgDecryptBatch with a SvelteMap so each
 * ciphertext is decrypted at most once per session. Used for KB titles,
 * KB descriptions, volunteer display names, and org-key-tier content.
 *
 * Decryption is async (Worker sealed-box) but the API returns string|null
 * synchronously for backward compatibility with $derived expressions.
 * First call returns null (pending), schedules a microtask batch, and
 * the SvelteMap reactivity triggers re-render with the cached value.
 *
 * The SvelteMap is natively reactive in Svelte 5 without $state wrapping.
 */

import { untrack } from "svelte";
import { cacheRegistry } from "./cache-registry.js";
import { encode } from "@care-y/crypto";
import type { OrgKeyManager } from "./org-key.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { SerializedBuffer } from "$lib/utils/buffer-encoding.js";

function toBase64(data: Uint8Array | SerializedBuffer): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data.data);
  return encode(bytes);
}

export class OrgDecryptCache {
  private readonly cache = cacheRegistry.createMap<string, string>(
    "OrgDecryptCache",
  );
  private readonly manager: OrgKeyManager;
  private readonly bridge: CryptoBridge;
  private readonly pending = new Set<string>();
  private readonly batchQueue = new Map<string, string>();
  private batchScheduled = false;
  private settledResolvers: (() => void)[] = [];

  constructor(manager: OrgKeyManager, bridge: CryptoBridge) {
    this.manager = manager;
    this.bridge = bridge;
  }

  /**
   * Decrypt a sealed-box ciphertext, returning cached plaintext on hit.
   *
   * Safe to call from `$derived` and template expressions. First call
   * returns null (pending Worker response) and schedules a microtask
   * batch. Subsequent calls return the cached value. The underlying
   * SvelteMap triggers reactivity, so any `$derived` that received null
   * will re-evaluate once the batch response populates the cache.
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

    if (this.pending.has(id)) return null;

    if (!this.manager.isLoaded) return null;

    const ciphertextB64 = toBase64(data);

    this.pending.add(id);
    this.batchQueue.set(id, ciphertextB64);
    this.scheduleBatch();

    return null;
  }

  /** Check whether a decrypted value exists in cache. */
  has(id: string): boolean {
    return this.cache.has(id);
  }

  /** Get a cached value without triggering decrypt. */
  get(id: string): string | undefined {
    return this.cache.get(id);
  }

  /** Remove a single cached entry so the next decrypt re-decrypts fresh ciphertext. */
  delete(id: string): boolean {
    return this.cache.delete(id);
  }

  /** Clear all cached decryptions (e.g., on logout or key rotation). */
  clear(): void {
    this.cache.clear();
    this.pending.clear();
    this.batchQueue.clear();
  }

  /**
   * Async decrypt for imperative code that cannot rely on SvelteMap reactivity.
   *
   * Returns cached plaintext on hit (no Worker round-trip). On miss, sends a
   * single-item batch to the Worker, stores the result in the cache (so
   * subsequent sync `decrypt()` calls hit cache), and returns the plaintext.
   *
   * Use this in async functions like KB search `loadAll()` where the caller
   * needs the value immediately and won't re-run on cache updates.
   */
  async decryptAsync(
    id: string,
    data: SerializedBuffer | Uint8Array | null,
  ): Promise<string | null> {
    if (data === null) return null;

    const cached = this.cache.get(id);
    if (cached !== undefined) return cached;

    if (!this.manager.isLoaded) return null;

    const ciphertextB64 = toBase64(data);

    try {
      const results = await this.bridge.orgDecryptBatch([
        { cacheKey: id, ciphertext: ciphertextB64 },
      ]);
      const result = results[0];
      if (result?.plaintext !== null && result?.plaintext !== undefined) {
        this.cache.set(id, result.plaintext);
        return result.plaintext;
      }
      return null;
    } catch {
      return null;
    }
  }

  /** Number of cached entries (useful for tests). */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Returns a promise that resolves when all currently pending decrypts
   * have settled. For test synchronization.
   */
  async whenSettled(): Promise<void> {
    if (this.pending.size === 0 && this.batchQueue.size === 0) {
      return;
    }
    await new Promise<void>((resolve) => {
      this.settledResolvers.push(resolve);
    });
  }

  private scheduleBatch(): void {
    if (this.batchScheduled) return;
    this.batchScheduled = true;
    queueMicrotask(() => {
      void this.flushBatch();
    });
  }

  private async flushBatch(): Promise<void> {
    this.batchScheduled = false;

    const items = Array.from(this.batchQueue.entries()).map(
      ([cacheKey, ciphertext]) => ({ cacheKey, ciphertext }),
    );
    this.batchQueue.clear();

    if (items.length === 0) {
      this.resolveSettled();
      return;
    }

    try {
      const results = await this.bridge.orgDecryptBatch(items);

      for (const { cacheKey, plaintext } of results) {
        this.pending.delete(cacheKey);
        if (plaintext !== null) {
          untrack(() => this.cache.set(cacheKey, plaintext));
        }
      }
    } catch {
      // Bridge-level failure: clear pending so items can retry on next render
      for (const { cacheKey } of items) {
        this.pending.delete(cacheKey);
      }
    }

    this.resolveSettled();
  }

  private resolveSettled(): void {
    if (this.pending.size === 0 && this.batchQueue.size === 0) {
      const resolvers = this.settledResolvers;
      this.settledResolvers = [];
      for (const resolve of resolvers) {
        resolve();
      }
    }
  }
}
