/**
 * HTTP request utilities shared across tRPC context and route handlers.
 */

import type { IncomingMessage } from "node:http";

/**
 * Set of IP addresses considered loopback for trusted-proxy evaluation.
 * Compared against normalized addresses, so the IPv4-mapped IPv6 form
 * (::ffff:127.0.0.1) matches 127.0.0.1 without a separate entry.
 */
const LOOPBACK_ADDRESSES = new Set(["127.0.0.1", "::1"]);

/**
 * Reduces an address to a single comparable form.
 *
 * Node reports an IPv4 peer on a dual-stack listener as ::ffff:10.0.0.5,
 * while an operator configuring a proxy writes 10.0.0.5. Without folding
 * the two together the match silently fails and the proxy is treated as
 * untrusted, which collapses every client behind it onto one address for
 * rate-limiting purposes.
 */
function normalizeIp(addr: string): string {
  const lower = addr.trim().toLowerCase();
  return lower.startsWith("::ffff:") ? lower.slice("::ffff:".length) : lower;
}

/**
 * Additional trusted proxy addresses, supplied at startup.
 *
 * Deliberately injected rather than read from the environment here. This
 * module is bundled into the demo, which runs the server routers in a
 * browser, so an inline environment read would carry the variable name
 * into client-side code. Configuration is resolved once on the server and
 * handed in; see configureTrustedProxies.
 *
 * Empty until configured, so an unconfigured process trusts only
 * loopback. That is the same conservative default as before and it fails
 * closed: an unconfigured server ignores X-Forwarded-For rather than
 * believing it.
 */
let trustedProxies: ReadonlySet<string> = new Set();

/**
 * Sets the additional addresses whose X-Forwarded-For header is believed.
 * Accepts the raw comma-separated configuration value; an absent or empty
 * value leaves loopback as the only trusted peer. Call once during server
 * startup, before the listener accepts connections.
 */
export function configureTrustedProxies(raw: string | undefined): void {
  if (raw === undefined || raw.trim() === "") {
    trustedProxies = new Set();
    return;
  }
  trustedProxies = new Set(
    raw
      .split(",")
      .map((s) => normalizeIp(s))
      .filter(Boolean),
  );
}

/**
 * Returns true when the socket peer is allowed to set X-Forwarded-For.
 * A peer is trusted when its remoteAddress is loopback or was supplied
 * to configureTrustedProxies.
 */
function isPeerTrusted(remoteAddress: string): boolean {
  const addr = normalizeIp(remoteAddress);
  if (LOOPBACK_ADDRESSES.has(addr)) return true;
  return trustedProxies.has(addr);
}

/**
 * Extracts client IP from the request.
 *
 * Honors X-Forwarded-For only when the direct socket peer is a trusted
 * proxy (loopback, or an address given to configureTrustedProxies). When
 * the peer is untrusted, the socket address is returned directly,
 * preventing spoofed XFF headers from an untrusted network peer.
 *
 * Behind a trusted peer, the header is read from the right. Each proxy
 * appends the address it received the request from, so the rightmost
 * entry comes from the nearest hop and every step leftward is one hop
 * further away. The first entry that is not a configured proxy is the
 * closest address that can actually be attributed; everything to its
 * left was supplied by something we have not vouched for.
 *
 * Reading the leftmost entry instead would hand the choice to the
 * caller: a proxy that appends rather than replaces leaves an
 * attacker-sent value sitting in that position, letting anyone pick the
 * address that rate limiting and abuse controls key on.
 *
 * When every entry is a configured proxy there is no client address to
 * attribute, so the socket address stands.
 */
export function extractClientIp(req: IncomingMessage): string {
  const socketAddr = req.socket.remoteAddress ?? "unknown";

  if (isPeerTrusted(socketAddr)) {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      // Reversed at construction so the walk reads nearest hop first.
      const hopsNearestFirst = forwarded
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .reverse();

      for (const hop of hopsNearestFirst) {
        if (!isPeerTrusted(hop)) return hop;
      }
    }
  }

  return socketAddr;
}

/** Clears the configured trusted proxies. Test-only. */
export function _resetTrustedProxies(): void {
  trustedProxies = new Set();
}
