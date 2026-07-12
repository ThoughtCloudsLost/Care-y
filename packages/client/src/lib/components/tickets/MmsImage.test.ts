// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import MmsImage from "./MmsImage.svelte";

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

// Mock crypto context
vi.mock("$lib/crypto/context.js", () => ({
  getCryptoBridge: () => ({
    decryptBlob: vi.fn().mockRejectedValue(new Error("mock: no decrypt")),
  }),
}));

// Mock trpc client
vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      downloadAttachmentBlob: {
        query: vi.fn().mockRejectedValue(new Error("mock: no server")),
      },
    },
  },
}));

afterEach(() => {
  cleanup();
});

describe("MmsImage", () => {
  const baseProps = {
    attachmentId: "att-001",
    ticketId: "ticket-001",
    keyWrap: {
      ephemeralPoint: "ep-base64",
      nonce: "nonce-base64",
      wrappedKey: "wk-base64",
    },
    alt: "Photo from client",
    onopen: vi.fn(),
  };

  it("renders shimmer placeholder initially (fetch in progress)", () => {
    const { container } = render(MmsImage, { props: baseProps });
    // DecryptPlaceholder container (.dp) renders immediately; the scramble
    // (aria-busy) is delayed by 150ms, so check the container only.
    const placeholder = container.querySelector(".dp");
    expect(placeholder).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders error state when keyWrap is null", async () => {
    const { container } = render(MmsImage, {
      props: { ...baseProps, keyWrap: null },
    });
    await vi.waitFor(() => {
      expect(container.textContent).toContain("Could not unlock this content.");
    });
  });

  it("renders error state after fetch failure", async () => {
    const { container } = render(MmsImage, { props: baseProps });
    await vi.waitFor(() => {
      expect(container.textContent).toContain("Could not unlock this content.");
    });
  });

  it("has no button when still loading", () => {
    const { container } = render(MmsImage, { props: baseProps });
    expect(container.querySelector("button")).toBeNull();
  });
});
