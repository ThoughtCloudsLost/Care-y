// @vitest-environment jsdom
/**
 * AppShell navbar render tests.
 *
 * These pin the navbar behaviors that have to survive the extraction of
 * ShellNavbar. They cover where identity sits, which slots an override
 * replaces, when the search control disappears, and whether the glass
 * effect still finds the two layers it addresses by child position.
 *
 * The shell renders through a harness that wraps it in a Konsta App pinned
 * to iOS, because the Navbar paints its blur layer only under that theme and
 * the glass effect assumes both layers are there.
 *
 * vi.mock() is required for:
 *   - $lib/trpc/index.js: creates a live tRPC HTTP client at module scope
 *   - @tanstack/svelte-query: useQueryClient needs a provider this spec has
 *     no reason to mount, and createQuery needs controlled state
 *   - $lib/crypto/context.js: Svelte 5 createContext throws missing_context
 *     outside a live tree, and the setup-file stub lacks the cache methods
 *     the shell's search registration reaches for
 *   - $lib/stores/layout-mode.svelte: matchMedia reports false for every
 *     query in jsdom, so desktop is otherwise unreachable
 *   - $lib/branding/logo-url.svelte.js: module-scope $state seeded from
 *     localStorage, which a test cannot vary after import
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { Plus } from "@lucide/svelte";
import type * as TrpcModule from "$lib/trpc/index.js";
import type * as LogoUrlModule from "$lib/branding/logo-url.svelte.js";
import type * as LayoutModeModule from "$lib/stores/layout-mode.svelte.js";
import type * as SvelteQuery from "@tanstack/svelte-query";
import type { NavbarOverride } from "./types.js";

// --- Controllable mock state ---

let mockLogoUrl: string | null = null;
let mockIsDesktop = false;
let mockDisplayName: string | null = null;

// --- Mocks ---

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal()),
  resolve: (path: string) => path,
}));

vi.mock(
  "$lib/branding/logo-url.svelte.js",
  () =>
    ({
      getOrgLogoUrl: () => mockLogoUrl,
      setOrgLogoUrl: vi.fn(),
    }) satisfies typeof LogoUrlModule,
);

vi.mock(
  "$lib/stores/layout-mode.svelte",
  () =>
    ({
      layoutMode: {
        get isDesktop(): boolean {
          return mockIsDesktop;
        },
        get isTablet(): boolean {
          return mockIsDesktop;
        },
      },
    }) satisfies typeof LayoutModeModule,
);

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQuery>()),
  useQueryClient: () => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
    ensureQueryData: vi.fn().mockResolvedValue([]),
    invalidateQueries: vi.fn().mockResolvedValue(undefined),
    getQueryCache: () => ({ subscribe: () => () => undefined }),
  }),
  createQuery: (optsFn: () => { queryKey?: unknown }) => {
    const key = optsFn().queryKey;
    const isMe = Array.isArray(key) && key.includes("me");
    return {
      isLoading: false,
      isError: false,
      error: null,
      data: isMe ? { user: { encryptedDisplayName: "ciphertext" } } : undefined,
    };
  },
}));

vi.mock(
  "$lib/trpc/index.js",
  () =>
    ({
      trpc: {
        auth: {
          me: { query: vi.fn() },
          listUsers: { query: vi.fn().mockResolvedValue([]) },
        },
        tickets: {
          list: { query: vi.fn().mockResolvedValue({ items: [] }) },
          get: { query: vi.fn() },
          myQueues: { query: vi.fn().mockResolvedValue([]) },
          contentSearch: { query: vi.fn() },
        },
        kb: {
          listItems: { query: vi.fn().mockResolvedValue({ items: [] }) },
          listCategories: { query: vi.fn().mockResolvedValue([]) },
          listBodies: { query: vi.fn().mockResolvedValue([]) },
        },
        recentViews: {
          get: { query: vi.fn().mockResolvedValue({ envelope: null }) },
          put: { mutate: vi.fn() },
        },
      } as never,
      setDevDelay: vi.fn(),
      isDevDelayEnabled: vi.fn().mockReturnValue(false),
    }) satisfies typeof TrpcModule,
);

vi.mock("$lib/crypto/context.js", () => {
  // Surface assertion rather than importOriginal: the real module's context
  // getters throw outside a live component tree, which is what forced the
  // mock. Only the entries the shell and the avatar panel read are stubbed.
  const _usedExports = null! as {
    getCryptoBridge: unknown;
    getOrgDecryptCache: unknown;
    getTicketDecryptCache: unknown;
    getPreviewLoader: unknown;
    getCurrentUserId: unknown;
    getCurrentUserRoleId: unknown;
    getCurrentPermissions: unknown;
  };
  const emptySet = new Set<string>();
  return {
    getCryptoBridge: () => ({
      sealSelfBlob: vi.fn(),
      openSelfBlob: vi.fn(),
    }),
    getOrgDecryptCache: () => ({
      decrypt: () => mockDisplayName,
      decryptAsync: async () => mockDisplayName,
      isFailed: () => false,
    }),
    getTicketDecryptCache: () => ({
      decryptTitle: () => undefined,
      decryptFollowUp: () => undefined,
      clearFollowUps: vi.fn(),
      whenSettled: async () => undefined,
    }),
    getPreviewLoader: () => ({ get: () => undefined }),
    getCurrentUserId: () => () => undefined,
    getCurrentUserRoleId: () => () => "volunteer",
    getCurrentPermissions: () => () => emptySet,
  } satisfies typeof _usedExports;
});

// jsdom implements neither observer. PageShell and the shell's chrome
// measurement construct a ResizeObserver on mount; the decrypt placeholder
// inside the account panel constructs an IntersectionObserver.
class NoopResizeObserver implements ResizeObserver {
  observe(): void {
    /* jsdom performs no layout */
  }
  unobserve(): void {
    /* jsdom performs no layout */
  }
  disconnect(): void {
    /* jsdom performs no layout */
  }
}
globalThis.ResizeObserver = NoopResizeObserver;

class NoopIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];
  observe(): void {
    /* jsdom performs no layout */
  }
  unobserve(): void {
    /* jsdom performs no layout */
  }
  disconnect(): void {
    /* jsdom performs no layout */
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
globalThis.IntersectionObserver = NoopIntersectionObserver;

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

const { default: AppShellHarness } =
  await import("./test-helpers/AppShellHarness.svelte");

// --- Helpers ---

function renderShell(
  props: { orgName?: string; override?: NavbarOverride } = {},
): ReturnType<typeof render> {
  return render(AppShellHarness, { props });
}

function navbar(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>(".k-navbar");
  if (el === null) throw new Error("navbar did not render");
  return el;
}

function markup(html: string): ReturnType<typeof createRawSnippet> {
  return createRawSnippet(() => ({ render: () => html }));
}

// --- Tests ---

describe("AppShell navbar", () => {
  beforeEach(() => {
    mockLogoUrl = null;
    mockIsDesktop = false;
    mockDisplayName = "Jane Doe";
  });

  afterEach(cleanup);

  describe("identity", () => {
    it("renders the org logo in the left slot when the org has one", () => {
      mockLogoUrl = "/api/branding/safe-harbor/icon-192.png?v=3";

      const { container } = renderShell();

      const logo = navbar(container).querySelector<HTMLImageElement>(
        ".navbar-avatar-logo",
      );
      expect(logo).toBeTruthy();
      expect(logo?.getAttribute("src")).toBe(
        "/api/branding/safe-harbor/icon-192.png?v=3",
      );
      expect(logo?.getAttribute("alt")).toBe("");
    });

    it("falls back to the user's initials when the org has no logo", () => {
      mockDisplayName = "Jane Doe";

      const { container } = renderShell();

      const avatar = navbar(container).querySelector(".navbar-avatar");
      expect(avatar?.querySelector("img")).toBeNull();
      expect(avatar?.textContent.trim()).toBe("JD");
    });

    it("falls back to an icon when there is neither a logo nor a name", () => {
      mockDisplayName = null;

      const { container } = renderShell();

      const avatar = navbar(container).querySelector(".navbar-avatar");
      expect(avatar?.textContent.trim()).toBe("");
      expect(avatar?.querySelector("svg")).toBeTruthy();
    });

    it("opens the account panel when the identity control is tapped", async () => {
      const { container } = renderShell();

      // The panel element stays mounted so its close transition can finish;
      // only its contents come and go, so those are what a test can read.
      const panel = screen.getByRole("dialog", { name: "Account" });
      expect(container.querySelector(".avatar-panel")).toBeNull();

      await fireEvent.click(screen.getByRole("button", { name: "Account" }));

      expect(panel.querySelector(".avatar-panel")).toBeTruthy();
    });

    it("drops the identity control on desktop, where the sidebar carries it", () => {
      mockIsDesktop = true;

      const { container } = renderShell();

      expect(navbar(container).querySelector(".navbar-avatar")).toBeNull();
    });
  });

  describe("title", () => {
    it("puts the language picker beside the org name", () => {
      const { container } = renderShell({ orgName: "Safe Harbor" });

      const group = navbar(container).querySelector(".navbar-title-group");
      expect(group?.textContent).toContain("Safe Harbor");
      expect(group?.querySelector("select")).toBeTruthy();
    });
  });

  describe("navbar override", () => {
    it("replaces the left slot and drops the identity control", () => {
      const { container } = renderShell({
        override: {
          left: markup(`<button data-testid="override-left">Back</button>`),
        },
      });

      const bar = navbar(container);
      expect(bar.querySelector(".navbar-avatar")).toBeNull();
      expect(bar.querySelector("[data-testid='override-left']")).toBeTruthy();
    });

    it("replaces a string title, taking the language picker with it", () => {
      const { container } = renderShell({ override: { title: "Ticket 42" } });

      const bar = navbar(container);
      expect(bar.textContent).toContain("Ticket 42");
      expect(bar.querySelector(".navbar-title-group")).toBeNull();
      expect(bar.querySelector("select")).toBeNull();
    });

    it("replaces a snippet title", () => {
      const { container } = renderShell({
        override: {
          title: markup(`<span data-testid="override-title">Ticket</span>`),
        },
      });

      expect(
        navbar(container).querySelector("[data-testid='override-title']"),
      ).toBeTruthy();
    });

    it("renders override actions alongside the search control", () => {
      const { container } = renderShell({
        override: {
          actions: [{ label: "New ticket", icon: Plus, onclick: vi.fn() }],
        },
      });

      const bar = navbar(container);
      expect(bar.querySelector("[aria-label='Search']")).toBeTruthy();
      expect(bar.querySelector("[aria-label='New ticket']")).toBeTruthy();
    });

    it("replaces the right slot when no actions are given", () => {
      const { container } = renderShell({
        override: {
          right: markup(`<button data-testid="override-right">Save</button>`),
        },
      });

      expect(
        navbar(container).querySelector("[data-testid='override-right']"),
      ).toBeTruthy();
    });

    it("hides the search control when searchHidden is set", () => {
      const { container } = renderShell({ override: { searchHidden: true } });

      expect(
        navbar(container).querySelector("[aria-label='Search']"),
      ).toBeNull();
    });

    it("renders a subnavbar region below the navbar", () => {
      const { container } = renderShell({
        override: {
          subnavbar: markup(
            `<div data-testid="override-subnavbar">Filters</div>`,
          ),
        },
      });

      const region = container.querySelector(".shell-subnavbar");
      expect(region).toBeTruthy();
      expect(
        region?.querySelector("[data-testid='override-subnavbar']"),
      ).toBeTruthy();
    });

    it("renders no subnavbar region when the override supplies none", () => {
      const { container } = renderShell();

      expect(container.querySelector(".shell-subnavbar")).toBeNull();
    });
  });

  describe("navbar glass", () => {
    // The effect addresses the blur and background layers by child position
    // inside .k-navbar, and seeds the transition once so later intensity
    // changes animate. Extraction has to keep both, or the chrome snaps and
    // the drag gesture has nothing to interpolate.
    it("seeds both glass layers on the first run", () => {
      const { container } = renderShell();

      const bar = navbar(container);
      const bgBlur = bar.children[0] as HTMLElement;
      const bgLayer = bar.children[1] as HTMLElement;

      expect(bgBlur.style.getPropertyValue("transition")).toContain(
        "backdrop-filter",
      );
      expect(bgBlur.style.getPropertyValue("backdrop-filter")).toBe(
        "saturate(100%) blur(2px)",
      );
      expect(bgLayer.style.getPropertyValue("transition")).toBe(
        "background 300ms ease",
      );
    });

    it("leaves the background layer unpainted while the chrome is transparent", () => {
      const { container } = renderShell();

      const bgLayer = navbar(container).children[1] as HTMLElement;
      expect(bgLayer.style.getPropertyValue("background")).toBe("");
    });
  });

  describe("scroll container", () => {
    it("labels the main content region for landmark navigation", () => {
      renderShell();

      const main = screen.getByRole("main", { name: "Main content" });
      expect(main.getAttribute("id")).toBe("main-content");
    });
  });
});
