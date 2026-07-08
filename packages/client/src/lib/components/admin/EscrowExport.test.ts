// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const { mockToastShow, mockAnnounce, mockHaptic } = vi.hoisted(() => ({
  mockToastShow: vi.fn(),
  mockAnnounce: vi.fn(),
  mockHaptic: vi.fn(),
}));

let mockOrgKeyLoaded = true;
const mockGetSecretKey = vi.fn(
  () => new Uint8Array(32).fill(0xab) as Uint8Array | null,
);

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_escrow_title: () => "Export Escrow File",
  admin_escrow_step_education_heading: () => "What is an escrow file?",
  admin_escrow_step_education_body: () =>
    "Your organization's data is encrypted.",
  admin_escrow_step_education_scope: () =>
    "Without it, data cannot be recovered.",
  admin_escrow_step_education_analogy: () =>
    "Think of it as a master backup key.",
  admin_escrow_browser_safety_heading: () => "Before you continue",
  admin_escrow_browser_safety_extensions: () => "Disable browser extensions",
  admin_escrow_browser_safety_tabs: () => "Close other tabs",
  admin_escrow_browser_safety_screen: () => "No screen sharing",
  admin_escrow_browser_safety_public: () => "Not a shared computer",
  admin_escrow_step_passphrase_heading: () => "Create a passphrase",
  admin_escrow_passphrase_label: () => "Passphrase",
  admin_escrow_confirm_label: () => "Confirm passphrase",
  admin_escrow_passphrase_guidance: () => "Use a long phrase.",
  admin_escrow_passphrase_mismatch: () => "Passphrases don't match",
  password_show: () => "Show password",
  password_hide: () => "Hide password",
  password_strength_too_short: ({ min }: { min: number }) =>
    `Too short (minimum ${min} characters)`,
  password_strength_acceptable: () => "Acceptable",
  password_strength_good: () => "Good",
  password_strength_strong: () => "Strong",
  password_common_pattern: () => "Predictable pattern.",
  admin_escrow_export_button: () => "Create Escrow File",
  admin_escrow_exporting: () => "Creating escrow file...",
  admin_escrow_no_org_key: () => "Organization key not loaded.",
  admin_escrow_step_storage_heading: () => "Store this file safely",
  admin_escrow_storage_usb: () => "Save to USB",
  admin_escrow_storage_locked: () => "Locked location",
  admin_escrow_storage_separate: () => "Passphrase separate",
  admin_escrow_storage_copy: () => "Second person",
  admin_escrow_storage_test: () => "Test periodically",
  admin_escrow_done: () => "Done",
  admin_escrow_success: () => "Escrow file exported",
  admin_escrow_error: () => "Export failed",
  admin_escrow_continue: () => "Continue",
  common_back: () => "Back",
  common_cancel: () => "Cancel",
  common_next: () => "Next",
  onboarding_escrow_hash_label: () => "Verification code",
  onboarding_escrow_hash_hint: () => "This code is unique to the file.",
  onboarding_escrow_https_warning: () => "HTTPS required for secure export.",
  onboarding_escrow_download_again: () => "Download again",
  onboarding_escrow_download_again_title: () => "Download Again?",
  onboarding_escrow_download_again_body: () =>
    "The file will be regenerated with the same passphrase.",
  onboarding_escrow_download_again_confirm: () => "Download",
}));

vi.mock("$lib/terminology/with-terms.js", () => ({
  withTerms: () => ({}),
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: () => ({
    get isLoaded() {
      return mockOrgKeyLoaded;
    },
    getSecretKey: mockGetSecretKey,
  }),
}));

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));

vi.mock("$lib/utils/haptic.js", () => ({
  haptic: mockHaptic,
}));

vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: mockAnnounce,
}));

vi.mock("$lib/shell/ShellPopup.svelte", async () => ({
  default: (await import("../tickets/test-helpers/PassthroughShell.svelte"))
    .default,
}));

const mockMemzero = vi.fn();
vi.mock("@care-y/crypto", () => ({
  encryptWithPassphrase: () => ({
    salt: new Uint8Array(16),
    nonce: new Uint8Array(24),
    ciphertext: new Uint8Array(48),
  }),
  ARGON2_ESCROW_PARAMS: {
    memoryKiB: 262144,
    iterations: 4,
  },
  requireSodium: () => ({ memzero: mockMemzero }),
}));

vi.mock("$lib/utils/buffer-encoding.js", () => ({
  uint8ArrayToBase64: (bytes: Uint8Array) => {
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  },
}));

vi.mock("$lib/utils/passphrase-strength.js", () => ({
  assessPassphraseStrength: (p: string) => {
    if (p.length < 20) return "too-short";
    if (p.length < 30) return "acceptable";
    if (p.length < 40) return "good";
    return "strong";
  },
  looksLikeCommonPattern: (p: string) => {
    if (new Set(p).size === 1) return true;
    if (/^[0-9]+$/.test(p) && p.length < 30) return true;
    return false;
  },
}));

import EscrowExport from "./EscrowExport.svelte";

