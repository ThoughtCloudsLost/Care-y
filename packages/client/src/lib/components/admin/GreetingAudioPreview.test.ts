// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as BufferEncoding from "$lib/utils/buffer-encoding.js";

// vi.hoisted so the mock exists when the hoisted vi.mock factory below
// runs; a plain top-level const is still in its temporal dead zone then.
const { mockGetGreetingAudio } = vi.hoisted(() => ({
  mockGetGreetingAudio: vi.fn(),
}));

// vi.mock required: $lib/paraglide/messages.js is a generated module
// whose barrel import triggers Paraglide runtime side effects.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  ticket_voicemail_error: () => "Audio error",
  ticket_voicemail_loading: () => "Loading audio...",
  ticket_voicemail_play: () => "Play",
  ticket_voicemail_pause: () => "Pause",
  ticket_voicemail_group: (p: { duration: string }) => `Audio (${p.duration})`,
  ticket_voicemail_progress: (p: { current: string; total: string }) =>
    `${p.current} / ${p.total}`,
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    telephonyContent: {
      getGreetingAudio: { query: mockGetGreetingAudio },
    },
  },
}));

vi.mock("$lib/errors.js", () => ({
  requireRouter: (router: unknown) => router,
  ClientError: class extends Error {
    override name = "ClientError" as const;
  },
}));

vi.mock("$lib/utils/buffer-encoding.js", async (importOriginal) => ({
  ...(await importOriginal<typeof BufferEncoding>()),
  base64ToUint8Array: (s: string) =>
    Uint8Array.from(atob(s), (c) => c.charCodeAt(0)),
}));

// Stub AudioContext (jsdom does not provide Web Audio API)
const mockDecodeAudioData = vi.fn().mockResolvedValue({
  duration: 5,
  numberOfChannels: 1,
  sampleRate: 44100,
  length: 44100 * 5,
  getChannelData: () => new Float32Array(100),
});

vi.stubGlobal(
  "AudioContext",
  vi.fn(function (this: Record<string, unknown>) {
    this.decodeAudioData = mockDecodeAudioData;
    this.createBufferSource = vi.fn(() => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
      buffer: null,
      onended: null,
    }));
    this.destination = {};
    this.currentTime = 0;
    this.state = "running";
    this.resume = vi.fn();
  }),
);

// vi.mock required: AudioPlayer imports Konsta Button which requires
// the full Konsta provider context that jsdom cannot provide.
// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export
vi.mock("$lib/components/AudioPlayer.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// jsdom lacks Web Animations API
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

import GreetingAudioPreview from "./GreetingAudioPreview.svelte";

const GREETING_ID = "00000000-0000-4000-8000-000000000010";

describe("GreetingAudioPreview", () => {
  beforeEach(() => {
    mockGetGreetingAudio.mockClear();
    mockDecodeAudioData.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows loading state initially", () => {
    // Query never resolves, keeping the component in loading state
    mockGetGreetingAudio.mockReturnValue(new Promise(() => undefined));

    render(GreetingAudioPreview, {
      props: { greetingId: GREETING_ID },
    });

    expect(screen.getByText("Loading audio...")).toBeTruthy();
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("shows error state when fetch fails", async () => {
    mockGetGreetingAudio.mockRejectedValue(new Error("fetch failed"));

    render(GreetingAudioPreview, {
      props: { greetingId: GREETING_ID },
    });

    await vi.waitFor(() => {
      expect(screen.getByText("Audio error")).toBeTruthy();
    });
  });

  it("renders AudioPlayer after successful fetch and decode", async () => {
    // Base64 of 4 zero bytes
    mockGetGreetingAudio.mockResolvedValue({
      audioBase64: "AAAAAA==",
      contentType: "audio/wav",
    });

    render(GreetingAudioPreview, {
      props: { greetingId: GREETING_ID },
    });

    await vi.waitFor(() => {
      expect(screen.getByTestId("passthrough-shell")).toBeTruthy();
    });

    expect(mockGetGreetingAudio).toHaveBeenCalledWith({
      greetingId: GREETING_ID,
    });
    expect(mockDecodeAudioData).toHaveBeenCalledTimes(1);
  });

  it("shows error when audio decode fails", async () => {
    mockGetGreetingAudio.mockResolvedValue({
      audioBase64: "AAAAAA==",
      contentType: "audio/wav",
    });
    mockDecodeAudioData.mockRejectedValueOnce(new DOMException("decode error"));

    render(GreetingAudioPreview, {
      props: { greetingId: GREETING_ID },
    });

    await vi.waitFor(() => {
      expect(screen.getByText("Audio error")).toBeTruthy();
    });
  });
});
