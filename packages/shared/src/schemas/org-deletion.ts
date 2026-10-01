import { z } from "zod";

/**
 * Org deletion request input.
 *
 * The input carries no org id. The server takes the org from the
 * authenticated context. confirmSlug is the org's slug as typed by the
 * admin and is compared server-side. There is no reason field, because a
 * free-text account of why an org is leaving is data nobody needs stored.
 */

/** Days between a deletion request and the earliest time it can run. */
export const ORG_DELETION_COOLING_OFF_DAYS = 30;

export const requestOrgDeletionInputSchema = z.object({
  confirmSlug: z.string(),
});
export type RequestOrgDeletionInput = z.infer<
  typeof requestOrgDeletionInputSchema
>;
