// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const mockHaptic = vi.fn();
const mockToastShow = vi.fn();
const mockAnnounce = vi.fn();

vi.mock("$lib/paraglide/messages.js", () => ({
  onboarding_queue_heading: () => "Create Your First Queue",
  onboarding_queue_subtext: () => "Queues organize incoming requests.",
  onboarding_queue_submit: () => "Continue",
  onboarding_queue_created: () => "Queue created!",
  admin_queues_create_button: () => "Create queue",
}));

vi.mock("$lib/terminology/with-terms.js", () => ({
  withTerms: () => ({}),
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

vi.mock("$lib/components/admin/QueuesSection.svelte", async () => ({
  default: (await import("./test-helpers/StubQueuesSection.svelte")).default,
}));

const { _setTestQueueCount, _resetTestQueueCount } =
  await import("./test-helpers/StubQueuesSection.svelte");

const { default: SetupQueue } = await import("./SetupQueue.svelte");

afterEach(() => {
  cleanup();
  _resetTestQueueCount();
});
beforeEach(() => {
  vi.clearAllMocks();
});

describe("SetupQueue", () => {
  const defaultProps = { adminUserId: "admin-1", oncomplete: vi.fn() };

  it("renders heading and description", () => {
    render(SetupQueue, { props: defaultProps });
    expect(screen.getByText("Create Your First Queue")).toBeTruthy();
    expect(screen.getByText("Queues organize incoming requests.")).toBeTruthy();
  });

  it("renders QueuesSection stub inside the bridge", () => {
    render(SetupQueue, { props: defaultProps });
    expect(screen.getByTestId("queues-section")).toBeTruthy();
  });

  it("renders add queue button", () => {
    render(SetupQueue, { props: defaultProps });
    expect(screen.getByText("Create queue")).toBeTruthy();
  });

  it("hides finish button when no queues exist", () => {
    render(SetupQueue, { props: defaultProps });
    expect(screen.queryByText("Continue")).toBeNull();
  });

  it("shows finish button when queues exist", () => {
    _setTestQueueCount(1);
    render(SetupQueue, { props: defaultProps });
    expect(screen.getByText("Continue")).toBeTruthy();
  });

  it("calls oncomplete with firstQueueCreated on finish click", async () => {
    _setTestQueueCount(2);
    const oncomplete = vi.fn();
    render(SetupQueue, { props: { ...defaultProps, oncomplete } });

    const finishBtn = screen.getByText("Continue");
    await fireEvent.click(finishBtn);

    expect(oncomplete).toHaveBeenCalledWith({ firstQueueCreated: true });
  });

  it("fires haptic and toast on finish", async () => {
    _setTestQueueCount(1);
    render(SetupQueue, { props: defaultProps });

    const finishBtn = screen.getByText("Continue");
    await fireEvent.click(finishBtn);

    expect(mockHaptic).toHaveBeenCalled();
    expect(mockToastShow).toHaveBeenCalledWith("Queue created!");
    expect(mockAnnounce).toHaveBeenCalledWith("polite", "Queue created!");
  });
});
