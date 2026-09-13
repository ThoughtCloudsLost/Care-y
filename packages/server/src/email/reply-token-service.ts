/**
 * Reply token service: mint, resolve, and revoke per-ticket email reply tokens.
 *
 * Tokens are 128-bit random values encoded as 26-character lowercase base32
 * strings. Only an HMAC of the token is stored; the plaintext token exists
 * only in the outbound Reply-To header and in clients' mailboxes.
 *
 * Minting semantics:
 * - The relay layer keeps a per-process Map<TicketId, string> cache of
 *   plaintext tokens. On hit, the cached token is returned without a DB
 *   roundtrip. On miss with a live (unrevoked) DB row, the plaintext is
 *   unrecoverable, so a new token is minted and the old row is revoked.
 *   Both the old and new hashes remain routable until the old row's
 *   revoked_at is set (which happens atomically). This means a process
 *   restart causes a re-mint, which is the accepted cost of never
 *   persisting the plaintext token.
 * - The cache is owned by the caller (the relay handler), not by this
 *   service. This service is stateless; it receives and returns tokens.
 */

import { randomBytes } from "node:crypto";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { ReplyTokenHasher } from "../crypto/field-encryptor.js";
import { ReplyTokenError } from "../errors.js";
import { encodeBase32Lower } from "./base32.js";
import type { TicketId, ReplyTokenId } from "@care-y/shared";

/**
 * Generates a fresh 128-bit random token as 26-char lowercase base32.
 * 16 random bytes = 128 bits of entropy; base32 encoding produces
 * ceil(16 * 8 / 5) = 26 characters.
 */
function generateToken(): string {
  return encodeBase32Lower(randomBytes(16));
}

export interface MintResult {
  /** The plaintext token (26-char lowercase base32). Caller caches this. */
  readonly token: string;
  /** The DB row id of the newly minted token. */
  readonly tokenId: ReplyTokenId;
}

/**
 * Mints a new reply token for a ticket. If an unrevoked row already exists,
 * it is revoked first (the plaintext is unrecoverable after a process restart).
 *
 * Returns the plaintext token and the row id.
 */
export async function mintToken(
  tDb: Kysely<TenantDatabase>,
  ticketId: TicketId,
  hasher: ReplyTokenHasher,
): Promise<MintResult> {
  const token = generateToken();
  const tokenHash = hasher.hash(token);

  // Revoke any existing unrevoked rows for this ticket.
  await tDb
    .updateTable("email_reply_tokens")
    .set({ revoked_at: new Date() })
    .where("ticket_id", "=", ticketId)
    .where("revoked_at", "is", null)
    .execute();

  const row = await tDb
    .insertInto("email_reply_tokens")
    .values({
      ticket_id: ticketId,
      token_hash: tokenHash,
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  return { token, tokenId: row.id };
}

/**
 * Resolves a plaintext token to its ticket id. Rejects revoked tokens.
 *
 * @throws ReplyTokenError if the token is unknown or revoked.
 */
export async function resolveToken(
  token: string,
  tDb: Kysely<TenantDatabase>,
  hasher: ReplyTokenHasher,
): Promise<TicketId> {
  const tokenHash = hasher.hash(token);

  const row = await tDb
    .selectFrom("email_reply_tokens")
    .select(["ticket_id", "revoked_at"])
    .where("token_hash", "=", tokenHash)
    .executeTakeFirst();

  if (!row) {
    throw new ReplyTokenError("Unknown reply token");
  }

  if (row.revoked_at !== null) {
    throw new ReplyTokenError("Reply token has been revoked");
  }

  return row.ticket_id;
}

/**
 * Revokes all unrevoked tokens for a ticket. Subsequent resolveToken calls
 * for those tokens will fail.
 */
export async function revokeTokensForTicket(
  tDb: Kysely<TenantDatabase>,
  ticketId: TicketId,
): Promise<number> {
  const result = await tDb
    .updateTable("email_reply_tokens")
    .set({ revoked_at: new Date() })
    .where("ticket_id", "=", ticketId)
    .where("revoked_at", "is", null)
    .execute();

  // Kysely returns an array of UpdateResult; sum the numUpdatedRows.
  let total = 0n;
  for (const r of result) {
    total += r.numUpdatedRows;
  }
  return Number(total);
}
