/**
 * Tests for notification preference cascade helpers.
 *
 * These fixtures mirror the server-side cascade expectations from
 * packages/server/src/notifications/preferences.test.ts to prevent
 * client/server drift. If the cascade contract changes, both test
 * files must be updated together.
 */

import { describe, it, expect } from "vitest";
import type { PreferenceRow } from "@care-y/shared";
import {
  effectiveState,
  effectiveGlobalState,
  effectiveQueueState,
  hasExplicitOverride,
  hasQueueOverrides,
  NOTIFICATION_EVENT_TYPES,
  NOTIFICATION_CHANNELS,
} from "./notification-preferences-utils.js";

const QUEUE_A = "00000000-0000-0000-0000-00000000000a";

function row(
  overrides: Partial<PreferenceRow> & {
    eventType: PreferenceRow["eventType"];
    channel: PreferenceRow["channel"];
    enabled: boolean;
  },
): PreferenceRow {
  return {
    scopeType: "global",
    scopeId: null,
    ...overrides,
  };
}

describe("effectiveGlobalState", () => {
  it("returns true when no rows exist (default enabled)", () => {
    expect(effectiveGlobalState([], "ticket_created", "push")).toBe(true);
  });

  it("returns the global row value when present", () => {
    const rows: PreferenceRow[] = [
      row({ eventType: "ticket_created", channel: "push", enabled: false }),
    ];
    expect(effectiveGlobalState(rows, "ticket_created", "push")).toBe(false);
  });

  it("ignores queue-scoped rows when resolving global", () => {
    const rows: PreferenceRow[] = [
      row({
        scopeType: "queue",
        scopeId: QUEUE_A,
        eventType: "ticket_created",
        channel: "push",
        enabled: false,
      }),
    ];
    expect(effectiveGlobalState(rows, "ticket_created", "push")).toBe(true);
  });
});

describe("effectiveQueueState", () => {
  it("returns queue override when present", () => {
    const rows: PreferenceRow[] = [
      row({ eventType: "ticket_assigned", channel: "email", enabled: true }),
      row({
        scopeType: "queue",
        scopeId: QUEUE_A,
        eventType: "ticket_assigned",
        channel: "email",
        enabled: false,
      }),
    ];
    expect(effectiveQueueState(rows, QUEUE_A, "ticket_assigned", "email")).toBe(
      false,
    );
  });

  it("falls through to global when no queue override exists", () => {
    const rows: PreferenceRow[] = [
      row({ eventType: "followup_added", channel: "sms", enabled: false }),
    ];
    expect(effectiveQueueState(rows, QUEUE_A, "followup_added", "sms")).toBe(
      false,
    );
  });

  it("falls through to default (true) when no rows at all", () => {
    expect(effectiveQueueState([], QUEUE_A, "mention", "push")).toBe(true);
  });
});

describe("effectiveState cascade order", () => {
  it("global off, queue on, ticket off resolves false", () => {
    const TICKET_X = "11111111-1111-1111-1111-111111111111";
    const rows: PreferenceRow[] = [
      row({ eventType: "ticket_escalated", channel: "push", enabled: false }),
      row({
        scopeType: "queue",
        scopeId: QUEUE_A,
        eventType: "ticket_escalated",
        channel: "push",
        enabled: true,
      }),
      row({
        scopeType: "ticket",
        scopeId: TICKET_X,
        eventType: "ticket_escalated",
        channel: "push",
        enabled: false,
      }),
    ];
    const scope = { scopeType: "ticket" as const, scopeId: TICKET_X };
    expect(effectiveState(rows, scope, "ticket_escalated", "push")).toBe(false);
  });

  it("global off, queue on (no ticket row) resolves true via queue scope", () => {
    const rows: PreferenceRow[] = [
      row({ eventType: "ticket_closed", channel: "email", enabled: false }),
      row({
        scopeType: "queue",
        scopeId: QUEUE_A,
        eventType: "ticket_closed",
        channel: "email",
        enabled: true,
      }),
    ];
    expect(effectiveQueueState(rows, QUEUE_A, "ticket_closed", "email")).toBe(
      true,
    );
  });
});

describe("hasExplicitOverride", () => {
  it("returns true when an explicit row exists", () => {
    const rows: PreferenceRow[] = [
      row({
        scopeType: "queue",
        scopeId: QUEUE_A,
        eventType: "mention",
        channel: "push",
        enabled: true,
      }),
    ];
    expect(hasExplicitOverride(rows, "queue", QUEUE_A, "mention", "push")).toBe(
      true,
    );
  });

  it("returns false when no matching row exists", () => {
    expect(hasExplicitOverride([], "global", null, "mention", "push")).toBe(
      false,
    );
  });
});

describe("hasQueueOverrides", () => {
  it("returns true when queue-scoped rows exist", () => {
    const rows: PreferenceRow[] = [
      row({
        scopeType: "queue",
        scopeId: QUEUE_A,
        eventType: "ticket_created",
        channel: "push",
        enabled: false,
      }),
    ];
    expect(hasQueueOverrides(rows, QUEUE_A)).toBe(true);
  });

  it("returns false when no queue-scoped rows exist", () => {
    const rows: PreferenceRow[] = [
      row({ eventType: "ticket_created", channel: "push", enabled: false }),
    ];
    expect(hasQueueOverrides(rows, QUEUE_A)).toBe(false);
  });
});

describe("constant arrays", () => {
  it("has 9 event types", () => {
    expect(NOTIFICATION_EVENT_TYPES).toHaveLength(9);
  });

  it("has 3 channels", () => {
    expect(NOTIFICATION_CHANNELS).toHaveLength(3);
  });
});
