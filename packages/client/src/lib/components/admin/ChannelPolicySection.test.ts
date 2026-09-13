// @vitest-environment jsdom
/**
 * ChannelPolicySection tests: renders five toggles from query data,
 * toggle fires mutation with the single changed flag, toggles disabled
 * while mutating, invalidation keys called on success.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

// Type-only namespace imports for importOriginal generics
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as TrpcIndex from "$lib/trpc/index.js";
import type * as TanstackQuery from "@tanstack/svelte-query";
import type * as HapticMod from "$lib/utils/haptic.js";
import type * as ToastMod from "$lib/stores/toast.svelte.js";
import type * as AnnounceMod from "$lib/utils/announce.js";
import type * as ErrorsMod from "$lib/errors.js";
import type * as QueryErrorMod from "$lib/components/query-error-messages.js";

const {
  mockMutateFn,
  mockToastShow,
  mockHaptic,
  mockInvalidate,
  mockAnnounce,
} = vi.hoisted(() => ({
  mockMutateFn: vi.fn().mockResolvedValue({}),
  mockToastShow: vi.fn(),
  mockHaptic: vi.fn(),
  mockInvalidate: vi.fn(),
  mockAnnounce: vi.fn(),
}));

interface PolicyData {
  smsEnabled: boolean;
  emailEnabled: boolean;
  secureLinkEnabled: boolean;
  voiceEnabled: boolean;
  shareLinkEnabled: boolean;
}

let mockPolicyData: PolicyData | undefined;
let mockIsPending: boolean;

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  admin_channel_policy_subtitle: () => "Control which channels are available.",
  admin_channel_policy_saved: () => "Channel policy updated",
  admin_channel_policy_error: () => "Could not update channel policy",
  admin_channel_sms_label: () => "SMS",
  admin_channel_sms_off_hint: () => "SMS disabled hint",
  admin_channel_email_label: () => "Email",
  admin_channel_email_off_hint: () => "Email disabled hint",
  admin_channel_secure_link_label: () => "Secure Link",
  admin_channel_secure_link_off_hint: () => "Secure link disabled hint",
  admin_channel_voice_label: () => "Voice",
  admin_channel_voice_off_hint: () => "Voice disabled hint",
  admin_channel_share_link_label: () => "One-time share links",
  admin_channel_share_link_off_hint: () => "Share link disabled hint",
  error_generic: () => "Something went wrong",
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcIndex>()),
  trpc: {
    org: {
      getChannelPolicy: { query: vi.fn() },
      updateChannelPolicy: { mutate: mockMutateFn },
    },
  },
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof TanstackQuery>()),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    return {
      get isLoading() {
        return false;
      },
      get isError() {
        return false;
      },
      error: null,
      get data() {
        return mockPolicyData;
      },
      refetch: vi.fn(),
    };
  },
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as (() => void) | undefined;
    const onError = opts.onError as ((err: unknown) => void) | undefined;
    return {
      get isPending() {
        return mockIsPending;
      },
      mutate(input: unknown) {
        void mutationFn(input).then(
          () => onSuccess?.(),
          (err: unknown) => onError?.(err),
        );
      },
    };
  },
  useQueryClient: () => ({
    invalidateQueries: mockInvalidate,
  }),
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof HapticMod>()),
  haptic: mockHaptic,
}));
vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastMod>()),
  toastStore: { show: mockToastShow },
}));
vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AnnounceMod>()),
  announceToLiveRegion: mockAnnounce,
}));
vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ErrorsMod>()),
  requireRouter: (_r: unknown, _n: string) => ({
    getChannelPolicy: { query: vi.fn() },
    updateChannelPolicy: { mutate: mockMutateFn },
  }),
}));
vi.mock("$lib/components/query-error-messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof QueryErrorMod>()),
  getErrorMessage: () => "Something went wrong",
}));

import ChannelPolicySection from "./ChannelPolicySection.svelte";

describe("ChannelPolicySection", () => {
  beforeEach(() => {
    mockPolicyData = {
      smsEnabled: true,
      emailEnabled: true,
      secureLinkEnabled: true,
      voiceEnabled: true,
      shareLinkEnabled: true,
    };
    mockIsPending = false;
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("renders five toggles from query data", () => {
    render(ChannelPolicySection);

    expect(screen.getByLabelText("SMS")).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Secure Link")).toBeTruthy();
    expect(screen.getByLabelText("Voice")).toBeTruthy();
    expect(screen.getByLabelText("One-time share links")).toBeTruthy();
  });

  it("shows off-hint when a channel is disabled", () => {
    mockPolicyData = {
      smsEnabled: false,
      emailEnabled: true,
      secureLinkEnabled: true,
      voiceEnabled: true,
      shareLinkEnabled: false,
    };

    render(ChannelPolicySection);

    expect(screen.getByText("SMS disabled hint")).toBeTruthy();
    expect(screen.getByText("Share link disabled hint")).toBeTruthy();
    expect(screen.queryByText("Email disabled hint")).toBeNull();
  });

  it("fires mutation with single changed flag on toggle", async () => {
    render(ChannelPolicySection);

    const smsToggle = screen.getByLabelText("SMS");
    await fireEvent.click(smsToggle);

    expect(mockMutateFn).toHaveBeenCalledWith({ smsEnabled: false });
  });

  it("calls haptic and toast on mutation success", async () => {
    render(ChannelPolicySection);

    const emailToggle = screen.getByLabelText("Email");
    await fireEvent.click(emailToggle);

    await vi.waitFor(() => {
      expect(mockHaptic).toHaveBeenCalled();
    });
    expect(mockToastShow).toHaveBeenCalledWith("Channel policy updated");
    expect(mockAnnounce).toHaveBeenCalledWith(
      "polite",
      "Channel policy updated",
    );
  });

  it("invalidates channel policy, ticket details, and ticket lists on success", async () => {
    render(ChannelPolicySection);

    const voiceToggle = screen.getByLabelText("Voice");
    await fireEvent.click(voiceToggle);

    await vi.waitFor(() => {
      expect(mockInvalidate).toHaveBeenCalledTimes(3);
    });
  });

  it("defaults to true while loading (no data)", () => {
    mockPolicyData = undefined;
    render(ChannelPolicySection);

    // No off-hints should be visible when defaulting to true
    expect(screen.queryByText("SMS disabled hint")).toBeNull();
    expect(screen.queryByText("Email disabled hint")).toBeNull();
    expect(screen.queryByText("Secure link disabled hint")).toBeNull();
    expect(screen.queryByText("Voice disabled hint")).toBeNull();
    expect(screen.queryByText("Share link disabled hint")).toBeNull();
  });
});
