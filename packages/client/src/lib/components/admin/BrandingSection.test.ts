// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type { BrandingData } from "@care-y/shared";

const { mockSaveBrandingField, mockToastShow, mockHaptic } = vi.hoisted(() => ({
  mockSaveBrandingField: vi.fn().mockResolvedValue(undefined),
  mockToastShow: vi.fn(),
  mockHaptic: vi.fn(),
}));

let mockBrandingData: BrandingData | undefined;
let mockIsLoading: boolean;

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_branding_card_logo_label: () => "Logo",
  admin_branding_card_no_logo: () => "No logo uploaded",
  admin_branding_card_color_label: () => "Organization colors",
  admin_branding_card_name_label: () => "Organization name",
  admin_branding_card_text_label: () => "Client welcome text",
  admin_branding_card_no_text: () => "No welcome text set",
  admin_branding_edit_button: () => "Edit branding",
  admin_branding_sheet_title: () => "Edit Branding",
  admin_branding_logo_hint: () =>
    "Appears in the app and on client-facing pages.",
  admin_branding_logo_accept: () =>
    "PNG, JPEG, or SVG. Resized to 512px automatically.",
  admin_branding_logo_change: () => "Change logo",
  admin_branding_logo_too_large: () =>
    "Image could not be compressed to fit. Try a simpler image.",
  admin_branding_logo_invalid_type: () =>
    "Only PNG, JPEG, and SVG images are accepted.",
  admin_branding_color_hint: () => "Used for buttons and highlights.",
  admin_branding_accent_label: () => "Accent color",
  admin_branding_accent_hint: () =>
    "Used for icons, badges, and secondary highlights.",
  admin_branding_color_preview: () => "Preview",
  admin_branding_color_primary: () => "Primary",
  admin_branding_color_accent: () => "Accent",
  admin_branding_color_hover: () => "Hover",
  admin_branding_color_active: () => "Active",
  admin_branding_color_contrast_note: () =>
    "Final colors may differ slightly. The app adjusts them automatically for readability and contrast.",
  admin_branding_preview_buttons: () => "Buttons",
  admin_branding_preview_links: () => "Links",
  admin_branding_preview_icons: () => "Icons",
  admin_branding_preview_badges: () => "Badges",
  admin_branding_name_hint: () => "Shown to volunteers and clients.",
  admin_branding_text_hint: () => "Shown on the client intake form.",
  admin_branding_save: () => "Save changes",
  admin_branding_saved: () => "Branding updated",
  admin_branding_error: () => "Could not save branding. Try again.",
  admin_branding_no_changes: () => "No changes to save",
  admin_branding_overview_label: () => "Branding overview",
  admin_branding_color_swatch_label: ({ color }: { color: string }) =>
    `Color swatch ${color}`,
  admin_branding_accent_swatch_label: ({ color }: { color: string }) =>
    `Accent swatch ${color}`,
  admin_branding_new_logo_alt: () => "New logo preview",
  common_loading: () => "Loading",
  error_generic: () => "Something went wrong",
  decrypt_placeholder_loading: () => "Decrypting...",
  decrypt_placeholder_denied: () => "Access denied",
  error_decryption_failed: () => "Decryption failed",
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    branding: {
      getBranding: { query: vi.fn() },
      saveBrandingField: { mutate: mockSaveBrandingField },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    return {
      get isLoading() {
        return mockIsLoading;
      },
      get isError() {
        return false;
      },
      error: null,
      get data() {
        return mockBrandingData;
      },
      refetch: vi.fn(),
    };
  },
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as (() => void) | undefined;
    const onError = opts.onError as (() => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(input: unknown) {
        mutationFn(input).then(
          () => onSuccess?.(),
          () => onError?.(),
        );
      },
    };
  },
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: mockHaptic }));
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgDecryptCache: () => ({
    decrypt: (_id: string, encrypted: unknown) => {
      if (encrypted instanceof Uint8Array) {
        return new TextDecoder().decode(encrypted);
      }
      return typeof encrypted === "string" ? encrypted : null;
    },
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
    delete: vi.fn(),
  }),
  getOrgKeyManager: () => ({
    isLoaded: true,
    encrypt: (bytes: Uint8Array) => bytes,
    decrypt: (bytes: Uint8Array) => bytes,
    getPublicKey: () => new Uint8Array(32),
  }),
}));

