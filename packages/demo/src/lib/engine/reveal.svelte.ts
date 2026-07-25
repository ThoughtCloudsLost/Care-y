/**
 * Reveal controller for demo descramble animations.
 *
 * Writes plaintext values into the stub crypto caches so
 * DecryptPlaceholder can run its descramble animation from
 * ciphertext to plaintext. Values are scheduled with staggered
 * delays (400-1400ms) to guarantee visible descramble past
 * the 150ms animation threshold.
 *
 * Imports via the ALIASED specifier so module identity matches
 * what components resolve through the Vite alias chain.
 */

import { demoSeed, demoReset } from "$lib/crypto/context";
import type { DemoSeedData } from "$lib/crypto/context";
// Real module (resolved through the catch-all alias): components compare
// cache values against this exact sentinel via resolveAsyncDecrypt().
import { DECRYPT_ERROR_SENTINEL } from "$lib/crypto/async-decrypt-cache.js";

/**
 * Which stub cache an entry lands in. "ticket" covers title, desc:,
 * fu:, and cursor: keys (all live in the ticket cache); "followUp"
 * is the follow-up content cache TicketPreview reads; "org" is the
 * org-tier cache.
 */
export type RevealCacheTarget = "ticket" | "followUp" | "org";

export interface RevealEntry {
  readonly key: string;
  readonly value: string;
  readonly delayMs: number;
  readonly cache?: RevealCacheTarget;
}

export interface RevealController {
  /**
   * Schedule staggered cache writes. Each entry lands in the
   * stub cache after its delayMs, triggering the descramble
   * animation in any mounted DecryptPlaceholder.
   */
  schedule(entries: RevealEntry[]): void;

  /**
   * Immediately seed a single key with an ERROR sentinel,
   * simulating a retryable decryption failure.
   */
  failNow(key: string, cache?: RevealCacheTarget): void;

  /**
   * Clear all stub caches and cancel pending timers.
   */
  reset(): void;
}

class DemoRevealError extends Error {
  override readonly name = "DemoRevealError";
}

function toSeedData(
  key: string,
  value: string,
  cache: RevealCacheTarget,
): DemoSeedData {
  switch (cache) {
    case "ticket":
      return { titles: { [key]: value } };
    case "followUp":
      return { followUpContent: { [key]: value } };
    case "org":
      return { orgValues: { [key]: value } };
  }
}

export function createRevealController(): RevealController {
  let pendingTimers: ReturnType<typeof setTimeout>[] = [];

  function clearTimers(): void {
    for (const timer of pendingTimers) {
      clearTimeout(timer);
    }
    pendingTimers = [];
  }

  return {
    schedule(entries: RevealEntry[]): void {
      for (const entry of entries) {
        if (entry.delayMs < 0) {
          throw new DemoRevealError(
            `delayMs must be non-negative, got ${String(entry.delayMs)} for key "${entry.key}"`,
          );
        }
        const timer = setTimeout(() => {
          demoSeed(toSeedData(entry.key, entry.value, entry.cache ?? "ticket"));
        }, entry.delayMs);
        pendingTimers.push(timer);
      }
    },

    failNow(key: string, cache: RevealCacheTarget = "ticket"): void {
      demoSeed(toSeedData(key, DECRYPT_ERROR_SENTINEL, cache));
    },

    reset(): void {
      clearTimers();
      demoReset();
    },
  };
}
