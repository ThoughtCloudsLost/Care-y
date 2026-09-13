/**
 * Pre-bound decrypt scope for a single ticket.
 *
 * Wraps the three decrypt caches (ticket, follow-up, org) with the
 * ticket's context (ticketId, keyWrap) already applied, so components
 * can call scope.title(encryptedTitle) instead of repeating
 * ticketId + keyWrap + cache reference on every call.
 *
 * The scope is a plain object (not a class) so Svelte 5 $derived
 * tracks property reads naturally. Create it inside a $derived block
 * that depends on the ticket reactive state:
 *
 *   const decrypt = $derived(createTicketDecryptScope({ ... }));
 *
 * The scope is lightweight: all state lives in the shared caches.
 * Recreating it when the ticket changes costs one object allocation.
 */

import { followupSlot } from "@care-y/crypto";
import type {
  TicketDecryptCache,
  TicketKeyWrap,
} from "./ticket-decrypt-cache.js";
import type { FollowUpDecryptCache } from "./follow-up-decrypt-cache.js";
import type { OrgDecryptCache } from "./org-decrypt-cache.js";
import type { DecryptResult } from "./decrypt-result.js";
import { resolveAsyncDecrypt, resolveOrgDecrypt } from "./decrypt-result.js";

// ---------------------------------------------------------------------------
// Dependencies (everything the scope needs from the component's context)
// ---------------------------------------------------------------------------

export interface TicketDecryptScopeDeps {
  ticketCache: TicketDecryptCache;
  followUpCache: FollowUpDecryptCache;
  orgCache: OrgDecryptCache;
  ticketId: string;
  keyWrap: TicketKeyWrap | null;
}

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface TicketDecryptScope {
  /** Decrypt the ticket title. */
  title(encryptedTitle: string): DecryptResult;

  /** Decrypt the ticket description. */
  description(encryptedDescription: string): DecryptResult;

  /** Decrypt a follow-up's content by its ID. When followUpKeyWrap is provided, uses it for tk_temp unwrapping. */
  followUp(
    followUpId: string,
    encryptedContent: string,
    followUpKeyWrap?: TicketKeyWrap | null,
  ): DecryptResult;

  /** Decrypt a volunteer's display name via the org-tier cache. */
  volunteerName(userId: string, encryptedName: string | null): DecryptResult;

  /** Whether the current volunteer has key material for this ticket. */
  readonly hasAccess: boolean;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createTicketDecryptScope(
  deps: TicketDecryptScopeDeps,
): TicketDecryptScope {
  const { ticketCache, followUpCache, orgCache, ticketId, keyWrap } = deps;

  const hasAccess = keyWrap !== null;

  return {
    title(encryptedTitle: string): DecryptResult {
      const raw = ticketCache.decryptTitle(ticketId, keyWrap, encryptedTitle);
      return resolveAsyncDecrypt(raw, hasAccess);
    },

    description(encryptedDescription: string): DecryptResult {
      const raw = ticketCache.decryptDescription(
        ticketId,
        keyWrap,
        encryptedDescription,
      );
      return resolveAsyncDecrypt(raw, hasAccess);
    },

    followUp(
      followUpId: string,
      encryptedContent: string,
      followUpKeyWrap?: TicketKeyWrap | null,
    ): DecryptResult {
      const rewrapContext =
        followUpKeyWrap != null ? { followUpKeyWrap, ticketId } : undefined;
      const raw = followUpCache.decryptContent(
        followUpId,
        ticketId,
        followupSlot(followUpId),
        keyWrap,
        encryptedContent,
        rewrapContext,
      );
      return resolveAsyncDecrypt(raw, hasAccess);
    },

    volunteerName(userId: string, encryptedName: string | null): DecryptResult {
      const raw = orgCache.decrypt(userId, encryptedName);
      return resolveOrgDecrypt(raw, orgCache.isFailed(userId));
    },

    hasAccess,
  };
}
