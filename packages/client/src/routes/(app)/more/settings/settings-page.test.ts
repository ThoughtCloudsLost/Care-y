// @vitest-environment jsdom
/**
 * Settings page tests for the Security section.
 *
 * Verifies: Security section renders with BlockTitle and 2FA row,
 * 2FA method count displays correctly, walkthrough replay row
 * shows "coming soon" toast.
 *
 * vi.mock() is required for:
 *   - $app/navigation, $app/paths, $app/environment: SvelteKit virtual modules
 *   - $lib/trpc/index.js: live HTTP connection module
 *   - $lib/paraglide/messages.js: Paraglide virtual module
 *   - $lib/crypto/context.js: returns mock decrypt caches + key managers
 *   - $lib/shell/context.js: navbar context
 *   - $lib/shell/navigation.js: shellBack
 *   - $lib/stores/toast.svelte.js: toast store
 *   - $lib/utils/buffer-encoding.js: base64 conversion
 *   - @tanstack/svelte-query: controlled query state
 *   - Settings sheet components: prevent deep rendering
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

// --- Hoisted state (accessible inside vi.mock factories) ---

const {
  mockGoto,
  mockToastShow,
  mockNavbarCtx,
  meQueryState,
  twoFactorStatusState,
} = vi.hoisted(() => ({
  mockGoto: vi.fn(),
  mockToastShow: vi.fn(),
  mockNavbarCtx: { current: undefined as unknown },
  meQueryState: {
    data: undefined as Record<string, unknown> | undefined,
  },
  twoFactorStatusState: {
    data: undefined as Record<string, unknown> | undefined,
  },
}));

// --- Mocks ---

vi.mock("$app/navigation", () => ({
  goto: mockGoto,
}));

vi.mock("$app/paths", () => ({
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

vi.mock("$app/environment", () => ({
  browser: true,
}));

vi.mock("$lib/shell/context.js", () => ({
  getNavbarOverrideCtx: () => mockNavbarCtx,
  getScrollContainer: () => () => null,
  getTabbarOverrideCtx: () => ({ current: undefined }),
}));

vi.mock("$lib/shell/navigation.js", () => ({
  shellBack: vi.fn(),
}));

vi.mock("$lib/stores/toast.svelte.js", () => ({
  toastStore: { show: mockToastShow, current: null, dismiss: vi.fn() },
}));

vi.mock("$lib/utils/announce.js", () => ({
  announceToLiveRegion: vi.fn(),
}));

vi.mock("$lib/utils/buffer-encoding.js", () => ({
  base64ToUint8Array: () => new Uint8Array(0),
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgDecryptCache: () => ({
    decrypt: () => "Test User",
  }),
  getCryptoBridge: () => ({}),
  getOrgKeyManager: () => ({}),
}));

vi.mock("@tanstack/svelte-query", () => ({
  useQueryClient: () => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
  }),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const key = opts.queryKey as readonly string[];
    if (key[0] === "auth" && key[1] === "me") {
      return {
        get isLoading() {
          return !meQueryState.data;
        },
        isError: false,
        error: null,
        get data() {
          return meQueryState.data;
        },
      };
    }
    if (key[0] === "twoFactor" && key[1] === "status") {
      return {
        get isLoading() {
          return !twoFactorStatusState.data;
        },
        isError: false,
        error: null,
        get data() {
          return twoFactorStatusState.data;
        },
      };
    }
    return { isLoading: false, isError: false, error: null, data: undefined };
  },
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    auth: {
      me: { query: vi.fn() },
    },
    twoFactor: {
      status: { query: vi.fn() },
    },
  },
}));

vi.mock("$lib/paraglide/messages.js", () => ({
  settings_title: () => "Settings",
  settings_display_name: () => "Display name",
  settings_username: () => "Username",
  settings_password: () => "Password",
  settings_security: () => "Security",
  settings_2fa: () => "Two-factor authentication",
  settings_2fa_methods: (p: { count: number }) =>
    `${String(p.count)} method(s) enrolled`,
  settings_2fa_none: () => "Not enabled",
  settings_replay_walkthrough: () => "Review security walkthrough",
  settings_review_briefing: () => "Review security briefing",
  feature_coming_soon: () => "Feature coming soon",
  common_loading: () => "Loading...",
  common_back: () => "Back",
}));

vi.mock("$lib/components/settings/DisplayNameSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/settings/UsernameSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/settings/PasswordSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/settings/TwoFactorSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/components/settings/SecurityBriefingPopup.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/utils/haptic.js", () => ({
  haptic: vi.fn(),
}));

// --- Import after mocks ---

import SettingsPage from "./+page.svelte";

// --- Tests ---

describe("Settings page - Security section", () => {
  beforeEach(() => {
    meQueryState.data = {
      user: {
        id: "user-123",
        encryptedIdentifier: "dGVzdA==",
        encryptedDisplayName: "dGVzdA==",
      },
    };
    twoFactorStatusState.data = undefined;
    mockGoto.mockClear();
    mockToastShow.mockClear();
    mockNavbarCtx.current = undefined;
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the Security section heading", () => {
    twoFactorStatusState.data = { methods: [] };
    render(SettingsPage);

    expect(screen.getByText("Security")).toBeTruthy();
  });

  it("renders the 2FA row with 'Not enabled' when no methods enrolled", () => {
    twoFactorStatusState.data = { methods: [] };
    render(SettingsPage);

    expect(screen.getByText("Two-factor authentication")).toBeTruthy();
    expect(screen.getByText("Not enabled")).toBeTruthy();
  });

  it("shows method count when methods are enrolled", () => {
    twoFactorStatusState.data = {
      methods: [
        { type: "totp", createdAt: "2026-01-01" },
        { type: "webauthn", createdAt: "2026-01-02" },
      ],
    };
    render(SettingsPage);

    expect(screen.getByText("2 method(s) enrolled")).toBeTruthy();
  });

  it("shows loading state before 2FA status resolves", () => {
    twoFactorStatusState.data = undefined;
    render(SettingsPage);

    const twoFaItem = screen.getByText("Two-factor authentication");
    expect(twoFaItem).toBeTruthy();
  });

  it("renders the walkthrough replay row", () => {
    twoFactorStatusState.data = { methods: [] };
    render(SettingsPage);

    expect(screen.getByText("Review security walkthrough")).toBeTruthy();
  });

  it("shows 'coming soon' toast when walkthrough replay is tapped", async () => {
    twoFactorStatusState.data = { methods: [] };
    render(SettingsPage);

    const walkthroughItem = screen.getByText("Review security walkthrough");
    const clickTarget =
      walkthroughItem.closest("[class*='list-item']") ?? walkthroughItem;
    await fireEvent.click(clickTarget);

    expect(mockToastShow).toHaveBeenCalledWith("Feature coming soon");
  });
});
