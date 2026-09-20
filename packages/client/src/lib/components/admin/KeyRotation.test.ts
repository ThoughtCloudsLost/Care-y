// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const {
  mockRotateOrgKey,
  mockInvalidateQueries,
  mockUsers,
  mockResealTables,
  mockResealBlobTables,
  mockResealBrandingClasses,
  mockReindexViewerTables,
} = vi.hoisted(() => ({
  mockRotateOrgKey: vi.fn().mockResolvedValue({ success: true }),
  mockInvalidateQueries: vi.fn(),
  mockResealTables: vi
    .fn()
    .mockResolvedValue({ resealed: 3, skipped: 0, reindexed: 1 }),
  mockResealBlobTables: vi.fn().mockResolvedValue({ resealed: 1, skipped: 0 }),
  mockResealBrandingClasses: vi
    .fn()
    .mockResolvedValue({ resealed: 2, skipped: 0 }),
  mockReindexViewerTables: vi
    .fn()
    .mockResolvedValue({ reindexed: 2, indexPendingTables: [] }),
  mockUsers: [
    {
      id: "u1",
      isActive: true,
      volPublic: "AAAA",
      encryptedDisplayName: "enc1",
      roleId: "vol",
      hasKeys: true,
      hasOrgKeyWrap: true,
    },
    {
      id: "u2",
      isActive: true,
      volPublic: "BBBB",
      encryptedDisplayName: "enc2",
      roleId: "vol",
      hasKeys: true,
      hasOrgKeyWrap: true,
    },
    {
      id: "u3",
      isActive: false,
      volPublic: "CCCC",
      encryptedDisplayName: "enc3",
      roleId: "vol",
      hasKeys: true,
      hasOrgKeyWrap: true,
    },
  ],
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
  admin_rotation_dialog_title: () => "Rotate organization key",
  admin_rotation_dialog_why: () => "Rotate your key if a team member leaves.",
  admin_rotation_dialog_body: ({ count }: { count: string }) =>
    `All ${count} active volunteers will receive the updated key.`,
  admin_rotation_confirm: () => "Rotate Key",
  admin_rotation_generating: () => "Generating new key...",
  admin_rotation_wrapping: ({ count }: { count: string }) =>
    `Wrapping key for ${count} volunteers...`,
  admin_rotation_submitting: () => "Submitting to server...",
  admin_rotation_complete: () => "Key rotation complete",
  admin_rotation_error: () => "Key rotation failed.",
  admin_rotation_retry: () => "Retry",
  admin_key_rotated: () => "Organization key rotated",
  admin_rotation_done: () => "Done",
  admin_rotation_resealing: ({
    done,
    total,
  }: {
    done: string;
    total: string;
  }) => `Securing records: ${done} of ${total}...`,
  admin_rotation_reseal_pending: () => "Some records are still waiting.",
  admin_rotation_reexport_escrow: () => "Your recovery file predates this key.",
  admin_rotation_export_escrow: () => "Export recovery file",
  common_cancel: () => "Cancel",
}));

vi.mock("$lib/crypto/org-reseal.js", async (importOriginal) => ({
  ...(await importOriginal<typeof OrgResealNS>()),
  resealTables: mockResealTables,
  resealBlobTables: mockResealBlobTables,
  resealBrandingClasses: mockResealBrandingClasses,
  reindexViewerTables: mockReindexViewerTables,
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS>()),
  getOrgKeyManager: () => ({
    isLoaded: true,
    load: vi.fn(),
  }),
  getCryptoBridge: () => ({
    orgEncrypt: vi.fn().mockResolvedValue("encrypted"),
    orgDecrypt: vi.fn().mockResolvedValue("decrypted"),
    // 32 bytes: the outgoing secret the rotation seals into the chain.
    exportOrgSecretKey: vi
      .fn()
      .mockResolvedValue(new Uint8Array(32).fill(7).buffer),
  }),
}));

