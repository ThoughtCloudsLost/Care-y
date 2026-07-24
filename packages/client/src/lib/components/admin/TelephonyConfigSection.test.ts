// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

const {
  mockSaveConfig,
  mockProvisionWebhooks,
  mockSetPhonePurpose,
  mockToastShow,
  mockHaptic,
} = vi.hoisted(() => ({
  mockSaveConfig: vi.fn().mockResolvedValue({ success: true }),
  mockProvisionWebhooks: vi
    .fn()
    .mockResolvedValue({ success: true, phoneNumberCount: 2 }),
  mockSetPhonePurpose: vi.fn().mockResolvedValue(undefined),
  mockToastShow: vi.fn(),
  mockHaptic: vi.fn(),
}));

interface MaskedConfig {
  provider: string;
  mode: string;
  maskedAccountId: string;
  maskedAuthToken: string;
  phoneNumbers: readonly { number: string; label?: string }[];
}

interface PhonePurpose {
  outboundSid: string | null;
  systemSid: string | null;
}

let mockConfigData: MaskedConfig | null | undefined;
let mockConfigLoading: boolean;
let mockConfigError: boolean;
let mockPhonesData: readonly { number: string; sid: string }[] | undefined;
let mockPurposeData: PhonePurpose | undefined;

const BYOT_CONFIG: MaskedConfig = {
  provider: "twilio",
  mode: "byot",
  maskedAccountId: "AC***",
  maskedAuthToken: "••••••••",
  phoneNumbers: [
    { number: "+15551234567" },
    { number: "+15559876543", label: "Main" },
  ],
};

const MANAGED_CONFIG: MaskedConfig = {
  provider: "twilio",
  mode: "managed",
  maskedAccountId: "AC***",
  maskedAuthToken: "••••••••",
  phoneNumbers: [{ number: "+15551234567" }],
};

const PROVISIONED_PHONES = [
  { number: "+15551234567", sid: "PN001" },
  { number: "+15559876543", sid: "PN002" },
];

