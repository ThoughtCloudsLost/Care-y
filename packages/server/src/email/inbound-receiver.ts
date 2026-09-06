/**
 * Inbound SMTP receiver: accepts tokenized reply mail and nothing else.
 *
 * Runs as its own process (inbound-entry.ts), never inside the API. The
 * accept/reject flow is RCPT-first (inbound email design, section 4):
 * scanners and spam cost one rejected command and never reach the DATA
 * parser. Processing is synchronous inside the SMTP transaction; there
 * is no spool, no queue, and no plaintext at rest. On internal failure
 * the receiver answers 451 and the sender's MTA retries (RFC 5321
 * section 4.5.4.1, SEC-230). The receiver never sends mail, so mail
 * loops cannot involve it (RFC 3834 problem space, SEC-232).
 *
 * SIZE is advertised via the `size` option, but smtp-server does not
 * enforce the actual transfer size ("message data is streamed to the
 * application", smtp-server README): onData enforces the cap itself and
 * checks stream.sizeExceeded.
 *
 * Nothing here logs content, subjects, addresses, or tokens.
 */

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import type { Kysely } from "kysely";
import { SMTPServer } from "smtp-server";
import type {
  SMTPServerAddress,
  SMTPServerDataStream,
  SMTPServerSession,
} from "smtp-server";
import PostalMime from "postal-mime";
import type { OrgSchema, TicketId } from "@care-y/shared";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import type { ReplyTokenHasher } from "../crypto/field-encryptor.js";
import { resolveToken } from "./reply-token-service.js";
import { htmlStrip } from "./html-strip.js";
import type { InboundEmailData, InboundEmailResult } from "./inbound-email.js";
import { handleInboundEmail } from "./inbound-email.js";
import { createDedupStore, type DedupStore } from "../telephony/dedup-store.js";
import { createCleanupInterval } from "../utils/intervals.js";

/** Advertised and enforced maximum message size (256 KiB, design section 4). */
export const MAX_MESSAGE_BYTES = 262144;

/** Per-IP connection budget per fixed one-minute window. */
const MAX_CONNECTIONS_PER_IP_PER_MINUTE = 10;

/** Per-token ingest budget per fixed one-hour window (design section 9;
 *  the value is registered in security-hardening.md's rate-limit table). */
const MAX_INGESTS_PER_TOKEN_PER_HOUR = 30;

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const COUNTER_CLEANUP_MS = 60_000;

/** Local part shape: reply-<26 chars lowercase base32>. Case-insensitive
 *  on match because intermediaries case-fold local parts; the token is
 *  lowercased before hashing. */
const LOCAL_PART_RE = /^reply-([a-z2-7]{26})$/i;

interface SmtpReplyError extends Error {
  responseCode: number;
}

/** Builds an Error carrying the SMTP reply code smtp-server sends back. */
function smtpError(responseCode: number, message: string): SmtpReplyError {
  return Object.assign(new Error(message), { responseCode });
}

/** Fixed-window counter keyed by an opaque string (IP or token hash). */
interface WindowCounter {
  count: number;
  windowStart: number;
}

interface ResolvedRecipient {
  readonly orgSchema: OrgSchema;
  readonly ticketId: TicketId;
  readonly tokenHash: string;
}

export interface ParsedReplyAddress {
  readonly token: string;
  readonly domain: string;
}

/**
 * Parses an RCPT address into its reply token and lowercased domain.
 * Returns null for anything that is not exactly reply-<token>@<domain>.
 */
export function parseReplyAddress(address: string): ParsedReplyAddress | null {
  const at = address.lastIndexOf("@");
  if (at <= 0 || at === address.length - 1) return null;

  const local = address.slice(0, at);
  const domain = address.slice(at + 1).toLowerCase();

  const match = LOCAL_PART_RE.exec(local);
  const captured = match?.[1];
  if (captured === undefined) return null;

  return { token: captured.toLowerCase(), domain };
}

