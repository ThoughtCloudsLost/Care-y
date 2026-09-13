/**
 * HTTP request utilities shared across tRPC context and route handlers.
 */

import type { IncomingMessage } from "node:http";

/**
 * Set of IP addresses considered loopback for trusted-proxy evaluation.
 * Covers IPv4 loopback (127.0.0.1), IPv6 loopback (::1), and the
 * IPv4-mapped IPv6 loopback that Node reports when a v4 client connects
 * to a dual-stack server (::ffff:127.0.0.1).
 */
const LOOPBACK_ADDRESSES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

/**
 * Parses the TRUSTED_PROXIES env var into a Set of IP strings.
 * Returns null when unset or empty (only loopback is trusted).
 */
function parseTrustedProxies(): Set<string> | null {
  const raw = process.env.TRUSTED_PROXIES;
  if (raw === undefined || raw.trim() === "") return null;
  const addrs = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return addrs.length > 0 ? new Set(addrs) : null;
}

/** Cached result of parseTrustedProxies (read once at module load). */
let trustedProxiesCache: Set<string> | null | undefined;

function getTrustedProxies(): Set<string> | null {
  if (trustedProxiesCache === undefined) {
    trustedProxiesCache = parseTrustedProxies();
  }
  return trustedProxiesCache;
}

/**
 * Returns true when the socket peer is allowed to set X-Forwarded-For.
 * A peer is trusted when its remoteAddress is loopback or appears in
 * the TRUSTED_PROXIES env var.
 */
function isPeerTrusted(remoteAddress: string): boolean {
  if (LOOPBACK_ADDRESSES.has(remoteAddress)) return true;
  const extra = getTrustedProxies();
  return extra?.has(remoteAddress) ?? false;
}

/**
 * Extracts client IP from the request.
 *
 * Honors X-Forwarded-For only when the direct socket peer is a trusted
 * proxy (loopback or listed in TRUSTED_PROXIES). When the peer is
 * untrusted, the socket address is returned directly, preventing
 * spoofed XFF headers from an untrusted network peer.
 *
 * For chained proxies behind a trusted peer, takes the leftmost
 * (client) IP from X-Forwarded-For.
 */
export function extractClientIp(req: IncomingMessage): string {
  const socketAddr = req.socket.remoteAddress ?? "unknown";

  if (isPeerTrusted(socketAddr)) {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      const first = forwarded.split(",")[0]?.trim();
      if (first !== undefined && first !== "") return first;
    }
  }

  return socketAddr;
}

/** Resets the cached trusted proxies. Test-only. */
export function _resetTrustedProxiesCache(): void {
  trustedProxiesCache = undefined;
}