vi.mock("$lib/paraglide/messages.js", () => ({
  register_note: () => "Note",
  register_careful: () => "Careful",
  register_warning: () => "Warning",
  register_protected: () => "Protected",
  admin_telephony_status_ready: () => "Phone service active",
  admin_telephony_status_pending: () => "Phone service not set up",
  admin_telephony_mode_byot: ({ provider }: { provider: string }) =>
    `${provider} (self-managed)`,
  admin_telephony_mode_managed: () => "Managed by platform",
  admin_telephony_managed_note: () =>
    "Your phone service is managed for you. Contact your admin for changes.",
  admin_telephony_update_credentials: () => "Update credentials",
  admin_telephony_credentials_heading: ({ provider }: { provider: string }) =>
    `Update ${provider} credentials`,
  admin_telephony_account_id: () => "Account ID",
  admin_telephony_account_id_helper: ({ provider }: { provider: string }) =>
    `Find this in your ${provider} account settings`,
  admin_telephony_auth_token: () => "Auth token",
  admin_telephony_auth_token_helper: ({ provider }: { provider: string }) =>
    `Also in your ${provider} account settings`,
  password_show: () => "Show password",
  password_hide: () => "Hide password",
  admin_telephony_save_credentials: () => "Save",
  admin_telephony_credentials_saved: () => "Credentials saved",
  admin_telephony_grace_period: () =>
    "Changes may take a few minutes to take effect.",
  admin_telephony_refresh_numbers: () => "Refresh numbers",
  admin_telephony_numbers_refreshed: () => "Phone numbers refreshed",
  admin_telephony_connected_numbers: () => "Connected numbers",
  admin_telephony_no_phones_friendly: () => "No numbers connected yet.",
  admin_telephony_no_phones_hint: ({ provider }: { provider: string }) =>
    `Tap Refresh Numbers above to sync from ${provider}.`,
  admin_telephony_number_roles: () => "Number roles",
  admin_telephony_number_roles_description: () =>
    "Choose which number to use for each type of communication.",
  admin_telephony_outbound_calls: () => "Outgoing calls",
  admin_telephony_outbound_calls_helper: () =>
    "The number clients see when a volunteer calls them",
  admin_telephony_system_messages: () => "Automated texts",
  admin_telephony_system_messages_helper: () =>
    "The number used for appointment reminders and status updates",
  admin_telephony_edit_roles: () => "Edit roles",
  admin_telephony_purpose_none: () => "Not assigned",
  admin_telephony_save_purpose: () => "Save roles",
  admin_telephony_purpose_saved: () => "Roles updated",
  admin_telephony_data_retention_title: () => "Provider data",
  admin_telephony_data_retention_body: () =>
    "Your phone provider keeps its own logs of calls and messages for up to 30 days.",
  admin_telephony_not_configured: () => "Phone service not set up",
  admin_telephony_go_to_setup: () => "Go to setup",
  admin_telephony_change_mode: () => "Change mode",
  admin_telephony_change_mode_confirm_title: () => "Change telephony mode?",
  admin_telephony_change_mode_confirm_body: () =>
    "Switching modes will reset your current telephony configuration.",
  admin_telephony_change_mode_confirm: () => "Continue",
  admin_telephony_mode_changed: () => "Mode changed",
  common_cancel: () => "Cancel",
  error_generic: () => "Something went wrong",
  onboarding_telephony_byot_label: () => "Self-managed (BYOT)",
  onboarding_telephony_byot_description: () => "Bring your own Twilio account.",
  onboarding_telephony_managed_label: () => "Managed",
  onboarding_telephony_managed_description: () =>
    "We manage the phone service for you.",
  onboarding_telephony_skip_label: () => "Skip for now",
  onboarding_telephony_skip_description: () => "Set up telephony later.",
  onboarding_telephony_sid_label: () => "Account SID",
  onboarding_telephony_sid_placeholder: () => "AC...",
  onboarding_telephony_token_label: () => "Auth Token",
  onboarding_telephony_token_placeholder: () => "Enter auth token",
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    telephonyAdmin: {
      getConfig: { query: vi.fn() },
      getProvisionedPhones: { query: vi.fn() },
      getPhonePurpose: { query: vi.fn() },
      saveConfig: { mutate: mockSaveConfig },
      provisionWebhooks: { mutate: mockProvisionWebhooks },
      setPhonePurpose: { mutate: mockSetPhonePurpose },
    },
  },
}));

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const key = opts.queryKey as string[];
    const lastKey = key[key.length - 1];

    if (lastKey === "config") {
      return {
        get isLoading() {
          return mockConfigLoading;
        },
        get isError() {
          return mockConfigError;
        },
        error: mockConfigError ? new Error("fail") : null,
        get data() {
          return mockConfigData;
        },
        refetch: vi.fn(),
      };
    }
    if (lastKey === "provisionedPhones") {
      return {
        get isLoading() {
          return false;
        },
        get isError() {
          return false;
        },
        error: null,
        get data() {
          return mockPhonesData;
        },
        refetch: vi.fn(),
      };
    }
    if (lastKey === "phonePurpose") {
      return {
        get isLoading() {
          return false;
        },
        get isError() {
          return false;
        },
        error: null,
        get data() {
          return mockPurposeData;
        },
        refetch: vi.fn(),
      };
    }
    return {
      isLoading: false,
      isError: false,
      error: null,
      data: undefined,
      refetch: vi.fn(),
    };
  },
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as () => Promise<unknown>;
    const onSuccess = opts.onSuccess as (() => void) | undefined;
    const onError = opts.onError as (() => void) | undefined;
    return {
      get isPending() {
        return false;
      },
      mutate() {
        mutationFn().then(
          () => onSuccess?.(),
          () => onError?.(),
        );
      },
    };
  },
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("$lib/utils/haptic.js", () => ({ haptic: mockHaptic }));
vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow },
}));
vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));

import TelephonyConfigSection from "./TelephonyConfigSection.svelte";

