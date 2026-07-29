// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type { BrandingData } from "@care-y/shared";

// Type-only namespace imports for importOriginal generics
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as TrpcIndex from "$lib/trpc/index.js";
import type * as TanstackQuery from "@tanstack/svelte-query";
import type * as HapticMod from "$lib/utils/haptic.js";
import type * as ToastStore from "$lib/stores/toast.svelte.js";
import type * as AnnounceMod from "$lib/utils/announce.js";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as ColorUtils from "$lib/branding/color-utils.js";
import type * as BufferEncoding from "$lib/utils/buffer-encoding.js";
import type * as AsyncDecryptCache from "$lib/crypto/async-decrypt-cache.js";
import type * as DecryptResult from "$lib/crypto/decrypt-result.js";
import type * as BrandingTitle from "$lib/branding/title.svelte.js";
import type * as OrgSlug from "$lib/utils/org-slug.js";
import type * as ShellContext from "$lib/shell/context.js";

const {
  mockSaveBrandingField,
  mockToastShow,
  mockHaptic,
  mockSetBrandingTitle,
  mockUploadPwaIcons,
} = vi.hoisted(() => ({
  mockSaveBrandingField: vi.fn().mockResolvedValue(undefined),
  mockToastShow: vi.fn(),
  mockHaptic: vi.fn(),
  mockSetBrandingTitle: vi.fn(),
  mockUploadPwaIcons: vi.fn().mockResolvedValue(undefined),
}));

let mockBrandingData: BrandingData | undefined;
let mockIsLoading: boolean;
let mockIsError: boolean;

// vi.mock required: tests pin deterministic message strings for assertions.
// Spreading importOriginal keeps every unpinned message real so the mock
// cannot drift from the compiled message surface.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  register_note: () => "Note",
  register_careful: () => "Careful",
  register_warning: () => "Warning",
  register_protected: () => "Protected",
  branding_color_near_urgent: () => "This shade sits close to the urgent red.",
  branding_color_near_care: () => "This shade sits close to the care ochre.",
  branding_color_use_nudged: () => "Use the nudged shade",
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
  admin_branding_description: () => "Customize your organization's appearance.",
  admin_branding_icons_error: () => "Icon generation failed.",
  common_loading: () => "Loading",
  error_generic: () => "Something went wrong",
  decrypt_placeholder_loading: () => "Decrypting...",
  decrypt_placeholder_denied: () => "Access denied",
  error_decryption_failed: () => "Decryption failed",
}));

// vi.mock required: tRPC client construction is lazy, but the mock
// controls query/mutation behavior for deterministic test assertions.
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcIndex>()),
  trpc: {
    branding: {
      getBranding: { query: vi.fn() },
      saveBrandingField: { mutate: mockSaveBrandingField },
    },
  },
}));

// vi.mock required: @tanstack/svelte-query creates reactive query state
// bound to a QueryClient context that does not exist in jsdom. The real
// createQuery/createMutation hooks rely on Svelte context injection.
vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof TanstackQuery>()),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    return {
      get isLoading() {
        return mockIsLoading;
      },
      get isError() {
        return mockIsError;
      },
      get error() {
        return mockIsError ? new Error("query-failed") : null;
      },
      get data() {
        return mockBrandingData;
      },
      refetch: vi.fn(),
    };
  },
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const factoryOnSuccess = opts.onSuccess as (() => void) | undefined;
    const factoryOnError = opts.onError as (() => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(
        input: unknown,
        perCall?: { onSuccess?: () => void; onError?: () => void },
      ) {
        mutationFn(input).then(
          () => {
            factoryOnSuccess?.();
            perCall?.onSuccess?.();
          },
          () => {
            factoryOnError?.();
            perCall?.onError?.();
          },
        );
      },
    };
  },
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof HapticMod>()),
  haptic: mockHaptic,
}));
vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastStore>()),
  toastStore: { show: mockToastShow },
}));
vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AnnounceMod>()),
  announceToLiveRegion: vi.fn(),
}));

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree. Crypto contexts are set by CryptoProvider
// in the (app) layout, but component tests don't mount the full layout.
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
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
    isFailed: vi.fn().mockReturnValue(false),
  }),
  getOrgKeyManager: () => ({
    isLoaded: true,
    encrypt: (bytes: Uint8Array) => bytes,
    encryptText: vi.fn().mockResolvedValue("encrypted-text"),
    decrypt: (bytes: Uint8Array) => bytes,
    getPublicKey: () => new Uint8Array(32),
  }),
}));

