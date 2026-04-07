// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import VoicemailPlayer from "./VoicemailPlayer.svelte";

// Mock crypto context (components now self-fetch via bridge)
vi.mock("$lib/crypto/context.js", () => ({
  getCryptoBridge: () => ({
    decryptBlob: vi.fn().mockRejectedValue(new Error("mock: no audio data")),
  }),
}));

// Mock trpc client
vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      downloadRecordingBlob: {
        query: vi.fn().mockRejectedValue(new Error("mock: no server")),
      },
    },
  },
}));

afterEach(() => {
  cleanup();
});

describe("VoicemailPlayer", () => {
  const baseProps = {
    recordingId: "rec-001",
    ticketId: "ticket-001",
    keyWrap: {
      ephemeralPoint: "ep-base64",
      nonce: "nonce-base64",
      wrappedKey: "wk-base64",
    },
    durationSeconds: 47,
  };

  it("renders loading state initially (fetch in progress)", () => {
    const { container } = render(VoicemailPlayer, { props: baseProps });
    const busy = container.querySelector("[aria-busy='true']");
    expect(busy).not.toBeNull();
    expect(container.textContent).toContain("Loading voicemail");
  });

  it("renders error state when keyWrap is null", async () => {
    const { container } = render(VoicemailPlayer, {
      props: { ...baseProps, keyWrap: null },
    });
    // keyWrap null triggers immediate error
    await vi.waitFor(() => {
      expect(container.textContent).toContain("Could not load voicemail");
    });
  });

  it("has role='status' on loading and error states", () => {
    const { container } = render(VoicemailPlayer, { props: baseProps });
    const status = container.querySelector("[role='status']");
    expect(status).not.toBeNull();
  });

  it("renders error state after fetch failure", async () => {
    const { container } = render(VoicemailPlayer, { props: baseProps });
    // The mocked trpc rejects, so eventually the error state appears
    await vi.waitFor(() => {
      expect(container.textContent).toContain("Could not load voicemail");
    });
  });
});
