// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import type { WizardNavContainer } from "./wizard-nav-context.js";
import type * as ErrorsNS from "$lib/errors.js";
import type * as AnnounceNS from "$lib/utils/announce.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as HapticNS from "$lib/utils/haptic.js";
import { mockHaptic } from "$mocks/haptic.js";
import type * as WizardNavContextNS from "./wizard-nav-context.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";
import type * as KeysNS from "$lib/query/keys.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as ChannelPolicySectionNS from "$lib/components/admin/ChannelPolicySection.svelte";
import type * as BlocklistSectionNS from "$lib/components/admin/BlocklistSection.svelte";
import type * as SmsTemplatesSectionNS from "$lib/components/admin/SmsTemplatesSection.svelte";
import type * as GreetingsSectionNS from "$lib/components/admin/GreetingsSection.svelte";
import type * as TelephonyConfigSectionNS from "$lib/components/admin/TelephonyConfigSection.svelte";
import type * as CollapsibleSectionNS from "$lib/components/dashboard/CollapsibleSection.svelte";
import type * as OnboardingCryptoBridgeNS from "$lib/providers/OnboardingCryptoBridge.svelte";
const mockGetConfig = vi.fn(() => Promise.resolve(null));

let queryData: { mode: string } | null = null;

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    telephonyAdmin: {
      getConfig: { query: mockGetConfig },
    },
  },
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
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

vi.mock("$lib/query/keys.js", async (importOriginal) => ({
  ...(await importOriginal<typeof KeysNS>()),
  adminKeys: {
    telephonyConfig: () => ["admin", "telephony", "config"],
  },
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
  onboarding_communications_heading: () => "Communications",
  onboarding_communications_subtext: () => "Configure phone and messaging.",
  admin_tab_telephony: () => "Telephony",
  admin_tab_greetings: () => "Greetings",
  admin_tab_channel_policy: () => "Channels",
  admin_tab_sms_templates: () => "SMS Templates",
  admin_tab_blocklist: () => "Blocklist",
  ticket_close_skip: () => "Skip",
  common_back: () => "Back",
  common_next: () => "Next",
}));

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
  "$lib/components/dashboard/CollapsibleSection.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/StubCollapsibleSection.svelte"))
        .default as unknown as (typeof CollapsibleSectionNS)["default"],
    }) satisfies typeof CollapsibleSectionNS,
);

vi.mock(
  "$lib/components/admin/TelephonyConfigSection.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/StubAdminSection.svelte"))
        .default as unknown as (typeof TelephonyConfigSectionNS)["default"],
    }) satisfies typeof TelephonyConfigSectionNS,
);

vi.mock(
  "$lib/components/admin/GreetingsSection.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/StubAdminSection.svelte"))
        .default as unknown as (typeof GreetingsSectionNS)["default"],
    }) satisfies typeof GreetingsSectionNS,
);

vi.mock(
  "$lib/components/admin/SmsTemplatesSection.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/StubAdminSection.svelte"))
        .default as unknown as (typeof SmsTemplatesSectionNS)["default"],
    }) satisfies typeof SmsTemplatesSectionNS,
);

vi.mock(
  "$lib/components/admin/BlocklistSection.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/StubAdminSection.svelte"))
        .default as unknown as (typeof BlocklistSectionNS)["default"],
    }) satisfies typeof BlocklistSectionNS,
);

vi.mock(
  "$lib/components/admin/ChannelPolicySection.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/StubAdminSection.svelte"))
        .default as unknown as (typeof ChannelPolicySectionNS)["default"],
    }) satisfies typeof ChannelPolicySectionNS,
);

const wizardNavContainer: WizardNavContainer = { current: undefined };

vi.mock("./wizard-nav-context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WizardNavContextNS>()),
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
