/**
 * @mention validation service.
 *
 * The mentioned_pseudonyms array on follow-ups is populated by the client.
 * Despite the column name, values are user UUIDs (the client resolves
 * display names to IDs before submission). This service validates that
 * the referenced user IDs exist and returns the valid subset.
 *
 * Mentions are one-off notification pings, not subscriptions (05-tickets.md 5.1).
 * Mentioning someone does NOT auto-add them to the CC list.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { UserId } from "@care-y/shared";

export interface MentionsService {
  /**
   * Given a list of mentioned user IDs (from follow-up metadata),
   * validates they exist and returns the valid subset.
   * Invalid/nonexistent IDs are silently dropped (not an error).
   */
  resolveValidMentions(userIds: UserId[]): Promise<UserId[]>;
}

export function createMentionsService(
  db: Kysely<TenantDatabase>,
): MentionsService {
  return {
    async resolveValidMentions(userIds) {
      if (userIds.length === 0) return [];

      const rows = await db
        .selectFrom("users")
        .select("id")
        .where("id", "in", userIds)
        .execute();

      return rows.map((r) => r.id);
    },
  };
}