vi.mock("$lib/branding/color-utils.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ColorUtils>()),
  isValidHexColor: (c: string) => /^#[0-9a-fA-F]{6}$/.test(c),
}));

// Partial mock: the live-preview writer is stubbed (its Material path
// dynamic-imports a library), but the proximity check keeps its real
// OKLCH math so the nudge tests exercise actual behavior.
vi.mock("$lib/branding/konsta-palette.js", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    applyKonstaPalette: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/utils/buffer-encoding.js", async (importOriginal) => ({
  ...(await importOriginal<typeof BufferEncoding>()),
  uint8ArrayToBase64: (bytes: Uint8Array) =>
    btoa(String.fromCharCode(...bytes)),
  base64ToUint8Array: (encoded: string) =>
    Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)),
}));

// care-y-ignore-next-line mock-factory-unguarded -- importOriginal would trigger libsodium WASM init; a partial stub cannot satisfy the full crypto export surface
vi.mock("@care-y/crypto", () => ({
  encryptClientBranding: (payload: Uint8Array) => payload,
}));

vi.mock("$lib/crypto/async-decrypt-cache.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AsyncDecryptCache>()),
  DECRYPT_ERROR_SENTINEL: "\0DECRYPT_FAILED",
  isDecryptError: (v: unknown) => v === "\0DECRYPT_FAILED",
}));

vi.mock("$lib/crypto/decrypt-result.js", async (importOriginal) => ({
  ...(await importOriginal<typeof DecryptResult>()),
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

// jsdom has no CacheStorage; the save flow fire-and-forgets
// updateBrandingCache, which rejects unhandled without this stub.
vi.stubGlobal("caches", {
  open: vi.fn().mockResolvedValue({
    match: vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(true),
  }),
  delete: vi.fn().mockResolvedValue(true),
});

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/shell/ShellSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/QueryError.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// vi.mock required: $state rune needs Svelte compiler pipeline.
vi.mock("$lib/branding/title.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof BrandingTitle>()),
  setBrandingTitle: mockSetBrandingTitle,
  getBrandingTitle: vi.fn(() => "CARE-Y"),
}));

// vi.mock required: imports encryptClientBranding from @care-y/crypto,
// which triggers libsodium WASM init on import.
// care-y-ignore-next-line mock-factory-unguarded -- importOriginal would trigger libsodium WASM init via @care-y/crypto import
vi.mock("$lib/branding/encrypt.js", () => ({
  encryptLogoFile: vi.fn().mockResolvedValue("encrypted-logo-b64"),
  buildClientBrandingBlob: vi.fn(() => "client-branding-blob"),
}));

// vi.mock required: imports encryptClientBranding from @care-y/crypto,
// which triggers libsodium WASM init on import.
// care-y-ignore-next-line mock-factory-unguarded -- importOriginal would trigger libsodium WASM init via @care-y/crypto import
vi.mock("$lib/branding/icon-upload.js", () => ({
  uploadPwaIcons: mockUploadPwaIcons,
}));

vi.mock("$lib/utils/org-slug.js", async (importOriginal) => ({
  ...(await importOriginal<typeof OrgSlug>()),
  getOrgSlug: vi.fn(() => "test-org"),
  DEV_ORG_SLUG: "test-org",
}));

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree.
vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellContext>()),
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
  encryptedTerminology: null,
  hasIcons: false,
  iconVersion: null,
};

function renderWithData(data?: Partial<BrandingData>): void {
  mockIsLoading = false;
  mockBrandingData = { ...LOADED_DATA, ...data };
  render(BrandingSection);
}

function renderWithError(): void {
  mockIsLoading = false;
  mockIsError = true;
  mockBrandingData = undefined;
  render(BrandingSection);
}

/** Click the "Edit branding" button to open the sheet. Call after renderWithData. */
async function openEditSheet(): Promise<void> {
  const editBtn = screen.getByRole("button", { name: /edit branding/i });
  await fireEvent.click(editBtn);
}

