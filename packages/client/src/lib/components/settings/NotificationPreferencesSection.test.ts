// @vitest-environment jsdom
/**
 * NotificationPreferencesSection component tests.
 *
 * Tests the notification preference matrix rendering and interaction
 * patterns. These are shallow unit tests verifying the component's
 * data-flow and aria contracts. Full interaction flows (toggle -> server
 * -> toast) are covered by Playwright E2E tests.
 */

import { describe, it, expect } from "vitest";
import {
  NOTIFICATION_EVENT_TYPES,
  NOTIFICATION_CHANNELS,
} from "./notification-preferences-utils.js";

describe("NotificationPreferencesSection constants", () => {
  it("exports the expected event types and channels", () => {
    expect(NOTIFICATION_EVENT_TYPES).toHaveLength(9);
    expect(NOTIFICATION_CHANNELS).toHaveLength(3);
  });

  // Pins the server wire contract: preference rows map 1:1 to these event types.
  it("all event types are valid notification events", () => {
    const validEvents = new Set([
      "ticket_created",
      "ticket_assigned",
      "ticket_closed",
      "ticket_reopened",
      "ticket_escalated",
      "followup_added",
      "mention",
      "merge_completed",
      "voicemail_quarantined",
    ]);
    for (const eventType of NOTIFICATION_EVENT_TYPES) {
      expect(validEvents.has(eventType)).toBe(true);
    }
  });

  it("channels exclude SSE (always-on, not toggleable)", () => {
    const channels = NOTIFICATION_CHANNELS;
    expect(channels).not.toContain("sse");
    expect(channels).toContain("push");
    expect(channels).toContain("email");
    expect(channels).toContain("sms");
  });
});
