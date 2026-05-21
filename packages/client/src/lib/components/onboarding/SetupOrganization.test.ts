// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const mockHaptic = vi.fn();
const mockToastShow = vi.fn();
const mockAnnounce = vi.fn();

vi.mock("$lib/paraglide/messages.js", () => ({
  onboarding_organization_heading: () => "Organization",
  onboarding_organization_subtext: () => "Set up your organization.",
  onboarding_org_submit: () => "Continue",
  admin_tab_branding: () => "Branding",
  admin_tab_terminology: () => "Terminology",
  admin_tab_retention: () => "Retention",
  admin_tab_note_types: () => "Follow-Ups",
  admin_org_general_saved: () => "Organization details saved",
  admin_org_general_error: () => "Could not save",
}));

vi.mock("$lib/terminology/index.js", () => ({
  readCachedTerminology: () => null,
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: mockHaptic }));
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: mockAnnounce,
}));

vi.mock("$lib/providers/OnboardingCryptoBridge.svelte", async () => ({
  default: (await import("./test-helpers/StubOnboardingCryptoBridge.svelte"))
    .default,
}));

vi.mock("$lib/components/dashboard/CollapsibleSection.svelte", async () => ({
  default: (await import("./test-helpers/StubCollapsibleSection.svelte"))
    .default,
}));

vi.mock("$lib/components/admin/OrgGeneralSection.svelte", async () => ({
  default: (await import("./test-helpers/StubOrgGeneralSection.svelte"))
    .default,
}));

vi.mock("$lib/components/admin/BrandingSection.svelte", async () => ({
  default: (await import("./test-helpers/StubExternalSaveSection.svelte"))
    .default,
}));

vi.mock("$lib/components/admin/TerminologySection.svelte", async () => ({
  default: (await import("./test-helpers/StubExternalSaveSection.svelte"))
    .default,
}));

vi.mock("$lib/components/admin/RetentionSection.svelte", async () => ({
  default: (await import("./test-helpers/StubExternalSaveSection.svelte"))
    .default,
}));

vi.mock("$lib/components/admin/NoteTypesSection.svelte", async () => ({
  default: (await import("./test-helpers/StubAdminSection.svelte")).default,
}));

// Svelte's generated types don't expose <script module> exports, so the
// dynamic import type only includes `default`. Cast to access test helpers.
const {
  _setTestDirty,
  _setTestHasOrgName,
  _setTestSaveError,
  _getSaveCalls,
  _reset: resetOrgGeneralStub,
} = (await import("./test-helpers/StubOrgGeneralSection.svelte")) as unknown as {
  _setTestDirty: (dirty: boolean) => void;
  _setTestHasOrgName: (has: boolean) => void;
  _setTestSaveError: (err: Error | null) => void;
  _getSaveCalls: () => number;
  _reset: () => void;
};

const { default: SetupOrganization } =
  await import("./SetupOrganization.svelte");

afterEach(() => {
  cleanup();
  resetOrgGeneralStub();
});
beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetupOrganization", () => {
  const defaultProps = { adminUserId: "admin-1", oncomplete: vi.fn() };

  it("renders heading and description", () => {
    render(SetupOrganization, { props: defaultProps });
    expect(screen.getByText("Organization")).toBeTruthy();
    expect(screen.getByText("Set up your organization.")).toBeTruthy();
  });

  it("renders OrgGeneralSection outside collapsible sections", () => {
    render(SetupOrganization, { props: defaultProps });
    expect(screen.getByTestId("org-general-section")).toBeTruthy();
  });

  it("renders four collapsible sections with admin labels", () => {
    render(SetupOrganization, { props: defaultProps });
    expect(screen.getByText("Branding")).toBeTruthy();
    expect(screen.getByText("Terminology")).toBeTruthy();
    expect(screen.getByText("Retention")).toBeTruthy();
    expect(screen.getByText("Follow-Ups")).toBeTruthy();
  });

  it("renders Continue button", () => {
    render(SetupOrganization, { props: defaultProps });
    expect(screen.getByText("Continue")).toBeTruthy();
  });

  it("disables Continue when org has no name", () => {
    _setTestHasOrgName(false);
    render(SetupOrganization, { props: defaultProps });
    const btn = screen.getByText("Continue").closest("button");
    expect(btn?.disabled).toBe(true);
  });

  it("enables Continue when org has a name", () => {
    _setTestHasOrgName(true);
    render(SetupOrganization, { props: defaultProps });
    const btn = screen.getByText("Continue").closest("button");
    expect(btn?.disabled).toBe(false);
  });

  it("calls save() on dirty OrgGeneral and then oncomplete on Continue click", async () => {
    _setTestDirty(true);
    const oncomplete = vi.fn();
    render(SetupOrganization, { props: { ...defaultProps, oncomplete } });

    await fireEvent.click(screen.getByText("Continue"));

    await vi.waitFor(() => {
      expect(_getSaveCalls()).toBe(1);
      expect(oncomplete).toHaveBeenCalled();
    });
  });

  it("skips save() on clean OrgGeneral and still calls oncomplete", async () => {
    _setTestDirty(false);
    const oncomplete = vi.fn();
    render(SetupOrganization, { props: { ...defaultProps, oncomplete } });

    await fireEvent.click(screen.getByText("Continue"));

    await vi.waitFor(() => {
      expect(_getSaveCalls()).toBe(0);
      expect(oncomplete).toHaveBeenCalled();
    });
  });

  it("fires haptic and success toast on successful Continue", async () => {
    render(SetupOrganization, { props: defaultProps });

    await fireEvent.click(screen.getByText("Continue"));

    await vi.waitFor(() => {
      expect(mockHaptic).toHaveBeenCalled();
      expect(mockToastShow).toHaveBeenCalledWith("Organization details saved");
      expect(mockAnnounce).toHaveBeenCalledWith(
        "polite",
        "Organization details saved",
      );
    });
  });

  it("shows error toast and does not call oncomplete when save fails", async () => {
    _setTestDirty(true);
    _setTestSaveError(new Error("network failure"));
    const oncomplete = vi.fn();
    render(SetupOrganization, { props: { ...defaultProps, oncomplete } });

    await fireEvent.click(screen.getByText("Continue"));

    await vi.waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith("Could not save", 3000);
      expect(oncomplete).not.toHaveBeenCalled();
    });
  });
});