vi.mock("$lib/auth/crypto-helpers.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoHelpersNS>()),
  fetchAndUnwrapOrgKey: vi.fn().mockResolvedValue("org-public-key-b64"),
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    void opts;
    return {
      get data() {
        return mockUsers;
      },
      get isLoading() {
        return false;
      },
    };
  },
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    auth: {
      listUsers: { query: vi.fn().mockResolvedValue(mockUsers) },
    },
    keys: {
      rotateOrgKey: { mutate: mockRotateOrgKey },
      getWrappedOrgKey: {
        query: vi.fn().mockResolvedValue({
          wrappedKey: "w",
          ephemeralPoint: "e",
          nonce: "n",
          currentGeneration: 1,
          generations: [],
        }),
      },
    },
  },
}));

vi.mock(
  "$lib/stores/toast.svelte.js",
  async () =>
    (await import("$mocks/toast.js")).toastMock() satisfies typeof ToastNS,
);

vi.mock("$lib/utils/haptic.js", async (importOriginal) =>
  (await import("$mocks/haptic.js")).hapticMock(
    await importOriginal<typeof HapticNS>(),
  ),
);

vi.mock("$lib/utils/announce.js", async (importOriginal) =>
  (await import("$mocks/announce.js")).announceMock(
    await importOriginal<typeof AnnounceNS>(),
  ),
);

vi.mock(
  "$lib/shell/ShellDialog.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/StubShellDialog.svelte"))
        .default as unknown as (typeof ShellDialogNS)["default"],
    }) satisfies typeof ShellDialogNS,
);

const fakeKeypair = {
  publicKey: new Uint8Array(32).fill(1),
  secretKey: new Uint8Array(32).fill(2),
};

vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoNS>()),
  generateOrgKeypair: () => fakeKeypair,
  sealPrevGeneration: () => ({
    ciphertext: new Uint8Array(48),
    nonce: new Uint8Array(24),
  }),
  wrapKey: () => ({
    ephemeralPoint: new Uint8Array(32),
    nonce: new Uint8Array(24),
    ciphertext: new Uint8Array(48),
  }),
  encode: (buf: Uint8Array) => btoa(String.fromCharCode(...buf)),
  decode: () => new Uint8Array(32),
  toRistrettoPoint: (buf: Uint8Array) => buf,
  getSodium: vi.fn().mockResolvedValue({}),
  requireSodium: () => ({ memzero: vi.fn() }),
}));

import KeyRotation from "./KeyRotation.svelte";
import type * as AnnounceNS from "$lib/utils/announce.js";
import type * as HapticNS from "$lib/utils/haptic.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as CryptoHelpersNS from "$lib/auth/crypto-helpers.js";
import type * as ContextNS from "$lib/crypto/context.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";
import type * as CryptoNS from "@care-y/crypto";
import type * as ShellDialogNS from "$lib/shell/ShellDialog.svelte";
import type * as OrgResealNS from "$lib/crypto/org-reseal.js";

