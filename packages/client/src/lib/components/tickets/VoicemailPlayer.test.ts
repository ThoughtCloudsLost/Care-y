// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import VoicemailPlayer from "./VoicemailPlayer.svelte";
import type * as FetchBlobModule from "$lib/utils/fetch-blob.js";

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

// Mock fetchBlob so we can control what the component fetches
vi.mock("$lib/utils/fetch-blob.js", async (importOriginal) => {
  const orig = await importOriginal<typeof FetchBlobModule>();
  return { ...orig, fetchBlob: vi.fn() };
});

const { fetchBlob } = await import("$lib/utils/fetch-blob.js");
const mockFetchBlob = fetchBlob as ReturnType<typeof vi.fn>;

afterEach(() => {
  cleanup();
  mockFetchBlob.mockReset();
});

describe("VoicemailPlayer", () => {
  const baseProps = {
    blobUrl: "/api/blobs/recordings/rec-001",
    decrypt: vi.fn<(ct: ArrayBuffer) => Promise<ArrayBuffer>>(),
    durationSeconds: 47,
  };

  it("renders loading state initially (fetch in progress)", () => {
    // fetchBlob never resolves, so the component stays in loading
    mockFetchBlob.mockReturnValue(new Promise(() => undefined));

    const { container } = render(VoicemailPlayer, { props: baseProps });
    const busy = container.querySelector("[aria-busy='true']");
    expect(busy).not.toBeNull();
    expect(container.textContent).toContain("Loading voicemail");
  });

  it("renders error state when decrypt callback rejects", async () => {
    mockFetchBlob.mockResolvedValue(new ArrayBuffer(8));
    const props = {
      ...baseProps,
      decrypt: vi.fn().mockRejectedValue(new Error("decrypt failed")),
    };

    const { container } = render(VoicemailPlayer, { props });
    await vi.waitFor(() => {
      expect(container.textContent).toContain("Could not load voicemail");
    });
  });

  it("passes fetchHeaders to fetchBlob", () => {
    mockFetchBlob.mockReturnValue(new Promise(() => undefined));
    const headers = { "X-Channel-Token": "tok-123" };

    render(VoicemailPlayer, {
      props: { ...baseProps, fetchHeaders: headers },
    });

    expect(mockFetchBlob).toHaveBeenCalledWith(
      baseProps.blobUrl,
      expect.anything(),
      headers,
    );
  });

  it("has role='status' on loading and error states", () => {
    mockFetchBlob.mockReturnValue(new Promise(() => undefined));

    const { container } = render(VoicemailPlayer, { props: baseProps });
    const status = container.querySelector("[role='status']");
    expect(status).not.toBeNull();
  });

  it("renders error state after fetch failure", async () => {
    mockFetchBlob.mockRejectedValue(new Error("Network error"));

    const { container } = render(VoicemailPlayer, { props: baseProps });
    await vi.waitFor(() => {
      expect(container.textContent).toContain("Could not load voicemail");
    });
  });
});
