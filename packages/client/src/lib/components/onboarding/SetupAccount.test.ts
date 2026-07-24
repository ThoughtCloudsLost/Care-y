// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import { ErrorCode } from "@care-y/shared";

// Type-only namespace imports for importOriginal generics
import type * as TrpcIndex from "$lib/trpc/index.js";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as OrgKeyReady from "$lib/crypto/org-key-ready.svelte.js";
import type * as Cleanup from "$lib/auth/cleanup.js";
import type * as CryptoCallbacks from "$lib/auth/crypto-callbacks.js";
import type * as CryptoHelpers from "$lib/auth/crypto-helpers.js";
import type * as PowSolver from "$lib/auth/pow-solver.js";
import type * as AnnounceMod from "$lib/utils/announce.js";
import type * as HapticMod from "$lib/utils/haptic.js";
import type * as ToastStore from "$lib/stores/toast.svelte.js";
import type * as WizardNavContext from "./wizard-nav-context.js";

// jsdom doesn't implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// ── Hoisted mocks ──
// Controllable mock functions declared before vi.mock so they can be
// referenced from both mock factories and test assertions.

const {
  mockBootstrapAdmin,
  mockUploadOrgPublicKey,
  mockRegisterCrypto,
  mockLoginCrypto,
  mockFetchAndUnwrapOrgKey,
  mockInstallCleanupHandler,
  mockAnnounce,
  mockHaptic,
  mockOrgKeyManagerLoad,
} = vi.hoisted(() => ({
  mockBootstrapAdmin: vi.fn(),
  mockUploadOrgPublicKey: vi.fn(),
  mockRegisterCrypto: vi.fn(),
  mockLoginCrypto: vi.fn(),
  mockFetchAndUnwrapOrgKey: vi.fn(),
  mockInstallCleanupHandler: vi.fn(),
  mockAnnounce: vi.fn(),
  mockHaptic: vi.fn(),
  mockOrgKeyManagerLoad: vi.fn(),
}));

// vi.mock required: @care-y/crypto barrel triggers libsodium WASM
// initialization via getSodium() singleton.
// care-y-ignore-next-line mock-factory-unguarded -- importOriginal would trigger libsodium WASM init; a partial stub cannot satisfy the full crypto export surface
vi.mock("@care-y/crypto", () => ({
  getSodium: vi.fn().mockResolvedValue(undefined),
  generateOrgKeypair: vi.fn(() => ({
    publicKey: new Uint8Array([1, 2, 3]),
    secretKey: new Uint8Array([4, 5, 6]),
  })),
  wrapKey: vi.fn(() => ({
    ephemeralPoint: new Uint8Array([7]),
    nonce: new Uint8Array([8]),
    ciphertext: new Uint8Array([9]),
  })),
  encode: vi.fn((buf: Uint8Array) => btoa(String.fromCharCode(...buf))),
  decode: vi.fn(
    (s: string) => new Uint8Array([...atob(s)].map((c) => c.charCodeAt(0))),
  ),
  toRistrettoPoint: vi.fn((buf: Uint8Array) => buf),
}));

// vi.mock required: tRPC client construction is lazy, but the mock
// controls query/mutation behavior for deterministic test assertions.
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcIndex>()),
  trpc: {
    onboarding: {
      bootstrapAdmin: { mutate: mockBootstrapAdmin },
    },
    keys: {
      uploadOrgPublicKey: { mutate: mockUploadOrgPublicKey },
    },
  },
}));

// vi.mock required: Svelte 5 createContext throws "missing_context" outside
// a live component tree.
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getCryptoBridge: vi.fn(() => ({
    argon2id: vi.fn(),
    oprfBlind: vi.fn(),
    deriveKeys: vi.fn(),
  })),
  getOrgKeyManager: vi.fn(() => ({
    load: mockOrgKeyManagerLoad,
    isLoaded: false,
  })),
}));

vi.mock("$lib/crypto/org-key-ready.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof OrgKeyReady>()),
  setOrgKeyReady: vi.fn(),
}));