vi.mock("$lib/branding/color-utils.js", () => ({
  isValidHexColor: (c: string) => /^#[0-9a-fA-F]{6}$/.test(c),
}));

vi.mock("$lib/branding/konsta-palette.js", () => ({
  applyKonstaPalette: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("$lib/utils/buffer-encoding.js", () => ({
  uint8ArrayToBase64: (bytes: Uint8Array) =>
    btoa(String.fromCharCode(...bytes)),
  base64ToUint8Array: (encoded: string) =>
    Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)),
}));

vi.mock("@care-y/crypto", () => ({
  encryptClientBranding: (payload: Uint8Array) => payload,
}));

vi.mock("$lib/crypto/async-decrypt-cache.js", () => ({
  DECRYPT_ERROR_SENTINEL: "\0DECRYPT_FAILED",
  isDecryptError: (v: unknown) => v === "\0DECRYPT_FAILED",
}));

vi.mock("$lib/crypto/decrypt-result.js", () => ({
  LOADING: Object.freeze({ status: "loading" }),
  ERROR: Object.freeze({ status: "error" }),
  DENIED: Object.freeze({ status: "denied" }),
}));

// IntersectionObserver stub for DecryptPlaceholder
vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: () => void;
    disconnect: () => void;
    unobserve: () => void;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

// OffscreenCanvas + createImageBitmap stubs for logo rasterization
// Configurable output size lets tests control whether the processed image
// passes or exceeds the 512KB limit.
let canvasOutputBytes = 1024;

vi.stubGlobal(
  "OffscreenCanvas",
  vi.fn(function (this: {
    getContext: () => {
      drawImage: () => void;
    };
    convertToBlob: () => Promise<Blob>;
  }) {
    this.getContext = () => ({ drawImage: vi.fn() });
    this.convertToBlob = () =>
      Promise.resolve(new Blob([new ArrayBuffer(canvasOutputBytes)]));
  }),
);

vi.stubGlobal(
  "createImageBitmap",
  vi.fn(() => Promise.resolve({ width: 200, height: 200, close: vi.fn() })),
);

vi.mock("$lib/shell/ShellSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/QueryError.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// --- Mock shell context ---
vi.mock("$lib/shell/context.js", () => ({
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

import BrandingSection from "./BrandingSection.svelte";
import { DEFAULT_PRIMARY, DEFAULT_ACCENT } from "$lib/branding/index.js";

const LOADED_DATA: BrandingData = {
  encryptedName: btoa("Safe Harbor Hotline"),
  encryptedLogo: null,
  encryptedPrimaryColor: btoa(DEFAULT_PRIMARY),
  encryptedAccentColor: btoa(DEFAULT_ACCENT),
  encryptedClientText: btoa("We provide confidential support."),
  clientEncryptedBranding: null,
  hasIcons: false,
  iconVersion: null,
};

function renderWithData(data?: Partial<BrandingData>): void {
  mockIsLoading = false;
  mockBrandingData = { ...LOADED_DATA, ...data };
  render(BrandingSection);
}

describe("BrandingSection", () => {
  beforeEach(() => {
    mockBrandingData = undefined;
    mockIsLoading = true;
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("shows loading state when query is pending", () => {
    render(BrandingSection);
    const region = document.querySelector(".branding-inner");
    expect(region).toBeTruthy();
  });

  it("displays edit button in card view", () => {
    renderWithData();
    expect(screen.getByRole("button", { name: /edit branding/i })).toBeTruthy();
  });

  it("renders color swatch with matching aria-label", () => {
    renderWithData({ encryptedPrimaryColor: btoa("#e11d48") });
    const swatch = screen.getByRole("img", {
      name: /color swatch #e11d48/i,
    });
    expect(swatch).toBeTruthy();
    expect(swatch.style.background).toBe("rgb(225, 29, 72)");
  });

  it("shows empty state when no logo or client text", () => {
    renderWithData({
      encryptedName: null,
      encryptedLogo: null,
      encryptedPrimaryColor: null,
      encryptedClientText: null,
    });
    expect(screen.getByText("No logo uploaded")).toBeTruthy();
    expect(screen.getByText("No welcome text set")).toBeTruthy();
  });

  it("renders sheet heading and save button", () => {
    renderWithData();
    expect(
      screen.getByRole("heading", { name: /edit branding/i }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeTruthy();
  });

  it("renders color picker with accessible label", () => {
    renderWithData();
    const picker = document.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement;
    expect(picker).toBeTruthy();
    expect(picker.getAttribute("aria-label")).toBe("Primary");
  });

  it("rejects logo when processed image still exceeds 512KB", async () => {
    canvasOutputBytes = 600 * 1024;
    renderWithData();
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File([new ArrayBuffer(1024)], "huge.png", {
      type: "image/png",
    });
    await fireEvent.change(fileInput, { target: { files: [file] } });

    await vi.waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
    });
    expect(
      screen.getByText(
        "Image could not be compressed to fit. Try a simpler image.",
      ),
    ).toBeTruthy();
    canvasOutputBytes = 1024;
  });

  it("accepts logo after canvas processing shrinks it under limit", async () => {
    canvasOutputBytes = 1024;
    renderWithData();
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File([new ArrayBuffer(800 * 1024)], "big.png", {
      type: "image/png",
    });
    await fireEvent.change(fileInput, { target: { files: [file] } });

    await vi.waitFor(() => {
      const preview = document.querySelector(
        'img[alt="New logo preview"]',
      ) as HTMLImageElement | null;
      expect(preview).toBeTruthy();
    });
    expect(document.querySelector('[role="alert"]')).toBeNull();
  });

  it("rejects non-image file types", async () => {
    renderWithData();
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const textFile = new File(["hello"], "test.txt", { type: "text/plain" });
    await fireEvent.change(fileInput, { target: { files: [textFile] } });

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(
      screen.getByText("Only PNG, JPEG, and SVG images are accepted."),
    ).toBeTruthy();
  });

  it("calls saveBrandingField with encrypted data and clientEncryptedBranding", async () => {
    renderWithData({ encryptedName: btoa("Old Name") });

    const editBtn = screen.getByRole("button", { name: /edit branding/i });
    await fireEvent.click(editBtn);

    const nameInputs = document.querySelectorAll('input[type="text"]');
    const nameInput = nameInputs[0] as HTMLInputElement;
    await fireEvent.change(nameInput, { target: { value: "New Name" } });

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(mockSaveBrandingField).toHaveBeenCalled();
    });

    const call = mockSaveBrandingField.mock.calls[0]?.[0] as {
      field: string;
      encryptedValue: string;
      clientEncryptedBranding?: string;
    };
    expect(call.field).toBe("name");
    expect(call.encryptedValue).toBeTruthy();
    expect(call.clientEncryptedBranding).toBeTruthy();
  });

  it("shows toast and haptic on successful save", async () => {
    renderWithData({ encryptedName: btoa("Old Name") });

    const editBtn = screen.getByRole("button", { name: /edit branding/i });
    await fireEvent.click(editBtn);

    const nameInputs = document.querySelectorAll('input[type="text"]');
    const nameInput = nameInputs[0] as HTMLInputElement;
    await fireEvent.change(nameInput, {
      target: { value: "Updated Name" },
    });

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Branding updated");
    });
    expect(mockHaptic).toHaveBeenCalled();
  });

  it("renders helper text for all sheet fields", () => {
    renderWithData();
    expect(
      screen.getByText("Appears in the app and on client-facing pages."),
    ).toBeTruthy();
    expect(screen.getByText("Used for buttons and highlights.")).toBeTruthy();
    expect(screen.getByText("Shown to volunteers and clients.")).toBeTruthy();
    expect(screen.getByText("Shown on the client intake form.")).toBeTruthy();
  });
});
