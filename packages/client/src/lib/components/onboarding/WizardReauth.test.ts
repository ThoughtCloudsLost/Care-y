// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import type * as ParaglideRuntime from "$lib/paraglide/runtime.js";

// jsdom doesn't implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

const {
  mockReauthenticate,
  mockTotpVerify,
  mockLoginCrypto,
  mockFetchAndUnwrapOrgKey,
  mockZeroAll,
  mockOrgDecrypt,
  mockOrgKeyLoad,
  mockSetLocale,
} = vi.hoisted(() => ({
  mockReauthenticate: vi.fn(),
  mockTotpVerify: vi.fn(),
  mockLoginCrypto: vi.fn(),
  mockFetchAndUnwrapOrgKey: vi.fn(),
  mockZeroAll: vi.fn(),
  mockOrgDecrypt: vi.fn(),
  mockOrgKeyLoad: vi.fn(),
  mockSetLocale: vi.fn(),
}));

// vi.mock required: $lib/trpc/index.js creates a live tRPC HTTP client at
// import time (testing-reference Section 4, question 2).
vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    onboarding: {
      reauthenticate: { mutate: mockReauthenticate },
    },
    twoFactor: {
      verify: {
        totp: { mutate: mockTotpVerify },
      },
    },
  },
}));

// vi.mock required: getCryptoBridge/getOrgKeyManager use Svelte 5
// createContext, which throws "missing_context" outside a live component
// tree. This per-file override of the test-setup stub exposes the bridge
// methods WizardReauth actually calls (zeroAll, orgDecrypt) plus the org
// key manager's load().
vi.mock("$lib/crypto/context.js", () => ({
  getCryptoBridge: () => ({
    zeroAll: mockZeroAll,
    orgDecrypt: mockOrgDecrypt,
  }),
  getOrgKeyManager: () => ({
    load: mockOrgKeyLoad,
  }),
}));

// vi.mock required: login-crypto imports the @care-y/crypto barrel, which
// triggers libsodium WASM initialization at import time (testing-reference
// Section 4, question 2). The Argon2id/OPRF pipeline also needs a real
// crypto Worker, which jsdom does not provide.
vi.mock("$lib/auth/login-crypto.js", () => ({
  loginCrypto: mockLoginCrypto,
}));

// vi.mock required: the compiled .svelte module consumes
// fetchAndUnwrapOrgKey as a destructured named ESM export, so vi.spyOn on
// the test's namespace object does not intercept the component's binding
// (testing-reference Section 4, question 3).
vi.mock("$lib/auth/crypto-helpers.js", () => ({
  fetchAndUnwrapOrgKey: mockFetchAndUnwrapOrgKey,
}));

// vi.mock required: installCleanupHandler registers window-level
// beforeunload/pagehide listeners guarded by module-global state, which
// would leak across tests in this file (testing-reference Section 4,
// question 2).
vi.mock("$lib/auth/cleanup.js", () => ({
  installCleanupHandler: vi.fn(),
}));

// vi.mock required: haptic calls navigator.vibrate, which jsdom does not
// implement. Same stub as the sibling onboarding tests.
vi.mock("$lib/utils/haptic.js", () => ({
  haptic: vi.fn(),
}));

// vi.mock required (partial): setLocale with { reload: true } calls
// window.location.reload(), which jsdom does not implement (testing-
// reference Section 4, question 2). getLocale/isLocale stay real so the
// locale comparison under test runs against production logic.
vi.mock("$lib/paraglide/runtime.js", async (importOriginal) => {
  const actual = await importOriginal<typeof ParaglideRuntime>();
  return { ...actual, setLocale: mockSetLocale };
});

// Import after mocks are set up
const { default: WizardReauth } = await import("./WizardReauth.svelte");

/** Reauthenticate response for a user with no 2FA enrolled. */
function reauthOk(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    userId: "00000000-1111-4222-8333-444444444444",
    encryptedPreferredLocale: null,
    hasSeenBriefing: false,
    requiresTwoFactor: false,
    ...overrides,
  };
}

function usernameInput(): HTMLElement {
  return screen.getByPlaceholderText(
    m.onboarding_reauth_username_placeholder(),
  );
}

function passwordInput(): HTMLElement {
  return screen.getByLabelText(m.onboarding_account_password());
}

function submitButton(): HTMLElement {
  return screen.getByRole("button", { name: m.onboarding_firstlogin_signin() });
}

async function fillCredentials(
  username = "wizard-admin",
  password = "reauth-test-passphrase-0000",
): Promise<void> {
  await fireEvent.input(usernameInput(), { target: { value: username } });
  await fireEvent.input(passwordInput(), { target: { value: password } });
}

