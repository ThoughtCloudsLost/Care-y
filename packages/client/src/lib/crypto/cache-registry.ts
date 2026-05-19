/**
 * Central registry for all caches holding decrypted or decryptable content.
 *
 * Every SvelteMap or SvelteSet that stores plaintext derived from ECIES
 * or org-key decryption MUST be created through cacheRegistry.createMap()
 * (or registered via .register()). This guarantees that clearAll() wipes
 * every cache on logout, session expiry, or idle timeout.
 *
 * Validator rule: no-unregistered-cache flags direct SvelteMap/SvelteSet
 * construction in $lib/crypto/ or $lib/tickets/ that bypasses the registry.
 */

import { SvelteMap } from "svelte/reactivity";

interface Clearable {
  clear(): void;
}

class CacheRegistry {
  private readonly caches = new Map<string, Clearable>();

  /**
   * Create and register a reactive SvelteMap cache.
   * This is the ONLY approved way to create a SvelteMap that holds
   * decrypted or decryptable content.
   */
  createMap<K, V>(name: string): SvelteMap<K, V> {
    const map = new SvelteMap<K, V>();
    this.register(name, {
      clear() {
        map.clear();
      },
    });
    return map;
  }

  /**
   * Register any object that implements clear().
   * Used for caches with additional internal state beyond a SvelteMap.
   */
  register(name: string, cache: Clearable): void {
    if (import.meta.env.DEV && this.caches.has(name)) {
      console.warn(`[CacheRegistry] duplicate registration: ${name}`);
    }
    this.caches.set(name, cache);
  }

  /** Clear cache contents but keep registrations. Used by beforeunload. */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  /** Clear all caches AND remove registrations. Used by logout/session teardown. */
  reset(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
    this.caches.clear();
  }

  /** Dev-mode: list registered cache names for audit. */
  get registered(): string[] {
    return [...this.caches.keys()];
  }

  get size(): number {
    return this.caches.size;
  }
}

export const cacheRegistry = new CacheRegistry();
