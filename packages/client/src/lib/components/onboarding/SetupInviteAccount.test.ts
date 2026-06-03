// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";

// jsdom doesn't implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    onboarding: {
      registerFromInvite: { mutate: vi.fn() },
    },
  },
}));

vi.mock("$lib/crypto/context.js", () => ({
  getCryptoBridge: vi.fn(() => ({
    argon2id: vi.fn(),
    oprfBlind: vi.fn(),
    deriveKeys: vi.fn(),
    zeroAll: vi.fn(),
  })),
  getOrgKeyManager: vi.fn(() => ({
    load: vi.fn(),
    isLoaded: false,
  })),
}));

vi.mock("$lib/crypto/org-key-ready.svelte.js", () => ({
  setOrgKeyReady: vi.fn(),
}));

vi.mock("$lib/auth/cleanup.js", () => ({
  installCleanupHandler: vi.fn(),
}));

vi.mock("$lib/auth/register-crypto.js", () => ({
  registerCrypto: vi.fn(),
}));

vi.mock("$lib/auth/login-crypto.js", () => ({
  loginCrypto: vi.fn(),
}));

vi.mock("$lib/auth/crypto-helpers.js", () => ({
  fetchAndUnwrapOrgKey: vi.fn(),
}));

vi.mock("$lib/auth/pow-solver.js", () => ({
  solveProofOfWork: vi.fn(),
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

vi.mock("./wizard-nav-context.js", () => ({
  getWizardNavCtx: () => ({ current: undefined }),
}));

const { default: SetupInviteAccount } =
  await import("./SetupInviteAccount.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetupInviteAccount", () => {
  it("disables submit when required fields are empty", () => {
    render(SetupInviteAccount, {
      props: { oncomplete: vi.fn(), token: "test-invite-token" },
    });
    const button = screen.getByText(m.onboarding_firstlogin_submit());
    expect(button.closest("button")?.hasAttribute("disabled")).toBe(true);
  });

  it("allows submit with empty displayName", async () => {
    const oncomplete = vi.fn();
    render(SetupInviteAccount, {
      props: { oncomplete, token: "test-invite-token" },
    });

    const inputs = document.querySelectorAll("input");
    const usernameInput = inputs[0];
    const passwordInput = inputs[2];
    const confirmInput = inputs[3];

    if (usernameInput && passwordInput && confirmInput) {
      await fireEvent.input(usernameInput, {
        target: { value: "volunteer1" },
      });
      await fireEvent.input(passwordInput, {
        target: { value: "a-secure-password-123" },
      });
      await fireEvent.input(confirmInput, {
        target: { value: "a-secure-password-123" },
      });
    }

    const button = screen.getByText(m.onboarding_firstlogin_submit());
    expect(button.closest("button")?.hasAttribute("disabled")).toBe(false);
  });

  it("shows password length error for short passwords", async () => {
    const oncomplete = vi.fn();
    render(SetupInviteAccount, {
      props: { oncomplete, token: "test-invite-token" },
    });

    const inputs = document.querySelectorAll("input");
    const usernameInput = inputs[0];
    const passwordInput = inputs[2];
    const confirmInput = inputs[3];

    if (usernameInput && passwordInput && confirmInput) {
      await fireEvent.input(usernameInput, {
        target: { value: "volunteer1" },
      });
      await fireEvent.input(passwordInput, { target: { value: "short" } });
      await fireEvent.input(confirmInput, { target: { value: "short" } });

      const form = document.querySelector("form");
      if (form) {
        await fireEvent.submit(form);
      }
    }

    expect(
      screen.getAllByText("Password must be at least 16 characters.").length,
    ).toBeGreaterThan(0);
    expect(oncomplete).not.toHaveBeenCalled();
  });

  it("shows password mismatch error when passwords differ", async () => {
    const oncomplete = vi.fn();
    render(SetupInviteAccount, {
      props: { oncomplete, token: "test-invite-token" },
    });

    const inputs = document.querySelectorAll("input");
    const usernameInput = inputs[0];
    const passwordInput = inputs[2];
    const confirmInput = inputs[3];

    if (usernameInput && passwordInput && confirmInput) {
      await fireEvent.input(usernameInput, {
        target: { value: "volunteer1" },
      });
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

    expect(
      screen.getAllByText("Passwords do not match.").length,
    ).toBeGreaterThan(0);
    expect(oncomplete).not.toHaveBeenCalled();
  });
});
