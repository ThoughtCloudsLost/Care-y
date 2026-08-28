// @vitest-environment jsdom
/**
 * Focused test: the post-upgrade "Sign in" control navigates via goto(),
 * not via a raw <a href>, and is rendered as a button.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

// Declared through vi.hoisted because vi.mock factories are hoisted above
// ordinary top-level bindings and would not see a plain const.
const { mockGoto } = vi.hoisted(() => ({ mockGoto: vi.fn() }));

// vi.mock required: $app/navigation is a SvelteKit virtual module with
// no on-disk source.
vi.mock("$app/navigation", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  goto: mockGoto,
}));

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  resolve: (path: string) => path,
}));

vi.mock("$app/state", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  page: { params: { channelId: "test-channel" } },
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  portal_title: () => "Portal",
  portal_unlocking: () => "Unlocking",
  portal_incomplete_link: () => "Invalid link",
  portal_dead_link: () => "Dead link",
  portal_send: () => "Sent",
  portal_send_failed: () => "Failed",
  portal_web_chat_hint: () => "Hint",
  portal_hint_dismiss: () => "OK",
  account_upgrade_success_title: () => "Account ready",
  account_upgrade_success_body: () => "Your account is set up.",
  account_login_submit: () => "Sign in",
  account_login_username: () => "Username",
  account_upgrade_card_title: () => "Upgrade",
  account_upgrade_card_body: () => "Create an account",
  account_upgrade_card_dismiss: () => "Dismiss",
  account_upgrade_setup: () => "Set up",
  account_stale_thread: () => "Stale",
  account_login_failed: () => "Failed",
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  withTerms: () => ({}),
}));

// vi.mock required: Svelte 5 createContext throws missing_context when the
// consumer renders without its provider, and this spec renders the page on
// its own rather than inside the (client) layout that sets the container.
vi.mock("$lib/client-shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getClientShellCtx: () => ({ current: undefined }),
}));

// vi.mock required: $lib/trpc/index.js creates a live HTTP client at
// import time.
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  trpc: {
    clientPortal: null,
    branding: null,
  },
}));

// vi.mock required: @care-y/crypto barrel triggers libsodium WASM
// initialization via getSodium() singleton.
vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  decode: (s: string) => new Uint8Array(Buffer.from(s, "base64")),
  encode: (b: Uint8Array) => Buffer.from(b).toString("base64"),
}));

// Mock composables to return the "upgrade success" state
vi.mock(
  "$lib/composables/portal/create-portal-fragment.svelte.js",
  async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    createPortalFragment: () => ({
      fragmentResolved: true,
      hasValidFragment: true,
      strippablePath: null,
      markRouterReady: vi.fn(),
      markStripped: vi.fn(),
      fragmentData: null,
    }),
  }),
);

vi.mock(
  "$lib/composables/portal/create-portal-session.svelte.js",
  async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    createPortalSessionState: () => ({
      session: null,
      keyCheckPassed: false,
      passphraseDerivePending: false,
      passphraseError: "",
      destroySession: vi.fn(),
      tryNoPassphraseDerive: vi.fn(),
      submitPassphrase: vi.fn(),
    }),
  }),
);

// care-y-ignore-next-line route-no-db-import -- test mock, no database access
vi.mock(
  "$lib/composables/portal/create-portal-upgrade.svelte.js",
  async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    createPortalUpgrade: () => ({
      dismissed: false,
      expanded: false,
      pending: false,
      error: "",
      success: true,
      username: "testuser",
      dismiss: vi.fn(),
      expand: vi.fn(),
      submit: vi.fn(),
    }),
  }),
);

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  createQuery: () => ({
    isLoading: false,
    isError: false,
    error: null,
    data: {
      hasPassphrase: false,
      ticketId: "t-1",
      safeExitUrl: "https://weather.gov",
      accountOffer: false,
      keyCheck: "",
    },
  }),
  createMutation: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock("$lib/query/keys.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  portalKeys: {
    bootstrap: (id: string) => ["portal", "bootstrap", id],
    messages: (id: string) => ["portal", "messages", id],
    orgPublicKey: () => ["portal", "orgPublicKey"],
  },
}));

vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  announceToLiveRegion: vi.fn(),
}));

import PortalPage from "./+page.svelte";

describe("portal upgrade navigation", () => {
  afterEach(() => {
    cleanup();
    mockGoto.mockClear();
  });

  it("renders the sign-in control as a button, not an anchor", () => {
    render(PortalPage);

    const el = screen.getByTestId("upgrade-go-to-login");
    expect(el.tagName).toBe("BUTTON");
  });

  it("navigates to /account via goto on click", async () => {
    render(PortalPage);

    const btn = screen.getByTestId("upgrade-go-to-login");
    await fireEvent.click(btn);
    expect(mockGoto).toHaveBeenCalledWith("/account");
  });
});
