// @vitest-environment jsdom
/**
 * SecureLinkSheet tests: render the component, trigger the upgrade flow
 * through the UI, and assert on the actual mutation payload via mockMutate.
 *
 * Security assertions:
 *   - mutation payload carries authHash and clientPublic
 *   - the seed and its base64url encoding never appear in the payload
 *   - generated link follows the /portal/{channelId}#{seed} format
 *
 * ShellSheet is stubbed with the PassthroughShell helper.
 * ShellDialog is stubbed with StubShellDialog.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/svelte";
import type * as ErrorsMod from "$lib/errors.js";
import type * as ToastMod from "$lib/stores/toast.svelte.js";
import type * as IndexMod from "$lib/trpc/index.js";
import type * as HapticMod from "$lib/utils/haptic.js";
import type * as ShellSheetMod from "$lib/shell/ShellSheet.svelte";
import type * as ShellDialogMod from "$lib/shell/ShellDialog.svelte";
import type * as WithTermsMod from "$lib/terminology/with-terms.js";
import type * as CryptoMod from "@care-y/crypto";
import type * as EFFWordlistMod from "$lib/portal/eff-wordlist.js";
import type * as CryptoContextMod from "$lib/crypto/context.js";
import * as m from "$lib/paraglide/messages.js";
import { ErrorCode } from "@care-y/shared";

// ---- Hoisted spy fns ----

interface UpgradeMutationPayload {
  ticketId: string;
  channelId: string;
  authHash: string;
  clientPublic: string;
  hasPassphrase: boolean;
  keyCheck: {
    ephemeralPoint: string;
    nonce: string;
    ciphertext: string;
  };
}

type ReseedPhase = "idle" | "running" | "done" | "cancelled" | "error";

const {
  mockMutate,
  mockUpgradeMutate,
  mockRegenerateMutate,
  mockShow,
  mockHaptic,
  mockReseedStart,
  mockReseedCancel,
  mockReseedState,
} = vi.hoisted(() => {
  // Shared payload/rejection surface; the two per-method wrappers make
  // mode routing observable (setup must hit upgrade, regenerate must hit
  // regenerate) while payload assertions keep reading mockMutate.
  const sharedMutate = vi
    .fn<(input: UpgradeMutationPayload) => Promise<unknown>>()
    .mockResolvedValue(undefined);
  return {
    mockMutate: sharedMutate,
    mockUpgradeMutate: vi.fn((input: UpgradeMutationPayload) =>
      sharedMutate(input),
    ),
    mockRegenerateMutate: vi.fn((input: UpgradeMutationPayload) =>
      sharedMutate(input),
    ),
    mockShow: vi.fn<(msg: string, duration?: number) => void>(),
    mockHaptic: vi.fn<(ms?: number) => void>(),
    mockReseedStart: vi
      .fn<
        (args: {
          clientId: string;
          channelId: string;
          clientPublic: string;
        }) => Promise<void>
      >()
      .mockResolvedValue(undefined),
    mockReseedCancel: vi.fn<() => void>(),
    mockReseedState: {
      phase: "idle" as ReseedPhase,
      ticketsTotal: 0,
      ticketsDone: 0,
      itemsDone: 0,
      itemsTotal: 0,
      skippedCount: 0,
    },
  };
});

// ---- Mock crypto barrel ----

// vi.mock required: @care-y/crypto barrel triggers libsodium WASM
// initialization via getSodium() singleton. Pure mock avoids the penalty.
const mockSeed = new Uint8Array(24).fill(42);
const mockChannelId = "a".repeat(48);
const mockAuth = new Uint8Array(32).fill(7);
const mockAuthHash = new Uint8Array(32).fill(9);
const mockKeypair = {
  clientPublic: new Uint8Array(32).fill(1),
  clientPrivate: new Uint8Array(32).fill(2),
};
const mockKeyCheck = {
  ephemeralPoint: new Uint8Array(32).fill(3),
  nonce: new Uint8Array(24).fill(4),
  ciphertext: new Uint8Array(48).fill(5),
};

vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoMod>()),
  requireSodium: vi.fn(),
  generatePortalSeed: vi.fn(() => mockSeed),
  deriveChannelId: vi.fn(() => mockChannelId),
  deriveChannelAuth: vi.fn(() => mockAuth),
  hashChannelAuth: vi.fn(() => mockAuthHash),
  eciesEncrypt: vi.fn(() => ({
    ephemeralPoint: mockKeyCheck.ephemeralPoint,
    nonce: mockKeyCheck.nonce,
    ciphertext: mockKeyCheck.ciphertext,
  })),
  encode: vi.fn((buf: Uint8Array) => {
    // Stable encoding per buffer content for deterministic assertions.
    const first = buf[0];
    if (first === 42) return "seed-b64url-encoded";
    if (first === 9) return "authhash-b64url-encoded";
    if (first === 7) return "auth-b64url-encoded";
    if (first === 1) return "clientpub-b64url-encoded";
    if (first === 3) return "ep-b64url-encoded";
    if (first === 4) return "nonce-b64url-encoded";
    if (first === 5) return "ct-b64url-encoded";
    return "unknown-b64url";
  }),
  PORTAL_KEY_CHECK: "PORTAL_KEY_CHECK",
  zeroAll: vi.fn(),
}));

// Mock performChannelOprf (async OPRF round replaces derivePortalKeypair)
vi.mock("$lib/portal/portal-crypto.js", async (importOriginal) => ({
  ...(await importOriginal()),
  performChannelOprf: vi.fn().mockResolvedValue({
    clientPublic: mockKeypair.clientPublic,
    clientPrivate: mockKeypair.clientPrivate,
  }),
}));

// Mock solveProofOfWork (imported by SecureLinkSheet for the PoW callback)
vi.mock("$lib/auth/pow-solver.js", async (importOriginal) => ({
  ...(await importOriginal()),
  solveProofOfWork: vi.fn().mockResolvedValue("test-solution"),
}));

// ---- Mock EFF wordlist ----

vi.mock("$lib/portal/eff-wordlist.js", async (importOriginal) => ({
  ...(await importOriginal<typeof EFFWordlistMod>()),
  EFF_WORDLIST: ["crane", "velvet", "monsoon", "ledger", "atlas", "beacon"],
}));

// ---- Mock crypto context (getCryptoBridge) ----

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContextMod>()),
  getCryptoBridge: vi.fn(() => ({}) as unknown),
}));

// ---- Mock createPortalReseed composable ----
// Full replacement mock: the real module does not exist yet (owned by
// another writer). importOriginal would fail at runtime.

vi.mock(
  "$lib/composables/tickets/create-portal-reseed.svelte.js",
  async (importOriginal) => {
    // Spread real exports when the module ships; currently a no-op
    // placeholder to satisfy the mock-factory-unguarded lint rule.
    let real = {};
    try {
      real = await importOriginal();
    } catch {
      // Module not yet authored; full replacement is intentional.
    }
    return {
      ...real,
      createPortalReseed: vi.fn(() => ({
        get state() {
          return mockReseedState;
        },
        start: mockReseedStart,
        cancel: mockReseedCancel,
      })),
    };
  },
);

// ---- Mock tRPC, errors, toast, haptic, ShellSheet, ShellDialog, withTerms ----

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof IndexMod>()),
  trpc: {
    tickets: {
      upgradeToSecureLink: {
        mutate: (input: UpgradeMutationPayload) => mockUpgradeMutate(input),
      },
      regenerateSecureLink: {
        mutate: (input: UpgradeMutationPayload) => mockRegenerateMutate(input),
      },
    },
    clientPortal: {
      evaluateChannelOprf: {
        mutate: vi.fn().mockResolvedValue({ evaluated: "eval-b64" }),
      },
    },
  },
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ErrorsMod>()),
  requireRouter: <T>(router: T): T => router,
}));

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastMod>()),
  toastStore: { show: mockShow },
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof HapticMod>()),
  haptic: mockHaptic,
}));

vi.mock("$lib/shell/ShellSheet.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellSheetMod>()),
  default: (await import("./test-helpers/PassthroughShell.svelte")).default,
}));

vi.mock("$lib/shell/ShellDialog.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellDialogMod>()),
  default: (
    await import("$lib/components/admin/test-helpers/StubShellDialog.svelte")
  ).default,
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WithTermsMod>()),
  withTerms: (o?: Record<string, string>) => ({ ...o }),
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

const baseProps = {
  opened: true,
  ticketId: "ticket-001",
  clientId: "client-abc",
  mode: "setup" as const,
  hasPhone: false,
  ondismiss: vi.fn(),
  onsuccess: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  baseProps.ondismiss = vi.fn();
  baseProps.onsuccess = vi.fn();
  // Reset reseed state to idle
  mockReseedState.phase = "idle";
  mockReseedState.ticketsTotal = 0;
  mockReseedState.ticketsDone = 0;
  mockReseedState.itemsDone = 0;
  mockReseedState.itemsTotal = 0;
  mockReseedState.skippedCount = 0;
});

afterEach(cleanup);

const { withTerms } = await import("$lib/terminology/with-terms.js");
const SecureLinkSheet = (await import("./SecureLinkSheet.svelte")).default;

describe("SecureLinkSheet", () => {
  it("renders the setup step with intro text and generate button", () => {
    render(SecureLinkSheet, { props: baseProps });

    // The generate button uses the setup label.
    const btn = screen.getByRole("button", { name: /set up secure link/i });
    expect(btn).toBeTruthy();
  });

  it("mutation payload carries authHash and clientPublic, never the seed", async () => {
    render(SecureLinkSheet, { props: baseProps });

    const generateBtn = screen.getByRole("button", {
      name: /set up secure link/i,
    });
    await fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    const payload = mockMutate.mock.calls[0]?.[0];
    expect(payload).toBeDefined();

    // Positive: required fields present.
    expect(payload?.authHash).toBe("authhash-b64url-encoded");
    expect(payload?.clientPublic).toBe("clientpub-b64url-encoded");
    expect(payload?.channelId).toBe(mockChannelId);
    expect(payload?.ticketId).toBe("ticket-001");
    expect(payload?.hasPassphrase).toBe(false);
    expect(payload?.keyCheck).toEqual({
      ephemeralPoint: "ep-b64url-encoded",
      nonce: "nonce-b64url-encoded",
      ciphertext: "ct-b64url-encoded",
    });

    // SECURITY: the seed must never appear in the payload.
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain("seed-b64url-encoded");
    // Raw auth bytes (pre-hash) must also be absent.
    expect(serialized).not.toContain("auth-b64url-encoded");
  });

  it("generated link uses /portal/{channelId}#{encodedSeed} format", async () => {
    render(SecureLinkSheet, { props: baseProps });

    await fireEvent.click(
      screen.getByRole("button", { name: /set up secure link/i }),
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    // After success the link code block is rendered.
    const linkBlock = screen.getByText(
      (text) =>
        text.includes("/portal/") && text.includes("seed-b64url-encoded"),
    );
    expect(linkBlock).toBeTruthy();
    expect(
      linkBlock.textContent
        .trim()
        .endsWith(`/portal/${mockChannelId}#seed-b64url-encoded`),
    ).toBe(true);
  });

  it("calls onsuccess after mutation completes", async () => {
    render(SecureLinkSheet, { props: baseProps });

    await fireEvent.click(
      screen.getByRole("button", { name: /set up secure link/i }),
    );

    await waitFor(() => {
      expect(baseProps.onsuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("uses upgradeToSecureLink (not regenerate) in setup mode", async () => {
    render(SecureLinkSheet, { props: baseProps });

    await fireEvent.click(
      screen.getByRole("button", { name: /set up secure link/i }),
    );

    await waitFor(() => {
      expect(mockUpgradeMutate).toHaveBeenCalledTimes(1);
    });

    expect(mockRegenerateMutate).not.toHaveBeenCalled();
    expect(mockUpgradeMutate.mock.calls[0]?.[0]?.ticketId).toBe("ticket-001");
  });

  it("uses regenerateSecureLink (not upgrade) in regenerate mode", async () => {
    render(SecureLinkSheet, {
      props: { ...baseProps, mode: "regenerate" as const },
    });

    await fireEvent.click(
      screen.getByRole("button", { name: /set up secure link/i }),
    );

    await waitFor(() => {
      expect(mockRegenerateMutate).toHaveBeenCalledTimes(1);
    });

    expect(mockUpgradeMutate).not.toHaveBeenCalled();
    expect(mockRegenerateMutate.mock.calls[0]?.[0]?.ticketId).toBe(
      "ticket-001",
    );
  });

  it("shows error toast and returns to setup on mutation failure", async () => {
    mockMutate.mockRejectedValueOnce(new Error("network error"));

    render(SecureLinkSheet, { props: baseProps });

    await fireEvent.click(
      screen.getByRole("button", { name: /set up secure link/i }),
    );

    await waitFor(() => {
      expect(mockShow).toHaveBeenCalledTimes(1);
    });

    // The setup button should be visible again (step reset to "setup").
    expect(
      screen.getByRole("button", { name: /set up secure link/i }),
    ).toBeTruthy();
    expect(baseProps.onsuccess).not.toHaveBeenCalled();
  });

  it("shows channel-exists message when mutation fails with PORTAL_CHANNEL_EXISTS", async () => {
    mockMutate.mockRejectedValueOnce(
      new Error(ErrorCode.PORTAL_CHANNEL_EXISTS),
    );

    render(SecureLinkSheet, { props: baseProps });

    await fireEvent.click(
      screen.getByRole("button", { name: /set up secure link/i }),
    );

    await waitFor(() => {
      expect(mockShow).toHaveBeenCalledTimes(1);
    });

    // Should show the channel-exists message, not the generic one.
    const calledWithMsg = mockShow.mock.calls[0]?.[0];
    expect(calledWithMsg).toBe(m.error_portal_channel_exists(withTerms()));
    // Setup button should reappear (step reset).
    expect(
      screen.getByRole("button", { name: /set up secure link/i }),
    ).toBeTruthy();
  });

  it("shows generic error for non-channel-exists mutation failures", async () => {
    mockMutate.mockRejectedValueOnce(new Error("network error"));

    render(SecureLinkSheet, { props: baseProps });

    await fireEvent.click(
      screen.getByRole("button", { name: /set up secure link/i }),
    );

    await waitFor(() => {
      expect(mockShow).toHaveBeenCalledTimes(1);
    });

    const calledWithMsg = mockShow.mock.calls[0]?.[0];
    expect(calledWithMsg).toBe(m.error_generic());
  });

  it("sends passphrase to performChannelOprf when toggle is enabled", async () => {
    const { performChannelOprf } = await import("$lib/portal/portal-crypto.js");

    render(SecureLinkSheet, { props: baseProps });

    // Enable the passphrase toggle.
    const toggle = screen.getByRole("checkbox", {
      name: /add a passphrase/i,
    });
    await fireEvent.click(toggle);

    // Words should be visible.
    await waitFor(() => {
      const wordsDisplay = screen.getByText(
        (text) =>
          text.includes("crane") ||
          text.includes("velvet") ||
          text.includes("monsoon"),
      );
      expect(wordsDisplay).toBeTruthy();
    });

    await fireEvent.click(
      screen.getByRole("button", { name: /set up secure link/i }),
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    // performChannelOprf should have been called with a passphrase in opts.
    const oprfCalls = vi.mocked(performChannelOprf).mock.calls;
    const lastCall = oprfCalls[oprfCalls.length - 1];
    expect(lastCall).toBeDefined();
    // Third arg is the options object containing passphrase.
    const opts = lastCall?.[2] as Record<string, unknown> | undefined;
    expect(typeof opts?.passphrase).toBe("string");
    expect((opts?.passphrase as string).length).toBeGreaterThan(0);

    // Mutation payload records hasPassphrase = true.
    expect(mockMutate.mock.calls[0]?.[0]?.hasPassphrase).toBe(true);
  });

  // ---- SMS relay error handling ----

  describe("SMS relay error handling", () => {
    it("shows rate-limit toast with seconds on relay 429", async () => {
      const fetchSpy =
        vi.fn<(url: string, init?: RequestInit) => Promise<Response>>();
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers({ "Retry-After": "42" }),
      } as unknown as Response);
      global.fetch = fetchSpy as unknown as typeof fetch;

      render(SecureLinkSheet, {
        props: { ...baseProps, hasPhone: true },
      });

      // Generate the link first
      await fireEvent.click(
        screen.getByRole("button", { name: /set up secure link/i }),
      );

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      // Now click the SMS send button
      const smsBtn = screen.getByRole("button", {
        name: m.ticket_tier_send_sms(),
      });
      await fireEvent.click(smsBtn);

      await waitFor(() => {
        expect(mockShow).toHaveBeenCalledWith(
          m.ticket_sms_rate_limited({ seconds: "42" }),
          5000,
        );
      });
    });

    it("shows relay error toast on non-429 failure", async () => {
      const fetchSpy =
        vi.fn<(url: string, init?: RequestInit) => Promise<Response>>();
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 502,
        headers: new Headers(),
      } as unknown as Response);
      global.fetch = fetchSpy as unknown as typeof fetch;

      render(SecureLinkSheet, {
        props: { ...baseProps, hasPhone: true },
      });

      await fireEvent.click(
        screen.getByRole("button", { name: /set up secure link/i }),
      );

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      const smsBtn = screen.getByRole("button", {
        name: m.ticket_tier_send_sms(),
      });
      await fireEvent.click(smsBtn);

      await waitFor(() => {
        expect(mockShow).toHaveBeenCalledWith(m.ticket_sms_error_send(), 3000);
      });
    });
  });

  // ---- Reseed toggle tests ----

  describe("reseed toggle", () => {
    it("shows reseed toggle in setup mode", () => {
      render(SecureLinkSheet, { props: baseProps });

      const toggle = screen.getByRole("checkbox", {
        name: /recover message history/i,
      });
      expect(toggle).toBeTruthy();
    });

    it("shows reseed toggle in regenerate mode", () => {
      render(SecureLinkSheet, {
        props: { ...baseProps, mode: "regenerate" as const },
      });

      const toggle = screen.getByRole("checkbox", {
        name: /recover message history/i,
      });
      expect(toggle).toBeTruthy();
    });

    it("does not call reseed.start when checkbox is off", async () => {
      render(SecureLinkSheet, { props: baseProps });

      await fireEvent.click(
        screen.getByRole("button", { name: /set up secure link/i }),
      );

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      expect(mockReseedStart).not.toHaveBeenCalled();
    });

    it("calls reseed.start with captured args when checkbox is on", async () => {
      render(SecureLinkSheet, { props: baseProps });

      // Enable the reseed toggle.
      const reseedToggle = screen.getByRole("checkbox", {
        name: /recover message history/i,
      });
      await fireEvent.click(reseedToggle);

      await fireEvent.click(
        screen.getByRole("button", { name: /set up secure link/i }),
      );

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(mockReseedStart).toHaveBeenCalledTimes(1);
      });

      const args = mockReseedStart.mock.calls[0]?.[0];
      expect(args).toEqual({
        clientId: "client-abc",
        channelId: mockChannelId,
        clientPublic: "clientpub-b64url-encoded",
      });
    });
  });

  // ---- Reseed progress region tests ----

  describe("reseed progress region", () => {
    /** Generate with reseed enabled, then mutate mockReseedState to the target phase. */
    async function generateWithReseed(
      overrideState?: Partial<typeof mockReseedState>,
    ): Promise<void> {
      // Pre-set state so it is visible after render cycle.
      if (overrideState) Object.assign(mockReseedState, overrideState);

      render(SecureLinkSheet, { props: baseProps });

      // Enable reseed toggle.
      const toggle = screen.getByRole("checkbox", {
        name: /recover message history/i,
      });
      await fireEvent.click(toggle);

      // Click generate.
      await fireEvent.click(
        screen.getByRole("button", { name: /set up secure link/i }),
      );

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });
    }

    it("shows progress text and cancel button when running", async () => {
      await generateWithReseed({
        phase: "running",
        itemsDone: 3,
        itemsTotal: 10,
      });

      await waitFor(() => {
        expect(
          screen.getByText(m.reseed_progress({ done: "3", total: "10" })),
        ).toBeTruthy();
      });

      const cancelBtn = screen.getByRole("button", {
        name: m.reseed_cancel(),
      });
      expect(cancelBtn).toBeTruthy();
    });

    it("shows done message when completed with no skips", async () => {
      await generateWithReseed({
        phase: "done",
        itemsDone: 10,
        itemsTotal: 10,
        skippedCount: 0,
      });

      await waitFor(() => {
        expect(screen.getByText(m.reseed_done())).toBeTruthy();
      });
    });

    it("shows the none-eligible message, not success, when done with zero items", async () => {
      await generateWithReseed({
        phase: "done",
        itemsDone: 0,
        itemsTotal: 0,
        skippedCount: 0,
      });

      await waitFor(() => {
        expect(screen.getByText(m.reseed_none_eligible())).toBeTruthy();
      });
      expect(screen.queryByText(m.reseed_done())).toBeNull();
    });

    it("shows partial message and retry when done with skips", async () => {
      await generateWithReseed({
        phase: "done",
        itemsDone: 7,
        itemsTotal: 10,
        skippedCount: 3,
      });

      await waitFor(() => {
        expect(screen.getByText(m.reseed_partial({ count: "3" }))).toBeTruthy();
      });

      const retryBtn = screen.getByRole("button", {
        name: m.reseed_retry(),
      });
      expect(retryBtn).toBeTruthy();
    });

    it("shows error message and retry button on error", async () => {
      await generateWithReseed({ phase: "error" });

      await waitFor(() => {
        expect(screen.getByText(m.reseed_error())).toBeTruthy();
      });

      const retryBtn = screen.getByRole("button", {
        name: m.reseed_retry(),
      });
      expect(retryBtn).toBeTruthy();
    });

    it("retry button calls reseed.start with the same args", async () => {
      await generateWithReseed({
        phase: "error",
        skippedCount: 0,
      });

      // Clear the first start call.
      mockReseedStart.mockClear();

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: m.reseed_retry() }),
        ).toBeTruthy();
      });

      await fireEvent.click(
        screen.getByRole("button", { name: m.reseed_retry() }),
      );

      await waitFor(() => {
        expect(mockReseedStart).toHaveBeenCalledTimes(1);
      });

      const args = mockReseedStart.mock.calls[0]?.[0];
      expect(args).toEqual({
        clientId: "client-abc",
        channelId: mockChannelId,
        clientPublic: "clientpub-b64url-encoded",
      });
    });
  });

  // ---- Cancel confirm on dismiss while running ----

  describe("cancel confirm on dismiss while running", () => {
    it("opens confirm dialog when dismiss is attempted while running", async () => {
      mockReseedState.phase = "running";
      mockReseedState.itemsDone = 2;
      mockReseedState.itemsTotal = 10;

      render(SecureLinkSheet, { props: baseProps });

      // Enable reseed and generate.
      const toggle = screen.getByRole("checkbox", {
        name: /recover message history/i,
      });
      await fireEvent.click(toggle);

      await fireEvent.click(
        screen.getByRole("button", { name: /set up secure link/i }),
      );

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      // Click the Done button (acts as dismiss).
      const doneBtn = screen.getByRole("button", {
        name: m.ticket_tier_done(),
      });
      await fireEvent.click(doneBtn);

      // The confirm dialog body should appear.
      await waitFor(() => {
        expect(screen.getByText(m.reseed_cancel_confirm())).toBeTruthy();
      });

      // ondismiss should NOT have been called yet.
      expect(baseProps.ondismiss).not.toHaveBeenCalled();
    });

    it("calls cancel and dismisses when confirm button is clicked", async () => {
      mockReseedState.phase = "running";

      render(SecureLinkSheet, { props: baseProps });

      const toggle = screen.getByRole("checkbox", {
        name: /recover message history/i,
      });
      await fireEvent.click(toggle);

      await fireEvent.click(
        screen.getByRole("button", { name: /set up secure link/i }),
      );

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      // Trigger dismiss.
      const doneBtn = screen.getByRole("button", {
        name: m.ticket_tier_done(),
      });
      await fireEvent.click(doneBtn);

      await waitFor(() => {
        expect(screen.getByText(m.reseed_cancel_confirm())).toBeTruthy();
      });

      // The confirm dialog has a button with the cancel recovery label.
      // There are two buttons: "Cancel" (decline) and the confirm action.
      // The confirm button has the strong attribute and matches reseed_cancel text.
      const confirmBtns = screen.getAllByRole("button", {
        name: m.reseed_cancel(),
      });
      // The last one in the dialog is the confirm.
      const confirmBtn = confirmBtns[confirmBtns.length - 1];
      expect(confirmBtn).toBeTruthy();
      await fireEvent.click(confirmBtn!);

      expect(mockReseedCancel).toHaveBeenCalledTimes(1);
      expect(baseProps.ondismiss).toHaveBeenCalledTimes(1);
    });

    it("dismisses normally when reseed is not running", async () => {
      mockReseedState.phase = "done";
      mockReseedState.skippedCount = 0;

      render(SecureLinkSheet, { props: baseProps });

      const toggle = screen.getByRole("checkbox", {
        name: /recover message history/i,
      });
      await fireEvent.click(toggle);

      await fireEvent.click(
        screen.getByRole("button", { name: /set up secure link/i }),
      );

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      const doneBtn = screen.getByRole("button", {
        name: m.ticket_tier_done(),
      });
      await fireEvent.click(doneBtn);

      // Should dismiss without confirm dialog.
      expect(baseProps.ondismiss).toHaveBeenCalledTimes(1);
      expect(mockReseedCancel).not.toHaveBeenCalled();
    });
  });
});
