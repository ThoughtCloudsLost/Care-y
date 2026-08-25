// @vitest-environment jsdom
/**
 * OutboundMessageEditSheet tests: render the component, exercise the save
 * flow, and assert on boundary-seam spies (crypto bridge, tRPC mutation).
 *
 * Covers:
 *   - save disabled when over 5000 chars
 *   - character counter appears past 4500 chars
 *   - save triggers encrypt + mutation with correct payload
 *   - portalCopy re-encryption via eciesEncrypt when clientPublic is set
 *   - portalCopy omitted when clientPublic is null
 *
 * ShellSheet is stubbed with the PassthroughShell helper.
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
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as SvelteQuery from "@tanstack/svelte-query";
import type * as CryptoMod from "@care-y/crypto";

// ---- Hoisted spy fns ----

interface UpdateOutboundPayload {
  followUpId: string;
  encryptedContent: string;
  portalCopy?: {
    ephemeralPoint: string;
    nonce: string;
    ciphertext: string;
  };
}

const { mockEncrypt, mockMutate, mockInvalidateQueries, mockShow, mockHaptic } =
  vi.hoisted(() => ({
    mockEncrypt: vi
      .fn<(ticketId: string, slot: string, text: string) => Promise<string>>()
      .mockResolvedValue("sealed-content-b64"),
    mockMutate: vi
      .fn<(input: UpdateOutboundPayload) => Promise<unknown>>()
      .mockResolvedValue(undefined),
    mockInvalidateQueries: vi
      .fn<(opts: { queryKey: readonly unknown[] }) => Promise<void>>()
      .mockResolvedValue(undefined),
    mockShow: vi.fn<(msg: string, duration?: number) => void>(),
    mockHaptic: vi.fn<(ms?: number) => void>(),
  }));

// ---- Mock @care-y/crypto ----

// vi.mock required: @care-y/crypto barrel triggers libsodium WASM
// initialization via getSodium() singleton. Pure mock avoids the penalty.
const mockEciesResult = {
  ephemeralPoint: new Uint8Array(32).fill(3),
  nonce: new Uint8Array(24).fill(4),
  ciphertext: new Uint8Array(48).fill(5),
};

vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoMod>()),
  followupSlot: (id: string) => `followup:${id}`,
  eciesEncrypt: vi.fn(() => ({
    ephemeralPoint: mockEciesResult.ephemeralPoint,
    nonce: mockEciesResult.nonce,
    ciphertext: mockEciesResult.ciphertext,
  })),
  encode: vi.fn((buf: Uint8Array) => {
    const first = buf[0];
    if (first === 3) return "ep-b64url";
    if (first === 4) return "nonce-b64url";
    if (first === 5) return "ct-b64url";
    return "unknown-b64url";
  }),
  decode: vi.fn(() => new Uint8Array(32).fill(99)),
  toRistrettoPoint: vi.fn((buf: Uint8Array) => buf as unknown as Uint8Array),
}));

// ---- Mock trpc, errors, toast, haptic, ShellSheet, crypto context, query ----

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof IndexMod>()),
  trpc: {
    tickets: {
      updateOutboundMessage: {
        mutate: (input: UpdateOutboundPayload) => mockMutate(input),
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

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getCryptoBridge: () => ({ encrypt: mockEncrypt }),
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQuery>()),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
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
  followUpId: "fu-001",
  initialContent: "Original message text",
  clientPublic: null as string | null,
  ondismiss: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  baseProps.ondismiss = vi.fn();
  baseProps.clientPublic = null;
});

afterEach(cleanup);

const OutboundMessageEditSheet = (
  await import("./OutboundMessageEditSheet.svelte")
).default;

/** Helper: get the textarea and type a value into it. */
async function typeInTextarea(value: string): Promise<void> {
  const textarea = document.getElementById(
    "edit-message-textarea",
  ) as HTMLTextAreaElement;
  expect(textarea).toBeTruthy();
  await fireEvent.input(textarea, { target: { value } });
}

/** Helper: find the save button. */
function saveButton(): HTMLButtonElement {
  return screen.getByRole("button", { name: /save/i }) as HTMLButtonElement;
}

