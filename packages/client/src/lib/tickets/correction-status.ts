/**
 * Pure helpers for deriving unacknowledged contact-correction state
 * from follow-ups and reactions. No side effects, no imports beyond
 * the shared types needed for the reaction shape.
 */

import type { ReactionSummary } from "@care-y/shared";

interface FollowUpStub {
  readonly id: string;
  readonly type: string;
}

/**
 * Returns true when the loaded follow-ups contain at least one
 * `contact_correction` that has no `acknowledge` reaction from any user.
 *
 * Expects the full set of follow-ups and a reactions lookup
 * (followUpId -> ReactionSummary[]) covering those follow-ups.
 */
export function hasUnacknowledgedCorrection(
  followUps: readonly FollowUpStub[],
  getReactions: (followUpId: string) => readonly ReactionSummary[],
): boolean {
  for (const fu of followUps) {
    if (fu.type !== "contact_correction") continue;
    const reactions = getReactions(fu.id);
    const acked = reactions.some(
      (r) => r.reaction === "acknowledge" && r.userIds.length > 0,
    );
    if (!acked) return true;
  }
  return false;
}
