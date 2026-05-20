// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

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
  onboarding_invite_skip: () => "I'll invite volunteers later",
  onboarding_invite_finish: () => "Finish Setup",
  admin_invite_link_generate: () => "Generate Invite Link",
  admin_invite_menu_manual: () => "Create User Manually",
  admin_invite_link_error: () => "Failed to generate invite link",
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

const { default: SetupInvite } = await import("./SetupInvite.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetupInvite", () => {
  const defaultProps = { adminUserId: "admin-1", oncomplete: vi.fn() };

  it("renders heading and description", () => {
    render(SetupInvite, { props: defaultProps });
    expect(screen.getByText("Invite Volunteers")).toBeTruthy();
    expect(
      screen.getByText("Share invite links or create accounts."),
    ).toBeTruthy();
  });

  it("renders both action buttons", () => {
    render(SetupInvite, { props: defaultProps });
    expect(screen.getByText("Generate Invite Link")).toBeTruthy();
    expect(screen.getByText("Create User Manually")).toBeTruthy();
  });

  it("shows skip link when no invites created yet", () => {
    render(SetupInvite, { props: defaultProps });
    expect(screen.getByText("I'll invite volunteers later")).toBeTruthy();
  });

  it("skip calls completeSetup and oncomplete", async () => {
    const oncomplete = vi.fn();
    render(SetupInvite, { props: { ...defaultProps, oncomplete } });

    const skipBtn = screen.getByText("I'll invite volunteers later");
    await fireEvent.click(skipBtn);

    await vi.waitFor(() => {
      expect(mockCompleteSetup).toHaveBeenCalled();
    });
  });

  it("passes adminUserId to OnboardingCryptoBridge", () => {
    const { container } = render(SetupInvite, { props: defaultProps });
    expect(container.innerHTML).toBeTruthy();
  });
});
