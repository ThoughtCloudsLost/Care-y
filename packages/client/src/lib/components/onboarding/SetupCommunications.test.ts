// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

const mockHaptic = vi.fn();
const mockToastShow = vi.fn();
const mockAnnounce = vi.fn();
const mockGetConfig = vi.fn(() => Promise.resolve(null));

let queryData: { mode: string } | null = null;

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    telephonyAdmin: {
      getConfig: { query: mockGetConfig },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: () => ({
    get isPending() {
      return false;
    },
    get data() {
      return queryData;
    },
    get isSuccess() {
      return true;
    },
  }),
}));

vi.mock("$lib/query/keys.js", () => ({
  adminKeys: {
    telephonyConfig: () => ["admin", "telephony", "config"],
  },
}));

vi.mock("$lib/paraglide/messages.js", () => ({
  onboarding_communications_heading: () => "Communications",
  onboarding_communications_subtext: () => "Configure phone and messaging.",
  onboarding_communications_submit: () => "Continue",
  onboarding_communications_skip: () => "Skip for now",
  onboarding_telephony_saved: () => "Telephony saved",
  admin_tab_telephony: () => "Telephony",
  admin_tab_greetings: () => "Greetings",
  admin_tab_sms_templates: () => "SMS Templates",
  admin_tab_blocklist: () => "Blocklist",
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: mockHaptic }));
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: mockAnnounce,
}));
vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

vi.mock("$lib/providers/OnboardingCryptoBridge.svelte", async () => ({
  default: (await import("./test-helpers/StubOnboardingCryptoBridge.svelte"))
    .default,
}));

vi.mock("$lib/components/dashboard/CollapsibleSection.svelte", async () => ({
  default: (await import("./test-helpers/StubCollapsibleSection.svelte"))
    .default,
}));

vi.mock("$lib/components/admin/TelephonyConfigSection.svelte", async () => ({
  default: (await import("./test-helpers/StubAdminSection.svelte")).default,
}));

vi.mock("$lib/components/admin/GreetingsSection.svelte", async () => ({
  default: (await import("./test-helpers/StubAdminSection.svelte")).default,
}));

vi.mock("$lib/components/admin/SmsTemplatesSection.svelte", async () => ({
  default: (await import("./test-helpers/StubAdminSection.svelte")).default,
}));

vi.mock("$lib/components/admin/BlocklistSection.svelte", async () => ({
  default: (await import("./test-helpers/StubAdminSection.svelte")).default,
}));

const { default: SetupCommunications } =
  await import("./SetupCommunications.svelte");

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  queryData = null;
});

describe("SetupCommunications", () => {
  const defaultProps = { adminUserId: "admin-1", oncomplete: vi.fn() };

  it("renders heading and description", () => {
    render(SetupCommunications, { props: defaultProps });
    expect(screen.getByText("Communications")).toBeTruthy();
    expect(screen.getByText("Configure phone and messaging.")).toBeTruthy();
  });

  it("renders four collapsible sections with admin labels", () => {
    render(SetupCommunications, { props: defaultProps });
    expect(screen.getByText("Telephony")).toBeTruthy();
    expect(screen.getByText("Greetings")).toBeTruthy();
    expect(screen.getByText("SMS Templates")).toBeTruthy();
    expect(screen.getByText("Blocklist")).toBeTruthy();
  });

  it("shows skip link when telephony is not configured", () => {
    queryData = null;
    render(SetupCommunications, { props: defaultProps });
    expect(screen.getByText("Skip for now")).toBeTruthy();
    expect(screen.queryByText("Continue")).toBeNull();
  });

  it("shows Continue button when telephony is configured", () => {
    queryData = { mode: "byot" };
    render(SetupCommunications, { props: defaultProps });
    expect(screen.getByText("Continue")).toBeTruthy();
    expect(screen.queryByText("Skip for now")).toBeNull();
  });

  it("skip calls oncomplete with telephonyMode 'skip'", async () => {
    queryData = null;
    const oncomplete = vi.fn();
    render(SetupCommunications, { props: { ...defaultProps, oncomplete } });

    await fireEvent.click(screen.getByText("Skip for now"));
    expect(oncomplete).toHaveBeenCalledWith({ telephonyMode: "skip" });
  });

  it("continue calls oncomplete with detected telephony mode", async () => {
    queryData = { mode: "byot" };
    const oncomplete = vi.fn();
    render(SetupCommunications, { props: { ...defaultProps, oncomplete } });

    await fireEvent.click(screen.getByText("Continue"));
    expect(oncomplete).toHaveBeenCalledWith({ telephonyMode: "byot" });
  });

  it("continue fires haptic and success toast", async () => {
    queryData = { mode: "managed" };
    render(SetupCommunications, { props: defaultProps });

    await fireEvent.click(screen.getByText("Continue"));
    expect(mockHaptic).toHaveBeenCalled();
    expect(mockToastShow).toHaveBeenCalledWith("Telephony saved");
    expect(mockAnnounce).toHaveBeenCalledWith("polite", "Telephony saved");
  });

  it("defaults to 'managed' mode when config mode is not 'byot'", async () => {
    queryData = { mode: "managed" };
    const oncomplete = vi.fn();
    render(SetupCommunications, { props: { ...defaultProps, oncomplete } });

    await fireEvent.click(screen.getByText("Continue"));
    expect(oncomplete).toHaveBeenCalledWith({ telephonyMode: "managed" });
  });
});
