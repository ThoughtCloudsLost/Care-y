// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/svelte";

const {
  mockToastShow,
  mockAnnounce,
  mockGetBranding,
  mockSaveBrandingField,
  mockUpdateOrgGeneral,
} = vi.hoisted(() => ({
  mockToastShow: vi.fn(),
  mockAnnounce: vi.fn(),
  mockGetBranding: vi.fn(),
  mockSaveBrandingField: vi.fn(),
  mockUpdateOrgGeneral: vi.fn(),
}));

interface OrgGeneralData {
  encryptedName: string | null;
  defaultLanguage: string;
  countryCode: string;
}

let mockGeneralData: OrgGeneralData | undefined;
let mockIsLoading: boolean;

const CLIENT_BLOB_ERROR =
  "Name saved. The public login page could not be updated and will show the old name until branding is saved again.";

vi.mock("$lib/paraglide/messages.js", () => ({
  onboarding_org_language_en: () => "English",
  onboarding_org_language_es: () => "Spanish",
  onboarding_org_name_label: () => "Organization name",
  onboarding_org_name_placeholder: () => "Enter organization name",
  onboarding_org_language_label: () => "Default language",
  onboarding_org_country_label: () => "Country",
  onboarding_org_country_placeholder: () => "Select country",
  admin_tab_org_general: () => "General",
  admin_org_general_description: () =>
    "Organization name, default language, and country calling code.",
  admin_org_general_edit_button: () => "Edit general",
  admin_org_general_save: () => "Save changes",
  admin_org_general_saved: () => "Organization details saved",
  admin_org_general_error: () =>
    "Could not save organization details. Try again.",
  admin_org_general_client_blob_error: () => CLIENT_BLOB_ERROR,
  decrypt_placeholder_loading: () => "Decrypting...",
  decrypt_placeholder_denied: () => "Access denied",
  error_decryption_failed: () => "Decryption failed",
  common_loading: () => "Loading",
  error_generic: () => "Something went wrong",
}));

vi.mock("$app/environment", () => ({ dev: false }));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    org: {
      getOrgGeneral: { query: vi.fn() },
      updateOrgGeneral: { mutate: mockUpdateOrgGeneral },
    },
    branding: {
      getBranding: { query: mockGetBranding },
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
        return mockGeneralData;
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

vi.mock("$lib/utils/haptic.js", () => ({ haptic: vi.fn() }));
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: mockAnnounce,
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgDecryptCache: () => ({
    decrypt: (_id: string, encrypted: unknown) => {
      if (encrypted instanceof Uint8Array) {
        return new TextDecoder().decode(encrypted);
      }
      return typeof encrypted === "string" ? encrypted : null;
    },
    delete: vi.fn(),
    whenSettled: vi.fn().mockResolvedValue(undefined),
  }),
  getOrgKeyManager: () => ({
    isLoaded: true,
    encryptText: vi.fn().mockResolvedValue("encrypted-text"),
  }),
}));

vi.mock("$lib/branding/encrypt.js", () => ({
  buildClientBrandingBlob: vi.fn().mockReturnValue("client-blob"),
}));

vi.mock("$lib/utils/buffer-encoding.js", () => ({
  base64ToUint8Array: (encoded: string) =>
    Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)),
}));

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

import OrgGeneralSection from "./OrgGeneralSection.svelte";

const LOADED_BRANDING = {
  encryptedPrimaryColor: btoa("#636366"),
  encryptedAccentColor: null,
  encryptedClientText: null,
};

async function openSheetAndRename(newName: string): Promise<void> {
  await fireEvent.click(screen.getByRole("button", { name: /edit general/i }));
  const input = screen.getByPlaceholderText("Enter organization name");
  await fireEvent.input(input, { target: { value: newName } });
  await fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
}

function sheetOpenedAttr(): string | null | undefined {
  return document
    .querySelector('[data-testid="passthrough-shell"]')
    ?.getAttribute("data-opened");
}

describe("OrgGeneralSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeneralData = {
      encryptedName: btoa("Safe Harbor"),
      defaultLanguage: "en",
      countryCode: "+1",
    };
    mockIsLoading = false;
    mockUpdateOrgGeneral.mockResolvedValue(undefined);
    mockSaveBrandingField.mockResolvedValue(undefined);
  });

  afterEach(cleanup);

  it("shows the failure toast and polite announcement when the public blob rebuild fails", async () => {
    mockGetBranding.mockRejectedValue(new Error("network down"));
    render(OrgGeneralSection);

    await openSheetAndRename("New Harbor");

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(CLIENT_BLOB_ERROR, 6000);
    });
    expect(mockAnnounce).toHaveBeenCalledWith("polite", CLIENT_BLOB_ERROR);
  });

  it("closes the sheet and skips the failure toast when the rebuild succeeds", async () => {
    mockGetBranding.mockResolvedValue(LOADED_BRANDING);
    render(OrgGeneralSection);

    await openSheetAndRename("New Harbor");

    await waitFor(() => {
      expect(mockSaveBrandingField).toHaveBeenCalledWith(
        expect.objectContaining({ field: "name" }),
      );
    });
    expect(sheetOpenedAttr()).toBe("false");
    expect(mockToastShow).not.toHaveBeenCalledWith(CLIENT_BLOB_ERROR, 6000);
    expect(mockToastShow).toHaveBeenCalledWith("Organization details saved");
  });
});
