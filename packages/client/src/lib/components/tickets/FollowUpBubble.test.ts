// @vitest-environment jsdom
/**
 * Tests for FollowUpBubble: email_inbound branch renders subject, body,
 * unverified From, the caution affordance, and falls back to plain text
 * for malformed payloads.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { LOADING, type DecryptResult } from "$lib/crypto/decrypt-result.js";
import FollowUpBubble from "./FollowUpBubble.svelte";

// IntersectionObserver stub for DecryptPlaceholder
vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: () => void;
    disconnect: () => void;
    unobserve: () => void;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

afterEach(cleanup);

function ready(value: string): DecryptResult {
  return { status: "ready", value };
}

function makeFollowUp(
  type: string,
  source = "client",
): {
  id: string;
  source: string;
  type: string;
  encryptedContent: string | null;
  createdAt: string;
} {
  return {
    id: "fu-1",
    source,
    type,
    encryptedContent: "encrypted-blob",
    createdAt: new Date().toISOString(),
  };
}

const validInboundPayload = JSON.stringify({
  subject: "Re: your appointment",
  text: "I will be there at 3 PM.",
  from: "ana@example.org",
  droppedAttachments: 0,
});

const payloadWithDroppedAttachments = JSON.stringify({
  subject: "Documents",
  text: "See attached.",
  from: "client@example.com",
  droppedAttachments: 2,
});

describe("FollowUpBubble (email_inbound)", () => {
  it("renders subject, body, unverified From, caution affordance, and channel chip", () => {
    const { container, getByTestId } = render(FollowUpBubble, {
      props: {
        followUp: makeFollowUp("email_inbound"),
        result: ready(validInboundPayload),
      },
    });

    expect(getByTestId("email-channel-chip")).toBeTruthy();

    const subject = container.querySelector(
      "[data-testid='email-inbound-subject']",
    );
    expect(subject).toBeTruthy();
    expect(subject!.textContent).toContain("Re: your appointment");

    const body = container.querySelector("[data-testid='email-inbound-body']");
    expect(body).toBeTruthy();
    expect(body!.textContent).toContain("I will be there at 3 PM.");

    const from = container.querySelector("[data-testid='email-inbound-from']");
    expect(from).toBeTruthy();
    expect(from!.textContent).toContain("ana@example.org");
    expect(from!.textContent).toContain("unverified");

    const caution = container.querySelector(
      "[data-testid='email-inbound-caution-trigger']",
    );
    expect(caution).toBeTruthy();
  });

  it("renders on the received (left) side with client source", () => {
    const { container } = render(FollowUpBubble, {
      props: {
        followUp: makeFollowUp("email_inbound"),
        result: ready(validInboundPayload),
      },
    });

    const bubble = container.querySelector('[data-direction="received"]');
    expect(bubble).toBeTruthy();

    const sourceBubble = container.querySelector('[data-source="client"]');
    expect(sourceBubble).toBeTruthy();
  });

  it("shows dropped attachments count when nonzero", () => {
    const { container } = render(FollowUpBubble, {
      props: {
        followUp: makeFollowUp("email_inbound"),
        result: ready(payloadWithDroppedAttachments),
      },
    });

    const dropped = container.querySelector(
      "[data-testid='email-inbound-dropped']",
    );
    expect(dropped).toBeTruthy();
    expect(dropped!.textContent).toContain("2");
  });

  it("hides dropped attachments when count is zero", () => {
    const { container } = render(FollowUpBubble, {
      props: {
        followUp: makeFollowUp("email_inbound"),
        result: ready(validInboundPayload),
      },
    });

    const dropped = container.querySelector(
      "[data-testid='email-inbound-dropped']",
    );
    expect(dropped).toBeNull();
  });

  it("falls back to plain text when payload is malformed", () => {
    const { container } = render(FollowUpBubble, {
      props: {
        followUp: makeFollowUp("email_inbound"),
        result: ready("not valid json at all"),
      },
    });

    // No structured inbound email elements
    expect(
      container.querySelector("[data-testid='email-inbound-subject']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='email-inbound-from']"),
    ).toBeNull();

    // Plain text fallback renders the raw value
    const text = container.querySelector(".bubble-text");
    expect(text).toBeTruthy();
    expect(text!.textContent).toBe("not valid json at all");
  });

  it("shows decrypt placeholder while loading", () => {
    const { container } = render(FollowUpBubble, {
      props: {
        followUp: makeFollowUp("email_inbound"),
        result: LOADING,
      },
    });

    expect(
      container.querySelector("[data-testid='email-inbound-subject']"),
    ).toBeNull();
    expect(container.querySelector(".bubble-text")).toBeTruthy();
  });

  it("caution affordance is keyboard reachable and Escape-dismissable", async () => {
    const { container } = render(FollowUpBubble, {
      props: {
        followUp: makeFollowUp("email_inbound"),
        result: ready(validInboundPayload),
      },
    });

    const trigger = container.querySelector(
      "[data-testid='email-inbound-caution-trigger']",
    ) as HTMLButtonElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    // Open via click (simulates keyboard Enter on a button)
    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    const panel = container.querySelector(
      "[data-testid='email-inbound-caution-panel']",
    );
    expect(panel).toBeTruthy();
    expect(panel!.getAttribute("role")).toBe("status");

    // Dismiss via Escape
    await fireEvent.keyDown(trigger.closest(".caution-root") as HTMLElement, {
      key: "Escape",
    });
    await vi.waitFor(() => {
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
    });
    expect(
      container.querySelector("[data-testid='email-inbound-caution-panel']"),
    ).toBeNull();
  });

  it("caution trigger has an accessible name", () => {
    const { container } = render(FollowUpBubble, {
      props: {
        followUp: makeFollowUp("email_inbound"),
        result: ready(validInboundPayload),
      },
    });

    const trigger = container.querySelector(
      "[data-testid='email-inbound-caution-trigger']",
    );
    expect(trigger).toBeTruthy();
    expect(trigger!.getAttribute("aria-label")).toBeTruthy();
    expect(trigger!.getAttribute("aria-label")!.length).toBeGreaterThan(0);
  });

  it("does not render email_inbound branch for other follow-up types", () => {
    const { container } = render(FollowUpBubble, {
      props: {
        followUp: makeFollowUp("message", "volunteer"),
        result: ready("Hello world"),
      },
    });

    expect(
      container.querySelector("[data-testid='email-inbound-subject']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='email-inbound-caution-trigger']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='email-channel-chip']"),
    ).toBeNull();
  });
});

const validOutboundPayload = JSON.stringify({
  subject: "Your appointment",
  doc: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Please confirm." }],
      },
    ],
  },
});

describe("FollowUpBubble (email_outbound)", () => {
  it("renders the channel chip for email_outbound", () => {
    const { getByTestId } = render(FollowUpBubble, {
      props: {
        followUp: makeFollowUp("email_outbound", "volunteer"),
        result: ready(validOutboundPayload),
      },
    });

    expect(getByTestId("email-channel-chip")).toBeTruthy();
  });
});