describe("KeyRotation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("renders confirmation dialog with active volunteer count", async () => {
    const { component } = render(KeyRotation);
    component.open();
    await vi.waitFor(() => {
      expect(
        screen.getByText(/All 2 active volunteers will receive/),
      ).toBeTruthy();
    });
  });

  it("shows rotate key button in confirmation dialog", async () => {
    const { component } = render(KeyRotation);
    component.open();
    await vi.waitFor(() => {
      expect(screen.getByText("Rotate Key")).toBeTruthy();
    });
  });

  it("calls rotateOrgKey mutation on confirm", async () => {
    const { component } = render(KeyRotation);
    component.open();

    await vi.waitFor(() => {
      expect(screen.getByText("Rotate Key")).toBeTruthy();
    });

    const rotateBtn = screen.getByText("Rotate Key");
    await fireEvent.click(rotateBtn);

    await vi.waitFor(() => {
      expect(mockRotateOrgKey).toHaveBeenCalledTimes(1);
    });

    const call = mockRotateOrgKey.mock.calls[0]![0] as {
      newOrgPublicKey: string;
      newGeneration: number;
      chainedFrom: { prevSecretCt: string; prevNonce: string } | null;
      wrappedKeys: unknown[];
    };
    expect(call.wrappedKeys).toHaveLength(2);
    // Without a chain entry the swap would orphan every pre-rotation blob,
    // so the rotation must never go out with chainedFrom null.
    expect(call.newGeneration).toBe(2);
    expect(call.chainedFrom).not.toBeNull();
    expect(call.chainedFrom?.prevSecretCt).toBeTruthy();
    expect(call.chainedFrom?.prevNonce).toBeTruthy();
  });

  it("shows completion state after successful rotation", async () => {
    const { component } = render(KeyRotation);
    component.open();

    await vi.waitFor(() => {
      expect(screen.getByText("Rotate Key")).toBeTruthy();
    });

    await fireEvent.click(screen.getByText("Rotate Key"));

    await vi.waitFor(() => {
      expect(screen.getByText("Key rotation complete")).toBeTruthy();
    });
  });

  it("shows error state when rotation fails", async () => {
    mockRotateOrgKey.mockRejectedValueOnce(new Error("Network error"));

    const { component } = render(KeyRotation);
    component.open();

    await vi.waitFor(() => {
      expect(screen.getByText("Rotate Key")).toBeTruthy();
    });

    await fireEvent.click(screen.getByText("Rotate Key"));

    await vi.waitFor(() => {
      expect(screen.getByText("Key rotation failed.")).toBeTruthy();
      expect(screen.getByText("Network error")).toBeTruthy();
    });
  });

  it("runs the inline red-tier reseal after a successful swap", async () => {
    const { component } = render(KeyRotation);
    component.open();

    await vi.waitFor(() => {
      expect(screen.getByText("Rotate Key")).toBeTruthy();
    });

    await fireEvent.click(screen.getByText("Rotate Key"));

    await vi.waitFor(() => {
      expect(screen.getByText("Key rotation complete")).toBeTruthy();
    });

    expect(mockResealTables).toHaveBeenCalledTimes(1);
    expect(mockResealBlobTables).toHaveBeenCalledTimes(1);
    expect(mockResealBrandingClasses).toHaveBeenCalledTimes(1);
    expect(mockReindexViewerTables).toHaveBeenCalledTimes(1);
    // The reseal only starts once the swap has landed
    expect(mockResealTables.mock.invocationCallOrder[0]!).toBeGreaterThan(
      mockRotateOrgKey.mock.invocationCallOrder[0]!,
    );
  });

  it("shows the escrow re-export prompt in the done state", async () => {
    const { component } = render(KeyRotation, {
      props: { onRequestEscrowExport: vi.fn() },
    });
    component.open();

    await vi.waitFor(() => {
      expect(screen.getByText("Rotate Key")).toBeTruthy();
    });

    await fireEvent.click(screen.getByText("Rotate Key"));

    await vi.waitFor(() => {
      expect(
        screen.getByText("Your recovery file predates this key."),
      ).toBeTruthy();
      expect(screen.getByText("Export recovery file")).toBeTruthy();
    });
  });

  it("completes with a pending note when the reseal fails, not a rotation error", async () => {
    mockResealTables.mockRejectedValueOnce(new Error("network died"));

    const { component } = render(KeyRotation);
    component.open();

    await vi.waitFor(() => {
      expect(screen.getByText("Rotate Key")).toBeTruthy();
    });

    await fireEvent.click(screen.getByText("Rotate Key"));

    await vi.waitFor(() => {
      expect(screen.getByText("Key rotation complete")).toBeTruthy();
      expect(screen.getByText("Some records are still waiting.")).toBeTruthy();
    });
    expect(screen.queryByText("Key rotation failed.")).toBeNull();
  });

  it("shows retry button on error", async () => {
    mockRotateOrgKey.mockRejectedValueOnce(new Error("fail"));

    const { component } = render(KeyRotation);
    component.open();

    await vi.waitFor(() => {
      expect(screen.getByText("Rotate Key")).toBeTruthy();
    });

    await fireEvent.click(screen.getByText("Rotate Key"));

    await vi.waitFor(() => {
      expect(screen.getByText("Retry")).toBeTruthy();
    });
  });
});
