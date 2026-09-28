/**
 * Reactive decrypt cache for follow-up content (PII-tier ECIES).
 *
 * Extends AsyncDecryptCache with a decryptContent() method tailored
 * to the follow-up preview use case. Each follow-up's encrypted content
 * is decrypted via the CryptoBridge Worker using the ticket's ECIES
 * key wrap (same key hierarchy as ticket titles).
 */

import { followupSlot } from "@care-y/crypto";
import { AsyncDecryptCache } from "./async-decrypt-cache.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { TicketKeyWrap } from "./ticket-decrypt-cache.js";
import { resolveAsyncDecrypt, type DecryptResult } from "./decrypt-result.js";

export interface FollowUpRewrapContext {
  readonly followUpKeyWrap: TicketKeyWrap;
  readonly ticketId: string;
}

/** The key material a list preview row carries (`tickets.recentFollowUps`). */
export interface FollowUpPreviewKeys {
  readonly id: string;
  readonly encryptedContent: string;
  readonly keyWrap: TicketKeyWrap | null;
  readonly followUpKeyWrap: TicketKeyWrap | null;
  readonly portalWrap: string | null;
}

export class FollowUpDecryptCache extends AsyncDecryptCache {
  constructor(bridge: CryptoBridge) {
    super(bridge, "FollowUpDecryptCache");
  }

  /**
   * Decrypt content stored in a ticket slot under the canonical tk.
   *
   * Returns cached plaintext on hit, undefined if pending or first call
   * (triggers async Worker decrypt), or undefined if keyWrap is null
   * (ticket key not available).
   *
   * `cacheKey` identifies the entry in this cache (bare followUpId for
   * follow-up content, `filename:<attachmentId>` for filenames). `slot`
   * is the AEAD storage slot the ciphertext was read from (ADR-053).
   *
   * When `rewrapContext` is provided, `cacheKey` MUST be the follow-up
   * id: the Worker unwraps tk_temp with the follow-up's own key wrap,
   * then re-encrypts with the ticket's canonical tk as a background
   * side-effect, keeping the same followup slot AAD.
   *
   * When `portalWrap` is provided (and no rewrapContext), `cacheKey`
   * MUST also be the follow-up id: the row is a portal client reply
   * whose tk_temp is sealed to the org key. The Worker unseals it and
   * follows the same rewrap tail.
   */
  decryptContent(
    cacheKey: string,
    ticketId: string,
    slot: string,
    keyWrap: TicketKeyWrap | null,
    encryptedContent: string,
    rewrapContext?: FollowUpRewrapContext,
    portalWrap?: string | null,
  ): string | undefined {
    if (rewrapContext) {
      return this.decryptAndRewrap(
        cacheKey,
        cacheKey,
        rewrapContext.ticketId,
        rewrapContext.followUpKeyWrap.ephemeralPoint,
        rewrapContext.followUpKeyWrap.nonce,
        rewrapContext.followUpKeyWrap.wrappedKey,
        encryptedContent,
      );
    }

    if (portalWrap != null && portalWrap !== "") {
      return this.decryptPortalReply(
        cacheKey,
        cacheKey,
        ticketId,
        portalWrap,
        encryptedContent,
      );
    }

    if (keyWrap === null) return undefined;
    return this.decrypt(
      cacheKey,
      ticketId,
      slot,
      keyWrap.ephemeralPoint,
      keyWrap.nonce,
      keyWrap.wrappedKey,
      encryptedContent,
      // Ticket id, not the follow-up cache key: every row of one ticket
      // shares the same unwrapped ticket key in the Worker.
      ticketId,
    );
  }

  /**
   * Decrypt a list preview row. A pending-convergence row has no ticket
   * wrap; it carries its own tk_temp wrap or a portal seal and takes the
   * same unwrap-and-rewrap path as the detail timeline, so a server
   * written follow-up (a voicemail, a portal reply) reads before any
   * volunteer has opened the ticket.
   */
  decryptPreview(ticketId: string, fu: FollowUpPreviewKeys): DecryptResult {
    const raw = this.decryptContent(
      fu.id,
      ticketId,
      followupSlot(fu.id),
      fu.keyWrap,
      fu.encryptedContent,
      fu.followUpKeyWrap === null
        ? undefined
        : { followUpKeyWrap: fu.followUpKeyWrap, ticketId },
      fu.portalWrap,
    );
    return resolveAsyncDecrypt(
      raw,
      fu.keyWrap !== null ||
        fu.followUpKeyWrap !== null ||
        fu.portalWrap !== null,
    );
  }
}
