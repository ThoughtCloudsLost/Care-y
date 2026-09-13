// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/svelte";

import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as TrpcIndex from "$lib/trpc/index.js";
import type * as TanstackQuery from "@tanstack/svelte-query";
import type * as HapticMod from "$lib/utils/haptic.js";
import type * as ToastStore from "$lib/stores/toast.svelte.js";
import type * as AnnounceMod from "$lib/utils/announce.js";
import type * as ErrorsMod from "$lib/errors.js";

const { mockToastShow, mockAnnounce, mockUpdateOrgGeneral } = vi.hoisted(
  () => ({
    mockToastShow: vi.fn(),
    mockAnnounce: vi.fn(),
    mockUpdateOrgGeneral: vi.fn(),
  }),
);

interface OrgGeneralData {
  name: string | null;
  defaultLanguage: string;
  countryCode: string;
  portalSafeExitUrl: string | null;
}

let mockGeneralData: OrgGeneralData | undefined;
let mockIsLoading: boolean;

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
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
  admin_org_general_safe_exit_url_label: () => "Quick-exit URL",
  admin_org_general_safe_exit_url_placeholder: () => "https://weather.gov",
  admin_org_general_safe_exit_url_hint: () =>
    "Where the quick-exit button sends portal visitors.",
  common_loading: () => "Loading",
  error_generic: () => "Something went wrong",
}));

vi.mock(
  "$app/environment",
  () =>
    ({
      dev: false,
      browser: true,
      building: false,
      version: "test",
    }) satisfies typeof AppEnvironmentNS,
);

// vi.mock required: tRPC client starts a live HTTP connection on import.
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcIndex>()),
  trpc: {
    org: {
      getOrgGeneral: { query: vi.fn() },
      updateOrgGeneral: { mutate: mockUpdateOrgGeneral },
    },
    branding: {
      getBranding: { query: vi.fn() },
      saveBrandingField: { mutate: vi.fn() },
    },
  },
}));

// vi.mock required: @tanstack/svelte-query creates reactive query state
// bound to a QueryClient context that does not exist in jsdom.
vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof TanstackQuery>()),
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
      // Mirrors TanStack semantics: callbacks fire, the rejection rethrows.
      async mutateAsync(input: unknown) {
        try {
          const result = await mutationFn(input);
          onSuccess?.();
          return result;
        } catch (err) {
          onError?.();
          throw err;
        }
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
  haptic: vi.fn(),
}));
vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastStore>()),
  toastStore: { show: mockToastShow },
}));
vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AnnounceMod>()),
  announceToLiveRegion: mockAnnounce,
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ErrorsMod>()),
  requireRouter: (_r: unknown, _n: string) => _r,
}));

vi.mock(
  "$lib/shell/ShellSheet.svelte",
  async () =>
    ({
      default: (
        await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
      ).default as unknown as (typeof ShellSheetNS)["default"],
    }) satisfies typeof ShellSheetNS,
);

vi.mock(
  "$lib/components/QueryError.svelte",
  async () =>
    ({
      default: (
        await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
      ).default as unknown as (typeof QueryErrorNS)["default"],
    }) satisfies typeof QueryErrorNS,
);

import OrgGeneralSection from "./OrgGeneralSection.svelte";
import type * as QueryErrorNS from "$lib/components/QueryError.svelte";
import type * as ShellSheetNS from "$lib/shell/ShellSheet.svelte";
import type * as AppEnvironmentNS from "$app/environment";

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
      name: "Safe Harbor",
      defaultLanguage: "en",
      countryCode: "+1",
      portalSafeExitUrl: null,
    };
    mockIsLoading = false;
    mockUpdateOrgGeneral.mockResolvedValue(undefined);
  });

  afterEach(cleanup);

  it("sends plaintext orgName to updateOrgGeneral on rename", async () => {
    render(OrgGeneralSection);

    await openSheetAndRename("New Harbor");

    await waitFor(() => {
      expect(mockUpdateOrgGeneral).toHaveBeenCalledWith(
        expect.objectContaining({ orgName: "New Harbor" }),
      );
    });
  });

  it("closes the sheet and shows success toast after saving", async () => {
    render(OrgGeneralSection);

    await openSheetAndRename("New Harbor");

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Organization details saved");
    });
    expect(sheetOpenedAttr()).toBe("false");
  });

  it("shows error toast when save fails", async () => {
    mockUpdateOrgGeneral.mockRejectedValue(new Error("save-failed"));
    render(OrgGeneralSection);

    await openSheetAndRename("New Harbor");

    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        "Could not save organization details. Try again.",
        3000,
      );
    });
  });

  it("displays the org name from the query data", () => {
    render(OrgGeneralSection);
    expect(screen.getByText("Safe Harbor")).toBeTruthy();
  });
});
