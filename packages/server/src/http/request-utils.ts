/**
 * HTTP request utilities shared across tRPC context and route handlers.
 */

import type { IncomingMessage } from "node:http";

/**
 * Extracts client IP from the request.
 * Prefers X-Forwarded-For (Caddy sets this in production), falls back to
 * socket.remoteAddress. For chained proxies, takes the leftmost (client) IP.
 */
export function extractClientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const first = forwarded.split(",")[0]?.trim();
    if (first !== undefined && first !== "") return first;
  }
  return req.socket.remoteAddress ?? "unknown";
}
