/**
 * Email relay service.
 *
 * Owns the reply-token mint policy, Reply-To header construction,
 * footer selection, and HTML escaping for outbound client emails.
 * The relay route handler calls this after extracting and validating
 * Buffer fields; the handler retains Buffer extraction and zeroing.
 *
 * This module operates on already-stringified data (the relay handler
 * converts Buffers to strings for the EmailSender interface). It never
 * touches raw Buffers or plaintext extraction. All Buffer lifecycle
 * management stays in the relay handler's finally block.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { PlatformDatabase } from "../db/types.js";
import type { ReplyTokenHasher } from "../crypto/field-encryptor.js";
import type { OrgId, TicketId } from "@care-y/shared";
import { mintToken } from "./reply-token-service.js";
import { getStrings } from "../notifications/i18n.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface EmailRelayEnvelope {
  /** Recipient email (already stringified from the decrypted Buffer). */
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
  readonly from: string;
  readonly replyTo?: string;
}

export interface EmailRelayServiceDeps {
  readonly platformDb: Kysely<PlatformDatabase>;
  readonly replyTokenHasher: ReplyTokenHasher;
  /** Per-process cache of ticket -> plaintext reply token. Owned by the
   *  relay layer. On miss with a live DB row, re-mint and revoke
   *  (see reply-token-service.ts JSDoc). */
  readonly replyTokenCache: Map<string, string>;
}

export interface OrgEmailConfig {
  /** Custom footer text from org_config, or null when not set. */
  readonly emailReplyFooter: string | null;
  /** Org's default language for localized fallback. */
  readonly defaultLanguage: string | null;
}

// ---------------------------------------------------------------------------
// Footer HTML escaping
// ---------------------------------------------------------------------------

/**
 * Escapes a plain-text footer for safe embedding in an HTML email.
 * Handles only the three characters that would break structure.
 */
function escapeHtmlFooter(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Resolves the Reply-To address and appends the reply footer to an
 * outbound email body. When the org has no inbound email domain row,
 * the envelope is returned unchanged (byte-identical to the pre-reply
 * baseline).
 *
 * The function is pure over its DB lookups: it reads the inbound domain
 * and (on cache miss) mints a reply token, then returns the assembled
 * envelope. The caller sends via EmailSender.
 */
export async function buildEmailEnvelope(
  tenantDb: Kysely<TenantDatabase>,
  deps: EmailRelayServiceDeps,
  orgId: OrgId,
  ticketId: TicketId,
  orgConfig: OrgEmailConfig,
  base: {
    readonly to: string;
    readonly subject: string;
    readonly text: string;
    readonly html: string;
    readonly from: string;
  },
): Promise<EmailRelayEnvelope> {
  const domainRow = await deps.platformDb
    .selectFrom("inbound_email_domains")
    .select("domain")
    .where("org_id", "=", orgId)
    .executeTakeFirst();

  if (!domainRow) {
    return base;
  }

  // Check the per-process cache first; on miss, mint a fresh token.
  const cached = deps.replyTokenCache.get(ticketId);
  let token: string;
  if (cached !== undefined) {
    token = cached;
  } else {
    const result = await mintToken(tenantDb, ticketId, deps.replyTokenHasher);
    token = result.token;
    deps.replyTokenCache.set(ticketId, token);
  }

  const replyTo = `reply-${token}@${domainRow.domain}`;

  // Append footer: reuse the org_config row read by the caller.
  const footer =
    orgConfig.emailReplyFooter ??
    getStrings(orgConfig.defaultLanguage ?? "en").emailReplyFooter;

  const text = base.text + "\n\n---\n" + footer;
  const html =
    base.html +
    '<hr style="margin-top:2em">' +
    '<p style="font-size:0.85em;color:#666">' +
    escapeHtmlFooter(footer) +
    "</p>";

  return {
    to: base.to,
    subject: base.subject,
    text,
    html,
    from: base.from,
    replyTo,
  };
}
