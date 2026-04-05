// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import TicketPreview from "./TicketPreview.svelte";
import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";

// --- Mocks ---

const mockDecryptContent = vi.fn();

vi.mock("$lib/crypto/context.js", () => ({
  getFollowUpDecryptCache: () => ({
    decryptContent: mockDecryptContent,
  }),
}));

afterEach(() => {
  cleanup();
  mockDecryptContent.mockReset();
});

function makeFollowUp(
  overrides: Partial<RawFollowUpPreview> = {},
): RawFollowUpPreview {
  return {
    id: `fu-${Math.random().toString(36).slice(2, 8)}`,
    source: "volunteer",
    type: "message",
    encryptedContent: { type: "Buffer", data: [72, 101, 108, 108, 111] },
    keyWrap: {
      ephemeralPoint: "AAAA",
      nonce: "BBBB",
      wrappedKey: "CCCC",
    },
    createdAt: "2026-04-05T12:00:00Z",
    ...overrides,
  };
}

describe("TicketPreview", () => {
  it("renders shimmer when followUps is undefined (not loaded)", () => {
    const { container } = render(TicketPreview, {
      props: { followUps: undefined },
    });
    const shimmers = container.querySelectorAll(".shimmer-preview");
    expect(shimmers.length).toBeGreaterThan(0);
  });

  it("renders empty state when followUps is empty array", () => {
    const { container } = render(TicketPreview, {
      props: { followUps: [] },
    });
    expect(container.textContent).toContain("No messages yet");
  });

  it("renders shimmer lines when decryption is pending (returns undefined)", () => {
    mockDecryptContent.mockReturnValue(undefined);
    const fu = makeFollowUp();
    const { container } = render(TicketPreview, {
      props: { followUps: [fu] },
    });
    const shimmerLines = container.querySelectorAll(".shimmer-line");
    expect(shimmerLines.length).toBe(1);
  });

  it("renders decrypted plain text when available", () => {
    mockDecryptContent.mockReturnValue("Hello, this is a test message");
    const fu = makeFollowUp();
    const { container } = render(TicketPreview, {
      props: { followUps: [fu] },
    });
    expect(container.textContent).toContain("Hello, this is a test message");
  });

  it("sets data-source attribute on preview lines", () => {
    mockDecryptContent.mockReturnValue("Client message");
    const fu = makeFollowUp({ source: "client" });
    const { container } = render(TicketPreview, {
      props: { followUps: [fu] },
    });
    const line = container.querySelector("[data-source='client']");
    expect(line).not.toBeNull();
  });

  it("renders multiple follow-ups", () => {
    mockDecryptContent
      .mockReturnValueOnce("First message")
      .mockReturnValueOnce("Second message");
    const fus = [
      makeFollowUp({ id: "fu-1", source: "volunteer" }),
      makeFollowUp({ id: "fu-2", source: "client" }),
    ];
    const { container } = render(TicketPreview, {
      props: { followUps: fus },
    });
    expect(container.textContent).toContain("First message");
    expect(container.textContent).toContain("Second message");
  });

  it("renders system source follow-ups with data-source='system'", () => {
    mockDecryptContent.mockReturnValue("Status changed to closed");
    const fu = makeFollowUp({ source: "system" });
    const { container } = render(TicketPreview, {
      props: { followUps: [fu] },
    });
    const line = container.querySelector("[data-source='system']");
    expect(line).not.toBeNull();
  });

  it("does not use {@html} for decrypted content (XSS safety)", () => {
    mockDecryptContent.mockReturnValue("<script>alert('xss')</script>");
    const fu = makeFollowUp();
    const { container } = render(TicketPreview, {
      props: { followUps: [fu] },
    });
    // Text should appear as escaped, not interpreted as HTML
    expect(container.innerHTML).toContain(
      "&lt;script&gt;alert('xss')&lt;/script&gt;",
    );
  });
});
