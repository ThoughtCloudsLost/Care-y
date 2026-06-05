// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

// --- Hoisted mock fns ---
const {
  mockRegister,
  mockInvalidateQueries,
  mockToastShow,
  mockBootstrapCrypto,
} = vi.hoisted(() => ({
  mockRegister: vi.fn().mockResolvedValue({ user: { id: "u1" } }),
  mockInvalidateQueries: vi.fn(),
  mockToastShow: vi.fn(),
  mockBootstrapCrypto: vi.fn().mockResolvedValue(undefined),
}));

let mockOrgKeyLoaded = true;

// --- Mock i18n ---
vi.mock("$lib/paraglide/messages.js", () => ({
  admin_invite_title: () => "Invite User",
  admin_invite_cancel: () => "Cancel",
  admin_invite_send: () => "Create Account",
  admin_invite_identifier_hint: () => "Auto-generated.",
  user_field_login_username_label: () => "Login Username",
  user_field_login_username_pii_warning: () =>
    "Identifiers are stored with weaker encryption",
  user_field_display_name_label: () => "Display Name",
  user_field_display_name_e2e_hint: () => "End-to-end encrypted.",
  admin_invite_password_label: () => "Temporary Password",
  admin_invite_password_hint: () => "Share securely.",
  admin_invite_password_too_short: () =>
    "Password must be at least 16 characters",
  admin_invite_confirm_password: () => "Confirm Password",
  admin_invite_password_mismatch: () => "Passwords do not match",
  admin_invite_role_label: () => "Role",
  admin_invite_no_org_key: () => "Organization key not loaded.",
  admin_invite_success: () => "Account created",
  admin_invite_credential_title: () => "Account Created",
  admin_invite_credential_instructions: () =>
    "Share these credentials securely.",
  admin_invite_credential_identifier: () => "Identifier",
  admin_invite_credential_password: () => "Password",
  admin_invite_credential_show: () => "Show",
  admin_invite_credential_hide: () => "Hide",
  admin_invite_credential_done: () => "Done",
  admin_role_volunteer: () => "Volunteer",
  admin_role_manager: () => "Manager",
  admin_role_admin: () => "Admin",
  common_loading: () => "Loading",
  error_generic: () => "Something went wrong",
  admin_invite_crypto_deriving: () => "Generating encryption keys...",
  admin_invite_crypto_wrapping: () => "Distributing organization key...",
  admin_invite_crypto_complete: () => "Keys distributed successfully",
  admin_invite_crypto_error: () => "Key distribution failed",
  shell_close: () => "Close",
  password_show: () => "Show password",
  password_hide: () => "Hide password",
  password_strength_too_short: ({ min }: { min: number }) =>
    `Too short (minimum ${min} characters)`,
  password_strength_acceptable: () => "Acceptable",
  password_strength_good: () => "Good",
  password_strength_strong: () => "Strong",
  password_common_pattern: () => "Predictable pattern.",
}));

// --- Mock crypto context ---
vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: () => ({
    get isLoaded() {
      return mockOrgKeyLoaded;
    },
    encrypt: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
    encryptText: vi.fn().mockResolvedValue("encrypted-text"),
  }),
  getCryptoBridge: () => ({
    exportOrgSecretKey: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
  }),
}));

// --- Mock admin bootstrap crypto ---
vi.mock("$lib/auth/admin-bootstrap-crypto.js", () => ({
  adminBootstrapUserCrypto: mockBootstrapCrypto,
}));

// --- Mock TanStack Query ---
vi.mock("@tanstack/svelte-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
}));

// --- Mock tRPC ---
vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    auth: {
      register: { mutate: mockRegister },
    },
  },
}));

// --- Mock toast store ---
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));

// --- Mock haptic ---
vi.mock("$lib/utils/haptic.js", () => ({
  haptic: vi.fn(),
}));

// --- Mock announce ---
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));

// --- Mock ShellPopup: pass-through ---
vi.mock("$lib/shell/ShellPopup.svelte", async () => ({
  default: (await import("../tickets/test-helpers/PassthroughShell.svelte"))
    .default,
}));

