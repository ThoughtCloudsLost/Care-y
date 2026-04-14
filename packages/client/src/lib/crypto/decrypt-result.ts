/**
 * Typed discriminated union for decrypt cache results.
 *
 * Normalizes the inconsistent return types of the two cache tiers
 * (ECIES caches: string | undefined, org cache: string | null) into
 * a single four-state union that TypeScript can exhaustively narrow.
 *
 * This is a pure typing/ergonomic layer. It does not modify any cache,
 * Worker protocol, or key management code. DecryptResult objects are
 * plain frozen data (no classes, no methods on prototypes) so Svelte 5
 * reactivity tracks property reads naturally via $derived.
 */

import { DECRYPT_ERROR_SENTINEL } from "./async-decrypt-cache.js";

// ---------------------------------------------------------------------------
// Union type
// ---------------------------------------------------------------------------

export type DecryptResult =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly value: string }
  | { readonly status: "denied" }
  | { readonly status: "error" };

// ---------------------------------------------------------------------------
// Singleton constants (avoid per-call allocation, enable identity checks)
// ---------------------------------------------------------------------------

export const LOADING: DecryptResult = Object.freeze({ status: "loading" });
export const DENIED: DecryptResult = Object.freeze({ status: "denied" });
export const ERROR: DecryptResult = Object.freeze({ status: "error" });

function ready(value: string): DecryptResult {
  return Object.freeze({ status: "ready", value });
}

// ---------------------------------------------------------------------------
// Normalizers: one per cache tier
// ---------------------------------------------------------------------------

/**
 * Normalize a PII-tier (ECIES) cache result into a DecryptResult.
 *
 * @param raw       - The raw cache value (string | undefined from AsyncDecryptCache)
 * @param hasAccess - Whether the volunteer has key material for this ticket
 *                    (i.e., keyWrap !== null)
 */
export function resolveAsyncDecrypt(
  raw: string | undefined,
  hasAccess: boolean,
): DecryptResult {
  if (!hasAccess) return DENIED;
  if (raw === undefined) return LOADING;
  if (raw === DECRYPT_ERROR_SENTINEL) return ERROR;
  return ready(raw);
}

/**
 * Normalize an org-tier cache result into a DecryptResult.
 *
 * @param raw         - The raw cache value (string | null from OrgDecryptCache)
 * @param isKeyLoaded - Whether the OrgKeyManager has been loaded with the org key
 */
export function resolveOrgDecrypt(
  raw: string | null,
  isKeyLoaded: boolean,
): DecryptResult {
  if (raw === null) {
    return isKeyLoaded ? ERROR : LOADING;
  }
  return ready(raw);
}

// ---------------------------------------------------------------------------
// Convenience utilities
// ---------------------------------------------------------------------------

/**
 * Exhaustive pattern match over all four DecryptResult states.
 *
 * Forces callers to handle every branch at compile time. If a fifth
 * state is ever added, existing callsites will fail to compile.
 */
export function matchDecryptResult<T>(
  result: DecryptResult,
  handlers: {
    loading: () => T;
    ready: (value: string) => T;
    denied: () => T;
    error: () => T;
  },
): T {
  switch (result.status) {
    case "loading":
      return handlers.loading();
    case "ready":
      return handlers.ready(result.value);
    case "denied":
      return handlers.denied();
    case "error":
      return handlers.error();
  }
}

/**
 * Extract the decrypted value or return a fallback string.
 * Useful for aria-labels and other cases where any non-ready state
 * should display the same placeholder text.
 */
export function decryptedValueOr(
  result: DecryptResult,
  fallback: string,
): string {
  return result.status === "ready" ? result.value : fallback;
}

/**
 * Type guard that narrows to the ready state.
 * Useful in template expressions where a full match is overkill.
 */
export function isDecryptReady(
  result: DecryptResult,
): result is { readonly status: "ready"; readonly value: string } {
  return result.status === "ready";
}