describe("TelephonyConfigSection", () => {
  beforeEach(() => {
    mockConfigData = undefined;
    mockConfigLoading = true;
    mockConfigError = false;
    mockPhonesData = undefined;
    mockPurposeData = undefined;
    mockSaveConfig.mockClear();
    mockProvisionWebhooks.mockClear();
    mockSetPhonePurpose.mockClear();
    mockToastShow.mockClear();
    mockHaptic.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows not-configured state when config is null", () => {
    mockConfigLoading = false;
    mockConfigData = null;
    render(TelephonyConfigSection);

    expect(screen.getByText("Phone service not set up")).toBeTruthy();
    expect(screen.getByText("Go to setup")).toBeTruthy();
  });

  describe("BYOT mode", () => {
    beforeEach(() => {
      mockConfigLoading = false;
      mockConfigData = BYOT_CONFIG;
    });

    it("renders status card with provider name", () => {
      render(TelephonyConfigSection);

      expect(screen.getByText("twilio (self-managed)")).toBeTruthy();
    });

    it("shows phone service active when phones exist", () => {
      render(TelephonyConfigSection);

      expect(screen.getByText("Phone service active")).toBeTruthy();
    });

    it("shows masked account ID in status card", () => {
      render(TelephonyConfigSection);

      expect(screen.getByText("Account ID: AC***")).toBeTruthy();
    });

    it("shows update credentials button", () => {
      render(TelephonyConfigSection);

      expect(screen.getByText("Update credentials")).toBeTruthy();
    });

    it("shows refresh numbers button", () => {
      render(TelephonyConfigSection);

      expect(screen.getByText("Refresh numbers")).toBeTruthy();
    });

    it("renders phone number list", () => {
      render(TelephonyConfigSection);

      expect(screen.getByText("+15551234567")).toBeTruthy();
      expect(screen.getByText("+15559876543")).toBeTruthy();
    });

    it("shows connected numbers label", () => {
      render(TelephonyConfigSection);

      expect(screen.getByText("Connected numbers")).toBeTruthy();
    });
  });

  describe("managed mode", () => {
    beforeEach(() => {
      mockConfigLoading = false;
      mockConfigData = MANAGED_CONFIG;
    });

    it("renders mode as managed", () => {
      render(TelephonyConfigSection);

      expect(screen.getByText("Managed by platform")).toBeTruthy();
    });

    it("shows managed mode note", () => {
      render(TelephonyConfigSection);

      expect(
        screen.getByText(
          "Your phone service is managed for you. Contact your admin for changes.",
        ),
      ).toBeTruthy();
    });

    it("does not show update credentials button", () => {
      render(TelephonyConfigSection);

      expect(screen.queryByText("Update credentials")).toBeNull();
    });

    it("does not show refresh numbers button", () => {
      render(TelephonyConfigSection);

      expect(screen.queryByText("Refresh numbers")).toBeNull();
    });
  });

  describe("phone list", () => {
    it("shows empty state when no phones", () => {
      mockConfigLoading = false;
      mockConfigData = {
        ...BYOT_CONFIG,
        phoneNumbers: [],
      };
      render(TelephonyConfigSection);

      expect(screen.getByText("No numbers connected yet.")).toBeTruthy();
    });

    it("shows provider-specific hint in empty state", () => {
      mockConfigLoading = false;
      mockConfigData = {
        ...BYOT_CONFIG,
        phoneNumbers: [],
      };
      render(TelephonyConfigSection);

      expect(
        screen.getByText("Tap Refresh Numbers above to sync from twilio."),
      ).toBeTruthy();
    });
  });

  describe("data retention disclosure", () => {
    it("shows provider data warning in BYOT mode", () => {
      mockConfigLoading = false;
      mockConfigData = BYOT_CONFIG;
      render(TelephonyConfigSection);

      expect(screen.getByText("Provider data")).toBeTruthy();
    });

    it("shows provider data warning in managed mode", () => {
      mockConfigLoading = false;
      mockConfigData = MANAGED_CONFIG;
      render(TelephonyConfigSection);

      expect(screen.getByText("Provider data")).toBeTruthy();
    });
  });

  describe("purpose assignment", () => {
    it("shows edit roles button when provisioned phones exist", () => {
      mockConfigLoading = false;
      mockConfigData = BYOT_CONFIG;
      mockPhonesData = PROVISIONED_PHONES;
      mockPurposeData = { outboundSid: "PN001", systemSid: "PN002" };
      render(TelephonyConfigSection);

      expect(screen.getByText("Edit roles")).toBeTruthy();
    });

    it("shows role badges on assigned phones", () => {
      mockConfigLoading = false;
      mockConfigData = BYOT_CONFIG;
      mockPhonesData = PROVISIONED_PHONES;
      mockPurposeData = { outboundSid: "PN001", systemSid: "PN002" };
      render(TelephonyConfigSection);

      expect(screen.getAllByText("Outgoing calls").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Automated texts").length).toBeGreaterThan(0);
    });

    it("does not show edit roles button when no provisioned phones", () => {
      mockConfigLoading = false;
      mockConfigData = BYOT_CONFIG;
      mockPhonesData = [];
      render(TelephonyConfigSection);

      expect(screen.queryByText("Edit roles")).toBeNull();
    });
  });
});
