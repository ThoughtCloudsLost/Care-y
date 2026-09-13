// @vitest-environment jsdom
/**
 * Tests for the shared email_outbound bubble content: subject + sanitized
 * body for a valid payload, plain-text fallback for malformed payloads,
 * and the decrypt placeholder while loading.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import { LOADING, type DecryptResult } from "$lib/crypto/decrypt-result.js";
import EmailBubbleContent from "./EmailBubbleContent.svelte";

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

const validPayload = JSON.stringify({
  subject: "Follow-up 749124",
  doc: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Here is an" },
          {
            type: "text",
            marks: [{ type: "strong" }],
            text: " important update",
          },
        ],
      },
    ],
  },
});

describe("EmailBubbleContent", () => {
  it("renders the subject line and formatted body for a valid payload", () => {
    const { container } = render(EmailBubbleContent, {
      props: { result: ready(validPayload), encryptedContent: "ct" },
    });
    const subject = container.querySelector(
      "[data-testid='email-bubble-subject']",
    );
    const body = container.querySelector("[data-testid='email-bubble-body']");
    expect(subject?.textContent).toContain("Follow-up 749124");
    expect(body?.querySelector("strong")?.textContent).toBe(
      " important update",
    );
    expect(body?.textContent).toContain("Here is an");
  });

  it("falls back to plain text when the payload is not email JSON", () => {
    const { container } = render(EmailBubbleContent, {
      props: { result: ready("just a message"), encryptedContent: "ct" },
    });
    expect(
      container.querySelector("[data-testid='email-bubble-subject']"),
    ).toBeNull();
    expect(container.querySelector(".bubble-text")?.textContent).toBe(
      "just a message",
    );
  });

  it("shows the decrypt placeholder while the result is loading", () => {
    const { container } = render(EmailBubbleContent, {
      props: { result: LOADING, encryptedContent: "ct" },
    });
    expect(
      container.querySelector("[data-testid='email-bubble-subject']"),
    ).toBeNull();
    expect(container.querySelector(".bubble-text")).not.toBeNull();
  });
});
