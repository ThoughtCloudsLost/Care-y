// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import type { WizardNavContainer } from "./wizard-nav-context.js";

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
  admin_tab_telephony: () => "Telephony",
  admin_tab_greetings: () => "Greetings",
  admin_tab_sms_templates: () => "SMS Templates",
  admin_tab_blocklist: () => "Blocklist",
  ticket_close_skip: () => "Skip",
  common_back: () => "Back",
  common_next: () => "Next",
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

const wizardNavContainer: WizardNavContainer = { current: undefined };

vi.mock("./wizard-nav-context.js", () => ({
  getWizardNavCtx: () => wizardNavContainer,
}));

const { default: SetupCommunications } =
  await import("./SetupCommunications.svelte");

afterEach(() => {
  cleanup();
  wizardNavContainer.current = undefined;
});
beforeEach(() => {
  vi.clearAllMocks();
  queryData = null;
});

describe("SetupCommunications", () => {
  const defaultProps = { adminUserId: "admin-1", oncomplete: vi.fn() };

  it("shows skip label when telephony is not configured", () => {
    queryData = null;
    render(SetupCommunications, { props: defaultProps });
    expect(wizardNavContainer.current?.right?.label).toBe(
      m.ticket_close_skip(),
    );
  });

  it("shows Continue label when telephony is configured", () => {
    queryData = { mode: "byot" };
    render(SetupCommunications, { props: defaultProps });
    expect(wizardNavContainer.current?.right?.label).toBe(m.common_next());
  });

  it("skip calls oncomplete with telephonyMode 'skip'", () => {
    queryData = null;
    const oncomplete = vi.fn();
    render(SetupCommunications, { props: { ...defaultProps, oncomplete } });

    const action = wizardNavContainer.current?.right?.onaction;
    expect(action).toBeTruthy();
    (action as () => void)();
    expect(oncomplete).toHaveBeenCalledWith({ telephonyMode: "skip" });
  });

  it("continue calls oncomplete with detected telephony mode", () => {
    queryData = { mode: "byot" };
    const oncomplete = vi.fn();
    render(SetupCommunications, { props: { ...defaultProps, oncomplete } });

    const action = wizardNavContainer.current?.right?.onaction;
    expect(action).toBeTruthy();
    (action as () => void)();
    expect(oncomplete).toHaveBeenCalledWith({ telephonyMode: "byot" });
  });

  it("continue fires haptic", () => {
    queryData = { mode: "managed" };
    render(SetupCommunications, { props: defaultProps });

    const action = wizardNavContainer.current?.right?.onaction;
    expect(action).toBeTruthy();
    (action as () => void)();
    expect(mockHaptic).toHaveBeenCalled();
  });

  it("defaults to 'managed' mode when config mode is not 'byot'", () => {
    queryData = { mode: "managed" };
    const oncomplete = vi.fn();
    render(SetupCommunications, { props: { ...defaultProps, oncomplete } });

    const action = wizardNavContainer.current?.right?.onaction;
    expect(action).toBeTruthy();
    (action as () => void)();
    expect(oncomplete).toHaveBeenCalledWith({ telephonyMode: "managed" });
  });
});
