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
import type * as AsyncDecryptCache from "$lib/crypto/async-decrypt-cache.js";
import type * as DecryptResult from "$lib/crypto/decrypt-result.js";
import type * as ShellContext from "$lib/shell/context.js";

const {
  mockSaveBrandingField,
  mockToastShow,
  mockHaptic,
  mockWhenSettled,
  decryptGate,
} = await vi.hoisted(async () => {
  // Controllable settlement gate: when `blocked` is true, decrypt returns
  // null for name/text/support_label keys (simulating an in-flight async
  // decrypt that has not yet resolved). Tests that need immediate
  // decryption leave `blocked` at its default (false).
  //
  // Backed by a SvelteMap so reads inside a component's $derived are
  // tracked: the real cache stores results in a SvelteMap, which is what
  // lets whenSettled-then-reread observe the settled value. A plain
  // object here would leave the derived cached at null forever.
  const { SvelteMap } = await import("svelte/reactivity");
  const gateMap = new SvelteMap<string, boolean>([["blocked", false]]);
  const gate = {
    get blocked(): boolean {
      return gateMap.get("blocked") === true;
    },
    set blocked(value: boolean) {
      gateMap.set("blocked", value);
    },
  };
  return {
    mockSaveBrandingField: vi.fn().mockResolvedValue(undefined),
    mockToastShow: vi.fn(),
    mockHaptic: vi.fn(),
    mockWhenSettled: vi.fn().mockResolvedValue(undefined),
    decryptGate: gate,
  };
});

