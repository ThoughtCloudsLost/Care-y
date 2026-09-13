import { describe, it, expect } from "vitest";
import { hasUnacknowledgedCorrection } from "./correction-status.js";
import type { ReactionSummary } from "@care-y/shared";

function makeReactionsLookup(
  map: Record<string, ReactionSummary[]>,
): (id: string) => readonly ReactionSummary[] {
  return (id: string): readonly ReactionSummary[] => map[id] ?? [];
}

describe("hasUnacknowledgedCorrection", () => {
  it("returns false when there are no contact_correction follow-ups", () => {
    const followUps = [
      { id: "fu-1", type: "message" },
      { id: "fu-2", type: "internal_note" },
    ];
    const result = hasUnacknowledgedCorrection(
      followUps,
      makeReactionsLookup({}),
    );
    expect(result).toBe(false);
  });

  it("returns true when a contact_correction has no reactions", () => {
    const followUps = [
      { id: "fu-1", type: "message" },
      { id: "fu-2", type: "contact_correction" },
    ];
    const result = hasUnacknowledgedCorrection(
      followUps,
      makeReactionsLookup({}),
    );
    expect(result).toBe(true);
  });

  it("returns true when a contact_correction has reactions but none are acknowledge", () => {
    const followUps = [{ id: "fu-1", type: "contact_correction" }];
    const reactions: Record<string, ReactionSummary[]> = {
      "fu-1": [
        { reaction: "approve", userIds: ["user-a"] },
        { reaction: "flag", userIds: ["user-b"] },
      ],
    };
    const result = hasUnacknowledgedCorrection(
      followUps,
      makeReactionsLookup(reactions),
    );
    expect(result).toBe(true);
  });

  it("returns false when a contact_correction has an acknowledge reaction", () => {
    const followUps = [{ id: "fu-1", type: "contact_correction" }];
    const reactions: Record<string, ReactionSummary[]> = {
      "fu-1": [{ reaction: "acknowledge", userIds: ["user-a"] }],
    };
    const result = hasUnacknowledgedCorrection(
      followUps,
      makeReactionsLookup(reactions),
    );
    expect(result).toBe(false);
  });

  it("returns true when one correction is acknowledged and another is not", () => {
    const followUps = [
      { id: "fu-1", type: "contact_correction" },
      { id: "fu-2", type: "contact_correction" },
    ];
    const reactions: Record<string, ReactionSummary[]> = {
      "fu-1": [{ reaction: "acknowledge", userIds: ["user-a"] }],
      // fu-2 has no reactions
    };
    const result = hasUnacknowledgedCorrection(
      followUps,
      makeReactionsLookup(reactions),
    );
    expect(result).toBe(true);
  });

  it("returns false for an empty follow-ups list", () => {
    const result = hasUnacknowledgedCorrection([], makeReactionsLookup({}));
    expect(result).toBe(false);
  });

  it("returns true when acknowledge reaction exists but has empty userIds", () => {
    const followUps = [{ id: "fu-1", type: "contact_correction" }];
    const reactions: Record<string, ReactionSummary[]> = {
      "fu-1": [{ reaction: "acknowledge", userIds: [] }],
    };
    const result = hasUnacknowledgedCorrection(
      followUps,
      makeReactionsLookup(reactions),
    );
    expect(result).toBe(true);
  });
});