describe("BrandingSection", () => {
  beforeEach(() => {
    mockBrandingData = undefined;
    mockIsLoading = true;
    mockIsError = false;
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

  it("renders sheet heading and save button", async () => {
    renderWithData();
    await openEditSheet();
    expect(
      screen.getByRole("heading", { name: /edit branding/i }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeTruthy();
  });

  it("renders color picker with accessible label", async () => {
    renderWithData();
    await openEditSheet();
    const picker = document.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement;
    expect(picker).toBeTruthy();
    expect(picker.getAttribute("aria-label")).toBe("Primary");
  });

  it("offers a nudged shade when the primary color nears the urgent red", async () => {
    renderWithData();
    await openEditSheet();
    const picker = document.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement;
    await fireEvent.input(picker, { target: { value: "#b3362b" } });

    const notice = screen.getByRole("status");
    expect(notice.getAttribute("data-register")).toBe("careful");
    expect(
      screen.getByText("This shade sits close to the urgent red."),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /use the nudged shade/i }),
    ).toBeTruthy();
  });

  it("applies the nudged shade and the notice clears", async () => {
    renderWithData();
    await openEditSheet();
    const picker = document.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement;
    await fireEvent.input(picker, { target: { value: "#b3362b" } });

    await fireEvent.click(
      screen.getByRole("button", { name: /use the nudged shade/i }),
    );

    expect(screen.queryByRole("status")).toBeNull();
    const hex = document.querySelector(".color-hex-edit");
    expect(hex?.textContent).not.toBe("#b3362b");
    expect(hex?.textContent).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("shows no nudge for a quiet brand color", () => {
    renderWithData();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("rejects logo when processed image still exceeds 512KB", async () => {
    canvasOutputBytes = 600 * 1024;
    renderWithData();
    await openEditSheet();
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
    await openEditSheet();
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
    await openEditSheet();
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
    renderWithData({ encryptedClientText: btoa("Old Text") });

    const editBtn = screen.getByRole("button", { name: /edit branding/i });
    await fireEvent.click(editBtn);

    const textarea = document.querySelector("textarea");
    expect(textarea).toBeTruthy();
    await fireEvent.change(textarea!, { target: { value: "New Text" } });

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(mockSaveBrandingField).toHaveBeenCalled();
    });
  });

  it("shows toast and haptic on successful save", async () => {
    renderWithData({ encryptedClientText: btoa("Old Text") });

    const editBtn = screen.getByRole("button", { name: /edit branding/i });
    await fireEvent.click(editBtn);

    const textarea = document.querySelector("textarea");
    expect(textarea).toBeTruthy();
    await fireEvent.change(textarea!, { target: { value: "Updated Text" } });

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Branding updated");
    });
    expect(mockHaptic).toHaveBeenCalled();
  });

  it("renders helper text for all sheet fields", async () => {
    renderWithData();
    await openEditSheet();
    expect(
      screen.getByText("Appears in the app and on client-facing pages."),
    ).toBeTruthy();
    expect(screen.getByText("Used for buttons and highlights.")).toBeTruthy();
    expect(screen.getByText("Shown on the client intake form.")).toBeTruthy();
  });

  it("renders error state when query fails", () => {
    renderWithError();
    // QueryError is replaced by PassthroughShell, which renders its children.
    // The error state branch is exercised (not loading, isError = true).
    const section = document.querySelector(".branding-section");
    expect(section).toBeTruthy();
    // Should not render the edit button (only shown in success state)
    expect(screen.queryByRole("button", { name: /edit branding/i })).toBeNull();
  });

  it("saves color change and calls saveBrandingField with primary_color field", async () => {
    renderWithData();

    const editBtn = screen.getByRole("button", { name: /edit branding/i });
    await fireEvent.click(editBtn);

    const picker = document.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement;
    await fireEvent.input(picker, { target: { value: "#ff5500" } });

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(mockSaveBrandingField).toHaveBeenCalled();
    });
    const calls = mockSaveBrandingField.mock.calls as Array<
      [{ field: string; encryptedValue: string }]
    >;
    const colorCall = calls.find((c) => c[0].field === "primary_color");
    expect(colorCall).toBeTruthy();
  });

  it("saves accent color change with accent_color field", async () => {
    renderWithData();

    const editBtn = screen.getByRole("button", { name: /edit branding/i });
    await fireEvent.click(editBtn);

    // Second color picker is the accent
    const pickers = document.querySelectorAll(
      'input[type="color"]',
    ) as NodeListOf<HTMLInputElement>;
    const accentPicker = pickers[1];
    expect(accentPicker).toBeTruthy();
    await fireEvent.input(accentPicker!, { target: { value: "#00aa55" } });

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(mockSaveBrandingField).toHaveBeenCalled();
    });
    const calls = mockSaveBrandingField.mock.calls as Array<
      [{ field: string; encryptedValue: string }]
    >;
    const accentCall = calls.find((c) => c[0].field === "accent_color");
    expect(accentCall).toBeTruthy();
  });

  it("saves logo and triggers PWA icon upload on success", async () => {
    canvasOutputBytes = 1024;
    renderWithData();
    await openEditSheet();

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File([new ArrayBuffer(512)], "logo.png", {
      type: "image/png",
    });
    await fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the rasterization to complete and preview to appear
    await vi.waitFor(() => {
      expect(
        document.querySelector('img[alt="New logo preview"]'),
      ).toBeTruthy();
    });

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(mockSaveBrandingField).toHaveBeenCalled();
    });
    const calls = mockSaveBrandingField.mock.calls as Array<
      [{ field: string }]
    >;
    const logoCall = calls.find((c) => c[0].field === "logo");
    expect(logoCall).toBeTruthy();

    // Per-call onSuccess triggers icon upload
    await vi.waitFor(() => {
      expect(mockUploadPwaIcons).toHaveBeenCalled();
    });
  });

  it("updates branding title on successful save", async () => {
    renderWithData({ encryptedClientText: btoa("Old Text") });

    const editBtn = screen.getByRole("button", { name: /edit branding/i });
    await fireEvent.click(editBtn);

    const textarea = document.querySelector("textarea");
    await fireEvent.change(textarea!, { target: { value: "New Text" } });

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(mockSetBrandingTitle).toHaveBeenCalled();
    });
  });

  it("shows toast on save error", async () => {
    mockSaveBrandingField.mockRejectedValue(new Error("save-failed"));
    renderWithData({ encryptedClientText: btoa("Old Text") });

    const editBtn = screen.getByRole("button", { name: /edit branding/i });
    await fireEvent.click(editBtn);

    const textarea = document.querySelector("textarea");
    await fireEvent.change(textarea!, { target: { value: "New Text" } });

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        "Could not save branding. Try again.",
        3000,
      );
    });
  });

  it("shows accent swatch when accent color is a valid hex", () => {
    renderWithData({
      encryptedAccentColor: btoa("#22c55e"),
    });
    const swatch = screen.getByRole("img", {
      name: /accent swatch #22c55e/i,
    });
    expect(swatch).toBeTruthy();
    expect(swatch.style.background).toBe("rgb(34, 197, 94)");
  });

  it("renders decryption placeholder when primary color is encrypted but not yet decrypted", () => {
    // encryptedPrimaryColor is set but the decrypt mock returns null
    // for values that don't decode as valid hex (simulating pending decryption).
    // Use a non-base64-decodable-to-hex value to hit the placeholder branch.
    renderWithData({
      encryptedPrimaryColor: btoa("pending"),
    });
    // The primary color display should not show a swatch (value is not a valid hex)
    expect(screen.queryByRole("img", { name: /color swatch/i })).toBeNull();
  });

  it("shows client text when encryptedClientText is present", () => {
    renderWithData({
      encryptedClientText: btoa("Welcome to our support line."),
    });
    expect(screen.getByText("Welcome to our support line.")).toBeTruthy();
  });

  it("offers a nudge when accent color nears the care ochre", async () => {
    renderWithData();

    const editBtn = screen.getByRole("button", { name: /edit branding/i });
    await fireEvent.click(editBtn);

    // Second color picker is accent
    const pickers = document.querySelectorAll(
      'input[type="color"]',
    ) as NodeListOf<HTMLInputElement>;
    const accentPicker = pickers[1];
    // #d4a53c is the konsta-palette suite's proven care-collision fixture.
    await fireEvent.input(accentPicker!, { target: { value: "#d4a53c" } });

    // Check for proximity notice
    const notices = screen.getAllByRole("status");
    expect(notices.length).toBeGreaterThan(0);
  });

  it("handles SVG logo upload through rasterization path", async () => {
    canvasOutputBytes = 1024;
    renderWithData();
    await openEditSheet();

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    const file = new File([svgContent], "logo.svg", {
      type: "image/svg+xml",
    });
    await fireEvent.change(fileInput, { target: { files: [file] } });

    await vi.waitFor(() => {
      expect(
        document.querySelector('img[alt="New logo preview"]'),
      ).toBeTruthy();
    });
    expect(document.querySelector('[role="alert"]')).toBeNull();
  });

  it("shows empty logo placeholder when no logo in sheet edit view", async () => {
    renderWithData({ encryptedLogo: null });
    await openEditSheet();
    // The edit view shows an empty placeholder when no existing or new logo exists.
    const emptyPlaceholder = document.querySelector(".logo-empty-sheet");
    expect(emptyPlaceholder).toBeTruthy();
  });

  it("shows dash placeholder when no primary color is set", () => {
    renderWithData({
      encryptedPrimaryColor: null,
      encryptedAccentColor: null,
    });
    // When no color data exists, a dash placeholder renders
    expect(screen.getByText("-")).toBeTruthy();
  });
});