export interface InboundReceiverDeps {
  readonly platformDb: Kysely<PlatformDatabase>;
  readonly getTenantDb: (schema: OrgSchema) => Kysely<TenantDatabase>;
  readonly replyTokenHasher: ReplyTokenHasher;
  /** Injectable ingest for tests; defaults to handleInboundEmail. */
  readonly ingest?: (
    tDb: Kysely<TenantDatabase>,
    ticketId: TicketId,
    data: InboundEmailData,
  ) => Promise<InboundEmailResult>;
  /** Injectable clock for rate-window tests. */
  readonly now?: () => number;
}

export interface InboundReceiverOptions {
  readonly port: number;
  readonly tlsKeyPath?: string | undefined;
  readonly tlsCertPath?: string | undefined;
}

export interface InboundReceiver {
  /** Start listening. Resolves with the bound port once the socket is up
   *  (relevant when opts.port is 0, as in tests). */
  listen(): Promise<number>;
  /** Stop accepting connections and release timers. */
  close(): Promise<void>;
}

/**
 * Creates the SMTP receiver with the tokenized-reply accept policy.
 *
 * STARTTLS is offered only when both TLS paths are configured; AUTH is
 * always disabled (the token is the credential, design section 5).
 */
export function createInboundReceiver(
  deps: InboundReceiverDeps,
  opts: InboundReceiverOptions,
): InboundReceiver {
  const now = deps.now ?? Date.now;
  const ingest = deps.ingest ?? handleInboundEmail;

  const ipCounters = new Map<string, WindowCounter>();
  const tokenCounters = new Map<string, WindowCounter>();
  const resolved = new WeakMap<SMTPServerSession, ResolvedRecipient>();
  const dedup: DedupStore = createDedupStore(undefined, now);

  function overBudget(
    counters: Map<string, WindowCounter>,
    key: string,
    windowMs: number,
    limit: number,
  ): boolean {
    const t = now();
    const entry = counters.get(key);
    if (!entry || t - entry.windowStart >= windowMs) {
      counters.set(key, { count: 1, windowStart: t });
      return false;
    }
    entry.count += 1;
    return entry.count > limit;
  }

  function pruneCounters(): void {
    const t = now();
    for (const [key, entry] of ipCounters) {
      if (t - entry.windowStart >= MINUTE_MS) ipCounters.delete(key);
    }
    for (const [key, entry] of tokenCounters) {
      if (t - entry.windowStart >= HOUR_MS) tokenCounters.delete(key);
    }
  }

  const stopCleanup = createCleanupInterval(COUNTER_CLEANUP_MS, pruneCounters);

  const useTls =
    opts.tlsKeyPath !== undefined && opts.tlsCertPath !== undefined;

  const server = new SMTPServer({
    // AUTH is never valid here: token possession is the credential.
    disabledCommands: ["AUTH"],
    // Without configured certs, do not advertise STARTTLS at all rather
    // than presenting smtp-server's built-in self-signed placeholder.
    hideSTARTTLS: !useTls,
    ...(useTls
      ? {
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- operator-controlled TLS key path from env, read once at boot
          key: readFileSync(opts.tlsKeyPath ?? ""),
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- operator-controlled TLS cert path from env, read once at boot
          cert: readFileSync(opts.tlsCertPath ?? ""),
        }
      : {}),
    size: MAX_MESSAGE_BYTES,
    // No DNS work per connection; the hostname is never used.
    disableReverseLookup: true,

    onConnect(session, callback) {
      if (
        overBudget(
          ipCounters,
          session.remoteAddress,
          MINUTE_MS,
          MAX_CONNECTIONS_PER_IP_PER_MINUTE,
        )
      ) {
        callback(smtpError(421, "Connection rate exceeded, try again later"));
        return;
      }
      callback(null);
    },

    onRcptTo(address: SMTPServerAddress, session, callback) {
      void (async (): Promise<void> => {
        // Exactly one recipient per transaction (design section 4).
        if (session.envelope.rcptTo.length >= 1) {
          callback(smtpError(550, "Only one recipient accepted"));
          return;
        }

        const parsed = parseReplyAddress(address.address);
        if (!parsed) {
          callback(smtpError(550, "Mailbox not found"));
          return;
        }

        // Resolve the tenant from the domain (public schema) before
        // touching a tenant schema, same shape as webhook routing.
        const domainRow = await deps.platformDb
          .selectFrom("inbound_email_domains")
          .innerJoin("orgs", "orgs.id", "inbound_email_domains.org_id")
          .select("orgs.schema_name")
          .where("inbound_email_domains.domain", "=", parsed.domain)
          .executeTakeFirst();

        if (!domainRow) {
          callback(smtpError(550, "Mailbox not found"));
          return;
        }

        const tDb = deps.getTenantDb(domainRow.schema_name);
        const ticketId = await resolveToken(
          parsed.token,
          tDb,
          deps.replyTokenHasher,
        );

        const tokenHash = deps.replyTokenHasher.hash(parsed.token);
        if (
          overBudget(
            tokenCounters,
            tokenHash,
            HOUR_MS,
            MAX_INGESTS_PER_TOKEN_PER_HOUR,
          )
        ) {
          callback(smtpError(451, "Rate limit exceeded, try again later"));
          return;
        }

        resolved.set(session, {
          orgSchema: domainRow.schema_name,
          ticketId,
          tokenHash,
        });
        callback(null);
      })().catch(() => {
        // Unknown/revoked token and lookup failures are indistinguishable
        // to the sender by design: one rejected RCPT, no detail.
        callback(smtpError(550, "Mailbox not found"));
      });
    },

    onData(stream: SMTPServerDataStream, session, callback) {
      const recipient = resolved.get(session);
      if (!recipient) {
        stream.resume();
        stream.once("end", () => {
          callback(smtpError(451, "No resolved recipient for transaction"));
        });
        return;
      }

      const chunks: Buffer[] = [];
      let total = 0;

      stream.on("data", (chunk: Buffer) => {
        total += chunk.length;
        // Keep draining past the cap (the SMTP dialog must complete),
        // but stop retaining bytes.
        if (total <= MAX_MESSAGE_BYTES) {
          chunks.push(chunk);
        }
      });

      stream.once("end", () => {
        void (async (): Promise<void> => {
          if (stream.sizeExceeded || total > MAX_MESSAGE_BYTES) {
            callback(smtpError(552, "Message exceeds maximum size"));
            return;
          }

          const raw = Buffer.concat(chunks);
          const parsed = await PostalMime.parse(raw);

          // Best-effort Message-ID dedupe, mirroring the webhook SID
          // posture: a duplicate answers 250 without a second ingest.
          const dedupKey =
            parsed.messageId !== undefined && parsed.messageId !== ""
              ? createHash("sha256").update(parsed.messageId).digest("hex")
              : null;
          if (dedupKey !== null && dedup.isDuplicate(dedupKey)) {
            callback(null);
            return;
          }

          const from = parsed.from;
          const claimedFrom =
            from === undefined ? "" : (from.address ?? from.name);

          const text =
            parsed.text !== undefined && parsed.text.length > 0
              ? parsed.text
              : htmlStrip(parsed.html ?? "");

          const data: InboundEmailData = {
            subject: parsed.subject ?? "",
            text,
            from: claimedFrom,
            droppedAttachments: parsed.attachments.length,
          };

          const tDb = deps.getTenantDb(recipient.orgSchema);
          await ingest(tDb, recipient.ticketId, data);

          if (dedupKey !== null) {
            dedup.markProcessed(dedupKey);
          }
          callback(null);
        })().catch(() => {
          // Transient reply: the sender's MTA queues and retries per
          // RFC 5321 4.5.4.1 (SEC-230). No detail is echoed.
          callback(smtpError(451, "Temporary processing failure"));
        });
      });
    },
  });

  return {
    async listen(): Promise<number> {
      return new Promise((resolve, reject) => {
        server.once("error", reject);
        const netServer = server.listen(opts.port, () => {
          server.removeListener("error", reject);
          const addr = netServer.address();
          if (addr === null || typeof addr === "string") {
            reject(new Error("Inbound SMTP receiver bound to a non-IP socket"));
            return;
          }
          resolve(addr.port);
        });
      });
    },

    async close(): Promise<void> {
      stopCleanup();
      dedup.stop();
      ipCounters.clear();
      tokenCounters.clear();
      return new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    },
  };
}
