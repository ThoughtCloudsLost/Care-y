// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import type { WizardNavContainer } from "./wizard-nav-context.js";
import type * as ErrorsNS from "$lib/errors.js";
import type * as AnnounceNS from "$lib/utils/announce.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as HapticNS from "$lib/utils/haptic.js";
import type * as WithTermsNS from "$lib/terminology/with-terms.js";
import type * as WizardNavContextNS from "./wizard-nav-context.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as UsersSectionNS from "$lib/components/admin/UsersSection.svelte";
import type * as OnboardingCryptoBridgeNS from "$lib/providers/OnboardingCryptoBridge.svelte";

const mockCompleteSetup = vi.fn(() => Promise.resolve({ success: true }));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    onboarding: {
      completeSetup: { mutate: mockCompleteSetup },
    },
  },
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
  onboarding_invite_heading: () => "Invite Volunteers",
  onboarding_invite_subtext: () => "Share invite links or create accounts.",
  admin_invite_link_generate: () => "Generate Invite Link",
  admin_invite_menu_manual: () => "Create User Manually",
  ticket_close_skip: () => "Skip",
  common_back: () => "Back",
  common_next: () => "Next",
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) =>
  (await import("$mocks/with-terms.js")).withTermsMock(
    await importOriginal<typeof WithTermsNS>(),
  ),
);

vi.mock("$lib/utils/haptic.js", async (importOriginal) =>
  (await import("$mocks/haptic.js")).hapticMock(
    await importOriginal<typeof HapticNS>(),
  ),
);
vi.mock(
  "$lib/stores/toast.svelte.js",
  async () =>
    (await import("$mocks/toast.js")).toastMock() satisfies typeof ToastNS,
);
vi.mock("$lib/utils/announce.js", async (importOriginal) =>
  (await import("$mocks/announce.js")).announceMock(
    await importOriginal<typeof AnnounceNS>(),
  ),
);
vi.mock("$lib/errors.js", async (importOriginal) =>
  (await import("$mocks/errors.js")).errorsMock(
    await importOriginal<typeof ErrorsNS>(),
  ),
);

vi.mock(
  "$lib/providers/OnboardingCryptoBridge.svelte",
  async () =>
    ({
      default: (
        await import("./test-helpers/StubOnboardingCryptoBridge.svelte")
      ).default as unknown as (typeof OnboardingCryptoBridgeNS)["default"],
    }) satisfies typeof OnboardingCryptoBridgeNS,
);

vi.mock(
  "$lib/components/admin/UsersSection.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/StubUsersSection.svelte"))
        .default as unknown as (typeof UsersSectionNS)["default"],
    }) satisfies typeof UsersSectionNS,
);

const wizardNavContainer: WizardNavContainer = { current: undefined };

vi.mock("./wizard-nav-context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WizardNavContextNS>()),
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
