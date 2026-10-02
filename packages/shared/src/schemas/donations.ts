/**
 * Zod schemas for donation (inflow) provider connections.
 *
 * A connection is one org's account at a donation provider. Its
 * credentials live on the server, sealed under OPS_SECRETS_KEY, because
 * the server makes the provider calls. What crosses the wire is a hint of
 * the key, never the key. Provider fund aggregates are relayed on demand
 * and never stored.
 */

import { z } from "zod";
import { donationConnectionIdSchema } from "../ids.js";

/** Donation providers CARE-Y can connect to. */
export const inflowProviderIdSchema = z.enum(["givebutter"]);
export type InflowProviderId = z.infer<typeof inflowProviderIdSchema>;

/** Connect a Givebutter account by its API key. */
export const saveGivebutterConnectionInputSchema = z.object({
  apiKey: z.string().min(16).max(512),
});
export type SaveGivebutterConnectionInput = z.infer<
  typeof saveGivebutterConnectionInputSchema
>;

/** Remove one connection from the caller's org. */
export const removeDonationConnectionInputSchema = z.object({
  connectionId: donationConnectionIdSchema,
});
export type RemoveDonationConnectionInput = z.infer<
  typeof removeDonationConnectionInputSchema
>;

/** A connection as the admin sees it. */
export const donationConnectionWireSchema = z.object({
  id: donationConnectionIdSchema,
  provider: inflowProviderIdSchema,
  /** Last four characters of the API key, so the admin can tell keys apart. */
  keyHint: z.string(),
  webhookRegistered: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type DonationConnectionWire = z.infer<
  typeof donationConnectionWireSchema
>;

/** One fund at a provider, with its running totals as the provider reports them. */
export const providerFundSchema = z.object({
  connectionId: donationConnectionIdSchema,
  externalId: z.string(),
  code: z.string().nullable(),
  name: z.string(),
  /** Total raised, in cents. */
  raisedMinor: z.number().int().nonnegative(),
  supporters: z.number().int().nonnegative(),
  currency: z.literal("USD"),
});
export type ProviderFundWire = z.infer<typeof providerFundSchema>;

/**
 * Funds across every connection in the org. A connection whose provider
 * could not be read is listed in `unavailableConnectionIds` and contributes
 * no funds, so one failing provider does not hide the others.
 */
export const providerFundListSchema = z.object({
  funds: z.array(providerFundSchema),
  unavailableConnectionIds: z.array(donationConnectionIdSchema),
});
export type ProviderFundListWire = z.infer<typeof providerFundListSchema>;
