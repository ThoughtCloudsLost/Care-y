import { describe, it, expect, beforeEach } from "vitest";
import { appendToOutbox, onOutboxAppend } from "./outbox.js";
import {
  resetFlowEvents,
  setFlowClock,
  subscribeFlowEvents,
} from "../flow-events.js";
import type { DemoFlowEvent } from "../bridge.js";
import type { OutboxEntry } from "./outbox.js";

function collectEvents(): DemoFlowEvent[] {
  const events: DemoFlowEvent[] = [];
  subscribeFlowEvents((event) => {
    events.push(event);
  });
  return events;
}

/**
 * The outbox array is module state with no reset hook, so depth is
 * asserted relative to whatever the queue already holds rather than
 * against an absolute number.
 */
function depthOf(event: DemoFlowEvent | undefined): number {
  return Number(event?.detail?.result.at(0)?.value ?? "-1");
}

describe("outbox flow detail", () => {
  beforeEach(() => {
    resetFlowEvents();
    setFlowClock(() => 0);
  });

  it("reports the delivery type", () => {
    const events = collectEvents();
    appendToOutbox({
      type: "sms",
      to: "+15551234567",
      body: "Your code is 449281",
    });

    expect(events.at(0)?.detail?.input.at(0)).toMatchObject({
      name: "type",
      value: "sms",
    });
  });

  it("never carries the recipient or the body", () => {
    const events = collectEvents();
    appendToOutbox({
      type: "email",
      to: "volunteer@example.org",
      subject: "Your sign-in code",
      body: "Your code is 449281",
    });

    // Addresses and phone numbers are PII, and message bodies carry 2FA
    // codes. Serializing the whole event catches a leak through any
    // field, not just the ones this test knows to name.
    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain("volunteer@example.org");
    expect(serialized).not.toContain("449281");
    expect(serialized).not.toContain("Your code is");
    expect(serialized).not.toContain("Your sign-in code");
  });

  it("counts the queue as it grows", () => {
    const events = collectEvents();
    appendToOutbox({ type: "sms", to: "+15550000001" });
    appendToOutbox({ type: "sms", to: "+15550000002" });

    expect(depthOf(events.at(1))).toBe(depthOf(events.at(0)) + 1);
  });

  it("still hands the entry to subscribers, recipient included", () => {
    // The band is what stays clean. The outbox itself is the demo's
    // stand-in for a real transport and has to keep the address.
    const seen: OutboxEntry[] = [];
    const off = onOutboxAppend((entry) => {
      seen.push(entry);
    });
    appendToOutbox({ type: "sms", to: "+15551234567" });
    off();

    expect(seen.at(0)?.to).toBe("+15551234567");
  });

  it("carries the scripted-delivery seam", () => {
    const events = collectEvents();
    appendToOutbox({ type: "email", to: "someone@example.org" });
    expect(events.at(0)?.seamKey).toBe("outbox-delivery");
  });
});
