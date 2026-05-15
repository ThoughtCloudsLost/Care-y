// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

// Mock query state: controls which branch the component renders.
let inviteQueryState: {
  isLoading: boolean;
  isError: boolean;
  data: { valid: boolean; expiresAt?: string } | undefined;
} = { isLoading: true, isError: false, data: undefined };

vi.mock("$app/state", () => ({
  page: {
    params: { token: "test-invite-token-abc123" },
    url: new URL("http://localhost/first-login/test-invite-token-abc123"),
  },
}));

vi.mock("$app/navigation", () => ({
  goto: vi.fn(),
}));

vi.mock("$app/paths", () => ({
  resolve: (path: string) => path,
}));

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: () => inviteQueryState,
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    onboarding: {
      validateInvite: { query: vi.fn() },
      registerFromInvite: { mutate: vi.fn() },
    },
  },
}));

vi.mock("$lib/auth/register-crypto.js", () => ({
  registerCrypto: vi.fn(),
}));

vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));

vi.mock("$lib/utils/haptic.js", () => ({
  haptic: vi.fn(),
}));

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));

const { default: FirstLoginPage } = await import("./+page.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  inviteQueryState = { isLoading: true, isError: false, data: undefined };
});

describe("FirstLoginPage", () => {
  it("shows Preloader while validating invite token", () => {
    inviteQueryState = { isLoading: true, isError: false, data: undefined };
    render(FirstLoginPage);
    expect(document.querySelector(".loading-container")).toBeTruthy();
  });

  it("shows error when invite token is invalid", () => {
    inviteQueryState = {
      isLoading: false,
      isError: false,
      data: { valid: false },
    };
    render(FirstLoginPage);
    expect(
      screen.getByText("This invite link is invalid or has expired."),
    ).toBeTruthy();
  });

  it("renders registration form when invite token is valid", () => {
    inviteQueryState = {
      isLoading: false,
      isError: false,
      data: { valid: true, expiresAt: "2026-06-01T00:00:00Z" },
    };
    render(FirstLoginPage);
    expect(screen.getByText("Set Up Your Account")).toBeTruthy();
    expect(screen.getByText("Create Account")).toBeTruthy();
  });

  it("disables submit when required fields are empty", () => {
    inviteQueryState = {
      isLoading: false,
      isError: false,
      data: { valid: true, expiresAt: "2026-06-01T00:00:00Z" },
    };
    render(FirstLoginPage);
    const button = screen.getByText("Create Account");
    expect(button.closest("button")?.hasAttribute("disabled")).toBe(true);
  });

  it("shows password length error for short passwords", async () => {
    inviteQueryState = {
      isLoading: false,
      isError: false,
      data: { valid: true, expiresAt: "2026-06-01T00:00:00Z" },
    };
    render(FirstLoginPage);

    const inputs = document.querySelectorAll("input");
    const usernameInput = inputs[0];
    const passwordInput = inputs[2];
    const confirmInput = inputs[3];

    if (usernameInput && passwordInput && confirmInput) {
      await fireEvent.input(usernameInput, { target: { value: "volunteer1" } });
      await fireEvent.input(passwordInput, { target: { value: "short" } });
      await fireEvent.input(confirmInput, { target: { value: "short" } });

      const form = document.querySelector("form");
      if (form) {
        await fireEvent.submit(form);
      }
    }

    const matches = screen.getAllByText(
      "Password must be at least 16 characters.",
    );
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows password mismatch error when passwords differ", async () => {
    inviteQueryState = {
      isLoading: false,
      isError: false,
      data: { valid: true, expiresAt: "2026-06-01T00:00:00Z" },
    };
    render(FirstLoginPage);

    const inputs = document.querySelectorAll("input");
    const usernameInput = inputs[0];
    const passwordInput = inputs[2];
    const confirmInput = inputs[3];

    if (usernameInput && passwordInput && confirmInput) {
      await fireEvent.input(usernameInput, { target: { value: "volunteer1" } });
      await fireEvent.input(passwordInput, {
        target: { value: "a-secure-password-123" },
      });
      await fireEvent.input(confirmInput, {
        target: { value: "different-password-456" },
      });

      const form = document.querySelector("form");
      if (form) {
        await fireEvent.submit(form);
      }
    }

    const matches = screen.getAllByText("Passwords do not match.");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("calls registerFromInvite and registerCrypto on valid submit", async () => {
    inviteQueryState = {
      isLoading: false,
      isError: false,
      data: { valid: true, expiresAt: "2026-06-01T00:00:00Z" },
    };

    const { trpc } = await import("$lib/trpc/index.js");
    const { registerCrypto } = await import("$lib/auth/register-crypto.js");

    const mockMutate = vi.mocked(trpc.onboarding!.registerFromInvite.mutate);
    mockMutate.mockResolvedValueOnce({ userId: "user-001" });

    const mockRegister = vi.mocked(registerCrypto);
    mockRegister.mockResolvedValueOnce({
      salt: "dGVzdC1zYWx0",
      volPublic: "dGVzdC12b2wtcHVibGlj",
    });

    render(FirstLoginPage);

    const inputs = document.querySelectorAll("input");
    const usernameInput = inputs[0];
    const passwordInput = inputs[2];
    const confirmInput = inputs[3];

    if (usernameInput && passwordInput && confirmInput) {
      await fireEvent.input(usernameInput, { target: { value: "volunteer1" } });
      await fireEvent.input(passwordInput, {
        target: { value: "a-secure-password-123" },
      });
      await fireEvent.input(confirmInput, {
        target: { value: "a-secure-password-123" },
      });

      const form = document.querySelector("form");
      if (form) {
        await fireEvent.submit(form);
      }
    }

    // Wait for async handlers
    await vi.waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        token: "test-invite-token-abc123",
        identifier: "volunteer1",
        password: "a-secure-password-123",
        displayName: undefined,
      });
    });

    expect(mockRegister).toHaveBeenCalledWith(
      "user-001",
      "a-secure-password-123",
      expect.any(Object),
    );
  });
});
