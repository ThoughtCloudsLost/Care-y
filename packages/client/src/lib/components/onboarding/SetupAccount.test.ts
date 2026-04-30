// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

// Mock all crypto and tRPC dependencies before importing the component.
// SetupAccount has heavy dependencies (crypto Worker, tRPC, libsodium).
// Unit tests validate the form/validation layer; the full crypto pipeline
// is covered by Playwright E2E tests.
vi.mock("@care-y/crypto", () => ({
  generateOrgKeypair: vi.fn(),
  wrapKey: vi.fn(),
  encode: vi.fn((buf: Uint8Array) => btoa(String.fromCharCode(...buf))),
  decode: vi.fn(
    (s: string) => new Uint8Array([...atob(s)].map((c) => c.charCodeAt(0))),
  ),
  toRistrettoPoint: vi.fn((buf: Uint8Array) => buf),
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    onboarding: {
      bootstrapAdmin: { mutate: vi.fn() },
    },
    keys: {
      uploadOrgPublicKey: { mutate: vi.fn() },
    },
  },
}));

vi.mock("$lib/crypto/context.js", () => ({
  getCryptoBridge: vi.fn(() => ({
    argon2id: vi.fn(),
    oprfBlind: vi.fn(),
    deriveKeys: vi.fn(),
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

// Import after mocks are set up
const { default: SetupAccount } = await import("./SetupAccount.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetupAccount", () => {
  it("renders the account creation form", () => {
    render(SetupAccount, {
      props: { oncomplete: vi.fn() },
    });
    expect(screen.getByText("Create Your Admin Account")).toBeTruthy();
    expect(screen.getByText("Create Account")).toBeTruthy();
  });

  it("disables submit when required fields are empty", () => {
    render(SetupAccount, {
      props: { oncomplete: vi.fn() },
    });
    const button = screen.getByText("Create Account");
    expect(button.closest("button")?.hasAttribute("disabled")).toBe(true);
  });

  it("shows password length error for short passwords", async () => {
    const oncomplete = vi.fn();
    render(SetupAccount, { props: { oncomplete } });

    const inputs = document.querySelectorAll("input");
    const usernameInput = inputs[0];
    const displayNameInput = inputs[1];
    const passwordInput = inputs[2];
    const confirmInput = inputs[3];

    if (usernameInput && displayNameInput && passwordInput && confirmInput) {
      await fireEvent.input(usernameInput, { target: { value: "admin" } });
      await fireEvent.input(displayNameInput, { target: { value: "Admin" } });
      await fireEvent.input(passwordInput, { target: { value: "short" } });
      await fireEvent.input(confirmInput, { target: { value: "short" } });

      const form = document.querySelector("form");
      if (form) {
        await fireEvent.submit(form);
      }
    }

    expect(
      screen.getByText("Password must be at least 12 characters."),
    ).toBeTruthy();
    expect(oncomplete).not.toHaveBeenCalled();
  });

  it("shows password mismatch error when passwords differ", async () => {
    const oncomplete = vi.fn();
    render(SetupAccount, { props: { oncomplete } });

    const inputs = document.querySelectorAll("input");
    const usernameInput = inputs[0];
    const displayNameInput = inputs[1];
    const passwordInput = inputs[2];
    const confirmInput = inputs[3];

    if (usernameInput && displayNameInput && passwordInput && confirmInput) {
      await fireEvent.input(usernameInput, { target: { value: "admin" } });
      await fireEvent.input(displayNameInput, { target: { value: "Admin" } });
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

    expect(screen.getByText("Passwords do not match.")).toBeTruthy();
    expect(oncomplete).not.toHaveBeenCalled();
  });
});
