// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import AttachmentChip from "./AttachmentChip.svelte";

// Mock crypto context
vi.mock("$lib/crypto/context.js", () => ({
  getCryptoBridge: () => ({
    decryptBlob: vi.fn().mockResolvedValue(new ArrayBuffer(100)),
  }),
}));

// Mock trpc client
vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      downloadAttachmentBlob: {
        query: vi.fn().mockResolvedValue({ data: "base64data" }),
      },
    },
  },
}));

afterEach(() => {
  cleanup();
});

describe("AttachmentChip", () => {
  const baseProps = {
    attachmentId: "att-001",
    ticketId: "ticket-001",
    keyWrap: {
      ephemeralPoint: "ep-base64",
      nonce: "nonce-base64",
      wrappedKey: "wk-base64",
    },
    filename: "consent-form.pdf",
    sizeBytes: 245_000,
  };

  it("renders filename and size", () => {
    const { container } = render(AttachmentChip, { props: baseProps });
    expect(container.textContent).toContain("consent-form.pdf");
    expect(container.textContent).toContain("239KB");
  });

  it("has correct aria-label for download action", () => {
    const { container } = render(AttachmentChip, { props: baseProps });
    const btn = container.querySelector("button");
    expect(btn?.getAttribute("aria-label")).toBe("Download consent-form.pdf");
  });

  it("disables button when keyWrap is null", () => {
    const { container } = render(AttachmentChip, {
      props: { ...baseProps, keyWrap: null },
    });
    const btn = container.querySelector("button");
    expect(btn?.hasAttribute("disabled")).toBe(true);
  });

  it("formats file sizes correctly", () => {
    // Less than 1KB
    const { container: small } = render(AttachmentChip, {
      props: { ...baseProps, filename: "tiny.txt", sizeBytes: 500 },
    });
    expect(small.textContent).toContain("500B");

    cleanup();

    // MB range
    const { container: medium } = render(AttachmentChip, {
      props: { ...baseProps, filename: "video.mp4", sizeBytes: 5_242_880 },
    });
    expect(medium.textContent).toContain("5.0MB");
  });
});
