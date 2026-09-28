/**
 * Client search and phone lookup for ClientSelect consumers.
 *
 * Client aliases are sealed with the org key, so the server cannot match
 * typed text against them. search() loads one page of clients, decrypts
 * the aliases here, and filters them by substring in memory. The decrypted
 * page is cached until reset(), which consumers call when their sheet
 * closes so a later open sees fresh data.
 */

import { RelayError } from "$lib/errors.js";
import { DEV_ORG_SLUG } from "$lib/utils/org-slug.js";
import type { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";
import {
  isPhoneLookupResult,
  type ClientSearchResult,
  type PhoneLookupResult,
} from "./client-select-types.js";

/** Largest page the searchClients procedure accepts. */
const CLIENT_PAGE_LIMIT = 50;

/** A searchClients row before its alias is decrypted. */
export type ClientSearchRow = Omit<ClientSearchResult, "alias">;

/** The slice of the tickets router this module calls. */
export interface ClientSearchRouter {
  readonly searchClients: {
    query(input: {
      query: string;
      limit: number;
    }): Promise<readonly ClientSearchRow[]>;
  };
}

export interface ClientSelectSearchDeps {
  readonly ticketRouter: ClientSearchRouter;
  readonly orgCache: Pick<OrgDecryptCache, "decrypt" | "decryptAsync">;
  readonly orgKeyManager: Pick<OrgKeyManager, "phoneMatchHash">;
}

export interface ClientSelectSearch {
  /** Clients whose decrypted alias contains `query` (case-insensitive). */
  readonly search: (query: string) => Promise<ClientSearchResult[]>;
  /** Looks a phone number up through the relay. */
  readonly phoneLookup: (phone: string) => Promise<PhoneLookupResult>;
  /** Drops the cached client page. */
  readonly reset: () => void;
}

export function createClientSelectSearch(
  deps: ClientSelectSearchDeps,
): ClientSelectSearch {
  const { ticketRouter, orgCache, orgKeyManager } = deps;
  let clientCache: ClientSearchResult[] | null = null;

  async function search(query: string): Promise<ClientSearchResult[]> {
    if (!clientCache) {
      const raw = await ticketRouter.searchClients.query({
        query: "",
        limit: CLIENT_PAGE_LIMIT,
      });
      const decrypted = await Promise.all(
        raw.map(async (r) => ({
          ...r,
          alias:
            (await orgCache.decryptAsync(
              `client-alias:${r.id}`,
              r.encryptedAlias,
              { table: "clients", id: r.id },
            )) ?? r.id.slice(0, 8),
        })),
      );
      clientCache = decrypted;
    }

    const q = query.toLowerCase().trim();
    if (q.length === 0) return clientCache;
    return clientCache.filter((c) => c.alias.toLowerCase().includes(q));
  }

  async function phoneLookup(phone: string): Promise<PhoneLookupResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (import.meta.env.DEV) {
      headers["x-org-slug"] = DEV_ORG_SLUG;
    }

    const phoneMatchHash = await orgKeyManager.phoneMatchHash(phone);

    const res = await fetch("/relay/phone-lookup", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({
        phone,
        ...(phoneMatchHash != null ? { phoneMatchHash } : {}),
      }),
    });

    if (!res.ok) {
      throw new RelayError("PHONE_LOOKUP_FAILED", res.status);
    }

    // Validate the shape rather than casting: this is a fetch boundary, and
    // the guard exists for it.
    const raw: unknown = await res.json();
    if (!isPhoneLookupResult(raw)) {
      throw new RelayError("PHONE_LOOKUP_MALFORMED", res.status);
    }
    if (!raw.found) return raw;

    // Show a short client id while the alias is still decrypting or when it
    // cannot be decrypted, rather than an empty field.
    return {
      ...raw,
      alias:
        orgCache.decrypt(`client-alias:${raw.clientId}`, raw.encryptedAlias, {
          table: "clients",
          id: raw.clientId,
        }) ?? raw.clientId.slice(0, 8),
    };
  }

  function reset(): void {
    clientCache = null;
  }

  return { search, phoneLookup, reset };
}
