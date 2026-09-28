/**
 * Tests for the needs-attention rule.
 */

import { describe, it, expect } from "vitest";
import { isNeedsAttention, type NeedsAttentionInput } from "./filters.js";

const USER_ID = "user-001";

function ticket(
  overrides: Partial<NeedsAttentionInput> = {},
): NeedsAttentionInput {
  return {
    id: `t-${Math.random().toString(36).slice(2, 8)}`,
    status: "open",
    priority: "normal",
    onHold: false,
    assignedTo: null,
    ...overrides,
  };
}

describe("isNeedsAttention", () => {
  const noneUnread = (): boolean => false;
  const allUnread = (): boolean => true;

  it("includes urgent unassigned tickets regardless of read state", () => {
    const t = ticket({ priority: "urgent", assignedTo: null });
    expect(isNeedsAttention(t, USER_ID, noneUnread)).toBe(true);
  });

  it("includes high-priority unassigned tickets", () => {
    const t = ticket({ priority: "high", assignedTo: null });
    expect(isNeedsAttention(t, USER_ID, noneUnread)).toBe(true);
  });

  it("includes own high-priority tickets only when unread", () => {
    const t = ticket({ priority: "high", assignedTo: USER_ID });
    expect(isNeedsAttention(t, USER_ID, allUnread)).toBe(true);
    expect(isNeedsAttention(t, USER_ID, noneUnread)).toBe(false);
  });

  it("excludes normal priority unassigned tickets", () => {
    const t = ticket({ priority: "normal", assignedTo: null });
    expect(isNeedsAttention(t, USER_ID, allUnread)).toBe(false);
  });

  it("excludes on-hold tickets even if urgent", () => {
    const t = ticket({ priority: "urgent", assignedTo: null, onHold: true });
    expect(isNeedsAttention(t, USER_ID, allUnread)).toBe(false);
  });

  it("excludes closed tickets even if urgent", () => {
    const t = ticket({
      priority: "urgent",
      assignedTo: null,
      status: "closed",
    });
    expect(isNeedsAttention(t, USER_ID, allUnread)).toBe(false);
  });

  it("excludes urgent tickets assigned to another user even when unread", () => {
    const t = ticket({ priority: "urgent", assignedTo: "other-user" });
    expect(isNeedsAttention(t, USER_ID, allUnread)).toBe(false);
  });
});
