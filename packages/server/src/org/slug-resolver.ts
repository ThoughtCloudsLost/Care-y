/**
 * Extracts the org slug from an HTTP request.
 *
 * Used by both the tRPC context factory and relay handler to identify
 * which org a request is targeting. Shared to avoid logic duplication.
 *
 * Dev: reads X-Org-Slug header (SOG-07 fallback for local development
 * without subdomain routing).
 * Prod: extracts subdomain from Host header (slug.care-y.app -> slug).
 */

import type { IncomingMessage } from "node:http";
import { extractSubdomain } from "@care-y/shared";
import { getEnv } from "../env.js";

export function extractOrgSlug(req: IncomingMessage): string | null {
  const env = getEnv();

  if (env.NODE_ENV === "development") {
    const header = req.headers["x-org-slug"];
    if (typeof header === "string" && header.length > 0) {
      return header;
    }
  }

  const host = req.headers.host;
  if (host === undefined || host === "") return null;

  return extractSubdomain(host);
}
