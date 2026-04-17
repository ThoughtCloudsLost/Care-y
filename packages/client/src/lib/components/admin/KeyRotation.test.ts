// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const { mockRotateOrgKey, mockInvalidateQueries, mockToastShow, mockUsers } =
  vi.hoisted(() => ({
    mockRotateOrgKey: vi.fn().mockResolvedValue({ success: true }),
    mockInvalidateQueries: vi.fn(),
    mockToastShow: vi.fn(),
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

vi.mock("$lib/paraglide/messages.js", () => ({
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
  common_cancel: () => "Cancel",
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: () => ({
    isLoaded: true,
    load: vi.fn(),
  }),
}));

vi.mock("@tanstack/svelte-query", () => ({
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

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    auth: {
      listUsers: { query: vi.fn().mockResolvedValue(mockUsers) },
    },
    keys: {
      rotateOrgKey: { mutate: mockRotateOrgKey },
    },
  },
}));

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/utils/haptic.js", () => ({
  haptic: vi.fn(),
}));

vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));

vi.mock("$lib/shell/ShellDialog.svelte", async () => ({
  default: (await import("./test-helpers/StubShellDialog.svelte")).default,
}));

const fakeKeypair = {
  publicKey: new Uint8Array(32).fill(1),
  secretKey: new Uint8Array(32).fill(2),
};

vi.mock("@care-y/crypto", () => ({
  generateOrgKeypair: () => fakeKeypair,
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
      wrappedKeys: unknown[];
    };
    expect(call.wrappedKeys).toHaveLength(2);
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
