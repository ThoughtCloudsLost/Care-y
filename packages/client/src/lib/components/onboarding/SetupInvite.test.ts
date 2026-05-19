// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const mockGenerateMutate = vi.fn();
const mockRegisterMutate = vi.fn().mockResolvedValue({ user: { id: "u1" } });
const mockCompleteSetup = vi.fn(() => Promise.resolve({ success: true }));
let mockOrgKeyLoaded = true;

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    onboarding: {
      generateInvite: {
        mutate: vi.fn(() =>
          Promise.resolve({
            inviteUrl: "/first-login/test-token",
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          }),
        ),
      },
      completeSetup: { mutate: mockCompleteSetup },
    },
    auth: {
      register: { mutate: mockRegisterMutate },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as ((data: unknown) => void) | undefined;
    const onError = opts.onError as (() => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate(input: unknown) {
        mockGenerateMutate(input);
        mutationFn(input).then(
          (data) => onSuccess?.(data),
          () => onError?.(),
        );
      },
    };
  },
}));

vi.mock("$lib/paraglide/messages.js", () => ({
  onboarding_invite_heading: () => "Invite Volunteers",
  onboarding_invite_subtext: () => "Share invite links or create accounts.",
  onboarding_invite_skip: () => "I'll invite volunteers later",
  onboarding_invite_finish: () => "Finish Setup",
  admin_invite_menu_link: () => "Invite with Link",
  admin_invite_menu_manual: () => "Create User Manually",
  admin_invite_link_generate: () => "Generate Invite Link",
  admin_invite_link_generated: () => "Invite link generated",
  admin_invite_link_error: () => "Failed to generate invite link",
  admin_invite_link_copied: () => "Link copied",
  admin_invite_link_another: () => "Generate Another",
  admin_invite_link_url_label: () => "Invite link",
  admin_invite_link_copy: () => "Copy Link",
  admin_invite_link_expires: ({ expiresAt }: { expiresAt: string }) =>
    `Expires ${expiresAt}`,
  admin_invite_link_card_label: ({ index }: { index: string }) =>
    `Invite link ${index}`,
  admin_invite_role_label: () => "Role",
  admin_invite_identifier_label: () => "Login Username",
  admin_invite_identifier_hint: () => "Auto-generated.",
  admin_invite_identifier_pii_warning: () => "Stored with weaker encryption",
  admin_invite_display_name_label: () => "Display Name",
  admin_invite_display_name_hint: () => "End-to-end encrypted.",
  admin_invite_password_label: () => "Temporary Password",
  admin_invite_password_hint: () => "Share securely.",
  admin_invite_password_too_short: () =>
    "Password must be at least 16 characters",
  admin_invite_no_org_key: () => "Organization key not loaded.",
  admin_invite_send: () => "Create Account",
  admin_invite_success: () => "Account created",
  admin_invite_credential_title: () => "Account Created",
  admin_invite_credential_instructions: () =>
    "Share these credentials securely.",
  admin_invite_credential_identifier: () => "Login Username",
  admin_invite_credential_password: () => "Password",
  admin_invite_credential_show: () => "Show",
  admin_invite_credential_hide: () => "Hide",
  admin_invite_credential_done: () => "Done",
  admin_role_volunteer: () => "Volunteer",
  admin_role_manager: () => "Manager",
  admin_role_admin: () => "Admin",
  error_generic: () => "Something went wrong",
}));

vi.mock("$lib/terminology/with-terms.js", () => ({
  withTerms: () => ({}),
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: () => ({
    get isLoaded() {
      return mockOrgKeyLoaded;
    },
  }),
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

const { default: SetupInvite } = await import("./SetupInvite.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mockOrgKeyLoaded = true;
});

describe("SetupInvite", () => {
  describe("tab navigation", () => {
    it("renders heading and tab buttons", () => {
      render(SetupInvite, { props: { oncomplete: vi.fn() } });
      expect(screen.getByText("Invite Volunteers")).toBeTruthy();
      expect(screen.getByText("Invite with Link")).toBeTruthy();
      expect(screen.getByText("Create User Manually")).toBeTruthy();
    });

    it("defaults to link tab with generate button", () => {
      render(SetupInvite, { props: { oncomplete: vi.fn() } });
      expect(screen.getByText("Generate Invite Link")).toBeTruthy();
    });

    it("switches to create tab when Create User Manually clicked", async () => {
      render(SetupInvite, { props: { oncomplete: vi.fn() } });

      const createTab = screen.getByText("Create User Manually");
      await fireEvent.click(createTab);

      expect(screen.getByText("Login Username")).toBeTruthy();
      expect(screen.getByText("Display Name")).toBeTruthy();
      expect(screen.getByText("Temporary Password")).toBeTruthy();
    });
  });

  describe("link tab", () => {
    it("shows the skip link when no invites generated", () => {
      render(SetupInvite, { props: { oncomplete: vi.fn() } });
      expect(screen.getByText("I'll invite volunteers later")).toBeTruthy();
    });

    it("renders role selector with V/M/A options", () => {
      render(SetupInvite, { props: { oncomplete: vi.fn() } });
      expect(screen.getByText("Volunteer")).toBeTruthy();
      expect(screen.getByText("Manager")).toBeTruthy();
      expect(screen.getByText("Admin")).toBeTruthy();
    });

    it("calls generateInvite mutation on generate click", async () => {
      render(SetupInvite, { props: { oncomplete: vi.fn() } });

      const generateBtn = screen.getByText("Generate Invite Link");
      await fireEvent.click(generateBtn);

      expect(mockGenerateMutate).toHaveBeenCalledWith({
        roleId: expect.stringMatching(/\w+/) as string,
      });
    });

    it("skip calls completeSetup and oncomplete", async () => {
      const oncomplete = vi.fn();
      render(SetupInvite, { props: { oncomplete } });

      const skipBtn = screen.getByText("I'll invite volunteers later");
      await fireEvent.click(skipBtn);

      await vi.waitFor(() => {
        expect(mockCompleteSetup).toHaveBeenCalled();
      });
    });
  });

  describe("create tab", () => {
    async function switchToCreateTab(): Promise<void> {
      const createTab = screen.getByText("Create User Manually");
      await fireEvent.click(createTab);
    }

    it("shows PII warning on create tab", async () => {
      render(SetupInvite, { props: { oncomplete: vi.fn() } });
      await switchToCreateTab();

      expect(screen.getByText("Stored with weaker encryption")).toBeTruthy();
    });

    it("shows org key warning when key not loaded", async () => {
      mockOrgKeyLoaded = false;
      render(SetupInvite, { props: { oncomplete: vi.fn() } });
      await switchToCreateTab();

      expect(screen.getByText("Organization key not loaded.")).toBeTruthy();
    });

    it("pre-fills identifier with random value", async () => {
      const { container } = render(SetupInvite, {
        props: { oncomplete: vi.fn() },
      });
      await switchToCreateTab();

      const inputs = container.querySelectorAll<HTMLInputElement>(
        ".k-list-input input",
      );
      const identifierInput = inputs[0];
      expect(identifierInput?.value).toMatch(/^vol-/);
    });

    it("shows skip link on create tab when no invites sent", async () => {
      render(SetupInvite, { props: { oncomplete: vi.fn() } });
      await switchToCreateTab();

      expect(screen.getByText("I'll invite volunteers later")).toBeTruthy();
    });
  });
});