let mockBrandingData: BrandingData | undefined;
let mockIsLoading: boolean;
let mockIsError: boolean;

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  admin_terminology_title: () => "Terminology",
  admin_terminology_description: () =>
    "Customize the terms used throughout the app.",
  admin_terminology_edit_button: () => "Edit terminology",
  admin_terminology_sheet_title: () => "Edit Terminology",
  admin_terminology_save: () => "Save changes",
  admin_terminology_saved: () => "Terminology updated",
  admin_terminology_error: () => "Failed to save terminology",
  admin_terminology_group_volunteer: () => "Team member role",
  admin_terminology_group_client: () => "Person helped",
  admin_terminology_group_ticket: () => "Work item",
  admin_terminology_group_manager: () => "Senior team member role",
  admin_terminology_group_queue: () => "Work group",
  admin_terminology_group_kb: () => "Reference library",
  admin_terminology_singular: () => "Singular",
  admin_terminology_plural: () => "Plural",
  admin_terminology_desc_volunteer: () => "People who handle cases.",
  admin_terminology_desc_manager: () => "Members with elevated access.",
  admin_terminology_desc_client: () => "The people your org serves.",
  admin_terminology_desc_ticket: () => "An individual case.",
  admin_terminology_desc_queue: () => "How work is organized.",
  admin_terminology_desc_kb: () => "Internal reference materials.",
  admin_terminology_suggestions_label: () => "Suggestions",
  admin_terminology_lang_en: () => "English",
  admin_terminology_lang_es: () => "Spanish",
  admin_terminology_reset: () => "Reset to defaults",
  admin_terminology_support_label_label: () =>
    "Name clients see on your messages",
  admin_terminology_support_label_hint: () =>
    "Shown above every message you send in the client portal.",
  portal_support_team: () => "Support team",
  common_loading: () => "Loading",
  error_generic: () => "Something went wrong",
  decrypt_placeholder_loading: () => "Decrypting...",
  decrypt_placeholder_denied: () => "Access denied",
  error_decryption_failed: () => "Decryption failed",
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcIndex>()),
  trpc: {
    branding: {
      getBranding: { query: vi.fn() },
      saveBrandingField: { mutate: mockSaveBrandingField },
    },
  },
}));

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

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getOrgDecryptCache: () => ({
    decrypt: (id: string, encrypted: unknown) => {
      // When the gate is blocked, name/text/support_label keys return null
      // (simulating an async decrypt that has not settled yet).
      if (decryptGate.blocked) {
        const unsettledKeys = new Set([
          "branding:name",
          "branding:text",
          "branding:support_label",
        ]);
        if (unsettledKeys.has(id)) return null;
      }
      if (encrypted instanceof Uint8Array) {
        return new TextDecoder().decode(encrypted);
      }
      if (typeof encrypted === "string") {
        try {
          return atob(encrypted);
        } catch {
          return encrypted;
        }
      }
      return null;
    },
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
    delete: vi.fn(),
    isFailed: vi.fn().mockReturnValue(false),
    whenSettled: mockWhenSettled,
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

// care-y-ignore-next-line mock-factory-unguarded -- importOriginal would trigger libsodium WASM init via @care-y/crypto import
vi.mock("$lib/branding/encrypt.js", () => ({
  encryptLogoFile: vi.fn().mockResolvedValue("encrypted-logo-b64"),
  buildClientBrandingBlob: vi.fn(() => "client-branding-blob"),
}));

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

vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellContext>()),
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
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

import TerminologySection from "./TerminologySection.svelte";
import { DEFAULT_PRIMARY, DEFAULT_ACCENT } from "$lib/branding/index.js";
import { buildClientBrandingBlob } from "$lib/branding/encrypt.js";

const LOADED_DATA: BrandingData = {
  encryptedName: btoa("Safe Harbor Hotline"),
  encryptedLogo: null,
  encryptedPrimaryColor: btoa(DEFAULT_PRIMARY),
  encryptedAccentColor: btoa(DEFAULT_ACCENT),
  encryptedClientText: btoa("We provide confidential support."),
  encryptedClientSupportLabel: null,
  clientEncryptedBranding: null,
  encryptedTerminology: null,
  hasIcons: false,
  iconVersion: null,
};

function renderWithData(data?: Partial<BrandingData>): void {
  mockIsLoading = false;
  mockBrandingData = { ...LOADED_DATA, ...data };
  render(TerminologySection);
}

async function openEditSheet(): Promise<void> {
  const editBtn = screen.getByRole("button", { name: /edit terminology/i });
  await fireEvent.click(editBtn);
}

describe("TerminologySection", () => {
  beforeEach(() => {
    mockBrandingData = undefined;
    mockIsLoading = true;
    mockIsError = false;
    decryptGate.blocked = false;
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("shows support label placeholder in loading state", () => {
    render(TerminologySection);
    const labels = document.querySelectorAll(".term-label");
    const found = Array.from(labels).some(
      (el) => el.textContent === "Name clients see on your messages",
    );
    expect(found).toBe(true);
  });

  it("shows default support label when none is set", () => {
    renderWithData({ encryptedClientSupportLabel: null });
    expect(screen.getByText("Support team")).toBeTruthy();
  });

  it("shows decrypted support label when set", () => {
    renderWithData({
      encryptedClientSupportLabel: btoa("The night team"),
    });
    expect(screen.getByText("The night team")).toBeTruthy();
  });

  it("renders support label input in the edit sheet", async () => {
    renderWithData();
    await openEditSheet();
    const input = document.querySelector(
      '[data-testid="terminology-support-label-input"]',
    );
    expect(input).toBeTruthy();
  });

  it("saves support label change with clientEncryptedBranding", async () => {
    renderWithData({ encryptedClientSupportLabel: null });
    await openEditSheet();

    const input = document.querySelector(
      '[data-testid="terminology-support-label-input"] input',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    await fireEvent.input(input, { target: { value: "Our care team" } });

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(mockSaveBrandingField).toHaveBeenCalled();
    });
    const calls = mockSaveBrandingField.mock.calls as Array<
      [
        {
          field: string;
          encryptedValue: string;
          clientEncryptedBranding?: string;
        },
      ]
    >;
    const supportLabelCall = calls.find((c) => c[0].field === "support_label");
    expect(supportLabelCall).toBeTruthy();
    expect(supportLabelCall![0].clientEncryptedBranding).toBe(
      "client-branding-blob",
    );
  });

  it("shows toast and haptic on successful save", async () => {
    renderWithData({ encryptedClientSupportLabel: null });
    await openEditSheet();

    const input = document.querySelector(
      '[data-testid="terminology-support-label-input"] input',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    await fireEvent.input(input, { target: { value: "Night shift" } });

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Terminology updated");
    });
    expect(mockHaptic).toHaveBeenCalled();
  });

  it("shows toast on save error", async () => {
    mockSaveBrandingField.mockRejectedValue(new Error("save-failed"));
    renderWithData({ encryptedClientSupportLabel: null });
    await openEditSheet();

    const input = document.querySelector(
      '[data-testid="terminology-support-label-input"] input',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    await fireEvent.input(input, { target: { value: "Helpers" } });

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        "Failed to save terminology",
        3000,
      );
    });
  });

  it("displays edit button in card view", () => {
    renderWithData();
    expect(
      screen.getByRole("button", { name: /edit terminology/i }),
    ).toBeTruthy();
  });

  it("renders error state when query fails", () => {
    mockIsLoading = false;
    mockIsError = true;
    mockBrandingData = undefined;
    render(TerminologySection);
    const section = document.querySelector(".terminology-section");
    expect(section).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /edit terminology/i }),
    ).toBeNull();
  });

  it("preserves the settled org name and client text when saving a support label change", async () => {
    // Regression: before the fix, saving a support label while name/text
    // decrypts were still in flight rebuilt the client blob with name: ""
    // and clientText: "", silently erasing carried-through fields.

    // Render with name and text encrypted but decrypt gate blocked so
    // the deriveds return null (simulating pending fire-and-forget decrypts).
    decryptGate.blocked = true;
    renderWithData({
      encryptedName: btoa("Safe Harbor Hotline"),
      encryptedClientText: btoa("We provide confidential support."),
      encryptedClientSupportLabel: null,
    });

    await openEditSheet();

    const input = document.querySelector(
      '[data-testid="terminology-support-label-input"] input',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    await fireEvent.input(input, { target: { value: "Night crew" } });

    // Wire whenSettled so it unblocks the gate and resolves, letting the
    // deriveds re-read the settled plaintext on the next access.
    mockWhenSettled.mockImplementation(async () => {
      decryptGate.blocked = false;
    });

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await fireEvent.click(saveBtn);

    await vi.waitFor(() => {
      expect(mockSaveBrandingField).toHaveBeenCalled();
    });

    // The blob builder must have received the settled name and text, not "".
    const blobSpy = vi.mocked(buildClientBrandingBlob);
    expect(blobSpy).toHaveBeenCalled();
    const blobArgs = blobSpy.mock.calls as Array<
      [
        {
          name: string;
          clientText: string;
          supportLabel: string;
        },
        unknown,
      ]
    >;
    const blobCall = blobArgs.find((c) => c[0].supportLabel === "Night crew");
    expect(blobCall).toBeTruthy();
    expect(blobCall![0].name).toBe("Safe Harbor Hotline");
    expect(blobCall![0].clientText).toBe("We provide confidential support.");
  });
});
