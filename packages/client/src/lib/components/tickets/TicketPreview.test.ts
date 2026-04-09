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
    hasRecording: false,
    hasImage: false,
    hasFile: false,
    ...overrides,
  };
}

describe("TicketPreview (mini-bubbles)", () => {
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
    expect(container.querySelector(".preview-empty")).not.toBeNull();
    expect(container.textContent).toBeTruthy();
  });

  it("renders shimmer inside mini-bubble when decryption is pending", () => {
    mockDecryptContent.mockReturnValue(undefined);
    const fu = makeFollowUp();
    const { container } = render(TicketPreview, {
      props: { followUps: [fu] },
    });
    const shimmer = container.querySelector(".shimmer-mini");
    expect(shimmer).not.toBeNull();
  });

  it("renders decrypted text inside a mini-bubble", () => {
    mockDecryptContent.mockReturnValue("Hello, test message");
    const fu = makeFollowUp();
    const { container } = render(TicketPreview, {
      props: { followUps: [fu] },
    });
    expect(container.textContent).toContain("Hello, test message");
  });

  it("right-aligns volunteer mini-bubbles (sent)", () => {
    mockDecryptContent.mockReturnValue("Volunteer reply");
    const fu = makeFollowUp({ source: "volunteer" });
    const { container } = render(TicketPreview, {
      props: { followUps: [fu] },
    });
    const row = container.querySelector(".mini-row-sent");
    expect(row).not.toBeNull();
  });

  it("left-aligns client mini-bubbles (received)", () => {
    mockDecryptContent.mockReturnValue("Client message");
    const fu = makeFollowUp({ source: "client" });
    const { container } = render(TicketPreview, {
      props: { followUps: [fu] },
    });
    const row = container.querySelector(".mini-row-received");
    expect(row).not.toBeNull();
  });

  it("renders system events as centered text without bubble", () => {
    mockDecryptContent.mockReturnValue("Status changed to closed");
    const fu = makeFollowUp({ source: "system", type: "status_change" });
    const { container } = render(TicketPreview, {
      props: { followUps: [fu] },
    });
    const sysEl = container.querySelector(".mini-system");
    expect(sysEl).not.toBeNull();
    expect(sysEl?.textContent).toContain("Status changed to closed");
    // Should not be in a bubble row
    expect(container.querySelector(".mini-bubble-row")).toBeNull();
  });

  it("truncates long text to 30 characters with ellipsis", () => {
    mockDecryptContent.mockReturnValue(
      "This is a very long message that should be truncated",
    );
    const fu = makeFollowUp();
    const { container } = render(TicketPreview, {
      props: { followUps: [fu] },
    });
    const text = container.querySelector(".mini-text")?.textContent ?? "";
    expect(text.length).toBeLessThanOrEqual(31); // 30 chars + ellipsis
    expect(text).toContain("\u2026");
  });

  it("renders error text when decryption fails (sentinel value)", () => {
    mockDecryptContent.mockReturnValue("\0DECRYPT_FAILED");
    const fu = makeFollowUp();
    const { container } = render(TicketPreview, {
      props: { followUps: [fu] },
    });
    expect(container.textContent).toContain(
      "This content could not be decrypted.",
    );
  });

  it("renders multiple follow-ups with correct alignment", () => {
    mockDecryptContent
      .mockReturnValueOnce("Client msg")
      .mockReturnValueOnce("Volunteer reply");
    const fus = [
      makeFollowUp({ id: "fu-1", source: "client" }),
      makeFollowUp({ id: "fu-2", source: "volunteer" }),
    ];
    const { container } = render(TicketPreview, {
      props: { followUps: fus },
    });
    expect(container.querySelector(".mini-row-received")).not.toBeNull();
    expect(container.querySelector(".mini-row-sent")).not.toBeNull();
  });

  it("does not use {@html} for decrypted content (XSS safety)", () => {
    mockDecryptContent.mockReturnValue("<script>alert('xss')</script>");
    const fu = makeFollowUp();
    const { container } = render(TicketPreview, {
      props: { followUps: [fu] },
    });
    // Text should appear as escaped, not interpreted as HTML
    expect(container.innerHTML).toContain("&lt;script&gt;");
  });
});
