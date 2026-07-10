// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import TicketPreview from "./TicketPreview.svelte";

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

// ResizeObserver stub for the fit-mode clipping effect. The callback is
// captured so tests can re-run the measurement pass after stubbing
// element rects, the way a real resize or decrypt settle would.
let roCallback: (() => void) | undefined;
vi.stubGlobal(
  "ResizeObserver",
  vi.fn(function (
    this: {
      observe: () => void;
      disconnect: () => void;
      unobserve: () => void;
    },
    cb: () => void,
  ) {
    roCallback = cb;
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);
import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";

// --- Mocks ---

const mockDecryptContent = vi.fn();
const mockDeleteByPrefix = vi.fn();

vi.mock("$lib/crypto/context.js", () => ({
  getFollowUpDecryptCache: () => ({
    decryptContent: mockDecryptContent,
    deleteByPrefix: mockDeleteByPrefix,
  }),
  getOrgDecryptCache: () => ({
    decrypt: () => null,
  }),
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: { tickets: undefined },
}));

afterEach(() => {
  cleanup();
  mockDecryptContent.mockReset();
  mockDeleteByPrefix.mockReset();
  roCallback = undefined;
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
    noteTypeId: null,
    ...overrides,
  };
}

describe("TicketPreview (mini-bubbles)", () => {
  it("renders DecryptPlaceholder when followUps is undefined (not loaded)", () => {
    const { container } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: undefined },
    });
    // DecryptPlaceholder container (.dp) renders immediately; the scramble
    // (aria-busy) is delayed by 150ms, so check the container only.
    const placeholders = container.querySelectorAll(".dp");
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it("renders empty state when followUps is empty array", () => {
    const { container } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: [] },
    });
    expect(container.querySelector("[role='status']")).not.toBeNull();
    expect(container.textContent).toBeTruthy();
  });

  it("renders DecryptPlaceholder inside mini-bubble when decryption is pending", () => {
    mockDecryptContent.mockReturnValue(undefined);
    const fu = makeFollowUp();
    const { container } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: [fu] },
    });
    // DecryptPlaceholder container (.dp) renders immediately; the scramble
    // (aria-busy) is delayed by 150ms, so check the container only.
    const dp = container.querySelector(".dp");
    expect(dp).not.toBeNull();
  });

  it("renders decrypted text inside a mini-bubble", () => {
    mockDecryptContent.mockReturnValue("Hello, test message");
    const fu = makeFollowUp();
    const { container } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: [fu] },
    });
    expect(container.textContent).toContain("Hello, test message");
  });

  it("right-aligns volunteer mini-bubbles (sent)", () => {
    mockDecryptContent.mockReturnValue("Volunteer reply");
    const fu = makeFollowUp({ source: "volunteer" });
    const { container } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: [fu] },
    });
    const row = container.querySelector("[data-direction='sent']");
    expect(row).not.toBeNull();
  });

  it("left-aligns client mini-bubbles (received)", () => {
    mockDecryptContent.mockReturnValue("Client message");
    const fu = makeFollowUp({ source: "client" });
    const { container } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: [fu] },
    });
    const row = container.querySelector("[data-direction='received']");
    expect(row).not.toBeNull();
  });

  it("renders system events from the type label without decrypting", () => {
    const fu = makeFollowUp({ source: "system", type: "status_change" });
    const { container } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: [fu] },
    });
    const sysEl = container.querySelector("[data-type='system']");
    expect(sysEl).not.toBeNull();
    // The label derives from the follow-up type; system events carry no
    // encrypted payload, so the decrypt path must never be touched.
    expect(sysEl?.textContent).toContain("Status changed");
    expect(mockDecryptContent).not.toHaveBeenCalled();
    // Should not be in a directional bubble row
    expect(container.querySelector("[data-direction]")).toBeNull();
  });

  it("renders long decrypted text content", () => {
    mockDecryptContent.mockReturnValue(
      "This is a very long message that should be truncated",
    );
    const fu = makeFollowUp();
    const { container } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: [fu] },
    });
    expect(container.textContent).toContain("This is a very long message");
  });

  it("renders the quiet unlock-failure label when decryption fails", () => {
    mockDecryptContent.mockReturnValue("\0DECRYPT_FAILED");
    const fu = makeFollowUp();
    const { container } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: [fu] },
    });
    // De-jargon voice: never a raw crypto error as content.
    expect(container.textContent).toContain("Could not unlock this preview");
    expect(container.textContent).not.toContain("decrypted");
  });

  it("retry clears the follow-up's cache entry so the decrypt re-fires", async () => {
    mockDecryptContent.mockReturnValue("\0DECRYPT_FAILED");
    const fu = makeFollowUp({ id: "fu-retry" });
    const { getByRole } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: [fu] },
    });

    const retry = getByRole("button", { name: "Retry" });
    await fireEvent.click(retry);

    expect(mockDeleteByPrefix).toHaveBeenCalledWith("fu-retry");
  });

  it("shows no retry for denied decrypts (missing key wrap)", () => {
    mockDecryptContent.mockReturnValue(undefined);
    const fu = makeFollowUp({ keyWrap: null });
    const { container, queryByRole } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: [fu] },
    });
    // Denied keeps its own message; a retry cannot mint key material.
    expect(queryByRole("button", { name: "Retry" })).toBeNull();
    expect(container.textContent).not.toContain(
      "Could not unlock this preview",
    );
  });

  it("shows the client alias eyebrow on caller bubbles only", () => {
    mockDecryptContent
      .mockReturnValueOnce("Client msg")
      .mockReturnValueOnce("Volunteer reply");
    const fus = [
      makeFollowUp({ id: "fu-c", source: "client" }),
      makeFollowUp({ id: "fu-v", source: "volunteer" }),
    ];
    const { container } = render(TicketPreview, {
      props: {
        ticketId: "ticket-preview-1",
        followUps: fus,
        clientAlias: "plain-dew-13",
      },
    });

    const received = container.querySelector(
      "[data-direction='received'] .mini-who",
    );
    expect(received?.textContent).toBe("plain-dew-13");
    // Previews carry no author identity for the org side; labeling
    // another volunteer's reply would lie, so no eyebrow at all.
    expect(
      container.querySelector("[data-direction='sent'] .mini-who"),
    ).toBeNull();
  });

  it("renders no eyebrow when clientAlias is not provided", () => {
    mockDecryptContent.mockReturnValue("Client msg");
    const fu = makeFollowUp({ source: "client" });
    const { container } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: [fu] },
    });
    expect(container.querySelector(".mini-who")).toBeNull();
  });

  it("renders internal notes full-width with an icon-only eyebrow when the name cannot resolve", () => {
    mockDecryptContent.mockReturnValue("Watch for repeat calls");
    const fu = makeFollowUp({ type: "internal_note", source: "volunteer" });
    const { container } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: [fu] },
    });

    const note = container.querySelector(".mini-note");
    expect(note).not.toBeNull();
    expect(note?.textContent).toContain("Watch for repeat calls");
    // noteTypes query is unavailable in this harness, so the eyebrow
    // stays icon-only: no "Internal" text.
    expect(note?.textContent).not.toContain("Internal");
    // Notes are blocks, not directional bubbles.
    expect(container.querySelector("[data-direction]")).toBeNull();
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
      props: { ticketId: "ticket-preview-1", followUps: fus },
    });
    expect(
      container.querySelector("[data-direction='received']"),
    ).not.toBeNull();
    expect(container.querySelector("[data-direction='sent']")).not.toBeNull();
  });

  it("does not use {@html} for decrypted content (XSS safety)", () => {
    mockDecryptContent.mockReturnValue("<script>alert('xss')</script>");
    const fu = makeFollowUp();
    const { container } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: [fu] },
    });
    // Text should appear as escaped, not interpreted as HTML
    expect(container.innerHTML).toContain("&lt;script&gt;");
  });
});

