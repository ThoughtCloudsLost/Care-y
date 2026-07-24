// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import type { WizardNavContainer } from "./wizard-nav-context.js";

const mockCompleteSetup = vi.fn(() => Promise.resolve({ success: true }));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    onboarding: {
      completeSetup: { mutate: mockCompleteSetup },
    },
  },
}));

vi.mock("$lib/paraglide/messages.js", () => ({
  onboarding_invite_heading: () => "Invite Volunteers",
  onboarding_invite_subtext: () => "Share invite links or create accounts.",
  admin_invite_link_generate: () => "Generate Invite Link",
  admin_invite_menu_manual: () => "Create User Manually",
  ticket_close_skip: () => "Skip",
  common_back: () => "Back",
  common_next: () => "Next",
}));

vi.mock("$lib/terminology/with-terms.js", () => ({
  withTerms: () => ({}),
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: vi.fn() }));
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: vi.fn() },
}));
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));
vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

vi.mock("$lib/providers/OnboardingCryptoBridge.svelte", async () => ({
  default: (await import("./test-helpers/StubOnboardingCryptoBridge.svelte"))
    .default,
}));

vi.mock("$lib/components/admin/UsersSection.svelte", async () => ({
  default: (await import("./test-helpers/StubUsersSection.svelte")).default,
}));

const wizardNavContainer: WizardNavContainer = { current: undefined };

vi.mock("./wizard-nav-context.js", () => ({
  getWizardNavCtx: () => wizardNavContainer,
}));

const { default: SetupInvite } = await import("./SetupInvite.svelte");

afterEach(() => {
  cleanup();
  wizardNavContainer.current = undefined;
});
beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetupInvite", () => {
  const defaultProps = { adminUserId: "admin-1", oncomplete: vi.fn() };

  it("skip calls oncomplete with invitesSent count", () => {
    const oncomplete = vi.fn();
    render(SetupInvite, { props: { ...defaultProps, oncomplete } });

    expect(wizardNavContainer.current?.right?.label).toBe(
      m.ticket_close_skip(),
    );

    const action = wizardNavContainer.current?.right?.onaction;
    expect(action).toBeTruthy();
    (action as () => void)();

    expect(oncomplete).toHaveBeenCalledWith({ invitesSent: 0 });
  });

  it("passes adminUserId to OnboardingCryptoBridge", () => {
    const { getByTestId } = render(SetupInvite, { props: defaultProps });

    // The stub bridge renders the prop it received, making the wiring
    // of the admin's id into the crypto bridge observable.
    expect(
      getByTestId("stub-crypto-bridge").getAttribute("data-admin-user-id"),
    ).toBe("admin-1");
  });
});