describe("EscrowExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrgKeyLoaded = true;
    mockGetSecretKey.mockReturnValue(new Uint8Array(32).fill(0xab));

    globalThis.URL.createObjectURL = vi.fn(() => "blob:test");
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  afterEach(cleanup);

  it("shows education step initially when opened", () => {
    const { component } = render(EscrowExport);
    component.open();
    expect(
      screen.getByText("Your organization's data is encrypted."),
    ).toBeTruthy();
    expect(screen.getByText("Before you continue")).toBeTruthy();
  });

  it("shows org key warning when key is not loaded", () => {
    mockOrgKeyLoaded = false;
    const { component } = render(EscrowExport);
    component.open();
    expect(screen.getByText("Organization key not loaded.")).toBeTruthy();
  });

  it("disables continue button when org key is not loaded", () => {
    mockOrgKeyLoaded = false;
    const { component } = render(EscrowExport);
    component.open();
    const nextBtn = screen.getByText("Next");
    expect(nextBtn.closest("button")?.hasAttribute("disabled")).toBeTruthy();
  });

  it("advances to passphrase step on continue", async () => {
    const { component } = render(EscrowExport);
    component.open();

    await fireEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Create a passphrase")).toBeTruthy();
    expect(screen.getByText("Use a long phrase.")).toBeTruthy();
  });

  it("shows strength meter when typing passphrase", async () => {
    const { component } = render(EscrowExport);
    component.open();
    await fireEvent.click(screen.getByText("Next"));

    const inputs = screen.getAllByDisplayValue("");
    const passphraseInput = inputs[0]!;
    await fireEvent.input(passphraseInput, {
      target: { value: "short" },
    });

    expect(screen.getByText("Too short (minimum 20 characters)")).toBeTruthy();
  });

  it("shows acceptable strength for 20+ char passphrase", async () => {
    const { component } = render(EscrowExport);
    component.open();
    await fireEvent.click(screen.getByText("Next"));

    const inputs = screen.getAllByDisplayValue("");
    const passphraseInput = inputs[0]!;
    await fireEvent.input(passphraseInput, {
      target: { value: "morning river quiet lantern" },
    });

    expect(screen.getByText("Acceptable")).toBeTruthy();
  });

  it("shows mismatch warning when confirm differs", async () => {
    const { component } = render(EscrowExport);
    component.open();
    await fireEvent.click(screen.getByText("Next"));

    const inputs = screen.getAllByDisplayValue("");
    await fireEvent.input(inputs[0]!, {
      target: { value: "morning river quiet lantern" },
    });
    await fireEvent.input(inputs[1]!, {
      target: { value: "different" },
    });

    expect(screen.getByText("Passphrases don't match")).toBeTruthy();
  });

  it("triggers file download and advances to step 3 on export", async () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    const { component } = render(EscrowExport);
    component.open();
    await fireEvent.click(screen.getByText("Next"));

    const inputs = screen.getAllByDisplayValue("");
    const phrase = "morning river quiet lantern here";
    await fireEvent.input(inputs[0]!, { target: { value: phrase } });
    await fireEvent.input(inputs[1]!, { target: { value: phrase } });

    await fireEvent.click(screen.getByText("Create Escrow File"));

    await vi.waitFor(() => {
      expect(screen.getByText("Store this file safely")).toBeTruthy();
    });

    expect(clickSpy).toHaveBeenCalled();
    expect(mockHaptic).toHaveBeenCalled();
    expect(mockToastShow).toHaveBeenCalledWith("Escrow file exported");
    clickSpy.mockRestore();
  });

  it("shows storage guidance and hash in step 3", async () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    const { component } = render(EscrowExport);
    component.open();
    await fireEvent.click(screen.getByText("Next"));

    const inputs = screen.getAllByDisplayValue("");
    const phrase = "morning river quiet lantern here";
    await fireEvent.input(inputs[0]!, { target: { value: phrase } });
    await fireEvent.input(inputs[1]!, { target: { value: phrase } });

    await fireEvent.click(screen.getByText("Create Escrow File"));

    await vi.waitFor(() => {
      expect(screen.getByText("Save to USB")).toBeTruthy();
      expect(screen.getByText("Locked location")).toBeTruthy();
      expect(screen.getByText("Passphrase separate")).toBeTruthy();
      expect(screen.getByText("Second person")).toBeTruthy();
      expect(screen.getByText("Test periodically")).toBeTruthy();
      expect(screen.getByText("Verification code")).toBeTruthy();
    });
    clickSpy.mockRestore();
  });

  it("zeros the org secret key copy after export", async () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    const { component } = render(EscrowExport);
    component.open();
    await fireEvent.click(screen.getByText("Next"));

    const inputs = screen.getAllByDisplayValue("");
    const phrase = "morning river quiet lantern here";
    await fireEvent.input(inputs[0]!, { target: { value: phrase } });
    await fireEvent.input(inputs[1]!, { target: { value: phrase } });

    await fireEvent.click(screen.getByText("Create Escrow File"));

    await vi.waitFor(() => {
      expect(mockMemzero).toHaveBeenCalled();
    });
    clickSpy.mockRestore();
  });

  it("shows common pattern warning for repeated characters", async () => {
    const { component } = render(EscrowExport);
    component.open();
    await fireEvent.click(screen.getByText("Next"));

    const inputs = screen.getAllByDisplayValue("");
    await fireEvent.input(inputs[0]!, {
      target: { value: "aaaaaaaaaaaaaaaaaaaa" },
    });

    expect(screen.getByText("Predictable pattern.")).toBeTruthy();
  });
});