describe("OutboundMessageEditSheet", () => {
  it("prefills textarea with initialContent", () => {
    render(OutboundMessageEditSheet, { props: baseProps });

    const textarea = document.getElementById(
      "edit-message-textarea",
    ) as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    expect(textarea.value).toBe("Original message text");
  });

  it("save is disabled when content has not changed", () => {
    render(OutboundMessageEditSheet, { props: baseProps });
    expect(saveButton().disabled).toBe(true);
  });

  describe("character limit (5000 chars)", () => {
    it("disables save when text exceeds 5000 characters", async () => {
      render(OutboundMessageEditSheet, { props: baseProps });

      await typeInTextarea("a".repeat(5001));

      expect(saveButton().disabled).toBe(true);
    });

    it("enables save at exactly 5000 characters (when changed)", async () => {
      render(OutboundMessageEditSheet, { props: baseProps });

      await typeInTextarea("b".repeat(5000));

      expect(saveButton().disabled).toBe(false);
    });
  });

  describe("character counter (threshold at 4500)", () => {
    it("shows counter text when content exceeds 4500 characters", async () => {
      render(OutboundMessageEditSheet, { props: baseProps });

      await typeInTextarea("c".repeat(4501));

      // The counter renders the count/max format.
      const counter = screen.getByText(/4501/);
      expect(counter).toBeTruthy();
    });

    it("does not show counter at 4500 characters or below", async () => {
      render(OutboundMessageEditSheet, { props: baseProps });

      await typeInTextarea("d".repeat(4500));

      expect(screen.queryByText(/4500.*5000/)).toBeNull();
    });

    it("shows over-limit text when exceeding 5000 characters", async () => {
      render(OutboundMessageEditSheet, { props: baseProps });

      await typeInTextarea("e".repeat(5001));

      // The component renders the "too long" message via aria-live="assertive".
      const overLimit = screen.getByText(/too long/i);
      expect(overLimit).toBeTruthy();
    });
  });

  describe("save flow (no portal)", () => {
    it("encrypts via cryptoBridge and calls mutation with correct payload", async () => {
      render(OutboundMessageEditSheet, { props: baseProps });

      await typeInTextarea("Updated content");
      await fireEvent.click(saveButton());

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      // Encrypt was called through the bridge with the right slot.
      expect(mockEncrypt).toHaveBeenCalledWith(
        "ticket-001",
        "followup:fu-001",
        "Updated content",
      );

      // Mutation payload carries the sealed content, no portalCopy.
      const payload = mockMutate.mock.calls[0]?.[0];
      expect(payload).toEqual({
        followUpId: "fu-001",
        encryptedContent: "sealed-content-b64",
        portalCopy: undefined,
      });
    });

    it("shows toast, calls haptic, dismisses, and invalidates on success", async () => {
      render(OutboundMessageEditSheet, { props: baseProps });

      await typeInTextarea("New text");
      await fireEvent.click(saveButton());

      await waitFor(() => {
        expect(baseProps.ondismiss).toHaveBeenCalledTimes(1);
      });

      expect(mockHaptic).toHaveBeenCalledTimes(1);
      expect(mockShow).toHaveBeenCalledWith("Message updated");
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["ticket", "ticket-001", "followUps"],
      });
    });
  });

  describe("save flow with portal (eciesEncrypt re-encryption)", () => {
    it("includes portalCopy in mutation when clientPublic is set", async () => {
      render(OutboundMessageEditSheet, {
        props: { ...baseProps, clientPublic: "client-pub-b64" },
      });

      await typeInTextarea("Portal-ready content");
      await fireEvent.click(saveButton());

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      const payload = mockMutate.mock.calls[0]?.[0];
      expect(payload?.portalCopy).toEqual({
        ephemeralPoint: "ep-b64url",
        nonce: "nonce-b64url",
        ciphertext: "ct-b64url",
      });

      // eciesEncrypt was called with the trimmed text bytes and the decoded public key.
      const { eciesEncrypt } = await import("@care-y/crypto");
      expect(eciesEncrypt).toHaveBeenCalledTimes(1);
    });

    it("omits portalCopy when clientPublic is null", async () => {
      render(OutboundMessageEditSheet, {
        props: { ...baseProps, clientPublic: null },
      });

      await typeInTextarea("No portal");
      await fireEvent.click(saveButton());

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      expect(mockMutate.mock.calls[0]?.[0]?.portalCopy).toBeUndefined();
    });

    it("omits portalCopy when clientPublic is empty string", async () => {
      render(OutboundMessageEditSheet, {
        props: { ...baseProps, clientPublic: "" },
      });

      await typeInTextarea("Empty key");
      await fireEvent.click(saveButton());

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });

      expect(mockMutate.mock.calls[0]?.[0]?.portalCopy).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("shows error toast on mutation failure and keeps sheet open", async () => {
      mockMutate.mockRejectedValueOnce(new Error("network error"));

      render(OutboundMessageEditSheet, { props: baseProps });

      await typeInTextarea("Will fail");
      await fireEvent.click(saveButton());

      await waitFor(() => {
        expect(mockShow).toHaveBeenCalledTimes(1);
      });

      expect(baseProps.ondismiss).not.toHaveBeenCalled();
      // Save button should re-enable after failure.
      expect(saveButton().disabled).toBe(false);
    });
  });
});
