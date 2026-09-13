import { describe, it, expect } from "vitest";
import {
  followUpKind,
  followUpRenderVariant,
  groupConsecutive,
  type FollowUpGroup,
} from "./follow-up-utils.js";

describe("followUpKind", () => {
  it.each([
    "hold_placed",
    "hold_removed",
    "volunteer_assigned",
    "volunteer_unassigned",
    "status_opened",
    "status_closed",
    "priority_changed",
    "merge_note",
  ])("classifies %s as system", (type) => {
    expect(followUpKind({ type })).toBe("system");
  });

  it("classifies internal_note as note", () => {
    expect(followUpKind({ type: "internal_note" })).toBe("note");
  });

  it.each([
    "message",
    "sms_outbound",
    "sms_inbound",
    "phone_call",
    "voicemail",
  ])("classifies %s as message", (type) => {
    expect(followUpKind({ type })).toBe("message");
  });

  it("falls back to message for unknown types", () => {
    expect(followUpKind({ type: "some_future_type" })).toBe("message");
  });
});

describe("followUpRenderVariant", () => {
  it("returns 'call' for phone_call", () => {
    expect(followUpRenderVariant({ type: "phone_call" })).toBe("call");
  });

  it("returns 'share' for share_link", () => {
    expect(followUpRenderVariant({ type: "share_link" })).toBe("share");
  });

  it("returns 'correction' for contact_correction", () => {
    expect(followUpRenderVariant({ type: "contact_correction" })).toBe(
      "correction",
    );
  });

  it("returns undefined for types without a render variant", () => {
    expect(followUpRenderVariant({ type: "message" })).toBeUndefined();
    expect(followUpRenderVariant({ type: "internal_note" })).toBeUndefined();
    expect(followUpRenderVariant({ type: "hold_placed" })).toBeUndefined();
  });

  it("returns undefined for unknown types", () => {
    expect(followUpRenderVariant({ type: "some_future_type" })).toBeUndefined();
  });
});

describe("groupConsecutive", () => {
  function fu(
    type: string,
    minutesOffset: number,
    id?: string,
  ): { id: string; type: string; createdAt: string } {
    const base = new Date("2026-07-18T12:00:00Z");
    base.setMinutes(base.getMinutes() + minutesOffset);
    return {
      id: id ?? `fu-${type}-${String(minutesOffset)}`,
      type,
      createdAt: base.toISOString(),
    };
  }

  it("returns empty array for empty input", () => {
    expect(groupConsecutive([])).toEqual([]);
  });

  it("returns non-groupable items unchanged", () => {
    const items = [
      fu("message", 0),
      fu("internal_note", 1),
      fu("volunteer_assigned", 2),
    ];
    const result = groupConsecutive(items);
    expect(result).toEqual(items);
  });

  it("groups consecutive same-type groupable items within 10-min window", () => {
    const items = [
      fu("hold_placed", 0, "a"),
      fu("hold_placed", 3, "b"),
      fu("hold_placed", 7, "c"),
    ];
    const result = groupConsecutive(items);
    expect(result).toHaveLength(1);
    const grp = result[0] as FollowUpGroup<(typeof items)[0]>;
    expect(grp.grouped).toBe(true);
    expect(grp.type).toBe("hold_placed");
    expect(grp.count).toBe(3);
    expect(grp.items).toHaveLength(3);
    expect(grp.firstTimestamp).toBe(items[0]!.createdAt);
    expect(grp.lastTimestamp).toBe(items[2]!.createdAt);
  });

  it("does not group when time gap exceeds 10 minutes", () => {
    const items = [fu("status_closed", 0, "a"), fu("status_closed", 11, "b")];
    const result = groupConsecutive(items);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(items[0]);
    expect(result[1]).toBe(items[1]);
  });

  it("splits group at the 10-minute boundary", () => {
    const items = [
      fu("hold_removed", 0, "a"),
      fu("hold_removed", 5, "b"),
      fu("hold_removed", 16, "c"),
    ];
    const result = groupConsecutive(items);
    expect(result).toHaveLength(2);
    const grp = result[0] as FollowUpGroup<(typeof items)[0]>;
    expect(grp.grouped).toBe(true);
    expect(grp.count).toBe(2);
    expect(result[1]).toBe(items[2]);
  });

  it("breaks group when a different type intervenes", () => {
    const items = [
      fu("hold_placed", 0, "a"),
      fu("message", 1, "b"),
      fu("hold_placed", 2, "c"),
    ];
    const result = groupConsecutive(items);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(items[0]);
    expect(result[1]).toBe(items[1]);
    expect(result[2]).toBe(items[2]);
  });

  it("does not group a single groupable item", () => {
    const items = [fu("status_opened", 0, "a")];
    const result = groupConsecutive(items);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(items[0]);
  });

  it("creates separate groups for different groupable types", () => {
    const items = [
      fu("hold_placed", 0, "a"),
      fu("hold_placed", 2, "b"),
      fu("status_closed", 4, "c"),
      fu("status_closed", 6, "d"),
    ];
    const result = groupConsecutive(items);
    expect(result).toHaveLength(2);
    const grp1 = result[0] as FollowUpGroup<(typeof items)[0]>;
    const grp2 = result[1] as FollowUpGroup<(typeof items)[0]>;
    expect(grp1.type).toBe("hold_placed");
    expect(grp1.count).toBe(2);
    expect(grp2.type).toBe("status_closed");
    expect(grp2.count).toBe(2);
  });

  it("never groups types with hasEventParams (priority_changed)", () => {
    const items = [
      fu("priority_changed", 0, "a"),
      fu("priority_changed", 1, "b"),
    ];
    const result = groupConsecutive(items);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(items[0]);
    expect(result[1]).toBe(items[1]);
  });

  it("never groups types with hasEventParams (volunteer_assigned)", () => {
    const items = [
      fu("volunteer_assigned", 0, "a"),
      fu("volunteer_assigned", 1, "b"),
    ];
    const result = groupConsecutive(items);
    expect(result).toHaveLength(2);
  });

  it("handles mixed groupable and non-groupable in sequence", () => {
    const items = [
      fu("message", 0, "m1"),
      fu("hold_placed", 1, "h1"),
      fu("hold_placed", 3, "h2"),
      fu("hold_placed", 5, "h3"),
      fu("message", 6, "m2"),
      fu("status_closed", 7, "s1"),
    ];
    const result = groupConsecutive(items);
    expect(result).toHaveLength(4);
    expect(result[0]).toBe(items[0]);
    const grp = result[1] as FollowUpGroup<(typeof items)[0]>;
    expect(grp.grouped).toBe(true);
    expect(grp.count).toBe(3);
    expect(result[2]).toBe(items[4]);
    expect(result[3]).toBe(items[5]);
  });
});
