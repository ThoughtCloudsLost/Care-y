/**
 * Reachability policy module.
 *
 * Pure classification of volunteer reachability state, plus a batched
 * query helper. Consumed by the call bridge, SMS dispatch, and the admin
 * user list. Never exposes phone data or hashes.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { UserId } from "@care-y/shared";

export type VolunteerReachability =
  | "none" // no consultant row
  | "unverified" // row exists, is_verified false
  | "verified" // callable via bridge
  | "verified_sms"; // callable + SMS pings deliverable

/**
 * Classify a volunteer's reachability from their consultant row flags.
 *
 * `verified_sms` requires verified, pings enabled, and an OPS-tier phone
 * copy all present. A verified user with pings enabled but a NULL OPS
 * copy (mid re-verification window) classifies as `verified`, which is
 * what routes them into the email fallback during that window.
 */
export function classifyReachability(
  row: {
    isVerified: boolean;
    smsPingsEnabled: boolean;
    hasOpsPhone: boolean;
  } | null,
): VolunteerReachability {
  if (row === null) return "none";
  if (!row.isVerified) return "unverified";
  if (row.smsPingsEnabled && row.hasOpsPhone) return "verified_sms";
  return "verified";
}

/**
 * Batch-fetch reachability for a set of user IDs in one query.
 *
 * Returns a ReadonlyMap keyed by user ID. Users with no consultant row
 * are included as `"none"`. Returns an empty map (no query) when the
 * input array is empty.
 */
export async function getReachabilityForUsers(
  tDb: Kysely<TenantDatabase>,
  userIds: readonly UserId[],
): Promise<ReadonlyMap<UserId, VolunteerReachability>> {
  const result = new Map<UserId, VolunteerReachability>();

  if (userIds.length === 0) return result;

  // Seed every requested ID as "none"; rows found below overwrite.
  for (const id of userIds) {
    result.set(id, "none");
  }

  const rows = await tDb
    .selectFrom("consultants")
    .select([
      "user_id",
      "is_verified",
      "sms_pings_enabled",
      "ops_encrypted_phone",
    ])
    .where("user_id", "in", [...userIds])
    .execute();

  for (const row of rows) {
    const classification = classifyReachability({
      isVerified: row.is_verified,
      smsPingsEnabled: row.sms_pings_enabled,
      hasOpsPhone: row.ops_encrypted_phone !== null,
    });
    result.set(row.user_id, classification);
  }

  return result;
}
