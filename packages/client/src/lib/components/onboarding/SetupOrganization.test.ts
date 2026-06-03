// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import type { WizardNavContainer } from "./wizard-nav-context.js";

const mockHaptic = vi.fn();
const mockToastShow = vi.fn();
const mockAnnounce = vi.fn();

vi.mock("$lib/paraglide/messages.js", () => ({
  onboarding_organization_heading: () => "Organization",
  onboarding_organization_subtext: () => "Set up your organization.",
  admin_tab_branding: () => "Branding",
  admin_tab_terminology: () => "Terminology",
  admin_tab_retention: () => "Retention",
  admin_tab_note_types: () => "Follow-Ups",
  admin_org_general_error: () => "Could not save",
  common_back: () => "Back",
  common_next: () => "Next",
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

const wizardNavContainer: WizardNavContainer = { current: undefined };

vi.mock("./wizard-nav-context.js", () => ({
  getWizardNavCtx: () => wizardNavContainer,
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
  wizardNavContainer.current = undefined;
});
beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetupOrganization", () => {
  const defaultProps = { adminUserId: "admin-1", oncomplete: vi.fn() };

  it("renders OrgGeneralSection outside collapsible sections", () => {
    render(SetupOrganization, { props: defaultProps });
    expect(screen.getByTestId("org-general-section")).toBeTruthy();
  });

  it("disables Continue when org has no name", () => {
    _setTestHasOrgName(false);
    render(SetupOrganization, { props: defaultProps });
    expect(wizardNavContainer.current?.right?.disabled).toBe(true);
  });

  it("enables Continue when org has a name", () => {
    _setTestHasOrgName(true);
    render(SetupOrganization, { props: defaultProps });
    expect(wizardNavContainer.current?.right?.disabled).toBe(false);
  });

  it("calls save() on dirty OrgGeneral and then oncomplete on Continue click", async () => {
    _setTestDirty(true);
    const oncomplete = vi.fn();
    render(SetupOrganization, { props: { ...defaultProps, oncomplete } });

    const action = wizardNavContainer.current?.right?.onaction;
    expect(action).toBeTruthy();
    (action as () => void)();

    await vi.waitFor(() => {
      expect(_getSaveCalls()).toBe(1);
      expect(oncomplete).toHaveBeenCalled();
    });
  });

  it("skips save() on clean OrgGeneral and still calls oncomplete", async () => {
    _setTestDirty(false);
    const oncomplete = vi.fn();
    render(SetupOrganization, { props: { ...defaultProps, oncomplete } });

    const action = wizardNavContainer.current?.right?.onaction;
    expect(action).toBeTruthy();
    (action as () => void)();

    await vi.waitFor(() => {
      expect(_getSaveCalls()).toBe(0);
      expect(oncomplete).toHaveBeenCalled();
    });
  });

  it("fires haptic on successful Continue", async () => {
    render(SetupOrganization, { props: defaultProps });

    const action = wizardNavContainer.current?.right?.onaction;
    expect(action).toBeTruthy();
    (action as () => void)();

    await vi.waitFor(() => {
      expect(mockHaptic).toHaveBeenCalled();
    });
  });

  it("announces error and does not call oncomplete when save fails", async () => {
    _setTestDirty(true);
    _setTestSaveError(new Error("network failure"));
    const oncomplete = vi.fn();
    render(SetupOrganization, { props: { ...defaultProps, oncomplete } });

    const action = wizardNavContainer.current?.right?.onaction;
    expect(action).toBeTruthy();
    (action as () => void)();

    await vi.waitFor(() => {
      expect(mockAnnounce).toHaveBeenCalledWith(
        "assertive",
        m.admin_org_general_error(),
      );
      expect(oncomplete).not.toHaveBeenCalled();
    });
  });
});
