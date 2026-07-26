/**
 * Zod schemas for client management input validation.
 *
 * Clients have plaintext aliases and OPS-encrypted phone numbers.
 * Phone numbers arrive as plaintext E.164 from the client (over TLS),
 * because the client has no access to OPS_SECRETS_KEY for HMAC hashing.
 * The server encrypts and hashes on receipt.
 */

import { z } from "zod";

// --- Client list (paginated, sortable, searchable) ---

export const clientListInputSchema = z.object({
  query: z.string().max(200).default(""),
  sortBy: z.enum(["alias", "created_at", "ticket_count"]).default("alias"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.uuid().optional(),
});
export type ClientListInput = z.infer<typeof clientListInputSchema>;

// --- Client detail (single client by ID) ---

export const clientGetInputSchema = z.object({
  clientId: z.uuid(),
});
export type ClientGetInput = z.infer<typeof clientGetInputSchema>;

// --- Alias update ---

export const updateAliasInputSchema = z.object({
  clientId: z.uuid(),
  // Split into a flat character-class regex plus a shape refinement rather
  // than the nested /^[a-z0-9]+(-[a-z0-9]+)*$/. Both accept the same strings,
  // but the nested quantifier has star height 2, which static analysis treats
  // as a backtracking risk. The flat form is linear time by construction.
  alias: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Alias must be lowercase alphanumeric with hyphens")
    .refine(
      (value) =>
        !value.startsWith("-") && !value.endsWith("-") && !value.includes("--"),
      "Alias cannot start or end with a hyphen or contain consecutive hyphens",
    ),
});
export type UpdateAliasInput = z.infer<typeof updateAliasInputSchema>;

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