// --- Mock shell context ---
vi.mock("$lib/shell/context.js", () => ({
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

import { RoleId } from "@care-y/shared";
import InviteUser from "./InviteUser.svelte";

function getInputs(): {
  identifier: HTMLInputElement;
  displayName: HTMLInputElement;
  password: HTMLInputElement;
  confirmPassword: HTMLInputElement;
} {
  const inputs = document.querySelectorAll<HTMLInputElement>(
    ".k-list-input input",
  );
  if (!inputs[0] || !inputs[1] || !inputs[2] || !inputs[3]) {
    throw new Error("Expected 4 inputs in InviteUser form");
  }
  return {
    identifier: inputs[0],
    displayName: inputs[1],
    password: inputs[2],
    confirmPassword: inputs[3],
  };
}

describe("InviteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrgKeyLoaded = true;
  });

  afterEach(cleanup);

  it("renders with a pre-filled random identifier", { timeout: 15_000 }, () => {
    render(InviteUser, { opened: true, ondismiss: vi.fn() });
    const { identifier } = getInputs();
    expect(identifier.value).toMatch(/^vol-/);
  });

  it("shows PII warning when identifier looks like email", async () => {
    render(InviteUser, { opened: true, ondismiss: vi.fn() });
    const { identifier } = getInputs();
    await fireEvent.input(identifier, {
      target: { value: "user@example.com" },
    });
    expect(screen.getByText(/stored with weaker encryption/)).toBeTruthy();
  });

  it("always shows PII warning regardless of identifier", () => {
    render(InviteUser, { opened: true, ondismiss: vi.fn() });
    expect(screen.getByText(/stored with weaker encryption/)).toBeTruthy();
  });

  it("shows org key warning when org key not loaded", () => {
    mockOrgKeyLoaded = false;
    render(InviteUser, { opened: true, ondismiss: vi.fn() });
    expect(screen.getByText("Organization key not loaded.")).toBeTruthy();
  });

  it("disables inputs when org key not loaded", () => {
    mockOrgKeyLoaded = false;
    render(InviteUser, { opened: true, ondismiss: vi.fn() });
    const inputs = document.querySelectorAll<HTMLInputElement>(
      ".k-list-input input",
    );
    for (const input of inputs) {
      expect(input.disabled).toBe(true);
    }
  });

  it("renders role segmented with Volunteer, Manager, Admin", () => {
    render(InviteUser, { opened: true, ondismiss: vi.fn() });
    expect(screen.getByText("Volunteer")).toBeTruthy();
    expect(screen.getByText("Manager")).toBeTruthy();
    expect(screen.getByText("Admin")).toBeTruthy();
  });

  it("shows password too short hint when password under 16 chars", async () => {
    render(InviteUser, { opened: true, ondismiss: vi.fn() });
    const { password } = getInputs();
    await fireEvent.input(password, { target: { value: "short" } });
    expect(
      screen.getByText("Password must be at least 16 characters"),
    ).toBeTruthy();
  });

  it("calls register mutation on submit with correct params", async () => {
    render(InviteUser, { opened: true, ondismiss: vi.fn() });
    const { identifier, displayName, password, confirmPassword } = getInputs();

    await fireEvent.input(identifier, { target: { value: "vol-test12" } });
    await fireEvent.input(displayName, {
      target: { value: "Test Volunteer" },
    });
    await fireEvent.input(password, {
      target: { value: "averylongpassword16" },
    });
    await fireEvent.input(confirmPassword, {
      target: { value: "averylongpassword16" },
    });

    const submitButton = screen.getByText("Create Account");
    await fireEvent.click(submitButton);

    expect(mockRegister).toHaveBeenCalledWith({
      identifier: "vol-test12",
      password: "averylongpassword16",
      displayName: "Test Volunteer",
      roleId: RoleId.VOLUNTEER,
    });
  });

  it("shows credential confirmation after successful creation", async () => {
    render(InviteUser, { opened: true, ondismiss: vi.fn() });
    const { identifier, displayName, password, confirmPassword } = getInputs();

    await fireEvent.input(identifier, { target: { value: "vol-abc123" } });
    await fireEvent.input(displayName, { target: { value: "New Person" } });
    await fireEvent.input(password, {
      target: { value: "securelongpassword" },
    });
    await fireEvent.input(confirmPassword, {
      target: { value: "securelongpassword" },
    });

    const submitButton = screen.getByText("Create Account");
    await fireEvent.click(submitButton);

    await vi.waitFor(() => {
      expect(screen.getByText("Account Created")).toBeTruthy();
    });

    expect(screen.getByText("vol-abc123")).toBeTruthy();
    expect(screen.getByText("Done")).toBeTruthy();
  });
});
