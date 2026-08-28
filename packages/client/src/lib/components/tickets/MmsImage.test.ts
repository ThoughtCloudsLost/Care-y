// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import type * as TrpcClient from "$lib/trpc/index.js";
import type * as CryptoContext from "$lib/crypto/context.js";
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

// vi.mock required: getCryptoBridge uses Svelte 5 createContext which
// throws "missing_context" outside a component tree with CryptoProvider.
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getCryptoBridge: () => ({
    decryptBlob: vi.fn().mockRejectedValue(new Error("mock: no decrypt")),
  }),
}));

// vi.mock required: tRPC client module creates a live HTTP connection
// on import via httpBatchLink.
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcClient>()),
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

  describe("injected decrypt mode", () => {
    it("uses the injected decrypt callback instead of the bridge", async () => {
      const mockDecrypt = vi
        .fn<(ct: ArrayBuffer) => Promise<ArrayBuffer>>()
        .mockResolvedValue(new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer);

      // vi.mock required: fetch-blob module is imported at the top level
      // and called inside the effect; mocking fetch globally is simpler.
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(
          new Response(new Uint8Array([1, 2, 3]), { status: 200 }),
        );

      const revokeSpy = vi
        .spyOn(URL, "revokeObjectURL")
        .mockImplementation(() => undefined);
      const createSpy = vi
        .spyOn(URL, "createObjectURL")
        .mockReturnValue("blob:mock-url");

      const { container } = render(MmsImage, {
        props: {
          attachmentId: "att-inject",
          ticketId: "ticket-inject",
          alt: "Injected image",
          onopen: vi.fn(),
          decrypt: mockDecrypt,
          blobUrl: "/api/blobs/portal-attachments/att-inject",
          contentType: "image/jpeg",
        },
      });

      await vi.waitFor(() => {
        expect(mockDecrypt).toHaveBeenCalled();
      });

      await vi.waitFor(() => {
        const img = container.querySelector("img");
        expect(img).not.toBeNull();
        expect(img?.getAttribute("src")).toBe("blob:mock-url");
      });

      fetchSpy.mockRestore();
      revokeSpy.mockRestore();
      createSpy.mockRestore();
    });

    it("renders error placeholder when injected decrypt throws", async () => {
      const mockDecrypt = vi
        .fn<(ct: ArrayBuffer) => Promise<ArrayBuffer>>()
        .mockRejectedValue(new Error("decrypt failed"));

      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(
          new Response(new Uint8Array([1, 2, 3]), { status: 200 }),
        );

      const { container } = render(MmsImage, {
        props: {
          attachmentId: "att-fail",
          ticketId: "ticket-fail",
          alt: "Bad image",
          onopen: vi.fn(),
          decrypt: mockDecrypt,
        },
      });

      await vi.waitFor(() => {
        expect(container.textContent).toContain(
          "Could not unlock this content.",
        );
      });

      fetchSpy.mockRestore();
    });
  });
});