async function submitForm(): Promise<void> {
  const form = document.querySelector("form");
  expect(form).not.toBeNull();
  if (form) {
    await fireEvent.submit(form);
  }
}

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  // Re-prime defaults so per-test overrides never bleed into later tests.
  mockReauthenticate.mockResolvedValue(reauthOk());
  mockTotpVerify.mockResolvedValue({ success: true });
  mockLoginCrypto.mockResolvedValue({
    volPublic: "vol-pub-b64",
    orgPublicKey: "org-pub-b64",
  });
  mockFetchAndUnwrapOrgKey.mockResolvedValue(null);
  mockZeroAll.mockResolvedValue(undefined);
  mockOrgDecrypt.mockResolvedValue("en");
});

describe("WizardReauth", () => {
  it("renders the reauth heading, credential fields, and a disabled submit button", () => {
    render(WizardReauth, { props: { onauthenticated: vi.fn() } });

    expect(screen.getByText(m.onboarding_reauth_heading())).toBeTruthy();
    expect(screen.getByText(m.onboarding_reauth_message())).toBeTruthy();
    expect(usernameInput()).toBeTruthy();
    expect(passwordInput()).toBeTruthy();
    expect(submitButton().hasAttribute("disabled")).toBe(true);
  });

  it("enables submit only when both username and password are filled", async () => {
    render(WizardReauth, { props: { onauthenticated: vi.fn() } });

    await fireEvent.input(usernameInput(), {
      target: { value: "wizard-admin" },
    });
    expect(submitButton().hasAttribute("disabled")).toBe(true);

    await fireEvent.input(passwordInput(), {
      target: { value: "reauth-test-passphrase-0000" },
    });
    expect(submitButton().hasAttribute("disabled")).toBe(false);
  });

  it("submits the entered credentials to the reauthenticate endpoint", async () => {
    render(WizardReauth, { props: { onauthenticated: vi.fn() } });

    await fillCredentials("wizard-admin", "reauth-test-passphrase-0000");
    await submitForm();

    // Payload contract: identifier + password cross the tRPC wire to
    // onboarding.reauthenticate (loginInputSchema).
    await waitFor(() => {
      expect(mockReauthenticate).toHaveBeenCalledWith({
        identifier: "wizard-admin",
        password: "reauth-test-passphrase-0000",
      });
    });
  });

  it("zeroes stale worker keys before reauthenticating", async () => {
    // Security contract: a refresh mid-wizard may leave partial key state
    // in the Worker. It must be zeroed before new keys are derived.
    render(WizardReauth, { props: { onauthenticated: vi.fn() } });

    await fillCredentials();
    await submitForm();

    await waitFor(() => {
      expect(mockZeroAll).toHaveBeenCalled();
    });
  });

  it("disables the fields and submit button while reauthentication is in flight", async () => {
    let resolveReauth: (value: unknown) => void = () => undefined;
    mockReauthenticate.mockReturnValue(
      new Promise((resolve) => {
        resolveReauth = resolve;
      }),
    );
    const onauthenticated = vi.fn();
    render(WizardReauth, { props: { onauthenticated } });

    await fillCredentials();
    // Captured before submit: while the mutation is pending the button
    // renders only a spinner and loses its accessible name.
    const submit = submitButton();
    await submitForm();

    await waitFor(() => {
      expect(usernameInput().hasAttribute("disabled")).toBe(true);
    });
    expect(passwordInput().hasAttribute("disabled")).toBe(true);
    expect(submit.hasAttribute("disabled")).toBe(true);

    resolveReauth(reauthOk());
    await waitFor(() => {
      expect(onauthenticated).toHaveBeenCalled();
    });
  });

  it("shows an invalid-credentials alert when reauthentication fails and re-enables the form", async () => {
    mockReauthenticate.mockRejectedValue(new Error("bad credentials"));
    const onauthenticated = vi.fn();
    render(WizardReauth, { props: { onauthenticated } });

    await fillCredentials();
    await submitForm();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain(m.auth_invalid_credentials());
    expect(onauthenticated).not.toHaveBeenCalled();
    // submitting reset: the still-filled form can be resubmitted
    expect(submitButton().hasAttribute("disabled")).toBe(false);
  });

  it("derives keys, loads the org key, and reports success with the briefing flag", async () => {
    mockReauthenticate.mockResolvedValue(reauthOk({ hasSeenBriefing: true }));
    const onauthenticated = vi.fn();
    render(WizardReauth, { props: { onauthenticated } });

    await fillCredentials();
    await submitForm();

    await waitFor(() => {
      expect(onauthenticated).toHaveBeenCalledWith({ hasSeenBriefing: true });
    });
    expect(mockOrgKeyLoad).toHaveBeenCalledWith("org-pub-b64");
  });

  it("falls back to fetching the wrapped org key when login returns no org public key", async () => {
    mockLoginCrypto.mockResolvedValue({
      volPublic: "vol-pub-b64",
      orgPublicKey: null,
    });
    mockFetchAndUnwrapOrgKey.mockResolvedValue("fallback-org-pub-b64");
    const onauthenticated = vi.fn();
    render(WizardReauth, { props: { onauthenticated } });

    await fillCredentials();
    await submitForm();

    await waitFor(() => {
      expect(onauthenticated).toHaveBeenCalledWith({ hasSeenBriefing: false });
    });
    expect(mockOrgKeyLoad).toHaveBeenCalledWith("fallback-org-pub-b64");
  });

  it("still completes when the org has no keypair yet (org key stays unloaded)", async () => {
    mockLoginCrypto.mockResolvedValue({
      volPublic: "vol-pub-b64",
      orgPublicKey: null,
    });
    mockFetchAndUnwrapOrgKey.mockResolvedValue(null);
    const onauthenticated = vi.fn();
    render(WizardReauth, { props: { onauthenticated } });

    await fillCredentials();
    await submitForm();

    await waitFor(() => {
      expect(onauthenticated).toHaveBeenCalledWith({ hasSeenBriefing: false });
    });
    expect(mockOrgKeyLoad).not.toHaveBeenCalled();
  });

  it("shows a login error and returns to the form when key derivation fails", async () => {
    mockLoginCrypto.mockRejectedValue(new Error("oprf unavailable"));
    const onauthenticated = vi.fn();
    render(WizardReauth, { props: { onauthenticated } });

    await fillCredentials();
    await submitForm();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain(m.auth_login_error());
    expect(onauthenticated).not.toHaveBeenCalled();
    // The credential form is shown again for a retry.
    expect(usernameInput()).toBeTruthy();
  });

  it("switches to the two-factor challenge when reauth requires 2FA", async () => {
    mockReauthenticate.mockResolvedValue(
      reauthOk({ requiresTwoFactor: true, enrolledMethods: ["totp"] }),
    );
    const onauthenticated = vi.fn();
    render(WizardReauth, { props: { onauthenticated } });

    await fillCredentials();
    await submitForm();

    expect(
      await screen.findByText(m.onboarding_reauth_twofa_message()),
    ).toBeTruthy();
    // Single enrolled method auto-selects: the TOTP code form is shown.
    expect(
      screen.getByPlaceholderText(m.twofa_totp_code_placeholder()),
    ).toBeTruthy();
    // The credential form is gone and success has not fired yet.
    expect(
      screen.queryByPlaceholderText(m.onboarding_reauth_username_placeholder()),
    ).toBeNull();
    expect(onauthenticated).not.toHaveBeenCalled();
  });

  it("completes key restore after two-factor verification succeeds", async () => {
    mockReauthenticate.mockResolvedValue(
      reauthOk({
        requiresTwoFactor: true,
        enrolledMethods: ["totp"],
        hasSeenBriefing: true,
      }),
    );
    const onauthenticated = vi.fn();
    render(WizardReauth, { props: { onauthenticated } });

    await fillCredentials();
    await submitForm();

    const codeInput = await screen.findByPlaceholderText(
      m.twofa_totp_code_placeholder(),
    );
    await fireEvent.input(codeInput, { target: { value: "123456" } });
    await submitForm();

    await waitFor(() => {
      expect(onauthenticated).toHaveBeenCalledWith({ hasSeenBriefing: true });
    });
    // Payload contract: the TOTP code crosses the tRPC wire.
    expect(mockTotpVerify).toHaveBeenCalledWith({ code: "123456" });
    expect(mockOrgKeyLoad).toHaveBeenCalledWith("org-pub-b64");
  });

  it("restores the saved locale when it differs from the current one", async () => {
    mockReauthenticate.mockResolvedValue(
      reauthOk({ encryptedPreferredLocale: "sealed-locale-blob-b64" }),
    );
    mockOrgDecrypt.mockResolvedValue("es");
    const onauthenticated = vi.fn();
    render(WizardReauth, { props: { onauthenticated } });

    await fillCredentials();
    await submitForm();

    await waitFor(() => {
      expect(onauthenticated).toHaveBeenCalled();
    });
    expect(mockOrgDecrypt).toHaveBeenCalledWith("sealed-locale-blob-b64");
    expect(mockSetLocale).toHaveBeenCalledWith("es", { reload: true });
  });

  it("keeps the current locale and still completes when locale decrypt fails", async () => {
    mockReauthenticate.mockResolvedValue(
      reauthOk({ encryptedPreferredLocale: "sealed-locale-blob-b64" }),
    );
    mockOrgDecrypt.mockRejectedValue(new Error("wrong key"));
    const onauthenticated = vi.fn();
    render(WizardReauth, { props: { onauthenticated } });

    await fillCredentials();
    await submitForm();

    await waitFor(() => {
      expect(onauthenticated).toHaveBeenCalledWith({ hasSeenBriefing: false });
    });
    expect(mockSetLocale).not.toHaveBeenCalled();
  });
});
