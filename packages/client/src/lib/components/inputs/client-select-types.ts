/**
 * Shared types for ClientSelect and its consumers.
 *
 * Kept in a plain .ts module (not the ClientSelect.svelte module script)
 * so typescript-eslint can resolve them; types exported from a .svelte
 * module script resolve to error types under eslint's project service.
 * ClientSelect.svelte re-exports these for existing importers.
 */

export type ClientSelection =
  | { mode: "existing"; clientId: string; displayAlias: string }
  | { mode: "new"; token: string }
  | null;

export interface CollisionInfo {
  clientId: string;
  alias: string;
  openTicketId: string;
}

export interface ClientSearchResult {
  id: string;
  alias: string;
  maskedPhone: string;
}

export type PhoneLookupResult =
  | { found: false; token: string }
  | {
      found: true;
      clientId: string;
      alias: string;
      openTicketId: string | null;
    };

/** Runtime guard for /relay/phone-lookup responses (untyped fetch boundary). */
export function isPhoneLookupResult(
  value: unknown,
): value is PhoneLookupResult {
  if (typeof value !== "object" || value === null) return false;
  if (!("found" in value)) return false;
  if (value.found === false) {
    return "token" in value && typeof value.token === "string";
  }
  if (value.found === true) {
    return (
      "clientId" in value &&
      typeof value.clientId === "string" &&
      "alias" in value &&
      typeof value.alias === "string" &&
      "openTicketId" in value &&
      (value.openTicketId === null || typeof value.openTicketId === "string")
    );
  }
  return false;
}
