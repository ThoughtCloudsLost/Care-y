/**
 * Unit tests for the email-expected caution helper.
 *
 * Covers the predicate (latestClientFollowUpIsEmail) and the
 * session-scoped dismissal state (dismiss, isDismissed, reset).
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  latestClientFollowUpIsEmail,
  dismissEmailExpected,
  isEmailExpectedDismissed,
  _resetEmailExpectedDismissals,
} from "./email-expected.svelte.js";

interface FU {
  source: string;
  type: string;
}

describe("latestClientFollowUpIsEmail", () => {
  it("returns true when the newest client follow-up is email_inbound", () => {
    const followUps: FU[] = [
      { source: "client", type: "email_inbound" },
      { source: "volunteer", type: "message" },
      { source: "system", type: "status_opened" },
    ];
    expect(latestClientFollowUpIsEmail(followUps)).toBe(true);
  });

  it("returns false when a later client follow-up is sms_inbound", () => {
    const followUps: FU[] = [
      { source: "client", type: "email_inbound" },
      { source: "volunteer", type: "message" },
      { source: "client", type: "sms_inbound" },
    ];
    expect(latestClientFollowUpIsEmail(followUps)).toBe(false);
  });

  it("returns false when there are no client follow-ups", () => {
    const followUps: FU[] = [
      { source: "volunteer", type: "message" },
      { source: "system", type: "status_opened" },
    ];
    expect(latestClientFollowUpIsEmail(followUps)).toBe(false);
  });

  it("returns false for empty follow-up list", () => {
    expect(latestClientFollowUpIsEmail([])).toBe(false);
  });

  it("ignores volunteer and system entries when finding latest client", () => {
    const followUps: FU[] = [
      { source: "client", type: "email_inbound" },
      { source: "system", type: "priority_changed" },
      { source: "volunteer", type: "sms_outbound" },
    ];
    expect(latestClientFollowUpIsEmail(followUps)).toBe(true);
  });

  it("returns true when email_inbound is the only follow-up", () => {
    const followUps: FU[] = [{ source: "client", type: "email_inbound" }];
    expect(latestClientFollowUpIsEmail(followUps)).toBe(true);
  });

  it("returns false when client message is a portal message", () => {
    const followUps: FU[] = [{ source: "client", type: "message" }];
    expect(latestClientFollowUpIsEmail(followUps)).toBe(false);
  });
});

describe("email expected dismissal state", () => {
  beforeEach(() => {
    _resetEmailExpectedDismissals();
  });

  it("is not dismissed by default", () => {
    expect(isEmailExpectedDismissed("ticket-1")).toBe(false);
  });

  it("is dismissed after calling dismissEmailExpected", () => {
    dismissEmailExpected("ticket-1");
    expect(isEmailExpectedDismissed("ticket-1")).toBe(true);
  });

  it("dismissal is scoped to the ticket id", () => {
    dismissEmailExpected("ticket-1");
    expect(isEmailExpectedDismissed("ticket-2")).toBe(false);
  });

  it("reset clears all dismissals", () => {
    dismissEmailExpected("ticket-1");
    dismissEmailExpected("ticket-2");
    _resetEmailExpectedDismissals();
    expect(isEmailExpectedDismissed("ticket-1")).toBe(false);
    expect(isEmailExpectedDismissed("ticket-2")).toBe(false);
  });

  it("dismissing the same ticket twice is idempotent", () => {
    dismissEmailExpected("ticket-1");
    dismissEmailExpected("ticket-1");
    expect(isEmailExpectedDismissed("ticket-1")).toBe(true);
  });
});
