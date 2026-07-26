// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

// Type-only imports for importOriginal generics and satisfies guards.
// The inline typeof import() form is rejected by consistent-type-imports.
import type * as BufferEncoding from "$lib/utils/buffer-encoding.js";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as AsyncDecryptCache from "$lib/crypto/async-decrypt-cache.js";
import type * as DecryptResult from "$lib/crypto/decrypt-result.js";

const { mockOrgDecrypt } = vi.hoisted(() => ({
  mockOrgDecrypt: vi.fn().mockResolvedValue(new Uint8Array([0, 0, 0, 0])),
}));

// vi.mock required: $lib/paraglide/messages.js is a generated module
// whose barrel import triggers Paraglide runtime side effects.
// Spreading importOriginal keeps every unpinned message real so the mock
// cannot drift from the compiled message surface.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  admin_quarantine_player_error: () => "Could not load voicemail audio",
  admin_quarantine_player_loading: () => "Decrypting audio...",
  ticket_voicemail_error: () => "Audio error",
  ticket_voicemail_loading: () => "Loading audio...",
  ticket_voicemail_play: () => "Play",
  ticket_voicemail_pause: () => "Pause",
  ticket_voicemail_group: (p: { duration: string }) =>
    `Voicemail (${p.duration})`,
  ticket_voicemail_progress: (p: { current: string; total: string }) =>
    `${p.current} / ${p.total}`,
  decrypt_placeholder_loading: () => "Decrypting...",
  decrypt_placeholder_denied: () => "Access denied",
  error_decryption_failed: () => "Decryption failed",
}));

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree. Crypto contexts are set by CryptoProvider
// in the (app) layout, but component tests don't mount the full layout.
// care-y-ignore-next-line mock-factory-unguarded -- importOriginal triggers createContext() outside component tree; return type `: typeof CryptoContext` guards against drift
vi.mock("$lib/crypto/context.js", (): typeof CryptoContext => ({
  getOrgKeyManager: () =>
    ({
      decrypt: mockOrgDecrypt,
      isLoaded: true,
    }) as never,
  getCryptoBridge: () => ({ encrypt: vi.fn(), decrypt: vi.fn() }) as never,
  getOrgDecryptCache: () => ({ decrypt: vi.fn() }) as never,
  getTicketDecryptCache: () => ({ decrypt: vi.fn() }) as never,
  getCurrentUserId: () => () => undefined,
  getCurrentUserRoleId: () => () => undefined,
  getCurrentPermissions: () => () => new Set(),
  getFollowUpDecryptCache: () => ({ decryptContent: vi.fn() }) as never,
  getPreviewLoader: () => ({ load: vi.fn() }) as never,
  setCryptoBridge: (v) => v,
  setOrgKeyManager: (v) => v,
  setOrgDecryptCache: (v) => v,
  setTicketDecryptCache: (v) => v,
  setCurrentUserId: (v) => v,
  setCurrentUserRoleId: (v) => v,
  setCurrentPermissions: (v) => v,
  setFollowUpDecryptCache: (v) => v,
  setPreviewLoader: (v) => v,
}));

vi.mock("$lib/utils/buffer-encoding.js", async (importOriginal) => ({
  ...(await importOriginal<typeof BufferEncoding>()),
  base64ToUint8Array: (s: string) =>
    Uint8Array.from(atob(s), (c) => c.charCodeAt(0)),
}));

vi.mock("$lib/crypto/async-decrypt-cache.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AsyncDecryptCache>()),
  DECRYPT_ERROR_SENTINEL: "\0DECRYPT_FAILED",
  isDecryptError: (v: unknown) => v === "\0DECRYPT_FAILED",
}));

vi.mock("$lib/crypto/decrypt-result.js", async (importOriginal) => ({
  ...(await importOriginal<typeof DecryptResult>()),
  LOADING: Object.freeze({ status: "loading" }),
  ERROR: Object.freeze({ status: "error" }),
  DENIED: Object.freeze({ status: "denied" }),
}));

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

// Stub AudioContext (jsdom does not provide Web Audio API)
const mockDecodeAudioData = vi.fn().mockResolvedValue({
  duration: 30,
  numberOfChannels: 1,
  sampleRate: 44100,
  length: 44100 * 30,
  getChannelData: () => new Float32Array(100),
});

// Constructible stub: the component calls `new AudioContext()`, and a
// vi.fn with an arrow implementation throws "is not a constructor".
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
// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
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

import QuarantinePlayer from "./QuarantinePlayer.svelte";

describe("QuarantinePlayer", () => {
  beforeEach(() => {
    mockOrgDecrypt.mockClear();
    mockDecodeAudioData.mockClear();
    mockOrgDecrypt.mockResolvedValue(new Uint8Array([0, 0, 0, 0]));
  });

  afterEach(() => {
    cleanup();
  });

  it("shows loading state initially", () => {
    // Org decrypt never resolves, keeping the component in loading state
    mockOrgDecrypt.mockReturnValue(new Promise(() => undefined));

    render(QuarantinePlayer, {
      props: {
        sealedBase64: "c2VhbGVk",
        durationSeconds: 30,
      },
    });

    expect(screen.getByText("Decrypting audio...")).toBeTruthy();
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("shows error state when decryption fails", async () => {
    mockOrgDecrypt.mockRejectedValue(new TypeError("decrypt failed"));

    render(QuarantinePlayer, {
      props: {
        sealedBase64: "c2VhbGVk",
        durationSeconds: 30,
      },
    });

    await vi.waitFor(() => {
      expect(screen.getByText("Could not load voicemail audio")).toBeTruthy();
    });
  });

  it("renders AudioPlayer after successful decrypt and decode", async () => {
    render(QuarantinePlayer, {
      props: {
        sealedBase64: "c2VhbGVk",
        durationSeconds: 30,
      },
    });

    await vi.waitFor(() => {
      expect(screen.getByTestId("passthrough-shell")).toBeTruthy();
    });

    expect(mockOrgDecrypt).toHaveBeenCalledTimes(1);
    expect(mockDecodeAudioData).toHaveBeenCalledTimes(1);
  });

  it("shows error when audio decode fails", async () => {
    mockDecodeAudioData.mockRejectedValueOnce(new DOMException("decode error"));

    render(QuarantinePlayer, {
      props: {
        sealedBase64: "c2VhbGVk",
        durationSeconds: null,
      },
    });

    await vi.waitFor(() => {
      expect(screen.getByText("Could not load voicemail audio")).toBeTruthy();
    });
  });
});