vi.mock("$lib/auth/cleanup.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Cleanup>()),
  installCleanupHandler: mockInstallCleanupHandler,
}));

// vi.mock required: register-crypto imports from @care-y/crypto barrel,
// which triggers libsodium WASM init on import.
// care-y-ignore-next-line mock-factory-unguarded -- importOriginal would trigger libsodium WASM init via @care-y/crypto import
vi.mock("$lib/auth/register-crypto.js", () => ({
  registerCrypto: mockRegisterCrypto,
}));

// vi.mock required: login-crypto imports decode from @care-y/crypto,
// which triggers libsodium WASM init on import.
// care-y-ignore-next-line mock-factory-unguarded -- importOriginal would trigger libsodium WASM init via @care-y/crypto import
vi.mock("$lib/auth/login-crypto.js", () => ({
  loginCrypto: mockLoginCrypto,
}));

vi.mock("$lib/auth/crypto-callbacks.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoCallbacks>()),
  buildRegisterCallbacks: vi.fn((_setPhase: unknown, _msgs: unknown) => ({})),
  buildLoginCallbacks: vi.fn((_setPhase: unknown, _msgs: unknown) => ({})),
}));

vi.mock("$lib/auth/crypto-helpers.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoHelpers>()),
  fetchAndUnwrapOrgKey: mockFetchAndUnwrapOrgKey,
}));

vi.mock("$lib/auth/pow-solver.js", async (importOriginal) => ({
  ...(await importOriginal<typeof PowSolver>()),
  solveProofOfWork: vi.fn(),
}));

vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AnnounceMod>()),
  announceToLiveRegion: mockAnnounce,
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof HapticMod>()),
  haptic: mockHaptic,
}));

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastStore>()),
  toastStore: { show: vi.fn() },
}));

vi.mock("./wizard-nav-context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WizardNavContext>()),
  getWizardNavCtx: () => ({ current: undefined }),
}));

// Import after mocks are set up
const { default: SetupAccount } = await import("./SetupAccount.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
});

// ── Helpers ──

const VALID_PASSWORD = "a-secure-password-123";

/** Fill all required form fields with valid values. */
async function fillForm(
  overrides: {
    username?: string;
    displayName?: string;
    password?: string;
    confirm?: string;
  } = {},
): Promise<void> {
  const inputs = document.querySelectorAll("input");
  const usernameInput = inputs[0]!;
  const displayNameInput = inputs[1]!;
  const passwordInput = inputs[2]!;
  const confirmInput = inputs[3]!;

  await fireEvent.input(usernameInput, {
    target: { value: overrides.username ?? "admin" },
  });
  await fireEvent.input(displayNameInput, {
    target: { value: overrides.displayName ?? "Admin User" },
  });
  await fireEvent.input(passwordInput, {
    target: { value: overrides.password ?? VALID_PASSWORD },
  });
  await fireEvent.input(confirmInput, {
    target: { value: overrides.confirm ?? VALID_PASSWORD },
  });
}

/** Submit the form after filling in valid data. */
async function submitValidForm(): Promise<void> {
  await fillForm();
  const form = document.querySelector("form")!;
  await fireEvent.submit(form);
}

/** Set up mocks for a fully successful submission pipeline. */
function stubSuccessfulSubmission(): void {
  mockBootstrapAdmin.mockResolvedValue({ userId: "user-abc" });
  mockRegisterCrypto.mockResolvedValue(undefined);
  mockLoginCrypto.mockResolvedValue({
    volPublic: btoa("vol-public-key"),
    orgPublicKey: btoa("org-public-key"),
  });
  mockUploadOrgPublicKey.mockResolvedValue(undefined);
  mockFetchAndUnwrapOrgKey.mockResolvedValue("unwrapped-org-pub");
}

