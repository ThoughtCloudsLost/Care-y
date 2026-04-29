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
import { isDevDelayEnabled } from "$lib/trpc/index.js";

/**
 * Sentinel value stored in the cache when decryption permanently fails.
 * The null byte prefix prevents collision with any real plaintext.
 */
export const DECRYPT_ERROR_SENTINEL = "\0DECRYPT_FAILED";

/** Returns true if the cached value is a decrypt failure sentinel. */
export function isDecryptError(value: string | null | undefined): boolean {
  return value === DECRYPT_ERROR_SENTINEL;
}

export class AsyncDecryptCache {
  private readonly cache: SvelteMap<string, string>;
  private readonly pending = new Set<string>();
  private settlers: (() => void)[] = [];
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
   *
   * Safe to call from `$derived` and template expressions. The
   * fire-and-forget Worker decrypt is idempotent (guarded by `pending`
   * Set). When the Worker responds, the SvelteMap `.set()` triggers
   * reactivity, causing any `$derived` that previously received
   * `undefined` to re-evaluate and pick up the cached plaintext.
   */
  private fireAndForget(
    cacheKey: string,
    bridgeCall: Promise<string>,
    logLabel: string,
  ): void {
    this.pending.add(cacheKey);

    const decryptPromise =
      import.meta.env.DEV && isDevDelayEnabled()
        ? new Promise<void>((resolve) => {
            setTimeout(resolve, 5_000 + Math.random() * 10_000);
          }).then(async () => bridgeCall)
        : bridgeCall;

    void decryptPromise
      .then((plaintext) => {
        this.cache.set(cacheKey, plaintext);
      })
      .catch((err: unknown) => {
        this.cache.set(cacheKey, DECRYPT_ERROR_SENTINEL);
        if (import.meta.env.DEV) {
          console.warn(
            `[${this.label}] ${logLabel} failed for ${cacheKey}:`,
            err,
          );
        }
      })
      .finally(() => {
        this.pending.delete(cacheKey);
        if (this.pending.size === 0 && this.settlers.length > 0) {
          const batch = this.settlers;
          this.settlers = [];
          for (const resolve of batch) resolve();
        }
      });
  }

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

    this.fireAndForget(
      cacheKey,
      this.bridge.decrypt(
        cacheKey,
        ephemeralPoint,
        nonce,
        wrappedKey,
        ciphertext,
      ),
      "decrypt",
    );
    return undefined;
  }

  /**
   * Decrypt content encrypted with tk_temp and trigger background re-wrap.
   * Same fire-and-forget pattern as decrypt(): returns cached plaintext or
   * undefined (pending). The Worker re-encrypts with canonical tk as a
   * side-effect and posts a RewrapEvent to the main thread.
   */
  protected decryptAndRewrap(
    cacheKey: string,
    followUpId: string,
    ticketId: string,
    ephemeralPoint: string,
    nonce: string,
    wrappedKey: string,
    ciphertext: string,
  ): string | undefined {
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) return cached;
    if (this.pending.has(cacheKey)) return undefined;

    this.fireAndForget(
      cacheKey,
      this.bridge.decryptAndRewrap(
        followUpId,
        ticketId,
        ephemeralPoint,
        nonce,
        wrappedKey,
        ciphertext,
      ),
      "decryptAndRewrap",
    );
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

  /**
   * Returns a Promise that resolves when all pending decrypts have completed.
   * Resolves immediately if nothing is pending.
   */
  async whenSettled(): Promise<void> {
    if (this.pending.size === 0) return Promise.resolve();
    return new Promise<void>((resolve) => {
      this.settlers.push(resolve);
    });
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  /**
   * Pre-populate the cache with a known plaintext value.
   * Used for optimistic UI insertion where the plaintext is already
   * available (e.g., the volunteer just typed it) and Worker decryption
   * would fail on the placeholder ciphertext.
   */
  seed(key: string, plaintext: string): void {
    this.cache.set(key, plaintext);
  }

  clear(): void {
    this.cache.clear();
    this.pending.clear();
    const batch = this.settlers;
    this.settlers = [];
    for (const resolve of batch) resolve();
  }

  deleteByPrefix(prefix: string): void {
    for (const key of [...this.cache.keys()]) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  get size(): number {
    return this.cache.size;
  }

  /** Iterate all cached entries (key -> plaintext or error sentinel). */
  entries(): IterableIterator<[string, string]> {
    return this.cache.entries();
  }
}
