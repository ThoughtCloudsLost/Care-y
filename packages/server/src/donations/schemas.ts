// Server-only: validates decrypted donation connection config blobs. Not
// exported to the client.

import { z } from "zod";
import type { InflowProviderId } from "@care-y/shared";

/**
 * Givebutter connection config, stored sealed in donation_connections.config.
 * The webhook fields appear once the webhook is registered.
 */
export const givebutterConfigSchema = z.object({
  apiKey: z.string().min(1),
  webhookId: z.string().optional(),
  webhookSecret: z.string().optional(),
});

export type GivebutterConfig = z.infer<typeof givebutterConfigSchema>;

/**
 * The fields the connection service reads and writes in every provider's
 * blob, whatever else a provider keeps beside them. A provider's own
 * schema below is checked first; this one only extracts.
 */
export const connectionSecretsSchema = z.object({
  apiKey: z.string().min(1),
  webhookId: z.string().optional(),
  webhookSecret: z.string().optional(),
});

export type ConnectionSecrets = z.infer<typeof connectionSecretsSchema>;

/**
 * Config schema per provider. Keyed exhaustively over InflowProviderId, so
 * adding a provider id without a schema is a compile error.
 */
export const providerConfigSchemas: Record<InflowProviderId, z.ZodType> = {
  givebutter: givebutterConfigSchema,
};