describe("TicketPreview fit mode (whole-bubble window)", () => {
  /** Stub layout geometry: jsdom computes no layout, so rects are faked. */
  function stubRect(el: Element, top: number): void {
    el.getBoundingClientRect = () =>
      ({
        top,
        bottom: top + 24,
        left: 0,
        right: 100,
        width: 100,
        height: 24,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect;
  }

  function renderFit(): { root: Element; entries: Element[] } {
    mockDecryptContent.mockReturnValue("msg");
    const fus = [
      makeFollowUp({ id: "fu-old" }),
      makeFollowUp({ id: "fu-mid" }),
      makeFollowUp({ id: "fu-new" }),
    ];
    const { container } = render(TicketPreview, {
      props: { ticketId: "ticket-preview-1", followUps: fus, fit: true },
    });
    const root = container.querySelector(".mini-chat.fit");
    expect(root).not.toBeNull();
    const entries = Array.from(root!.children);
    expect(entries).toHaveLength(3);
    return { root: root!, entries };
  }

  it("hides an entry that pokes above the window and keeps whole ones", () => {
    const { root, entries } = renderFit();
    stubRect(root, 0);
    stubRect(entries[0]!, -20); // oldest, sliced by the top edge
    stubRect(entries[1]!, 10);
    stubRect(entries[2]!, 40); // newest, fully inside
    roCallback?.();

    expect(entries[0]!.hasAttribute("data-clipped")).toBe(true);
    expect(entries[1]!.hasAttribute("data-clipped")).toBe(false);
    expect(entries[2]!.hasAttribute("data-clipped")).toBe(false);
  });

  it("unhides an entry once a re-measure says it fits again", () => {
    const { root, entries } = renderFit();
    stubRect(root, 0);
    stubRect(entries[0]!, -20);
    stubRect(entries[1]!, 10);
    stubRect(entries[2]!, 40);
    roCallback?.();
    expect(entries[0]!.hasAttribute("data-clipped")).toBe(true);

    stubRect(entries[0]!, 2); // content shrank; everything fits now
    roCallback?.();
    expect(entries[0]!.hasAttribute("data-clipped")).toBe(false);
  });

  it("clips nothing when every entry fits the window", () => {
    // Default jsdom rects are all zeros: nothing sits above the root.
    const { root } = renderFit();
    expect(root.querySelector("[data-clipped]")).toBeNull();
  });

  it("never measures or clips outside fit mode", () => {
    mockDecryptContent.mockReturnValue("msg");
    const { container } = render(TicketPreview, {
      props: {
        ticketId: "ticket-preview-1",
        followUps: [makeFollowUp()],
      },
    });
    expect(roCallback).toBeUndefined();
    expect(container.querySelector("[data-clipped]")).toBeNull();
  });
});
