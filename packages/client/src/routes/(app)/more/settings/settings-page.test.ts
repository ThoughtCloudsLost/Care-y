// @vitest-environment jsdom
/**
 * Settings page tests covering security section, profile data derivation,
 * 2FA summary branches, appearance section, and navbar override.
 *
 * vi.mock() is required for:
 *   - $app/navigation, $app/paths, $app/environment: SvelteKit virtual modules
 *   - $lib/trpc/index.js: controls tRPC query/mutation behavior in tests
 *   - $lib/paraglide/messages.js: Paraglide compiler-generated module
 *   - $lib/crypto/context.js: Svelte 5 createContext throws outside component tree
 *   - $lib/shell/context.js: Svelte 5 createContext throws outside component tree
 *   - $lib/shell/navigation.js: depends on shell context internals
 *   - $lib/stores/toast.svelte.js: $state rune needs Svelte compiler pipeline
 *   - $lib/stores/theme.svelte.js: $state rune needs Svelte compiler pipeline
 *   - $lib/branding/scheme-toggle.js: imports themeStore (rune module)
 *   - $lib/utils/buffer-encoding.js: used inside $derived chains
 *   - @tanstack/svelte-query: QueryClient context does not exist in jsdom
 *   - Settings sheet components: prevent deep rendering of child trees
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

// Type-only namespace imports for importOriginal generics
import type * as AppNavigation from "$app/navigation";
import type * as AppPaths from "$app/paths";
import type * as AppEnvironment from "$app/environment";
import type * as ShellContext from "$lib/shell/context.js";
import type * as ShellNavigation from "$lib/shell/navigation.js";
import type * as ToastStore from "$lib/stores/toast.svelte.js";
import type * as ThemeStore from "$lib/stores/theme.svelte.js";
import type * as SchemeToggle from "$lib/branding/scheme-toggle.js";
import type * as AnnounceMod from "$lib/utils/announce.js";
import type * as BufferEncoding from "$lib/utils/buffer-encoding.js";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as TanstackQuery from "@tanstack/svelte-query";
import type * as TrpcIndex from "$lib/trpc/index.js";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as HapticMod from "$lib/utils/haptic.js";

// --- Hoisted state (accessible inside vi.mock factories) ---

const {
  mockGoto,
  mockToastShow,
  mockNavbarCtx,
  mockSchemeToggle,
  mockResolvedScheme,
  meQueryState,
  twoFactorStatusState,
  mockDecrypt,
} = vi.hoisted(() => ({
  mockGoto: vi.fn(),
  mockToastShow: vi.fn(),
  mockNavbarCtx: { current: undefined as unknown },
  mockSchemeToggle: vi.fn(),
  mockResolvedScheme: { value: "dark" as "dark" | "light" },
  meQueryState: {
    data: undefined as Record<string, unknown> | undefined,
  },
  twoFactorStatusState: {
    data: undefined as Record<string, unknown> | undefined,
  },
  mockDecrypt: vi.fn((): string | null => "Test User"),
}));

// --- Mocks ---

vi.mock("$app/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof AppNavigation>()),
  goto: mockGoto,
}));

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal<typeof AppPaths>()),
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

vi.mock("$app/environment", async (importOriginal) => ({
  ...(await importOriginal<typeof AppEnvironment>()),
  browser: true,
}));

vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellContext>()),
  getNavbarOverrideCtx: () => mockNavbarCtx,
  getScrollContainer: () => () => null,
  getTabbarOverrideCtx: () => ({ current: undefined }),
}));

// vi.mock required: shellBack depends on shell context internals
// that use Svelte 5 createContext, unavailable outside component tree
vi.mock("$lib/shell/navigation.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellNavigation>()),
  shellBack: vi.fn(),
}));

// vi.mock required: $state rune module needs Svelte compiler pipeline
vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastStore>()),
  toastStore: { show: mockToastShow, current: null, dismiss: vi.fn() },
}));

// vi.mock required: $state rune module needs Svelte compiler pipeline
vi.mock("$lib/stores/theme.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ThemeStore>()),
  themeStore: {
    get resolvedScheme(): "dark" | "light" {
      return mockResolvedScheme.value;
    },
    current: "ios",
    uiTheme: "ios",
    colorSchemePreference: "dark",
    toggleColorScheme: vi.fn(),
  },
}));

// vi.mock required: imports themeStore ($state rune module)
vi.mock("$lib/branding/scheme-toggle.js", async (importOriginal) => ({
  ...(await importOriginal<typeof SchemeToggle>()),
  toggleSchemeWithPalette: mockSchemeToggle,
}));

vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AnnounceMod>()),
  announceToLiveRegion: vi.fn(),
}));

vi.mock("$lib/utils/buffer-encoding.js", async (importOriginal) => ({
  ...(await importOriginal<typeof BufferEncoding>()),
  base64ToUint8Array: () => new Uint8Array(0),
}));

// vi.mock required: createContext from Svelte 5 throws "missing_context"
// outside a live component tree.
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getOrgDecryptCache: () => ({
    decrypt: mockDecrypt,
  }),
  getCryptoBridge: () => ({}),
  getOrgKeyManager: () => ({}),
}));

// vi.mock required: @tanstack/svelte-query creates reactive query state
// bound to a QueryClient context that does not exist in jsdom.
vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof TanstackQuery>()),
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

// vi.mock required: tRPC client construction is lazy, but the mock
// controls query/mutation behavior for deterministic test assertions.
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcIndex>()),
  trpc: {
    auth: {
      me: { query: vi.fn() },
    },
    twoFactor: {
      status: { query: vi.fn() },
    },
  },
}));

// vi.mock required: tests pin deterministic message strings for assertions.
// Spreading importOriginal keeps every unpinned message real so the mock
// cannot drift from the compiled message surface.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  settings_title: () => "Settings",
  settings_display_name: () => "Display name",
  settings_username: () => "Username",
  settings_password: () => "Password",
  settings_appearance: () => "Appearance",
  settings_color_scheme: () => "Color scheme",
  settings_dark_mode: () => "Dark mode",
  settings_light_mode: () => "Light mode",
  settings_refresh_app: () => "Refresh app",
  settings_security: () => "Security",
  settings_2fa: () => "Two-factor authentication",
  settings_2fa_methods: (p: { count: number }) =>
    `${String(p.count)} method(s) enrolled`,
  settings_2fa_methods_one: () => "1 method enrolled",
  settings_2fa_none: () => "Not enabled",
  settings_replay_walkthrough: () => "Review security walkthrough",
  settings_review_briefing: () => "Review security briefing",
  feature_coming_soon: () => "Feature coming soon",
  common_loading: () => "Loading...",
  common_back: () => "Back",
}));

// vi.mock required: prevent deep rendering of child component trees
// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/settings/DisplayNameSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/settings/UsernameSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/settings/PasswordSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/settings/TwoFactorSheet.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// care-y-ignore-next-line mock-factory-unguarded -- component stub: single default export, passthrough cannot satisfy the component prop types
vi.mock("$lib/components/settings/SecurityBriefingPopup.svelte", async () => ({
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof HapticMod>()),
  haptic: vi.fn(),
}));

// --- Import after mocks ---

import SettingsPage from "./+page.svelte";

// --- Tests ---

describe("Settings page", () => {
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
    mockSchemeToggle.mockClear();
    mockDecrypt.mockReturnValue("Test User");
    mockResolvedScheme.value = "dark";
    mockNavbarCtx.current = undefined;
  });

  afterEach(() => {
    cleanup();
  });

  // ── Profile data derivation ──────────────────────────────────────

  describe("profile data derivation", () => {
    it("shows Loading for display name when encryptedDisplayName is null", () => {
      meQueryState.data = {
        user: {
          id: "user-123",
          encryptedIdentifier: "dGVzdA==",
          encryptedDisplayName: null,
        },
      };
      twoFactorStatusState.data = { methods: [] };
      render(SettingsPage);

      const displayNameRow = screen.getByText("Display name");
      const parentItem =
        displayNameRow.closest("[class*='list-item']") ?? displayNameRow;
      expect(parentItem.textContent).toContain("Loading...");
    });

    it("shows Loading for username when encryptedIdentifier is null", () => {
      meQueryState.data = {
        user: {
          id: "user-123",
          encryptedIdentifier: null,
          encryptedDisplayName: "dGVzdA==",
        },
      };
      twoFactorStatusState.data = { methods: [] };
      render(SettingsPage);

      const usernameRow = screen.getByText("Username");
      const parentItem =
        usernameRow.closest("[class*='list-item']") ?? usernameRow;
      expect(parentItem.textContent).toContain("Loading...");
    });

    it("uses empty string for userId when me query has no data", () => {
      meQueryState.data = undefined;
      twoFactorStatusState.data = { methods: [] };
      render(SettingsPage);

      // When meQuery.data is undefined, userId is "" and the page still
      // renders its rows ("Settings" itself lives in the stubbed navbar).
      expect(screen.getByText("Display name")).toBeTruthy();
      expect(screen.getByText("Username")).toBeTruthy();
    });

    it("falls back to empty string when decrypt returns null for username", () => {
      mockDecrypt.mockReturnValue(null);
      twoFactorStatusState.data = { methods: [] };
      render(SettingsPage);

      // The username row should show Loading (empty string is falsy)
      const usernameRow = screen.getByText("Username");
      const parentItem =
        usernameRow.closest("[class*='list-item']") ?? usernameRow;
      expect(parentItem.textContent).toContain("Loading...");
    });
  });

  // ── 2FA summary ──────────────────────────────────────────────────

  describe("2FA summary", () => {
    it("renders the Security section heading", () => {
      twoFactorStatusState.data = { methods: [] };
      render(SettingsPage);

      expect(screen.getByText("Security")).toBeTruthy();
    });

    it("renders 'Not enabled' when no methods enrolled", () => {
      twoFactorStatusState.data = { methods: [] };
      render(SettingsPage);

      expect(screen.getByText("Two-factor authentication")).toBeTruthy();
      expect(screen.getByText("Not enabled")).toBeTruthy();
    });

    it("shows '1 method enrolled' for exactly one method", () => {
      twoFactorStatusState.data = {
        methods: [{ type: "totp", createdAt: "2026-01-01" }],
      };
      render(SettingsPage);

      expect(screen.getByText("1 method enrolled")).toBeTruthy();
    });

    it("shows plural method count when multiple methods enrolled", () => {
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
  });

  // ── Appearance section ───────────────────────────────────────────

  describe("appearance section", () => {
    it("shows 'Dark mode' label when resolvedScheme is dark", () => {
      mockResolvedScheme.value = "dark";
      twoFactorStatusState.data = { methods: [] };
      render(SettingsPage);

      const schemeRow = screen.getByText("Color scheme");
      const parentItem = schemeRow.closest("[class*='list-item']") ?? schemeRow;
      expect(parentItem.textContent).toContain("Dark mode");
    });

    it("shows 'Light mode' label when resolvedScheme is light", () => {
      mockResolvedScheme.value = "light";
      twoFactorStatusState.data = { methods: [] };
      render(SettingsPage);

      const schemeRow = screen.getByText("Color scheme");
      const parentItem = schemeRow.closest("[class*='list-item']") ?? schemeRow;
      expect(parentItem.textContent).toContain("Light mode");
    });

    it("calls toggleSchemeWithPalette when color scheme row is clicked", async () => {
      twoFactorStatusState.data = { methods: [] };
      render(SettingsPage);

      const schemeRow = screen.getByText("Color scheme");
      const clickTarget =
        schemeRow.closest("[class*='list-item']") ?? schemeRow;
      await fireEvent.click(clickTarget);

      expect(mockSchemeToggle).toHaveBeenCalledTimes(1);
    });
  });

  // ── Security actions ─────────────────────────────────────────────

  describe("security actions", () => {
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

    it("renders the review briefing row", () => {
      twoFactorStatusState.data = { methods: [] };
      render(SettingsPage);

      expect(screen.getByText("Review security briefing")).toBeTruthy();
    });
  });

  // ── Navbar override ──────────────────────────────────────────────

  describe("navbar override", () => {
    it("sets navbarCtx.current on mount and clears on unmount", () => {
      twoFactorStatusState.data = { methods: [] };
      const { unmount } = render(SettingsPage);

      expect(mockNavbarCtx.current).not.toBeUndefined();
      unmount();
      expect(mockNavbarCtx.current).toBeUndefined();
    });
  });
});
