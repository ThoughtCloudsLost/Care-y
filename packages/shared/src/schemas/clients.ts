/**
 * Zod schemas for client management input validation.
 *
 * Client aliases are org-key encrypted. The browser seals the alias
 * and computes a blind index hash before sending both to the server.
 * Phone numbers arrive as plaintext E.164 from the client (over TLS),
 * because the client has no access to OPS_SECRETS_KEY for HMAC hashing.
 * The server encrypts and hashes on receipt.
 */

import { z } from "zod";

// --- Client list (paginated, sortable, searchable) ---

export const clientListInputSchema = z.object({
  query: z.string().max(200).default(""),
  sortBy: z.enum(["created_at", "ticket_count"]).default("created_at"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.uuid().optional(),

  // Exact-alias lookup via blind index hash (browser-computed)
  aliasHash: z.string().max(256).optional(),

  // Filter: tri-state application ownership. true = has tickets, false = no
  // tickets, undefined = no filtering. The list query already computes a
  // ticket-count subquery so this reuses it without adding another.
  hasApplications: z.boolean().optional(),

  // Filter: created-date range. Each bound is independently optional.
  createdAfter: z.iso.datetime().optional(),
  createdBefore: z.iso.datetime().optional(),

  // Filter: include clients that have been merged into another. Defaults to
  // false, preserving the existing behavior of excluding merged clients.
  includeMerged: z.boolean().default(false),
});
export type ClientListInput = z.infer<typeof clientListInputSchema>;

// --- Client detail (single client by ID) ---

export const clientGetInputSchema = z.object({
  clientId: z.uuid(),
});
export type ClientGetInput = z.infer<typeof clientGetInputSchema>;

// --- Alias update (browser sends sealed ciphertext + blind index hash) ---

export const updateAliasInputSchema = z.object({
  clientId: z.uuid(),
  encryptedAlias: z.string().min(1).max(4096),
  aliasHash: z.string().min(1).max(256),
});
export type UpdateAliasInput = z.infer<typeof updateAliasInputSchema>;

// --- Alias hash backfill (browser supplies hash for webhook-created rows) ---

export const backfillAliasHashInputSchema = z.object({
  clientId: z.uuid(),
  aliasHash: z.string().min(1).max(256),
});
export type BackfillAliasHashInput = z.infer<
  typeof backfillAliasHashInputSchema
>;

// --- Phone update (plaintext E.164, server encrypts and hashes) ---

export const updatePhoneInputSchema = z.object({
  clientId: z.uuid(),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, "Must be E.164 format"),
});
export type UpdatePhoneInput = z.infer<typeof updatePhoneInputSchema>;

// --- Duplicate suggestion (server-side phone hash match) ---

export const suggestDuplicatesInputSchema = z.object({
  phoneHash: z.string().min(1),
  excludeClientId: z.uuid().optional(),
});
export type SuggestDuplicatesInput = z.infer<
  typeof suggestDuplicatesInputSchema
>;
