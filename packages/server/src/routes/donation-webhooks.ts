/**
 * Raw HTTP handler for donation provider webhooks.
 *
 * Path format: /webhooks/givebutter/<org-uuid>/<connection-uuid>
 *
 * Givebutter posts a JSON body carrying donor name, email, address and
 * phone. CARE-Y needs none of it: a delivery only means "totals changed".
 * The body is drained up to a size cap and dropped without being parsed,
 * buffered or logged, and every response body is empty.
 *
 * Givebutter authenticates a delivery with a static shared secret in the
 * `signature` header (no HMAC over the body, no timestamp), so a captured
 * delivery can be replayed. A replay can do no more than a genuine
 * delivery: drop cached totals and ask clients to refetch. The per
 * connection rate limit bounds that.
 */

import { timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  donationConnectionIdSchema,
  orgIdSchema,
  type DonationConnectionId,
  type OrgId,
} from "@care-y/shared";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type { DonationWebhookDispatch } from "../donations/webhook-dispatch.js";

/** Largest body drained before the request is refused. */
export const DONATION_WEBHOOK_MAX_BODY_BYTES = 64 * 1024;

export interface DonationWebhookHandlerDeps {
  readonly dispatch: DonationWebhookDispatch;
  /** Keyed per connection id; 60 per minute in production. */
  readonly rateLimiter: RateLimiter;
}

interface ParsedDonationPath {
  readonly orgId: OrgId;
  readonly connectionId: DonationConnectionId;
}

/**
 * Parse /webhooks/givebutter/<orgId>/<connectionId>, ignoring any query
 * string. Returns null when the path does not match.
 */
export function parseDonationWebhookPath(
  url: string,
): ParsedDonationPath | null {
  const questionIdx = url.indexOf("?");
  const pathname = questionIdx >= 0 ? url.slice(0, questionIdx) : url;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 4) return null;
  if (segments[0] !== "webhooks" || segments[1] !== "givebutter") return null;

  const orgId = orgIdSchema.safeParse(segments[2]);
  const connectionId = donationConnectionIdSchema.safeParse(segments[3]);
  if (!orgId.success || !connectionId.success) return null;

  return { orgId: orgId.data, connectionId: connectionId.data };
}

/**
 * Read and discard the request body. Resolves true once the stream ends
 * within `maxBytes`, false when it runs over or errors. No chunk is kept.
 */
export async function drainBody(
  req: IncomingMessage,
  maxBytes: number = DONATION_WEBHOOK_MAX_BODY_BYTES,
): Promise<boolean> {
  return new Promise((resolve) => {
    let total = 0;
    let settled = false;

    const finish = (ok: boolean): void => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };

    req.on("data", (chunk: Buffer) => {
      if (settled) return;
      total += chunk.length;
      if (total > maxBytes) {
        finish(false);
      }
    });
    req.on("end", () => {
      finish(true);
    });
    req.on("error", () => {
      finish(false);
    });
  });
}

/**
 * Compare the `signature` header with the stored secret. Lengths are
 * checked first because timingSafeEqual requires equal-length inputs; a
 * length mismatch reveals only that the length is wrong.
 */
export function signatureMatches(
  header: string | string[] | undefined,
  secret: string,
): boolean {
  if (typeof header !== "string" || header === "") return false;

  const presented = Buffer.from(header, "utf-8");
  const expected = Buffer.from(secret, "utf-8");
  try {
    if (presented.length !== expected.length) return false;
    return timingSafeEqual(presented, expected);
  } finally {
    presented.fill(0);
    expected.fill(0);
  }
}

/** Write an empty-bodied response. */
function sendEmpty(res: ServerResponse, status: number): void {
  res.writeHead(status);
  res.end();
}

/**
 * Creates the donation webhook HTTP handler, mounted on the
 * /webhooks/givebutter/ prefix ahead of the telephony /webhooks/ handler.
 */
export function createDonationWebhookHandler(
  deps: DonationWebhookHandlerDeps,
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== "POST") {
      sendEmpty(res, 405);
      return;
    }

    const parsed = parseDonationWebhookPath(req.url ?? "");
    if (!parsed) {
      sendEmpty(res, 404);
      return;
    }

    if (!deps.rateLimiter.check(parsed.connectionId).allowed) {
      sendEmpty(res, 429);
      return;
    }

    if (!(await drainBody(req))) {
      sendEmpty(res, 413);
      return;
    }

    let target;
    try {
      target = await deps.dispatch.resolveTarget(
        parsed.orgId,
        parsed.connectionId,
      );
    } catch {
      sendEmpty(res, 500);
      return;
    }
    // Unknown org, inactive org, another org's connection and a
    // connection without a secret all look the same from outside.
    if (target === null) {
      sendEmpty(res, 404);
      return;
    }

    // 403, as the telephony webhook handler answers a bad signature.
    if (!signatureMatches(req.headers.signature, target.secret)) {
      sendEmpty(res, 403);
      return;
    }

    try {
      await deps.dispatch.onDonation(target.orgSchema, parsed.connectionId);
    } catch {
      sendEmpty(res, 500);
      return;
    }

    sendEmpty(res, 204);
  };
}
