// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import type { WizardNavContainer } from "./wizard-nav-context.js";
import type * as AnnounceNS from "$lib/utils/announce.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as HapticNS from "$lib/utils/haptic.js";
import type * as WithTermsNS from "$lib/terminology/with-terms.js";
import { mockHaptic } from "$mocks/haptic.js";
import type * as WizardNavContextNS from "./wizard-nav-context.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";
import type * as QueuesSectionNS from "$lib/components/admin/QueuesSection.svelte";
import type * as OnboardingCryptoBridgeNS from "$lib/providers/OnboardingCryptoBridge.svelte";
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
  onboarding_queue_heading: () => "Create Your First Queue",
  onboarding_queue_subtext: () => "Queues organize incoming requests.",
  admin_queues_create_button: () => "Create queue",
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
  "$lib/components/admin/QueuesSection.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/StubQueuesSection.svelte"))
        .default as unknown as (typeof QueuesSectionNS)["default"],
    }) satisfies typeof QueuesSectionNS,
);

const wizardNavContainer: WizardNavContainer = { current: undefined };

vi.mock("./wizard-nav-context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WizardNavContextNS>()),
  getWizardNavCtx: () => wizardNavContainer,
}));

const { _setTestQueueCount, _resetTestQueueCount } =
  await import("./test-helpers/StubQueuesSection.svelte");

const { default: SetupQueue } = await import("./SetupQueue.svelte");

afterEach(() => {
  cleanup();
  _resetTestQueueCount();
  wizardNavContainer.current = undefined;
});
beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetupQueue", () => {
  const defaultProps = { adminUserId: "admin-1", oncomplete: vi.fn() };

  it("renders QueuesSection stub inside the bridge", () => {
    render(SetupQueue, { props: defaultProps });
    expect(screen.getByTestId("queues-section")).toBeTruthy();
  });

  it("disables finish button when no queues exist", () => {
    render(SetupQueue, { props: defaultProps });
    expect(wizardNavContainer.current?.right?.disabled).toBe(true);
  });

  it("enables finish button when queues exist", () => {
    _setTestQueueCount(1);
    render(SetupQueue, { props: defaultProps });
    expect(wizardNavContainer.current?.right?.disabled).toBe(false);
  });

  it("calls oncomplete with firstQueueCreated on finish", () => {
    _setTestQueueCount(2);
    const oncomplete = vi.fn();
    render(SetupQueue, { props: { ...defaultProps, oncomplete } });

    const action = wizardNavContainer.current?.right?.onaction;
    expect(action).toBeTruthy();
    (action as () => void)();

    expect(oncomplete).toHaveBeenCalledWith({ firstQueueCreated: true });
  });

  it("fires haptic on finish", () => {
    _setTestQueueCount(1);
    render(SetupQueue, { props: defaultProps });

    const action = wizardNavContainer.current?.right?.onaction;
    expect(action).toBeTruthy();
    (action as () => void)();

    expect(mockHaptic).toHaveBeenCalled();
  });
});