describe("SetupAccount", () => {
  it("disables submit when required fields are empty", () => {
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });
    const button = screen.getByText(m.onboarding_account_submit());
    expect(button.closest("button")?.hasAttribute("disabled")).toBe(true);
  });

  it("shows password length error for short passwords on submit", async () => {
    const oncomplete = vi.fn();
    render(SetupAccount, {
      props: { oncomplete, setupToken: "test-setup-token" },
    });

    await fillForm({ password: "short", confirm: "short" });

    const form = document.querySelector("form")!;
    await fireEvent.submit(form);

    expect(
      screen.getAllByText(m.onboarding_account_error_password_length()).length,
    ).toBeGreaterThan(0);
    expect(oncomplete).not.toHaveBeenCalled();
  });

  it("shows password mismatch error when passwords differ", async () => {
    const oncomplete = vi.fn();
    render(SetupAccount, {
      props: { oncomplete, setupToken: "test-setup-token" },
    });

    await fillForm({ confirm: "different-password-456" });

    const form = document.querySelector("form")!;
    await fireEvent.submit(form);

    expect(
      screen.getAllByText(m.onboarding_account_error_password_mismatch())
        .length,
    ).toBeGreaterThan(0);
    expect(oncomplete).not.toHaveBeenCalled();
  });

  it("announces validation error to assistive tech", async () => {
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await fillForm({ password: "short", confirm: "short" });
    const form = document.querySelector("form")!;
    await fireEvent.submit(form);

    expect(mockAnnounce).toHaveBeenCalledWith(
      "assertive",
      m.onboarding_account_error_password_length(),
    );
  });

  it("calls oncomplete with userId and volPublic after successful submit", async () => {
    const oncomplete = vi.fn();
    stubSuccessfulSubmission();
    render(SetupAccount, {
      props: { oncomplete, setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      expect(oncomplete).toHaveBeenCalledWith({
        userId: "user-abc",
        adminVolPublic: btoa("vol-public-key"),
      });
    });
  });

  it("fires haptic feedback on successful submit", async () => {
    stubSuccessfulSubmission();
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      expect(mockHaptic).toHaveBeenCalled();
    });
  });

  it("installs cleanup handler after successful submit", async () => {
    stubSuccessfulSubmission();
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      expect(mockInstallCleanupHandler).toHaveBeenCalled();
    });
  });

  it("loads org key from unwrapped value when fetchAndUnwrapOrgKey returns a value", async () => {
    stubSuccessfulSubmission();
    mockFetchAndUnwrapOrgKey.mockResolvedValue("unwrapped-pub-key");
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      expect(mockOrgKeyManagerLoad).toHaveBeenCalledWith("unwrapped-pub-key");
    });
  });

  it("falls back to orgPublicKeyB64 when fetchAndUnwrapOrgKey returns null", async () => {
    stubSuccessfulSubmission();
    mockFetchAndUnwrapOrgKey.mockResolvedValue(null);
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      // orgKeyManager.load receives the base64-encoded org public key
      // generated by generateOrgKeypair, passed through encode().
      expect(mockOrgKeyManagerLoad).toHaveBeenCalled();
      const loadArg = mockOrgKeyManagerLoad.mock.calls[0]?.[0] as string;
      expect(typeof loadArg).toBe("string");
    });
  });

  it("shows ORG_ALREADY_SETUP error when bootstrapAdmin returns that code", async () => {
    mockBootstrapAdmin.mockRejectedValue(
      new Error(ErrorCode.ORG_ALREADY_SETUP),
    );
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      expect(screen.getByText(m.onboarding_setup_already_done())).toBeTruthy();
    });
  });

  it("shows INVALID_SETUP_TOKEN error when bootstrapAdmin returns that code", async () => {
    mockBootstrapAdmin.mockRejectedValue(
      new Error(ErrorCode.INVALID_SETUP_TOKEN),
    );
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      expect(screen.getByText(m.onboarding_setup_invalid_link())).toBeTruthy();
    });
  });

  it("shows BOOTSTRAP_RATE_LIMITED error when bootstrapAdmin returns that code", async () => {
    mockBootstrapAdmin.mockRejectedValue(
      new Error(ErrorCode.BOOTSTRAP_RATE_LIMITED),
    );
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      expect(screen.getByText(m.error_bootstrap_rate_limited())).toBeTruthy();
    });
  });

  it("shows ACCOUNT_ALREADY_EXISTS error when bootstrapAdmin returns that code", async () => {
    mockBootstrapAdmin.mockRejectedValue(
      new Error(ErrorCode.ACCOUNT_ALREADY_EXISTS),
    );
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      expect(screen.getByText(m.error_account_already_exists())).toBeTruthy();
    });
  });

  it("shows generic error for unknown error codes", async () => {
    mockBootstrapAdmin.mockRejectedValue(new Error("UNEXPECTED_ERROR_CODE"));
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      expect(
        screen.getByText(m.onboarding_account_error_generic()),
      ).toBeTruthy();
    });
  });

  it("handles non-Error thrown values by converting to string", async () => {
    mockBootstrapAdmin.mockRejectedValue("raw-string-error");
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      // String error falls through all ErrorCode checks to generic
      expect(
        screen.getByText(m.onboarding_account_error_generic()),
      ).toBeTruthy();
    });
  });

  it("announces error to assistive tech on submission failure", async () => {
    mockBootstrapAdmin.mockRejectedValue(
      new Error(ErrorCode.ORG_ALREADY_SETUP),
    );
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      expect(mockAnnounce).toHaveBeenCalledWith(
        "assertive",
        m.onboarding_setup_already_done(),
      );
    });
  });

  it("shows error when registerCrypto fails", async () => {
    mockBootstrapAdmin.mockResolvedValue({ userId: "user-abc" });
    mockRegisterCrypto.mockRejectedValue(new Error("REGISTER_FAILED"));
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      expect(
        screen.getByText(m.onboarding_account_error_generic()),
      ).toBeTruthy();
    });
  });

  it("shows error when loginCrypto fails", async () => {
    mockBootstrapAdmin.mockResolvedValue({ userId: "user-abc" });
    mockRegisterCrypto.mockResolvedValue(undefined);
    mockLoginCrypto.mockRejectedValue(new Error("LOGIN_FAILED"));
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      expect(
        screen.getByText(m.onboarding_account_error_generic()),
      ).toBeTruthy();
    });
  });

  it("shows submitting state with KeyDerivation during the async pipeline", async () => {
    // Make bootstrapAdmin hang so we can observe the submitting state
    let resolveBootstrap: ((v: { userId: string }) => void) | undefined;
    mockBootstrapAdmin.mockReturnValue(
      new Promise<{ userId: string }>((resolve) => {
        resolveBootstrap = resolve;
      }),
    );

    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await submitValidForm();

    // While submitting, the form is hidden and the derivation UI shows
    await vi.waitFor(() => {
      expect(screen.queryByText(m.onboarding_account_heading())).toBeNull();
      expect(screen.getByText(m.onboarding_account_deriving())).toBeTruthy();
    });

    // Clean up pending promise
    resolveBootstrap?.({ userId: "user-abc" });
  });

  it("does not call oncomplete on failure", async () => {
    const oncomplete = vi.fn();
    mockBootstrapAdmin.mockRejectedValue(new Error("FAIL"));
    render(SetupAccount, {
      props: { oncomplete, setupToken: "test-setup-token" },
    });

    await submitValidForm();

    await vi.waitFor(() => {
      expect(
        screen.getByText(m.onboarding_account_error_generic()),
      ).toBeTruthy();
    });
    expect(oncomplete).not.toHaveBeenCalled();
  });

  it("shows error block with role=alert when error state is non-empty", async () => {
    render(SetupAccount, {
      props: { oncomplete: vi.fn(), setupToken: "test-setup-token" },
    });

    await fillForm({ password: "short", confirm: "short" });
    const form = document.querySelector("form")!;
    await fireEvent.submit(form);

    const alert = document.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
    expect(alert?.textContent).toContain(
      m.onboarding_account_error_password_length(),
    );
  });
});
