/**
 * Response header utilities shared by the tRPC adapter and route handlers.
 *
 * Every tRPC response is session- or channel-scoped API data: org-side
 * responses carry ticket ciphertext to volunteer devices, portal responses
 * carry channel ciphertext to client devices. A response with no explicit
 * freshness information is heuristically cacheable (RFC 9111 section 4.2.2,
 * SEC-228), and Safari's disk cache does exactly that, so the absence of a
 * Cache-Control header is what allowed stale portal message pages and left
 * channel ciphertext in a client device's disk cache. `no-store` is the
 * directive that forbids storing rather than merely forcing revalidation
 * (MDN, SEC-229); `private` rides along to keep any intermediary that
 * mishandles no-store from treating the response as shared-cacheable,
 * matching the posture blob-download.ts already uses.
 */

/** Cache-Control value for all API responses that must never be stored. */
export const NO_STORE_CACHE_CONTROL = "private, no-store";

/**
 * Merges the no-store Cache-Control directive into a header map without
 * mutating the input. Used by the tRPC responseMeta callback so every
 * tRPC response (query, mutation, and error alike) forbids caching.
 */
export function withNoStore(
  headers: Readonly<Record<string, string>>,
): Record<string, string> {
  return { ...headers, "Cache-Control": NO_STORE_CACHE_CONTROL };
}
